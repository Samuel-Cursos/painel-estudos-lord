export type ExamAreaId = "lc" | "ch" | "cn" | "math";

export type EnemAlternativeData = {
  letter: string;
  text: string;
  file: string;
};

export type EnemQuestionData = {
  year: number;
  index: number;
  area: ExamAreaId;
  language: "english" | "spanish" | null;
  context: string;
  files: string[];
  statement: string;
  alternatives: EnemAlternativeData[];
  correctAlternative: string | null;
  cancelled: boolean;
  previewImage: string;
};

export type EnemExamData = {
  year: number;
  total: 180;
  source: string;
  questions: EnemQuestionData[];
};

export const officialExamYears = Array.from({ length: 17 }, (_, index) => 2025 - index);

export const areaLabels: Record<ExamAreaId, string> = {
  lc: "Linguagens",
  ch: "Ciências Humanas",
  cn: "Ciências da Natureza",
  math: "Matemática",
};

export function examAreaForPosition(year: number, index: number): ExamAreaId {
  if (year === 2009) {
    if (index <= 45) return "cn";
    if (index <= 90) return "ch";
    if (index <= 135) return "lc";
    return "math";
  }
  if (year <= 2016) {
    if (index <= 45) return "ch";
    if (index <= 90) return "cn";
    if (index <= 135) return "lc";
    return "math";
  }
  if (index <= 45) return "lc";
  if (index <= 90) return "ch";
  if (index <= 135) return "cn";
  return "math";
}
