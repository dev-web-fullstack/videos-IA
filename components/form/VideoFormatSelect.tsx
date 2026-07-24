import {
  Smartphone,
  Film,
  ThumbsUp,
  Pin,
  AtSign,
  Music,
  MonitorPlay,
  Square,
  RectangleHorizontal,
  Settings,
  Camera,
  Play,
  Video,
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
  icon: IconType; // agora aceita React Icons ou componentes Lucide
  title: string;
  subtitle: string;
  width: number;
  height: number;
}

interface VideoFormatSelectProps {
  value: string;
  onChange: (format: VideoFormat) => void;
}

const formats: VideoFormat[] = [
  {
    id: "youtube",
    icon: FaYoutube,
    title: "YouTube Vídeos",
    subtitle: "1920×1080",
    width: 1920,
    height: 1080,
  },
  {
    id: "shorts",
    icon: Smartphone,
    title: "YouTube Shorts",
    subtitle: "1080×1920",
    width: 1080,
    height: 1920,
  },
  {
    id: "instagram-feed",
    icon: FaInstagram,
    title: "Instagram Feed",
    subtitle: "1080×1080",
    width: 1080,
    height: 1080,
  },
  {
    id: "instagram-reels",
    icon: Film,
    title: "Instagram Reels",
    subtitle: "1080×1920",
    width: 1080,
    height: 1920,
  },
  {
    id: "facebook",
    icon: FaFacebook,
    title: "Facebook",
    subtitle: "1920×1080",
    width: 1920,
    height: 1080,
  },
  {
    id: "pinterest",
    icon: Pin,
    title: "Pinterest",
    subtitle: "1000×1500",
    width: 1000,
    height: 1500,
  },
  {
    id: "x",
    icon: AtSign,
    title: "Twitter / X",
    subtitle: "1600×900",
    width: 1600,
    height: 900,
  },
  {
    id: "tiktok",
    icon: FaTiktok,
    title: "TikTok",
    subtitle: "1080×1920",
    width: 1080,
    height: 1920,
  },
  {
    id: "google-horizontal",
    icon: RectangleHorizontal,
    title: "Ads Horizontal",
    subtitle: "1200×628",
    width: 1200,
    height: 628,
  },
  {
    id: "google-square",
    icon: Square,
    title: "Ads Quadrado",
    subtitle: "1200×1200",
    width: 1200,
    height: 1200,
  },
  {
    id: "google-vertical",
    icon: Smartphone,
    title: "Ads Vertical",
    subtitle: "960×1200",
    width: 960,
    height: 1200,
  },
  {
    id: "custom",
    icon: Settings,
    title: "Custom",
    subtitle: "Livre",
    width: 1920,
    height: 1080,
  },
];

export default function VideoFormatSelect({
  value,
  onChange,
}: VideoFormatSelectProps) {
  return (
    <section className="space-y-3">

      <div className="grid grid-cols-12 gap-2">
        {formats.map((format) => {
          const active = value === format.id;
          const Icon = format.icon;

          return (
            <button
              key={format.id}
              type="button"
              onClick={() => onChange(format)}
              className={`
                col-span-4 sm:col-span-3 md:col-span-2
                rounded-lg
                border
                p-2
                transition
                text-center
                hover:scale-[1.03]
                hover:border-gray-400

                ${active
                  ? "border-green-500 bg-green-900/30"
                  : "border-gray-700 bg-gray-900"
                }
              `}
            >
              <div className="flex justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>

              <div className="mt-1 text-xs font-semibold text-white leading-4">
                {format.title}
              </div>

              <div className="text-[10px] text-gray-400">
                {format.subtitle}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}