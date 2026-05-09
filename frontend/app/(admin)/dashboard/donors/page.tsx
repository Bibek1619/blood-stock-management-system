'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDonors } from "@/lib/queries/donors";
import { DonorsHeader } from "./components/DonorsHeader";
import { DonorTabs } from "./components/DonorTabs";
import { DonorsFilters } from "./components/DonorsFilters";
import { DonorsTable } from "./components/DonorsTable";
import { Donor, DonorTab, ToastItem } from "./components/types";

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const add = (msg: string, type: ToastItem["type"] = "success") => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, msg, type }]);
    setTimeout(() => setToasts((currentToasts) => currentToasts.filter((item) => item.id !== id)), 3000);
  };
  return { toasts, toast: add };
}

const getTabFilteredDonors = (donors: Donor[], activeTab: DonorTab) => {
  switch (activeTab) {
    case "organization":
      return donors.filter((donor) => donor.donorType === "ORGANIZATION");
    case "unregistered":
      return donors.filter(
        (donor) => donor.user?.isVerified === false && donor.donorType !== "ORGANIZATION"
      );
    default:
      return donors;
  }
};

export default function DonorsPage() {
  const router = useRouter();
  const [filterGroup, setFilterGroup] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DonorTab>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { toasts, toast } = useToast();
  const pageLimit = 20;

  const { data, isLoading, error } = useDonors({}, currentPage, pageLimit);
  const donors = (Array.isArray(data) ? data : data?.data || []) as Donor[];
  const pagination = !Array.isArray(data) ? data?.pagination : undefined;

  if (error) {
    toast("Failed to load donors", "error");
  }

  const tabFilteredDonors = getTabFilteredDonors(donors, activeTab);
  const filteredDonors = tabFilteredDonors.filter((donor) => {
    if (filterGroup !== "all" && donor.bloodGroup !== filterGroup) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = donor.user?.name || "";
      const location = donor.location || "";
      const phone = donor.user?.phone || "";

      return (
        name.toLowerCase().includes(query) ||
        location.toLowerCase().includes(query) ||
        phone.includes(query)
      );
    }

    return true;
  });

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="w-full max-w-400 mx-auto p-6 md:p-8">
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-9999">
          {toasts.map((toastItem) => (
            <div
              key={toastItem.id}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium shadow-lg ${
                toastItem.type === "error"
                  ? "bg-red-50 border-red-300 text-[#7F1D1D]"
                  : "bg-green-50 border-green-300 text-green-800"
              }`}
            >
              {toastItem.msg}
            </div>
          ))}
        </div>

        <DonorsHeader isLoading={isLoading} totalCount={donors.length} />
        <DonorTabs
          activeTab={activeTab}
          allCount={donors.length}
          organizationCount={donors.filter((donor) => donor.donorType === "ORGANIZATION").length}
          unregisteredCount={donors.filter(
            (donor) => donor.user?.isVerified === false && donor.donorType !== "ORGANIZATION"
          ).length}
          onTabChange={setActiveTab}
        />
        <DonorsFilters
          filterGroup={filterGroup}
          onFilterGroupChange={setFilterGroup}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
        />
        <DonorsTable
          activeTab={activeTab}
          donors={filteredDonors}
          isLoading={isLoading}
          onCall={(name) => toast(`Calling ${name}…`, "info")}
          onEmail={(name) => toast(`Email sent to ${name}`, "info")}
          onPageChange={(page) => setCurrentPage(page)}
          onViewProfile={(donorId) => router.push(`/dashboard/donors/${donorId}`)}
          pagination={pagination}
          tabDonorsCount={tabFilteredDonors.length}
        />
      </div>
    </div>
  );
}
