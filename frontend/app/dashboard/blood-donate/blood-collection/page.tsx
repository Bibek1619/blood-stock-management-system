'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  Droplets,
  User,
  Search,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchDonors, useRecordBloodCollection } from '@/lib/queries/bloodCollection';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodCollectionPage() {
  const router = useRouter();
  const [donorSearch, setDonorSearch] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    bloodGroup: '',
    location: '',
    units: '1',
    collectionDate: new Date().toISOString().split('T')[0],
    collectionLocation: '',
    storageLocation: '',
    notes: '',
  });

  // Query hooks
  const { data: searchResults, isLoading: isSearching } = useSearchDonors(donorSearch, searchEnabled);
  const recordCollection = useRecordBloodCollection();

  const handleSearchDonor = () => {
    if (donorSearch.trim().length < 2) {
      toast.error('Please enter at least 2 characters to search');
      return;
    }
    setSearchEnabled(true);
  };

  const handleSelectDonor = (donor: any) => {
    setSelectedDonor(donor);
    
    // Convert blood group from DB format to display format
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

    setFormData({
      ...formData,
      donorName: donor.user.name,
      donorPhone: donor.user.phone,
      donorEmail: donor.user.email,
      bloodGroup: bloodGroupMap[donor.bloodGroup] || donor.bloodGroup,
      location: donor.location || '',
    });

    toast.success(`Selected donor: ${donor.user.name}`);
    setDonorSearch('');
    setSearchEnabled(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.donorName || !formData.donorPhone || !formData.bloodGroup || !formData.collectionLocation) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const result = await recordCollection.mutateAsync({
        donorId: selectedDonor?.id,
        donorName: formData.donorName,
        donorPhone: formData.donorPhone,
        donorEmail: formData.donorEmail,
        bloodGroup: formData.bloodGroup,
        location: formData.location,
        units: formData.units,
        collectionDate: formData.collectionDate,
        collectionLocation: formData.collectionLocation,
        storageLocation: formData.storageLocation,
        notes: formData.notes,
      });

      toast.success('Blood donation recorded successfully!', {
        description: `Blood pack ${result.data.bloodPack.packCode} created`,
      });

      // Redirect back to blood stock
      router.push('/dashboard/blood-stock');
    } catch (error: any) {
      toast.error('Failed to record donation', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="w-full max-w-[1400px] mx-auto p-6 md:p-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/blood-stock">Blood Stock</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Blood Collection</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/blood-stock')}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div className="w-10 h-10 rounded-lg bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
              <Droplets size={18} className="text-[#7F1D1D]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Record Blood Donation</h1>
              <p className="text-sm text-slate-600">Collect blood from donor and create blood pack</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Donor Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Donor Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-[#7F1D1D]" />
                    Search Existing Donor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Search by name, phone, or email..."
                      value={donorSearch}
                      onChange={(e) => {
                        setDonorSearch(e.target.value);
                        if (e.target.value.length === 0) {
                          setSearchEnabled(false);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSearchDonor}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                      ) : (
                        <Search size={16} className="mr-2" />
                      )}
                      Search
                    </Button>
                  </div>
                  
                  {/* Search Results */}
                  {searchEnabled && searchResults && searchResults.length > 0 && (
                    <div className="mt-3 border rounded-lg divide-y max-h-60 overflow-y-auto">
                      {searchResults.map((donor) => (
                        <button
                          key={donor.id}
                          type="button"
                          onClick={() => handleSelectDonor(donor)}
                          className="w-full p-3 text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{donor.user.name}</p>
                              <p className="text-sm text-slate-600">{donor.user.phone}</p>
                              {donor.user.email && (
                                <p className="text-xs text-slate-500">{donor.user.email}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                                {donor.bloodGroup.replace('_', ' ')}
                              </span>
                              <p className="text-xs text-slate-500 mt-1">
                                {donor.totalDonations} donations
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchEnabled && searchResults && searchResults.length === 0 && (
                    <p className="text-sm text-slate-500 mt-3">
                      No donors found. Enter details below to create new donor record.
                    </p>
                  )}

                  <p className="text-xs text-slate-500 mt-2">
                    Search for registered donors or enter new donor details below
                  </p>
                </CardContent>
              </Card>

              {/* Donor Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[#7F1D1D]" />
                    Donor Information
                    {selectedDonor && (
                      <span className="ml-auto text-sm font-normal text-green-600 flex items-center gap-1">
                        <CheckCircle size={16} />
                        Existing Donor Selected
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="donorName">
                        Full Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="donorName"
                        value={formData.donorName}
                        onChange={(e) =>
                          setFormData({ ...formData, donorName: e.target.value })
                        }
                        placeholder="Enter donor name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donorPhone">
                        Phone Number <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="donorPhone"
                        value={formData.donorPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, donorPhone: e.target.value })
                        }
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donorEmail">Email (Optional)</Label>
                      <Input
                        id="donorEmail"
                        type="email"
                        value={formData.donorEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, donorEmail: e.target.value })
                        }
                        placeholder="Enter email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">
                        Blood Group <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={formData.bloodGroup}
                        onValueChange={(value) =>
                          setFormData({ ...formData, bloodGroup: value })
                        }
                        required
                      >
                        <SelectTrigger id="bloodGroup">
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="City or district"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Donation Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-[#7F1D1D]" />
                    Donation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="units">
                        Units Collected <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="units"
                        type="number"
                        min="1"
                        value={formData.units}
                        onChange={(e) =>
                          setFormData({ ...formData, units: e.target.value })
                        }
                        required
                      />
                      <p className="text-xs text-slate-500">1 unit = 450ml</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="collectionDate">
                        Collection Date <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="collectionDate"
                        type="date"
                        value={formData.collectionDate}
                        onChange={(e) =>
                          setFormData({ ...formData, collectionDate: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="collectionLocation">
                        Collection Location <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="collectionLocation"
                        value={formData.collectionLocation}
                        onChange={(e) =>
                          setFormData({ ...formData, collectionLocation: e.target.value })
                        }
                        placeholder="Office, Event, etc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="storageLocation">Storage Location</Label>
                      <Input
                        id="storageLocation"
                        value={formData.storageLocation}
                        onChange={(e) =>
                          setFormData({ ...formData, storageLocation: e.target.value })
                        }
                        placeholder="Refrigerator-A1"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Any additional notes"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Donor:</span>
                      <span className="font-medium">
                        {formData.donorName || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Blood Group:</span>
                      <span className="font-medium">
                        {formData.bloodGroup || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Units:</span>
                      <span className="font-medium">{formData.units}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Collection Date:</span>
                      <span className="font-medium">
                        {new Date(formData.collectionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Expiry Date:</span>
                      <span className="font-medium">
                        {new Date(
                          new Date(formData.collectionDate).getTime() +
                            35 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold text-sm">What will be created:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-slate-600">Donation record</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-slate-600">
                          Blood pack with unique code
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-slate-600">
                          Update blood stock (+{formData.units})
                        </span>
                      </div>
                      {selectedDonor && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span className="text-slate-600">
                            Update donor profile
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#7F1D1D] hover:bg-[#991B1B]"
                    disabled={recordCollection.isPending}
                  >
                    {recordCollection.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      'Record Donation'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/dashboard/blood-stock')}
                    disabled={recordCollection.isPending}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
