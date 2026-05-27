import React from "react";
import { motion } from "motion/react";
import { 
  ShoppingBag, 
  Wrench, 
  Lock
} from "lucide-react";

interface CricketShopPageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

export default function CricketShopPage({ isDarkMode, onBack }: CricketShopPageProps) {
  // Teaser collections
  const collections = [
    {
      id: "willow-bats",
      title: "Grade-1 English Willow Bats",
      desc: "Individually hand-selected profile with lightweight pickup, massive sweet spots, and pristine grain alignment.",
      badge: "Signature Collection",
      colorClass: "from-amber-500/10 to-amber-600/10 border-amber-500/30 text-amber-500"
    },
    {
      id: "protective-gear",
      title: "Impact Protective Armour",
      desc: "Ultra-lightweight multi-density foam batting pads, split-finger gloves, and dual-density helmet protection.",
      badge: "Pro Protection",
      colorClass: "from-blue-500/10 to-blue-600/10 border-blue-500/30 text-blue-500"
    },
    {
      id: "match-balls",
      title: "Premium Match-grade Leather",
      desc: "A-Grade water-resistant alum tanned leather cricket balls with hand-stitched seams for perfect swing control.",
      badge: "Match Essentials",
      colorClass: "from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 text-emerald-500"
    },
    {
      id: "other-products",
      title: "Other More Products",
      badge: "Coming Soon",
      colorClass: "from-purple-500/10 to-purple-600/10 border-purple-500/30 text-purple-500"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`min-h-screen relative flex flex-col ${
        isDarkMode ? "bg-slate-950 text-slate-150" : "bg-slate-100/50 text-slate-800"
      }`}
    >
      {/* Background decoration flares */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-600/[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-red-50/[0.035] blur-[110px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col justify-center items-center relative z-10">
        
        {/* Under Maintenance Hero Banner */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-10">
          
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="inline-flex relative"
          >
            {/* Spinning background halo */}
            <div className="absolute inset-0 bg-red-500/25 blur-xl rounded-full scale-110 animate-pulse" />
            
            <div className={`relative w-24 h-24 rounded-3xl flex items-center justify-center border shadow-lg ${
              isDarkMode 
                ? "bg-slate-900 border-slate-800 text-red-500" 
                : "bg-white border-slate-200 text-[#DC2626]"
            }`}>
              <ShoppingBag className="w-10 h-10 relative" />
              {/* Construction wrench overlay pin */}
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-lg shadow-sm border border-white">
                <Wrench className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-extrabold tracking-widest uppercase text-[#DC2626] bg-red-50 dark:bg-red-950/20 px-4 py-1.5 rounded-full border border-red-100 dark:border-red-900/30 mb-8 shadow-xs">
              Upcoming Feature
            </span>
            <h1 className={`text-4xl md:text-5xl font-sora font-medium tracking-tight mb-6 leading-tight ${
              isDarkMode ? "text-slate-101" : "text-slate-950"
            }`}>
              Falcon Cricket <span className="text-[#DC2626] font-semibold">Shop</span>
            </h1>
            <p className={`text-sm md:text-base leading-relaxed ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
              We are currently designing and curating our integrated cricket physical stores and online gear hub to bring you premium personal Willow bats, custom sports wear, and protective armours.
            </p>
          </div>

          {/* Under Maintenance Badge with Pulsing circle */}
          <div className={`inline-flex items-center gap-3.5 px-4 py-2.5 rounded-full border text-xs font-semibold ${
            isDarkMode ? "bg-slate-900/80 border-slate-800 text-amber-400" : "bg-amber-50 border-amber-205 text-amber-850"
          }`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span>SYSTEM UPGRADE: New premium catalogue launching shortly</span>
          </div>

        </div>

        {/* Teaser Catalogues - Blurred with locked layers */}
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
              Preview Upcoming Collections
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              <span>Catalogues locked</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="shop-teaser-grid">
            {collections.map((c, idx) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 + 0.15 }}
                className={`group relative p-6 rounded-2xl border transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-slate-900/60 border-slate-800" 
                    : "bg-white/95 border-slate-200/80 shadow-xs"
                }`}
              >
                {/* Visual Lock overlay screen */}
                <div className="absolute inset-0 bg-slate-950/2 dark:bg-slate-950/5 hover:bg-transparent rounded-2xl transition-colors duration-300 pointer-events-none" />

                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-md border ${c.colorClass}`}>
                    {c.badge}
                  </span>
                  
                  {/* Lock Indicator */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                    isDarkMode ? "bg-slate-800 border-slate-700 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <h3 className={`text-base font-bold tracking-tight transition-colors duration-200 ${
                    isDarkMode ? "text-slate-205" : "text-slate-900"
                  }`}>
                    {c.title}
                  </h3>
                  {c.desc && (
                    <p className={`text-xs md:text-xs leading-relaxed max-w-sm ${
                      isDarkMode ? "text-slate-450" : "text-slate-505"
                    }`}>
                      {c.desc}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
