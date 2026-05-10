'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, CalendarDays, MapPin, User, X, CheckCircle2 } from "lucide-react";

interface BloodCollectionSectionProps {
  event: any;
  eventId: string;
  eventDonations: any[];
}

export function BloodCollectionSection({ event, eventId, eventDonations }: BloodCollectionSectionProps) {
  const router = useRouter();
  const [donorSidebarOpen, setDonorSidebarOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  const handleViewDonorDetails = (donation: any) => {
    setSelectedDonation(donation);
    setDonorSidebarOpen(true);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-red-800" />
            <h2 className="text-lg font-bold text-slate-900">Blood Collection</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
              {eventDonations.length} donations
            </span>
          </div>
          {event.status === 'RUNNING' && (
            <button
              onClick={() => router.push(`/dashboard/blood-donate/blood-collection?eventId=${eventId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Droplets size={14} /> Add Blood
            </button>
          )}
        </div>

        {eventDonations.length > 0 ? (
          <div className="space-y-3">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-800">
                  {eventDonations.reduce((sum, donation) => sum + donation.units, 0)}
                </p>
                <p className="text-xs text-slate-600">Total Units</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-800">
                  {eventDonations.reduce((sum, donation) => sum + (donation.units * 450), 0)} ml
                </p>
                <p className="text-xs text-slate-600">Total Volume</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-800">{eventDonations.length}</p>
                <p className="text-xs text-slate-600">Donors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-800">
                  {new Set(eventDonations.map(d => d.bloodGroup)).size}
                </p>
                <p className="text-xs text-slate-600">Blood Types</p>
              </div>
            </div>

            {/* Blood Group Breakdown */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Blood Group Breakdown</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(
                  eventDonations.reduce((acc, donation) => {
                    const group = donation.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
                    acc[group] = (acc[group] || 0) + donation.units;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([bloodGroup, units]) => (
                  <div key={bloodGroup} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-sm font-bold text-red-800">{bloodGroup}</span>
                    <span className="text-xs text-slate-600">{String(units)} units</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donations List */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700">Blood Collection Details</h3>
              <div className="space-y-2">
                {eventDonations.slice(0, 10).map((donation) => {
                  const bloodGroupDisplay = donation.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
                  const donationDate = new Date(donation.donationDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  return (
                    <div
                      key={donation.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                        {/* Pack Code & Blood Group */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <Droplets size={14} className="text-red-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Pack Code</p>
                            <p className="font-mono text-xs text-slate-600 mb-1">
                              {donation.bloodPacks && donation.bloodPacks.length > 0 
                                ? donation.bloodPacks[0].packCode 
                                : 'N/A'
                              }
                            </p>
                            <span className="px-2 py-1 bg-red-50 text-red-800 border border-red-200 rounded text-xs font-bold">
                              {bloodGroupDisplay}
                            </span>
                          </div>
                        </div>

                        {/* Units */}
                        <div>
                          <p className="text-xs text-slate-500">Units</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {donation.units} unit{donation.units > 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Donor Name */}
                        <div>
                          <p className="text-xs text-slate-500">Donor</p>
                          <button
                            onClick={() => handleViewDonorDetails(donation)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                          >
                            {donation.user?.name || 'Anonymous Donor'}
                          </button>
                        </div>

                        {/* Collection Date */}
                        <div>
                          <p className="text-xs text-slate-500">Collection Date</p>
                          <p className="text-sm font-medium text-slate-900">
                            {donationDate}
                          </p>
                        </div>

                        {/* Storage Location */}
                        <div>
                          <p className="text-xs text-slate-500">Storage</p>
                          <p className="text-sm font-medium text-slate-900">
                            {donation.storageLocation || 'Main Storage'}
                          </p>
                        </div>

                        {/* Location */}
                        <div>
                          <p className="text-xs text-slate-500">Location</p>
                          <p className="text-sm font-medium text-slate-900">
                            {donation.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {eventDonations.length > 10 && (
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Showing 10 of {eventDonations.length} donations
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Droplets size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">No blood collected yet</p>
            <p className="text-xs text-slate-500 mb-4">
              {event.status === 'RUNNING' 
                ? 'Start collecting blood donations for this event'
                : 'Blood can only be collected when the event is running'
              }
            </p>
            {event.status === 'RUNNING' && (
              <button
                onClick={() => router.push(`/dashboard/blood-donate/blood-collection?eventId=${eventId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors mx-auto"
              >
                <Droplets size={14} /> Start Collecting Blood
              </button>
            )}
          </div>
        )}
      </div>

      {/* Donor Details Sidebar */}
      {donorSidebarOpen && selectedDonation && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDonorSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <User size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Donor Details</h2>
                    <p className="text-sm text-slate-600">Blood donation information</p>
                  </div>
                </div>
                <button
                  onClick={() => setDonorSidebarOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Donor Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Donor Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <User size={16} className="text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Full Name</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {selectedDonation.user?.name || 'Anonymous Donor'}
                        </p>
                      </div>
                    </div>

                    {selectedDonation.user?.phone && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <span className="text-slate-500 text-xs">📞</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Phone Number</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {selectedDonation.user.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedDonation.user?.email && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <span className="text-slate-500 text-xs">✉️</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Email Address</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {selectedDonation.user.email}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Donation Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Donation Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                      <Droplets size={16} className="text-red-600" />
                      <div>
                        <p className="text-xs text-red-600">Pack Code & Blood Group</p>
                        <p className="font-mono text-sm text-slate-600 mb-1">
                          {selectedDonation.bloodPacks && selectedDonation.bloodPacks.length > 0 
                            ? selectedDonation.bloodPacks[0].packCode 
                            : 'N/A'
                          }
                        </p>
                        <p className="text-lg font-bold text-red-800">
                          {selectedDonation.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <span className="text-slate-500 text-xs">🩸</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Units Collected</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {selectedDonation.units} unit{selectedDonation.units > 1 ? 's' : ''} ({selectedDonation.units * 450}ml)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <CalendarDays size={16} className="text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Collection Date</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {new Date(selectedDonation.donationDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <MapPin size={16} className="text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Collection Location</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {selectedDonation.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <span className="text-slate-500 text-xs">📦</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Pack Status</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {selectedDonation.bloodPacks && selectedDonation.bloodPacks.length > 0 
                            ? selectedDonation.bloodPacks[0].status.charAt(0) + selectedDonation.bloodPacks[0].status.slice(1).toLowerCase()
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <span className="text-slate-500 text-xs">🏥</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Storage Location</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {selectedDonation.storageLocation || 'Main Storage'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <span className="text-slate-500 text-xs">📋</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Donation Type</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {selectedDonation.donationType === 'PERSON' ? 'Individual Donor' : 'Organization'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle2 size={16} className="text-green-600" />
                      <div>
                        <p className="text-xs text-green-600">Status</p>
                        <p className="text-sm font-semibold text-green-800">
                          {selectedDonation.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                {selectedDonation.notes && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Notes</h3>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        {selectedDonation.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                {selectedDonation.contact && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Contact</h3>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedDonation.contact}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200">
                <button
                  onClick={() => setDonorSidebarOpen(false)}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
