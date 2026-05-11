import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface GenerateCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donors: any[] | { data: any[] };
  events: any[];
  donorsLoading: boolean;
  isCreating: boolean;
  onCreateCertificate: (data: CertificateFormData) => void;
}

export interface CertificateFormData {
  type: "DONATION" | "VOLUNTEER";
  recipientId: string;
  recipientName: string;
  eventTitle: string;
  volunteerId: string;
  date: string;
}

export function GenerateCertificateDialog({
  open,
  onOpenChange,
  donors,
  events,
  donorsLoading,
  isCreating,
  onCreateCertificate,
}: GenerateCertificateDialogProps) {
  const [formData, setFormData] = useState<CertificateFormData>({
    type: "DONATION",
    recipientId: "",
    recipientName: "",
    eventTitle: "",
    volunteerId: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleDonorSelect = (donorId: string) => {
    const donorsArray = Array.isArray(donors) ? donors : donors?.data || [];
    const donor = donorsArray.find((d) => d.id === donorId);
    if (donor && donor.user) {
      setFormData({ ...formData, recipientId: donor.user.id, recipientName: donor.user.name });
    }
  };

  const handleCreate = () => {
    if (!formData.recipientName.trim()) {
      toast.error("Recipient name is required");
      return;
    }
    
    if (!formData.recipientId.trim()) {
      toast.error("Please select a recipient");
      return;
    }
    
    if (formData.type === "VOLUNTEER" && !formData.eventTitle.trim()) {
      toast.error("Event title is required for volunteer certificates");
      return;
    }

    onCreateCertificate(formData);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        type: "DONATION",
        recipientId: "",
        recipientName: "",
        eventTitle: "",
        volunteerId: "",
        date: new Date().toISOString().split('T')[0],
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate New Certificate</DialogTitle>
          <DialogDescription>
            Create a donation certificate or volunteer ID card for a recipient
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-semibold text-slate-700">Certificate Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(v) => setFormData({ ...formData, type: v as "DONATION" | "VOLUNTEER" })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DONATION">Donation Certificate</SelectItem>
                <SelectItem value="VOLUNTEER">Volunteer Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-semibold text-slate-700">Recipient</Label>
            <Select 
              value={formData.recipientId} 
              onValueChange={handleDonorSelect} 
              disabled={donorsLoading}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={donorsLoading ? "Loading donors..." : "Select donor/volunteer"} />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(donors) ? donors : donors?.data || []).map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.user?.name || 'Unknown'} ({d.bloodGroup})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {formData.type === "VOLUNTEER" && (
            <div>
              <Label className="text-sm font-semibold text-slate-700">Event</Label>
              <Select 
                value={formData.eventTitle} 
                onValueChange={(v) => setFormData({ ...formData, eventTitle: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.title}>{e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-semibold text-slate-700">Date</Label>
            <Input 
              type="date" 
              value={formData.date} 
              onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
              className="mt-1.5" 
            />
          </div>
          
          <Button 
            onClick={handleCreate} 
            disabled={isCreating || donorsLoading}
            className="w-full bg-red-800 hover:bg-red-900 disabled:opacity-50"
          >
            {isCreating ? "Generating..." : "Generate Certificate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
