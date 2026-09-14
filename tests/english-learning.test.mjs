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

test("24 aulas originais preservadas, quatro unidades e 96 atividades válidas", () => {
  assert.equal(englishCourse.length, 24);
  assert.equal(englishUnits.length, 4);
  let count = 0;
  for (const [index, lesson] of englishCourse.entries()) {
    assert.equal(lesson.id, `english-${String(index + 1).padStart(2, "0")}`);
    assert.ok(lesson.content.concept.length > 30);
    assert.ok(lesson.expansion.why.length > 60);
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
  assert.equal(count, 96);
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
    "english-25:draft": { value: "x", at: 1 },
    "english-01:audio": { value: "data:audio", at: 1 },
    "english-01:draft": { value: "x".repeat(6001), at: 1 },
    "english-02:step": { value: "0", at: NaN },
    "english-03:step": { value: 0, at: 1 },
  }), {});
  assert.equal(readCell({ key: { value: "{bad", at: 1 } }, "key", "fallback"), "fallback");
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
