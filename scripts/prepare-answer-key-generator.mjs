#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const file = new URL("./build-question-answer-key.mjs", import.meta.url);
let source = await readFile(file, "utf8");
let changed = false;

const areaBefore = '(area === "MT" ? item.area === "mt" : item.area === "cn")';
const areaOld = '(area === "MT" ? Number(item.index) >= 136 && Number(item.index) <= 180 : year <= 2016 ? Number(item.index) >= 1 && Number(item.index) <= 45 : Number(item.index) >= 91 && Number(item.index) <= 135)';
const areaAfter = '(area === "MT" ? Number(item.index) >= 136 && Number(item.index) <= 180 : year <= 2016 ? Number(item.index) >= 46 && Number(item.index) <= 90 : Number(item.index) >= 91 && Number(item.index) <= 135)';
if (source.includes(areaBefore)) {
  source = source.replace(areaBefore, areaAfter);
  changed = true;
} else if (source.includes(areaOld)) {
  source = source.replace(areaOld, areaAfter);
  changed = true;
} else if (!source.includes(areaAfter)) {
  throw new Error("Não encontrei o filtro de área esperado no gerador.");
}

const proofOld = 'year <= 2016 && number >= 1 && number <= 45';
const proofAfter = 'year <= 2016 && number >= 46 && number <= 90';
if (source.includes(proofOld)) {
  source = source.replace(proofOld, proofAfter);
  changed = true;
}
console.log("[gabaritos] áreas oficiais: CN 2016=46–90, CN 2017+=91–135, MT=136–180.");

const fallbackMarker = 'const dedup = new Map();\n  for (const candidate of results) {';
const fallbackCode = `if (year === 2016 && results.length === 0) {\n    const numbers = [\n      ...Array.from({ length: 45 }, (_, index) => index + 46),\n      ...Array.from({ length: 45 }, (_, index) => index + 136),\n    ];\n    const pages = await Promise.allSettled(numbers.map(async (number) => {\n      const day = number >= 136 ? 2 : 1;\n      const url = \`https://www.memorizevestibular.com/blog/questoes/enem-2016-ppl/dia-\${day}-questao-\${number}\`;\n      const html = await fetchText(url);\n      const text = cleanHtmlText(html);\n      const answer = text.match(/Gabarito:\\s*([A-E])\\b/i)?.[1]?.toUpperCase();\n      if (!/^[A-E]$/.test(answer ?? "")) throw new Error(\`gabarito não encontrado na questão \${number}\`);\n      return {\n        key: \`memorize-ppl-2016-\${number}\`,\n        year: 2016,\n        area: number >= 136 ? "MT" : "CN",\n        answer,\n        text,\n        source: \`memorize-ppl-2016-\${number}\`,\n      };\n    }));\n    for (const page of pages) {\n      if (page.status === "fulfilled") results.push(page.value);\n    }\n    console.log(\`[gabaritos] PPL 2016 via páginas individuais: \${results.length} candidatos.\`);\n  }\n\n  const coralPairs = {\n    2018: [\n      ["2018_PV_reaplicacao_PPL_D1_CD13.pdf", "GAB_ENEM_2018_DIA_1_P2_Azul.pdf", 1],\n      ["2018_PV_reaplicacao_PPL_D2_CD19.pdf", "GAB_ENEM_2018_DIA_2_P2_Azul.pdf", 2],\n    ],\n    2022: [\n      ["2022_PV_reaplicacao_PPL_D1_CD1.pdf", "2022_GB_reaplicacao_PPL_D1_CD1.pdf", 1],\n      ["2022_PV_reaplicacao_PPL_D2_CD7.pdf", "2022_GB_reaplicacao_PPL_D2_CD7.pdf", 2],\n    ],\n    2023: [\n      ["2023_PV_reaplicacao_PPL_D1_CD1.pdf", "2023_GB_reaplicacao_PPL_D1_CD1.pdf", 1],\n      ["2023_PV_reaplicacao_PPL_D2_CD7.pdf", "2023_GB_reaplicacao_PPL_D2_CD7.pdf", 2],\n    ],\n    2024: [\n      ["2024_PV_reaplicacao_PPL_D1_CD1.pdf", "2024_GB_reaplicacao_PPL_D1_CD1.pdf", 1],\n      ["2024_PV_reaplicacao_PPL_D2_CD7.pdf", "2024_GB_reaplicacao_PPL_D2_CD7.pdf", 2],\n    ],\n  };\n  if (results.length === 0 && coralPairs[year]) {\n    const base = \`https://raw.githubusercontent.com/Coral-math/Provas-e-gabaritos-Enem/main/\${year}/PPL\`;\n    for (const [proofName, keyName, day] of coralPairs[year]) {\n      try {\n        const [proof, key] = await Promise.all([pdfText(\`\${base}/\${proofName}\`), pdfText(\`\${base}/\${keyName}\`)]);\n        results.push(...parseProof(proof, year, parseKey(key), \`coral-ppl-\${year}-\${day}\`));\n      } catch (error) {\n        console.warn(\`[gabaritos] falha no espelho GitHub PPL \${year} dia \${day}: \${error instanceof Error ? error.message : error}\`);\n      }\n    }\n    console.log(\`[gabaritos] PPL \${year} via espelho GitHub: \${results.length} candidatos.\`);\n  }\n\n  const dedup = new Map();\n  for (const candidate of results) {`;

if (!source.includes("memorize-ppl-2016") && !source.includes("coral-ppl-")) {
  if (!source.includes(fallbackMarker)) throw new Error("Não encontrei o ponto de inserção dos fallbacks PPL.");
  source = source.replace(fallbackMarker, fallbackCode);
  changed = true;
  console.log("[gabaritos] fallbacks PPL preparados: 2016 por questão; 2018/2022/2023/2024 via PDFs GitHub.");
}

if (changed) await writeFile(file, source, "utf8");
