#!/usr/bin/env node

import { readFile } from "node:fs/promises";
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
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 1; }
        else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === delimiter) { row.push(cell); cell = ""; continue; }
    if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
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

function sourceInfo(source = "") {
  return {
    year: Number(source.match(/20\d{2}|19\d{2}/)?.[0] ?? 0),
    ppl: /\bPPL\b|reaplica/i.test(source),
  };
}

const datasetUrl = "https://raw.githubusercontent.com/johanessevero/cnn_classificacao_itens_enem_projeto_final_puc/main/data/df_itens_geral.csv";
const response = await fetch(datasetUrl, { headers: { "user-agent": "Mozilla/5.0 Clareia answer-key audit" } });
if (!response.ok) throw new Error(`Falha ao baixar dataset: ${response.status}`);
const csv = await response.text();
const parsed = parseCsv(csv);
const headers = parsed[0];
const index = Object.fromEntries(headers.map((header, i) => [header, i]));
const rows = parsed.slice(1).filter((row) => row.length >= headers.length - 2).map((row) => ({
  year: Number(row[index.ano]),
  area: row[index.sg_area],
  answer: row[index.tx_gabarito],
  prova: row[index.co_prova],
  color: row[index.tx_cor],
  position: Number(row[index.co_posicao]),
  item: row[index.co_item],
  text: row[index.texto_questao] || [row[index.texto_base], row[index.alternativa_a], row[index.alternativa_b], row[index.alternativa_c], row[index.alternativa_d], row[index.alternativa_e]].join(" "),
})).filter((row) => row.year && row.area && /^[A-E]$/.test(row.answer));

const coverage = new Map();
for (const row of rows) {
  const key = `${row.year}-${row.area}`;
  const item = coverage.get(key) ?? { count: 0, provas: new Set(), colors: new Set() };
  item.count += 1;
  item.provas.add(row.prova);
  item.colors.add(row.color);
  coverage.set(key, item);
}
console.log(`[enem-dataset] linhas-validas=${rows.length} anos=${[...new Set(rows.map((row) => row.year))].sort((a,b)=>a-b).join(",")}`);
for (const year of [...new Set(rows.map((row) => row.year))].sort((a,b)=>a-b)) {
  const entries = [...coverage.entries()].filter(([key]) => key.startsWith(`${year}-`));
  console.log(`[enem-dataset] ${year}: ${entries.map(([key,value]) => `${key.split("-")[1]}=${value.count} itens/${value.provas.size} provas/${[...value.colors].join("+")}`).join(" | ")}`);
}

const [bankSource, textSource] = await Promise.all([read("app/question-bank-data.ts"), read("app/question-text-data.ts")]);
const questions = parseGeneratedJson(bankSource, "export const questions: Question[] = ");
const questionText = parseGeneratedJson(textSource, "export const questionText: Record<string, QuestionText> = ");
const subjectArea = { math: "MT", biology: "CN", chemistry: "CN", physics: "CN" };
const rowsByYearArea = new Map();
for (const row of rows) {
  const key = `${row.year}-${row.area}`;
  rowsByYearArea.set(key, [...(rowsByYearArea.get(key) ?? []), row]);
}
const results = [];
for (const question of questions) {
  const info = sourceInfo(question.source);
  const source = questionText[question.id]?.text ?? "";
  const candidates = rowsByYearArea.get(`${info.year}-${subjectArea[question.subject]}`) ?? [];
  const ranked = candidates.map((row) => ({ row, score: tokenScore(source, row.text) })).sort((a,b) => b.score - a.score);
  const best = ranked[0];
  const second = ranked[1];
  results.push({
    id: question.id,
    source: question.source,
    ppl: info.ppl,
    score: Number((best?.score ?? 0).toFixed(4)),
    margin: Number(((best?.score ?? 0) - (second?.score ?? 0)).toFixed(4)),
    answer: best?.row.answer ?? "",
    prova: best?.row.prova ?? "",
    position: best?.row.position ?? 0,
  });
}

for (const kind of ["all", "regular", "ppl"]) {
  const list = kind === "all" ? results : results.filter((item) => kind === "ppl" ? item.ppl : !item.ppl);
  const thresholds = [0.35, 0.45, 0.55, 0.65, 0.75, 0.85];
  console.log(`[enem-match] ${kind} total=${list.length} ` + thresholds.map((threshold) => `>=${threshold}:${list.filter((item) => item.score >= threshold).length}`).join(" "));
  console.log(`[enem-match] ${kind} seguros(score>=.55,margin>=.08)=${list.filter((item) => item.score >= .55 && item.margin >= .08).length}`);
}

const sortedLow = [...results].sort((a,b) => a.score - b.score);
console.log(`[enem-match] 40 menores=${JSON.stringify(sortedLow.slice(0,40))}`);
for (const id of ["math-001", "math-003", "math-035", "biology-001", "chemistry-001", "physics-001"]) {
  console.log(`[enem-match] exemplo ${id}=${JSON.stringify(results.find((item) => item.id === id))}`);
}
