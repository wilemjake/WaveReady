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
import { BeachSpot, LiveStreamStatus, PartnerVendor, SuitabilityBreakdown } from './types/index.ts';
import { fetchAllCoastalData } from './services/coastalApi.ts';
import { calculateDistanceKm, formatDistance } from './utils/distance.ts';
import { computeBeachSuitability } from './utils/suitability.ts';

import { Header } from './components/Header.tsx';
import { ConditionsBanner } from './components/ConditionsBanner.tsx';
import { MapComponent } from './components/MapComponent.tsx';
import { BeachCard } from './components/BeachCard.tsx';
import { BeachDetailModal } from './components/BeachDetailModal.tsx';
import { PartnersSection } from './components/PartnersSection.tsx';
import { MembershipModal } from './components/MembershipModal.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'beaches' | 'partners' | 'membership'>('map');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [selectedBeachId, setSelectedBeachId] = useState<string>(SINGAPORE_BEACHES[0].id);
  const [modalBeach, setModalBeach] = useState<BeachSpot | null>(null);
  const [membershipModalOpen, setMembershipModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('All');
  const [sortMode, setSortMode] = useState<'nearest' | 'suitability'>('nearest');

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
    windSpeed: null
  });
  const [statuses, setStatuses] = useState<{
    tides: LiveStreamStatus;
    uv: LiveStreamStatus;
    heatStress: LiveStreamStatus;
    windDirection: LiveStreamStatus;
    windSpeed: LiveStreamStatus;
  }>({
    tides: { source: 'NEA', endpoint: '/api/tides', state: 'loading', plainMessage: 'Fetching NEA tides...' },
    uv: { source: 'NEA', endpoint: '/api/uv', state: 'loading', plainMessage: 'Fetching NEA UV...' },
    heatStress: { source: 'NEA', endpoint: '/api/heat-stress', state: 'loading', plainMessage: 'Fetching heat stress...' },
    windDirection: { source: 'Data.gov.sg', endpoint: '/api/wind-direction', state: 'loading', plainMessage: 'Fetching wind direction...' },
    windSpeed: { source: 'Data.gov.sg', endpoint: '/api/wind-speed', state: 'loading', plainMessage: 'Fetching wind speed...' }
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
        windSpeed: result.windSpeed
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
    // Prompt geolocation on mount
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

  // Compute beach distances and suitability
  const beachesWithDistance = useMemo(() => {
    return SINGAPORE_BEACHES.map((b) => {
      let distanceKm: number | undefined;
      if (userCoords) {
        distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng);
      }
      return { ...b, distanceKm };
    });
  }, [userCoords]);

  // Compute suitabilities map
  const suitabilities = useMemo(() => {
    const map: Record<string, SuitabilityBreakdown> = {};
    beachesWithDistance.forEach((b) => {
      map[b.id] = computeBeachSuitability(
        b,
        coastalData.tides,
        coastalData.uv,
        coastalData.heatStress,
        coastalData.windSpeed,
        coastalData.windDirection
      );
    });
    return map;
  }, [beachesWithDistance, coastalData]);

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

    // Activity filter
    if (selectedActivity !== 'All') {
      result = result.filter((b) => (b.activities as string[]).includes(selectedActivity));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortMode === 'nearest' && a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      const scoreA = suitabilities[a.id]?.overallScore ?? 0;
      const scoreB = suitabilities[b.id]?.overallScore ?? 0;
      return scoreB - scoreA;
    });

    return result;
  }, [beachesWithDistance, searchQuery, selectedActivity, sortMode, suitabilities]);

  const selectedBeach = useMemo(() => {
    return (
      beachesWithDistance.find((b) => b.id === selectedBeachId) ||
      beachesWithDistance[0]
    );
  }, [beachesWithDistance, selectedBeachId]);

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

      {/* Real-time Environmental Telemetry Status Banner (Sub-goal 4) */}
      <ConditionsBanner
        statuses={statuses}
        isLoading={isLoading}
        onRefresh={loadData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-8">
        {/* Geolocation feedback note if active/denied */}
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

        {/* Tab 1 & Tab 2: Map & Beaches View */}
        {(activeTab === 'map' || activeTab === 'beaches') && (
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
                      Find The Nearest Beach Ready For Your Water Sports & Charter
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
                      Real-time fusion of official NEA coastal tides, Data.gov.sg wind radar, and heat stress WBGT. Backed by certified fishing charter and yacht partners.
                    </p>
                  </div>

                  {/* Highlights Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-4 border-t border-slate-800/80 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Tidal Source</div>
                      <div className="font-bold text-slate-200 mt-0.5">NEA Live</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Wind Radar</div>
                      <div className="font-bold text-cyan-400 mt-0.5">Data.gov.sg</div>
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
                    Southern Islands Corridor
                  </div>
                </div>
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

              {/* Activity Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {[
                  'All',
                  'Fishing Charter',
                  'Jetski & Wake',
                  'Yachting & Sailing',
                  'Kayaking & SUP',
                  'Swimming'
                ].map((act) => (
                  <button
                    key={act}
                    onClick={() => setSelectedActivity(act)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedActivity === act
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>

              {/* View & Sort toggles */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="nearest">Sort: Nearest to Me</option>
                  <option value="suitability">Sort: Highest Suitability</option>
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
                      Showing {filteredBeaches.length} Singapore Coastal Launch Points
                    </span>
                    <span>
                      {userCoords ? 'GPS Sorted' : 'Distance estimated from Center'}
                    </span>
                  </div>

                  {filteredBeaches.map((beach) => (
                    <BeachCard
                      key={beach.id}
                      beach={beach}
                      suitability={suitabilities[beach.id]}
                      partners={PARTNER_VENDORS}
                      isSelected={beach.id === selectedBeachId}
                      onSelect={() => setSelectedBeachId(beach.id)}
                      onOpenDetails={() => setModalBeach(beach)}
                    />
                  ))}

                  {filteredBeaches.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
                      No coastal beaches match your filter criteria. Try selecting another activity.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Verified Charter & Equipment Partners Section (Sub-goal 5) */}
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

      {/* Mandatory Footer with exact data credit (Sub-goal 6) */}
      <Footer />

      {/* Mobile Fixed Bottom Navigation Bar (Mobile Ergonomics) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 md:hidden flex items-center justify-around h-16 px-4">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            activeTab === 'map' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-1">OneMap</span>
        </button>

        <button
          onClick={() => setActiveTab('beaches')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            activeTab === 'beaches' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Waves className="w-5 h-5" />
          <span className="text-[10px] mt-1">Beaches</span>
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
