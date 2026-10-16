import React from 'react';
import { Waves } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-xs text-slate-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm">WaveReady</span>
              <span className="text-slate-500 text-xs ml-2">Singapore Coastal Intelligence</span>
            </div>
          </div>

          {/* Sub-goal 6: Required exact data source credit */}
          <div className="text-center md:text-right space-y-1">
            <div className="text-slate-200 font-semibold">
              Data: NEA, Data.gov.sg
            </div>
            <div className="text-[11px] text-slate-500">
              Basemap tiles &copy; OneMap &middot; Singapore Land Authority (SLA)
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>&copy; {new Date().getFullYear()} WaveReady Technologies. Built for Singapore maritime enthusiasts and fishing charters.</p>
          <div className="flex items-center gap-4">
            <span>Peace of Mind Guarantee</span>
            <span>·</span>
            <span>Maritime Safety Standards</span>
            <span>·</span>
            <span>Live Serverless Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
