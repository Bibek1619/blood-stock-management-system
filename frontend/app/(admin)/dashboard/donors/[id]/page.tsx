'use client';

import { useParams, useRouter } from 'next/navigation';
import { Loader2, XCircle } from 'lucide-react';
import { useDonor } from '@/lib/queries/donors';
import { useDonationsByUser } from '@/lib/queries/donations';
import { getCityCoordinates } from '@/lib/geocoding';
import { DonorProfile } from './components/types';
import { DonorProfileHeader } from './components/DonorProfileHeader';
import { DonorProfileSidebar } from './components/DonorProfileSidebar';
import { DonorProfileActivity } from './components/DonorProfileActivity';

type DonationLike = {
  donationDate: string;
  location?: string;
  donationType?: string;
};

function getRegistrationSource(user: DonorProfile['user'], donations: DonationLike[]) {
  if (user?.isVerified && donations && donations.length > 0) {
    const firstDonation = donations[donations.length - 1];
    const userCreatedAt = new Date(user.createdAt || '');
    const firstDonationDate = new Date(firstDonation.donationDate);

    if (userCreatedAt < firstDonationDate) {
      return { source: 'WEB', label: 'Registered through Website', icon: '🌐', color: 'text-green-600' };
    }
  }

  if (donations && donations.length > 0) {
    const firstDonation = donations[donations.length - 1];
    const location = firstDonation.location?.toUpperCase() || '';

    if (location.includes('EVENT') || firstDonation.donationType === 'EVENT') {
      return { source: 'EVENT', label: 'Registered at Event', icon: '📅', color: 'text-blue-600' };
    }

    if (location.includes('ORGANIZATION') || firstDonation.donationType === 'ORGANIZATION') {
      return { source: 'ORGANIZATION', label: 'Organization Donor', icon: '🏢', color: 'text-purple-600' };
    }

    return { source: 'WALK_IN', label: 'Registered at Main Office', icon: '🏥', color: 'text-orange-600' };
  }

  if (user?.isVerified) {
    return { source: 'WEB', label: 'Registered through Website', icon: '🌐', color: 'text-green-600' };
  }

  return { source: 'UNKNOWN', label: 'Registration Source Unknown', icon: '❓', color: 'text-slate-600' };
}

const formatBloodGroup = (bloodGroup: string): string => {
  const mapping: Record<string, string> = {
    A_POSITIVE: 'A+',
    A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+',
    B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+',
    O_NEGATIVE: 'O-',
  };

  return mapping[bloodGroup] || bloodGroup;
};

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
  const { data: donations } = useDonationsByUser(donor?.userId || '');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={48} className="animate-spin text-[#7F1D1D]" />
          <p className="text-sm text-slate-600">Loading donor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !donor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <XCircle size={48} className="mx-auto mb-3 text-red-600" />
          <h2 className="mb-2 text-xl font-bold text-slate-900">Donor Not Found</h2>
          <p className="mb-4 text-slate-600">The donor profile you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard/donors')}
            className="inline-flex items-center rounded-lg bg-[#7F1D1D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#991B1B]"
          >
            Back to Donors
          </button>
        </div>
      </div>
    );
  }

  const name = donor.user?.name || 'Unknown';
  const email = donor.user?.email || 'N/A';
  const phone = donor.user?.phone || 'N/A';
  const bloodGroup = formatBloodGroup(donor.bloodGroup);
  const age = donor.dateOfBirth ? calculateAge(donor.dateOfBirth) : null;
  const registrationInfo = getRegistrationSource(donor.user, (donations || []) as DonationLike[]);

  const typedDonor = donor as DonorProfile;
  const hasPreciseLocation = typeof typedDonor.latitude === 'number' && typeof typedDonor.longitude === 'number';
  let coordinates = hasPreciseLocation
    ? { lat: typedDonor.latitude as number, lng: typedDonor.longitude as number }
    : getCityCoordinates(typedDonor.city || typedDonor.location);

  if (coordinates && 'latitude' in coordinates) {
    coordinates = { lat: coordinates.latitude, lng: coordinates.longitude };
  }

  const hasLocation = !!coordinates;

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="w-full max-w-400 mx-auto px-3 pb-4 md:px-4">
        <DonorProfileHeader
          donor={typedDonor}
          name={name}
          bloodGroup={bloodGroup}
          age={age}
          registrationInfo={registrationInfo}
          onBack={() => router.push('/dashboard/donors')}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <DonorProfileSidebar
            donor={typedDonor}
            email={email}
            phone={phone}
            bloodGroup={bloodGroup}
            age={age}
          />
          <DonorProfileActivity
            donor={typedDonor}
            name={name}
            bloodGroup={bloodGroup}
            coordinates={coordinates}
            hasLocation={hasLocation}
            hasPreciseLocation={hasPreciseLocation}
          />
        </div>
      </div>
    </div>
  );
}