"use client";

import { useMemo, useState } from "react";
import OfficialExamSimulator, { type OfficialExamResult, type SimulatorAnswerSheet } from "./official-exam-simulator";
import { officialExamSimulations, officialSimulatorYears } from "./enem-official-simulations";

export type AssessmentRecord = { date: string; lc: string; ch: string; cn: string; math: string; objective?: string; time: string };
export type AssessmentMap = Record<string, AssessmentRecord>;
export type ExamAnswerSheet = SimulatorAnswerSheet;
export type ExamAnswerSheetMap = Record<string, ExamAnswerSheet>;

type Application = "regular" | "ppl" | "digital";
type Props = {
  assessments: AssessmentMap;
  answerSheets: ExamAnswerSheetMap;
  onAssessmentChange: (name: string, record: AssessmentRecord) => void;
  onAssessmentResult: (name: string, record: AssessmentRecord) => void;
  onAssessmentsPersist: () => void;
  onAnswerSheetsChange: (next: ExamAnswerSheetMap) => void;
  onAnswerSheetsPersist: (next: ExamAnswerSheetMap) => void;
  onNotice: (message: string) => void;
};

const OFFICIAL_GOV_BASE = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos";
const OFFICIAL_RIEP_ITEMS: Record<number, string> = {
  1998: "https://riep.inep.gov.br/items/129c4ee7-69a1-4819-9e64-d05d03acffa1",
  1999: "https://riep.inep.gov.br/items/167807c7-babd-47a2-ad64-9f9ebfd2cd26",
  2000: "https://riep.inep.gov.br/items/4fc12a87-9911-4963-9f37-e46b27841344",
  2001: "https://riep.inep.gov.br/items/200a3a0b-9eed-4617-84db-645480f4a80e",
  2002: "https://riep.inep.gov.br/items/b79299f5-1311-4f01-9d0c-4ec4a8ec4cc9",
  2003: "https://riep.inep.gov.br/items/4c1da8a2-e001-4584-be5c-fc15214af187",
  2004: "https://riep.inep.gov.br/items/5d380d6c-ea9a-4951-92ba-d3a1c79f3553",
  2005: "https://riep.inep.gov.br/items/314ddaf6-7b0e-4580-981e-788dc171e4d5",
  2006: "https://riep.inep.gov.br/items/ae4d8164-edf1-47c7-b637-031c63afe0cd",
  2007: "https://riep.inep.gov.br/items/49e09a19-9831-4543-a004-de51f9840ae7",
  2008: "https://riep.inep.gov.br/items/0107cb67-6538-4614-8d9c-4e635669f580",
  2009: "https://riep.inep.gov.br/items/bbf2e26d-d99a-4773-8a18-50f6f4121fa4",
  2010: "https://riep.inep.gov.br/items/a04b8ebf-84d4-4663-83cd-ec58c4b63b88",
  2011: "https://riep.inep.gov.br/items/d6692e64-0a38-43fe-9992-3aececa502db",
  2012: "https://riep.inep.gov.br/items/9ec9b4ad-6e08-4b9a-a664-3cac73f083f0",
  2013: "https://riep.inep.gov.br/items/9b70bb32-dc67-4fde-8214-8f4713d9a386",
  2014: "https://riep.inep.gov.br/items/6332292e-6f87-4e39-a728-af1dc32b2bfd",
  2015: "https://riep.inep.gov.br/items/b45704f3-8724-4ab3-82fa-c1dc1093f1c1",
  2016: "https://riep.inep.gov.br/items/06b2cce8-cef2-4de6-ad1e-2c51b6ecb9de",
  2017: "https://riep.inep.gov.br/items/b5864dda-379f-4593-97f5-7676c2c646cb",
  2018: "https://riep.inep.gov.br/items/fa9d82b8-5815-4224-8225-e4692c424ed2",
  2019: "https://riep.inep.gov.br/items/b6a43ffb-4daf-4370-8c3f-8726fb3ef558",
};
export const officialExamYears = Array.from({ length: 28 }, (_, index) => 2025 - index);
const options = ["A", "B", "C", "D", "E"];

function applicationLabel(value: Application) {
  return value === "regular" ? "Aplicação regular" : value === "ppl" ? "Reaplicação / PPL" : "Aplicação digital";
}

function assessmentName(year: number, application: Application) {
  return `Enem ${year}${application === "regular" ? "" : application === "ppl" ? " PPL" : " digital"}`;
}

function officialExamUrl(year: number) {
  return OFFICIAL_RIEP_ITEMS[year] ?? `${OFFICIAL_GOV_BASE}/${year}`;
}

function cleanScore(value: string, max: number) {
  const digits = value.replace(/\D/g, "").slice(0, 3);
  return digits ? String(Math.min(max, Number(digits))) : "";
}

function total(record?: AssessmentRecord) {
  if (!record) return 0;
  if (record.objective) return Number(record.objective) || 0;
  return [record.lc, record.ch, record.cn, record.math].reduce((sum, value) => sum + (Number(value) || 0), 0);
}

export default function EnemExamLibrary({ assessments, answerSheets, onAssessmentChange, onAssessmentResult, onAssessmentsPersist, onAnswerSheetsChange, onAnswerSheetsPersist, onNotice }: Props) {
  const [selectedYear, setSelectedYear] = useState(2019);
  const [application, setApplication] = useState<Application>("regular");
  const [day, setDay] = useState<1 | 2>(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const modernFormat = selectedYear >= 2009;
  const effectiveDay = modernFormat ? day : 1;
  const questionStart = modernFormat && effectiveDay === 2 ? 91 : 1;
  const questionEnd = modernFormat ? (effectiveDay === 1 ? 90 : 180) : 63;
  const sheetKey = `${selectedYear}-${application}-d${effectiveDay}`;
  const sheet = answerSheets[sheetKey] ?? { answers: {}, notes: "", updatedAt: "" };
  const answered = Object.keys(sheet.answers).filter((key) => Number(key) >= questionStart && Number(key) <= questionEnd && sheet.answers[key]).length;
  const availableApplications: Application[] = selectedYear >= 2020 && selectedYear <= 2022 ? ["regular", "ppl", "digital"] : selectedYear >= 2023 ? ["regular", "ppl"] : ["regular"];
  const examName = assessmentName(selectedYear, application);
  const empty: AssessmentRecord = { date: "", lc: "", ch: "", cn: "", math: "", objective: "", time: "" };
  const record = assessments[examName] ?? empty;
  const simulatorEdition = application === "regular" ? officialExamSimulations[selectedYear] : undefined;
  const groupedYears = useMemo(() => [
    { title: "Edições recentes", detail: "Formato atual e materiais de acessibilidade", years: officialExamYears.filter((year) => year >= 2020) },
    { title: "Nova matriz do ENEM", detail: "180 questões divididas em dois dias", years: officialExamYears.filter((year) => year >= 2009 && year < 2020) },
    { title: "Formato clássico", detail: "63 questões interdisciplinares em um dia", years: officialExamYears.filter((year) => year < 2009) },
  ], []);

  function updateSheet(nextSheet: ExamAnswerSheet) {
    const next = { ...answerSheets, [sheetKey]: { ...nextSheet, updatedAt: new Date().toISOString() } };
    onAnswerSheetsChange(next);
  }

  function chooseAnswer(question: number, answer: string) {
    const nextAnswers = { ...sheet.answers };
    if (nextAnswers[String(question)] === answer) delete nextAnswers[String(question)];
    else nextAnswers[String(question)] = answer;
    updateSheet({ ...sheet, answers: nextAnswers, status: "in_progress", result: undefined });
  }

  function clearSheet() {
    if (!window.confirm(`Limpar todas as respostas do ENEM ${selectedYear} · ${applicationLabel(application)} · ${modernFormat ? `${effectiveDay}º dia` : "prova única"}?`)) return;
    const next = { ...answerSheets };
    delete next[sheetKey];
    onAnswerSheetsChange(next);
    onAnswerSheetsPersist(next);
    onNotice("Folha de respostas limpa.");
  }

  function replaceCurrentSheet(nextSheet: ExamAnswerSheet, persist = false) {
    const next = { ...answerSheets, [sheetKey]: nextSheet };
    onAnswerSheetsChange(next);
    if (persist) onAnswerSheetsPersist(next);
  }

  function finishOfficialSimulation(result: OfficialExamResult, nextSheet: ExamAnswerSheet) {
    const nextSheets = { ...answerSheets, [sheetKey]: nextSheet };
    const dayOne = effectiveDay === 1 ? nextSheet : nextSheets[`${selectedYear}-${application}-d1`];
    const dayTwo = effectiveDay === 2 ? nextSheet : nextSheets[`${selectedYear}-${application}-d2`];
    const totalSeconds = (dayOne?.elapsedSeconds ?? 0) + (dayTwo?.elapsedSeconds ?? 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const updated: AssessmentRecord = {
      ...record,
      date: record.date || new Date().toISOString().slice(0, 10),
      lc: result.areas.lc ? String(result.areas.lc.correct) : record.lc,
      ch: result.areas.ch ? String(result.areas.ch.correct) : record.ch,
      cn: result.areas.cn ? String(result.areas.cn.correct) : record.cn,
      math: result.areas.math ? String(result.areas.math.correct) : record.math,
      time: totalSeconds ? `${hours}h${String(minutes).padStart(2, "0")}` : record.time,
    };
    onAnswerSheetsChange(nextSheets);
    onAnswerSheetsPersist(nextSheets);
    onAssessmentResult(examName, updated);
    onNotice(`ENEM ${selectedYear} · ${effectiveDay}º dia corrigido: ${result.correct}/90 acertos.`);
  }

  function setRecord(field: keyof AssessmentRecord, value: string) {
    const max = field === "objective" ? (modernFormat ? 180 : 63) : 45;
    const cleaned = field === "date" ? value : field === "time" ? value.replace(/[^0-9hm: ]/gi, "").slice(0, 8) : cleanScore(value, max);
    onAssessmentChange(examName, { ...record, [field]: cleaned });
  }

  return <div className="exam-library">
    <button className="back-link assessment-back" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑ Voltar ao início da biblioteca</button>
    <section className="assessment-hero exam-library-hero"><div><span className="eyebrow">ACERVO OFICIAL · INEP</span><h2>Provas do ENEM de 1998 a 2025</h2><p>Escolha o ano e treine com o caderno oficial. Nas edições com Modo Prova, você lê, responde, controla o tempo e recebe a correção sem sair da Clareia.</p></div><aside><strong>28</strong><span>edições organizadas</span><strong>{officialSimulatorYears.length}</strong><span>simulados automáticos</span></aside></section>

    <section className="section-block exam-year-browser"><div className="section-heading"><div><span className="eyebrow">1 · ESCOLHA A EDIÇÃO</span><h2>Biblioteca por ano</h2></div><span className="muted">1998—2025</span></div><div className="simulator-legend"><span>✓</span><p><strong>Modo Prova disponível</strong> nas edições marcadas: caderno amarelo oficial + correção automática.</p></div>{groupedYears.map((group) => <div className="exam-year-group" key={group.title}><div><strong>{group.title}</strong><small>{group.detail}</small></div><div>{group.years.map((year) => <button key={year} className={`${selectedYear === year ? "active" : ""} ${officialExamSimulations[year] ? "has-simulator" : ""}`} onClick={() => { setSelectedYear(year); setApplication("regular"); setDay(1); setSheetOpen(false); setSimulatorOpen(false); }}>{year}<small>{officialExamSimulations[year] ? "✓ modo prova" : year >= 2009 ? "2 dias" : "1 dia"}</small></button>)}</div></div>)}</section>

    <section className="section-block selected-exam"><div className="selected-exam-head"><div><span className="eyebrow">2 · PREPARE A APLICAÇÃO</span><h2>ENEM {selectedYear}</h2><p>{modernFormat ? selectedYear <= 2016 ? "180 questões: Humanas e Natureza no 1º dia; Linguagens, Redação e Matemática no 2º dia." : "180 questões: Linguagens, Redação e Humanas no 1º dia; Natureza e Matemática no 2º dia." : "Formato clássico: 63 questões interdisciplinares e redação em uma única aplicação."}</p></div><div className="selected-exam-actions">{simulatorEdition && <button className="primary" onClick={() => { setSimulatorOpen(true); setSheetOpen(false); }}>Fazer prova na Clareia</button>}<a className={simulatorEdition ? "secondary official-exam-link" : "primary official-exam-link"} href={officialExamUrl(selectedYear)} target="_blank" rel="noreferrer">Ver arquivos oficiais ↗</a></div></div><div className={`exam-instruction ${simulatorEdition ? "success" : ""}`}><span>{simulatorEdition ? "✓" : "i"}</span><p>{simulatorEdition ? <>Esta edição tem <strong>Modo Prova completo</strong> para o caderno amarelo regular: leitor, cronômetro, cartão-resposta e correção automática.</> : selectedYear < 2020 ? <>O acervo oficial permanece disponível e a folha pode ser preenchida na Clareia. A correção automática será liberada somente depois da validação do gabarito desta edição.</> : <>No portal do INEP, escolha <strong>a mesma cor e aplicação do seu caderno</strong>. Prova e gabarito ficam juntos na página do ano.</>}</p></div><div className="exam-setup"><label><span>Aplicação</span><select value={application} onChange={(event) => { setApplication(event.target.value as Application); setSheetOpen(false); setSimulatorOpen(false); }}>{availableApplications.map((item) => <option key={item} value={item}>{applicationLabel(item)}</option>)}</select></label>{modernFormat && <label><span>Dia da prova</span><select value={day} onChange={(event) => { setDay(Number(event.target.value) as 1 | 2); setSheetOpen(false); setSimulatorOpen(false); }}><option value={1}>1º dia · questões 1–90</option><option value={2}>2º dia · questões 91–180</option></select></label>}<button className="secondary" onClick={() => { setSheetOpen((value) => !value); setSimulatorOpen(false); }}>{sheetOpen ? "Fechar folha" : `Abrir somente cartão · ${answered}/${questionEnd - questionStart + 1}`}</button></div>

      {simulatorOpen && simulatorEdition && <OfficialExamSimulator key={sheetKey} edition={simulatorEdition} day={effectiveDay as 1 | 2} sheet={sheet} onChange={(next) => replaceCurrentSheet(next)} onPersist={(next) => replaceCurrentSheet(next, true)} onFinish={finishOfficialSimulation} onClose={(next) => { replaceCurrentSheet(next, true); setSimulatorOpen(false); }} />}

      {sheetOpen && <div className="answer-sheet"><div className="answer-sheet-head"><div><span className="eyebrow">3 · MARQUE SUAS RESPOSTAS</span><h3>{modernFormat ? `${effectiveDay}º dia` : "Prova única"} · questões {questionStart}–{questionEnd}</h3><p>Clique novamente na mesma letra para apagar. A folha fica guardada neste aparelho até você sincronizar.</p></div><div className="answer-progress"><strong>{answered}</strong><span>de {questionEnd - questionStart + 1}</span></div></div><div className="answer-question-grid">{Array.from({ length: questionEnd - questionStart + 1 }, (_, index) => questionStart + index).map((question) => <div className={sheet.answers[String(question)] ? "answered" : ""} key={question}><strong>{question}</strong><span>{options.map((option) => <button key={option} className={sheet.answers[String(question)] === option ? "active" : ""} aria-label={`Questão ${question}, alternativa ${option}`} onClick={() => chooseAnswer(question, option)}>{option}</button>)}</span></div>)}</div><label className="exam-notes"><span>Anotações desta aplicação</span><textarea maxLength={1200} value={sheet.notes} onChange={(event) => updateSheet({ ...sheet, notes: event.target.value })} placeholder="Questões para revisar, assunto que mais apareceu, controle de tempo…" /></label><div className="answer-sheet-actions"><button className="danger-outline" onClick={clearSheet}>Limpar esta folha</button><button className="primary" onClick={() => { onAnswerSheetsPersist(answerSheets); onNotice("Folha de respostas sincronizada."); }}>Salvar folha na conta</button></div></div>}
    </section>

    <section className="section-block exam-result-card"><div className="section-heading"><div><span className="eyebrow">4 · REGISTRE O RESULTADO</span><h2>{examName}</h2></div><strong className="exam-total">{total(record)}<small>acertos</small></strong></div><div className="exam-result-form"><label><span>Data</span><input type="date" value={record.date} onChange={(event) => setRecord("date", event.target.value)} onBlur={onAssessmentsPersist} /></label>{modernFormat ? <><label><span>Linguagens</span><input inputMode="numeric" value={record.lc} onChange={(event) => setRecord("lc", event.target.value)} onBlur={onAssessmentsPersist} placeholder="0–45" /></label><label><span>Humanas</span><input inputMode="numeric" value={record.ch} onChange={(event) => setRecord("ch", event.target.value)} onBlur={onAssessmentsPersist} placeholder="0–45" /></label><label><span>Natureza</span><input inputMode="numeric" value={record.cn} onChange={(event) => setRecord("cn", event.target.value)} onBlur={onAssessmentsPersist} placeholder="0–45" /></label><label><span>Matemática</span><input inputMode="numeric" value={record.math} onChange={(event) => setRecord("math", event.target.value)} onBlur={onAssessmentsPersist} placeholder="0–45" /></label></> : <label><span>Acertos (0–63)</span><input inputMode="numeric" value={record.objective ?? ""} onChange={(event) => setRecord("objective", event.target.value)} onBlur={onAssessmentsPersist} placeholder="0–63" /></label>}<label><span>Tempo gasto</span><input value={record.time} onChange={(event) => setRecord("time", event.target.value)} onBlur={onAssessmentsPersist} placeholder="Ex.: 5h20" /></label></div></section>
  </div>;
}
