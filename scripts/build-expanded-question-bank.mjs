#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const examDirectory = path.join(root, "public", "enem-exams");

const subjectConfigs = {
  portuguese: {
    markers: ["texto", "linguagem", "leitor", "poema", "literatura", "gênero", "discurso", "narrador", "autor", "efeito de sentido", "variação linguística", "oralidade", "gramática", "coesão", "metáfora", "ironia", "argumentação", "arte", "comunicação"],
    topics: {
      "Interpretação de Textos": ["sentido", "interpreta", "leitor", "efeito de sentido", "infer", "ideia", "texto", "compreensão"],
      "Gêneros Textuais": ["gênero", "crônica", "notícia", "reportagem", "artigo", "resenha", "carta", "anúncio", "campanha", "verbete"],
      "Variação Linguística": ["variação", "variedade", "norma", "registro", "oralidade", "fala", "preconceito linguístico", "regional", "coloquial"],
      "Gramática em Contexto": ["pronome", "verbo", "conjunção", "pontuação", "coesão", "referência", "sintaxe", "advérbio", "concordância", "conectivo"],
      "Funções e Recursos da Linguagem": ["função da linguagem", "linguagem", "metáfora", "ironia", "humor", "argument", "persuas", "figura de linguagem", "recurso expressivo"],
      "Literatura Brasileira": ["romance", "poema", "poesia", "literatura", "narrador", "personagem", "modernismo", "romantismo", "realismo", "autor"],
      "Artes e Expressões Culturais": ["arte", "artístico", "pintura", "música", "dança", "teatro", "cinema", "fotografia", "obra", "estética"],
      "Tecnologias da Comunicação": ["internet", "digital", "mídia", "rede social", "tecnologia", "comunicação", "site", "aplicativo", "virtual"],
      "Cultura e Identidade": ["cultura", "identidade", "memória", "patrimônio", "indígena", "african", "tradição", "diversidade", "popular"],
      "Semiótica e Linguagem Não Verbal": ["signo", "símbolo", "verbal", "não verbal", "imagem", "visual", "corporal", "gesto", "multimodal"],
    },
  },
  history: {
    markers: ["história", "histórico", "século", "colônia", "império", "república", "revolução", "guerra", "escravidão", "abolição", "ditadura", "vargas", "medieval", "antiguidade", "independência", "imperialismo", "industrialização", "regime", "memória", "patrimônio", "passado"],
    topics: {
      "Brasil Colônia": ["colônia", "colonial", "português", "engenho", "açúcar", "bandeir", "jesuíta", "capitania", "mineração", "metrópole"],
      "Escravidão e Resistências": ["escrav", "quilomb", "aboli", "tráfico negreiro", "african", "resistência negra", "liberto"],
      "Brasil Império": ["império", "imperial", "monarquia", "d. pedro", "independência do brasil", "regência", "paraguai"],
      "República Brasileira": ["república", "vargas", "estado novo", "coronelismo", "tenentismo", "oligárqu", "era vargas", "revolução de 1930"],
      "Ditadura e Redemocratização": ["ditadura", "militar", "redemocrat", "anistia", "ato institucional", "diretas", "repressão", "1964"],
      "Antiguidade e Mundo Medieval": ["antig", "egito", "greg", "roma", "feudal", "medieval", "igreja", "servos", "pólis"],
      "Idade Moderna": ["renascimento", "reforma", "absolut", "mercantil", "navegações", "iluminismo", "revolução francesa"],
      "Revoluções e Industrialização": ["revolução industrial", "industrialização", "operári", "burguesia", "socialismo", "capitalismo", "máquina", "fábrica"],
      "Guerras e Totalitarismos": ["guerra mundial", "nazis", "fascis", "holocausto", "totalitar", "hitler", "mussolini", "guerra fria"],
      "América, África e Ásia": ["américa", "africa", "áfrica", "ásia", "colonialismo", "imperialismo", "descolonização", "independência", "civilização"],
    },
  },
  geography: {
    markers: ["espaço geográfico", "território", "paisagem", "região", "mapa", "cartografia", "clima", "vegetação", "bioma", "relevo", "solo", "hidrografia", "ambiental", "desmatamento", "agricultura", "agrário", "urbano", "migração", "população", "globalização", "geopolítica", "fronteira", "energia", "recurso natural", "rede urbana"],
    topics: {
      "Cartografia e Orientação": ["mapa", "cartograf", "escala", "coordenada", "latitude", "longitude", "projeção", "fuso horário"],
      "Clima e Vegetação": ["clima", "chuva", "temperatura", "vegetação", "bioma", "floresta", "cerrado", "caatinga", "amazônia"],
      "Relevo, Solos e Hidrografia": ["relevo", "solo", "rio", "bacia", "hidrograf", "erosão", "água", "aquífero", "planalto", "planície"],
      "Questões Ambientais": ["ambient", "sustent", "desmat", "poluição", "queimada", "mudança climática", "efeito estufa", "conservação", "reciclagem"],
      "Espaço Agrário": ["agrári", "agricultura", "campo", "rural", "latifúndio", "reforma agrária", "pecuária", "agronegócio", "campon"],
      "Urbanização e Redes": ["urban", "cidade", "metrópole", "habitação", "segregação", "rede urbana", "mobilidade", "periferia", "conurbação"],
      "População e Migrações": ["população", "demograf", "migra", "imigra", "refugiado", "natalidade", "mortalidade", "êxodo", "deslocamento"],
      "Economia e Globalização": ["globalização", "economia", "indústria", "comércio", "trabalho", "produção", "multinacional", "financeiro", "mercado"],
      "Geopolítica e Território": ["geopolítica", "território", "fronteira", "estado", "nação", "conflito", "poder", "bloco", "união europeia", "onu"],
      "Energia e Recursos Naturais": ["energia", "petróleo", "minério", "recurso natural", "hidrelétrica", "solar", "eólica", "combustível", "mineração"],
    },
  },
  philosophy: {
    markers: ["filosofia", "filosófico", "sócrates", "platão", "aristóteles", "epicuro", "estoic", "agostinho", "tomás de aquino", "maquiavel", "hobbes", "rousseau", "descartes", "locke", "hume", "kant", "hegel", "nietzsche", "sartre", "foucault", "habermas", "arendt", "ética", "moral", "epistemologia", "metafísica", "racionalismo", "empirismo", "criticismo", "virtude", "imperativo categórico", "contrato social"],
    topics: {
      "Filosofia Antiga": ["sócrates", "platão", "aristóteles", "sofista", "polis", "pólis", "grega", "virtude", "mito", "logos"],
      "Filosofia Medieval": ["agostinho", "tomás de aquino", "escolástica", "fé", "razão", "deus", "medieval"],
      "Racionalismo e Empirismo": ["descartes", "racionalismo", "empirismo", "locke", "hume", "experiência", "ideia inata", "método"],
      "Iluminismo e Criticismo": ["kant", "iluminismo", "esclarecimento", "criticismo", "autonomia", "razão", "imperativo"],
      "Ética": ["ética", "moral", "virtude", "bem", "dever", "liberdade", "responsabilidade", "felicidade", "ação humana"],
      "Filosofia Política": ["contrato social", "hobbes", "locke", "rousseau", "maquiavel", "poder", "estado", "justiça", "democracia", "cidadania"],
      "Teoria do Conhecimento": ["conhecimento", "verdade", "ciência", "saber", "percepção", "experiência", "razão", "dúvida", "epistem"],
      "Filosofia Contemporânea": ["nietzsche", "foucault", "sartre", "existencial", "marx", "habermas", "arendt", "contemporânea"],
      "Estética e Filosofia da Arte": ["estética", "arte", "belo", "gosto", "obra", "artístico", "sensível"],
      "Lógica e Argumentação": ["lógica", "argument", "premissa", "conclusão", "falácia", "raciocínio", "contradição", "discurso"],
    },
  },
  sociology: {
    markers: ["sociologia", "sociológico", "sociedade", "social", "durkheim", "weber", "marx", "comte", "bourdieu", "fato social", "ação social", "classe social", "desigualdade", "racismo", "gênero", "trabalho", "cidadania", "movimento social", "indústria cultural", "identidade", "etnocentrismo", "controle social", "instituição", "exclusão", "preconceito"],
    topics: {
      "Pensamento Sociológico": ["durkheim", "weber", "marx", "sociologia", "fato social", "ação social", "materialismo", "sociedade"],
      "Cultura e Identidade": ["cultura", "identidade", "etnocentr", "relativismo", "diversidade", "patrimônio", "tradição", "hibrid"],
      "Trabalho e Sociedade": ["trabalho", "trabalhador", "capital", "produção", "emprego", "precariza", "divisão social", "classe"],
      "Desigualdades Sociais": ["desigual", "pobreza", "exclusão", "classe social", "renda", "racismo", "gênero", "estratificação"],
      "Política, Estado e Democracia": ["política", "estado", "democracia", "poder", "cidadania", "eleição", "participação", "direito", "instituição"],
      "Movimentos Sociais": ["movimento social", "mobilização", "protesto", "feminismo", "movimento negro", "sindicato", "luta", "ativismo"],
      "Mídia e Indústria Cultural": ["mídia", "indústria cultural", "comunicação", "consumo", "publicidade", "rede social", "algoritmo", "massa"],
      "Violência e Controle Social": ["violência", "controle social", "prisão", "criminal", "segurança", "repressão", "disciplina", "vigilância"],
      "Questões Étnico-raciais e de Gênero": ["raça", "racismo", "negro", "indígena", "gênero", "mulher", "sexualidade", "discrimina", "preconceito"],
      "Globalização e Sociedade": ["globalização", "migração", "tecnologia", "rede", "consumo", "modernidade", "mundial", "transformação social"],
    },
  },
};

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function clean(value = "") {
  return value
    .replace(/\*\*/g, "")
    .replace(/\\\[/g, "[")
    .replace(/\\_/g, "_")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function questionText(question) {
  return normalize([
    question.context,
    question.statement,
    ...question.alternatives.map((alternative) => alternative.text),
  ].join(" "));
}

function isNativeReady(question) {
  return !question.cancelled
    && /^[A-E]$/.test(question.correctAlternative ?? "")
    && Boolean(question.context?.trim() || question.statement?.trim())
    && question.alternatives.length === 5
    && question.alternatives.every((alternative) => alternative.letter && alternative.text?.trim() && !alternative.file)
    && !question.files?.length
    && !question.previewImage;
}

function classify(question, config) {
  const text = questionText(question);
  const topic = Object.entries(config.topics)
    .map(([topic, keywords], topicIndex) => ({
      topic,
      topicIndex,
      score: keywords.reduce((score, keyword) => score + (text.includes(normalize(keyword)) ? (keyword.includes(" ") ? 4 : 2) : 0), 0),
    }))
    .sort((a, b) => b.score - a.score || a.topicIndex - b.topicIndex)[0];
  const subjectScore = config.markers.reduce((score, marker) => score + (text.includes(normalize(marker)) ? (marker.includes(" ") ? 4 : 2) : 0), 0);
  return { ...topic, subjectScore };
}

function rankQuestions(candidates, config) {
  const ranked = candidates
    .map((question) => ({ question, ...classify(question, config) }))
    .sort((a, b) => b.subjectScore - a.subjectScore || b.score - a.score || b.question.year - a.question.year || a.question.index - b.question.index);

  const prioritized = [];
  const seen = new Set();
  const topicNames = Object.keys(config.topics);

  for (const topic of topicNames) {
    for (const item of ranked.filter((candidate) => candidate.topic === topic && candidate.subjectScore > 0 && candidate.score > 0).slice(0, 12)) {
      const key = `${item.question.year}-${item.question.index}`;
      if (!seen.has(key)) {
        prioritized.push(item);
        seen.add(key);
      }
    }
  }

  for (const item of ranked) {
    const key = `${item.question.year}-${item.question.index}`;
    if (!seen.has(key)) {
      prioritized.push(item);
      seen.add(key);
    }
  }
  return prioritized;
}

const exams = [];
for (let year = 2009; year <= 2025; year += 1) {
  exams.push(JSON.parse(await readFile(path.join(examDirectory, `${year}.json`), "utf8")));
}

const allQuestions = exams.flatMap((exam) => exam.questions);
const readyLanguageQuestions = allQuestions.filter((question) => question.area === "lc" && question.language === null && isNativeReady(question));
const readyHumanitiesQuestions = allQuestions.filter((question) => question.area === "ch" && isNativeReady(question));
const selections = {
  portuguese: rankQuestions(readyLanguageQuestions, subjectConfigs.portuguese).slice(0, 200),
};
const humanitiesSubjects = ["history", "geography", "philosophy", "sociology"];
const humanitiesRankings = Object.fromEntries(humanitiesSubjects.map((subject) => [subject, rankQuestions(readyHumanitiesQuestions, subjectConfigs[subject])]));
const sourceUsage = new Map();
const pointers = Object.fromEntries(humanitiesSubjects.map((subject) => [subject, 0]));
for (const subject of humanitiesSubjects) selections[subject] = [];

while (humanitiesSubjects.some((subject) => selections[subject].length < 200)) {
  let added = false;
  for (const subject of humanitiesSubjects) {
    if (selections[subject].length >= 200) continue;
    const ranking = humanitiesRankings[subject];
    while (pointers[subject] < ranking.length) {
      const item = ranking[pointers[subject]];
      pointers[subject] += 1;
      const key = `${item.question.year}-${item.question.index}`;
      if ((sourceUsage.get(key) ?? 0) >= 2) continue;
      selections[subject].push(item);
      sourceUsage.set(key, (sourceUsage.get(key) ?? 0) + 1);
      added = true;
      break;
    }
  }
  if (!added) throw new Error("Não foi possível equilibrar 200 questões por matéria de Ciências Humanas");
}

const metadata = [];
const chapters = [];
const content = {};
const report = {};

for (const [subject, config] of Object.entries(subjectConfigs)) {
  const candidates = subject === "portuguese" ? readyLanguageQuestions : readyHumanitiesQuestions;
  const selected = selections[subject].sort((a, b) => a.topicIndex - b.topicIndex || b.score - a.score || b.question.year - a.question.year || a.question.index - b.question.index);
  let number = 0;
  let chapterNumber = 0;

  for (const topic of Object.keys(config.topics)) {
    const items = selected.filter((item) => item.topic === topic);
    if (!items.length) continue;
    chapterNumber += 1;
    const start = number + 1;
    const chapterId = `${subject}-${normalize(topic).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

    for (const item of items) {
      number += 1;
      const question = item.question;
      const id = `${subject}-${String(number).padStart(3, "0")}`;
      metadata.push({
        id,
        subject,
        number,
        chapterId,
        chapterNumber,
        chapter: topic,
        source: `ENEM ${question.year} · questão ${question.index}`,
        type: "objective",
        segments: [],
        native: true,
        correctAnswer: question.correctAlternative,
      });
      content[id] = {
        context: clean(question.context),
        statement: clean(question.statement),
        alternatives: question.alternatives.map((alternative) => ({ letter: alternative.letter, text: clean(alternative.text) })),
      };
    }

    chapters.push({
      id: chapterId,
      subject,
      number: chapterNumber,
      title: topic,
      start,
      end: number,
      count: items.length,
    });
  }

  report[subject] = {
    candidates: candidates.length,
    selected: number,
    positiveMatches: selected.filter((item) => item.subjectScore > 0).length,
    topics: Object.fromEntries(chapters.filter((chapter) => chapter.subject === subject).map((chapter) => [chapter.title, chapter.count])),
  };
}

const header = "// Generated by scripts/build-expanded-question-bank.mjs. Do not edit by hand.\n";
const subjectNames = Object.keys(subjectConfigs);
for (const subject of subjectNames) {
  await writeFile(
    path.join(root, "app", `question-bank-expansion-${subject}.ts`),
    `${header}import type { Question, QuestionChapter } from "./question-bank-types";\nexport const ${subject}QuestionChapters: QuestionChapter[] = ${JSON.stringify(chapters.filter((chapter) => chapter.subject === subject))};\nexport const ${subject}Questions: Question[] = ${JSON.stringify(metadata.filter((question) => question.subject === subject))};\n`,
    "utf8",
  );
}

const imports = subjectNames.map((subject) => `import { ${subject}QuestionChapters, ${subject}Questions } from "./question-bank-expansion-${subject}";`).join("\n");
await writeFile(
  path.join(root, "app", "question-bank-expansion-data.ts"),
  `${header}${imports}\nexport const expandedQuestionChapters = [${subjectNames.map((subject) => `...${subject}QuestionChapters`).join(",")}];\nexport const expandedQuestions = [${subjectNames.map((subject) => `...${subject}Questions`).join(",")}];\n`,
  "utf8",
);

const questionBankDirectory = path.join(root, "public", "question-bank");
await mkdir(questionBankDirectory, { recursive: true });
for (const chapter of chapters) {
  const chapterContent = Object.fromEntries(metadata.filter((question) => question.chapterId === chapter.id).map((question) => [question.id, content[question.id]]));
  await writeFile(path.join(questionBankDirectory, `${chapter.id}.json`), JSON.stringify(chapterContent), "utf8");
}

console.log(JSON.stringify(report, null, 2));
