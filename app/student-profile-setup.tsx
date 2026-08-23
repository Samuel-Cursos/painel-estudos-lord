"use client";

import { FormEvent, useState } from "react";
import type { User } from "firebase/auth";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { firestore } from "./firebase-client";
import { makeRaKey, normalizeRa, normalizeRaDigit, studentProfileStorageKey, type StudentProfile } from "./student-profile";

type Props = { user: User; onComplete: (profile: StudentProfile) => void; onSignOut: () => Promise<void> };

export default function StudentProfileSetup({ user, onComplete, onSignOut }: Props) {
  const googleName = user.displayName?.trim() ?? "";
  const [fullName, setFullName] = useState(googleName);
  const [displayName, setDisplayName] = useState(googleName.split(" ")[0] ?? "");
  const [ra, setRa] = useState("");
  const [digit, setDigit] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const cleanName = fullName.trim().replace(/\s+/g, " ");
    const cleanDisplayName = displayName.trim().replace(/\s+/g, " ");
    const cleanRa = normalizeRa(ra);
    const cleanDigit = normalizeRaDigit(digit);
    if (cleanName.length < 3) return setError("Digite seu nome completo.");
    if (cleanDisplayName.length < 2) return setError("Escolha como quer ser chamado na Clareia.");
    if (!/^\d{5,20}$/.test(cleanRa)) return setError("Confira o RA: use somente os números.");
    if (!/^[0-9A-Z]{1,2}$/.test(cleanDigit)) return setError("Digite o dígito do RA.");
    if (!user.email) return setError("A conta Google precisa ter um e-mail válido.");
    const raKey = makeRaKey(cleanRa, cleanDigit);
    const profile: StudentProfile = { uid: user.uid, email: user.email, fullName: cleanName, displayName: cleanDisplayName, ra: cleanRa, raDigit: cleanDigit, raKey, registrationComplete: true };
    setSaving(true); setError("");
    try { window.localStorage.setItem(studentProfileStorageKey(user.uid), JSON.stringify(profile)); }
    catch { console.warn("[student-profile] O navegador não permitiu salvar o perfil localmente."); }
    try {
      const batch = writeBatch(firestore);
      batch.set(doc(firestore, "studentProfiles", user.uid), { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      batch.set(doc(firestore, "userDirectory", user.uid), { uid: user.uid, email: user.email, displayName: cleanDisplayName, photoURL: user.photoURL ?? "", lastSeenAt: serverTimestamp() }, { merge: true });
      await batch.commit();
    } catch (reason) {
      const code = typeof reason === "object" && reason && "code" in reason ? String(reason.code) : "";
      console.error("[student-profile] Não foi possível concluir o cadastro.", { code });
    } finally {
      setSaving(false);
      onComplete(profile);
    }
  }

  return <main className="student-lobby registration-page"><div className="lobby-glow lobby-glow-one" /><div className="lobby-glow lobby-glow-two" />
    <header className="lobby-brand"><span>C</span><div><strong>Clareia</strong><small>IDENTIFICAÇÃO DO ESTUDANTE</small></div></header>
    <section className="registration-shell"><div className="registration-intro"><span className="lobby-pill">ÚLTIMA ETAPA</span><h1>Agora a Clareia fica com a sua cara.</h1><p>A conta Google protege o acesso. O RA identifica seu perfil escolar e mantém seu progresso separado dos demais estudantes.</p><div className="registration-trust"><article><b>1</b><div><strong>Google</strong><small>Autenticação segura</small></div></article><article><b>2</b><div><strong>RA + dígito</strong><small>Identificação escolar</small></div></article><article><b>3</b><div><strong>Seu nome</strong><small>Experiência personalizada</small></div></article></div></div>
      <form className="registration-card" onSubmit={submit}><span className="eyebrow">CADASTRO DO ALUNO</span><h2>Complete seu perfil</h2><p className="registration-google">Conta conectada: <strong>{user.email}</strong></p>
        <label><span>Nome completo</span><input autoComplete="name" maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Seu nome completo" /></label>
        <label><span>Como quer ser chamado?</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Ex.: Samuel" maxLength={40} /></label>
        <div className="ra-fields"><label><span>RA</span><input inputMode="numeric" maxLength={20} value={ra} onChange={(event) => setRa(normalizeRa(event.target.value))} placeholder="Somente números" /></label><label><span>Dígito</span><input value={digit} onChange={(event) => setDigit(normalizeRaDigit(event.target.value))} placeholder="0" maxLength={2} /></label></div>
        {error && <div className="registration-error">{error}</div>}<button className="primary registration-submit" disabled={saving} type="submit">{saving ? "Criando seu perfil…" : "Entrar na Clareia →"}</button>
        <button className="registration-switch" type="button" onClick={() => void onSignOut()}>Usar outra conta Google</button><small className="registration-privacy">Não pedimos senha, série, data de nascimento ou e-mail institucional.</small>
      </form></section>
  </main>;
}
