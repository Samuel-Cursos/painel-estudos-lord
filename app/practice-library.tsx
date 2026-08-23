"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { practiceQuestions, type MasteryQuestion } from "./mastery-data";
import { expandedPracticeQuestions } from "./expanded-practice-data";
import { firestore } from "./firebase-client";
import type { QuestionProgressMap } from "./question-bank";

export const practiceSubjectNames: Record<string, string> = { english: "Inglês", math: "Matemática", portuguese: "Português", programming: "Programação", biology: "Biologia", chemistry: "Química", physics: "Física", history: "História", geography: "Geografia", philosophy: "Filosofia", sociology: "Sociologia" };
export const practiceSubjectOrder = ["portuguese", "math", "english", "biology", "chemistry", "physics", "history", "geography", "philosophy", "sociology", "programming"];

export type CustomPracticeQuestion = MasteryQuestion & { source?: string };
type Props = { progress: QuestionProgressMap; onProgressChange: (next: QuestionProgressMap) => void; onNotice: (message: string) => void; enabled?: boolean };

export default function PracticeLibrary({ progress, onProgressChange, onNotice, enabled = true }: Props) {
  const [custom, setCustom] = useState<CustomPracticeQuestion[]>([]);
  const [subject, setSubject] = useState("all");
  const [active, setActive] = useState<MasteryQuestion | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [written, setWritten] = useState("");
  const [checked, setChecked] = useState(false);
  const allQuestions = useMemo(() => [...practiceQuestions, ...expandedPracticeQuestions, ...custom], [custom]);
  const filtered = useMemo(() => subject === "all" ? allQuestions : allQuestions.filter((item) => item.subject === subject), [allQuestions, subject]);
  const completed = useMemo(() => allQuestions.filter((item) => progress[item.id]?.answer || progress[item.id]?.note?.trim()).length, [allQuestions, progress]);

  useEffect(() => {
    if (!enabled) return;
    void getDocs(collection(firestore, "customQuestions")).then((snapshot) => {
      setCustom(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as CustomPracticeQuestion)).filter((item) => item.prompt && item.subject));
    }).catch(() => undefined);
  }, [enabled]);

  function open(question: MasteryQuestion) { setActive(question); setChoice(null); setWritten(progress[question.id]?.note ?? ""); setChecked(false); }
  function verify() {
    if (!active) return;
    if (active.written) {
      if (!written.trim()) return;
      onProgressChange({ ...progress, [active.id]: { note: written.trim(), answeredAt: new Date().toISOString() } });
      setChecked(true);
      onNotice(`${practiceSubjectNames[active.subject]}: resposta escrita salva para revisão.`);
      return;
    }
    if (choice === null) return;
    setChecked(true);
    if (choice === active.answer) {
      onProgressChange({ ...progress, [active.id]: { answer: String.fromCharCode(65 + choice), answeredAt: new Date().toISOString() } });
      onNotice(`${practiceSubjectNames[active.subject]}: resposta certa e salva.`);
    }
  }

  if (!enabled) return <section className="access-mode-banner"><span>OFF</span><div><strong>Banco geral pausado pelo ADM</strong><p>O caderno SAME continua disponível logo abaixo.</p></div></section>;

  return <section className="practice-library"><div className="section-heading"><div><span className="eyebrow">BANCO GERAL · TODAS AS MATÉRIAS</span><h2>Questões rápidas com correção</h2><p>{allQuestions.length} questões organizadas em 11 matérias. O caderno SAME continua separado abaixo.</p></div><span className="practice-score">{completed}/{allQuestions.length} feitas</span></div>
    <div className="practice-filters"><button className={subject === "all" ? "active" : ""} onClick={() => setSubject("all")}>Todas <span>{allQuestions.length}</span></button>{practiceSubjectOrder.map((id) => <button key={id} className={subject === id ? "active" : ""} onClick={() => setSubject(id)}>{practiceSubjectNames[id]} <span>{allQuestions.filter((item) => item.subject === id).length}</span></button>)}</div>
    <div className="practice-question-grid">{filtered.map((question, index) => <button key={question.id} className={progress[question.id]?.answer || progress[question.id]?.note?.trim() ? "done" : ""} onClick={() => open(question)}><span>{progress[question.id]?.answer || progress[question.id]?.note?.trim() ? "✓" : String(index + 1).padStart(2, "0")}</span><div><small>{practiceSubjectNames[question.subject]}</small><strong>{question.prompt}</strong></div><b>→</b></button>)}</div>

    {active && <div className="modal-backdrop mastery-backdrop" role="presentation" onMouseDown={() => setActive(null)}><section className="mastery-modal" role="dialog" aria-modal="true" aria-label={`Questão rápida de ${practiceSubjectNames[active.subject]}`} onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Fechar questão" onClick={() => setActive(null)}>×</button><span className="eyebrow">{practiceSubjectNames[active.subject]} · TREINO COM CORREÇÃO</span><h2>{active.prompt}</h2>{active.written ? <label className="mastery-written"><span>Escreva sua resposta</span><textarea maxLength={1500} value={written} onChange={(event) => { setWritten(event.target.value); setChecked(false); }} placeholder="Explique com suas palavras…" /></label> : <div className="mastery-options">{active.options?.map((option, index) => <button key={option} className={`${choice === index ? "selected" : ""} ${checked && index === active.answer ? "correct" : ""} ${checked && choice === index && choice !== active.answer ? "wrong" : ""}`} onClick={() => { setChoice(index); setChecked(false); }}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>}{checked && <div className={`mastery-feedback ${active.written || choice === active.answer ? "correct" : "wrong"}`}><strong>{active.written ? "Resposta salva!" : choice === active.answer ? "Acertou!" : "Não foi dessa vez."}</strong><p>{active.explanation}</p></div>}<button className="primary mastery-submit" disabled={active.written ? !written.trim() : choice === null} onClick={verify}>{active.written ? "Salvar resposta" : "Conferir resposta"}</button></section></div>}
  </section>;
}
