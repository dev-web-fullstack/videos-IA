import Input from "../../components/ui/Input";

interface DurationInputProps {
  value: number;
  onChange: (value: number) => void;
}

export default function DurationInput({
  value,
  onChange,
}: DurationInputProps) {
  return (
    <section className="space-y-2">

      <label className="block text-sm font-medium text-gray-300">
        Duração do vídeo (segundos)
      </label>

      <Input
        type="number"
        min={1}
        max={3600}
        step={1}
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        placeholder="Ex.: 10"
      />

      <p className="text-xs text-gray-400">
        Informe a duração total do vídeo em segundos.
      </p>

    </section>
  );
}