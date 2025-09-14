import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buyers, buyerHistory, users } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { rateLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimiter.check(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} seconds` },
        { status: 429 }
      );
    }

    const { buyers: buyerData } = await request.json();

    if (!Array.isArray(buyerData) || buyerData.length === 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    if (buyerData.length > 200) {
      return NextResponse.json({ error: 'Maximum 200 rows allowed' }, { status: 400 });
    }

    // Check if user exists in database, if not create
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!dbUser) {
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
      });
    }

    // Insert buyers in transaction
    const insertedBuyers = await db.transaction(async (tx) => {
      const results = [];
      
      for (const buyerRow of buyerData) {
        const [newBuyer] = await tx.insert(buyers).values({
          ...buyerRow,
          ownerId: user.id,
          budgetMin: buyerRow.budgetMin || null,
          budgetMax: buyerRow.budgetMax || null,
        }).returning();

        // Create history entry
        await tx.insert(buyerHistory).values({
          buyerId: newBuyer.id,
          changedBy: user.id,
          diff: { action: 'imported', data: newBuyer },
        });

        results.push(newBuyer);
      }
      
      return results;
    });

    return NextResponse.json({ 
      success: true, 
      count: insertedBuyers.length,
      buyers: insertedBuyers 
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import buyers' },
      { status: 500 }
    );
  }
}

// Add missing import
import { eq } from 'drizzle-orm';
