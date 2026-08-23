#!/usr/bin/env node

const url = "https://raw.githubusercontent.com/johanessevero/cnn_classificacao_itens_enem_projeto_final_puc/main/data/df_itens_geral.csv";
const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 Clareia answer-key audit" } });
console.log(`[enem-dataset] status=${response.status} type=${response.headers.get("content-type")} length=${response.headers.get("content-length")}`);
if (!response.ok) process.exit(1);
const text = await response.text();
console.log(`[enem-dataset] chars=${text.length}`);
console.log(`[enem-dataset] inicio=${JSON.stringify(text.slice(0, 1800))}`);
const firstLine = text.split(/\r?\n/, 1)[0];
console.log(`[enem-dataset] cabecalho=${firstLine}`);
