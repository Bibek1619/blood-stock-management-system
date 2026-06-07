'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  UserCheck,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Droplets,
  Weight,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  usePendingDonorRequests,
  useApproveDonorRequest,
  useRejectDonorRequest,
  type DonorRequest,
} from '@/lib/queries/donorRequests';
import { useDonors, type Donor } from '@/lib/queries/donors';

export default function DonorRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<DonorRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showAcceptedDonorsDialog, setShowAcceptedDonorsDialog] = useState(false);

  const { data: donorRequests = [], isLoading, error, isError } = usePendingDonorRequests();
  const { data: donorList = [], isLoading: isAcceptedDonorsLoading } = useDonors();
  const approveMutation = useApproveDonorRequest();
  const rejectMutation = useRejectDonorRequest();
  const donors = Array.isArray(donorList) ? (donorList as Donor[]) : [];
  const acceptedDonors = donors.filter((donor) => donor.user?.isVerified);

  // Debug logging
  console.log('Donor Requests Data:', donorRequests);
  console.log('Is Loading:', isLoading);
  console.log('Is Error:', isError);
  console.log('Error:', error);

  // Filter donor requests based on search query
  const filteredRequests = donorRequests.filter((donor) => {
    const query = searchQuery.toLowerCase();
    return (
      donor.user.name.toLowerCase().includes(query) ||
      donor.user.phone.includes(query) ||
      donor.user.email.toLowerCase().includes(query) ||
      donor.city?.toLowerCase().includes(query) ||
      donor.address?.toLowerCase().includes(query)
    );
  });

  const handleViewDetails = (donor: DonorRequest) => {
    setSelectedDonor(donor);
    setShowDetailsDialog(true);
  };

  const handleApprove = async (donorId: string) => {
    try {
      await approveMutation.mutateAsync(donorId);
      toast.success('Donor request approved successfully');
      setShowDetailsDialog(false);
      setSelectedDonor(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to approve donor request');
    }
  };

  const handleRejectClick = (donor: DonorRequest) => {
    setSelectedDonor(donor);
    setShowRejectDialog(true);
    setRejectionReason('');
  };

  const handleRejectConfirm = async () => {
    if (!selectedDonor || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        donorId: selectedDonor.id,
        reason: rejectionReason,
      });
      toast.success('Donor request rejected');
      setShowRejectDialog(false);
      setShowDetailsDialog(false);
      setSelectedDonor(null);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reject donor request');
    }
  };

  const formatBloodGroup = (bloodGroup: string) => {
    return bloodGroup.replace('_', ' ');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="w-full max-w-[1400px] mx-auto p-6 md:p-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Donor Requests</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
              <UserCheck size={18} className="text-[#7F1D1D]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Donor Requests</h1>
              <p className="text-sm text-slate-600">
                Review and approve pending donor registrations
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="gap-2 border-[#7F1D1D]/20 text-[#7F1D1D] hover:bg-[#7F1D1D]/5"
            onClick={() => setShowAcceptedDonorsDialog(true)}
          >
            View All Donors
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="md:col-span-3">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, phone, email, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#7F1D1D]">
                  {filteredRequests.length}
                </p>
                <p className="text-sm text-slate-600">Pending Requests</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {isError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <XCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Failed to load donor requests</p>
                  <p className="text-sm text-red-600">
                    {error instanceof Error ? error.message : 'Please check your connection and try again'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Donor Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Donor Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#7F1D1D]" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">
                  {searchQuery ? 'No matching donor requests found' : 'No pending donor requests'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Registered On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((donor) => (
                      <TableRow key={donor.id}>
                        <TableCell className="font-medium">{donor.user.name}</TableCell>
                        <TableCell>{donor.user.phone}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                            <Droplets size={12} />
                            {formatBloodGroup(donor.bloodGroup)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin size={14} className="text-slate-400" />
                            {donor.city || donor.location}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(donor.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(donor)}
                              className="gap-1"
                            >
                              <Eye size={14} />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(donor.id)}
                              disabled={approveMutation.isPending}
                              className="gap-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle size={14} />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectClick(donor)}
                              disabled={rejectMutation.isPending}
                              className="gap-1"
                            >
                              <XCircle size={14} />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Donor Details</DialogTitle>
              <DialogDescription>
                Review complete donor information before approval
              </DialogDescription>
            </DialogHeader>

            {selectedDonor && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <UserCheck size={18} className="text-[#7F1D1D]" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600">Full Name</Label>
                      <p className="font-medium">{selectedDonor.user.name}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Blood Group</Label>
                      <p className="font-medium">{formatBloodGroup(selectedDonor.bloodGroup)}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600 flex items-center gap-1">
                        <Phone size={14} />
                        Phone
                      </Label>
                      <p className="font-medium">{selectedDonor.user.phone}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600 flex items-center gap-1">
                        <Mail size={14} />
                        Email
                      </Label>
                      <p className="font-medium">{selectedDonor.user.email}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600 flex items-center gap-1">
                        <Calendar size={14} />
                        Date of Birth
                      </Label>
                      <p className="font-medium">{formatDate(selectedDonor.dateOfBirth)}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600 flex items-center gap-1">
                        <Weight size={14} />
                        Weight
                      </Label>
                      <p className="font-medium">
                        {selectedDonor.weight ? `${selectedDonor.weight} kg` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-[#7F1D1D]" />
                    Location Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-slate-600">City</Label>
                      <p className="font-medium">{selectedDonor.city || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Address</Label>
                      <p className="font-medium">{selectedDonor.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                {selectedDonor.medicalNotes && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-[#7F1D1D]" />
                      Medical Notes
                    </h3>
                    <p className="text-sm bg-slate-50 p-3 rounded-lg">
                      {selectedDonor.medicalNotes}
                    </p>
                  </div>
                )}

                {/* Registration Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Registration Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600">Registered On</Label>
                      <p className="font-medium">{formatDate(selectedDonor.createdAt)}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Donor Type</Label>
                      <p className="font-medium">{selectedDonor.donorType}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDetailsDialog(false);
                  if (selectedDonor) handleRejectClick(selectedDonor);
                }}
                disabled={rejectMutation.isPending}
                className="gap-1"
              >
                <XCircle size={16} />
                Reject
              </Button>
              <Button
                onClick={() => selectedDonor && handleApprove(selectedDonor.id)}
                disabled={approveMutation.isPending}
                className="gap-1 bg-green-600 hover:bg-green-700"
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Approve
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAcceptedDonorsDialog} onOpenChange={setShowAcceptedDonorsDialog}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Accepted Donor List</DialogTitle>
              <DialogDescription>
                View all verified donors without leaving this page.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#7F1D1D]">
                      {acceptedDonors.length}
                    </p>
                    <p className="text-sm text-slate-600">Accepted Donors</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isAcceptedDonorsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#7F1D1D]" />
              </div>
            ) : acceptedDonors.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No accepted donors found</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acceptedDonors.map((donor) => (
                      <TableRow key={donor.id}>
                        <TableCell className="font-medium">{donor.user?.name || 'Unknown'}</TableCell>
                        <TableCell>{donor.user?.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                            <Droplets size={12} />
                            {formatBloodGroup(donor.bloodGroup)}
                          </span>
                        </TableCell>
                        <TableCell>{donor.city || donor.location || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAcceptedDonorsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Donor Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this donor registration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectionReason">
                  Rejection Reason <span className="text-red-600">*</span>
                </Label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mt-2"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectConfirm}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
