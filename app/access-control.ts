export const OWNER_EMAIL = "samuelreisalves765@gmail.com";
export const PROTECTED_PDF_PATH = "protected/caderno-same.pdf";

export function normalizeEmail(email?: string | null) {
  return (email ?? "").trim().toLocaleLowerCase("pt-BR");
}

export function isOwner(email?: string | null) {
  return normalizeEmail(email) === OWNER_EMAIL;
}

export type AppSettings = {
  assessmentsEnabled: boolean;
  pdfEnabled: boolean;
};

export const defaultAppSettings: AppSettings = {
  assessmentsEnabled: true,
  pdfEnabled: true,
};
