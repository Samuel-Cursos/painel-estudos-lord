"use client";

import { useState } from "react";
import type { MasteryQuestion } from "./mastery-data";

type Props = {
  question: MasteryQuestion;
  title: string;
  onClose: () => void;
  onPass: () => void;
};

export default function MasteryCheck({ question, title, onClose, onPass }: Props) {
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const correct = choice === question.answer;

  function verifyChoice() {
    setChecked(true);
    if (choice === question.answer) window.setTimeout(onPass, 700);
  }

  return <div className="modal-backdrop mastery-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="mastery-modal" role="dialog" aria-modal="true" aria-label={`Verificação: ${title}`} onMouseDown={(event) => event.stopPropagation()}>
      <button className="modal-close" aria-label="Fechar" onClick={onClose}>×</button>
      <span className="mastery-icon">✓?</span>
      <span className="eyebrow">CHECK DE APRENDIZADO</span>
      <h2>Antes de concluir</h2>
      <p className="mastery-context">{title}</p>
      <div className="mastery-question"><strong>{question.prompt}</strong></div>

      {question.written ? <>
        <label className="mastery-written"><span>Sua explicação</span><textarea maxLength={1500} value={text} onChange={(event) => setText(event.target.value)} placeholder="Explique a ideia e dê um exemplo com suas palavras…" /></label>
        <div className={`mastery-feedback ${text.trim().length >= 30 ? "correct" : ""}`}><strong>{text.trim().length >= 30 ? "Resposta pronta para conferir" : "Desenvolva um pouco mais"}</strong><p>{question.explanation}</p></div>
        <button className="primary success mastery-submit" disabled={text.trim().length < 30} onClick={onPass}>Minha resposta atende aos dois pontos · concluir ✓</button>
      </> : <>
        <div className="mastery-options">{question.options?.map((option, index) => <button key={option} className={`${choice === index ? "selected" : ""} ${checked && index === question.answer ? "correct" : ""} ${checked && choice === index && !correct ? "wrong" : ""}`} onClick={() => { setChoice(index); setChecked(false); }}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
        {checked && <div className={`mastery-feedback ${correct ? "correct" : "wrong"}`}><strong>{correct ? "Acertou — aula concluída!" : "Ainda não. Revise a explicação e tente de novo."}</strong><p>{question.explanation}</p></div>}
        <button className="primary mastery-submit" disabled={choice === null || (checked && correct)} onClick={verifyChoice}>{checked && !correct ? "Conferir novamente" : "Conferir resposta"}</button>
      </>}
      <button className="text-button mastery-cancel" onClick={onClose}>Voltar para a aula</button>
    </section>
  </div>;
}
