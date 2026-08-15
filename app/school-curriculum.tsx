"use client";

import { useMemo, useState } from "react";
import { completedLessonCount, schoolLessons, unlockedLessonIndex, type SchoolLesson, type SchoolLessonProgress } from "./school-lesson-data";
import { schoolSubjectMeta, subjectsForYear, yearLabel, type SchoolSubject, type SchoolYear } from "./school-data";

type Props = {
  year: SchoolYear;
  progress: SchoolLessonProgress;
  onCompleteLesson: (lesson: SchoolLesson) => void;
  onOpenQuestions: (subject: SchoolSubject, topic: string) => void;
};

export default function SchoolCurriculum({ year, progress, onCompleteLesson, onOpenQuestions }: Props) {
  const subjects = subjectsForYear(year);
  const [activeSubject, setActiveSubject] = useState<SchoolSubject | null>(null);
  const [activeLesson, setActiveLesson] = useState<SchoolLesson | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const totalCompleted = useMemo(() => subjects.reduce((total, subject) => total + completedLessonCount(year, subject, progress), 0), [progress, subjects, year]);
  const totalLessons = subjects.length * 10;

  function openLesson(lesson: SchoolLesson, maxIndex: number) {
    if (lesson.number - 1 > maxIndex) return;
    setActiveLesson(lesson);
    setConfirmed(Boolean(progress[lesson.id]));
  }

  function completeLesson(lesson: SchoolLesson) {
    onCompleteLesson(lesson);
    setConfirmed(true);
  }

  return <section className="grade-curriculum">
    <div className="grade-curriculum-hero">
      <div><span className="eyebrow">TRILHA DE APRENDIZAGEM</span><h2>Aprenda antes de responder.</h2><p>As aulas são originais, organizadas do nivelamento ao domínio. Termine uma aula para liberar as 10 questões exatamente daquele conteúdo.</p></div>
      <div className="learning-total"><strong>{totalCompleted}</strong><span>de {totalLessons} aulas</span><small>{yearLabel(year)}</small></div>
    </div>

    <div className="learning-flow"><span>01</span><div><strong>Estude a aula</strong><small>Teoria curta, conceitos e exemplo</small></div><i /><span>02</span><div><strong>Confirme o aprendizado</strong><small>Resumo e prática guiada</small></div><i /><span>03</span><div><strong>Resolva 10 questões</strong><small>Somente do conteúdo liberado</small></div></div>

    <div className="grade-subject-grid">{subjects.map((subject) => {
      const meta = schoolSubjectMeta[subject];
      const lessons = schoolLessons(year, subject);
      const done = completedLessonCount(year, subject, progress);
      const next = lessons.find((lesson) => !progress[lesson.id]) ?? lessons.at(-1)!;
      return <button key={subject} style={{ "--accent": meta.color } as React.CSSProperties} onClick={() => setActiveSubject(subject)}>
        <span>{meta.icon}</span><div><small>{done}/10 AULAS · {done * 10}/100 QUESTÕES LIBERADAS</small><h3>{meta.name}</h3><p>Próxima: {next.level} · {next.topic}</p><div className="subject-lesson-progress"><i style={{ width: `${done * 10}%` }} /><b>{done === 10 ? "Trilha concluída ✓" : "Continuar aula →"}</b></div></div>
      </button>;
    })}</div>

    {activeSubject && <div className="modal-backdrop grade-material-backdrop" role="presentation" onMouseDown={() => setActiveSubject(null)}><section className="grade-material-modal learning-path-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()} style={{ "--accent": schoolSubjectMeta[activeSubject].color } as React.CSSProperties}>
      <button className="modal-close" onClick={() => setActiveSubject(null)}>×</button>
      <header><span>{schoolSubjectMeta[activeSubject].icon}</span><div><small>{yearLabel(year)} · TRILHA ORIGINAL</small><h2>{schoolSubjectMeta[activeSubject].name}</h2><p>Faça na ordem. Cada aula concluída libera um novo bloco de 10 questões.</p></div></header>
      <div className="level-track"><span>NIVELAMENTO</span><i /><span>BASE</span><i /><span>EVOLUÇÃO</span><i /><span>APLICAÇÃO</span><i /><span>DOMÍNIO</span></div>
      <div className="grade-unit-list">{schoolLessons(year, activeSubject).map((lesson, index) => {
        const done = Boolean(progress[lesson.id]);
        const unlockedIndex = unlockedLessonIndex(year, activeSubject, progress);
        const locked = index > unlockedIndex;
        return <button key={lesson.id} className={`${done ? "done" : ""} ${locked ? "locked" : ""} ${index === unlockedIndex && !done ? "current" : ""}`} disabled={locked} onClick={() => openLesson(lesson, unlockedIndex)}>
          <span>{done ? "✓" : locked ? "⌁" : String(lesson.number).padStart(2, "0")}</span><div><small>{lesson.level} · {lesson.duration}</small><strong>{lesson.topic}</strong><p>{done ? "Aula concluída · 10 questões liberadas" : locked ? "Conclua a aula anterior para liberar" : "Conteúdo, exemplo, resumo e prática guiada"}</p></div><b>{done ? "Revisar" : locked ? "Bloqueada" : "Estudar →"}</b>
        </button>;
      })}</div>
    </section></div>}

    {activeLesson && <div className="modal-backdrop lesson-reader-backdrop" role="presentation" onMouseDown={() => setActiveLesson(null)}><article className="school-lesson-reader" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()} style={{ "--accent": schoolSubjectMeta[activeLesson.subject].color } as React.CSSProperties}>
      <button className="modal-close" onClick={() => setActiveLesson(null)}>×</button>
      <header><div className="reader-number">{String(activeLesson.number).padStart(2, "0")}</div><div><span className="eyebrow">{schoolSubjectMeta[activeLesson.subject].name} · {activeLesson.level} · {activeLesson.duration}</span><h2>{activeLesson.topic}</h2><p>{activeLesson.objective}</p></div></header>
      <div className="reader-progress"><i /><i /><i /><i /><span>AULA COMPLETA</span></div>
      <section className="reader-block"><span className="reader-label">1 · ENTENDA</span><h3>Leitura principal</h3>{activeLesson.reading.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
      <section className="reader-keypoints"><div><span className="reader-label">2 · GUARDE ISTO</span><h3>Ideias essenciais</h3></div><ul>{activeLesson.keyPoints.map((point, index) => <li key={point}><span>{index + 1}</span>{point}</li>)}</ul></section>
      <section className="reader-example"><span className="reader-label">3 · VEJA FUNCIONAR</span><h3>{activeLesson.exampleTitle}</h3><p>{activeLesson.example}</p></section>
      <section className="reader-practice"><span className="reader-label">4 · FAÇA SEM OLHAR</span><h3>Prática guiada</h3>{activeLesson.guidedPractice.map((step, index) => <div key={step}><span>{index + 1}</span><p>{step}</p></div>)}</section>
      <section className="reader-warning"><span>!</span><div><strong>Erro comum</strong><p>{activeLesson.commonMistake}</p></div></section>
      <section className="reader-exit"><span className="reader-label">5 · SAÍDA DA AULA</span><h3>Cheque se realmente entendeu</h3><p>{activeLesson.exitTicket}</p><label><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={Boolean(progress[activeLesson.id])} /><span>Consigo explicar a ideia central sem copiar o texto.</span></label></section>
      <footer>{progress[activeLesson.id] ? <><div><strong>Aula concluída ✓</strong><small>O bloco de 10 questões está disponível.</small></div><button className="primary" onClick={() => { setActiveLesson(null); setActiveSubject(null); onOpenQuestions(activeLesson.subject, activeLesson.topic); }}>Resolver as 10 questões →</button></> : <><div><strong>Pronto para avançar?</strong><small>A próxima aula e as questões serão liberadas.</small></div><button className="primary" disabled={!confirmed} onClick={() => completeLesson(activeLesson)}>Concluir aula e liberar questões →</button></>}</footer>
    </article></div>}
  </section>;
}
