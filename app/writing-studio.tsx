"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "./firebase-client";
import { builtInWritingMaterials, type WritingMaterial } from "./writing-materials";

export type EssayRecord = {
  id: number;
  materialId?: string;
  theme: string;
  date: string;
  score: string;
  competency: string;
  nextStep: string;
  text?: string;
  thesis?: string;
  argument1?: string;
  argument2?: string;
  intervention?: string;
  status?: "draft" | "finished";
  updatedAt?: string;
};

type Props = {
  userId: string;
  essays: EssayRecord[];
  onEssaysChange: (next: EssayRecord[], message: string) => void;
  onNotice: (message: string) => void;
};

const competencies = [
  "Competência 1 · Norma-padrão",
  "Competência 2 · Tema e repertório",
  "Competência 3 · Argumentação",
  "Competência 4 · Coesão",
  "Competência 5 · Intervenção",
];

function localDateKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function displayDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Data não informada";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(year, month - 1, day));
}

function isWritingMaterial(value: unknown): value is WritingMaterial {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<WritingMaterial>;
  return (item.kind === "prompt" || item.kind === "model") && typeof item.title === "string" && typeof item.description === "string" && typeof item.body === "string" && typeof item.source === "string";
}

export default function WritingStudio({ userId, essays, onEssaysChange, onNotice }: Props) {
  const [materials, setMaterials] = useState<WritingMaterial[]>(builtInWritingMaterials);
  const [selectedMaterialId, setSelectedMaterialId] = useState(builtInWritingMaterials[0].id);
  const [activeEssayId, setActiveEssayId] = useState<number | null>(null);
  const [theme, setTheme] = useState(builtInWritingMaterials[0].title);
  const [thesis, setThesis] = useState("");
  const [argument1, setArgument1] = useState("");
  const [argument2, setArgument2] = useState("");
  const [intervention, setIntervention] = useState("");
  const [text, setText] = useState("");
  const [score, setScore] = useState("");
  const [competency, setCompetency] = useState(competencies[0]);
  const [nextStep, setNextStep] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const storageKey = useMemo(() => `clareia-writing-draft-${userId}`, [userId]);

  useEffect(() => {
    let cancelled = false;
    void getDocs(collection(firestore, "writingMaterials")).then((snapshot) => {
      if (cancelled) return;
      const remote = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter(isWritingMaterial);
      const byId = new Map(builtInWritingMaterials.map((item) => [item.id, item]));
      remote.forEach((item) => byId.set(item.id, item));
      setMaterials(Array.from(byId.values()));
    }).catch(() => onNotice("Os materiais do ADM não responderam. As propostas incluídas na Clareia continuam disponíveis."));
    return () => { cancelled = true; };
  }, [onNotice]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as Partial<EssayRecord> | null;
        if (stored?.theme) {
          setActiveEssayId(typeof stored.id === "number" ? stored.id : null);
          setSelectedMaterialId(stored.materialId ?? "");
          setTheme(stored.theme);
          setThesis(stored.thesis ?? "");
          setArgument1(stored.argument1 ?? "");
          setArgument2(stored.argument2 ?? "");
          setIntervention(stored.intervention ?? "");
          setText(stored.text ?? "");
          setScore(stored.score ?? "");
          setCompetency(stored.competency ?? competencies[0]);
          setNextStep(stored.nextStep ?? "");
        }
      } catch { onNotice("Não consegui recuperar o último rascunho deste aparelho."); }
      finally { setDraftReady(true); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [onNotice, storageKey]);

  useEffect(() => {
    if (!draftReady) return;
    const timer = window.setTimeout(() => {
      const draft: EssayRecord = { id: activeEssayId ?? 0, materialId: selectedMaterialId || undefined, theme, date: localDateKey(), score, competency, nextStep, text, thesis, argument1, argument2, intervention, status: "draft", updatedAt: new Date().toISOString() };
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [activeEssayId, argument1, argument2, competency, draftReady, intervention, nextStep, score, selectedMaterialId, storageKey, text, theme, thesis]);

  const proposals = materials.filter((item) => item.kind === "prompt");
  const models = materials.filter((item) => item.kind === "model");
  const selectedMaterial = materials.find((item) => item.id === selectedMaterialId);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const paragraphCount = text.trim() ? text.trim().split(/\n\s*\n/).filter(Boolean).length : 0;
  const average = essays.filter((item) => item.score).length ? Math.round(essays.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / essays.filter((item) => item.score).length) : 0;

  function selectProposal(material: WritingMaterial) {
    setSelectedMaterialId(material.id);
    setTheme(material.title);
    window.setTimeout(() => document.querySelector(".writing-support-reader")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function newEssay() {
    const first = proposals[0];
    setActiveEssayId(null);
    setSelectedMaterialId(first?.id ?? "");
    setTheme(first?.title ?? "");
    setThesis(""); setArgument1(""); setArgument2(""); setIntervention(""); setText(""); setScore(""); setCompetency(competencies[0]); setNextStep("");
    window.localStorage.removeItem(storageKey);
    onNotice("Nova produção aberta.");
  }

  function editEssay(essay: EssayRecord) {
    setActiveEssayId(essay.id);
    setSelectedMaterialId(essay.materialId ?? "");
    setTheme(essay.theme);
    setThesis(essay.thesis ?? ""); setArgument1(essay.argument1 ?? ""); setArgument2(essay.argument2 ?? ""); setIntervention(essay.intervention ?? ""); setText(essay.text ?? ""); setScore(essay.score ?? ""); setCompetency(essay.competency || competencies[0]); setNextStep(essay.nextStep ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveEssay(status: "draft" | "finished") {
    if (!theme.trim()) return onNotice("Escolha uma proposta ou digite um tema antes de salvar.");
    if (status === "finished" && text.trim().length < 200) return onNotice("Seu texto ainda está muito curto. Salve como rascunho ou desenvolva mais os argumentos.");
    const id = activeEssayId ?? Date.now();
    const previous = essays.find((item) => item.id === id);
    const record: EssayRecord = { id, materialId: selectedMaterialId || undefined, theme: theme.trim(), date: previous?.date ?? localDateKey(), score, competency, nextStep: nextStep.trim(), text: text.trim(), thesis: thesis.trim(), argument1: argument1.trim(), argument2: argument2.trim(), intervention: intervention.trim(), status, updatedAt: new Date().toISOString() };
    const next = previous ? essays.map((item) => item.id === id ? record : item) : [record, ...essays];
    setActiveEssayId(id);
    onEssaysChange(next, status === "finished" ? "Redação finalizada e guardada no histórico." : "Rascunho guardado na sua conta.");
  }

  function deleteEssay(essay: EssayRecord) {
    if (!window.confirm(`Excluir a redação “${essay.theme}”?`)) return;
    const next = essays.filter((item) => item.id !== essay.id);
    if (activeEssayId === essay.id) newEssay();
    onEssaysChange(next, "Redação excluída do histórico.");
  }

  return <div className="writing-studio">
    <section className="writing-hero"><div><span className="eyebrow">REDAÇÃO ENEM · DA PROPOSTA À REESCRITA</span><h2>Planeje primeiro. Escreva com clareza. Corrija com propósito.</h2><p>Escolha uma coletânea, construa a tese, organize dois argumentos e escreva no editor. O rascunho fica salvo neste aparelho enquanto você trabalha.</p></div><div><strong>{essays.length}</strong><span>produções guardadas</span><strong>{average}</strong><span>média corrigida</span></div></section>

    <section className="section-block writing-material-library"><div className="section-heading"><div><span className="eyebrow">1 · PROPOSTAS DE REDAÇÃO</span><h2>Escolha um tema e leia a coletânea</h2></div><button className="secondary" onClick={newEssay}>＋ Nova redação livre</button></div><div className="writing-prompt-grid">{proposals.map((material) => <button className={selectedMaterialId === material.id ? "active" : ""} key={material.id} onClick={() => selectProposal(material)}><span>{material.id.startsWith("clareia-") ? "CLAREIA" : "ADM"}</span><strong>{material.title}</strong><p>{material.description}</p><small>Abrir textos de apoio →</small></button>)}</div></section>

    {selectedMaterial?.kind === "prompt" && <section className="section-block writing-support-reader"><div className="section-heading"><div><span className="eyebrow">2 · TEXTOS DE APOIO</span><h2>{selectedMaterial.title}</h2></div><span className="writing-source">{selectedMaterial.source}</span></div><p className="support-description">{selectedMaterial.description}</p><div className="support-texts">{selectedMaterial.body.split(/\n\n+/).map((paragraph, index) => <p key={`${paragraph.slice(0, 30)}-${index}`}>{paragraph}</p>)}</div><div className="support-warning"><strong>Como usar</strong><span>Retire ideias e relações da coletânea, mas escreva com suas palavras. Copiar os textos de apoio prejudica a autoria da redação.</span></div></section>}

    <section className="writing-workspace"><div className="writing-plan section-block"><span className="eyebrow">3 · PROJETO DE TEXTO</span><h2>Organize antes de escrever</h2><label><span>Tema da produção</span><input maxLength={180} value={theme} onChange={(event) => { setTheme(event.target.value); if (event.target.value !== selectedMaterial?.title) setSelectedMaterialId(""); }} placeholder="Digite ou escolha um tema acima" /></label><label><span>Tese — qual posição você vai defender?</span><textarea maxLength={500} value={thesis} onChange={(event) => setThesis(event.target.value)} placeholder="Em uma frase, responda ao problema do tema." /></label><label><span>Argumento 1 — primeira causa, problema ou efeito</span><textarea maxLength={600} value={argument1} onChange={(event) => setArgument1(event.target.value)} placeholder="Ideia principal + explicação + repertório possível." /></label><label><span>Argumento 2 — segunda linha de defesa</span><textarea maxLength={600} value={argument2} onChange={(event) => setArgument2(event.target.value)} placeholder="Evite repetir o argumento anterior." /></label><label><span>Intervenção — agente, ação, meio e finalidade</span><textarea maxLength={700} value={intervention} onChange={(event) => setIntervention(event.target.value)} placeholder="Quem fará o quê, como e para qual resultado?" /></label></div>
      <div className="writing-editor section-block"><div className="writing-editor-head"><div><span className="eyebrow">4 · ESCREVA A REDAÇÃO</span><h2>Editor de produção</h2></div><div><strong>{wordCount}</strong><span>palavras</span><strong>{paragraphCount}</strong><span>parágrafos</span></div></div><div className="paragraph-guide"><span>Introdução</span><span>Desenvolvimento 1</span><span>Desenvolvimento 2</span><span>Conclusão</span></div><textarea maxLength={12000} value={text} onChange={(event) => setText(event.target.value)} aria-label="Texto da redação" placeholder={"Comece a escrever aqui…\n\nSepare os parágrafos com uma linha em branco. A Clareia salva este editor automaticamente neste aparelho."} /><small className="local-save-status">✓ Rascunho automático neste aparelho · use “Guardar na conta” para sincronizar</small><div className="writing-save-actions"><button className="secondary" onClick={() => saveEssay("draft")}>Guardar rascunho na conta</button><button className="primary" onClick={() => saveEssay("finished")}>Finalizar produção →</button></div></div>
    </section>

    <section className="section-block correction-panel"><div className="section-heading"><div><span className="eyebrow">5 · CORREÇÃO E PRÓXIMO PASSO</span><h2>Registre o retorno quando receber</h2></div><span className="muted">Pode ser preenchido depois</span></div><div className="correction-grid"><label><span>Nota (0–1000)</span><input inputMode="numeric" value={score} onChange={(event) => { const value = event.target.value.replace(/\D/g, "").slice(0, 4); setScore(value ? String(Math.min(1000, Number(value))) : ""); }} placeholder="Ex.: 760" /></label><label><span>Competência prioritária</span><select value={competency} onChange={(event) => setCompetency(event.target.value)}>{competencies.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Uma melhoria concreta para a próxima</span><textarea maxLength={600} value={nextStep} onChange={(event) => setNextStep(event.target.value)} placeholder="Ex.: deixar a tese explícita e usar um exemplo no segundo desenvolvimento." /></label><button className="secondary" onClick={() => saveEssay(activeEssayId && essays.find((item) => item.id === activeEssayId)?.status === "finished" ? "finished" : "draft")}>Atualizar correção</button></div></section>

    <section className="section-block writing-models"><div className="section-heading"><div><span className="eyebrow">REDAÇÕES DE APOIO</span><h2>Modelos e referências publicados</h2></div><span className="muted">Leia a estrutura, não copie</span></div><div>{models.map((material) => <details key={material.id}><summary><span>{material.id.startsWith("clareia-") ? "MODELO CLAREIA" : "PUBLICADO PELO ADM"}</span><strong>{material.title}</strong><small>{material.score ? `${material.score} pontos · ` : ""}{material.description}</small></summary><div><p className="model-source">{material.source}</p>{material.body.split(/\n\n+/).map((paragraph, index) => <p key={`${paragraph.slice(0, 30)}-${index}`}>{paragraph}</p>)}</div></details>)}</div></section>

    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">SEU HISTÓRICO</span><h2>Rascunhos e redações finalizadas</h2></div><span className="muted">{essays.length} registros</span></div><div className="essay-history">{essays.map((essay) => <article key={essay.id}><div><strong>{essay.score || (essay.status === "draft" ? "R" : "—")}</strong><small>{essay.score ? "pontos" : essay.status === "draft" ? "rascunho" : "sem nota"}</small></div><span><b>{essay.theme}</b><small>{essay.competency} · {displayDate(essay.date)}</small><p>{essay.nextStep || `${essay.text?.split(/\s+/).filter(Boolean).length ?? 0} palavras guardadas.`}</p></span><div className="essay-history-actions"><button onClick={() => editEssay(essay)}>Abrir</button><button className="danger" onClick={() => deleteEssay(essay)}>Excluir</button></div></article>)}{!essays.length && <div className="empty-list large"><span>R</span><p>Sua primeira produção aparecerá aqui depois de salvar.</p></div>}</div></section>
  </div>;
}
