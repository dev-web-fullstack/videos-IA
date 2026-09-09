// components/form/VideoSizeBar.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Monitor,
  Smartphone,
  Film,
  Square,
  RectangleHorizontal,
  Settings,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface VideoSizeBarProps {
  width: number;
  height: number;
  platform: string;
  onChange: (platform: string, width: number, height: number) => void;
  disabled?: boolean;
}

interface Platform {
  id: string;
  icon: any;
  label: string;
  width: number;
  height: number;
}

const platforms: Platform[] = [
  { id: "youtube", icon: Monitor, label: "YouTube", width: 1920, height: 1080 },
  { id: "shorts", icon: Smartphone, label: "Shorts", width: 1080, height: 1920 },
  { id: "instagram-feed", icon: Square, label: "Feed", width: 1080, height: 1080 },
  { id: "instagram-reels", icon: Film, label: "Reels", width: 1080, height: 1920 },
  { id: "facebook", icon: Monitor, label: "Facebook", width: 1920, height: 1080 },
  { id: "tiktok", icon: Smartphone, label: "TikTok", width: 1080, height: 1920 },
  { id: "x", icon: Monitor, label: "Twitter/X", width: 1600, height: 900 },
  { id: "pinterest", icon: Square, label: "Pinterest", width: 1000, height: 1500 },
  { id: "google-horizontal", icon: RectangleHorizontal, label: "Ads Horiz.", width: 1200, height: 628 },
  { id: "google-square", icon: Square, label: "Ads Quad.", width: 1200, height: 1200 },
  { id: "google-vertical", icon: Smartphone, label: "Ads Vert.", width: 960, height: 1200 },
  { id: "custom", icon: Settings, label: "Custom", width: 1920, height: 1080 },
];

export default function VideoSizeBar({
  width,
  height,
  platform,
  onChange,
  disabled = false,
}: VideoSizeBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(platform === "custom");
  const [customWidth, setCustomWidth] = useState(width);
  const [customHeight, setCustomHeight] = useState(height);

  // Encontrar a plataforma atual
  const currentPlatform = platforms.find(p => p.id === platform);
  const currentLabel = currentPlatform?.label || "YouTube";
  const CurrentIcon = currentPlatform?.icon || Monitor;

  useEffect(() => {
    if (platform === "custom") {
      setIsCustom(true);
      setCustomWidth(width);
      setCustomHeight(height);
    } else {
      setIsCustom(false);
    }
  }, [platform, width, height]);

  const handlePlatformClick = (p: Platform) => {
    if (disabled) return;

    if (p.id === "custom") {
      setIsCustom(true);
      onChange("custom", customWidth, customHeight);
    } else {
      setIsCustom(false);
      onChange(p.id, p.width, p.height);
    }
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (customWidth > 0 && customHeight > 0) {
      onChange("custom", customWidth, customHeight);
      setIsOpen(false);
    }
  };

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="space-y-2">
      {/* Botão para abrir/fechar com plataforma atual */}
      <button
        onClick={toggleOpen}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg
          bg-white/5 hover:bg-white/10 border border-white/10
          transition-all duration-200
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isOpen ? "border-purple-500/50 bg-purple-500/10" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-white font-medium">{currentLabel}</span>
          <span className="text-xs text-gray-500 font-mono">
            {width}×{height}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400">
            {isOpen ? "Fechar" : "Alterar"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Conteúdo expansível */}
      {isOpen && (
        <div className="space-y-3 pt-2 border-t border-white/5">
          {/* Grid de plataformas */}
          <div className="grid grid-cols-4 gap-1.5">
            {platforms.map((p) => {
              const Icon = p.icon;
              const isActive = platform === p.id;
              const isCustomPlatform = p.id === "custom";

              return (
                <button
                  key={p.id}
                  onClick={() => handlePlatformClick(p)}
                  disabled={disabled}
                  className={`
                    flex flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-lg text-[9px] font-medium transition-all relative
                    ${isActive
                      ? "bg-purple-600/30 text-white border border-purple-500/30 shadow-lg shadow-purple-900/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    ${isCustomPlatform ? "border-dashed" : ""}
                  `}
                  title={p.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-gray-500"}`} />
                  <span className="leading-tight text-[8px] sm:text-[9px]">{p.label}</span>
                  {!isCustomPlatform && (
                    <span className="text-[6px] sm:text-[7px] opacity-50">{p.width}×{p.height}</span>
                  )}
                  {isActive && !isCustomPlatform && (
                    <Check className="w-2.5 h-2.5 text-purple-400 absolute -top-1 -right-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom - inputs manuais */}
          {isCustom && (
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <span className="text-[10px] text-purple-300 font-medium">Custom:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={320}
                  max={7680}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  disabled={disabled}
                  className="w-16 sm:w-20 px-2 py-1 rounded bg-gray-800/50 border border-gray-700/50 text-white text-xs focus:border-purple-500/50 focus:outline-none"
                  placeholder="Largura"
                />
                <span className="text-xs text-gray-500">×</span>
                <input
                  type="number"
                  min={320}
                  max={7680}
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  disabled={disabled}
                  className="w-16 sm:w-20 px-2 py-1 rounded bg-gray-800/50 border border-gray-700/50 text-white text-xs focus:border-purple-500/50 focus:outline-none"
                  placeholder="Altura"
                />
                <button
                  onClick={handleCustomApply}
                  disabled={disabled || customWidth <= 0 || customHeight <= 0}
                  className="px-3 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aplicar
                </button>
              </div>
              <span className="text-[10px] text-gray-500 ml-auto hidden sm:block">
                {customWidth}×{customHeight}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}