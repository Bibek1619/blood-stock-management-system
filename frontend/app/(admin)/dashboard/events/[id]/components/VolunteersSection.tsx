'use client';
import { useState } from "react";
import { Shield, UserPlus, X, CreditCard, Search } from "lucide-react";
import { VolunteerIDCardPreview } from "@/lib/volunteer-idcard-preview";

interface VolunteersSectionProps {
  event: any;
  onAddVolunteer: (data: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    role?: string;
  }) => Promise<void>;
  onRemoveVolunteer: (volunteerId: string) => Promise<void>;
}

export function VolunteersSection({ event, onAddVolunteer, onRemoveVolunteer }: VolunteersSectionProps) {
  const [addVolunteerOpen, setAddVolunteerOpen] = useState(false);
  const [volunteerForm, setVolunteerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
  });
  const [idCardPreviewOpen, setIdCardPreviewOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);

  const handleAddVolunteer = async () => {
    if (!volunteerForm.name || !volunteerForm.email || !volunteerForm.phone) {
      return;
    }

    await onAddVolunteer({
      name: volunteerForm.name,
      email: volunteerForm.email,
      phone: volunteerForm.phone,
      address: volunteerForm.address || undefined,
      role: volunteerForm.role || undefined,
    });
    
    setAddVolunteerOpen(false);
    setVolunteerForm({ name: "", email: "", phone: "", address: "", role: "" });
  };

  const handleViewIdCard = (volunteer: any) => {
    setSelectedVolunteer(volunteer);
    setIdCardPreviewOpen(true);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-red-800" />
            <h2 className="text-lg font-bold text-slate-900">Volunteers</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
              {event.volunteers?.length || 0}
            </span>
          </div>
          <button
            onClick={() => setAddVolunteerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <UserPlus size={14} /> Add
          </button>
        </div>

        <div className="space-y-2">
          {event.volunteers && event.volunteers.length > 0 ? (
            event.volunteers.map((volunteer: any) => {
              const displayName = volunteer.user?.name || volunteer.name || "Unknown";
              const displayEmail = volunteer.user?.email || volunteer.email || "";
              const displayPhone = volunteer.user?.phone || volunteer.phone || "";
              
              return (
                <div
                  key={volunteer.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                    {displayEmail && <p className="text-xs text-slate-600">{displayEmail}</p>}
                    {displayPhone && <p className="text-xs text-slate-600">{displayPhone}</p>}
                    {volunteer.role && (
                      <p className="text-xs text-slate-500 mt-0.5">Role: {volunteer.role}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewIdCard(volunteer)}
                      className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View ID Card"
                    >
                      <CreditCard size={14} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => onRemoveVolunteer(volunteer.id)}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                      title="Remove Volunteer"
                    >
                      <X size={14} className="text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No volunteers yet</p>
          )}
        </div>
      </div>

      {/* Add Volunteer Dialog */}
      {addVolunteerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4"
          onClick={() => setAddVolunteerOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                  <Shield size={16} className="text-red-800" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Add Volunteer</h2>
              </div>
              <button
                onClick={() => setAddVolunteerOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={volunteerForm.name}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={volunteerForm.email}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={volunteerForm.phone}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address</label>
                <input
                  type="text"
                  placeholder="Full address"
                  value={volunteerForm.address}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, address: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
                <input
                  type="text"
                  placeholder="e.g., Coordinator, Helper"
                  value={volunteerForm.role}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, role: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleAddVolunteer}
                disabled={!volunteerForm.name || !volunteerForm.email || !volunteerForm.phone}
                className="w-full bg-red-800 hover:bg-red-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Add Volunteer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Preview Dialog */}
      {idCardPreviewOpen && selectedVolunteer && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4"
          onClick={() => setIdCardPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <CreditCard size={16} className="text-blue-800" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Volunteer ID Card</h2>
              </div>
              <button
                onClick={() => setIdCardPreviewOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <VolunteerIDCardPreview 
                volunteer={selectedVolunteer} 
                eventTitle={event.title}
              />
              
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Print ID Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
