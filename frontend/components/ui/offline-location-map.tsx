'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Button } from './button';

interface OfflineLocationMapProps {
  address: string;
  city: string;
  onLocationSelect: (lat: number, lng: number) => void;
  onAddressUpdate?: (address: string, city: string) => void;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

// Comprehensive Nepal city coordinates database
const NEPAL_CITIES: Record<string, { lat: number; lng: number; name: string }> = {
  // Major Cities
  'kathmandu': { lat: 27.7172, lng: 85.3240, name: 'Kathmandu' },
  'pokhara': { lat: 28.2096, lng: 83.9856, name: 'Pokhara' },
  'lalitpur': { lat: 27.6667, lng: 85.3167, name: 'Lalitpur' },
  'bhaktapur': { lat: 27.6710, lng: 85.4298, name: 'Bhaktapur' },
  'biratnagar': { lat: 26.4525, lng: 87.2718, name: 'Biratnagar' },
  'bharatpur': { lat: 27.6782, lng: 84.4351, name: 'Bharatpur' },
  'chitwan': { lat: 27.6782, lng: 84.4351, name: 'Chitwan' },
  'dharan': { lat: 26.8147, lng: 87.2798, name: 'Dharan' },
  'butwal': { lat: 27.7000, lng: 83.4486, name: 'Butwal' },
  'nepalgunj': { lat: 28.0500, lng: 81.6167, name: 'Nepalgunj' },
  'janakpur': { lat: 26.7288, lng: 85.9256, name: 'Janakpur' },
  'hetauda': { lat: 27.4281, lng: 85.0324, name: 'Hetauda' },
  'birgunj': { lat: 27.0104, lng: 84.8767, name: 'Birgunj' },
  'dhangadhi': { lat: 28.6833, lng: 80.6000, name: 'Dhangadhi' },
  'itahari': { lat: 26.6650, lng: 87.2718, name: 'Itahari' },
  
  // Additional Cities
  'gorkha': { lat: 28.0000, lng: 84.6333, name: 'Gorkha' },
  'baglung': { lat: 28.2667, lng: 83.5833, name: 'Baglung' },
  'tansen': { lat: 27.8667, lng: 83.5500, name: 'Tansen' },
  'dang': { lat: 28.0333, lng: 82.3000, name: 'Dang' },
  'tulsipur': { lat: 28.1333, lng: 82.2833, name: 'Tulsipur' },
  'kalaiya': { lat: 27.0333, lng: 85.0000, name: 'Kalaiya' },
  'siddharthanagar': { lat: 27.5000, lng: 83.4500, name: 'Siddharthanagar' },
  'mahendranagar': { lat: 28.9667, lng: 80.1833, name: 'Mahendranagar' },
  'tikapur': { lat: 28.5333, lng: 81.1167, name: 'Tikapur' },
  'rajbiraj': { lat: 26.5333, lng: 86.7333, name: 'Rajbiraj' },
  'lahan': { lat: 26.7167, lng: 86.5000, name: 'Lahan' },
  'siraha': { lat: 26.6667, lng: 86.2167, name: 'Siraha' },
  'gaur': { lat: 26.7667, lng: 85.2667, name: 'Gaur' },
  'malangwa': { lat: 26.8500, lng: 85.5667, name: 'Malangwa' },
  'triyuga': { lat: 26.7000, lng: 87.2000, name: 'Triyuga' },
  'damak': { lat: 26.6667, lng: 87.7000, name: 'Damak' },
  'mechinagar': { lat: 26.6500, lng: 87.9000, name: 'Mechinagar' },
  'birtamod': { lat: 26.6833, lng: 87.9167, name: 'Birtamod' },
  'urlabari': { lat: 26.6333, lng: 87.1333, name: 'Urlabari' },
  'inaruwa': { lat: 26.6000, lng: 87.0833, name: 'Inaruwa' },
  'khandbari': { lat: 27.3833, lng: 87.2000, name: 'Khandbari' },
  'bhojpur': { lat: 27.1667, lng: 87.0500, name: 'Bhojpur' },
  'diktel': { lat: 27.0833, lng: 86.7833, name: 'Diktel' },
  'okhaldhunga': { lat: 27.3167, lng: 86.5000, name: 'Okhaldhunga' },
  'charikot': { lat: 27.6833, lng: 86.1500, name: 'Charikot' },
  'jiri': { lat: 27.6333, lng: 86.2333, name: 'Jiri' },
  'sindhuli': { lat: 27.2500, lng: 85.9667, name: 'Sindhuli' },
  'kamalamai': { lat: 27.2667, lng: 85.5500, name: 'Kamalamai' },
  'manthali': { lat: 27.6000, lng: 86.0667, name: 'Manthali' },
  'dhulikhel': { lat: 27.6167, lng: 85.5500, name: 'Dhulikhel' },
  'banepa': { lat: 27.6333, lng: 85.5167, name: 'Banepa' },
  'panauti': { lat: 27.5833, lng: 85.5167, name: 'Panauti' },
  'madhyapur': { lat: 27.6833, lng: 85.4167, name: 'Madhyapur' },
  'kirtipur': { lat: 27.6667, lng: 85.2833, name: 'Kirtipur' },
  'tokha': { lat: 27.7833, lng: 85.3167, name: 'Tokha' },
  'budhanilkantha': { lat: 27.7833, lng: 85.4167, name: 'Budhanilkantha' },
  'tarakeshwar': { lat: 27.7167, lng: 85.2167, name: 'Tarakeshwar' },
  'dakshinkali': { lat: 27.6000, lng: 85.2833, name: 'Dakshinkali' },
  'nagarjun': { lat: 27.7333, lng: 85.2500, name: 'Nagarjun' },
  'kageshwari': { lat: 27.7500, lng: 85.3833, name: 'Kageshwari' },
  'gokarneshwar': { lat: 27.7667, lng: 85.4000, name: 'Gokarneshwar' },
  'changunarayan': { lat: 27.7167, lng: 85.4333, name: 'Changunarayan' },
  'suryabinayak': { lat: 27.6333, lng: 85.4500, name: 'Suryabinayak' },
  'mahalaxmi': { lat: 27.6500, lng: 85.3000, name: 'Mahalaxmi' },
  'godawari': { lat: 27.5833, lng: 85.3833, name: 'Godawari' },
  'konjyosom': { lat: 27.6167, lng: 85.3333, name: 'Konjyosom' },
  'bagmati': { lat: 27.6000, lng: 85.4333, name: 'Bagmati' },
};

export function OfflineLocationMap({
  address,
  city,
  onLocationSelect,
  onAddressUpdate,
  onClose,
  initialLat,
  initialLng,
}: OfflineLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  
  const [mapReady, setMapReady] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string>('');

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

  // Find city coordinates from our database
  const findCityCoordinates = (cityName: string) => {
    if (!cityName) return null;
    
    const normalizedCity = cityName.toLowerCase().trim();
    console.log('🔍 Looking for city:', normalizedCity);
    
    // Direct match
    if (NEPAL_CITIES[normalizedCity]) {
      console.log('✅ Direct match found:', NEPAL_CITIES[normalizedCity]);
      return NEPAL_CITIES[normalizedCity];
    }
    
    // Handle ward numbers (e.g., "Biratnagar-18" -> "biratnagar")
    const cityMatch = normalizedCity.match(/^([a-zA-Z\s]+)[-\s]*\d*$/);
    if (cityMatch) {
      const extractedCity = cityMatch[1].trim();
      if (NEPAL_CITIES[extractedCity]) {
        console.log('✅ Ward match found:', NEPAL_CITIES[extractedCity]);
        return NEPAL_CITIES[extractedCity];
      }
    }
    
    // Partial match
    for (const [key, coords] of Object.entries(NEPAL_CITIES)) {
      if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
        console.log('✅ Partial match found:', coords);
        return coords;
      }
    }
    
    console.log('❌ No city match found');
    return null;
  };

  // Reverse geocoding using our city database
  const offlineReverseGeocode = (lat: number, lng: number) => {
    console.log('🔄 Offline reverse geocoding for:', lat, lng);
    
    let closestCity = null;
    let minDistance = Infinity;
    
    // Find closest city
    for (const [key, cityData] of Object.entries(NEPAL_CITIES)) {
      const distance = Math.sqrt(
        Math.pow(lat - cityData.lat, 2) + Math.pow(lng - cityData.lng, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = { key, ...cityData, distance };
      }
    }
    
    if (closestCity && closestCity.distance < 0.1) { // Within ~11km
      console.log(`📍 Detected city: ${closestCity.name} (distance: ${closestCity.distance.toFixed(4)})`);
      setDetectedCity(closestCity.name);
      
      if (onAddressUpdate) {
        // Generate address based on existing input or use generic
        const newAddress = address && address.length > 3 ? address : `${closestCity.name} Area`;
        onAddressUpdate(newAddress, closestCity.name);
      }
    } else {
      console.log('📍 No nearby city detected');
      setDetectedCity('Unknown Location');
    }
  };

  const addMarker = (lat: number, lng: number) => {
    const L = leafletRef.current;
    if (!L || !mapObjRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      mapObjRef.current.removeLayer(markerRef.current);
    }

    // Create draggable marker
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
      const newCoords = { lat: position.lat, lng: position.lng };
      setCurrentCoords(newCoords);
      
      console.log('🖱️ Marker dragged to:', newCoords);
      
      // Trigger offline reverse geocoding
      offlineReverseGeocode(position.lat, position.lng);
      
      // Auto-select coordinates when dragged
      onLocationSelect(position.lat, position.lng);
      
      // Reset confirmation state
      setIsConfirmed(false);
    });

    // Handle marker click for confirmation
    marker.on('click', () => {
      if (currentCoords) {
        handleConfirmLocation();
      }
    });

    markerRef.current = marker;
    setCurrentCoords({ lat, lng });
    
    // Trigger reverse geocoding for initial position
    offlineReverseGeocode(lat, lng);
  };

  // Initialize map
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapObjRef.current) return;

    const L = (window as any).L;
    leafletRef.current = L;

    // Determine initial coordinates
    let defaultLat = initialLat || 28.2096; // Default to Pokhara
    let defaultLng = initialLng || 83.9856;

    // Try to use city coordinates if available
    if (city) {
      const cityCoords = findCityCoordinates(city);
      if (cityCoords) {
        defaultLat = cityCoords.lat;
        defaultLng = cityCoords.lng;
        console.log(`🗺️ Using city coordinates for ${city}:`, cityCoords);
      }
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([defaultLat, defaultLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapObjRef.current = map;

    // Add initial marker
    addMarker(defaultLat, defaultLng);

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.remove();
        mapObjRef.current = null;
      }
    };
  }, [mapReady]);

  // Update map when city changes
  useEffect(() => {
    if (!mapObjRef.current || !city) return;
    
    const cityCoords = findCityCoordinates(city);
    if (cityCoords) {
      console.log(`🗺️ Centering map on ${city}:`, cityCoords);
      mapObjRef.current.setView([cityCoords.lat, cityCoords.lng], 14);
      addMarker(cityCoords.lat, cityCoords.lng);
    }
  }, [city]);

  const handleConfirmLocation = () => {
    if (currentCoords) {
      onLocationSelect(currentCoords.lat, currentCoords.lng);
      setIsConfirmed(true);
      
      // Update marker color to green
      addMarker(currentCoords.lat, currentCoords.lng);
    }
  };

  const handleRecenter = () => {
    if (city) {
      const cityCoords = findCityCoordinates(city);
      if (cityCoords && mapObjRef.current) {
        mapObjRef.current.setView([cityCoords.lat, cityCoords.lng], 14);
        addMarker(cityCoords.lat, cityCoords.lng);
      }
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
              {isConfirmed ? 'Location Confirmed' : 'Select Organization Location'}
            </p>
            <p className="text-xs text-slate-600">
              {detectedCity ? `Detected: ${detectedCity}` : 'Drag the pin to exact location'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {city && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRecenter}
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

        {/* Show coordinates when available */}
        {currentCoords && (
          <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded z-10">
            📍 {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
          </div>
        )}

        {/* Show detected city */}
        {detectedCity && (
          <div className="absolute top-2 left-2 bg-white/90 border border-slate-200 rounded px-2 py-1 text-xs z-10">
            📍 {detectedCity}
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