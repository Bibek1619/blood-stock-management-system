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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Plus,
  Building2,
  Trash2,
  AlertCircle,
  Calendar,
  Weight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchDonors, useRecordBloodCollection, useRecordBulkCollection } from '@/lib/queries/bloodCollection';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { FullAddressAutocomplete } from '@/components/ui/full-address-autocomplete';
import { InteractiveLocationMap } from '@/components/ui/interactive-location-map';
import { geocodeLocationWithFallback } from '@/lib/geocoding';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodCollectionPage() {
  const router = useRouter();
  const [donorSearch, setDonorSearch] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [manualCoordinates, setManualCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showBulkLocationMap, setShowBulkLocationMap] = useState(false);
  const [bulkManualCoordinates, setBulkManualCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  const [formData, setFormData] = useState({
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    bloodGroup: '',
    dateOfBirth: '',
    weight: '',
    city: '',
    address: '',
    units: '1',
    collectionDate: new Date().toISOString().split('T')[0],
    collectionLocation: 'WALK_IN', // Default to Walk-in (Office)
    storageLocation: '',
    notes: '',
    hasMedicalCondition: 'no',
    medicalConditionDetails: '',
  });

  // Bulk collection state
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

  // Show map when both city and address are provided
  useEffect(() => {
    if (formData.city && formData.address && formData.city.length > 2 && formData.address.length > 3) {
      setShowLocationMap(true);
    } else {
      setShowLocationMap(false);
      setManualCoordinates(null);
    }
  }, [formData.city, formData.address]);

  // Show bulk map when both organization city and address are provided
  useEffect(() => {
    if (bulkData.organizationCity && bulkData.organizationAddress && 
        bulkData.organizationCity.length > 2 && bulkData.organizationAddress.length > 3) {
      setShowBulkLocationMap(true);
    } else {
      setShowBulkLocationMap(false);
      setBulkManualCoordinates(null);
    }
  }, [bulkData.organizationCity, bulkData.organizationAddress]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setManualCoordinates({ lat, lng });
    console.log(`📍 User selected coordinates: ${lat}, ${lng}`);
  };

  const handleAddressUpdate = (newAddress: string, newCity: string) => {
    console.log(`🔄 Updating address from coordinates: ${newAddress}, ${newCity}`);
    setFormData(prev => ({
      ...prev,
      address: newAddress,
      city: newCity,
    }));
  };

  const handleCloseMap = () => {
    setShowLocationMap(false);
  };

  const handleBulkLocationSelect = (lat: number, lng: number) => {
    setBulkManualCoordinates({ lat, lng });
    console.log(`📍 User selected bulk coordinates: ${lat}, ${lng}`);
  };

  const handleBulkAddressUpdate = (newAddress: string, newCity: string) => {
    console.log(`🔄 Updating bulk address from coordinates: ${newAddress}, ${newCity}`);
    setBulkData(prev => ({
      ...prev,
      organizationAddress: newAddress,
      organizationCity: newCity,
    }));
  };

  const handleCloseBulkMap = () => {
    setShowBulkLocationMap(false);
  };

  // Query hooks
  const { data: searchResults, isLoading: isSearching } = useSearchDonors(donorSearch, searchEnabled);
  const recordCollection = useRecordBloodCollection();
  const recordBulkCollection = useRecordBulkCollection();

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
      // Ensure quantity is always a valid number
      const numValue = parseInt(value) || 1;
      newItems[index] = { ...newItems[index], [field]: numValue };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setBulkData({ ...bulkData, bloodItems: newItems });
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
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
      // Use manual coordinates if user selected them, otherwise geocode
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      if (bulkManualCoordinates) {
        // User manually selected coordinates from map
        latitude = bulkManualCoordinates.lat;
        longitude = bulkManualCoordinates.lng;
        console.log(`✅ Using manual bulk coordinates: ${latitude}, ${longitude}`);
      } else if (bulkData.organizationAddress && bulkData.organizationCity) {
        // Fallback to automatic geocoding
        const fullAddress = `${bulkData.organizationAddress}, ${bulkData.organizationCity}`;
        console.log(`🔍 Attempting to geocode organization: "${fullAddress}"`);
        
        try {
          const coords = await geocodeLocationWithFallback(fullAddress);
          
          if (coords) {
            latitude = coords.lat;
            longitude = coords.lng;
            console.log(`✅ Geocoded organization address: ${fullAddress} → ${coords.lat}, ${coords.lng}`);
            toast.success(`Organization address geocoded successfully`, {
              description: `Location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
            });
          } else {
            console.log(`⚠️ Could not geocode organization address: ${fullAddress}`);
            toast.error('Could not find precise location for organization', {
              description: 'Using city coordinates as fallback',
            });
          }
        } catch (geocodeError) {
          console.error('Organization geocoding failed:', geocodeError);
          toast.error('Geocoding service unavailable', {
            description: 'Proceeding with city coordinates',
          });
        }
      } else if (bulkData.organizationCity) {
        // Try geocoding just the city if no full address
        console.log(`🔍 Geocoding organization city only: "${bulkData.organizationCity}"`);
        
        try {
          const coords = await geocodeLocationWithFallback(bulkData.organizationCity);
          if (coords) {
            latitude = coords.lat;
            longitude = coords.lng;
            console.log(`✅ Geocoded organization city: ${bulkData.organizationCity} → ${coords.lat}, ${coords.lng}`);
          }
        } catch (geocodeError) {
          console.error('Organization city geocoding failed:', geocodeError);
        }
      } else {
        console.log('⚠️ No organization address or city provided for geocoding');
      }

      const result = await recordBulkCollection.mutateAsync({
        ...bulkData,
        latitude, // Add geocoded latitude
        longitude, // Add geocoded longitude
      });
      
      console.log('Bulk collection result:', result);
      toast.success('Bulk blood collection recorded successfully!', {
        description: `${result.data.totalUnits} units from ${bulkData.organizationName}`,
      });
      
      setShowBulkDialog(false);
      
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
      dateOfBirth: donor.dateOfBirth ? new Date(donor.dateOfBirth).toISOString().split('T')[0] : '',
      weight: donor.weight ? donor.weight.toString() : '',
      city: donor.city || '',
      address: donor.address || '',
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
      // Use manual coordinates if user selected them, otherwise geocode
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      if (manualCoordinates) {
        // User manually selected coordinates from map
        latitude = manualCoordinates.lat;
        longitude = manualCoordinates.lng;
        console.log(`✅ Using manual coordinates: ${latitude}, ${longitude}`);
      } else if (formData.address && formData.city) {
        // Fallback to automatic geocoding
        const fullAddress = `${formData.address}, ${formData.city}`;
        console.log(`🔍 Attempting to geocode: "${fullAddress}"`);
        
        try {
          const coords = await geocodeLocationWithFallback(fullAddress);
          
          if (coords) {
            latitude = coords.lat;
            longitude = coords.lng;
            console.log(`✅ Geocoded address: ${fullAddress} → ${coords.lat}, ${coords.lng}`);
            toast.success(`Address geocoded successfully`, {
              description: `Location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
            });
          } else {
            console.log(`⚠️ Could not geocode address: ${fullAddress}`);
            toast.error('Could not find precise location', {
              description: 'Using city coordinates as fallback',
            });
          }
        } catch (geocodeError) {
          console.error('Geocoding failed:', geocodeError);
          toast.error('Geocoding service unavailable', {
            description: 'Proceeding with city coordinates',
          });
        }
      } else if (formData.city) {
        // Try geocoding just the city if no full address
        console.log(`🔍 Geocoding city only: "${formData.city}"`);
        
        try {
          const coords = await geocodeLocationWithFallback(formData.city);
          if (coords) {
            latitude = coords.lat;
            longitude = coords.lng;
            console.log(`✅ Geocoded city: ${formData.city} → ${coords.lat}, ${coords.lng}`);
          }
        } catch (geocodeError) {
          console.error('City geocoding failed:', geocodeError);
        }
      } else {
        console.log('⚠️ No address or city provided for geocoding');
      }

      console.log('📤 Submitting blood collection with data:', {
        donorName: formData.donorName,
        donorPhone: formData.donorPhone,
        bloodGroup: formData.bloodGroup,
        city: formData.city,
        address: formData.address,
        latitude,
        longitude,
        units: formData.units,
        apiUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/donations/collect`,
      });

      const result = await recordCollection.mutateAsync({
        donorId: selectedDonor?.id,
        donorName: formData.donorName,
        donorPhone: formData.donorPhone,
        donorEmail: formData.donorEmail,
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        location: formData.city, // Use city as location
        city: formData.city,
        address: formData.address,
        latitude, // Add geocoded latitude
        longitude, // Add geocoded longitude
        units: formData.units,
        collectionDate: formData.collectionDate,
        collectionLocation: formData.collectionLocation,
        storageLocation: formData.storageLocation,
        notes: formData.notes,
        medicalNotes: formData.hasMedicalCondition === 'yes' ? formData.medicalConditionDetails : null,
      });

      console.log('✅ Blood collection recorded successfully:', result);
      toast.success('Blood donation recorded successfully!', {
        description: `Blood pack ${result.data.bloodPack.packCode} created`,
      });

      // Redirect back to blood stock
      router.push('/dashboard/blood-stock');
    } catch (error: any) {
      console.error('❌ Blood collection submission failed:', error);
      
      // Enhanced error handling with safe property access
      let errorMessage = 'Failed to record donation';
      let errorDescription = 'Please try again';
      
      try {
        if (error?.response) {
          // Server responded with error
          const status = error.response.status;
          const data = error.response.data || {};
          
          console.error('Server error response:', { 
            status, 
            data,
            url: error.config?.url,
            method: error.config?.method 
          });
          
          switch (status) {
            case 400:
              errorMessage = 'Invalid data provided';
              errorDescription = data?.message || 'Please check your input and try again';
              break;
            case 401:
              errorMessage = 'Authentication required';
              errorDescription = 'Please login and try again';
              break;
            case 500:
              errorMessage = 'Server error occurred';
              errorDescription = 'Please try again later or contact support';
              break;
            default:
              errorMessage = data?.message || 'Failed to record donation';
              errorDescription = 'Please check your connection and try again';
          }
        } else if (error?.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout';
          errorDescription = 'The request took too long. Please try again';
        } else if (error?.request) {
          errorMessage = 'Network error';
          errorDescription = 'Unable to connect to server. Check your internet connection';
        } else {
          errorMessage = 'Unexpected error';
          errorDescription = error?.message || 'Something went wrong';
        }
      } catch (errorParsingError) {
        console.error('Error parsing error response:', errorParsingError);
        errorMessage = 'Unexpected error occurred';
        errorDescription = 'Please try again or contact support';
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
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
          
          <Button
            onClick={() => setShowBulkDialog(true)}
            className="bg-[#7F1D1D] hover:bg-[#991B1B] gap-2"
          >
            <Building2 size={16} />
            Bulk Add
          </Button>
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

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">
                        Date of Birth <span className="text-red-600">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            setFormData({ ...formData, dateOfBirth: e.target.value })
                          }
                          className="pl-10"
                          max={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">
                        Weight (kg) <span className="text-red-600">*</span>
                      </Label>
                      <div className="relative">
                        <Weight className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input
                          id="weight"
                          type="number"
                          min="50"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          placeholder="70"
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-slate-500">Minimum 50 kg required</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <LocationAutocomplete
                        id="city"
                        label="City"
                        value={formData.city}
                        onChange={(value) =>
                          setFormData({ ...formData, city: value })
                        }
                        placeholder="Start typing city name..."
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <FullAddressAutocomplete
                        id="address"
                        label="Full Address"
                        value={formData.address}
                        onChange={(value) =>
                          setFormData({ ...formData, address: value })
                        }
                        placeholder="Street, area, or landmark..."
                        cityContext={formData.city}
                        required
                      />
                    </div>

                    {/* Interactive Location Map */}
                    {showLocationMap && (
                      <div className="md:col-span-2">
                        <InteractiveLocationMap
                          address={formData.address}
                          city={formData.city}
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
                                Precise location selected: {manualCoordinates.lat.toFixed(6)}, {manualCoordinates.lng.toFixed(6)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Medical Condition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-[#7F1D1D]" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>
                      Does the donor have any medical conditions? <span className="text-red-600">*</span>
                    </Label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasMedicalCondition"
                          value="no"
                          checked={formData.hasMedicalCondition === 'no'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hasMedicalCondition: e.target.value,
                              medicalConditionDetails: '',
                            })
                          }
                          className="w-4 h-4 text-red-600"
                          required
                        />
                        <span className="text-sm font-medium">No</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasMedicalCondition"
                          value="yes"
                          checked={formData.hasMedicalCondition === 'yes'}
                          onChange={(e) =>
                            setFormData({ ...formData, hasMedicalCondition: e.target.value })
                          }
                          className="w-4 h-4 text-red-600"
                          required
                        />
                        <span className="text-sm font-medium">Yes</span>
                      </label>
                    </div>
                  </div>

                  {formData.hasMedicalCondition === 'yes' && (
                    <div className="space-y-2">
                      <Label htmlFor="medicalConditionDetails">
                        Medical Condition Details <span className="text-red-600">*</span>
                      </Label>
                      <textarea
                        id="medicalConditionDetails"
                        value={formData.medicalConditionDetails}
                        onChange={(e) =>
                          setFormData({ ...formData, medicalConditionDetails: e.target.value })
                        }
                        placeholder="Please describe the medical condition(s)..."
                        className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        required={formData.hasMedicalCondition === 'yes'}
                      />
                      <p className="text-xs text-slate-500">
                        This information helps ensure donor safety
                      </p>
                    </div>
                  )}
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
                        Collection Type <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={formData.collectionLocation}
                        onValueChange={(value) =>
                          setFormData({ ...formData, collectionLocation: value })
                        }
                        required
                      >
                        <SelectTrigger id="collectionLocation">
                          <SelectValue placeholder="Select collection type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EVENT">Event</SelectItem>
                          <SelectItem value="WALK_IN">Walk-in (Office)</SelectItem>
                        </SelectContent>
                      </Select>
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

        {/* Bulk Collection Dialog */}
        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#7F1D1D]" />
                Bulk Blood Collection from Organization
              </DialogTitle>
              <DialogDescription>
                Record blood donations from external organizations or blood drives
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleBulkSubmit} className="space-y-6 mt-4">
              {/* Organization Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Organization Information</CardTitle>
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
                      <Label htmlFor="bulkCollectionDate">
                        Collection Date <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="bulkCollectionDate"
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

                    {/* Interactive Location Map for Organization */}
                    {showBulkLocationMap && (
                      <div className="md:col-span-2">
                        <InteractiveLocationMap
                          address={bulkData.organizationAddress}
                          city={bulkData.organizationCity}
                          onLocationSelect={handleBulkLocationSelect}
                          onAddressUpdate={handleBulkAddressUpdate}
                          onClose={handleCloseBulkMap}
                          initialLat={bulkManualCoordinates?.lat}
                          initialLng={bulkManualCoordinates?.lng}
                        />
                        {bulkManualCoordinates && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-800 font-medium">
                                Organization location selected: {bulkManualCoordinates.lat.toFixed(6)}, {bulkManualCoordinates.lng.toFixed(6)}
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

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBulkDialog(false)}
                  disabled={recordBulkCollection.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#7F1D1D] hover:bg-[#991B1B]"
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
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
