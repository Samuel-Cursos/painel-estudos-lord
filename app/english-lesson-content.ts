export type EnglishLessonContent = {
  concept: string;
  vocabulary: Array<{ english: string; portuguese: string }>;
  model: string[];
  practice: string[];
};

export const englishLessonContent: Record<string, EnglishLessonContent> = {
  "english-01": {
    concept: "Uma frase básica em inglês costuma seguir sujeito + verbo + complemento. Use “I am” para falar de quem você é e “I live” para dizer onde mora.",
    vocabulary: [{ english: "My name is…", portuguese: "Meu nome é…" }, { english: "I am … years old.", portuguese: "Eu tenho … anos." }, { english: "I live in…", portuguese: "Eu moro em…" }, { english: "I am a student.", portuguese: "Eu sou estudante." }],
    model: ["Hello! My name is Ana.", "I am seventeen years old.", "I live in São Paulo.", "I am a student."],
    practice: ["Troque as informações do exemplo pelas suas.", "Fale as quatro frases sem ler e grave apenas para se ouvir."],
  },
  "english-02": {
    concept: "O verbo to be significa ser ou estar. Use am com I, is com he/she/it e are com you/we/they.",
    vocabulary: [{ english: "I am ready.", portuguese: "Eu estou pronto(a)." }, { english: "She is happy.", portuguese: "Ela está feliz." }, { english: "We are students.", portuguese: "Nós somos estudantes." }, { english: "They are at home.", portuguese: "Eles estão em casa." }],
    model: ["I am tired, but I am ready.", "He is my friend.", "You are very kind.", "We are in class."],
    practice: ["Complete: I ___ a student; she ___ my friend; they ___ here.", "Crie duas frases com cada forma: am, is e are."],
  },
  "english-03": {
    concept: "Na negativa, acrescente not depois do to be. Na pergunta, coloque am/is/are antes do sujeito: “Are you ready?”.",
    vocabulary: [{ english: "is not / isn’t", portuguese: "não é / não está" }, { english: "are not / aren’t", portuguese: "não são / não estão" }, { english: "Are you…?", portuguese: "Você é/está…?" }, { english: "Is she…?", portuguese: "Ela é/está…?" }],
    model: ["I am not late.", "He isn’t at school.", "Are they tired? Yes, they are.", "Is she a teacher? No, she isn’t."],
    practice: ["Transforme “They are busy” em negativa e pergunta.", "Responda com forma curta: Are you a student? Is your city big?"],
  },
  "english-04": {
    concept: "Para horários, diga primeiro a hora e depois os minutos: 7:30 = seven thirty. Datas usam números ordinais na fala: 22 August = the twenty-second of August.",
    vocabulary: [{ english: "What time is it?", portuguese: "Que horas são?" }, { english: "It is half past seven.", portuguese: "São sete e meia." }, { english: "today / tomorrow", portuguese: "hoje / amanhã" }, { english: "How much is it?", portuguese: "Quanto custa?" }],
    model: ["The class starts at eight fifteen.", "Today is Friday, the twenty-second of August.", "It costs thirty-five reais."],
    practice: ["Leia em voz alta: 6:10, 12:45, R$ 27 e R$ 99.", "Diga a data de hoje e o horário da próxima aula."],
  },
  "english-05": {
    concept: "O simple present descreve hábitos. Com I/you/we/they, use o verbo base. Com he/she/it, normalmente acrescente -s.",
    vocabulary: [{ english: "wake up", portuguese: "acordar" }, { english: "study", portuguese: "estudar" }, { english: "work", portuguese: "trabalhar" }, { english: "go to bed", portuguese: "ir dormir" }],
    model: ["I wake up at seven.", "I study in the morning.", "My brother works at night.", "She goes to bed at ten."],
    practice: ["Escreva seis frases sobre sua rotina.", "Troque I por he ou she e ajuste os verbos."],
  },
  "english-06": {
    concept: "Perguntas no simple present usam do ou does. Depois de does, o verbo volta à forma base: “Does she work?”, nunca “Does she works?”.",
    vocabulary: [{ english: "Do you study?", portuguese: "Você estuda?" }, { english: "Does he work?", portuguese: "Ele trabalha?" }, { english: "Yes, I do.", portuguese: "Sim." }, { english: "No, she doesn’t.", portuguese: "Não." }],
    model: ["Do you like music? Yes, I do.", "Does Ana live here? No, she doesn’t.", "What do you study?", "Where does he work?"],
    practice: ["Crie quatro perguntas com do e quatro com does.", "Entreviste alguém ou responda você mesmo com respostas curtas."],
  },
  "english-07": {
    concept: "Adjetivos possessivos mostram a quem algo pertence: my, your, his, her, our e their. Eles aparecem antes do substantivo.",
    vocabulary: [{ english: "mother / father", portuguese: "mãe / pai" }, { english: "sister / brother", portuguese: "irmã / irmão" }, { english: "his name", portuguese: "o nome dele" }, { english: "her family", portuguese: "a família dela" }],
    model: ["This is Julia. Her brother is Pedro.", "My parents live nearby.", "Their house is small.", "Our family likes music."],
    practice: ["Complete com my, his, her, our ou their.", "Descreva três pessoas sem incluir dados pessoais sensíveis."],
  },
  "english-08": {
    concept: "Use there is para uma coisa e there are para duas ou mais. Em negativas e perguntas, some/any ajudam a falar de quantidade indefinida.",
    vocabulary: [{ english: "There is a desk.", portuguese: "Há uma mesa." }, { english: "There are two chairs.", portuguese: "Há duas cadeiras." }, { english: "Is there…?", portuguese: "Há…?" }, { english: "Are there any…?", portuguese: "Há algum/alguns…?" }],
    model: ["There is a computer on the desk.", "There are some books here.", "There isn’t a television.", "Are there any windows?"],
    practice: ["Descreva um cômodo com quatro frases.", "Faça duas perguntas sobre o que existe nesse lugar."],
  },
  "english-09": {
    concept: "Can expressa habilidade ou possibilidade. Ele não muda com o sujeito e vem antes do verbo base: “She can swim”.",
    vocabulary: [{ english: "I can…", portuguese: "Eu consigo / sei…" }, { english: "I can’t…", portuguese: "Eu não consigo / sei…" }, { english: "Can you help me?", portuguese: "Você pode me ajudar?" }, { english: "Maybe", portuguese: "Talvez" }],
    model: ["I can code, but I can’t drive.", "She can speak English.", "Can you cook? Yes, I can.", "We can try again."],
    practice: ["Liste cinco habilidades e três coisas que ainda quer aprender.", "Pergunte “Can you…?” cinco vezes e responda."],
  },
  "english-10": {
    concept: "Em pedidos educados, prefira “I’d like…” ou “Could I have…?”. Acrescente please e finalize com thank you.",
    vocabulary: [{ english: "I’d like…", portuguese: "Eu gostaria de…" }, { english: "Could I have…?", portuguese: "Eu poderia pedir…?" }, { english: "Anything else?", portuguese: "Mais alguma coisa?" }, { english: "That’s all, thank you.", portuguese: "É só, obrigado(a)." }],
    model: ["Customer: Could I have a sandwich, please?", "Server: Of course. Anything else?", "Customer: I’d like some water.", "Server: Certainly."],
    practice: ["Troque os itens do diálogo por uma refeição sua.", "Leia os dois papéis em voz alta, alternando a entonação."],
  },
  "english-11": {
    concept: "Was e were são o passado de to be. Use was com I/he/she/it e were com you/we/they.",
    vocabulary: [{ english: "yesterday", portuguese: "ontem" }, { english: "last week", portuguese: "semana passada" }, { english: "I was tired.", portuguese: "Eu estava cansado(a)." }, { english: "We were at home.", portuguese: "Nós estávamos em casa." }],
    model: ["Yesterday was busy.", "I was at school in the morning.", "My friends were there too.", "We weren’t tired after class."],
    practice: ["Conte onde você estava em três momentos de ontem.", "Transforme duas frases em negativas e duas em perguntas."],
  },
  "english-12": {
    concept: "No past simple, verbos regulares recebem -ed. Perguntas e negativas usam did/didn’t + verbo base.",
    vocabulary: [{ english: "worked", portuguese: "trabalhou" }, { english: "studied", portuguese: "estudou" }, { english: "watched", portuguese: "assistiu" }, { english: "Did you…?", portuguese: "Você…?" }],
    model: ["I studied English yesterday.", "She worked in the afternoon.", "We didn’t watch television.", "Did you finish the task?"],
    practice: ["Escreva uma linha do tempo com seis ações concluídas.", "Crie uma negativa e uma pergunta usando did."],
  },
  "english-13": {
    concept: "Alguns verbos têm passado irregular e precisam ser aprendidos em pares. Depois de did/didn’t, use novamente a forma base.",
    vocabulary: [{ english: "go → went", portuguese: "ir → foi" }, { english: "have → had", portuguese: "ter → teve" }, { english: "do → did", portuguese: "fazer → fez" }, { english: "see → saw", portuguese: "ver → viu" }],
    model: ["I went to school.", "We had lunch together.", "She saw a good film.", "Did he go home?"],
    practice: ["Escreva uma frase real com went, had, did, made, got e saw.", "Transforme “She went home” em pergunta e negativa."],
  },
  "english-14": {
    concept: "Use am/is/are going to + verbo para planos e intenções já pensados.",
    vocabulary: [{ english: "I’m going to study.", portuguese: "Eu vou estudar." }, { english: "next week", portuguese: "na próxima semana" }, { english: "this weekend", portuguese: "neste fim de semana" }, { english: "What are you going to do?", portuguese: "O que você vai fazer?" }],
    model: ["I’m going to revise maths tonight.", "She is going to travel next month.", "We aren’t going to stop.", "Are they going to study?"],
    practice: ["Monte um plano de quatro frases para a próxima semana.", "Faça e responda três perguntas sobre planos."],
  },
  "english-15": {
    concept: "Adjetivos curtos costumam receber -er + than; adjetivos longos usam more. Alguns são irregulares: good → better, bad → worse.",
    vocabulary: [{ english: "bigger than", portuguese: "maior que" }, { english: "cheaper than", portuguese: "mais barato que" }, { english: "more interesting", portuguese: "mais interessante" }, { english: "better / worse", portuguese: "melhor / pior" }],
    model: ["A car is faster than a bicycle.", "This book is more interesting than that one.", "Today is better than yesterday."],
    practice: ["Compare dois cursos, cidades ou aparelhos em seis frases.", "Inclua pelo menos uma frase com better e uma com more."],
  },
  "english-16": {
    concept: "Preposições de lugar mostram a posição de algo. Observe a relação entre os objetos, não traduza a frase inteira.",
    vocabulary: [{ english: "in / on / under", portuguese: "dentro / sobre / embaixo" }, { english: "next to", portuguese: "ao lado de" }, { english: "between", portuguese: "entre" }, { english: "behind / in front of", portuguese: "atrás / na frente de" }],
    model: ["The keys are in the box.", "The phone is on the table.", "The chair is next to the desk.", "The car is behind the house."],
    practice: ["Posicione quatro objetos e descreva onde estão.", "Desenhe um mapa simples a partir de quatro frases em inglês."],
  },
  "english-17": {
    concept: "Direções usam verbos no imperativo: go, turn, cross. Para pedir ajuda, use “How do I get to…?”.",
    vocabulary: [{ english: "Go straight.", portuguese: "Siga em frente." }, { english: "Turn left / right.", portuguese: "Vire à esquerda / direita." }, { english: "Cross the street.", portuguese: "Atravesse a rua." }, { english: "It’s on your left.", portuguese: "Fica à sua esquerda." }],
    model: ["How do I get to the library?", "Go straight for two blocks.", "Turn right at the bank.", "It’s on your left."],
    practice: ["Explique o caminho entre dois lugares que conhece.", "Leia o modelo e desenhe o trajeto descrito."],
  },
  "english-18": {
    concept: "O present continuous descreve algo acontecendo agora: am/is/are + verbo-ing. Compare hábito (“I study”) com agora (“I am studying”).",
    vocabulary: [{ english: "right now", portuguese: "agora mesmo" }, { english: "studying", portuguese: "estudando" }, { english: "working", portuguese: "trabalhando" }, { english: "What are you doing?", portuguese: "O que você está fazendo?" }],
    model: ["I am studying right now.", "She is talking on the phone.", "They aren’t sleeping.", "What is he doing?"],
    practice: ["Descreva seis ações que estão acontecendo ao seu redor.", "Escreva três pares comparando rotina e ação de agora."],
  },
  "english-19": {
    concept: "No ENEM, primeiro identifique gênero, fonte, título e assunto. Depois use scanning para localizar nomes, números e palavras-chave; não traduza tudo.",
    vocabulary: [{ english: "headline", portuguese: "título/manchete" }, { english: "source", portuguese: "fonte" }, { english: "main idea", portuguese: "ideia principal" }, { english: "according to the text", portuguese: "de acordo com o texto" }],
    model: ["Title: Why cities need more trees", "Source: Environmental News", "Keywords: cities, trees, temperature", "Main idea: Trees help make cities cooler."],
    practice: ["Em 40 segundos, encontre título, fonte e três palavras-chave de um texto curto.", "Resuma a ideia principal em uma frase em português."],
  },
  "english-20": {
    concept: "Listening eficiente acontece em camadas: primeiro o assunto, depois palavras conhecidas e só então detalhes. Não pause a cada palavra.",
    vocabulary: [{ english: "main topic", portuguese: "assunto principal" }, { english: "key word", portuguese: "palavra-chave" }, { english: "speaker", portuguese: "falante" }, { english: "I heard…", portuguese: "Eu ouvi…" }],
    model: ["First listen: What is the topic?", "Second listen: Write five words.", "Third listen: Check names, times and places.", "Final answer: The speaker is talking about…"],
    practice: ["Ouça um áudio de até um minuto três vezes seguindo o modelo.", "Anote o que tem certeza e separe do que apenas imaginou."],
  },
  "english-21": {
    concept: "Para conversar com mais fluidez, prepare blocos curtos e corretos. Responda primeiro em uma frase e depois acrescente um detalhe.",
    vocabulary: [{ english: "What do you do?", portuguese: "O que você faz?" }, { english: "What do you like?", portuguese: "Do que você gosta?" }, { english: "In my free time…", portuguese: "No meu tempo livre…" }, { english: "How about you?", portuguese: "E você?" }],
    model: ["A: What do you do?", "B: I’m a student. I study in the morning.", "A: What do you like?", "B: I like technology. How about you?"],
    practice: ["Responda a cinco perguntas em até cinco segundos cada.", "Refaça as respostas acrescentando um detalhe e uma pergunta de volta."],
  },
  "english-22": {
    concept: "Interfaces usam verbos curtos no imperativo. Entender essas palavras ajuda a navegar, programar e interpretar mensagens de erro.",
    vocabulary: [{ english: "sign in / sign out", portuguese: "entrar / sair" }, { english: "settings", portuguese: "configurações" }, { english: "save changes", portuguese: "salvar alterações" }, { english: "error / update / deploy", portuguese: "erro / atualizar / publicar" }],
    model: ["Sign in to continue.", "Open settings and save changes.", "The update failed. Try again.", "Deployment completed successfully."],
    practice: ["Monte um glossário com vinte palavras de uma interface real.", "Explique em português quatro mensagens curtas sem tradutor."],
  },
  "english-23": {
    concept: "Palavras de tempo ajudam a escolher o verbo: every day pede presente, yesterday pede passado e next week costuma indicar futuro.",
    vocabulary: [{ english: "every day", portuguese: "todos os dias" }, { english: "yesterday", portuguese: "ontem" }, { english: "right now", portuguese: "agora" }, { english: "next week", portuguese: "semana que vem" }],
    model: ["I study every day.", "I studied yesterday.", "I am studying right now.", "I am going to study next week."],
    practice: ["Transforme cinco ações em presente, passado, agora e futuro.", "Sublinhe a palavra de tempo que justifica cada escolha."],
  },
  "english-24": {
    concept: "Uma apresentação clara conecta presente, rotina, uma experiência passada e planos. Use frases que você realmente entende e consegue explicar.",
    vocabulary: [{ english: "First, let me introduce myself.", portuguese: "Primeiro, vou me apresentar." }, { english: "Usually…", portuguese: "Normalmente…" }, { english: "Last year…", portuguese: "No ano passado…" }, { english: "In the future…", portuguese: "No futuro…" }],
    model: ["My name is Lucas and I am a student.", "I usually study in the morning and work on projects at night.", "Last year, I started learning English.", "In the future, I am going to work with technology."],
    practice: ["Escreva de 12 a 15 frases divididas em quatro blocos.", "Revise, fale por dois minutos e anote apenas três pontos para melhorar."],
  },
};
