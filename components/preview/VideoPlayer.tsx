"use client";

import { useEffect, useRef } from "react";

type Props = {
  videoPath?: string;
};

export default function VideoPlayer({
  videoPath,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoPath]);

  if (!videoPath) return null;

  return (
    <div className="flex justify-center items-center w-full h-[420px]">
      <video
        ref={videoRef}
        controls
        className="
          max-w-full
          max-h-full
          rounded-xl
          border
          border-gray-700
          shadow-xl
        "
      >
        <source
          src={videoPath}
          type="video/mp4"
        />
      </video>
    </div>
  );
}