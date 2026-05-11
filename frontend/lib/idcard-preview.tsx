import { QrCode } from "lucide-react";
import type { Certificate } from "@/lib/queries/certificates";

/* ─────────────────────────────────────────────
   ID Card - Preview (with Tailwind)
───────────────────────────────────────────── */
export function IDCardPreview({ cert }: { cert: Certificate | null }) {
  if (!cert) return null;
  
  return (
    <div
     className="border-2 border-slate-200 rounded-xl overflow-hidden w-full max-w-lg mx-auto shadow-xl"
      style={{ fontFamily: "Georgia, serif" }}
    >
      <div className="bg-gradient-to-r from-red-800 to-red-900 px-6 py-4 text-center">
        <p className="text-white font-bold text-lg tracking-wider">नेपाल रेडक्रस सोसाइटी</p>
        <p className="text-red-100 text-xs mt-1">स्वयंसेवक परिचय पत्र</p>
      </div>
      <div className="p-6 bg-white space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-red-50 border-2 border-red-200 flex items-center justify-center text-2xl font-bold text-red-800">
            {cert.recipientName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-base text-slate-900">{cert.recipientName}</p>
            <p className="text-sm text-slate-600">स्वयंसेवक</p>
            <p className="font-mono text-sm text-red-800 font-semibold mt-1">
              {cert.certificateNumber || "CERT-2026-XXX"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-4 bg-slate-50 rounded-lg border border-slate-200">
          <QrCode className="h-20 w-20 text-slate-400" />
        </div>
        <div className="text-center space-y-1 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">जारी मिति: {new Date(cert.issueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}</p>
          <p className="text-xs text-slate-400">स्वयंसेवक गतिविधिका लागि मान्य</p>
        </div>
      </div>
    </div>
  );
}
