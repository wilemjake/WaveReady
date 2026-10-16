import React from 'react';
import { Compass, MapPin, ShieldCheck, Waves } from 'lucide-react';

interface HeaderProps {
  activeTab: 'map' | 'beaches' | 'partners' | 'membership';
  setActiveTab: (tab: 'map' | 'beaches' | 'partners' | 'membership') => void;
  onLocateUser: () => void;
  userCoords: { lat: number; lng: number } | null;
  onOpenMembership: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onLocateUser,
  userCoords,
  onOpenMembership
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Waves className="w-5 h-5" />
          </div>
          <button
            onClick={() => setActiveTab('map')}
            className="text-left cursor-pointer group"
          >
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              WaveReady
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('map')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'map'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Coastal Map
          </button>
          <button
            onClick={() => setActiveTab('beaches')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'beaches'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Beaches & Tides
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'partners'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Charters & Rentals
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'membership'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            VIP Peace of Mind
          </button>
        </nav>

        {/* Zone 3: Primary Action & GPS Locator */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onLocateUser}
            title={userCoords ? 'GPS Location active' : 'Detect nearest beach'}
            className={`h-9 px-3 rounded-lg text-xs font-medium flex items-center gap-2 border transition-colors cursor-pointer ${
              userCoords
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {userCoords ? 'GPS Active' : 'Find Nearest'}
            </span>
          </button>

          <button
            onClick={onOpenMembership}
            className="h-9 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1-Mo Free Trial</span>
          </button>
        </div>
      </div>
    </header>
  );
};
