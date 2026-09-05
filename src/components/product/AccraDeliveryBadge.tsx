import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  Sparkles, 
  Zap, 
  ShieldCheck,
  Building2,
  Navigation
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export interface AccraLocationZone {
  id: string;
  name: string;
  suburbs: string[];
  zoneLabel: string;
  minHours: number;
  maxHours: number;
  cutoffHour: number; // 24-hr format (e.g. 17 for 5:00 PM)
  expressFee: number;
  courierType: string;
}

export const ACCRA_ZONES: AccraLocationZone[] = [
  {
    id: 'zone-1-east',
    name: 'East Legon, Botwe & Adjiringanor',
    suburbs: ['East Legon', 'Ashaley Botwe', 'Botwe School Junction', 'Adjiringanor', 'Ogbojo', 'Nmai Dzorn', 'School Junction', 'Zoomlion Area'],
    zoneLabel: 'Hub Zone 1 (Fastest Dispatch)',
    minHours: 1,
    maxHours: 2,
    cutoffHour: 18,
    expressFee: 25,
    courierType: 'Direct Motorbike Express'
  },
  {
    id: 'zone-2-central',
    name: 'Airport, Dzorwulu & Roman Ridge',
    suburbs: ['Airport Residential', 'Airport Hills', 'Dzorwulu', 'Roman Ridge', 'Ridge', '37 Military Hospital Area'],
    zoneLabel: 'Prime Central Zone',
    minHours: 1.5,
    maxHours: 2.5,
    cutoffHour: 17.5,
    expressFee: 30,
    courierType: 'Dedicated Courier Rider'
  },
  {
    id: 'zone-2-south',
    name: 'Osu, Cantonments & Labone',
    suburbs: ['Osu', 'Cantonments', 'Labone', 'South La', 'Labadi', 'Trade Fair'],
    zoneLabel: 'Prime Central & Coastal',
    minHours: 2,
    maxHours: 3,
    cutoffHour: 17,
    expressFee: 30,
    courierType: 'Dedicated Courier Rider'
  },
  {
    id: 'zone-2-spintex',
    name: 'Spintex & East Airport',
    suburbs: ['Spintex Road', 'East Airport', 'Manet', 'Batsonaa', 'Regimanuel', 'Texpo', 'Kasapreko'],
    zoneLabel: 'Corridor Express',
    minHours: 2,
    maxHours: 3,
    cutoffHour: 17,
    expressFee: 30,
    courierType: 'Dedicated Courier Rider'
  },
  {
    id: 'zone-1-north',
    name: 'Madina, Haatso & Legon Campus',
    suburbs: ['Madina', 'Haatso', 'Legon (UG Campus)', 'Agogba', 'Atomic', 'Kwabenya', 'Dome'],
    zoneLabel: 'North Accra Express',
    minHours: 1.5,
    maxHours: 2.5,
    cutoffHour: 18,
    expressFee: 25,
    courierType: 'Direct Motorbike Express'
  },
  {
    id: 'zone-3-west',
    name: 'Achimota, Abelemkpe & Lapaz',
    suburbs: ['Achimota', 'Abelemkpe', 'West Legon', 'Lapaz', 'Abofu', 'Tesano', 'Alajo'],
    zoneLabel: 'West Central Zone',
    minHours: 2.5,
    maxHours: 3.5,
    cutoffHour: 16.5,
    expressFee: 35,
    courierType: 'Standard Courier Dispatch'
  },
  {
    id: 'zone-3-southwest',
    name: 'Dansoman, Kaneshie & Circle',
    suburbs: ['Dansoman', 'Kaneshie', 'Circle (Kwame Nkrumah)', 'Adabraka', 'Korle-Bu', 'Mataheko', 'Darkuman', 'Odorkor'],
    zoneLabel: 'South-West Zone',
    minHours: 3,
    maxHours: 4,
    cutoffHour: 16,
    expressFee: 35,
    courierType: 'Standard Courier Dispatch'
  },
  {
    id: 'zone-4-tema',
    name: 'Tema & Sakumono',
    suburbs: ['Tema Community 1-12', 'Tema Community 18-25', 'Sakumono', 'Lashibi', 'Klagon', 'Ashaiman'],
    zoneLabel: 'Greater Accra East',
    minHours: 3.5,
    maxHours: 5,
    cutoffHour: 15.5,
    expressFee: 40,
    courierType: 'Inter-City Courier Batch'
  },
  {
    id: 'zone-4-outer-west',
    name: 'Kasoa, Weija & McCarthy Hill',
    suburbs: ['Weija', 'McCarthy Hill', 'Mallam', 'Gbawe', 'Bortianor', 'Kasoa (Old/New Barrier)'],
    zoneLabel: 'Greater Accra West',
    minHours: 4,
    maxHours: 5.5,
    cutoffHour: 15,
    expressFee: 40,
    courierType: 'Inter-City Courier Batch'
  },
  {
    id: 'zone-4-outer-north',
    name: 'Pokuase, Amasaman & Medie',
    suburbs: ['Pokuase', 'Amasaman', 'Ofankor', 'Tantra Hill', 'Medie', 'Ablekuma'],
    zoneLabel: 'Greater Accra North',
    minHours: 4,
    maxHours: 5.5,
    cutoffHour: 15,
    expressFee: 40,
    courierType: 'Inter-City Courier Batch'
  },
  {
    id: 'zone-intercity-ghana',
    name: 'Kumasi, Takoradi & Other Regions (Intercity)',
    suburbs: ['Kumasi', 'Takoradi', 'Cape Coast', 'Sunyani', 'Koforidua', 'Tamale', 'Ho', 'Bolgatanga', 'Wa', 'Other Ghana Regions'],
    zoneLabel: 'Nationwide Ghana Dispatch',
    minHours: 24,
    maxHours: 48,
    cutoffHour: 15,
    expressFee: 50,
    courierType: 'Intercity Bus / VIP Parcel Express'
  }
];

const LOCAL_STORAGE_AREA_KEY = 'cr_user_selected_accra_location';

interface AccraDeliveryBadgeProps {
  productPrice?: number;
  className?: string;
}

export const AccraDeliveryBadge: React.FC<AccraDeliveryBadgeProps> = ({
  productPrice,
  className = ''
}) => {
  const { user } = useAuth();
  const { storeSettings } = useStore();

  // Initialize selected location with priority: localStorage -> user saved address -> default to East Legon
  const [selectedLocation, setSelectedLocation] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_AREA_KEY);
      if (saved) return saved;
      if (user?.savedAddresses?.[0]?.area) return user.savedAddresses[0].area;
    } catch (e) {
      console.error(e);
    }
    return 'East Legon';
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute for accurate delivery estimation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectArea = (area: string) => {
    setSelectedLocation(area);
    setIsSelectorOpen(false);
    try {
      localStorage.setItem(LOCAL_STORAGE_AREA_KEY, area);
    } catch (e) {
      console.error(e);
    }
  };

  // Find matching zone for selected area
  const matchedZone = useMemo(() => {
    const locLower = selectedLocation.toLowerCase();
    
    // Exact or partial suburb match
    const foundBySuburb = ACCRA_ZONES.find(zone => 
      zone.suburbs.some(s => s.toLowerCase().includes(locLower) || locLower.includes(s.toLowerCase()))
    );
    if (foundBySuburb) return foundBySuburb;

    // Search by zone name
    const foundByName = ACCRA_ZONES.find(zone => 
      zone.name.toLowerCase().includes(locLower) || locLower.includes(zone.name.toLowerCase())
    );
    if (foundByName) return foundByName;

    // Default to Zone 1
    return ACCRA_ZONES[0];
  }, [selectedLocation]);

  // Calculate live delivery ETA and cut-off window
  const deliveryCalculation = useMemo(() => {
    const now = currentTime;
    const currentHour = now.getHours() + (now.getMinutes() / 60);

    const isSameDayEligible = currentHour < matchedZone.cutoffHour;

    // Calculate arrival window
    const formatTime = (d: Date) => {
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    };

    if (matchedZone.id === 'zone-intercity-ghana') {
      return {
        isSameDay: false,
        badgeTitle: '📦 Nationwide Ghana Dispatch',
        deliveryWindow: '1 – 2 Business Days via Intercity Courier / VIP Parcel',
        durationText: '24 – 48 Hours',
        cutoffNotice: 'Daily parcel dispatch to Kumasi, Takoradi & all 16 regions',
        statusColor: 'text-indigo-800 bg-indigo-50 border-indigo-200'
      };
    }

    if (isSameDayEligible) {
      // Calculate earliest and latest arrival today
      const minDate = new Date(now.getTime() + matchedZone.minHours * 60 * 60 * 1000);
      const maxDate = new Date(now.getTime() + matchedZone.maxHours * 60 * 60 * 1000);

      // Remaining time before cutoff
      const hoursRemaining = Math.floor(matchedZone.cutoffHour - currentHour);
      const minutesRemaining = Math.floor(((matchedZone.cutoffHour - currentHour) % 1) * 60);

      return {
        isSameDay: true,
        badgeTitle: `⚡ Same-Day Express Delivery`,
        deliveryWindow: `Today between ${formatTime(minDate)} – ${formatTime(maxDate)}`,
        durationText: `${matchedZone.minHours} – ${matchedZone.maxHours} Hours`,
        cutoffNotice: `Order within ${hoursRemaining > 0 ? `${hoursRemaining}h ` : ''}${minutesRemaining}m for today's delivery`,
        statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      };
    } else {
      // Next day morning delivery
      const nextDayMorning = new Date();
      nextDayMorning.setDate(nextDayMorning.getDate() + 1);
      nextDayMorning.setHours(10, 30, 0, 0);

      return {
        isSameDay: false,
        badgeTitle: `🚚 Priority Next-Morning Dispatch`,
        deliveryWindow: `Tomorrow morning by 10:30 AM – 12:00 PM`,
        durationText: `Next-Morning Delivery`,
        cutoffNotice: `Same-day cutoff passed (${Math.floor(matchedZone.cutoffHour)}:00 PM). Dispatched first thing tomorrow!`,
        statusColor: 'text-amber-800 bg-amber-50/90 border-amber-200'
      };
    }
  }, [currentTime, matchedZone]);

  // Filtered zones/suburbs for search in dropdown
  const filteredZones = useMemo(() => {
    if (!searchFilter.trim()) return ACCRA_ZONES;
    const q = searchFilter.toLowerCase();
    return ACCRA_ZONES.filter(z => 
      z.name.toLowerCase().includes(q) || 
      z.suburbs.some(s => s.toLowerCase().includes(q))
    );
  }, [searchFilter]);

  const isFreeShipping = productPrice && productPrice >= (storeSettings.freeDeliveryThreshold || 300);

  return (
    <div className={`relative bg-gradient-to-br from-[#FAF6F4] via-white to-rose-50/50 dark:from-[#181A24] dark:via-[#1B1D28] dark:to-[#181A24] rounded-2xl p-3.5 sm:p-4 border border-rose-100/90 dark:border-gray-800 shadow-2xs space-y-3 transition-colors ${className}`}>
      
      {/* Top Header with Status & Location Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100/70 dark:border-gray-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-[#8A3D52] dark:text-rose-400" />
            <span>Accra Dispatch Hub</span>
          </span>
        </div>

        {/* Location Dropdown Trigger Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#252836] hover:bg-rose-50/80 dark:hover:bg-[#2C3042] border border-gray-200 dark:border-gray-700 hover:border-rose-200 rounded-full text-xs font-bold text-gray-800 dark:text-gray-200 transition-all shadow-2xs cursor-pointer group"
          >
            <MapPin className="w-3.5 h-3.5 text-[#8A3D52] dark:text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="max-w-[140px] truncate text-[#8A3D52] dark:text-rose-400">{selectedLocation}</span>
            <ChevronDown className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:text-[#8A3D52] dark:group-hover:text-rose-400" />
          </button>

          {/* Interactive Accra Suburb Selector Dropdown */}
          {isSelectorOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-[#1C1D26] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-fadeIn max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-xs font-serif font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-[#8A3D52] dark:text-rose-400" />
                  <span>Select Destination</span>
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">Accra & Nationwide</span>
              </div>

              {/* Suburb Quick Search */}
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Type your area (e.g. Spintex, Osu, Tema)..."
                className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-[#252836] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg focus:bg-white dark:focus:bg-[#252836] focus:outline-none focus:ring-1 focus:ring-[#8A3D52]"
                autoFocus
              />

              {/* Quick Popular Pills */}
              <div className="flex flex-wrap gap-1 pt-1">
                {['East Legon', 'Airport', 'Osu', 'Spintex', 'Madina', 'Dansoman', 'Tema'].map(pill => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => handleSelectArea(pill)}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                      selectedLocation.toLowerCase().includes(pill.toLowerCase())
                        ? 'bg-[#8A3D52] text-white font-bold'
                        : 'bg-gray-100 dark:bg-[#252836] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Grouped Zones List */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800 pt-1 space-y-1">
                {filteredZones.map(zone => (
                  <div key={zone.id} className="pt-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
                      {zone.zoneLabel} • ~{zone.minHours}-{zone.maxHours} hrs
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {zone.suburbs.map(suburb => (
                        <button
                          key={suburb}
                          type="button"
                          onClick={() => handleSelectArea(suburb)}
                          className={`text-left px-2 py-1 rounded text-xs truncate transition-colors cursor-pointer ${
                            selectedLocation.toLowerCase() === suburb.toLowerCase()
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-[#8A3D52] dark:text-rose-300 font-bold'
                              : 'hover:bg-gray-100 dark:hover:bg-[#252836] text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {suburb}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(false)}
                  className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold cursor-pointer"
                >
                  Close Selector
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Delivery Calculation Display */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${deliveryCalculation.statusColor}`}>
                {deliveryCalculation.durationText}
              </span>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                to {selectedLocation}
              </span>
            </div>

            <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5 pt-1">
              <Clock className="w-4 h-4 text-[#8A3D52] dark:text-rose-400 shrink-0" />
              <span>{deliveryCalculation.deliveryWindow}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-extrabold text-[#8A3D52] dark:text-rose-400 block">
              {isFreeShipping ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  FREE DELIVERY
                </span>
              ) : (
                `GHS ${matchedZone.expressFee}.00`
              )}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-0.5">
              {matchedZone.courierType}
            </span>
          </div>
        </div>

        {/* Dynamic Countdown / Cutoff Notification */}
        <div className="bg-white/80 dark:bg-[#20222F]/90 border border-rose-100/60 dark:border-gray-700/60 rounded-xl p-2 flex items-center justify-between text-[11px] text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-1.5 text-[#8A3D52] dark:text-rose-400 font-semibold">
            <Zap className="w-3.5 h-3.5 fill-[#8A3D52] dark:fill-rose-400 text-[#8A3D52] dark:text-rose-400 shrink-0" />
            <span>{deliveryCalculation.cutoffNotice}</span>
          </div>
          <span className="text-gray-400 dark:text-gray-500 font-mono text-[10px] hidden sm:inline">
            Direct Rider Dispatch
          </span>
        </div>

        {/* Dispatch Guarantee Badges */}
        <div className="grid grid-cols-2 gap-2 pt-0.5 text-[10px] text-gray-600 dark:text-gray-400 font-medium">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Doorstep drop & call on arrival</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#8A3D52] dark:text-rose-400 shrink-0" />
            <span>Pay via MoMo or Card (Paystack)</span>
          </div>
        </div>
      </div>

    </div>
  );
};
