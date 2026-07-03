'use client';

import { useState } from 'react';
import { Home, Loader2, Search, TestTube, Eye } from 'lucide-react';
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
import { usePendingCollections } from '@/lib/queries/bloodWorkflow';
import { TestBloodDialog } from '../components/TestBloodDialog';
import { format } from 'date-fns';

const bloodGroupMap: Record<string, string> = {
  'A_POSITIVE': 'A+', 'A_NEGATIVE': 'A-',
  'B_POSITIVE': 'B+', 'B_NEGATIVE': 'B-',
  'AB_POSITIVE': 'AB+', 'AB_NEGATIVE': 'AB-',
  'O_POSITIVE': 'O+', 'O_NEGATIVE': 'O-',
};

export default function TestBloodPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: collections = [], isLoading } = usePendingCollections();

  const filteredCollections = collections.filter((c: any) =>
    c.bloodCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.donorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTest = (collection: any) => {
    setSelectedCollection(collection);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7F1D1D]" />
      </div>
    );
  }

  return (
    <div className="w-full p-2 md:p-2 bg-background min-h-[calc(100vh-3.5rem)]">
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
              <BreadcrumbPage>Test Blood</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.2)] flex items-center justify-center">
            <TestTube size={18} color="#7F1D1D" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 m-0 tracking-tight">
              Test Blood
            </h1>
            <p className="text-[13px] text-slate-500 mt-[2px]">
              Test pending blood samples and approve/reject them
            </p>
          </div>
        </div>
      </div>

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

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Blood Code</TableHead>
              <TableHead>Donor Name</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Collection Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCollections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No pending blood samples for testing
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
                    <Button
                      size="sm"
                      onClick={() => handleTest(collection)}
                      className="bg-[#7F1D1D] hover:bg-[#991B1B]"
                    >
                      <TestTube size={12} className="mr-1.5" /> Test
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCollection && (
        <TestBloodDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          collection={selectedCollection}
        />
      )}
    </div>
  );
}
