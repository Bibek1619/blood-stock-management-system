import { QrCode } from "lucide-react";
import type { Certificate } from "@/lib/data-store";

/* ─────────────────────────────────────────────
   Responsive preview shown in the dialog
───────────────────────────────────────────── */
export function CertificatePreview({ cert }: { cert: Certificate }) {
  return (
    <div
      className="relative bg-white border-[3px] border-[#8b0000] shadow-2xl w-full aspect-[1.414/1]"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif", WebkitPrintColorAdjust: "exact"}}
    >
      <CornerDecorations size={110} />
      <Watermark />
      <div className="relative z-[2] px-[8%] py-8">
        <p className="text-center text-[13px] text-[#1a5fa8] italic mb-4 tracking-wide">
          रक्तदान गर्नका लागि ०१-४२३४५६७८
        </p>
        <div className="flex items-center justify-center gap-5 mb-4">
          <RedCrossLogo size={64} />
          <div className="text-[clamp(28px,4vw,46px)] font-bold text-[#c0001a] leading-tight">
            नेपाल रेडक्रस सोसाइटी
          </div>
        </div>
        <div className="flex justify-center items-center gap-8 my-5">
          <div
            className="bg-[#c0001a] text-[#f7e650] font-bold px-[5%] py-3 tracking-wide text-[clamp(18px,2.5vw,28px)]"
            style={{ clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%)" }}
          >
            प्रशंसा-पत्र
          </div>
          <BloodDrop />
        </div>
        <div className="w-full h-[1.5px] bg-[#c0001a] opacity-30 my-5" />
        <div className="text-center text-[clamp(13px,1.6vw,17px)] text-[#1a1a1a] leading-[2] px-[4%] my-6">
          <CertBody cert={cert} nameSize="clamp(15px,2vw,20px)" />
        </div>
        <div className="flex justify-between px-[6%] mt-10 mb-6">
          {SIGS.map((sig) => (
            <div key={sig.title} className="text-center w-[28%]">
              <span className="block text-[11px] text-gray-400 mb-2 tracking-[2px]">................</span>
              <div className="border-t-[1.5px] border-gray-500 w-4/5 mx-auto mb-2" />
              <span className="block text-[clamp(11px,1.2vw,14px)] font-bold text-gray-900">{sig.title}</span>
              <span className="block text-[clamp(10px,1vw,12px)] text-gray-600">{sig.sub}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-[12px] text-gray-500 pb-5">
          मिति: {cert.date} | प्रमाणपत्र नं: {cert.id.toUpperCase()}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */
const SIGS = [
  { title: "निर्देशक", sub: "केन्द्रीय रकचार सेवा" },
  { title: "सभापति", sub: "केन्द्रीय रकचार सेवा" },
  { title: "अध्यक्ष", sub: "केन्द्रीय रकचार सेवा" },
];

function CertBody({ cert, nameSize }: { cert: Certificate; nameSize: string }) {
  const red = { color: "#c0001a", fontWeight: "bold" as const };
  if (cert.type === "donation") {
    return (
      <p style={{ margin: 0 }}>
        रक्तदान जीवनदान भन्ने मूलमन्त्रलाई आत्मसात गर्दै{" "}
        <span style={red}>रक्तदान कार्यक्रम</span> आयोजना गरी स्वस्थ{" "}
        <span style={red}>रगत संकलन कार्यमा रक्त सञ्चार सेवा</span> बुटवल/इकाई सिद्धार्थनगर लाई
        भरमद्दत पुर्‍याउने सहयोगी{" "}
        <span style={{ ...red, fontSize: nameSize }}>{cert.recipientName}</span>{" "}
        ले रक्तदान गरी सहयोग पुर्‍याउनु भएको हुँदा भविष्यमा निरन्तर सहयोग प्राप्त हुने पूर्ण अपेक्षा गर्दै
        उत्तरोत्तर प्रगतिको मंगलमय शुभकामना सहित स-सम्मान यो{" "}
        <span style={red}>प्रशंसा-पत्र</span> प्रदान गरिएको छ ।
      </p>
    );
  }
  return (
    <p style={{ margin: 0 }}>
      रक्तदान जीवनदान भन्ने मूलमन्त्रलाई आत्मसात गर्दै{" "}
      <span style={red}>{cert.eventTitle}</span> कार्यक्रममा स्वयंसेवकको रूपमा{" "}
      <span style={red}>रगत संकलन कार्यमा रक्त सञ्चार सेवा</span> लाई भरमद्दत पुर्‍याउने सहयोगी{" "}
      <span style={{ ...red, fontSize: nameSize }}>{cert.recipientName}</span>{" "}
      ले स्वयंसेवा गरी सहयोग पुर्‍याउनु भएको हुँदा भविष्यमा निरन्तर सहयोग प्राप्त हुने पूर्ण
      अपेक्षा गर्दै उत्तरोत्तर प्रगतिको मंगलमय शुभकामना सहित स-सम्मान यो{" "}
      <span style={red}>प्रशंसा-पत्र</span> प्रदान गरिएको छ ।
    </p>
  );
}

function CornerDecorations({ size }: { size: number }) {
  const s = `${size}px`;
  return (
    <>
      <svg className="absolute top-0 left-0" style={{ width: s, height: s }} viewBox="0 0 100 100">
        <polygon points="0,0 85,0 0,85" fill="#c0001a" /><polygon points="0,0 55,0 0,55" fill="#e8003a" opacity={0.45} />
      </svg>
      <svg className="absolute top-0 right-0" style={{ width: s, height: s }} viewBox="0 0 100 100">
        <polygon points="100,0 15,0 100,85" fill="#c0001a" /><polygon points="100,0 45,0 100,55" fill="#e8003a" opacity={0.45} />
      </svg>
      <svg className="absolute bottom-0 left-0" style={{ width: s, height: s }} viewBox="0 0 100 100">
        <polygon points="0,100 85,100 0,15" fill="#c0001a" /><polygon points="0,100 55,100 0,45" fill="#e8003a" opacity={0.45} />
      </svg>
      <svg className="absolute bottom-0 right-0" style={{ width: s, height: s }} viewBox="0 0 100 100">
        <polygon points="100,100 15,100 100,15" fill="#c0001a" /><polygon points="100,100 45,100 100,45" fill="#e8003a" opacity={0.45} />
      </svg>
    </>
  );
}

function Watermark() {
  return (
    <svg
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: 220, height: 270, opacity: 0.03, zIndex: 1 }}
      viewBox="0 0 220 270"
    >
      <path d="M110 10 C110 10, 20 120, 20 175 A90 90 0 0 0 200 175 C200 120 110 10 110 10Z" fill="#c0001a" />
    </svg>
  );
}

function RedCrossLogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 68 68" fill="none">
      <rect width="68" height="68" rx="8" fill="#c0001a" />
      <rect x="26" y="10" width="16" height="48" fill="white" />
      <rect x="10" y="26" width="48" height="16" fill="white" />
    </svg>
  );
}

function BloodDrop() {
  return (
    <svg width="48" height="62" viewBox="0 0 50 65">
      <path d="M25 4 C25 4, 4 30, 4 44 A21 21 0 0 0 46 44 C46 30 25 4 25 4Z" fill="#c0001a" />
      <ellipse cx="30" cy="28" rx="5" ry="8" fill="white" opacity={0.28} transform="rotate(-30 30 28)" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   ID Card - Preview (with Tailwind)
───────────────────────────────────────────── */
export function IDCardPreview({ cert }: { cert: Certificate }) {
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
              {cert.volunteerId || "VOL-2026-XXX"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-4 bg-slate-50 rounded-lg border border-slate-200">
          <QrCode className="h-20 w-20 text-slate-400" />
        </div>
        <div className="text-center space-y-1 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">जारी मिति: {cert.date}</p>
          <p className="text-xs text-slate-400">स्वयंसेवक गतिविधिका लागि मान्य</p>
        </div>
      </div>
    </div>
  );
}