#!/usr/bin/env node

const archive = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos";
const response = await fetch(archive, { headers: { "user-agent": "Mozilla/5.0 Clareia answer-key audit" } });
const html = await response.text();
console.log(`[inep-page] status=${response.status} bytes=${html.length}`);
for (const needle of ["2020", "PPL", "reaplic", "provas_e_gabaritos", "accordion"]) {
  const lower = html.toLocaleLowerCase("pt-BR");
  let from = 0;
  let seen = 0;
  while (seen < 8) {
    const index = lower.indexOf(needle.toLocaleLowerCase("pt-BR"), from);
    if (index < 0) break;
    console.log(`[inep-page] ${needle}#${seen + 1}: ${html.slice(Math.max(0,index-450), index+1300).replace(/\s+/g," ")}`);
    from = index + needle.length;
    seen += 1;
  }
}
