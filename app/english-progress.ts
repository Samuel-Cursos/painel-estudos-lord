export const ENGLISH_NAMESPACE = "english-course-v2";
export type LearningCell = { value: string; at: number };
export type LearningCells = Record<string, LearningCell>;
export type ExerciseResult = { answer: string; correct: boolean; assisted: boolean; attempts: number };
export type ReviewState = { stage: number; due: number; last: number };
const DAY = 86_400_000;
export function normalizeEnglish(value: string) {
  return value.trim().toLowerCase().replace(/[’‘]/g, "'").replace(/[.!?]+$/g, "").replace(/\s+/g, " ");
}
export function isEnglishAnswer(answer: string, accepted: string[]) {
  return accepted.some((candidate) => normalizeEnglish(answer) === normalizeEnglish(candidate));
}
function validValue(key: string, encoded: string) {
  let value;
  try { value = JSON.parse(encoded); } catch { return false; }
  if (key === "preferences") return value && [10, 15, 25].includes(value.minutes) && ["Cotidiano", "Leitura para o ENEM", "Viagens e trabalho"].includes(value.goal);
  if (key === "diagnostic") return value && Array.isArray(value.answers) && value.answers.length <= 12 && value.answers.every((v: unknown) => typeof v === "string" && v.length < 160) && typeof value.finished === "boolean" && Number.isFinite(value.at);
  if (key === "weekly") return value && typeof value.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.start) && Array.isArray(value.done) && value.done.length <= 7 && value.done.every((v: unknown) => Number.isInteger(v) && Number(v) >= 0 && Number(v) < 7);
  if (key.startsWith("project-")) return value && typeof value.draft === "string" && value.draft.length <= 1800 && typeof value.revision === "string" && value.revision.length <= 1800 && Array.isArray(value.checks) && value.checks.length === 3 && value.checks.every((v: unknown) => typeof v === "boolean");
  if (key.startsWith("conversation-")) return value && Array.isArray(value.answers) && value.answers.length <= 4 && value.answers.every((v: unknown) => typeof v === "string" && v.length <= 600);
  if (key === "sprint") return value && Array.isArray(value.ids) && value.ids.length <= 6 && value.ids.every((v: unknown) => typeof v === "string" && /^english-\d{2}:(choose|transfer)$/.test(v)) && Array.isArray(value.answers) && value.answers.length <= 6 && value.answers.every((v: unknown) => typeof v === "string" && v.length <= 200) && typeof value.finished === "boolean";
  if (key.startsWith("word-review:")) return value && Number.isInteger(value.stage) && value.stage >= 0 && value.stage <= 4 && Number.isFinite(value.due) && value.due > 0 && Number.isFinite(value.last) && value.last > 0 && typeof value.sentence === "string" && value.sentence.length <= 300;
  if (key.startsWith("lab-")) return value && typeof value.answer === "string" && value.answer.length <= 500 && Number.isInteger(value.index) && value.index >= 0 && value.index < 48 && typeof value.correct === "boolean" && typeof value.assisted === "boolean";
  const suffix = key.split(":")[1];
  if (suffix === "step") return Number.isInteger(value) && value >= 0 && value <= 4;
  if (suffix === "draft" || suffix === "revision") return typeof value === "string" && value.length <= 3500;
  if (suffix === "complete") return typeof value === "boolean";
  if (suffix === "checks") return Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === "boolean");
  if (suffix === "words") return Array.isArray(value) && value.length <= 20 && value.every((item) => typeof item === "string" && item.length < 200);
  if (suffix === "reinforced") return Array.isArray(value) && value.length <= 4 && value.every((item) => ["choose", "write", "listen", "transfer"].includes(item));
  if (suffix === "review") return value && Number.isInteger(value.stage) && value.stage >= 0 && value.stage <= 4 && Number.isFinite(value.due) && value.due > 0 && Number.isFinite(value.last) && value.last > 0;
  return value && typeof value.answer === "string" && value.answer.length <= 200 && typeof value.correct === "boolean" && typeof value.assisted === "boolean" && Number.isInteger(value.attempts) && value.attempts >= 0;
}
export function sanitizeCells(raw: unknown): LearningCells {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: LearningCells = {};
  for (const [key, cell] of Object.entries(raw).slice(0, 1000)) {
    if (!/^(preferences|diagnostic|weekly|sprint|project-(routine|email|story|argument)|conversation-(cafe|directions|interview|discussion)|lab-(dictation|order|reading|pronunciation)|word-review:english-(0[1-9]|[1-3]\d|4[0-8]):[0-3]|english-(0[1-9]|[1-3]\d|4[0-8]):(step|draft|revision|checks|complete|review|words|reinforced|answer-(choose|write|listen|transfer)))$/.test(key)) continue;
    if (!cell || typeof cell !== "object" || typeof cell.value !== "string" || cell.value.length > 6000 || !Number.isFinite(cell.at) || cell.at <= 0) continue;
    if (!validValue(key, cell.value)) continue;
    result[key] = { value: cell.value, at: cell.at };
  }
  return result;
}
export function mergeCells(a: LearningCells, b: LearningCells): LearningCells {
  const merged = { ...a };
  for (const [key, cell] of Object.entries(b)) if (!merged[key] || cell.at >= merged[key].at) merged[key] = cell;
  return merged;
}
export function readCell<T>(cells: LearningCells, key: string, fallback: T): T {
  try { return cells[key] ? JSON.parse(cells[key].value) as T : fallback; } catch { return fallback; }
}
export function scheduleReview(previous: ReviewState | null, remembered: boolean, now = Date.now()): ReviewState {
  // A same-day retry cannot move a card through several intervals.
  if (previous && now < previous.due && remembered) return previous;
  const stage = remembered ? Math.min((previous?.stage ?? -1) + 1, 4) : 0;
  return { stage, due: now + [1, 3, 7, 14, 30][stage] * DAY, last: now };
}
export function canFinishLesson(results: ExerciseResult[], draft: string, checks: boolean[], minimumWords = 8) {
  return results.length === 4 && results.every((r) => r.correct) && draft.trim().split(/\s+/).length >= minimumWords && checks.length === 3 && checks.every(Boolean);
}
