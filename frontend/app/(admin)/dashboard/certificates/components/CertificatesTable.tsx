import { Award, CreditCard, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Certificate {
  id: string;
  recipientName: string;
  type: "DONATION" | "VOLUNTEER";
  eventTitle?: string;
  issueDate: string;
  volunteerId?: string;
}

interface CertificatesTableProps {
  certificates: Certificate[];
  isLoading: boolean;
  error: any;
  onPreviewCertificate: (cert: Certificate) => void;
  onPreviewIDCard: (cert: Certificate) => void;
}

export function CertificatesTable({
  certificates,
  isLoading,
  error,
  onPreviewCertificate,
  onPreviewIDCard,
}: CertificatesTableProps) {
  return (
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    Loading certificates...
                  </TableCell>
                </TableRow>
              ) : error ? (
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
                        className={`text-xs ${
                          c.type === "DONATION" 
                            ? "bg-red-100 text-red-800 border-red-200" 
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }`}
                      >
                        {c.type === "DONATION" ? "Donation" : "Volunteer"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 hidden md:table-cell">
                      {c.eventTitle || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {new Date(c.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 hidden md:table-cell">
                      {c.volunteerId || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost" 
                          size="sm"
                          className="text-xs h-8 hover:bg-red-50 hover:text-red-800"
                          onClick={() => onPreviewCertificate(c)}
                        >
                          <Award className="h-3 w-3 mr-1" />
                          Certificate
                        </Button>
                        {c.type === "VOLUNTEER" && (
                          <Button
                            variant="ghost" 
                            size="sm"
                            className="text-xs h-8 hover:bg-blue-50 hover:text-blue-800"
                            onClick={() => onPreviewIDCard(c)}
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            ID Card
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
  );
}
