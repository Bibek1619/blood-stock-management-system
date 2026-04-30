'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone, Bell, MapPin, Droplets, Search,
  Users, X, Navigation, Filter, Award, Calendar, ChevronRight, Home, User, Crosshair,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDonors } from "@/lib/queries/donors";
import { useBloodSearchStore, useToast } from "@/lib/store";
import { getCityCoordinates } from "@/lib/geocoding";
import {
  BLOOD_GROUPS,
  LOW_STOCK_GROUPS,
  DEFAULT_MAP_CENTER,
  getInitials,
  getDonorTier,
  haversineKm,
} from "@/lib/data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BloodSearchPage() {
  const router = useRouter();
  
  // Zustand stores
  const selectedGroup = useBloodSearchStore((state) => state.selectedBloodGroup);
  const setSelectedGroup = useBloodSearchStore((state) => state.setSelectedBloodGroup);
  const locationQuery = useBloodSearchStore((state) => state.locationQuery);
  const setLocationQuery = useBloodSearchStore((state) => state.setLocationQuery);
  const radius = useBloodSearchStore((state) => state.radius);
  const setRadius = useBloodSearchStore((state) => state.setRadius);
  const clickedPos = useBloodSearchStore((state) => state.clickedPosition);
  const setClickedPos = useBloodSearchStore((state) => state.setClickedPosition);
  const fullMapOpen = useBloodSearchStore((state) => state.fullMapOpen);
  const setFullMapOpen = useBloodSearchStore((state) => state.setFullMapOpen);
  const sheetDonor = useBloodSearchStore((state) => state.selectedDonor);
  const setSheetDonor = useBloodSearchStore((state) => state.setSelectedDonor);
  const userLocation = useBloodSearchStore((state) => state.userLocation);
  const setUserLocation = useBloodSearchStore((state) => state.setUserLocation);
  const locationError = useBloodSearchStore((state) => state.locationError);
  const setLocationError = useBloodSearchStore((state) => state.setLocationError);
  const locationLoading = useBloodSearchStore((state) => state.locationLoading);
  const setLocationLoading = useBloodSearchStore((state) => state.setLocationLoading);
  const clearPin = useBloodSearchStore((state) => state.clearPin);
  
  // Local state
  const [mapReady, setMapReady] = useState(false);

  const { toast } = useToast();

  // Fetch donors using TanStack Query
  const { data: donors = [], isLoading, error } = useDonors();

  // Show error toast if fetch fails
  useEffect(() => {
    if (error) {
      toast('Failed to load donors. Please refresh the page.', 'error');
    }
  }, [error, toast]);

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
    // Filter by blood group - convert display format to database format for comparison
    if (selectedGroup !== "all") {
      const dbFormat = selectedGroup.replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
      if (d.bloodGroup !== dbFormat) return false;
    }
    
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
    
    // Don't update if map not ready
    if (!L || !map) {
      console.log('Map not ready yet');
      return;
    }

    console.log('Updating map overlays with', donors.length, 'donors');

    // Remove old pin + circle
    if (pinRef.current) { map.removeLayer(pinRef.current); pinRef.current = null; }
    if (circleRef.current) { map.removeLayer(circleRef.current); circleRef.current = null; }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Helper function to add small random offset to prevent marker stacking
    const addJitter = (lat: number, lng: number, index: number, hasPreciseCoords: boolean = false) => {
      // If donor has precise coordinates from interactive map, use minimal jitter
      const offset = hasPreciseCoords ? 0.0002 : 0.002; // 20m vs 200m
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
        // Filter by blood group - convert display format to database format
        if (selectedGroup !== "all") {
          const dbFormat = selectedGroup.replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
          if (d.bloodGroup !== dbFormat) return;
        }
        
        const fullAddress = (d.address || d.location || d.city || '').toLowerCase();
        if (locationQuery && !fullAddress.includes(locationQuery.toLowerCase())) return;
        
        // Get coordinates - use donor's coordinates or fallback to city-based
        let coords = d.latitude && d.longitude
          ? { lat: d.latitude, lng: d.longitude }
          : getCityCoordinates(d.city || d.location);
        
        if (!coords) return; // Skip if no coordinates available

        // Check if donor has precise coordinates (not just city fallback)
        const hasPreciseCoords = !!(d.latitude && d.longitude);

        // Add minimal jitter for precise coords, more for city-based coords
        coords = addJitter(coords.lat, coords.lng, index, hasPreciseCoords);

        const bloodGroupDisplay = d.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');

        // Check if this is an organization based on donorType field
        const isOrganization = d.donorType === 'ORGANIZATION';

        // Different styling for organizations vs individuals
        let markerStyle;
        let markerContent;
        
        if (isOrganization) {
          // Organization marker - building icon
          markerStyle = {
            background: '#2563eb', // Blue for organizations
            border: '3px solid #fff',
            boxShadow: '0 2px 12px rgba(37, 99, 235, 0.4), 0 0 0 3px rgba(37, 99, 235, 0.2)',
            size: '40px',
          };
          markerContent = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 6h.01M9 10h.01M9 14h.01M15 6h.01M15 10h.01M15 14h.01"/></svg>`;
        } else if (hasPreciseCoords) {
          // Individual with precise location
          markerStyle = {
            background: '#059669', // Green for precise
            border: '3px solid #fff',
            boxShadow: '0 2px 12px rgba(5, 150, 105, 0.4), 0 0 0 3px rgba(5, 150, 105, 0.2)',
            size: '36px',
          };
          markerContent = bloodGroupDisplay;
        } else {
          // Individual with approximate location
          markerStyle = {
            background: '#7F1D1D', // Red for approximate
            border: '2px solid #fff', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            size: '32px',
          };
          markerContent = bloodGroupDisplay;
        }

        const icon = L.divIcon({
          className: "",
          html: `<div style="width:${markerStyle.size};height:${markerStyle.size};border-radius:50%;background:${markerStyle.background};border:${markerStyle.border};box-shadow:${markerStyle.boxShadow};display:flex;align-items:center;justify-content:center;font-size:${isOrganization ? '16px' : '10px'};font-weight:700;color:#fff;cursor:pointer;">${markerContent}</div>`,
          iconSize: [parseInt(markerStyle.size), parseInt(markerStyle.size)],
          iconAnchor: [parseInt(markerStyle.size) / 2, parseInt(markerStyle.size) / 2],
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
      // Filter by blood group - convert display format to database format
      if (selectedGroup !== "all") {
        const dbFormat = selectedGroup.replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
        if (d.bloodGroup !== dbFormat) return;
      }
      
      const fullAddress = (d.address || d.location || d.city || '').toLowerCase();
      if (locationQuery && !fullAddress.includes(locationQuery.toLowerCase())) return;
      
      // Get coordinates - use donor's coordinates or fallback to city-based
      let coords = d.latitude && d.longitude
        ? { lat: d.latitude, lng: d.longitude }
        : getCityCoordinates(d.city || d.location);
      
      if (!coords) return; // Skip if no coordinates available

      // Check if donor has precise coordinates (not just city fallback)
      const hasPreciseCoords = !!(d.latitude && d.longitude);

      // Add minimal jitter for precise coords, more for city-based coords
      coords = addJitter(coords.lat, coords.lng, index, hasPreciseCoords);

      const dist = haversineKm(clickedPos.lat, clickedPos.lng, coords.lat, coords.lng);
      const inRadius = dist <= radius;

      const bloodGroupDisplay = d.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');

      // Check if this is an organization based on donorType field
      const isOrganization = d.donorType === 'ORGANIZATION';

      // Different styling for organizations vs individuals (within radius)
      let markerStyle;
      let markerContent;
      
      if (isOrganization && inRadius) {
        // Organization marker - building icon
        markerStyle = {
          background: '#2563eb', // Blue for organizations
          border: '3px solid #fff',
          boxShadow: '0 2px 12px rgba(37, 99, 235, 0.4), 0 0 0 3px rgba(37, 99, 235, 0.2)',
          size: '40px',
          opacity: 1,
        };
        markerContent = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 6h.01M9 10h.01M9 14h.01M15 6h.01M15 10h.01M15 14h.01"/></svg>`;
      } else if (isOrganization && !inRadius) {
        // Organization out of radius
        markerStyle = {
          background: '#94a3b8', // Gray for out of radius
          border: '2px solid #fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          size: '40px',
          opacity: 0.4,
        };
        markerContent = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 6h.01M9 10h.01M9 14h.01M15 6h.01M15 10h.01M15 14h.01"/></svg>`;
      } else if (inRadius && hasPreciseCoords) {
        // Individual with precise location
        markerStyle = {
          background: '#059669', // Green for precise
          border: '3px solid #fff',
          boxShadow: '0 2px 12px rgba(5, 150, 105, 0.4), 0 0 0 3px rgba(5, 150, 105, 0.2)',
          size: '38px',
          opacity: 1,
        };
        markerContent = bloodGroupDisplay;
      } else if (inRadius) {
        // Individual with approximate location
        markerStyle = {
          background: '#7F1D1D', // Red for approximate but in radius
          border: '2px solid #fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          size: '34px',
          opacity: 1,
        };
        markerContent = bloodGroupDisplay;
      } else {
        // Out of radius
        markerStyle = {
          background: '#94a3b8', // Gray for out of radius
          border: '2px solid #fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          size: '34px',
          opacity: 0.4,
        };
        markerContent = bloodGroupDisplay;
      }

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:${markerStyle.size};height:${markerStyle.size};border-radius:50%;background:${markerStyle.background};border:${markerStyle.border};box-shadow:${markerStyle.boxShadow};display:flex;align-items:center;justify-content:center;font-size:${isOrganization ? '16px' : '9px'};font-weight:700;color:#fff;opacity:${markerStyle.opacity};cursor:${inRadius ? "pointer" : "default"}">${markerContent}</div>`,
        iconSize: [parseInt(markerStyle.size), parseInt(markerStyle.size)],
        iconAnchor: [parseInt(markerStyle.size) / 2, parseInt(markerStyle.size) / 2],
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

  // Force update markers when donors finish loading
  useEffect(() => {
    if (!isLoading && donors.length > 0 && mapObjRef.current) {
      console.log('Donors loaded, updating map with', donors.length, 'donors');
      updateMapOverlays();
    }
  }, [isLoading, donors.length, updateMapOverlays]);

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
              {LOW_STOCK_GROUPS.map((g) => {
                // Convert database format to display format
                const displayFormat = g.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
                return (
                  <button
                    key={g}
                    onClick={() => setSelectedGroup(selectedGroup === displayFormat ? "all" : displayFormat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedGroup === displayFormat
                        ? "bg-red-100 text-red-800 border-red-300 font-bold"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {displayFormat}
                  </button>
                );
              })}
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
                {BLOOD_GROUPS.map((g) => {
                  // Convert database format to display format
                  const displayFormat = g.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
                  return (
                    <option key={g} value={displayFormat}>
                      {displayFormat}
                    </option>
                  );
                })}
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
              Click anywhere on the map to drop a pin and filter donors by radius
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
            
            {/* Map Legend */}
            {mapReady && !locationLoading && (
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg z-[1000]">
                <p className="text-xs font-bold text-slate-700 mb-2">Map Legend</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#2563eb] border-2 border-white shadow-md flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                        <rect x="4" y="2" width="16" height="20" rx="2"/>
                        <path d="M9 6h.01M9 10h.01M9 14h.01M15 6h.01M15 10h.01M15 14h.01"/>
                      </svg>
                    </div>
                    <span className="text-xs text-slate-600 font-semibold">Organization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#059669] border-2 border-white shadow-md"></div>
                    <span className="text-xs text-slate-600">Precise location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#7F1D1D] border-2 border-white shadow-md"></div>
                    <span className="text-xs text-slate-600">Approximate (city)</span>
                  </div>
                  {clickedPos && (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#94a3b8] border-2 border-white shadow-md opacity-40"></div>
                      <span className="text-xs text-slate-600">Out of radius</span>
                    </div>
                  )}
                </div>
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
                
                // Check if donor has precise coordinates
                const hasPreciseCoords = !!(d.latitude && d.longitude);
                const locationBadge = hasPreciseCoords 
                  ? { text: 'Precise', color: 'bg-green-50 text-green-700 border-green-200' }
                  : { text: 'Approx', color: 'bg-orange-50 text-orange-700 border-orange-200' };
                
                return (
                  <div
                    key={d.id}
                    onClick={() => setSheetDonor(d)}
                    className="bg-white border border-slate-200 hover:border-red-300 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                  >
                    {/* Header with name and blood group */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-sm font-bold text-red-800 flex-shrink-0">
                          {getInitials(name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate" title={name}>{name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`px-2 py-0.5 border rounded text-[10px] font-medium ${locationBadge.color} flex-shrink-0`} title={hasPreciseCoords ? 'Exact location from interactive map' : 'Approximate location based on city'}>
                              {locationBadge.text}
                            </span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">{d.totalDonations}× donated</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm font-bold flex-shrink-0 ml-2">
                        {bloodGroupDisplay}
                      </span>
                    </div>

                    {/* Location - Full width with proper truncation */}
                    <div className="mb-3">
                      <div className="flex items-start gap-2">
                        <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600 leading-relaxed break-words" title={fullAddress}>
                            {fullAddress}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span>Last: {lastDonation}</span>
                      {clickedPos && coords && (
                        <span className="text-red-800 font-semibold">
                          {haversineKm(clickedPos.lat, clickedPos.lng, coords.lat, coords.lng).toFixed(1)} km away
                        </span>
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
