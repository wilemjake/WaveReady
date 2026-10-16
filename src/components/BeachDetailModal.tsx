import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  Compass,
  Droplets,
  ExternalLink,
  MapPin,
  Phone,
  ShieldCheck,
  Sun,
  Thermometer,
  Waves,
  Wind,
  X
} from 'lucide-react';
import { BeachSpot, SuitabilityBreakdown, TidesData, RainForecastData, PartnerVendor } from '../types/index.ts';
import { formatDistance } from '../utils/distance.ts';

interface BeachDetailModalProps {
  beach: BeachSpot;
  suitability: SuitabilityBreakdown | undefined;
  tidesData: TidesData | null;
  rainData: RainForecastData | null;
  partners: PartnerVendor[];
  onClose: () => void;
  onBookPartner: (partner: PartnerVendor) => void;
}

export const BeachDetailModal: React.FC<BeachDetailModalProps> = ({
  beach,
  suitability,
  tidesData,
  rainData,
  partners,
  onClose,
  onBookPartner
}) => {
  const [activeTab, setActiveTab] = useState<'wave_score' | 'rain' | 'tides' | 'partners'>('wave_score');
  const assignedPartners = partners.filter((p) => beach.partnerIds.includes(p.id));

  const waveScore = suitability?.waveScore ?? 75;
  const rating = suitability?.rating ?? 'Good';

  const badgeStyle =
    waveScore >= 85
      ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40'
      : waveScore >= 70
      ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500/40'
      : waveScore >= 50
      ? 'text-amber-300 bg-amber-500/15 border-amber-500/40'
      : 'text-rose-300 bg-rose-500/15 border-rose-500/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header banner */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>{beach.zone}</span>
              <span>·</span>
              <span className="text-cyan-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {formatDistance(beach.distanceKm)}
              </span>
              <span>·</span>
              <span>Lat {beach.lat.toFixed(4)}, Lng {beach.lng.toFixed(4)}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {beach.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{beach.shortDesc}</p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950/30 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('wave_score')}
            className={`pb-3 text-xs font-semibold px-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'wave_score'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Wave Score Breakdown
          </button>
          <button
            onClick={() => setActiveTab('rain')}
            className={`pb-3 text-xs font-semibold px-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'rain'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            4-Day NEA Rain Forecast
          </button>
          <button
            onClick={() => setActiveTab('tides')}
            className={`pb-3 text-xs font-semibold px-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'tides'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Tidal Schedule
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`pb-3 text-xs font-semibold px-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'partners'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Charters & Gear ({assignedPartners.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'wave_score' && (
            <>
              {/* Primary Wave Score Box */}
              <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Waves className="w-4 h-4 text-cyan-400" />
                    <span>Official WaveReady Wave Score</span>
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-1 tabular-nums flex items-baseline gap-2">
                    <span>{waveScore}</span>
                    <span className="text-sm font-semibold text-slate-400">/100</span>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeStyle}`}>
                      {rating}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    {suitability?.conditionSummary}
                  </div>
                </div>

                <div className="text-xs text-slate-400 sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                  <div>Coastal Environment: <strong className="capitalize text-slate-200">{beach.coastalEnvironment.replace('_', ' ')}</strong></div>
                  <div>Boat Clearance: <strong className="capitalize text-cyan-400">{beach.boatDraftClearance} Draft</strong></div>
                  <div>Legal Swimming: <strong className={beach.swimmingPermitted ? 'text-emerald-400' : 'text-rose-400'}>{beach.swimmingPermitted ? 'Permitted' : 'Prohibited'}</strong></div>
                </div>
              </div>

              {/* Three Core Sports Comparison (Investor Highlight) */}
              {suitability && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Tailored Wave Score by Sport Type
                    </h4>
                    <span className="text-[10px] text-cyan-400 font-semibold">
                      Widened variance based on coastal bathymetry & currents
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Swimming */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">🏊 Swimming</span>
                          <span className={`text-base font-extrabold font-mono ${suitability.sportWaveScores.swimming >= 75 ? 'text-emerald-400' : suitability.sportWaveScores.swimming >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {suitability.sportWaveScores.swimming}
                            <span className="text-[10px] text-slate-500 font-normal">/100</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                          {suitability.sportAdvice.swimming}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-semibold text-slate-400">
                        {beach.swimmingPermitted ? 'Designated swim zone' : 'Port fairway - No swimming'}
                      </div>
                    </div>

                    {/* Kayak */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">🛶 Jetski/Kayak/SUP</span>
                          <span className={`text-base font-extrabold font-mono ${suitability.sportWaveScores.kayak >= 75 ? 'text-emerald-400' : suitability.sportWaveScores.kayak >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {suitability.sportWaveScores.kayak}
                            <span className="text-[10px] text-slate-500 font-normal">/100</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                          {suitability.sportAdvice.kayak}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-semibold text-slate-400">
                        Swell rating: {beach.coastalEnvironment === 'shallow_mangrove_flats' ? 'Flat calm' : 'Active chop'}
                      </div>
                    </div>

                    {/* Fishing Boat */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">🎣 Fishing Boat</span>
                          <span className={`text-base font-extrabold font-mono ${suitability.sportWaveScores.fishing_boat >= 75 ? 'text-emerald-400' : suitability.sportWaveScores.fishing_boat >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {suitability.sportWaveScores.fishing_boat}
                            <span className="text-[10px] text-slate-500 font-normal">/100</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                          {suitability.sportAdvice.fishing_boat}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-semibold text-slate-400">
                        Channel draft: {beach.boatDraftClearance.toUpperCase()} clearance
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings / Cautions if any */}
              {suitability?.warnings && suitability.warnings.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Coastal & Weather Advisories</span>
                  </div>
                  {suitability.warnings.map((warn, i) => (
                    <div
                      key={i}
                      className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200"
                    >
                      {warn}
                    </div>
                  ))}
                </div>
              )}

              {/* Environmental Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Wind Velocity</span>
                  </div>
                  <div className="text-sm font-bold text-white tabular-nums">
                    {suitability?.windSpeedKmh} km/h
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {suitability?.windSpeedKnots} kts · {suitability?.windCompass}
                  </div>
                </div>

                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tide Level</span>
                  </div>
                  <div className="text-sm font-bold text-white tabular-nums">
                    {suitability?.tideHeightM !== null ? `${suitability?.tideHeightM}m` : '--'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {suitability?.tideType}
                  </div>
                </div>

                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Heat Stress (WBGT)</span>
                  </div>
                  <div className="text-sm font-bold text-white tabular-nums">
                    {suitability?.wbgtCelsius}°C
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Category: {suitability?.heatCategory}
                  </div>
                </div>

                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                    <Sun className="w-3.5 h-3.5 text-yellow-400" />
                    <span>UV Radiation</span>
                  </div>
                  <div className="text-sm font-bold text-white tabular-nums">
                    {suitability?.uvIndex}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Band: {suitability?.uvBand}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'rain' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-cyan-400" />
                    <span>NEA Official 4-Day Precipitation Telemetry</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Real-time weather radar fetched via project endpoint <code className="text-cyan-400 font-mono">/api/rain</code>. Crucial for scheduling expensive fishing boat charters and avoiding offshore lightning storms.
                  </p>
                </div>
              </div>

              {rainData?.forecasts && rainData.forecasts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rainData.forecasts.slice(0, 4).map((day, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">
                            {idx === 0 ? 'Today' : day.day_name} ({day.date})
                          </span>
                          {day.forecast.toLowerCase().includes('thunder') ? (
                            <CloudLightning className="w-4 h-4 text-amber-400" />
                          ) : (
                            <CloudRain className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>

                        <div className="text-xs font-semibold text-cyan-300">
                          {day.forecast}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {day.forecast_summary || day.forecast}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] space-y-1 text-slate-300 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Temp:</span>
                          <span>{day.temperature_low}°C to {day.temperature_high}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Wind:</span>
                          <span>{day.wind_speed_low}-{day.wind_speed_high} km/h {day.wind_direction}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Humidity:</span>
                          <span>{day.humidity_low}% - {day.humidity_high}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  Precipitation forecast feed currently loading or unavailable.
                </div>
              )}
            </div>
          )}

          {activeTab === 'tides' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Today's Official Coastal Tide Schedule (NEA)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Direct official telemetry from National Environment Agency Singapore for coastal waters.
                </p>
              </div>

              {tidesData?.today && tidesData.today.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4">Time</th>
                        <th className="py-2.5 px-4">Tide State</th>
                        <th className="py-2.5 px-4">Height (Metres)</th>
                        <th className="py-2.5 px-4">Boating Implication</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-200">
                      {tidesData.today.map((item, idx) => {
                        const isHigh = item.tide_type.toLowerCase() === 'high';
                        const height = parseFloat(item.height_metres);
                        return (
                          <tr key={idx} className="hover:bg-slate-800/30 font-sans">
                            <td className="py-2.5 px-4 font-semibold text-white">
                              {item.tide_time.slice(0, 5)} hrs
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                  isHigh
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {item.tide_type.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-bold text-cyan-400">
                              {item.height_metres} m
                            </td>
                            <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                              {isHigh && height > 2.2
                                ? 'Optimal deep draft yacht cruising & offshore channel transit'
                                : isHigh
                                ? 'Good water depth for all powerboats and jetskis'
                                : height < 1.2
                                ? 'Caution: Shallow reef heads and exposed sandbanks'
                                : 'Moderate water depth'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  No tidal data returned from NEA for today. Please verify connection.
                </div>
              )}
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Verified Operators Serving {beach.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    WaveReady Peace of Mind Guarantee: free reschedule if conditions score falls below 60.
                  </p>
                </div>
              </div>

              {assignedPartners.length > 0 ? (
                <div className="space-y-3">
                  {assignedPartners.map((partner) => (
                    <div
                      key={partner.id}
                      className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4"
                    >
                      <img
                        src={partner.image}
                        alt={partner.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = '/images/partner_fishing_boat.jpg';
                        }}
                        className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                              {partner.category}
                            </span>
                            <span className="text-xs text-slate-300 font-semibold">
                              ★ {partner.rating} ({partner.reviewsCount})
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-white mt-0.5">{partner.name}</h5>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {partner.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                          <span className="text-xs font-bold text-slate-200">
                            {partner.priceStartingFrom}
                          </span>
                          <button
                            onClick={() => onBookPartner(partner)}
                            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>Book / Inquire</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  No registered commercial charter partners for this sector. Public recreational access is open.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>WaveReady Charter Peace of Mind Protection active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
