import React, { useState } from 'react';
import {
  Anchor,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Filter,
  LifeBuoy,
  Phone,
  Sailboat,
  ShieldCheck,
  Star,
  Users
} from 'lucide-react';
import { PartnerVendor, BeachSpot } from '../types/index.ts';

interface PartnersSectionProps {
  partners: PartnerVendor[];
  beaches: BeachSpot[];
  onSelectBeachById: (id: string) => void;
}

export const PartnersSection: React.FC<PartnersSectionProps> = ({
  partners,
  beaches,
  onSelectBeachById
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inquiryPartner, setInquiryPartner] = useState<PartnerVendor | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState<boolean>(false);
  const [inquirySubmitted, setInquirySubmitted] = useState<boolean>(false);

  // Form states
  const [inquiryDate, setInquiryDate] = useState<string>('');
  const [inquiryDuration, setInquiryDuration] = useState<string>('4 hours');
  const [inquiryName, setInquiryName] = useState<string>('');
  const [inquiryContact, setInquiryContact] = useState<string>('');

  const filteredPartners =
    selectedCategory === 'All'
      ? partners
      : partners.filter((p) => p.category === selectedCategory);

  const categories = [
    'All',
    'Fishing Charter',
    'Boat & Yacht Rental',
    'Water Sports Equipment'
  ];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setInquiryPartner(null);
    }, 2500);
  };

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Anchor className="w-4 h-4" />
            <span>Verified Marine Partners & Fleets</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            High-End Charters & Equipment Rentals
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Book certified sportfishing vessels, luxury catamarans, and pro foil & paddle gear. Backed by our Weather & Tidal Peace of Mind Guarantee.
          </p>
        </div>

        <button
          onClick={() => setShowSupplierModal(true)}
          className="self-start md:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
          <span>Partner With WaveReady</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Image banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img
                  src={partner.image}
                  alt={partner.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-cyan-300 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {partner.category}
                </div>
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-bold text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{partner.rating}</span>
                  <span className="text-slate-400 text-[10px]">({partner.reviewsCount})</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <Sailboat className="w-3 h-3 text-cyan-400" />
                  <span>{partner.hub}</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {partner.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {partner.description}
                </p>

                {/* Fleet / Gear specs */}
                <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Equipment & Vessel Highlights
                  </div>
                  {partner.fleetOrGear.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom action row */}
            <div className="p-5 pt-0">
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Rates from</div>
                  <div className="text-sm font-bold text-cyan-400 tabular-nums">
                    {partner.priceStartingFrom}
                  </div>
                </div>

                <button
                  onClick={() => setInquiryPartner(partner)}
                  className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Inquire Charter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking / Inquiry Modal */}
      {inquiryPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setInquiryPartner(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>

            {inquirySubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Inquiry Dispatched!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {inquiryPartner.name} has received your reservation request for the Singapore coastal sector. The skipper will contact you shortly.
                </p>
              </div>
            ) : (
              <div>
                <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">
                  Charter & Rental Booking Inquiry
                </div>
                <h3 className="text-xl font-bold text-white">{inquiryPartner.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Base rate: {inquiryPartner.priceStartingFrom} · Includes WaveReady Peace of Mind Protection
                </p>

                <form onSubmit={handleInquirySubmit} className="mt-5 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={inquiryDate}
                      onChange={(e) => setInquiryDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Charter Duration
                      </label>
                      <select
                        value={inquiryDuration}
                        onChange={(e) => setInquiryDuration(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option>2 hours</option>
                        <option>4 hours (Half-Day)</option>
                        <option>6 hours</option>
                        <option>8 hours (Full-Day)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Your Contact No.
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+65 9123 4567"
                        value={inquiryContact}
                        onChange={(e) => setInquiryContact(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      >
                      </input>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Captain Tan"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Peace of Mind Guarantee:</strong> If the WaveReady tidal or wind suitability score drops below 60 on your selected day, your booking can be rescheduled with zero fee.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    Submit Booking Inquiry
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supplier Registration Portal Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setShowSupplierModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>

            <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">
              Supplier Partner Program
            </div>
            <h3 className="text-xl font-bold text-white">
              List Your Marine Fleet or Equipment
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Join WaveReady to reach high-net-worth water sports enthusiasts and earn guaranteed charter bookings with integrated royalty payouts.
            </p>

            {/* Supplier Metrics */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Active Suppliers</span>
                </div>
                <div className="text-lg font-bold text-white tabular-nums mt-0.5">28 Operators</div>
                <div className="text-[10px] text-emerald-400">+4 joined this quarter</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Supplier Revenue</span>
                </div>
                <div className="text-lg font-bold text-white tabular-nums mt-0.5">$34,800/mo</div>
                <div className="text-[10px] text-cyan-400">Average $1,240/operator</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="font-semibold text-white">Why Marine Operators Partner With Us:</div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Fill empty weekday charter slots and bad-weather rescheduling automatically.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero upfront listing fees; transparent 8% platform royalty on completed runs.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Direct exposure to high-end fishing charter and yacht racing members.</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Supplier application received! Our maritime partner liaison will contact you within 24 hours.');
                setShowSupplierModal(false);
              }}
              className="w-full mt-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Apply as Certified Vendor
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
