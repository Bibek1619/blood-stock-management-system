'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDonor } from '@/lib/queries/donors';
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

  // Get coordinates - use donor's coordinates or fallback to city-based coordinates
  const coordinates = donor.latitude && donor.longitude
    ? { lat: donor.latitude, lng: donor.longitude }
    : getCityCoordinates(donor.city || donor.location);

  const hasLocation = !!coordinates;

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8">
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
                <BreadcrumbLink href="/dashboard/donors">Donors</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/donors')}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back to Donors
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6 border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#7F1D1D] to-[#991B1B] px-6 py-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{name}</h1>
                  {isVerified && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <Droplets size={16} />
                    <span className="font-semibold">{bloodGroup}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{donor.city || donor.location || 'N/A'}</span>
                  </div>
                  {age && (
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{age} years old</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm mb-1">Total Donations</div>
                <div className="text-4xl font-bold text-white">{donor.totalDonations}</div>
                <div className="text-white/80 text-xs">
                  {donor.totalDonations * 3} lives impacted
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact & Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#7F1D1D]" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Mail className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Phone className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">Address</p>
                    <p className="text-sm font-medium text-slate-900">
                      {donor.address || 'N/A'}
                    </p>
                    {donor.city && (
                      <p className="text-xs text-slate-600 mt-1">{donor.city}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#7F1D1D]" />
                  Health Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Weight className="h-5 w-5 text-slate-600" />
                    <span className="text-sm text-slate-700">Weight</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {donor.weight ? `${donor.weight} kg` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-slate-600" />
                    <span className="text-sm text-slate-700">Blood Group</span>
                  </div>
                  <Badge variant="outline" className="font-bold">
                    {bloodGroup}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-slate-600" />
                    <span className="text-sm text-slate-700">Eligible to Donate</span>
                  </div>
                  {donor.isEligible ? (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      No
                    </Badge>
                  )}
                </div>
                {age && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-slate-600" />
                      <span className="text-sm text-slate-700">Age</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{age} years</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Donation History & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Donation Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Donations</p>
                      <p className="text-3xl font-bold text-[#7F1D1D]">{donor.totalDonations}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Droplets className="h-6 w-6 text-[#7F1D1D]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Blood Donated</p>
                      <p className="text-3xl font-bold text-[#7F1D1D]">
                        {donor.totalDonations * 450}
                        <span className="text-lg ml-1">ml</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-[#7F1D1D]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Lives Impacted</p>
                      <p className="text-3xl font-bold text-[#7F1D1D]">
                        {donor.totalDonations * 3}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-[#7F1D1D]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Donation History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#7F1D1D]" />
                  Donation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Last Donation</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {donor.lastDonationDate
                          ? new Date(donor.lastDonationDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'No donations yet'}
                      </p>
                    </div>
                    <Badge variant="outline">{bloodGroup}</Badge>
                  </div>

                  {donor.totalDonations === 0 && (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-600">No donation history yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#7F1D1D]" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasLocation && coordinates ? (
                  <div className="relative">
                    <DonorMap
                      latitude={coordinates.lat}
                      longitude={coordinates.lng}
                      donorName={name}
                      bloodGroup={bloodGroup}
                    />
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      📍 {donor.city || donor.location || 'Location'}
                      {!donor.latitude && ' (Approximate location based on city)'}
                    </p>
                  </div>
                ) : (
                  <div className="h-[300px] bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-600">Location not available</p>
                      <p className="text-xs text-slate-500 mt-1">
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
