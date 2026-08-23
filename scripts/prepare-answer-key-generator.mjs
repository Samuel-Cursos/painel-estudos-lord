#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const file = new URL("./build-question-answer-key.mjs", import.meta.url);
let source = await readFile(file, "utf8");
let changed = false;

const areaBefore = '(area === "MT" ? item.area === "mt" : item.area === "cn")';
const areaAfter = '(area === "MT" ? Number(item.index) >= 136 && Number(item.index) <= 180 : year <= 2016 ? Number(item.index) >= 1 && Number(item.index) <= 45 : Number(item.index) >= 91 && Number(item.index) <= 135)';
if (source.includes(areaBefore)) {
  source = source.replace(areaBefore, areaAfter);
  changed = true;
  console.log("[gabaritos] gerador preparado para as áreas oficiais por posição.");
} else if (source.includes(areaAfter)) {
  console.log("[gabaritos] filtro de áreas já preparado.");
} else {
  throw new Error("Não encontrei o filtro de área esperado no gerador.");
}

const fallbackMarker = 'const dedup = new Map();\n  for (const candidate of results) {';
const fallbackCode = `if (year === 2016 && results.length === 0) {\n    const base = "https://www.ifpb.edu.br/campus/princesaisabel/ensino/diretoria-de-ensino/enem/2018/2016";\n    const mirrorPairs = [\n      { proof: \`\${base}/prova_caderno_branco_10_2016.pdf/%40%40download/file\`, key: \`\${base}/gabarito_caderno_branco_12_2016.pdf/%40%40download/file\`, day: 1 },\n      { proof: \`\${base}/prova_caderno_cinza_14_2016.pdf/%40%40download/file\`, key: \`\${base}/gabarito_caderno_cinza_14_2016.pdf/%40%40download/file\`, day: 2 },\n    ];\n    for (const pair of mirrorPairs) {\n      try {\n        const [proof, key] = await Promise.all([pdfText(pair.proof), pdfText(pair.key)]);\n        results.push(...parseProof(proof, year, parseKey(key), \`ifpb-ppl-2016-\${pair.day}\`));\n      } catch (error) {\n        console.warn(\`[gabaritos] falha no espelho IFPB 2016 dia \${pair.day}: \${error instanceof Error ? error.message : error}\`);\n      }\n    }\n  }\n  \n  const dedup = new Map();\n  for (const candidate of results) {`;

if (!source.includes("ifpb-ppl-2016")) {
  if (!source.includes(fallbackMarker)) throw new Error("Não encontrei o ponto de inserção do fallback PPL 2016.");
  source = source.replace(fallbackMarker, fallbackCode);
  changed = true;
  console.log("[gabaritos] fallback IFPB para PPL 2016 preparado.");
} else {
  const oldRaw = 'proof: `${base}/prova_caderno_branco_12_2016.pdf`, key: `${base}/gabarito_caderno_branco_12_2016.pdf`';
  const newRaw = 'proof: `${base}/prova_caderno_branco_10_2016.pdf/%40%40download/file`, key: `${base}/gabarito_caderno_branco_12_2016.pdf/%40%40download/file`';
  const oldGray = 'proof: `${base}/prova_caderno_cinza_14_2016.pdf`, key: `${base}/gabarito_caderno_cinza_14_2016.pdf`';
  const newGray = 'proof: `${base}/prova_caderno_cinza_14_2016.pdf/%40%40download/file`, key: `${base}/gabarito_caderno_cinza_14_2016.pdf/%40%40download/file`';
  if (source.includes(oldRaw)) { source = source.replace(oldRaw, newRaw); changed = true; }
  if (source.includes(oldGray)) { source = source.replace(oldGray, newGray); changed = true; }
  console.log("[gabaritos] fallback IFPB 2016 apontando para downloads brutos.");
}

if (changed) await writeFile(file, source, "utf8");
