import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import ts from "typescript";
import { sanitizeCells, mergeCells, isEnglishAnswer, scheduleReview, canFinishLesson, readCell } from "../app/english-progress.ts";

// Exercise the actual TypeScript content, without changing application imports.
function loadData(file) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("exports", "require", source)(exports, (path) => loadData(resolve(dirname(file), `${path}.ts`)));
  return exports;
}
const { englishCourse, englishUnits, englishResources } = loadData(new URL("../app/english-course-data.ts", import.meta.url).pathname);

test("48 aulas, oito unidades e 192 atividades válidas preservando os IDs antigos", () => {
  assert.equal(englishCourse.length, 48);
  assert.equal(englishUnits.length, 8);
  let count = 0;
  for (const [index, lesson] of englishCourse.entries()) {
    assert.equal(lesson.id, `english-${String(index + 1).padStart(2, "0")}`);
    assert.ok(lesson.content.concept.length > 30);
    assert.ok(lesson.expansion.why.length + lesson.content.concept.length > 150);
    assert.ok(lesson.expansion.passage.length > 50);
    assert.ok(lesson.expansion.translation.length > 40);
    assert.equal(lesson.expansion.checklist.length, 3);
    const questions = [...lesson.expansion.questions, lesson.expansion.transfer];
    assert.deepEqual(questions.map((q) => q.id), ["choose", "write", "listen", "transfer"]);
    for (const question of questions) {
      count++;
      assert.ok(question.hint && question.explanation && question.prompt && question.answers.length);
      assert.ok(question.answers.every((answer) => isEnglishAnswer(answer, question.answers)));
      if (question.options) {
        assert.equal(new Set(question.options).size, question.options.length);
        assert.equal(question.options.filter((option) => isEnglishAnswer(option, question.answers)).length, 1);
      }
      const key = `${lesson.id}:answer-${question.id}`;
      assert.ok(sanitizeCells({ [key]: { value: JSON.stringify({ answer: "test", correct: false, assisted: false, attempts: 0 }), at: 1 } })[key]);
    }
  }
  assert.equal(count, 192);
});

test("respostas toleram caixa, espaços e apóstrofos, mas não erros gramaticais", () => {
  assert.ok(isEnglishAnswer("  I am a STUDENT! ", ["I am a student."]));
  assert.ok(isEnglishAnswer("isn’t", ["isn't"]));
  assert.ok(!isEnglishAnswer("I student am", ["I am a student."]));
  assert.ok(!isEnglishAnswer("isnt", ["isn't"]));
  assert.ok(!isEnglishAnswer("thirty", ["thirteen"]));
  assert.ok(!isEnglishAnswer("", ["in"]));
});

test("revisão espaça 1, 3, 7, 14 e 30 dias e não avança várias vezes por dia", () => {
  const day = 86_400_000;
  let now = 1_800_000_000_000;
  let state = null;
  for (const interval of [1, 3, 7, 14, 30, 30]) {
    state = scheduleReview(state, true, now);
    assert.equal(state.due - now, interval * day);
    assert.deepEqual(scheduleReview(state, true, now + 1000), state);
    now = state.due;
  }
  const reset = scheduleReview(state, false, now);
  assert.equal(reset.stage, 0);
  assert.equal(reset.due - now, day);
});

test("mescla progresso por célula sem apagar outra aula ou rascunho mais novo", () => {
  const remote = { "english-01:draft": { value: '"cloud"', at: 3 }, "english-02:step": { value: "2", at: 2 } };
  const pending = { "english-01:draft": { value: '"offline"', at: 4 }, "english-03:step": { value: "1", at: 5 } };
  const merged = mergeCells(remote, pending);
  assert.equal(readCell(merged, "english-01:draft", ""), "offline");
  assert.equal(readCell(merged, "english-02:step", 0), 2);
  assert.equal(readCell(mergeCells(merged, remote), "english-01:draft", ""), "offline");
  assert.equal(Object.keys(merged).length, 3);
  assert.equal(remote["english-01:draft"].at, 3);
});

test("sanitização limita chaves, tamanho e timestamps sem guardar áudio", () => {
  assert.deepEqual(sanitizeCells(null), {});
  assert.deepEqual(sanitizeCells([]), {});
  assert.deepEqual(sanitizeCells({
    "english-49:draft": { value: '"x"', at: 1 },
    "english-01:audio": { value: "data:audio", at: 1 },
    "english-01:draft": { value: "x".repeat(6001), at: 1 },
    "english-02:step": { value: "0", at: NaN },
    "english-03:step": { value: 0, at: 1 },
  }), {});
  assert.equal(readCell({ key: { value: "{bad", at: 1 } }, "key", "fallback"), "fallback");
});

const learningTools = loadData(new URL("../app/english-learning-tools.ts", import.meta.url).pathname);
const practiceData = loadData(new URL("../app/english-practice-data.ts", import.meta.url).pathname);
const cell = (value, at = 1) => ({ value: JSON.stringify(value), at });

test("diagnóstico indica lacunas sem atribuir CEFR ou medir habilidades não testadas", () => {
  assert.equal(practiceData.diagnosticQuestions.length, 12);
  assert.equal(learningTools.diagnosticAdvice([]).score, 0);
  assert.equal(learningTools.diagnosticAdvice([]).lesson, 2);
  const answers = practiceData.diagnosticQuestions.map((q) => q.answer);
  assert.equal(learningTools.diagnosticAdvice(answers).score, 12);
  assert.equal(learningTools.diagnosticAdvice(answers).lesson, 43);
  answers[3] = "__skip__"; answers[4] = "__skip__";
  assert.equal(learningTools.diagnosticAdvice(answers).lesson, 26);
  assert.equal(learningTools.diagnosticAdvice(answers).level, undefined);
  for (const question of practiceData.diagnosticQuestions) assert.equal(question.options.filter((value) => value === question.answer).length, 1);
});

test("novas atividades persistem junto das antigas, sem aceitar tipos inválidos", () => {
  const raw = {
    "english-01:draft": cell("My first text"), "english-48:draft": cell("My final project"),
    "diagnostic": cell({ answers: ["is", "__skip__"], finished: false, at: 1 }),
    "project-email": cell({ draft: "Dear teacher", revision: "Dear Ms Reed", checks: [true, false, false] }),
    "conversation-cafe": cell({ answers: ["Tea, please."] }),
    "word-review:english-48:3": cell({ stage: 1, due: 100, last: 1, sentence: "I revise my work." }),
    "english-48:reinforced": cell(["choose"]),
    "weekly": cell({ start: "2026-09-14", done: [0, 2] }),
    "sprint": cell({ ids: ["english-48:choose"], answers: ["test"], finished: true }),
    "lab-dictation": cell({ answer: "Hello!", index: 0, correct: true, assisted: false }),
  };
  assert.deepEqual(sanitizeCells(raw), raw);
  assert.deepEqual(sanitizeCells({ "project-email": cell({ draft: 3, revision: "", checks: [] }), "conversation-cafe": cell({ answers: [null] }), "word-review:english-48:4": raw["word-review:english-48:3"], "diagnostic": cell({ answers: [null], finished: true, at: 1 }) }), {});
});

test("a fila de reforço diferencia erro, acerto com apoio e acerto independente", () => {
  const progress = {
    "english-01:answer-choose": cell({ answer: "I am a student.", correct: true, assisted: false, attempts: 1 }),
    "english-02:answer-choose": cell({ answer: "are", correct: true, assisted: true, attempts: 2 }),
    "english-03:answer-write": cell({ answer: "is", correct: false, assisted: false, attempts: 1 }),
  };
  let stats = learningTools.learningStats(progress);
  assert.equal(stats.mistakes.length, 2);
  assert.deepEqual(stats.groups.Estrutura, { attempts: 3, correct: 2, independent: 1 });
  stats = learningTools.learningStats({ ...progress, "english-02:reinforced": cell(["choose"]) });
  assert.equal(stats.mistakes.length, 1);
  assert.deepEqual(stats.groups.Estrutura, { attempts: 3, correct: 2, independent: 1 });
});

test("o portfólio preserva primeira e segunda versão e não exporta toda a conta", () => {
  const portfolio = learningTools.exportPortfolio({
    "english-48:draft": cell("First draft"), "english-48:revision": cell("Improved draft"),
    "project-email": cell({ draft: "My email", revision: "Revised email", checks: [false, false, false] }),
    "diagnostic": cell({ answers: ["private diagnostic answer"], finished: false, at: 1 }),
  });
  assert.match(portfolio, /First draft/); assert.match(portfolio, /Improved draft/);
  assert.match(portfolio, /My email/); assert.match(portfolio, /Revised email/);
  assert.doesNotMatch(portfolio, /private diagnostic answer/);
});

test("apostila tem 48 aulas ou uma unidade completa, com exercícios e gabaritos", () => {
  const all = learningTools.buildEnglishBook(-1);
  const last = learningTools.buildEnglishBook(7);
  assert.equal((all.match(/AULA \d+ —/g) ?? []).length, 48);
  assert.equal((last.match(/AULA \d+ —/g) ?? []).length, 6);
  assert.match(last, /AULA 48/); assert.doesNotMatch(last, /AULA 1 —/);
  assert.match(last, /CONFIRA DEPOIS DE TENTAR/); assert.match(last, /AUTOAVALIAÇÃO/);
});

test("embaralhamento preserva todas as palavras e é reproduzível por rodada", () => {
  const words = ["I", "think", "that", "that", "is", "useful"];
  const result = learningTools.shuffled(words, 42);
  assert.deepEqual([...result].sort(), [...words].sort());
  assert.deepEqual(result, learningTools.shuffled(words, 42));
  assert.notDeepEqual(result, words);
});

test("produção avançada exige o volume pedido e não aceita o mínimo introdutório", () => {
  const results = Array.from({ length: 4 }, () => ({ correct: true, assisted: false, attempts: 1, answer: "x" }));
  const minimum = learningTools.lessonMinimumWords(48);
  assert.equal(minimum, 150);
  assert.ok(!canFinishLesson(results, "word ".repeat(149), [true, true, true], minimum));
  assert.ok(canFinishLesson(results, "word ".repeat(150), [true, true, true], minimum));
  assert.equal(learningTools.wordCount(" \n "), 0);
});

test("conclusão exige exercícios, produção e autoavaliação; não mede fluência", () => {
  const results = Array.from({ length: 4 }, () => ({ correct: true, assisted: true, attempts: 2, answer: "in" }));
  assert.ok(canFinishLesson(results, "Hello my name is Ana and I study English.", [true, true, true]));
  assert.ok(!canFinishLesson(results.slice(1), "Hello my name is Ana and I study English.", [true, true, true]));
  assert.ok(!canFinishLesson(results, "Hello", [true, true, true]));
  assert.ok(!canFinishLesson(results, "Hello my name is Ana and I study English.", [true, false, true]));
});

test("apoio opcional só copia texto, sem API de IA ou transmissão de gravação", () => {
  const ui = readFileSync(new URL("../app/english-workspace.tsx", import.meta.url), "utf8");
  const audio = readFileSync(new URL("../app/english-audio.tsx", import.meta.url), "utf8");
  assert.match(ui, /clipboard.writeText\(prompt\)/);
  assert.match(ui, /includeDraft && draft/);
  assert.doesNotMatch(ui + audio, /fetch\(|OPENAI_API_KEY|GEMINI_API_KEY|generateText|transcribe/);
  assert.match(audio, /getTracks\(\).forEach\(\(track\) => track.stop\(\)\)/);
  assert.match(audio, /URL.revokeObjectURL/);
  assert.match(audio, /60_000/);
  assert.match(audio, /Nenhuma voz em inglês disponível/);
  assert.equal(englishResources.length, 3);
  for (const resource of englishResources) assert.ok(resource.url.startsWith("https://") && resource.task.length > 30);
});

test("cache é separado por UID e alterações ENEM não sobrescrevem o inglês", () => {
  const hook = readFileSync(new URL("../app/use-english-progress.ts", import.meta.url), "utf8");
  const dashboard = readFileSync(new URL("../app/study-dashboard.tsx", import.meta.url), "utf8");
  assert.match(hook, /clareia-english-v2:\$\{uid\}/);
  assert.match(hook, /"users", uid, "dashboard", "main"/);
  assert.match(hook, /runTransaction/);
  assert.match(hook, /skillProgress: \{ \[ENGLISH_NAMESPACE\]: merged \}/);
  assert.match(dashboard, /skillProgress: \{ \[skill.id\]: next\[skill.id\] \}/);
  assert.match(dashboard, /EnglishWorkspace key=\{user.uid\}/);
});
