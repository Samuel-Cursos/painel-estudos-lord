"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Clareia: erro inesperado na interface", error); }, [error]);

  return <main className="error-page"><section><span>C</span><p>CLAREIA · RECUPERAÇÃO</p><h1>Esta tela não terminou de carregar.</h1><p>Seu progresso já salvo continua seguro. Tente reconstruir a tela; se o problema continuar, recarregue o site.</p><div><button className="primary" onClick={reset}>Tentar novamente</button><button className="secondary" onClick={() => window.location.reload()}>Recarregar o site</button></div></section></main>;
}
