import React from "react";

interface FalconLogoProps {
  className?: string;
  showText?: boolean;
}

export default function FalconLogo({ className = "w-[60px] h-[60px]", showText = true }: FalconLogoProps) {
  return (
    <div className="flex items-center gap-3" id="main-logo-container">
      <img
        src="/src/assets/images/falcon_logo_1779670920742.png"
        alt="Falcon Cricket Academy Logo"
        className="w-[60px] h-[60px] shrink-0 object-contain rounded-lg filter drop-shadow-xs"
        referrerPolicy="no-referrer"
        id="main-logo-img"
      />

      {showText && (
        <div className="flex flex-col" id="main-logo-text-block">
          <span className="font-sans font-extrabold text-lg md:text-xl text-slate-900 tracking-tight leading-none uppercase">
            Falcon <span className="text-[#000000]">Sport Complex</span>
          </span>
          <span className="text-[11px] text-slate-500 font-normal tracking-wider leading-tight uppercase mt-0.5">
            Premiere Training Facility
          </span>
        </div>
      )}
    </div>
  );
}
