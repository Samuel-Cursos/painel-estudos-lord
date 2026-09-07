import type { EssayRecord } from "./writing-studio";

export type EnemDraftMap = Record<string, EssayRecord>;

export function writingDraftStorageKey(userId: string) {
  return `clareia-enem-writing-v1-${userId}`;
}

export function restoreEnemDrafts(raw: string | null): EnemDraftMap {
  const source: unknown = JSON.parse(raw ?? "{}");
  if (!source || typeof source !== "object" || Array.isArray(source)) throw new Error("Rascunhos inválidos");
  const drafts: EnemDraftMap = {};
  for (const [key, value] of Object.entries(source)) {
    if (!/^202[0-5]$/.test(key) || !value || typeof value !== "object") continue;
    const item = value as Partial<EssayRecord>;
    if (item.enemYear !== Number(key) || !Number.isSafeInteger(item.id) || !item.id || typeof item.theme !== "string" || typeof item.text !== "string") continue;
    const string = (v: unknown, max = 12000) => typeof v === "string" ? v.slice(0, max) : "";
    const checks = item.selfReview && typeof item.selfReview === "object" ? Object.fromEntries(Object.entries(item.selfReview).filter(([id, checked]) => /^c[1-5]-[a-z]+$/.test(id) && typeof checked === "boolean")) : {};
    drafts[key] = {
      id: item.id!, enemYear: Number(key), theme: item.theme.slice(0, 180), materialId: `enem-writing-${key}`,
      date: string(item.date, 10), text: string(item.text), thesis: string(item.thesis, 500),
      argument1: string(item.argument1, 600), argument2: string(item.argument2, 600), intervention: string(item.intervention, 700),
      score: string(item.score, 4), competency: string(item.competency, 100), nextStep: string(item.nextStep, 600),
      status: item.status === "finished" ? "finished" : "draft", updatedAt: string(item.updatedAt, 40), selfReview: checks,
    };
  }
  return drafts;
}

export function mergeEnemDrafts(local: EnemDraftMap, essays: EssayRecord[]): EnemDraftMap {
  const next = { ...local };
  for (const essay of essays) {
    if (!essay.enemYear || essay.enemYear < 2020 || essay.enemYear > 2025) continue;
    const key = String(essay.enemYear);
    const current = next[key];
    const time = (item: EssayRecord) => Date.parse(item.updatedAt || item.date) || 0;
    if (!current || time(essay) > time(current)) next[key] = essay;
  }
  return next;
}

export function upsertEssay(essays: EssayRecord[], record: EssayRecord) {
  return essays.some((item) => item.id === record.id)
    ? essays.map((item) => item.id === record.id ? record : item)
    : [record, ...essays];
}
