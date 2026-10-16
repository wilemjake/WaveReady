import React from 'react';
import { ArrowUpRight, Compass, Droplets, MapPin, Sun, Wind } from 'lucide-react';
import { BeachSpot, SuitabilityBreakdown, PartnerVendor } from '../types/index.ts';
import { formatDistance } from '../utils/distance.ts';

interface BeachCardProps {
  beach: BeachSpot;
  suitability: SuitabilityBreakdown | undefined;
  partners: PartnerVendor[];
  isSelected: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
}

export const BeachCard: React.FC<BeachCardProps> = ({
  beach,
  suitability,
  partners,
  isSelected,
  onSelect,
  onOpenDetails
}) => {
  const score = suitability?.overallScore ?? 80;
  const rating = suitability?.rating ?? 'Good';
  const assignedPartners = partners.filter((p) => beach.partnerIds.includes(p.id));

  const badgeColor =
    rating === 'Prime'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : rating === 'Good'
      ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
      : rating === 'Moderate'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl p-5 border transition-all cursor-pointer ${
        isSelected
          ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top row: Title, Zone, and Suitability Score */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>{beach.zone}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-cyan-400">
              <MapPin className="w-3 h-3" />
              {formatDistance(beach.distanceKm)}
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
            {beach.name}
          </h3>
        </div>

        <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold shrink-0 tabular-nums ${badgeColor}`}>
          {score}/100 · {rating}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
        {beach.shortDesc}
      </p>

      {/* Conditions grid */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
        <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>Wind</span>
          </div>
          <div className="font-semibold text-slate-200 mt-0.5 tabular-nums">
            {suitability ? `${suitability.windSpeedKmh} km/h` : '--'}
          </div>
          <div className="text-[10px] text-slate-400">
            {suitability ? suitability.windCompass : 'Station reading'}
          </div>
        </div>

        <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span>Tide (NEA)</span>
          </div>
          <div className="font-semibold text-slate-200 mt-0.5 tabular-nums">
            {suitability?.tideHeightM !== null ? `${suitability?.tideHeightM}m` : '--'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {suitability?.tideType || 'Active'}
          </div>
        </div>

        <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Heat & UV</span>
          </div>
          <div className="font-semibold text-slate-200 mt-0.5 tabular-nums">
            {suitability ? `${suitability.wbgtCelsius}°C` : '--'}
          </div>
          <div className="text-[10px] text-slate-400">
            UV {suitability?.uvIndex ?? '--'}
          </div>
        </div>
      </div>

      {/* Supported activities */}
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/50">
        {beach.activities.map((act) => (
          <span
            key={act}
            className="text-[10px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md"
          >
            {act}
          </span>
        ))}
      </div>

      {/* Bottom bar: Partner link & Details trigger */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs">
        <span className="text-[11px] text-slate-400 truncate">
          {assignedPartners.length > 0
            ? `${assignedPartners.length} partner charter/gear vendors`
            : 'Open coastal access'}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Tides & Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
