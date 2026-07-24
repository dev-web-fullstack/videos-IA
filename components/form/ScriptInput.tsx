import Textarea from "../../components/ui/Textarea";

interface ScriptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ScriptInput({
  value,
  onChange,
}: ScriptInputProps) {
  return (
    <section className="space-y-2">

      <label className="block text-sm text-gray-300 font-medium">
        Texto do vídeo
      </label>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite ou cole aqui o roteiro do vídeo..."
      />

    </section>
  );
}