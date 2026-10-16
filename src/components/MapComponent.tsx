import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BeachSpot, SuitabilityBreakdown } from '../types/index.ts';
import { formatDistance } from '../utils/distance.ts';

interface MapComponentProps {
  beaches: BeachSpot[];
  suitabilities: Record<string, SuitabilityBreakdown>;
  selectedBeachId: string | null;
  onSelectBeach: (beach: BeachSpot) => void;
  userCoords: { lat: number; lng: number } | null;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  beaches,
  suitabilities,
  selectedBeachId,
  onSelectBeach,
  userCoords
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Singapore center coordinates
    const map = L.map(mapContainerRef.current, {
      center: [1.295, 103.84],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true
    });

    // Sub-goal 2.a: OneMap tiles basemap
    const onemapTiles = L.tileLayer(
      'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png',
      {
        detectRetina: true,
        maxZoom: 18,
        minZoom: 10,
        attribution:
          '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:14px;width:14px;display:inline-block;vertical-align:middle;margin-right:4px;" alt="OneMap" />' +
          '<a href="https://www.onemap.gov.sg" target="_blank" rel="noopener noreferrer">OneMap</a> &copy; Singapore Land Authority'
      }
    );

    onemapTiles.addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Beach Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    beaches.forEach((beach) => {
      const suitability = suitabilities[beach.id];
      const score = suitability?.overallScore ?? 80;
      const isSelected = beach.id === selectedBeachId;

      // Color coding based on suitability score
      const bgHex = score >= 85 ? '#10b981' : score >= 70 ? '#06b6d4' : '#f59e0b';
      const borderHex = isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)';

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-coastal-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            border: 2px solid ${borderHex};
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            padding: 3px 8px;
            cursor: pointer;
            transform: translate(-50%, -50%);
            white-space: nowrap;
            gap: 5px;
          ">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 9999px;
              background-color: ${bgHex};
              display: inline-block;
            "></span>
            <span style="
              color: #f8fafc;
              font-size: 11px;
              font-weight: 700;
              font-family: 'Plus Jakarta Sans', sans-serif;
            ">${score}</span>
            <span style="
              color: #94a3b8;
              font-size: 10px;
              font-weight: 500;
            ">${beach.name.split(' ')[0]}</span>
          </div>
        `,
        iconSize: [80, 28],
        iconAnchor: [40, 14]
      });

      const marker = L.marker([beach.lat, beach.lng], { icon: customIcon });

      // Rich popup
      const popupHtml = `
        <div style="min-width: 200px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="font-size: 13px; font-weight: 700; color: #f8fafc; margin-bottom: 2px;">
            ${beach.name}
          </div>
          <div style="font-size: 11px; color: #38bdf8; margin-bottom: 8px;">
            ${beach.zone} · ${formatDistance(beach.distanceKm)}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; margin-bottom: 8px;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 10px;">Suitability</span>
              <strong style="color: ${bgHex}; font-size: 12px;">${score}/100 (${suitability?.rating || 'Good'})</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 10px;">Wind</span>
              <strong style="color: #f8fafc;">${suitability?.windSpeedKmh || '--'} km/h ${suitability?.windCompass || ''}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 10px;">Tide</span>
              <strong style="color: #f8fafc;">${suitability?.tideHeightM ? `${suitability.tideHeightM}m` : 'Cycle Active'}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 10px;">Heat (WBGT)</span>
              <strong style="color: #f8fafc;">${suitability?.wbgtCelsius || '--'}°C</strong>
            </div>
          </div>
          <button id="btn-inspect-${beach.id}" style="
            width: 100%;
            background: #0284c7;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          ">
            View Tides & Charters
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        offset: [0, -10]
      });

      marker.on('click', () => {
        onSelectBeach(beach);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${beach.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectBeach(beach);
          };
        }
      });

      marker.addTo(markersGroup);

      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [beaches, suitabilities, selectedBeachId, onSelectBeach]);

  // Update User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div style="position: relative; width: 18px; height: 18px;">
              <span style="
                position: absolute;
                inset: 0;
                border-radius: 9999px;
                background-color: #38bdf8;
                opacity: 0.75;
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></span>
              <span style="
                position: relative;
                display: block;
                width: 18px;
                height: 18px;
                border-radius: 9999px;
                background-color: #0284c7;
                border: 2px solid #ffffff;
                box-shadow: 0 0 10px rgba(2, 132, 199, 0.8);
              "></span>
            </div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });

        userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], {
          icon: userIcon
        }).addTo(map);

        userMarkerRef.current.bindPopup(
          '<div style="font-size:12px;font-weight:600;color:#0f172a;">Your Current Location</div>'
        );
      } else {
        userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userCoords]);

  // Center on selected beach
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedBeachId) return;

    const selected = beaches.find((b) => b.id === selectedBeachId);
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 13, { duration: 1.2 });
    }
  }, [selectedBeachId, beaches]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Basemap Info Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-400 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
        <span>OneMap SLA Basemap Layer</span>
        <span className="text-slate-600">·</span>
        <span>Tap any pin to view live tides</span>
      </div>
    </div>
  );
};
