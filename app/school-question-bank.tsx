"use client";

import { useMemo, useState } from "react";
import { schoolQuestions, schoolSubjectMeta, subjectsForYear, topicsFor, yearLabel, type SchoolQuestion, type SchoolSubject, type SchoolYear } from "./school-data";
import type { QuestionProgressMap } from "./question-bank";

type Props = { year: SchoolYear; progress: QuestionProgressMap; onProgressChange: (next: QuestionProgressMap) => void; onNotice: (message: string) => void };
type Status = "all" | "pending" | "answered";

export default function SchoolQuestionBank({ year, progress, onProgressChange, onNotice }: Props) {
  const subjects = subjectsForYear(year);
  const [subject, setSubject] = useState<SchoolSubject>(subjects[0]);
  const [topic, setTopic] = useState("all");
  const [status, setStatus] = useState<Status>("all");
  const [active, setActive] = useState<SchoolQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const questions = useMemo(() => schoolQuestions(year, subject), [subject, year]);
  const filtered = useMemo(() => questions.filter((question) => {
    const done = Boolean(progress[question.id]?.note?.trim());
    return (topic === "all" || question.topic === topic) && (status === "all" || (status === "answered" ? done : !done));
  }), [progress, questions, status, topic]);
  const totalForYear = subjects.length * 100;
  const doneForYear = subjects.reduce((total, item) => total + schoolQuestions(year, item).filter((question) => progress[question.id]?.note?.trim()).length, 0);

  function selectSubject(next: SchoolSubject) { setSubject(next); setTopic("all"); setStatus("all"); }
  function openQuestion(question?: SchoolQuestion) { if (!question) return; setActive(question); setAnswer(progress[question.id]?.note ?? ""); }
  function saveAnswer() {
    if (!active || !answer.trim()) return;
    onProgressChange({ ...progress, [active.id]: { note: answer.trim(), answeredAt: new Date().toISOString() } });
    onNotice(`Questão ${active.number} de ${schoolSubjectMeta[active.subject].name} salva.`);
    setActive(null);
  }
  function nextPending() { openQuestion(filtered.find((question) => !progress[question.id]?.note?.trim()) ?? filtered[0]); }

  return <section className="school-question-bank">
    <div className="school-bank-hero"><div><span className="eyebrow">BANCO DA SUA SÉRIE</span><h2>{yearLabel(year)}</h2><p>Cada matéria tem 100 atividades próprias. Nada de conteúdo de outra série misturado no seu caminho.</p></div><div className="school-bank-total"><strong>{doneForYear}</strong><span>de {totalForYear} concluídas</span></div></div>
    <div className="school-subject-tabs">{subjects.map((item) => { const meta = schoolSubjectMeta[item]; const done = schoolQuestions(year, item).filter((question) => progress[question.id]?.note?.trim()).length; return <button key={item} className={subject === item ? "active" : ""} style={{ "--accent": meta.color } as React.CSSProperties} onClick={() => selectSubject(item)}><b>{meta.icon}</b><span>{meta.name}</span><small>{done}/100</small></button>; })}</div>
    <div className="school-bank-layout"><aside><span className="filter-label">CONTEÚDOS</span><button className={topic === "all" ? "active" : ""} onClick={() => setTopic("all")}><span>00</span><div><strong>Todos</strong><small>100 questões</small></div></button>{topicsFor(year, subject).map((item, index) => { const done = questions.filter((question) => question.topic === item && progress[question.id]?.note?.trim()).length; return <button key={item} className={topic === item ? "active" : ""} onClick={() => setTopic(item)}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item}</strong><small>{done}/10 feitas</small></div></button>; })}</aside><main><div className="school-bank-head"><div><span className="eyebrow">{schoolSubjectMeta[subject].short} · {topic === "all" ? "TODOS OS CONTEÚDOS" : topic}</span><h3>{schoolSubjectMeta[subject].name}</h3><p>{filtered.length} atividades neste filtro</p></div><button className="primary" onClick={nextPending}>Abrir próxima →</button></div><div className="school-status-filter">{(["all", "pending", "answered"] as Status[]).map((item) => <button key={item} className={status === item ? "active" : ""} onClick={() => setStatus(item)}>{item === "all" ? "Todas" : item === "pending" ? "Não feitas" : "Concluídas"}</button>)}</div><div className="school-question-list">{filtered.map((question) => { const done = Boolean(progress[question.id]?.note?.trim()); return <button key={question.id} className={done ? "done" : ""} onClick={() => openQuestion(question)}><span>{done ? "✓" : question.number}</span><div><small>{question.topic}</small><strong>{question.prompt}</strong><em>{done ? "Resposta salva" : "Abrir e responder"}</em></div><b>→</b></button>; })}</div></main></div>
    {active && <div className="modal-backdrop school-question-backdrop" role="presentation" onMouseDown={() => setActive(null)}><section className="school-question-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setActive(null)}>×</button><span className="eyebrow">{schoolSubjectMeta[active.subject].name} · {yearLabel(year)} · QUESTÃO {active.number}</span><h2>{active.prompt}</h2><div className="school-answer-guide"><strong>O que precisa aparecer</strong><p>{active.guide}</p></div><label><span>Sua resposta</span><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Escreva aqui com suas palavras…" /></label><div className="school-modal-actions"><button className="secondary" onClick={() => setActive(null)}>Cancelar</button><button className="primary" disabled={!answer.trim()} onClick={saveAnswer}>Salvar e concluir ✓</button></div></section></div>}
  </section>;
}
