'use client';

import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Eye, Edit, Users } from 'lucide-react';

interface BuyersTableProps {
  data: {
    buyers: any[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}

const statusColors = {
  New: 'default',
  Qualified: 'secondary',
  Contacted: 'secondary',
  Visited: 'secondary',
  Negotiation: 'secondary',
  Converted: 'default',
  Dropped: 'destructive',
} as const;

export default function BuyersTable({ data }: BuyersTableProps) {
  const { buyers, totalCount, totalPages, currentPage } = data;

  if (buyers.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No buyers found"
          description="Start by adding your first buyer or adjust your filters"
          action={
            <Link href="/buyers/new">
              <Button>Add First Buyer</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {buyers.map(({ buyer, owner }) => (
              <tr key={buyer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{buyer.fullName}</div>
                    {buyer.email && (
                      <div className="text-sm text-gray-500">{buyer.email}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {buyer.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {buyer.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    {buyer.propertyType}
                    {buyer.bhk && <span className="text-gray-500"> ({buyer.bhk} BHK)</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {buyer.budgetMin || buyer.budgetMax ? (
                    <span>
                      {buyer.budgetMin && formatCurrency(buyer.budgetMin)}
                      {buyer.budgetMin && buyer.budgetMax && ' - '}
                      {buyer.budgetMax && formatCurrency(buyer.budgetMax)}
                    </span>
                  ) : (
                    <span className="text-gray-500">Not specified</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {buyer.timeline === '0-3m' && '0-3 months'}
                  {buyer.timeline === '3-6m' && '3-6 months'}
                  {buyer.timeline === '>6m' && '>6 months'}
                  {buyer.timeline === 'Exploring' && 'Exploring'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={statusColors[buyer.status as keyof typeof statusColors] || 'default'}>
                    {buyer.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(buyer.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link href={`/buyers/${buyer.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/buyers/${buyer.id}?edit=true`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
          </div>
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <Link href={`/buyers?page=${currentPage - 1}`}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Link key={pageNum} href={`/buyers?page=${pageNum}`}>
                  <Button
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            })}
            {currentPage < totalPages && (
              <Link href={`/buyers?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
