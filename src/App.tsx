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
  Search
} from "lucide-react";
import FalconLogo from "./components/FalconLogo";
import BookingCard from "./components/BookingCard";
import FacilitiesGrid from "./components/FacilitiesGrid";
import SlotAvailabilityChecker, { parseRange, rangesOverlap } from "./components/SlotAvailabilityChecker";
import { Booking } from "./types";

export default function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dropboxUrl, setDropboxUrl] = useState("https://www.dropbox.com/scl/fi/zsr8s25h7khrqiq3hegtx/Booking.xlsx?rlkey=x8r0yq1n4a61w148hz97o4tl3&st=mc1zyydf&dl=0");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeQuery, setSearchTimeQuery] = useState("");
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState("All");

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
    return matchesName && matchesTime && matchesFacility;
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-red-500 selection:text-white antialiased font-sans">
      
      {/* Sticky Premium Header Menu */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="cursor-pointer">
            <FalconLogo />
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-sm font-semibold text-slate-900 hover:text-red-650 transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection("todays-bookings")}
              className="text-sm font-semibold text-slate-600 hover:text-red-650 transition-colors"
            >
              Today's Bookings
            </button>
            <button 
              onClick={() => scrollToSection("facilities")}
              className="text-sm font-semibold text-slate-600 hover:text-red-650 transition-colors"
            >
              Our Facilities
            </button>
            <button 
              onClick={() => scrollToSection("contact")}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm shadow-xs transition-all duration-150"
            >
              Contact Us
            </button>
          </nav>

          {/* Collapsible Mobile Menu Trigger Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg"
              id="mobile-menu-trigger"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg"
          >
            <button
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-base font-semibold text-slate-900 rounded-lg hover:bg-slate-50"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("todays-bookings")}
              className="block w-full text-left px-3 py-2 text-base font-semibold text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Today's Bookings
            </button>
            <button
              onClick={() => scrollToSection("facilities")}
              className="block w-full text-left px-3 py-2 text-base font-semibold text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Our Facilities
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full text-left px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-center"
            >
              Contact Us
            </button>
          </motion.div>
        )}
      </header>

      {/* Main Structural Layout Containers */}
      <main className="flex-1 w-full flex flex-col">
        
        {/* HERO INTRO BLOCK (Image 8) */}
        <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-200/55 bg-gradient-to-t from-red-100/60 via-red-50/25 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-sans font-extrabold text-slate-900 tracking-tight leading-[1.05] max-w-4xl mx-auto">
                Welcome to <span className="text-[#DC2626]">Falcon <br className="sm:hidden" />Sport Complex</span>
              </h1>
              <p className="text-slate-500 text-[20px] font-sans max-w-2xl mx-auto font-medium leading-relaxed">
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200/75 shadow-xs hover:shadow-sm transition-shadow flex flex-col gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-[#DC2626] border border-red-100/60 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-950 text-base md:text-lg tracking-tight">
                    Professional Equipment
                  </h3>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-normal">
                    Top-tier cricket nets and bowling machines for optimal training
                  </p>
                </div>
              </div>

              {/* Card 2: Expert Coaching */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/75 shadow-xs hover:shadow-sm transition-shadow flex flex-col gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-[#DC2626] border border-red-100/60 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-950 text-base md:text-lg tracking-tight">
                    Expert Coaching
                  </h3>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-normal">
                    Experienced coaches available for personalized training sessions
                  </p>
                </div>
              </div>

              {/* Card 3: Real-time update */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/75 shadow-xs hover:shadow-sm transition-shadow flex flex-col gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-[#DC2626] border border-red-100/60 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-950 text-base md:text-lg tracking-tight">
                    Real-time Booking
                  </h3>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-normal">
                    Easy online booking system with instant confirmation
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* TODAY'S BOOKINGS SECTION (Image 6 & 7) */}
        <section id="todays-bookings" className="py-20 bg-slate-50 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            {/* Header copy block (Image 6) */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-sans font-bold text-slate-900 tracking-tight">
                Today's bookings
              </h2>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                Real-time booking information updated every 30 seconds
              </p>
                           {/* Dynamic last updated pill indicator */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                <button 
                  onClick={() => fetchBookings()} 
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 rounded-full border border-slate-200 transition-all text-slate-600"
                  title="Manually trigger update from Dropbox excel sheet"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? "animate-spin text-red-650" : ""}`} />
                  <span>Last updated: {lastUpdated || "Initializing..."}</span>
                </button>
              </div>
            </div>

            {/* Interactive Search & Filter Controls Grid */}
            {bookings.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="text-left">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Filter Live Bookings List</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name search field */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by customer name..."
                      className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-205 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-650 transition-all text-sm font-semibold"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors animate-fade-in"
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
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-205 hover:border-slate-300 rounded-xl text-slate-800 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-655 transition-all cursor-pointer"
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
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-205 hover:border-slate-300 rounded-xl text-slate-800 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-650 transition-all cursor-pointer"
                    >
                      <option value="All">All Facilities</option>
                      <option value="Net Sessions">Net Sessions</option>
                      <option value="Bowling Machine">Bowling Machine</option>
                      <option value="Gym">Gym</option>
                    </select>
                  </div>
                </div>

                {/* Reset Filters button */}
                {(searchQuery || searchTimeQuery || selectedFacilityFilter !== "All") && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchTimeQuery("");
                        setSelectedFacilityFilter("All");
                      }}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Live Interactive Slot Capacity checker widget */}
            {bookings.length > 0 && (
              <SlotAvailabilityChecker bookings={bookings} />
            )}

            {/* Real Bookings Card List Stack */}
            <div className="space-y-12">
              {bookings.length > 0 ? (
                filteredBookings.length > 0 ? (
                  <>
                    {/* Confirmed Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                        <h3 className="font-sans font-bold text-slate-900 text-base md:text-lg tracking-tight">
                          Confirmed Bookings
                        </h3>
                        <span className="ml-auto px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold text-xs border border-green-200">
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
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-sm">
                          No confirmed bookings match your search.
                        </div>
                      )}
                    </div>

                    {/* Pending NC-Y Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                        <h3 className="font-sans font-bold text-slate-900 text-base md:text-lg tracking-tight">
                          Not Confirmed Yet (NC-Y)
                        </h3>
                        <span className="ml-auto px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200">
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
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-sm">
                          No pending (NC-Y) bookings match your search.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center space-y-3 shadow-sm">
                    <Search className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-lg text-slate-700">No matching bookings found</h4>
                    <p className="text-slate-500 text-sm">We couldn't find any booking matching your active filters.</p>
                    <button 
                      onClick={() => {
                        setSearchQuery("");
                        setSearchTimeQuery("");
                        setSelectedFacilityFilter("All");
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center space-y-4 shadow-sm">
                  {isSyncing ? (
                    <div className="space-y-3 py-4">
                      <RefreshCw className="w-10 h-10 text-red-600 animate-spin mx-auto" />
                      <p className="text-slate-500 text-sm font-semibold">Connecting to active bookings ledger...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
                      <h4 className="font-bold text-lg text-slate-700">No active sessions listed</h4>
                      <p className="text-slate-500 text-sm">There are currently no slots reserved for today's net bookings list on disk.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </section>

        {/* OUR FACILITIES GRID SECTION (Images 9 & 10) */}
        <section id="facilities" className="py-20 bg-white border-t border-b border-slate-200/50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FacilitiesGrid />
          </div>
        </section>

      </main>

      {/* FOOTER & CONTACT DATA BLOCK (Image 7 bottom) */}
      <footer id="contact" className="bg-white border-t border-slate-200 pt-16 pb-8 text-slate-600 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-slate-200/80">
            
            {/* Left Col: Brand and values */}
            <div className="space-y-4 text-left">
              <h3 className="font-sans font-extrabold text-slate-900 text-lg md:text-xl tracking-tight uppercase">
                Falcon Sport Complex
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Premier cricket training facility with state-of-the-art equipment and professional coaching to elevate your cricketing skills.
              </p>
            </div>

            {/* Middle Col: Bulleted lists of Facilities */}
            <div className="space-y-4 text-left">
              <h3 className="font-sans font-bold text-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Facilities
              </h3>
              <ul className="space-y-2 text-sm text-slate-500 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  4 Professional Cricket Nets
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
              <h3 className="font-sans font-bold text-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Contact Information
              </h3>
              <ul className="space-y-3.5 text-sm text-slate-500 font-medium">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>123 Sports Avenue, Cricket District, Malabe</span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneCall className="w-4 h-4 text-red-600 shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="truncate">info@falconsportcomplex.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Open Daily: 6:00 AM – 10:00 PM</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Sub-footer copyright / fineprints block (Image 7) */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <span>
              &copy; {new Date().getFullYear()} Falcon Sport Complex. All rights reserved.
            </span>
            <div className="flex gap-6">
              <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-slate-600 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
