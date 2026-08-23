"use client";

type Props = {
  loading: boolean;
  onGoogleLogin: () => Promise<void>;
};

export default function StudentLobby({ loading, onGoogleLogin }: Props) {
  return <main className="student-lobby enem-lobby">
    <div className="lobby-glow lobby-glow-one" /><div className="lobby-glow lobby-glow-two" />
    <header className="lobby-brand"><span>C</span><div><strong>Clareia</strong><small>PREPARAÇÃO ENEM</small></div></header>
    <section className="lobby-shell welcome">
      <div className="lobby-story"><span className="lobby-pill">FOCO TOTAL NO ENEM</span><h1>Seu próximo passo já está pronto.</h1><p>Um único painel para seguir o cronograma, dominar 747 habilidades, praticar 1.000 questões e acompanhar provas e simulados.</p>
        <div className="lobby-steps"><article className="active"><span>01</span><div><strong>Aprenda</strong><small>Cronograma em ordem</small></div></article><article><span>02</span><div><strong>Pratique</strong><small>Questões reais do ENEM</small></div></article><article><span>03</span><div><strong>Meça</strong><small>Provas e simulados</small></div></article></div>
        <div className="lobby-orbit" aria-hidden="true"><i /><i /><i /><span>LC</span><span>CN</span><span>MAT</span><b>E</b></div>
      </div>
      <div className="lobby-card"><span className="eyebrow">ACESSO À PLATAFORMA</span><h2>Entre e continue de onde parou.</h2><p>O Google protege sua conta. No primeiro acesso, você confirma nome, nome de exibição e RA + dígito.</p>
        {loading ? <div className="lobby-wait"><span /><strong>Preparando seu acesso…</strong><small>Estamos conferindo sua conta com segurança.</small></div> : <button className="lobby-google" onClick={() => void onGoogleLogin()}><span>G</span><div><strong>Continuar com Google</strong><small>Progresso sincronizado</small></div><b>→</b></button>}
        <div className="lobby-security"><span>◆</span><p><strong>Identificação responsável.</strong> Pedimos somente Google, nome e RA + dígito. Sem série, data de nascimento ou e-mail institucional.</p></div>
        <div className="lobby-enem-numbers"><span><strong>747</strong> habilidades</span><span><strong>1.000</strong> questões</span><span><strong>17</strong> provas internas</span></div>
      </div>
    </section>
    <footer className="lobby-footer"><span>Clareia · preparação focada no ENEM</span><span>24 aulas de Inglês · progresso separado por usuário</span></footer>
  </main>;
}
