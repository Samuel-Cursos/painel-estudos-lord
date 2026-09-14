import type { EnglishExercise } from "./english-course-data";

export const diagnosticQuestions = [
  { prompt: "She ___ a student.", options: ["are", "is", "am"], answer: "is", group: "Fundamentos", lesson: 2, why: "She combina com is." },
  { prompt: "Where ___ he work?", options: ["do", "is", "does"], answer: "does", group: "Fundamentos", lesson: 6, why: "Does + he + verbo base forma a pergunta." },
  { prompt: "I went to school yesterday. A ação é:", options: ["Passada", "Uma hipótese", "Futura"], answer: "Passada", group: "Fundamentos", lesson: 13, why: "Went é passado de go; yesterday situa a ação." },
  { prompt: "I have lived here ___ 2020.", options: ["for", "since", "yet"], answer: "since", group: "Comunicação", lesson: 26, why: "Since apresenta um ponto de início." },
  { prompt: "You don't have to bring food significa:", options: ["É proibido levar", "É obrigatório levar", "Não é obrigatório levar"], answer: "Não é obrigatório levar", group: "Comunicação", lesson: 28, why: "Don't have to indica ausência de obrigação." },
  { prompt: "If I had time, I ___ travel.", options: ["will", "would", "am"], answer: "would", group: "Comunicação", lesson: 32, why: "If + passado e would + verbo expressam hipótese." },
  { prompt: "Actually, the meeting is tomorrow. Actually significa:", options: ["Atualmente", "Na verdade", "Acidentalmente"], answer: "Na verdade", group: "Leitura", lesson: 38, why: "Actually corrige ou esclarece uma informação." },
  { prompt: "Qual expressão introduz contraste?", options: ["Therefore", "Because", "However"], answer: "However", group: "Leitura", lesson: 37, why: "However significa porém." },
  { prompt: "Attendance rose from 10 to 15. O aumento foi de:", options: ["5 participantes", "15 participantes", "5 pontos percentuais"], answer: "5 participantes", group: "Leitura", lesson: 42, why: "Subtraia 10 de 15; a unidade é participantes." },
  { prompt: "The findings may help some schools. A frase afirma que:", options: ["Todas serão ajudadas", "Há possibilidade de benefício para algumas", "Nenhuma será ajudada"], answer: "Há possibilidade de benefício para algumas", group: "Leitura crítica", lesson: 45, why: "May limita certeza; some limita o grupo." },
  { prompt: "Uma associação entre A e B, sozinha, demonstra que:", options: ["A sempre causa B", "B sempre causa A", "Há relação observada, sem causa necessariamente provada"], answer: "Há relação observada, sem causa necessariamente provada", group: "Leitura crítica", lesson: 44, why: "Associação não basta para estabelecer causalidade." },
  { prompt: "Escolha a construção correta.", options: ["Despite of the rain", "Although the rain", "Despite the rain"], answer: "Despite the rain", group: "Leitura crítica", lesson: 46, why: "Despite + substantivo, sem of. Although requer oração." },
];
export const sentencePuzzles = [
  "I usually study after work", "She does not work on Sundays", "We are going to visit the library", "I have never travelled by plane", "If it rains we will stay home", "The report was written by students", "Although it was difficult we continued", "The evidence suggests a possible benefit",
];
export const soundPairs = [
  { title: "ship / sheep", words: "ship. sheep. ship. sheep.", tip: "Compare /ɪ/ em ship e /iː/ em sheep. A diferença envolve qualidade da vogal, não apenas duração.", sentence: "The sheep is on the ship." },
  { title: "live / leave", words: "I live here. Please leave now.", tip: "Live (morar) tem /ɪ/; leave tem /iː/. Live como adjetivo em live music tem outra pronúncia: observe o contexto.", sentence: "I live here, but I leave early." },
  { title: "three / tree", words: "three. tree. three trees.", tip: "Em three, o /θ/ deixa o ar passar junto à língua e aos dentes. Tree começa com /t/. Pratique devagar sem forçar a boca.", sentence: "There are three trees." },
  { title: "vest / west", words: "vest. west. vest. west.", tip: "Em /v/, dentes superiores se aproximam do lábio inferior. Em /w/, arredonde os lábios sem esse contato.", sentence: "We went west wearing a vest." },
  { title: "thirteen / thirty", words: "thirteen. thirty. thirteen. thirty.", tip: "Ouça a sílaba forte, especialmente quando os números são ditos isoladamente. Em contexto, o destaque pode mudar; confirme números importantes.", sentence: "There are thirteen books and thirty pens." },
  { title: "O passado em -ed", words: "worked. played. wanted.", tip: "Compare worked /t/, played /d/ e wanted /ɪd/. Não acrescente uma sílaba extra a todo verbo regular.", sentence: "I worked, played and wanted to rest." },
];
export const conversationScenes = [
  { id: "cafe", title: "Pedido no café", level: "Começando", role: "Você é cliente. Faça um pedido, pergunte o preço e encerre com educação.", turns: [
    ["Good morning. What would you like?", "Cumprimente e peça uma bebida.", "Good morning. I'd like some tea, please."],
    ["Of course. Anything to eat?", "Peça um sanduíche ou recuse educadamente.", "A sandwich, please."],
    ["Anything else?", "Finalize e pergunte o preço.", "That's all, thank you. How much is it?"],
    ["It's five pounds altogether.", "Agradeça e encerre.", "Thank you. Have a nice day!"],
  ] },
  { id: "directions", title: "Como chegar à biblioteca", level: "Começando", role: "Peça direções e confirme o que entendeu. Use locais fictícios.", turns: [
    ["Hello. Can I help you?", "Pergunte como chegar à biblioteca.", "Yes, please. How do I get to the library?"],
    ["Go straight, then turn left at the bank.", "Peça para repetir mais devagar.", "Could you say that more slowly, please?"],
    ["Go straight. Turn left at the bank.", "Confirme a direção com suas palavras.", "So I turn left at the bank. Is that right?"],
    ["That's right. It's next to the museum.", "Agradeça.", "Thank you for your help."],
  ] },
  { id: "interview", title: "Entrevista de curso", level: "Ampliando", role: "Fale de seus interesses, de uma experiência e de um plano. Não inclua documentos ou dados pessoais.", turns: [
    ["Why are you interested in this course?", "Diga o interesse e uma razão.", "I'm interested in technology because I enjoy solving problems."],
    ["Can you tell me about a project you have worked on?", "Descreva uma experiência e sua contribuição.", "I helped build a study website. I organised the content."],
    ["What was difficult, and how did you deal with it?", "Reconheça uma dificuldade e uma ação concreta.", "Planning was difficult, so I divided the work into small tasks."],
    ["What would you like to learn next?", "Apresente um próximo objetivo.", "I'd like to improve my English so I can read more technical material."],
  ] },
  { id: "discussion", title: "Discordar com respeito", level: "Aprofundando", role: "Discuta estudo online. Reconheça vantagens, apresente um limite e proponha uma solução.", turns: [
    ["I think every lesson should be online. What do you think?", "Reconheça uma vantagem e apresente sua posição.", "Online lessons are convenient, but I think some students need another option."],
    ["But online lessons are easier to access, aren't they?", "Apresente um limite sem generalizar.", "For some people, yes. However, unreliable internet can make access difficult."],
    ["What would you suggest instead?", "Proponha uma alternativa concreta.", "We could offer downloadable materials as well as online activities."],
    ["How would we know whether that helps?", "Sugira uma avaliação, sem inventar resultados.", "We could test it for a month and ask students for feedback."],
  ] },
];

export const readingTexts: { id: string; genre: string; level: string; text: string; translation: string; question: EnglishExercise }[] = [
  { id: "notice", genre: "Aviso", level: "Começando", text: "Study room notice. From Monday, the quiet room will open at eight instead of nine. Food is not allowed, but you may bring water in a closed bottle. Please leave the tables tidy. Students who need to discuss group work should use the room next door.", translation: "A sala silenciosa abrirá às oito em vez de nove. Não é permitido comer, mas pode levar água em garrafa fechada. Deixe as mesas organizadas. Trabalhos em grupo devem ser discutidos na sala ao lado.", question: { id: "notice", skill: "Leitura", prompt: "O objetivo principal do aviso é:", options: ["Divulgar regras e uma mudança de horário", "Proibir o estudo em grupo na escola inteira", "Anunciar a venda de alimentos"], answers: ["Divulgar regras e uma mudança de horário"], hint: "Observe as instruções e a primeira frase.", explanation: "O aviso informa horário e uso da sala. Ele indica outro espaço para discussão, sem proibi-la em toda a escola." } },
  { id: "campaign", genre: "Campanha", level: "Ampliando", text: "Repair before you replace. A small tear does not have to mean the end of a favourite bag. Join our free repair afternoon on Saturday. Bring one clean item and learn a basic technique from a volunteer. We cannot repair every object, but we can share skills that may help you use things for longer.", translation: "Conserte antes de substituir. Um rasgo pequeno não precisa ser o fim de uma bolsa. Participe da tarde gratuita de reparos no sábado, com um item limpo. Não podemos consertar tudo, mas compartilhamos técnicas que podem aumentar o tempo de uso.", question: { id: "campaign", skill: "Leitura", prompt: "A campanha incentiva:", options: ["Descartar objetos imediatamente", "Aprender reparos para prolongar o uso", "Garantir conserto de qualquer produto"], answers: ["Aprender reparos para prolongar o uso"], hint: "Relacione o título com a última frase.", explanation: "A campanha incentiva reparo e aprendizagem, mas explicita que nem todo objeto pode ser consertado." } },
  { id: "opinion", genre: "Artigo de opinião", level: "Aprofundando", text: "A faster message is not always a better conversation. Digital tools let us contact people quickly, yet speed can encourage us to reply before we understand. The problem is not the existence of a screen. It is the habit of treating every pause as wasted time. Sometimes a thoughtful question does more for a conversation than an instant answer.", translation: "Uma mensagem mais rápida nem sempre melhora a conversa. Ferramentas digitais agilizam contato, mas podem incentivar resposta antes de compreensão. O problema não é a tela: é tratar pausas como perda de tempo. Uma pergunta cuidadosa pode ajudar mais que resposta instantânea.", question: { id: "opinion", skill: "Leitura", prompt: "A posição defendida é:", options: ["Toda tela deve ser eliminada", "Responder rapidamente sempre melhora a conversa", "A qualidade da interação também exige escuta e reflexão"], answers: ["A qualidade da interação também exige escuta e reflexão"], hint: "O autor distingue ferramenta e hábito.", explanation: "O texto critica a resposta automática e valoriza reflexão; não propõe eliminar todas as telas." } },
  { id: "report", genre: "Relato de pesquisa fictícia", level: "Aprofundando", text: "In a small voluntary survey, members of a reading club said they felt more confident discussing books after three meetings. The organiser welcomed the feedback but noted that people who disliked the club might not have answered. The survey describes the respondents' perceptions. It does not prove that the same result would occur in every school or that the club alone caused the change.", translation: "Numa pesquisa voluntária pequena, integrantes relataram mais confiança após três encontros. O organizador observou que quem não gostou pode não ter respondido. O levantamento descreve percepções e não prova universalidade nem causalidade exclusiva.", question: { id: "report", skill: "Leitura", prompt: "Qual conclusão respeita os limites do texto?", options: ["O clube garantiu confiança em todas as escolas", "Os respondentes relataram melhora, com limitações na amostra", "A pesquisa ouviu obrigatoriamente todos os alunos"], answers: ["Os respondentes relataram melhora, com limitações na amostra"], hint: "Observe voluntary, might e does not prove.", explanation: "A participação voluntária pode selecionar respondentes; o texto separa percepção relatada de comprovação causal." } },
];

export const writingProjects = [
  { id: "routine", title: "Minha rotina", range: "40–60 palavras", min: 40, max: 60, brief: "Apresente uma pessoa fictícia e descreva manhã, tarde e um hábito. Use simple present.", checks: ["Meu leitor entende quem é a pessoa.", "Os hábitos usam presente simples.", "Conferi he/she + -s e os horários."] },
  { id: "email", title: "E-mail sobre um curso", range: "60–90 palavras", min: 60, max: 90, brief: "Peça informações sobre horário, materiais e forma de participação em um curso fictício.", checks: ["Há saudação e encerramento.", "Minhas perguntas são claras e educadas.", "Não compartilhei dados pessoais."] },
  { id: "story", title: "Um imprevisto", range: "80–120 palavras", min: 80, max: 120, brief: "Narre um imprevisto fictício: cenário, acontecimento, reação e desfecho. Combine passado simples e contínuo.", checks: ["A ordem dos eventos é clara.", "Distingui cenário e acontecimento.", "O final se conecta ao início."] },
  { id: "argument", title: "Uma melhoria na escola", range: "120–160 palavras", min: 120, max: 160, brief: "Defenda uma melhoria: posição, razão, exemplo, objeção e proposta. Identifique como hipotético qualquer dado inventado.", checks: ["Minha posição tem justificativa.", "Considerei uma objeção real.", "Não apresentei hipótese como fato comprovado."] },
];

export const resourceLibrary = [
  { title: "British Council · Recursos por nível", url: "https://learnenglish.britishcouncil.org/free-resources", skill: "Todas", level: "Todos", task: "Filtre por nível e habilidade. Faça uma atividade; registre uma dificuldade e três expressões úteis." },
  { title: "British Council Teens · Habilidades", url: "https://learnenglishteens.britishcouncil.org/skills", skill: "Todas", level: "Começando", task: "Comece por A1/A2 se a base ainda estiver difícil. Ouça ou leia, responda e confira as explicações disponíveis." },
  { title: "VOA · Let's Learn English 1", url: "https://learningenglish.voanews.com/p/5644.html", skill: "Escuta", level: "Começando", task: "Assista a uma aula curta. Esta fonte usa inglês americano: compare com as vozes britânicas quando disponíveis." },
  { title: "British Council · Listening", url: "https://learnenglish.britishcouncil.org/free-resources/listening", skill: "Escuta", level: "Todos", task: "Escolha o nível. Primeiro identifique a situação, depois detalhes; só então consulte a transcrição." },
  { title: "British Council · Reading", url: "https://learnenglish.britishcouncil.org/free-resources/reading", skill: "Leitura", level: "Todos", task: "Identifique gênero e objetivo. Anote o trecho que sustenta cada resposta." },
  { title: "British Council · Writing", url: "https://learnenglish.britishcouncil.org/free-resources/writing", skill: "Escrita", level: "Todos", task: "Observe um modelo e sua organização. Feche o modelo e escreva uma versão original no laboratório." },
  { title: "British Council · Speaking", url: "https://learnenglish.britishcouncil.org/free-resources/speaking", skill: "Fala", level: "Todos", task: "Veja um diálogo. Repita duas falas e depois responda com informações fictícias diferentes." },
  { title: "British Council Teens · Preparação para provas", url: "https://learnenglishteens.britishcouncil.org/exams", skill: "Leitura", level: "Ampliando", task: "Escolha Reading exams. Pratique localizar evidências antes de olhar as alternativas." },
];
