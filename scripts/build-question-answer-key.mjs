#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");
const userAgent = "Mozilla/5.0 Clareia complete answer-key builder";
const subjectArea = { math: "MT", biology: "CN", chemistry: "CN", physics: "CN" };

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
      row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; continue;
    }
    cell += char;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

function normalize(value = "") {
  return String(value)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\b(?:questao|enem|ppl|reaplicacao|prova|caderno|matematica|biologia|quimica|fisica|fonte|disponivel|acesso)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ").trim();
}

function tokens(value) {
  return new Set(normalize(value).split(" ").filter((token) => token.length >= 3));
}

function scoreText(a, b) {
  const aa = tokens(a); const bb = tokens(b);
  if (!aa.size || !bb.size) return 0;
  let overlap = 0;
  for (const token of aa) if (bb.has(token)) overlap += 1;
  const containment = overlap / Math.max(1, Math.min(aa.size, bb.size));
  const dice = (2 * overlap) / (aa.size + bb.size);
  const aNorm = normalize(a); const bNorm = normalize(b);
  const prefixA = aNorm.slice(0, 180); const prefixB = bNorm.slice(0, 180);
  const prefix = prefixA.length > 30 && prefixB.includes(prefixA.slice(0, Math.min(80, prefixA.length))) ? 1 : 0;
  return containment * 0.62 + dice * 0.33 + prefix * 0.05;
}

function sourceInfo(source = "") {
  return {
    year: Number(source.match(/20\d{2}|19\d{2}/)?.[0] ?? 0),
    ppl: /\bPPL\b|reaplica/i.test(source),
  };
}

function questionBody(item) {
  return [item.context ?? "", item.statement ?? "", ...(item.alternatives ?? []).map((alternative) => `${alternative.letter ?? ""} ${alternative.text ?? ""}`)].join(" ");
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": userAgent } });
  if (!response.ok) throw new Error(`Falha ${response.status} em ${url}`);
  return response.text();
}

async function fetchBytes(url) {
  const response = await fetch(url, { headers: { "user-agent": userAgent } });
  if (!response.ok) throw new Error(`Falha ${response.status} em ${url}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function pdfText(url) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const document = await pdfjs.getDocument({ data: await fetchBytes(url), useWorkerFetch: false, isEvalSupported: false }).promise;
  const pages = [];
  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
    }
  } finally {
    await document.destroy();
  }
  return pages.join("\n");
}

function cleanHtmlText(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&ordm;/gi, "º").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}

function discoverPplPairs(html, pageUrl) {
  const headings = [...html.matchAll(/<h([2-4])\b[^>]*>[\s\S]*?<\/h\1>/gi)].map((match) => ({ index: match.index ?? 0, end: (match.index ?? 0) + match[0].length, text: cleanHtmlText(match[0]) }));
  const headingIndex = headings.findIndex((heading) => /reaplica.*ppl|ppl.*reaplica/i.test(heading.text));
  if (headingIndex < 0) return [];
  const start = headings[headingIndex].end;
  const end = headings.slice(headingIndex + 1).find((heading) => heading.index > start)?.index ?? html.length;
  const section = html.slice(start, end);
  const anchors = [...section.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({
    index: match.index ?? 0,
    href: new URL(match[1], pageUrl).href,
    label: cleanHtmlText(match[2]),
  })).filter((anchor) => /\.pdf(?:$|\?)/i.test(anchor.href));
  const pairs = [];
  for (let index = 0; index < anchors.length; index += 1) {
    const current = anchors[index];
    if (!/^prova\b/i.test(current.label)) continue;
    const next = anchors.slice(index + 1).find((anchor) => /^gabarito\b/i.test(anchor.label));
    if (!next) continue;
    const context = cleanHtmlText(section.slice(Math.max(0, current.index - 360), current.index));
    const day = /2\s*[ºo°]?\s*dia/i.test(context) ? 2 : /1\s*[ºo°]?\s*dia/i.test(context) ? 1 : 0;
    pairs.push({ proof: current.href, key: next.href, day, context });
  }
  const selected = [];
  for (const day of [1, 2]) {
    const pair = pairs.find((item) => item.day === day && !/ledor|ampliad|superampliad|braile|libras/i.test(item.context)) ?? pairs.find((item) => item.day === day);
    if (pair) selected.push(pair);
  }
  return selected.length ? selected : pairs.slice(0, 2);
}

function parseKey(text) {
  const map = new Map();
  for (const match of text.matchAll(/\b(\d{1,3})\s+([A-E])\b/g)) {
    const number = Number(match[1]);
    if (number >= 1 && number <= 180 && !map.has(number)) map.set(number, match[2]);
  }
  return map;
}

function parseProof(text, year, keyMap, sourcePrefix) {
  const matches = [...text.matchAll(/QUEST(?:ÃO|AO)\s+(\d{1,3})/gi)];
  const candidates = [];
  for (let index = 0; index < matches.length; index += 1) {
    const number = Number(matches[index][1]);
    const answer = keyMap.get(number);
    if (!/^[A-E]$/.test(answer ?? "")) continue;
    const start = matches[index].index ?? 0;
    const end = matches[index + 1]?.index ?? text.length;
    const body = text.slice(start, end);
    const area = number >= 136 && number <= 180 ? "MT" : year <= 2016 && number >= 1 && number <= 45 ? "CN" : year >= 2017 && number >= 91 && number <= 135 ? "CN" : "";
    if (!area || normalize(body).length < 25) continue;
    candidates.push({ key: `${sourcePrefix}-${number}-${normalize(body).slice(0, 80)}`, year, area, answer, text: body, source: sourcePrefix });
  }
  return candidates;
}

async function loadPplPdfCandidates(year) {
  const pageUrl = `https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/${year}`;
  const html = await fetchText(pageUrl);
  const pairs = discoverPplPairs(html, pageUrl);
  const results = [];
  for (const [index, pair] of pairs.entries()) {
    try {
      const [proof, key] = await Promise.all([pdfText(pair.proof), pdfText(pair.key)]);
      results.push(...parseProof(proof, year, parseKey(key), `inep-ppl-${year}-${pair.day || index + 1}`));
    } catch (error) {
      console.warn(`[gabaritos] falha ao ler PPL ${year}: ${error instanceof Error ? error.message : error}`);
    }
  }
  const dedup = new Map();
  for (const candidate of results) {
    const fingerprint = `${candidate.area}-${normalize(candidate.text).slice(0, 220)}`;
    const previous = dedup.get(fingerprint);
    if (!previous || previous.answer === candidate.answer) dedup.set(fingerprint, candidate);
  }
  return [...dedup.values()];
}

function assignGroup(groupQuestions, candidates, questionText, label) {
  if (!groupQuestions.length) return [];
  if (!candidates.length) throw new Error(`Sem candidatos para ${label}`);
  const pairs = [];
  for (const question of groupQuestions) {
    const source = questionText[question.id]?.text ?? "";
    for (const candidate of candidates) pairs.push({ question, candidate, score: scoreText(source, candidate.text) });
  }
  pairs.sort((a, b) => b.score - a.score);
  const usedQuestions = new Set();
  const usedCandidates = new Set();
  const assigned = [];
  for (const pair of pairs) {
    if (usedQuestions.has(pair.question.id) || usedCandidates.has(pair.candidate.key)) continue;
    usedQuestions.add(pair.question.id); usedCandidates.add(pair.candidate.key); assigned.push(pair);
    if (usedQuestions.size === groupQuestions.length) break;
  }
  if (assigned.length !== groupQuestions.length) throw new Error(`${label}: ${groupQuestions.length - assigned.length} questões sem casamento`);
  const low = assigned.filter((item) => item.score < 0.18);
  console.log(`[gabaritos] ${label}: ${assigned.length}/${groupQuestions.length}; menor=${Math.min(...assigned.map((item) => item.score)).toFixed(3)}; baixa(<.18)=${low.length}`);
  if (low.length) console.log(`[gabaritos] ${label} baixa confiança=${JSON.stringify(low.slice(0, 12).map((item) => ({ id: item.question.id, score: Number(item.score.toFixed(3)), source: item.question.source, origem: item.candidate.source })))}`);
  return assigned;
}

const [bankSource, textSource] = await Promise.all([read("app/question-bank-data.ts"), read("app/question-text-data.ts")]);
const questions = parseGeneratedJson(bankSource, "export const questions: Question[] = ");
const questionText = parseGeneratedJson(textSource, "export const questionText: Record<string, QuestionText> = ");

const datasetUrl = "https://raw.githubusercontent.com/johanessevero/cnn_classificacao_itens_enem_projeto_final_puc/main/data/df_itens_geral.csv";
const csv = await fetchText(datasetUrl);
const parsed = parseCsv(csv);
const headers = parsed[0];
const column = Object.fromEntries(headers.map((header, index) => [header, index]));
const externalByGroup = new Map();
for (const row of parsed.slice(1)) {
  if (row.length < headers.length - 2) continue;
  const year = Number(row[column.ano]); const area = row[column.sg_area]; const answer = row[column.tx_gabarito];
  if (!year || !["MT", "CN"].includes(area) || !/^[A-E]$/.test(answer)) continue;
  const item = row[column.co_item] || `${row[column.co_prova]}-${row[column.co_posicao]}`;
  const text = row[column.texto_questao] || [row[column.texto_base], row[column.alternativa_a], row[column.alternativa_b], row[column.alternativa_c], row[column.alternativa_d], row[column.alternativa_e]].join(" ");
  if (normalize(text).length < 25) continue;
  const key = `${year}-${area}`;
  const map = externalByGroup.get(key) ?? new Map();
  if (!map.has(item)) map.set(item, { key: `dataset-${year}-${area}-${item}`, year, area, answer, text, source: "dataset-itens-enem" });
  externalByGroup.set(key, map);
}

const answerKey = {};
const groups = new Map();
for (const question of questions) {
  const info = sourceInfo(question.source);
  const area = subjectArea[question.subject];
  const key = `${info.ppl ? "ppl" : "regular"}-${info.year}-${area}`;
  groups.set(key, [...(groups.get(key) ?? []), question]);
}

const examCache = new Map();
const pplPdfCache = new Map();
for (const [groupKey, groupQuestions] of groups) {
  const [, yearString, area] = groupKey.split("-");
  const year = Number(yearString);
  const ppl = groupKey.startsWith("ppl-");
  let candidates = [];
  if (!ppl) {
    if (!examCache.has(year)) {
      try { examCache.set(year, JSON.parse(await read(`public/enem-exams/${year}.json`))); }
      catch { examCache.set(year, { questions: [] }); }
    }
    const exam = examCache.get(year);
    candidates = (exam.questions ?? []).filter((item) => !item.cancelled && /^[A-E]$/.test(item.correctAlternative ?? "") && (area === "MT" ? item.area === "mt" : item.area === "cn")).map((item) => ({
      key: `regular-${year}-${item.index}`, year, area, answer: item.correctAlternative, text: questionBody(item), source: `regular-${year}-${item.index}`,
    }));
  } else {
    candidates = [...(externalByGroup.get(`${year}-${area}`)?.values() ?? [])];
    const needsPdf = !candidates.length || [2016, 2018, 2022, 2023, 2024].includes(year);
    if (needsPdf) {
      if (!pplPdfCache.has(year)) pplPdfCache.set(year, await loadPplPdfCandidates(year));
      candidates.push(...pplPdfCache.get(year).filter((item) => item.area === area));
    }
  }
  const assigned = assignGroup(groupQuestions, candidates, questionText, groupKey);
  for (const item of assigned) answerKey[item.question.id] = item.candidate.answer;
}

answerKey["math-001"] = "A";
const missing = questions.filter((question) => !/^[A-E]$/.test(answerKey[question.id] ?? ""));
if (missing.length) throw new Error(`Gabarito incompleto: ${missing.length} questões sem resposta: ${missing.slice(0, 20).map((item) => item.id).join(", ")}`);

const output = `// Gerado por scripts/build-question-answer-key.mjs a partir de fontes do ENEM.\n// Não editar manualmente.\nimport { questions } from "./question-bank-data";\n\nexport const questionBankAnswerKey: Record<string, string> = ${JSON.stringify(answerKey, null, 2)};\n\ntype QuestionWithAnswer = (typeof questions)[number] & { correctAnswer?: string };\nfor (const question of questions as QuestionWithAnswer[]) {\n  const correctAnswer = questionBankAnswerKey[question.id];\n  if (!/^[A-E]$/.test(correctAnswer ?? "")) throw new Error(\`Questão sem gabarito: \${question.id}\`);\n  question.correctAnswer = correctAnswer;\n}\n`;
await writeFile(path.join(root, "app", "question-bank-answer-key.ts"), output, "utf8");
console.log(`[gabaritos] COMPLETO: ${Object.keys(answerKey).length}/${questions.length} questões antigas com A-E.`);
