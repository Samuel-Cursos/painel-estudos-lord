#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

function parseGeneratedJson(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Marcador não encontrado: ${marker}`);
  const payload = source.slice(start + marker.length).trim().replace(/;\s*$/, "");
  return JSON.parse(payload);
}

function normalize(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value) {
  return new Set(normalize(value).split(" ").filter((item) => item.length >= 3));
}

function similarity(a, b) {
  const aa = normalize(a);
  const bb = normalize(b);
  if (!aa || !bb) return 0;
  if (aa.includes(bb) || bb.includes(aa)) return 1;
  const ta = tokens(aa);
  const tb = tokens(bb);
  let overlap = 0;
  for (const token of ta) if (tb.has(token)) overlap += 1;
  return overlap / Math.max(1, Math.min(ta.size, tb.size));
}

function sourceInfo(source = "") {
  const year = Number(source.match(/20\d{2}/)?.[0] ?? source.match(/19\d{2}/)?.[0] ?? 0);
  return { year, ppl: /\bPPL\b/i.test(source) };
}

function examText(question) {
  return [
    question.context,
    question.statement,
    ...(question.alternatives ?? []).map((item) => item.text),
  ].filter(Boolean).join(" ");
}

const [bankSource, textSource, manifestSource] = await Promise.all([
  read("app/question-bank-data.ts"),
  read("app/question-text-data.ts"),
  read("public/enem-exams/manifest.json"),
]);
const questions = parseGeneratedJson(bankSource, "export const questions: Question[] = ");
const questionText = parseGeneratedJson(textSource, "export const questionText: Record<string, QuestionText> = ");
const manifest = JSON.parse(manifestSource);
const exams = new Map();
for (const { year } of manifest.years) {
  exams.set(year, JSON.parse(await read(`public/enem-exams/${year}.json`)).questions);
}

const pplByYear = new Map();
const regular = [];
const unresolvedRegular = [];
for (const question of questions) {
  const info = sourceInfo(question.source);
  if (info.ppl) {
    pplByYear.set(info.year, (pplByYear.get(info.year) ?? 0) + 1);
    continue;
  }
  const candidates = (exams.get(info.year) ?? []).filter((candidate) => {
    if (question.subject === "math") return candidate.area === "math";
    return candidate.area === "cn";
  });
  const source = questionText[question.id]?.text ?? "";
  const ranked = candidates
    .map((candidate) => ({ candidate, score: similarity(source, examText(candidate)) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (best && best.score >= 0.52 && /^[A-E]$/.test(best.candidate.correctAlternative ?? "")) {
    regular.push({ id: question.id, source: question.source, answer: best.candidate.correctAlternative, score: best.score, official: best.candidate.index });
  } else {
    unresolvedRegular.push({ id: question.id, source: question.source, score: best?.score ?? 0, official: best?.candidate?.index ?? null });
  }
}

console.log(`[gabaritos] banco antigo: ${questions.length} questões`);
console.log(`[gabaritos] regulares casadas com prova oficial: ${regular.length}`);
console.log(`[gabaritos] regulares ainda sem casamento seguro: ${unresolvedRegular.length}`);
console.log(`[gabaritos] PPL/reaplicação: ${[...pplByYear.values()].reduce((sum, count) => sum + count, 0)}`);
console.log(`[gabaritos] PPL por ano: ${[...pplByYear.entries()].sort((a,b)=>a[0]-b[0]).map(([year,count]) => `${year}:${count}`).join(", ")}`);
if (unresolvedRegular.length) console.log(`[gabaritos] exemplos regulares pendentes: ${JSON.stringify(unresolvedRegular.slice(0, 30))}`);
