import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  Lock,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  Waves,
  X
} from 'lucide-react';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({ isOpen, onClose }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubscribed ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Welcome to WaveReady VIP</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your 1-month free trial has been activated. You now have full access to real-time NEA tidal alarms, Data.gov.sg coastal wind radar, and the Charter Peace of Mind Reschedule Guarantee.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                Access Coastal Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Charter Peace of Mind Protection</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Never Waste an Expensive Charter Day Again
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Enthusiasts fear losing expensive boat charter costs ($800–$2,500/day), location rental and equipment fees. WaveReady consolidates wind, tides, UV, and WBGT heat stress into one decisive suitability verdict.
              </p>
            </div>

            {/* Plan switcher */}
            <div className="flex justify-center mt-6">
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly ($10/mo)
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === 'annual'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Annual ($100/yr)</span>
                  <span className="text-[10px] bg-slate-950/80 text-cyan-300 px-1.5 py-0.5 rounded">
                    Save $20
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="mt-6 bg-slate-950/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                    VIP Coastal Pass
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-1 tabular-nums">
                    {billingCycle === 'monthly' ? '$10' : '$100'}
                    <span className="text-xs text-slate-400 font-normal">
                      {billingCycle === 'monthly' ? ' / month after trial' : ' / year after trial'}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-1 rounded-lg">
                    1 Month Free Trial
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">Cancel anytime in 1 click</div>
                </div>
              </div>

              {/* Benefits checklist */}
              <div className="mt-4 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Peace of Mind Charter Protection:</strong> Free reschedule guarantee on partner boat rentals if tidal or wind suitability drops below 60.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Multi-Source Live Fusion:</strong> High-precision NEA coastal tides, Data.gov.sg wind radar, and coastal WBGT heat stress.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>VIP Vendor Royalties & Discounts:</strong> 10% member discount on offshore fishing charters, jet ski rentals, and foil gear.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>GPS Nearest Beach Finder:</strong> Instant distance and optimal launch route detection tailored for mobile viewports.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSubscribed(true)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Start 1-Month Free Trial Now</span>
              </button>
            </div>

            {/* Business Health Indicators (The numbers that show it works) */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>The Numbers That Show It Works</span>
                <span className="text-emerald-400">Live Platform Stats</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">User Subscriptions</div>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">1,420</div>
                  <div className="text-[10px] text-cyan-400">Active Members</div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Monthly Revenue</div>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">$14,200</div>
                  <div className="text-[10px] text-emerald-400">+18% MoM</div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Active Suppliers</div>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">28 Partners</div>
                  <div className="text-[10px] text-cyan-400">Certified Fleets</div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Supplier Revenue</div>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">$34,800/mo</div>
                  <div className="text-[10px] text-emerald-400">Royalties paid</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
