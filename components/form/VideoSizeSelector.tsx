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
}

export default function VideoSizeSelector({
  platform,
  width,
  height,
  setPlatform,
  setWidth,
  setHeight,
}: Props) {
  return (
    <section className="space-y-6">

      <VideoFormatSelect
        value={platform}
        onChange={(format) => {
          setPlatform(format.id);

          if (format.id !== "custom") {
            setWidth(format.width);
            setHeight(format.height);
          }
        }}
      />

      {platform === "custom" && (
        <CustomSizeInput
          width={width}
          height={height}
          onWidthChange={setWidth}
          onHeightChange={setHeight}
        />
      )}

    </section>
  );
}