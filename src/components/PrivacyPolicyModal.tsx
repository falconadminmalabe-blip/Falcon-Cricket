import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Shield, Clock, Mail, FileText, CheckCircle } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "privacy" | "terms";
  isDarkMode: boolean;
}

export default function PrivacyPolicyModal({
  isOpen,
  onClose,
  defaultTab = "privacy",
  isDarkMode,
}: PrivacyPolicyModalProps) {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">(defaultTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      // Prevent body scroll when open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, defaultTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            id="privacy-modal-backdrop"
          />

          {/* Modal Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className={`relative w-full max-w-3xl max-h-[85vh] rounded-2xl border flex flex-col shadow-2xl overflow-hidden z-10 transition-colors duration-300 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
            }`}
            id="privacy-modal-content"
          >
            {/* Elegant Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              isDarkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? "bg-red-950/30 text-red-400" : "bg-red-50 text-red-600"
                }`}>
                  <Shield className="w-5 h-5" id="privacy-shield-icon" />
                </div>
                <div>
                  <h2 className="text-xl font-sora font-medium leading-none" id="privacy-title">
                    Falcon Sport Complex
                  </h2>
                  <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Legal Information & Policies
                  </p>
                </div>
              </div>

              {/* Close Button Button */}
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-transform hover:scale-105 active:scale-95 ${
                  isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100" : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
                }`}
                aria-label="Close dialog"
                id="privacy-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className={`flex border-b px-6 gap-4 text-sm font-semibold relative ${
              isDarkMode ? "border-slate-800 bg-slate-900/25" : "border-slate-100 bg-slate-50/25"
            }`}>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`py-3.5 relative border-b-2 transition-colors ${
                  activeTab === "privacy"
                    ? "border-red-600 text-red-600"
                    : isDarkMode
                    ? "border-transparent text-slate-400 hover:text-slate-200"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
                id="tab-privacy-trigger"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Privacy Policy
                </span>
              </button>
              <button
                onClick={() => setActiveTab("terms")}
                className={`py-3.5 relative border-b-2 transition-colors ${
                  activeTab === "terms"
                    ? "border-red-600 text-red-600"
                    : isDarkMode
                    ? "border-transparent text-slate-400 hover:text-slate-200"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
                id="tab-terms-trigger"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Terms of Service
                </span>
              </button>
            </div>

            {/* Scrollable Document Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-sm leading-relaxed" id="privacy-scroll-content">
              {activeTab === "privacy" ? (
                // PRIVACY POLICY SECTION
                <div className="space-y-6 animate-fadeIn">
                  <div className={`p-4 rounded-xl border border-dashed flex gap-3 ${
                    isDarkMode ? "bg-slate-950/20 border-slate-800 text-slate-450" : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}>
                    <Clock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs uppercase tracking-wider text-red-500">Last updated</p>
                      <p className="text-xs mt-0.5">May 27, 2026. This policy applies strictly to our training academies, facility booking engines, and physically guarded spaces.</p>
                    </div>
                  </div>

                  <section className="space-y-2">
                    <h3 className={`text-base font-sora font-medium ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      1. General Scope & Commitment
                    </h3>
                    <p className={isDarkMode ? "text-slate-350" : "text-slate-600"}>
                      Falcon Sport Complex, located in <strong>Malabe, Sri Lanka</strong>, values your sport booking and academic confidentiality. This policy covers all digital details recorded on this platform (including batting lane schedules, training accounts, and support tickets) as well as protection logs obtained during physical training.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className={`text-base font-sora font-medium ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      2. Personal Details We Collect
                    </h3>
                    <p className={isDarkMode ? "text-slate-350" : "text-slate-600"}>
                      To deliver high-impact sports training, we register and manage the following categories:
                    </p>
                    <ul className={`list-disc pl-5 space-y-1.5 ${isDarkMode ? "text-slate-350" : "text-slate-600"}`}>
                      <li>
                        <strong>Booking Metadata:</strong> Customer Name, Email, Contact Number, and age groups so we can reserve nets, coaching kits, and scheduling lanes.
                      </li>
                      <li>
                        <strong>Academy Enrollment:</strong> Student details (names, gender, and school affiliations for youth league players), as well as parents' legal contact data.
                      </li>
                      <li>
                        <strong>CCTV Records:</strong> For safety auditing, physical security, and coaching review, Falcon Sport Complex grounds operate 24/7 video cameras around entrance gates, pitches, and batting lanes.
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h3 className={`text-base font-sora font-medium ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      3. Purpose & Use of Collected Data
                    </h3>
                    <p className={isDarkMode ? "text-slate-350" : "text-slate-600"}>
                      Your records are stored securely to:
                    </p>
                    <ul className={`list-disc pl-5 space-y-1.5 ${isDarkMode ? "text-slate-350" : "text-slate-600"}`}>
                      <li>Confirm time slots, handle billing receipts, and prevent double-booking.</li>
                      <li>Provide custom batting analyses and coordinate coach assignments.</li>
                      <li>Review security incidents, damage reports, or critical safety violations in batting bays.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h3 className={`text-base font-sora font-medium ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      4. Data Protection & Sharing Safeguards
                    </h3>
                    <p className={isDarkMode ? "text-slate-350" : "text-slate-600"}>
                      Your privacy is protected. We enforce encrypted transactions and internal policies where only authorized administrative managers and lead academy coaches can view personal rosters. We do not sell, rent, or lease any customer listings to third-party marketing companies.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className={`text-base font-sora font-medium ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      5. Local Storage & Preferences
                    </h3>
                    <p className={isDarkMode ? "text-slate-350" : "text-slate-600"}>
                      This application securely saves simple user preference keypairs (such as UI contrast selection, last loaded calendar filters, and standard authorization headers) inside client-side <code>localStorage</code> cache tokens to streamline rendering.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className={`text-base font-sora font-medium ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      6. Your Control & Purge Request
                    </h3>
                    <p className={isDarkMode ? "text-slate-350" : "text-slate-600"}>
                      You hold absolute ownership of your booking records. To demand a comprehensive readout of your metadata, request changes to spelling, or permanently clear your training diaries from our databases, please reach out to our administration hub:
                    </p>
                    <div className={`p-4 rounded-xl flex items-center gap-3 mt-2 ${
                      isDarkMode ? "bg-slate-950/30 text-slate-300" : "bg-slate-100 text-slate-700"
                    }`}>
                      <Mail className="w-5 h-5 text-red-500" />
                      <a href="mailto:falconadminmalabe@gmail.com" className="font-semibold hover:underline">
                        falconadminmalabe@gmail.com
                      </a>
                    </div>
                  </section>
                </div>
              ) : (
                // TERMS OF SERVICE SECTION
                <div className="space-y-6 animate-fadeIn">
                  <div className={`p-4 rounded-xl border border-dashed flex gap-3 ${
                    isDarkMode ? "bg-slate-950/20 border-slate-800 text-slate-450" : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}>
                    <CheckCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs uppercase tracking-wider text-red-500">Facility Operations Code</p>
                      <p className="text-xs mt-0.5">Please review these binding conditions for booking cricket lanes, pitches, and training camps at Falcon Sport Complex.</p>
                    </div>
                  </div>

                  <section className="space-y-2">
                    <h3 className={`text-base font-sora font-medium ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      1. Reservation Rules & Double-Booking Policies
                    </h3>
                    <p className={isDarkMode ? "text-slate-350" : "text-slate-600"}>
                      Reserving cricket pitch lanes requires valid administrative confirmation via this portal. All booked hours are exclusive, and attendees should report 10 minutes prior to their sessions to maximize practice duration without spilling over into following slots.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className={`text-base font-sora font-medium ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      2. Youth League & Academy Compliance
                    </h3>
                    <p className={isDarkMode ? "text-slate-350" : "text-slate-600"}>
                      Falcon Cricket Academy trainees are expected to exhibit high sportsmanship, respect trainers, and carry the assigned gear bags during training slots. Guardians or parents must authorize mandatory fitness and health waivers for all minor cricket athletes prior to initial fast-bowling practice.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className={`text-base font-sora font-medium ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      3. Safety Guidelines & High-Velocity Cages
                    </h3>
                    <p className={isDarkMode ? "text-slate-350" : "text-slate-600"}>
                      Safety is non-negotiable. Helmet guards, chest protectors, and standard leg guards must be properly equipped at all times within active bowling-machine lanes. Players who bypass protective equipment guidelines assume all safety risks.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className={`text-base font-sora font-medium ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      4. Equipment Ownership & Damage Accountability
                    </h3>
                    <p className={isDarkMode ? "text-slate-350" : "text-slate-600"}>
                      Falcon Sport Complex properties, including bowling machines, synthetic turfs, pitching stumps, and gear sets, must be handled with appropriate responsibility. Intentional damage, vandalism, or theft of complex materials will result in immediate termination of the reservation and liability for the full cost of replacement.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className={`text-base font-sora font-medium ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      5. Liability Limitation & Waivers
                    </h3>
                    <p className={isDarkMode ? "text-slate-350" : "text-slate-600"}>
                      Falcon Sport Complex and our technical coaches provide elite-level training systems; however, high-impact athletic training involves inherent risks of minor or major muscle exhaustion, injuries, or fatigue. Users release the training facility from medical liability associated with general training.
                    </p>
                  </section>
                </div>
              )}
            </div>

            {/* Premium Sticky Footer with Close Action */}
            <div className={`p-4 border-t flex justify-end gap-3 ${
              isDarkMode ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/50"
            }`}>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors duration-150 active:scale-98"
                id="privacy-close-bottom-btn"
              >
                I Understand & Agree
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
