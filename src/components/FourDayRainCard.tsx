import React from 'react';
import {
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  Sun,
  Thermometer,
  Wind,
  Droplets,
  Calendar
} from 'lucide-react';
import { RainForecastData, RainForecastDay } from '../types/index.ts';

interface FourDayRainCardProps {
  rainData: RainForecastData | null;
}

export const FourDayRainCard: React.FC<FourDayRainCardProps> = ({ rainData }) => {
  if (!rainData?.forecasts || rainData.forecasts.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400">
        4-Day NEA Precipitation Forecast telemetry unavailable.
      </div>
    );
  }

  const getForecastIcon = (forecast: string) => {
    const f = forecast.toLowerCase();
    if (f.includes('thunder') || f.includes('lightning')) {
      return <CloudLightning className="w-5 h-5 text-amber-400" />;
    }
    if (f.includes('rain') || f.includes('shower')) {
      return <CloudRain className="w-5 h-5 text-cyan-400" />;
    }
    if (f.includes('drizzle')) {
      return <CloudDrizzle className="w-5 h-5 text-blue-400" />;
    }
    return <Sun className="w-5 h-5 text-amber-300" />;
  };

  const getRainBadge = (forecast: string) => {
    const f = forecast.toLowerCase();
    if (f.includes('thunder')) {
      return {
        label: 'Squall / Lightning',
        classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      };
    }
    if (f.includes('shower') || f.includes('rain')) {
      return {
        label: 'Coastal Showers',
        classes: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
      };
    }
    return {
      label: 'Fair & Clear',
      classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    };
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>NEA 4-Day Precipitation & Marine Radar</span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">
            Coastal Weather & Rain Outlook
          </h3>
        </div>
        <div className="text-[11px] text-slate-400">
          Source: National Environment Agency (Official Feed)
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rainData.forecasts.slice(0, 4).map((day, idx) => {
          const badge = getRainBadge(day.forecast);
          return (
            <div
              key={idx}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {idx === 0 ? 'Today' : day.day_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {day.date}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {getForecastIcon(day.forecast)}
                  </div>
                </div>

                <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mb-2 ${badge.classes}`}>
                  {badge.label}
                </div>

                <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {day.forecast}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {day.forecast_summary || day.forecast}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-400" />
                    <span>Temp</span>
                  </span>
                  <span className="font-mono tabular-nums">
                    {day.temperature_low}°C - {day.temperature_high}°C
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-cyan-400" />
                    <span>Wind</span>
                  </span>
                  <span className="font-mono tabular-nums">
                    {day.wind_speed_low}-{day.wind_speed_high} km/h {day.wind_direction}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span>Humidity</span>
                  </span>
                  <span className="font-mono tabular-nums">
                    {day.humidity_low}% - {day.humidity_high}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
