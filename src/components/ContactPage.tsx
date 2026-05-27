import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  PhoneCall, 
  Mail, 
  Clock, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  Copy,
  Check,
  Building
} from "lucide-react";

interface ContactPageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

interface MessageLog {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

export default function ContactPage({ isDarkMode, onBack }: ContactPageProps) {
  // Form input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  // Status states
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Message logs received
  const [sentMessages, setSentMessages] = useState<MessageLog[]>([]);

  // Load message logs from server / session
  const fetchSentMessages = async () => {
    const isStaticHosting = window.location.hostname.endsWith(".github.io") || 
                           window.location.protocol === "file:" ||
                           window.location.hostname.includes("gitpod") ||
                           window.location.hostname.includes("codesandbox") ||
                           window.location.pathname.startsWith("/Falcon-Cricket");

    if (isStaticHosting) {
      try {
        const localData = localStorage.getItem("falcon_contact_messages");
        if (localData) {
          setSentMessages(JSON.parse(localData));
        } else {
          setSentMessages([]);
        }
      } catch (e) {
        console.warn("Could not read local contact messages:", e);
      }
      return;
    }

    try {
      const res = await fetch("/api/contact-messages");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSentMessages(data.messages);
        }
      }
    } catch (e) {
      console.error("Failed to load contact logs:", e);
    }
  };

  useEffect(() => {
    fetchSentMessages();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      setErrorMsg("Please fill in all inputs before sending.");
      return;
    }

    setIsSending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const isStaticHosting = window.location.hostname.endsWith(".github.io") || 
                           window.location.protocol === "file:" ||
                           window.location.hostname.includes("gitpod") ||
                           window.location.hostname.includes("codesandbox") ||
                           window.location.pathname.startsWith("/Falcon-Cricket");

    if (isStaticHosting) {
      // Simulate sending on static pages and preserve local history in localStorage as fallback
      setTimeout(() => {
        try {
          const freshMsg: MessageLog = {
            id: `msg_${Date.now()}`,
            name,
            email,
            subject,
            message,
            timestamp: new Date().toLocaleString()
          };
          
          const localData = localStorage.getItem("falcon_contact_messages");
          const curList: MessageLog[] = localData ? JSON.parse(localData) : [];
          const updated = [freshMsg, ...curList];
          
          localStorage.setItem("falcon_contact_messages", JSON.stringify(updated));
          setSentMessages(updated);
          
          setSuccessMsg("Your inquiry was logged successfully! Since this is running in a static web environment (GitHub Pages), the message has been secured in your browser's local storage database.");
          setName("");
          setEmail("");
          setSubject("");
          setMessage("");
        } catch (err: any) {
          setErrorMsg("Could not save message locally: " + err.message);
        } finally {
          setIsSending(false);
        }
      }, 600);
      return;
    }

    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Your message was sent successfully to falconadminmalabe@gmail.com!");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        // Reload list
        fetchSentMessages();
      } else {
        throw new Error(data.error || "Could not dispatch message.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong sending. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12"
      id="contact-page-container"
    >
      {/* Back button and page intro block */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 transition-colors duration-300 ${
        isDarkMode ? "border-slate-800" : "border-slate-200/60"
      }`}>
        <div className="space-y-1 text-left">
          <button
            onClick={onBack}
            className={`group inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 border ${
              isDarkMode 
                ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className={`text-3xl md:text-5xl font-sora font-extrabold tracking-tight pt-3 ${
            isDarkMode ? "text-slate-100" : "text-slate-900"
          }`}>
            Contact <span className="text-[#DC2626]">Us</span>
          </h1>
          <p className={`text-sm md:text-base ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            Send dynamic booking inquiries, leave feedback, or map directions to Malabe's prime cricket training facility.
          </p>
        </div>
      </div>

      {/* Grid: 2 columns split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Details + Maps Card) - Span 5 */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          
          {/* Card: Contact info tiles */}
          <div className={`border rounded-2xl p-6 shadow-sm transition-all duration-300 ${
            isDarkMode 
              ? "bg-slate-900 border-slate-800 text-slate-100" 
              : "bg-white border-slate-200 text-slate-800"
          }`}>
            <h2 className={`font-sora font-bold text-lg md:text-xl text-left mb-6 flex items-center gap-2 ${
              isDarkMode ? "text-slate-100" : "text-slate-900"
            }`}>
              <Building className="w-5 h-5 text-red-500" />
              <span>Complex Coordinates</span>
            </h2>

            <div className="space-y-6">
              {/* Address detail */}
              <div className="flex items-start gap-4 text-left">
                <div className={`p-3 rounded-xl shrink-0 border ${
                  isDarkMode 
                    ? "bg-red-950/20 text-red-400 border-red-900/30" 
                    : "bg-red-50 text-[#DC2626] border-red-100/50"
                }`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <span className={`text-xs font-bold uppercase tracking-widest block ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}>Facility Location</span>
                  <p className={`text-sm font-semibold leading-relaxed ${
                    isDarkMode ? "text-slate-200" : "text-slate-800"
                  }`}>
                    Falcon sport complex, <br />
                    new kandy road, pittugala malabe, Sri Lanka
                  </p>
                  <button
                    onClick={() => handleCopy("Falcon sport complex, new kandy road, pittugala malabe", "address")}
                    className={`inline-flex items-center gap-1.5 text-xs hover:underline mt-1 font-bold ${
                      isDarkMode ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {copiedText === "address" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === "address" ? "Copied!" : "Copy Address"}</span>
                  </button>
                </div>
              </div>

              {/* Emails detail */}
              <div className="flex items-start gap-4 text-left">
                <div className={`p-3 rounded-xl shrink-0 border ${
                  isDarkMode 
                    ? "bg-red-950/20 text-red-400 border-red-900/30" 
                    : "bg-red-50 text-[#DC2626] border-red-100/50"
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <span className={`text-xs font-bold uppercase tracking-widest block ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}>Email Desk</span>
                  <p className={`text-sm font-bold ${
                    isDarkMode ? "text-slate-200" : "text-slate-800"
                  }`}>
                    falconadminmalabe@gmail.com
                  </p>
                  <button
                    onClick={() => handleCopy("falconadminmalabe@gmail.com", "email")}
                    className={`inline-flex items-center gap-1.5 text-xs hover:underline mt-1 font-bold ${
                      isDarkMode ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {copiedText === "email" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === "email" ? "Copied!" : "Copy Email"}</span>
                  </button>
                </div>
              </div>

              {/* Phones details */}
              <div className="flex items-start gap-4 text-left">
                <div className={`p-3 rounded-xl shrink-0 border ${
                  isDarkMode 
                    ? "bg-red-950/20 text-red-400 border-red-900/30" 
                    : "bg-red-50 text-[#DC2626] border-red-100/50"
                }`}>
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <span className={`text-xs font-bold uppercase tracking-widest block ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}>Hotline support</span>
                  <div className={`text-sm font-semibold flex flex-col gap-0.5 ${
                    isDarkMode ? "text-slate-200" : "text-slate-800"
                  }`}>
                    <span>077 503 2953</span>
                    <span>077 834 1657</span>
                    <span>071 645 1653</span>
                  </div>
                </div>
              </div>

              {/* Working hours details */}
              <div className="flex items-start gap-4 text-left">
                <div className={`p-3 rounded-xl shrink-0 border ${
                  isDarkMode 
                    ? "bg-red-950/20 text-red-400 border-red-900/30" 
                    : "bg-red-50 text-[#DC2626] border-red-100/50"
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <span className={`text-xs font-bold uppercase tracking-widest block ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}>Operating hours</span>
                  <div className={`text-sm font-semibold flex flex-col gap-0.5 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}>
                    <span>Weekdays: 10:00 AM - 11:00 PM</span>
                    <span>Weekends: 7:00 AM - 11:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Google Map embed card */}
          <div className={`border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 p-2 text-left ${
            isDarkMode 
              ? "bg-slate-900 border-slate-800" 
              : "bg-white border-slate-200"
          }`}>
            <span className={`text-[11px] font-bold uppercase tracking-widest block px-4 pt-3 pb-2 flex items-center gap-1.5 ${
              isDarkMode ? "text-slate-500" : "text-slate-400"
            }`}>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              <span>Live Google map Route</span>
            </span>
            <div className="w-full h-64 rounded-xl overflow-hidden relative">
              <iframe 
                src="https://maps.google.com/maps?q=Falcon%20Sport%20Complex%20Malabe&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                className="w-full h-full border-0 transition-all duration-300"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer"
                title="Falcon Sport Complex Malabe Map"
              />
            </div>
          </div>
        </div>

        {/* Right Column (Dynamic Email Message Sender Form) - Span 7 */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <div className={`border rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 text-left ${
            isDarkMode 
              ? "bg-slate-900 border-slate-800" 
              : "bg-white border-slate-200"
          }`}>
            <h2 className={`font-sora font-semibold text-xl mb-6 flex items-center gap-2 ${
              isDarkMode ? "text-slate-100" : "text-slate-900"
            }`}>
              <Send className="w-5 h-5 text-red-500" />
              <span>Email Message Sender</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <AnimatePresence mode="wait">
                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 border rounded-xl flex items-start gap-2.5 text-sm font-semibold ${
                      isDarkMode 
                        ? "bg-green-950/20 border-green-900/30 text-green-300" 
                        : "bg-green-50 border-green-200 text-green-800"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 border rounded-xl flex items-start gap-2.5 text-sm font-semibold ${
                      isDarkMode 
                        ? "bg-red-950/20 border-red-900/30 text-red-400" 
                        : "bg-red-50/10 border-red-200 text-red-700"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sender Name */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className={`block w-full px-4 py-3 border rounded-xl placeholder-slate-400 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500/15 focus:border-red-500 transition-all ${
                      isDarkMode 
                        ? "bg-slate-800 border-slate-700 text-slate-100" 
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                {/* Sender Email */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`block w-full px-4 py-3 border rounded-xl placeholder-slate-400 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500/15 focus:border-red-500 transition-all ${
                      isDarkMode 
                        ? "bg-slate-800 border-slate-700 text-slate-100" 
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}>
                  Message Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Booking inquiry, coaching session, nets request..."
                  className={`block w-full px-4 py-3 border rounded-xl placeholder-slate-400 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500/15 focus:border-red-500 transition-all ${
                    isDarkMode 
                      ? "bg-slate-800 border-slate-700 text-slate-100" 
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Message content */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}>
                  Message Body
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your detailed message here..."
                  className={`block w-full px-4 py-3 border rounded-xl placeholder-slate-400 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none ${
                    isDarkMode 
                      ? "bg-slate-800 border-slate-700 text-slate-100" 
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              {/* Action Submit */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-4 text-center rounded-xl bg-[#DC2626] hover:bg-red-700 text-white font-bold tracking-wide transition-all shadow-md hover:shadow-lg focus:outline-hidden text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to Admin Desk</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
