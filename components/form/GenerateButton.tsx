import Button from "../../components/ui/Button";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function GenerateButton({
  onClick,
  disabled = false,
}: GenerateButtonProps) {
  return (
    <section>
      <Button
        onClick={onClick}
        disabled={disabled}
      >
        🎬 Gerar Vídeo
      </Button>
    </section>
  );
}