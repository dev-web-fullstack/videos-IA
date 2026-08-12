// components/form/GenerateButton.tsx
import Button from "../../components/ui/Button";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  label?: string;
}

export default function GenerateButton({
  onClick,
  disabled = false,
  isGenerating = false,
  label = "🎬 Gerar Vídeo",
}: GenerateButtonProps) {
  return (
    <section>
      <Button
        onClick={onClick}
        disabled={disabled}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Gerando vídeo...
          </span>
        ) : (
          label
        )}
      </Button>
    </section>
  );
}