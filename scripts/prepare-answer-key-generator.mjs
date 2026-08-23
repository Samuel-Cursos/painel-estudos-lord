#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const file = new URL("./build-question-answer-key.mjs", import.meta.url);
let source = await readFile(file, "utf8");
const before = '(area === "MT" ? item.area === "mt" : item.area === "cn")';
const after = '(area === "MT" ? Number(item.index) >= 136 && Number(item.index) <= 180 : year <= 2016 ? Number(item.index) >= 1 && Number(item.index) <= 45 : Number(item.index) >= 91 && Number(item.index) <= 135)';
if (source.includes(before)) {
  source = source.replace(before, after);
  await writeFile(file, source, "utf8");
  console.log("[gabaritos] gerador preparado para as áreas oficiais por posição.");
} else if (source.includes(after)) {
  console.log("[gabaritos] gerador já está preparado.");
} else {
  throw new Error("Não encontrei o filtro de área esperado no gerador.");
}
