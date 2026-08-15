"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { completedLessonCount, schoolLessons, unlockedLessonIndex, type SchoolLesson, type SchoolLessonProgress } from "./school-lesson-data";
import { schoolSubjectMeta, subjectsForYear, yearLabel, type SchoolSubject, type SchoolYear } from "./school-data";

type Props = {
  year: SchoolYear;
  progress: SchoolLessonProgress;
  onCompleteLesson: (lesson: SchoolLesson) => void;
};

type ReaderMode = "reading" | "help" | "quiz" | "passed";

export default function SchoolCurriculum({ year, progress, onCompleteLesson }: Props) {
  const subjects = subjectsForYear(year);
  const [activeSubject, setActiveSubject] = useState<SchoolSubject | null>(null);
  const [activeLesson, setActiveLesson] = useState<SchoolLesson | null>(null);
  const [readerMode, setReaderMode] = useState<ReaderMode>("reading");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const responseRef = useRef<HTMLElement | null>(null);
  const totalCompleted = useMemo(() => subjects.reduce((total, subject) => total + completedLessonCount(year, subject, progress), 0), [progress, subjects, year]);
  const totalLessons = subjects.length * 10;

  useEffect(() => {
    if (readerMode === "reading") return;
    const frame = window.requestAnimationFrame(() => responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => window.cancelAnimationFrame(frame);
  }, [readerMode]);

  function resetReader(mode: ReaderMode = "reading") {
    setReaderMode(mode);
    setSelectedOption(null);
    setWrongAnswer(false);
  }

  function openLesson(lesson: SchoolLesson, maxIndex: number) {
    if (lesson.number - 1 > maxIndex) return;
    setActiveLesson(lesson);
    resetReader();
  }

  function openNextLesson(lesson: SchoolLesson) {
    const next = schoolLessons(year, lesson.subject)[lesson.number];
    if (!next) {
      setActiveLesson(null);
      return;
    }
    setActiveLesson(next);
    resetReader();
  }

  function checkAnswer(lesson: SchoolLesson) {
    if (selectedOption === null) return;
    if (selectedOption !== lesson.quiz.answer) {
      setWrongAnswer(true);
      return;
    }
    if (!progress[lesson.id]?.completedAt) onCompleteLesson(lesson);
    setReaderMode("passed");
    setWrongAnswer(false);
  }

  return <section className="grade-curriculum">
    <div className="grade-curriculum-hero">
      <div><span className="eyebrow">TRILHA DE APRENDIZAGEM</span><h2>Aprenda dentro da própria aula.</h2><p>Leia a explicação, acompanhe o exemplo, anote o essencial e faça o teste final. A próxima aula só abre quando você realmente acerta.</p></div>
      <div className="learning-total"><strong>{totalCompleted}</strong><span>de {totalLessons} aulas</span><small>{yearLabel(year)}</small></div>
    </div>

    <div className="learning-flow"><span>01</span><div><strong>Aprenda</strong><small>Explicação e exemplo completos</small></div><i /><span>02</span><div><strong>Anote</strong><small>Resumo pronto para o caderno</small></div><i /><span>03</span><div><strong>Comprove</strong><small>Uma questão antes de avançar</small></div></div>

    <div className="grade-subject-grid">{subjects.map((subject) => {
      const meta = schoolSubjectMeta[subject];
      const lessons = schoolLessons(year, subject);
      const done = completedLessonCount(year, subject, progress);
      const next = lessons.find((lesson) => !progress[lesson.id]?.completedAt) ?? lessons.at(-1)!;
      return <button key={subject} style={{ "--accent": meta.color } as React.CSSProperties} onClick={() => setActiveSubject(subject)}>
        <span>{meta.icon}</span><div><small>{done}/10 AULAS CONCLUÍDAS</small><h3>{meta.name}</h3><p>Próxima: {next.level} · {next.topic}</p><div className="subject-lesson-progress"><i style={{ width: `${done * 10}%` }} /><b>{done === 10 ? "Trilha concluída ✓" : "Continuar estudando →"}</b></div></div>
      </button>;
    })}</div>

    {activeSubject && <div className="modal-backdrop grade-material-backdrop" role="presentation" onMouseDown={() => setActiveSubject(null)}><section className="grade-material-modal learning-path-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()} style={{ "--accent": schoolSubjectMeta[activeSubject].color } as React.CSSProperties}>
      <button className="modal-close" aria-label="Fechar matéria" onClick={() => setActiveSubject(null)}>×</button>
      <header><span>{schoolSubjectMeta[activeSubject].icon}</span><div><small>{yearLabel(year)} · TRILHA ORIGINAL</small><h2>{schoolSubjectMeta[activeSubject].name}</h2><p>Faça na ordem. Cada aula ensina o conteúdo e termina com um teste curto.</p></div></header>
      <div className="level-track"><span>NIVELAMENTO</span><i /><span>BASE</span><i /><span>EVOLUÇÃO</span><i /><span>APLICAÇÃO</span><i /><span>DOMÍNIO</span></div>
      <div className="grade-unit-list">{schoolLessons(year, activeSubject).map((lesson, index) => {
        const done = Boolean(progress[lesson.id]?.completedAt);
        const unlockedIndex = unlockedLessonIndex(year, activeSubject, progress);
        const locked = index > unlockedIndex;
        return <button key={lesson.id} className={`${done ? "done" : ""} ${locked ? "locked" : ""} ${index === unlockedIndex && !done ? "current" : ""}`} disabled={locked} onClick={() => openLesson(lesson, unlockedIndex)}>
          <span>{done ? "✓" : locked ? "⌁" : String(lesson.number).padStart(2, "0")}</span><div><small>{lesson.level} · {lesson.duration}</small><strong>{lesson.topic}</strong><p>{done ? "Aula e teste concluídos" : locked ? "Acerte o teste da aula anterior para liberar" : "Explicação, exemplo, anotações e teste"}</p></div><b>{done ? "Revisar" : locked ? "Bloqueada" : "Estudar →"}</b>
        </button>;
      })}</div>
    </section></div>}

    {activeLesson && <div className="modal-backdrop lesson-reader-backdrop" role="presentation" onMouseDown={() => setActiveLesson(null)}><article className="school-lesson-reader" role="dialog" aria-modal="true" aria-label={`Aula de ${activeLesson.topic}`} onMouseDown={(event) => event.stopPropagation()} style={{ "--accent": schoolSubjectMeta[activeLesson.subject].color } as React.CSSProperties}>
      <button className="modal-close" aria-label="Fechar aula" onClick={() => setActiveLesson(null)}>×</button>
      <header><div className="reader-number">{String(activeLesson.number).padStart(2, "0")}</div><div><span className="eyebrow">{schoolSubjectMeta[activeLesson.subject].name} · {activeLesson.level} · {activeLesson.duration}</span><h2>{activeLesson.topic}</h2><p>{activeLesson.objective}</p></div></header>
      <div className="reader-progress"><i /><i /><i /><i /><i /><span>AULA COMPLETA</span></div>
      <section className="reader-warmup"><span className="reader-label">ANTES DA AULA · AQUECIMENTO</span><h3>Comece pelo que você já sabe</h3><p>{activeLesson.warmUp}</p></section>
      <section className="reader-block lesson-chapters"><span className="reader-label">1 · AULA EXPLICADA</span><h3>Aprenda como se o professor estivesse ao lado</h3>{activeLesson.sections.map((section, index) => <article key={section.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{section.title}</h4>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article>)}</section>
      <section className="reader-visual-board"><span className="reader-label">2 · LOUSA VISUAL</span><h3>{activeLesson.visualBoard.title}</h3><div>{activeLesson.visualBoard.items.map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong>{index < activeLesson.visualBoard.items.length - 1 && <i>→</i>}</div>)}</div><p>{activeLesson.visualBoard.caption}</p></section>
      <section className="reader-example"><span className="reader-label">3 · EXEMPLO RESOLVIDO</span><h3>{activeLesson.exampleTitle}</h3><p>{activeLesson.example}</p><ol className="worked-steps">{activeLesson.workedSteps.map((step) => <li key={step}>{step}</li>)}</ol></section>
      <section className="reader-keypoints notebook-card"><div><span className="reader-label">4 · ANOTE NO CADERNO</span><h3>Resumo essencial</h3><p>Copie estes pontos. Escrever ajuda a organizar e lembrar o conteúdo.</p></div><ul>{activeLesson.keyPoints.map((point, index) => <li key={point}><span>{index + 1}</span>{point}</li>)}</ul></section>
      <section className="reader-practice"><span className="reader-label">5 · CONFIRA COM SUAS PALAVRAS</span><h3>Antes do teste</h3>{activeLesson.guidedPractice.map((step, index) => <div key={step}><span>{index + 1}</span><p>{step}</p></div>)}</section>
      <section className="reader-warning"><span>!</span><div><strong>Erro comum</strong><p>{activeLesson.commonMistake}</p></div></section>
      <section className="reader-sources"><span className="reader-label">APOIO DA AULA</span><h3>Vídeo e fontes para aprofundar</h3><p>Se quiser ver outro professor explicando, abra a busca já preparada para exatamente este assunto e esta série.</p><div><a className="reader-video-link featured" href={activeLesson.videoSearchUrl} target="_blank" rel="noreferrer">▶ Abrir videoaulas de {activeLesson.topic}</a>{activeLesson.sourceLinks.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label} ↗</a>)}</div></section>
      <section className="reader-exit"><span className="reader-label">6 · HORA DE DECIDIR</span><h3>Você entendeu esta aula?</h3><p>{activeLesson.exitTicket}</p><div className="reader-understanding-actions"><button className="secondary not-understood" onClick={() => setReaderMode("help")}>Não entendi — explique de outro jeito</button><button className="primary" onClick={() => resetReader("quiz")}>Entendi — abrir questão da aula →</button></div></section>

      {readerMode === "help" && <section ref={responseRef} className="reader-help-panel"><span className="reader-label">VOCÊ CLICOU EM “NÃO ENTENDI”</span><h3>Sem problema. Vamos apagar a lousa e explicar de outro jeito.</h3>{activeLesson.alternateReading.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="help-mini-board"><strong>Faça este teste sem valer nota:</strong><span>{activeLesson.guidedPractice[0]}</span></div><div className="reader-help-actions"><a className="reader-video-link" href={activeLesson.videoSearchUrl} target="_blank" rel="noreferrer">▶ Ver outra explicação em vídeo</a><button className="primary" onClick={() => resetReader("quiz")}>Agora entendi — abrir questão →</button></div></section>}

      {readerMode === "quiz" && <section ref={responseRef} className="reader-quiz"><span className="reader-label">TESTE DA AULA</span><h3>{activeLesson.quiz.prompt}</h3><p>Escolha uma alternativa. A próxima aula só será liberada depois do acerto.</p><div className="quiz-options">{activeLesson.quiz.options.map((option, index) => <button key={option} className={selectedOption === index ? "selected" : ""} onClick={() => { setSelectedOption(index); setWrongAnswer(false); }}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{wrongAnswer && <div className="quiz-feedback wrong"><strong>Ainda não foi dessa vez.</strong><p>{activeLesson.quiz.explanation}</p><button onClick={() => setReaderMode("help")}>Rever com outra explicação</button></div>}<button className="primary quiz-submit" disabled={selectedOption === null} onClick={() => checkAnswer(activeLesson)}>Conferir resposta</button></section>}

      {readerMode === "passed" && <section ref={responseRef} className="reader-passed"><span>✓</span><div><strong>Você acertou e concluiu a aula.</strong><p>{activeLesson.quiz.explanation}</p></div></section>}

      <footer>{readerMode === "passed" || progress[activeLesson.id]?.completedAt ? <><div><strong>Aula concluída ✓</strong><small>A próxima etapa da trilha está liberada.</small></div><button className="primary" onClick={() => openNextLesson(activeLesson)}>{activeLesson.number < 10 ? "Abrir próxima aula →" : "Finalizar matéria ✓"}</button></> : <><div><strong>Primeiro aprenda, depois responda.</strong><small>Use “Ainda não entendi” sempre que precisar.</small></div><button className="secondary" onClick={() => setReaderMode("reading")}>Voltar à explicação</button></>}</footer>
    </article></div>}
  </section>;
}
