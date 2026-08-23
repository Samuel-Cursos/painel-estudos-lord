import { questions } from "./question-bank-data";

/**
 * Gabaritos confirmados das questões originais do banco em PDF.
 *
 * O arquivo gerado question-bank-data.ts guarda apenas os recortes do PDF e a
 * origem da questão. Enquanto os gabaritos confirmados são adicionados aqui,
 * eles são aplicados aos objetos do banco antes da tela de questões ser montada.
 */
const answerKey: Record<string, string> = {
  // ENEM 2020 — questão dos assentos do ônibus (razão 16/42).
  "math-001": "A",
};

type QuestionWithAnswer = (typeof questions)[number] & { correctAnswer?: string };

for (const question of questions as QuestionWithAnswer[]) {
  const correctAnswer = answerKey[question.id];
  if (correctAnswer) question.correctAnswer = correctAnswer;
}
