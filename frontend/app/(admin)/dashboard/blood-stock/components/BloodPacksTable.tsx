import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";

// Blood group mapping from DB format to display format
const bloodGroupMap: Record<string, string> = {
  'A_POSITIVE': 'A+',
  'A_NEGATIVE': 'A-',
  'B_POSITIVE': 'B+',
  'B_NEGATIVE': 'B-',
  'AB_POSITIVE': 'AB+',
  'AB_NEGATIVE': 'AB-',
  'O_POSITIVE': 'O+',
  'O_NEGATIVE': 'O-',
};

// Status configuration
const PACK_STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  AVAILABLE: { bg: 'rgba(34, 197, 94, 0.08)', text: '#16a34a', border: 'rgba(34, 197, 94, 0.2)', dot: '#22c55e' },
  USED: { bg: 'rgba(100, 116, 139, 0.08)', text: '#475569', border: 'rgba(100, 116, 139, 0.2)', dot: '#64748b' },
  EXPIRED: { bg: 'rgba(239, 68, 68, 0.08)', text: '#dc2626', border: 'rgba(239, 68, 68, 0.2)', dot: '#ef4444' },
  RESERVED: { bg: 'rgba(59, 130, 246, 0.08)', text: '#2563eb', border: 'rgba(59, 130, 246, 0.2)', dot: '#3b82f6' },
};

// Collection type mapping
const collectionTypeMap: Record<string, { label: string; color: string }> = {
  'EVENT': { label: 'Event', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  'WEB_DONOR': { label: 'Web Donor', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  'ORGANIZATION_DONOR': { label: 'Organization', color: 'bg-green-100 text-green-700 border-green-200' },
};

interface BloodPack {
  id: string;
  packCode: string;
  bloodGroup: string;
  collectionDate: string;
  expiryDate: string;
  status: string;
  storageLocation?: string | null;
  donor?: {
    user?: {
      name?: string;
    };
  } | null;
}

interface PaginationInfo {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

interface BloodPacksTableProps {
  packs: BloodPack[];
  pagination?: PaginationInfo;
  onStatusUpdate: (id: string, status: string) => Promise<void>;
  onPageChange?: (page: number) => void;
}

export function BloodPacksTable({ packs, pagination, onStatusUpdate, onPageChange }: BloodPacksTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await onStatusUpdate(id, status);
    setOpenMenuId(null);
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pack Code</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Donor</TableHead>
            <TableHead>Collection Type</TableHead>
            <TableHead>Collected</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                No blood packs found. Click "Add Pack" to record a donation.
              </TableCell>
            </TableRow>
          ) : (
            packs.slice(0, 50).map((p) => {
              const displayGroup = bloodGroupMap[p.bloodGroup] || p.bloodGroup;
              const ss = PACK_STATUS_CONFIG[p.status] ?? PACK_STATUS_CONFIG.AVAILABLE;
              const collectionType = collectionTypeMap[p.storageLocation || ''] || { 
                label: p.storageLocation || 'N/A', 
                color: 'bg-gray-100 text-gray-700 border-gray-200' 
              };
              
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-600">{p.packCode}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-[rgba(127,29,29,0.08)] text-[#7F1D1D] border-[rgba(127,29,29,0.2)]">
                      {displayGroup}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {p.donor?.user?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${collectionType.color}`}>
                      {collectionType.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{formatDate(p.collectionDate)}</TableCell>
                  <TableCell className="text-xs">{formatDate(p.expiryDate)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className="gap-1.5"
                      style={{ background: ss.bg, color: ss.text, borderColor: ss.border }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ss.dot }} />
                      {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu open={openMenuId === p.id} onOpenChange={(open) => setOpenMenuId(open ? p.id : null)}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {p.status === "AVAILABLE" && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(p.id, "USED")}>
                              Mark Used
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(p.id, "EXPIRED")}>
                              Mark Expired
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(p.id, "RESERVED")}>
                              Mark Reserved
                            </DropdownMenuItem>
                          </>
                        )}
                        {p.status !== "AVAILABLE" && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(p.id, "AVAILABLE")}>
                            Mark Available
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {pagination && onPageChange && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={onPageChange}
        />
      )}
      {!pagination && (
        <div className="px-3.5 py-2.5 border-t text-xs text-slate-400">
          Showing {Math.min(packs.length, 50)} of {packs.length} packs
        </div>
      )}
    </Card>
  );
}
