// app/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import {
  Video,
  Loader2,
  Shield,
  Eye,
  FileText,
  Monitor,
  Palette,
  Image,
  Clock,
  Images,
  Music,
  Info,
  Mic,
} from "lucide-react";

import Header from "../components/layout/Header";
import Card from "../components/ui/Card";

import ScriptInput from "../components/form/ScriptInput";
import DurationInput from "../components/form/DurationInput";
import VideoSizeSelector from "../components/form/VideoSizeSelector";
import GenerateButton from "../components/form/GenerateButton";
import TextStyleEditor from "../components/form/TextStyleEditor";
import BackgroundSelector from "../components/form/BackgroundSelector";
import ImageUploader from "../components/form/ImageUploader";
import AudioUploader from "../components/form/AudioUploader";
import TTSGenerator from "../components/form/TTSGenerator";

import ProgressBar from "../components/preview/ProgressBar";
import ResultCard from "../components/preview/ResultCard";
import LiveTextPreview from "../components/preview/LiveTextPreview";

import {
  createDefaultTextStyle,
  TextStyle,
} from "../lib/textStyle";

import { BackgroundType } from "../lib/backgroundAnimations";

type Tab = "text" | "tts" | "background" | "images" | "audio";

interface OverlayImage {
  path: string;
  position: { x: number; y: number };
  size: number;
  aspectRatio?: number;
}

interface AudioFile {
  name: string;
  path: string;
  size?: number;
}

export default function Home() {

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [script, setScript] = useState("");
  const [videoDuration, setVideoDuration] = useState(5);
  const [platform, setPlatform] = useState("youtube");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [videoResult, setVideoResult] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<Tab>("text");

  const [backgroundType, setBackgroundType] = useState<BackgroundType>("solid");
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [backgroundPrompt, setBackgroundPrompt] = useState<string>("");
  const [imageLoadKey, setImageLoadKey] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<string>("sunset");

  const [overlayImages, setOverlayImages] = useState<OverlayImage[]>([]);

  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(5);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // REFERÊNCIA PARA CONTROLAR O PREVIEW DO ÁUDIO
  const audioPreviewRef = useRef<{ pausePreview: () => boolean } | null>(null);
  const [isAudioPreviewPlaying, setIsAudioPreviewPlaying] = useState(false);

  // REFERÊNCIA DO ÁUDIO
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isCleaningRef = useRef(false);

  const imageLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const isImageLoadingRef = useRef(false);

  const [textStyle, setTextStyle] = useState<TextStyle>(
    createDefaultTextStyle({ width: 1920, height: 1080 })
  );

  // Função para pausar o preview do áudio (chamada pelo pai)
  const pauseAudioPreview = () => {
    if (audioPreviewRef.current) {
      const paused = audioPreviewRef.current.pausePreview();
      if (paused) {
        console.log('🎵 Preview pausado por ação externa');
      }
    }
    // Também pausar o áudio principal se estiver tocando
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // PAUSAR PREVIEW QUANDO MUDAR DE ABA
  const handleTabChange = (tab: Tab) => {
    // Pausar preview se estiver tocando
    pauseAudioPreview();
    setActiveTab(tab);
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
        imageLoadTimeoutRef.current = null;
      }
      if (audioRef.current) {
        isCleaningRef.current = true;
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
        isCleaningRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    const defaults = createDefaultTextStyle({ width, height });
    setTextStyle(prev => ({
      ...prev,
      fontSize: defaults.fontSize,
      marginX: defaults.marginX,
      marginY: defaults.marginY,
      padding: defaults.padding,
      borderRadius: defaults.borderRadius,
      borderWidth: defaults.borderWidth,
      shadowX: defaults.shadowX,
      shadowY: defaults.shadowY,
      shadowBlur: defaults.shadowBlur,
      lineSpacing: defaults.lineSpacing,
    }));
  }, [width, height]);

  // ============================================
  // GERENCIAMENTO DO ÁUDIO
  // ============================================

  useEffect(() => {
    if (audioRef.current) {
      isCleaningRef.current = true;
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
      isCleaningRef.current = false;
    }
    setIsAudioLoaded(false);
    setAudioDuration(5);

    if (!audioFile?.path) {
      return;
    }

    console.log('🔊 [Page] Criando áudio:', audioFile.path);

    const audio = new Audio();
    const audioUrl = audioFile.path.startsWith('/') ? audioFile.path : `/${audioFile.path}`;
    audio.src = audioUrl;
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (isCleaningRef.current) return;
      console.log('✅ [Page] Áudio carregado, duração:', audio.duration);
      setIsAudioLoaded(true);
      const duration = audio.duration || 5;
      setAudioDuration(duration);
      setVideoDuration(Math.ceil(duration));
      setPreviewKey(prev => prev + 1);
    };

    audio.oncanplay = () => {
      if (isCleaningRef.current) return;
      console.log('✅ [Page] Áudio pronto para reproduzir');
      setIsAudioLoaded(true);
      const duration = audio.duration || 5;
      setAudioDuration(duration);
      setVideoDuration(Math.ceil(duration));
      setPreviewKey(prev => prev + 1);
    };

    audio.onerror = (e) => {
      if (isCleaningRef.current) return;
      if (audio.src === '' || audio.src === 'http://localhost:3000/') return;
      console.error('❌ [Page] Erro no áudio:', e);
      console.error('❌ audio.src:', audio.src);
    };

    audio.onended = () => {
      if (isCleaningRef.current) return;
      console.log('⏹️ [Page] Áudio terminou');
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.ontimeupdate = () => {
      if (isCleaningRef.current) return;
      const time = audio.currentTime || 0;
      setCurrentTime(time);
    };

    try {
      audio.load();
    } catch (err) {
      if (isCleaningRef.current) return;
      console.error('❌ [Page] Erro ao carregar áudio:', err);
    }

  }, [audioFile?.path]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isAudioLoaded || isCleaningRef.current) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        if (isCleaningRef.current) return;
        console.error('❌ Erro ao reproduzir:', err);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, isAudioLoaded]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isAudioLoaded || isCleaningRef.current) return;
    const timeDiff = Math.abs(audio.currentTime - currentTime);
    if (timeDiff > 0.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime, isAudioLoaded]);

  // ============================================

  const handleAudioRemove = () => {
    console.log('📢 page: Removendo áudio');
    pauseAudioPreview();
    isCleaningRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    isCleaningRef.current = false;
    setAudioFile(null);
    setAudioDuration(5);
    setIsAudioLoaded(false);
    setVideoDuration(5);
    setPreviewKey(prev => prev + 1);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioFile || !isAudioLoaded || isBlocked) return;
    setIsPlaying(!isPlaying);
    if (!isPlaying && currentTime >= videoDuration) {
      setCurrentTime(0);
    }
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, videoDuration)));
    if (time >= videoDuration && isPlaying) {
      setIsPlaying(false);
    }
  };

  // ============================================
  // HANDLE TTS AUDIO GENERATED
  // ============================================

  const handleTTSAudioGenerated = (audioPath: string, filename: string, duration?: number) => {
    console.log('🎤 Áudio TTS gerado:', audioPath, 'Duração:', duration);

    // Criar um objeto AudioFile a partir do TTS gerado
    const newAudioFile: AudioFile = {
      name: filename || `tts_${Date.now()}.mp3`,
      path: audioPath,
      size: 0, // Será atualizado quando carregar
    };

    // Remover áudio anterior se existir
    if (audioFile) {
      handleAudioRemove();
    }

    // Definir o novo áudio
    setAudioFile(newAudioFile);

    // Se tiver duração, atualizar
    if (duration && duration > 0) {
      setAudioDuration(duration);
      setVideoDuration(Math.ceil(duration));
    }

    // Forçar recarregar o preview
    setPreviewKey(prev => prev + 1);

    // Opcional: Mudar para a aba de áudio para mostrar o resultado
    // setActiveTab('audio');
  };

  // ============================================

  async function handleGenerateVideo() {
    // PAUSAR PREVIEW DE ÁUDIO AO GERAR VÍDEO
    pauseAudioPreview();

    if (backgroundType === "ai-generated" && !backgroundImage) {
      alert("Por favor, gere uma imagem de fundo com IA primeiro!");
      return;
    }

    setIsGenerating(true);
    setVideoResult(null);

    const finalDuration = isAudioLoaded && audioDuration > 0 ? Math.ceil(audioDuration) : videoDuration;

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: script || "",
          videoDuration: finalDuration,
          platform,
          width,
          height,
          textStyle,
          backgroundType,
          backgroundColor,
          imageUrl: backgroundType === "ai-generated" ? backgroundImage : undefined,
          overlayImages: overlayImages.length > 0 ? overlayImages : undefined,
          audioPath: audioFile?.path || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVideoResult(data);
      } else {
        console.error("Erro:", data.error);
        alert(data.error || "Erro ao gerar vídeo");
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      alert("Erro ao gerar vídeo. Verifique o console para mais detalhes.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDownloadVideo() {
    if (!videoResult?.videoPath) {
      alert("Nenhum vídeo para baixar.");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch("/api/download-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoPath: videoResult.videoPath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Erro ao baixar vídeo");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setVideoResult(null);
      }, 3000);
    } catch (error) {
      console.error("❌ Erro ao baixar:", error);
      alert("Erro ao baixar o vídeo.");
    } finally {
      setIsDownloading(false);
    }
  }

  const handleImageLoading = (loading: boolean) => {
    if (!isMounted.current) return;
    setIsGeneratingImage(loading);
    if (loading) {
      isImageLoadingRef.current = true;
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
      }
      imageLoadTimeoutRef.current = setTimeout(() => {
        if (isMounted.current && isImageLoadingRef.current) {
          isImageLoadingRef.current = false;
          setIsGeneratingImage(false);
          setImageLoadKey(prev => prev + 1);
          imageLoadTimeoutRef.current = null;
        }
      }, 50000);
    } else {
      isImageLoadingRef.current = false;
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
        imageLoadTimeoutRef.current = null;
      }
      setImageLoadKey(prev => prev + 1);
    }
  };

  const handleImageDisplayed = () => {
    if (!isMounted.current) return;
    isImageLoadingRef.current = false;
    setIsGeneratingImage(false);
    setImageLoadKey(prev => prev + 1);
    if (imageLoadTimeoutRef.current) {
      clearTimeout(imageLoadTimeoutRef.current);
      imageLoadTimeoutRef.current = null;
    }
  };

  // ============================================
  // ESTADO DE BLOQUEIO - INCLUI DOWNLOAD
  // ============================================

  const isBlocked = isGenerating || isDownloading || isGeneratingImage;

  const hasText = script && script.trim().length > 0 ? true : false;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "text", label: "Texto", icon: FileText },
    { id: "tts", label: "Gerar Voz", icon: Mic },
    { id: "background", label: "Fundo", icon: Image },
    { id: "images", label: "Imagens", icon: Images },
    { id: "audio", label: "Áudio", icon: Music },
  ];

  const displayDuration = isAudioLoaded && audioDuration > 0 ? Math.ceil(audioDuration) : videoDuration;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Header />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Monitor className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300 font-mono">{width} × {height}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">{displayDuration}s</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <DurationInput
                key={`duration-${previewKey}`}
                value={videoDuration}
                onChange={(v) => {
                  setVideoDuration(v);
                  setPreviewKey(prev => prev + 1);
                }}
                disabled={isBlocked || (isAudioLoaded && audioDuration > 0)}
                compact={true}
              />
              {isAudioLoaded && audioDuration > 0 && (
                <span className="text-[10px] text-pink-400">🔒</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isGeneratingImage && (
              <span className="text-xs text-purple-400 animate-pulse flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Gerando imagem...
              </span>
            )}
            {isGenerating && (
              <span className="text-xs text-yellow-400 animate-pulse flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Gerando vídeo...
              </span>
            )}
            {isDownloading && (
              <span className="text-xs text-blue-400 animate-pulse flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Baixando vídeo...
              </span>
            )}
            {isPlaying && (
              <span className="text-xs text-green-400 animate-pulse flex items-center gap-1">
                ▶️ Reproduzindo
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Sidebar - Controles */}
          <div className="space-y-4">
            {/* Tabs Navigation - DESABILITADO QUANDO isBlocked */}
            <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isBlocked && handleTabChange(tab.id)}
                    disabled={isBlocked}
                    className={`
                      flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-300
                      ${isActive
                        ? "bg-gradient-to-r from-purple-600/40 to-blue-600/40 text-white shadow-lg shadow-purple-900/20 border border-purple-500/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                      }
                      ${isBlocked ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Conteúdo das Tabs */}
            <div className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 min-h-[350px] max-h-[500px] overflow-y-auto transition-all duration-300 ${isBlocked ? 'opacity-60 pointer-events-none' : ''}`}>
              {activeTab === "text" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Texto e Estilo</h3>
                  </div>
                  <ScriptInput
                    value={script}
                    onChange={setScript}
                    disabled={isBlocked}
                  />
                  <div className="border-t border-gray-700/50 pt-4 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="w-4 h-4 text-pink-400" />
                      <span className="text-xs text-gray-400 font-medium">Estilo do Texto</span>
                    </div>
                    <TextStyleEditor
                      value={textStyle}
                      onChange={setTextStyle}
                      showStyle
                      showShadow={true}
                      disabled={isBlocked}
                      hasText={hasText}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                    {script.trim().length} caracteres
                    {!hasText && (
                      <span className="text-yellow-400 text-[10px]"> (sem texto)</span>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "tts" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Gerar Voz</h3>
                    <span className="text-[10px] text-purple-400/60 bg-purple-500/10 px-2 py-0.5 rounded-full ml-auto">
                      Fish Audio S2.1 Pro
                    </span>
                  </div>
                  <TTSGenerator
                    onAudioGenerated={handleTTSAudioGenerated}
                    disabled={isBlocked}
                  />
                </div>
              )}

              {activeTab === "background" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Fundo do Vídeo</h3>
                  </div>
                  <BackgroundSelector
                    key={imageLoadKey}
                    backgroundType={backgroundType}
                    backgroundColor={backgroundColor}
                    imageUrl={backgroundImage}
                    width={width}
                    height={height}
                    scriptText={script}
                    onTypeChange={setBackgroundType}
                    onColorChange={setBackgroundColor}
                    onImageChange={(url, prompt, theme) => {
                      setBackgroundImage(url);
                      setBackgroundPrompt(prompt);
                      if (theme) setSelectedTheme(theme);
                    }}
                    onLoadingChange={handleImageLoading}
                    isGeneratingImage={isGeneratingImage}
                    selectedTheme={selectedTheme}
                    onThemeChange={setSelectedTheme}
                  />
                </div>
              )}

              {activeTab === "images" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Images className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Imagens do Vídeo</h3>
                  </div>
                  <ImageUploader
                    onImagesChange={setOverlayImages}
                    selectedImages={overlayImages}
                    disabled={isBlocked}
                  />
                  {overlayImages.length > 0 && (
                    <div className="text-xs text-gray-400">
                      📷 {overlayImages.length} imagem(ns) adicionada(s).
                    </div>
                  )}
                </div>
              )}

              {activeTab === "audio" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-5 h-5 text-pink-400" />
                    <h3 className="text-white font-semibold">Áudio do Vídeo</h3>
                  </div>
                  <AudioUploader
                    key={audioFile?.path || 'no-audio'}
                    ref={audioPreviewRef}
                    onAudioChange={setAudioFile}
                    audioFile={audioFile}
                    onRemove={handleAudioRemove}
                    isGenerating={isGeneratingAudio}
                    setIsGenerating={setIsGeneratingAudio}
                    disabled={isBlocked}
                    videoDuration={displayDuration}
                    onPreviewStateChange={setIsAudioPreviewPlaying}
                  />
                  {isAudioLoaded && audioDuration > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-xs">
                      <span className="text-pink-400">🎵</span>
                      <span className="text-gray-300">
                        Áudio: <span className="text-white font-mono">{Math.ceil(audioDuration)}s</span>
                      </span>
                      <span className="text-pink-400">→ Vídeo: {displayDuration}s</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video Size Selector - DESABILITADO QUANDO isBlocked */}
            <div className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-3 ${isBlocked ? 'opacity-60 pointer-events-none' : ''}`}>
              <VideoSizeSelector
                platform={platform}
                setPlatform={setPlatform}
                width={width}
                height={height}
                setWidth={setWidth}
                setHeight={setHeight}
                disabled={isBlocked}
              />
            </div>

            {/* Botão Gerar - DESABILITADO QUANDO isBlocked */}
            <GenerateButton
              onClick={handleGenerateVideo}
              disabled={
                isGeneratingImage ||
                isGenerating ||
                isDownloading ||
                (backgroundType === "ai-generated" && !backgroundImage)
              }
              isGenerating={isGenerating}
              label="🎬 Gerar Vídeo"
            />

            {backgroundType === "ai-generated" && !backgroundImage && !isGeneratingImage && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-900/30 border border-yellow-700/50 text-yellow-400 text-xs">
                <Shield className="w-4 h-4" /> Gere uma imagem de fundo com IA primeiro!
              </div>
            )}

            {isGeneratingImage && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900/30 border border-purple-700/50 text-purple-400 text-xs animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando imagem... Aguarde!
              </div>
            )}

            {!hasText && !isGenerating && !isGeneratingImage && !isDownloading && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900/30 border border-blue-700/50 text-blue-400 text-xs">
                <Info className="w-4 h-4" /> O vídeo será gerado sem texto
              </div>
            )}
          </div>

          {/* Preview - ÁREA PRINCIPAL */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
              <LiveTextPreview
                key={`preview-${previewKey}`}
                text={script}
                width={width}
                height={height}
                style={textStyle}
                backgroundType={backgroundType}
                backgroundColor={backgroundColor}
                backgroundImage={backgroundImage}
                overlayImages={overlayImages}
                onOverlayImagesChange={setOverlayImages}
                isGeneratingImage={isGeneratingImage}
                onImageDisplayed={handleImageDisplayed}
                activeTab={activeTab}
                audioPath={audioFile?.path || undefined}
                videoDuration={displayDuration}
                onDurationChange={(duration) => {
                  setAudioDuration(duration);
                  setIsAudioLoaded(true);
                  setVideoDuration(Math.ceil(duration));
                  setPreviewKey(prev => prev + 1);
                }}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onTimeChange={handleTimeChange}
                onPlayToggle={togglePlay}
                disabled={isBlocked}
              />
            </div>

            {isGenerating && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                <ProgressBar duration={displayDuration} hasAnimation={false} />
              </div>
            )}

            <ResultCard
              result={videoResult}
              onDownload={handleDownloadVideo}
              isDownloading={isDownloading}
              onDelete={() => setVideoResult(null)}
            />

            {!videoResult && !isGenerating && !isDownloading && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-8 min-h-[150px]">
                <Video className="w-12 h-12 text-gray-600 mb-3" />
                <span className="text-gray-500 text-sm text-center">Gere um vídeo para visualizar o resultado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <span>© 2026 Videos IA - Criado com ❤️</span>
            <div className="flex items-center gap-4">
              <span>✨ Gerador de Vídeos com IA</span>
              <span className="w-px h-3 bg-gray-700" />
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" /> Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}