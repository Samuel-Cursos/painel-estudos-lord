"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  Question,
  QuestionSegment,
  QuestionSubject,
  questionChapters,
  questions,
} from "./question-bank-data";
import { firestore } from "./firebase-client";
import { isOwner, PROTECTED_PDF_CHUNKS, PROTECTED_PDF_META_DOC } from "./access-control";
import PracticeLibrary from "./practice-library";
import { isHighSchool, yearLabel, type SchoolYear } from "./school-data";

export type QuestionAttempt = {
  answer?: string;
  note?: string;
  answeredAt?: string;
  review?: boolean;
};

export type QuestionProgressMap = Record<string, QuestionAttempt>;
export type QuestionFocus = { subject: QuestionSubject; topic: string; nonce: number };

type Props = {
  schoolYear: SchoolYear;
  progress: QuestionProgressMap;
  focus?: QuestionFocus | null;
  user: User | null;
  pdfAllowed: boolean;
  pdfEnabled: boolean;
  publicPracticeEnabled: boolean;
  dailyQuestionGoal: number;
  onProgressChange: (next: QuestionProgressMap) => void;
  onNotice: (message: string) => void;
};

type PdfState = "loading" | "ready" | "error";
type StatusFilter = "all" | "pending" | "answered" | "review";
type BankMode = "main" | "quick";

const subjectMeta: Record<QuestionSubject, { name: string; short: string; color: string; icon: string }> = {
  math: { name: "Matemática", short: "MAT", color: "#477ee8", icon: "∑" },
  biology: { name: "Biologia", short: "BIO", color: "#35a873", icon: "DNA" },
  chemistry: { name: "Química", short: "QUI", color: "#9a6fe8", icon: "Qm" },
  physics: { name: "Física", short: "FIS", color: "#e56b61", icon: "F=" },
};

const topicAliases: Record<QuestionSubject, Array<[string[], string]>> = {
  math: [
    [["razão", "proporção"], "Razão e Proporção"], [["porcent"], "Porcentagem"],
    [["unidade", "medida"], "Conversão de Unidades"], [["gráfico", "tabela"], "Gráficos e Tabelas"],
    [["escala"], "Escalas"], [["vazão"], "Vazão"], [["equação", "sistema"], "Equações e Sistemas"],
    [["1º grau", "função afim", "linear"], "Função do 1º Grau"], [["2º grau", "quadrática"], "Função do 2º Grau"],
    [["exponencial"], "Função Exponencial"], [["estatística", "média", "mediana", "moda"], "Estatística"],
    [["área", "perímetro", "geometria plana"], "Área e Perímetro"], [["trigonom"], "Trigonometria"],
    [["volume", "geometria espacial"], "Volume"], [["projeção"], "Projeção Ortogonal"],
    [["analítica", "cartesiano", "reta"], "Geometria Analítica"], [["combinatória"], "Análise Combinatória"],
    [["logarit"], "Logaritmo"], [["juros simples"], "Juros Simples"], [["juros compost"], "Juros Compostos"],
    [["probabilidade"], "Probabilidade"],
  ],
  biology: [
    [["ecologia", "ambient", "ecossistema"], "Ecologia e Problemas Ambientais"], [["citologia", "célula"], "Citologia"],
    [["metabolismo", "respiração", "fotossíntese"], "Metabolismo Energético"], [["fisiologia"], "Fisiologia"],
    [["genética", "dna", "hereditar"], "Genética"], [["evolução", "classificação"], "Evolução e Classificação dos Seres Vivos"],
    [["botânica", "planta"], "Botânica"], [["zoologia", "animal"], "Zoologia"], [["doença", "saúde"], "Doenças"],
  ],
  chemistry: [
    [["propriedade", "matéria"], "Propriedades da Matéria"], [["mistura", "separação"], "Separação de Misturas"],
    [["tabela periódica", "atomística", "átomo"], "Tabela Periódica e Atomística"],
    [["ligação", "geometria molecular", "polaridade"], "Ligações, Geometria Molecular e Polaridade"],
    [["estequiometr"], "Estequiometria"], [["inorgânica", "ácido", "base", "sal"], "Química Inorgânica"],
    [["solução", "concentração"], "Soluções"], [["radioativ"], "Radioatividade"],
    [["físico-química", "termoquímica", "cinética", "equilíbrio"], "Físico-Química"],
    [["ambient"], "Química Ambiental"], [["orgânica", "carbono"], "Química Orgânica"],
  ],
  physics: [
    [["energia", "trabalho", "potência"], "Energia e suas Transformações"], [["termologia", "calor", "temperatura"], "Termologia"],
    [["onda", "som", "ondulatória"], "Ondulatória"], [["cinemática", "movimento", "velocidade"], "Cinemática"],
    [["dinâmica", "força", "newton"], "Dinâmica"], [["eletrostática", "carga"], "Eletrostática"],
    [["eletrodinâmica", "circuito", "corrente", "resistor"], "Eletrodinâmica"],
    [["eletromagnet"], "Eletromagnetismo"], [["hidrostática", "pressão"], "Hidrostática"], [["óptica", "luz"], "Óptica"],
  ],
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function isQuestionAnswered(attempt?: QuestionAttempt) {
  return Boolean(attempt?.answer || attempt?.note?.trim());
}

function localDateKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function chapterForTopic(subject: QuestionSubject, topic: string) {
  const normalized = normalize(topic);
  const match = topicAliases[subject].find(([aliases]) => aliases.some((alias) => normalized.includes(normalize(alias))));
  return questionChapters.find((chapter) => chapter.subject === subject && chapter.title === match?.[1])
    ?? questionChapters.find((chapter) => chapter.subject === subject)!;
}

function QuestionCanvas({ pdf, segment }: { pdf: PDFDocumentProxy; segment: QuestionSegment }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<unknown> } | null = null;
    async function render() {
      try {
        const page = await pdf.getPage(segment.page);
        if (cancelled || !canvasRef.current) return;
        const scale = Math.min(2.2, Math.max(1.7, window.devicePixelRatio || 1));
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        canvas.width = Math.ceil(segment.width * scale);
        canvas.height = Math.ceil(segment.height * scale);
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
          transform: [1, 0, 0, 1, -segment.x * scale, -segment.y * scale],
        });
        await renderTask.promise;
      } catch (error) {
        if (!cancelled && !(error instanceof Error && error.name === "RenderingCancelledException")) setFailed(true);
      }
    }
    void render();
    return () => { cancelled = true; renderTask?.cancel(); };
  }, [pdf, segment]);

  if (failed) return <div className="question-render-error">Não consegui desenhar este trecho. Feche e abra a questão novamente.</div>;
  return <canvas ref={canvasRef} className="question-canvas" aria-label={`Trecho da página ${segment.page} do caderno`} />;
}

function QuestionDocument({ pdf, question }: { pdf: PDFDocumentProxy; question: Question }) {
  return <div className="question-document">{question.segments.map((segment, index) => <QuestionCanvas key={`${question.id}-${segment.page}-${segment.x}-${index}`} pdf={pdf} segment={segment} />)}</div>;
}

let questionTextPromise: Promise<typeof import("./question-text-data")> | null = null;

function TextQuestion({ question }: { question: Question }) {
  const [content, setContent] = useState<{ text: string; needsVisual: boolean } | null>(null);
  useEffect(() => {
    let active = true;
    questionTextPromise ??= import("./question-text-data");
    void questionTextPromise.then((module) => { if (active) setContent(module.questionText[question.id] ?? null); });
    return () => { active = false; };
  }, [question.id]);
  if (!content) return <div className="question-pdf-placeholder"><span>TXT</span><strong>Preparando o enunciado</strong><p>A versão em texto está sendo carregada.</p></div>;
  return <div className="text-question-document">{content?.needsVisual && <div className="visual-dependency"><strong>Questão originalmente visual</strong><p>O texto foi preservado, mas gráfico, mapa, tabela ou figura não aparece nesta versão. Quem receber permissão do ADM vê o trecho original do PDF.</p></div>}<pre>{content?.text || `Questão ${question.number} · ${question.chapter}\nO texto desta questão não pôde ser extraído com segurança. Use a questão rápida da matéria acima.`}</pre></div>;
}

export default function QuestionBank({ schoolYear, progress, focus, user, pdfAllowed, pdfEnabled, publicPracticeEnabled, dailyQuestionGoal, onProgressChange, onNotice }: Props) {
  const initialChapter = focus ? chapterForTopic(focus.subject, focus.topic) : questionChapters[0];
  const initialQuestion = focus
    ? questions.find((question) => question.chapterId === initialChapter.id && !isQuestionAnswered(progress[question.id]))
      ?? questions.find((question) => question.chapterId === initialChapter.id)
      ?? null
    : null;
  const [subject, setSubject] = useState<QuestionSubject>(focus?.subject ?? "math");
  const [chapterId, setChapterId] = useState(initialChapter.id);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(initialQuestion);
  const [visibleCount, setVisibleCount] = useState(80);
  const [pdfState, setPdfState] = useState<PdfState>(pdfAllowed && pdfEnabled ? "loading" : "ready");
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [pdfReloadKey, setPdfReloadKey] = useState(0);
  const [pdfError, setPdfError] = useState("");
  const [noteDraft, setNoteDraft] = useState(initialQuestion ? progress[initialQuestion.id]?.note ?? "" : "");
  const [bankMode, setBankMode] = useState<BankMode>("main");
  const showSame = isOwner(user?.email) || isHighSchool(schoolYear);

  const chapters = useMemo(() => questionChapters.filter((chapter) => chapter.subject === subject), [subject]);
  const answeredCount = questions.filter((question) => isQuestionAnswered(progress[question.id])).length;
  const todayKey = localDateKey();
  const answeredToday = Object.values(progress).filter((attempt) => attempt.answeredAt?.slice(0, 10) === todayKey).length;

  const filtered = useMemo(() => {
    const query = normalize(search.trim());
    return questions.filter((question) => {
      if (question.subject !== subject || question.chapterId !== chapterId) return false;
      const attempt = progress[question.id];
      if (status === "answered" && !isQuestionAnswered(attempt)) return false;
      if (status === "pending" && isQuestionAnswered(attempt)) return false;
      if (status === "review" && !attempt?.review) return false;
      return !query || normalize(`${question.number} ${question.source} ${question.chapter}`).includes(query);
    });
  }, [chapterId, progress, search, status, subject]);

  useEffect(() => {
    if (bankMode !== "main" || !showSame || !user || !pdfAllowed || !pdfEnabled) {
      return;
    }
    let active = true;
    let document: PDFDocumentProxy | null = null;
    const loadingTimer = window.setTimeout(() => setPdfState("loading"), 0);
    async function loadProtectedPdf() {
      try {
        setPdfError("");
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const metadataSnapshot = await getDoc(doc(firestore, "protectedMaterials", PROTECTED_PDF_META_DOC));
        if (!metadataSnapshot.exists()) throw new Error("PDF ainda não enviado");
        const metadata = metadataSnapshot.data();
        const chunkCount = Number(metadata.chunkCount);
        const totalSize = Number(metadata.size);
        const version = String(metadata.version);
        if (!Number.isInteger(chunkCount) || chunkCount < 1 || chunkCount > 64 || totalSize < 1 || totalSize > 25 * 1024 * 1024) throw new Error("Metadados inválidos");

        const bytes = new Uint8Array(totalSize);
        let offset = 0;
        for (let index = 0; index < chunkCount; index += 1) {
          const snapshot = await getDoc(doc(firestore, PROTECTED_PDF_CHUNKS, `${version}-${String(index).padStart(3, "0")}`));
          if (!snapshot.exists()) throw new Error("Parte do PDF ausente");
          const storedBytes = snapshot.data().bytes as { toUint8Array?: () => Uint8Array } | undefined;
          if (!storedBytes?.toUint8Array) throw new Error("Parte do PDF inválida");
          const chunk = storedBytes.toUint8Array();
          bytes.set(chunk, offset);
          offset += chunk.length;
        }
        if (offset !== totalSize) throw new Error("PDF incompleto");
        document = await pdfjs.getDocument({ data: bytes }).promise;
        if (!active) {
          void document.destroy();
          return;
        }
        setPdfDocument(document);
        setPdfState("ready");
      } catch (reason) {
        if (!active) return;
        console.error("Clareia: falha ao abrir o PDF protegido", reason);
        setPdfDocument(null);
        setPdfState("error");
        const code = typeof reason === "object" && reason && "code" in reason ? String(reason.code) : "";
        const message = reason instanceof Error ? reason.message : "Falha desconhecida";
        setPdfError(code.includes("permission-denied") ? "O Firebase bloqueou a leitura. Publique as regras novas ou libere esta conta no ADM." : message.includes("ainda não enviado") ? "A apostila ainda não foi enviada. Entre no ADM, abra Conteúdo e envie o PDF." : message.includes("ausente") || message.includes("incompleto") ? "O envio da apostila está incompleto. Envie o PDF novamente pelo ADM." : "O leitor não conseguiu montar o arquivo. Tente novamente.");
        onNotice(code.includes("permission-denied") ? "O Firebase ainda não liberou esta conta para a apostila." : "A apostila não carregou. Veja o diagnóstico exibido no caderno.");
      }
    }
    void loadProtectedPdf();
    return () => { active = false; window.clearTimeout(loadingTimer); if (document) void document.destroy(); };
  }, [bankMode, onNotice, pdfAllowed, pdfEnabled, pdfReloadKey, showSame, user]);

  function openQuestion(question: Question | null) {
    if (!question) return;
    setNoteDraft(progress[question.id]?.note ?? "");
    setActiveQuestion(question);
  }

  function updateAttempt(question: Question, changes: Partial<QuestionAttempt>) {
    const next = {
      ...progress,
      [question.id]: { ...progress[question.id], ...changes },
    };
    onProgressChange(next);
  }

  function chooseAnswer(choice: string) {
    if (!activeQuestion) return;
    updateAttempt(activeQuestion, { answer: choice, answeredAt: new Date().toISOString() });
    onNotice(`Alternativa ${choice} salva. Como o PDF não traz gabarito, ela ficou registrada para conferência.`);
  }

  function nextQuestion() {
    if (!activeQuestion) return;
    const sameChapter = questions.filter((question) => question.chapterId === activeQuestion.chapterId);
    const currentIndex = sameChapter.findIndex((question) => question.id === activeQuestion.id);
    const next = sameChapter.slice(currentIndex + 1).find((question) => !isQuestionAnswered(progress[question.id]))
      ?? sameChapter.find((question) => !isQuestionAnswered(progress[question.id]))
      ?? sameChapter[(currentIndex + 1) % sameChapter.length];
    openQuestion(next);
  }

  const currentChapter = questionChapters.find((chapter) => chapter.id === chapterId)!;
  const activeAttempt = activeQuestion ? progress[activeQuestion.id] ?? {} : {};

  return <div className="page-content question-page">
    {showSame ? <div className="same-bank-section">
    <section className="question-hero">
      <div>
        <span className="eyebrow">CADERNO SAME · 1.000 QUESTÕES</span>
        <h2>Pratique sem procurar.</h2>
        <p>400 questões de Matemática e 600 de Biologia, Química e Física. Respostas, anotações e revisão ficam salvas.</p>
      </div>
      <div className="question-stats">
        <article><strong>{answeredCount}</strong><span>respondidas</span></article>
        <article><strong>{1000 - answeredCount}</strong><span>na fila</span></article>
        <article><strong>{answeredToday}/{dailyQuestionGoal}</strong><span>meta de hoje</span></article>
      </div>
    </section>

    <nav className="question-mode-tabs" aria-label="Tipo de questões">
      <button className={bankMode === "main" ? "active" : ""} onClick={() => setBankMode("main")}><span>1.000</span><div><strong>Banco principal</strong><small>Matemática, Biologia, Química e Física</small></div></button>
      <button className={bankMode === "quick" ? "active" : ""} onClick={() => setBankMode("quick")}><span>⚡</span><div><strong>Questões rápidas</strong><small>Treinos curtos com correção imediata</small></div></button>
    </nav>

    {bankMode === "main" ? <>

    {!pdfAllowed && <section className="access-mode-banner"><span>TXT</span><div><strong>Você está usando a versão em texto</strong><p>As 1.000 questões ficam disponíveis na sua conta. O PDF original aparece apenas para o dono e usuários liberados pelo ADM.</p></div></section>}
    {pdfAllowed && !pdfEnabled && <section className="access-mode-banner"><span>OFF</span><div><strong>PDF pausado pelo ADM</strong><p>As questões continuam disponíveis em texto.</p></div></section>}

    {pdfState === "error" && <section className="pdf-setup error">
      <div className="pdf-setup-icon">PDF</div>
      <div><span className="eyebrow">CADERNO INCLUÍDO</span><h3>Não consegui carregar o arquivo</h3><p>{pdfError || "Verifique sua conexão e tente abrir novamente."}</p></div>
      <button className="primary" onClick={() => setPdfReloadKey((key) => key + 1)}>Tentar novamente</button>
    </section>}

    <div className="question-workspace">
      <aside className="question-filters">
        <span className="filter-label">MATÉRIAS</span>
        <div className="question-subject-tabs">{(Object.keys(subjectMeta) as QuestionSubject[]).map((id) => <button key={id} className={subject === id ? "active" : ""} style={{ "--accent": subjectMeta[id].color } as React.CSSProperties} onClick={() => { setSubject(id); setChapterId(questionChapters.find((chapter) => chapter.subject === id)!.id); setVisibleCount(80); }}><b>{subjectMeta[id].icon}</b><span>{subjectMeta[id].name}</span><small>{questions.filter((question) => question.subject === id).length}</small></button>)}</div>
        <span className="filter-label chapter-label">CAPÍTULOS</span>
        <div className="question-chapter-list">{chapters.map((chapter) => { const done = questions.filter((question) => question.chapterId === chapter.id && (progress[question.id]?.answer || progress[question.id]?.note?.trim())).length; return <button key={chapter.id} className={chapterId === chapter.id ? "active" : ""} onClick={() => { setChapterId(chapter.id); setVisibleCount(80); }}><span>{chapter.number}</span><div><strong>{chapter.title}</strong><small>{done} de {chapter.count}</small></div></button>; })}</div>
      </aside>

      <main className="question-list-panel">
        <div className="question-list-head"><div><span className="eyebrow">CAPÍTULO {currentChapter.number}</span><h3>{currentChapter.title}</h3><p>Questões {currentChapter.start}–{currentChapter.end} · {subjectMeta[subject].name}</p></div><button className="primary" onClick={() => openQuestion(filtered.find((question) => !isQuestionAnswered(progress[question.id])) ?? filtered[0] ?? null)}>Começar próxima →</button></div>
        <div className="question-toolbar"><input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(80); }} placeholder="Buscar número, ano ou capítulo" /><div>{(["all", "pending", "answered", "review"] as StatusFilter[]).map((item) => <button key={item} className={status === item ? "active" : ""} onClick={() => { setStatus(item); setVisibleCount(80); }}>{item === "all" ? "Todas" : item === "pending" ? "Não feitas" : item === "answered" ? "Respondidas" : "Revisar"}</button>)}</div></div>
        <div className="question-grid">{filtered.slice(0, visibleCount).map((question) => { const attempt = progress[question.id]; return <button key={question.id} className={`question-card ${attempt?.answer || attempt?.note?.trim() ? "answered" : ""} ${attempt?.review ? "review" : ""}`} onClick={() => openQuestion(question)}><span className="question-number">{attempt?.answer ? attempt.answer : question.number}</span><div><small>QUESTÃO {question.number} · {question.source || "ENEM"}</small><strong>{question.chapter}</strong><em>{attempt?.answer ? `Alternativa ${attempt.answer} marcada` : attempt?.note?.trim() ? "Resposta escrita salva" : "Ainda não respondida"}</em></div><b>{attempt?.review ? "★" : "→"}</b></button>; })}</div>
        {!filtered.length && <div className="question-empty"><span>○</span><strong>Nenhuma questão neste filtro.</strong><p>Troque o status ou limpe a busca.</p></div>}
        {visibleCount < filtered.length && <button className="load-more" onClick={() => setVisibleCount((count) => count + 80)}>Mostrar mais questões</button>}
      </main>
    </div>

    {activeQuestion && <div className="modal-backdrop question-backdrop" role="presentation" onMouseDown={() => setActiveQuestion(null)}><section className="question-modal" role="dialog" aria-modal="true" aria-label={`Questão ${activeQuestion.number} de ${subjectMeta[activeQuestion.subject].name}`} onMouseDown={(event) => event.stopPropagation()} style={{ "--accent": subjectMeta[activeQuestion.subject].color } as React.CSSProperties}>
      <button className="modal-close" aria-label="Fechar" onClick={() => setActiveQuestion(null)}>×</button>
      <header className="question-modal-head"><span className="question-modal-icon">{subjectMeta[activeQuestion.subject].icon}</span><div><span className="eyebrow">{subjectMeta[activeQuestion.subject].name} · CAPÍTULO {activeQuestion.chapterNumber}</span><h2>Questão {activeQuestion.number}</h2><p>{activeQuestion.chapter} · {activeQuestion.source || "ENEM"}</p></div><button className={`review-toggle ${activeAttempt.review ? "active" : ""}`} onClick={() => updateAttempt(activeQuestion, { review: !activeAttempt.review })}>{activeAttempt.review ? "★ Revisar" : "☆ Marcar para revisão"}</button></header>

      <div className="question-solve-layout">
        <div className="question-paper">
          {pdfAllowed && pdfEnabled ? (pdfDocument ? <QuestionDocument pdf={pdfDocument} question={activeQuestion} /> : <div className="question-pdf-placeholder"><span>{pdfState === "loading" ? "…" : "PDF"}</span><strong>{pdfState === "loading" ? "Abrindo seu PDF protegido" : "Não consegui abrir o caderno"}</strong><p>{pdfState === "loading" ? "O Firebase está verificando sua permissão." : "Confirme no ADM se o arquivo já foi enviado e sua conta está liberada."}</p></div>) : <TextQuestion key={activeQuestion.id} question={activeQuestion} />}
        </div>
        <aside className="answer-panel"><span className="eyebrow">SUA RESPOSTA</span><h3>Marque uma alternativa</h3><p>O material não inclui gabarito. Sua escolha será salva para você conferir depois.</p><div className="answer-options">{["A", "B", "C", "D", "E"].map((choice) => <button key={choice} className={activeAttempt.answer === choice ? "selected" : ""} onClick={() => chooseAnswer(choice)}><span>{choice}</span>{activeAttempt.answer === choice ? "Alternativa marcada" : `Escolher ${choice}`}</button>)}</div><label className="reasoning-box"><span>Raciocínio ou resposta escrita</span><textarea maxLength={1500} value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} onBlur={() => updateAttempt(activeQuestion, { note: noteDraft, answeredAt: noteDraft.trim() ? activeAttempt.answeredAt ?? new Date().toISOString() : activeAttempt.answeredAt })} placeholder="Escreva sua conta, justificativa ou resposta aqui…" /></label><small className="auto-save-note">A alternativa salva no clique. O texto salva ao sair da caixa.</small></aside>
      </div>
      <footer className="question-modal-actions"><button className="secondary" onClick={() => setActiveQuestion(null)}>Voltar ao caderno</button><div><span>{activeAttempt.answer || activeAttempt.note?.trim() ? "Resposta registrada" : "Ainda não respondida"}</span><button className="primary" onClick={nextQuestion}>Próxima do assunto →</button></div></footer>
    </section></div>}
    </> : <PracticeLibrary progress={progress} onProgressChange={onProgressChange} onNotice={onNotice} enabled={publicPracticeEnabled} />}
    </div> : <section className="same-locked-by-grade"><span>ENEM</span><div><strong>O caderno SAME aparece no Ensino Médio</strong><p>Você está no {yearLabel(schoolYear)}. Seu banco completo e o material adequado à sua série estão acima.</p></div></section>}
  </div>;
}
