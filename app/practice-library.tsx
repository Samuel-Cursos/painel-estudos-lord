"use client";

import { useMemo, useState } from "react";
import { practiceQuestions, type MasteryQuestion } from "./mastery-data";
import type { QuestionProgressMap } from "./question-bank";

const names: Record<string, string> = { english: "Inglês", math: "Matemática", portuguese: "Português", programming: "Programação", biology: "Biologia", chemistry: "Química", physics: "Física", history: "História", geography: "Geografia", philosophy: "Filosofia", sociology: "Sociologia" };

type Props = { progress: QuestionProgressMap; onProgressChange: (next: QuestionProgressMap) => void; onNotice: (message: string) => void };

export default function PracticeLibrary({ progress, onProgressChange, onNotice }: Props) {
  const [active, setActive] = useState<MasteryQuestion | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const completed = useMemo(() => practiceQuestions.filter((item) => progress[item.id]?.answer).length, [progress]);

  function open(question: MasteryQuestion) { setActive(question); setChoice(null); setChecked(false); }
  function verify() {
    if (!active || choice === null) return;
    setChecked(true);
    if (choice === active.answer) {
      onProgressChange({ ...progress, [active.id]: { answer: String.fromCharCode(65 + choice), answeredAt: new Date().toISOString() } });
      onNotice(`${names[active.subject]}: resposta certa e salva.`);
    }
  }

  return <section className="practice-library"><div className="section-heading"><div><span className="eyebrow">TREINO POR MATÉRIA</span><h2>Questões rápidas com correção</h2><p>Além do caderno, todas as matérias do seu painel têm prática própria.</p></div><span className="practice-score">{completed}/{practiceQuestions.length} feitas</span></div><div className="practice-subject-grid">{practiceQuestions.map((question) => <button key={question.id} className={progress[question.id]?.answer ? "done" : ""} onClick={() => open(question)}><span>{progress[question.id]?.answer ? "✓" : "?"}</span><div><strong>{names[question.subject]}</strong><small>{progress[question.id]?.answer ? "Respondida" : "Fazer questão"}</small></div><b>→</b></button>)}</div>

    {active && <div className="modal-backdrop mastery-backdrop" role="presentation" onMouseDown={() => setActive(null)}><section className="mastery-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setActive(null)}>×</button><span className="eyebrow">{names[active.subject]} · TREINO RÁPIDO</span><h2>{active.prompt}</h2><div className="mastery-options">{active.options?.map((option, index) => <button key={option} className={`${choice === index ? "selected" : ""} ${checked && index === active.answer ? "correct" : ""} ${checked && choice === index && choice !== active.answer ? "wrong" : ""}`} onClick={() => { setChoice(index); setChecked(false); }}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{checked && <div className={`mastery-feedback ${choice === active.answer ? "correct" : "wrong"}`}><strong>{choice === active.answer ? "Acertou!" : "Não foi dessa vez."}</strong><p>{active.explanation}</p></div>}<button className="primary mastery-submit" disabled={choice === null} onClick={verify}>Conferir resposta</button></section></div>}
  </section>;
}
