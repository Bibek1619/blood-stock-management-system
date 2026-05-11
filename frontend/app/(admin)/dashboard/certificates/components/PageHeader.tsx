import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  onGenerateClick: () => void;
}

export function PageHeader({ onGenerateClick }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Certificates & ID Cards</h1>
        <p className="text-sm text-slate-600 mt-1">
          Generate donation certificates and volunteer identification cards
        </p>
      </div>
      <Button className="bg-red-800 hover:bg-red-900" onClick={onGenerateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Generate Certificate
      </Button>
    </div>
  );
}
