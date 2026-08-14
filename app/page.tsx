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
  Images
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

import ProgressBar from "../components/preview/ProgressBar";
import ResultCard from "../components/preview/ResultCard";
import LiveTextPreview from "../components/preview/LiveTextPreview";

import {
  createDefaultTextStyle,
  TextStyle,
} from "../lib/textStyle";

import { BackgroundType } from "../lib/backgroundAnimations";

type Tab = "text" | "style" | "background" | "images";

interface OverlayImage {
  path: string;
  position: { x: number; y: number };
  size: number;
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

  // Tabs
  const [activeTab, setActiveTab] = useState<Tab>("text");

  // Fundo
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("solid");
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [backgroundPrompt, setBackgroundPrompt] = useState<string>("");
  const [imageLoadKey, setImageLoadKey] = useState(0);

  // Overlay images
  const [overlayImages, setOverlayImages] = useState<OverlayImage[]>([]);

  // Timeout para segurança
  const imageLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const isImageLoadingRef = useRef(false);

  //--------------------------------------
  // Estilo
  //--------------------------------------

  const [textStyle, setTextStyle] =
    useState<TextStyle>(
      createDefaultTextStyle({
        width: 1920,
        height: 1080,
      })
    );

  //--------------------------------------

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
        imageLoadTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {

    const defaults =
      createDefaultTextStyle({
        width,
        height,
      });

    setTextStyle(previous => ({

      ...previous,

      fontSize: defaults.fontSize,

      marginX: defaults.marginX,
      marginY: defaults.marginY,

      padding: defaults.padding,

      borderRadius:
        defaults.borderRadius,

      borderWidth:
        defaults.borderWidth,

      shadowX: defaults.shadowX,
      shadowY: defaults.shadowY,
      shadowBlur:
        defaults.shadowBlur,

      lineSpacing:
        defaults.lineSpacing,

    }));

  }, [width, height]);

  //--------------------------------------

  async function handleGenerateVideo() {
    // Verificar se tem imagem de fundo IA quando necessário
    if (backgroundType === "ai-generated" && !backgroundImage) {
      alert("Por favor, gere uma imagem de fundo com IA primeiro!");
      return;
    }

    setIsGenerating(true);
    setVideoResult(null);

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script: script || "",
          videoDuration,
          platform,
          width,
          height,
          textStyle,
          backgroundType,
          backgroundColor,
          imageUrl: backgroundType === "ai-generated" ? backgroundImage : undefined,
          overlayImages: overlayImages.length > 0 ? overlayImages : undefined,
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

  //--------------------------------------

  async function handleDownloadVideo() {
    if (!videoResult?.videoPath) {
      alert("Nenhum vídeo para baixar.");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch("/api/download-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoPath: videoResult.videoPath,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro:", errorData);
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
        console.log("🗑️ Vídeo e arquivos temporários removidos");
      }, 3000);

    } catch (error) {
      console.error("❌ Erro ao baixar:", error);
      alert("Erro ao baixar o vídeo.");
    } finally {
      setIsDownloading(false);
    }
  }

  //--------------------------------------

  const handleImageLoading = (loading: boolean) => {
    if (!isMounted.current) return;

    setIsGeneratingImage(loading);

    if (loading) {
      isImageLoadingRef.current = true;

      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
        imageLoadTimeoutRef.current = null;
      }

      imageLoadTimeoutRef.current = setTimeout(() => {
        if (isMounted.current && isImageLoadingRef.current) {
          console.warn("⏰ Timeout: liberando UI após 50s");
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

    console.log("✅ Imagem exibida no preview!");
    isImageLoadingRef.current = false;
    setIsGeneratingImage(false);
    setImageLoadKey(prev => prev + 1);
    if (imageLoadTimeoutRef.current) {
      clearTimeout(imageLoadTimeoutRef.current);
      imageLoadTimeoutRef.current = null;
    }
  };

  // Verificar se algo está bloqueando a interface
  const isBlocked = isGenerating || isDownloading || isGeneratingImage;

  // Verificar se tem texto
  const hasText = script && script.trim().length > 0;

  // Tabs com ícones
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "text", label: "Texto", icon: FileText },
    { id: "style", label: "Estilo", icon: Palette },
    { id: "background", label: "Fundo", icon: Image },
    { id: "images", label: "Imagens", icon: Images },
  ];

  return (

    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">

      {/* Header */}
      <div className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Header />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Resolução e Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Monitor className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300 font-mono">
                {width} × {height}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">
                {videoDuration}s
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isGeneratingImage && (
              <span className="text-xs text-purple-400 animate-pulse flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Gerando imagem...
              </span>
            )}
            {isGenerating && (
              <span className="text-xs text-yellow-400 animate-pulse flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Gerando vídeo...
              </span>
            )}
          </div>
        </div>

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">

          {/* Sidebar - Controles */}
          <div className="space-y-4">

            {/* Video Size Selector */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
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

            {/* Tabs Navigation */}
            <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={isBlocked}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                      ${isActive
                        ? "bg-gradient-to-r from-purple-600/40 to-blue-600/40 text-white shadow-lg shadow-purple-900/20 border border-purple-500/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                      }
                      ${isBlocked ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Conteúdo das Tabs */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 min-h-[400px] transition-all duration-300">
              {activeTab === "text" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Conteúdo do Vídeo</h3>
                  </div>
                  <ScriptInput
                    value={script}
                    onChange={setScript}
                    disabled={isBlocked}
                  />
                  <DurationInput
                    value={videoDuration}
                    onChange={setVideoDuration}
                    disabled={isBlocked}
                  />
                  <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    {script.trim().length} caracteres
                    {!hasText && (
                      <span className="text-yellow-400 text-[10px]"> (sem texto)</span>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "style" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-5 h-5 text-pink-400" />
                    <h3 className="text-white font-semibold">Personalização do Texto</h3>
                  </div>
                  <TextStyleEditor
                    value={textStyle}
                    onChange={setTextStyle}
                    showStyle
                    showShadow={true}
                    disabled={isBlocked}
                    hasText={!!hasText} // CONVERTER PARA BOOLEAN
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
                    onImageChange={(url, prompt) => {
                      setBackgroundImage(url);
                      setBackgroundPrompt(prompt);
                    }}
                    onLoadingChange={handleImageLoading}
                    isGeneratingImage={isGeneratingImage}
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
                      Clique para selecionar • Arraste para mover • Bordas para redimensionar
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botão Gerar - LIBERADO MESMO SEM TEXTO */}
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
                <Shield className="w-4 h-4" />
                Gere uma imagem de fundo com IA primeiro!
              </div>
            )}

            {isGeneratingImage && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900/30 border border-purple-700/50 text-purple-400 text-xs animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando imagem... Aguarde!
              </div>
            )}

            {/* Aviso de que o vídeo será gerado sem texto */}
            {!hasText && !isGenerating && !isGeneratingImage && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900/30 border border-blue-700/50 text-blue-400 text-xs">
                <Info className="w-4 h-4" />
                O vídeo será gerado sem texto (apenas fundo e imagens)
              </div>
            )}

          </div>

          {/* Preview */}
          <div className="space-y-4">

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  Preview
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  Ao vivo
                </div>
              </div>

              <LiveTextPreview
                key={imageLoadKey}
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
              />
            </div>

            {isGenerating && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                <ProgressBar
                  duration={videoDuration}
                  hasAnimation={false}
                />
              </div>
            )}

            <ResultCard
              result={videoResult}
              onDownload={handleDownloadVideo}
              isDownloading={isDownloading}
              onDelete={() => setVideoResult(null)}
            />

            {!videoResult && !isGenerating && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-8 min-h-[200px]">
                <Video className="w-12 h-12 text-gray-600 mb-3" />
                <span className="text-gray-500 text-sm text-center">
                  Gere um vídeo para visualizar o resultado
                </span>
                <span className="text-gray-600 text-xs mt-1">
                  Configure o texto, estilo e fundo, depois clique em "Gerar Vídeo"
                </span>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-white/5 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <span>© 2026 Videos IA - Criado com ❤️</span>
            <div className="flex items-center gap-4">
              <span>✨ Gerador de Vídeos com IA</span>
              <span className="w-px h-3 bg-gray-700"></span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

    </main>

  );

}

// Componente Info para o aviso
function Info(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}