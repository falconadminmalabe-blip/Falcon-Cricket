import React from "react";

interface FalconLogoProps {
  className?: string;
  showText?: boolean;
  isDarkMode?: boolean;
}

export default function FalconLogo({ className = "w-[60px] h-[60px]", showText = true, isDarkMode = false }: FalconLogoProps) {
  return (
    <div className="flex items-center gap-3" id="main-logo-container">
      <img
        src="/src/assets/images/falcon_logo_1779670920742.png"
        alt="Falcon Cricket Academy Logo"
        className="w-[60px] h-[60px] shrink-0 object-contain rounded-lg filter drop-shadow-xs transition-transform duration-300 hover:scale-105 hover:rotate-2"
        referrerPolicy="no-referrer"
        id="main-logo-img"
      />

      {showText && (
        <div className="flex flex-col" id="main-logo-text-block">
          <span className="font-sora font-normal text-lg md:text-xl tracking-tight leading-none uppercase text-[#ff6467]">
            Falcon <span className={isDarkMode ? "text-white" : "text-black"}>Sport Complex</span>
          </span>
          <span className={`font-sora text-[11px] font-normal tracking-wider leading-tight uppercase mt-0.5 ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            Premiere Training Facility
          </span>
        </div>
      )}
    </div>
  );
}
