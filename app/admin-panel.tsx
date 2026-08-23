"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { Bytes, addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { defaultAppSettings, isOwner, PDF_CHUNK_SIZE, PROTECTED_PDF_CHUNKS, PROTECTED_PDF_META_DOC, type AppSettings } from "./access-control";
import { firestore } from "./firebase-client";
import { practiceSubjectNames, practiceSubjectOrder, type CustomPracticeQuestion } from "./practice-library";

type DirectoryUser = { uid: string; email: string; displayName?: string; photoURL?: string; lastSeenAt?: { toDate?: () => Date } };
type UserMetrics = { lessons: number; stages: number; questions: number; openTasks: number; updatedAt?: { toDate?: () => Date } };
type AdminTab = "overview" | "users" | "content" | "settings";
type AuditEntry = { id: string; action: string; detail: string; createdAt?: { toDate?: () => Date } };
type QuestionDraft = { subject: string; prompt: string; options: string; correct: number; explanation: string; written: boolean };
type StoredStudentProfile = { uid: string; email: string; fullName?: string; displayName?: string; ra?: string; raDigit?: string };

type Props = { user: User; onNotice: (message: string) => void };
const emptyDraft: QuestionDraft = { subject: "portuguese", prompt: "", options: "\n\n\n", correct: 0, explanation: "", written: false };

function timestampLabel(value?: { toDate?: () => Date }) {
  const date = value?.toDate?.();
  return date ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date) : "sem registro";
}

export default function AdminPanel({ user, onNotice }: Props) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [metrics, setMetrics] = useState<Record<string, UserMetrics>>({});
  const [studentProfiles, setStudentProfiles] = useState<Record<string, StoredStudentProfile>>({});
  const [allowed, setAllowed] = useState<Set<string>>(new Set());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [customQuestions, setCustomQuestions] = useState<CustomPracticeQuestion[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [draft, setDraft] = useState<QuestionDraft>(emptyDraft);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pdfInfo, setPdfInfo] = useState("Verificando arquivo…");

  const logAction = useCallback(async (action: string, detail: string) => {
    await addDoc(collection(firestore, "adminAudit"), { action, detail, createdAt: serverTimestamp(), actor: user.email }).catch(() => undefined);
  }, [user.email]);

  const loadAdmin = useCallback(async () => {
    if (!isOwner(user.email)) return;
    setLoading(true);
    try {
      const [directorySnapshot, accessSnapshot, controlsSnapshot, profileSnapshot, settingsSnapshot, customSnapshot, auditSnapshot] = await Promise.all([
        getDocs(collection(firestore, "userDirectory")), getDocs(collection(firestore, "pdfAccess")),
        getDocs(collection(firestore, "userControls")),
        getDocs(collection(firestore, "studentProfiles")),
        getDoc(doc(firestore, "appSettings", "main")), getDocs(collection(firestore, "customQuestions")), getDocs(collection(firestore, "adminAudit")),
      ]);
      const directory = directorySnapshot.docs.map((item) => ({ uid: item.id, ...item.data() } as DirectoryUser)).sort((a, b) => a.email.localeCompare(b.email));
      setUsers(directory);
      setAllowed(new Set(accessSnapshot.docs.filter((item) => item.data().enabled === true).map((item) => item.id)));
      setBlocked(new Set(controlsSnapshot.docs.filter((item) => item.data().siteEnabled === false).map((item) => item.id)));
      setStudentProfiles(Object.fromEntries(profileSnapshot.docs.map((item) => [item.id, { uid: item.id, ...item.data() } as StoredStudentProfile])));
      if (settingsSnapshot.exists()) setSettings({ ...defaultAppSettings, ...settingsSnapshot.data() } as AppSettings);
      setCustomQuestions(customSnapshot.docs.map((item) => ({ id: item.id, ...item.data() } as CustomPracticeQuestion)));
      setAudit(auditSnapshot.docs.map((item) => ({ id: item.id, ...item.data() } as AuditEntry)).sort((a, b) => (b.createdAt?.toDate?.().getTime() ?? 0) - (a.createdAt?.toDate?.().getTime() ?? 0)).slice(0, 12));
      const dashboardRows = await Promise.all(directory.map(async (person) => {
        const snapshot = await getDoc(doc(firestore, "users", person.uid, "dashboard", "main"));
        if (!snapshot.exists()) return [person.uid, { lessons: 0, stages: 0, questions: 0, openTasks: 0 }] as const;
        const data = snapshot.data();
        const lessons = Object.values(data.progress ?? {}).filter((value) => value === "done").length;
        const stages = Object.values(data.skillProgress ?? {}).reduce((total: number, item) => total + Object.values((item ?? {}) as Record<string, boolean>).filter(Boolean).length, 0);
        const questions = Object.values(data.questionProgress ?? {}).filter((item) => Boolean((item as { answer?: string; note?: string })?.answer || (item as { note?: string })?.note?.trim())).length;
        const openTasks = (data.tasks ?? []).filter((item: { done?: boolean }) => !item.done).length;
        return [person.uid, { lessons, stages, questions, openTasks, updatedAt: data.updatedAt }] as const;
      }));
      setMetrics(Object.fromEntries(dashboardRows));
      const metadata = await getDoc(doc(firestore, "protectedMaterials", PROTECTED_PDF_META_DOC));
      setPdfInfo(metadata.exists() ? `PDF protegido pronto · ${(Number(metadata.data().size) / 1024 / 1024).toFixed(1)} MB · ${Number(metadata.data().chunkCount)} partes` : "Nenhum PDF protegido enviado ainda.");
    } catch {
      onNotice("O Firebase recusou parte do ADM. Publique o novo firestore.rules.");
    } finally { setLoading(false); }
  }, [onNotice, user.email]);

  useEffect(() => { const timer = window.setTimeout(() => void loadAdmin(), 0); return () => window.clearTimeout(timer); }, [loadAdmin]);

  const filteredUsers = useMemo(() => { const query = search.trim().toLocaleLowerCase("pt-BR"); return users.filter((item) => { const profile = studentProfiles[item.uid]; return !query || `${item.email} ${item.displayName ?? ""} ${profile?.fullName ?? ""} ${profile?.ra ?? ""}`.toLocaleLowerCase("pt-BR").includes(query); }); }, [search, studentProfiles, users]);
  const totals = useMemo(() => Object.values(metrics).reduce((result, item) => ({ lessons: result.lessons + item.lessons, stages: result.stages + item.stages, questions: result.questions + item.questions, tasks: result.tasks + item.openTasks }), { lessons: 0, stages: 0, questions: 0, tasks: 0 }), [metrics]);

  async function toggleAccess(person: DirectoryUser) {
    const accessRef = doc(firestore, "pdfAccess", person.uid); const next = new Set(allowed);
    try {
      if (next.has(person.uid)) { await deleteDoc(accessRef); next.delete(person.uid); await logAction("PDF removido", person.email); }
      else { await setDoc(accessRef, { uid: person.uid, email: person.email, enabled: true, updatedAt: serverTimestamp(), updatedBy: user.email }); next.add(person.uid); await logAction("PDF liberado", person.email); }
      setAllowed(next); onNotice(`Permissão de ${person.email} atualizada.`);
    } catch { onNotice("Não consegui mudar essa permissão. Confira as regras do Firestore."); }
  }

  async function resetProgress(person: DirectoryUser) {
    if (!window.confirm(`Zerar TODO o progresso e as tarefas de ${person.email}? Essa ação não pode ser desfeita.`)) return;
    try { await deleteDoc(doc(firestore, "users", person.uid, "dashboard", "main")); await setDoc(doc(firestore, "userControls", person.uid), { siteEnabled: !blocked.has(person.uid), resetToken: Date.now(), updatedAt: serverTimestamp(), updatedBy: user.email }, { merge: true }); setMetrics((current) => ({ ...current, [person.uid]: { lessons: 0, stages: 0, questions: 0, openTasks: 0 } })); await logAction("Progresso zerado", person.email); onNotice(`Progresso de ${person.email} zerado em todos os aparelhos.`); }
    catch { onNotice("O Firebase não permitiu zerar esse progresso."); }
  }

  async function toggleSiteAccess(person: DirectoryUser) {
    if (isOwner(person.email)) return;
    const nextBlocked = new Set(blocked); const willBlock = !nextBlocked.has(person.uid);
    try { await setDoc(doc(firestore, "userControls", person.uid), { siteEnabled: !willBlock, updatedAt: serverTimestamp(), updatedBy: user.email }, { merge: true }); if (willBlock) nextBlocked.add(person.uid); else nextBlocked.delete(person.uid); setBlocked(nextBlocked); await logAction(willBlock ? "Painel bloqueado" : "Painel liberado", person.email); onNotice(`${person.email}: painel ${willBlock ? "bloqueado" : "liberado"}.`); }
    catch { onNotice("Não consegui alterar o acesso ao painel."); }
  }

  async function saveSettings(next: AppSettings) {
    const previous = settings; setSettings(next); setSaving(true);
    try { await setDoc(doc(firestore, "appSettings", "main"), { ...next, updatedAt: serverTimestamp(), updatedBy: user.email }, { merge: true }); await logAction("Configuração atualizada", "Controles globais do site"); onNotice("Configurações publicadas no site."); }
    catch { setSettings(previous); onNotice("O Firebase não deixou salvar essa configuração."); }
    finally { setSaving(false); }
  }

  async function createQuestion() {
    const options = draft.options.split("\n").map((item) => item.trim()).filter(Boolean);
    if (!draft.prompt.trim() || (!draft.written && options.length < 2) || !draft.explanation.trim()) return onNotice("Preencha enunciado, explicação e pelo menos duas alternativas.");
    setSaving(true);
    try {
      const id = `custom-${Date.now()}`;
      const question: CustomPracticeQuestion = { id, subject: draft.subject as CustomPracticeQuestion["subject"], prompt: draft.prompt.trim(), explanation: draft.explanation.trim(), written: draft.written, ...(draft.written ? {} : { options, answer: Math.min(draft.correct, options.length - 1) }), source: "Criada pelo ADM" };
      await setDoc(doc(firestore, "customQuestions", id), { ...question, createdAt: serverTimestamp(), createdBy: user.email });
      setCustomQuestions((current) => [...current, question]); setDraft(emptyDraft); await logAction("Questão criada", `${practiceSubjectNames[question.subject]} · ${question.prompt}`); onNotice("Questão publicada para todos.");
    } catch { onNotice("Não consegui publicar a questão. Confira as regras do Firestore."); }
    finally { setSaving(false); }
  }

  async function removeQuestion(question: CustomPracticeQuestion) {
    if (!window.confirm("Excluir esta questão criada no ADM?")) return;
    try { await deleteDoc(doc(firestore, "customQuestions", question.id)); setCustomQuestions((current) => current.filter((item) => item.id !== question.id)); await logAction("Questão excluída", question.prompt); onNotice("Questão excluída."); }
    catch { onNotice("Não consegui excluir essa questão."); }
  }

  async function uploadPdf(file?: File) {
    if (!file) return; if (file.type !== "application/pdf") return onNotice("Escolha um arquivo PDF."); if (file.size > 25 * 1024 * 1024) return onNotice("Use um PDF compacto de até 25 MB.");
    setUploading(true); setUploadProgress(0);
    try {
      const metadataRef = doc(firestore, "protectedMaterials", PROTECTED_PDF_META_DOC); const previous = await getDoc(metadataRef); const previousData = previous.exists() ? previous.data() : null;
      const fileBytes = new Uint8Array(await file.arrayBuffer()); const version = `v${Date.now()}`; const chunkCount = Math.ceil(fileBytes.length / PDF_CHUNK_SIZE);
      for (let index = 0; index < chunkCount; index += 1) { const chunk = fileBytes.slice(index * PDF_CHUNK_SIZE, Math.min((index + 1) * PDF_CHUNK_SIZE, fileBytes.length)); await setDoc(doc(firestore, PROTECTED_PDF_CHUNKS, `${version}-${String(index).padStart(3, "0")}`), { version, index, bytes: Bytes.fromUint8Array(chunk) }); setUploadProgress(Math.round(((index + 1) / chunkCount) * 100)); }
      await setDoc(metadataRef, { version, chunkCount, size: file.size, fileName: file.name, contentType: "application/pdf", updatedAt: serverTimestamp(), updatedBy: user.email });
      if (previousData?.version && previousData.version !== version) for (let index = 0; index < Number(previousData.chunkCount); index += 1) await deleteDoc(doc(firestore, PROTECTED_PDF_CHUNKS, `${previousData.version}-${String(index).padStart(3, "0")}`)).catch(() => undefined);
      setPdfInfo(`PDF protegido pronto · ${(file.size / 1024 / 1024).toFixed(1)} MB · ${chunkCount} partes`); await logAction("PDF substituído", file.name); onNotice("PDF protegido atualizado sem usar Firebase Storage.");
    } catch { onNotice("O upload foi bloqueado. Confira as regras do Firestore."); }
    finally { setUploading(false); }
  }

  if (!isOwner(user.email)) return null;
  return <div className="page-content admin-page">
    <section className="admin-hero"><div><span className="eyebrow">CENTRAL CLAREIA</span><h2>Controle da preparação ENEM</h2><p>Monitore usuários e progresso, publique questões, controle o caderno protegido e altere o funcionamento da plataforma.</p></div><button className="secondary" onClick={() => void loadAdmin()}>↻ Atualizar dados</button></section>
    <nav className="admin-tabs">{(["overview", "users", "content", "settings"] as AdminTab[]).map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item === "overview" ? "Visão geral" : item === "users" ? "Usuários" : item === "content" ? "Conteúdo" : "Site e regras"}</button>)}</nav>

    {tab === "overview" && <><div className="admin-stats admin-stats-wide"><article><strong>{users.length}</strong><span>pessoas cadastradas</span></article><article><strong>{totals.lessons + totals.stages}</strong><span>etapas concluídas</span></article><article><strong>{totals.questions}</strong><span>questões respondidas</span></article><article><strong>{totals.tasks}</strong><span>tarefas abertas</span></article></div><section className="admin-grid"><article className="admin-card"><div className="admin-card-head"><span className="admin-card-icon">LIVE</span><div><span className="eyebrow">SAÚDE DO SITE</span><h3>Serviços e recursos</h3></div></div><div className="admin-health"><span className="ok">Online</span><p>Login Google e sincronização pelo Firestore</p><span className={settings.publicPracticeEnabled ? "ok" : "paused"}>{settings.publicPracticeEnabled ? "Ativo" : "Pausado"}</span><p>Banco de questões e prática do ENEM</p><span className={settings.pdfEnabled ? "ok" : "paused"}>{settings.pdfEnabled ? "Ativo" : "Pausado"}</span><p>Caderno protegido com acesso definido pelo ADM</p></div></article><article className="admin-card"><div className="admin-card-head"><span className="admin-card-icon">LOG</span><div><span className="eyebrow">HISTÓRICO DO ADM</span><h3>Últimas ações</h3></div></div><div className="audit-list">{audit.length ? audit.map((item) => <div key={item.id}><strong>{item.action}</strong><span>{item.detail}</span><small>{timestampLabel(item.createdAt)}</small></div>) : <p>Nenhuma ação registrada ainda.</p>}</div></article></section></>}

    {tab === "users" && <section className="section-block admin-users">
      <div className="section-heading"><div><span className="eyebrow">MONITORAMENTO E ACESSO</span><h2>Todos os usuários</h2></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome ou e-mail" /></div>
      {loading ? <div className="admin-loading">Carregando usuários e progresso…</div> : <div className="admin-user-list admin-user-list-rich">{filteredUsers.map((person) => {
        const owner = isOwner(person.email);
        const enabled = owner || allowed.has(person.uid);
        const isBlocked = !owner && blocked.has(person.uid);
        const data = metrics[person.uid] ?? { lessons: 0, stages: 0, questions: 0, openTasks: 0 };
        const profile = studentProfiles[person.uid];
        return <article key={person.uid}>
          <div className="admin-avatar">{(person.displayName || person.email).slice(0, 1).toUpperCase()}</div>
          <div><strong>{profile?.displayName || profile?.fullName || person.displayName || "Usuário"}</strong><small>{person.email}</small><em>Visto: {timestampLabel(person.lastSeenAt)}</em></div>
          <div className="student-admin-data"><span>IDENTIFICAÇÃO</span><strong>{profile?.ra ? `RA ${profile.ra}-${profile.raDigit}` : "Cadastro pendente"}</strong><small>{profile?.fullName || "Aguardando nome e RA"}</small></div>
          <div className="student-current-year"><small>PREPARAÇÃO</small><strong>ENEM + Inglês</strong></div>
          <div className="user-mini-metrics"><span><b>{data.lessons + data.stages}</b> etapas</span><span><b>{data.questions}</b> questões</span><span><b>{data.openTasks}</b> tarefas</span></div>
          <span className={isBlocked ? "access-blocked" : enabled ? "access-on" : "access-off"}>{owner ? "Dono · tudo liberado" : isBlocked ? "Painel bloqueado" : enabled ? "PDF liberado" : "Versão em texto"}</span>
          <div className="user-admin-actions"><button disabled={owner} className={enabled ? "danger" : "primary"} onClick={() => void toggleAccess(person)}>{owner ? "PDF permanente" : enabled ? "Remover PDF" : "Liberar PDF"}</button><button disabled={owner} className={isBlocked ? "primary" : "danger-outline"} onClick={() => void toggleSiteAccess(person)}>{isBlocked ? "Liberar painel" : "Bloquear painel"}</button><button className="danger-outline" onClick={() => void resetProgress(person)}>Zerar progresso</button></div>
        </article>;
      })}</div>}
    </section>}

    {tab === "content" && <><section className="admin-grid"><article className="admin-card pdf-admin-card"><div className="admin-card-head"><span className="admin-card-icon">PDF</span><div><span className="eyebrow">MATERIAL PROTEGIDO</span><h3>Caderno SAME</h3></div></div><p>{pdfInfo}</p><label className={`upload-button ${uploading ? "disabled" : ""}`}><input type="file" accept="application/pdf" disabled={uploading} onChange={(event) => void uploadPdf(event.target.files?.[0])} /><span>{uploading ? `Enviando… ${uploadProgress}%` : "Enviar ou substituir PDF"}</span></label><small>Continua gratuito: o arquivo fica dividido em partes no Firestore, fora do GitHub e da Vercel.</small></article><article className="admin-card"><div className="admin-card-head"><span className="admin-card-icon">+Q</span><div><span className="eyebrow">EDITOR DE QUESTÕES</span><h3>Publicar nova questão</h3></div></div><div className="question-editor"><label>Matéria<select value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })}>{practiceSubjectOrder.map((id) => <option value={id} key={id}>{practiceSubjectNames[id]}</option>)}</select></label><label>Enunciado<textarea value={draft.prompt} onChange={(event) => setDraft({ ...draft, prompt: event.target.value })} placeholder="Digite a pergunta…" /></label><label className="inline-check"><input type="checkbox" checked={draft.written} onChange={(event) => setDraft({ ...draft, written: event.target.checked })} /> Resposta escrita</label>{!draft.written && <><label>Alternativas (uma por linha)<textarea value={draft.options} onChange={(event) => setDraft({ ...draft, options: event.target.value })} placeholder={"Alternativa A\nAlternativa B\nAlternativa C\nAlternativa D"} /></label><label>Alternativa correta<select value={draft.correct} onChange={(event) => setDraft({ ...draft, correct: Number(event.target.value) })}>{[0,1,2,3,4].map((value) => <option value={value} key={value}>{String.fromCharCode(65 + value)}</option>)}</select></label></>}<label>Correção / explicação<textarea value={draft.explanation} onChange={(event) => setDraft({ ...draft, explanation: event.target.value })} placeholder="Explique por que essa é a resposta…" /></label><button className="primary" disabled={saving} onClick={() => void createQuestion()}>Publicar para todos</button></div></article></section><section className="section-block"><div className="section-heading"><div><span className="eyebrow">CONTEÚDO CRIADO NO ADM</span><h2>{customQuestions.length} questões personalizadas</h2></div></div><div className="custom-question-list">{customQuestions.map((question) => <article key={question.id}><span>{practiceSubjectNames[question.subject]}</span><strong>{question.prompt}</strong><small>{question.written ? "Resposta escrita" : `${question.options?.length ?? 0} alternativas`}</small><button onClick={() => void removeQuestion(question)}>Excluir</button></article>)}{!customQuestions.length && <div className="question-empty"><strong>Nenhuma personalizada ainda.</strong><p>As 55 questões incluídas no código já estão publicadas.</p></div>}</div></section></>}

    {tab === "settings" && <section className="admin-grid"><article className="admin-card"><div className="admin-card-head"><span className="admin-card-icon">⚙</span><div><span className="eyebrow">FUNCIONAMENTO</span><h3>Controles gerais</h3></div></div>{([{ key: "assessmentsEnabled", title: "Check antes de concluir", detail: "Exige resposta nas aulas e no estágio Domínio." }, { key: "publicPracticeEnabled", title: "Prática ENEM ativa", detail: "Exibe o banco geral de questões da preparação." }, { key: "pdfEnabled", title: "Caderno protegido ativo", detail: "Permite abrir o material para usuários autorizados." }, { key: "maintenanceMode", title: "Modo manutenção", detail: "Bloqueia temporariamente o painel para todos, menos você." }] as const).map((item) => <label className="admin-toggle" key={item.key}><div><strong>{item.title}</strong><small>{item.detail}</small></div><input type="checkbox" checked={settings[item.key]} onChange={(event) => void saveSettings({ ...settings, [item.key]: event.target.checked })} /></label>)}</article><article className="admin-card"><div className="admin-card-head"><span className="admin-card-icon">MSG</span><div><span className="eyebrow">COMUNICAÇÃO</span><h3>Aviso e meta diária</h3></div></div><div className="question-editor"><label className="inline-check"><input type="checkbox" checked={settings.announcementEnabled} onChange={(event) => setSettings({ ...settings, announcementEnabled: event.target.checked })} /> Mostrar aviso para todos</label><label>Mensagem<textarea value={settings.announcement} onChange={(event) => setSettings({ ...settings, announcement: event.target.value })} placeholder="Ex.: Simulado novo disponível sábado." /></label><label>Meta diária de questões<input type="number" min="1" max="100" value={settings.dailyQuestionGoal} onChange={(event) => setSettings({ ...settings, dailyQuestionGoal: Math.max(1, Math.min(100, Number(event.target.value) || 1)) })} /></label><button className="primary" disabled={saving} onClick={() => void saveSettings(settings)}>Salvar e publicar</button></div></article></section>}

  </div>;
}
