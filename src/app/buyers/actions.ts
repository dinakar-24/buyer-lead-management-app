'use server';

import { db } from '@/lib/db';
import { buyers, buyerHistory, users } from '@/lib/db/schema';
import { BuyerSchema, BuyerUpdateSchema, type BuyerFormData } from '@/lib/validations/buyer';
import { createClient } from '@/lib/supabase/server';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';
import { rateLimiter } from '@/lib/rate-limit';
import { calculateDiff } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function createBuyerAction(data: BuyerFormData) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Rate limiting
    const rateLimitResult = await rateLimiter.check(user.id);
    if (!rateLimitResult.success) {
      return { 
        error: `Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} seconds` 
      };
    }

    // Validate data
    const validatedData = BuyerSchema.parse(data);

    // Check if user exists in database, if not create
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!dbUser) {
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
      });
    }

    // Create buyer
    const [newBuyer] = await db.insert(buyers).values({
      ...validatedData,
      ownerId: user.id,
      budgetMin: validatedData.budgetMin || null,
      budgetMax: validatedData.budgetMax || null,
    }).returning();

    // Create history entry
    await db.insert(buyerHistory).values({
      buyerId: newBuyer.id,
      changedBy: user.id,
      diff: { action: 'created', data: newBuyer },
    });

    revalidatePath('/buyers');
    return { success: true, buyer: newBuyer };
  } catch (error: any) {
    console.error('Error creating buyer:', error);
    return { error: error.message || 'Failed to create buyer' };
  }
}

export async function updateBuyerAction(id: string, data: Partial<BuyerFormData>, currentUpdatedAt: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Rate limiting
    const rateLimitResult = await rateLimiter.check(user.id);
    if (!rateLimitResult.success) {
      return { 
        error: `Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} seconds` 
      };
    }

    // Get current buyer
    const [currentBuyer] = await db.select().from(buyers).where(eq(buyers.id, id)).limit(1);
    
    if (!currentBuyer) {
      return { error: 'Buyer not found' };
    }

    // Check ownership
    if (currentBuyer.ownerId !== user.id) {
      return { error: 'You can only edit your own buyers' };
    }

    // Check for concurrent updates
    if (new Date(currentBuyer.updatedAt).toISOString() !== currentUpdatedAt) {
      return { error: 'This record has been modified by another user. Please refresh and try again.' };
    }

    // Calculate diff
    const diff = calculateDiff(currentBuyer, data);

    // Update buyer
    const [updatedBuyer] = await db.update(buyers)
      .set({
        ...data,
        budgetMin: data.budgetMin || null,
        budgetMax: data.budgetMax || null,
        updatedAt: new Date(),
      })
      .where(eq(buyers.id, id))
      .returning();

    // Create history entry
    if (Object.keys(diff).length > 0) {
      await db.insert(buyerHistory).values({
        buyerId: id,
        changedBy: user.id,
        diff,
      });
    }

    revalidatePath('/buyers');
    revalidatePath(`/buyers/${id}`);
    return { success: true, buyer: updatedBuyer };
  } catch (error: any) {
    console.error('Error updating buyer:', error);
    return { error: error.message || 'Failed to update buyer' };
  }
}

export async function deleteBuyerAction(id: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Get buyer to check ownership
    const [buyer] = await db.select().from(buyers).where(eq(buyers.id, id)).limit(1);
    
    if (!buyer) {
      return { error: 'Buyer not found' };
    }

    if (buyer.ownerId !== user.id) {
      return { error: 'You can only delete your own buyers' };
    }

    // Delete buyer (history will be cascade deleted)
    await db.delete(buyers).where(eq(buyers.id, id));

    revalidatePath('/buyers');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting buyer:', error);
    return { error: error.message || 'Failed to delete buyer' };
  }
}
