"use client";
import { useState } from "react";
import { englishUnits } from "./english-course-data";
import { downloadText, exportPortfolio } from "./english-learning-tools";
import type { LearningCells } from "./english-progress";

import { buildEnglishBook } from "./english-learning-tools";
export function EnglishBook({ cells }: { cells: LearningCells }) {
  const [unit, setUnit] = useState(0); const [message, setMessage] = useState("");
  function print() {
    const child = window.open("", "_blank");
    if (!child) { setMessage("O navegador bloqueou a janela de impressão. Libere pop-ups para este site ou baixe o texto."); return; }
    const escaped = buildEnglishBook(unit).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
    child.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Clareia · Caderno de inglês</title><style>body{font:12pt/1.6 Arial,sans-serif;margin:24mm;color:#171b2b}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}@page{size:A4;margin:18mm}@media print{body{margin:0}}</style></head><body><pre>${escaped}</pre></body></html>`);
    child.document.close(); child.focus(); setTimeout(() => child.print(), 300);
    setMessage("Na janela de impressão, escolha sua impressora ou Salvar como PDF.");
  }
  return <section className="en-panel"><span className="en-kicker">ESTUDAR E GUARDAR</span><h3>Sua apostila e seu portfólio</h3><p>Baixe explicações, vocabulário, textos, atividades e gabaritos comentados. O arquivo de texto abre sem internet. Os áudios e a sincronização não estão incluídos.</p><label className="en-field">Conteúdo da apostila<select value={unit} onChange={(e) => setUnit(Number(e.target.value))}><option value={-1}>Todas as 48 aulas</option>{englishUnits.map((name, index) => <option key={name} value={index}>{index + 1}. {name}</option>)}</select></label><div className="en-actions"><button className="en-primary" onClick={() => downloadText(buildEnglishBook(unit), `clareia-ingles-${unit < 0 ? "completo" : `unidade-${unit + 1}`}.txt`)}>Baixar apostila em texto</button><button onClick={print}>Imprimir / salvar como PDF</button><button onClick={() => downloadText(exportPortfolio(cells), "clareia-meu-portfolio.txt")}>Baixar meus textos</button></div><small>A apostila contém material de aula. O portfólio contém seus rascunhos: confira antes de compartilhar.</small>{message && <p role="status">{message}</p>}</section>;
}
