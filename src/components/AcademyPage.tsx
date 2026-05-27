import React from "react";
import { motion } from "motion/react";
import { Users, Target, Sparkles, Trophy, Award, Zap, Phone, Swords, Globe, BookOpen, Dumbbell } from "lucide-react";
import logoImg from "../assets/images/falcon_logo_1779670920742.png";

interface AcademyPageProps {
  isDarkMode: boolean;
  onBack?: () => void;
}

export default function AcademyPage({ isDarkMode }: AcademyPageProps) {
  const valueCards = [
    {
      title: "ICC Certified Coaches",
      desc: "Training with national and experienced certified coaches who track technical flaws and perfect real play parameters.",
      icon: <Users className="w-5 h-5 text-[#DC2626]" />
    },
    {
      title: "Video Telemetry Analysis",
      desc: "We utilize high-speed recorded footage of batting and bowling styles to visually diagnose release and impact gaps.",
      icon: <Target className="w-5 h-5 text-[#DC2626]" />
    },
    {
      title: "Elite Facility Accessibility",
      desc: "Students enjoy dedicated slots on turf-simulation net lanes and premium equipment at Pittugala Malabe.",
      icon: <Sparkles className="w-5 h-5 text-[#DC2626]" />
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col"
      id="academy-page-container"
    >
      {/* HERO SECTION MATCHING HOME PAGE DESIGN (WITH DETAILS CARDS INSIDE) */}
      <section className={`relative overflow-hidden pt-16 pb-20 border-b transition-colors duration-300 ${
        isDarkMode 
          ? "bg-gradient-to-t from-red-950/20 via-slate-900/40 to-slate-950 border-slate-800" 
          : "bg-gradient-to-t from-red-100/60 via-red-50/25 to-white border-slate-200/55"
      }`} id="academy-hero">
        
        {/* LOGO TRANSPARENCY UNDER THE TEXT AND DESCRIPTION */}
        <div className="absolute inset-x-0 top-[5%] md:top-[4%] -translate-y-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <img
            src={logoImg}
            alt="Watermark Logo"
            className={`w-[280px] h-[280px] md:w-[420px] md:h-[420px] object-contain select-none transition-opacity duration-300 ${
              isDarkMode ? "opacity-22 md:opacity-28" : "opacity-6 md:opacity-8"
            }`}
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DC2626]/20 bg-[#DC2626]/5 text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cricket Excellence Hub</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-5xl sm:text-6xl md:text-7xl font-sora font-normal tracking-tight leading-tight ${
              isDarkMode ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Falcon <span className="text-[#DC2626]">Cricket Academy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-base sm:text-lg md:text-xl font-sans max-w-3xl mx-auto font-medium leading-relaxed mb-12 ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Nurturing the next generation of professional cricketing talent in Sri Lanka. Under certified coaches, our intensive structured development programs ensure complete progression in batting techniques, bowling alignments, match strategy, and competitive mindset.
          </motion.p>

          {/* CHOSEN DETAILS CARDS DIRECTLY PLACED ON THE GRADIENT HERO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left" id="academy-value-cards">
            {valueCards.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                className={`p-6 rounded-2xl border flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-slate-900/60 backdrop-blur-xs border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850/70" 
                    : "bg-white/70 backdrop-blur-xs border-slate-200/85 hover:border-slate-300 hover:bg-white/95"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDarkMode ? "bg-red-950/30 border-red-900/40" : "bg-red-50 border-red-100"
                }`}>
                  {v.icon}
                </div>
                <div className="space-y-1.5">
                  <h3 className={`font-bold text-base md:text-lg ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
                    {v.title}
                  </h3>
                  <p className={`text-xs md:text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    {v.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MEET THE COACHES SECTION (PREMIUM SCREENSHOT DESIGN WITH THEME FLUIDITY) */}
      <section className={`py-20 border-b transition-all duration-300 relative overflow-hidden ${
        isDarkMode 
          ? "bg-slate-950/70 border-slate-900" 
          : "bg-slate-50/50 border-slate-100"
      }`} id="academy-coaches">
        {/* Subtle decorative background lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-500/[0.02] dark:bg-red-500/[0.04] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/[0.02] dark:bg-blue-500/[0.04] blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12 relative z-10">
          
          {/* Header Title styled matching screen shot */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold tracking-widest uppercase text-[#DC2626]">
              Coaching Staff
            </span>
            <h2 className={`text-4xl md:text-5xl font-sora font-normal tracking-tight ${
              isDarkMode ? "text-slate-100" : "text-slate-900"
            }`}>
              Meet the <span className="text-[#DC2626] font-semibold">Coaches</span>
            </h2>
            <p className={`text-sm md:text-base leading-relaxed ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}>
              A blend of national experience and rising young talent.
            </p>
          </div>

          {/* Coaches Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-6" id="coaches-cards-grid">
            
            {/* Coach 1: Head Coach (Mr. Yomal Sanjeewa) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className={`relative overflow-hidden p-8 rounded-[24px] border flex flex-col items-center shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ${
                isDarkMode 
                  ? "bg-slate-900/60 backdrop-blur-xs border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850/80" 
                  : "bg-white border-slate-200/85 hover:border-slate-300 hover:bg-white"
              }`}
            >
              {/* Backing decorative shapes styled exactly like the screenshot overlap design */}
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full -mr-4 -mt-4 bg-[#F59E0B]/5 dark:bg-[#F59E0B]/10 blur-lg pointer-events-none" />
              
              {/* Icon / Avatar Circle Group */}
              <div className="relative mb-6 flex items-center justify-center">
                {/* Visual accent backdrop shape circles similar to the screenshot blobs */}
                <div className={`absolute -top-1 -right-3 w-16 h-16 rounded-full blur-xs opacity-20 ${
                  isDarkMode ? 'bg-amber-400' : 'bg-amber-200'
                }`} />
                <div className={`absolute -bottom-2 -left-2 w-14 h-14 rounded-full blur-xs opacity-20 ${
                  isDarkMode ? 'bg-rose-500' : 'bg-rose-200'
                }`} />

                {/* Main Circle */}
                <div className={`relative w-20 h-20 rounded-full flex items-center justify-center border shadow-md transform hover:rotate-6 transition-transform duration-300 ${
                  isDarkMode 
                    ? "bg-gradient-to-tr from-amber-600 to-yellow-500 border-amber-500/50 text-white" 
                    : "bg-[#F59E0B] border-[#D97706]/20 text-white"
                }`}>
                  <Trophy className="w-10 h-10" />
                </div>
              </div>

              {/* Coach details */}
              <div className="space-y-2 w-full mt-2 relative z-10 font-sans">
                <h3 className={`text-xl font-bold tracking-tight ${
                  isDarkMode ? "text-slate-100" : "text-slate-950"
                }`}>
                  Mr. Yomal Sanjeewa
                </h3>
                <span className="inline-block text-xs font-extrabold tracking-widest uppercase text-amber-600 dark:text-amber-400">
                  Head Coach
                </span>

                <div className={`w-12 h-[2px] mx-auto my-4 rounded-full ${
                  isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100'
                }`} />

                {/* Head Coach Contact Numbers */}
                <div className="pt-2 w-full">
                  <a
                    href="tel:0716451653"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      isDarkMode
                        ? "bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900"
                        : "bg-slate-50 border-slate-100 text-slate-600 hover:text-[#DC2626] hover:border-red-200 hover:bg-red-50/40"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>071 645 1653</span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Coach 2: Assistant Coach (Mr. Heshan) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`relative overflow-hidden p-8 rounded-[24px] border flex flex-col items-center shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ${
                isDarkMode 
                  ? "bg-slate-900/60 backdrop-blur-xs border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850/80" 
                  : "bg-white border-slate-200/85 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full -mr-4 -mt-4 bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10 blur-lg pointer-events-none" />
              
              <div className="relative mb-6 flex items-center justify-center">
                <div className={`absolute -top-1 -right-3 w-16 h-16 rounded-full blur-xs opacity-20 ${
                  isDarkMode ? 'bg-blue-400' : 'bg-blue-200'
                }`} />
                <div className={`absolute -bottom-2 -left-2 w-14 h-14 rounded-full blur-xs opacity-20 ${
                  isDarkMode ? 'bg-indigo-500' : 'bg-indigo-200'
                }`} />

                <div className={`relative w-20 h-20 rounded-full flex items-center justify-center border shadow-md transform hover:rotate-6 transition-transform duration-300 ${
                  isDarkMode 
                    ? "bg-gradient-to-tr from-blue-600 to-indigo-500 border-blue-500/50 text-white" 
                    : "bg-[#2563EB] border-[#1D4ED8]/20 text-white"
                }`}>
                  <Award className="w-10 h-10" />
                </div>
              </div>

              <div className="space-y-2 w-full mt-2 relative z-10 font-sans">
                <h3 className={`text-xl font-bold tracking-tight ${
                  isDarkMode ? "text-slate-100" : "text-slate-950"
                }`}>
                  Mr. Heshan
                </h3>
                <span className="inline-block text-xs font-extrabold tracking-widest uppercase text-blue-600 dark:text-blue-400">
                  Assistant Coach
                </span>

                <div className={`w-12 h-[2px] mx-auto my-4 rounded-full ${
                  isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100'
                }`} />

                <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-slate-300" : "text-slate-600"} pt-2`}>
                  SLC Level 2
                </p>
              </div>
            </motion.div>

            {/* Coach 3: Assistant Coach (Mr. Ashan) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={`relative overflow-hidden p-8 rounded-[24px] border flex flex-col items-center shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ${
                isDarkMode 
                  ? "bg-slate-900/60 backdrop-blur-xs border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850/80" 
                  : "bg-white border-slate-200/85 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full -mr-4 -mt-4 bg-[#10B981]/5 dark:bg-[#10B981]/10 blur-lg pointer-events-none" />
              
              <div className="relative mb-6 flex items-center justify-center">
                <div className={`absolute -top-1 -right-3 w-16 h-16 rounded-full blur-xs opacity-20 ${
                  isDarkMode ? 'bg-emerald-400' : 'bg-emerald-200'
                }`} />
                <div className={`absolute -bottom-2 -left-2 w-14 h-14 rounded-full blur-xs opacity-20 ${
                  isDarkMode ? 'bg-teal-500' : 'bg-teal-200'
                }`} />

                <div className={`relative w-20 h-20 rounded-full flex items-center justify-center border shadow-md transform hover:rotate-6 transition-transform duration-300 ${
                  isDarkMode 
                    ? "bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-500/50 text-white" 
                    : "bg-[#059669] border-[#047857]/20 text-white"
                }`}>
                  <Zap className="w-10 h-10" />
                </div>
              </div>

              <div className="space-y-2 w-full mt-2 relative z-10 font-sans">
                <h3 className={`text-xl font-bold tracking-tight ${
                  isDarkMode ? "text-slate-100" : "text-slate-950"
                }`}>
                  Mr. Ashan
                </h3>
                <span className="inline-block text-xs font-extrabold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                  Assistant Coach
                </span>

                <div className={`w-12 h-[2px] mx-auto my-4 rounded-full ${
                  isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100'
                }`} />

                <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-slate-300" : "text-slate-600"} pt-2`}>
                  SLC Level 2
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* EXTRA-CURRICULAR ACTIVITIES SECTION */}
      <section className={`pt-10 pb-20 transition-all duration-300 relative overflow-hidden ${
        isDarkMode 
          ? "bg-slate-905 border-b border-slate-900" 
          : "bg-white border-b border-slate-100"
      }`} id="academy-activities">
        {/* Ambient backdrop decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-500/[0.015] dark:bg-red-500/[0.035] blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          {/* Beautiful Header matching premium theme screenshot layout */}
          <div className="text-center flex flex-col items-center gap-y-5 md:gap-y-6 max-w-3xl mx-auto">
            <span className="inline-block text-xs font-extrabold tracking-widest uppercase text-[#DC2626] bg-red-50 dark:bg-red-950/20 px-4 py-1.5 rounded-full border border-[#FCA5A5] dark:border-red-900/30 shadow-xs">
              Beyond the Nets
            </span>
            <h2 className={`text-4xl md:text-5xl font-sora font-medium tracking-tight ${
              isDarkMode ? "text-slate-100" : "text-slate-950"
            }`}>
              Extra-Curricular <span className="text-[#DC2626] font-semibold">Activities</span>
            </h2>
            <p className={`text-sm md:text-base leading-relaxed ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}>
              Our comprehensive ecosystem develops deep strategic intelligence, peak physical durability, and dynamic game exposure that transforms talented trainees into seasoned, complete cricketers.
            </p>
          </div>

          {/* Activities Container - Premium Card Row layout similar to requested blueprint screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto pt-6" id="activities-cards-grid">
            
            {/* Activity 1: Practice matches with other academies */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={`flex items-start gap-5 p-6 rounded-[22px] border shadow-sm hover:shadow-md transition-all duration-300 ${
                isDarkMode 
                  ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850/60" 
                  : "bg-slate-50/40 border-slate-200/60 hover:border-slate-300/80 hover:bg-slate-50/70"
              }`}
            >
              {/* Icon Holder */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 hover:scale-105 ${
                isDarkMode 
                  ? "bg-blue-950/45 border-blue-900/50 text-blue-400" 
                  : "bg-blue-50 border-blue-100 text-blue-600"
              }`}>
                <Swords className="w-5.5 h-5.5" />
              </div>

              {/* Text content */}
              <div className="space-y-1 text-left">
                <h4 className={`text-base font-bold tracking-tight ${
                  isDarkMode ? "text-slate-100" : "text-slate-900"
                }`}>
                  Practice Matches with Elite Academies
                </h4>
                <p className={`text-xs md:text-sm leading-relaxed ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Regular bi-weekly match scenarios to implement tactical plays, develop pitch reading, and pressure-test skills against top regional talent under live tournament parameters.
                </p>
              </div>
            </motion.div>

            {/* Activity 2: Friendlies with visiting foreign teams */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
              className={`flex items-start gap-5 p-6 rounded-[22px] border shadow-sm hover:shadow-md transition-all duration-300 ${
                isDarkMode 
                  ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850/60" 
                  : "bg-slate-50/40 border-slate-200/60 hover:border-slate-300/80 hover:bg-slate-50/70"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 hover:scale-105 ${
                isDarkMode 
                  ? "bg-purple-950/45 border-purple-900/50 text-purple-400" 
                  : "bg-purple-50 border-purple-100 text-purple-600"
              }`}>
                <Globe className="w-5.5 h-5.5" />
              </div>

              <div className="space-y-1 text-left">
                <h4 className={`text-base font-bold tracking-tight ${
                  isDarkMode ? "text-slate-100" : "text-slate-900"
                }`}>
                  International Friendly Fixtures
                </h4>
                <p className={`text-xs md:text-sm leading-relaxed ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Exceptional exposure games against visiting teams from cricket-loving nations like Australia, India, and the UK, offering young players critical experience facing diverse game styles.
                </p>
              </div>
            </motion.div>

            {/* Activity 3: Inter-academy invitational tournaments */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.16 }}
              className={`flex items-start gap-5 p-6 rounded-[22px] border shadow-sm hover:shadow-md transition-all duration-300 ${
                isDarkMode 
                  ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850/60" 
                  : "bg-slate-50/40 border-slate-200/60 hover:border-slate-300/80 hover:bg-slate-50/70"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 hover:scale-105 ${
                isDarkMode 
                  ? "bg-amber-950/45 border-amber-900/50 text-amber-400" 
                  : "bg-amber-50 border-amber-100 text-[#D97706]"
              }`}>
                <Trophy className="w-5.5 h-5.5" />
              </div>

              <div className="space-y-1 text-left">
                <h4 className={`text-base font-bold tracking-tight ${
                  isDarkMode ? "text-slate-100" : "text-slate-900"
                }`}>
                  Inter-Academy Invitational Tournaments
                </h4>
                <p className={`text-xs md:text-sm leading-relaxed ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Our players actively participate in prestigious inter-academy invitational tournaments organized by various leading academies and cricket boards across the island, providing crucial exposure to different playing conditions, competitive match pressure, and tournament tracking.
                </p>
              </div>
            </motion.div>

            {/* Activity 4: Class room sessions */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.24 }}
              className={`flex items-start gap-5 p-6 rounded-[22px] border shadow-sm hover:shadow-md transition-all duration-300 ${
                isDarkMode 
                  ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850/60" 
                  : "bg-slate-50/40 border-slate-200/60 hover:border-slate-300/80 hover:bg-slate-50/70"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 hover:scale-105 ${
                isDarkMode 
                  ? "bg-indigo-950/45 border-indigo-900/50 text-indigo-400" 
                  : "bg-indigo-50 border-indigo-100 text-indigo-600"
              }`}>
                <BookOpen className="w-5.5 h-5.5" />
              </div>

              <div className="space-y-1 text-left">
                <h4 className={`text-base font-bold tracking-tight ${
                  isDarkMode ? "text-slate-100" : "text-slate-900"
                }`}>
                  Theoretical Academy Lectures
                </h4>
                <p className={`text-xs md:text-sm leading-relaxed ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Comprehensive tactical mapping, video telemetry diagnostics of student techniques, interactive sport psychology workshops, and professional gameplay analytics sessions.
                </p>
              </div>
            </motion.div>

            {/* Activity 5: Gym sessions - takes full width on bigger screens or elegantly centered inside the grid */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.32 }}
              className={`flex items-start gap-5 p-6 rounded-[22px] border shadow-sm hover:shadow-md transition-all duration-300 md:col-span-2 max-w-2xl mx-auto w-full ${
                isDarkMode 
                  ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850/60" 
                  : "bg-slate-50/40 border-slate-200/60 hover:border-slate-300/80 hover:bg-slate-50/70"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 hover:scale-105 ${
                isDarkMode 
                  ? "bg-emerald-950/45 border-emerald-900/50 text-emerald-400" 
                  : "bg-emerald-50 border-emerald-100 text-emerald-600"
              }`}>
                <Dumbbell className="w-5.5 h-5.5" />
              </div>

              <div className="space-y-1 text-left">
                <h4 className={`text-base font-bold tracking-tight ${
                  isDarkMode ? "text-slate-100" : "text-slate-900"
                }`}>
                  Targeted Athletic Conditioning & Gym Work
                </h4>
                <p className={`text-xs md:text-sm leading-relaxed ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Customized cricket-specific functional training to refine kinetic chains, target explosive acceleration for fast bowlers, build core stability, and bulletproof against athletic injuries.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </motion.div>
  );
}

