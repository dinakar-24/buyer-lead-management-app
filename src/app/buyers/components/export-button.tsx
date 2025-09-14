'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateCSVFileName } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ExportButtonProps {
  filters: any;
}

export default function ExportButton({ filters }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      params.set('export', 'true');
      
      const response = await fetch(`/api/buyers/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateCSVFileName();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Failed to export buyers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading}
    >
      <Download className="mr-2 h-4 w-4" />
      {loading ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
}
