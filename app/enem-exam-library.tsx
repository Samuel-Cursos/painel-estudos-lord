"use client";

import { useMemo, useState } from "react";
import { officialExamYears } from "./enem-exam-data";
import OfficialExamSimulator, { type OfficialExamResult, type SimulatorAnswerSheet } from "./official-exam-simulator";

export type AssessmentRecord = { date: string; lc: string; ch: string; cn: string; math: string; objective?: string; time: string };
export type AssessmentMap = Record<string, AssessmentRecord>;
export type ExamAnswerSheet = SimulatorAnswerSheet;
export type ExamAnswerSheetMap = Record<string, ExamAnswerSheet>;

type Props = {
  assessments: AssessmentMap;
  answerSheets: ExamAnswerSheetMap;
  onAssessmentResult: (name: string, record: AssessmentRecord) => void;
  onAnswerSheetsChange: (next: ExamAnswerSheetMap) => void;
  onAnswerSheetsPersist: (next: ExamAnswerSheetMap) => void;
  onNotice: (message: string) => void;
};

const OFFICIAL_ARCHIVE = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos";
const emptySheet: ExamAnswerSheet = { answers: {}, notes: "", updatedAt: "" };

function mergeLegacySheets(first?: ExamAnswerSheet, second?: ExamAnswerSheet): ExamAnswerSheet | null {
  if (!first && !second) return null;
  const latest = [first, second].filter(Boolean).sort((a, b) => String(b?.updatedAt).localeCompare(String(a?.updatedAt)))[0] ?? emptySheet;
  return {
    ...latest,
    answers: { ...(first?.answers ?? {}), ...(second?.answers ?? {}) },
    elapsedSeconds: (first?.elapsedSeconds ?? 0) + (second?.elapsedSeconds ?? 0),
    currentQuestion: second?.currentQuestion ?? first?.currentQuestion,
    flagged: [...new Set([...(first?.flagged ?? []), ...(second?.flagged ?? [])])],
    status: "in_progress",
    result: undefined,
  };
}

function timeLabel(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

export default function EnemExamLibrary({ assessments, answerSheets, onAssessmentResult, onAnswerSheetsChange, onAnswerSheetsPersist, onNotice }: Props) {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const sheetKey = `${selectedYear}-regular`;
  const legacySheet = useMemo(() => mergeLegacySheets(answerSheets[`${selectedYear}-regular-d1`], answerSheets[`${selectedYear}-regular-d2`]), [answerSheets, selectedYear]);
  const sheet = answerSheets[sheetKey] ?? legacySheet ?? emptySheet;
  const answered = Object.values(sheet.answers).filter(Boolean).length;
  const result = sheet.result;
  const record = assessments[`Enem ${selectedYear}`];
  const groupedYears = useMemo(() => [
    { title: "Edições recentes", detail: "2020 a 2025", years: officialExamYears.filter((year) => year >= 2020) },
    { title: "Outras edições completas", detail: "2009 a 2019", years: officialExamYears.filter((year) => year < 2020) },
  ], []);

  function replaceCurrentSheet(nextSheet: ExamAnswerSheet, persist = false) {
    const next = { ...answerSheets, [sheetKey]: { ...nextSheet, updatedAt: new Date().toISOString() } };
    onAnswerSheetsChange(next);
    if (persist) onAnswerSheetsPersist(next);
  }

  function finishOfficialSimulation(nextResult: OfficialExamResult, nextSheet: ExamAnswerSheet) {
    const nextSheets = { ...answerSheets, [sheetKey]: nextSheet };
    const updated: AssessmentRecord = {
      date: new Date().toISOString().slice(0, 10),
      lc: String(nextResult.areas.lc.correct),
      ch: String(nextResult.areas.ch.correct),
      cn: String(nextResult.areas.cn.correct),
      math: String(nextResult.areas.math.correct),
      objective: String(nextResult.correct),
      time: timeLabel(nextSheet.elapsedSeconds ?? 0),
    };
    onAnswerSheetsChange(nextSheets);
    onAnswerSheetsPersist(nextSheets);
    onAssessmentResult(`Enem ${selectedYear}`, updated);
    onNotice(`ENEM ${selectedYear} corrigido: ${nextResult.correct}/${nextResult.gradedTotal} acertos válidos.`);
  }

  function openExam() {
    if (!answerSheets[sheetKey] && legacySheet) replaceCurrentSheet(legacySheet, true);
    setSimulatorOpen(true);
  }

  return <div className="exam-library">
    <button className="back-link assessment-back" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑ Voltar ao início da biblioteca</button>
    <section className="assessment-hero exam-library-hero"><div><span className="eyebrow">PROVAS OFICIAIS · DENTRO DA CLAREIA</span><h2>ENEM 2009 a 2025</h2><p>Escolha uma edição e resolva as 180 questões, uma por vez, sem abrir PDF. A correção usa o gabarito oficial e seu progresso fica salvo para continuar outro dia.</p></div><aside><strong>17</strong><span>edições completas</span><strong>3.060</strong><span>questões organizadas</span></aside></section>

    <section className="section-block exam-year-browser"><div className="section-heading"><div><span className="eyebrow">1 · ESCOLHA O ANO</span><h2>Provas disponíveis</h2><p>Somente edições com 180 questões e gabarito validados aparecem aqui.</p></div><a className="official-source-link" href={OFFICIAL_ARCHIVE} target="_blank" rel="noreferrer">Consultar acervo do INEP ↗</a></div>{groupedYears.map((group) => <div className="exam-year-group" key={group.title}><div><strong>{group.title}</strong><small>{group.detail}</small></div><div>{group.years.map((year) => { const saved = answerSheets[`${year}-regular`] ?? mergeLegacySheets(answerSheets[`${year}-regular-d1`], answerSheets[`${year}-regular-d2`]); const count = Object.values(saved?.answers ?? {}).filter(Boolean).length; return <button key={year} className={selectedYear === year ? "active" : ""} onClick={() => { setSelectedYear(year); setSimulatorOpen(false); }}>{year}<small>{saved?.status === "finished" ? "✓ concluída" : count ? `${count}/180 salvas` : "modo prova"}</small></button>; })}</div></div>)}</section>

    <section className="section-block selected-exam"><div className="selected-exam-head"><div><span className="eyebrow">2 · REALIZE A PROVA</span><h2>ENEM {selectedYear} · 180 questões</h2><p>A sequência é única: você não precisa separar por dia. Pode parar quando quiser e retomar pela última questão ou pelo mapa das pendentes. Nas edições com língua estrangeira, a versão organizada usa Inglês.</p></div><div className="selected-exam-actions"><button className="primary exam-start-button" onClick={openExam}>{result ? "Rever resultado" : answered ? `Continuar prova · ${answered}/180` : "Começar prova"}</button></div></div><div className="exam-instruction success"><span>✓</span><p><strong>Correção automática ativa.</strong> Cada resposta recebe retorno imediato. Questões anuladas permanecem na numeração, mas não contam como erro.</p></div>
      <div className="exam-progress-card"><div><span>Seu progresso</span><strong>{answered}<small>/180 respondidas</small></strong></div><i><b style={{ width: `${(answered / 180) * 100}%` }} /></i><p>{sheet.currentQuestion ? `Última posição: questão ${sheet.currentQuestion}` : "Você ainda não começou esta edição."}</p></div>
      {(result || record) && <div className="exam-saved-result"><div><span>ÚLTIMO RESULTADO</span><strong>{result?.correct ?? record?.objective ?? 0}<small> acertos</small></strong></div><p>{result ? `${result.wrong} erros · ${result.blank} em branco · ${result.cancelled} anulada(s)` : `${record?.lc ?? 0} LC · ${record?.ch ?? 0} CH · ${record?.cn ?? 0} CN · ${record?.math ?? 0} MAT`}</p><button className="secondary" onClick={openExam}>Abrir prova</button></div>}
    </section>

    <section className="exam-library-note"><span>i</span><p><strong>Por que começa em 2009?</strong> É o formato de 180 questões usado pelo ENEM atual. As edições anteriores continuam no acervo oficial, mas não são mostradas como simulados de 180 questões.</p></section>

    {simulatorOpen && <OfficialExamSimulator key={sheetKey} year={selectedYear} sheet={sheet} onChange={(next) => replaceCurrentSheet(next)} onPersist={(next) => replaceCurrentSheet(next, true)} onFinish={finishOfficialSimulation} onClose={(next) => { replaceCurrentSheet(next, true); setSimulatorOpen(false); }} />}
  </div>;
}
