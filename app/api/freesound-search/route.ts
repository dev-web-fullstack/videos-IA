// app/api/freesound-search/route.ts
import { NextResponse } from "next/server";
import {
  FREESOUND_CONFIG,
  buildSearchUrl,
  mapFreesoundResult,
  isFreesoundConfigured,
  popularTags,
} from "../../../lib/freesound";

export async function GET(req: Request) {
  try {
    // Verificar se a API está configurada
    if (!isFreesoundConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Freesound API não configurada. Adicione FREESOUND_API_KEY ao .env.local",
          results: [],
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sort = searchParams.get('sort') || 'score';
    const minDuration = parseInt(searchParams.get('minDuration') || '0');
    const maxDuration = Math.min(parseInt(searchParams.get('maxDuration') || '180'), 180);

    console.log(`🔍 Buscando no Freesound:`);
    console.log(`📝 Texto: "${query || 'todos'}"`);
    console.log(`📄 Página: ${page}, Tamanho: ${pageSize}`);
    console.log(`⏱️ Duração: ${minDuration}-${maxDuration}s (máx 3 min)`);

    // Construir URL
    const url = buildSearchUrl({
      query: query || 'background music',
      page,
      pageSize: Math.min(pageSize, 50),
      sort: sort as any,
      minDuration,
      maxDuration,
    });

    console.log(`🔗 URL: ${url}`);

    // Fazer requisição
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${FREESOUND_CONFIG.API_KEY}`,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    console.log(`📡 Resposta: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`❌ Erro na API: ${response.status}`);
      let errorText = '';
      try {
        errorText = await response.text();
        console.error(`Detalhes: ${errorText}`);
      } catch (e) { }

      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: "Chave da API Freesound inválida. Verifique sua FREESOUND_API_KEY.",
            results: [],
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Erro na API Freesound: ${response.status} ${response.statusText}`,
          results: [],
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Mapear resultados
    const results = data.results?.map(mapFreesoundResult) || [];

    console.log(`✅ Encontrados ${data.count} resultados, retornando ${results.length}`);

    return NextResponse.json({
      success: true,
      count: data.count || 0,
      next: data.next,
      previous: data.previous,
      results: results,
      suggestions: results.length === 0 ? popularTags : undefined,
    });

  } catch (error) {
    console.error("❌ Erro ao buscar no Freesound:", error);

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        results: [],
        suggestion: "Tente uma busca diferente ou verifique sua conexão",
      },
      { status: 500 }
    );
  }
}