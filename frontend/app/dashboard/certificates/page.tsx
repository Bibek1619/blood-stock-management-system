'use client';

import { useState } from "react";
import { useCertificates, useCreateCertificate } from "@/lib/queries/certificates";
import { useDonors } from "@/lib/queries/donors";
import { useEvents } from "@/lib/queries/events";
import { CertificatePreview } from "@/lib/certificate-preview";
import { IDCardPreview } from "@/lib/idcard-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Award, CreditCard, FileText, Home } from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CertificatesPage() {
    // Fetch data using TanStack Query
    const { data: certificates = [], isLoading: certificatesLoading, error: certificatesError } = useCertificates();
    const { data: donors = [], isLoading: donorsLoading } = useDonors();
    const { data: events = [] } = useEvents();
    const { mutate: createCertificate, isPending: isCreating } = useCreateCertificate();
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [previewCert, setPreviewCert] = useState<any | null>(null);
    const [previewType, setPreviewType] = useState<"certificate" | "idcard">("certificate");

    const [newCert, setNewCert] = useState({
        type: "DONATION" as "DONATION" | "VOLUNTEER",
        recipientId: "",
        recipientName: "",
        eventTitle: "",
        volunteerId: "",
        date: new Date().toISOString().split('T')[0], // Add date field with today's date as default
    });

    const handleCreate = () => {
        console.log('Form data before validation:', newCert);
        
        if (!newCert.recipientName.trim()) {
            toast.error("Recipient name is required");
            return;
        }
        
        if (!newCert.recipientId.trim()) {
            toast.error("Please select a recipient");
            return;
        }
        
        if (newCert.type === "VOLUNTEER" && !newCert.eventTitle.trim()) {
            toast.error("Event title is required for volunteer certificates");
            return;
        }
        
        // Generate certificate number
        const certNumber = newCert.type === "VOLUNTEER"
            ? `VOL-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, "0")}`
            : `DON-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, "0")}`;
        
        // Generate volunteer ID for volunteer certificates
        const volId = newCert.type === "VOLUNTEER"
            ? `VOL-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, "0")}`
            : undefined;

        // Create certificate data
        const certificateData = {
            certificateNumber: certNumber,
            type: newCert.type,
            userId: newCert.recipientId,
            recipientName: newCert.recipientName.trim(),
            eventTitle: newCert.eventTitle.trim() || undefined,
            volunteerId: volId,
        };

        console.log('Creating certificate with data:', certificateData);
        console.log('API URL:', process.env.NEXT_PUBLIC_BACKEND_URL);

        createCertificate(certificateData, {
            onSuccess: (data) => {
                console.log('Certificate created successfully:', data);
                setDialogOpen(false);
                setNewCert({ 
                    type: "DONATION", 
                    recipientId: "", 
                    recipientName: "", 
                    eventTitle: "", 
                    volunteerId: "",
                    date: new Date().toISOString().split('T')[0],
                });
                toast.success("Certificate created successfully!");
            },
            onError: (error: any) => {
                console.error('Certificate creation failed:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
                toast.error(error.message || "Failed to create certificate");
            }
        });
    };

    const handleDonorSelect = (donorId: string) => {
        console.log('Selecting donor with ID:', donorId);
        const donor = donors.find((d) => d.id === donorId);
        console.log('Found donor:', donor);
        if (donor && donor.user) {
            console.log('Setting recipient ID to user ID:', donor.user.id);
            setNewCert({ ...newCert, recipientId: donor.user.id, recipientName: donor.user.name });
        } else {
            console.error('Donor not found or donor has no user:', { donorId, donor });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* ── Breadcrumbs ── */}
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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Certificates & ID Cards</h1>
                        <p className="text-sm text-slate-600 mt-1">
                            Generate donation certificates and volunteer identification cards
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-red-800 hover:bg-red-900">
                                <Plus className="h-4 w-4 mr-2" />
                                Generate Certificate
                            </Button>
                        </DialogTrigger>
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
                                    <Select value={newCert.type} onValueChange={(v) => setNewCert({ ...newCert, type: v as "DONATION" | "VOLUNTEER" })}>
                                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DONATION">Donation Certificate</SelectItem>
                                            <SelectItem value="VOLUNTEER">Volunteer Certificate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold text-slate-700">Recipient</Label>
                                    <Select value={newCert.recipientId} onValueChange={handleDonorSelect} disabled={donorsLoading}>
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder={donorsLoading ? "Loading donors..." : "Select donor/volunteer"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {donors.map((d) => (
                                                <SelectItem key={d.id} value={d.id}>{d.user?.name || 'Unknown'} ({d.bloodGroup})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {newCert.type === "VOLUNTEER" && (
                                    <div>
                                        <Label className="text-sm font-semibold text-slate-700">Event</Label>
                                        <Select value={newCert.eventTitle} onValueChange={(v) => setNewCert({ ...newCert, eventTitle: v })}>
                                            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select event" /></SelectTrigger>
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
                                    <Input type="date" value={newCert.date} onChange={(e) => setNewCert({ ...newCert, date: e.target.value })} className="mt-1.5" />
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
                </div>

                {/* Certificates Table */}
                <Card className="border border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                                <FileText size={16} className="text-red-800" />
                            </div>
                            <CardTitle className="text-base">All Certificates</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-xs font-semibold">Recipient</TableHead>
                                        <TableHead className="text-xs font-semibold">Type</TableHead>
                                        <TableHead className="text-xs font-semibold hidden md:table-cell">Event</TableHead>
                                        <TableHead className="text-xs font-semibold">Date</TableHead>
                                        <TableHead className="text-xs font-semibold hidden md:table-cell">Volunteer ID</TableHead>
                                        <TableHead className="text-xs font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {certificatesLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                                Loading certificates...
                                            </TableCell>
                                        </TableRow>
                                    ) : certificatesError ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-red-500">
                                                Error loading certificates. Please try again.
                                            </TableCell>
                                        </TableRow>
                                    ) : certificates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                                No certificates generated yet. Click "Generate Certificate" to create one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        certificates.map((c) => (
                                            <TableRow key={c.id} className="text-sm">
                                                <TableCell className="font-medium text-slate-900">{c.recipientName}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={c.type === "DONATION" ? "default" : "secondary"}
                                                        className={`text-xs ${c.type === "DONATION" ? "bg-red-100 text-red-800 border-red-200" : "bg-blue-100 text-blue-800 border-blue-200"}`}
                                                    >
                                                        {c.type === "DONATION" ? "Donation" : "Volunteer"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600 hidden md:table-cell">{c.eventTitle || "—"}</TableCell>
                                                <TableCell className="text-xs text-slate-600">
                                                    {new Date(c.issueDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-slate-600 hidden md:table-cell">{c.volunteerId || "—"}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost" size="sm"
                                                            className="text-xs h-8 hover:bg-red-50 hover:text-red-800"
                                                            onClick={() => { setPreviewCert(c); setPreviewType("certificate"); }}
                                                        >
                                                            <Award className="h-3 w-3 mr-1" />Certificate
                                                        </Button>
                                                        {c.type === "VOLUNTEER" && (
                                                            <Button
                                                                variant="ghost" size="sm"
                                                                className="text-xs h-8 hover:bg-blue-50 hover:text-blue-800"
                                                                onClick={() => { setPreviewCert(c); setPreviewType("idcard"); }}
                                                            >
                                                                <CreditCard className="h-3 w-3 mr-1" />ID Card
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Dialog */}
                <Dialog open={!!previewCert} onOpenChange={(open) => !open && setPreviewCert(null)}>
                    <DialogContent
                        className="!w-[95vw] !max-w-none h-[90vh] overflow-y-auto print:overflow-visible print:h-auto"
                    >
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
                            <Button onClick={() => {
                                // Briefly move certificate outside the dialog portal before printing
                                const el = document.getElementById('print-area');
                                if (el) {
                                    document.body.appendChild(el); // reparent to body directly
                                }
                                setTimeout(() => window.print(), 50);
                            }}>
                                Print Certificate
                            </Button>
                        </div>
                       
                        <div id="print-area">
                            <div className="print-container">
                                {previewType === "certificate" ? (
                                    <CertificatePreview cert={previewCert} />
                                ) : (
                                    <IDCardPreview cert={previewCert} />
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}