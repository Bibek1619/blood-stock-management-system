import { MapPin, Crosshair } from "lucide-react";

interface LocationStatusProps {
  locationError: string | null;
  userLocation: { lat: number; lng: number } | null;
}

export function LocationStatus({ locationError, userLocation }: LocationStatusProps) {
  if (locationError) {
    return (
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
        <MapPin size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">Location Access</p>
          <p className="text-xs text-yellow-700 mt-0.5">{locationError}</p>
        </div>
      </div>
    );
  }

  if (userLocation) {
    return (
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
        <Crosshair size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Your Location Detected</p>
          <p className="text-xs text-green-700 mt-0.5">
            Map is centered at your current location. Click "Use My Location" to search nearby donors.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
