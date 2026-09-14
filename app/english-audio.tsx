"use client";

import { useEffect, useRef, useState } from "react";

export function EnglishListen({ text, label = "Ouvir em inglês" }: { text: string; label?: string }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selected, setSelected] = useState("");
  const [rate, setRate] = useState(0.85);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const refresh = () => setVoices(window.speechSynthesis.getVoices().filter((voice) => /^en[-_]/i.test(voice.lang)));
    refresh(); window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => { window.speechSynthesis.removeEventListener("voiceschanged", refresh); window.speechSynthesis.cancel(); };
  }, []);
  function speak() {
    const voice = voices.find((v) => v.voiceURI === selected) ?? voices[0];
    if (!voice) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = rate;
    utterance.onerror = (event) => { if (event.error !== "interrupted" && event.error !== "canceled") setMessage("Não foi possível reproduzir. Use o texto ou os materiais de escuta."); };
    setMessage(""); window.speechSynthesis.speak(utterance);
  }
  return <div className="en-audio">
    <div className="en-actions"><button type="button" onClick={speak} disabled={!voices.length}>▶ {label}</button><button type="button" onClick={() => window.speechSynthesis?.cancel()}>Parar áudio</button></div>
    <div className="en-audio-settings"><label>Velocidade<select value={rate} onChange={(e) => setRate(Number(e.target.value))}><option value={0.7}>Mais devagar</option><option value={0.85}>Moderada</option><option value={1}>Normal</option></select></label>{voices.length > 0 && <label>Voz sintética<select value={selected || voices[0].voiceURI} onChange={(e) => setSelected(e.target.value)}>{voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}</select></label>}</div>
    <small>{voices.length ? "Voz do aparelho/navegador, não gravação humana. A disponibilidade e o uso de rede dependem da voz escolhida." : "Nenhuma voz em inglês disponível neste navegador. Você pode ler a transcrição e usar os materiais gratuitos de escuta."}</small>
    {message && <p role="status">{message}</p>}
  </div>;
}

export function EnglishRecorder({ lessonId }: { lessonId: string }) {
  const [recording, setRecording] = useState(false);
  const [asking, setAsking] = useState(false);
  const [audio, setAudio] = useState<{ url: string; extension: string } | null>(null);
  const [message, setMessage] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const alive = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const url = useRef("");
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false; clearTimeout(timer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      if (url.current) URL.revokeObjectURL(url.current);
    };
  }, []);
  function stop() {
    clearTimeout(timer.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach((track) => track.stop());
    if (alive.current) setRecording(false);
  }
  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setMessage("Gravação indisponível aqui. Use o gravador do celular ou pratique em voz alta; isso não bloqueia a aula."); return; }
    setAsking(true); setMessage("");
    try {
      const microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!alive.current) { microphone.getTracks().forEach((track) => track.stop()); return; }
      stream.current = microphone;
      const media = new MediaRecorder(microphone);
      recorder.current = media;
      const chunks: Blob[] = [];
      media.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      media.onerror = () => { stop(); if (alive.current) setMessage("A gravação falhou. Tente novamente ou use o gravador do aparelho."); };
      media.onstop = () => {
        microphone.getTracks().forEach((track) => track.stop());
        if (!alive.current || !chunks.length) return;
        if (url.current) URL.revokeObjectURL(url.current);
        const blob = new Blob(chunks, { type: media.mimeType || chunks[0].type });
        url.current = URL.createObjectURL(blob);
        setAudio({ url: url.current, extension: blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm" });
        setRecording(false);
      };
      media.start(); setRecording(true);
      timer.current = setTimeout(() => { stop(); if (alive.current) setMessage("Limite de 1 minuto atingido. Ouça sua gravação abaixo."); }, 60_000);
    } catch { stream.current?.getTracks().forEach((track) => track.stop()); if (alive.current) setMessage("Microfone não liberado ou indisponível. Você pode continuar sem gravar."); }
    finally { if (alive.current) setAsking(false); }
  }
  return <section className="en-recorder"><h4>Sua voz, seu treino</h4><p>Leia uma frase, ouça e tente novamente sem ler. Observe se as palavras estão claras, não se o sotaque é “perfeito”.</p><div className="en-actions"><button type="button" disabled={asking} onClick={recording ? stop : () => void start()}>{asking ? "Aguardando microfone…" : recording ? "■ Parar gravação" : "● Gravar até 1 minuto"}</button>{recording && <span role="status">Gravando · clique em parar quando terminar</span>}</div>{audio && <div className="en-recording"><audio controls src={audio.url} aria-label="Ouvir minha gravação" /><a href={audio.url} download={`${lessonId}.${audio.extension}`}>Baixar minha gravação</a><button type="button" onClick={() => { URL.revokeObjectURL(audio.url); url.current = ""; setAudio(null); }}>Apagar gravação</button></div>}<small>O áudio não é enviado nem salvo na conta. Baixe se quiser guardar: ele será descartado ao sair desta atividade. Não há avaliação automática da pronúncia.</small>{message && <p role="status">{message}</p>}</section>;
}
