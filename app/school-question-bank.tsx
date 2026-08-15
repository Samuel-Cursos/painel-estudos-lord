"use client";

import { useMemo, useState } from "react";
import { lessonId, type SchoolLessonProgress } from "./school-lesson-data";
import { schoolQuestions, schoolSubjectMeta, subjectsForYear, topicsFor, yearLabel, type SchoolQuestion, type SchoolSubject, type SchoolYear } from "./school-data";
import type { QuestionProgressMap } from "./question-bank";

export type SchoolQuestionFocus = { subject: SchoolSubject; topic: string; nonce: number };

type Props = {
  year: SchoolYear;
  progress: QuestionProgressMap;
  lessonProgress: SchoolLessonProgress;
  focus?: SchoolQuestionFocus | null;
  onProgressChange: (next: QuestionProgressMap) => void;
  onNotice: (message: string) => void;
  onOpenLessons: () => void;
};
type Status = "all" | "pending" | "answered";

export default function SchoolQuestionBank({ year, progress, lessonProgress, focus, onProgressChange, onNotice, onOpenLessons }: Props) {
  const subjects = subjectsForYear(year);
  const initialSubject = focus && subjects.includes(focus.subject) ? focus.subject : subjects[0];
  const [subject, setSubject] = useState<SchoolSubject>(initialSubject);
  const [topic, setTopic] = useState(focus?.topic ?? "all");
  const [status, setStatus] = useState<Status>("all");
  const [active, setActive] = useState<SchoolQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const allQuestions = useMemo(() => schoolQuestions(year, subject), [subject, year]);
  const subjectTopics = topicsFor(year, subject);
  const unlockedTopics = useMemo(() => new Set(subjectTopics.filter((_, index) => Boolean(lessonProgress[lessonId(year, subject, index + 1)]))), [lessonProgress, subject, subjectTopics, year]);
  const questions = useMemo(() => allQuestions.filter((question) => unlockedTopics.has(question.topic)), [allQuestions, unlockedTopics]);
  const filtered = useMemo(() => questions.filter((question) => {
    const done = Boolean(progress[question.id]?.note?.trim());
    return (topic === "all" || question.topic === topic) && (status === "all" || (status === "answered" ? done : !done));
  }), [progress, questions, status, topic]);
  const totalForYear = subjects.length * 100;
  const unlockedForYear = subjects.reduce((total, item) => total + topicsFor(year, item).filter((_, index) => lessonProgress[lessonId(year, item, index + 1)]).length * 10, 0);
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
    <div className="school-bank-hero"><div><span className="eyebrow">PRÁTICA LIBERADA PELAS AULAS</span><h2>{yearLabel(year)}</h2><p>As questões não ficam mais soltas. Cada aula concluída libera somente as 10 atividades do conteúdo que acabou de ser estudado.</p></div><div className="school-bank-total"><strong>{doneForYear}</strong><span>{unlockedForYear} liberadas · {totalForYear} no total</span></div></div>
    <div className="school-subject-tabs">{subjects.map((item) => { const meta = schoolSubjectMeta[item]; const done = schoolQuestions(year, item).filter((question) => progress[question.id]?.note?.trim()).length; const unlocked = topicsFor(year, item).filter((_, index) => lessonProgress[lessonId(year, item, index + 1)]).length * 10; return <button key={item} className={subject === item ? "active" : ""} style={{ "--accent": meta.color } as React.CSSProperties} onClick={() => selectSubject(item)}><b>{meta.icon}</b><span>{meta.name}</span><small>{done}/{unlocked} feitas</small></button>; })}</div>
    <div className="school-bank-layout"><aside><span className="filter-label">AULAS E CONTEÚDOS</span><button className={topic === "all" ? "active" : ""} onClick={() => setTopic("all")}><span>00</span><div><strong>Liberadas</strong><small>{questions.length} questões</small></div></button>{subjectTopics.map((item, index) => { const unlocked = unlockedTopics.has(item); const done = allQuestions.filter((question) => question.topic === item && progress[question.id]?.note?.trim()).length; return <button key={item} className={`${topic === item ? "active" : ""} ${unlocked ? "" : "locked"}`} disabled={!unlocked} onClick={() => setTopic(item)}><span>{unlocked ? String(index + 1).padStart(2, "0") : "⌁"}</span><div><strong>{item}</strong><small>{unlocked ? `${done}/10 feitas` : "Conclua a aula"}</small></div></button>; })}</aside><main><div className="school-bank-head"><div><span className="eyebrow">{schoolSubjectMeta[subject].short} · {topic === "all" ? "CONTEÚDOS LIBERADOS" : topic}</span><h3>{schoolSubjectMeta[subject].name}</h3><p>{filtered.length} atividades disponíveis neste filtro</p></div>{filtered.length > 0 && <button className="primary" onClick={nextPending}>Abrir próxima →</button>}</div>
      {questions.length > 0 ? <><div className="school-status-filter">{(["all", "pending", "answered"] as Status[]).map((item) => <button key={item} className={status === item ? "active" : ""} onClick={() => setStatus(item)}>{item === "all" ? "Todas" : item === "pending" ? "Não feitas" : "Concluídas"}</button>)}</div><div className="school-question-list">{filtered.map((question) => { const done = Boolean(progress[question.id]?.note?.trim()); return <button key={question.id} className={done ? "done" : ""} onClick={() => openQuestion(question)}><span>{done ? "✓" : question.number}</span><div><small>{question.topic}</small><strong>{question.prompt}</strong><em>{done ? "Resposta salva" : "Abrir e responder"}</em></div><b>→</b></button>; })}</div>{!filtered.length && <div className="lesson-gate-empty"><span>✓</span><strong>Nenhuma questão neste filtro.</strong><p>Troque o filtro ou volte para a aula seguinte.</p></div>}</> : <div className="lesson-gate-empty"><span>⌁</span><strong>Primeiro vem a aula.</strong><p>Conclua o Nivelamento 1 de {schoolSubjectMeta[subject].name} para liberar as primeiras 10 questões.</p><button className="primary" onClick={onOpenLessons}>Ir para as aulas →</button></div>}
    </main></div>
    {active && <div className="modal-backdrop school-question-backdrop" role="presentation" onMouseDown={() => setActive(null)}><section className="school-question-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setActive(null)}>×</button><span className="eyebrow">{schoolSubjectMeta[active.subject].name} · {yearLabel(year)} · QUESTÃO {active.number}</span><h2>{active.prompt}</h2><div className="school-answer-guide"><strong>O que precisa aparecer</strong><p>{active.guide}</p></div><label><span>Sua resposta</span><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Escreva aqui com suas palavras…" /></label><div className="school-modal-actions"><button className="secondary" onClick={() => setActive(null)}>Cancelar</button><button className="primary" disabled={!answer.trim()} onClick={saveAnswer}>Salvar e concluir ✓</button></div></section></div>}
  </section>;
}
