import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Users, Plus, LogOut } from 'lucide-react';

export default async function BuyersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/buyers" className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-primary-600" />
                <span className="font-semibold text-lg">Buyer Lead Management</span>
              </Link>
              <nav className="flex space-x-4">
                <Link href="/buyers">
                  <Button variant="ghost" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    All Buyers
                  </Button>
                </Link>
                <Link href="/buyers/new">
                  <Button variant="ghost" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Buyer
                  </Button>
                </Link>
                <Link href="/buyers/import">
                  <Button variant="ghost" size="sm">
                    Import CSV
                  </Button>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <form action="/api/auth/logout" method="POST">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
