import { QrCode } from "lucide-react";

/* ─────────────────────────────────────────────
   Volunteer ID Card - Preview Component
───────────────────────────────────────────── */
export function VolunteerIDCardPreview({ volunteer, eventTitle }: { 
  volunteer: any; 
  eventTitle: string;
}) {
  if (!volunteer) return null;
  
  const displayName = volunteer.user?.name || volunteer.name || "Unknown Volunteer";
  const displayEmail = volunteer.user?.email || volunteer.email || "";
  const displayPhone = volunteer.user?.phone || volunteer.phone || "";
  const displayAddress = volunteer.address || "";
  const displayRole = volunteer.role || "Volunteer";
  
  // Generate volunteer ID
  const volunteerId = `VOL-${new Date().getFullYear()}-${volunteer.id.slice(-6).toUpperCase()}`;
  
  return (
    <div
      className="border-2 border-slate-200 rounded-xl overflow-hidden w-full max-w-lg mx-auto shadow-xl bg-white"
      style={{ fontFamily: "Georgia, serif", width: "400px", height: "250px" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 px-4 py-3 text-center">
        <p className="text-white font-bold text-base tracking-wider">नेपाल रेडक्रस सोसाइटी</p>
        <p className="text-red-100 text-xs mt-0.5">स्वयंसेवक परिचय पत्र</p>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-12 w-12 rounded-lg bg-red-50 border-2 border-red-200 flex items-center justify-center text-lg font-bold text-red-800 flex-shrink-0">
            {displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          
          {/* Info */}
          <div className="text-left flex-1 min-w-0">
            <p className="font-bold text-sm text-slate-900 truncate">{displayName}</p>
            <p className="text-xs text-slate-600 truncate">{displayRole}</p>
            <p className="font-mono text-xs text-red-800 font-semibold">{volunteerId}</p>
          </div>
          
          {/* QR Code */}
          <div className="flex-shrink-0">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <QrCode className="h-8 w-8 text-slate-400" />
            </div>
          </div>
        </div>
        
        {/* Contact Details */}
        <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
          {displayEmail && <p className="truncate">📧 {displayEmail}</p>}
          {displayPhone && <p>📞 {displayPhone}</p>}
          {displayAddress && <p className="truncate">📍 {displayAddress}</p>}
        </div>
        
        {/* Event Info */}
        <div className="text-center space-y-1 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 truncate">Event: {eventTitle}</p>
          <p className="text-xs text-slate-400">स्वयंसेवक गतिविधिका लागि मान्य</p>
        </div>
      </div>
    </div>
  );
}