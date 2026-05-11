import type { Certificate } from "@/lib/queries/certificates";

/* ─────────────────────────────────────────────
   Certificate Preview Component
───────────────────────────────────────────── */
export function CertificatePreview({ cert }: { cert: Certificate | null }) {
  if (!cert) return null;
  
  return (
   <div
  style={{
    width: "1122px",
    height: "794px",
    background: "#ffffff",
    overflow: "hidden",
    pageBreakInside: "avoid",
    position:'relative'
  }}
>
      <CornerDecorations size={110} />
      <Watermark />
      <div className="relative z-[2] px-[8%] py-6">
        <p className="text-center text-[13px] text-[#1a5fa8] italic mb-4 tracking-wide">
          सम्पर्कका लागि: ०१-४२३४५६७८
        </p>

        <div className="flex items-center justify-center gap-5 mb-4">
          <RedCrossLogo size={64} />
          <div className="text-[clamp(28px,4vw,46px)] font-bold text-[#c0001a] leading-tight">
            Samarth Innovation and Technology
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
          मिति: {new Date(cert.issueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short', 
            day: 'numeric'
          })} {' | '} प्रमाणपत्र नं: {cert.certificateNumber}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */
const SIGS = [
  { title: "निर्देशक", sub: "Samarth Innovation and Technology" },
  { title: "सभापति", sub: "Samarth Innovation and Technology" },
  { title: "अध्यक्ष", sub: "Samarth Innovation and Technology" },
];

function CertBody({ cert, nameSize }: { cert: Certificate; nameSize: string }) {
  const red = { color: "#c0001a", fontWeight: "bold" as const };

  // Use the correct API structure
  const isVolunteer = cert.type === "VOLUNTEER";
  
  if (!isVolunteer) {
    return (
      <p style={{ margin: 0 }}>
        सामाजिक सेवाको भावनालाई आत्मसात गर्दै{" "}
        <span style={red}>रक्तदान कार्यक्रम</span> आयोजना गरी स्वस्थ{" "}
        <span style={red}>रगत संकलन कार्यमा Samarth Innovation and Technology</span> पोखरा इकाईलाई
        उत्कृष्ट सहयोग पुर्‍याउने सहयोगी{" "}
        <span style={{ ...red, fontSize: nameSize }}>{cert.recipientName}</span>{" "}
        ले रक्तदान गरी महत्वपूर्ण योगदान दिनुभएकोमा भविष्यमा निरन्तर सहयोगको अपेक्षा गर्दै
        उत्तरोत्तर प्रगतिको मंगलमय शुभकामना सहित स-सम्मान यो{" "}
        <span style={red}>प्रशंसा-पत्र</span> प्रदान गरिएको छ ।
      </p>
    );
  }

  return (
    <p style={{ margin: 0 }}>
      सामाजिक सेवाको भावनालाई आत्मसात गर्दै{" "}
      <span style={red}>{cert.eventTitle || "Event Name"}</span> कार्यक्रममा स्वयंसेवकको रूपमा{" "}
      <span style={red}>रगत संकलन कार्यमा Samarth Innovation and Technology</span> पोखरा इकाईलाई
      उत्कृष्ट सहयोग पुर्‍याउने सहयोगी{" "}
      <span style={{ ...red, fontSize: nameSize }}>{cert.recipientName}</span>{" "}
      ले स्वयंसेवा मार्फत महत्वपूर्ण योगदान दिनुभएकोमा भविष्यमा निरन्तर सहयोगको अपेक्षा गर्दै
      उत्तरोत्तर प्रगतिको मंगलमय शुभकामना सहित स-सम्मान यो{" "}
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