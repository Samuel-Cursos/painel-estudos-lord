"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import EnemWritingReader from "./enem-writing-reader";
import { enemWritingPrompts } from "./enem-writing-data";
import { mergeEnemDrafts, restoreEnemDrafts, upsertEssay, writingDraftStorageKey, type EnemDraftMap } from "./enem-writing-drafts";
import { findSupportOverlap, inspectWriting, writingGuideUrl, writingReviewGuide } from "./enem-writing-review";
import type { EssayRecord } from "./writing-studio";

type Props = {
  userId: string;
  essays: EssayRecord[];
  onEssaysChange: (next: EssayRecord[], message: string) => void;
  onNotice: (message: string) => void;
};

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default function EnemWritingPractice({ userId, essays, onEssaysChange, onNotice }: Props) {
  const [year, setYear] = useState(2025);
  const [drafts, setDrafts] = useState<EnemDraftMap>({});
  const [ready, setReady] = useState(false);
  const [localError, setLocalError] = useState(false);
  const [supportText, setSupportText] = useState("");
  const [showReview, setShowReview] = useState(false);
  const draftsRef = useRef<EnemDraftMap>({});
  const essaysRef = useRef(essays);
  const storageKey = writingDraftStorageKey(userId);
  const prompt = enemWritingPrompts.find((item) => item.year === year)!;
  const draft = drafts[year];
  const text = draft?.text ?? "";
  const inspection = useMemo(() => inspectWriting(text), [text]);
  const overlap = useMemo(() => findSupportOverlap(text, supportText, prompt.theme), [text, supportText, prompt.theme]);
  const history = essays.filter((essay) => essay.enemYear === year).sort((a, b) => (b.updatedAt ?? b.date).localeCompare(a.updatedAt ?? a.date));
  const reviewCount = writingReviewGuide.reduce((sum, group) => sum + group.items.filter((item) => draft?.selfReview?.[item.id]).length, 0);
  const reviewTotal = writingReviewGuide.reduce((sum, group) => sum + group.items.length, 0);

  useEffect(() => { essaysRef.current = essays; }, [essays]);
  useEffect(() => {
    setReady(false);
    let local: EnemDraftMap = {};
    try { local = restoreEnemDrafts(window.localStorage.getItem(storageKey)); setLocalError(false); }
    catch { setLocalError(true); }
    const next = mergeEnemDrafts(local, essaysRef.current);
    draftsRef.current = next;
    setDrafts(next);
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    const next = mergeEnemDrafts(draftsRef.current, essays);
    draftsRef.current = next;
    setDrafts(next);
  }, [essays, ready]);

  function blankEssay(): EssayRecord {
    const existingIds = [...essays, ...Object.values(draftsRef.current)].map((item) => item.id);
    return { id: Math.max(Date.now(), ...existingIds.map((id) => id + 1)), enemYear: year, materialId: `enem-writing-${year}`, theme: prompt.theme, date: today(), score: "", competency: "", nextStep: "", text: "", thesis: "", argument1: "", argument2: "", intervention: "", status: "draft", updatedAt: new Date().toISOString(), selfReview: {} };
  }

  function storeDraft(record: EssayRecord) {
    const next = { ...draftsRef.current, [record.enemYear!]: record };
    draftsRef.current = next;
    setDrafts(next);
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); setLocalError(false); }
    catch { setLocalError(true); }
  }

  function updateDraft(patch: Partial<EssayRecord>) {
    const current = draftsRef.current[year] ?? blankEssay();
    const changedWriting = ["text", "thesis", "argument1", "argument2", "intervention"].some((key) => key in patch);
    storeDraft({ ...current, ...patch, status: changedWriting ? "draft" : current.status, updatedAt: new Date().toISOString() });
  }

  function selectYear(value: number) {
    if (value === year) return;
    setSupportText("");
    setShowReview(false);
    setYear(value);
  }

  function save(status: "draft" | "finished") {
    const current = draftsRef.current[year];
    if (!current || !(current.text?.trim() || current.thesis?.trim() || current.argument1?.trim() || current.argument2?.trim() || current.intervention?.trim())) return onNotice("Escreva seu planejamento ou comece a redação antes de salvar.");
    if (status === "finished" && !current.text?.trim()) return onNotice("Escreva sua redação antes de finalizar. O planejamento pode ser salvo como rascunho.");
    const record = { ...current, status, updatedAt: new Date().toISOString() };
    storeDraft(record);
    onEssaysChange(upsertEssay(essays, record), status === "finished" ? `Redação do ENEM ${year} finalizada e salva no histórico. Acompanhe a sincronização da conta no painel.` : `Rascunho do ENEM ${year} salvo no histórico. Acompanhe a sincronização da conta no painel.`);
  }

  function newAttempt() {
    const current = draftsRef.current[year];
    if (current && (current.text || current.thesis || current.argument1 || current.argument2 || current.intervention)) {
      onEssaysChange(upsertEssay(essays, current), "A tentativa anterior foi guardada no histórico.");
    }
    storeDraft(blankEssay());
    setShowReview(false);
  }

  function openAttempt(record: EssayRecord) {
    const current = draftsRef.current[year];
    if (current && current.id !== record.id && (current.text || current.thesis || current.argument1 || current.argument2 || current.intervention)) {
      onEssaysChange(upsertEssay(essays, current), "A tentativa atual foi guardada antes de abrir a anterior.");
    }
    storeDraft({ ...record, updatedAt: new Date().toISOString() });
    setShowReview(false);
    document.getElementById("enem-essay-text")?.focus();
  }

  function deleteAttempt(record: EssayRecord) {
    if (!window.confirm(`Excluir esta tentativa do ENEM ${year}?`)) return;
    if (draftsRef.current[year]?.id === record.id) storeDraft(blankEssay());
    onEssaysChange(essays.filter((item) => item.id !== record.id), "Tentativa excluída do histórico.");
  }

  return <div className="enem-writing">
    <header className="enem-writing-header"><div><span className="eyebrow">PRÁTICA COM AS PROPOSTAS OFICIAIS</span><h2>Redações do ENEM</h2><p>Escolha um ano, leia a coletânea da prova e desenvolva sua redação.</p></div><span className="enem-edition-badge">Aplicação regular impressa</span></header>
    <div className="enem-writing-years" role="group" aria-label="Ano da redação">{enemWritingPrompts.map((item) => <button type="button" key={item.year} aria-pressed={year === item.year} onClick={() => selectYear(item.year)} title={item.theme}><strong>{item.year}</strong><span>{drafts[item.year]?.status === "finished" ? "Finalizada" : drafts[item.year]?.text ? "Em andamento" : "Ver proposta"}</span></button>)}</div>
    <section className="enem-writing-theme"><div><span className="eyebrow">TEMA DO ENEM {year}</span><h3>{prompt.theme}</h3></div><button type="button" className="secondary" onClick={() => document.getElementById("enem-essay-text")?.focus()}>Ir para meu texto ↓</button></section>
    <div className="enem-writing-workspace">
      <EnemWritingReader key={year} prompt={prompt} onSupportText={setSupportText} />
      <section className="enem-essay-editor section-block" aria-label={`Sua redação do ENEM ${year}`}>
        <div className="enem-section-heading"><div><span className="eyebrow">SUA PRODUÇÃO</span><h3>Escreva sobre o tema</h3></div><button type="button" className="enem-text-button" onClick={newAttempt} disabled={!ready}>Nova tentativa</button></div>
        <details className="enem-writing-plan"><summary>Planejar tese, argumentos e intervenção</summary><div>{([
          ["thesis", "Tese", "Qual ponto de vista você vai defender?", 500],
          ["argument1", "Argumento 1", "Ideia, explicação e exemplo relacionados ao tema.", 600],
          ["argument2", "Argumento 2", "Uma segunda linha de defesa da sua tese.", 600],
          ["intervention", "Intervenção", "Agente, ação, meio, finalidade e detalhamento.", 700],
        ] as const).map(([field, label, placeholder, limit]) => <label key={field}><span>{label}</span><textarea disabled={!ready} value={draft?.[field] ?? ""} onChange={(event) => updateDraft({ [field]: event.target.value })} maxLength={limit} placeholder={placeholder} /></label>)}</div></details>
        <label className="enem-text-label" htmlFor="enem-essay-text">Texto da redação · ENEM {year}</label>
        <textarea id="enem-essay-text" className="enem-main-text" disabled={!ready} value={text} onChange={(event) => updateDraft({ text: event.target.value, selfReview: {} })} maxLength={12000} lang="pt-BR" spellCheck placeholder={"Comece sua redação aqui…\n\nSepare os parágrafos com uma quebra de linha. Seu texto fica vinculado ao ano selecionado."} />
        <div className="enem-writing-counts"><span><strong>{inspection.words}</strong> palavras</span><span><strong>{inspection.paragraphs}</strong> parágrafos</span><span>{draft?.status === "finished" ? "Finalizada · sem nota automática" : "Rascunho"}</span></div>
        <p className="enem-reader-hint">Na prova, a folha tem até 30 linhas manuscritas. As linhas e palavras deste editor não equivalem às da folha oficial.</p>
        <p className={`enem-save-status${localError ? " has-error" : ""}`} role="status">{!ready ? "Recuperando seu rascunho…" : localError ? "O armazenamento deste aparelho não respondeu. Guarde na conta antes de sair." : "Rascunho automático neste aparelho. “Guardar na conta” também envia ao seu histórico."}</p>
        <div className="enem-writing-actions"><button type="button" className="secondary" disabled={!ready} onClick={() => save("draft")}>Guardar na conta</button><button type="button" className="primary" disabled={!ready || !text.trim()} onClick={() => save("finished")}>Finalizar redação</button></div>
        <button type="button" className="enem-review-button" disabled={!text.trim()} aria-expanded={showReview} onClick={() => setShowReview((value) => !value)}>{showReview ? "Fechar revisão orientada" : "Revisar meu texto · sem IA"}</button>
      </section>
    </div>

    {showReview && <section className="enem-writing-review section-block">
      <div className="enem-section-heading"><div><span className="eyebrow">REVISÃO ORIENTADA</span><h3>O que conferir antes de finalizar</h3></div><a href={writingGuideUrl} target="_blank" rel="noreferrer">Cartilha do Inep ↗</a></div>
      <p>As verificações abaixo são mecânicas. Elas não avaliam a qualidade dos argumentos, a pertinência do repertório ou a fuga ao tema e não geram nota. A checklist é preenchida por você.</p>
      <h4>Verificações automáticas</h4>
      <div className="enem-observations">{inspection.observations.map((item) => <article key={item.id}><strong>{item.title}</strong><p>{item.detail}</p></article>)}
        {overlap && <article><strong>Trecho coincidente com a proposta</strong><p>Encontrei uma sequência de 12 palavras também presente na página de apoio: “{overlap}”. Confira se é uma citação e se você desenvolveu sua própria argumentação. Isso não determina plágio.</p></article>}
        {!inspection.observations.length && !overlap && <p>Nenhum alerta nessas verificações simples. Isso não confirma que a redação está correta; prossiga com a revisão abaixo.</p>}
        {!supportText && <p>A comparação depende de uma extração legível da página oficial. Se ela não estiver disponível, confira as citações durante sua leitura dos textos motivadores.</p>}
      </div>
      <div className="enem-section-heading"><h4>Releia pelas cinco competências</h4><span>{reviewCount} de {reviewTotal} itens conferidos por você</span></div>
      <div className="enem-competency-grid">{writingReviewGuide.map((group) => <fieldset key={group.id}><legend>{group.title}</legend>{group.items.map((item) => <label key={item.id}><input type="checkbox" checked={Boolean(draft?.selfReview?.[item.id])} onChange={(event) => updateDraft({ selfReview: { ...draft?.selfReview, [item.id]: event.target.checked } })} /><span>{item.text}</span></label>)}</fieldset>)}</div>
      <p className="enem-reader-hint">Ao alterar o texto, os itens são desmarcados para uma nova leitura. Use “Guardar na conta” para salvar sua revisão junto da redação.</p>
    </section>}

    <section className="section-block enem-writing-history">
      <div className="enem-section-heading"><div><span className="eyebrow">SUAS TENTATIVAS · ENEM {year}</span><h3>Continue de onde parou</h3></div><span>{history.length} {history.length === 1 ? "produção" : "produções"}</span></div>
      {!history.length && <p>As tentativas deste ano aparecerão aqui quando você guardar na conta ou finalizar a redação.</p>}
      {history.map((record, index) => <article key={record.id}><div><strong>ENEM {year} · {record.status === "finished" ? "Finalizada" : "Rascunho"}</strong><p>{record.date.split("-").reverse().join("/")} · {inspectWriting(record.text ?? "").words} palavras{record.score ? ` · Nota registrada: ${record.score}` : ""}</p><p className="enem-history-excerpt">{record.text?.slice(0, 150) || record.thesis || "Planejamento de redação"}</p></div><div><button type="button" className="secondary" onClick={() => openAttempt(record)} aria-label={`Abrir tentativa ${history.length - index} do ENEM ${year}`}>Abrir</button><button type="button" className="enem-text-button danger" onClick={() => deleteAttempt(record)} aria-label={`Excluir tentativa ${history.length - index} do ENEM ${year}`}>Excluir</button></div></article>)}
      <details className="enem-manual-feedback"><summary>Registrar uma correção recebida de professor</summary><div><label><span>Nota recebida (0 a 1000)</span><input disabled={!draft} inputMode="numeric" value={draft?.score ?? ""} onChange={(event) => { const value = event.target.value.replace(/\D/g, "").slice(0, 4); updateDraft({ score: value ? String(Math.min(1000, Number(value))) : "" }); }} placeholder="Preencha só depois de receber uma correção" /></label><label><span>Orientação para a próxima versão</span><textarea disabled={!draft} value={draft?.nextStep ?? ""} maxLength={600} onChange={(event) => updateDraft({ nextStep: event.target.value })} /></label><button type="button" className="secondary" disabled={!draft} onClick={() => save(draft?.status === "finished" ? "finished" : "draft")}>Guardar retorno recebido</button></div></details>
    </section>
  </div>;
}
