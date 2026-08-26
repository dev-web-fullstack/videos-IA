// app/api/generate-audio/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { ensureAudioFolder, cleanAudioFolder } from "../../../lib/utils";

// Estilos disponíveis
export const styleOptions = [
  { value: "relaxing", label: "🧘 Relaxante" },
  { value: "energetic", label: "⚡ Energético" },
  { value: "cinematic", label: "🎬 Cinematográfico" },
  { value: "ambient", label: "🌊 Ambiental" },
  { value: "uplifting", label: "🌟 Elevado" },
  { value: "gospel", label: "✝️ Gospel" },
  { value: "nature", label: "🌿 Natureza" },
  { value: "romantic", label: "❤️ Romântico" },
];

export async function POST(req: Request) {
  try {
    // Garantir que a pasta existe
    ensureAudioFolder();
    cleanAudioFolder();

    const body = await req.json();
    const { duration = 30, style = "relaxing" } = body;

    // Validar estilo
    const validStyles = styleOptions.map(s => s.value);
    const finalStyle = validStyles.includes(style) ? style : "relaxing";

    // Gerar nome único com timestamp para evitar conflitos
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const uniqueId = `${timestamp}-${random}`;

    // USAR APENAS FALLBACK (WAV) - pois funciona!
    const fileName = `audio-${uniqueId}.wav`;
    const filePath = path.join(process.cwd(), "public", "audio", fileName);

    console.log(`🎵 Gerando áudio (fallback) - Estilo: ${finalStyle}`);
    console.log(`📁 Arquivo: ${fileName}`);

    // Garantir que o arquivo não existe
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) { }
    }

    // Gerar áudio local usando wavefile
    const { WaveFile } = await import('wavefile');
    const sampleRate = 44100;
    const numSamples = Math.floor(Math.min(duration, 30) * sampleRate);
    const samples = new Float32Array(numSamples);

    // Gerar notas musicais para diferentes estilos
    let notes: number[] = [];
    let noteDuration = 0.4;

    switch (finalStyle) {
      case "relaxing":
        notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
        noteDuration = 0.5;
        break;
      case "energetic":
        notes = [440, 554.37, 659.25, 880, 659.25, 554.37];
        noteDuration = 0.2;
        break;
      case "cinematic":
        notes = [110, 146.83, 174.61, 220, 261.63, 329.63];
        noteDuration = 0.8;
        break;
      case "ambient":
        notes = [220, 261.63, 293.66, 329.63, 293.66, 261.63];
        noteDuration = 0.6;
        break;
      case "uplifting":
        notes = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33];
        noteDuration = 0.25;
        break;
      case "gospel":
        notes = [261.63, 329.63, 392.00, 523.25, 392.00, 261.63];
        noteDuration = 0.5;
        break;
      case "nature":
        notes = [220, 293.66, 349.23, 440, 349.23, 293.66];
        noteDuration = 0.6;
        break;
      case "romantic":
        notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
        noteDuration = 0.5;
        break;
      default:
        notes = [261.63, 293.66, 329.63, 392.00];
        noteDuration = 0.4;
    }

    let sampleIndex = 0;
    const noteSamples = Math.floor(noteDuration * sampleRate);

    while (sampleIndex < numSamples) {
      const note = notes[Math.floor(Math.random() * notes.length)];
      for (let i = 0; i < noteSamples && sampleIndex < numSamples; i++) {
        const t = i / sampleRate;
        const fade = i < 1000 ? i / 1000 : (i > noteSamples - 1000 ? (noteSamples - i) / 1000 : 1);

        // Adicionar harmônicos para som mais rico
        const value = fade * (
          Math.sin(2 * Math.PI * note * t) * 0.5 +
          Math.sin(2 * Math.PI * note * 1.5 * t) * 0.15 +
          Math.sin(2 * Math.PI * note * 2 * t) * 0.1
        );

        // Adicionar um pouco de ruído para estilos ambientais
        if (finalStyle === "ambient" || finalStyle === "nature" || finalStyle === "relaxing") {
          const noise = (Math.random() - 0.5) * 0.05;
          samples[sampleIndex] = value + noise;
        } else {
          samples[sampleIndex] = value;
        }
        sampleIndex++;
      }

      // Pequena pausa entre notas
      if (sampleIndex < numSamples) {
        const pauseSamples = Math.floor(0.05 * sampleRate);
        for (let i = 0; i < pauseSamples && sampleIndex < numSamples; i++) {
          samples[sampleIndex] = 0;
          sampleIndex++;
        }
      }
    }

    const wav = new WaveFile();
    wav.fromScratch(1, sampleRate, '32f', samples);
    fs.writeFileSync(filePath, wav.toBuffer());

    const audioPath = `/audio/${fileName}`;
    const fileSize = fs.statSync(filePath).size;

    console.log(`✅ Áudio gerado: ${audioPath} (${(fileSize / 1024).toFixed(1)}KB)`);

    return NextResponse.json({
      success: true,
      audioPath,
      fileName,
      name: `Música - ${finalStyle}.wav`,
      duration: Math.min(duration, 30),
      style: finalStyle,
      size: fileSize,
    });

  } catch (error) {
    console.error("❌ Erro ao gerar áudio:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao gerar áudio"
      },
      { status: 500 }
    );
  }
}