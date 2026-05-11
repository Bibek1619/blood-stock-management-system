'use client';

import { useState } from "react";
import { useCertificates, useCreateCertificate } from "@/lib/queries/certificates";
import { useDonors } from "@/lib/queries/donors";
import { useEvents } from "@/lib/queries/events";
import { Home } from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PageHeader,
  GenerateCertificateDialog,
  CertificatesTable,
  CertificatePreviewDialog,
  type CertificateFormData,
} from "./components";

export default function CertificatesPage() {
  // Fetch data using TanStack Query
  const { data: certificates = [], isLoading: certificatesLoading, error: certificatesError } = useCertificates();
  const { data: donors = [], isLoading: donorsLoading } = useDonors();
  const { data: events = [] } = useEvents();
  const { mutate: createCertificate, isPending: isCreating } = useCreateCertificate();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<any | null>(null);
  const [previewType, setPreviewType] = useState<"certificate" | "idcard">("certificate");

  const handleCreateCertificate = (formData: CertificateFormData) => {
    // Generate certificate number
    const certNumber = formData.type === "VOLUNTEER"
      ? `VOL-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, "0")}`
      : `DON-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, "0")}`;
    
    // Generate volunteer ID for volunteer certificates
    const volId = formData.type === "VOLUNTEER"
      ? `VOL-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, "0")}`
      : undefined;

    // Create certificate data
    const certificateData = {
      certificateNumber: certNumber,
      type: formData.type,
      userId: formData.recipientId,
      recipientName: formData.recipientName.trim(),
      eventTitle: formData.eventTitle.trim() || undefined,
      volunteerId: volId,
    };

    createCertificate(certificateData, {
      onSuccess: () => {
        setDialogOpen(false);
        toast.success("Certificate created successfully!");
      },
      onError: (error: any) => {
        console.error('Certificate creation failed:', error);
        toast.error(error.message || "Failed to create certificate");
      }
    });
  };

  const handlePreviewCertificate = (cert: any) => {
    setPreviewCert(cert);
    setPreviewType("certificate");
  };

  const handlePreviewIDCard = (cert: any) => {
    setPreviewCert(cert);
    setPreviewType("idcard");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                <Home size={14} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Certificates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <PageHeader onGenerateClick={() => setDialogOpen(true)} />

        {/* Generate Certificate Dialog */}
        <GenerateCertificateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          donors={donors}
          events={events}
          donorsLoading={donorsLoading}
          isCreating={isCreating}
          onCreateCertificate={handleCreateCertificate}
        />

        {/* Certificates Table */}
        <CertificatesTable
          certificates={certificates}
          isLoading={certificatesLoading}
          error={certificatesError}
          onPreviewCertificate={handlePreviewCertificate}
          onPreviewIDCard={handlePreviewIDCard}
        />

        {/* Certificate Preview Dialog */}
        <CertificatePreviewDialog
          certificate={previewCert}
          previewType={previewType}
          onClose={() => setPreviewCert(null)}
        />
      </div>
    </div>
  );
}
