import React from 'react';
import {
  ArrowUpRight,
  CloudLightning,
  CloudRain,
  Compass,
  Droplets,
  MapPin,
  Sailboat,
  Sun,
  Waves,
  Wind
} from 'lucide-react';
import { BeachSpot, SuitabilityBreakdown, PartnerVendor, SportType } from '../types/index.ts';
import { formatDistance } from '../utils/distance.ts';

interface BeachCardProps {
  beach: BeachSpot;
  suitability: SuitabilityBreakdown | undefined;
  partners: PartnerVendor[];
  isSelected: boolean;
  activeSport: SportType;
  onSelect: () => void;
  onOpenDetails: () => void;
}

export const BeachCard: React.FC<BeachCardProps> = ({
  beach,
  suitability,
  partners,
  isSelected,
  activeSport,
  onSelect,
  onOpenDetails
}) => {
  const score = suitability?.waveScore ?? 75;
  const rating = suitability?.rating ?? 'Good';
  const assignedPartners = partners.filter((p) => beach.partnerIds.includes(p.id));

  // Dynamic widened color badge
  const badgeStyle =
    score >= 85
      ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/20'
      : score >= 70
      ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500/40'
      : score >= 50
      ? 'text-amber-300 bg-amber-500/15 border-amber-500/40'
      : 'text-rose-300 bg-rose-500/15 border-rose-500/40';

  const sportLabel =
    activeSport === 'swimming'
      ? 'Swimming'
      : activeSport === 'kayak'
      ? 'Jetski/Kayak/SUP'
      : activeSport === 'fishing_boat'
      ? 'Fishing Boat'
      : 'Composite';

  const rainForecast = suitability?.rainForecastToday;
  const isRainy = rainForecast?.forecast?.toLowerCase().includes('rain') || rainForecast?.forecast?.toLowerCase().includes('thunder');

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl p-5 border transition-all cursor-pointer ${
        isSelected
          ? 'bg-slate-900 border-cyan-500/80 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/50'
          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top row: Title, Zone, and Widened Wave Score */}
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

        {/* Wave Score Primary Indicator */}
        <div className="text-right shrink-0">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            Wave Score · {sportLabel}
          </div>
          <div className={`px-2.5 py-1 rounded-xl border text-xs font-bold tabular-nums inline-flex items-center gap-1.5 ${badgeStyle}`}>
            <Waves className="w-3.5 h-3.5 shrink-0" />
            <span className="text-sm font-extrabold">{score}</span>
            <span className="text-[10px] opacity-80">/100 · {rating}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
        {beach.shortDesc}
      </p>

      {/* Tailored Sport breakdown bar */}
      {suitability && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className={`p-1.5 rounded-lg border ${activeSport === 'swimming' ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-950/40 border-slate-800/60'}`}>
            <span className="text-slate-400 block text-[10px]">Swimming</span>
            <strong className={`font-mono text-xs ${suitability.sportWaveScores.swimming >= 75 ? 'text-emerald-400' : suitability.sportWaveScores.swimming >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
              {suitability.sportWaveScores.swimming}
            </strong>
          </div>
          <div className={`p-1.5 rounded-lg border ${activeSport === 'kayak' ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-950/40 border-slate-800/60'}`}>
            <span className="text-slate-400 block text-[10px] truncate">Jetski/Kayak/SUP</span>
            <strong className={`font-mono text-xs ${suitability.sportWaveScores.kayak >= 75 ? 'text-emerald-400' : suitability.sportWaveScores.kayak >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
              {suitability.sportWaveScores.kayak}
            </strong>
          </div>
          <div className={`p-1.5 rounded-lg border ${activeSport === 'fishing_boat' ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-950/40 border-slate-800/60'}`}>
            <span className="text-slate-400 block text-[10px]">Fishing Boat</span>
            <strong className={`font-mono text-xs ${suitability.sportWaveScores.fishing_boat >= 75 ? 'text-emerald-400' : suitability.sportWaveScores.fishing_boat >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
              {suitability.sportWaveScores.fishing_boat}
            </strong>
          </div>
        </div>
      )}

      {/* Real-time telemetry snapshot */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
        <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800/60">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>Wind</span>
          </div>
          <div className="font-semibold text-slate-200 mt-0.5 tabular-nums">
            {suitability ? `${suitability.windSpeedKmh} km/h` : '--'}
          </div>
          <div className="text-[10px] text-slate-400">
            {suitability ? suitability.windCompass : 'Station sensor'}
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800/60">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span>Tide (NEA)</span>
          </div>
          <div className="font-semibold text-slate-200 mt-0.5 tabular-nums">
            {suitability?.tideHeightM !== null ? `${suitability?.tideHeightM}m` : '--'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {suitability?.tideType || 'Cycle active'}
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800/60">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            {isRainy ? <CloudLightning className="w-3 h-3 text-amber-400" /> : <Sun className="w-3 h-3 text-amber-300" />}
            <span>NEA Rain</span>
          </div>
          <div className="font-semibold text-slate-200 mt-0.5 text-[11px] truncate">
            {rainForecast?.forecast || 'Clear'}
          </div>
          <div className="text-[10px] text-slate-400">
            {rainForecast ? `${rainForecast.temperature_low}-${rainForecast.temperature_high}°C` : 'Telemetry live'}
          </div>
        </div>
      </div>

      {/* Bottom bar: Partner link & Details trigger */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs">
        <span className="text-[11px] text-slate-400 truncate">
          {assignedPartners.length > 0
            ? `${assignedPartners.length} partner charter/gear vendors`
            : 'Open public water access'}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Tides, Rain & Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
