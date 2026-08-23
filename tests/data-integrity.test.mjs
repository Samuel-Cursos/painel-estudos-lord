import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function extractJson(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Marcador ausente: ${startMarker}`);
  const contentStart = start + startMarker.length;
  const end = source.indexOf(endMarker, contentStart);
  assert.notEqual(end, -1, `Marcador final ausente: ${endMarker}`);
  return JSON.parse(source.slice(contentStart, end));
}

test("o mapa ENEM preserva os números publicados", async () => {
  const source = await read("app/enem-data.ts");
  const data = extractJson(source, "export const enemData = ", " as const;");
  assert.equal(data.skills.length, 747);
  assert.equal(data.exams.length, 35);
  assert.equal(data.simulations.length, 12);
  assert.equal(data.exams.length + data.simulations.length, 47);
  assert.equal(data.skills.filter((skill) => !skill.subject || !skill.level || !skill.topic || !skill.skill || !skill.relevance).length, 0);
});

test("as 1.000 questões têm matéria, trecho válido e versão textual", async () => {
  const [bankSource, textSource] = await Promise.all([read("app/question-bank-data.ts"), read("app/question-text-data.ts")]);
  const questionsMatch = bankSource.match(/export const questions: Question\[\] = (\[.*\]);\s*$/s);
  const textMatch = textSource.match(/export const questionText: Record<string, QuestionText> = (\{.*\});\s*$/s);
  assert.ok(questionsMatch);
  assert.ok(textMatch);
  const questions = JSON.parse(questionsMatch[1]);
  const questionText = JSON.parse(textMatch[1]);
  const counts = Object.groupBy(questions, (question) => question.subject);

  assert.equal(questions.length, 1000);
  assert.deepEqual(Object.fromEntries(Object.entries(counts).map(([subject, items]) => [subject, items.length])), { math: 400, biology: 200, chemistry: 200, physics: 200 });
  assert.equal(Object.keys(questionText).length, 1000);
  for (const question of questions) {
    assert.ok(questionText[question.id]?.text.trim(), `Texto ausente em ${question.id}`);
    assert.ok(question.segments.length > 0, `Trecho ausente em ${question.id}`);
    assert.ok(question.segments.every((segment) => segment.page > 0 && segment.width > 0 && segment.height > 0), `Trecho inválido em ${question.id}`);
  }
});

test("as 24 aulas de Inglês têm conteúdo interno e check de domínio", async () => {
  const [course, content, mastery] = await Promise.all([read("app/course-data.ts"), read("app/english-lesson-content.ts"), read("app/mastery-data.ts")]);
  const englishBlock = course.slice(course.indexOf("const englishTopics"), course.indexOf("const mathTopics"));
  const lessonCount = (englishBlock.match(/\{ title:/g) ?? []).length;
  const contentIds = new Set([...content.matchAll(/^\s+"(english-\d{2})": \{/gm)].map((match) => match[1]));
  const masteryIds = new Set([...mastery.matchAll(/^\s+"(english-\d{2})": q\(/gm)].map((match) => match[1]));

  assert.equal(lessonCount, 24);
  assert.equal(contentIds.size, 24);
  assert.equal(masteryIds.size, 24);
  for (let number = 1; number <= 24; number += 1) {
    const id = `english-${String(number).padStart(2, "0")}`;
    assert.ok(contentIds.has(id), `Conteúdo ausente em ${id}`);
    assert.ok(masteryIds.has(id), `Check ausente em ${id}`);
  }
});

test("as provas internas cobrem 2009 a 2025 com 180 questões válidas", async () => {
  const manifest = JSON.parse(await read("public/enem-exams/manifest.json"));
  assert.deepEqual(manifest.years.map((item) => item.year), Array.from({ length: 17 }, (_, index) => 2025 - index));
  assert.equal(manifest.years.reduce((sum, item) => sum + item.total, 0), 3060);

  for (const { year } of manifest.years) {
    const exam = JSON.parse(await read(`public/enem-exams/${year}.json`));
    assert.equal(exam.questions.length, 180, `${year} sem 180 questões`);
    assert.deepEqual(exam.questions.map((question) => question.index), Array.from({ length: 180 }, (_, index) => index + 1));
    assert.deepEqual(Object.fromEntries(Object.entries(Object.groupBy(exam.questions, (question) => question.area)).map(([area, items]) => [area, items.length])), { lc: 45, ch: 45, cn: 45, math: 45 });
    for (const question of exam.questions) {
      assert.equal(question.alternatives.length, 5, `${year}/${question.index} sem cinco alternativas`);
      assert.ok(question.alternatives.every((alternative) => alternative.letter && (alternative.text || alternative.file)), `${year}/${question.index} com alternativa vazia`);
      assert.ok(question.cancelled || /^[A-E]$/.test(question.correctAlternative), `${year}/${question.index} sem gabarito`);
      assert.ok(question.cancelled || question.context || question.statement || question.files.length || question.previewImage, `${year}/${question.index} sem enunciado`);
    }
  }
});

test("o Modo Prova é interno, contínuo e retomável", async () => {
  const [simulator, library, examData, bank] = await Promise.all([
    read("app/official-exam-simulator.tsx"),
    read("app/enem-exam-library.tsx"),
    read("app/enem-exam-data.ts"),
    read("app/question-bank.tsx"),
  ]);
  assert.match(simulator, /fetch\(`\/enem-exams\/\$\{year\}\.json`\)/);
  assert.match(simulator, /QUESTÃO \{question\.index\} DE 180/);
  assert.match(simulator, /currentQuestion/);
  assert.match(simulator, /Finalizar prova e ver resultado/);
  assert.match(simulator, /resposta correta é/);
  assert.doesNotMatch(simulator, /<iframe/);
  assert.doesNotMatch(simulator, /day: 1 \| 2/);
  assert.match(examData, /Array\.from\(\{ length: 17 \}/);
  assert.match(library, /officialExamYears/);
  assert.match(library, /3\.060/);
  assert.match(bank, /useState<BankMode>\("main"\)/);
  assert.match(bank, /Banco principal/);
  assert.match(bank, /Questões rápidas/);
  assert.match(bank, /bankMode === "main"/);
});

test("Redação oferece propostas, editor, rascunho e conteúdo do ADM", async () => {
  const [studio, materials, admin, rules] = await Promise.all([read("app/writing-studio.tsx"), read("app/writing-materials.ts"), read("app/admin-panel.tsx"), read("firestore.rules")]);
  assert.equal((materials.match(/kind: "prompt"/g) ?? []).length, 3);
  assert.equal((materials.match(/kind: "model"/g) ?? []).length, 1);
  assert.match(studio, /clareia-writing-draft-/);
  assert.match(studio, /Projeto de texto/i);
  assert.match(studio, /Editor de produção/i);
  assert.match(admin, /createWritingMaterial/);
  assert.match(rules, /match \/writingMaterials\/\{materialId\}/);
  assert.match(rules, /'examAnswerSheets'/);
});

test("o cadastro valida RA sem bloquear contas diferentes globalmente", async () => {
  const [rules, setup, dashboard, profile] = await Promise.all([read("firestore.rules"), read("app/student-profile-setup.tsx"), read("app/study-dashboard.tsx"), read("app/student-profile.ts")]);
  assert.match(rules, /raKey\.matches\('\^\[0-9\]\{5,20\}-\[0-9A-Z\]\{1,2\}\$'\)/);
  assert.doesNotMatch(rules, /raKey\.matches\('\^\[0-9\]\{5,20\}\$'\)/);
  assert.doesNotMatch(setup, /studentRaRegistry/);
  assert.doesNotMatch(rules, /getAfter\([^\n]*studentRaRegistry/);
  assert.match(rules, /match \/studentRaRegistry\/\{raKey\}[\s\S]*allow read, create, update, delete: if isOwner\(\);/);
  assert.match(profile, /clareia-student-profile-/);
  assert.match(setup, /studentProfileStorageKey\(user\.uid\)/);
  assert.match(dashboard, /studentProfileStorageKey\(currentUser\.uid\)/);
  assert.match(setup, /finally[\s\S]*onComplete\(profile\)/);
});
