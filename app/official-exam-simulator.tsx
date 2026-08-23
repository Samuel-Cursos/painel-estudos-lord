"use client";

import { useEffect, useMemo, useState } from "react";
import { officialAnswerFor, type ExamAreaId, type OfficialExamEdition } from "./enem-official-simulations";

export type OfficialAreaResult = {
  correct: number;
  wrong: number;
  blank: number;
  total: number;
};

export type OfficialExamResult = {
  correct: number;
  wrong: number;
  blank: number;
  total: number;
  areas: Partial<Record<ExamAreaId, OfficialAreaResult>>;
  finishedAt: string;
};

export type SimulatorAnswerSheet = {
  answers: Record<string, string>;
  notes: string;
  updatedAt: string;
  language?: "english" | "spanish";
  elapsedSeconds?: number;
  status?: "in_progress" | "finished";
  result?: OfficialExamResult;
};

type Props = {
  edition: OfficialExamEdition;
  day: 1 | 2;
  sheet: SimulatorAnswerSheet;
  onChange: (next: SimulatorAnswerSheet) => void;
  onPersist: (next: SimulatorAnswerSheet) => void;
  onFinish: (result: OfficialExamResult, next: SimulatorAnswerSheet) => void;
  onClose: (next: SimulatorAnswerSheet) => void;
};

const options = ["A", "B", "C", "D", "E"];

function formatTimer(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export default function OfficialExamSimulator({ edition, day, sheet, onChange, onPersist, onFinish, onClose }: Props) {
  const dayAreas = useMemo(() => edition.areas.filter((area) => area.day === day), [edition, day]);
  const [activeAreaId, setActiveAreaId] = useState<ExamAreaId>(dayAreas[0].id);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => sheet.elapsedSeconds ?? 0);
  const [timerRunning, setTimerRunning] = useState(false);
  const activeArea = dayAreas.find((area) => area.id === activeAreaId) ?? dayAreas[0];
  const questionStart = day === 1 ? 1 : 91;
  const answered = Array.from({ length: 90 }, (_, index) => questionStart + index)
    .filter((question) => sheet.answers[String(question)]).length;
  const language = sheet.language ?? "english";
  const hasLanguage = dayAreas.some((area) => area.id === "lc");
  const finished = sheet.status === "finished" && Boolean(sheet.result);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  function snapshot(overrides: Partial<SimulatorAnswerSheet> = {}) {
    return { ...sheet, elapsedSeconds, language, ...overrides, updatedAt: new Date().toISOString() };
  }

  function chooseAnswer(question: number, option: string) {
    if (finished) return;
    const answers = { ...sheet.answers };
    if (answers[String(question)] === option) delete answers[String(question)];
    else answers[String(question)] = option;
    onChange(snapshot({ answers, status: "in_progress", result: undefined }));
  }

  function toggleTimer() {
    if (timerRunning) {
      setTimerRunning(false);
      onChange(snapshot({ status: finished ? "finished" : "in_progress" }));
      return;
    }
    setTimerRunning(true);
    if (!finished) onChange(snapshot({ status: "in_progress" }));
  }

  function finishExam() {
    const blankCount = 90 - answered;
    if (blankCount > 0 && !window.confirm(`Ainda há ${blankCount} questão(ões) sem resposta. Finalizar e corrigir mesmo assim?`)) return;
    setTimerRunning(false);
    const areas: OfficialExamResult["areas"] = {};
    let correct = 0;
    let wrong = 0;
    let blank = 0;

    for (const area of dayAreas) {
      const areaResult: OfficialAreaResult = { correct: 0, wrong: 0, blank: 0, total: area.end - area.start + 1 };
      for (let question = area.start; question <= area.end; question += 1) {
        const answer = sheet.answers[String(question)];
        const official = officialAnswerFor(edition, question, language);
        if (!answer) {
          areaResult.blank += 1;
          blank += 1;
        } else if (answer === official) {
          areaResult.correct += 1;
          correct += 1;
        } else {
          areaResult.wrong += 1;
          wrong += 1;
        }
      }
      areas[area.id] = areaResult;
    }

    const result: OfficialExamResult = { correct, wrong, blank, total: 90, areas, finishedAt: new Date().toISOString() };
    const next = snapshot({ status: "finished", result });
    onFinish(result, next);
  }

  function retryDay() {
    if (!window.confirm(`Apagar as respostas e o resultado do ${day}º dia do ENEM ${edition.year}?`)) return;
    setTimerRunning(false);
    setElapsedSeconds(0);
    onPersist({ answers: {}, notes: "", updatedAt: new Date().toISOString(), language });
  }

  const activeQuestions = Array.from(
    { length: activeArea.end - activeArea.start + 1 },
    (_, index) => activeArea.start + index,
  );

  return <section className="official-simulator" aria-label={`Simulado oficial ENEM ${edition.year}, ${day}º dia`}>
    <header className="official-simulator-head">
      <div>
        <span className="eyebrow">MODO PROVA · CADERNO AMARELO OFICIAL</span>
        <h3>ENEM {edition.year} · {day}º dia</h3>
        <p>Leia o caderno na esquerda e marque o cartão-resposta na direita. O gabarito só aparece depois da finalização.</p>
      </div>
      <button className="modal-close simulator-close" aria-label="Fechar modo prova" onClick={() => onClose(snapshot({ status: finished ? "finished" : "in_progress" }))}>×</button>
    </header>

    <div className="official-simulator-toolbar">
      <div className="simulator-timer">
        <span>Tempo decorrido</span>
        <strong>{formatTimer(elapsedSeconds)}</strong>
        <button className={timerRunning ? "secondary" : "primary"} onClick={toggleTimer}>{timerRunning ? "Pausar" : elapsedSeconds ? "Continuar" : "Iniciar cronômetro"}</button>
      </div>
      {hasLanguage && <label className="simulator-language">
        <span>Língua estrangeira</span>
        <select disabled={finished} value={language} onChange={(event) => onChange(snapshot({ language: event.target.value as "english" | "spanish", status: "in_progress", result: undefined }))}>
          <option value="english">Inglês</option>
          <option value="spanish">Espanhol</option>
        </select>
      </label>}
      <div className="simulator-completion"><strong>{answered}/90</strong><span>respondidas</span><i role="progressbar" aria-label="Questões respondidas" aria-valuemin={0} aria-valuemax={90} aria-valuenow={answered}><b style={{ width: `${(answered / 90) * 100}%` }} /></i></div>
    </div>

    <div className="official-simulator-layout">
      <div className="official-pdf-panel">
        <div className="official-pdf-label"><span>Caderno de questões</span><a href={edition.bookletUrls[day - 1]} target="_blank" rel="noreferrer">Abrir tela cheia ↗</a></div>
        <iframe title={`Caderno amarelo ENEM ${edition.year}, ${day}º dia`} src={`${edition.bookletUrls[day - 1]}#toolbar=1&navpanes=0&view=FitH`} />
        <p>Se o navegador bloquear a visualização, use “Abrir tela cheia”. Suas respostas continuam salvas na Clareia.</p>
      </div>

      <aside className="simulator-answer-panel">
        <div className="simulator-area-tabs">{dayAreas.map((area) => {
          const areaAnswered = Array.from({ length: 45 }, (_, index) => area.start + index).filter((question) => sheet.answers[String(question)]).length;
          return <button key={area.id} className={activeArea.id === area.id ? "active" : ""} onClick={() => setActiveAreaId(area.id)}><strong>{area.label}</strong><small>{areaAnswered}/45</small></button>;
        })}</div>
        <div className="simulator-question-list">{activeQuestions.map((question) => {
          const official = finished ? officialAnswerFor(edition, question, language) : "";
          const chosen = sheet.answers[String(question)] ?? "";
          const state = !finished ? (chosen ? "answered" : "") : !chosen ? "blank" : chosen === official ? "correct" : "wrong";
          return <div className={`simulator-question ${state}`} key={question}>
            <strong>{question}</strong>
            <span>{options.map((option) => <button disabled={finished} key={option} className={chosen === option ? "active" : ""} aria-label={`Questão ${question}, alternativa ${option}`} onClick={() => chooseAnswer(question, option)}>{option}</button>)}</span>
            {finished && <small>{!chosen ? `Correta: ${official}` : chosen === official ? "Acertou" : `Correta: ${official}`}</small>}
          </div>;
        })}</div>
      </aside>
    </div>

    {!finished ? <div className="simulator-finish-bar">
      <div><strong>Pronto para corrigir?</strong><span>A Clareia compara suas respostas com o gabarito oficial do caderno amarelo.</span></div>
      <button className="primary" onClick={finishExam}>Finalizar dia e ver resultado</button>
    </div> : <div className="simulator-result">
      <div className="simulator-result-summary"><span>RESULTADO AUTOMÁTICO</span><strong>{sheet.result?.correct}<small>/90 acertos</small></strong><p>{sheet.result?.wrong} erros · {sheet.result?.blank} em branco · {formatTimer(elapsedSeconds)}</p></div>
      <div className="simulator-area-results">{dayAreas.map((area) => {
        const result = sheet.result?.areas[area.id];
        return <article key={area.id}><span>{area.label}</span><strong>{result?.correct ?? 0}<small>/45</small></strong><p>{result?.wrong ?? 0} erros · {result?.blank ?? 0} em branco</p></article>;
      })}</div>
      <div className="simulator-result-actions"><a className="secondary" href={edition.officialKeyUrls[day - 1]} target="_blank" rel="noreferrer">Conferir gabarito oficial ↗</a><button className="danger-outline" onClick={retryDay}>Refazer este dia</button></div>
      <p className="tri-notice"><strong>Importante:</strong> este resultado mostra acertos brutos. A nota oficial do ENEM usa a TRI e não pode ser calculada apenas com o gabarito.</p>
    </div>}
  </section>;
}
