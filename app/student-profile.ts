import { schoolYears, type SchoolYear } from "./school-data";

export type StudentProfile = {
  uid: string;
  email: string;
  name: string;
  institutionalEmail: string;
  ra: string;
  raKey: string;
  raDigit: string;
  entrySchoolYear: SchoolYear;
  schoolYear?: SchoolYear;
  entryAcademicYear: number;
  registrationComplete: true;
};

const yearOrder = schoolYears.map((item) => item.id);

export function normalizeRa(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeRaDigit(value: string) {
  return value.replace(/[^0-9a-z]/gi, "").slice(0, 2).toUpperCase();
}

export function isInstitutionalEmail(value: string) {
  const email = value.trim().toLocaleLowerCase("pt-BR");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  return !/(^|\.)(gmail|hotmail|outlook|yahoo|icloud)\./.test(email.split("@")[1] ?? "");
}

export function currentAcademicYear(date = new Date()) {
  return date.getFullYear();
}

export function currentSchoolYear(profile: Pick<StudentProfile, "entrySchoolYear" | "entryAcademicYear">, date = new Date()): SchoolYear {
  const initialIndex = Math.max(0, yearOrder.indexOf(profile.entrySchoolYear));
  const elapsedYears = Math.max(0, currentAcademicYear(date) - profile.entryAcademicYear);
  return yearOrder[Math.min(yearOrder.length - 1, initialIndex + elapsedYears)];
}

export function nextAcademicChange(date = new Date()) {
  return new Date(date.getFullYear() + 1, 0, 1);
}

export function isCompleteStudentProfile(value: unknown): value is StudentProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<StudentProfile>;
  return profile.registrationComplete === true
    && typeof profile.uid === "string"
    && typeof profile.email === "string"
    && typeof profile.name === "string"
    && typeof profile.institutionalEmail === "string"
    && typeof profile.raKey === "string"
    && typeof profile.raDigit === "string"
    && typeof profile.entryAcademicYear === "number"
    && Boolean(profile.entrySchoolYear && yearOrder.includes(profile.entrySchoolYear));
}
