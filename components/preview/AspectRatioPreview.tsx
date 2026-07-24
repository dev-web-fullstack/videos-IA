interface AspectRatioPreviewProps {
  width: number;
  height: number;
}

export default function AspectRatioPreview({
  width,
  height,
}: AspectRatioPreviewProps) {
  const maxSize = 160;

  let previewWidth = maxSize;
  let previewHeight = (height / width) * maxSize;

  if (previewHeight > maxSize) {
    previewHeight = maxSize;
    previewWidth = (width / height) * maxSize;
  }

  return (
    <div className="flex flex-col items-center gap-3">

      <div
        className="
          flex
          items-center
          justify-center
          rounded-xl
          border-2
          border-green-500
          bg-gray-900
          shadow-lg
          transition-all
        "
        style={{
          width: previewWidth,
          height: previewHeight,
        }}
      >

        <div className="text-center">

          <div className="text-sm font-semibold text-white">
            {width} × {height}
          </div>

          <div className="text-xs text-gray-400">
            Preview
          </div>

        </div>

      </div>

      <div className="text-xs text-gray-400">
        Proporção do vídeo
      </div>

    </div>
  );
}