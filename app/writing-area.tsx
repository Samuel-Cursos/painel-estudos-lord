"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import WritingStudio, { type EssayRecord } from "./writing-studio";
import "./enem-writing.css";

const EnemWritingPractice = dynamic(() => import("./enem-writing-practice"), {
  loading: () => <div className="module-loading">Abrindo as propostas do ENEM…</div>,
});

type Props = {
  userId: string;
  essays: EssayRecord[];
  onEssaysChange: (next: EssayRecord[], message: string) => void;
  onNotice: (message: string) => void;
};

export default function WritingArea(props: Props) {
  const [mode, setMode] = useState<"free" | "enem">("free");
  const [visitedEnem, setVisitedEnem] = useState(false);
  return <>
    <nav className="writing-mode-switch" aria-label="Modalidade de redação">
      <button type="button" aria-pressed={mode === "free"} onClick={() => setMode("free")}>Redação livre e materiais</button>
      <button type="button" aria-pressed={mode === "enem"} onClick={() => { setVisitedEnem(true); setMode("enem"); }}>Redações do ENEM <span>2020–2025</span></button>
    </nav>
    <div hidden={mode !== "free"}><WritingStudio {...props} essays={props.essays.filter((essay) => !essay.enemYear)} onEssaysChange={(next, message) => props.onEssaysChange([...next, ...props.essays.filter((essay) => essay.enemYear)], message)} /></div>
    {visitedEnem && <div hidden={mode !== "enem"}><EnemWritingPractice key={props.userId} {...props} /></div>}
  </>;
}
