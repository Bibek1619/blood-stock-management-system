'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DonorMapProps {
  latitude: number;
  longitude: number;
  donorName: string;
  bloodGroup: string;
}

export default function DonorMap({ latitude, longitude, donorName, bloodGroup }: DonorMapProps) {
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

      // Create custom icon HTML
      const iconHtml = `
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

      // Add popup
      marker.bindPopup(`
        <div style="text-align: center; padding: 8px; min-width: 150px;">
          <strong style="font-size: 14px; color: #7F1D1D;">${donorName}</strong><br/>
          <span style="font-size: 12px; color: #64748b;">Blood Group: ${bloodGroup}</span>
        </div>
      `).openPopup();

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
  }, [latitude, longitude, donorName, bloodGroup]);

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
