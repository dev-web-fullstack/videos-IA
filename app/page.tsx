"use client";

import { useEffect, useState } from "react";

import Header from "../components/layout/Header";
import Card from "../components/ui/Card";

import ScriptInput from "../components/form/ScriptInput";
import DurationInput from "../components/form/DurationInput";
import VideoSizeSelector from "../components/form/VideoSizeSelector";
import GenerateButton from "../components/form/GenerateButton";
import TextStyleEditor from "../components/form/TextStyleEditor";
import BackgroundSelector from "../components/form/BackgroundSelector";

import ProgressBar from "../components/preview/ProgressBar";
import ResultCard from "../components/preview/ResultCard";
import LiveTextPreview from "../components/preview/LiveTextPreview";

import {
  createDefaultTextStyle,
  TextStyle,
} from "../lib/textStyle";

import {
  BackgroundAnimationType,
  BackgroundPosition,
  backgroundColors,
  getRandomBackgroundConfig
} from "../lib/backgroundAnimations";

type Section =
  | "text"
  | "style"
  | "shadow"
  | "background";

export default function Home() {

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [script, setScript] = useState("");

  const [videoDuration, setVideoDuration] = useState(5);

  const [platform, setPlatform] = useState("youtube");

  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);

  const [videoResult, setVideoResult] = useState<any>(null);

  const [openSection, setOpenSection] =
    useState<Section>("text");

  // Fundo animado
  const [backgroundAnimation, setBackgroundAnimation] = useState<BackgroundAnimationType>("none");
  const [backgroundPosition, setBackgroundPosition] = useState<BackgroundPosition>("full");
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");

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
    if (!script.trim()) {
      alert("Digite um texto primeiro!");
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
          script,
          videoDuration,
          platform,
          width,
          height,
          textStyle,
          backgroundAnimation,
          backgroundPosition,
          backgroundColor,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVideoResult(data);
      } else {
        // Remova esta linha: console.error("Erro:", data.error);
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

  return (

    <main className="min-h-screen bg-gray-950">

      <div className="max-w-7xl mx-auto p-6">

        <Header />

        <VideoSizeSelector
          platform={platform}
          setPlatform={setPlatform}
          width={width}
          height={height}
          setWidth={setWidth}
          setHeight={setHeight}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">

          {/* Sidebar */}

          <Card>

            <div className="space-y-4">

              {/* Texto */}

              <div className="border border-gray-800 rounded-lg overflow-hidden">

                <button
                  onClick={() =>
                    setOpenSection("text")
                  }
                  className="w-full text-left px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold flex justify-between items-center"
                >

                  Texto do vídeo

                  <span>

                    {openSection === "text"
                      ? "▲"
                      : "▼"}

                  </span>

                </button>

                {openSection === "text" && (

                  <div className="p-4 space-y-4 bg-gray-950">

                    <ScriptInput
                      value={script}
                      onChange={setScript}
                    />

                    <DurationInput
                      value={videoDuration}
                      onChange={
                        setVideoDuration
                      }
                    />

                  </div>

                )}

              </div>

              {/* Aparência */}

              <div className="border border-gray-800 rounded-lg overflow-hidden">

                <button
                  onClick={() =>
                    setOpenSection("style")
                  }
                  className="w-full text-left px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold flex justify-between items-center"
                >

                  Aparência do texto

                  <span>

                    {openSection === "style"
                      ? "▲"
                      : "▼"}

                  </span>

                </button>

                {openSection === "style" && (

                  <div className="p-4 bg-gray-950">

                    <TextStyleEditor
                      value={textStyle}
                      onChange={setTextStyle}
                      showStyle
                      showShadow={false}
                    />

                  </div>

                )}

              </div>

              {/* Sombra */}

              <div className="border border-gray-800 rounded-lg overflow-hidden">

                <button
                  onClick={() =>
                    setOpenSection("shadow")
                  }
                  className="w-full text-left px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold flex justify-between items-center"
                >

                  Sombra do texto

                  <span>

                    {openSection === "shadow"
                      ? "▲"
                      : "▼"}

                  </span>

                </button>

                {openSection === "shadow" && (

                  <div className="p-4 bg-gray-950">

                    <TextStyleEditor
                      value={textStyle}
                      onChange={setTextStyle}
                      showStyle={false}
                      showShadow
                    />

                  </div>

                )}

              </div>

              {/* Fundo Animado */}

              <div className="border border-gray-800 rounded-lg overflow-hidden">

                <button
                  onClick={() =>
                    setOpenSection("background")
                  }
                  className="w-full text-left px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold flex justify-between items-center"
                >

                  🎨 Fundo Animado

                  <span>

                    {openSection === "background"
                      ? "▲"
                      : "▼"}

                  </span>

                </button>

                {openSection === "background" && (

                  <div className="p-4 bg-gray-950">

                    <BackgroundSelector
                      animationType={backgroundAnimation}
                      position={backgroundPosition}
                      backgroundColor={backgroundColor}
                      onAnimationChange={setBackgroundAnimation}
                      onPositionChange={setBackgroundPosition}
                      onColorChange={setBackgroundColor}
                    />

                  </div>

                )}

              </div>

              <GenerateButton
                onClick={handleGenerateVideo}
                disabled={isGenerating || isDownloading || script.trim().length === 0}
                isGenerating={isGenerating}
                label="🎬 Gerar Vídeo"
              />

            </div>

          </Card>

          {/* Preview */}

          <Card>

            <div className="space-y-8">

              <h2 className="text-2xl font-bold text-white">

                Preview

              </h2>

              <LiveTextPreview
                text={script}
                width={width}
                height={height}
                style={textStyle}
                backgroundAnimation={backgroundAnimation}
                backgroundPosition={backgroundPosition}
                backgroundColor={backgroundColor}
              />

              {isGenerating && (
                <ProgressBar />
              )}

              <ResultCard
                result={videoResult}
                onDownload={handleDownloadVideo}
                isDownloading={isDownloading}
                onDelete={() => setVideoResult(null)}
              />

              {!videoResult &&
                !isGenerating && (

                  <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-700 h-52">

                    <span className="text-gray-500">

                      Gere um vídeo para visualizar o resultado.

                    </span>

                  </div>

                )}

            </div>

          </Card>

        </div>

      </div>

    </main>

  );

}