'use client';

import { useState } from "react";
import { useData } from "@/lib/data-store";
import { CertificatePreview, IDCardPreview } from "@/lib/certificate-preview";
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
import type { Certificate } from "@/lib/data-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CertificatesPage() {
    const { certificates, addCertificate, donors, events } = useData();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
    const [previewType, setPreviewType] = useState<"certificate" | "idcard">("certificate");

    const [newCert, setNewCert] = useState({
        type: "donation" as Certificate["type"],
        recipientId: "",
        recipientName: "",
        eventTitle: "",
        date: "",
        volunteerId: "",
    });

    const handleCreate = () => {
        if (!newCert.recipientName || !newCert.date) {
            toast.error("Recipient name and date are required");
            return;
        }
        const volId =
            newCert.type === "volunteer"
                ? `VOL-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, "0")}`
                : undefined;
        addCertificate({ ...newCert, volunteerId: volId });
        setDialogOpen(false);
        setNewCert({ type: "donation", recipientId: "", recipientName: "", eventTitle: "", date: "", volunteerId: "" });
        toast.success("Certificate created successfully");
    };

    const handleDonorSelect = (donorId: string) => {
        const donor = donors.find((d) => d.id === donorId);
        if (donor) setNewCert({ ...newCert, recipientId: donorId, recipientName: donor.name });
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
                                    <Select value={newCert.type} onValueChange={(v) => setNewCert({ ...newCert, type: v as Certificate["type"] })}>
                                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="donation">Donation Certificate</SelectItem>
                                            <SelectItem value="volunteer">Volunteer Certificate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold text-slate-700">Recipient</Label>
                                    <Select value={newCert.recipientId} onValueChange={handleDonorSelect}>
                                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select donor/volunteer" /></SelectTrigger>
                                        <SelectContent>
                                            {donors.map((d) => (
                                                <SelectItem key={d.id} value={d.id}>{d.name} ({d.bloodGroup})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {newCert.type === "volunteer" && (
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
                                <Button onClick={handleCreate} className="w-full bg-red-800 hover:bg-red-900">
                                    Generate Certificate
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
                                    {certificates.length === 0 ? (
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
                                                        variant={c.type === "donation" ? "default" : "secondary"}
                                                        className={`text-xs ${c.type === "donation" ? "bg-red-100 text-red-800 border-red-200" : "bg-blue-100 text-blue-800 border-blue-200"}`}
                                                    >
                                                        {c.type === "donation" ? "Donation" : "Volunteer"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600 hidden md:table-cell">{c.eventTitle || "—"}</TableCell>
                                                <TableCell className="text-xs text-slate-600">{c.date}</TableCell>
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
                                                        {c.type === "volunteer" && (
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
                       // In CertificatesPage.tsx — replace the print button
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