"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { getMetadata, ref, uploadBytes } from "firebase/storage";
import { defaultAppSettings, isOwner, PROTECTED_PDF_PATH, type AppSettings } from "./access-control";
import { firestore, firebaseStorage } from "./firebase-client";

type DirectoryUser = { uid: string; email: string; displayName?: string; photoURL?: string; lastSeenAt?: { toDate?: () => Date } };

type Props = {
  user: User;
  onNotice: (message: string) => void;
};

export default function AdminPanel({ user, onNotice }: Props) {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [allowed, setAllowed] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pdfInfo, setPdfInfo] = useState("Verificando arquivo…");

  const loadAdmin = useCallback(async () => {
    if (!isOwner(user.email)) return;
    setLoading(true);
    try {
      const [directorySnapshot, accessSnapshot, settingsSnapshot] = await Promise.all([
        getDocs(collection(firestore, "userDirectory")),
        getDocs(collection(firestore, "pdfAccess")),
        getDoc(doc(firestore, "appSettings", "main")),
      ]);
      setUsers(directorySnapshot.docs.map((item) => ({ uid: item.id, ...item.data() } as DirectoryUser)).sort((a, b) => a.email.localeCompare(b.email)));
      setAllowed(new Set(accessSnapshot.docs.filter((item) => item.data().enabled === true).map((item) => item.id)));
      if (settingsSnapshot.exists()) setSettings({ ...defaultAppSettings, ...settingsSnapshot.data() } as AppSettings);
      try {
        const metadata = await getMetadata(ref(firebaseStorage, PROTECTED_PDF_PATH));
        setPdfInfo(`PDF protegido pronto · ${(metadata.size / 1024 / 1024).toFixed(1)} MB · atualizado em ${new Date(metadata.updated).toLocaleDateString("pt-BR")}`);
      } catch {
        setPdfInfo("Nenhum PDF protegido enviado ainda.");
      }
    } catch {
      onNotice("O Firebase recusou o painel ADM. Publique as novas regras do Firestore e do Storage.");
    } finally {
      setLoading(false);
    }
  }, [onNotice, user.email]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAdmin(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAdmin]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return users.filter((item) => !query || `${item.email} ${item.displayName ?? ""}`.toLocaleLowerCase("pt-BR").includes(query));
  }, [search, users]);

  async function toggleAccess(person: DirectoryUser) {
    const accessRef = doc(firestore, "pdfAccess", person.uid);
    const next = new Set(allowed);
    try {
      if (next.has(person.uid)) {
        await deleteDoc(accessRef);
        next.delete(person.uid);
        onNotice(`Acesso ao PDF removido de ${person.email}.`);
      } else {
        await setDoc(accessRef, { uid: person.uid, email: person.email, enabled: true, updatedAt: serverTimestamp(), updatedBy: user.email });
        next.add(person.uid);
        onNotice(`Acesso ao PDF liberado para ${person.email}.`);
      }
      setAllowed(next);
    } catch {
      onNotice("Não consegui mudar essa permissão. Confira as regras do Firestore.");
    }
  }

  async function updateSetting(key: keyof AppSettings, value: boolean) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      await setDoc(doc(firestore, "appSettings", "main"), { ...next, updatedAt: serverTimestamp(), updatedBy: user.email }, { merge: true });
      onNotice("Configuração do painel atualizada.");
    } catch {
      setSettings(settings);
      onNotice("O Firebase não deixou salvar essa configuração.");
    }
  }

  async function uploadPdf(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf") return onNotice("Escolha um arquivo PDF.");
    if (file.size > 25 * 1024 * 1024) return onNotice("Use o PDF compacto de até 25 MB que está na pasta private-materials.");
    setUploading(true);
    try {
      await uploadBytes(ref(firebaseStorage, PROTECTED_PDF_PATH), file, { contentType: "application/pdf", customMetadata: { access: "admin-controlled", uploadedBy: user.email ?? "owner" } });
      setPdfInfo(`PDF protegido pronto · ${(file.size / 1024 / 1024).toFixed(1)} MB · atualizado agora`);
      onNotice("PDF enviado com proteção. Só você e as pessoas liberadas conseguem baixar.");
    } catch {
      onNotice("O upload foi bloqueado. Publique primeiro as novas regras do Storage.");
    } finally {
      setUploading(false);
    }
  }

  if (!isOwner(user.email)) return null;

  return <div className="page-content admin-page">
    <section className="admin-hero"><div><span className="eyebrow">CONTROLE DO LORD</span><h2>Painel de administração</h2><p>Gerencie o material protegido, quem pode acessá-lo e as regras de conclusão das aulas.</p></div><button className="secondary" onClick={() => void loadAdmin()}>↻ Atualizar dados</button></section>
    <div className="admin-stats"><article><strong>{users.length}</strong><span>pessoas cadastradas</span></article><article><strong>{allowed.size + 1}</strong><span>com acesso ao PDF</span></article><article><strong>{settings.assessmentsEnabled ? "Ativo" : "Pausado"}</strong><span>check de aprendizado</span></article></div>

    <section className="admin-grid">
      <article className="admin-card pdf-admin-card"><div className="admin-card-head"><span className="admin-card-icon">PDF</span><div><span className="eyebrow">MATERIAL PROTEGIDO</span><h3>Caderno SAME</h3></div></div><p>{pdfInfo}</p><label className={`upload-button ${uploading ? "disabled" : ""}`}><input type="file" accept="application/pdf" disabled={uploading} onChange={(event) => void uploadPdf(event.target.files?.[0])} /><span>{uploading ? "Enviando…" : "Enviar ou substituir PDF"}</span></label><small>O arquivo fica em Firebase Storage, fora do GitHub e protegido pelas permissões abaixo.</small></article>
      <article className="admin-card"><div className="admin-card-head"><span className="admin-card-icon">⚙</span><div><span className="eyebrow">REGRAS DO PAINEL</span><h3>Configurações</h3></div></div><label className="admin-toggle"><div><strong>Check antes de concluir</strong><small>Exige uma resposta em cada aula e no estágio Domínio.</small></div><input type="checkbox" checked={settings.assessmentsEnabled} onChange={(event) => void updateSetting("assessmentsEnabled", event.target.checked)} /></label><label className="admin-toggle"><div><strong>PDF protegido ativo</strong><small>Quando desligado, todos usam somente as questões em texto.</small></div><input type="checkbox" checked={settings.pdfEnabled} onChange={(event) => void updateSetting("pdfEnabled", event.target.checked)} /></label></article>
    </section>

    <section className="section-block admin-users"><div className="section-heading"><div><span className="eyebrow">ACESSO INDIVIDUAL</span><h2>Quem pode ver o PDF original</h2></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome ou e-mail" /></div><div className="admin-explain"><span>1</span><p>A pessoa entra uma vez com Google.</p><span>2</span><p>Ela aparece nesta lista.</p><span>3</span><p>Você toca em “Liberar PDF”.</p></div>{loading ? <div className="admin-loading">Carregando usuários…</div> : <div className="admin-user-list">{filteredUsers.map((person) => { const owner = isOwner(person.email); const enabled = owner || allowed.has(person.uid); return <article key={person.uid}><div className="admin-avatar">{(person.displayName || person.email).slice(0, 1).toUpperCase()}</div><div><strong>{person.displayName || "Usuário"}</strong><small>{person.email}</small></div><span className={enabled ? "access-on" : "access-off"}>{owner ? "Dono" : enabled ? "Liberado" : "Só texto"}</span><button disabled={owner} className={enabled ? "danger" : "primary"} onClick={() => void toggleAccess(person)}>{owner ? "Acesso permanente" : enabled ? "Remover PDF" : "Liberar PDF"}</button></article>; })}{!filteredUsers.length && <div className="question-empty"><strong>Nenhum usuário encontrado.</strong><p>A pessoa precisa entrar com Google uma vez para aparecer aqui.</p></div>}</div>}</section>
  </div>;
}
