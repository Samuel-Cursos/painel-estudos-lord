import type { Question as BaseQuestion, QuestionChapter as BaseQuestionChapter, QuestionSubject as BaseQuestionSubject } from "./question-bank-data";

export type QuestionSubject = BaseQuestionSubject | "portuguese" | "history" | "geography" | "philosophy" | "sociology";
export type Question = Omit<BaseQuestion, "subject"> & { subject: QuestionSubject; native?: boolean; correctAnswer?: string };
export type QuestionChapter = Omit<BaseQuestionChapter, "subject"> & { subject: QuestionSubject };
