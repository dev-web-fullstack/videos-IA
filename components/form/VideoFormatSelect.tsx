// components/form/VideoFormatSelect.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Smartphone,
  Film,
  Pin,
  AtSign,
  Square,
  RectangleHorizontal,
  Settings,
  ChevronDown,
  Check,
} from "lucide-react";

import {
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaFacebook,
} from "react-icons/fa";

import { IconType } from "react-icons";

interface VideoFormat {
  id: string;
  icon: IconType | any;
  title: string;
  subtitle: string;
  width: number;
  height: number;
  category?: string;
}

interface VideoFormatSelectProps {
  value: string;
  onChange: (format: VideoFormat) => void;
  disabled?: boolean;
}

const formats: VideoFormat[] = [
  {
    id: "youtube",
    icon: FaYoutube,
    title: "YouTube Vídeos",
    subtitle: "1920×1080",
    width: 1920,
    height: 1080,
    category: "YouTube",
  },
  {
    id: "shorts",
    icon: Smartphone,
    title: "YouTube Shorts",
    subtitle: "1080×1920",
    width: 1080,
    height: 1920,
    category: "YouTube",
  },
  {
    id: "instagram-feed",
    icon: FaInstagram,
    title: "Instagram Feed",
    subtitle: "1080×1080",
    width: 1080,
    height: 1080,
    category: "Instagram",
  },
  {
    id: "instagram-reels",
    icon: Film,
    title: "Instagram Reels",
    subtitle: "1080×1920",
    width: 1080,
    height: 1920,
    category: "Instagram",
  },
  {
    id: "facebook",
    icon: FaFacebook,
    title: "Facebook",
    subtitle: "1920×1080",
    width: 1920,
    height: 1080,
    category: "Facebook",
  },
  {
    id: "tiktok",
    icon: FaTiktok,
    title: "TikTok",
    subtitle: "1080×1920",
    width: 1080,
    height: 1920,
    category: "TikTok",
  },
  {
    id: "x",
    icon: AtSign,
    title: "Twitter / X",
    subtitle: "1600×900",
    width: 1600,
    height: 900,
    category: "Twitter",
  },
  {
    id: "pinterest",
    icon: Pin,
    title: "Pinterest",
    subtitle: "1000×1500",
    width: 1000,
    height: 1500,
    category: "Pinterest",
  },
  {
    id: "google-horizontal",
    icon: RectangleHorizontal,
    title: "Ads Horizontal",
    subtitle: "1200×628",
    width: 1200,
    height: 628,
    category: "Google Ads",
  },
  {
    id: "google-square",
    icon: Square,
    title: "Ads Quadrado",
    subtitle: "1200×1200",
    width: 1200,
    height: 1200,
    category: "Google Ads",
  },
  {
    id: "google-vertical",
    icon: Smartphone,
    title: "Ads Vertical",
    subtitle: "960×1200",
    width: 960,
    height: 1200,
    category: "Google Ads",
  },
  {
    id: "custom",
    icon: Settings,
    title: "Custom",
    subtitle: "Livre",
    width: 1920,
    height: 1080,
    category: "Personalizado",
  },
];

const groupedFormats = formats.reduce((acc, format) => {
  const category = format.category || "Outros";
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(format);
  return acc;
}, {} as Record<string, VideoFormat[]>);

export default function VideoFormatSelect({
  value,
  onChange,
  disabled = false,
}: VideoFormatSelectProps) {

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Atualizar posição do dropdown
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const currentFormat = formats.find(f => f.id === value) || formats[0];
  const Icon = currentFormat.icon;

  return (
    <>
      <div className="relative w-full">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl
            bg-gray-800/50 border border-gray-700/50
            text-white text-sm font-medium
            transition-all duration-200
            hover:border-purple-500/50 hover:bg-gray-800/70
            focus:outline-none focus:ring-2 focus:ring-purple-500/50
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            ${isOpen ? "border-purple-500/70 ring-2 ring-purple-500/30" : ""}
          `}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Icon className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-left truncate">{currentFormat.title}</div>
              <div className="text-left text-xs text-gray-400">
                {currentFormat.width} × {currentFormat.height}
              </div>
            </div>
          </div>
          <ChevronDown className={`
            w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}
          `} />
        </button>
      </div>

      {/* Portal para o dropdown - renderiza fora do fluxo normal */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[99999] max-h-[400px] overflow-y-auto rounded-xl bg-gray-900/98 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-black/70"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxWidth: Math.min(dropdownPosition.width, 400),
          }}
        >
          <div className="p-2">
            {Object.entries(groupedFormats).map(([category, items]) => (
              <div key={category} className="mb-2 last:mb-0">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  {category}
                </div>
                <div className="space-y-1">
                  {items.map((format) => {
                    const isSelected = value === format.id;
                    const FormatIcon = format.icon;

                    return (
                      <button
                        key={format.id}
                        onClick={() => {
                          onChange(format);
                          setIsOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                          transition-all duration-150 text-left
                          ${isSelected
                            ? "bg-purple-600/30 border border-purple-500/50"
                            : "hover:bg-white/5 border border-transparent"
                          }
                        `}
                      >
                        <div className={`
                          flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                          ${isSelected ? "bg-purple-500/30" : "bg-white/5"}
                        `}>
                          <FormatIcon className={`
                            w-3.5 h-3.5
                            ${isSelected ? "text-purple-400" : "text-gray-400"}
                          `} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`
                            text-sm font-medium truncate
                            ${isSelected ? "text-white" : "text-gray-300"}
                          `}>
                            {format.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format.width} × {format.height}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}