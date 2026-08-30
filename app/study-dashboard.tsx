"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Lesson, lessons } from "./course-data";
import { enemData, EnemLevel, EnemSkill, EnemSubjectId } from "./enem-data";
import { firebaseAuth, firestore, googleProvider } from "./firebase-client";
import type { QuestionFocus, QuestionProgressMap } from "./question-bank";
import type { QuestionSubject } from "./question-bank-types";
import MasteryCheck from "./mastery-check";
import { lessonMastery, skillMasteryQuestion } from "./mastery-data";
import { englishLessonContent } from "./english-lesson-content";
import { defaultAppSettings, isOwner, type AppSettings } from "./access-control";
import StudentLobby from "./student-lobby";
import StudentProfileSetup from "./student-profile-setup";
import { isCompleteStudentProfile, studentProfileStorageKey, type StudentProfile } from "./student-profile";
import type { AssessmentMap, AssessmentRecord, ExamAnswerSheetMap } from "./enem-exam-library";
import type { EssayRecord } from "./writing-studio";

type View = "home" | "plan" | "bank" | "writing" | "english" | "tasks" | "admin";
type Status = "pending" | "done" | "not_done";
type ProgressMap = Record<string, Status>;
type Task = { id: number; title: string; category: string; dueDate: string; done: boolean };
type StudySubjectId = EnemSubjectId | "english";
type SubjectSelection = EnemSubjectId | "all" | "exams";
type Stage = "theory" | "practice" | "mastery";
type SkillProgress = Record<string, Partial<Record<Stage, boolean>>>;
type SyncState = "offline" | "syncing" | "synced" | "error";
type CloudDashboard = { progress?: ProgressMap; skillProgress?: SkillProgress; assessmentResults?: AssessmentMap; examAnswerSheets?: ExamAnswerSheetMap; questionProgress?: QuestionProgressMap; tasks?: Task[]; essays?: EssayRecord[] };
type SubjectMeta = { id: StudySubjectId; name: string; shortName: string; icon: string; color: string; description: string };

const viewLabels: Record<View, string> = { home: "Início", plan: "Plano ENEM", bank: "Questões", writing: "Redação", english: "Inglês", tasks: "Agenda", admin: "ADM" };
const viewIcons: Record<View, string> = { home: "⌂", plan: "◫", bank: "?", writing: "R", english: "EN", tasks: "✓", admin: "⚙" };
const levels: EnemLevel[] = ["Nivelamento", "Básico I", "Básico II", "Construção", "Ataque"];
const stages: { id: Stage; label: string; short: string }[] = [
  { id: "theory", label: "Teoria", short: "T" },
  { id: "practice", label: "Prática", short: "P" },
  { id: "mastery", label: "Domínio", short: "D" },
];

const studySubjects: SubjectMeta[] = [
  { id: "math", name: "Matemática", shortName: "MAT", icon: "x²", color: "#e6a23c", description: "Base matemática, funções, estatística, geometria e resolução de problemas." },
  { id: "portuguese", name: "Linguagens", shortName: "LC", icon: "Aa", color: "#3478d4", description: "Interpretação, gramática, literatura, gêneros textuais e redação." },
  { id: "biology", name: "Biologia", shortName: "BIO", icon: "DNA", color: "#35a873", description: "Vida, ecologia, genética e fisiologia para o ENEM." },
  { id: "physics", name: "Física", shortName: "FIS", icon: "F=", color: "#e56b61", description: "Fenômenos, energia, movimento, eletricidade e óptica." },
  { id: "chemistry", name: "Química", shortName: "QUI", icon: "Qm", color: "#9a6fe8", description: "Matéria, reações, cálculos e química do cotidiano." },
  { id: "history", name: "História", shortName: "HIS", icon: "H", color: "#d99b31", description: "Processos históricos, Brasil e mundo contemporâneo." },
  { id: "geography", name: "Geografia", shortName: "GEO", icon: "◎", color: "#e47c38", description: "Espaço, economia, ambiente, campo e geopolítica." },
  { id: "philosophy", name: "Filosofia", shortName: "FIL", icon: "φ", color: "#51a976", description: "Pensadores, ética, política e teoria do conhecimento." },
  { id: "sociology", name: "Sociologia", shortName: "SOC", icon: "S", color: "#dc639a", description: "Sociedade, trabalho, cultura, política e movimentos sociais." },
  { id: "english", name: "Inglês", shortName: "ING", icon: "EN", color: "#7c6cf2", description: "Do básico até conversar e entender textos simples." },
];

type SkillWithId = EnemSkill & { id: string };
const intensiveSkills: SkillWithId[] = enemData.skills.map((skill, index) => ({ ...skill, id: `enem-skill-${index}` }));
const englishLessons = lessons.filter((lesson) => lesson.subject === "english");
const QuestionBank = dynamic(() => import("./question-bank"), { loading: () => <div className="module-loading">Preparando as questões…</div> });
const AdminPanel = dynamic(() => import("./admin-panel"), { loading: () => <div className="module-loading">Abrindo a Central ADM…</div> });
const EnemExamLibrary = dynamic(() => import("./enem-exam-library"), { loading: () => <div className="module-loading">Organizando as provas oficiais…</div> });
const WritingStudio = dynamic(() => import("./writing-studio"), { loading: () => <div className="module-loading">Preparando seu espaço de redação…</div> });

function subjectById(id: StudySubjectId) { return studySubjects.find((subject) => subject.id === id)!; }
function isEnemSubject(id: StudySubjectId): id is EnemSubjectId { return id !== "english"; }
function hasQuestionBank(id: EnemSubjectId): id is QuestionSubject { return ["math", "portuguese", "biology", "chemistry", "physics", "history", "geography", "philosophy", "sociology"].includes(id); }
function formatDate(date: Date | null) { return date ? new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(date) : "organizando o dia"; }
function displayTopic(skill: SkillWithId) {
  const prefixes = ["Átomo", "Íons:", "Isótopos", "Distribuição eletrônica", "Efeitos luminosos"];
  return skill.page === 35 && prefixes.some((prefix) => skill.skill.startsWith(prefix)) ? "Atomística" : skill.topic;
}
function totalAssessment(record?: AssessmentRecord) { return record ? (Number(record.objective) || [record.lc, record.ch, record.cn, record.math].reduce((sum, value) => sum + (Number(value) || 0), 0)) : 0; }
function localDateKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
export default function StudyDashboard() {
  const [view, setView] = useState<View>("home");
  const [progress, setProgress] = useState<ProgressMap>({});
  const [skillProgress, setSkillProgress] = useState<SkillProgress>({});
  const [assessmentResults, setAssessmentResults] = useState<AssessmentMap>({});
  const [examAnswerSheets, setExamAnswerSheets] = useState<ExamAnswerSheetMap>({});
  const [questionProgress, setQuestionProgress] = useState<QuestionProgressMap>({});
  const [questionFocus, setQuestionFocus] = useState<QuestionFocus | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [essays, setEssays] = useState<EssayRecord[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillWithId | null>(null);
  const [masteryLesson, setMasteryLesson] = useState<Lesson | null>(null);
  const [masterySkill, setMasterySkill] = useState<SkillWithId | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectSelection>("all");
  const [selectedLevel, setSelectedLevel] = useState<EnemLevel | "all">("all");
  const [courseSearch, setCourseSearch] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("ENEM");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudReady, setCloudReady] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("offline");
  const [pdfAllowed, setPdfAllowed] = useState(false);
  const [siteBlocked, setSiteBlocked] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setCurrentDate(new Date());
        setProgress(JSON.parse(window.localStorage.getItem("lord-focus-progress") ?? "{}"));
        setSkillProgress(JSON.parse(window.localStorage.getItem("lord-enem-progress") ?? "{}"));
        setAssessmentResults(JSON.parse(window.localStorage.getItem("lord-enem-assessments") ?? "{}"));
        setExamAnswerSheets(JSON.parse(window.localStorage.getItem("clareia-exam-answer-sheets") ?? "{}"));
        setQuestionProgress(JSON.parse(window.localStorage.getItem("lord-question-progress") ?? "{}"));
        setTasks(JSON.parse(window.localStorage.getItem("lord-focus-tasks") ?? "[]"));
        setEssays(JSON.parse(window.localStorage.getItem("clareia-essays") ?? "[]"));
      } catch { setNotice("Não consegui ler o progresso deste navegador."); }
      finally { setLoading(false); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!mobileMenu) return;
    const previousOverflow = document.body.style.overflow;
    const closeMenu = () => setMobileMenu(false);
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeMenu(); };
    const handleResize = () => { if (window.innerWidth > 760) closeMenu(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenu]);

  useEffect(() => onAuthStateChanged(firebaseAuth, async (currentUser) => {
    setUser(currentUser); setCloudReady(false); setProfileChecked(false); setStudentProfile(null);
    if (!currentUser) { setSyncState("offline"); setPdfAllowed(false); setSiteBlocked(false); setView((current) => current === "admin" ? "home" : current); setProfileChecked(true); setAuthLoading(false); return; }
    setSyncState("syncing");
    try {
      await setDoc(doc(firestore, "userDirectory", currentUser.uid), { uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName ?? "", photoURL: currentUser.photoURL ?? "", lastSeenAt: serverTimestamp() }, { merge: true });
      const [accessSnapshot, controlsSnapshot, settingsSnapshot, cloudSnapshot, profileSnapshot] = await Promise.all([
        getDoc(doc(firestore, "pdfAccess", currentUser.uid)), getDoc(doc(firestore, "userControls", currentUser.uid)),
        getDoc(doc(firestore, "appSettings", "main")), getDoc(doc(firestore, "users", currentUser.uid, "dashboard", "main")), getDoc(doc(firestore, "studentProfiles", currentUser.uid)),
      ]);
      let storedProfile = profileSnapshot.exists() ? profileSnapshot.data() : null;
      if (!isCompleteStudentProfile(storedProfile)) {
        try {
          const localProfile = JSON.parse(window.localStorage.getItem(studentProfileStorageKey(currentUser.uid)) ?? "null");
          if (isCompleteStudentProfile(localProfile) && localProfile.uid === currentUser.uid && localProfile.email === currentUser.email) storedProfile = localProfile;
        } catch { console.warn("[student-profile] O perfil local não pôde ser lido."); }
      }
      if (isCompleteStudentProfile(storedProfile)) {
        setStudentProfile(storedProfile);
        try { window.localStorage.setItem(studentProfileStorageKey(currentUser.uid), JSON.stringify(storedProfile)); }
        catch { console.warn("[student-profile] O perfil não pôde ser guardado neste navegador."); }
        if (!profileSnapshot.exists()) {
          void setDoc(doc(firestore, "studentProfiles", currentUser.uid), { ...storedProfile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
            .catch((reason) => console.warn("[student-profile] A cópia na nuvem será tentada novamente no próximo acesso.", { code: reason?.code ?? "unknown" }));
        }
      }
      setPdfAllowed(isOwner(currentUser.email) || (accessSnapshot.exists() && accessSnapshot.data().enabled === true));
      setSiteBlocked(!isOwner(currentUser.email) && controlsSnapshot.exists() && controlsSnapshot.data().siteEnabled === false);
      if (settingsSnapshot.exists()) setAppSettings({ ...defaultAppSettings, ...settingsSnapshot.data() } as AppSettings);
      const resetToken = controlsSnapshot.exists() ? Number(controlsSnapshot.data().resetToken ?? 0) : 0;
      const previousResetToken = Number(window.localStorage.getItem("lord-admin-reset-token") ?? 0);
      if (resetToken > previousResetToken) {
        ["lord-focus-progress", "lord-focus-tasks", "lord-enem-progress", "lord-enem-assessments", "clareia-exam-answer-sheets", "lord-question-progress", "clareia-essays"].forEach((key) => window.localStorage.removeItem(key));
        setProgress({}); setTasks([]); setSkillProgress({}); setAssessmentResults({}); setExamAnswerSheets({}); setQuestionProgress({}); setEssays([]);
        window.localStorage.setItem("lord-admin-reset-token", String(resetToken));
      }
      if (cloudSnapshot.exists()) {
        const cloud = cloudSnapshot.data() as CloudDashboard;
        if (cloud.progress) { setProgress(cloud.progress); window.localStorage.setItem("lord-focus-progress", JSON.stringify(cloud.progress)); }
        if (cloud.skillProgress) { setSkillProgress(cloud.skillProgress); window.localStorage.setItem("lord-enem-progress", JSON.stringify(cloud.skillProgress)); }
        if (cloud.assessmentResults) { setAssessmentResults(cloud.assessmentResults); window.localStorage.setItem("lord-enem-assessments", JSON.stringify(cloud.assessmentResults)); }
        if (cloud.examAnswerSheets) { setExamAnswerSheets(cloud.examAnswerSheets); window.localStorage.setItem("clareia-exam-answer-sheets", JSON.stringify(cloud.examAnswerSheets)); }
        if (cloud.questionProgress) { setQuestionProgress(cloud.questionProgress); window.localStorage.setItem("lord-question-progress", JSON.stringify(cloud.questionProgress)); }
        if (cloud.tasks) { setTasks(cloud.tasks); window.localStorage.setItem("lord-focus-tasks", JSON.stringify(cloud.tasks)); }
        if (cloud.essays) { setEssays(cloud.essays); window.localStorage.setItem("clareia-essays", JSON.stringify(cloud.essays)); }
      } else {
        const localDashboard: CloudDashboard = { progress: JSON.parse(window.localStorage.getItem("lord-focus-progress") ?? "{}"), skillProgress: JSON.parse(window.localStorage.getItem("lord-enem-progress") ?? "{}"), assessmentResults: JSON.parse(window.localStorage.getItem("lord-enem-assessments") ?? "{}"), examAnswerSheets: JSON.parse(window.localStorage.getItem("clareia-exam-answer-sheets") ?? "{}"), questionProgress: JSON.parse(window.localStorage.getItem("lord-question-progress") ?? "{}"), tasks: JSON.parse(window.localStorage.getItem("lord-focus-tasks") ?? "[]"), essays: JSON.parse(window.localStorage.getItem("clareia-essays") ?? "[]") };
        await setDoc(doc(firestore, "users", currentUser.uid, "dashboard", "main"), { ...localDashboard, updatedAt: serverTimestamp() });
      }
      setCloudReady(true); setSyncState("synced");
    } catch { setSyncState("error"); setNotice("Entrei na conta, mas a sincronização não respondeu. O progresso continua salvo neste aparelho."); }
    finally { setProfileChecked(true); setAuthLoading(false); }
  }), []);

  async function saveToCloud(changes: CloudDashboard) {
    if (!user || !cloudReady) return;
    setSyncState("syncing");
    try { await setDoc(doc(firestore, "users", user.uid, "dashboard", "main"), { ...changes, updatedAt: serverTimestamp() }, { merge: true }); setSyncState("synced"); }
    catch { setSyncState("error"); setNotice("Salvei neste aparelho, mas a nuvem não respondeu."); }
  }
  async function connectGoogle() {
    try { await signInWithPopup(firebaseAuth, googleProvider); }
    catch (error) { const code = typeof error === "object" && error && "code" in error ? String(error.code) : ""; if (code !== "auth/popup-closed-by-user") setNotice("Não consegui abrir o login Google. Confira o domínio no Firebase."); }
  }
  async function disconnectGoogle() { await signOut(firebaseAuth); }

  const skillStageDoneCount = Object.values(skillProgress).reduce((sum, item) => sum + stages.filter((stage) => item[stage.id]).length, 0);
  const answeredCount = Object.values(questionProgress).filter((attempt) => Boolean(attempt.answer || attempt.note?.trim())).length;
  const sidebarDone = skillStageDoneCount + answeredCount;
  const sidebarPercent = Math.min(100, Math.round((sidebarDone / (intensiveSkills.length * 3 + 2000)) * 100));
  const nextGlobalSkill = intensiveSkills.find((skill) => !skillProgress[skill.id]?.mastery) ?? intensiveSkills[0];
  const nextEnglishLesson = englishLessons.find((lesson) => progress[lesson.id] !== "done") ?? englishLessons.at(-1)!;
  const todayKey = localDateKey();
  const sortedTasks = useMemo(() => [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31") || b.id - a.id), [tasks]);

  const activeEnemSkills = useMemo(() => {
    if (selectedSubject === "all" || selectedSubject === "exams") return [];
    const query = courseSearch.trim().toLocaleLowerCase("pt-BR");
    return intensiveSkills.filter((skill) => skill.subject === selectedSubject && (selectedLevel === "all" || skill.level === selectedLevel) && (!query || `${displayTopic(skill)} ${skill.skill} ${skill.relevance}`.toLocaleLowerCase("pt-BR").includes(query)));
  }, [courseSearch, selectedLevel, selectedSubject]);
  const topicGroups = useMemo(() => {
    const groups = new Map<string, SkillWithId[]>();
    activeEnemSkills.forEach((skill) => { const key = `${skill.level}|||${displayTopic(skill)}`; groups.set(key, [...(groups.get(key) ?? []), skill]); });
    return Array.from(groups.entries()).map(([key, skills]) => { const [level, topic] = key.split("|||"); return { level: level as EnemLevel, topic, skills }; });
  }, [activeEnemSkills]);

  function setLessonStatus(lesson: Lesson, status: Status) {
    const next = { ...progress, [lesson.id]: status }; setProgress(next); window.localStorage.setItem("lord-focus-progress", JSON.stringify(next)); void saveToCloud({ progress: next }); setNotice(status === "done" ? "Aula de inglês concluída." : "A aula continua na fila.");
  }
  function toggleSkillStage(skill: SkillWithId, stage: Stage) {
    const next = { ...skillProgress, [skill.id]: { ...skillProgress[skill.id], [stage]: !skillProgress[skill.id]?.[stage] } }; setSkillProgress(next); window.localStorage.setItem("lord-enem-progress", JSON.stringify(next)); void saveToCloud({ skillProgress: next }); setNotice(`${stages.find((item) => item.id === stage)?.label} atualizada em ${displayTopic(skill)}.`);
  }
  function requestSkillStage(skill: SkillWithId, stage: Stage) { if (stage === "mastery" && !skillProgress[skill.id]?.mastery && appSettings.assessmentsEnabled) return setMasterySkill(skill); toggleSkillStage(skill, stage); }
  function updateAssessment(name: string, field: keyof AssessmentRecord, value: string) {
    const empty: AssessmentRecord = { date: "", lc: "", ch: "", cn: "", math: "", objective: "", time: "" };
    const digits = value.replace(/\D/g, "").slice(0, field === "objective" ? 3 : 2);
    const cleanValue = field === "date" ? value : field === "time" ? value.replace(/[^0-9hm: ]/gi, "").slice(0, 8) : digits ? String(Math.min(field === "objective" ? 180 : 45, Number(digits))) : "";
    const next = { ...assessmentResults, [name]: { ...(assessmentResults[name] ?? empty), [field]: cleanValue } }; setAssessmentResults(next); window.localStorage.setItem("lord-enem-assessments", JSON.stringify(next));
  }
  function persistAssessmentResult(name: string, record: AssessmentRecord) { const next = { ...assessmentResults, [name]: record }; setAssessmentResults(next); window.localStorage.setItem("lord-enem-assessments", JSON.stringify(next)); void saveToCloud({ assessmentResults: next }); }
  function persistAssessments() { void saveToCloud({ assessmentResults }); }
  function updateExamAnswerSheets(next: ExamAnswerSheetMap) { setExamAnswerSheets(next); window.localStorage.setItem("clareia-exam-answer-sheets", JSON.stringify(next)); }
  function persistExamAnswerSheets(next: ExamAnswerSheetMap) { updateExamAnswerSheets(next); void saveToCloud({ examAnswerSheets: next }); }
  function updateQuestionProgress(next: QuestionProgressMap) { setQuestionProgress(next); window.localStorage.setItem("lord-question-progress", JSON.stringify(next)); void saveToCloud({ questionProgress: next }); }
  function openQuestionForSkill(skill: SkillWithId) { if (!hasQuestionBank(skill.subject)) return; setQuestionFocus({ subject: skill.subject, topic: `${displayTopic(skill)} ${skill.skill}`, nonce: Date.now() }); setSelectedSkill(null); setView("bank"); }
  function addTask(event: FormEvent) { event.preventDefault(); if (!taskTitle.trim()) return; const task: Task = { id: Date.now(), title: taskTitle.trim(), category: taskCategory, dueDate: taskDueDate, done: false }; const next = [task, ...tasks]; setTasks(next); window.localStorage.setItem("lord-focus-tasks", JSON.stringify(next)); void saveToCloud({ tasks: next }); setTaskTitle(""); setTaskDueDate(""); setNotice("Planejamento guardado."); }
  function toggleTask(task: Task) { const next = tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item); setTasks(next); window.localStorage.setItem("lord-focus-tasks", JSON.stringify(next)); void saveToCloud({ tasks: next }); }
  function deleteTask(task: Task) { const next = tasks.filter((item) => item.id !== task.id); setTasks(next); window.localStorage.setItem("lord-focus-tasks", JSON.stringify(next)); void saveToCloud({ tasks: next }); }
  function updateEssays(next: EssayRecord[], message: string) { setEssays(next); window.localStorage.setItem("clareia-essays", JSON.stringify(next)); void saveToCloud({ essays: next }); setNotice(message); }
  async function copyText(text: string) { try { await navigator.clipboard.writeText(text); setNotice("Mensagem copiada."); } catch { setNotice("Não consegui copiar automaticamente."); } }
  function goToSubject(id: EnemSubjectId) { setSelectedSubject(id); setSelectedLevel("all"); setCourseSearch(""); setView("plan"); }
  function getSubjectProgress(id: EnemSubjectId) { const subjectSkills = intensiveSkills.filter((skill) => skill.subject === id); const done = subjectSkills.reduce((sum, skill) => sum + stages.filter((stage) => skillProgress[skill.id]?.[stage.id]).length, 0); return { done, total: subjectSkills.length * 3 }; }
  function nextSkillFor(id: EnemSubjectId) { return intensiveSkills.find((skill) => skill.subject === id && !skillProgress[skill.id]?.mastery) ?? intensiveSkills.find((skill) => skill.subject === id)!; }

  function renderSubjectHub() {
    const enemSubjects = studySubjects.filter((subject): subject is SubjectMeta & { id: EnemSubjectId } => isEnemSubject(subject.id));
    return <><section className="enem-home-hero"><div><span className="eyebrow">MAPA COMPLETO · ENEM</span><h2>Um único caminho para chegar preparado à prova.</h2><p>O cronograma original foi preservado: 747 habilidades organizadas do nivelamento ao ataque.</p><div><button className="primary" onClick={() => setView("bank")}>Abrir 2.000 questões →</button><button className="secondary" onClick={() => setSelectedSubject("exams")}>Provas e simulados</button></div></div><aside><strong>747</strong><span>habilidades</span><strong>2.000</strong><span>questões</span></aside></section><div className="subject-hub">{enemSubjects.map((subject) => { const stats = getSubjectProgress(subject.id); const skillCount = intensiveSkills.filter((skill) => skill.subject === subject.id).length; return <button className="subject-hub-card" key={subject.id} style={{ "--accent": subject.color } as React.CSSProperties} onClick={() => goToSubject(subject.id)}><span className="subject-hub-icon">{subject.icon}</span><div><span className="eyebrow">{skillCount} habilidades</span><h3>{subject.name}</h3><p>{subject.description}</p><div className="subject-card-progress"><span style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }} /></div><small>{stats.done} de {stats.total} etapas marcadas</small></div><b>→</b></button>; })}</div></>;
  }

  function renderEnemCourse(subjectId: EnemSubjectId) {
    const subject = subjectById(subjectId); const overview = enemData.overview.filter((item) => item.subject === subjectId); const allSubjectSkills = intensiveSkills.filter((skill) => skill.subject === subjectId); const videos = enemData.videos.filter((video) => video.subject === subjectId); const stats = getSubjectProgress(subjectId); const nextSkill = nextSkillFor(subjectId);
    return <><section className="subject-focus" style={{ "--accent": subject.color } as React.CSSProperties}><button className="back-link" onClick={() => setSelectedSubject("all")}>← Todas as matérias</button><div className="subject-focus-grid"><div><span className="eyebrow">TRILHA COMPLETA · {subject.shortName}</span><h2>{subject.name}</h2><p>{subject.description} A ordem vai do Nivelamento até o Ataque.</p><div className="subject-focus-actions"><button className="primary" onClick={() => setSelectedSkill(nextSkill)}>Continuar de onde parei →</button><span>{stats.done}/{stats.total} etapas · {Math.round((stats.done / stats.total) * 100)}%</span></div></div><div className="subject-score"><strong>{allSubjectSkills.length}</strong><span>habilidades detalhadas</span><small>{overview.length} temas na visão geral</small></div></div></section>
      <section className="section-block"><div className="section-heading"><div><span className="eyebrow">VISÃO GERAL DO CRONOGRAMA</span><h2>Todos os temas</h2></div><span className="muted">Ordem original preservada</span></div><div className="overview-grid">{overview.map((item, index) => <article key={`${item.page}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.topic}</h3><p>{item.description}</p></article>)}</div></section>
      {videos.length > 0 && <section className="section-block"><div className="section-heading"><div><span className="eyebrow">AULAS DO MATERIAL</span><h2>Vídeos indicados</h2></div><span className="muted">Links originais do cronograma</span></div><div className="video-grid">{videos.map((video, index) => <a href={video.url} target="_blank" rel="noreferrer" key={video.url}><span>▶</span><div><small>AULA {String(index + 1).padStart(2, "0")}</small><strong>{video.title}</strong></div><b>↗</b></a>)}</div></section>}
      <section className="section-block"><div className="section-heading"><div><span className="eyebrow">CHECKLIST INTENSIVO</span><h2>Teoria, prática e domínio</h2></div><span className="muted">{activeEnemSkills.length} habilidades exibidas</span></div><div className="curriculum-tools"><input aria-label="Pesquisar conteúdo" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder={`Pesquisar em ${subject.name}...`} /><div className="level-filters"><button className={selectedLevel === "all" ? "active" : ""} onClick={() => setSelectedLevel("all")}>Todos</button>{levels.map((level) => <button key={level} className={selectedLevel === level ? "active" : ""} onClick={() => setSelectedLevel(level)}>{level}</button>)}</div></div><div className="topic-list">{topicGroups.map((group, groupIndex) => { const completed = group.skills.filter((skill) => skillProgress[skill.id]?.mastery).length; return <details className="topic-accordion" key={`${group.level}-${group.topic}`} open={groupIndex === 0}><summary><span className="level-pill">{group.level}</span><div><strong>{group.topic}</strong><small>{completed} de {group.skills.length} dominadas</small></div><b>{group.skills.length}</b></summary><div className="skill-list">{group.skills.map((skill, index) => <article className="skill-row" key={skill.id}><div className="skill-order">{String(index + 1).padStart(2, "0")}</div><div className="skill-copy"><strong>{skill.skill}</strong><small>{skill.relevance}</small></div><div className="stage-buttons" aria-label={`Progresso de ${skill.skill}`}>{stages.map((stage) => <button title={stage.label} aria-label={`${stage.label}: ${skill.skill}`} className={skillProgress[skill.id]?.[stage.id] ? "done" : ""} key={stage.id} onClick={() => requestSkillStage(skill, stage.id)}>{skillProgress[skill.id]?.[stage.id] ? "✓" : stage.short}<span>{stage.label}</span></button>)}</div><button className="study-skill" onClick={() => setSelectedSkill(skill)}>Estudar →</button></article>)}</div></details>; })}</div></section></>;
  }

  function renderAssessmentTracker() {
    return <><button className="back-link assessment-back" onClick={() => setSelectedSubject("all")}>← Voltar ao plano</button><EnemExamLibrary isAdmin={isOwner(user?.email)} assessments={assessmentResults} answerSheets={examAnswerSheets} onAssessmentResult={persistAssessmentResult} onAnswerSheetsChange={updateExamAnswerSheets} onAnswerSheetsPersist={persistExamAnswerSheets} onNotice={setNotice} /><section className="section-block"><div className="section-heading"><div><span className="eyebrow">TREINO COMPLEMENTAR</span><h2>Simulados autorais</h2></div><span className="muted">{enemData.simulations.length} registros</span></div><div className="assessment-table"><div className="assessment-row assessment-head"><span>Simulado</span><span>Data</span><span>LC</span><span>CH</span><span>CN</span><span>MAT</span><span>Total</span><span>Tempo</span></div>{enemData.simulations.map((name) => { const record = assessmentResults[name]; return <div className="assessment-row" key={name}><strong>{name}</strong><input aria-label={`Data de ${name}`} type="date" value={record?.date ?? ""} onChange={(event) => updateAssessment(name, "date", event.target.value)} onBlur={persistAssessments} /><input aria-label={`LC de ${name}`} inputMode="numeric" value={record?.lc ?? ""} onChange={(event) => updateAssessment(name, "lc", event.target.value)} onBlur={persistAssessments} /><input aria-label={`CH de ${name}`} inputMode="numeric" value={record?.ch ?? ""} onChange={(event) => updateAssessment(name, "ch", event.target.value)} onBlur={persistAssessments} /><input aria-label={`CN de ${name}`} inputMode="numeric" value={record?.cn ?? ""} onChange={(event) => updateAssessment(name, "cn", event.target.value)} onBlur={persistAssessments} /><input aria-label={`Matemática de ${name}`} inputMode="numeric" value={record?.math ?? ""} onChange={(event) => updateAssessment(name, "math", event.target.value)} onBlur={persistAssessments} /><span className="assessment-total">{totalAssessment(record)}</span><input aria-label={`Tempo de ${name}`} placeholder="5h20" value={record?.time ?? ""} onChange={(event) => updateAssessment(name, "time", event.target.value)} onBlur={persistAssessments} /></div>; })}</div></section></>;
  }

  const visibleViews = (Object.keys(viewLabels) as View[]).filter((item) => item !== "admin" || isOwner(user?.email));
  if (authLoading || !user) return <StudentLobby loading={authLoading} onGoogleLogin={connectGoogle} />;
  if (profileChecked && !studentProfile) return <StudentProfileSetup user={user} onComplete={(profile) => { setStudentProfile(profile); setNotice(`Bem-vindo, ${profile.displayName}. Seu perfil está pronto.`); }} onSignOut={disconnectGoogle} />;

  return <main className="app-shell">
    <aside id="main-sidebar" className={`sidebar ${mobileMenu ? "open" : ""}`}><div className="brand-row"><div className="brand-mark">C</div><div><strong>Clareia</strong><span>Preparação ENEM</span></div></div><nav aria-label="Navegação principal">{visibleViews.map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => { if (item === "plan") setSelectedSubject("all"); setView(item); setMobileMenu(false); }}><span aria-hidden="true">{viewIcons[item]}</span>{viewLabels[item]}</button>)}</nav><div className="sidebar-progress"><div className="level-ring" style={{ "--value": `${sidebarPercent * 3.6}deg` } as React.CSSProperties}><span>{sidebarPercent}%</span></div><div><strong>Mapa ENEM</strong><span>{sidebarDone} etapas concluídas</span></div></div><div className="sidebar-rule"><span>Regra da plataforma</span><p>Abra, siga o próximo passo e avance. Nada de perder tempo procurando o que estudar.</p></div></aside>
    {mobileMenu && <button type="button" className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}
    <section className="workspace"><header className="topbar"><button type="button" className="menu-button" aria-label={mobileMenu ? "Fechar menu" : "Abrir menu"} aria-controls="main-sidebar" aria-expanded={mobileMenu} onClick={() => setMobileMenu((value) => !value)}>☰</button><div><p>{formatDate(currentDate)}</p><h1>{viewLabels[view]}</h1></div><div className="top-actions"><div className="academic-year-chip"><span>ENEM</span><small>{currentDate?.getFullYear() ?? ""}</small></div><button className="quick-add" onClick={() => setView("tasks")}>+ Planejar</button><button className={`sync-account ${syncState}`} onClick={disconnectGoogle} title="Clique para sair da conta"><span>{syncState === "syncing" ? "↻" : syncState === "error" ? "!" : "✓"}</span><div><strong>{syncState === "syncing" ? "Salvando..." : syncState === "error" ? "Só neste aparelho" : "Sincronizado"}</strong><small>{user.displayName?.split(" ")[0] ?? user.email}</small></div></button></div></header>
      {notice && <button type="button" className="notice" role="status" aria-live="polite" aria-label={`${notice} Fechar aviso`} onClick={() => setNotice("")}><span className="notice-message">{notice}</span><span aria-hidden="true">×</span></button>}
      {appSettings.announcementEnabled && appSettings.announcement.trim() && <div className="global-announcement"><strong>AVISO DO ADM</strong><span>{appSettings.announcement}</span></div>}
      {(siteBlocked || (appSettings.maintenanceMode && !isOwner(user?.email))) && <div className="maintenance-lock"><div><span>{siteBlocked ? "ACESSO PAUSADO" : "MANUTENÇÃO"}</span><h2>{siteBlocked ? "Seu acesso foi pausado pelo ADM." : "A plataforma está sendo atualizada."}</h2><p>{siteBlocked ? "Fale com o administrador para liberar novamente." : "Volte em alguns minutos. Seu progresso continua seguro."}</p></div></div>}

      {view === "home" && <div className="page-content focus-home"><section className="hero-panel"><div className="hero-copy"><span className="eyebrow">PLANO DE HOJE · {studentProfile?.displayName.toUpperCase()}</span><h2>Seu próximo passo está claro.</h2><p>Avance em uma habilidade, pratique questões e feche o dia com uma revisão curta.</p><div className="hero-actions"><button className="primary" onClick={() => setSelectedSkill(nextGlobalSkill)}>Começar estudo de hoje →</button><span>{displayTopic(nextGlobalSkill)}</span></div></div><div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-core">E</div></div></section>
        <section className="focus-stat-strip"><article><strong>747</strong><span>habilidades mapeadas</span></article><article><strong>{skillStageDoneCount}</strong><span>etapas concluídas</span></article><article><strong>{answeredCount}</strong><span>questões respondidas</span></article><article><strong>{Object.values(assessmentResults).filter((item) => item.date).length}</strong><span>provas registradas</span></article></section>
        <section className="section-block"><div className="section-heading"><div><span className="eyebrow">ESCOLHA SUA AÇÃO</span><h2>Tudo do ENEM em três caminhos</h2></div></div><div className="home-priority-grid"><button onClick={() => { setSelectedSubject("all"); setView("plan"); }}><span>01</span><div><small>APRENDER</small><strong>Seguir o plano completo</strong><p>Conteúdos em ordem, do nivelamento ao domínio.</p></div><b>→</b></button><button onClick={() => setView("bank")}><span>02</span><div><small>PRATICAR</small><strong>Abrir as 2.000 questões</strong><p>Nove matérias organizadas por tema, com progresso salvo.</p></div><b>→</b></button><button onClick={() => { setSelectedSubject("exams"); setView("plan"); }}><span>03</span><div><small>MEDIR</small><strong>Fazer provas oficiais</strong><p>ENEM 2009–2025 dentro da Clareia, com correção e retomada.</p></div><b>→</b></button></div></section>
        <section className="dashboard-split"><div className="section-block"><div className="section-heading"><div><span className="eyebrow">MATÉRIAS DO ENEM</span><h2>Veja seu progresso</h2></div><button className="text-button" onClick={() => setView("plan")}>Abrir mapa completo</button></div><div className="course-mini-grid">{studySubjects.filter((subject) => isEnemSubject(subject.id)).map((subject) => { const id = subject.id as EnemSubjectId; const stats = getSubjectProgress(id); return <button className="course-mini" key={id} onClick={() => goToSubject(id)} style={{ "--accent": subject.color } as React.CSSProperties}><span className="course-icon">{subject.icon}</span><div><strong>{subject.name}</strong><small>{nextSkillFor(id)?.skill}</small><div className="mini-progress"><span style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }} /></div></div><b>{stats.done}/{stats.total}</b></button>; })}</div></div><div className="section-block english-preview"><div className="section-heading"><div><span className="eyebrow">TRILHA PARALELA</span><h2>Inglês</h2></div><span className="build-badge">24 AULAS</span></div><div className="english-preview-card"><span>EN</span><h3>{nextEnglishLesson.title}</h3><p>Aula completa com explicação, vocabulário, exemplo, prática e check de domínio.</p><button className="primary" onClick={() => setView("english")}>Continuar inglês →</button></div></div></section>
      </div>}

      {view === "plan" && <div className="page-content enem-page"><nav className="enem-section-nav" aria-label="Seções do plano"><button className={selectedSubject === "all" ? "active" : ""} onClick={() => setSelectedSubject("all")}>Mapa de matérias</button><button className={selectedSubject === "exams" ? "active" : ""} onClick={() => setSelectedSubject("exams")}>Provas e simulados</button></nav>{selectedSubject === "all" && renderSubjectHub()}{selectedSubject === "exams" && renderAssessmentTracker()}{selectedSubject !== "all" && selectedSubject !== "exams" && renderEnemCourse(selectedSubject)}</div>}
      {view === "bank" && <div className="page-content enem-page"><section className="bank-focus-head"><span className="eyebrow">PRÁTICA ENEM</span><h2>Banco principal e questões rápidas</h2><p>Entre direto nas 2.000 questões das nove matérias do ENEM ou escolha o treino rápido em uma aba separada.</p></section><div className="enem-bank-wrap"><QuestionBank key={`${user.uid}-${questionFocus?.nonce ?? 0}`} schoolYear="3em" progress={questionProgress} focus={questionFocus} user={user} pdfAllowed={pdfAllowed} pdfEnabled={appSettings.pdfEnabled} publicPracticeEnabled={appSettings.publicPracticeEnabled} dailyQuestionGoal={appSettings.dailyQuestionGoal} onProgressChange={updateQuestionProgress} onNotice={setNotice} /></div></div>}
      {view === "writing" && <div className="page-content writing-page"><WritingStudio userId={user.uid} essays={essays} onEssaysChange={updateEssays} onNotice={setNotice} /></div>}
      {view === "english" && <div className="page-content english-page"><section className="english-launch"><div><span className="eyebrow">TRILHA PARALELA · COMUNICAÇÃO E ENEM</span><h2>Do primeiro “hello” à leitura no ENEM.</h2><p>24 aulas completas dentro da Clareia, com explicação, vocabulário, exemplo, prática e teste de domínio.</p><div><strong>{englishLessons.filter((lesson) => progress[lesson.id] === "done").length}</strong><span>de {englishLessons.length} aulas concluídas</span></div></div><span className="english-launch-mark">EN</span></section><div className="english-roadmap">{[{ title: "Fundamentos", range: [0, 6], detail: "Apresentação, verbo to be e rotina" }, { title: "Cotidiano", range: [6, 12], detail: "Família, lugares, pedidos e passado" }, { title: "Autonomia", range: [12, 18], detail: "Planos, comparações, direções e conversação" }, { title: "Leitura & ENEM", range: [18, 24], detail: "Estratégias de leitura, listening e tecnologia" }].map((track, index) => { const trackLessons = englishLessons.slice(track.range[0], track.range[1]); const done = trackLessons.filter((lesson) => progress[lesson.id] === "done").length; return <article key={track.title}><span>0{index + 1}</span><div><strong>{track.title}</strong><small>{track.detail}</small><i><b style={{ width: `${(done / trackLessons.length) * 100}%` }} /></i></div><em>{done}/{trackLessons.length}</em></article>; })}</div><section className="section-block"><div className="section-heading"><div><span className="eyebrow">ROTEIRO COMPLETO</span><h2>24 aulas em quatro etapas</h2></div><span className="build-badge">BASE A1 → A2</span></div><div className="lesson-list">{englishLessons.map((lesson) => { const status = progress[lesson.id] ?? "pending"; return <article className={`lesson-row ${status}`} key={lesson.id} style={{ "--accent": subjectById("english").color } as React.CSSProperties}><div className="lesson-number">{status === "done" ? "✓" : lesson.number}</div><div className="lesson-main"><div className="card-kicker">INGLÊS · ETAPA {Math.min(4, Math.ceil(lesson.number / 6))} · SEMANA {lesson.week}</div><h3>{lesson.title}</h3><p>{lesson.goal}</p></div><div className="lesson-meta"><span>{lesson.duration}</span>{status === "not_done" && <small>Continua na fila</small>}<button onClick={() => setSelectedLesson(lesson)}>{status === "done" ? "Rever" : "Abrir"} →</button></div></article>; })}</div></section></div>}
      {view === "tasks" && <div className="page-content tasks-page"><section className="intro-row"><div><span className="eyebrow">PLANEJAMENTO PESSOAL</span><h2>Organize o próximo estudo</h2><p>Guarde revisão, simulado, redação ou qualquer prazo importante.</p></div></section><div className="task-layout"><form className="task-form" onSubmit={addTask}><label><span>O que precisa ser feito?</span><input maxLength={180} value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Ex.: revisar porcentagem e resolver 10 questões" /></label><div className="form-grid"><label><span>Categoria</span><select value={taskCategory} onChange={(event) => setTaskCategory(event.target.value)}><option>ENEM</option><option>Matemática</option><option>Linguagens</option><option>Redação</option><option>Ciências da Natureza</option><option>Ciências Humanas</option><option>Simulado</option><option>Inglês</option></select></label><label><span>Prazo (se tiver)</span><input type="date" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} /></label></div><button className="primary" type="submit">Guardar planejamento</button></form><div className="task-board"><div className="section-heading"><div><span className="eyebrow">LISTA ATUAL</span><h2>{tasks.filter((task) => !task.done).length} pendentes</h2></div></div><div className="task-list">{sortedTasks.map((task) => { const overdue = !task.done && Boolean(task.dueDate) && task.dueDate < todayKey; return <div className={`task-row full ${task.done ? "done" : ""} ${overdue ? "overdue" : ""}`} key={task.id}><label><input type="checkbox" checked={task.done} onChange={() => toggleTask(task)} /><span><strong>{task.title}</strong><small>{task.category}{task.dueDate ? ` · prazo ${task.dueDate.split("-").reverse().join("/")}` : ""}{overdue ? " · ATRASADA" : ""}</small></span></label><button aria-label="Excluir planejamento" onClick={() => deleteTask(task)}>×</button></div>; })}{!tasks.length && <div className="empty-list large"><span>＋</span><p>Guarde seu primeiro estudo ao lado.</p></div>}</div></div></div></div>}
      {view === "admin" && isOwner(user.email) && <AdminPanel user={user} onNotice={setNotice} />}
      <nav className="mobile-nav" aria-label="Navegação no celular">{visibleViews.map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => { if (item === "plan") setSelectedSubject("all"); setView(item); }}><span>{viewIcons[item]}</span>{viewLabels[item]}</button>)}</nav>
    </section>

    {selectedLesson && (() => { const content = englishLessonContent[selectedLesson.id]; return <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedLesson(null)}><section className="lesson-modal english-lesson-modal" role="dialog" aria-modal="true" aria-label={`Aula: ${selectedLesson.title}`} onMouseDown={(event) => event.stopPropagation()} style={{ "--accent": subjectById("english").color } as React.CSSProperties}><button className="modal-close" aria-label="Fechar" onClick={() => setSelectedLesson(null)}>×</button><div className="modal-top"><span className="lesson-badge">EN</span><div><span className="eyebrow">INGLÊS · AULA {selectedLesson.number} · SEMANA {selectedLesson.week}</span><h2>{selectedLesson.title}</h2><p>{selectedLesson.goal}</p></div></div>{content && <div className="english-classroom"><section className="english-concept"><span>ENTENDA A IDEIA</span><p>{content.concept}</p></section><section><div className="plan-heading"><span>VOCABULÁRIO ESSENCIAL</span><small>{content.vocabulary.length} expressões</small></div><div className="english-vocabulary">{content.vocabulary.map((item) => <article key={item.english}><strong>{item.english}</strong><span>{item.portuguese}</span></article>)}</div></section><section className="english-model"><div className="plan-heading"><span>EXEMPLO GUIADO</span><small>Leia em voz alta</small></div>{content.model.map((line) => <p key={line}>{line}</p>)}</section><section className="english-practice"><div className="plan-heading"><span>PRATIQUE AGORA</span><small>Sem sair da Clareia</small></div>{content.practice.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}</section></div>}<div className="lesson-plan"><div className="plan-heading"><span>ROTEIRO DE 35 MINUTOS</span><small>{selectedLesson.duration}</small></div>{selectedLesson.steps.map((step, index) => <div className="plan-step" key={step}><span>{index + 1}</span><p>{step}</p></div>)}</div><div className="expected-result"><span>RESULTADO DE HOJE</span><p>{selectedLesson.result}</p></div><div className="chat-box"><div><strong>Apoio opcional do ChatGPT</strong><p>A aula completa está aqui. Use a mensagem somente se quiser mais exemplos ou conversação.</p></div><button onClick={() => copyText(selectedLesson.chatPrompt)}>Copiar apoio</button></div><div className="modal-actions"><button className="secondary danger" onClick={() => setLessonStatus(selectedLesson, "not_done")}>Deixar na fila</button><button className="primary success" onClick={() => { const check = lessonMastery[selectedLesson.id]; if (appSettings.assessmentsEnabled && check) setMasteryLesson(selectedLesson); else { setLessonStatus(selectedLesson, "done"); setSelectedLesson(null); } }}>Concluir com check ✓</button></div></section></div>; })()}
    {selectedSkill && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedSkill(null)}><section className="lesson-modal skill-modal" role="dialog" aria-modal="true" aria-label={`Estudar: ${selectedSkill.skill}`} onMouseDown={(event) => event.stopPropagation()} style={{ "--accent": subjectById(selectedSkill.subject).color } as React.CSSProperties}><button className="modal-close" aria-label="Fechar" onClick={() => setSelectedSkill(null)}>×</button><div className="modal-top"><span className="lesson-badge">{subjectById(selectedSkill.subject).icon}</span><div><span className="eyebrow">{subjectById(selectedSkill.subject).name} · {selectedSkill.level} · {displayTopic(selectedSkill)}</span><h2>{selectedSkill.skill}</h2><p>{selectedSkill.relevance}</p></div></div><div className="skill-study-plan"><article><span>1</span><div><strong>Teoria</strong><p>Peça uma explicação simples e exemplos.</p></div></article><article><span>2</span><div><strong>Prática</strong><p>Resolva questões em dificuldade crescente.</p></div></article><article><span>3</span><div><strong>Domínio</strong><p>Faça uma questão sem ajuda e explique o raciocínio.</p></div></article></div><div className="chat-box skill-prompt"><div><strong>Mensagem pronta para o ChatGPT</strong><p>“Quero estudar {selectedSkill.skill}, do tópico {displayTopic(selectedSkill)} em {subjectById(selectedSkill.subject).name}. Explique do zero, mostre exemplos e depois teste meu domínio.”</p></div><button onClick={() => copyText(`Quero estudar ${selectedSkill.skill}, do tópico ${displayTopic(selectedSkill)} em ${subjectById(selectedSkill.subject).name}. Explique do zero em linguagem simples, mostre exemplos e depois me passe exercícios graduais.`)}>Copiar mensagem</button></div>{hasQuestionBank(selectedSkill.subject) && <button className="question-recommend-button" onClick={() => openQuestionForSkill(selectedSkill)}><span>?</span><div><strong>Resolver uma questão deste assunto</strong><small>O caderno escolhe uma que você ainda não respondeu.</small></div><b>→</b></button>}<div className="modal-stage-actions">{stages.map((stage) => <button key={stage.id} className={skillProgress[selectedSkill.id]?.[stage.id] ? "done" : ""} onClick={() => requestSkillStage(selectedSkill, stage.id)}><span>{skillProgress[selectedSkill.id]?.[stage.id] ? "✓" : stage.short}</span>{stage.label}</button>)}</div></section></div>}
    {masteryLesson && lessonMastery[masteryLesson.id] && <MasteryCheck question={lessonMastery[masteryLesson.id]} title={`Inglês · ${masteryLesson.title}`} onClose={() => setMasteryLesson(null)} onPass={() => { setLessonStatus(masteryLesson, "done"); setMasteryLesson(null); setSelectedLesson(null); }} />}
    {masterySkill && <MasteryCheck question={skillMasteryQuestion(masterySkill.subject, masterySkill.skill)} title={`${subjectById(masterySkill.subject).name} · ${masterySkill.skill}`} onClose={() => setMasterySkill(null)} onPass={() => { toggleSkillStage(masterySkill, "mastery"); setMasterySkill(null); setSelectedSkill(null); }} />}
    {loading && <div className="loading-screen"><div className="loader"/><span>Organizando sua preparação...</span></div>}
  </main>;
}
