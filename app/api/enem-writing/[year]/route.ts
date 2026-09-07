import { getEnemWritingPrompt } from "../../../enem-writing-data";

export async function GET(_request: Request, context: { params: Promise<{ year: string }> }) {
  const { year } = await context.params;
  const prompt = /^202[0-5]$/.test(year) ? getEnemWritingPrompt(Number(year)) : undefined;
  if (!prompt) return new Response("Edição não disponível.", { status: 404 });
  // A origem não libera CORS. Só transmitimos URLs fixas das seis provas públicas.
  const sources = [prompt.pdfUrl, prompt.fallbackPdfUrl].filter((url): url is string => Boolean(url));
  for (const url of sources) try {
    const response = await fetch(url, { signal: AbortSignal.timeout(sources.length > 1 ? 12_000 : 25_000) });
    if (!response.ok || !response.body || !response.headers.get("content-type")?.includes("pdf")) {
      await response.body?.cancel();
      continue;
    }
    return new Response(response.body, { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="enem-${year}-dia-1.pdf"`,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch { /* Uma cópia verificada pode continuar disponível se a origem falhar. */ }
  return new Response("Não foi possível consultar a prova agora. Tente novamente.", { status: 502, headers: { "Cache-Control": "no-store" } });
}
