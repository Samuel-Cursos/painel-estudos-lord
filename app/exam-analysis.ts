import type { EnemExamData, EnemQuestionData, ExamAreaId } from "./enem-exam-data";

export type OfficialAreaResult = {
  correct: number;
  wrong: number;
  blank: number;
  cancelled: number;
  total: number;
};

export type OfficialTopicResult = {
  id: string;
  area: ExamAreaId;
  topic: string;
  studyAction: string;
  correct: number;
  wrong: number;
  answered: number;
  errorRate: number;
  focusPercent: number;
  wrongQuestions: number[];
};

export type OfficialExamResult = {
  correct: number;
  wrong: number;
  blank: number;
  cancelled: number;
  total: number;
  gradedTotal: number;
  areas: Record<ExamAreaId, OfficialAreaResult>;
  topics: OfficialTopicResult[];
  finishedAt: string;
};

export type ExamTestAnswerPlan = {
  answers: Record<string, string>;
  targetQuestion: number;
  filledCount: number;
  correctCount: number;
  wrongCount: number;
};

type TopicDefinition = {
  id: string;
  area: ExamAreaId;
  topic: string;
  studyAction: string;
  keywords: string[];
};

const areaIds: ExamAreaId[] = ["lc", "ch", "cn", "math"];

const fallbackTopics: Record<ExamAreaId, TopicDefinition> = {
  lc: { id: "lc-reading", area: "lc", topic: "Interpretação e gêneros textuais", studyAction: "Pratique leitura, identificação da intenção do autor e comparação entre gêneros.", keywords: [] },
  ch: { id: "ch-society", area: "ch", topic: "Sociedade, espaço e cidadania", studyAction: "Revise as relações entre processos históricos, território, política e vida social.", keywords: [] },
  cn: { id: "cn-integrated", area: "cn", topic: "Ciências da Natureza — conceitos integrados", studyAction: "Retome os conceitos de Biologia, Física e Química usados na interpretação de situações-problema.", keywords: [] },
  math: { id: "math-problems", area: "math", topic: "Resolução de problemas", studyAction: "Treine a tradução do enunciado para operações, fórmulas e estratégias de cálculo.", keywords: [] },
};

const topicDefinitions: TopicDefinition[] = [
  { id: "lc-foreign", area: "lc", topic: "Inglês e língua estrangeira", studyAction: "Revise vocabulário em contexto, conectivos e estratégias de leitura em inglês.", keywords: ["english", "ingles", "spanish", "espanhol", "translation", "language", "song", "lyrics"] },
  { id: "lc-grammar", area: "lc", topic: "Gramática e variação linguística", studyAction: "Revise variação linguística, coesão, sintaxe, semântica e efeitos de sentido.", keywords: ["variacao linguistica", "norma culta", "linguagem formal", "linguagem informal", "coesao", "conectivo", "pronome", "verbo", "sintaxe", "semantica", "pontuacao", "ortografia", "figura de linguagem"] },
  { id: "lc-literature", area: "lc", topic: "Literatura brasileira", studyAction: "Retome escolas literárias, recursos expressivos, narrador, poesia e contexto das obras.", keywords: ["romance", "poema", "poesia", "poeta", "narrador", "personagem", "literatura", "literario", "modernismo", "romantismo", "realismo", "conto", "cronica"] },
  { id: "lc-arts", area: "lc", topic: "Artes e patrimônio cultural", studyAction: "Revise movimentos artísticos, patrimônio, cultura popular, música, teatro e artes visuais.", keywords: ["obra de arte", "artista", "pintura", "escultura", "cinema", "teatro", "danca", "musica", "patrimonio", "manifestacao cultural", "cultura popular", "festival folclorico"] },
  { id: "lc-media", area: "lc", topic: "Comunicação, mídia e tecnologia", studyAction: "Pratique leitura de publicidade, charges, redes sociais e diferentes linguagens da mídia.", keywords: ["publicidade", "propaganda", "anuncio", "campanha", "charge", "cartum", "rede social", "internet", "midia", "tecnologia", "comunicacao", "site", "aplicativo"] },
  { id: "lc-body", area: "lc", topic: "Corpo, esporte e saúde", studyAction: "Revise práticas corporais, esporte, lazer, inclusão e relações entre corpo e sociedade.", keywords: ["esporte", "atleta", "atividade fisica", "exercicio fisico", "danca", "jogo", "lazer", "corpo", "saude corporal"] },
  { id: "lc-reading", area: "lc", topic: "Interpretação e gêneros textuais", studyAction: "Pratique leitura, identificação da intenção do autor e comparação entre gêneros.", keywords: ["texto", "autor", "leitor", "finalidade", "objetivo", "argumento", "tese", "genero", "noticia", "carta", "artigo", "entrevista", "efeito de sentido"] },

  { id: "ch-brazil", area: "ch", topic: "História do Brasil", studyAction: "Revise Colônia, Império, República, escravidão, Era Vargas, ditadura e redemocratização.", keywords: ["brasil colonia", "imperio brasileiro", "republica brasileira", "escravidao", "abolic", "era vargas", "estado novo", "ditadura militar", "redemocratizacao", "independencia do brasil", "quilombo", "indigena"] },
  { id: "ch-world", area: "ch", topic: "História Geral", studyAction: "Retome Antiguidade, feudalismo, revoluções, imperialismo, guerras e mundo contemporâneo.", keywords: ["antiguidade", "grecia", "roma", "feudal", "renascimento", "reforma protestante", "revolucao francesa", "revolucao industrial", "imperialismo", "primeira guerra", "segunda guerra", "guerra fria", "nazismo", "fascismo"] },
  { id: "ch-human-geography", area: "ch", topic: "Geografia humana e econômica", studyAction: "Revise urbanização, população, migrações, indústria, agropecuária, redes e globalização.", keywords: ["urbanizacao", "cidade", "populacao", "migracao", "demografia", "industria", "agropecuaria", "agricultura", "globalizacao", "comercio", "economia", "trabalho", "territorio", "geopolitica"] },
  { id: "ch-physical-geography", area: "ch", topic: "Geografia física e meio ambiente", studyAction: "Revise clima, relevo, solos, hidrografia, biomas, cartografia e impactos ambientais.", keywords: ["clima", "relevo", "solo", "hidrografia", "rio", "bioma", "vegetacao", "desmatamento", "meio ambiente", "aquecimento global", "cartografia", "mapa", "latitude", "longitude"] },
  { id: "ch-philosophy", area: "ch", topic: "Filosofia e ética", studyAction: "Revise ética, política, conhecimento e argumentos dos principais filósofos.", keywords: ["filoso", "etica", "moral", "razao", "conhecimento", "verdade", "aristoteles", "platao", "socrates", "kant", "descartes", "nietzsche", "hobbes", "rousseau", "locke"] },
  { id: "ch-sociology", area: "ch", topic: "Sociologia, cultura e cidadania", studyAction: "Revise cultura, desigualdade, movimentos sociais, Estado, democracia e relações de trabalho.", keywords: ["sociologia", "sociedade", "cultura", "cidadania", "desigualdade", "movimento social", "democracia", "estado", "poder", "preconceito", "racismo", "genero", "classe social", "durkheim", "weber", "marx"] },

  { id: "cn-ecology", area: "cn", topic: "Ecologia e meio ambiente", studyAction: "Revise cadeias alimentares, ciclos biogeoquímicos, relações ecológicas e impactos ambientais.", keywords: ["ecologia", "ecossistema", "cadeia alimentar", "teia alimentar", "bioma", "biodiversidade", "poluicao", "efeito estufa", "ciclo do carbono", "populacao", "especie", "habitat", "sustentabilidade"] },
  { id: "cn-genetics", area: "cn", topic: "Genética, evolução e biotecnologia", studyAction: "Revise DNA, hereditariedade, seleção natural, evolução e técnicas de biotecnologia.", keywords: ["dna", "rna", "gene", "genetica", "hereditariedade", "cromossomo", "mutacao", "evolucao", "selecao natural", "transgenico", "biotecnologia", "clonagem"] },
  { id: "cn-biology", area: "cn", topic: "Citologia, fisiologia e saúde", studyAction: "Revise células, metabolismo, sistemas do corpo, imunidade, doenças e saúde pública.", keywords: ["celula", "mitose", "meiose", "organelo", "enzima", "proteina", "tecido", "sistema digestorio", "sistema nervoso", "hormonio", "imun", "vacina", "doenca", "virus", "bacteria", "parasita", "fisiologia"] },
  { id: "cn-chemistry-general", area: "cn", topic: "Química geral e físico-química", studyAction: "Revise estequiometria, soluções, pH, eletroquímica, termoquímica e equilíbrio.", keywords: ["mol", "estequiometr", "solucao", "concentracao", "ph", "acido", "base", "eletroquim", "pilha", "eletrólise", "termoquim", "entalpia", "equilibrio quimico", "reacao quimica", "tabela periodica"] },
  { id: "cn-organic", area: "cn", topic: "Química orgânica e ambiental", studyAction: "Revise funções orgânicas, combustíveis, polímeros, reações orgânicas e química ambiental.", keywords: ["carbono", "hidrocarboneto", "alcool", "aldeido", "cetona", "acido carboxilico", "ester", "funcao organica", "polimero", "combustivel", "petroleo", "biocombustivel", "quimica organica"] },
  { id: "cn-mechanics", area: "cn", topic: "Mecânica, energia e termologia", studyAction: "Revise movimento, forças, trabalho, energia, pressão, fluidos, calor e termodinâmica.", keywords: ["velocidade", "aceleracao", "forca", "movimento", "trabalho", "energia cinetica", "energia potencial", "potencia", "pressao", "densidade", "empuxo", "calor", "temperatura", "termodinamica"] },
  { id: "cn-electricity", area: "cn", topic: "Eletricidade, ondas e óptica", studyAction: "Revise circuitos, potência elétrica, magnetismo, ondas, som, espelhos e lentes.", keywords: ["corrente eletrica", "tensao", "resistencia", "circuito", "potencia eletrica", "eletricidade", "magnet", "onda", "frequencia", "som", "luz", "espelho", "lente", "refracao", "reflexao"] },

  { id: "math-ratio", area: "math", topic: "Razão, proporção e porcentagem", studyAction: "Revise regra de três, escalas, porcentagem, juros e proporcionalidade.", keywords: ["porcent", "percentual", "razao", "proporcao", "regra de tres", "escala", "taxa", "juros", "desconto", "aumento", "fracao"] },
  { id: "math-algebra", area: "math", topic: "Álgebra e funções", studyAction: "Revise equações, sistemas, sequências, funções e leitura de gráficos algébricos.", keywords: ["equacao", "sistema", "funcao", "grafico", "expressao algebrica", "progressao", "sequencia", "matriz", "exponencial", "logarit", "polinomio"] },
  { id: "math-plane-geometry", area: "math", topic: "Geometria plana", studyAction: "Revise áreas, perímetros, semelhança, Teorema de Pitágoras e propriedades das figuras planas.", keywords: ["area", "perimetro", "triangulo", "quadrado", "retangulo", "circulo", "circunferencia", "poligono", "pitagoras", "semelhanca", "plano cartesiano"] },
  { id: "math-space-geometry", area: "math", topic: "Geometria espacial", studyAction: "Revise volumes, áreas de sólidos, planificações e relações espaciais.", keywords: ["volume", "cubo", "cilindro", "cone", "esfera", "prisma", "piramide", "solido", "planificacao", "capacidade"] },
  { id: "math-statistics", area: "math", topic: "Estatística e probabilidade", studyAction: "Revise média, mediana, gráficos, tabelas, análise combinatória e probabilidade.", keywords: ["media", "mediana", "moda", "probabilidade", "estatistica", "frequencia", "tabela", "grafico", "amostra", "combinacao", "arranjo"] },
  { id: "math-measures", area: "math", topic: "Grandezas, medidas e trigonometria", studyAction: "Revise conversão de unidades, tempo, comprimento, ângulos e relações trigonométricas.", keywords: ["unidade", "medida", "comprimento", "distancia", "tempo", "metro", "litro", "quilometro", "angulo", "seno", "cosseno", "tangente", "trigonometr"] },
];

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function questionText(question: EnemQuestionData) {
  return normalizeText([
    question.context,
    question.statement,
    ...question.alternatives.map((alternative) => alternative.text),
  ].filter(Boolean).join(" "));
}

export function classifyExamQuestion(question: EnemQuestionData): TopicDefinition {
  if (question.language === "english") return topicDefinitions.find((topic) => topic.id === "lc-foreign")!;
  const content = questionText(question);
  const candidates = topicDefinitions.filter((topic) => topic.area === question.area);
  let selected = fallbackTopics[question.area];
  let selectedScore = 0;
  for (const candidate of candidates) {
    const score = candidate.keywords.reduce((sum, keyword) => {
      if (!content.includes(keyword)) return sum;
      return sum + (keyword.includes(" ") ? 3 : Math.max(1, Math.min(2, keyword.length / 7)));
    }, 0);
    if (score > selectedScore) {
      selected = candidate;
      selectedScore = score;
    }
  }
  return selected;
}

/**
 * Creates a deterministic mixed answer sheet for the ADM's QA shortcut.
 * The last valid question is intentionally left blank so the final step can
 * still be tested manually. It never runs for students; the simulator guards
 * the control with the owner account before calling this helper.
 */
export function buildExamTestAnswerPlan(exam: EnemExamData): ExamTestAnswerPlan {
  const answerable = exam.questions.filter((question) => !question.cancelled && /^[A-E]$/.test(question.correctAlternative ?? ""));
  const target = answerable.at(-1) ?? exam.questions.at(-1);
  if (!target) return { answers: {}, targetQuestion: 180, filledCount: 0, correctCount: 0, wrongCount: 0 };

  const answers: Record<string, string> = {};
  let correctCount = 0;
  let wrongCount = 0;
  for (const question of answerable) {
    if (question.index === target.index) continue;
    const makeCorrect = ((question.index * 17) + exam.year) % 5 < 2;
    const wrongAlternative = question.alternatives.find((alternative) => alternative.letter !== question.correctAlternative)?.letter;
    const answer = makeCorrect ? question.correctAlternative! : wrongAlternative;
    if (!answer) continue;
    answers[String(question.index)] = answer;
    if (makeCorrect) correctCount += 1;
    else wrongCount += 1;
  }

  return { answers, targetQuestion: target.index, filledCount: correctCount + wrongCount, correctCount, wrongCount };
}

function allocateFocusPercent(items: Array<{ weight: number }>) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return items.map(() => 0);
  const raw = items.map((item) => (item.weight / totalWeight) * 100);
  const allocated = raw.map(Math.floor);
  const remaining = 100 - allocated.reduce((sum, value) => sum + value, 0);
  const remainderOrder = raw.map((value, index) => ({ index, remainder: value - allocated[index] }))
    .sort((first, second) => second.remainder - first.remainder || first.index - second.index);
  for (let index = 0; index < remaining; index += 1) allocated[remainderOrder[index].index] += 1;
  return allocated;
}

export function buildExamResult(exam: EnemExamData, answers: Record<string, string>, finishedAt = new Date().toISOString()): OfficialExamResult {
  const areas = Object.fromEntries(areaIds.map((id) => [id, { correct: 0, wrong: 0, blank: 0, cancelled: 0, total: 0 }])) as Record<ExamAreaId, OfficialAreaResult>;
  const topics = new Map<string, Omit<OfficialTopicResult, "errorRate" | "focusPercent">>();
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  let cancelled = 0;

  for (const question of exam.questions) {
    const area = areas[question.area];
    area.total += 1;
    if (question.cancelled) {
      area.cancelled += 1;
      cancelled += 1;
      continue;
    }

    const answer = answers[String(question.index)];
    if (!answer) {
      area.blank += 1;
      blank += 1;
      continue;
    }

    const definition = classifyExamQuestion(question);
    const topic = topics.get(definition.id) ?? {
      id: definition.id,
      area: definition.area,
      topic: definition.topic,
      studyAction: definition.studyAction,
      correct: 0,
      wrong: 0,
      answered: 0,
      wrongQuestions: [],
    };
    topic.answered += 1;
    if (answer === question.correctAlternative) {
      area.correct += 1;
      correct += 1;
      topic.correct += 1;
    } else {
      area.wrong += 1;
      wrong += 1;
      topic.wrong += 1;
      topic.wrongQuestions.push(question.index);
    }
    topics.set(definition.id, topic);
  }

  const weakTopics = [...topics.values()]
    .filter((topic) => topic.wrong > 0)
    .map((topic) => ({
      ...topic,
      errorRate: Math.round((topic.wrong / topic.answered) * 100),
      weight: topic.wrong * (1 + topic.wrong / topic.answered),
    }))
    .sort((first, second) => second.weight - first.weight || second.errorRate - first.errorRate || first.topic.localeCompare(second.topic, "pt-BR"));
  const focus = allocateFocusPercent(weakTopics);
  const topicResults: OfficialTopicResult[] = weakTopics.map((topic, index) => ({
    id: topic.id,
    area: topic.area,
    topic: topic.topic,
    studyAction: topic.studyAction,
    correct: topic.correct,
    wrong: topic.wrong,
    answered: topic.answered,
    errorRate: topic.errorRate,
    focusPercent: focus[index],
    wrongQuestions: topic.wrongQuestions,
  }));

  return { correct, wrong, blank, cancelled, total: exam.questions.length, gradedTotal: exam.questions.length - cancelled, areas, topics: topicResults, finishedAt };
}
