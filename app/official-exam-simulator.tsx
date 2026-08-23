"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { areaLabels, type EnemExamData, type EnemQuestionData, type ExamAreaId } from "./enem-exam-data";

export type OfficialAreaResult = { correct: number; wrong: number; blank: number; cancelled: number; total: number };
export type OfficialExamResult = {
  correct: number;
  wrong: number;
  blank: number;
  cancelled: number;
  total: number;
  gradedTotal: number;
  areas: Record<ExamAreaId, OfficialAreaResult>;
  finishedAt: string;
};

export type SimulatorAnswerSheet = {
  answers: Record<string, string>;
  notes: string;
  updatedAt: string;
  elapsedSeconds?: number;
  currentQuestion?: number;
  flagged?: number[];
  status?: "in_progress" | "finished";
  result?: OfficialExamResult;
  startedAt?: string;
};

type Props = {
  year: number;
  sheet: SimulatorAnswerSheet;
  onChange: (next: SimulatorAnswerSheet) => void;
  onPersist: (next: SimulatorAnswerSheet) => void;
  onFinish: (result: OfficialExamResult, next: SimulatorAnswerSheet) => void;
  onClose: (next: SimulatorAnswerSheet) => void;
};

const areaIds: ExamAreaId[] = ["lc", "ch", "cn", "math"];

function formatTimer(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function resultFor(exam: EnemExamData, answers: Record<string, string>): OfficialExamResult {
  const areas = Object.fromEntries(areaIds.map((id) => [id, { correct: 0, wrong: 0, blank: 0, cancelled: 0, total: 0 }])) as Record<ExamAreaId, OfficialAreaResult>;
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  let cancelled = 0;
  for (const question of exam.questions) {
    const area = areas[question.area];
    area.total += 1;
    if (question.cancelled) {
      area.cancelled += 1;
      cancelled += 1;
    } else {
      const answer = answers[String(question.index)];
      if (!answer) {
        area.blank += 1;
        blank += 1;
      } else if (answer === question.correctAlternative) {
        area.correct += 1;
        correct += 1;
      } else {
        area.wrong += 1;
        wrong += 1;
      }
    }
  }
  return { correct, wrong, blank, cancelled, total: 180, gradedTotal: 180 - cancelled, areas, finishedAt: new Date().toISOString() };
}

function QuestionImage({ source, alt }: { source: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="exam-image-error">A imagem oficial não carregou. Verifique a conexão e tente novamente.</div>;
  // O acervo contém imagens oficiais com dimensões variáveis e URLs históricas.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={source} alt={alt} loading="eager" onError={() => setFailed(true)} />;
}

function QuestionContent({ question }: { question: EnemQuestionData }) {
  if (question.cancelled && !question.previewImage && !question.files.length) return <div className="cancelled-question-copy"><strong>Questão anulada pelo INEP</strong><p>Ela foi mantida na posição original, mas não entra no cálculo de acertos e erros.</p></div>;
  return <>
    {question.previewImage ? <div className="exam-question-preview"><QuestionImage source={question.previewImage} alt={`Questão ${question.index} do ENEM ${question.year}`} /></div> : <>
      {question.context && <div className="exam-question-context">{question.context}</div>}
      {question.files.length > 0 && <div className="exam-question-files">{question.files.map((file, index) => <QuestionImage key={`${file}-${index}`} source={file} alt={`Material da questão ${question.index}`} />)}</div>}
      {question.statement && <p className="exam-question-statement">{question.statement}</p>}
    </>}
  </>;
}

export default function OfficialExamSimulator({ year, sheet, onChange, onPersist, onFinish, onClose }: Props) {
  const initialSheet = useRef(sheet);
  const [exam, setExam] = useState<EnemExamData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [localSheet, setLocalSheet] = useState<SimulatorAnswerSheet>(() => ({ ...sheet, answers: { ...sheet.answers }, flagged: [...(sheet.flagged ?? [])] }));
  const [current, setCurrent] = useState(() => Math.min(180, Math.max(1, sheet.currentQuestion ?? 1)));
  const [elapsedSeconds, setElapsedSeconds] = useState(sheet.elapsedSeconds ?? 0);
  const [timerRunning, setTimerRunning] = useState(sheet.status !== "finished");
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const latestState = useRef({ sheet: localSheet, current, elapsedSeconds });

  useEffect(() => {
    latestState.current = { sheet: localSheet, current, elapsedSeconds };
  }, [current, elapsedSeconds, localSheet]);

  useEffect(() => {
    let active = true;
    void fetch(`/enem-exams/${year}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<EnemExamData>;
      })
      .then((data) => {
        if (!active) return;
        if (data.questions.length !== 180) throw new Error("A edição não contém as 180 questões.");
        setExam(data);
        if (!initialSheet.current.currentQuestion) {
          const firstPending = data.questions.find((question) => !question.cancelled && !initialSheet.current.answers[String(question.index)]);
          setCurrent(firstPending?.index ?? 1);
        }
      })
      .catch(() => { if (active) setLoadError("Não consegui carregar esta edição. Tente novamente em alguns segundos."); });
    return () => { active = false; };
  }, [year]);

  useEffect(() => {
    if (!timerRunning || localSheet.status === "finished") return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [localSheet.status, timerRunning]);

  function snapshot(overrides: Partial<SimulatorAnswerSheet> = {}) {
    return { ...localSheet, elapsedSeconds, currentQuestion: current, startedAt: localSheet.startedAt ?? new Date().toISOString(), ...overrides, updatedAt: new Date().toISOString() };
  }

  function commit(next: SimulatorAnswerSheet, persist = false) {
    setLocalSheet(next);
    onChange(next);
    if (persist) onPersist(next);
  }

  const close = useCallback(() => {
    const latest = latestState.current;
    setTimerRunning(false);
    onClose({
      ...latest.sheet,
      elapsedSeconds: latest.elapsedSeconds,
      currentQuestion: latest.current,
      startedAt: latest.sheet.startedAt ?? new Date().toISOString(),
      status: latest.sheet.status === "finished" ? "finished" : "in_progress",
      updatedAt: new Date().toISOString(),
    });
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") setCurrent((value) => Math.min(180, value + 1));
      if (event.key === "ArrowLeft") setCurrent((value) => Math.max(1, value - 1));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close]);

  const question = exam?.questions[current - 1] ?? null;
  const answered = Object.keys(localSheet.answers).filter((key) => localSheet.answers[key]).length;
  const cancelled = exam?.questions.filter((item) => item.cancelled).length ?? 0;
  const completed = answered + cancelled;
  const flagged = localSheet.flagged ?? [];
  const storedFinished = localSheet.status === "finished" && Boolean(localSheet.result);
  const finished = storedFinished && !reviewing;
  const chosen = question ? localSheet.answers[String(question.index)] ?? "" : "";
  const feedback = question && chosen ? (chosen === question.correctAlternative ? "correct" : "wrong") : "";
  const areaGroups = useMemo(() => exam ? areaIds.map((id) => ({ id, questions: exam.questions.filter((item) => item.area === id) })) : [], [exam]);

  function chooseAnswer(letter: string) {
    if (!question || question.cancelled || storedFinished) return;
    const answers = { ...localSheet.answers, [String(question.index)]: letter };
    commit(snapshot({ answers, status: "in_progress", result: undefined }), Object.keys(answers).length % 10 === 0);
  }

  function goTo(index: number) {
    const nextCurrent = Math.min(180, Math.max(1, index));
    setCurrent(nextCurrent);
    setNavigatorOpen(false);
    commit({ ...snapshot(), currentQuestion: nextCurrent });
  }

  function toggleFlag() {
    if (!question) return;
    const nextFlags = flagged.includes(question.index) ? flagged.filter((index) => index !== question.index) : [...flagged, question.index];
    commit(snapshot({ flagged: nextFlags }), true);
  }

  function finishExam() {
    if (!exam) return;
    const result = resultFor(exam, localSheet.answers);
    if (result.blank > 0 && !window.confirm(`Ainda há ${result.blank} questão(ões) sem resposta. Finalizar e corrigir mesmo assim?`)) return;
    setTimerRunning(false);
    const next = snapshot({ status: "finished", result });
    setLocalSheet(next);
    onFinish(result, next);
  }

  function retryExam() {
    if (!window.confirm(`Apagar as respostas e refazer o ENEM ${year}?`)) return;
    setCurrent(1);
    setElapsedSeconds(0);
    setTimerRunning(true);
    setReviewing(false);
    commit({ answers: {}, notes: "", updatedAt: new Date().toISOString(), currentQuestion: 1, flagged: [], elapsedSeconds: 0, status: "in_progress", startedAt: new Date().toISOString() }, true);
  }

  return <div className="exam-modal-backdrop" role="presentation" onMouseDown={close}>
    <section className="official-simulator" role="dialog" aria-modal="true" aria-label={`Prova do ENEM ${year}`} onMouseDown={(event) => event.stopPropagation()}>
      <header className="official-simulator-head">
        <div><span className="eyebrow">MODO PROVA · DENTRO DA CLAREIA</span><h2>ENEM {year}</h2><p>180 questões em sequência · progresso salvo automaticamente</p></div>
        <div className="exam-head-stats"><span><strong>{completed}</strong>/180 concluídas</span><span><strong>{formatTimer(elapsedSeconds)}</strong> de estudo</span><button className="modal-close simulator-close" aria-label="Salvar e fechar prova" onClick={close}>×</button></div>
      </header>

      {loadError ? <div className="exam-load-state error"><strong>Esta prova não abriu.</strong><p>{loadError}</p><button className="primary" onClick={() => window.location.reload()}>Tentar novamente</button></div> : !exam || !question ? <div className="exam-load-state"><span className="exam-loader" /><strong>Preparando as 180 questões…</strong><p>Carregando enunciados, imagens e gabarito.</p></div> : finished ? <div className="simulator-result-screen">
        <div className="simulator-result-summary"><span>RESULTADO AUTOMÁTICO</span><strong>{localSheet.result?.correct}<small>/{localSheet.result?.gradedTotal} acertos válidos</small></strong><p>{localSheet.result?.wrong} erros · {localSheet.result?.blank} em branco · {localSheet.result?.cancelled} anulada(s)</p></div>
        <div className="simulator-area-results">{areaIds.map((id) => { const area = localSheet.result?.areas[id]; return <article key={id}><span>{areaLabels[id]}</span><strong>{area?.correct ?? 0}<small> acertos</small></strong><p>{area?.wrong ?? 0} erros · {area?.blank ?? 0} em branco{area?.cancelled ? ` · ${area.cancelled} anulada(s)` : ""}</p></article>; })}</div>
        <div className="simulator-result-actions"><button className="secondary" onClick={() => { setReviewing(true); setCurrent(1); }}>Revisar questões</button><button className="danger-outline" onClick={retryExam}>Refazer prova</button><button className="primary" onClick={close}>Salvar e sair</button></div>
        <p className="tri-notice"><strong>Importante:</strong> este resultado mostra acertos brutos pelo gabarito oficial. A nota oficial do ENEM usa a TRI e não pode ser calculada somente pela quantidade de acertos.</p>
      </div> : <>
        <div className="official-simulator-toolbar">
          <button className="exam-navigator-toggle" onClick={() => setNavigatorOpen((value) => !value)}><span>☷</span> Mapa da prova <b>{answered}/180</b></button>
          <div className="simulator-completion"><i role="progressbar" aria-label="Progresso da prova" aria-valuemin={0} aria-valuemax={180} aria-valuenow={completed}><b style={{ width: `${(completed / 180) * 100}%` }} /></i><span>{answered} respondidas{cancelled ? ` · ${cancelled} anulada(s)` : ""}</span></div>
          <div className="simulator-timer"><strong>{formatTimer(elapsedSeconds)}</strong><button className="secondary" onClick={() => { setTimerRunning((value) => !value); commit(snapshot(), true); }}>{timerRunning ? "Pausar" : "Continuar"}</button></div>
        </div>

        <div className={`official-simulator-layout ${navigatorOpen ? "navigator-open" : ""}`}>
          <aside className="exam-question-navigator" aria-label="Mapa das 180 questões">
            <div className="exam-navigator-head"><div><strong>Mapa da prova</strong><small>Vá direto para qualquer questão</small></div><button aria-label="Fechar mapa" onClick={() => setNavigatorOpen(false)}>×</button></div>
            {areaGroups.map((group) => <section key={group.id}><h3>{areaLabels[group.id]} <span>{group.questions.filter((item) => localSheet.answers[String(item.index)] || item.cancelled).length}/45</span></h3><div>{group.questions.map((item) => { const answer = localSheet.answers[String(item.index)]; const state = item.cancelled ? "cancelled" : !answer ? "" : answer === item.correctAlternative ? "correct" : "wrong"; return <button key={item.index} className={`${current === item.index ? "active" : ""} ${state} ${flagged.includes(item.index) ? "flagged" : ""}`} aria-label={`Ir para questão ${item.index}`} onClick={() => goTo(item.index)}>{item.index}</button>; })}</div></section>)}
          </aside>

          <main className="exam-question-stage">
            {storedFinished && <div className="exam-review-banner"><strong>Modo revisão</strong><span>As respostas estão bloqueadas porque esta prova já foi finalizada.</span><button onClick={() => setReviewing(false)}>Voltar ao resultado</button></div>}
            <div className="exam-question-meta"><div><span>QUESTÃO {question.index} DE 180</span><strong>{areaLabels[question.area]}</strong></div><button className={flagged.includes(question.index) ? "active" : ""} onClick={toggleFlag}>{flagged.includes(question.index) ? "★ Marcada para revisar" : "☆ Marcar para revisar"}</button></div>
            <article className="exam-question-card"><QuestionContent question={question} /></article>
            <section className="exam-alternatives" aria-label={`Alternativas da questão ${question.index}`}>{question.cancelled ? <div className="cancelled-answer"><strong>Questão anulada</strong><span>Use “Próxima” para continuar. Ela não altera seu resultado.</span></div> : question.alternatives.map((alternative) => { const state = !chosen ? "" : alternative.letter === question.correctAlternative ? "correct" : alternative.letter === chosen ? "wrong" : ""; return <button disabled={storedFinished} key={alternative.letter} className={`${chosen === alternative.letter ? "selected" : ""} ${state}`} onClick={() => chooseAnswer(alternative.letter)}><span>{alternative.letter}</span><div>{alternative.text && <p>{alternative.text}</p>}{alternative.file && <QuestionImage source={alternative.file} alt={`Alternativa ${alternative.letter} da questão ${question.index}`} />}</div>{chosen && alternative.letter === question.correctAlternative && <b>✓ Correta</b>}{chosen && alternative.letter === chosen && chosen !== question.correctAlternative && <b>✕ Sua resposta</b>}</button>; })}</section>
            {feedback && <div className={`exam-instant-feedback ${feedback}`}><strong>{feedback === "correct" ? "Você acertou!" : `Você errou. A resposta correta é ${question.correctAlternative}.`}</strong><span>O resultado já foi salvo; você ainda pode trocar a alternativa.</span></div>}
            <footer className="exam-question-actions"><button className="secondary" disabled={current === 1} onClick={() => goTo(current - 1)}>← Anterior</button><span>Use as setas do teclado para navegar</span>{current < 180 ? <button className="primary" onClick={() => goTo(current + 1)}>Próxima →</button> : <button className="primary" onClick={finishExam}>Ver resultado</button>}</footer>
          </main>
        </div>

        <div className="simulator-finish-bar"><div><strong>{storedFinished ? "Revisão da prova concluída." : "Pode parar quando quiser."}</strong><span>{storedFinished ? "Volte ao resultado ou feche a prova." : "Ao fechar, você volta depois exatamente de onde parou."}</span></div>{storedFinished ? <button className="primary" onClick={() => setReviewing(false)}>Voltar ao resultado</button> : <button className="primary" onClick={finishExam}>Finalizar prova e ver resultado</button>}</div>
      </>}
    </section>
  </div>;
}
