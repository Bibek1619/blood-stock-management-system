import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CertificatePreview } from "@/lib/certificate-preview";
import { IDCardPreview } from "@/lib/idcard-preview";

interface CertificatePreviewDialogProps {
  certificate: any | null;
  previewType: "certificate" | "idcard";
  onClose: () => void;
}

export function CertificatePreviewDialog({
  certificate,
  previewType,
  onClose,
}: CertificatePreviewDialogProps) {
  const handlePrint = () => {
    // Briefly move certificate outside the dialog portal before printing
    const el = document.getElementById('print-area');
    if (el) {
      document.body.appendChild(el); // reparent to body directly
    }
    setTimeout(() => window.print(), 50);
  };

  return (
    <Dialog open={!!certificate} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!w-[95vw] !max-w-none h-[90vh] overflow-y-auto print:overflow-visible print:h-auto">
        <DialogHeader className="mb-4">
          <DialogTitle>
            {previewType === "certificate" ? "Certificate Preview" : "ID Card Preview"}
          </DialogTitle>
          <DialogDescription>
            {previewType === "certificate"
              ? "Preview and download the certificate as PDF"
              : "Preview and download the volunteer ID card as PDF"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="print:hidden mb-4">
          <Button onClick={handlePrint}>
            Print Certificate
          </Button>
        </div>
       
        <div id="print-area">
          <div className="print-container">
            {previewType === "certificate" ? (
              <CertificatePreview cert={certificate} />
            ) : (
              <IDCardPreview cert={certificate} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
