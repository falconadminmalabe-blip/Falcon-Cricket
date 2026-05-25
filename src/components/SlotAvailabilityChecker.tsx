import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Search, Info, Calendar, Users, HelpCircle, CheckCircle2, AlertTriangle, XCircle, Clock, Phone } from "lucide-react";
import { Booking } from "../types";

interface SlotAvailabilityCheckerProps {
  bookings: Booking[];
}

export interface TimeRange {
  start: number;
  end: number;
}

export function parseTimeToMinutes(timeStr: string, defaultAMPM?: "am" | "pm"): number | null {
  let p = timeStr.toLowerCase().replace(/[\s\xa0]/g, ""); // clear spaces
  
  // Normalise common patterns
  p = p.replace(/a\.m\./g, "am").replace(/p\.m\./g, "pm");
  p = p.replace(/a\.m/g, "am").replace(/p\.m/g, "pm");

  if (!p) return null;

  // Match hours, optional minutes (with . or : separator), and optional am/pm indicator or meridian
  const match = p.match(/^(\d+)(?:[:.](\d+))?(am|pm)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3] || defaultAMPM;

  if (ampm === "pm") {
    if (hours !== 12) hours += 12;
  } else if (ampm === "am") {
    if (hours === 12) hours = 0;
  } else {
    // Standard heuristics for default operational hours
    if (hours >= 1 && hours <= 9) {
      hours += 12;
    }
  }

  return hours * 60 + minutes;
}

export function parseRange(rangeStr: string): TimeRange | null {
  if (!rangeStr) return null;
  
  // Split on popular separators used in schedules
  const parts = rangeStr.split(/(?:\s*(?:-|to|till|–|—|\/)\s*)+/i);
  if (parts.length === 0) return null;

  let ampm1: "am" | "pm" | undefined;
  let ampm2: "am" | "pm" | undefined;

  const p1 = parts[0].toLowerCase();
  const p2 = parts[1] ? parts[1].toLowerCase() : "";

  if (p1.includes("pm") || p1.includes("p.m.")) ampm1 = "pm";
  else if (p1.includes("am") || p1.includes("a.m.")) ampm1 = "am";

  if (p2.includes("pm") || p2.includes("p.m.")) ampm2 = "pm";
  else if (p2.includes("am") || p2.includes("a.m.")) ampm2 = "am";

  // Share meridiem modifier context
  if (!ampm1 && ampm2) ampm1 = ampm2;
  if (!ampm2 && ampm1) ampm2 = ampm1;

  const start = parseTimeToMinutes(parts[0], ampm1);
  
  if (parts.length === 1) {
    if (start === null) return null;
    return { start, end: start };
  }

  const end = parseTimeToMinutes(parts[1], ampm2);
  if (start === null || end === null) return null;

  // Midnight threshold adjustments
  let finalEnd = end;
  if (finalEnd < start) {
    finalEnd += 1440;
  }

  return { start, end: finalEnd };
}

export function rangesOverlap(r1: TimeRange, r2: TimeRange): boolean {
  if (r1.start === r1.end) {
    return r1.start >= r2.start && r1.start < r2.end;
  }
  if (r2.start === r2.end) {
    return r2.start >= r1.start && r2.start < r1.end;
  }
  return Math.max(r1.start, r2.start) < Math.min(r1.end, r2.end);
}

export default function SlotAvailabilityChecker({ bookings }: SlotAvailabilityCheckerProps) {
  const [selectedFacility, setSelectedFacility] = useState<string>("Net Sessions");
  const [selectedPresetTime, setSelectedPresetTime] = useState<string>("");
  const [timeSelectionMode, setTimeSelectionMode] = useState<"preset" | "custom">("preset");
  const [startHour, setStartHour] = useState<string>("04");
  const [startMinute, setStartMinute] = useState<string>("38");
  const [startAmPm, setStartAmPm] = useState<string>("AM");
  const [endHour, setEndHour] = useState<string>("06");
  const [endMinute, setEndMinute] = useState<string>("38");
  const [endAmPm, setEndAmPm] = useState<string>("AM");

  // Facility Preset Choices & Capacities
  const facilityConfig: Record<string, { max: number; desc: string; color: string; bg: string; border: string }> = {
    "Bowling Machine": {
      max: 1,
      desc: "Max 1 booking allowed per time slot",
      color: "red",
      bg: "bg-red-50 text-red-700",
      border: "border-red-250"
    },
    "Gym": {
      max: 10,
      desc: "Max 10 bookings allowed per time slot",
      color: "sky",
      bg: "bg-sky-50 text-sky-700",
      border: "border-sky-250"
    },
    "Net Sessions": {
      max: 3,
      desc: "Max 3 bookings allowed per time slot",
      color: "emerald",
      bg: "bg-emerald-50 text-emerald-700",
      border: "border-emerald-250"
    }
  };

  // Extract unique times from existing bookings and standard ranges, sorted chronologically
  const presetTimeSlots = useMemo(() => {
    const times = new Set<string>();
    // Default standard operating hour presets starting from early morning (Image 2)
    const standardPresets = [
      "04:00 AM - 05:00 AM",
      "05:00 AM - 06:00 AM",
      "06:00 AM - 07:00 AM",
      "07:00 AM - 08:00 AM",
      "08:05 AM - 09:05 AM",
      "09:00 AM - 10:00 AM",
      "10:00 AM - 11:00 AM",
      "11:00 AM - 12:00 PM",
      "12:00 PM - 01:00 PM",
      "01:00 PM - 02:00 PM",
      "02:00 PM - 03:00 PM",
      "03:00 PM - 04:00 PM",
      "04:00 PM - 05:00 PM",
      "05:00 PM - 06:00 PM",
      "06:00 PM - 07:00 PM",
      "07:00 PM - 08:00 PM",
      "08:00 PM - 09:00 PM",
      "09:00 PM - 10:00 PM",
      "10:00 PM - 11:00 PM"
    ];

    bookings.forEach(b => {
      if (b.time) {
        const t = b.time.trim();
        if (t) times.add(t);
      }
    });

    standardPresets.forEach(p => times.add(p));

    // Sort chronologically based on starting minuteOfDay
    return Array.from(times).sort((a, b) => {
      const r1 = parseRange(a);
      const r2 = parseRange(b);
      const s1 = r1 ? r1.start : 0;
      const s2 = r2 ? r2.start : 0;
      return s1 - s2;
    });
  }, [bookings]);

  // Set default preset time on load
  React.useEffect(() => {
    if (presetTimeSlots.length > 0 && !selectedPresetTime) {
      // Pick 06:00 AM session or first chronologically
      const defaultTime = presetTimeSlots.find(t => t.startsWith("06:00 AM") || t.startsWith("04:00 AM")) || presetTimeSlots[0];
      setSelectedPresetTime(defaultTime);
    }
  }, [presetTimeSlots]);

  // Decide the active time slot query string
  const activeTimeQuery = useMemo(() => {
    if (timeSelectionMode === "preset") {
      return selectedPresetTime;
    }
    return `${startHour}:${startMinute} ${startAmPm} - ${endHour}:${endMinute} ${endAmPm}`;
  }, [timeSelectionMode, selectedPresetTime, startHour, startMinute, startAmPm, endHour, endMinute, endAmPm]);

  // Smart overlapping check to match searched times and facilities
  const matchingBookings = useMemo(() => {
    if (!activeTimeQuery) return [];

    return bookings.filter(b => {
      // 1. Facility match - flexible substring OR exact
      const facilityMatches = 
        b.facility.toLowerCase().includes(selectedFacility.toLowerCase()) ||
        selectedFacility.toLowerCase().includes(b.facility.toLowerCase());

      if (!facilityMatches) return false;

      // 2. High-Fidelity Time Overlap Logic
      const bTime = b.time.toLowerCase().trim();
      const qTime = activeTimeQuery.toLowerCase().trim();

      // Simple exact or substring match first (as safe fallback)
      if (bTime.includes(qTime) || qTime.includes(bTime)) return true;

      // Deep parse interval overlapping
      try {
        const r1 = parseRange(qTime);
        const r2 = parseRange(bTime);
        if (r1 && r2) {
          return rangesOverlap(r1, r2);
        }
      } catch (e) {
        console.error("Time range parsing failed for dynamic overlap:", e);
      }

      return false;
    });
  }, [bookings, selectedFacility, activeTimeQuery]);

  // Get configuration of selected facility
  const currentConfig = facilityConfig[selectedFacility] || {
    max: 3,
    desc: "Capacity limit",
    color: "slate",
    bg: "bg-slate-50 text-slate-700",
    border: "border-slate-200"
  };

  const bookingCount = matchingBookings.length;
  const maxCapacity = currentConfig.max;
  const remainingSlots = Math.max(0, maxCapacity - bookingCount);
  const occupancyPercent = Math.min(100, (bookingCount / maxCapacity) * 100);

  // Determine availability level
  let statusType: "available" | "limited" | "full" = "available";
  if (bookingCount >= maxCapacity) {
    statusType = "full";
  } else if (bookingCount > 0 && occupancyPercent >= 60) {
    statusType = "limited";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6"
      id="slot-availability-checker"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-150">
        <div>
          <h3 className="font-sans font-bold text-slate-900 text-lg md:text-xl tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-red-50 text-red-650 rounded-lg shrink-0">
              <Clock className="w-5 h-5" />
            </span>
            Facility Capacity & Slot Finder
          </h3>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Search if a slot is free, and see dynamic capacity utilization relative to training rules
          </p>
        </div>

        {/* Dynamic Rules Badge Info summary bubble */}
        <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-wider">
          <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-100 uppercase">
            Bowling Machine: Max 1
          </span>
          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 uppercase">
            Nets: Max 3
          </span>
          <span className="px-2 py-1 bg-sky-50 text-sky-700 rounded-md border border-sky-100 uppercase">
            Gym: Max 10
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Search settings inputs */}
        <div className="space-y-4">
          {/* 1. Facility Selector Option */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1. Select Training Facility
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(facilityConfig).map((facilityName) => {
                const isActive = selectedFacility === facilityName;
                return (
                  <button
                    key={facilityName}
                    onClick={() => setSelectedFacility(facilityName)}
                    className={`py-3 px-2.5 rounded-xl text-center text-xs font-bold border transition-all duration-200 flex flex-col items-center justify-center gap-1.5 select-none ${
                      isActive
                        ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-100/50"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span className="truncate max-w-full text-center">{facilityName}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      Limit: {facilityConfig[facilityName].max}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Select Time Option */}
          <div className="space-y-2.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                2. Select or Build Time Slot
              </label>
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTimeSelectionMode("preset")}
                  className={`py-1 px-2.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                    timeSelectionMode === "preset"
                      ? "bg-white text-slate-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setTimeSelectionMode("custom")}
                  className={`py-1 px-2.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                    timeSelectionMode === "custom"
                      ? "bg-white text-slate-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Custom Builder
                </button>
              </div>
            </div>
            
            {timeSelectionMode === "preset" ? (
              <div className="relative">
                <select
                  value={selectedPresetTime}
                  onChange={(e) => setSelectedPresetTime(e.target.value)}
                  className="block w-full px-3.5 py-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-800 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-650 transition-all cursor-pointer"
                >
                  {presetTimeSlots.map((timePreset) => (
                    <option key={timePreset} value={timePreset}>
                      {timePreset}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                {/* Start Time Selectors Row */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Start Time</span>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Hour */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-medium">Hour</span>
                      <select
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-red-500/20"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    {/* Minute */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-medium">Minute</span>
                      <select
                        value={startMinute}
                        onChange={(e) => setStartMinute(e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-red-500/20 max-h-40"
                      >
                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* AM/PM */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-medium">AM/PM</span>
                      <select
                        value={startAmPm}
                        onChange={(e) => setStartAmPm(e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-red-500/20"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* End Time Selectors Row */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">End Time</span>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Hour */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-medium">Hour</span>
                      <select
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-red-500/20"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    {/* Minute */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-medium">Minute</span>
                      <select
                        value={endMinute}
                        onChange={(e) => setEndMinute(e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-red-500/20 text-slate-850"
                      >
                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* AM/PM */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-medium">AM/PM</span>
                      <select
                        value={endAmPm}
                        onChange={(e) => setEndAmPm(e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-red-500/20"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Live parsed feedback banner */}
                <div className="p-2.5 bg-red-500/5 rounded-xl border border-red-500/10 text-center">
                  <span className="text-[9px] text-slate-400 font-bold tracking-wider block uppercase">Calculated Range:</span>
                  <span className="text-xs font-extrabold text-red-650 flex items-center justify-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{startHour}:{startMinute} {startAmPm} - {endHour}:{endMinute} {endAmPm}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Availability outcome screen panel */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-200/70 p-5 flex flex-col justify-between space-y-5">
          {/* Header query title */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Matching Status for:</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-base">
                {selectedFacility}
              </h4>
              <p className="text-red-650 font-semibold text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{activeTimeQuery || "Select a time"}</span>
              </p>
            </div>
          </div>

          {/* Utilization dynamic meter/gauge metrics info */}
          <div className="space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                Slots Booked
              </span>
              <span>
                {bookingCount} / {maxCapacity} Reserved
              </span>
            </div>

            {/* Simulated progress color code */}
            <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300/40">
              <div 
                style={{ width: `${occupancyPercent}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  statusType === "full" 
                    ? "bg-red-500" 
                    : statusType === "limited" 
                    ? "bg-amber-500" 
                    : "bg-emerald-500"
                }`}
              />
            </div>

            {/* Large clear interactive outcome banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 text-left transition-colors duration-200 ${
              statusType === "full"
                ? "bg-red-50/40 border-red-200 text-red-900"
                : statusType === "limited"
                ? "bg-amber-50/40 border-amber-200 text-amber-900"
                : "bg-emerald-50/40 border-emerald-200 text-emerald-900"
            }`}>
              <div className="shrink-0 mt-0.5">
                {statusType === "full" ? (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                ) : statusType === "limited" ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sm">
                  {statusType === "full" 
                    ? "Fully Reserved (No space)" 
                    : statusType === "limited" 
                    ? "Limited slots left" 
                    : "Available for booking"
                  }
                </p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {statusType === "full"
                    ? `Cannot accommodate more bookings. Capacity of ${maxCapacity} reached.`
                    : `${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} free out of ${maxCapacity} authorized.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slots details: Bookings occupant list */}
      <div className="space-y-3 pt-4 border-t border-slate-150">
        <h4 className="font-bold text-slate-800 text-sm text-left flex items-center gap-1.5">
          <Info className="w-4 h-4 text-slate-400" />
          Occupants List with Reserved Entries ({bookingCount})
        </h4>

        {bookingCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {matchingBookings.map((b) => (
              <div 
                key={b.id} 
                className={`p-3.5 bg-white rounded-xl border text-left shadow-xs transition-colors flex flex-col justify-between gap-1 ${
                  b.status === "Confirmed" ? "border-green-150" : "border-amber-150"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm truncate max-w-[140px]">
                    {b.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    b.status === "Confirmed"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {b.status === "Confirmed" ? "Active" : "NC-Y"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{b.phone ? b.phone.substring(0, 3) + "*****" + b.phone.substring(Math.max(0, b.phone.length - 2)) : "Hidden"}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{b.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-5 border border-dashed border-slate-200 text-center text-slate-500 text-xs font-semibold">
            No current reservations listed at "{activeTimeQuery}" for {selectedFacility}. This slot is completely free!
          </div>
        )}
      </div>
    </motion.div>
  );
}
