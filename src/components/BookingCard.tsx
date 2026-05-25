import React from "react";
import { User, Phone, Activity, Clock } from "lucide-react";
import { motion } from "motion/react";
import { Booking } from "../types";

interface BookingCardProps {
  booking: Booking;
  index: number;
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

export default function BookingCard({ booking, index }: BookingCardProps) {
  const isConfirmed = booking.status === "Confirmed";
  const hoverClasses = isConfirmed
    ? "hover:bg-green-50/30 hover:border-green-200 hover:shadow-green-100/40"
    : "hover:bg-amber-50/30 hover:border-amber-200 hover:shadow-amber-100/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:grid md:grid-cols-12 md:items-center gap-5 relative group ${hoverClasses}`}
      id={`booking-card-${booking.id}`}
    >
      {/* Client Identity details */}
      <div className="flex items-center gap-4 md:col-span-3 min-w-0">
        <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 shrink-0 border border-pink-100">
          <User className="w-6 h-6" />
        </div>
        <div className="space-y-0.5 truncate">
          <h4 className="font-bold text-slate-800 text-base md:text-lg transition-colors truncate">
            {booking.name}
          </h4>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs md:text-sm">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{maskPhoneNumber(booking.phone)}</span>
          </div>
        </div>
      </div>

      {/* Facility Selection */}
      <div className="flex items-start md:items-center gap-3 md:col-span-3 min-w-0">
        <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0 border border-red-100 md:self-center self-start">
          <Activity className="w-4 h-4" />
        </div>
        <div className="flex flex-col truncate">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Facility
          </span>
          <span className="font-semibold text-slate-800 text-sm md:text-base truncate">
            {booking.facility}
          </span>
        </div>
      </div>

      {/* Slot Schedule and Clock */}
      <div className="flex items-start md:items-center gap-3 md:col-span-4 min-w-0">
        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg shrink-0 border border-slate-200 md:self-center self-start">
          <Clock className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase">
            Time
          </span>
          <span className="font-semibold text-slate-800 text-sm md:text-base whitespace-nowrap">
            {booking.time}
          </span>
        </div>
      </div>

      {/* Confirmation Badge */}
      <div className="flex items-center justify-start md:justify-end md:col-span-2">
        {booking.status === "Confirmed" ? (
          <span className="px-4 py-1.5 text-xs font-semibold text-green-700 bg-green-50/50 border border-green-200 rounded-full select-none flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
            Confirmed
          </span>
        ) : (
          <span className="px-4 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50/50 border border-amber-200 rounded-full select-none flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            NC-Y
          </span>
        )}
      </div>
    </motion.div>
  );
}
