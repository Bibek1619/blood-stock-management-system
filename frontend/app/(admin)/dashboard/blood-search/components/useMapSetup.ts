import { useEffect, useRef, useCallback } from "react";
import { getCityCoordinates, haversineKm, DEFAULT_MAP_CENTER } from "@/lib/data";

interface UseMapSetupProps {
  mapReady: boolean;
  userLocation: { lat: number; lng: number } | null;
  locationLoading: boolean;
  locationError: string | null;
  donors: any[] | { data: any[] };
  selectedGroup: string;
  locationQuery: string;
  clickedPos: { lat: number; lng: number } | null;
  radius: number;
  onClickedPosChange: (pos: { lat: number; lng: number } | null) => void;
  onDonorClick: (donor: any) => void;
}

export function useMapSetup({
  mapReady,
  userLocation,
  locationLoading,
  locationError,
  donors,
  selectedGroup,
  locationQuery,
  clickedPos,
  radius,
  onClickedPosChange,
  onDonorClick,
}: UseMapSetupProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const mapObjRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const pinRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapObjRef.current || locationLoading) return;
    if (!userLocation) return;

    const L = (window as any).L;
    leafletRef.current = L;

    const initialCenter = userLocation;
    const initialZoom = locationError ? 13 : 14;

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
      onClickedPosChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapObjRef.current = map;
  }, [mapReady, userLocation, locationLoading, locationError]);

  // Update map overlays
  const updateMapOverlays = useCallback(() => {
    const L = leafletRef.current;
    const map = mapObjRef.current;
    
    if (!L || !map) return;

    // Remove old overlays
    if (pinRef.current) { map.removeLayer(pinRef.current); pinRef.current = null; }
    if (circleRef.current) { map.removeLayer(circleRef.current); circleRef.current = null; }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Helper function to add jitter
    const addJitter = (lat: number, lng: number, index: number, hasPreciseCoords: boolean = false) => {
      const offset = hasPreciseCoords ? 0.0002 : 0.002;
      const angle = (index * 137.5) % 360;
      const distance = (index % 3) * offset / 3;
      return {
        lat: lat + distance * Math.cos(angle * Math.PI / 180),
        lng: lng + distance * Math.sin(angle * Math.PI / 180)
      };
    };

    const donorsArray = Array.isArray(donors) ? donors : donors?.data || [];

    if (!clickedPos) {
      // Show all donors
      donorsArray.forEach((d, index) => {
        if (selectedGroup !== "all") {
          const dbFormat = selectedGroup.replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
          if (d.bloodGroup !== dbFormat) return;
        }
        
        const fullAddress = (d.address || d.location || d.city || '').toLowerCase();
        if (locationQuery && !fullAddress.includes(locationQuery.toLowerCase())) return;
        
        let coords = d.latitude && d.longitude
          ? { lat: d.latitude, lng: d.longitude }
          : getCityCoordinates(d.city || d.location);
        
        if (coords && 'latitude' in coords) {
          coords = { lat: coords.latitude, lng: coords.longitude };
        }
        
        if (!coords) return;

        const hasPreciseCoords = !!(d.latitude && d.longitude);
        coords = addJitter(coords.lat, coords.lng, index, hasPreciseCoords);

        const bloodGroupDisplay = d.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
        const isOrganization = d.donorType === 'ORGANIZATION';

        let markerStyle;
        let markerContent;
        
        if (isOrganization) {
          markerStyle = {
            background: '#2563eb',
            border: '3px solid #fff',
            boxShadow: '0 2px 12px rgba(37, 99, 235, 0.4), 0 0 0 3px rgba(37, 99, 235, 0.2)',
            size: '40px',
          };
          markerContent = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 6h.01M9 10h.01M9 14h.01M15 6h.01M15 10h.01M15 14h.01"/></svg>`;
        } else if (hasPreciseCoords) {
          markerStyle = {
            background: '#059669',
            border: '3px solid #fff',
            boxShadow: '0 2px 12px rgba(5, 150, 105, 0.4), 0 0 0 3px rgba(5, 150, 105, 0.2)',
            size: '36px',
          };
          markerContent = bloodGroupDisplay;
        } else {
          markerStyle = {
            background: '#7F1D1D',
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
          onDonorClick(d);
        });
        markersRef.current.push(marker);
      });
      return;
    }

    // Pin for clicked location
    const pinIcon = L.divIcon({
      className: "",
      html: `<div style="width:40px;height:40px;border-radius:50%;background:#0f172a;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
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
    donorsArray.forEach((d, index) => {
      if (selectedGroup !== "all") {
        const dbFormat = selectedGroup.replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
        if (d.bloodGroup !== dbFormat) return;
      }
      
      const fullAddress = (d.address || d.location || d.city || '').toLowerCase();
      if (locationQuery && !fullAddress.includes(locationQuery.toLowerCase())) return;
      
      let coords = d.latitude && d.longitude
        ? { lat: d.latitude, lng: d.longitude }
        : getCityCoordinates(d.city || d.location);
      
      if (coords && 'latitude' in coords) {
        coords = { lat: coords.latitude, lng: coords.longitude };
      }
      
      if (!coords) return;

      const hasPreciseCoords = !!(d.latitude && d.longitude);
      coords = addJitter(coords.lat, coords.lng, index, hasPreciseCoords);

      const dist = haversineKm(clickedPos.lat, clickedPos.lng, coords.lat, coords.lng);
      const inRadius = dist <= radius;

      const bloodGroupDisplay = d.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
      const isOrganization = d.donorType === 'ORGANIZATION';

      let markerStyle;
      let markerContent;
      
      if (isOrganization && inRadius) {
        markerStyle = {
          background: '#2563eb',
          border: '3px solid #fff',
          boxShadow: '0 2px 12px rgba(37, 99, 235, 0.4), 0 0 0 3px rgba(37, 99, 235, 0.2)',
          size: '40px',
          opacity: 1,
        };
        markerContent = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 6h.01M9 10h.01M9 14h.01M15 6h.01M15 10h.01M15 14h.01"/></svg>`;
      } else if (isOrganization && !inRadius) {
        markerStyle = {
          background: '#94a3b8',
          border: '2px solid #fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          size: '40px',
          opacity: 0.4,
        };
        markerContent = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 6h.01M9 10h.01M9 14h.01M15 6h.01M15 10h.01M15 14h.01"/></svg>`;
      } else if (inRadius && hasPreciseCoords) {
        markerStyle = {
          background: '#059669',
          border: '3px solid #fff',
          boxShadow: '0 2px 12px rgba(5, 150, 105, 0.4), 0 0 0 3px rgba(5, 150, 105, 0.2)',
          size: '38px',
          opacity: 1,
        };
        markerContent = bloodGroupDisplay;
      } else if (inRadius) {
        markerStyle = {
          background: '#7F1D1D',
          border: '2px solid #fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          size: '34px',
          opacity: 1,
        };
        markerContent = bloodGroupDisplay;
      } else {
        markerStyle = {
          background: '#94a3b8',
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
          onDonorClick(d);
        });
      }
      markersRef.current.push(marker);
    });
  }, [clickedPos, radius, selectedGroup, locationQuery, donors, onDonorClick]);

  useEffect(() => {
    updateMapOverlays();
  }, [updateMapOverlays]);

  // Force update markers when donors finish loading
  useEffect(() => {
    const donorsArray = Array.isArray(donors) ? donors : donors?.data || [];
    if (donorsArray.length > 0 && mapObjRef.current) {
      updateMapOverlays();
    }
  }, [donors, updateMapOverlays]);

  return { mapRef, mapObjRef };
}
