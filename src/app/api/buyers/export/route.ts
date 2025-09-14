import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buyers, users } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, or, ilike, desc } from 'drizzle-orm';
import { BuyerFilterSchema } from '@/lib/validations/buyer';
import Papa from 'papaparse';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filters = BuyerFilterSchema.parse(searchParams);
    const { city, propertyType, status, timeline, search } = filters;

    // Build where conditions
    const conditions = [];
    
    if (city) conditions.push(eq(buyers.city, city));
    if (propertyType) conditions.push(eq(buyers.propertyType, propertyType));
    if (status) conditions.push(eq(buyers.status, status));
    if (timeline) conditions.push(eq(buyers.timeline, timeline));
    
    if (search) {
      conditions.push(
        or(
          ilike(buyers.fullName, `%${search}%`),
          ilike(buyers.email, `%${search}%`),
          ilike(buyers.phone, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get all buyers matching filters
    const buyersList = await db
      .select({
        fullName: buyers.fullName,
        email: buyers.email,
        phone: buyers.phone,
        city: buyers.city,
        propertyType: buyers.propertyType,
        bhk: buyers.bhk,
        purpose: buyers.purpose,
        budgetMin: buyers.budgetMin,
        budgetMax: buyers.budgetMax,
        timeline: buyers.timeline,
        source: buyers.source,
        status: buyers.status,
        notes: buyers.notes,
        tags: buyers.tags,
        createdAt: buyers.createdAt,
        updatedAt: buyers.updatedAt,
      })
      .from(buyers)
      .where(whereClause)
      .orderBy(desc(buyers.updatedAt));

    // Convert to CSV format
    const csvData = buyersList.map(buyer => ({
      ...buyer,
      tags: buyer.tags ? buyer.tags.join(',') : '',
      createdAt: new Date(buyer.createdAt).toISOString(),
      updatedAt: new Date(buyer.updatedAt).toISOString(),
    }));

    const csv = Papa.unparse(csvData);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="buyers_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export buyers' },
      { status: 500 }
    );
  }
}
