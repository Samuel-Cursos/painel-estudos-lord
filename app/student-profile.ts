export type StudentProfile = {
  uid: string;
  email: string;
  fullName: string;
  displayName: string;
  ra: string;
  raDigit: string;
  raKey: string;
  registrationComplete: true;
};

export function normalizeRa(value: string) {
  return value.replace(/\D/g, "").slice(0, 20);
}

export function normalizeRaDigit(value: string) {
  return value.replace(/[^0-9a-z]/gi, "").slice(0, 2).toUpperCase();
}

export function makeRaKey(ra: string, digit: string) {
  return `${normalizeRa(ra)}-${normalizeRaDigit(digit)}`;
}

export function isCompleteStudentProfile(value: unknown): value is StudentProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<StudentProfile>;
  return profile.registrationComplete === true
    && typeof profile.uid === "string"
    && typeof profile.email === "string"
    && typeof profile.fullName === "string"
    && profile.fullName.trim().length >= 3
    && typeof profile.displayName === "string"
    && profile.displayName.trim().length >= 2
    && typeof profile.ra === "string"
    && /^\d{5,20}$/.test(profile.ra)
    && typeof profile.raDigit === "string"
    && /^[0-9A-Z]{1,2}$/.test(profile.raDigit)
    && profile.raKey === makeRaKey(profile.ra, profile.raDigit);
}
