import React, { useState, useEffect } from "react";
import { Settings, Check, RefreshCw, AlertCircle, FileSpreadsheet, ExternalLink } from "lucide-react";

interface SettingsPanelProps {
  onUrlChange: (newUrl: string) => void;
  currentUrl: string;
  isSyncing: boolean;
  syncError: string | null;
  onRefresh: () => void;
}

export default function SettingsPanel({
  onUrlChange,
  currentUrl,
  isSyncing,
  syncError,
  onRefresh
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(currentUrl);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  useEffect(() => {
    setInputValue(currentUrl);
  }, [currentUrl]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUrlChange(inputValue.trim());
    setShowSavedMsg(true);
    setTimeout(() => {
      setShowSavedMsg(false);
    }, 3000);
  };

  const clearUrl = () => {
    setInputValue("");
    onUrlChange("");
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
      {/* Settings Panel Header Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus:outline-none"
        id="settings-panel-toggle"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50 text-red-600">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base">System Administration</h3>
            <p className="text-xs text-slate-500">Configure Dropbox spreadsheet sync and direct booking data inputs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUrl ? (
            <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-semibold tracking-wider text-green-700 bg-green-50 rounded-full border border-green-200 uppercase">
              Connected
            </span>
          ) : (
            <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-600 bg-slate-100 rounded-full border border-slate-200 uppercase">
              Local Mode
            </span>
          )}
          <span className="text-slate-400 font-medium text-xs">
            {isOpen ? "Collapse" : "Expand"}
          </span>
        </div>
      </button>

      {/* Settings Panel Content Form */}
      {isOpen && (
        <form onSubmit={handleSave} className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Dropbox booking.xlsx share link
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste Dropbox share link e.g. https://www.dropbox.com/s/..."
                  className="w-full pl-3 pr-10 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-800"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={clearUrl}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold text-sm shadow transition-all duration-150 shrink-0 flex items-center justify-center gap-2"
              >
                {showSavedMsg ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Saved
                  </>
                ) : (
                  "Connect Sheet"
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-1">
              <span>Must be a public Dropbox share link.</span>
              <a
                href="https://www.dropbox.com"
                target="_blank"
                rel="noreferrer"
                className="text-red-600 hover:underline flex items-center gap-0.5 inline-flex"
              >
                Go to Dropbox <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Integration Status Log */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Integration logs:</span>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isSyncing}
                className="text-red-600 hover:text-red-700 disabled:text-slate-400 flex items-center gap-1 font-medium transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                Sync now
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500">
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Active File:</span>
                <span className="font-mono text-slate-700 font-semibold truncate">
                  {currentUrl ? "Excel Online Stream (Dropbox)" : "booking.xlsx (Local Default)"}
                </span>
              </div>
              <div>
                {isSyncing ? (
                  <span className="text-amber-600 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Connecting to server...
                  </span>
                ) : syncError ? (
                  <span className="text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    Error: {syncError}
                  </span>
                ) : (
                  <span className="text-emerald-700 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Synchronized, reading active rows
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
