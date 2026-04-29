'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DonorMapProps {
  latitude: number;
  longitude: number;
  donorName: string;
  bloodGroup: string;
  donorType?: string; // 'PERSON' or 'ORGANIZATION'
}

export default function DonorMap({ latitude, longitude, donorName, bloodGroup, donorType }: DonorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // Initialize map
      const map = L.map(mapRef.current).setView([latitude, longitude], 13);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Check if this is an organization
      const isOrganization = donorType === 'ORGANIZATION';

      // Create custom icon HTML based on donor type
      let iconHtml;
      
      if (isOrganization) {
        // Organization marker - blue building icon
        iconHtml = `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              background-color: #2563eb;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 12px rgba(37, 99, 235, 0.4), 0 0 0 3px rgba(37, 99, 235, 0.2);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5">
                <rect x="4" y="2" width="16" height="20" rx="2"/>
                <path d="M9 6h.01M9 10h.01M9 14h.01M15 6h.01M15 10h.01M15 14h.01"/>
              </svg>
            </div>
          </div>
        `;
      } else {
        // Individual donor marker - blood group with red teardrop
        iconHtml = `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              background-color: #7F1D1D;
              width: 40px;
              height: 40px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                transform: rotate(45deg);
                color: white;
                font-weight: bold;
                font-size: 12px;
              ">
                ${bloodGroup}
              </div>
            </div>
          </div>
        `;
      }

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-donor-marker',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      // Add marker
      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

      // Add popup with appropriate content
      const popupContent = isOrganization
        ? `
          <div style="text-align: center; padding: 8px; min-width: 150px;">
            <strong style="font-size: 14px; color: #2563eb;">🏢 ${donorName}</strong><br/>
            <span style="font-size: 12px; color: #64748b;">Organization</span>
          </div>
        `
        : `
          <div style="text-align: center; padding: 8px; min-width: 150px;">
            <strong style="font-size: 14px; color: #7F1D1D;">${donorName}</strong><br/>
            <span style="font-size: 12px; color: #64748b;">Blood Group: ${bloodGroup}</span>
          </div>
        `;

      marker.bindPopup(popupContent).openPopup();

      // Force map to invalidate size after a short delay
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load map');
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, donorName, bloodGroup, donorType]);

  if (error) {
    return (
      <div className="h-[300px] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-600">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="h-[300px] w-full rounded-lg overflow-hidden border border-slate-200"
      style={{ zIndex: 0 }}
    />
  );
}
