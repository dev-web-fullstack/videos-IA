// components/form/VideoSizeSelector.tsx
"use client";

import VideoFormatSelect from "./VideoFormatSelect";
import CustomSizeInput from "./CustomSizeInput";

interface Props {
  platform: string;
  width: number;
  height: number;
  setPlatform: (value: string) => void;
  setWidth: (value: number) => void;
  setHeight: (value: number) => void;
  disabled?: boolean;
}

export default function VideoSizeSelector({
  platform,
  width,
  height,
  setPlatform,
  setWidth,
  setHeight,
  disabled = false,
}: Props) {
  return (
    <section className="space-y-4">

      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
        <h3 className="text-sm font-semibold text-white">
          Resolução do Vídeo
        </h3>
      </div>

      <VideoFormatSelect
        value={platform}
        onChange={(format) => {
          setPlatform(format.id);

          if (format.id !== "custom") {
            setWidth(format.width);
            setHeight(format.height);
          }
        }}
        disabled={disabled}
      />

      {platform === "custom" && (
        <CustomSizeInput
          width={width}
          height={height}
          onWidthChange={setWidth}
          onHeightChange={setHeight}
          disabled={disabled}
        />
      )}

    </section>
  );
}