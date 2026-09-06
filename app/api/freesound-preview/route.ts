// app/api/freesound-preview/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const soundId = searchParams.get('id');
    const quality = searchParams.get('quality') || 'hq';

    if (!soundId) {
      return NextResponse.json(
        { error: "ID do som não fornecido" },
        { status: 400 }
      );
    }

    // CORRIGIDO: Usar a URL de preview correta do Freesound
    // O formato correto é: /data/previews/{soundId}/{soundId}_preview-hq.mp3
    // Mas às vezes o ID é muito grande e precisa ser dividido por 1000 para a pasta
    const soundIdNum = parseInt(soundId);
    const folder = Math.floor(soundIdNum / 1000);

    const previewUrls = [
      // Tentar primeiro com a pasta correta (mais comum)
      `https://freesound.org/data/previews/${folder}/${soundId}_preview-hq.mp3`,
      `https://freesound.org/data/previews/${folder}/${soundId}_preview-lq.mp3`,
      `https://freesound.org/data/previews/${folder}/${soundId}_preview-hq.ogg`,
      `https://freesound.org/data/previews/${folder}/${soundId}_preview-lq.ogg`,
      // Fallback: sem pasta (alguns IDs mais antigos)
      `https://freesound.org/data/previews/${soundId}_preview-hq.mp3`,
      `https://freesound.org/data/previews/${soundId}_preview-lq.mp3`,
    ];

    console.log(`🎵 Tentando preview para ID: ${soundId}`);

    // Tentar cada URL até encontrar uma que funcione
    for (let i = 0; i < previewUrls.length; i++) {
      const url = previewUrls[i];
      try {
        console.log(`🔄 Tentando (${i + 1}/${previewUrls.length}): ${url}`);

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'audio/*',
          },
          signal: AbortSignal.timeout(15000),
        });

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const headers = new Headers();

          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
          headers.set('Access-Control-Allow-Headers', 'Content-Type');
          headers.set('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
          headers.set('Content-Length', buffer.byteLength.toString());

          console.log(`✅ Preview encontrado: ${url} (${buffer.byteLength} bytes)`);
          return new NextResponse(buffer, {
            status: 200,
            headers: headers,
          });
        }
      } catch (e) {
        console.log(`⚠️ Falha na tentativa ${i + 1}: ${e instanceof Error ? e.message : 'Unknown error'}`);
        continue;
      }
    }

    // Se chegou aqui, nenhuma URL funcionou
    console.error(`❌ Nenhum preview encontrado para o ID: ${soundId}`);
    return NextResponse.json(
      { error: "Preview não disponível" },
      { status: 404 }
    );

  } catch (error) {
    console.error("❌ Erro no proxy preview:", error);
    return NextResponse.json(
      { error: "Erro ao carregar preview" },
      { status: 500 }
    );
  }
}

// Suporte a OPTIONS para CORS
export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return new NextResponse(null, {
    status: 204,
    headers: headers,
  });
}