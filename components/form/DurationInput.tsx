// components/form/DurationInput.tsx
import Input from "../../components/ui/Input";

interface DurationInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  compact?: boolean;
}

export default function DurationInput({
  value,
  onChange,
  id = "duration-input",
  name = "videoDuration",
  disabled = false,
  compact = false,
}: DurationInputProps) {

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Input
          id={id}
          name={name}
          type="number"
          min={1}
          max={3600}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="5"
          disabled={disabled}
          className="w-16 h-7 text-sm p-1 bg-gray-800/50 border-gray-600"
        />
        <span className="text-xs text-gray-400">s</span>
      </div>
    );
  }

  return (
    <section className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        Duração do vídeo (segundos)
      </label>

      <Input
        id={id}
        name={name}
        type="number"
        min={1}
        max={3600}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="Ex.: 10"
        disabled={disabled}
      />

      <p className="text-xs text-gray-400">
        Informe a duração total do vídeo em segundos.
      </p>
    </section>
  );
}