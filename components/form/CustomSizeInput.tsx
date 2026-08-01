// components/form/CustomSizeInput.tsx
import Input from "../../components/ui/Input";
import VideoPreview from "./VideoPreview";

interface CustomSizeInputProps {
  width: number;
  height: number;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
}

export default function CustomSizeInput({
  width,
  height,
  onWidthChange,
  onHeightChange,
}: CustomSizeInputProps) {
  return (
    <section className="space-y-6">

      <h3 className="text-lg font-semibold text-white">
        Tamanho personalizado
      </h3>

      <div className="grid lg:grid-cols-2 gap-8 items-start">

        <div className="space-y-5">

          <div className="space-y-2">
            <label htmlFor="custom-width" className="text-sm text-gray-300">
              Largura (px)
            </label>
            <Input
              id="custom-width"
              name="customWidth"
              type="number"
              min={320}
              max={7680}
              step={1}
              value={width}
              onChange={(e) =>
                onWidthChange(Number(e.target.value))
              }
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="custom-height" className="text-sm text-gray-300">
              Altura (px)
            </label>
            <Input
              id="custom-height"
              name="customHeight"
              type="number"
              min={320}
              max={7680}
              step={1}
              value={height}
              onChange={(e) =>
                onHeightChange(Number(e.target.value))
              }
            />
          </div>

          <div className="rounded-lg border border-yellow-700 bg-yellow-900/20 p-4 text-sm text-yellow-300">
            <strong>Recomendação:</strong>
            <br />
            Utilize até <strong>3840 × 2160 (4K)</strong>.
            <br />
            Resoluções maiores aumentam bastante o tempo de renderização e o consumo de memória.
          </div>

        </div>

        <div className="space-y-4">
          <VideoPreview width={width} height={height} />
          <div className="text-center text-sm text-gray-400">
            Resolução atual:
            <span className="font-semibold text-white">
              {" "}
              {width} × {height}
            </span>
          </div>
        </div>

      </div>

    </section>
  );
}