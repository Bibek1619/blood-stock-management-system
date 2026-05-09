'use client';
import { useState } from "react";
import { Users, UserPlus, X, Search } from "lucide-react";

interface ParticipantsSectionProps {
  event: any;
  users: any[];
  onAddParticipant: (userId: string) => Promise<void>;
  onRemoveParticipant: (participantId: string) => Promise<void>;
}

export function ParticipantsSection({ event, users, onAddParticipant, onRemoveParticipant }: ParticipantsSectionProps) {
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Filter users for search
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch)
  );

  const handleAddParticipant = async () => {
    if (!selectedUserId) {
      return;
    }

    await onAddParticipant(selectedUserId);
    setAddParticipantOpen(false);
    setSelectedUserId("");
    setUserSearch("");
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-red-800" />
            <h2 className="text-lg font-bold text-slate-900">Participants</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
              {event.participants?.length || 0}
            </span>
          </div>
          <button
            onClick={() => setAddParticipantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <UserPlus size={14} /> Add
          </button>
        </div>

        <div className="space-y-2">
          {event.participants && event.participants.length > 0 ? (
            event.participants.map((participant: any) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{participant.user.name}</p>
                  <p className="text-xs text-slate-600">{participant.user.email}</p>
                </div>
                <button
                  onClick={() => onRemoveParticipant(participant.id)}
                  className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X size={14} className="text-red-600" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No participants yet</p>
          )}
        </div>
      </div>

      {/* Add Participant Dialog */}
      {addParticipantOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4"
          onClick={() => setAddParticipantOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                  <Users size={16} className="text-red-800" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Add Participant</h2>
              </div>
              <button
                onClick={() => setAddParticipantOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Search User <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {userSearch && (
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setUserSearch(user.name);
                        }}
                        className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                      >
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-600">{user.email}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No users found</p>
                  )}
                </div>
              )}

              <button
                onClick={handleAddParticipant}
                disabled={!selectedUserId}
                className="w-full bg-red-800 hover:bg-red-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Add Participant
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
