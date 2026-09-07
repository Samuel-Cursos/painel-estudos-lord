export type WritingObservation = { id: string; title: string; detail: string };

export function countWritingWords(text: string) {
  return (text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;
}

// Alguns cadernos têm fontes sem mapeamento Unicode. Não mostrar nem comparar texto corrompido.
export function readablePdfText(text: string) {
  const invalid = (text.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/g) ?? []).length;
  return countWritingWords(text) >= 30 && invalid <= text.length * 0.01;
}

/** Mechanical checks only: these do not assess the meaning of the essay or assign a grade. */
export function inspectWriting(text: string) {
  const paragraphs = text.trim().split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const sentences = text.trim().split(/[.!?]+(?:\s|$)/u).filter((part) => part.trim());
  const observations: WritingObservation[] = [];
  const words = countWritingWords(text);
  if (!words) return { words: 0, paragraphs: 0, observations };
  if (paragraphs.length === 1) observations.push({ id: "paragraphs", title: "O texto está em um único bloco", detail: "Confira onde começam a introdução, o desenvolvimento e a conclusão. Se já organizou essas partes, separe os parágrafos no editor." });
  const longSentences = sentences.filter((sentence) => countWritingWords(sentence) > 45).length;
  if (longSentences) observations.push({ id: "long-sentences", title: `${longSentences} período(s) com mais de 45 palavras`, detail: "Releia esses períodos e veja se a pontuação pode tornar as ideias mais claras. É uma sugestão de revisão, não uma regra de pontuação do ENEM." });
  const repeated = text.match(/(?<![\p{L}])([\p{L}]{2,})\s+\1(?![\p{L}])/giu);
  if (repeated?.length) observations.push({ id: "duplicates", title: "Possível palavra duplicada", detail: `Confira: ${[...new Set(repeated)].slice(0, 4).join("; ")}. A repetição pode ser intencional; avalie no contexto.` });
  if (!/[.!?…][”"')\]]?\s*$/.test(text)) observations.push({ id: "ending", title: "Confira o final do texto", detail: "Não encontrei pontuação de encerramento. Veja se terminou a conclusão ou se o texto ainda é um rascunho." });
  return { words, paragraphs: paragraphs.length, observations };
}

export function findSupportOverlap(text: string, support: string, theme: string) {
  const normalize = (value: string) => (value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{M}/gu, "").match(/[\p{L}\p{N}]+/gu) ?? []);
  const sourceWords = normalize(support);
  const essayWords = normalize(text);
  const themeWords = normalize(theme).join(" ");
  const size = 12;
  const phrases = new Set<string>();
  for (let i = 0; i <= sourceWords.length - size; i++) phrases.add(sourceWords.slice(i, i + size).join(" "));
  for (let i = 0; i <= essayWords.length - size; i++) {
    const phrase = essayWords.slice(i, i + size).join(" ");
    if (!themeWords.includes(phrase) && phrases.has(phrase)) return phrase;
  }
  return null;
}

export const writingReviewGuide = [
  { id: "c1", title: "1 · Escrita formal", items: [
    { id: "c1-language", text: "Reli ortografia, acentuação, concordância e pontuação." },
    { id: "c1-register", text: "Usei linguagem adequada a um texto formal." },
  ] },
  { id: "c2", title: "2 · Tema e repertório", items: [
    { id: "c2-theme", text: "Respondi ao recorte completo do tema, e não só ao assunto geral." },
    { id: "c2-repertoire", text: "Expliquei como meu repertório contribui para a discussão, sem apenas citar." },
    { id: "c2-authorship", text: "Desenvolvi minhas próprias ideias; não copiei os textos motivadores." },
  ] },
  { id: "c3", title: "3 · Argumentação", items: [
    { id: "c3-thesis", text: "Minha posição está clara e é sustentada ao longo do texto." },
    { id: "c3-evidence", text: "Expliquei meus argumentos e relacionei os exemplos à tese." },
  ] },
  { id: "c4", title: "4 · Coesão", items: [
    { id: "c4-links", text: "As frases e os parágrafos se conectam com sentido." },
    { id: "c4-references", text: "Pronomes e expressões de retomada deixam claro a que me refiro." },
  ] },
  { id: "c5", title: "5 · Intervenção", items: [
    { id: "c5-action", text: "Propus uma ação e identifiquei quem pode executá-la." },
    { id: "c5-method", text: "Expliquei o meio, a finalidade e um detalhamento da proposta." },
    { id: "c5-rights", text: "Minha intervenção responde ao problema discutido e respeita os direitos humanos." },
  ] },
] as const;

export const writingGuideUrl = "https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/redacao-do-enem-2025-cartilha-do-a-participante";
