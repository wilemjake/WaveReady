import React from 'react';
import { AlertCircle, CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-react';
import { LiveStreamStatus } from '../types/index.ts';

interface ConditionsBannerProps {
  statuses: {
    tides: LiveStreamStatus;
    uv: LiveStreamStatus;
    heatStress: LiveStreamStatus;
    windDirection: LiveStreamStatus;
    windSpeed: LiveStreamStatus;
  };
  isLoading: boolean;
  onRefresh: () => void;
}

export const ConditionsBanner: React.FC<ConditionsBannerProps> = ({
  statuses,
  isLoading,
  onRefresh
}) => {
  const streamList = [
    { label: 'Coastal Tides', key: 'tides', ...statuses.tides },
    { label: 'UV Index', key: 'uv', ...statuses.uv },
    { label: 'Heat Stress (WBGT)', key: 'heatStress', ...statuses.heatStress },
    { label: 'Wind Direction', key: 'windDirection', ...statuses.windDirection },
    { label: 'Wind Speed', key: 'windSpeed', ...statuses.windSpeed }
  ];

  const issues = streamList.filter((s) => s.state !== 'live');

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status summary */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-semibold text-slate-100 flex items-center gap-1.5">
              Live Environmental Telemetry:
            </span>

            {streamList.map((stream) => (
              <div key={stream.key} className="flex items-center gap-1.5">
                {stream.state === 'live' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                {stream.state === 'slow' && (
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                {stream.state === 'refused' && (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                {stream.state === 'empty' && (
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                )}
                <span className="text-slate-300">
                  {stream.label}:{' '}
                  <strong
                    className={
                      stream.state === 'live'
                        ? 'text-emerald-400 font-medium'
                        : stream.state === 'slow'
                        ? 'text-amber-400 font-medium'
                        : stream.state === 'refused'
                        ? 'text-rose-400 font-medium'
                        : 'text-yellow-400 font-medium'
                    }
                  >
                    {stream.state === 'live'
                      ? 'Live'
                      : stream.state === 'slow'
                      ? 'Slow (Delayed)'
                      : stream.state === 'refused'
                      ? 'Unavailable'
                      : 'Empty Record'}
                  </strong>
                </span>
              </div>
            ))}
          </div>

          {/* Action button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Fetching feeds...' : 'Sync Feeds'}</span>
            </button>
          </div>
        </div>

        {/* Plain words advisory if any stream is refused, slow, or empty */}
        {issues.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1">
            {issues.map((issue) => (
              <div
                key={issue.key}
                className="text-[11px] flex items-start gap-1.5 text-amber-300/90"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  <strong>{issue.label}:</strong> {issue.plainMessage}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
