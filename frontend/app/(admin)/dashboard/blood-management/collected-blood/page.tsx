'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Home, Loader2, Search, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useBloodCollections } from '@/lib/queries/bloodWorkflow';
import { format } from 'date-fns';

const bloodGroupMap: Record<string, string> = {
  'A_POSITIVE': 'A+',
  'A_NEGATIVE': 'A-',
  'B_POSITIVE': 'B+',
  'B_NEGATIVE': 'B-',
  'AB_POSITIVE': 'AB+',
  'AB_NEGATIVE': 'AB-',
  'O_POSITIVE': 'O+',
  'O_NEGATIVE': 'O-',
};

export default function CollectedBloodPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: collections = [], isLoading } = useBloodCollections();

  const filteredCollections = collections.filter((c: any) =>
    c.bloodCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.donorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#7F1D1D]" />
          <p className="text-sm text-slate-600">Loading collected blood...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-2 md:p-2 bg-background min-h-[calc(100vh-3.5rem)]">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                <Home size={14} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Blood Management</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Collected Blood</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.2)] flex items-center justify-center">
            <Droplet size={18} color="#7F1D1D" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 m-0 tracking-tight">
              Collected Blood
            </h1>
            <p className="text-[13px] text-slate-500 mt-[2px]">
              Manage newly collected blood samples (raw blood)
            </p>
          </div>
        </div>
        <Button 
          className="bg-[#7F1D1D] hover:bg-[#991B1B]"
          onClick={() => router.push('/dashboard/blood-donate/blood-collection')}
        >
          <Plus size={14} className="mr-1.5" /> Collect Blood
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search size={13} color="#94a3b8" className="absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            className="pl-8"
            placeholder="Search by blood code or donor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Collections Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Blood Code</TableHead>
              <TableHead>Donor Name</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Collection Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCollections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No blood collections found
                </TableCell>
              </TableRow>
            ) : (
              filteredCollections.map((collection: any) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-mono font-semibold">
                    {collection.bloodCode}
                  </TableCell>
                  <TableCell>{collection.donorName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50">
                      {bloodGroupMap[collection.bloodGroup] || collection.bloodGroup}
                    </Badge>
                  </TableCell>
                  <TableCell>{collection.quantityMl} ml</TableCell>
                  <TableCell>
                    {format(new Date(collection.collectionDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(collection.status)}>
                      {collection.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {collection.remarks || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
