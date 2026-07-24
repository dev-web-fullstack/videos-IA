export default function ProgressBar() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-300">
        Gerando vídeo...
      </p>

      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full w-full bg-green-500 animate-pulse" />
      </div>
    </div>
  );
}