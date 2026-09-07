"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import type { EnemWritingPrompt } from "./enem-writing-data";
import { readablePdfText } from "./enem-writing-review";

type Props = { prompt: EnemWritingPrompt; onSupportText: (text: string) => void };

export default function EnemWritingReader({ prompt, onSupportText }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState<"page" | "text">("page");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [content, setContent] = useState("");
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [width, setWidth] = useState(560);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loading: PDFDocumentLoadingTask | undefined;
    onSupportText("");
    setState("loading");
    setPdf(null);
    async function openProposal() {
      try {
        const pdfjs = await import("pdfjs-dist");
        if (cancelled) return;
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        loading = pdfjs.getDocument({ url: `/api/enem-writing/${prompt.year}`, disableRange: true });
        const document = await loading.promise;
        if (cancelled) return;
        const page = await document.getPage(prompt.page);
        const extracted = await page.getTextContent();
        if (cancelled) return;
        let text = "";
        for (const item of extracted.items) if ("str" in item) text += item.str + (item.hasEOL ? "\n" : " ");
        const readable = readablePdfText(text) ? text : "";
        setContent(readable);
        onSupportText(readable);
        setPdf(document);
      } catch {
        if (!cancelled) { setState("error"); onSupportText(""); }
      }
    }
    void openProposal();
    return () => { cancelled = true; void loading?.destroy(); };
  }, [prompt, attempt, onSupportText]);

  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;
    let rendering: RenderTask | undefined;
    async function drawPage() {
      try {
        const page = await pdf!.getPage(prompt.page);
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;
        const viewport = page.getViewport({ scale: 1 });
        const display = page.getViewport({ scale: (Math.max(260, width) * zoom) / viewport.width });
        // Limita a memória do canvas em telas grandes com ampliação alta.
        const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(8_000_000 / (display.width * display.height)));
        canvas.width = Math.ceil(display.width * ratio);
        canvas.height = Math.ceil(display.height * ratio);
        canvas.style.width = `${display.width}px`;
        canvas.style.height = `${display.height}px`;
        rendering = page.render({ canvas, viewport: display, transform: [ratio, 0, 0, ratio, 0, 0] });
        await rendering.promise;
        if (!cancelled) setState("ready");
      } catch { if (!cancelled) setState("error"); }
    }
    void drawPage();
    return () => { cancelled = true; rendering?.cancel(); };
  }, [pdf, prompt.page, width, zoom]);

  return <section className="enem-proposal-reader section-block" aria-label={`Textos motivadores do ENEM ${prompt.year}`}>
    <div className="enem-section-heading"><div><span className="eyebrow">PROPOSTA OFICIAL · INEP</span><h3>Leia os textos motivadores</h3></div><a href={prompt.sourceUrl} target="_blank" rel="noreferrer">Fonte oficial ↗</a></div>
    <div className="enem-reader-toolbar">
      <div><button type="button" aria-pressed={mode === "page"} onClick={() => setMode("page")}>Página da prova</button><button type="button" aria-pressed={mode === "text"} onClick={() => setMode("text")}>Texto acessível</button></div>
      {mode === "page" && <div><button type="button" aria-label="Reduzir página" disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, value - 0.5))}>−</button><span>{Math.round(zoom * 100)}%</span><button type="button" aria-label="Ampliar página" disabled={zoom >= 4} onClick={() => setZoom((value) => Math.min(4, value + 0.5))}>＋</button></div>}
    </div>
    <div ref={containerRef} className="enem-reader-container" aria-busy={state === "loading"}>
      {state === "loading" && <p className="enem-reader-status" role="status">Carregando a página do acervo do Inep…</p>}
      {state === "error" && <div className="enem-reader-status" role="alert"><p>Não foi possível abrir os textos de apoio agora. Seu rascunho continua disponível.</p><button type="button" className="secondary" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</button><a href={`${prompt.pdfUrl}#page=${prompt.page}`} target="_blank" rel="noreferrer">Abrir o PDF original ↗</a></div>}
      <div className="enem-page-scroll" hidden={mode !== "page" || state !== "ready"} tabIndex={0} aria-label="Página da proposta. Use Ampliar e role para ler."><canvas ref={canvasRef} role="img" aria-label={`Proposta e textos motivadores do ENEM ${prompt.year}. A leitura textual está disponível em Texto acessível.`} /></div>
      {mode === "text" && state === "ready" && <div className="enem-accessible-text">{content ? <><p className="enem-reader-hint">Texto extraído do PDF. Para gráficos e imagens, consulte “Página da prova”.</p><div>{content}</div></> : <p>Este PDF não permite uma extração de texto legível. Os textos motivadores completos continuam disponíveis em “Página da prova”, com ampliação.</p>}</div>}
    </div>
    <p className="enem-reader-hint">Caderno oficial, página {prompt.page}. Amplie a página para ler detalhes. Use a coletânea como apoio e desenvolva seu próprio ponto de vista.</p>
  </section>;
}
