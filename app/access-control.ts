export const OWNER_EMAIL = "samuelreisalves765@gmail.com";
export const PROTECTED_PDF_META_DOC = "cadernoSame";
export const PROTECTED_PDF_CHUNKS = "protectedMaterialChunks";
export const PDF_CHUNK_SIZE = 700 * 1024;

export function normalizeEmail(email?: string | null) {
  return (email ?? "").trim().toLocaleLowerCase("pt-BR");
}

export function isOwner(email?: string | null) {
  return normalizeEmail(email) === OWNER_EMAIL;
}

export type AppSettings = {
  assessmentsEnabled: boolean;
  pdfEnabled: boolean;
  publicPracticeEnabled: boolean;
  maintenanceMode: boolean;
  announcementEnabled: boolean;
  announcement: string;
  dailyQuestionGoal: number;
};

export const defaultAppSettings: AppSettings = {
  assessmentsEnabled: true,
  pdfEnabled: true,
  publicPracticeEnabled: true,
  maintenanceMode: false,
  announcementEnabled: false,
  announcement: "",
  dailyQuestionGoal: 10,
};
