'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { CSVRowSchema } from '@/lib/validations/buyer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ValidationError {
  row: number;
  errors: string[];
}

export default function ImportBuyersPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setValidationErrors([]);
      setSuccessCount(0);
      setErrorCount(0);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    setValidationErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.data.length > 200) {
          toast.error('Maximum 200 rows allowed');
          setLoading(false);
          return;
        }

        const errors: ValidationError[] = [];
        const validRows: any[] = [];

        results.data.forEach((row: any, index) => {
          try {
            const validatedRow = CSVRowSchema.parse(row);
            validRows.push(validatedRow);
          } catch (error: any) {
            const rowErrors = error.errors?.map((e: any) => 
              `${e.path.join('.')}: ${e.message}`
            ) || ['Invalid row format'];
            
            errors.push({
              row: index + 2, // +2 because of header and 0-index
              errors: rowErrors,
            });
          }
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
          setErrorCount(errors.length);
          setSuccessCount(validRows.length);
        }

        if (validRows.length > 0) {
          try {
            const response = await fetch('/api/buyers/import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ buyers: validRows }),
            });

            const result = await response.json();

            if (result.success) {
              toast.success(`Successfully imported ${result.count} buyers`);
              if (errors.length === 0) {
                router.push('/buyers');
              }
            } else {
              toast.error(result.error || 'Import failed');
            }
          } catch (error) {
            toast.error('Failed to import buyers');
          }
        }

        setLoading(false);
      },
      error: (error) => {
        toast.error('Failed to parse CSV file');
        setLoading(false);
      },
    });
  };

  const downloadTemplate = () => {
    const template = 'fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status\n' +
      'John Doe,john@example.com,9876543210,Chandigarh,Apartment,2,Buy,2000000,5000000,0-3m,Website,"Looking for 2BHK","premium,urgent",New\n' +
      'Jane Smith,,9876543211,Mohali,Villa,,Buy,10000000,20000000,3-6m,Referral,"Interested in luxury villa","luxury",Qualified';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buyers_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
          <h1 className="text-2xl font-bold">Import Buyers</h1>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <FileText className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Upload a CSV file with buyer data. Maximum 200 rows allowed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-primary-600 hover:text-primary-500 font-medium">
                  Click to upload
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500">CSV files only, max 200 rows</p>
            </div>
            {file && (
              <div className="mt-4 flex items-center justify-center space-x-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{file.name}</span>
              </div>
            )}
          </div>

          {file && (
            <div className="flex justify-end">
              <Button onClick={handleImport} disabled={loading}>
                {loading ? 'Importing...' : 'Import Buyers'}
              </Button>
            </div>
          )}

          {/* Results Summary */}
          {(successCount > 0 || errorCount > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {successCount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      {successCount} Valid Rows
                    </span>
                  </div>
                </div>
              )}
              {errorCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">
                      {errorCount} Invalid Rows
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-red-900">Validation Errors</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left">Row</th>
                      <th className="px-4 py-2 text-left">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {validationErrors.map((error, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 font-medium">{error.row}</td>
                        <td className="px-4 py-2">
                          <ul className="list-disc list-inside text-red-600">
                            {error.errors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CSV Format Guide */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">CSV Format Guide</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Required fields:</strong> fullName, phone, city, propertyType, purpose, timeline, source</p>
              <p><strong>Optional fields:</strong> email, bhk, budgetMin, budgetMax, notes, tags, status</p>
              <p><strong>City values:</strong> Chandigarh, Mohali, Zirakpur, Panchkula, Other</p>
              <p><strong>Property types:</strong> Apartment, Villa, Plot, Office, Retail</p>
              <p><strong>BHK values:</strong> Studio, 1, 2, 3, 4 (required for Apartment/Villa)</p>
              <p><strong>Tags:</strong> Comma-separated values in the tags column</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
