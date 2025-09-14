'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { debounce } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export default function BuyersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [timeline, setTimeline] = useState(searchParams.get('timeline') || '');

  const updateFilters = useCallback((params: Record<string, string>) => {
    const current = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });
    
    // Reset to page 1 when filters change
    if (Object.keys(params).some(key => key !== 'page')) {
      current.set('page', '1');
    }
    
    router.push(`/buyers?${current.toString()}`);
  }, [searchParams, router]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateFilters({ search: value });
    }, 300),
    [updateFilters]
  );

  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  const handleFilterChange = (key: string, value: string) => {
    updateFilters({ [key]: value });
  };

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setPropertyType('');
    setStatus('');
    setTimeline('');
    router.push('/buyers');
  };

  const hasFilters = search || city || propertyType || status || timeline;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            handleFilterChange('city', e.target.value);
          }}
        >
          <option value="">All Cities</option>
          <option value="Chandigarh">Chandigarh</option>
          <option value="Mohali">Mohali</option>
          <option value="Zirakpur">Zirakpur</option>
          <option value="Panchkula">Panchkula</option>
          <option value="Other">Other</option>
        </Select>

        <Select
          value={propertyType}
          onChange={(e) => {
            setPropertyType(e.target.value);
            handleFilterChange('propertyType', e.target.value);
          }}
        >
          <option value="">All Property Types</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Plot">Plot</option>
          <option value="Office">Office</option>
          <option value="Retail">Retail</option>
        </Select>

        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            handleFilterChange('status', e.target.value);
          }}
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Qualified">Qualified</option>
          <option value="Contacted">Contacted</option>
          <option value="Visited">Visited</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Converted">Converted</option>
          <option value="Dropped">Dropped</option>
        </Select>

        <Select
          value={timeline}
          onChange={(e) => {
            setTimeline(e.target.value);
            handleFilterChange('timeline', e.target.value);
          }}
        >
          <option value="">All Timelines</option>
          <option value="0-3m">0-3 months</option>
          <option value="3-6m">3-6 months</option>
          <option value=">6m">&gt;6 months</option>
          <option value="Exploring">Exploring</option>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
