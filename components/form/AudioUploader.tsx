// components/form/AudioUploader.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Music,
  Loader2,
  Wand2,
  Trash2,
  Check,
  Sparkles
} from "lucide-react";

interface AudioFile {
  name: string;
  path: string;
  size?: number;
}

interface AvailableAudio {
  name: string;
  path: string;
  size: number;
  uploadedAt: Date;
}

interface AudioUploaderProps {
  onAudioChange: (file: AudioFile | null) => void;
  audioFile: AudioFile | null;
  onRemove: () => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  disabled?: boolean;
  videoDuration?: number;
}

const styleOptions = [
  { value: "relaxing", label: "🧘 Relaxante" },
  { value: "energetic", label: "⚡ Energético" },
  { value: "cinematic", label: "🎬 Cinematográfico" },
  { value: "ambient", label: "🌊 Ambiental" },
  { value: "uplifting", label: "🌟 Elevado" },
  { value: "gospel", label: "✝️ Gospel" },
  { value: "nature", label: "🌿 Natureza" },
  { value: "romantic", label: "❤️ Romântico" },
];

export default function AudioUploader({
  onAudioChange,
  audioFile,
  onRemove,
  isGenerating,
  setIsGenerating,
  disabled = false,
  videoDuration = 5,
}: AudioUploaderProps) {

  const [availableAudios, setAvailableAudios] = useState<AvailableAudio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("relaxing");
  const [generationProgress, setGenerationProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAudios = async () => {
    try {
      const response = await fetch("/api/get-audios");
      const data = await response.json();
      if (data.audios) {
        setAvailableAudios(data.audios);
        console.log('📋 Áudios carregados:', data.audios.length);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar áudios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudios();
  }, []);

  useEffect(() => {
    if (audioFile) {
      setSelectedPath(audioFile.path);
      console.log('🔄 AudioUploader: audioFile sincronizado:', audioFile.path);
    } else {
      setSelectedPath(null);
    }
  }, [audioFile]);

  useEffect(() => {
    if (isGenerating) {
      setGenerationProgress(0);
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setGenerationProgress(100);
    }
  }, [isGenerating]);

  const selectAudio = (selectedAudio: AvailableAudio) => {
    console.log('🎵 Selecionando áudio:', selectedAudio.name, selectedAudio.path);

    if (selectedPath === selectedAudio.path) {
      console.log('🗑️ Desselecionando áudio');
      setSelectedPath(null);
      onAudioChange(null);
      onRemove();
      return;
    }

    setSelectedPath(selectedAudio.path);
    const audioData = {
      name: selectedAudio.name,
      path: selectedAudio.path,
      size: selectedAudio.size,
    };
    console.log('✅ Áudio selecionado:', audioData);
    onAudioChange(audioData);
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4"];
    if (!allowedTypes.includes(file.type)) {
      alert("Formato de áudio não suportado. Use MP3, WAV, OGG ou M4A.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo 50MB.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        await loadAudios();
        const newAudio = {
          name: data.name || file.name,
          path: data.audioPath,
          size: data.size || file.size,
        };
        setSelectedPath(data.audioPath);
        onAudioChange(newAudio);
      } else {
        alert(data.error || "Erro ao fazer upload do áudio");
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      alert("Erro ao fazer upload do áudio");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: videoDuration,
          style: selectedStyle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadAudios();
        const newAudio = {
          name: data.name || `Música - ${selectedStyle}.wav`,
          path: data.audioPath,
          size: data.size || 0,
        };
        setSelectedPath(data.audioPath);
        onAudioChange(newAudio);
      } else {
        alert(data.error || "Erro ao gerar áudio");
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      alert("Erro ao gerar áudio");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (audioPath: string) => {
    if (!confirm("Tem certeza que deseja excluir este áudio?")) return;

    try {
      const response = await fetch("/api/delete-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioPath }),
      });

      if (response.ok) {
        await loadAudios();
        if (selectedPath === audioPath) {
          setSelectedPath(null);
          onAudioChange(null);
        }
      }
    } catch (error) {
      console.error("❌ Erro ao deletar:", error);
      alert("Erro ao deletar áudio");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading || isGenerating}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${disabled || isUploading || isGenerating
              ? "bg-gray-700/50 cursor-not-allowed opacity-60"
              : "bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-white"
            }
          `}
        >
          {isUploading ? (
            <>
              <span className="animate-spin">⏳</span>
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Áudio
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
          className="hidden"
          disabled={disabled || isUploading || isGenerating}
        />
        <span className="text-[10px] text-gray-500">MP3, WAV, OGG, M4A (max 50MB)</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            disabled={disabled || isGenerating}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white text-sm"
          >
            {styleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerateAI}
            disabled={disabled || isGenerating || isUploading}
            className={`
              flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${disabled || isGenerating || isUploading
                ? "bg-gray-700/50 cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 hover:border-purple-400/50 text-white"
              }
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {Math.round(generationProgress)}%
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Gerar ({videoDuration}s)
              </>
            )}
          </button>
        </div>
        {isGenerating && (
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(generationProgress, 100)}%` }}
            />
          </div>
        )}
      </div>

      {!isLoading && availableAudios.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider">
              Áudios disponíveis ({availableAudios.length})
            </label>
            <span className="text-[10px] text-gray-500">
              {audioFile ? "1 selecionado" : "Nenhum selecionado"}
            </span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
            {availableAudios.map((audioItem) => {
              const isSelected = selectedPath === audioItem.path;
              return (
                <div
                  key={audioItem.path}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer group
                    ${isSelected
                      ? "border-pink-400 bg-pink-600/20"
                      : "border-gray-700 hover:border-gray-500 bg-gray-800/30"
                    }
                  `}
                  onClick={() => selectAudio(audioItem)}
                >
                  <Music className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-pink-400" : "text-gray-400"}`} />
                  <span className="flex-1 text-xs text-gray-300 truncate">
                    {audioItem.name.length > 25 ? audioItem.name.substring(0, 25) + '...' : audioItem.name}
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(audioItem.path);
                    }}
                    className="p-0.5 rounded-full bg-red-500/80 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}