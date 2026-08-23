#!/usr/bin/env node

const archive = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos";
const response = await fetch(archive, { headers: { "user-agent": "Mozilla/5.0 Clareia answer-key audit" } });
const html = await response.text();
console.log(`[inep-page] status=${response.status} bytes=${html.length}`);
const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((match) => match[1]);
const interesting = [...new Set(hrefs.filter((href) => /2020|ppl|reaplica/i.test(href)))];
console.log(`[inep-page] links-interessantes=${interesting.length}`);
for (const href of interesting.slice(0, 300)) console.log(`[inep-page] ${href}`);
