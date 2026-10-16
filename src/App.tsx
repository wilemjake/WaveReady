import React, { useEffect, useMemo, useState } from 'react';
import {
  Anchor,
  Compass,
  Filter,
  Layers,
  List,
  Map,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Waves,
  Wind
} from 'lucide-react';
import { SINGAPORE_BEACHES } from './data/beaches.ts';
import { PARTNER_VENDORS } from './data/partners.ts';
import { BeachSpot, LiveStreamStatus, PartnerVendor, SuitabilityBreakdown, SportType } from './types/index.ts';
import { fetchAllCoastalData } from './services/coastalApi.ts';
import { calculateDistanceKm, formatDistance } from './utils/distance.ts';
import { computeBeachSuitability } from './utils/suitability.ts';

import { Header } from './components/Header.tsx';
import { ConditionsBanner } from './components/ConditionsBanner.tsx';
import { MapComponent } from './components/MapComponent.tsx';
import { BeachCard } from './components/BeachCard.tsx';
import { BeachDetailModal } from './components/BeachDetailModal.tsx';
import { FourDayRainCard } from './components/FourDayRainCard.tsx';
import { PartnersSection } from './components/PartnersSection.tsx';
import { MembershipModal } from './components/MembershipModal.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'partners' | 'membership'>('map');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [selectedBeachId, setSelectedBeachId] = useState<string>(SINGAPORE_BEACHES[0].id);
  const [modalBeach, setModalBeach] = useState<BeachSpot | null>(null);
  const [membershipModalOpen, setMembershipModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSport, setActiveSport] = useState<SportType>('all');
  const [sortMode, setSortMode] = useState<'wave_score' | 'nearest'>('wave_score');

  // GPS User Coordinates
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  // Live coastal telemetry states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [coastalData, setCoastalData] = useState<any>({
    tides: null,
    uv: null,
    heatStress: null,
    windDirection: null,
    windSpeed: null,
    rain: null
  });
  const [statuses, setStatuses] = useState<{
    tides: LiveStreamStatus;
    uv: LiveStreamStatus;
    heatStress: LiveStreamStatus;
    windDirection: LiveStreamStatus;
    windSpeed: LiveStreamStatus;
    rain?: LiveStreamStatus;
  }>({
    tides: { source: 'NEA', endpoint: '/api/tides', state: 'loading', plainMessage: 'Fetching NEA tides...' },
    uv: { source: 'NEA', endpoint: '/api/uv', state: 'loading', plainMessage: 'Fetching NEA UV...' },
    heatStress: { source: 'NEA', endpoint: '/api/heat-stress', state: 'loading', plainMessage: 'Fetching heat stress...' },
    windDirection: { source: 'Data.gov.sg', endpoint: '/api/wind-direction', state: 'loading', plainMessage: 'Fetching wind direction...' },
    windSpeed: { source: 'Data.gov.sg', endpoint: '/api/wind-speed', state: 'loading', plainMessage: 'Fetching wind speed...' },
    rain: { source: 'NEA', endpoint: '/api/rain', state: 'loading', plainMessage: 'Fetching 4-day rain forecast...' }
  });

  // Load telemetry data from API
  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await fetchAllCoastalData();
      setCoastalData({
        tides: result.tides,
        uv: result.uv,
        heatStress: result.heatStress,
        windDirection: result.windDirection,
        windSpeed: result.windSpeed,
        rain: result.rain
      });
      setStatuses(result.statuses);
    } catch (err: any) {
      console.error('Failed to load coastal telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    handleLocateUser();
  }, []);

  // Geolocation detector
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Geolocation is not supported by your browser.');
      return;
    }
    setGeoMessage('Locating your position in Singapore...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setGeoMessage(null);
      },
      (err) => {
        setGeoMessage('Location permission denied or unavailable. Using central Singapore reference.');
      },
      { timeout: 8000 }
    );
  };

  // Compute beach distances
  const beachesWithDistance = useMemo(() => {
    return SINGAPORE_BEACHES.map((b) => {
      let distanceKm: number | undefined;
      if (userCoords) {
        distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng);
      }
      return { ...b, distanceKm };
    });
  }, [userCoords]);

  // Compute widened Wave Scores based on active sport
  const suitabilities = useMemo(() => {
    const map: Record<string, SuitabilityBreakdown> = {};
    beachesWithDistance.forEach((b) => {
      map[b.id] = computeBeachSuitability(
        b,
        coastalData.tides,
        coastalData.uv,
        coastalData.heatStress,
        coastalData.windSpeed,
        coastalData.windDirection,
        coastalData.rain,
        activeSport
      );
    });
    return map;
  }, [beachesWithDistance, coastalData, activeSport]);

  // Filter & Sort beaches
  const filteredBeaches = useMemo(() => {
    let result = [...beachesWithDistance];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.zone.toLowerCase().includes(q) ||
          b.shortDesc.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortMode === 'nearest' && a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      const scoreA = suitabilities[a.id]?.waveScore ?? 0;
      const scoreB = suitabilities[b.id]?.waveScore ?? 0;
      return scoreB - scoreA;
    });

    return result;
  }, [beachesWithDistance, searchQuery, sortMode, suitabilities]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'membership') setMembershipModalOpen(true);
        }}
        onLocateUser={handleLocateUser}
        userCoords={userCoords}
        onOpenMembership={() => setMembershipModalOpen(true)}
      />

      {/* Real-time Environmental Telemetry Status Banner */}
      <ConditionsBanner
        statuses={statuses}
        isLoading={isLoading}
        onRefresh={loadData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-8">
        {/* Geolocation feedback note */}
        {geoMessage && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{geoMessage}</span>
            </div>
            <button
              onClick={() => setGeoMessage(null)}
              className="text-slate-500 hover:text-white text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Coastal Map View */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Hero Quick Banner */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
                      <Waves className="w-3.5 h-3.5" />
                      <span>Singapore Live Coastal Intelligence</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                      Find The Best Beach For Water Sports & Fishing Charters
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
                      Instant multi-source telemetry combining official NEA coastal tides, Data.gov.sg wind radar, and the new 4-day precipitation forecast into our proprietary <strong>Wave Score (0–100)</strong>.
                    </p>
                  </div>

                  {/* Highlights Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-4 border-t border-slate-800/80 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Scoring Engine</div>
                      <div className="font-bold text-cyan-400 mt-0.5">Wave Score</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Rain Radar</div>
                      <div className="font-bold text-slate-200 mt-0.5">NEA 4-Day Live</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Basemap</div>
                      <div className="font-bold text-slate-200 mt-0.5">OneMap SLA</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Guarantee</div>
                      <div className="font-bold text-emerald-400 mt-0.5">Peace of Mind</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 relative h-48 lg:h-auto min-h-[200px] overflow-hidden">
                  <img
                    src="/src/assets/images/hero_yacht_coastal_1792134867117.jpg"
                    alt="WaveReady Singapore Coastal Cruising"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-300">
                    Southern Islands Marine Corridor
                  </div>
                </div>
              </div>
            </div>

            {/* Investor & Sport Customizer Panel: Tailored Wave Score Selector */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Tailor Wave Score By Sport Type</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click a sport below to re-score every Singapore beach according to its unique hydrodynamics and vessel clearance:
                  </p>
                </div>

                <div className="text-xs text-slate-500 hidden md:block">
                  Actionable Investor Demo Mode
                </div>
              </div>

              {/* Sport Type Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setActiveSport('all')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                    activeSport === 'all'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Waves className="w-4 h-4" />
                  <span>All Water Sports</span>
                </button>

                <button
                  onClick={() => setActiveSport('swimming')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                    activeSport === 'swimming'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>🏊 Swimming</span>
                </button>

                <button
                  onClick={() => setActiveSport('kayak')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                    activeSport === 'kayak'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>🛶 Jetski/Kayak/SUP</span>
                </button>

                <button
                  onClick={() => setActiveSport('fishing_boat')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                    activeSport === 'fishing_boat'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>🎣 Fishing Boat</span>
                </button>
              </div>

              {/* Informative helper note highlighting score spread */}
              <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/60">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                <span>
                  Notice how <strong>Sentosa</strong> scores highest for Swimming (94), while <strong>Southern Islands / West Coast</strong> score highest for Fishing Boats (96), demonstrating high bathymetric differentiation across Singapore.
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Sentosa, East Coast, Lazarus, Changi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* View & Sort toggles */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="wave_score">Sort: Highest Wave Score</option>
                  <option value="nearest">Sort: Nearest to Me</option>
                </select>

                <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setViewMode('split')}
                    title="Split Map & List"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'split' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    title="Full Map View"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'map' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Map className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="List View"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'list' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Split / Map / List Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Column */}
              {(viewMode === 'split' || viewMode === 'map') && (
                <div
                  className={`${
                    viewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'
                  } h-[460px] lg:h-[620px] sticky top-20`}
                >
                  <MapComponent
                    beaches={filteredBeaches}
                    suitabilities={suitabilities}
                    selectedBeachId={selectedBeachId}
                    activeSport={activeSport}
                    onSelectBeach={(b) => {
                      setSelectedBeachId(b.id);
                      setModalBeach(b);
                    }}
                    userCoords={userCoords}
                  />
                </div>
              )}

              {/* Beaches List Column */}
              {(viewMode === 'split' || viewMode === 'list') && (
                <div
                  className={`${
                    viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'
                  } space-y-4 max-h-[620px] overflow-y-auto pr-1`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>
                      {filteredBeaches.length} Singapore Locations (Wave Score Range: 24–96)
                    </span>
                    <span className="font-mono text-cyan-400 font-semibold">
                      Sport: {activeSport === 'all' ? 'Composite' : activeSport.replace('_', ' ')}
                    </span>
                  </div>

                  {filteredBeaches.map((beach) => (
                    <BeachCard
                      key={beach.id}
                      beach={beach}
                      suitability={suitabilities[beach.id]}
                      partners={PARTNER_VENDORS}
                      isSelected={beach.id === selectedBeachId}
                      activeSport={activeSport}
                      onSelect={() => setSelectedBeachId(beach.id)}
                      onOpenDetails={() => setModalBeach(beach)}
                    />
                  ))}

                  {filteredBeaches.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
                      No coastal beaches match your filter criteria.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* NEA 4-Day Rain Forecast Widget */}
            <div className="pt-2">
              <FourDayRainCard rainData={coastalData.rain} />
            </div>
          </div>
        )}

        {/* Tab 3: Verified Charter & Equipment Partners Section */}
        {activeTab === 'partners' && (
          <PartnersSection
            partners={PARTNER_VENDORS}
            beaches={SINGAPORE_BEACHES}
            onSelectBeachById={(id) => {
              setSelectedBeachId(id);
              setActiveTab('map');
            }}
          />
        )}
      </main>

      {/* Beach Detail Modal */}
      {modalBeach && (
        <BeachDetailModal
          beach={modalBeach}
          suitability={suitabilities[modalBeach.id]}
          tidesData={coastalData.tides}
          rainData={coastalData.rain}
          partners={PARTNER_VENDORS}
          onClose={() => setModalBeach(null)}
          onBookPartner={(p) => {
            setModalBeach(null);
            setActiveTab('partners');
          }}
        />
      )}

      {/* Membership & Peace of Mind Modal */}
      <MembershipModal
        isOpen={membershipModalOpen}
        onClose={() => setMembershipModalOpen(false)}
      />

      {/* Mandatory Footer with exact data credit */}
      <Footer />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 md:hidden flex items-center justify-around h-16 px-4">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            activeTab === 'map' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-1">Coastal Map</span>
        </button>

        <button
          onClick={() => setActiveTab('partners')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            activeTab === 'partners' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Anchor className="w-5 h-5" />
          <span className="text-[10px] mt-1">Charters</span>
        </button>

        <button
          onClick={() => setMembershipModalOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-cyan-400 cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] mt-1">VIP Pass</span>
        </button>
      </nav>
    </div>
  );
}
