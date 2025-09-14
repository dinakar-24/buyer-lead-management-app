'use client';

import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Clock, User } from 'lucide-react';
import { deleteBuyerAction } from '../actions';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface BuyerDetailProps {
  data: any;
}

export default function BuyerDetail({ data }: BuyerDetailProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const { buyer, owner, history, isOwner } = data;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this buyer?')) {
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteBuyerAction(buyer.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Buyer deleted successfully');
        router.push('/buyers');
      }
    } catch (error) {
      toast.error('Failed to delete buyer');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/buyers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Buyer Details</h1>
        </div>
        {isOwner && (
          <div className="flex space-x-2">
            <Link href={`/buyers/${buyer.id}?edit=true`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{buyer.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{buyer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{buyer.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{buyer.city}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Property Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="font-medium">{buyer.propertyType}</p>
                </div>
                {buyer.bhk && (
                  <div>
                    <p className="text-sm text-gray-500">BHK</p>
                    <p className="font-medium">{buyer.bhk} BHK</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Purpose</p>
                  <p className="font-medium">{buyer.purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget Range</p>
                  <p className="font-medium">
                    {buyer.budgetMin || buyer.budgetMax ? (
                      <>
                        {buyer.budgetMin && formatCurrency(buyer.budgetMin)}
                        {buyer.budgetMin && buyer.budgetMax && ' - '}
                        {buyer.budgetMax && formatCurrency(buyer.budgetMax)}
                      </>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timeline</p>
                  <p className="font-medium">
                    {buyer.timeline === '0-3m' && '0-3 months'}
                    {buyer.timeline === '3-6m' && '3-6 months'}
                    {buyer.timeline === '>6m' && '>6 months'}
                    {buyer.timeline === 'Exploring' && 'Exploring'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lead Source</p>
                  <p className="font-medium">{buyer.source}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <Badge>{buyer.status}</Badge>
              </div>
              {buyer.tags && buyer.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {buyer.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {buyer.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{buyer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="font-medium">{owner.fullName || owner.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(buyer.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(buyer.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          {history && history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent History</CardTitle>
                <CardDescription>Last 5 changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.map(({ history: h, changedBy }: any) => (
                    <div key={h.id} className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(h.changedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                        <User className="h-3 w-3" />
                        <span>{changedBy?.fullName || changedBy?.email || 'Unknown'}</span>
                      </div>
                      <div className="text-sm">
                        {h.diff.action === 'created' ? (
                          <p className="text-green-600">Created buyer</p>
                        ) : (
                          <div className="space-y-1">
                            {Object.entries(h.diff as Record<string, any>).map(([key, value]: [string, any]) => (
                              <p key={key} className="text-gray-700">
                                <span className="font-medium">{key}:</span>{' '}
                                <span className="text-red-500 line-through">{value.old || 'empty'}</span>{' '}
                                →{' '}
                                <span className="text-green-600">{value.new || 'empty'}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
