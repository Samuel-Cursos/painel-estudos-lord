#!/usr/bin/env node

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

async function fetchBytes(url) {
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 Clareia answer-key audit" } });
  if (!response.ok) throw new Error(`${response.status} ao baixar ${url}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function pdfText(url) {
  const bytes = await fetchBytes(url);
  console.log(`[ppl-inspect] baixado ${(bytes.byteLength / 1024 / 1024).toFixed(1)} MB: ${url}`);
  const pdf = await getDocument({ data: bytes, isEvalSupported: false, useWorkerFetch: false }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => "str" in item ? item.str : "").join(" ").replace(/\s+/g, " ").trim();
    pages.push(text);
  }
  await pdf.destroy();
  return pages;
}

const proofUrl = "https://download.inep.gov.br/enem/provas_e_gabaritos/2020_PV_reaplicacao_PPL_D2_CD7.pdf";
const keyUrl = "https://download.inep.gov.br/enem/provas_e_gabaritos/2020_GB_reaplicacao_PPL_D2_CD7.pdf";

const [proofPages, keyPages] = await Promise.all([pdfText(proofUrl), pdfText(keyUrl)]);
console.log(`[ppl-inspect] prova páginas=${proofPages.length}; gabarito páginas=${keyPages.length}`);
for (let index = 0; index < Math.min(4, proofPages.length); index += 1) console.log(`[ppl-inspect] PROVA P${index + 1}: ${proofPages[index].slice(0, 1800)}`);
for (let index = 0; index < keyPages.length; index += 1) console.log(`[ppl-inspect] GAB P${index + 1}: ${keyPages[index].slice(0, 4000)}`);
