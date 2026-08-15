"use client";

import type { User } from "firebase/auth";
import { schoolYears, type SchoolYear } from "./school-data";

type Props = { user: User | null; current: SchoolYear | null; required?: boolean; onSelect: (year: SchoolYear) => void; onClose?: () => void };

export default function StudentProfileSetup({ user, current, required = false, onSelect, onClose }: Props) {
  return <div className="modal-backdrop profile-setup-backdrop" role="presentation" onMouseDown={() => !required && onClose?.()}><section className="profile-setup-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>{!required && <button className="modal-close" onClick={onClose}>×</button>}<div className="profile-setup-icon">L</div><span className="eyebrow">SEU PAINEL, SUA SÉRIE</span><h2>{current ? "Alterar ano escolar" : "Em qual ano você estuda?"}</h2><p>Isso define quais matérias, conteúdos e questões aparecem para você. Não pedimos sua data de nascimento.</p><div className="profile-year-grid">{schoolYears.map((year) => <button key={year.id} className={current === year.id ? "active" : ""} onClick={() => onSelect(year.id)}><span>{year.short}</span><small>{year.stage === "fundamental" ? "Ensino Fundamental" : "Ensino Médio"}</small></button>)}</div><div className="profile-privacy"><span>✓</span><div><strong>Perfil escolar protegido</strong><p>{user ? "Sua escolha será salva na sua conta Google e acompanhará você em outros aparelhos." : "A escolha será salva neste aparelho. Entre com Google para sincronizar."}</p></div></div></section></div>;
}
