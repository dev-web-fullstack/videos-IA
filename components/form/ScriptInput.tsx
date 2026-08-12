// components/form/ScriptInput.tsx
import Textarea from "../../components/ui/Textarea";

interface ScriptInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
}

export default function ScriptInput({
  value,
  onChange,
  id = "script-input",
  name = "script",
  disabled = false,
}: ScriptInputProps) {
  return (
    <section className="space-y-2">
      <label htmlFor={id} className="block text-sm text-gray-300 font-medium">
        Texto do vídeo
      </label>

      <Textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite ou cole aqui o roteiro do vídeo..."
        disabled={disabled}
      />
    </section>
  );
}