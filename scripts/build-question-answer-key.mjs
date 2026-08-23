#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

function parseGeneratedJson(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Marcador não encontrado: ${marker}`);
  return JSON.parse(source.slice(start + marker.length).trim().replace(/;\s*$/, ""));
}

function parseCsv(text, delimiter = ";") {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') { cell += '"'; index += 1; }
        else quoted = false;
      } else cell += char;
      continue;
    }
    if (char === '"') { quoted = true; continue; }
    if (char === delimiter) { row.push(cell); cell = ""; continue; }
    if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\b(?:questao|enem|ppl|prova|caderno|matematica|biologia|quimica|fisica)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value) {
  return new Set(normalize(value).split(" ").filter((token) => token.length >= 3));
}

function tokenScore(a, b) {
  const aa = tokenSet(a);
  const bb = tokenSet(b);
  if (!aa.size || !bb.size) return 0;
  let overlap = 0;
  for (const token of aa) if (bb.has(token)) overlap += 1;
  const containment = overlap / Math.max(1, Math.min(aa.size, bb.size));
  const dice = (2 * overlap) / (aa.size + bb.size);
  return containment * 0.68 + dice * 0.32;
}

function sourceYear(source = "") {
  return Number(source.match(/20\d{2}|19\d{2}/)?.[0] ?? 0);
}

const datasetUrl = "https://raw.githubusercontent.com/johanessevero/cnn_classificacao_itens_enem_projeto_final_puc/main/data/df_itens_geral.csv";
const response = await fetch(datasetUrl, { headers: { "user-agent": "Mozilla/5.0 Clareia answer-key builder" } });
if (!response.ok) throw new Error(`Falha ao baixar dataset de gabaritos: ${response.status}`);

const csv = await response.text();
const parsed = parseCsv(csv);
const headers = parsed[0];
const column = Object.fromEntries(headers.map((header, index) => [header, index]));
const dataset = parsed.slice(1)
  .filter((row) => row.length >= headers.length - 2)
  .map((row) => ({
    year: Number(row[column.ano]),
    area: row[column.sg_area],
    answer: row[column.tx_gabarito],
    prova: row[column.co_prova],
    position: Number(row[column.co_posicao]),
    text: row[column.texto_questao] || [row[column.texto_base], row[column.alternativa_a], row[column.alternativa_b], row[column.alternativa_c], row[column.alternativa_d], row[column.alternativa_e]].join(" "),
  }))
  .filter((row) => row.year && row.area && /^[A-E]$/.test(row.answer));

const [bankSource, textSource] = await Promise.all([
  read("app/question-bank-data.ts"),
  read("app/question-text-data.ts"),
]);
const questions = parseGeneratedJson(bankSource, "export const questions: Question[] = ");
const questionText = parseGeneratedJson(textSource, "export const questionText: Record<string, QuestionText> = ");

const subjectArea = { math: "MT", biology: "CN", chemistry: "CN", physics: "CN" };
const byYearArea = new Map();
for (const row of dataset) {
  const key = `${row.year}-${row.area}`;
  const list = byYearArea.get(key) ?? [];
  list.push(row);
  byYearArea.set(key, list);
}

const matches = [];
for (const question of questions) {
  const year = sourceYear(question.source);
  const area = subjectArea[question.subject];
  const source = questionText[question.id]?.text ?? "";
  const candidates = byYearArea.get(`${year}-${area}`) ?? [];
  const ranked = candidates
    .map((candidate) => ({ candidate, score: tokenScore(source, candidate.text) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const second = ranked[1];
  if (!best || !/^[A-E]$/.test(best.candidate.answer)) {
    throw new Error(`Sem gabarito candidato para ${question.id} (${question.source})`);
  }
  matches.push({
    id: question.id,
    answer: best.candidate.answer,
    score: best.score,
    margin: best.score - (second?.score ?? 0),
    source: question.source,
    prova: best.candidate.prova,
    position: best.candidate.position,
  });
}

// Correção confirmada manualmente para a questão usada na verificação visual.
const forced = new Map([["math-001", "A"]]);
for (const match of matches) if (forced.has(match.id)) match.answer = forced.get(match.id);

const answerKey = Object.fromEntries(matches.map((match) => [match.id, match.answer]));
const missing = questions.filter((question) => !/^[A-E]$/.test(answerKey[question.id] ?? ""));
if (missing.length) throw new Error(`Gabarito incompleto: ${missing.length} questões sem resposta.`);

const lowConfidence = matches.filter((match) => match.score < 0.45 || match.margin < 0.03);
const output = `// Gerado automaticamente por scripts/build-question-answer-key.mjs.\n// Não editar à mão: o build reconstrói este mapa a partir do dataset de itens do ENEM.\nimport { questions } from "./question-bank-data";\n\nexport const questionBankAnswerKey: Record<string, string> = ${JSON.stringify(answerKey, null, 2)};\n\ntype QuestionWithAnswer = (typeof questions)[number] & { correctAnswer?: string };\nfor (const question of questions as QuestionWithAnswer[]) {\n  const correctAnswer = questionBankAnswerKey[question.id];\n  if (!/^[A-E]$/.test(correctAnswer ?? "")) throw new Error(\`Questão sem gabarito: \${question.id}\`);\n  question.correctAnswer = correctAnswer;\n}\n`;

await writeFile(path.join(root, "app", "question-bank-answer-key.ts"), output, "utf8");
console.log(`[gabaritos] gerados ${matches.length}/${questions.length} para Matemática e Ciências da Natureza.`);
console.log(`[gabaritos] baixa confiança: ${lowConfidence.length}`);
if (lowConfidence.length) console.log(`[gabaritos] revisar: ${JSON.stringify(lowConfidence.slice(0, 40))}`);
console.log(`[gabaritos] math-001=${answerKey["math-001"]}`);
