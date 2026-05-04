'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDonor } from '@/lib/queries/donors';
import { useDonationsByUser } from '@/lib/queries/donations';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Droplets,
  Calendar,
  Weight,
  Activity,
  Award,
  Heart,
  CheckCircle,
  XCircle,
  Loader2,
  Home,
  CalendarDays,
  Building2,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getCityCoordinates } from '@/lib/geocoding';

// Dynamically import map to avoid SSR issues
const DonorMap = dynamic(() => import('@/components/DonorMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-slate-100 rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  ),
});

// Helper function to determine registration source
function getRegistrationSource(user: any, donations: any[]) {
  // If user registered through web (verified and no donations or donations came after registration)
  if (user?.isVerified && donations && donations.length > 0) {
    const firstDonation = donations[donations.length - 1]; // Last in array is first chronologically
    const userCreatedAt = new Date(user.createdAt);
    const firstDonationDate = new Date(firstDonation.donationDate);
    
    // If user was created before first donation, they registered through web
    if (userCreatedAt < firstDonationDate) {
      return { source: 'WEB', label: 'Registered through Website', icon: '🌐', color: 'text-green-600' };
    }
  }
  
  // Check first donation location to determine source
  if (donations && donations.length > 0) {
    const firstDonation = donations[donations.length - 1];
    const location = firstDonation.location?.toUpperCase() || '';
    
    if (location.includes('EVENT') || firstDonation.donationType === 'EVENT') {
      return { source: 'EVENT', label: 'Registered at Event', icon: '📅', color: 'text-blue-600' };
    }
    
    if (location.includes('ORGANIZATION') || firstDonation.donationType === 'ORGANIZATION') {
      return { source: 'ORGANIZATION', label: 'Organization Donor', icon: '🏢', color: 'text-purple-600' };
    }
    
    // Default to walk-in/office
    return { source: 'WALK_IN', label: 'Registered at Main Office', icon: '🏥', color: 'text-orange-600' };
  }
  
  // If verified but no donations, they registered through web
  if (user?.isVerified) {
    return { source: 'WEB', label: 'Registered through Website', icon: '🌐', color: 'text-green-600' };
  }
  
  // Default
  return { source: 'UNKNOWN', label: 'Registration Source Unknown', icon: '❓', color: 'text-slate-600' };
}

// Donation History Component
function DonationHistoryList({ donorId, userId }: { donorId: string; userId: string }) {
  const { data: donations, isLoading } = useDonationsByUser(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-600">No donation history yet</p>
      </div>
    );
  }

  const formatBloodGroup = (bg: string) => {
    const mapping: Record<string, string> = {
      'A_POSITIVE': 'A+', 'A_NEGATIVE': 'A-',
      'B_POSITIVE': 'B+', 'B_NEGATIVE': 'B-',
      'AB_POSITIVE': 'AB+', 'AB_NEGATIVE': 'AB-',
      'O_POSITIVE': 'O+', 'O_NEGATIVE': 'O-',
    };
    return mapping[bg] || bg;
  };

  const getCollectionTypeIcon = (type: string) => {
    if (type === 'EVENT') return <CalendarDays className="h-4 w-4" />;
    if (type === 'ORGANIZATION') return <Building2 className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const getCollectionTypeLabel = (type: string) => {
    if (type === 'EVENT') return 'Event';
    if (type === 'ORGANIZATION') return 'Organization';
    return 'Walk-in';
  };

  const getCollectionTypeBadge = (type: string) => {
    if (type === 'EVENT') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (type === 'ORGANIZATION') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  // Helper function to extract contact person from notes
  const getContactPerson = (notes: string) => {
    if (!notes) return null;
    const match = notes.match(/Contact:\s*(.+)$/);
    return match ? match[1] : null;
  };

  const getOrganizationName = (notes: string) => {
    if (!notes) return null;
    const match = notes.match(/Bulk collection from\s+(.+?)\s*-\s*Contact:/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-2.5 max-h-[450px] overflow-y-auto">
      {donations.map((donation: any, index: number) => {
        const contactPerson = getContactPerson(donation.notes);
        const orgName = getOrganizationName(donation.notes);
        
        return (
          <div
            key={donation.id}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100"
          >
            <div className="flex items-start gap-2.5 flex-1">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Droplets className="h-4 w-4 text-[#7F1D1D]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-900">
                    Donation #{donations.length - index}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getCollectionTypeBadge(donation.location || 'WALK_IN')}`}
                  >
                    {getCollectionTypeIcon(donation.location || 'WALK_IN')}
                    <span className="ml-1">{getCollectionTypeLabel(donation.location || 'WALK_IN')}</span>
                  </Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(donation.donationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      {donation.units} unit{donation.units > 1 ? 's' : ''}
                    </span>
                  </div>
                  {(orgName || contactPerson) && (
                    <div className="text-xs text-slate-700">
                      {orgName && <span className="font-medium">🏢 {orgName}</span>}
                      {contactPerson && (
                        <span className="ml-2">
                          👤 <span className="font-medium">{contactPerson}</span>
                        </span>
                      )}
                    </div>
                  )}
                  {donation.notes && !orgName && !contactPerson && (
                    <span className="text-xs text-slate-600 truncate" title={donation.notes}>
                      📝 {donation.notes}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Badge variant="outline" className="font-bold text-xs">
                {formatBloodGroup(donation.bloodGroup)}
              </Badge>
              <span className="text-xs text-slate-500 capitalize">
                {donation.status.toLowerCase()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Utility function to format blood group
const formatBloodGroup = (bloodGroup: string): string => {
  const mapping: Record<string, string> = {
    'A_POSITIVE': 'A+',
    'A_NEGATIVE': 'A-',
    'B_POSITIVE': 'B+',
    'B_NEGATIVE': 'B-',
    'AB_POSITIVE': 'AB+',
    'AB_NEGATIVE': 'AB-',
    'O_POSITIVE': 'O+',
    'O_NEGATIVE': 'O-',
  };
  return mapping[bloodGroup] || bloodGroup;
};

// Calculate age from date of birth
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function DonorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const donorId = params.id as string;

  const { data: donor, isLoading, error } = useDonor(donorId);

  // Fetch donations to determine registration source using custom hook
  const { data: donations } = useDonationsByUser(donor?.userId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={48} className="text-[#7F1D1D] animate-spin" />
          <p className="text-sm text-slate-600">Loading donor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !donor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle size={48} className="text-red-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Donor Not Found</h2>
          <p className="text-slate-600 mb-4">The donor profile you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/donors')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donors
          </Button>
        </div>
      </div>
    );
  }

  const name = donor.user?.name || 'Unknown';
  const email = donor.user?.email || 'N/A';
  const phone = donor.user?.phone || 'N/A';
  const bloodGroup = formatBloodGroup(donor.bloodGroup);
  const age = donor.dateOfBirth ? calculateAge(donor.dateOfBirth) : null;
  const isVerified = donor.user?.isVerified || false;

  // Determine registration source
  const registrationInfo = getRegistrationSource(donor.user, donations || []);

  // Get coordinates - use donor's coordinates or fallback to city-based coordinates
  let coordinates = (donor as any).latitude && (donor as any).longitude
    ? { lat: (donor as any).latitude, lng: (donor as any).longitude }
    : getCityCoordinates(donor.city || donor.location);

  // Normalize coordinate format (getCityCoordinates returns {latitude, longitude})
  if (coordinates && 'latitude' in coordinates) {
    coordinates = { lat: coordinates.latitude, lng: coordinates.longitude };
  }

  const hasLocation = !!coordinates;

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="w-full max-w-[1600px] mx-auto px-3 pb-4 md:px-4">
        {/* Breadcrumbs - Start from very top */}
        <div className="mb-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center gap-1 text-xs">
                  <Home size={12} /> Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/donors" className="text-xs">Donors</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs">{name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/donors')}
            className="gap-2 h-9 px-3 -ml-2"
            size="sm"
          >
            <ArrowLeft size={16} />
            Back to Donors
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-5 border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#7F1D1D] to-[#991B1B] px-5 py-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="text-2xl font-bold text-white truncate">{name}</h1>
                  {isVerified && (
                    <Badge className="bg-green-500 hover:bg-green-600 flex-shrink-0">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm mb-2">
                  <div className="flex items-center gap-1.5">
                    <Droplets size={14} />
                    <span className="font-semibold">{bloodGroup}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span className="truncate">{donor.city || donor.location || 'N/A'}</span>
                  </div>
                  {age && (
                    <div className="flex items-center gap-1.5">
                      <User size={14} />
                      <span>{age} years old</span>
                    </div>
                  )}
                </div>
                {/* Registration Source */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-sm">{registrationInfo.icon}</span>
                  <span className="text-xs font-medium text-white/90">{registrationInfo.label}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-white/80 text-sm mb-1">Total Donations</div>
                <div className="text-4xl font-bold text-white">{donor.totalDonations}</div>
                <div className="text-white/80 text-xs">
                  {donor.totalDonations * 3} lives impacted
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column - Contact & Personal Info */}
          <div className="lg:col-span-1 space-y-5">
            {/* Contact Information */}
            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-7 h-7 rounded-lg bg-[#7F1D1D]/10 flex items-center justify-center">
                    <Phone className="h-3.5 w-3.5 text-[#7F1D1D]" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 px-4 pb-4">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <Mail className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-0.5 font-medium">Email Address</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <Phone className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-0.5 font-medium">Phone Number</p>
                    <p className="text-sm font-medium text-slate-900">{phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <MapPin className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-0.5 font-medium">Address</p>
                    <p className="text-sm font-medium text-slate-900">
                      {donor.address || 'N/A'}
                    </p>
                    {donor.city && (
                      <p className="text-xs text-slate-600 mt-0.5">{donor.city}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Status */}
            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-7 h-7 rounded-lg bg-[#7F1D1D]/10 flex items-center justify-center">
                    <Activity className="h-3.5 w-3.5 text-[#7F1D1D]" />
                  </div>
                  Health Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 px-4 pb-4">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-700 font-medium">Weight</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {donor.weight ? `${donor.weight} kg` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-700 font-medium">Blood Group</span>
                  </div>
                  <Badge variant="outline" className="font-bold text-[#7F1D1D] border-[#7F1D1D]/30">
                    {bloodGroup}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-700 font-medium">Eligible to Donate</span>
                  </div>
                  {donor.isEligible ? (
                    <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      <XCircle className="mr-1 h-3 w-3" />
                      No
                    </Badge>
                  )}
                </div>
                {age && (
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-600" />
                      <span className="text-sm text-slate-700 font-medium">Age</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{age} years</span>
                  </div>
                )}
                {donor.lastDonationDate && (
                  <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">Last Donation</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-900">
                      {new Date(donor.lastDonationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Donation History & Map */}
          <div className="lg:col-span-2 space-y-5">
            {/* Donation Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm border-0 bg-gradient-to-br from-red-50 to-white">
                <CardContent className="pt-5 pb-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 font-medium mb-1">Total Donations</p>
                      <p className="text-2xl font-bold text-[#7F1D1D]">{donor.totalDonations}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Blood donation sessions</p>
                    </div>
                    <div className="w-12 h-12 bg-[#7F1D1D]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Droplets className="h-6 w-6 text-[#7F1D1D]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-gradient-to-br from-pink-50 to-white">
                <CardContent className="pt-5 pb-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 font-medium mb-1">Blood Donated</p>
                      <p className="text-2xl font-bold text-[#7F1D1D]">
                        {donor.totalDonations * 450}
                        <span className="text-base ml-1">ml</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Approximately</p>
                    </div>
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Heart className="h-6 w-6 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="pt-5 pb-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 font-medium mb-1">Lives Impacted</p>
                      <p className="text-2xl font-bold text-amber-700">
                        {donor.totalDonations * 3}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">People helped</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Donation History */}
            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-7 h-7 rounded-lg bg-[#7F1D1D]/10 flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-[#7F1D1D]" />
                  </div>
                  Donation History
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {donor.totalDonations === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="h-7 w-7 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-1">No donation history yet</p>
                    <p className="text-xs text-slate-500">This donor hasn't made any donations</p>
                  </div>
                ) : (
                  <DonationHistoryList donorId={donor.id} userId={donor.userId} />
                )}
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-7 h-7 rounded-lg bg-[#7F1D1D]/10 flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-[#7F1D1D]" />
                  </div>
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {hasLocation && coordinates ? (
                  <div className="relative">
                    <DonorMap
                      latitude={coordinates.lat}
                      longitude={coordinates.lng}
                      donorName={name}
                      bloodGroup={bloodGroup}
                      donorType={donor.donorType}
                    />
                    <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-600 flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium">{donor.city || donor.location || 'Location'}</span>
                        {!(donor as any).latitude && (
                          <span className="text-slate-400">(Approximate location based on city)</span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[280px] bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="h-7 w-7 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Location not available</p>
                      <p className="text-xs text-slate-500">
                        {donor.city || donor.location || 'No location data'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
