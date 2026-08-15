export type SchoolYear = "6ef" | "7ef" | "8ef" | "9ef" | "1em" | "2em" | "3em";
export type SchoolSubject = "portuguese" | "math" | "english" | "science" | "biology" | "chemistry" | "physics" | "history" | "geography" | "philosophy" | "sociology";

export const schoolYears: Array<{ id: SchoolYear; label: string; short: string; stage: "fundamental" | "medio" }> = [
  { id: "6ef", label: "6º ano do Ensino Fundamental", short: "6º ano", stage: "fundamental" },
  { id: "7ef", label: "7º ano do Ensino Fundamental", short: "7º ano", stage: "fundamental" },
  { id: "8ef", label: "8º ano do Ensino Fundamental", short: "8º ano", stage: "fundamental" },
  { id: "9ef", label: "9º ano do Ensino Fundamental", short: "9º ano", stage: "fundamental" },
  { id: "1em", label: "1ª série do Ensino Médio", short: "1ª série", stage: "medio" },
  { id: "2em", label: "2ª série do Ensino Médio", short: "2ª série", stage: "medio" },
  { id: "3em", label: "3ª série do Ensino Médio", short: "3ª série", stage: "medio" },
];

export const schoolSubjectMeta: Record<SchoolSubject, { name: string; short: string; icon: string; color: string }> = {
  portuguese: { name: "Português", short: "POR", icon: "Aa", color: "#3478d4" },
  math: { name: "Matemática", short: "MAT", icon: "∑", color: "#477ee8" },
  english: { name: "Inglês", short: "ING", icon: "EN", color: "#d35b76" },
  science: { name: "Ciências", short: "CIE", icon: "◎", color: "#3c9c6d" },
  biology: { name: "Biologia", short: "BIO", icon: "DNA", color: "#35a873" },
  chemistry: { name: "Química", short: "QUI", icon: "Qm", color: "#9a6fe8" },
  physics: { name: "Física", short: "FIS", icon: "F=", color: "#e56b61" },
  history: { name: "História", short: "HIS", icon: "H", color: "#d99b31" },
  geography: { name: "Geografia", short: "GEO", icon: "◉", color: "#e47c38" },
  philosophy: { name: "Filosofia", short: "FIL", icon: "φ", color: "#51a976" },
  sociology: { name: "Sociologia", short: "SOC", icon: "S", color: "#dc639a" },
};

const portuguese: Record<SchoolYear, string[]> = {
  "6ef": ["Leitura e compreensão", "Substantivos e adjetivos", "Artigos e numerais", "Pronomes", "Verbos e tempos verbais", "Pontuação", "Ortografia", "Narrativa", "Poema e linguagem figurada", "Produção de parágrafo"],
  "7ef": ["Interpretação e inferência", "Sujeito e predicado", "Tipos de sujeito", "Verbos transitivos", "Advérbios", "Conjunções", "Crônica", "Notícia", "Coesão textual", "Produção narrativa"],
  "8ef": ["Gêneros argumentativos", "Termos da oração", "Vozes verbais", "Complemento nominal", "Aposto e vocativo", "Figuras de linguagem", "Concordância verbal", "Concordância nominal", "Artigo de opinião", "Revisão textual"],
  "9ef": ["Leitura crítica", "Orações coordenadas", "Orações subordinadas", "Regência verbal", "Regência nominal", "Crase", "Colocação pronominal", "Variação linguística", "Dissertação", "Argumentação"],
  "1em": ["Funções da linguagem", "Gêneros textuais", "Elementos da comunicação", "Classes de palavras", "Sintaxe essencial", "Semântica", "Trovadorismo", "Humanismo", "Classicismo", "Redação dissertativa"],
  "2em": ["Coesão e coerência", "Período composto", "Concordância", "Regência e crase", "Romantismo", "Realismo", "Naturalismo", "Parnasianismo", "Simbolismo", "Desenvolvimento argumentativo"],
  "3em": ["Interpretação ENEM", "Variação linguística", "Modernismo", "Literatura contemporânea", "Funções sintáticas", "Semântica e efeitos de sentido", "Repertório sociocultural", "Projeto de texto", "Proposta de intervenção", "Revisão de redação"],
};

const math: Record<SchoolYear, string[]> = {
  "6ef": ["Números naturais", "Operações fundamentais", "Múltiplos e divisores", "Frações", "Números decimais", "Porcentagem inicial", "Razão", "Ângulos", "Perímetro e área", "Tabelas e gráficos"],
  "7ef": ["Números inteiros", "Números racionais", "Expressões algébricas", "Equações do 1º grau", "Proporcionalidade", "Porcentagem", "Triângulos", "Áreas", "Média aritmética", "Probabilidade inicial"],
  "8ef": ["Potenciação e radiciação", "Notação científica", "Polinômios", "Produtos notáveis", "Sistemas de equações", "Ângulos e polígonos", "Teorema de Pitágoras", "Volume", "Estatística", "Probabilidade"],
  "9ef": ["Números reais", "Equação do 2º grau", "Função afim", "Função quadrática", "Semelhança de triângulos", "Trigonometria inicial", "Circunferência", "Geometria espacial", "Estatística", "Probabilidade composta"],
  "1em": ["Conjuntos numéricos", "Função afim", "Função quadrática", "Função modular", "Função exponencial", "Logaritmos", "Sequências", "Progressão aritmética", "Progressão geométrica", "Trigonometria"],
  "2em": ["Matrizes", "Determinantes", "Sistemas lineares", "Análise combinatória", "Probabilidade", "Geometria espacial", "Geometria analítica", "Circunferência", "Trigonometria avançada", "Estatística"],
  "3em": ["Matemática básica ENEM", "Razão e proporção", "Porcentagem e juros", "Funções", "Estatística", "Probabilidade", "Geometria plana", "Geometria espacial", "Análise de gráficos", "Modelagem matemática"],
};

const english: Record<SchoolYear, string[]> = {
  "6ef": ["Greetings", "Alphabet and spelling", "Numbers", "Colors", "Family", "School objects", "Verb to be", "Personal pronouns", "Simple instructions", "Daily vocabulary"],
  "7ef": ["Simple present", "Daily routine", "Adverbs of frequency", "There is and there are", "Places in town", "Can and cannot", "Prepositions", "Food vocabulary", "Questions", "Short texts"],
  "8ef": ["Simple past", "Regular verbs", "Irregular verbs", "Past of verb to be", "Comparatives", "Superlatives", "Travel vocabulary", "Countable nouns", "Some and any", "Reading strategies"],
  "9ef": ["Future with will", "Going to", "Present continuous", "Modal verbs", "Conditionals", "Present perfect", "Technology vocabulary", "Connectors", "Opinion texts", "Reading comprehension"],
  "1em": ["Verb tenses review", "Present perfect", "Past continuous", "Modal verbs", "Pronouns", "False cognates", "Text genres", "Skimming", "Scanning", "Vocabulary in context"],
  "2em": ["Conditionals", "Passive voice", "Reported speech", "Relative pronouns", "Phrasal verbs", "Connectors", "Media vocabulary", "Argumentative texts", "Inference", "Reading comprehension"],
  "3em": ["ENEM reading", "Text purpose", "Irony and humor", "Cognates", "Reference words", "Visual language", "Social themes", "Technology texts", "Global issues", "Exam strategies"],
};

const history: Record<SchoolYear, string[]> = {
  "6ef": ["Tempo histórico", "Fontes históricas", "Pré-história", "Mesopotâmia", "Egito Antigo", "Hebreus e fenícios", "Grécia Antiga", "Roma Antiga", "Povos africanos antigos", "Povos originários da América"],
  "7ef": ["Feudalismo", "Império Bizantino", "Mundo islâmico", "Renascimento", "Reformas religiosas", "Grandes navegações", "Povos americanos", "Colonização portuguesa", "Escravidão colonial", "Economia açucareira"],
  "8ef": ["Iluminismo", "Revolução Industrial", "Independência dos EUA", "Revolução Francesa", "Era Napoleônica", "Independências americanas", "Brasil Império", "Abolicionismo", "Imperialismo", "Proclamação da República"],
  "9ef": ["Primeira República", "Primeira Guerra Mundial", "Revolução Russa", "Crise de 1929", "Nazifascismo", "Segunda Guerra Mundial", "Era Vargas", "Guerra Fria", "Ditadura militar brasileira", "Redemocratização"],
  "1em": ["História e memória", "Antiguidade oriental", "Grécia", "Roma", "Feudalismo", "Civilização islâmica", "África medieval", "Renascimento", "Reformas religiosas", "Expansão marítima"],
  "2em": ["Colonização da América", "Brasil colonial", "Iluminismo", "Revoluções inglesas", "Revolução Industrial", "Revolução Francesa", "Independências americanas", "Brasil Império", "Escravidão e resistência", "Imperialismo"],
  "3em": ["República Velha", "Guerras mundiais", "Revolução Russa", "Era Vargas", "Totalitarismos", "Guerra Fria", "Ditaduras latino-americanas", "Ditadura brasileira", "Nova República", "Mundo contemporâneo"],
};

const geography: Record<SchoolYear, string[]> = {
  "6ef": ["Paisagem", "Lugar e território", "Orientação", "Cartografia", "Relevo", "Clima", "Hidrografia", "Vegetação", "Espaço rural", "Espaço urbano"],
  "7ef": ["Território brasileiro", "Regiões do Brasil", "População brasileira", "Migrações", "Urbanização", "Industrialização", "Agropecuária", "Biomas brasileiros", "Recursos naturais", "Desigualdades regionais"],
  "8ef": ["Continente americano", "América Latina", "Estados Unidos e Canadá", "África", "Colonialismo", "População mundial", "Migrações internacionais", "Globalização", "Blocos econômicos", "Conflitos territoriais"],
  "9ef": ["Europa", "Ásia", "Oceania", "Oriente Médio", "Geopolítica", "Economia global", "Redes e transportes", "Energia", "Mudanças climáticas", "Desenvolvimento sustentável"],
  "1em": ["Cartografia", "Estrutura geológica", "Relevo", "Climatologia", "Hidrografia", "Biomas", "Questões ambientais", "População", "Urbanização", "Espaço agrário"],
  "2em": ["Industrialização", "Fontes de energia", "Globalização", "Blocos econômicos", "Geopolítica", "Migrações", "Redes urbanas", "Agropecuária", "Comércio mundial", "Desigualdade socioespacial"],
  "3em": ["Geografia do Brasil", "Regiões brasileiras", "Economia brasileira", "Questão ambiental", "Geopolítica contemporânea", "Conflitos", "Demografia", "Urbanização brasileira", "Energia", "Interpretação cartográfica"],
};

const science: Record<SchoolYear, string[]> = {
  "6ef": ["Matéria e transformações", "Misturas", "Água", "Solo", "Atmosfera", "Célula", "Seres vivos", "Cadeias alimentares", "Corpo humano", "Sistema Solar"],
  "7ef": ["Ecossistemas", "Biodiversidade", "Classificação dos seres vivos", "Vírus e bactérias", "Fungos", "Plantas", "Animais", "Saúde pública", "Calor e temperatura", "Máquinas simples"],
  "8ef": ["Sistema digestório", "Sistema respiratório", "Sistema circulatório", "Sistema nervoso", "Reprodução", "Sexualidade e saúde", "Energia", "Eletricidade", "Luz", "Som"],
  "9ef": ["Átomos", "Tabela periódica", "Ligações químicas", "Reações químicas", "Movimento", "Força", "Energia mecânica", "Ondas", "Genética", "Evolução"],
  "1em": [], "2em": [], "3em": [],
};

const biology: Record<SchoolYear, string[]> = {
  "6ef": [], "7ef": [], "8ef": [], "9ef": [],
  "1em": ["Bioquímica", "Citologia", "Membrana plasmática", "Organelas", "Metabolismo energético", "Divisão celular", "Histologia", "Vírus", "Bactérias", "Ecologia"],
  "2em": ["Classificação biológica", "Botânica", "Zoologia", "Fisiologia humana", "Sistema endócrino", "Imunologia", "Doenças", "Reprodução", "Embriologia", "Ecologia de populações"],
  "3em": ["Genética", "Leis de Mendel", "Biotecnologia", "Evolução", "Seleção natural", "Relações ecológicas", "Ciclos biogeoquímicos", "Impactos ambientais", "Fisiologia comparada", "Revisão ENEM"],
};

const chemistry: Record<SchoolYear, string[]> = {
  "6ef": [], "7ef": [], "8ef": [], "9ef": [],
  "1em": ["Matéria e energia", "Modelos atômicos", "Tabela periódica", "Ligações químicas", "Geometria molecular", "Polaridade", "Funções inorgânicas", "Reações químicas", "Balanceamento", "Cálculos químicos"],
  "2em": ["Soluções", "Concentração", "Termoquímica", "Cinética química", "Equilíbrio químico", "Equilíbrio iônico", "Eletroquímica", "Radioatividade", "Gases", "Propriedades coligativas"],
  "3em": ["Química orgânica", "Funções orgânicas", "Isomeria", "Reações orgânicas", "Polímeros", "Petróleo", "Química ambiental", "Estequiometria", "Eletroquímica aplicada", "Revisão ENEM"],
};

const physics: Record<SchoolYear, string[]> = {
  "6ef": [], "7ef": [], "8ef": [], "9ef": [],
  "1em": ["Grandezas físicas", "Cinemática", "Movimento uniforme", "Movimento variado", "Vetores", "Leis de Newton", "Forças", "Trabalho", "Energia", "Quantidade de movimento"],
  "2em": ["Hidrostática", "Gravitação", "Termologia", "Calorimetria", "Termodinâmica", "Ondulatória", "Som", "Óptica geométrica", "Espelhos", "Lentes"],
  "3em": ["Eletrostática", "Campo elétrico", "Potencial elétrico", "Eletrodinâmica", "Circuitos", "Magnetismo", "Eletromagnetismo", "Física moderna", "Energia e potência", "Revisão ENEM"],
};

const philosophy: Record<SchoolYear, string[]> = {
  "6ef": [], "7ef": [], "8ef": [], "9ef": [],
  "1em": ["Origem da filosofia", "Mito e razão", "Pré-socráticos", "Sócrates", "Platão", "Aristóteles", "Lógica", "Ética antiga", "Filosofia helenística", "Conhecimento"],
  "2em": ["Filosofia medieval", "Renascimento", "Racionalismo", "Empirismo", "Iluminismo", "Kant", "Filosofia política", "Contrato social", "Ética moderna", "Ciência e método"],
  "3em": ["Marx", "Nietzsche", "Existencialismo", "Escola de Frankfurt", "Ética contemporânea", "Biopolítica", "Democracia", "Direitos humanos", "Tecnologia e sociedade", "Filosofia no ENEM"],
};

const sociology: Record<SchoolYear, string[]> = {
  "6ef": [], "7ef": [], "8ef": [], "9ef": [],
  "1em": ["Imaginação sociológica", "Socialização", "Cultura", "Etnocentrismo", "Identidade", "Instituições sociais", "Durkheim", "Marx", "Weber", "Métodos de pesquisa"],
  "2em": ["Trabalho", "Capitalismo", "Classes sociais", "Desigualdade", "Poder", "Estado", "Cidadania", "Democracia", "Movimentos sociais", "Mídia"],
  "3em": ["Globalização", "Indústria cultural", "Racismo", "Gênero", "Juventude", "Violência", "Educação", "Meio ambiente", "Tecnologia", "Sociologia no ENEM"],
};

const curriculumBySubject: Record<SchoolSubject, Record<SchoolYear, string[]>> = { portuguese, math, english, science, biology, chemistry, physics, history, geography, philosophy, sociology };

export function yearLabel(year: SchoolYear) { return schoolYears.find((item) => item.id === year)?.label ?? year; }
export function isHighSchool(year?: SchoolYear | null) { return Boolean(year && schoolYears.find((item) => item.id === year)?.stage === "medio"); }
export function subjectsForYear(year: SchoolYear): SchoolSubject[] { return (Object.keys(schoolSubjectMeta) as SchoolSubject[]).filter((subject) => curriculumBySubject[subject][year].length > 0); }
export function topicsFor(year: SchoolYear, subject: SchoolSubject) { return curriculumBySubject[subject][year] ?? []; }

export type SchoolQuestion = { id: string; year: SchoolYear; subject: SchoolSubject; topic: string; number: number; prompt: string; guide: string; written: true };

const promptSets: Record<"language" | "math" | "science" | "humanities", string[]> = {
  language: ["Explique com suas palavras o que você aprendeu sobre {topic}.", "Crie um exemplo correto que use {topic}.", "Escreva uma regra importante de {topic} e mostre como aplicá-la.", "Crie uma frase ou pequeno trecho relacionado a {topic}.", "Qual erro um estudante costuma cometer em {topic}? Corrija-o.", "Compare {topic} com outro conteúdo parecido.", "Identifique três elementos importantes de {topic}.", "Como {topic} pode aparecer em um texto ou situação real?", "Elabore uma pergunta sobre {topic} e responda-a.", "Faça um resumo de três linhas sobre {topic}."],
  math: ["Explique a ideia principal de {topic} e dê um exemplo.", "Crie um problema simples envolvendo {topic} e resolva-o.", "Mostre um cálculo ou representação que use {topic}.", "Descreva passo a passo como resolver uma questão de {topic}.", "Qual erro de cálculo é comum em {topic}? Mostre a correção.", "Relacione {topic} a uma situação do cotidiano.", "Crie uma questão de {topic} com quatro alternativas e indique a correta.", "Compare dois métodos possíveis para trabalhar com {topic}.", "Explique como conferir se uma resposta de {topic} está correta.", "Resolva um exemplo de {topic} e justifique cada etapa."],
  science: ["Defina {topic} com suas palavras.", "Explique como funciona um processo relacionado a {topic}.", "Dê um exemplo real de {topic}.", "Liste três elementos importantes para entender {topic}.", "Relacione causa e consequência em {topic}.", "Explique uma aplicação de {topic} no cotidiano.", "Qual erro de compreensão é comum em {topic}? Corrija-o.", "Compare {topic} com outro fenômeno estudado.", "Crie uma hipótese ou pergunta investigativa sobre {topic}.", "Faça um resumo de três linhas sobre {topic}."],
  humanities: ["Explique {topic} com suas palavras.", "Apresente uma causa relacionada a {topic}.", "Apresente uma consequência relacionada a {topic}.", "Dê um exemplo ou acontecimento ligado a {topic}.", "Compare {topic} com outro processo estudado.", "Explique a importância de {topic} para compreender a sociedade.", "Identifique grupos, lugares ou ideias envolvidos em {topic}.", "Relacione {topic} a uma situação atual.", "Crie uma pergunta crítica sobre {topic} e responda-a.", "Faça um resumo de três linhas sobre {topic}."],
};

function questionCategory(subject: SchoolSubject): keyof typeof promptSets {
  if (subject === "portuguese" || subject === "english") return "language";
  if (subject === "math") return "math";
  if (["science", "biology", "chemistry", "physics"].includes(subject)) return "science";
  return "humanities";
}

export function schoolQuestions(year: SchoolYear, subject: SchoolSubject): SchoolQuestion[] {
  const topics = topicsFor(year, subject);
  const prompts = promptSets[questionCategory(subject)];
  return topics.flatMap((topic, topicIndex) => prompts.map((template, promptIndex) => ({
    id: `school-${year}-${subject}-${String(topicIndex * 10 + promptIndex + 1).padStart(3, "0")}`,
    year, subject, topic, number: topicIndex * 10 + promptIndex + 1,
    prompt: template.replaceAll("{topic}", topic),
    guide: `Sua resposta precisa mostrar a ideia central de ${topic}, usar linguagem adequada ao ${yearLabel(year)} e trazer explicação ou exemplo concreto.`,
    written: true as const,
  })));
}
