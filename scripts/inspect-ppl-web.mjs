#!/usr/bin/env node

const url = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2020";
const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 Clareia answer-key audit" } });
const html = await response.text();
console.log(`[inep-2020] status=${response.status} bytes=${html.length}`);
const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((match) => match[1]);
const interesting = [...new Set(hrefs.filter((href) => /PPL|reaplica|GB_|PV_|gabarito|prova/i.test(href)))];
console.log(`[inep-2020] links=${interesting.length}`);
for (const href of interesting) console.log(`[inep-2020] ${href}`);
