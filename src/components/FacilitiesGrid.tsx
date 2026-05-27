import React, { useState } from "react";
import { motion } from "motion/react";
import { Facility } from "../types";

// Let's declare our exact generated images matching our assets and specify their features
const FACILITIES_DATA: Facility[] = [
  {
    id: 1,
    title: "Net",
    description: "A dedicated professional batting lane equipped with high-density shock-absorbent astro-turf, standard stumps, and side net containment for concentrated batting drills and target practice.",
    image: "/src/assets/images/net_wicket_closeup_1779640078823.jpeg",
    features: {
      stumps: true,
      runUp: false,
      dividers: true,
      markers: false,
      bowlingMachine: false
    }
  },
  {
    id: 2,
    title: "Nets",
    description: "Our spacious multi-lane net complex featuring full-length run-ups and clear ball-tracking capability, structured with reliable mesh dividers to house multiple practice sessions simultaneously.",
    image: "/src/assets/images/net_wide_lanes_1779640099204.jpeg",
    features: {
      stumps: true,
      runUp: true,
      dividers: true,
      markers: false,
      bowlingMachine: false
    }
  },
  {
    id: 3,
    title: "Training area",
    description: "An expansive physical training and skills development corridor designed with open layouts, adjustable boundaries, and markers for intensive footwork, agility, and group coaching drills.",
    image: "/src/assets/images/net_practice_session_1779640118902.jpeg",
    features: {
      stumps: false,
      runUp: true,
      dividers: false,
      markers: true,
      bowlingMachine: false
    }
  },
  {
    id: 4,
    title: "Bowling Machine",
    description: "A precision bowling machine station offering reliable, consistent deliveries across various line, length, and speed settings to systematically sharpen your reflexes.",
    image: "/src/assets/images/net_bowling_machine_1779640057852.jpeg",
    features: {
      stumps: true,
      runUp: false,
      dividers: true,
      markers: true,
      bowlingMachine: true
    }
  }
];

export default function FacilitiesGrid({ isDarkMode = false }: { isDarkMode?: boolean }) {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className={`text-3xl md:text-4xl font-sans font-bold tracking-tight ${
          isDarkMode ? "text-slate-100" : "text-slate-900"
        }`}>
          Our Facilities
        </h2>
        <p className={`${isDarkMode ? "text-slate-400" : "text-slate-500"} text-sm md:text-base leading-relaxed`}>
          Explore our premium cricket training facilities designed for players of all skill levels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {FACILITIES_DATA.map((facility, index) => {
          // Identify if this holds the Bowling Machine
          const isBowlingMachine = facility.title.toLowerCase().includes("bowling machine");
          
          return (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all duration-305 flex flex-col ${
                isDarkMode 
                  ? "bg-slate-900 border-slate-800/80 text-slate-100" 
                  : "bg-white border-slate-200/80 text-slate-800"
              }`}
              id={`facility-card-${facility.id}`}
            >
              <div className={`aspect-[16/10] overflow-hidden relative shrink-0 ${
                isDarkMode ? "bg-slate-950" : "bg-slate-100"
              }`}>
                <img
                  src={facility.image}
                  alt={facility.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/10 to-transparent" />
                {isBowlingMachine && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white font-sans text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm z-10">
                    Premium
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className={`font-sans font-bold text-lg md:text-xl tracking-tight ${
                    isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}>
                    {facility.title}
                  </h3>
                  <p className={`${isDarkMode ? "text-slate-400" : "text-slate-500"} text-sm leading-relaxed animate-fade-in`}>
                     {facility.description}
                  </p>
                </div>

                {/* Setup & Equipment Details Badge List */}
                <div className={`space-y-3 pt-3 border-t ${
                  isDarkMode ? "border-slate-800" : "border-slate-100"
                }`}>
                  <span className={`text-[10px] font-bold tracking-wider uppercase block ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}>
                    Available Setup & Equipment
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {facility.features.stumps && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-300"
                          : "bg-slate-50 border-slate-100 text-slate-700"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        Stumps
                      </span>
                    )}
                    {facility.features.runUp && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-300"
                          : "bg-slate-50 border-slate-100 text-slate-700"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        Full Bowler Run-up
                      </span>
                    )}
                    {facility.features.dividers && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-300"
                          : "bg-slate-50 border-slate-100 text-slate-700"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        Mesh Net Dividers
                      </span>
                    )}
                    {facility.features.markers && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-300"
                          : "bg-slate-50 border-slate-100 text-slate-700"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        Footwork & Agility Markers
                      </span>
                    )}
                    {facility.features.bowlingMachine && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold shadow-xs ${
                        isDarkMode 
                          ? "bg-red-950/40 border-red-900/60 text-red-400"
                          : "bg-red-50/80 border-red-100 text-red-700"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        Bowling Machine & Operator
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`pt-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? "text-slate-500" : "text-slate-400"
                }`}>
                  <span>Category</span>
                  <span className="text-red-500">
                    {isBowlingMachine ? "Equipment" : "Astro Turf Net"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
