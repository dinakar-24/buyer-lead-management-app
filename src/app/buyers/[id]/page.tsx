import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { buyers, buyerHistory, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import BuyerDetail from './buyer-detail';
import BuyerEditForm from './buyer-edit-form';

async function getBuyer(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const [buyer] = await db
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
    .where(eq(buyers.id, id))
    .limit(1);

  if (!buyer) {
    return null;
  }

  // Get history
  const history = await db
    .select({
      history: buyerHistory,
      changedBy: {
        id: users.id,
        email: users.email,
        fullName: users.fullName,
      },
    })
    .from(buyerHistory)
    .leftJoin(users, eq(buyerHistory.changedBy, users.id))
    .where(eq(buyerHistory.buyerId, id))
    .orderBy(desc(buyerHistory.changedAt))
    .limit(5);

  return {
    ...buyer,
    history,
    isOwner: buyer.buyer.ownerId === user.id,
    currentUserId: user.id,
  };
}

export default async function BuyerDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { edit?: string };
}) {
  const data = await getBuyer(params.id);

  if (!data) {
    notFound();
  }

  const isEditMode = searchParams.edit === 'true' && data.isOwner;

  return (
    <div className="space-y-6">
      {isEditMode ? (
        <BuyerEditForm data={data} />
      ) : (
        <BuyerDetail data={data} />
      )}
    </div>
  );
}
