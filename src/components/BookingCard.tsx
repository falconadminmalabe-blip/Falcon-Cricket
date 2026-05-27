import React from "react";
import { User, Phone, Activity, Clock } from "lucide-react";
import { motion } from "motion/react";
import { Booking } from "../types";

interface BookingCardProps {
  booking: Booking;
  index: number;
  isDarkMode?: boolean;
  key?: any;
}

function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length >= 7) {
    const firstPart = cleaned.substring(0, 3);
    const lastPart = cleaned.substring(cleaned.length - 2);
    return `${firstPart}*****${lastPart}`;
  }
  return phone;
}

export default function BookingCard({ booking, index, isDarkMode = false }: BookingCardProps) {
  const isConfirmed = booking.status === "Confirmed";
  const hoverClasses = isConfirmed
    ? isDarkMode 
      ? "hover:bg-emerald-950/20 hover:border-emerald-800/80 hover:shadow-md transition-all duration-200"
      : "hover:bg-green-50/30 hover:border-green-200 hover:shadow-green-100/40"
    : isDarkMode
      ? "hover:bg-amber-950/20 hover:border-amber-800/80 hover:shadow-md transition-all duration-200"
      : "hover:bg-amber-50/30 hover:border-amber-200 hover:shadow-amber-100/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:grid md:grid-cols-12 md:items-center gap-5 relative group ${
        isDarkMode 
          ? "bg-slate-900 border-slate-800/80 text-slate-100" 
          : "bg-white border-slate-200/70 text-slate-800"
      } ${hoverClasses}`}
      id={`booking-card-${booking.id}`}
    >
      {/* Client Identity details */}
      <div className="flex items-center gap-4 md:col-span-3 min-w-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
          isDarkMode
            ? "bg-pink-950/30 text-pink-450 border-pink-900/40"
            : "bg-pink-50 text-pink-500 border-pink-100"
        }`}>
          <User className="w-6 h-6" />
        </div>
        <div className="space-y-0.5 truncate">
          <h4 className={`font-bold text-base md:text-lg transition-colors truncate ${
            isDarkMode ? "text-slate-100" : "text-slate-800"
          }`}>
            {booking.name}
          </h4>
          <div className={`flex items-center gap-1.5 text-xs md:text-sm ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            <Phone className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
            <span className="truncate">{maskPhoneNumber(booking.phone)}</span>
          </div>
        </div>
      </div>

      {/* Facility Selection */}
      <div className="flex items-start md:items-center gap-3 md:col-span-3 min-w-0">
        <div className={`p-2 rounded-lg shrink-0 md:self-center self-start border ${
          isDarkMode
            ? "bg-red-950/30 text-red-450 border-red-900/40"
            : "bg-red-50 text-red-600 border-red-100"
        }`}>
          <Activity className="w-4 h-4" />
        </div>
        <div className="flex flex-col truncate">
          <span className={`text-[10px] font-bold tracking-widest uppercase ${
            isDarkMode ? "text-slate-500" : "text-slate-400"
          }`}>
            Facility
          </span>
          <span className={`font-semibold text-sm md:text-base truncate ${
            isDarkMode ? "text-slate-200" : "text-slate-800"
          }`}>
            {booking.facility}
          </span>
        </div>
      </div>

      {/* Slot Schedule and Clock */}
      <div className="flex items-start md:items-center gap-3 md:col-span-4 min-w-0">
        <div className={`p-2 rounded-lg shrink-0 md:self-center self-start border ${
          isDarkMode
            ? "bg-slate-800 text-slate-300 border-slate-700"
            : "bg-slate-50 text-slate-600 border-slate-200"
        }`}>
          <Clock className={`w-4 h-4 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`} />
        </div>
        <div className="flex flex-col">
          <span className={`text-[10px] font-bold tracking-widest uppercase ${
            isDarkMode ? "text-slate-500" : "text-[#94A3B8]"
          }`}>
            Time
          </span>
          <span className={`font-semibold text-sm md:text-base whitespace-nowrap ${
            isDarkMode ? "text-slate-200" : "text-slate-800"
          }`}>
            {booking.time}
          </span>
        </div>
      </div>

      {/* Confirmation Badge */}
      <div className="flex items-center justify-start md:justify-end md:col-span-2">
        {booking.status === "Confirmed" ? (
          <span className={`px-4 py-1.5 text-xs font-semibold rounded-full select-none flex items-center gap-1.5 shrink-0 border ${
            isDarkMode
              ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/60"
              : "text-green-700 bg-green-50/50 border border-green-200"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
            Confirmed
          </span>
        ) : (
          <span className={`px-4 py-1.5 text-xs font-semibold rounded-full select-none flex items-center gap-1.5 shrink-0 border ${
            isDarkMode
              ? "text-amber-400 bg-amber-950/40 border-amber-900/60"
              : "text-amber-700 bg-amber-50/50 border border-amber-200"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            NC-Y
          </span>
        )}
      </div>
    </motion.div>
  );
}
