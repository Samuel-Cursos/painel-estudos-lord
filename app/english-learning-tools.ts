import { englishCourse } from "./english-course-data";
import { diagnosticQuestions } from "./english-practice-data";
import { readCell, type ExerciseResult, type LearningCells } from "./english-progress";

export type DiagnosticState = { answers: string[]; finished: boolean; at: number };
export function diagnosticAdvice(answers: string[]) {
  const groups = ["Fundamentos", "Comunicação", "Leitura", "Leitura crítica"].map((name) => {
    const questions = diagnosticQuestions.map((q, i) => ({ ...q, index: i })).filter((q) => q.group === name);
    return { name, correct: questions.filter((q) => q.answer === answers[q.index]).length, total: questions.length, lesson: questions.find((q) => q.answer !== answers[q.index])?.lesson ?? questions[0].lesson };
  });
  const firstGap = groups.find((group) => group.correct < 2);
  return { groups, score: groups.reduce((sum, group) => sum + group.correct, 0), lesson: firstGap?.lesson ?? 43 };
}
export function learningStats(cells: LearningCells) {
  const groups: Record<string, { attempts: number; correct: number; independent: number }> = {};
  const mistakes: { lessonId: string; title: string; questionId: string; prompt: string }[] = [];
  for (const lesson of englishCourse) for (const question of [...lesson.expansion.questions, lesson.expansion.transfer]) {
    const result = readCell<ExerciseResult | null>(cells, `${lesson.id}:answer-${question.id}`, null);
    if (!result?.attempts) continue;
    const group = groups[question.skill] ??= { attempts: 0, correct: 0, independent: 0 };
    group.attempts++; if (result.correct) group.correct++; if (result.correct && !result.assisted) group.independent++;
    if ((!result.correct || result.assisted) && !readCell<string[]>(cells, `${lesson.id}:reinforced`, []).includes(question.id)) mistakes.push({ lessonId: lesson.id, title: lesson.title, questionId: question.id, prompt: question.prompt });
  }
  return { groups, mistakes };
}
export function wordCount(text: string) { return text.trim() ? text.trim().split(/\s+/).length : 0; }
export function lessonMinimumWords(number: number) { return ({ 40: 60, 41: 80, 42: 60, 46: 100, 47: 40, 48: 150 } as Record<number, number>)[number] ?? (number > 24 ? 20 : 8); }
export function shuffled<T>(items: T[], seed: number): T[] {
  const result = [...items]; let value = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; const j = value % (i + 1); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function exportPortfolio(cells: LearningCells) {
  const sections = englishCourse.flatMap((lesson) => {
    const draft = readCell<string>(cells, `${lesson.id}:draft`, ""); const revision = readCell<string>(cells, `${lesson.id}:revision`, "");
    const words = readCell<string[]>(cells, `${lesson.id}:words`, []);
    if (!draft && !revision && !words.length) return [];
    return [`AULA ${lesson.number} — ${lesson.title}`, draft && `RASCUNHO\n${draft}`, revision && `VERSÃO REVISADA\n${revision}`, words.length && `EXPRESSÕES\n${words.join("\n")}`].filter(Boolean).join("\n\n");
  });
  for (const [key, cell] of Object.entries(cells)) if (/^project-/.test(key)) { const value = JSON.parse(cell.value); sections.push(`PROJETO ${key.slice(8)}\n\n${value.draft || ""}\n\nREVISÃO\n${value.revision || ""}`); }
  return `CLAREIA — MEU PORTFÓLIO DE INGLÊS\nRegistro pessoal de prática. Não é certificado de nível.\n\n${sections.join("\n\n────────────────────\n\n") || "Ainda não há textos ou expressões salvos."}`;
}
export function buildEnglishBook(unit: number) {
  const lessons = unit < 0 ? englishCourse : englishCourse.slice(unit * 6, unit * 6 + 6);
  return "CLAREIA — CADERNO DE ESTUDO DE INGLÊS\nConteúdo original de prática. Use junto da trilha e das revisões. Não é certificado de proficiência.\n\n" + lessons.map((lesson) => [
    `AULA ${lesson.number} — ${lesson.title}`, `OBJETIVO\n${lesson.goal}`, `EXPLICAÇÃO\n${lesson.content.concept}\n${lesson.expansion.why}`,
    `EXEMPLOS\n${lesson.content.model.join("\n")}`, `VOCABULÁRIO\n${lesson.content.vocabulary.map((word) => `${word.english} — ${word.portuguese}`).join("\n")}`,
    `TEXTO\n${lesson.expansion.passage}`, `TRADUÇÃO\n${lesson.expansion.translation}`,
    `ATIVIDADES\n${[...lesson.expansion.questions, lesson.expansion.transfer].map((q, i) => `${i + 1}. ${q.prompt}\n${q.options?.join(" / ") ?? "Complete por escrito."}`).join("\n\n")}`,
    `PRODUÇÃO\n${lesson.expansion.writingStart}\n\nAUTOAVALIAÇÃO\n${lesson.expansion.checklist.map((item) => `[ ] ${item}`).join("\n")}`,
    `CONFIRA DEPOIS DE TENTAR\n${[...lesson.expansion.questions, lesson.expansion.transfer].map((q, i) => `${i + 1}. ${q.answers.join(" / ")} — ${q.explanation}`).join("\n")}`,
  ].join("\n\n")).join("\n\n────────────────────────\n\n");
}
export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
