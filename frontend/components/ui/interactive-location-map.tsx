'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, X, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { geocodeLocationWithFallback } from '@/lib/geocoding';

interface InteractiveLocationMapProps {
  address: string;
  city: string;
  onLocationSelect: (lat: number, lng: number) => void;
  onAddressUpdate?: (address: string, city: string) => void; // New prop for reverse geocoding
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

export function InteractiveLocationMap({
  address,
  city,
  onLocationSelect,
  onAddressUpdate,
  onClose,
  initialLat,
  initialLng,
}: InteractiveLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  
  const [mapReady, setMapReady] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Load Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Inject Leaflet CSS if not already present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet JS if not already present
    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = () => setMapReady(true);
      document.head.appendChild(script);
    } else {
      setMapReady(true);
    }
  }, []);

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!onAddressUpdate) return;
    
    setIsReverseGeocoding(true);
    try {
      // Use Nominatim reverse geocoding API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&countrycodes=np`,
        {
          headers: {
            'User-Agent': 'BloodBankManagementSystem/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('🔄 Reverse geocoding result:', data);
        
        if (data && data.address) {
          // Extract address components
          const addr = data.address;
          
          // Build address string from components
          const addressParts = [];
          
          // Add house number and road
          if (addr.house_number) addressParts.push(addr.house_number);
          if (addr.road) addressParts.push(addr.road);
          
          // Add area/suburb/neighbourhood
          if (addr.suburb) addressParts.push(addr.suburb);
          else if (addr.neighbourhood) addressParts.push(addr.neighbourhood);
          else if (addr.quarter) addressParts.push(addr.quarter);
          
          // Get city
          let cityName = addr.city || addr.town || addr.village || addr.municipality || '';
          
          // If no specific city, try to extract from display_name
          if (!cityName && data.display_name) {
            const parts = data.display_name.split(',');
            // Look for Pokhara, Kathmandu, etc. in the display name
            for (const part of parts) {
              const trimmed = part.trim().toLowerCase();
              if (trimmed.includes('pokhara') || trimmed.includes('kathmandu') || 
                  trimmed.includes('lalitpur') || trimmed.includes('bhaktapur')) {
                cityName = part.trim();
                break;
              }
            }
          }
          
          const newAddress = addressParts.join(', ');
          
          console.log('📍 Extracted address:', { newAddress, cityName });
          
          // Update the form fields if we got meaningful data
          if (newAddress || cityName) {
            onAddressUpdate(
              newAddress || address, // Keep original if no new address found
              cityName || city       // Keep original if no city found
            );
          }
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const addMarker = (lat: number, lng: number) => {
    const L = leafletRef.current;
    if (!L || !mapObjRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      mapObjRef.current.removeLayer(markerRef.current);
    }

    // Create draggable marker with color based on confirmation status
    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: L.divIcon({
        className: "",
        html: `
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${isConfirmed ? '#059669' : '#7F1D1D'};
            border: 3px solid #fff;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: move;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    }).addTo(mapObjRef.current);

    // Handle marker drag
    marker.on('dragend', (e: any) => {
      const position = e.target.getLatLng();
      setCurrentCoords({ lat: position.lat, lng: position.lng });
      
      // Trigger reverse geocoding when user drags the pin
      reverseGeocode(position.lat, position.lng);
      
      // Auto-select coordinates when dragged
      onLocationSelect(position.lat, position.lng);
    });

    markerRef.current = marker;
    setCurrentCoords({ lat, lng });
  };

  // Initialize map
  useEffect(() => {
    // Wait for both map library and user location before initializing
    if (!mapReady || !mapRef.current || mapObjRef.current) return;

    const L = (window as any).L;
    leafletRef.current = L;

    // Default to Pokhara if no coordinates provided
    const defaultLat = initialLat || 28.2096;
    const defaultLng = initialLng || 83.9856;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([defaultLat, defaultLng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapObjRef.current = map;

    // Add initial marker
    addMarker(defaultLat, defaultLng);

    // Geocode the address if provided
    if (address && city) {
      geocodeAddress();
    }

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.remove();
        mapObjRef.current = null;
      }
    };
  }, [mapReady, address, city]);

  const geocodeAddress = async () => {
    if (!address || !city) return;

    setIsGeocoding(true);
    try {
      const fullAddress = `${address}, ${city}`;
      const coords = await geocodeLocationWithFallback(fullAddress);

      if (coords && mapObjRef.current) {
        // Move map to geocoded location
        mapObjRef.current.setView([coords.lat, coords.lng], 16);
        
        // Add marker at geocoded location
        addMarker(coords.lat, coords.lng);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleConfirmLocation = () => {
    if (currentCoords) {
      onLocationSelect(currentCoords.lat, currentCoords.lng);
      setIsConfirmed(true);
      
      // Update marker color to green
      addMarker(currentCoords.lat, currentCoords.lng);
    }
  };

  const handleRecenter = () => {
    if (address && city) {
      geocodeAddress();
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#7F1D1D]" />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {isConfirmed ? 'Location Confirmed' : 'Select Precise Location'}
            </p>
            <p className="text-xs text-slate-600">
              {isGeocoding ? 'Finding location...' : 
               isReverseGeocoding ? 'Updating address...' :
               isConfirmed ? 'Pin confirmed at selected location' :
               'Drag the pin to exact spot'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {address && city && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRecenter}
              disabled={isGeocoding}
              className="gap-1"
            >
              <Navigation size={12} />
              Recenter
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="gap-1"
          >
            <X size={12} />
            Close
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <div ref={mapRef} className="h-[300px] w-full" />
        
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-[#7F1D1D] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-600">Loading map...</p>
            </div>
          </div>
        )}

        {(isGeocoding || isReverseGeocoding) && (
          <div className="absolute top-2 left-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-[#7F1D1D] rounded-full animate-spin" />
              <span className="text-sm text-slate-600">
                {isGeocoding ? 'Finding location...' : 'Updating address...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-slate-100 bg-slate-50">
        <div className="text-xs text-slate-600">
          {currentCoords ? (
            <span>
              📍 {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
            </span>
          ) : (
            <span>Drag the pin to select location</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isConfirmed && (
            <Button
              type="button"
              onClick={handleConfirmLocation}
              disabled={!currentCoords}
              className="bg-[#7F1D1D] hover:bg-[#991B1B] text-white"
              size="sm"
            >
              Confirm Location
            </Button>
          )}
          {isConfirmed && (
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Location Confirmed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}