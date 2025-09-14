import { Suspense } from 'react';
import { db } from '@/lib/db';
import { buyers, users } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, or, like, desc, sql, ilike } from 'drizzle-orm';
import { BuyerFilterSchema } from '@/lib/validations/buyer';
import BuyersTable from './components/buyers-table';
import BuyersFilters from './components/buyers-filters';
import ExportButton from './components/export-button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

async function getBuyers(searchParams: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { buyers: [], totalCount: 0, totalPages: 0, currentPage: 1 };
  }

  const filters = BuyerFilterSchema.parse(searchParams);
  const { city, propertyType, status, timeline, search, page } = filters;

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

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(buyers)
    .where(whereClause);

  const totalCount = Number(count);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Get buyers with owner info
  const buyersList = await db
    .select({
      buyer: buyers,
      owner: {
        id: users.id,
        email: users.email,
        fullName: users.fullName,
      },
    })
    .from(buyers)
    .leftJoin(users, eq(buyers.ownerId, users.id))
    .where(whereClause)
    .orderBy(desc(buyers.updatedAt))
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  return {
    buyers: buyersList,
    totalCount,
    totalPages,
    currentPage: page,
  };
}

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const data = await getBuyers(searchParams);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Buyers</h1>
        <div className="flex items-center space-x-4">
          <ExportButton filters={searchParams} />
          <Link href="/buyers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Buyer
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-6">
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <BuyersFilters />
        </Suspense>
      </Card>

      <Card>
        <Suspense
          fallback={
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          }
        >
          <BuyersTable data={data} />
        </Suspense>
      </Card>
    </div>
  );
}
