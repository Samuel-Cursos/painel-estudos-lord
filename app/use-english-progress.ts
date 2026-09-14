"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { doc, onSnapshot, runTransaction, serverTimestamp } from "firebase/firestore";
import { firestore } from "./firebase-client";
import { ENGLISH_NAMESPACE, mergeCells, sanitizeCells, type LearningCells } from "./english-progress";

/** Owner-scoped learning progress, using the dashboard's existing progress map/rules.
 * Only changed English cells are merged. Never replace ENEM progress or store audio. */
export function useEnglishProgress(uid: string) {
  const [cells, setCells] = useState<LearningCells>({});
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Carregando seu progresso…");
  const updateRef = useRef<(key: string, value: unknown) => void>(() => {});
  const retryRef = useRef<() => void>(() => {});
  useEffect(() => {
    let alive = true;
    let state: LearningCells = {};
    let pending: LearningCells = {};
    let timer: ReturnType<typeof setTimeout> | undefined;
    let saving = false;
    let localAvailable = true;
    const key = `clareia-english-v2:${uid}`;
    const reference = doc(firestore, "users", uid, "dashboard", "main");
    const cache = () => {
      try { localStorage.setItem(key, JSON.stringify({ cells: state, pending })); }
      catch { localAvailable = false; }
    };
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      state = sanitizeCells(stored.cells);
      pending = sanitizeCells(stored.pending);
    } catch { localAvailable = false; }
    const flush = async () => {
      if (!alive || saving) return;
      if (!Object.keys(pending).length) return;
      if (!navigator.onLine) { setStatus(localAvailable ? "Sem conexão · salvo neste aparelho" : "Sem conexão · não foi possível salvar"); return; }
      saving = true;
      setStatus("Salvando progresso…");
      const batch = { ...pending };
      try {
        const saved = await runTransaction(firestore, async (transaction) => {
          const snapshot = await transaction.get(reference);
          const remote = sanitizeCells(snapshot.data()?.skillProgress?.[ENGLISH_NAMESPACE]);
          const merged = mergeCells(remote, batch);
          transaction.set(reference, { skillProgress: { [ENGLISH_NAMESPACE]: merged }, updatedAt: serverTimestamp() }, { merge: true });
          return merged;
        });
        if (!alive) return;
        for (const [name, cell] of Object.entries(batch)) if (pending[name]?.at === cell.at) delete pending[name];
        state = mergeCells(saved, pending);
        cache(); setCells(state);
        setStatus(Object.keys(pending).length ? "Salvando progresso…" : "Progresso salvo na sua conta");
      } catch {
        if (alive) setStatus(localAvailable ? "Salvo neste aparelho · sincronização pendente" : "Não foi possível salvar. Copie seu texto antes de sair.");
      } finally {
        saving = false;
        if (alive && Object.keys(pending).some((name) => pending[name].at !== batch[name]?.at)) timer = setTimeout(() => void flush(), 1000);
      }
    };
    const unsubscribe = onSnapshot(reference, (snapshot) => {
      if (!alive) return;
      if (snapshot.metadata.fromCache && !snapshot.exists()) return;
      state = mergeCells(sanitizeCells(snapshot.data()?.skillProgress?.[ENGLISH_NAMESPACE]), pending);
      cache(); setCells(state);
      if (!Object.keys(pending).length) setStatus(snapshot.metadata.fromCache ? "Progresso disponível neste aparelho" : "Progresso salvo na sua conta");
      else void flush();
    }, () => { if (alive) setStatus("Sincronização indisponível · tente novamente"); });
    updateRef.current = (name, value) => {
      const cell = { value: JSON.stringify(value), at: Math.max(Date.now(), (state[name]?.at ?? 0) + 1) };
      if (!sanitizeCells({ [name]: cell })[name]) { setStatus("Não foi possível guardar este conteúdo. Confira o limite do campo e copie seu texto antes de sair."); return; }
      pending = { ...pending, [name]: cell };
      state = { ...state, [name]: cell };
      cache(); setCells(state);
      setStatus(localAvailable ? "Salvo neste aparelho · sincronizando…" : "Salvando na conta…");
      clearTimeout(timer); timer = setTimeout(() => void flush(), 800);
    };
    retryRef.current = () => void flush();
    const offline = () => setStatus(localAvailable ? "Sem conexão · salvo neste aparelho" : "Sem conexão · não foi possível salvar");
    window.addEventListener("online", retryRef.current);
    window.addEventListener("offline", offline);
    const initialize = setTimeout(() => { if (alive) { setCells(state); setReady(true); void flush(); } }, 0);
    return () => {
      // Pending writes remain in the UID-scoped cache and retry on the next visit.
      alive = false; clearTimeout(timer); clearTimeout(initialize); unsubscribe();
      window.removeEventListener("online", retryRef.current);
      window.removeEventListener("offline", offline);
      updateRef.current = () => {}; retryRef.current = () => {};
    };
  }, [uid]);
  const save = useCallback((key: string, value: unknown) => updateRef.current(key, value), []);
  const retry = useCallback(() => retryRef.current(), []);
  return { cells, ready, status, save, retry };
}
