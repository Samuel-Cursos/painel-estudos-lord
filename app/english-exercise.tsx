"use client";
import { useState } from "react";
import type { EnglishExercise } from "./english-course-data";
import { isEnglishAnswer, type ExerciseResult } from "./english-progress";
export function Exercise({ exercise, stored, onResult, assisted = false }: { exercise: EnglishExercise; stored?: ExerciseResult; onResult: (result: ExerciseResult) => void; assisted?: boolean }) {
  const [editedAnswer, setAnswer] = useState<string | null>(null);
  const answer = editedAnswer ?? stored?.answer ?? "";
  const [hint, setHint] = useState(false);
  const [checked, setChecked] = useState(true);
  const result = checked ? stored : undefined;
  function change(value: string) { setAnswer(value); setChecked(false); if (stored) onResult({ ...stored, answer: value, correct: false }); }
  function check() {
    const next = { answer, correct: isEnglishAnswer(answer, exercise.answers), assisted: assisted || hint || !!stored?.assisted || (stored?.attempts ?? 0) > 0, attempts: (stored?.attempts ?? 0) + 1 };
    setChecked(true); setAnswer(null); onResult(next);
  }
  return <section className="en-exercise"><span className="en-kicker">{exercise.skill}</span><h4>{exercise.prompt}</h4>
    {exercise.options ? <fieldset><legend className="en-sr-only">Escolha uma resposta</legend>{exercise.options.map((option) => <label className={`en-option ${answer === option ? "selected" : ""}`} key={option}><input type="radio" name={exercise.id} value={option} checked={answer === option} onChange={() => change(option)} /><span lang="en">{option}</span></label>)}</fieldset> : <label className="en-field">Sua resposta em inglês<input lang="en" value={answer} maxLength={200} autoComplete="off" spellCheck={false} onChange={(e) => change(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && answer.trim()) check(); }} /></label>}
    <div className="en-actions"><button className="en-primary" type="button" disabled={!answer.trim()} onClick={check}>Conferir resposta</button><button type="button" onClick={() => setHint(true)}>Preciso de uma dica</button></div>
    {hint && <p className="en-hint">Dica: {exercise.hint}</p>}
    {result && <div className={`en-feedback ${result.correct ? "correct" : "retry"}`} role="status"><strong>{result.correct ? result.assisted ? "Correto, com apoio." : "Você acertou!" : "Vamos ajustar."}</strong><p>{exercise.explanation}</p>{!result.correct && <p>Resposta de referência: <span lang="en">{exercise.answers[0]}</span>. Leia a explicação e tente novamente.</p>}</div>}
  </section>;
}

