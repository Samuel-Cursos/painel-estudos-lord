#!/usr/bin/env node

const url = "https://www.qconcursos.com/questoes-do-enem/provas/inep-2012-enem-exame-nacional-do-ensino-medio-primeiro-e-segundo-dia-ppl/questoes?page=7";
const response = await fetch(url, {
  headers: {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36",
    "accept-language": "pt-BR,pt;q=0.9",
  },
});
console.log(`[ppl-web] status=${response.status} type=${response.headers.get("content-type")}`);
const html = await response.text();
console.log(`[ppl-web] bytes=${html.length}`);
for (const needle of ["Respostas", "121: E", "gabarito", "Q889", "questao"]) {
  const index = html.toLocaleLowerCase("pt-BR").indexOf(needle.toLocaleLowerCase("pt-BR"));
  console.log(`[ppl-web] ${needle} index=${index}${index >= 0 ? ` trecho=${html.slice(Math.max(0,index-300),index+1000).replace(/\s+/g," ")}` : ""}`);
}
