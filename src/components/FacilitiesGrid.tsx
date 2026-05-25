import React from "react";
import { motion } from "motion/react";
import { Facility } from "../types";

// Let's declare our exact generated images matching our assets
const FACILITIES_DATA: Facility[] = [
  {
    id: 1,
    title: "Professional Cricket Net 1",
    description: "Equipped with specialized dense shock-absorbent astro-turf, yellow plastic stumps, and side canvas boundaries for intense batting drills.",
    image: "/src/assets/images/net_wicket_closeup_1779640078823.png"
  },
  {
    id: 2,
    title: "Professional Cricket Net 2",
    description: "Designed for full run-ups and premium ball tracking, optimized with soft netting dividers to keep multiple practices focused.",
    image: "/src/assets/images/net_wide_lanes_1779640099204.png"
  },
  {
    id: 3,
    title: "Professional Cricket Net 3",
    description: "Versatile training corridor with clear visual lanes, adjustable side screens, and specialized markers for footwork accuracy.",
    image: "/src/assets/images/net_practice_session_1779640118902.png"
  },
  {
    id: 4,
    title: "Professional Cricket Net 4",
    description: "Our premium defensive and spin training block, tailored for high-intensity coaching, throwdowns, and target bowler challenges.",
    image: "/src/assets/images/net_wicket_closeup_1779640078823.png" // Secondary angle or reused closeup for consistency
  },
  {
    id: 5,
    title: "Bowling Machine",
    description: "Advanced automated bowling machine for precision batting practice against various deliveries, speeds, and variations.",
    image: "/src/assets/images/net_bowling_machine_1779640057852.png"
  }
];

export default function FacilitiesGrid() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl md:text-4xl font-sans font-bold text-slate-900 tracking-tight">
          Our Facilities
        </h2>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed">
          Explore our premium cricket training facilities designed for players of all skill levels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FACILITIES_DATA.map((facility, index) => {
          // If it is the 5th item (Bowling Machine), style it as shown in the mockup: large card with full details at bottom
          const isBowlingMachine = facility.id === 5;
          
          return (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col ${
                isBowlingMachine ? "md:col-span-2 lg:col-span-1" : ""
              }`}
              id={`facility-card-${facility.id}`}
            >
              <div className="aspect-[16/10] overflow-hidden relative bg-slate-100 shrink-0">
                <img
                  src={facility.image}
                  alt={facility.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/10 to-transparent" />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-slate-900 text-lg md:text-xl tracking-tight">
                    {facility.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {facility.description}
                  </p>
                </div>
                
                <div className="pt-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <span>Category</span>
                  <span className="text-red-600">
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
