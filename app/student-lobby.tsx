"use client";

import { useState } from "react";
import type { User } from "firebase/auth";
import { currentAcademicYear, isInstitutionalEmail, normalizeRa, normalizeRaDigit } from "./student-profile";
import { schoolYears, type SchoolYear } from "./school-data";

export type RegistrationDraft = {
  name: string;
  institutionalEmail: string;
  ra: string;
  raDigit: string;
  schoolYear: SchoolYear;
};

type Props = {
  user: User | null;
  loading: boolean;
  suggestedYear?: SchoolYear | null;
  onGoogleLogin: () => Promise<void>;
  onRegister: (draft: RegistrationDraft) => Promise<{ ok: boolean; message: string }>;
  onSignOut: () => Promise<void>;
};

export default function StudentLobby({ user, loading, suggestedYear, onGoogleLogin, onRegister, onSignOut }: Props) {
  const [name, setName] = useState(user?.displayName ?? "");
  const [ra, setRa] = useState("");
  const [raDigit, setRaDigit] = useState("");
  const [institutionalEmail, setInstitutionalEmail] = useState(user?.email && isInstitutionalEmail(user.email) ? user.email : "");
  const [schoolYear, setSchoolYear] = useState<SchoolYear | "">(suggestedYear ?? "");
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    const normalizedRa = normalizeRa(ra);
    const normalizedDigit = normalizeRaDigit(raDigit);
    if (name.trim().length < 3) return setMessage("Digite seu nome completo.");
    if (normalizedRa.length < 5) return setMessage("Confira o número do RA.");
    if (!normalizedDigit) return setMessage("Digite o dígito do RA.");
    if (!isInstitutionalEmail(institutionalEmail)) return setMessage("Digite um e-mail institucional válido, diferente do Gmail pessoal.");
    if (!schoolYear) return setMessage("Escolha sua série atual.");
    if (!accepted) return setMessage("Confirme que os dados estão corretos antes de continuar.");
    setSaving(true); setMessage("");
    const result = await onRegister({ name: name.trim(), institutionalEmail: institutionalEmail.trim().toLocaleLowerCase("pt-BR"), ra: normalizedRa, raDigit: normalizedDigit, schoolYear });
    if (!result.ok) setMessage(result.message);
    setSaving(false);
  }

  return <main className="student-lobby">
    <div className="lobby-glow lobby-glow-one" /><div className="lobby-glow lobby-glow-two" />
    <header className="lobby-brand"><span>L</span><div><strong>Lord Focus</strong><small>PLATAFORMA DE ESTUDOS</small></div></header>
    <section className={`lobby-shell ${user ? "registration" : "welcome"}`}>
      <div className="lobby-story"><span className="lobby-pill">ANO LETIVO {currentAcademicYear()}</span><h1>{user ? "Só falta montar seu caminho." : "Entre. Aprenda. Avance."}</h1><p>{user ? "Seu Google já foi confirmado. Complete o cadastro escolar uma única vez para receber apenas as matérias e atividades da sua série." : "Um painel que entende sua série, organiza o próximo conteúdo e acompanha sua evolução durante toda a escola."}</p>
        <div className="lobby-steps"><article className={!user ? "active" : "done"}><span>{user ? "✓" : "01"}</span><div><strong>Conta Google</strong><small>Identidade protegida</small></div></article><article className={user ? "active" : ""}><span>02</span><div><strong>Cadastro escolar</strong><small>RA único e série travada</small></div></article><article><span>03</span><div><strong>Trilha personalizada</strong><small>Conteúdo certo para você</small></div></article></div>
        <div className="lobby-orbit" aria-hidden="true"><i /><i /><i /><span>5º</span><span>9º</span><span>3ª</span><b>L</b></div>
      </div>
      <div className="lobby-card">
        {loading ? <div className="lobby-wait"><span /><strong>Preparando seu acesso…</strong><small>Estamos conferindo sua conta com segurança.</small></div> : !user ? <><span className="eyebrow">ACESSO À PLATAFORMA</span><h2>Bem-vindo ao seu painel.</h2><p>Use uma conta Google pessoal ou institucional. A senha continua protegida pelo Google e nunca é salva no site.</p><button className="lobby-google" onClick={() => void onGoogleLogin()}><span>G</span><div><strong>Continuar com Google</strong><small>Pessoal ou institucional</small></div><b>→</b></button><div className="lobby-security"><span>◆</span><p><strong>Acesso protegido</strong> Seus dados escolares só ficam visíveis para você e para o administrador autorizado.</p></div></> : <><div className="lobby-account"><span>{(user.displayName || user.email || "A").slice(0,1).toUpperCase()}</span><div><small>GOOGLE CONFIRMADO</small><strong>{user.email}</strong></div><button onClick={() => void onSignOut()}>Trocar</button></div><span className="eyebrow">CADASTRO ÚNICO</span><h2>Complete seus dados escolares.</h2><p className="registration-copy">A série só pode ser escolhida agora. Depois, somente o ADM poderá corrigir.</p><div className="lobby-form"><label>Nome completo<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome completo" /></label><div className="lobby-ra-row"><label>RA<input inputMode="numeric" value={ra} onChange={(event) => setRa(event.target.value)} placeholder="Somente números" /></label><label>Dígito<input value={raDigit} onChange={(event) => setRaDigit(event.target.value)} placeholder="Ex.: X" maxLength={2} /></label></div><label>E-mail institucional<input inputMode="email" autoCapitalize="none" value={institutionalEmail} onChange={(event) => setInstitutionalEmail(event.target.value)} placeholder="seu.nome@al.educacao.sp.gov.br" /><small>O Gmail usado no botão acima pode ser diferente.</small></label><fieldset><legend>Série atual · ano letivo {currentAcademicYear()}</legend><div className="lobby-year-grid">{schoolYears.map((year) => <button type="button" key={year.id} className={schoolYear === year.id ? "active" : ""} onClick={() => setSchoolYear(year.id)}><strong>{year.short}</strong><small>{year.stage === "fundamental" ? "Fundamental" : "Ensino Médio"}</small></button>)}</div></fieldset><label className="lobby-confirm"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>Confirmo que meu RA, dígito e série estão corretos. Entendo que o RA não poderá ser usado em outra conta.</span></label>{message && <div className="lobby-error">{message}</div>}<button className="lobby-submit" disabled={saving} onClick={() => void submit()}>{saving ? "Criando seu painel…" : "Entrar no meu painel →"}</button></div></>}
      </div>
    </section>
    <footer className="lobby-footer"><span>Lord Focus · ambiente escolar protegido</span><span>Senha gerenciada pelo Google · dados separados por usuário</span></footer>
  </main>;
}
