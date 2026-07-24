interface VideoPreviewProps {
  width: number;
  height: number;
}

export default function VideoPreview({
  width,
  height,
}: VideoPreviewProps) {
  const maxWidth = 220;
  const maxHeight = 220;

  const ratio = width / height;

  let previewWidth = maxWidth;
  let previewHeight = previewWidth / ratio;

  if (previewHeight > maxHeight) {
    previewHeight = maxHeight;
    previewWidth = previewHeight * ratio;
  }

  return (
    <section className="space-y-3">

      <label className="block text-sm font-medium text-gray-300">
        Pré-visualização
      </label>

      <div className="flex justify-center">

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
            duration-300
          "
          style={{
            width: previewWidth,
            height: previewHeight,
          }}
        >
          <span className="text-sm font-semibold text-gray-300">
            {width} × {height}
          </span>
        </div>

      </div>

      <p className="text-center text-xs text-gray-500">
        Proporção {(width / height).toFixed(2)} : 1
      </p>

    </section>
  );
}