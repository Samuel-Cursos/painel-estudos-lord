"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Lesson, lessons, projectRoadmap, SubjectId, subjects, weeklyPlan } from "./course-data";
import { enemData, EnemLevel, EnemSkill, EnemSubjectId } from "./enem-data";
import { firebaseAuth, firestore, googleProvider } from "./firebase-client";
import QuestionBank, { QuestionFocus, QuestionProgressMap } from "./question-bank";
import type { QuestionSubject } from "./question-bank-data";
import AdminPanel from "./admin-panel";
import MasteryCheck from "./mastery-check";
import { lessonMastery, skillMasteryQuestion } from "./mastery-data";
import { defaultAppSettings, isOwner, type AppSettings } from "./access-control";

type View = "today" | "courses" | "questions" | "projects" | "tasks" | "week" | "admin";
type Status = "pending" | "done" | "not_done";
type ProgressMap = Record<string, Status>;
type Task = { id: number; title: string; category: string; dueDate: string; done: boolean };
type StudySubjectId = SubjectId | EnemSubjectId;
type SubjectSelection = StudySubjectId | "all" | "exams";
type Stage = "theory" | "practice" | "mastery";
type SkillProgress = Record<string, Partial<Record<Stage, boolean>>>;
type AssessmentRecord = { date: string; lc: string; ch: string; cn: string; math: string; time: string };
type AssessmentMap = Record<string, AssessmentRecord>;
type SyncState = "offline" | "syncing" | "synced" | "error";
type CloudDashboard = {
  progress?: ProgressMap;
  skillProgress?: SkillProgress;
  assessmentResults?: AssessmentMap;
  questionProgress?: QuestionProgressMap;
  tasks?: Task[];
};

type SubjectMeta = {
  id: StudySubjectId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
};

const viewLabels: Record<View, string> = { today: "Hoje", courses: "Trilhas", questions: "Questões", projects: "Projetos", tasks: "Tarefas", week: "Semana", admin: "ADM" };
const viewIcons: Record<View, string> = { today: "⌂", courses: "◫", questions: "?", projects: "◇", tasks: "✓", week: "▦", admin: "⚙" };
const levels: EnemLevel[] = ["Nivelamento", "Básico I", "Básico II", "Construção", "Ataque"];
const stages: { id: Stage; label: string; short: string }[] = [
  { id: "theory", label: "Teoria", short: "T" },
  { id: "practice", label: "Prática", short: "P" },
  { id: "mastery", label: "Domínio", short: "D" },
];

const studySubjects: SubjectMeta[] = [
  subjects.find((subject) => subject.id === "english")!,
  subjects.find((subject) => subject.id === "math")!,
  subjects.find((subject) => subject.id === "portuguese")!,
  { id: "biology", name: "Biologia", shortName: "BIO", icon: "DNA", color: "#35a873", description: "Vida, ecologia, genética e fisiologia para o ENEM." },
  { id: "physics", name: "Física", shortName: "FIS", icon: "F=", color: "#e56b61", description: "Fenômenos, energia, movimento, eletricidade e óptica." },
  { id: "chemistry", name: "Química", shortName: "QUI", icon: "Qm", color: "#9a6fe8", description: "Matéria, reações, cálculos e química do cotidiano." },
  { id: "history", name: "História", shortName: "HIS", icon: "H", color: "#d99b31", description: "Processos históricos do mundo antigo ao século XX." },
  { id: "geography", name: "Geografia", shortName: "GEO", icon: "◎", color: "#e47c38", description: "Espaço, economia, ambiente, campo e geopolítica." },
  { id: "philosophy", name: "Filosofia", shortName: "FIL", icon: "φ", color: "#51a976", description: "Pensadores, ética, política e teoria do conhecimento." },
  { id: "sociology", name: "Sociologia", shortName: "SOC", icon: "S", color: "#dc639a", description: "Sociedade, trabalho, cultura, política e movimentos sociais." },
  subjects.find((subject) => subject.id === "programming")!,
];

type SkillWithId = EnemSkill & { id: string };
const intensiveSkills: SkillWithId[] = enemData.skills.map((skill, index) => ({ ...skill, id: `enem-skill-${index}` }));

function subjectById(id: StudySubjectId) {
  return studySubjects.find((subject) => subject.id === id)!;
}

function isEnemSubject(id: StudySubjectId): id is EnemSubjectId {
  return id !== "english" && id !== "programming";
}

function hasQuestionBank(id: EnemSubjectId): id is QuestionSubject {
  return id === "math" || id === "biology" || id === "chemistry" || id === "physics";
}

function getNextLesson(subject: SubjectId, progress: ProgressMap) {
  const course = lessons.filter((lesson) => lesson.subject === subject);
  return course.find((lesson) => progress[lesson.id] !== "done") ?? course.at(-1)!;
}

function formatDate(date: Date | null) {
  if (!date) return "organizando o dia";
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

function displayTopic(skill: SkillWithId) {
  const atomicPrefixes = ["Átomo", "Íons:", "Isótopos", "Distribuição eletrônica", "Efeitos luminosos"];
  if (skill.page === 35 && atomicPrefixes.some((prefix) => skill.skill.startsWith(prefix))) return "Atomística";
  return skill.topic;
}

function totalAssessment(record?: AssessmentRecord) {
  if (!record) return 0;
  return [record.lc, record.ch, record.cn, record.math].reduce((sum, value) => sum + (Number(value) || 0), 0);
}

export default function StudyDashboard() {
  const [view, setView] = useState<View>("today");
  const [progress, setProgress] = useState<ProgressMap>({});
  const [skillProgress, setSkillProgress] = useState<SkillProgress>({});
  const [assessmentResults, setAssessmentResults] = useState<AssessmentMap>({});
  const [questionProgress, setQuestionProgress] = useState<QuestionProgressMap>({});
  const [questionFocus, setQuestionFocus] = useState<QuestionFocus | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillWithId | null>(null);
  const [masteryLesson, setMasteryLesson] = useState<Lesson | null>(null);
  const [masterySkill, setMasterySkill] = useState<SkillWithId | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectSelection>("all");
  const [selectedLevel, setSelectedLevel] = useState<EnemLevel | "all">("all");
  const [courseSearch, setCourseSearch] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("Escola");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudReady, setCloudReady] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("offline");
  const [pdfAllowed, setPdfAllowed] = useState(false);
  const [siteBlocked, setSiteBlocked] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);

  useEffect(() => {
    void getDoc(doc(firestore, "appSettings", "main")).then((snapshot) => {
      if (snapshot.exists()) setAppSettings({ ...defaultAppSettings, ...snapshot.data() } as AppSettings);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const loadSavedState = window.setTimeout(() => {
      try {
        setCurrentDate(new Date());
        const savedProgress = window.localStorage.getItem("lord-focus-progress");
        const savedTasks = window.localStorage.getItem("lord-focus-tasks");
        const savedSkillProgress = window.localStorage.getItem("lord-enem-progress");
        const savedAssessments = window.localStorage.getItem("lord-enem-assessments");
        const savedQuestionProgress = window.localStorage.getItem("lord-question-progress");
        if (savedProgress) setProgress(JSON.parse(savedProgress));
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedSkillProgress) setSkillProgress(JSON.parse(savedSkillProgress));
        if (savedAssessments) setAssessmentResults(JSON.parse(savedAssessments));
        if (savedQuestionProgress) setQuestionProgress(JSON.parse(savedQuestionProgress));
      } catch {
        setNotice("O painel abriu, mas não conseguiu ler o progresso salvo neste navegador.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(loadSavedState);
  }, []);

  useEffect(() => onAuthStateChanged(firebaseAuth, async (currentUser) => {
    setUser(currentUser);
    setAuthLoading(false);
    setCloudReady(false);

    if (!currentUser) {
      setSyncState("offline");
      setPdfAllowed(false);
      setSiteBlocked(false);
      setView((current) => current === "admin" ? "today" : current);
      return;
    }

    setSyncState("syncing");
    try {
      await setDoc(doc(firestore, "userDirectory", currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName ?? "",
        photoURL: currentUser.photoURL ?? "",
        lastSeenAt: serverTimestamp(),
      }, { merge: true });
      const [accessSnapshot, controlsSnapshot, settingsSnapshot] = await Promise.all([
        getDoc(doc(firestore, "pdfAccess", currentUser.uid)),
        getDoc(doc(firestore, "userControls", currentUser.uid)),
        getDoc(doc(firestore, "appSettings", "main")),
      ]);
      setPdfAllowed(isOwner(currentUser.email) || (accessSnapshot.exists() && accessSnapshot.data().enabled === true));
      setSiteBlocked(!isOwner(currentUser.email) && controlsSnapshot.exists() && controlsSnapshot.data().siteEnabled === false);
      if (settingsSnapshot.exists()) setAppSettings({ ...defaultAppSettings, ...settingsSnapshot.data() } as AppSettings);
      const resetToken = controlsSnapshot.exists() ? Number(controlsSnapshot.data().resetToken ?? 0) : 0;
      const previousResetToken = Number(window.localStorage.getItem("lord-admin-reset-token") ?? 0);
      if (resetToken > previousResetToken) {
        ["lord-focus-progress", "lord-focus-tasks", "lord-enem-progress", "lord-enem-assessments", "lord-question-progress"].forEach((key) => window.localStorage.removeItem(key));
        setProgress({}); setTasks([]); setSkillProgress({}); setAssessmentResults({}); setQuestionProgress({});
        window.localStorage.setItem("lord-admin-reset-token", String(resetToken));
      }
      const dashboardRef = doc(firestore, "users", currentUser.uid, "dashboard", "main");
      const cloudSnapshot = await getDoc(dashboardRef);

      if (cloudSnapshot.exists()) {
        const cloud = cloudSnapshot.data() as CloudDashboard;
        if (cloud.progress) {
          setProgress(cloud.progress);
          window.localStorage.setItem("lord-focus-progress", JSON.stringify(cloud.progress));
        }
        if (cloud.skillProgress) {
          setSkillProgress(cloud.skillProgress);
          window.localStorage.setItem("lord-enem-progress", JSON.stringify(cloud.skillProgress));
        }
        if (cloud.assessmentResults) {
          setAssessmentResults(cloud.assessmentResults);
          window.localStorage.setItem("lord-enem-assessments", JSON.stringify(cloud.assessmentResults));
        }
        if (cloud.questionProgress) {
          setQuestionProgress(cloud.questionProgress);
          window.localStorage.setItem("lord-question-progress", JSON.stringify(cloud.questionProgress));
        }
        if (cloud.tasks) {
          setTasks(cloud.tasks);
          window.localStorage.setItem("lord-focus-tasks", JSON.stringify(cloud.tasks));
        }
      } else {
        const localDashboard: CloudDashboard = {
          progress: JSON.parse(window.localStorage.getItem("lord-focus-progress") ?? "{}"),
          skillProgress: JSON.parse(window.localStorage.getItem("lord-enem-progress") ?? "{}"),
          assessmentResults: JSON.parse(window.localStorage.getItem("lord-enem-assessments") ?? "{}"),
          questionProgress: JSON.parse(window.localStorage.getItem("lord-question-progress") ?? "{}"),
          tasks: JSON.parse(window.localStorage.getItem("lord-focus-tasks") ?? "[]"),
        };
        await setDoc(dashboardRef, { ...localDashboard, updatedAt: serverTimestamp() });
      }

      setCloudReady(true);
      setSyncState("synced");
      setNotice("Conta conectada. Seu progresso agora acompanha você no celular e no notebook.");
    } catch {
      setSyncState("error");
      setNotice("Entrei na conta, mas o Firebase recusou a sincronização. Confira o Firestore e as regras.");
    }
  }), []);

  async function saveToCloud(changes: CloudDashboard) {
    if (!user || !cloudReady) return;
    setSyncState("syncing");
    try {
      await setDoc(
        doc(firestore, "users", user.uid, "dashboard", "main"),
        { ...changes, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setSyncState("synced");
    } catch {
      setSyncState("error");
      setNotice("Salvei neste aparelho, mas a nuvem não respondeu. Vou manter seu progresso local.");
    }
  }

  async function connectGoogle() {
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      if (code !== "auth/popup-closed-by-user") {
        setNotice("Não consegui abrir o login Google. Confira se este domínio está autorizado no Firebase.");
      }
    }
  }

  async function disconnectGoogle() {
    await signOut(firebaseAuth);
    setNotice("Conta desconectada. O painel continua funcionando neste aparelho.");
  }

  const todaySchedule = currentDate ? weeklyPlan.filter((item) => item.day === currentDate.getDay()) : [];
  const lessonDoneCount = Object.values(progress).filter((status) => status === "done").length;
  const skillStageDoneCount = Object.values(skillProgress).reduce((sum, item) => sum + stages.filter((stage) => item[stage.id]).length, 0);
  const totalTrackable = lessons.length + intensiveSkills.length * stages.length;
  const progressPercent = Math.round(((lessonDoneCount + skillStageDoneCount) / totalTrackable) * 100);
  const nextBySubject = useMemo(() => Object.fromEntries(subjects.map((subject) => [subject.id, getNextLesson(subject.id, progress)])) as Record<SubjectId, Lesson>, [progress]);

  const activeEnemSkills = useMemo(() => {
    if (selectedSubject === "all" || selectedSubject === "exams" || !isEnemSubject(selectedSubject)) return [];
    const query = courseSearch.trim().toLocaleLowerCase("pt-BR");
    return intensiveSkills.filter((skill) => {
      const matchesSubject = skill.subject === selectedSubject;
      const matchesLevel = selectedLevel === "all" || skill.level === selectedLevel;
      const matchesSearch = !query || `${displayTopic(skill)} ${skill.skill} ${skill.relevance}`.toLocaleLowerCase("pt-BR").includes(query);
      return matchesSubject && matchesLevel && matchesSearch;
    });
  }, [courseSearch, selectedLevel, selectedSubject]);

  const topicGroups = useMemo(() => {
    const groups = new Map<string, SkillWithId[]>();
    activeEnemSkills.forEach((skill) => {
      const key = `${skill.level}|||${displayTopic(skill)}`;
      groups.set(key, [...(groups.get(key) ?? []), skill]);
    });
    return Array.from(groups.entries()).map(([key, skills]) => {
      const [level, topic] = key.split("|||");
      return { level: level as EnemLevel, topic, skills };
    });
  }, [activeEnemSkills]);

  function setLessonStatus(lesson: Lesson, status: Status) {
    try {
      const next = { ...progress, [lesson.id]: status };
      setProgress(next);
      window.localStorage.setItem("lord-focus-progress", JSON.stringify(next));
      void saveToCloud({ progress: next });
      setNotice(status === "done" ? "Aula concluída. A próxima já entrou na fila." : "Marcado como não feito. A aula continua na sua fila.");
    } catch { setNotice("Não consegui salvar agora. Tente novamente."); }
  }

  function toggleSkillStage(skill: SkillWithId, stage: Stage) {
    try {
      const next = { ...skillProgress, [skill.id]: { ...skillProgress[skill.id], [stage]: !skillProgress[skill.id]?.[stage] } };
      setSkillProgress(next);
      window.localStorage.setItem("lord-enem-progress", JSON.stringify(next));
      void saveToCloud({ skillProgress: next });
      setNotice(`${stages.find((item) => item.id === stage)?.label} atualizada em ${displayTopic(skill)}.`);
    } catch { setNotice("Não consegui salvar essa etapa agora."); }
  }

  function requestSkillStage(skill: SkillWithId, stage: Stage) {
    if (stage === "mastery" && !skillProgress[skill.id]?.mastery && appSettings.assessmentsEnabled) {
      setMasterySkill(skill);
      return;
    }
    toggleSkillStage(skill, stage);
  }

  function updateAssessment(name: string, field: keyof AssessmentRecord, value: string) {
    const empty: AssessmentRecord = { date: "", lc: "", ch: "", cn: "", math: "", time: "" };
    const next = { ...assessmentResults, [name]: { ...(assessmentResults[name] ?? empty), [field]: value } };
    setAssessmentResults(next);
    window.localStorage.setItem("lord-enem-assessments", JSON.stringify(next));
    void saveToCloud({ assessmentResults: next });
  }

  function updateQuestionProgress(next: QuestionProgressMap) {
    setQuestionProgress(next);
    window.localStorage.setItem("lord-question-progress", JSON.stringify(next));
    void saveToCloud({ questionProgress: next });
  }

  function openQuestionForSkill(skill: SkillWithId) {
    if (!hasQuestionBank(skill.subject)) return;
    setQuestionFocus({ subject: skill.subject, topic: `${displayTopic(skill)} ${skill.skill}`, nonce: Date.now() });
    setSelectedSkill(null);
    setView("questions");
  }

  function addTask(event: FormEvent) {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      const task: Task = { id: Date.now(), title: taskTitle.trim(), category: taskCategory, dueDate: taskDueDate, done: false };
      const next = [task, ...tasks];
      setTasks(next);
      window.localStorage.setItem("lord-focus-tasks", JSON.stringify(next));
      void saveToCloud({ tasks: next });
      setTaskTitle(""); setTaskDueDate("");
      setNotice("Tarefa guardada. Agora você não precisa lembrar sozinho.");
    } catch { setNotice("Não consegui guardar a tarefa. Tente novamente."); }
  }

  function toggleTask(task: Task) {
    const next = tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item);
    setTasks(next); window.localStorage.setItem("lord-focus-tasks", JSON.stringify(next)); void saveToCloud({ tasks: next });
  }

  function deleteTask(task: Task) {
    const next = tasks.filter((item) => item.id !== task.id);
    setTasks(next); window.localStorage.setItem("lord-focus-tasks", JSON.stringify(next)); void saveToCloud({ tasks: next });
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Mensagem copiada. Agora é só colar no ChatGPT.");
    } catch { setNotice("Não consegui copiar automaticamente. Selecione a mensagem e copie."); }
  }

  function goToSubject(id: StudySubjectId) {
    setSelectedSubject(id); setSelectedLevel("all"); setCourseSearch(""); setView("courses");
  }

  function getSubjectProgress(id: StudySubjectId) {
    if (!isEnemSubject(id)) {
      const course = lessons.filter((lesson) => lesson.subject === id);
      return { done: course.filter((lesson) => progress[lesson.id] === "done").length, total: course.length };
    }
    const skills = intensiveSkills.filter((skill) => skill.subject === id);
    const done = skills.reduce((sum, skill) => sum + stages.filter((stage) => skillProgress[skill.id]?.[stage.id]).length, 0);
    return { done, total: skills.length * 3 };
  }

  function nextSkillFor(id: EnemSubjectId) {
    return intensiveSkills.find((skill) => skill.subject === id && !skillProgress[skill.id]?.mastery) ?? intensiveSkills.find((skill) => skill.subject === id)!;
  }

  function renderClassicCourse(subjectId: SubjectId) {
    const filtered = lessons.filter((lesson) => lesson.subject === subjectId);
    const subject = subjectById(subjectId);
    return <div className="lesson-list">{filtered.map((lesson) => { const status = progress[lesson.id] ?? "pending"; return <article className={`lesson-row ${status}`} key={lesson.id} style={{ "--accent": subject.color } as React.CSSProperties}><div className="lesson-number">{status === "done" ? "✓" : lesson.number}</div><div className="lesson-main"><div className="card-kicker">{subject.name} · semana {lesson.week}{lesson.project ? ` · ${lesson.project}` : ""}</div><h3>{lesson.title}</h3><p>{lesson.goal}</p></div><div className="lesson-meta"><span>{lesson.duration}</span>{status === "not_done" && <small>Voltou para a fila</small>}<button onClick={() => setSelectedLesson(lesson)}>{status === "done" ? "Rever" : "Abrir"} →</button></div></article>; })}</div>;
  }

  function renderSubjectHub() {
    return <><section className="curriculum-callout"><div><span className="eyebrow">MAPA DE PROGRESSO COMPETITIVO</span><h3>O PDF inteiro virou um painel clicável.</h3><p>119 temas de visão geral, 747 habilidades, 29 aulas em vídeo, 35 provas antigas e 12 simulados. Tudo separado por matéria e na ordem original.</p></div><button className="primary" onClick={() => setSelectedSubject("exams")}>Abrir provas e simulados →</button></section><div className="subject-hub">{studySubjects.map((subject) => { const stats = getSubjectProgress(subject.id); const skillCount = isEnemSubject(subject.id) ? intensiveSkills.filter((skill) => skill.subject === subject.id).length : lessons.filter((lesson) => lesson.subject === subject.id).length; return <button className="subject-hub-card" key={subject.id} style={{ "--accent": subject.color } as React.CSSProperties} onClick={() => goToSubject(subject.id)}><span className="subject-hub-icon">{subject.icon}</span><div><span className="eyebrow">{isEnemSubject(subject.id) ? `${skillCount} habilidades` : `${skillCount} aulas`}</span><h3>{subject.name}</h3><p>{subject.description}</p><div className="subject-card-progress"><span style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }} /></div><small>{stats.done} de {stats.total} etapas marcadas</small></div><b>→</b></button>; })}</div></>;
  }

  function renderEnemCourse(subjectId: EnemSubjectId) {
    const subject = subjectById(subjectId);
    const overview = enemData.overview.filter((item) => item.subject === subjectId);
    const allSubjectSkills = intensiveSkills.filter((skill) => skill.subject === subjectId);
    const videos = enemData.videos.filter((video) => video.subject === subjectId);
    const stats = getSubjectProgress(subjectId);
    const nextSkill = nextSkillFor(subjectId);
    return <>
      <section className="subject-focus" style={{ "--accent": subject.color } as React.CSSProperties}><button className="back-link" onClick={() => setSelectedSubject("all")}>← Todas as matérias</button><div className="subject-focus-grid"><div><span className="eyebrow">TRILHA COMPLETA · {subject.shortName}</span><h2>{subject.name}</h2><p>{subject.description} A ordem vai do Nivelamento até o Ataque.</p><div className="subject-focus-actions"><button className="primary" onClick={() => setSelectedSkill(nextSkill)}>Continuar de onde parei →</button><span>{stats.done}/{stats.total} etapas · {Math.round((stats.done / stats.total) * 100)}%</span></div></div><div className="subject-score"><strong>{allSubjectSkills.length}</strong><span>habilidades detalhadas</span><small>{overview.length} temas na visão geral</small></div></div></section>

      <section className="section-block"><div className="section-heading"><div><span className="eyebrow">VISÃO GERAL DO PDF</span><h2>Todos os temas</h2></div><span className="muted">Ordem original preservada</span></div><div className="overview-grid">{overview.map((item, index) => <article key={`${item.page}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.topic}</h3><p>{item.description}</p></article>)}</div></section>

      {videos.length > 0 && <section className="section-block"><div className="section-heading"><div><span className="eyebrow">AULAS DO MATERIAL</span><h2>Vídeos indicados</h2></div><span className="muted">Links originais do PDF</span></div><div className="video-grid">{videos.map((video, index) => <a href={video.url} target="_blank" rel="noreferrer" key={video.url}><span>▶</span><div><small>AULA {String(index + 1).padStart(2, "0")}</small><strong>{video.title}</strong></div><b>↗</b></a>)}</div></section>}

      <section className="section-block"><div className="section-heading"><div><span className="eyebrow">CHECKLIST INTENSIVO</span><h2>Teoria, prática e domínio</h2></div><span className="muted">{activeEnemSkills.length} habilidades exibidas</span></div><div className="curriculum-tools"><input aria-label="Pesquisar conteúdo" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder={`Pesquisar em ${subject.name}...`} /><div className="level-filters"><button className={selectedLevel === "all" ? "active" : ""} onClick={() => setSelectedLevel("all")}>Todos</button>{levels.map((level) => <button key={level} className={selectedLevel === level ? "active" : ""} onClick={() => setSelectedLevel(level)}>{level}</button>)}</div></div><div className="topic-list">{topicGroups.map((group, groupIndex) => { const completed = group.skills.filter((skill) => skillProgress[skill.id]?.mastery).length; return <details className="topic-accordion" key={`${group.level}-${group.topic}`} open={groupIndex === 0}><summary><span className="level-pill">{group.level}</span><div><strong>{group.topic}</strong><small>{completed} de {group.skills.length} dominadas</small></div><b>{group.skills.length}</b></summary><div className="skill-list">{group.skills.map((skill, index) => <article className="skill-row" key={skill.id}><div className="skill-order">{String(index + 1).padStart(2, "0")}</div><div className="skill-copy"><strong>{skill.skill}</strong><small>{skill.relevance}</small></div><div className="stage-buttons" aria-label={`Progresso de ${skill.skill}`}>{stages.map((stage) => <button title={stage.label} aria-label={`${stage.label}: ${skill.skill}`} className={skillProgress[skill.id]?.[stage.id] ? "done" : ""} key={stage.id} onClick={() => toggleSkillStage(skill, stage.id)}>{skillProgress[skill.id]?.[stage.id] ? "✓" : stage.short}<span>{stage.label}</span></button>)}</div><button className="study-skill" onClick={() => setSelectedSkill(skill)}>Estudar →</button></article>)}</div></details>; })}{!topicGroups.length && <div className="empty-list large"><span>⌕</span><p>Nenhuma habilidade encontrada com esse filtro.</p></div>}</div></section>

      {(subjectId === "math" || subjectId === "portuguese") && <section className="section-block legacy-plan"><div className="section-heading"><div><span className="eyebrow">PLANO QUE JÁ ESTAVA AQUI</span><h2>Sequência de 12 semanas</h2></div><span className="muted">Mantido sem apagar nada</span></div>{renderClassicCourse(subjectId)}</section>}
    </>;
  }

  function renderAssessmentTracker() {
    const groups = [{ title: "Provas antigas do ENEM", items: enemData.exams }, { title: "Simulados autorais", items: enemData.simulations }];
    return <><button className="back-link assessment-back" onClick={() => setSelectedSubject("all")}>← Todas as matérias</button><section className="assessment-hero"><span className="eyebrow">MÉTRICAS DO MAPA</span><h2>Provas antigas e simulados</h2><p>Registre data, acertos por área e tempo gasto. O total é calculado automaticamente.</p></section>{groups.map((group) => <section className="section-block" key={group.title}><div className="section-heading"><div><span className="eyebrow">ACOMPANHAMENTO</span><h2>{group.title}</h2></div><span className="muted">{group.items.length} registros</span></div><div className="assessment-table"><div className="assessment-row assessment-head"><span>Prova</span><span>Data</span><span>LC</span><span>CH</span><span>CN</span><span>MAT</span><span>Total</span><span>Tempo</span></div>{group.items.map((name) => { const record = assessmentResults[name]; return <div className="assessment-row" key={name}><strong>{name}</strong><input aria-label={`Data de ${name}`} type="date" value={record?.date ?? ""} onChange={(event) => updateAssessment(name, "date", event.target.value)} /><input aria-label={`LC de ${name}`} inputMode="numeric" value={record?.lc ?? ""} onChange={(event) => updateAssessment(name, "lc", event.target.value)} /><input aria-label={`CH de ${name}`} inputMode="numeric" value={record?.ch ?? ""} onChange={(event) => updateAssessment(name, "ch", event.target.value)} /><input aria-label={`CN de ${name}`} inputMode="numeric" value={record?.cn ?? ""} onChange={(event) => updateAssessment(name, "cn", event.target.value)} /><input aria-label={`Matemática de ${name}`} inputMode="numeric" value={record?.math ?? ""} onChange={(event) => updateAssessment(name, "math", event.target.value)} /><span className="assessment-total">{totalAssessment(record)}</span><input aria-label={`Tempo de ${name}`} placeholder="5h20" value={record?.time ?? ""} onChange={(event) => updateAssessment(name, "time", event.target.value)} /></div>; })}</div></section>)}</>;
  }

  const visibleViews = (Object.keys(viewLabels) as View[]).filter((item) => item !== "admin" || isOwner(user?.email));

  return <main className="app-shell">
    <aside className={`sidebar ${mobileMenu ? "open" : ""}`}><div className="brand-row"><div className="brand-mark">L</div><div><strong>Lord Focus</strong><span>Painel pessoal</span></div></div><nav aria-label="Navegação principal">{visibleViews.map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => { setView(item); setMobileMenu(false); }}><span aria-hidden="true">{viewIcons[item]}</span>{viewLabels[item]}</button>)}</nav><div className="sidebar-progress"><div className="level-ring" style={{ "--value": `${progressPercent * 3.6}deg` } as React.CSSProperties}><span>{progressPercent}%</span></div><div><strong>Mapa completo</strong><span>{lessonDoneCount + skillStageDoneCount} de {totalTrackable} etapas</span></div></div><div className="sidebar-rule"><span>Regra do painel</span><p>Você não procura o que fazer. Abre, faz a próxima ação e marca.</p></div></aside>

    <section className="workspace"><header className="topbar"><button className="menu-button" aria-label="Abrir menu" onClick={() => setMobileMenu((value) => !value)}>☰</button><div><p>{formatDate(currentDate)}</p><h1>{viewLabels[view]}</h1></div><div className="top-actions"><button className="quick-add" onClick={() => setView("tasks")}>+ Guardar tarefa</button>{user ? <button className={`sync-account ${syncState}`} onClick={disconnectGoogle} title="Clique para sair da conta"><span>{syncState === "syncing" ? "↻" : syncState === "error" ? "!" : "✓"}</span><div><strong>{syncState === "syncing" ? "Salvando..." : syncState === "error" ? "Só neste aparelho" : "Sincronizado"}</strong><small>{user.displayName?.split(" ")[0] ?? user.email}</small></div></button> : <button className="google-login" onClick={connectGoogle} disabled={authLoading}><span>G</span>{authLoading ? "Abrindo..." : "Entrar com Google"}</button>}</div></header>
      {notice && <button className="notice" onClick={() => setNotice("")}>{notice}<span>×</span></button>}
      {appSettings.announcementEnabled && appSettings.announcement.trim() && <div className="global-announcement"><strong>AVISO DO ADM</strong><span>{appSettings.announcement}</span></div>}
      {(siteBlocked || (appSettings.maintenanceMode && !isOwner(user?.email))) && <div className="maintenance-lock"><div><span>{siteBlocked ? "ACESSO PAUSADO" : "MANUTENÇÃO"}</span><h2>{siteBlocked ? "Seu acesso ao painel foi pausado pelo ADM." : "O Lord está atualizando o painel."}</h2><p>{siteBlocked ? "Fale com o administrador para liberar novamente." : "Volte em alguns minutos. Seu progresso salvo continua seguro."}</p></div></div>}

      {view === "today" && <div className="page-content today-page"><section className="hero-panel"><div className="hero-copy"><span className="eyebrow">PRÓXIMA AÇÃO</span>{todaySchedule.length ? <><h2>Hoje você só precisa começar.</h2><p>{todaySchedule.length === 1 ? "Uma sessão planejada" : `${todaySchedule.length} sessões planejadas`} para hoje. O conteúdo já está escolhido.</p><div className="hero-actions"><button className="primary" onClick={() => setSelectedLesson(nextBySubject[todaySchedule[0].subject])}>Abrir aula de agora →</button><span>Comece com 5 minutos</span></div></> : <><h2>Hoje é dia leve.</h2><p>Quarta, quinta e domingo ficam protegidos para culto, música e descanso. Se quiser adiantar algo, faça apenas o modo mínimo.</p><div className="hero-actions"><button className="primary" onClick={() => setView("tasks")}>Ver tarefas rápidas →</button><span>Sem criar dívida</span></div></>}</div><div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-core">{todaySchedule.length ? subjectById(todaySchedule[0].subject).icon : "✓"}</div></div></section>
        <section className="section-block"><div className="section-heading"><div><span className="eyebrow">ROTEIRO DE HOJE</span><h2>Chegue e faça</h2></div><span className="muted">Nada para pesquisar</span></div><div className="today-grid">{todaySchedule.length ? todaySchedule.map((slot, index) => { const lesson = nextBySubject[slot.subject]; const subject = subjectById(slot.subject); return <article className="today-card" key={`${slot.time}-${slot.subject}`} style={{ "--accent": subject.color } as React.CSSProperties}><div className="time-column"><strong>{slot.time}</strong><span>{index + 1}</span></div><div className="today-card-body"><div className="card-kicker"><span className="subject-dot" />{subject.name} · aula {lesson.number}</div><h3>{lesson.title}</h3><p>{lesson.goal}</p><div className="card-footer"><span>{lesson.duration}</span><button onClick={() => setSelectedLesson(lesson)}>Abrir aula →</button></div></div></article>; }) : <article className="empty-day"><strong>Sem aula obrigatória hoje</strong><p>Abra “Tarefas” se houver algo da escola. Caso contrário, cumpra seus compromissos e descanse.</p></article>}</div></section>
        <section className="dashboard-split"><div className="section-block"><div className="section-heading"><div><span className="eyebrow">SUAS TRILHAS</span><h2>Próxima de cada matéria</h2></div><button className="text-button" onClick={() => { setSelectedSubject("all"); setView("courses"); }}>Abrir mapa completo</button></div><div className="course-mini-grid">{subjects.map((subject) => { const lesson = nextBySubject[subject.id]; const completed = lessons.filter((item) => item.subject === subject.id && progress[item.id] === "done").length; const total = lessons.filter((item) => item.subject === subject.id).length; return <button className="course-mini" key={subject.id} onClick={() => goToSubject(subject.id)} style={{ "--accent": subject.color } as React.CSSProperties}><span className="course-icon">{subject.icon}</span><div><strong>{subject.name}</strong><small>{lesson.title}</small><div className="mini-progress"><span style={{ width: `${(completed / total) * 100}%` }} /></div></div><b>{completed}/{total}</b></button>; })}</div></div><div className="section-block task-preview"><div className="section-heading"><div><span className="eyebrow">NÃO ESQUECER</span><h2>Tarefas abertas</h2></div><button className="text-button" onClick={() => setView("tasks")}>Gerenciar</button></div><div className="task-list compact">{tasks.filter((task) => !task.done).slice(0, 4).map((task) => <label className="task-row" key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task)} /><span><strong>{task.title}</strong><small>{task.category}{task.dueDate ? ` · ${task.dueDate.split("-").reverse().join("/")}` : ""}</small></span></label>)}{!tasks.some((task) => !task.done) && <div className="empty-list"><span>✓</span><p>Nenhuma tarefa esquecida.</p></div>}</div></div></section>
      </div>}

      {view === "courses" && <div className="page-content courses-page">{selectedSubject === "all" && <><section className="intro-row"><div><span className="eyebrow">CONTEÚDO COMPLETO</span><h2>Escolha uma matéria</h2><p>O cronograma inteiro do PDF foi separado em áreas. Inglês e Programação continuam com as aulas que já estavam prontas.</p></div></section>{renderSubjectHub()}</>}{selectedSubject === "exams" && renderAssessmentTracker()}{selectedSubject !== "all" && selectedSubject !== "exams" && <>{isEnemSubject(selectedSubject) ? renderEnemCourse(selectedSubject) : <><section className="intro-row course-detail-head"><div><button className="back-link" onClick={() => setSelectedSubject("all")}>← Todas as matérias</button><span className="eyebrow">CONTEÚDO PRONTO</span><h2>{subjectById(selectedSubject).name}</h2><p>{subjectById(selectedSubject).description}</p></div></section>{renderClassicCourse(selectedSubject)}</>}</>}</div>}

      {view === "questions" && <QuestionBank key={`${user?.uid ?? "local"}-${questionFocus?.nonce ?? 0}`} progress={questionProgress} focus={questionFocus} user={user} pdfAllowed={pdfAllowed} pdfEnabled={appSettings.pdfEnabled} publicPracticeEnabled={appSettings.publicPracticeEnabled} dailyQuestionGoal={appSettings.dailyQuestionGoal} onProgressChange={updateQuestionProgress} onNotice={setNotice} />}

      {view === "admin" && user && isOwner(user.email) && <AdminPanel user={user} onNotice={setNotice} />}

      {view === "projects" && <div className="page-content"><section className="intro-row"><div><span className="eyebrow">APRENDER OLHANDO E MEXENDO</span><h2>Laboratório de projetos</h2><p>Você não vai fazer exercício aleatório. Cada etapa usa um projeto real, e o ChatGPT precisa explicar o que está construindo.</p></div></section><div className="roadmap">{projectRoadmap.map((project, index) => { const projectLessons = lessons.filter((lesson) => lesson.project === project.name); const completed = projectLessons.filter((lesson) => progress[lesson.id] === "done").length; return <article className="project-card" key={project.name}><div className="project-index">0{index + 1}</div><div className="project-head"><span>{project.weeks}</span><h3>{project.name}</h3><p>{project.result}</p></div><div className="project-progress"><div><span style={{ width: `${projectLessons.length ? (completed / projectLessons.length) * 100 : 0}%` }} /></div><small>{completed} de {projectLessons.length} etapas</small></div><div className="project-steps">{projectLessons.map((lesson) => <button key={lesson.id} onClick={() => setSelectedLesson(lesson)} className={progress[lesson.id] === "done" ? "done" : ""}><span>{progress[lesson.id] === "done" ? "✓" : lesson.number}</span>{lesson.title}</button>)}</div></article>; })}</div></div>}

      {view === "tasks" && <div className="page-content tasks-page"><section className="intro-row"><div><span className="eyebrow">CAIXA DE ENTRADA</span><h2>Jogue aqui para não esquecer</h2><p>Prova, trabalho, prazo, ideia ou algo do projeto. O painel segura isso por você.</p></div></section><div className="task-layout"><form className="task-form" onSubmit={addTask}><label><span>O que precisa ser feito?</span><input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Ex.: terminar atividade de história" /></label><div className="form-grid"><label><span>Categoria</span><select value={taskCategory} onChange={(event) => setTaskCategory(event.target.value)}><option>Escola</option><option>Inglês</option><option>Matemática</option><option>Português</option><option>Ciências da Natureza</option><option>Humanas</option><option>Programação</option><option>Delícias da Vó</option><option>Grêmio</option><option>Pessoal</option></select></label><label><span>Prazo (se tiver)</span><input type="date" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} /></label></div><button className="primary" type="submit">Guardar tarefa</button></form><div className="task-board"><div className="section-heading"><div><span className="eyebrow">LISTA ATUAL</span><h2>{tasks.filter((task) => !task.done).length} abertas</h2></div></div><div className="task-list">{tasks.map((task) => <div className={`task-row full ${task.done ? "done" : ""}`} key={task.id}><label><input type="checkbox" checked={task.done} onChange={() => toggleTask(task)} /><span><strong>{task.title}</strong><small>{task.category}{task.dueDate ? ` · prazo ${task.dueDate.split("-").reverse().join("/")}` : ""}</small></span></label><button aria-label="Excluir tarefa" onClick={() => deleteTask(task)}>×</button></div>)}{!tasks.length && <div className="empty-list large"><span>＋</span><p>Guarde a primeira tarefa ao lado.</p></div>}</div></div></div></div>}

      {view === "week" && <div className="page-content"><section className="intro-row"><div><span className="eyebrow">ROTINA AUTOMÁTICA</span><h2>Sua semana de estudos</h2><p>Treino pausado por enquanto. Quarta, quinta e domingo continuam leves.</p></div></section><div className="week-grid">{[1,2,3,4,5,6,0].map((day) => { const names = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]; const slots = weeklyPlan.filter((item) => item.day === day); const isToday = currentDate?.getDay() === day; return <article className={`day-card ${isToday ? "today" : ""}`} key={day}><div className="day-head"><span>{names[day].slice(0,3).toUpperCase()}</span><strong>{names[day]}</strong>{isToday && <small>HOJE</small>}</div><div className="day-slots">{slots.map((slot) => { const subject = subjectById(slot.subject); return <button key={`${slot.time}-${slot.subject}`} onClick={() => setSelectedLesson(nextBySubject[slot.subject])} style={{ "--accent": subject.color } as React.CSSProperties}><span>{slot.time}</span><strong>{slot.note}</strong><small>{nextBySubject[slot.subject].title}</small></button>; })}{!slots.length && <div className="rest-slot"><span>○</span><strong>{day === 3 ? "Culto" : day === 4 ? "Música" : "Descanso / igreja"}</strong><small>Sem reposição automática</small></div>}</div></article>; })}</div><div className="method-cards"><article><span>01</span><h3>Abra o painel</h3><p>A próxima aula já aparece. Não pesquise outro conteúdo.</p></article><article><span>02</span><h3>Faça 5 minutos</h3><p>Depois dos cinco, decida se continua. Normalmente você continua.</p></article><article><span>03</span><h3>Marque o resultado</h3><p>Feito avança. Não feito volta para a fila sem acumular dívida.</p></article></div></div>}

      <nav className="mobile-nav" aria-label="Navegação no celular">{visibleViews.map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}><span>{viewIcons[item]}</span>{viewLabels[item]}</button>)}</nav>
    </section>

    {selectedLesson && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedLesson(null)}><section className="lesson-modal" role="dialog" aria-modal="true" aria-label={`Aula: ${selectedLesson.title}`} onMouseDown={(event) => event.stopPropagation()} style={{ "--accent": subjectById(selectedLesson.subject).color } as React.CSSProperties}><button className="modal-close" aria-label="Fechar" onClick={() => setSelectedLesson(null)}>×</button><div className="modal-top"><span className="lesson-badge">{subjectById(selectedLesson.subject).icon}</span><div><span className="eyebrow">{subjectById(selectedLesson.subject).name} · AULA {selectedLesson.number} · SEMANA {selectedLesson.week}</span><h2>{selectedLesson.title}</h2><p>{selectedLesson.goal}</p></div></div>{selectedLesson.project && <div className="project-label">Projeto: <strong>{selectedLesson.project}</strong></div>}<div className="lesson-plan"><div className="plan-heading"><span>ROTEIRO DA AULA</span><small>{selectedLesson.duration}</small></div>{selectedLesson.steps.map((step, index) => <div className="plan-step" key={step}><span>{index + 1}</span><p>{step}</p></div>)}</div><div className="expected-result"><span>RESULTADO DE HOJE</span><p>{selectedLesson.result}</p></div><div className="chat-box"><div><strong>Estudar com o ChatGPT</strong><p>A mensagem já pede explicação, exemplos e conferência do resultado.</p></div><button onClick={() => copyText(selectedLesson.chatPrompt)}>Copiar mensagem</button></div><div className="modal-actions"><button className="secondary danger" onClick={() => setLessonStatus(selectedLesson, "not_done")}>Não fiz</button><button className="secondary" onClick={() => setLessonStatus(selectedLesson, "pending")}>Deixar na fila</button><button className="primary success" onClick={() => { if (appSettings.assessmentsEnabled) setMasteryLesson(selectedLesson); else { setLessonStatus(selectedLesson, "done"); setSelectedLesson(null); } }}>Concluir com check ✓</button></div></section></div>}

    {selectedSkill && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedSkill(null)}><section className="lesson-modal skill-modal" role="dialog" aria-modal="true" aria-label={`Estudar: ${selectedSkill.skill}`} onMouseDown={(event) => event.stopPropagation()} style={{ "--accent": subjectById(selectedSkill.subject).color } as React.CSSProperties}><button className="modal-close" aria-label="Fechar" onClick={() => setSelectedSkill(null)}>×</button><div className="modal-top"><span className="lesson-badge">{subjectById(selectedSkill.subject).icon}</span><div><span className="eyebrow">{subjectById(selectedSkill.subject).name} · {selectedSkill.level} · {displayTopic(selectedSkill)}</span><h2>{selectedSkill.skill}</h2><p>{selectedSkill.relevance}</p></div></div><div className="skill-study-plan"><article><span>1</span><div><strong>Teoria</strong><p>Peça uma explicação simples, exemplos e os erros mais comuns.</p></div></article><article><span>2</span><div><strong>Prática</strong><p>Resolva questões em dificuldade crescente com correção explicada.</p></div></article><article><span>3</span><div><strong>Domínio</strong><p>Faça uma questão sem ajuda e explique o raciocínio com suas palavras.</p></div></article></div><div className="chat-box skill-prompt"><div><strong>Mensagem pronta para o ChatGPT</strong><p>“Quero estudar {selectedSkill.skill}, do tópico {displayTopic(selectedSkill)} em {subjectById(selectedSkill.subject).name}. Explique do zero em linguagem simples, mostre exemplos, depois me passe exercícios graduais e só revele a resposta após minha tentativa. No final, teste se eu realmente dominei e corrija meu raciocínio.”</p></div><button onClick={() => copyText(`Quero estudar ${selectedSkill.skill}, do tópico ${displayTopic(selectedSkill)} em ${subjectById(selectedSkill.subject).name}. Explique do zero em linguagem simples, mostre exemplos, depois me passe exercícios graduais e só revele a resposta após minha tentativa. No final, teste se eu realmente dominei e corrija meu raciocínio.`)}>Copiar mensagem</button></div>{hasQuestionBank(selectedSkill.subject) && <button className="question-recommend-button" onClick={() => openQuestionForSkill(selectedSkill)}><span>?</span><div><strong>Resolver uma questão deste assunto</strong><small>O caderno escolhe uma que você ainda não respondeu.</small></div><b>→</b></button>}<div className="modal-stage-actions">{stages.map((stage) => <button key={stage.id} className={skillProgress[selectedSkill.id]?.[stage.id] ? "done" : ""} onClick={() => requestSkillStage(selectedSkill, stage.id)}><span>{skillProgress[selectedSkill.id]?.[stage.id] ? "✓" : stage.short}</span>{stage.label}</button>)}</div></section></div>}

    {masteryLesson && <MasteryCheck question={lessonMastery[masteryLesson.id]} title={`${subjectById(masteryLesson.subject).name} · ${masteryLesson.title}`} onClose={() => setMasteryLesson(null)} onPass={() => { setLessonStatus(masteryLesson, "done"); setMasteryLesson(null); setSelectedLesson(null); }} />}

    {masterySkill && <MasteryCheck question={skillMasteryQuestion(masterySkill.subject, masterySkill.skill)} title={`${subjectById(masterySkill.subject).name} · ${masterySkill.skill}`} onClose={() => setMasterySkill(null)} onPass={() => { toggleSkillStage(masterySkill, "mastery"); setMasterySkill(null); setSelectedSkill(null); }} />}

    {loading && <div className="loading-screen"><div className="loader"/><span>Organizando seu próximo passo...</span></div>}
  </main>;
}
