interface Props {
  width: number;
  height: number;
  label: string;
}

export default function FormatPreview({
  width,
  height,
  label,
}: Props) {
  const max = 220;

  const scale =
    Math.min(max / width, max / height);

  const previewWidth = width * scale;
  const previewHeight = height * scale;

  return (
    <section className="space-y-3">

      <label className="block text-sm font-medium text-gray-300">
        Prévia do formato
      </label>

      <div className="flex flex-col items-center">

        <div
          className="
            bg-gray-800
            border-2
            border-green-500
            rounded-xl
            flex
            items-center
            justify-center
            text-center
            text-sm
            font-semibold
            text-white
            shadow-lg
          "
          style={{
            width: previewWidth,
            height: previewHeight,
          }}
        >
          <div>
            <div>
              {width} × {height}
            </div>

            <div className="text-xs text-gray-300 mt-1">
              {(width / height).toFixed(2)}
            </div>
          </div>
        </div>

        <span className="mt-3 text-gray-400 text-sm">
          {label}
        </span>

      </div>

    </section>
  );
}