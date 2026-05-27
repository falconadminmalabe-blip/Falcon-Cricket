import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Phone, 
  User, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  Trophy,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Booking } from "../types";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  isDarkMode: boolean;
  onSignIn: (phone: string, name: string) => void;
  onSignOut: () => void;
  currentlySignedInPhone: string | null;
  currentlySignedInName: string | null;
}

// Helper to normalize phone numbers for robust matching (e.g. remove spaces, dashes, country code prefix)
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  // If it starts with 94 (Sri Lanka international prefix) and is 11 or 12 chars, normalize to leading 0
  if (cleaned.startsWith("94") && cleaned.length >= 11) {
    cleaned = "0" + cleaned.substring(2);
  }
  return cleaned;
}

export default function SignInModal({
  isOpen,
  onClose,
  bookings,
  isDarkMode,
  onSignIn,
  onSignOut,
  currentlySignedInPhone,
  currentlySignedInName,
}: SignInModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter bookings which match the logged in phone number
  const myBookings = React.useMemo(() => {
    if (!currentlySignedInPhone) return [];
    const normalizedAuth = normalizePhone(currentlySignedInPhone);
    return bookings.filter(b => normalizePhone(b.phone) === normalizedAuth);
  }, [currentlySignedInPhone, bookings]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const trimmed = phoneNumber.trim();
    if (!trimmed) {
      setError("Please enter your phone number.");
      return;
    }

    const digitCount = trimmed.replace(/[^0-9]/g, "").length;
    if (digitCount < 9 || digitCount > 15) {
      setError("Please enter a valid phone number (9-12 digits).");
      return;
    }

    setIsSubmitting(true);

    // Simulate safe authenticating state
    setTimeout(() => {
      const normalizedInput = normalizePhone(trimmed);
      
      // Look for a matching booking to extract the customer's name
      const matchedBooking = bookings.find(b => normalizePhone(b.phone) === normalizedInput);
      
      const displayName = matchedBooking ? matchedBooking.name : "Falcon Member";
      
      onSignIn(trimmed, displayName);
      setIsSubmitting(false);
      setPhoneNumber("");
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            id="signin-modal-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className={`relative w-full max-w-md rounded-2xl border flex flex-col shadow-2xl overflow-hidden z-10 transition-colors duration-300 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
            }`}
            id="signin-modal-content"
          >
            {/* Header banner */}
            <div className={`p-6 border-b flex items-center justify-between ${
              isDarkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? "bg-red-950/30 text-red-400" : "bg-red-50 text-red-600"
                }`}>
                  <Trophy className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-none tracking-tight">
                    {currentlySignedInPhone ? "My Practice Schedule" : "Sign In"}
                  </h2>
                  <p className={`text-xs mt-1 font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {currentlySignedInPhone ? "Falcon Cricket Complex Member" : "Access your active coaching & nets schedule"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-transform hover:scale-105 active:scale-95 ${
                  isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-400" : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                }`}
                aria-label="Close"
                id="signin-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main content body */}
            <div className="p-6 space-y-6">
              {currentlySignedInPhone ? (
                // SIGNED IN SCREEN: List bookings for this user
                <div className="space-y-5">
                  <div className={`p-4 rounded-xl border flex gap-3.5 items-center ${
                    isDarkMode ? "bg-slate-950/20 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="p-2.5 rounded-full bg-red-600/10 text-red-650 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}>
                        Signed In As
                      </p>
                      <p className="text-base font-bold truncate">
                        {currentlySignedInName}
                      </p>
                      <p className={`text-xs font-semibold ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>
                        📱 {currentlySignedInPhone}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onSignOut();
                      }}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-650 flex items-center justify-center transition-all"
                      title="Sign Out of Complex Mode"
                      id="signin-signout-btn"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>

                  {/* My Booking Records List */}
                  <div className="space-y-3">
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>
                      Your Live Bookings Today ({myBookings.length})
                    </h3>

                    {myBookings.length > 0 ? (
                      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                        {myBookings.map((b) => (
                          <div 
                            key={b.id}
                            className={`p-3.5 rounded-xl border flex flex-col gap-2 relative overflow-hidden transition-all ${
                              isDarkMode 
                                ? "bg-slate-850/60 border-slate-800 hover:border-slate-700" 
                                : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                b.status === "Confirmed"
                                  ? isDarkMode ? "bg-green-950/20 text-green-400 border-green-900/30" : "bg-green-50 text-green-700 border-green-200"
                                  : isDarkMode ? "bg-amber-950/20 text-amber-400 border-amber-900/30" : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {b.status}
                              </span>
                              <span className="text-xs font-medium text-slate-450 font-mono">
                                ID #{b.id}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <CalendarDays className="w-4 h-4 text-red-500 shrink-0" />
                              <span className="text-sm font-bold truncate">{b.facility}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-450 shrink-0" />
                              <span className="text-xs font-semibold">{b.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`p-6 border border-dashed rounded-xl text-center space-y-2 ${
                        isDarkMode ? "bg-slate-950/10 border-slate-800 text-slate-450" : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}>
                        <CalendarDays className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-sm font-medium">No live schedules found matching this number.</p>
                        <p className="text-xs max-w-xs mx-auto">Make sure this phone matches the contact details loaded to the booking spreadsheet.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      onClick={onClose}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-all"
                    >
                      Close Schedule Tracker
                    </button>
                  </div>
                </div>
              ) : (
                // SIGN IN FORM
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label 
                      htmlFor="phone-input"
                      className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        id="phone-input"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="e.g. 077 123 4567"
                        className={`block w-full pl-10 pr-4 py-3 border rounded-xl placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-650 transition-all text-sm font-mono font-semibold ${
                          isDarkMode 
                            ? "bg-slate-800 border-slate-700 text-slate-100" 
                            : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-550/25 rounded-lg text-xs font-semibold text-red-500 flex items-center gap-2 animate-pulse">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className={`p-4 rounded-xl border text-xs gap-3 flex items-start leading-relaxed ${
                    isDarkMode ? "bg-slate-950/20 border-slate-800 text-slate-400" : "bg-red-50/30 border-red-100/50 text-slate-600"
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Your phone number is normalized to search bookings in the team ledger. No SMS spam, passwords, or registration configurations are required here.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold rounded-xl text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                    id="signin-submit-btn"
                  >
                    <span>{isSubmitting ? "Locking in..." : "View Personal Schedule"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
