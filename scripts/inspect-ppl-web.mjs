#!/usr/bin/env node

const target = "https://www.qconcursos.com/questoes-do-enem/provas/inep-2012-enem-exame-nacional-do-ensino-medio-primeiro-e-segundo-dia-ppl/questoes?page=7";
for (const url of [
  `https://r.jina.ai/http://${target.replace(/^https?:\/\//, "")}`,
  `https://r.jina.ai/https://${target.replace(/^https?:\/\//, "")}`,
]) {
  try {
    const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 Clareia" } });
    const text = await response.text();
    console.log(`[ppl-web] proxy=${url.slice(0,45)} status=${response.status} bytes=${text.length}`);
    for (const needle of ["Respostas", "121: E", "Q889074", "Matemática"]) {
      const index = text.toLocaleLowerCase("pt-BR").indexOf(needle.toLocaleLowerCase("pt-BR"));
      console.log(`[ppl-web] ${needle} index=${index}${index >= 0 ? ` trecho=${text.slice(Math.max(0,index-250),index+1100).replace(/\s+/g," ")}` : ""}`);
    }
  } catch (error) {
    console.log(`[ppl-web] falha ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
