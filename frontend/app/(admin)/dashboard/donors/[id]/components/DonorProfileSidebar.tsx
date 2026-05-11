import { Activity, Calendar, CheckCircle, Heart, Mail, MapPin, Phone, Weight, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DonorProfile } from "./types";

interface DonorProfileSidebarProps {
  donor: DonorProfile;
  email: string;
  phone: string;
  bloodGroup: string;
  age: number | null;
}

export function DonorProfileSidebar({ donor, email, phone, bloodGroup, age }: DonorProfileSidebarProps) {
  return (
    <div className="space-y-5 lg:col-span-1">
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="px-4 pb-3 pt-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7F1D1D]/10">
              <Phone className="h-3.5 w-3.5 text-[#7F1D1D]" />
            </div>
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 px-4 pb-4">
          <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 transition-colors hover:border-slate-200">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-xs font-medium text-slate-500">Email Address</p>
              <p className="truncate text-sm font-medium text-slate-900">{email}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 transition-colors hover:border-slate-200">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
            <div className="flex-1">
              <p className="mb-0.5 text-xs font-medium text-slate-500">Phone Number</p>
              <p className="text-sm font-medium text-slate-900">{phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 transition-colors hover:border-slate-200">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
            <div className="flex-1">
              <p className="mb-0.5 text-xs font-medium text-slate-500">Address</p>
              <p className="text-sm font-medium text-slate-900">{donor.address || "N/A"}</p>
              {donor.city && <p className="mt-0.5 text-xs text-slate-600">{donor.city}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="px-4 pb-3 pt-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7F1D1D]/10">
              <Activity className="h-3.5 w-3.5 text-[#7F1D1D]" />
            </div>
            Health Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 px-4 pb-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5">
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Weight</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">{donor.weight ? `${donor.weight} kg` : "N/A"}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Blood Group</span>
            </div>
            <Badge variant="outline" className="border-[#7F1D1D]/30 font-bold text-[#7F1D1D]">
              {bloodGroup}
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Eligible to Donate</span>
            </div>
            {donor.isEligible ? (
              <Badge className="bg-green-500 text-xs hover:bg-green-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                Yes
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <XCircle className="mr-1 h-3 w-3" />
                No
              </Badge>
            )}
          </div>
          {age && (
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Age</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{age} years</span>
            </div>
          )}
          {donor.lastDonationDate && (
            <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Last Donation</span>
              </div>
              <span className="text-xs font-semibold text-blue-900">
                {new Date(donor.lastDonationDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
