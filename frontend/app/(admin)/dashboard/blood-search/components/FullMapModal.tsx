import { X, Navigation } from "lucide-react";

interface FullMapModalProps {
  isOpen: boolean;
  mapRef: React.RefObject<HTMLDivElement | null>;
  filteredCount: number;
  onClose: () => void;
}

export function FullMapModal({ isOpen, mapRef, filteredCount, onClose }: FullMapModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
              <Navigation size={16} className="text-red-800" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Full Map View</h3>
              <p className="text-xs text-slate-500">{filteredCount} donors shown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
