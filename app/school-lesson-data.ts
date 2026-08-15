import { schoolSubjectMeta, topicsFor, yearLabel, type SchoolSubject, type SchoolYear } from "./school-data";

export type SchoolLesson = {
  id: string;
  year: SchoolYear;
  subject: SchoolSubject;
  number: number;
  topic: string;
  level: string;
  duration: string;
  objective: string;
  warmUp: string;
  reading: string[];
  sections: Array<{ title: string; paragraphs: string[] }>;
  visualBoard: { title: string; items: string[]; caption: string };
  workedSteps: string[];
  alternateReading: string[];
  keyPoints: string[];
  exampleTitle: string;
  example: string;
  guidedPractice: string[];
  commonMistake: string;
  exitTicket: string;
  videoSearchUrl: string;
  sourceLinks: Array<{ label: string; url: string }>;
  quiz: {
    prompt: string;
    options: string[];
    answer: number;
    explanation: string;
  };
};

export type SchoolLessonProgress = Record<string, { completedAt: string }>;

const levels = ["Nivelamento 1", "Nivelamento 2", "Base 1", "Base 2", "Evolução 1", "Evolução 2", "Aplicação 1", "Aplicação 2", "Domínio 1", "Domínio 2"];

type Content = {
  idea: string;
  mechanism: string;
  example: string;
  points: string[];
  mistake: string;
};

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function mathContent(topic: string): Content {
  const t = normalized(topic);
  if (/fracao/.test(t)) return { idea: "Frações representam partes iguais de um inteiro. O denominador mostra em quantas partes o todo foi dividido e o numerador indica quantas foram consideradas.", mechanism: "Para comparar frações, use o mesmo denominador ou transforme-as em números decimais. Nas operações, preserve o significado de cada parte antes de calcular.", example: "Em uma pizza dividida em 8 partes, comer 3 partes corresponde a 3/8. Como 4/8 = 1/2, quatro pedaços representam metade da pizza.", points: ["numerador: partes consideradas", "denominador: total de partes iguais", "frações equivalentes representam a mesma quantidade"], mistake: "Somar numerador com numerador e denominador com denominador. Em 1/2 + 1/2, o resultado é 1, e não 2/4 pelo procedimento errado." };
  if (/porcent|juros/.test(t)) return { idea: "Porcentagem é uma razão com base 100. Ela permite comparar descontos, aumentos e partes de quantidades diferentes usando a mesma referência.", mechanism: "Transforme a taxa em fração ou decimal e multiplique pelo valor total. Para aumentos e descontos, calcule a parte e depois some ou subtraia do valor inicial.", example: "20% de 150 = 0,20 × 150 = 30. Com desconto de 20%, o preço final fica 150 − 30 = 120.", points: ["10% é a décima parte", "100% representa o total", "a taxa sempre atua sobre um valor de referência"], mistake: "Aplicar a porcentagem ao valor errado. Em alterações sucessivas, cada taxa deve usar o valor daquele momento." };
  if (/equacao|sistema/.test(t)) return { idea: "Uma equação afirma que duas expressões têm o mesmo valor. Resolver é encontrar o número que mantém essa igualdade verdadeira.", mechanism: "Faça a mesma operação nos dois lados para isolar a incógnita. Em sistemas, procure valores que satisfaçam todas as equações ao mesmo tempo.", example: "3x + 5 = 20. Subtraindo 5 nos dois lados: 3x = 15. Dividindo por 3: x = 5. Conferência: 3 × 5 + 5 = 20.", points: ["igualdade funciona como uma balança", "operações inversas ajudam a isolar x", "substituir a resposta confirma o resultado"], mistake: "Trocar um termo de lado sem entender a operação inversa e errar o sinal." };
  if (/funcao/.test(t)) return { idea: "Função é uma regra que associa cada valor de entrada a um único valor de saída. Ela pode ser descrita por fórmula, tabela ou gráfico.", mechanism: "Identifique as variáveis, aplique a regra e observe como a saída muda. No gráfico, procure interceptos, crescimento, decrescimento e pontos importantes.", example: "Na função y = 2x + 3, quando x = 4, y = 11. O número 2 indica a variação de y para cada unidade acrescentada a x.", points: ["x costuma ser a entrada", "y depende de x", "tabela, fórmula e gráfico contam a mesma relação"], mistake: "Confundir o valor de entrada com o resultado ou analisar o gráfico sem conferir a escala dos eixos." };
  if (/area|perimetro|geometr|triangulo|circunferencia|poligono|angulo|volume|pitagoras|trigonom/.test(t)) return { idea: "A geometria descreve formas, medidas e posições. Cada grandeza responde a uma pergunta diferente: contorno, superfície, espaço ocupado ou relação entre lados e ângulos.", mechanism: "Desenhe a figura, marque as medidas com suas unidades e escolha a relação adequada. Separe figuras compostas em partes conhecidas quando necessário.", example: "Um retângulo de 6 cm por 4 cm tem perímetro 6+4+6+4 = 20 cm e área 6×4 = 24 cm². As unidades revelam que são medidas diferentes.", points: ["faça um desenho", "não misture perímetro, área e volume", "mantenha todas as medidas na mesma unidade"], mistake: "Usar fórmula sem identificar o que a questão pede ou esquecer unidades quadradas e cúbicas." };
  if (/probabilidade|combinatoria/.test(t)) return { idea: "Probabilidade mede a chance de um resultado acontecer. Ela compara casos favoráveis com todos os resultados possíveis quando eles têm a mesma chance.", mechanism: "Defina o experimento, liste o espaço amostral e conte os casos desejados. Em etapas sucessivas, verifique se os eventos são independentes.", example: "Em um dado comum, a chance de sair número par é 3/6 = 1/2, pois 2, 4 e 6 são três resultados favoráveis entre seis possíveis.", points: ["probabilidade varia de 0 a 1", "liste os resultados antes de contar", "evento impossível vale 0 e evento certo vale 1"], mistake: "Contar casos favoráveis e esquecer de dividir pelo total de possibilidades." };
  if (/estatistica|media|grafico|tabela/.test(t)) return { idea: "Estatística organiza dados para revelar padrões. Tabelas e gráficos ajudam a comparar valores; média, mediana e moda resumem conjuntos de maneiras diferentes.", mechanism: "Leia título, fonte, eixos, legenda e unidade antes de calcular. Depois escolha a medida que realmente responde à pergunta.", example: "Nos valores 4, 6, 6 e 8, a média é 6, a mediana é 6 e a moda é 6. Em outros conjuntos essas medidas podem ser diferentes.", points: ["leia a escala do gráfico", "média = soma ÷ quantidade", "uma medida isolada não conta toda a história"], mistake: "Olhar apenas o desenho do gráfico e ignorar que o eixo pode começar em outro valor." };
  if (/potencia|radicia|notacao cientifica|logarit|progressao|sequencia/.test(t)) return { idea: "Este conteúdo descreve padrões numéricos e formas compactas de representar repetições ou grandezas. A regra precisa ser entendida antes da manipulação dos símbolos.", mechanism: "Identifique a base, o expoente, a razão ou o padrão. Reescreva os primeiros termos e use as propriedades somente depois de reconhecer a estrutura.", example: "2³ significa 2×2×2 = 8. Já √81 = 9 porque 9² = 81. Uma operação pode desfazer a outra.", points: ["leia o significado dos símbolos", "observe o padrão", "confira o resultado pela operação inversa"], mistake: "Aplicar propriedades de potências em somas, onde elas não valem da mesma forma que em produtos." };
  return { idea: `${topic} desenvolve a capacidade de representar quantidades, reconhecer relações e justificar resultados, não apenas decorar contas.`, mechanism: "Leia o problema, destaque os dados e a pergunta, escolha uma representação, calcule e confira se a resposta faz sentido no contexto.", example: "Se um problema informa 4 grupos com 6 elementos, podemos representar por 6+6+6+6 ou 4×6, chegando a 24 elementos.", points: ["entenda o que é pedido", "registre o raciocínio", "confira pela estimativa ou operação inversa"], mistake: "Começar a calcular antes de identificar quais dados são úteis e qual pergunta precisa ser respondida." };
}

function languageContent(subject: SchoolSubject, topic: string): Content {
  const t = normalized(topic);
  if (subject === "english") {
    if (/to be|past of verb/.test(t)) return { idea: "O verb to be expressa identidade, estado, característica ou localização. No presente usamos am, is e are; no passado, was e were.", mechanism: "Escolha a forma de acordo com o sujeito. Para negar, acrescente not; para perguntar, coloque o verbo antes do sujeito.", example: "I am a student. She is tired. They are at school. Pergunta: Are they at school? Negativa: They are not at school.", points: ["I am", "he/she/it is", "you/we/they are"], mistake: "Usar is com todos os sujeitos ou acrescentar do/does em perguntas que já usam o verb to be." };
    if (/simple present|daily routine|frequency/.test(t)) return { idea: "O simple present descreve rotinas, hábitos e fatos. A forma do verbo muda principalmente com he, she e it.", mechanism: "Use a forma base com I/you/we/they e normalmente acrescente -s com he/she/it. Perguntas usam do ou does.", example: "I study every day. She studies every day. Do you study? Does she study?", points: ["he/she/it geralmente recebe -s", "do/does formam perguntas", "advérbios mostram frequência"], mistake: "Manter o -s no verbo depois de does: o correto é Does she study?, não Does she studies?" };
    if (/past|regular|irregular/.test(t)) return { idea: "O simple past fala de ações concluídas. Verbos regulares costumam receber -ed; verbos irregulares possuem formas próprias.", mechanism: "Use a forma passada na afirmativa. Com did em perguntas e negativas, o verbo volta à forma base.", example: "We visited the park. She went home. Did she go home? She did not go home.", points: ["-ed nos regulares", "lista própria para irregulares", "did + forma base"], mistake: "Usar passado duas vezes, como Did she went? O correto é Did she go?" };
    if (/future|will|going to/.test(t)) return { idea: "Will costuma expressar decisão, previsão ou promessa; going to costuma indicar plano ou evidência presente.", mechanism: "Use will + verbo base ou am/is/are + going to + verbo base.", example: "I will help you. We are going to study tonight.", points: ["will não muda com o sujeito", "going to precisa do verb to be", "o verbo principal fica na forma base"], mistake: "Esquecer am/is/are antes de going to." };
    if (/reading|text|skimming|scanning|cognate|inference|purpose|irony|visual|reference/.test(t)) return { idea: "Compreender inglês não exige traduzir tudo. Título, imagens, palavras conhecidas, cognatos, repetições e contexto revelam assunto e intenção.", mechanism: "Primeiro faça uma leitura rápida para a ideia geral; depois procure informações específicas e confirme cada resposta no texto.", example: "Em um anúncio com price, discount e buy now, mesmo sem entender cada palavra, reconhecemos a intenção de vender um produto.", points: ["observe gênero e fonte", "procure palavras-chave", "volte ao trecho que comprova a resposta"], mistake: "Escolher uma alternativa apenas porque ela repete uma palavra do texto, sem verificar o sentido." };
    return { idea: `${topic} amplia o vocabulário e as estruturas usadas para compreender e produzir mensagens simples em inglês.`, mechanism: "Associe palavra, significado, pronúncia e uso em uma frase. Depois varie o sujeito ou o contexto para testar se aprendeu.", example: "Aprenda em bloco: school bag = mochila escolar. Frase: My school bag is blue.", points: ["leia em contexto", "forme uma frase própria", "revise falando e escrevendo"], mistake: "Memorizar uma tradução isolada sem saber empregar a palavra em uma frase." };
  }
  if (/leitura|interpret|inferencia|tema|informacao/.test(t)) return { idea: "Ler é construir sentido usando o que o texto diz, a forma como diz e os conhecimentos do leitor. Informação explícita aparece diretamente; inferência nasce de pistas.", mechanism: "Identifique gênero, tema, finalidade e voz. Depois localize trechos que sustentem sua interpretação.", example: "Se o personagem entra encharcado e fecha o guarda-chuva, podemos inferir que chovia, mesmo sem essa frase aparecer.", points: ["tema é o assunto central", "inferência precisa de pista", "a resposta deve ser comprovada pelo texto"], mistake: "Responder somente pela opinião pessoal e ignorar as evidências presentes no texto." };
  if (/substant|adjetiv|pronome|artigo|numeral|classe/.test(t)) return { idea: "As classes de palavras exercem funções diferentes: nomeiam, caracterizam, determinam, substituem ou quantificam elementos do enunciado.", mechanism: "Analise a palavra dentro da frase. A mesma forma pode desempenhar papéis diferentes conforme o contexto.", example: "Em 'Aquela menina curiosa leu dois livros', menina é substantivo, curiosa é adjetivo, aquela é pronome e dois é numeral.", points: ["observe a função no contexto", "relacione palavras ao núcleo", "teste a substituição"], mistake: "Classificar pela aparência da palavra sem analisar o papel que ela cumpre na frase." };
  if (/verbo|tempo verbal|voz/.test(t)) return { idea: "Verbos organizam ações, estados e fenômenos no tempo. Pessoa, número, tempo, modo e voz ajudam a entender quem participa e como o fato é apresentado.", mechanism: "Localize o verbo, identifique o sujeito e observe marcas de tempo. Compare a forma verbal com as outras informações do texto.", example: "Em 'Os alunos estudaram ontem', estudaram indica ação passada e concorda com o sujeito plural.", points: ["verbo situa o processo", "concorda com o sujeito", "tempo verbal contribui para o sentido"], mistake: "Olhar apenas a terminação do verbo e ignorar o contexto temporal da frase." };
  if (/sujeito|predicado|oracao|sintaxe|termo|concordancia|regencia|crase/.test(t)) return { idea: "A sintaxe estuda como os termos se relacionam na oração. Essas relações explicam concordância, complementação e organização das ideias.", mechanism: "Encontre o verbo, pergunte quem ou o que se relaciona a ele e identifique os complementos. Depois analise as ligações entre as orações.", example: "Em 'As novas regras ajudaram os estudantes', 'As novas regras' é o sujeito e o verbo concorda no plural.", points: ["comece pelo verbo", "localize o núcleo", "justifique a relação entre os termos"], mistake: "Achar que o sujeito é sempre a primeira palavra ou a pessoa que pratica uma ação." };
  if (/pontuacao|coesao|coerencia|conjunc|conector/.test(t)) return { idea: "Pontuação e conectores orientam a leitura e mostram relações como causa, oposição, conclusão, explicação e sequência.", mechanism: "Leia o período inteiro e pergunte qual relação existe entre as ideias. Escolha o sinal ou conector que torna essa relação clara.", example: "Estudou com atenção; portanto, resolveu a atividade. 'Portanto' introduz uma conclusão.", points: ["pontuação produz sentido", "conectores ligam ideias", "coesão ajuda o texto a avançar"], mistake: "Colocar vírgulas apenas onde se faz pausa na fala, sem observar a estrutura da oração." };
  if (/redacao|dissert|argument|opiniao|producao|projeto de texto|intervencao/.test(t)) return { idea: "Produzir um texto exige objetivo, leitor e organização. Na argumentação, a tese responde ao problema e cada parágrafo precisa desenvolvê-la com razões e evidências.", mechanism: "Planeje tese, argumentos, exemplos e conclusão antes de escrever. Depois revise clareza, conexão e adequação linguística.", example: "Tese: ampliar bibliotecas escolares melhora a aprendizagem. Argumento: o acesso frequente a diferentes textos fortalece leitura e repertório.", points: ["planeje antes de escrever", "um parágrafo desenvolve uma ideia central", "revise conteúdo e forma"], mistake: "Repetir a mesma opinião com palavras diferentes sem explicar por quê ou apresentar evidências." };
  if (/trovador|humanismo|classic|romant|realismo|naturalismo|parnas|simbol|modernismo|literatura/.test(t)) return { idea: `${topic} deve ser entendido como produção artística ligada a um contexto histórico, a escolhas de linguagem e a formas de enxergar o ser humano e a sociedade.`, mechanism: "Relacione contexto, características, autores e efeitos no texto. Em vez de decorar listas, procure evidências em trechos.", example: "Ao analisar um poema, observe eu lírico, imagens, ritmo e visão de mundo; depois ligue esses elementos ao movimento literário.", points: ["contexto histórico", "características no texto", "efeitos de linguagem"], mistake: "Decorar datas e características sem conseguir reconhecê-las em um texto real." };
  return { idea: `${topic} ajuda a compreender como a língua organiza sentidos em diferentes situações de comunicação.`, mechanism: "Observe exemplos reais, identifique o padrão e explique o efeito produzido. Depois crie um exemplo próprio.", example: "Compare duas frases ou dois pequenos textos e marque o que mudou na forma e no sentido.", points: ["analise o contexto", "use evidências", "produza um exemplo próprio"], mistake: "Decorar uma definição sem conseguir reconhecer ou usar o conteúdo em uma frase ou texto." };
}

function scienceContent(subject: SchoolSubject, topic: string): Content {
  const t = normalized(topic);
  if (/celula|citologia|organela|membrana|divisao celular|histologia/.test(t)) return { idea: "A célula é a unidade básica dos seres vivos. Suas estruturas trabalham de forma integrada para obter matéria e energia, produzir substâncias e manter o organismo.", mechanism: "Relacione cada estrutura à sua função e compare tipos celulares. Em organismos pluricelulares, células especializadas formam tecidos e órgãos.", example: "A membrana plasmática controla trocas com o meio; mitocôndrias participam da respiração celular e ribossomos produzem proteínas.", points: ["estrutura e função", "trocas com o ambiente", "níveis de organização"], mistake: "Imaginar a célula como um desenho parado e não como um sistema com processos simultâneos." };
  if (/ecologia|ecossistema|cadeia|biodiversidade|ambient|bioma|ciclo biogeo|populacao/.test(t)) return { idea: "Ecologia investiga relações entre seres vivos e ambiente. Matéria circula nos ecossistemas, enquanto a energia flui principalmente a partir do Sol.", mechanism: "Identifique fatores bióticos e abióticos, níveis tróficos e efeitos de mudanças em uma parte do sistema.", example: "Se uma população de predadores diminui, suas presas podem aumentar e pressionar os produtores, alterando toda a teia alimentar.", points: ["relações são interdependentes", "energia diminui entre níveis tróficos", "impactos podem produzir efeitos em cadeia"], mistake: "Analisar uma espécie isoladamente e ignorar suas relações com outras espécies e com o ambiente." };
  if (/genet|mendel|dna|biotecnologia|evolucao|selecao natural/.test(t)) return { idea: "Genética estuda herança e variação; evolução explica mudanças em populações ao longo das gerações. O ambiente seleciona variações, não cria características porque um indivíduo precisa.", mechanism: "Diferencie gene, alelo, genótipo e fenótipo. Em evolução, observe variação, herança, reprodução diferencial e tempo.", example: "Em uma população com variação de cor, indivíduos mais camuflados podem deixar mais descendentes; a frequência dessa característica tende a crescer.", points: ["características têm base genética e ambiental", "populações evoluem", "seleção atua sobre variações existentes"], mistake: "Dizer que um indivíduo evoluiu durante a vida para se adaptar a uma necessidade." };
  if (/atomo|tabela periodica|ligacao|reacao|estequiometr|materia|mistura|solucao|concentracao|inorgan|organica|polaridade/.test(t)) return { idea: "A Química explica propriedades e transformações da matéria por meio da organização e das interações entre partículas.", mechanism: "Passe do que é observado no mundo macroscópico para modelos de partículas e representações químicas. Preserve os átomos ao representar reações.", example: "Ao dissolver sal em água, as partículas ficam dispersas e formam uma mistura homogênea; numa reação, novas substâncias são formadas.", points: ["propriedade depende da estrutura", "modelos explicam observações", "átomos são conservados nas reações"], mistake: "Confundir mudança física com reação química ou interpretar modelos de partículas como fotografias literais." };
  if (/movimento|cinematica|forca|newton|trabalho|energia|potencia|eletric|circuito|onda|som|luz|optica|calor|temperatura|termo|hidrostat|gravita/.test(t)) return { idea: "A Física cria modelos para descrever movimentos, forças, energia, ondas, calor e interações elétricas. Grandezas e unidades permitem comparar previsões com medidas.", mechanism: "Defina o sistema, registre dados com unidades, escolha o princípio físico e verifique se o resultado é coerente.", example: "Se um objeto percorre 120 m em 20 s com movimento uniforme, sua velocidade média é 120÷20 = 6 m/s.", points: ["desenhe a situação", "use unidades", "diferencie causa, efeito e medida"], mistake: "Escolher uma fórmula apenas pelas letras e substituir números sem interpretar as grandezas." };
  if (/sistema digest|respir|circul|nervoso|endocrino|reproducao|saude|alimentacao|nutriente|imunologia|doenca/.test(t)) return { idea: "O corpo funciona pela integração de sistemas. Nutrientes e oxigênio chegam às células, resíduos são removidos e sinais coordenam respostas e equilíbrio interno.", mechanism: "Acompanhe o caminho da matéria ou da informação e relacione órgão, função e cuidado de saúde baseado em evidências.", example: "O sistema digestório obtém nutrientes, o respiratório realiza trocas gasosas e o circulatório transporta substâncias entre pulmões, tecidos e órgãos.", points: ["sistemas trabalham juntos", "estrutura se relaciona à função", "prevenção depende de informação confiável"], mistake: "Estudar cada órgão isoladamente e esquecer a cooperação entre os sistemas." };
  if (/agua|solo|atmosfera|sistema solar|microrganismo|virus|bacteria|fungo|planta|animal|seres vivos/.test(t)) return { idea: `${topic} faz parte de sistemas naturais que podem ser observados, comparados e explicados por evidências.`, mechanism: "Descreva as partes, identifique interações e diferencie observação, hipótese e conclusão.", example: "No ciclo da água, evaporação, condensação e precipitação transferem água entre superfície e atmosfera sem criar água nova.", points: ["observe padrões", "relacione partes e processos", "use evidências para concluir"], mistake: "Tratar uma explicação científica como opinião sem verificar observações e relações de causa e consequência." };
  return { idea: `${topic} é estudado pela observação de fenômenos, construção de modelos e análise de evidências.`, mechanism: "Comece com uma pergunta, identifique variáveis, compare dados e formule uma explicação que possa ser testada.", example: "Organize uma tabela com observações, procure um padrão e proponha uma explicação compatível com os dados.", points: ["pergunta clara", "evidência observável", "conclusão compatível com os dados"], mistake: "Chegar a uma conclusão antes de observar os dados ou confundir coincidência com causa." };
}

function humanitiesContent(subject: SchoolSubject, topic: string): Content {
  const t = normalized(topic);
  if (subject === "geography") {
    if (/mapa|cartografia|orientacao|escala|legenda|interpretacao cartografica/.test(t)) return { idea: "Mapas são representações seletivas do espaço. Título, legenda, orientação, escala, projeção e fonte mostram o que foi representado e como interpretar.", mechanism: "Leia primeiro os elementos do mapa; depois localize, compare distribuições e transforme distâncias quando houver escala.", example: "Na escala 1:100.000, 1 cm no mapa corresponde a 100.000 cm, isto é, 1 km no terreno.", points: ["mapa não é o território", "legenda explica símbolos", "escala relaciona mapa e realidade"], mistake: "Comparar áreas ou distâncias sem conferir escala e projeção." };
    if (/paisagem|lugar|territorio|espaco/.test(t)) return { idea: "Paisagem é o conjunto percebido; lugar envolve vivência e identidade; território envolve poder e controle; espaço geográfico resulta da relação sociedade-natureza.", mechanism: "Observe formas, funções, agentes e mudanças ao longo do tempo, distinguindo elementos naturais e sociais.", example: "Uma praça é paisagem observável, lugar para quem cria vínculos e parte de um território administrado pelo município.", points: ["conceitos se relacionam", "espaço muda no tempo", "diferentes grupos atribuem sentidos diferentes"], mistake: "Tratar paisagem apenas como natureza bonita e ignorar construções, trabalho e relações sociais." };
    if (/clima|relevo|hidrograf|vegetacao|bioma|ambient|energia|recurso natural/.test(t)) return { idea: "Os componentes naturais interagem entre si e com a sociedade. Uso do solo, água, energia e vegetação produz benefícios, riscos e conflitos.", mechanism: "Relacione localização, processo natural, forma de uso e consequências sociais e ambientais.", example: "Retirar vegetação de encostas pode aumentar erosão e risco de deslizamento durante chuvas intensas.", points: ["natureza e sociedade interagem", "impactos são distribuídos de forma desigual", "prevenção exige planejamento"], mistake: "Explicar um problema ambiental por uma única causa e desconsiderar decisões econômicas e políticas." };
    return { idea: `${topic} ajuda a compreender como populações, economia, redes e poder organizam e transformam o espaço geográfico.`, mechanism: "Analise onde ocorre, por que ocorre ali, quais agentes participam, como mudou e quais consequências aparecem em diferentes escalas.", example: "Uma nova indústria altera empregos, transportes, moradia e ambiente tanto no município quanto em redes mais amplas.", points: ["localização", "agentes e interesses", "escalas local, regional e global"], mistake: "Decorar nomes e localizações sem explicar processos e relações espaciais." };
  }
  if (subject === "history") return { idea: `${topic} deve ser compreendido em seu tempo, por meio de fontes e das experiências de diferentes grupos. História explica mudanças e permanências; não é somente uma lista de datas.`, mechanism: "Localize período e espaço, examine fontes, identifique sujeitos históricos, causas, conflitos, consequências e diferentes interpretações.", example: `Para estudar ${topic}, construa uma linha do tempo curta e pergunte: quem participou, quais interesses estavam em disputa e o que mudou para cada grupo?`, points: ["contexto de tempo e espaço", "fontes e pontos de vista", "causas, consequências, mudanças e permanências"], mistake: "Julgar o passado somente com valores atuais ou apresentar uma única causa para um processo complexo." };
  if (subject === "philosophy") return { idea: `${topic} é uma oportunidade de formular problemas, definir conceitos e avaliar argumentos. Filosofar não é apenas dar opinião: é apresentar razões e enfrentar objeções.`, mechanism: "Identifique a pergunta central, reconstrua a resposta do pensador, examine as razões e compare com uma posição diferente.", example: `Pergunta: que problema ${topic} tenta resolver? Responda com uma tese, uma razão que a sustente e uma possível objeção.`, points: ["clareza dos conceitos", "argumentos e razões", "comparação de posições"], mistake: "Resumir uma ideia filosófica a uma frase pronta sem explicar o argumento que a sustenta." };
  return { idea: `${topic} mostra como relações sociais, cultura, trabalho, instituições e poder influenciam escolhas individuais e experiências coletivas.`, mechanism: "Transforme o tema em pergunta sociológica, diferencie experiência pessoal de padrão social e use conceitos ou dados para explicar.", example: `Em ${topic}, compare duas situações sociais e investigue como instituições, normas e desigualdades afetam os resultados.`, points: ["indivíduo e sociedade", "instituições e relações de poder", "conceitos apoiados por exemplos ou dados"], mistake: "Tratar um problema social como resultado exclusivo das escolhas de uma pessoa, ignorando o contexto coletivo." };
}

function contentFor(subject: SchoolSubject, topic: string): Content {
  if (subject === "math") return mathContent(topic);
  if (subject === "portuguese" || subject === "english") return languageContent(subject, topic);
  if (["science", "biology", "chemistry", "physics"].includes(subject)) return scienceContent(subject, topic);
  return humanitiesContent(subject, topic);
}

function categoryFor(subject: SchoolSubject) {
  if (subject === "math") return "math";
  if (subject === "portuguese" || subject === "english") return "language";
  if (["science", "biology", "chemistry", "physics"].includes(subject)) return "science";
  return "humanities";
}

function completeSections(subject: SchoolSubject, topic: string, content: Content, year: SchoolYear) {
  const category = categoryFor(subject);
  const recognition: Record<string, string> = {
    math: `Em uma atividade de ${topic}, comece traduzindo o enunciado: marque os dados, a unidade de cada medida e o que precisa ser descoberto. Só depois escolha a operação, a fórmula ou a representação. O resultado final precisa responder à pergunta e ser compatível com a ordem de grandeza esperada.`,
    language: `Para reconhecer ${topic}, leia a frase ou o texto inteiro. Observe quem fala, para quem, com qual intenção e quais palavras ligam as ideias. Depois aponte um trecho como evidência. Uma análise de língua não se sustenta apenas em “eu acho”; ela precisa mostrar o efeito produzido no contexto.`,
    science: `Ao estudar ${topic}, separe três níveis: o que pode ser observado, o modelo usado para explicar e a evidência que apoia a conclusão. Diagramas e nomes ajudam, mas o principal é compreender o processo e como uma mudança em uma parte interfere nas demais.`,
    humanities: `Para compreender ${topic}, situe o assunto no tempo e no espaço, identifique grupos e interesses envolvidos e procure causas, consequências, mudanças e permanências. Compare pontos de vista: acontecimentos humanos raramente possuem uma explicação única.`,
  };
  const application: Record<string, string> = {
    math: `No cotidiano, ${topic} aparece quando precisamos comparar, medir, prever ou decidir. Uma boa solução mostra as etapas, mantém as unidades e termina com uma frase interpretando o número encontrado.`,
    language: `${topic} aparece em conversas, notícias, propagandas, livros, redes sociais e textos escolares. Saber identificar o recurso permite compreender melhor a mensagem e também escrever com mais clareza.`,
    science: `${topic} pode ser ligado a situações do corpo, do ambiente, da tecnologia ou dos materiais. Faça sempre a ponte entre o conceito e um fenômeno real; isso impede que a aula vire apenas uma lista de nomes.`,
    humanities: `${topic} ajuda a interpretar escolhas coletivas e problemas atuais. A comparação com o presente deve respeitar as diferenças de contexto e ser apoiada por fatos, conceitos ou fontes.`,
  };
  return [
    {
      title: "A ideia central, sem decorar",
      paragraphs: [
        content.idea,
        `O objetivo desta aula do ${yearLabel(year)} é entender o sentido de ${topic} e conseguir reconhecê-lo em uma situação nova. Decorar uma frase pode ajudar no começo, mas aprender de verdade significa explicar por que o conteúdo funciona e produzir um exemplo próprio.`,
      ],
    },
    {
      title: "Como o conteúdo funciona",
      paragraphs: [
        content.mechanism,
        `Organize o raciocínio nesta ordem: primeiro identifique o problema; depois conecte-o às ideias “${content.points.join("”, “")}"; por fim, confira se a explicação responde ao que foi pedido. Essa sequência é mais importante do que repetir uma definição pronta.`,
      ],
    },
    {
      title: "Como reconhecer em uma atividade",
      paragraphs: [recognition[category]],
    },
    {
      title: "Onde isso aparece de verdade",
      paragraphs: [application[category]],
    },
  ];
}

function workedStepsFor(subject: SchoolSubject, topic: string, content: Content) {
  const category = categoryFor(subject);
  const middle: Record<string, string> = {
    math: "Separe os dados e as unidades, escolha a representação e faça uma etapa de cada vez.",
    language: "Marque no texto as palavras ou construções que comprovam a análise e explique o efeito delas.",
    science: "Relacione estrutura, processo, causa e consequência usando a evidência apresentada.",
    humanities: "Localize tempo, espaço, sujeitos e interesses antes de explicar causas e consequências.",
  };
  return [
    `1. Leia a situação e diga, com suas palavras, o que precisa ser entendido sobre ${topic}.`,
    `2. ${middle[category]}`,
    `3. Use este modelo como referência: ${content.example}`,
    `4. Confira o resultado com a regra principal: ${content.points[0]}.`,
    "5. Termine explicando por que a resposta faz sentido, sem apenas repetir o enunciado.",
  ];
}

function sourcesFor(subject: SchoolSubject, topic: string, year: SchoolYear) {
  const channel = subject === "math" || ["science", "biology", "chemistry", "physics"].includes(subject)
    ? "Khan Academy Brasil"
    : subject === "english" ? "inglês aula português"
      : subject === "portuguese" ? "Português com Letícia"
        : "Brasil Escola";
  const query = encodeURIComponent(`${topic} ${yearLabel(year)} ${channel}`);
  return {
    video: `https://www.youtube.com/results?search_query=${query}`,
    links: [
      { label: "Currículo nacional · MEC/BNCC", url: "https://basenacionalcomum.mec.gov.br/" },
      { label: `Pesquisar material de apoio sobre ${topic}`, url: `https://www.google.com/search?q=${encodeURIComponent(`${topic} ${yearLabel(year)} material de estudo`)}` },
    ],
  };
}

function quizFor(subject: SchoolSubject, topic: string, content: Content, seed: number) {
  const category = categoryFor(subject);
  const distractors: Record<string, string[]> = {
    math: [
      "As unidades e o contexto podem ser ignorados quando a conta parece conhecida.",
      "Todo problema desse assunto é resolvido com a mesma operação.",
      "Depois do cálculo, não é necessário conferir se o resultado faz sentido.",
    ],
    language: [
      "O sentido depende apenas da opinião do leitor, sem precisar de pistas do texto.",
      "A função de uma palavra ou expressão nunca muda conforme o contexto.",
      "Revisar as relações entre as ideias não interfere na compreensão.",
    ],
    science: [
      "Uma conclusão científica é confiável mesmo quando não possui evidências.",
      "As partes de um sistema funcionam isoladamente e não afetam umas às outras.",
      "Observar dados é menos importante do que escolher primeiro a conclusão.",
    ],
    humanities: [
      "Todo processo histórico ou social possui uma única causa e um único ponto de vista.",
      "O contexto de tempo e espaço não muda a interpretação de um acontecimento.",
      "Uma opinião pessoal basta como explicação, mesmo sem conceitos ou evidências.",
    ],
  };
  const answer = seed % 4;
  const options = [...distractors[category]];
  options.splice(answer, 0, content.points[0]);
  return {
    prompt: `Qual alternativa apresenta uma ideia correta sobre ${topic}?`,
    options,
    answer,
    explanation: `A ideia correta é: ${content.points[0]}. Isso se relaciona ao conteúdo porque ${content.idea}`,
  };
}

export function lessonId(year: SchoolYear, subject: SchoolSubject, number: number) {
  return `school-lesson-${year}-${subject}-${String(number).padStart(2, "0")}`;
}

export function schoolLessons(year: SchoolYear, subject: SchoolSubject): SchoolLesson[] {
  return topicsFor(year, subject).map((topic, index) => {
    const content = contentFor(subject, topic);
    const name = schoolSubjectMeta[subject].name;
    const sources = sourcesFor(subject, topic, year);
    return {
      id: lessonId(year, subject, index + 1),
      year,
      subject,
      number: index + 1,
      topic,
      level: levels[index],
      duration: index < 2 ? "20–25 min" : index < 6 ? "25–35 min" : "35–45 min",
      objective: `Compreender ${topic}, reconhecer o conteúdo em situações do ${yearLabel(year)} e explicar o raciocínio com autonomia.`,
      warmUp: `Antes de começar: o que você já ouviu sobre ${topic}? Pense em uma situação, palavra, imagem ou problema que possa ter relação com esse assunto. Não precisa acertar; essa pergunta serve para ativar o que você já sabe.`,
      reading: [
        content.idea,
        content.mechanism,
        `Nesta aula de ${name}, você não precisa decorar tudo de uma vez. Leia uma parte, feche o texto e tente explicar com suas palavras. Se não conseguir, volte ao ponto exato e compare com o exemplo.`,
      ],
      sections: completeSections(subject, topic, content, year),
      visualBoard: {
        title: `Mapa da aula · ${topic}`,
        items: content.points,
        caption: `Leia da esquerda para a direita e tente explicar como as três ideias se conectam ao tema ${topic}.`,
      },
      workedSteps: workedStepsFor(subject, topic, content),
      alternateReading: [
        `Vamos recomeçar sem os nomes difíceis. Em linguagem direta: ${content.idea}`,
        `Imagine que você precisa ensinar ${topic} para alguém mais novo. Comece pelo caso concreto: ${content.example}`,
        `Agora ligue o exemplo à regra. O ponto “${content.points[0]}” explica a parte principal; “${content.points[1]}” mostra o que precisa ser observado; e “${content.points[2]}” ajuda a conferir se o raciocínio está completo.`,
        `Se ainda não ficou claro, volte ao exemplo e responda somente duas perguntas: o que aconteceu primeiro e por que o resultado mudou? Depois releia a explicação principal.`,
      ],
      keyPoints: content.points,
      exampleTitle: `Exemplo guiado · ${topic}`,
      example: content.example,
      guidedPractice: [
        `Explique em uma frase o que significa ${topic}.`,
        "Reproduza o exemplo sem olhar e diga por que cada etapa faz sentido.",
        `Crie um exemplo próprio de ${topic} adequado à sua série.`,
      ],
      commonMistake: content.mistake,
      exitTicket: `Sem consultar o texto, escreva ou fale: o que é ${topic}, qual é a ideia mais importante e onde ela pode aparecer em uma atividade?`,
      videoSearchUrl: sources.video,
      sourceLinks: sources.links,
      quiz: quizFor(subject, topic, content, index),
    };
  });
}

export function completedLessonCount(year: SchoolYear, subject: SchoolSubject, progress: SchoolLessonProgress) {
  return schoolLessons(year, subject).filter((lesson) => Boolean(progress[lesson.id]?.completedAt)).length;
}

export function unlockedLessonIndex(year: SchoolYear, subject: SchoolSubject, progress: SchoolLessonProgress) {
  const lessons = schoolLessons(year, subject);
  const firstPending = lessons.findIndex((lesson) => !progress[lesson.id]?.completedAt);
  return firstPending === -1 ? Math.max(0, lessons.length - 1) : firstPending;
}
