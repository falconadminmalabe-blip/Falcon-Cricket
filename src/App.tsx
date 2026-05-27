import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Trophy, 
  Users, 
  Zap, 
  Activity, 
  Clock, 
  MapPin, 
  PhoneCall, 
  Mail, 
  RefreshCw,
  ChevronDown,
  CalendarDays,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Shield,
  Wind,
  Facebook,
  Instagram,
  User,
  LogOut
} from "lucide-react";
import FalconLogo from "./components/FalconLogo";
import BookingCard from "./components/BookingCard";
import FacilitiesGrid from "./components/FacilitiesGrid";
import SlotAvailabilityChecker, { parseRange, rangesOverlap } from "./components/SlotAvailabilityChecker";
import { Booking } from "./types";
import ContactPage from "./components/ContactPage";
import AcademyPage from "./components/AcademyPage";
import CricketShopPage from "./components/CricketShopPage";
import PrivacyPolicyModal from "./components/PrivacyPolicyModal";
import SignInModal from "./components/SignInModal";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "academy" | "contact" | "shop">("home");
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [privacyModalTab, setPrivacyModalTab] = useState<"privacy" | "terms">("privacy");
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signedInPhone, setSignedInPhone] = useState<string | null>(() => {
    return localStorage.getItem("falcon_phone_auth");
  });
  const [signedInName, setSignedInName] = useState<string | null>(() => {
    return localStorage.getItem("falcon_user_name");
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("isDarkMode");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("isDarkMode", String(isDarkMode));
  }, [isDarkMode]);

  const handleSignIn = (phone: string, name: string) => {
    setSignedInPhone(phone);
    setSignedInName(name);
    localStorage.setItem("falcon_phone_auth", phone);
    localStorage.setItem("falcon_user_name", name);
  };

  const handleSignOut = () => {
    setSignedInPhone(null);
    setSignedInName(null);
    setShowOnlyMyBookings(false);
    localStorage.removeItem("falcon_phone_auth");
    localStorage.removeItem("falcon_user_name");
  };

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dropboxUrl, setDropboxUrl] = useState("https://www.dropbox.com/scl/fi/zsr8s25h7khrqiq3hegtx/Booking.xlsx?rlkey=x8r0yq1n4a61w148hz97o4tl3&st=mc1zyydf&dl=0");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeQuery, setSearchTimeQuery] = useState("");
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState("All");
  const [showOnlyMyBookings, setShowOnlyMyBookings] = useState(false);

  const uniqueTimeOptions = useMemo(() => {
    const times = new Set<string>();
    bookings.forEach((b) => {
      if (b.time) {
        const t = b.time.trim();
        if (t) times.add(t);
      }
    });
    // Sort chronologically using robust parseRange helper
    return Array.from(times).sort((a, b) => {
      const r1 = parseRange(a);
      const r2 = parseRange(b);
      const s1 = r1 ? r1.start : 0;
      const s2 = r2 ? r2.start : 0;
      return s1 - s2;
    });
  }, [bookings]);

  const filteredBookings = bookings.filter((b) => {
    const matchesName = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTime = false;
    const bTimeLower = b.time.toLowerCase().trim();
    const qTimeLower = searchTimeQuery.toLowerCase().trim();
    
    if (!qTimeLower) {
      matchesTime = true;
    } else {
      // Substring fallback
      if (bTimeLower.includes(qTimeLower) || qTimeLower.includes(bTimeLower)) {
        matchesTime = true;
      } else {
        // Evaluate dynamic overlap ranges
        try {
          const r1 = parseRange(qTimeLower);
          const r2 = parseRange(bTimeLower);
          if (r1 && r2) {
            matchesTime = rangesOverlap(r1, r2);
          }
        } catch (e) {
          console.error("Main search time parsed issue:", e);
        }
      }
    }

    const matchesFacility = selectedFacilityFilter === "All" || 
      b.facility.toLowerCase().includes(selectedFacilityFilter.toLowerCase()) ||
      selectedFacilityFilter.toLowerCase().includes(b.facility.toLowerCase());

    const matchesOnlyMyBookings = !showOnlyMyBookings || (() => {
      if (!signedInPhone) return true;
      const cleanPhoneAuth = signedInPhone.replace(/[^0-9]/g, "");
      const cleanBPhone = b.phone ? b.phone.replace(/[^0-9]/g, "") : "";
      if (!cleanBPhone) return false;
      return cleanBPhone === cleanPhoneAuth || cleanBPhone.includes(cleanPhoneAuth) || cleanPhoneAuth.includes(cleanBPhone);
    })();

    return matchesName && matchesTime && matchesFacility && matchesOnlyMyBookings;
  });

  const confirmedBookings = filteredBookings.filter((b) => b.status === "Confirmed");
  const pendingBookings = filteredBookings.filter((b) => b.status === "Pending");

  // Fetch from our full-stack Express backend
  const fetchBookings = async (urlToFetch: string = dropboxUrl) => {
    setIsSyncing(true);
    try {
      const apiEndpoint = urlToFetch 
        ? `/api/bookings?url=${encodeURIComponent(urlToFetch)}` 
        : "/api/bookings";
      
      const res = await fetch(apiEndpoint);
      if (!res.ok) throw new Error("Could not fetch bookings from server.");
      const data = await res.json();
      
      if (data.success) {
        setBookings(data.data);
        setSyncError(data.warning || null);
      } else {
        throw new Error(data.error || "Failed parsing sheet headers.");
      }
    } catch (err: any) {
      console.error("Fetch failed:", err);
      setSyncError(err.message || "Failed connecting to backend.");
    } finally {
      setIsSyncing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  // Run initial load and set active polling
  useEffect(() => {
    fetchBookings();
    
    // Poll every 30 seconds as outlined in the design spec
    const interval = setInterval(() => {
      fetchBookings();
    }, 30000);

    return () => clearInterval(interval);
  }, [dropboxUrl]);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen flex flex-col selection:bg-red-500 selection:text-white antialiased font-sans transition-colors duration-300 ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      
      {/* Sticky Premium Header Menu */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b shadow-xs transition-colors duration-300 ${
        isDarkMode 
          ? "bg-slate-900/95 border-slate-800/80 text-slate-100" 
          : "bg-white/90 border-slate-200/60 text-slate-800"
      }`}>
        <div className="max-w-none w-full px-6 lg:px-8 h-20 flex items-center justify-between">
          <div onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="cursor-pointer">
            <FalconLogo isDarkMode={isDarkMode} />
          </div>
          
          <div className="flex items-center">
            <nav className="hidden md:flex items-center gap-7">
              <button 
                onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`text-sm font-semibold transition-colors ${
                  currentView === "home"
                    ? "text-red-500"
                    : isDarkMode ? "text-slate-200 hover:text-red-400" : "text-slate-900 hover:text-red-650"
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => { setCurrentView("academy"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`text-sm font-semibold transition-colors ${
                  currentView === "academy"
                    ? "text-red-500"
                    : isDarkMode ? "text-slate-350 hover:text-red-400" : "text-slate-600 hover:text-red-650"
                }`}
              >
                Falcon Academy
              </button>
              <button 
                onClick={() => { setCurrentView("shop"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`text-sm font-semibold transition-colors relative ${
                  currentView === "shop"
                    ? "text-[#DC2626]"
                    : isDarkMode ? "text-slate-355 hover:text-red-300" : "text-slate-600 hover:text-red-650"
                }`}
              >
                Cricket Shop
                <span className="absolute -top-1.5 -right-3.5 bg-yellow-400 text-slate-950 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border border-white dark:border-slate-900 shadow-xs scale-90">
                  SOON
                </span>
              </button>
              <button 
                onClick={() => { setCurrentView("home"); setTimeout(() => scrollToSection("todays-bookings"), 120); }}
                className={`text-sm font-semibold transition-colors ${
                  isDarkMode ? "text-slate-350 hover:text-red-400" : "text-slate-600 hover:text-red-650"
                }`}
              >
                Today's Bookings
              </button>
              <button 
                onClick={() => { setCurrentView("home"); setTimeout(() => scrollToSection("facilities"), 120); }}
                className={`text-sm font-semibold transition-colors ${
                  isDarkMode ? "text-slate-355 hover:text-red-300" : "text-slate-600 hover:text-red-650"
                }`}
              >
                Our Facilities
              </button>
              {signedInPhone ? (
                <button 
                  onClick={() => setIsSignInModalOpen(true)}
                  className="px-3.5 py-1.5 bg-red-600/10 hover:bg-red-600/15 text-red-500 hover:text-red-650 font-semibold rounded-xl text-sm border border-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  id="header-signed-in-profile"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="max-w-[120px] truncate">{signedInName || signedInPhone}</span>
                </button>
              ) : (
                <button 
                  onClick={() => setIsSignInModalOpen(true)}
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isDarkMode ? "text-slate-350 hover:text-red-400" : "text-slate-600 hover:text-red-650"
                  }`}
                  id="header-signin-btn"
                >
                  <User className="w-4 h-4" />
                  <span>My Bookings</span>
                </button>
              )}
              
              <button 
                onClick={() => { setCurrentView("contact"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm shadow-xs transition-all duration-150"
              >
                Contact Us
              </button>
              
              {/* Desktop Theme Toggle aligned inside the Nav to ensure consistent, beautiful spacing */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750" 
                    : "bg-slate-100 border-slate-200 text-slate-750 hover:bg-slate-200"
                }`}
                id="theme-toggle"
                aria-label="Toggle dark mode"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </nav>

            {/* Mobile menu indicators */}
            <div className="flex items-center gap-2.5 md:hidden">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750" 
                    : "bg-slate-100 border-slate-200 text-slate-750 hover:bg-slate-200"
                }`}
                id="theme-toggle-mobile"
                aria-label="Toggle dark mode"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`p-2 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg ${
                    isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                  id="mobile-menu-trigger"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`md:hidden border-b px-4 pt-2 pb-6 space-y-3 shadow-lg ${
              isDarkMode ? "bg-slate-900 border-slate-805" : "bg-white border-slate-200"
            }`}
          >
            <button
              onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-3 py-2 text-base font-semibold rounded-lg ${
                isDarkMode ? "text-slate-200 hover:bg-slate-800" : "text-slate-900 hover:bg-slate-50"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { setCurrentView("academy"); window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-3 py-2 text-base font-semibold rounded-lg ${
                isDarkMode ? "text-slate-200 hover:bg-slate-800" : "text-slate-900 hover:bg-slate-50"
              }`}
            >
              Falcon Academy
            </button>
            <button
              onClick={() => { setCurrentView("shop"); window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-3 py-2 text-base font-semibold rounded-lg flex items-center justify-between ${
                currentView === "shop"
                  ? "text-[#DC2626] bg-red-500/5"
                  : isDarkMode ? "text-slate-200 hover:bg-slate-800" : "text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>Cricket Shop</span>
              <span className="bg-yellow-400 text-slate-950 text-[8px] font-extrabold px-2 py-0.5 rounded-full scale-90">
                SOON
              </span>
            </button>
            <button
              onClick={() => { setCurrentView("home"); setMobileMenuOpen(false); setTimeout(() => scrollToSection("todays-bookings"), 120); }}
              className={`block w-full text-left px-3 py-2 text-base font-semibold rounded-lg ${
                isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Today's Bookings
            </button>
            <button
              onClick={() => { setCurrentView("home"); setMobileMenuOpen(false); setTimeout(() => scrollToSection("facilities"), 120); }}
              className={`block w-full text-left px-3 py-2 text-base font-semibold rounded-lg ${
                isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Our Facilities
            </button>
            {signedInPhone ? (
              <div className={`p-3 rounded-lg border flex flex-col gap-2 ${
                isDarkMode ? "bg-slate-800/40 border-slate-750 text-slate-200" : "bg-red-500/5 border-red-100 text-slate-800"
              }`}>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setIsSignInModalOpen(true); setMobileMenuOpen(false); }}
                    className="flex items-center gap-2 text-red-500 font-bold text-left text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>My Booking Dashboard</span>
                  </button>
                  <button
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="text-xs text-slate-450 hover:text-red-500 font-bold flex items-center gap-1 border border-transparent"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
                <div className="text-[11px] font-semibold text-slate-450">
                  Logged in as: <strong className={isDarkMode ? "text-slate-200" : "text-slate-800"}>{signedInName} ({signedInPhone})</strong>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setIsSignInModalOpen(true); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 text-base font-semibold rounded-lg flex items-center gap-2 ${
                  isDarkMode ? "text-slate-200 hover:bg-slate-800" : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                <User className="w-5 h-5 text-red-500" />
                <span>My Bookings</span>
              </button>
            )}

            <button
              onClick={() => { setCurrentView("contact"); window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-center"
            >
              Contact Us
            </button>
          </motion.div>
        )}
      </header>

      {/* Main Structural Layout Containers */}
      <main className="flex-1 w-full flex flex-col">
        {currentView === "contact" ? (
          <ContactPage isDarkMode={isDarkMode} onBack={() => setCurrentView("home")} />
        ) : currentView === "academy" ? (
          <AcademyPage isDarkMode={isDarkMode} onBack={() => setCurrentView("home")} />
        ) : currentView === "shop" ? (
          <CricketShopPage isDarkMode={isDarkMode} onBack={() => setCurrentView("home")} />
        ) : (
          <>
            {/* HERO INTRO BLOCK (Image 8) */}
        <section className={`relative overflow-hidden pt-16 pb-24 border-b transition-colors duration-300 ${
          isDarkMode 
            ? "bg-gradient-to-t from-red-950/20 via-slate-900/40 to-slate-950 border-slate-800" 
            : "bg-gradient-to-t from-red-100/60 via-red-50/25 to-white border-slate-200/55"
        }`}>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h1 className={`text-5xl sm:text-6xl md:text-7xl font-sora font-normal tracking-tight leading-[1.05] max-w-4xl mx-auto ${
                isDarkMode ? "text-slate-100" : "text-slate-900"
              }`}>
                Welcome To <span className="text-[#DC2626]">Falcon <br className="sm:hidden" />Sport Complex</span>
              </h1>
              <p className={`text-[20px] font-sans max-w-2xl mx-auto font-medium leading-relaxed ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                Experience world-class cricket training with our premium facilities, professional coaching, and state-of-the-art equipment
              </p>
            </motion.div>

            {/* View Today's Bookings anchor Scroll button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <button
                onClick={() => scrollToSection("todays-bookings")}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250 font-bold text-sm tracking-wide"
              >
                <span>View Today's Bookings</span>
                <span className="text-md font-extrabold">↓</span>
              </button>
            </motion.div>

            {/* Sub-features highlight grids (Image 8 bottom) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left"
            >
              {/* Card 1: Equipment */}
              <div className={`p-6 rounded-2xl border shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col gap-4 ${
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 text-slate-100" 
                  : "bg-white border-slate-200/75 text-slate-950"
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                  isDarkMode 
                    ? "bg-red-950/20 text-red-400 border-red-900/35" 
                    : "bg-red-50 text-[#DC2626] border-red-100/60"
                }`}>
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className={`font-bold text-base md:text-lg tracking-tight ${
                    isDarkMode ? "text-slate-100" : "text-slate-950"
                  }`}>
                    Professional Equipment
                  </h3>
                  <p className={`text-xs md:text-sm leading-relaxed font-normal ${
                    isDarkMode ? "text-slate-400" : "text-slate-505"
                  }`}>
                    Top-tier cricket nets and bowling machines for optimal training
                  </p>
                </div>
              </div>

              {/* Card 2: Expert Coaching */}
              <div className={`p-6 rounded-2xl border shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col gap-4 ${
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 text-slate-100" 
                  : "bg-white border-slate-200/75 text-slate-950"
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                  isDarkMode 
                    ? "bg-red-950/20 text-red-400 border-red-900/35" 
                    : "bg-red-50 text-[#DC2626] border-red-100/60"
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className={`font-bold text-base md:text-lg tracking-tight ${
                    isDarkMode ? "text-slate-100" : "text-slate-950"
                  }`}>
                    Expert Coaching
                  </h3>
                  <p className={`text-xs md:text-sm leading-relaxed font-normal ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Experienced coaches available for personalized training sessions
                  </p>
                </div>
              </div>

              {/* Card 3: Real-time update */}
              <div className={`p-6 rounded-2xl border shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col gap-4 ${
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 text-slate-100" 
                  : "bg-white border-slate-200/75 text-slate-950"
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                  isDarkMode 
                    ? "bg-red-950/20 text-red-400 border-red-900/35" 
                    : "bg-red-50 text-[#DC2626] border-red-100/60"
                }`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className={`font-bold text-base md:text-lg tracking-tight ${
                    isDarkMode ? "text-slate-100" : "text-slate-950"
                  }`}>
                    Real-time Booking
                  </h3>
                  <p className={`text-xs md:text-sm leading-relaxed font-normal ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Easy online booking system with instant confirmation
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* WHY CHOOSE FALCON SECTION */}
        <section className={`py-12 transition-colors duration-300 unfolded-why-choose ${
          isDarkMode ? "bg-slate-950" : "bg-white"
        }`} id="why-choose-falcon">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className={`rounded-3xl p-8 md:p-12 lg:p-14 text-center transition-all duration-300 border ${
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 text-slate-100" 
                  : "bg-slate-50 border-slate-200/80 text-slate-900" 
              }`}
            >
              <div className="space-y-3">
                <h2 className={`text-3xl md:text-4xl font-sora font-extrabold tracking-tight ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}>
                  Why Choose Falcon?
                </h2>
                <p className={`text-sm md:text-base font-medium max-w-xl mx-auto ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}>
                  Everything you need for professional cricket training
                </p>
              </div>

              {/* Grid: 4 features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mt-12">
                
                {/* 1. Safe Nets */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex flex-col items-center text-center space-y-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#DC2626] flex items-center justify-center text-white shadow-md shadow-[#DC2626]/20 transition-transform duration-300 group-hover:scale-110">
                    <Shield className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-bold text-lg tracking-tight ${
                      isDarkMode ? "text-slate-100" : "text-slate-900"
                    }`}>
                      Safe Nets
                    </h3>
                    <p className={`text-xs md:text-sm leading-relaxed max-w-[200px] mx-auto font-medium ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Protected enclosed practice areas
                    </p>
                  </div>
                </motion.div>

                {/* 2. Climate Control */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex flex-col items-center text-center space-y-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#DC2626] flex items-center justify-center text-white shadow-md shadow-[#DC2626]/20 transition-transform duration-300 group-hover:scale-110">
                    <Wind className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-bold text-lg tracking-tight ${
                      isDarkMode ? "text-slate-100" : "text-slate-900"
                    }`}>
                      Climate Control
                    </h3>
                    <p className={`text-xs md:text-sm leading-relaxed max-w-[200px] mx-auto font-medium ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Year-round comfortable environment
                    </p>
                  </div>
                </motion.div>

                {/* 3. Bowling Machine */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex flex-col items-center text-center space-y-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#DC2626] flex items-center justify-center text-white shadow-md shadow-[#DC2626]/20 transition-transform duration-300 group-hover:scale-110">
                    <Zap className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-bold text-lg tracking-tight ${
                      isDarkMode ? "text-slate-100" : "text-slate-900"
                    }`}>
                      Bowling Machine
                    </h3>
                    <p className={`text-xs md:text-sm leading-relaxed max-w-[200px] mx-auto font-medium ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Professional variable speed technology
                    </p>
                  </div>
                </motion.div>

                {/* 4. Expert Coaching */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="flex flex-col items-center text-center space-y-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#DC2626] flex items-center justify-center text-white shadow-md shadow-[#DC2626]/20 transition-transform duration-300 group-hover:scale-110">
                    <Users className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-bold text-lg tracking-tight ${
                      isDarkMode ? "text-slate-100" : "text-slate-900"
                    }`}>
                      Expert Coaching
                    </h3>
                    <p className={`text-xs md:text-sm leading-relaxed max-w-[200px] mx-auto font-medium ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Professional trainers available
                    </p>
                  </div>
                </motion.div>

              </div>

            </motion.div>
          </div>
        </section>

        {/* TODAY'S BOOKINGS SECTION (Image 6 & 7) */}
        <section id="todays-bookings" className={`py-20 scroll-mt-20 transition-colors duration-300 ${
          isDarkMode ? "bg-slate-900 border-t border-b border-slate-800" : "bg-slate-50"
        }`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            {/* Header copy block (Image 6) */}
            <div className="text-center space-y-3">
              <h2 className={`text-3xl md:text-4xl font-sans font-bold tracking-tight ${
                isDarkMode ? "text-slate-100" : "text-slate-900"
              }`}>
                Today's bookings
              </h2>
              <p className={`text-sm md:text-base leading-relaxed ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                Real-time booking information updated every 30 seconds
              </p>
                           {/* Dynamic last updated pill indicator */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold">
                <button 
                  onClick={() => fetchBookings()} 
                  disabled={isSyncing}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-bold ${
                    isDarkMode 
                      ? "bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-350" 
                      : "bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 border-slate-200 text-slate-600"
                  }`}
                  title="Manually trigger update from Dropbox excel sheet"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-red-500" : isDarkMode ? "text-slate-500" : "text-slate-450"}`} />
                  <span>Last updated: {lastUpdated || "Initializing..."}</span>
                </button>
              </div>
            </div>

            {/* Signed-in quick dashboard banner */}
            {signedInPhone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl border text-left shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-slate-850/50 border-red-500/10 hover:border-red-500/20" 
                    : "bg-red-50/40 border-red-100 hover:border-red-200"
                }`}
                id="user-personal-booking-banner"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626] inline-block animate-pulse" />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      Member Practice Desk
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
                    Welcome, {signedInName || "Practitioner"}!
                  </h3>
                  <p className={`text-xs ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>
                    Active practice sessions listed matching <strong>{signedInPhone}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => setIsSignInModalOpen(true)}
                    className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer shadow-xs ${
                      isDarkMode 
                        ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-550/20" 
                        : "bg-red-600 hover:bg-red-700 text-white border-transparent"
                    }`}
                  >
                    View My Agenda ({bookings.filter(b => b.phone && b.phone.replace(/[^0-9]/g, "").includes(signedInPhone.replace(/[^0-9]/g, "")) || (b.phone && signedInPhone.replace(/[^0-9]/g, "").includes(b.phone.replace(/[^0-9]/g, "")))).length})
                  </button>
                  <button
                    onClick={() => handleSignOut()}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isDarkMode 
                        ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400" 
                        : "bg-white border-slate-200 text-slate-550 hover:text-red-600"
                    }`}
                    title="Sign out of practice session desk"
                    id="banner-signout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Interactive Search & Filter Controls Grid */}
            {bookings.length > 0 && (
              <div className={`rounded-3xl border p-6 shadow-xs space-y-4 ${
                isDarkMode ? "bg-slate-850/60 border-slate-800" : "bg-white border-slate-200/80"
              }`}>
                <div className="text-left">
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}>Filter Live Bookings List</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name search field */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by customer name..."
                      className={`block w-full pl-10 pr-10 py-3 border rounded-xl placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-650 transition-all text-sm font-semibold ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-100" 
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-450 hover:text-slate-300 transition-colors animate-fade-in"
                        title="Clear customer search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Time Filter Select Dropdown */}
                  <div className="relative">
                    <select
                      value={searchTimeQuery}
                      onChange={(e) => setSearchTimeQuery(e.target.value)}
                      className={`block w-full px-4 py-3 border rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all cursor-pointer ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-200" 
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <option value="">All Booking Times</option>
                      {uniqueTimeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Facility Select filter Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedFacilityFilter}
                      onChange={(e) => setSelectedFacilityFilter(e.target.value)}
                      className={`block w-full px-4 py-3 border rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-600 transition-all cursor-pointer ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-300" 
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <option value="All">All Facilities</option>
                      <option value="Net Sessions">Net Sessions</option>
                      <option value="Bowling Machine">Bowling Machine</option>
                      <option value="Gym">Gym</option>
                    </select>
                  </div>
                </div>

                {/* Reset Filters & My Bookings filter controls row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div>
                    {signedInPhone ? (
                      <button
                        type="button"
                        onClick={() => setShowOnlyMyBookings(!showOnlyMyBookings)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
                          showOnlyMyBookings
                            ? "bg-red-600 text-white border-red-650 shadow-xs"
                            : isDarkMode
                              ? "bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750 hover:text-slate-200"
                              : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800"
                        }`}
                        id="show-only-my-bookings-toggle"
                      >
                        <span className={`w-2 h-2 rounded-full ${showOnlyMyBookings ? "bg-white animate-pulse" : "bg-red-500"}`} />
                        Show only my bookings
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsSignInModalOpen(true)}
                        className={`text-xs font-bold flex items-center gap-1 hover:underline transition-all cursor-pointer ${
                          isDarkMode ? "text-slate-400 hover:text-red-400" : "text-slate-500 hover:text-red-650"
                        }`}
                        id="filter-prompt-signin-btn"
                      >
                        <User className="w-3.5 h-3.5" /> Already booked? Sign in to isolate your slots
                      </button>
                    )}
                  </div>

                  {(searchQuery || searchTimeQuery || selectedFacilityFilter !== "All" || showOnlyMyBookings) && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchTimeQuery("");
                        setSelectedFacilityFilter("All");
                        setShowOnlyMyBookings(false);
                      }}
                      className="text-xs font-extrabold text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 transition-all cursor-pointer"
                      id="reset-filters-btn"
                    >
                      <X className="w-3.5 h-3.5" /> Reset All Filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Live Interactive Slot Capacity checker widget */}
            {bookings.length > 0 && (
              <SlotAvailabilityChecker bookings={bookings} isDarkMode={isDarkMode} />
            )}             {/* Real Bookings Card List Stack */}
            <div className="space-y-12">
              {bookings.length > 0 ? (
                filteredBookings.length > 0 ? (
                  <>
                    {/* Confirmed Section */}
                    <div className="space-y-4">
                      <div className={`flex items-center gap-2 pb-2 border-b ${
                        isDarkMode ? "border-slate-800" : "border-slate-200/60"
                      }`}>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                        <h3 className={`font-sans font-bold text-base md:text-lg tracking-tight ${
                          isDarkMode ? "text-slate-100" : "text-slate-900"
                        }`}>
                          Confirmed Bookings
                        </h3>
                        <span className={`ml-auto px-2.5 py-0.5 rounded-full font-semibold text-xs border ${
                          isDarkMode 
                            ? "bg-green-955/20 text-green-400 border-green-905/30" 
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}>
                          {confirmedBookings.length} {confirmedBookings.length === 1 ? "Session" : "Sessions"}
                        </span>
                      </div>

                      {confirmedBookings.length > 0 ? (
                        <div className="space-y-4">
                          {confirmedBookings.map((booking, index) => (
                            <BookingCard 
                              key={booking.id} 
                              booking={booking} 
                              index={index} 
                              isDarkMode={isDarkMode}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className={`rounded-2xl border border-dashed p-8 text-center text-sm ${
                          isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"
                        }`}>
                          No confirmed bookings match your search.
                        </div>
                      )}
                    </div>

                    {/* Pending NC-Y Section */}
                    <div className="space-y-4">
                      <div className={`flex items-center gap-2 pb-2 border-b ${
                        isDarkMode ? "border-slate-805" : "border-slate-200/60"
                      }`}>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                        <h3 className={`font-sans font-bold text-base md:text-lg tracking-tight ${
                          isDarkMode ? "text-slate-100" : "text-slate-900"
                        }`}>
                          Not Confirmed Yet (NC-Y)
                        </h3>
                        <span className={`ml-auto px-2.5 py-0.5 rounded-full font-semibold text-xs border ${
                          isDarkMode 
                            ? "bg-amber-955/20 text-amber-400 border-amber-900/30" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {pendingBookings.length} {pendingBookings.length === 1 ? "Session" : "Sessions"}
                        </span>
                      </div>

                      {pendingBookings.length > 0 ? (
                        <div className="space-y-4">
                          {pendingBookings.map((booking, index) => (
                            <BookingCard 
                              key={booking.id} 
                              booking={booking} 
                              index={confirmedBookings.length + index} 
                              isDarkMode={isDarkMode}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className={`rounded-2xl border border-dashed p-8 text-center text-sm ${
                          isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"
                        }`}>
                          No pending (NC-Y) bookings match your search.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className={`rounded-2xl border p-12 text-center space-y-3 shadow-xs ${
                    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/70"
                  }`}>
                    <Search className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className={`font-bold text-lg ${isDarkMode ? "text-slate-100" : "text-slate-700"}`}>No matching bookings found</h4>
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>We couldn't find any booking matching your active filters.</p>
                    <button 
                      onClick={() => {
                        setSearchQuery("");
                        setSearchTimeQuery("");
                        setSelectedFacilityFilter("All");
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-150" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Reset All Filters
                    </button>
                  </div>
                )
              ) : (
                <div className={`rounded-2xl border p-12 text-center space-y-4 shadow-xs ${
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/70"
                }`}>
                  {isSyncing ? (
                    <div className="space-y-3 py-4">
                      <RefreshCw className="w-10 h-10 text-red-650 animate-spin mx-auto" />
                      <p className={`text-sm font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Connecting to active bookings ledger...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <CalendarDays className="w-12 h-12 text-slate-455 mx-auto" />
                      <h4 className={`font-bold text-lg ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>No active sessions listed</h4>
                      <p className={`text-sm ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>There are currently no slots reserved for today's net bookings list on disk.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </section>

        {/* OUR FACILITIES GRID SECTION (Images 9 & 10) */}
        <section id="facilities" className={`py-20 border-t border-b scroll-mt-20 ${
          isDarkMode ? "bg-slate-950 border-slate-850" : "bg-white border-slate-200/50"
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FacilitiesGrid isDarkMode={isDarkMode} />
          </div>
        </section>
          </>
        )}
      </main>

      {/* FOOTER & CONTACT DATA BLOCK (Image 7 bottom) */}
      <footer id="contact" className={`pt-16 pb-8 transition-colors duration-300 scroll-mt-20 ${
        isDarkMode ? "bg-slate-900 border-t border-slate-800 text-slate-400" : "bg-white border-t border-slate-200 text-slate-600"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b ${
            isDarkMode ? "border-slate-800" : "border-slate-200/80"
          }`}>
            
            {/* Left Col: Brand and values */}
            <div className="space-y-4 text-left">
              <h3 className={`font-sora font-normal text-lg md:text-xl tracking-tight uppercase ${
                isDarkMode ? "text-slate-100" : "text-slate-900"
              }`}>
                Falcon Sport Complex
              </h3>
              <p className={`text-sm leading-relaxed max-w-sm ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                Premier cricket training facility with state-of-the-art equipment and professional coaching to elevate your cricketing skills.
              </p>
              
              {/* Social Media Links */}
              <div className="flex items-center gap-3 pt-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    isDarkMode 
                      ? "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-red-500 hover:border-slate-700/80 hover:bg-slate-900" 
                      : "bg-slate-50 border-slate-200/80 text-slate-500 hover:text-red-600 hover:border-slate-300 hover:bg-white"
                  }`}
                  aria-label="Facebook"
                  title="Follow us on Facebook"
                >
                  <Facebook className="w-4 h-4 transition-transform group-hover:scale-110" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    isDarkMode 
                      ? "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-red-500 hover:border-slate-700/80 hover:bg-slate-900" 
                      : "bg-slate-50 border-slate-200/80 text-slate-500 hover:text-red-650 hover:border-slate-300 hover:bg-white"
                  }`}
                  aria-label="Instagram"
                  title="Follow us on Instagram"
                >
                  <Instagram className="w-4 h-4 transition-transform group-hover:scale-110" />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    isDarkMode 
                      ? "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-red-500 hover:border-slate-700/80 hover:bg-slate-900" 
                      : "bg-slate-50 border-slate-200/80 text-slate-500 hover:text-red-650 hover:border-slate-300 hover:bg-white"
                  }`}
                  aria-label="TikTok"
                  title="Follow us on TikTok"
                >
                  <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.14.96 1.09 2.3 1.81 3.71 2.03v3.9c-1.39-.1-2.74-.63-3.86-1.5-.66-.51-1.22-1.16-1.63-1.92-.04 2.1-.02 4.2-.03 6.3 0 1.25-.26 2.5-.79 3.63-.66 1.4-1.78 2.56-3.18 3.25-1.5.76-3.21.98-4.85.62-1.89-.41-3.6-1.57-4.66-3.2A9.39 9.39 0 0 1 1 12.82c.04-1.95.73-3.87 1.98-5.38a9.42 9.42 0 0 1 5.34-3.32c1.07-.22 2.19-.23 3.27-.01v4c-.75-.19-1.56-.16-2.29.07a5.3 5.3 0 0 0-2.82 2.1 5.35 5.35 0 0 0-.67 4.19c.41 1.49 1.5 2.76 2.96 3.26a5.34 5.34 0 0 0 5.48-1.07 5.4 5.4 0 0 0 1.57-3.83c.01-4.22-.01-8.43.01-12.65-.01-.06-.01-.11-.01-.17z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Middle Col: Bulleted lists of Facilities */}
            <div className="space-y-4 text-left">
              <h3 className={`font-sans text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode ? "text-slate-500" : "text-slate-400"
              }`}>
                Facilities
              </h3>
              <ul className={`space-y-2 text-sm font-medium ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  3 Professional Cricket Nets
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  1 Advanced Bowling Machine
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  Professional Coaching Available
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  Modern Changing Facilities
                </li>
              </ul>
            </div>

            {/* Right Col: Contact details (Image 7) */}
            <div className="space-y-4 text-left">
              <h3 className={`font-sans text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode ? "text-slate-500" : "text-slate-400"
              }`}>
                Contact Information
              </h3>
              <ul className={`space-y-3.5 text-sm font-medium ${
                isDarkMode ? "text-slate-400" : "text-slate-505"
              }`}>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>Falcon sport complex, new kandy road, pittugala malabe</span>
                </li>
                <li className="flex items-start gap-3">
                  <PhoneCall className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span>077 503 2953</span>
                    <span>077 834 1657</span>
                    <span>071 645 1653</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="truncate">falconadminmalabe@gmail.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span>Weekdays: 10.00AM - 11.00PM</span>
                    <span>Weekend: 7.00AM - 11.00PM</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>

          {/* Sub-footer copyright / fineprints block (Image 7) */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium font-sans">
            <span>
              &copy; {new Date().getFullYear()} Falcon Sport Complex. All rights reserved.
            </span>
            <div className="flex gap-6">
              <button
                onClick={() => {
                  setPrivacyModalTab("privacy");
                  setIsPrivacyModalOpen(true);
                }}
                className="hover:text-red-500 cursor-pointer transition-colors text-left focus:outline-none"
                id="footer-privacy-btn"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => {
                  setPrivacyModalTab("terms");
                  setIsPrivacyModalOpen(true);
                }}
                className="hover:text-red-500 cursor-pointer transition-colors text-left focus:outline-none"
                id="footer-terms-btn"
              >
                Terms of Service
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Dynamic Modal Dialog rendering Privacy Policy & Conditions of Booking */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        defaultTab={privacyModalTab}
        isDarkMode={isDarkMode}
      />

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        bookings={bookings}
        isDarkMode={isDarkMode}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        currentlySignedInPhone={signedInPhone}
        currentlySignedInName={signedInName}
      />

    </div>
  );
}
