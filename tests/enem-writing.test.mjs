import assert from "node:assert/strict";
import test from "node:test";
import { enemWritingPrompts, getEnemWritingPrompt } from "../app/enem-writing-data.ts";
import { mergeEnemDrafts, restoreEnemDrafts, upsertEssay, writingDraftStorageKey } from "../app/enem-writing-drafts.ts";
import { findSupportOverlap, inspectWriting, readablePdfText } from "../app/enem-writing-review.ts";

const essay = (id, year, text, updatedAt = "2026-09-07T12:00:00.000Z") => ({
  id, enemYear: year, theme: getEnemWritingPrompt(year)?.theme ?? "Tema livre", text,
  date: "2026-09-07", updatedAt, status: "draft", score: "", competency: "", nextStep: "",
});

test("o catálogo cobre apenas 2020–2025 e abre as páginas verificadas da aplicação regular", () => {
  assert.deepEqual(enemWritingPrompts.map(({ year, page }) => [year, page]), [[2025, 20], [2024, 19], [2023, 19], [2022, 20], [2021, 21], [2020, 19]]);
  assert.equal(getEnemWritingPrompt(2026), undefined);
  assert.equal(getEnemWritingPrompt(2019), undefined);
  assert.match(getEnemWritingPrompt(2021).theme, /registro civil/);
});

test("rascunhos de anos diferentes e a revisão sobrevivem ao fechamento e são separados por conta", () => {
  const original = { 2020: essay(1, 2020, "Meu primeiro texto."), 2025: { ...essay(2, 2025, "Meu segundo texto."), selfReview: { "c1-language": true } } };
  const restored = restoreEnemDrafts(JSON.stringify(original));
  assert.equal(restored[2020].text, original[2020].text);
  assert.equal(restored[2025].text, original[2025].text);
  assert.equal(restored[2025].selfReview["c1-language"], true);
  assert.notEqual(writingDraftStorageKey("aluno-a"), writingDraftStorageKey("aluno-b"));
  assert.deepEqual(restoreEnemDrafts(null), {});
});

test("armazenamento inválido não cria redações com ano, tipo ou dados inesperados", () => {
  assert.throws(() => restoreEnemDrafts("{quebrado"));
  assert.throws(() => restoreEnemDrafts("[]"));
  const restored = restoreEnemDrafts(JSON.stringify({
    2020: { ...essay(1, 2020, "Texto"), unknown: "descartar", selfReview: { "c1-language": true, "c2-theme": "sim", unknown: true } },
    2021: essay(2, 2022, "Ano incorreto"),
    2022: { ...essay(3, 2022, ""), text: { invalid: true } },
    2019: essay(4, 2019, "Fora do período"),
  }));
  assert.deepEqual(Object.keys(restored), ["2020"]);
  assert.equal(restored[2020].unknown, undefined);
  assert.deepEqual(restored[2020].selfReview, { "c1-language": true });
});

test("sincronização mantém a edição local mais recente e recupera a última tentativa de cada ano", () => {
  const old = essay(1, 2025, "Versão antiga", "2026-09-06T12:00:00.000Z");
  const current = essay(1, 2025, "Edição local ainda não enviada");
  const other = essay(2, 2020, "Outro ano");
  const free = essay(3, undefined, "Redação livre preservada");
  const merged = mergeEnemDrafts({ 2025: current }, [old, other, free]);
  assert.equal(merged[2025].text, current.text);
  assert.equal(merged[2020].text, other.text);
  assert.deepEqual(Object.keys(merged).sort(), ["2020", "2025"]);
  const newer = essay(4, 2025, "Enviada de outro aparelho", "2026-09-08T12:00:00.000Z");
  assert.equal(mergeEnemDrafts(merged, [newer])[2025].id, 4);
  assert.equal(mergeEnemDrafts({ 2025: current }, [{ ...old, updatedAt: current.updatedAt }])[2025].text, current.text);
});

test("salvar e finalizar atualiza a mesma tentativa sem remover redações livres ou de outros anos", () => {
  const free = essay(1, undefined, "Minha redação livre");
  const first = essay(2, 2020, "Primeira tentativa");
  const current = essay(3, 2025, "Rascunho");
  const records = [free, first, current];
  const finished = { ...current, text: "Redação finalizada.", status: "finished" };
  const updated = upsertEssay(records, finished);
  assert.equal(updated.length, 3);
  assert.equal(updated[2].status, "finished");
  assert.strictEqual(updated[0], free);
  assert.strictEqual(updated[1], first);
  assert.equal(records[2].text, "Rascunho");
  assert.equal(upsertEssay(updated, essay(4, 2025, "Nova tentativa")).length, 4);
});

test("a revisão mede apenas aspectos objetivos e não inventa nota ou avaliação temática", () => {
  assert.deepEqual(inspectWriting(" \n"), { words: 0, paragraphs: 0, observations: [] });
  const result = inspectWriting("A ação ação fortalece a cidadania.\n\nPor isso, é preciso agir.");
  assert.equal(result.words, 11);
  assert.equal(result.paragraphs, 2);
  assert.deepEqual(result.observations.map(({ id }) => id), ["duplicates"]);
  assert.equal("score" in result, false);
  assert.equal("competency" in result, false);
  assert.ok(inspectWriting(Array(50).fill("palavra").join(" ")).observations.some(({ id }) => id === "long-sentences"));
});

test("a comparação reconhece um trecho literal longo e não sinaliza a repetição do próprio tema", () => {
  const theme = getEnemWritingPrompt(2023).theme;
  const support = "Para este teste escrevemos uma sequência longa de palavras que representa um trecho dos textos motivadores.";
  assert.ok(findSupportOverlap(support.toUpperCase(), support, theme));
  assert.equal(findSupportOverlap("Outra argumentação, com palavras e ideias próprias.", support, theme), null);
  assert.equal(findSupportOverlap(theme, `${theme} ${support}`, theme), null);
  assert.equal(findSupportOverlap("Palavras em comum", "Palavras em comum", theme), null);
  assert.equal(findSupportOverlap(support, "", theme), null);
});

test("fontes PDF sem Unicode legível não entram na leitura textual nem na comparação", () => {
  assert.equal(readablePdfText(Array(40).fill("Conteúdo legível.").join(" ")), true);
  assert.equal(readablePdfText("INSTRUÇÕES PARA A REDAÇÃO " + "\u0005\u0011\u0012abc ".repeat(40)), false);
  assert.equal(readablePdfText(""), false);
});

test("a rota publicada restringe anos, transmite PDF e usa a cópia verificada se o Inep falhar", async (t) => {
  const requested = [];
  let failed = false;
  t.mock.method(globalThis, "fetch", async (input) => {
    const url = String(input);
    requested.push(url);
    if (failed || url === getEnemWritingPrompt(2021).pdfUrl) return new Response("Unavailable", { status: 503 });
    return new Response("%PDF-1.7\nverified-test-body", { headers: { "Content-Type": "application/pdf" } });
  });
  // Vinext captura fetch ao carregar o Worker; a simulação deve preceder essa importação.
  const { default: worker } = await import("../dist/server/index.js");
  const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
  const context = { waitUntil() {}, passThroughOnException() {} };
  const call = (year) => worker.fetch(new Request(`http://localhost/api/enem-writing/${year}`), env, context);
  for (const invalid of ["2019", "2026", "NaN", "2025.pdf"]) assert.equal((await call(invalid)).status, 404);
  assert.equal(requested.length, 0);
  for (const year of [2020, 2021, 2022, 2023, 2024, 2025]) {
    const response = await call(year);
    assert.equal(response.status, 200, String(year));
    assert.equal(response.headers.get("content-type"), "application/pdf");
    assert.match(response.headers.get("cache-control"), /max-age/);
    assert.equal(await response.text(), "%PDF-1.7\nverified-test-body");
  }
  assert.ok(requested.includes(getEnemWritingPrompt(2021).fallbackPdfUrl));
  failed = true;
  const error = await call(2025);
  assert.equal(error.status, 502);
  assert.equal(error.headers.get("cache-control"), "no-store");
});
