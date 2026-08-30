import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { buildExamResult, buildExamTestAnswerPlan, classifyExamQuestion } from "../app/exam-analysis.ts";

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));

test("o diagnóstico classifica todas as 3.060 questões em um tema", async () => {
  const manifest = await readJson("public/enem-exams/manifest.json");
  let classified = 0;
  for (const { year } of manifest.years) {
    const exam = await readJson(`public/enem-exams/${year}.json`);
    for (const question of exam.questions) {
      const topic = classifyExamQuestion(question);
      assert.ok(topic.id, `${year}/${question.index} sem id de tema`);
      assert.ok(topic.topic, `${year}/${question.index} sem nome de tema`);
      assert.ok(topic.studyAction, `${year}/${question.index} sem orientação de estudo`);
      assert.equal(topic.area, question.area, `${year}/${question.index} classificada na área errada`);
      classified += 1;
    }
  }
  assert.equal(classified, 3060);
});

test("o resultado calcula erros por tema e distribui exatamente 100% do foco", async () => {
  const exam = await readJson("public/enem-exams/2024.json");
  const validQuestions = exam.questions.filter((question) => !question.cancelled).slice(0, 24);
  const answers = Object.fromEntries(validQuestions.map((question, index) => [
    String(question.index),
    index % 3 === 0 ? question.correctAlternative : question.alternatives.find((alternative) => alternative.letter !== question.correctAlternative).letter,
  ]));
  const result = buildExamResult(exam, answers, "2026-08-30T12:00:00.000Z");

  assert.equal(result.correct + result.wrong, validQuestions.length);
  assert.equal(result.blank + result.correct + result.wrong + result.cancelled, 180);
  assert.equal(result.finishedAt, "2026-08-30T12:00:00.000Z");
  assert.ok(result.topics.length > 0);
  assert.equal(result.topics.reduce((sum, topic) => sum + topic.focusPercent, 0), 100);
  assert.ok(result.topics.every((topic) => topic.wrong > 0 && topic.errorRate >= 1 && topic.errorRate <= 100));
  assert.ok(result.topics.every((topic) => topic.wrongQuestions.length === topic.wrong));
  assert.ok(result.topics.every((topic, index) => index === 0 || result.topics[index - 1].focusPercent >= topic.focusPercent));
});

test("uma tentativa sem erros não inventa prioridades de estudo", async () => {
  const exam = await readJson("public/enem-exams/2023.json");
  const answers = Object.fromEntries(exam.questions
    .filter((question) => !question.cancelled)
    .slice(0, 12)
    .map((question) => [String(question.index), question.correctAlternative]));
  const result = buildExamResult(exam, answers);

  assert.equal(result.wrong, 0);
  assert.deepEqual(result.topics, []);
});

test("o atalho de QA deixa a última questão para o ADM e mistura acertos e erros", async () => {
  const exam = await readJson("public/enem-exams/2024.json");
  const plan = buildExamTestAnswerPlan(exam);
  assert.equal(plan.targetQuestion, 180);
  assert.equal(plan.filledCount, plan.correctCount + plan.wrongCount);
  assert.ok(plan.correctCount > 0);
  assert.ok(plan.wrongCount > 0);
  assert.equal(plan.answers["180"], undefined);
  assert.equal(Object.keys(plan.answers).length, plan.filledCount);
});
