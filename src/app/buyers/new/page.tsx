'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BuyerSchema, type BuyerFormData } from '@/lib/validations/buyer';
import { createBuyerAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(BuyerSchema),
    defaultValues: {
      status: 'New',
      tags: [],
    },
  });

  const propertyType = watch('propertyType');
  const budgetMin = watch('budgetMin');
  const tags = watch('tags') || [];

  const onSubmit = async (data: BuyerFormData) => {
    setLoading(true);
    try {
      const result = await createBuyerAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Buyer created successfully!');
        router.push('/buyers');
      }
    } catch (error) {
      toast.error('Failed to create buyer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/buyers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add New Buyer</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buyer Information</CardTitle>
          <CardDescription>Enter the buyer's details to create a new lead</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="9876543210"
                  maxLength={15}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select id="city" {...register('city')}>
                  <option value="">Select City</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Mohali">Mohali</option>
                  <option value="Zirakpur">Zirakpur</option>
                  <option value="Panchkula">Panchkula</option>
                  <option value="Other">Other</option>
                </Select>
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              {/* Property Requirements */}
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select id="propertyType" {...register('propertyType')}>
                  <option value="">Select Type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="Office">Office</option>
                  <option value="Retail">Retail</option>
                </Select>
                {errors.propertyType && (
                  <p className="text-sm text-red-500">{errors.propertyType.message}</p>
                )}
              </div>

              {['Apartment', 'Villa'].includes(propertyType) && (
                <div className="space-y-2">
                  <Label htmlFor="bhk">BHK *</Label>
                  <Select id="bhk" {...register('bhk')}>
                    <option value="">Select BHK</option>
                    <option value="Studio">Studio</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </Select>
                  {errors.bhk && (
                    <p className="text-sm text-red-500">{errors.bhk.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose *</Label>
                <Select id="purpose" {...register('purpose')}>
                  <option value="">Select Purpose</option>
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                </Select>
                {errors.purpose && (
                  <p className="text-sm text-red-500">{errors.purpose.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetMin">Budget Min (₹)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  {...register('budgetMin', { valueAsNumber: true })}
                  placeholder="1000000"
                />
                {errors.budgetMin && (
                  <p className="text-sm text-red-500">{errors.budgetMin.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetMax">Budget Max (₹)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  {...register('budgetMax', { valueAsNumber: true })}
                  placeholder="5000000"
                  min={budgetMin || 0}
                />
                {errors.budgetMax && (
                  <p className="text-sm text-red-500">{errors.budgetMax.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline *</Label>
                <Select id="timeline" {...register('timeline')}>
                  <option value="">Select Timeline</option>
                  <option value="0-3m">0-3 months</option>
                  <option value="3-6m">3-6 months</option>
                  <option value=">6m">More than 6 months</option>
                  <option value="Exploring">Just Exploring</option>
                </Select>
                {errors.timeline && (
                  <p className="text-sm text-red-500">{errors.timeline.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Lead Source *</Label>
                <Select id="source" {...register('source')}>
                  <option value="">Select Source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Call">Call</option>
                  <option value="Other">Other</option>
                </Select>
                {errors.source && (
                  <p className="text-sm text-red-500">{errors.source.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" {...register('status')}>
                  <option value="New">New</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Visited">Visited</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Converted">Converted</option>
                  <option value="Dropped">Dropped</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <TagInput
                value={tags}
                onChange={(newTags) => setValue('tags', newTags)}
                placeholder="Add tags..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes about the buyer..."
                rows={4}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/buyers">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Buyer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
