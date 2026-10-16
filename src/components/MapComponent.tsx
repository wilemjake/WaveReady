import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BeachSpot, SuitabilityBreakdown, SportType } from '../types/index.ts';
import { formatDistance } from '../utils/distance.ts';

interface MapComponentProps {
  beaches: BeachSpot[];
  suitabilities: Record<string, SuitabilityBreakdown>;
  selectedBeachId: string | null;
  onSelectBeach: (beach: BeachSpot) => void;
  userCoords: { lat: number; lng: number } | null;
  activeSport: SportType;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  beaches,
  suitabilities,
  selectedBeachId,
  onSelectBeach,
  userCoords,
  activeSport
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const sportLabel =
    activeSport === 'swimming'
      ? 'Swimming'
      : activeSport === 'kayak'
      ? 'Jetski/Kayak/SUP'
      : activeSport === 'fishing_boat'
      ? 'Fishing Boat'
      : 'All Water Sports';

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [1.295, 103.84],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true
    });

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

  // Update Beach Markers with Widened Wave Score
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    beaches.forEach((beach) => {
      const suitability = suitabilities[beach.id];
      const score = suitability?.waveScore ?? 75;
      const isSelected = beach.id === selectedBeachId;

      // Full spectrum color coding reflecting widened range (from ~24 to 96)
      const bgHex =
        score >= 85
          ? '#10b981' // Green
          : score >= 70
          ? '#06b6d4' // Cyan
          : score >= 50
          ? '#f59e0b' // Amber
          : '#f43f5e'; // Rose / Caution

      const borderHex = isSelected ? '#38bdf8' : 'rgba(255,255,255,0.7)';
      const borderWidth = isSelected ? '3px' : '2px';

      const customIcon = L.divIcon({
        className: 'custom-coastal-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            background: #090d16;
            border: ${borderWidth} solid ${borderHex};
            border-radius: 9999px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.65);
            padding: 3px 9px;
            cursor: pointer;
            transform: translate(-50%, -50%);
            white-space: nowrap;
            gap: 6px;
          ">
            <span style="
              width: 9px;
              height: 9px;
              border-radius: 9999px;
              background-color: ${bgHex};
              display: inline-block;
              box-shadow: 0 0 6px ${bgHex};
            "></span>
            <span style="
              color: #f8fafc;
              font-size: 11px;
              font-weight: 800;
              font-family: 'JetBrains Mono', monospace;
            ">${score}</span>
            <span style="
              color: #94a3b8;
              font-size: 10px;
              font-weight: 600;
            ">${beach.name.split(' ')[0]}</span>
          </div>
        `,
        iconSize: [86, 28],
        iconAnchor: [43, 14]
      });

      const marker = L.marker([beach.lat, beach.lng], { icon: customIcon });

      const rainText = suitability?.rainForecastToday
        ? `${suitability.rainForecastToday.forecast}`
        : 'Radar clear';

      const popupHtml = `
        <div style="min-width: 220px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">
              Wave Score · ${sportLabel}
            </span>
            <span style="font-size: 10px; font-weight: 700; color: ${bgHex}; background: rgba(255,255,255,0.08); padding: 1px 6px; border-radius: 4px;">
              ${suitability?.rating || 'Good'}
            </span>
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #f8fafc; margin-bottom: 2px;">
            ${beach.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
            ${beach.zone} · ${formatDistance(beach.distanceKm)}
          </div>

          <div style="background: rgba(255,255,255,0.06); padding: 8px; border-radius: 8px; margin-bottom: 8px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #94a3b8;">Wave Score</span>
              <strong style="color: ${bgHex}; font-size: 13px; font-family: monospace;">${score}/100</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #94a3b8;">Tide (NEA)</span>
              <span style="color: #f1f5f9; font-weight: 600;">${suitability?.tideHeightM ? `${suitability.tideHeightM}m` : 'Cycle active'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #94a3b8;">Wind</span>
              <span style="color: #f1f5f9; font-weight: 600;">${suitability?.windSpeedKmh || '--'} km/h ${suitability?.windCompass || ''}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">4-Day Rain</span>
              <span style="color: #38bdf8; font-weight: 600;">${rainText}</span>
            </div>
          </div>

          <button id="btn-inspect-${beach.id}" style="
            width: 100%;
            background: #0284c7;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 7px 10px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
          ">
            Inspect Beach & Forecast
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
  }, [beaches, suitabilities, selectedBeachId, onSelectBeach, activeSport, sportLabel]);

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
        <span>OneMap Basemap</span>
        <span className="text-slate-600">·</span>
        <span className="text-cyan-300 font-semibold">Wave Score: {sportLabel}</span>
      </div>
    </div>
  );
};
