'use client';

import { useState, useEffect } from 'react';
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
  Building2,
  Plus,
  Trash2,
  MapPin,
  CheckCircle,
  Loader2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRecordBulkCollection, useSearchOrganizations } from '@/lib/queries/bloodCollection';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { FullAddressAutocomplete } from '@/components/ui/full-address-autocomplete';
import { InteractiveLocationMap } from '@/components/ui/interactive-location-map';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BulkCollectionPage() {
  const router = useRouter();
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [manualCoordinates, setManualCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [orgSearch, setOrgSearch] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  
  const [bulkData, setBulkData] = useState({
    organizationName: '',
    contactPersonName: '',
    organizationCity: '',
    organizationAddress: '',
    organizationEmail: '',
    organizationPhone: '',
    collectionDate: new Date().toISOString().split('T')[0],
    bloodItems: [
      { bloodGroup: '', quantity: 1 }
    ]
  });

  const recordBulkCollection = useRecordBulkCollection();
  const { data: orgSearchResults, isLoading: isSearchingOrg } = useSearchOrganizations(orgSearch, searchEnabled);

  // Show map when city OR address is provided
  useEffect(() => {
    if ((bulkData.organizationCity && bulkData.organizationCity.length > 2) || 
        (bulkData.organizationAddress && bulkData.organizationAddress.length > 3)) {
      setShowLocationMap(true);
    } else {
      setShowLocationMap(false);
      setManualCoordinates(null);
    }
  }, [bulkData.organizationCity, bulkData.organizationAddress]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setManualCoordinates({ lat, lng });
    console.log(`📍 User selected coordinates: ${lat}, ${lng}`);
  };

  const handleAddressUpdate = (newAddress: string, newCity: string) => {
    console.log(`🔄 Updating address from coordinates: ${newAddress}, ${newCity}`);
    setBulkData(prev => ({
      ...prev,
      organizationAddress: newAddress,
      organizationCity: newCity,
    }));
  };

  const handleCloseMap = () => {
    setShowLocationMap(false);
  };

  const handleSearchOrganization = () => {
    if (orgSearch.trim().length < 2) {
      toast.error('Please enter at least 2 characters to search');
      return;
    }
    setSearchEnabled(true);
  };

  const handleSelectOrganization = (org: any) => {
    setSelectedOrganization(org);
    
    // Auto-fill form with organization data
    setBulkData({
      ...bulkData,
      organizationName: org.organizationName,
      contactPersonName: org.contactPersonName || '',
      organizationCity: org.organizationCity || '',
      organizationAddress: org.organizationAddress || '',
      organizationEmail: org.organizationEmail || '',
      organizationPhone: org.organizationPhone || '',
    });

    toast.success(`Selected organization: ${org.organizationName}`);
    setOrgSearch('');
    setSearchEnabled(false);
  };

  const addBloodItem = () => {
    setBulkData({
      ...bulkData,
      bloodItems: [...bulkData.bloodItems, { bloodGroup: '', quantity: 1 }]
    });
  };

  const removeBloodItem = (index: number) => {
    const newItems = bulkData.bloodItems.filter((_, i) => i !== index);
    setBulkData({ ...bulkData, bloodItems: newItems });
  };

  const updateBloodItem = (index: number, field: string, value: any) => {
    const newItems = [...bulkData.bloodItems];
    if (field === 'quantity') {
      const numValue = parseInt(value) || 1;
      newItems[index] = { ...newItems[index], [field]: numValue };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setBulkData({ ...bulkData, bloodItems: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!bulkData.organizationName || !bulkData.contactPersonName || !bulkData.organizationCity || !bulkData.organizationAddress || !bulkData.organizationPhone) {
      toast.error('Please fill in all required organization details');
      return;
    }

    if (bulkData.bloodItems.some(item => !item.bloodGroup || item.quantity < 1)) {
      toast.error('Please fill in all blood group details');
      return;
    }

    console.log('Submitting bulk data:', bulkData);

    try {
      // Use manual coordinates if user selected them
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      if (manualCoordinates) {
        latitude = manualCoordinates.lat;
        longitude = manualCoordinates.lng;
        console.log(`✅ Using manual coordinates: ${latitude}, ${longitude}`);
      }

      const result = await recordBulkCollection.mutateAsync({
        ...bulkData,
        latitude,
        longitude,
      });
      
      console.log('Bulk collection result:', result);
      toast.success('Bulk blood collection recorded successfully!', {
        description: `${result.data.totalUnits} units from ${bulkData.organizationName}`,
      });
      
      // Reset form
      setBulkData({
        organizationName: '',
        contactPersonName: '',
        organizationCity: '',
        organizationAddress: '',
        organizationEmail: '',
        organizationPhone: '',
        collectionDate: new Date().toISOString().split('T')[0],
        bloodItems: [{ bloodGroup: '', quantity: 1 }]
      });
      
      router.push('/dashboard/blood-stock');
    } catch (error: any) {
      console.error('Bulk collection error:', error);
      toast.error('Failed to record bulk collection', {
        description: error.response?.data?.message || error.message || 'Please try again',
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="w-full max-w-[1200px] mx-auto p-6 md:p-8">
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
                <BreadcrumbLink href="/dashboard/blood-donate/blood-collection">Blood Collection</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Bulk Collection</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/blood-donate/blood-collection')}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div className="w-10 h-10 rounded-lg bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
              <Building2 size={18} className="text-[#7F1D1D]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Bulk Blood Collection</h1>
              <p className="text-sm text-slate-600">Record blood donations from organizations or blood drives</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Organization Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Organization Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-[#7F1D1D]" />
                    Search Existing Organization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Search by organization name or email..."
                      value={orgSearch}
                      onChange={(e) => {
                        setOrgSearch(e.target.value);
                        if (e.target.value.length === 0) {
                          setSearchEnabled(false);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSearchOrganization}
                      disabled={isSearchingOrg}
                    >
                      {isSearchingOrg ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                      ) : (
                        <Search size={16} className="mr-2" />
                      )}
                      Search
                    </Button>
                  </div>
                  
                  {/* Search Results */}
                  {searchEnabled && orgSearchResults && orgSearchResults.length > 0 && (
                    <div className="mt-3 border rounded-lg divide-y max-h-60 overflow-y-auto">
                      {orgSearchResults.map((org, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectOrganization(org)}
                          className="w-full p-3 text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{org.organizationName}</p>
                              <p className="text-sm text-slate-600">{org.organizationPhone}</p>
                              {org.organizationEmail && (
                                <p className="text-xs text-slate-500">{org.organizationEmail}</p>
                              )}
                              <p className="text-xs text-slate-500 mt-1">
                                {org.organizationCity} • {org.organizationAddress}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                {org.totalCollections} collections
                              </span>
                              <p className="text-xs text-slate-500 mt-1">
                                Last: {new Date(org.lastCollectionDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchEnabled && orgSearchResults && orgSearchResults.length === 0 && (
                    <p className="text-sm text-slate-500 mt-3">
                      No organizations found. Enter details below to create new organization record.
                    </p>
                  )}

                  <p className="text-xs text-slate-500 mt-2">
                    Search for previous bulk collections or enter new organization details below
                  </p>
                </CardContent>
              </Card>

              {/* Organization Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#7F1D1D]" />
                    Organization Information
                    {selectedOrganization && (
                      <span className="ml-auto text-sm font-normal text-green-600 flex items-center gap-1">
                        <CheckCircle size={16} />
                        Existing Organization Selected
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">
                        Organization Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="orgName"
                        value={bulkData.organizationName}
                        onChange={(e) =>
                          setBulkData({ ...bulkData, organizationName: e.target.value })
                        }
                        placeholder="Red Cross, City Hospital, etc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">
                        Contact Person Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="contactPerson"
                        value={bulkData.contactPersonName}
                        onChange={(e) =>
                          setBulkData({ ...bulkData, contactPersonName: e.target.value })
                        }
                        placeholder="Secretary, Representative, etc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgPhone">
                        Phone Number <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="orgPhone"
                        value={bulkData.organizationPhone}
                        onChange={(e) =>
                          setBulkData({ ...bulkData, organizationPhone: e.target.value })
                        }
                        placeholder="Contact number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgEmail">Email</Label>
                      <Input
                        id="orgEmail"
                        type="email"
                        value={bulkData.organizationEmail}
                        onChange={(e) =>
                          setBulkData({ ...bulkData, organizationEmail: e.target.value })
                        }
                        placeholder="contact@organization.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="collectionDate">
                        Collection Date <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="collectionDate"
                        type="date"
                        value={bulkData.collectionDate}
                        onChange={(e) =>
                          setBulkData({ ...bulkData, collectionDate: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <LocationAutocomplete
                        id="orgCity"
                        label="City"
                        value={bulkData.organizationCity}
                        onChange={(value) =>
                          setBulkData({ ...bulkData, organizationCity: value })
                        }
                        placeholder="Start typing city name..."
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <FullAddressAutocomplete
                        id="orgAddress"
                        label="Full Address"
                        value={bulkData.organizationAddress}
                        onChange={(value) =>
                          setBulkData({ ...bulkData, organizationAddress: value })
                        }
                        placeholder="Street, area, or landmark..."
                        cityContext={bulkData.organizationCity}
                        required
                      />
                    </div>

                    {/* Offline Location Map */}
                    {showLocationMap && (
                      <div className="md:col-span-2">
                        <InteractiveLocationMap
                          address={bulkData.organizationAddress}
                          city={bulkData.organizationCity}
                          onLocationSelect={handleLocationSelect}
                          onAddressUpdate={handleAddressUpdate}
                          onClose={handleCloseMap}
                          initialLat={manualCoordinates?.lat}
                          initialLng={manualCoordinates?.lng}
                        />
                        {manualCoordinates && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-800 font-medium">
                                Organization location selected: {manualCoordinates.lat.toFixed(6)}, {manualCoordinates.lng.toFixed(6)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Blood Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Blood Groups & Quantities</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addBloodItem}
                      className="gap-2"
                    >
                      <Plus size={14} />
                      Add Blood Group
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bulkData.bloodItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`bloodGroup-${index}`}>
                          Blood Group <span className="text-red-600">*</span>
                        </Label>
                        <Select
                          value={item.bloodGroup}
                          onValueChange={(value) =>
                            updateBloodItem(index, 'bloodGroup', value)
                          }
                          required
                        >
                          <SelectTrigger id={`bloodGroup-${index}`}>
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

                      <div className="w-32 space-y-2">
                        <Label htmlFor={`quantity-${index}`}>
                          Quantity <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) =>
                            updateBloodItem(index, 'quantity', e.target.value)
                          }
                          required
                        />
                      </div>

                      {bulkData.bloodItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBloodItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  ))}

                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">Total Units:</span>
                      <span className="font-bold text-[#7F1D1D]">
                        {bulkData.bloodItems.reduce((sum, item) => sum + (item.quantity || 0), 0)} units
                      </span>
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
                  <CardTitle className="text-lg">Collection Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Organization:</span>
                      <span className="font-medium text-right">
                        {bulkData.organizationName || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Contact Person:</span>
                      <span className="font-medium text-right">
                        {bulkData.contactPersonName || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Location:</span>
                      <span className="font-medium text-right">
                        {bulkData.organizationCity || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Units:</span>
                      <span className="font-bold text-[#7F1D1D]">
                        {bulkData.bloodItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Collection Date:</span>
                      <span className="font-medium">
                        {new Date(bulkData.collectionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold text-sm">Blood Groups:</h4>
                    <div className="space-y-2 text-sm">
                      {bulkData.bloodItems.map((item, index) => (
                        item.bloodGroup && (
                          <div key={index} className="flex justify-between">
                            <span className="text-slate-600">{item.bloodGroup}:</span>
                            <span className="font-medium">{item.quantity} units</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold text-sm">What will be created:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-slate-600">Bulk collection record</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-slate-600">
                          Multiple blood packs with unique codes
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-slate-600">
                          Update blood stock (+{bulkData.bloodItems.reduce((sum, item) => sum + (item.quantity || 0), 0)})
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#7F1D1D] hover:bg-[#991B1B]"
                    disabled={recordBulkCollection.isPending}
                  >
                    {recordBulkCollection.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      'Record Bulk Collection'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/dashboard/blood-donate/blood-collection')}
                    disabled={recordBulkCollection.isPending}
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