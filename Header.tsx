import React, { useRef, useState } from 'react';
import { Search, MapPin, ChevronDown, ShoppingBag, Heart, X, Sparkles, ShieldAlert } from 'lucide-react';
import { PageRoute } from '../types';

interface HeaderProps {
  activeRoute: PageRoute;
  onNavigate: (route: PageRoute) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  wishlistCount: number;
  bagCount: number;
  onToggleSecretAdmin: () => void;
  isAdminMode: boolean;
  userPincode: string;
  onUpdatePincode: (newPincode: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeRoute,
  onNavigate,
  searchQuery,
  onSearchChange,
  wishlistCount,
  bagCount,
  onToggleSecretAdmin,
  isAdminMode,
  userPincode,
  onUpdatePincode
}) => {
  const tapTimesRef = useRef<number[]>([]);
  const [tapNotice, setTapNotice] = useState<string | null>(null);
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [tempPincode, setTempPincode] = useState(userPincode);

  // 3 Taps within 2 Seconds Secret Logic
  const handleLogoTap = () => {
    const now = Date.now();
    const recent = tapTimesRef.current.filter((t) => now - t <= 2000);
    recent.push(now);
    tapTimesRef.current = recent;

    if (recent.length === 2) {
      setTapNotice("⚡ Tap 1 more time for Secret Admin");
      setTimeout(() => setTapNotice(null), 1800);
    } else if (recent.length >= 3) {
      tapTimesRef.current = [];
      setTapNotice(isAdminMode ? "Exiting Admin..." : "🔓 Secret Admin Panel Activated!");
      setTimeout(() => setTapNotice(null), 2000);
      onToggleSecretAdmin();
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-[28px] sm:top-[30px] z-40 shadow-xs">
      <div className="px-3.5 pt-2.5 pb-1.5 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="relative">
          <button
            onClick={handleLogoTap}
            className="group cursor-pointer select-none active:scale-95 transition-transform flex items-center gap-1.5 focus:outline-none"
          >
            <span className="text-2xl font-black tracking-tight leading-none">
              <span className="text-[#006666]">KK</span>
              <span className="text-black font-extrabold">fashion</span>
            </span>
            {isAdminMode && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                <ShieldAlert className="w-2.5 h-2.5" /> ADMIN
              </span>
            )}
          </button>

          {tapNotice && (
            <div className="absolute top-8 left-0 z-50 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {tapNotice}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => onNavigate('home')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md ${activeRoute === 'home' ? 'text-[#006666] bg-teal-50' : 'text-slate-600'}`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="px-2.5 py-1 text-xs font-semibold rounded-md text-slate-600"
          >
            Products
          </button>
          <button
            onClick={() => onNavigate('checkout')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md ${activeRoute === 'checkout' ? 'text-[#006666] bg-teal-50' : 'text-slate-600'}`}
          >
            Order
          </button>

          <button onClick={() => onNavigate('wishlist')} className="relative p-1 text-slate-700 ml-1">
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          <button onClick={() => onNavigate('bag')} className="relative p-1 text-slate-700">
            <ShoppingBag className="w-4 h-4" />
            {bagCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#006666] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {bagCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3.5 pb-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for polo, kurta, denim, sarees..."
            className="w-full bg-slate-100 border border-slate-200 text-xs pl-9 pr-8 py-2 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-[#006666]"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="absolute right-2.5 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Location Pin */}
      <div className="px-3.5 pb-2 pt-0.5 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setShowPincodeModal(true)}
          className="flex items-center gap-1 hover:text-[#006666] cursor-pointer"
        >
          <MapPin className="w-3 h-3 text-[#006666]" />
          <span>Deliver to <strong className="text-slate-900 font-semibold">Kolkata {userPincode}</strong></span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
          Fast Delivery
        </span>
      </div>

      {/* Pincode Modal */}
      {showPincodeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-4">
            <div className="flex justify-between items-center pb-2 border-b mb-3">
              <h3 className="font-bold text-sm text-slate-900">Delivery Pincode</h3>
              <button onClick={() => setShowPincodeModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <input
              type="text"
              maxLength={6}
              value={tempPincode}
              onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 text-sm border rounded-lg text-center font-bold tracking-widest outline-none mb-3"
            />
            <button
              onClick={() => {
                if (tempPincode.length === 6) {
                  onUpdatePincode(tempPincode);
                  setShowPincodeModal(false);
                }
              }}
              className="w-full py-2 text-xs font-bold bg-[#006666] text-white rounded-lg"
            >
              Update Location
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
