'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone, Bell, MapPin, Droplets, Search,
  Users, X, Navigation, Filter, Award, Calendar, ChevronRight, Home, User, Crosshair,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDonors } from "@/lib/queries/donors";
import { getCityCoordinates, getCoordinatesWithFallback } from "@/lib/geocoding";
import {
  BLOOD_GROUPS,
  LOW_STOCK_GROUPS,
  DEFAULT_MAP_CENTER,
  getInitials,
  getDonorTier,
  haversineKm,
  type BloodGroup,
} from "@/lib/data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ─── TOAST ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const add = (msg: string, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };
  return { toasts, toast: add };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BloodSearchPage() {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [locationQuery, setLocationQuery] = useState("");
  const [radius, setRadius] = useState<number>(5);
  const [clickedPos, setClickedPos] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeDonor, setActiveDonor] = useState<any | null>(null);
  const [sheetDonor, setSheetDonor] = useState<any | null>(null);
  const [fullMapOpen, setFullMapOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationChecked, setLocationChecked] = useState(false); // Track if we've checked for location
  const [locationLoading, setLocationLoading] = useState(true);

  const { toasts, toast } = useToast();

  // Fetch donors using TanStack Query
  const { data: donors = [], isLoading, error } = useDonors();

  // Show error toast if fetch fails
  useEffect(() => {
    if (error) {
      toast('Failed to load donors. Please refresh the page.', 'error');
    }
  }, [error]);

  // Get user's current location
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationLoading(false);
      setUserLocation(DEFAULT_MAP_CENTER);
      return;
    }

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationLoading(false);
          console.log('User location:', { lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Using default location.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Using default location.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Using default location.';
              break;
          }
          
          setLocationError(errorMessage);
          // Use default location (Pokhara) if geolocation fails
          setUserLocation(DEFAULT_MAP_CENTER);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000, // Reduced to 5 seconds for faster fallback
          maximumAge: 0,
        }
      );
    };

    getLocation();
  }, []);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const mapObjRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const pinRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // ── Filter donors ─────────────────────────────────────────────────────────
  const filtered = donors.filter((d) => {
    // Filter by blood group
    if (selectedGroup !== "all" && d.bloodGroup !== selectedGroup) return false;
    
    // Filter by location query - search in address, location, or city
    const fullAddress = (d.address || d.location || d.city || '').toLowerCase();
    if (locationQuery && !fullAddress.includes(locationQuery.toLowerCase())) return false;
    
    // Only filter by radius if a pin is clicked
    if (clickedPos) {
      // Get coordinates - use donor's coordinates or fallback to city-based
      const coords = d.latitude && d.longitude
        ? { lat: d.latitude, lng: d.longitude }
        : getCityCoordinates(d.city || d.location);
      
      if (coords) {
        const dist = haversineKm(clickedPos.lat, clickedPos.lng, coords.lat, coords.lng);
        if (dist > radius) return false;
      } else {
        // If no coordinates and pin is clicked, exclude this donor
        return false;
      }
    }
    
    return true;
  });

  // ── Load Leaflet ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);

    return () => { /* leave scripts; cleanup map below */ };
  }, []);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Wait for both map library and user location before initializing
    if (!mapReady || !mapRef.current || mapObjRef.current || locationLoading) return;
    
    // At this point, userLocation is guaranteed to be set (either real location or default)
    if (!userLocation) return;

    const L = (window as any).L;
    leafletRef.current = L;

    // Use user location (either real or default)
    const initialCenter = userLocation;
    const initialZoom = locationError ? 13 : 14; // Zoom in more if we have real user location

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView(
      [initialCenter.lat, initialCenter.lng],
      initialZoom
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add user location marker only if we have real user location (not default)
    if (!locationError) {
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Your Location</b>')
        .openPopup();
    }

    map.on("click", (e: any) => {
      setClickedPos({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapObjRef.current = map;
  }, [mapReady, userLocation, locationLoading, locationError]);

  // ── Update circle + markers ───────────────────────────────────────────────
  const updateMapOverlays = useCallback(() => {
    const L = leafletRef.current;
    const map = mapObjRef.current;
    if (!L || !map) return;

    // Remove old pin + circle
    if (pinRef.current) { map.removeLayer(pinRef.current); pinRef.current = null; }
    if (circleRef.current) { map.removeLayer(circleRef.current); circleRef.current = null; }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Helper function to add small random offset to prevent marker stacking
    const addJitter = (lat: number, lng: number, index: number) => {
      // Use donor ID hash for consistent but pseudo-random offset
      const offset = 0.002; // ~200 meters
      const angle = (index * 137.5) % 360; // Golden angle for good distribution
      const distance = (index % 3) * offset / 3; // Vary distance
      return {
        lat: lat + distance * Math.cos(angle * Math.PI / 180),
        lng: lng + distance * Math.sin(angle * Math.PI / 180)
      };
    };

    if (!clickedPos) {
      // Show all donors (no radius) with simple markers
      donors.forEach((d, index) => {
        if (selectedGroup !== "all" && d.bloodGroup !== selectedGroup) return;
        const fullAddress = (d.address || d.location || d.city || '').toLowerCase();
        if (locationQuery && !fullAddress.includes(locationQuery.toLowerCase())) return;
        
        // Get coordinates - use donor's coordinates or fallback to city-based
        let coords = d.latitude && d.longitude
          ? { lat: d.latitude, lng: d.longitude }
          : getCityCoordinates(d.city || d.location);
        
        if (!coords) return; // Skip if no coordinates available

        // Add jitter to prevent stacking
        coords = addJitter(coords.lat, coords.lng, index);

        const bloodGroupDisplay = d.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');

        const icon = L.divIcon({
          className: "",
          html: `<div style="width:32px;height:32px;border-radius:50%;background:#7F1D1D;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;cursor:pointer;">${bloodGroupDisplay}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([coords.lat, coords.lng], { icon }).addTo(map);
        marker.on("click", (e: any) => {
          L.DomEvent.stopPropagation(e);
          setSheetDonor(d);
        });
        markersRef.current.push(marker);
      });
      return;
    }

    // Pin for clicked location
    const pinIcon = L.divIcon({
      className: "",
      html: `<div style="width:40px;height:40px;border-radius:50%;background:#0f172a;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    pinRef.current = L.marker([clickedPos.lat, clickedPos.lng], { icon: pinIcon }).addTo(map);

    // Circle
    circleRef.current = L.circle([clickedPos.lat, clickedPos.lng], {
      radius: radius * 1000,
      color: "#7F1D1D",
      fillColor: "#7F1D1D",
      fillOpacity: 0.06,
      weight: 2,
      dashArray: "6 4",
    }).addTo(map);

    // Donor markers within radius
    donors.forEach((d, index) => {
      if (selectedGroup !== "all" && d.bloodGroup !== selectedGroup) return;
      const fullAddress = (d.address || d.location || d.city || '').toLowerCase();
      if (locationQuery && !fullAddress.includes(locationQuery.toLowerCase())) return;
      
      // Get coordinates - use donor's coordinates or fallback to city-based
      let coords = d.latitude && d.longitude
        ? { lat: d.latitude, lng: d.longitude }
        : getCityCoordinates(d.city || d.location);
      
      if (!coords) return; // Skip if no coordinates available

      // Add jitter to prevent stacking
      coords = addJitter(coords.lat, coords.lng, index);

      const dist = haversineKm(clickedPos.lat, clickedPos.lng, coords.lat, coords.lng);
      const inRadius = dist <= radius;

      const bloodGroupDisplay = d.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:34px;height:34px;border-radius:50%;background:${inRadius ? "#7F1D1D" : "#94a3b8"};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;opacity:${inRadius ? 1 : 0.4};cursor:${inRadius ? "pointer" : "default"}">${bloodGroupDisplay}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon }).addTo(map);
      if (inRadius) {
        marker.on("click", (e: any) => {
          L.DomEvent.stopPropagation(e);
          setSheetDonor(d);
        });
      }
      markersRef.current.push(marker);
    });
  }, [clickedPos, radius, selectedGroup, locationQuery, donors]);

  useEffect(() => {
    updateMapOverlays();
  }, [updateMapOverlays]);

  const clearPin = () => setClickedPos(null);

  const useMyLocation = () => {
    if (userLocation) {
      setClickedPos(userLocation);
      toast('Using your current location');
      
      // Center map on user location
      if (mapObjRef.current) {
        mapObjRef.current.setView([userLocation.lat, userLocation.lng], 14);
      }
    } else {
      toast('Location not available. Please enable location access.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-[1300px] mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                  <Home size={14} /> Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Blood Search</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* Toast */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium shadow-lg ${
                t.type === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-green-50 border-green-200 text-green-800"
              }`}
            >
              {t.msg}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <Search size={18} className="text-red-800" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Blood Search</h1>
              <p className="text-sm text-slate-600 mt-0.5">Find donors by blood group, location, or map radius</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userLocation && (
              <button
                onClick={useMyLocation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-800 hover:bg-blue-100 transition-colors"
              >
                <Crosshair size={14} />
                Use My Location
              </button>
            )}
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2">
              <Users size={13} className="text-red-800" />
              <span className="text-lg font-bold text-red-800">{filtered.length}</span>
              <span className="text-xs text-slate-600">
                {clickedPos ? 'within radius' : 'total donors'}
              </span>
            </div>
          </div>
        </div>

        {/* Location Status */}
        {locationError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <MapPin size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Location Access</p>
              <p className="text-xs text-yellow-700 mt-0.5">{locationError}</p>
            </div>
          </div>
        )}

        {userLocation && !locationError && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <Crosshair size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Your Location Detected</p>
              <p className="text-xs text-green-700 mt-0.5">
                Map is centered at your current location. Click "Use My Location" to search nearby donors.
              </p>
            </div>
          </div>
        )}

        {/* Low Stock Suggestions */}
        {LOW_STOCK_GROUPS.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <Droplets size={15} className="text-red-800" />
            <span className="text-sm font-medium text-red-800">Suggested — search donors for low-stock groups:</span>
            <div className="flex flex-wrap gap-2">
              {LOW_STOCK_GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGroup(selectedGroup === g ? "all" : g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    selectedGroup === g
                      ? "bg-red-100 text-red-800 border-red-300 font-bold"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
          <div className="flex items-center gap-2 p-4 pb-0">
            <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
              <Filter size={14} className="text-red-800" />
            </div>
            <p className="text-sm font-bold text-slate-900">Search Filters</p>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Blood Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Groups</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
              <div className="relative">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Type street name, area, or landmark…"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Map Radius: <span className="text-red-800">{radius} km</span>
                {clickedPos && <span className="text-slate-400 font-normal text-[10px]"> (click map to move)</span>}
              </label>
              <input
                type="range"
                min={1}
                max={30}
                step={0.5}
                value={radius}
                onChange={(e) => setRadius(parseFloat(e.target.value))}
                className="w-full accent-red-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 -mt-1">
                <span>1 km</span>
                <span>30 km</span>
              </div>
            </div>
          </div>

          {clickedPos && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-2">
                <Navigation size={12} className="text-red-800" />
                <span className="text-xs text-red-800 font-medium flex-1">
                  Pin: {clickedPos.lat.toFixed(4)}, {clickedPos.lng.toFixed(4)}
                </span>
                <button
                  onClick={clearPin}
                  className="flex items-center gap-1 text-xs font-semibold text-red-800 hover:text-red-900"
                >
                  <X size={12} /> Clear
                </button>
              </div>
            </div>
          )}

          {!clickedPos && (
            <p className="text-xs text-slate-500 text-center px-4 pb-4">
              � All donors are shown on the map
              <span className="block mt-1">👆 Click anywhere to drop a pin and filter by radius</span>
              {userLocation && <span className="block mt-1">💡 Or use "Use My Location" button to search near you</span>}
            </p>
          )}
        </div>

        {/* ── Map Panel ── */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                <Navigation size={14} className="text-red-800" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Donor Map</p>
                <p className="text-xs text-slate-500">
                  {clickedPos 
                    ? `${filtered.length} donors within ${radius}km radius` 
                    : `Showing all ${filtered.length} donors`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setFullMapOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Navigation size={12} /> Full Map
            </button>
          </div>

          <div className="relative">
            <div ref={mapRef} className="h-[400px] w-full" />
            {(!mapReady || locationLoading) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
                <div className="w-9 h-9 border-3 border-slate-200 border-t-red-800 rounded-full animate-spin" />
                <p className="text-sm text-slate-600 mt-2">
                  {locationLoading ? 'Getting your location...' : 'Loading map…'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Donor Cards Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              {clickedPos ? 'Donors Within Radius' : 'All Available Donors'}
            </h2>
            <span className="text-sm text-slate-600">{filtered.length} found</span>
          </div>

          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-9 h-9 border-3 border-slate-200 border-t-red-800 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-600">Loading donors...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Droplets size={22} className="text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-600">No donors found</p>
                <p className="text-xs text-slate-400">Try adjusting your filters or radius</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((d) => {
                const name = d.user?.name || 'Unknown Donor';
                const fullAddress = d.address || d.location || d.city || 'N/A';
                const bloodGroupDisplay = d.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
                const lastDonation = d.lastDonationDate 
                  ? new Date(d.lastDonationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Never';
                
                // Get coordinates for distance calculation
                const coords = d.latitude && d.longitude
                  ? { lat: d.latitude, lng: d.longitude }
                  : getCityCoordinates(d.city || d.location);
                
                return (
                  <div
                    key={d.id}
                    onClick={() => setSheetDonor(d)}
                    className="bg-white border border-slate-200 hover:border-red-300 rounded-xl p-3.5 cursor-pointer transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-xs font-bold text-red-800">
                          {getInitials(name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{name}</p>
                          <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
                            <MapPin size={10} className="flex-shrink-0" /> 
                            <span className="truncate" title={fullAddress}>{fullAddress}</span>
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs font-bold flex-shrink-0">
                        {bloodGroupDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5 flex-wrap">
                      <span>Last: {lastDonation}</span>
                      <span>·</span>
                      <span>{d.totalDonations}× donated</span>
                      {clickedPos && coords && (
                        <>
                          <span>·</span>
                          <span className="text-red-800 font-semibold">
                            {haversineKm(clickedPos.lat, clickedPos.lng, coords.lat, coords.lng).toFixed(1)} km
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast(`Calling ${name}…`, "info");
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Phone size={12} /> Call
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast(`Notification sent to ${name}`);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-800 rounded-lg text-xs font-semibold text-white hover:bg-red-900 transition-colors"
                      >
                        <Bell size={12} /> Notify
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Full Map Modal ── */}
        {fullMapOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                    <Navigation size={16} className="text-red-800" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Full Map View</h3>
                    <p className="text-xs text-slate-500">{filtered.length} donors shown</p>
                  </div>
                </div>
                <button
                  onClick={() => setFullMapOpen(false)}
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
        )}

        {/* ── Donor Detail Sheet ── */}
        {sheetDonor && (() => {
          const name = sheetDonor.user?.name || 'Unknown Donor';
          const phone = sheetDonor.user?.phone || 'N/A';
          const fullAddress = sheetDonor.address || sheetDonor.location || sheetDonor.city || 'N/A';
          const bloodGroupDisplay = sheetDonor.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
          const lastDonation = sheetDonor.lastDonationDate 
            ? new Date(sheetDonor.lastDonationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Never';
          
          const tier = getDonorTier(sheetDonor.totalDonations);
          
          // Get coordinates for distance calculation
          const coords = sheetDonor.latitude && sheetDonor.longitude
            ? { lat: sheetDonor.latitude, lng: sheetDonor.longitude }
            : getCityCoordinates(sheetDonor.city || sheetDonor.location);
          
          const dist = clickedPos && coords
            ? haversineKm(clickedPos.lat, clickedPos.lng, coords.lat, coords.lng)
            : null;

          return (
            <div
              className="fixed inset-0 bg-black/40 flex justify-end z-[9999]"
              onClick={() => setSheetDonor(null)}
            >
              <div
                className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl relative z-[10000]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Banner */}
                <div className="relative bg-gradient-to-br from-red-800 via-red-900 to-red-950 p-6 pb-10 text-center">
                  <button
                    onClick={() => setSheetDonor(null)}
                    className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>

                  {/* Avatar */}
                  <div className="w-[72px] h-[72px] rounded-full bg-white/10 border-[3px] border-white/25 flex items-center justify-center text-[26px] font-bold text-white mx-auto mb-3">
                    {getInitials(name)}
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2.5">{name}</h2>

                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-white/15 border border-white/25 rounded-full px-2.5 py-1 text-xs font-bold text-white">
                      <Droplets size={11} /> {bloodGroupDisplay}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold bg-white ${tier.styles}`}>
                      <Award size={11} /> {tier.label} Donor
                    </span>
                  </div>
                </div>

                {/* Stats Strip */}
                <div className="flex items-center justify-around bg-white border border-slate-100 rounded-xl mx-4 -mt-5 p-4 shadow-lg relative z-10">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-red-800">{sheetDonor.totalDonations}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Donations</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-red-800">{sheetDonor.totalDonations * 450} ml</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Blood Given</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-lg font-bold ${dist != null ? "text-red-800" : "text-slate-400"}`}>
                      {dist != null ? `${dist.toFixed(1)} km` : "—"}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Distance</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Contact Information
                    </p>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                      {[
                        { icon: <Phone size={13} className="text-red-800" />, label: "Phone", value: phone },
                        { icon: <MapPin size={13} className="text-red-800" />, label: "Full Address", value: fullAddress },
                      ].map((row, i, arr) => (
                        <div key={row.label}>
                          <div className="flex items-center gap-3 p-3">
                            <div className="w-[30px] h-[30px] rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                              {row.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs text-slate-500">{row.label}</span>
                              <span className="block text-sm font-semibold text-slate-900 break-words">{row.value}</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                          </div>
                          {i < arr.length - 1 && <div className="h-px bg-slate-100 mx-3" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Donation History
                    </p>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                      {[
                        { icon: <Calendar size={13} className="text-red-800" />, label: "Last Donation", value: lastDonation },
                        { icon: <Droplets size={13} className="text-red-800" />, label: "Blood Group", value: bloodGroupDisplay },
                        { icon: <Award size={13} className="text-red-800" />, label: "Total Donations", value: String(sheetDonor.totalDonations), highlight: true },
                      ].map((row, i, arr) => (
                        <div key={row.label}>
                          <div className="flex items-center gap-3 p-3">
                            <div className="w-[30px] h-[30px] rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                              {row.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs text-slate-500">{row.label}</span>
                              <span className={`block text-sm font-semibold truncate ${row.highlight ? "text-red-800" : "text-slate-900"}`}>
                                {row.value}
                              </span>
                            </div>
                          </div>
                          {i < arr.length - 1 && <div className="h-px bg-slate-100 mx-3" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        router.push(`/dashboard/donors/${sheetDonor.id}`);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <User size={14} /> View Full Profile
                    </button>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => {
                          toast(`Calling ${name}…`, "info");
                        }}
                        className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <Phone size={14} /> Call
                      </button>
                      <button
                        onClick={() => {
                          toast(`Notification sent to ${name}`);
                        }}
                        className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <Bell size={14} /> Notify
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
