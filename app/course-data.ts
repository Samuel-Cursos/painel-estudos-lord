export type SubjectId = "english" | "math" | "portuguese" | "programming";

export type Lesson = {
  id: string;
  subject: SubjectId;
  number: number;
  week: number;
  title: string;
  duration: string;
  goal: string;
  steps: string[];
  result: string;
  chatPrompt: string;
  project?: string;
};

export type Subject = {
  id: SubjectId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
};

export const subjects: Subject[] = [
  { id: "english", name: "Inglês", shortName: "ING", icon: "EN", color: "#7c6cf2", description: "Do básico até conversar e entender textos simples." },
  { id: "math", name: "Matemática", shortName: "MAT", icon: "x²", color: "#e6a23c", description: "Base forte para escola, ENEM e programação." },
  { id: "portuguese", name: "Português", shortName: "POR", icon: "Aa", color: "#ed6f78", description: "Interpretação, escrita e gramática que realmente ajudam." },
  { id: "programming", name: "Programação", shortName: "DEV", icon: "</>", color: "#37b38c", description: "Aprender construindo projetos com o ChatGPT." },
];

type Topic = {
  title: string;
  goal: string;
  steps: string[];
  result: string;
};

const englishTopics: Topic[] = [
  { title: "Primeiras frases e apresentação", goal: "Dizer seu nome, idade, cidade e ocupação.", steps: ["Aprenda I, you, he, she, we e they.", "Leia: My name is Samuel. I am sixteen. I live in Votuporanga.", "Fale sua apresentação 3 vezes sem ler."], result: "Uma apresentação pessoal de 4 frases." },
  { title: "Verbo to be: am, is, are", goal: "Montar frases afirmativas no presente.", steps: ["Use am com I, is com he/she/it e are com you/we/they.", "Compare: I am tired. She is happy. They are students.", "Crie 8 frases sobre pessoas próximas."], result: "8 frases corretas com am, is e are." },
  { title: "To be: perguntas e negativas", goal: "Perguntar e negar usando o verbo to be.", steps: ["Negativa: am not, is not/isn't, are not/aren't.", "Pergunta: Are you...? Is he...?", "Responda 10 perguntas curtas com Yes/No."], result: "5 perguntas e 5 negativas." },
  { title: "Números, horas e datas", goal: "Entender preços, horários e datas.", steps: ["Revise números de 0 a 100.", "Pratique: It is seven thirty. Today is Monday.", "Leia em inglês 5 horários e 5 preços."], result: "Dizer a hora e a data atual em inglês." },
  { title: "Simple present: rotina", goal: "Falar sobre hábitos e rotina.", steps: ["Use I work, you study, we go.", "Com he/she, normalmente acrescente -s: she works.", "Escreva sua rotina da manhã em 6 frases."], result: "Sua rotina matinal em inglês." },
  { title: "Do e does", goal: "Fazer perguntas no simple present.", steps: ["Use do com I/you/we/they e does com he/she/it.", "Pratique: Do you study? Does she work?", "Monte e responda 8 perguntas."], result: "8 perguntas sobre hábitos." },
  { title: "Família e possessivos", goal: "Descrever relações e posse.", steps: ["Aprenda family, mother, father, sister, brother.", "Use my, your, his, her, our e their.", "Descreva 3 pessoas sem expor dados pessoais."], result: "Um parágrafo sobre sua família." },
  { title: "There is e there are", goal: "Descrever lugares e objetos.", steps: ["There is = há um; there are = há vários.", "Use a, an, some e any.", "Descreva seu quarto ou local de trabalho."], result: "8 frases descrevendo um ambiente." },
  { title: "Can e can't", goal: "Falar sobre habilidades e possibilidades.", steps: ["Use can + verbo sem to.", "Pratique: I can code. I can't drive.", "Faça perguntas com Can you...?"], result: "Lista de 5 habilidades e 3 metas." },
  { title: "Comida e pedidos", goal: "Pedir comida e entender itens básicos.", steps: ["Aprenda rice, beans, chicken, bread, water e juice.", "Use I would like... e Can I have...?", "Simule um pedido no restaurante."], result: "Um diálogo curto de atendimento." },
  { title: "Past simple: was e were", goal: "Falar sobre como algo estava no passado.", steps: ["Use was com I/he/she/it e were com you/we/they.", "Pratique yesterday, last week e last year.", "Conte como foi seu dia de ontem."], result: "6 frases sobre ontem." },
  { title: "Passado com verbos regulares", goal: "Contar ações concluídas.", steps: ["Use worked, studied, watched e played.", "Negativa e pergunta usam did/didn't + verbo base.", "Escreva uma pequena linha do tempo."], result: "Um relato de 8 frases no passado." },
  { title: "Verbos irregulares essenciais", goal: "Usar went, had, did, made, got e saw.", steps: ["Memorize 6 pares: go/went, have/had, do/did.", "Crie uma frase real com cada verbo.", "Misture regulares e irregulares em um relato."], result: "6 frases com verbos irregulares." },
  { title: "Future com going to", goal: "Falar de planos.", steps: ["Use am/is/are going to + verbo.", "Diga seus planos para estudo e carreira.", "Faça 5 perguntas sobre planos futuros."], result: "Seu plano da próxima semana em inglês." },
  { title: "Adjetivos e comparações", goal: "Comparar objetos, lugares e opções.", steps: ["Use bigger, cheaper, faster e more interesting.", "Aprenda better e worse.", "Compare dois celulares, cursos ou cidades."], result: "6 comparações úteis." },
  { title: "Preposições de lugar", goal: "Dar e entender localização.", steps: ["Aprenda in, on, under, next to, between e behind.", "Posicione objetos e descreva onde estão.", "Pratique com um mapa simples."], result: "Descrição de 8 posições." },
  { title: "Direções pela cidade", goal: "Pedir e dar direções.", steps: ["Aprenda turn left/right, go straight e cross.", "Use Where is...? e How do I get to...?", "Explique um caminho conhecido."], result: "Diálogo de localização." },
  { title: "Present continuous", goal: "Falar do que está acontecendo agora.", steps: ["Use am/is/are + verbo-ing.", "Compare I work every day com I am working now.", "Descreva 6 ações de uma cena."], result: "6 frases no present continuous." },
  { title: "Leitura: encontrar informação", goal: "Ler sem traduzir palavra por palavra.", steps: ["Leia primeiro título e palavras conhecidas.", "Procure nomes, datas e números.", "Resuma cada parágrafo em português."], result: "Resumo de um texto curto." },
  { title: "Listening estratégico", goal: "Entender a ideia geral de um áudio curto.", steps: ["Ouça uma vez sem pausar.", "Na segunda vez, anote palavras reconhecidas.", "Na terceira, confirme a mensagem principal."], result: "Lista do que entendeu em 1 minuto de áudio." },
  { title: "Conversação: respostas rápidas", goal: "Responder sem montar tudo em português primeiro.", steps: ["Treine What do you do? Where do you live? What do you like?", "Responda com frases curtas e corretas.", "Repita cada resposta em velocidade natural."], result: "Conversa guiada de 3 minutos." },
  { title: "Inglês para tecnologia", goal: "Entender termos comuns de sites e programação.", steps: ["Aprenda sign in, settings, save, deploy, error e update.", "Leia mensagens reais de uma interface.", "Monte seu glossário de 20 palavras."], result: "Glossário pessoal de tecnologia." },
  { title: "Revisão de tempos verbais", goal: "Escolher presente, passado ou futuro.", steps: ["Separe today, yesterday e next week.", "Transforme 5 frases entre os três tempos.", "Corrija os erros com explicação."], result: "Tabela com presente, passado e futuro." },
  { title: "Projeto final: fale sobre você", goal: "Unir tudo em uma apresentação completa.", steps: ["Escreva sobre quem é, rotina, passado e planos.", "Peça correção sem trocar suas ideias.", "Grave ou fale por 2 minutos."], result: "Apresentação final de 12 a 15 frases." },
];

const mathTopics: Topic[] = [
  { title: "Operações, sinais e prioridade", goal: "Eliminar erros básicos de cálculo.", steps: ["Revise ordem: parênteses, potências, multiplicação/divisão, soma/subtração.", "Calcule expressões com números negativos.", "Confira o resultado estimando antes."], result: "10 expressões resolvidas e conferidas." },
  { title: "Frações e decimais", goal: "Converter e operar frações com segurança.", steps: ["Encontre denominador comum.", "Converta fração em decimal e porcentagem.", "Aplique em preços e receitas."], result: "8 conversões e 4 operações." },
  { title: "Razão, proporção e regra de três", goal: "Resolver situações proporcionais.", steps: ["Identifique se as grandezas aumentam juntas.", "Monte a proporção antes de calcular.", "Use exemplos de quantidade e preço."], result: "6 problemas de regra de três." },
  { title: "Porcentagem na vida real", goal: "Calcular desconto, aumento e lucro.", steps: ["Transforme porcentagem em decimal.", "Calcule valor inicial, parte e total.", "Use exemplos da Delícias da Vó."], result: "Uma tabela simples de preço, custo e margem." },
  { title: "Equação do 1º grau", goal: "Isolar a incógnita entendendo cada passo.", steps: ["Mantenha a igualdade fazendo a mesma operação nos dois lados.", "Resolva equações com parênteses.", "Substitua o valor para conferir."], result: "10 equações verificadas." },
  { title: "Sistemas de duas equações", goal: "Resolver duas incógnitas.", steps: ["Entenda substituição e adição.", "Escolha o método mais simples em cada caso.", "Interprete a solução em um problema."], result: "4 sistemas e 2 problemas." },
  { title: "Função do 1º grau", goal: "Entender taxa de mudança e gráfico.", steps: ["Identifique a e b em y = ax + b.", "Monte tabela de pontos.", "Relacione inclinação com crescimento."], result: "Dois gráficos explicados." },
  { title: "Equação e função do 2º grau", goal: "Reconhecer parábola, raízes e vértice.", steps: ["Identifique a, b e c.", "Calcule discriminante e raízes.", "Interprete concavidade e vértice."], result: "4 equações e um esboço de gráfico." },
  { title: "Potências, raízes e notação científica", goal: "Trabalhar com números muito grandes ou pequenos.", steps: ["Revise propriedades de potência.", "Simplifique raízes possíveis.", "Converta para notação científica."], result: "12 exercícios mistos." },
  { title: "Geometria plana", goal: "Calcular perímetro e área.", steps: ["Revise quadrado, retângulo, triângulo e círculo.", "Desenhe e marque as medidas.", "Inclua corretamente cm, cm² e m²."], result: "Planta simples com áreas calculadas." },
  { title: "Estatística e gráficos", goal: "Ler dados sem cair em conclusões erradas.", steps: ["Calcule média, mediana e moda.", "Compare gráficos de barras e linhas.", "Observe escala e fonte dos dados."], result: "Análise curta de uma tabela real." },
  { title: "Probabilidade e revisão", goal: "Calcular chances e revisar os pontos fracos.", steps: ["Liste resultados possíveis.", "Use favoráveis dividido por total.", "Refaça os 5 exercícios que mais errou."], result: "Mini simulado com correção explicada." },
];

const portugueseTopics: Topic[] = [
  { title: "Interpretação: tema e ideia principal", goal: "Entender o que o texto realmente defende.", steps: ["Leia título, fonte e primeiro parágrafo.", "Separe tema de opinião do autor.", "Resuma tudo em uma frase."], result: "Resumo fiel de um texto curto." },
  { title: "Inferência e informação implícita", goal: "Perceber o que o texto sugere sem dizer diretamente.", steps: ["Marque pistas no texto.", "Diferencie inferência de chute.", "Justifique cada resposta com um trecho."], result: "5 inferências justificadas." },
  { title: "Pontuação que muda sentido", goal: "Usar vírgula, ponto e dois-pontos com clareza.", steps: ["Separe itens e explicações.", "Evite separar sujeito do verbo.", "Reescreva frases ambíguas."], result: "Um parágrafo pontuado e explicado." },
  { title: "Concordância verbal e nominal", goal: "Fazer palavras combinarem corretamente.", steps: ["Encontre o núcleo do sujeito.", "Cheque singular e plural.", "Revise adjetivos ligados ao substantivo."], result: "10 frases corrigidas." },
  { title: "Crase sem decorar tudo", goal: "Decidir quando usar à.", steps: ["Teste a troca por ao.", "Reconheça locuções como à tarde.", "Separe casos em que nunca ocorre."], result: "Tabela com exemplos certos e errados." },
  { title: "Coesão: ligar as ideias", goal: "Evitar texto quebrado e repetitivo.", steps: ["Use conectivos de causa, oposição e conclusão.", "Substitua repetições sem perder clareza.", "Cheque se um parágrafo leva ao próximo."], result: "Texto curto com conectivos destacados." },
  { title: "Parágrafo argumentativo", goal: "Defender uma ideia com explicação e exemplo.", steps: ["Comece com uma ideia central.", "Explique por que ela faz sentido.", "Finalize com exemplo ou consequência."], result: "Um parágrafo de 6 a 8 linhas." },
  { title: "Introdução de redação", goal: "Apresentar tema e tese sem enrolação.", steps: ["Contextualize em uma frase.", "Mostre o problema.", "Apresente dois pontos que serão discutidos."], result: "Duas introduções para o mesmo tema." },
  { title: "Desenvolvimento com repertório", goal: "Usar dado, fato ou exemplo conectado à tese.", steps: ["Escolha repertório que você entende.", "Explique a ligação, não apenas cite.", "Feche retomando o argumento."], result: "Um desenvolvimento completo." },
  { title: "Conclusão e proposta", goal: "Fechar o raciocínio com solução clara.", steps: ["Retome o problema sem copiar a introdução.", "Defina quem faz, o que faz e para quê.", "Evite solução vaga."], result: "Uma conclusão com proposta completa." },
  { title: "Gêneros do cotidiano", goal: "Adaptar linguagem para mensagem, notícia e e-mail.", steps: ["Compare público e objetivo de cada gênero.", "Escolha tom formal ou informal.", "Reescreva a mesma informação em 3 formatos."], result: "Mensagem, notícia curta e e-mail." },
  { title: "Revisão e texto final", goal: "Revisar conteúdo antes da gramática.", steps: ["Cheque tese, ordem e clareza.", "Depois revise repetição, pontuação e ortografia.", "Leia em voz alta e corte excessos."], result: "Texto final revisado em duas versões." },
];

const programmingTopics: (Topic & { project: string })[] = [
  { project: "Delícias da Vó 6.0", title: "Mapear o sistema atual", goal: "Entender as partes do projeto antes de pedir mudanças.", steps: ["Peça ao ChatGPT um mapa de páginas, dados e fluxos.", "Identifique o que é loja, painel e gestão.", "Anote três dúvidas e peça explicação simples."], result: "Mapa do sistema e glossário de 10 termos." },
  { project: "Delícias da Vó 6.0", title: "Separar painel e gestão", goal: "Aprender responsabilidade de cada área.", steps: ["Peça uma proposta de arquitetura.", "Veja quais arquivos mudariam e por quê.", "Aprove ou modifique o plano antes do código."], result: "Plano de organização aprovado." },
  { project: "Delícias da Vó 6.0", title: "Encomendas e permissões", goal: "Entender regras de negócio e acesso.", steps: ["Descreva a regra de liberar preparo 7 dias antes.", "Defina cargos e permissões da equipe.", "Peça testes para situações normais e erros."], result: "Funcionalidade planejada e testada." },
  { project: "Painel Financeiro RPG", title: "Modelo dos dados financeiros", goal: "Entender saldo, transação, categoria e meta.", steps: ["Liste tudo que entra e sai do sistema.", "Peça ao ChatGPT para explicar as relações.", "Confira com três exemplos reais fictícios."], result: "Modelo de dados explicado em linguagem simples." },
  { project: "Painel Financeiro RPG", title: "Tema de dono realmente RPG", goal: "Separar aparência de funcionalidade.", steps: ["Defina gemas, nível, missões e inventário financeiro.", "Mapeie cada elemento RPG a um dado real.", "Evite animações que atrapalhem a leitura."], result: "Guia visual e mapa RPG-finanças." },
  { project: "Painel Financeiro RPG", title: "Importação de extrato", goal: "Entender como arquivo vira dados organizados.", steps: ["Use um extrato fictício sem dados sensíveis.", "Peça explicação de parsing, validação e duplicidade.", "Teste uma linha errada e veja o tratamento."], result: "Fluxo de importação seguro e compreendido." },
  { project: "Painel Financeiro RPG", title: "Gráficos e recomendações", goal: "Ligar cálculos aos gráficos.", steps: ["Defina o que cada gráfico responde.", "Peça fórmulas de totais e percentuais explicadas.", "Confira manualmente um exemplo pequeno."], result: "Dashboard com números verificáveis." },
  { project: "Painel Financeiro RPG", title: "Login, Firebase e segurança", goal: "Entender quem pode acessar o quê.", steps: ["Peça explicação do login Google e regras.", "Separe dono e usuário comum.", "Monte testes de acesso permitido e negado."], result: "Checklist de segurança executado." },
  { project: "Portal do Grêmio", title: "Portal de propostas", goal: "Criar uma página útil para a chapa e os alunos.", steps: ["Liste propostas, benefícios e andamento.", "Peça uma experiência simples para celular.", "Inclua uma forma segura de receber ideias."], result: "Primeira versão do portal do grêmio." },
  { project: "Portal do Grêmio", title: "Transparência de caixa", goal: "Aplicar seu papel de tesoureiro.", steps: ["Modele entradas, saídas, comprovantes e saldo.", "Defina o que é público e o que é interno.", "Peça uma revisão de clareza e responsabilidade."], result: "Painel de transparência demonstrativo." },
  { project: "Portfólio do Samuel", title: "Organizar seus melhores projetos", goal: "Transformar projetos em prova de habilidade.", steps: ["Escolha 3 projetos com problemas diferentes.", "Explique problema, decisão e resultado.", "Peça ao ChatGPT para cortar texto genérico."], result: "Três estudos de caso curtos." },
  { project: "Portfólio do Samuel", title: "Publicar e apresentar", goal: "Finalizar com qualidade e saber explicar o que fez.", steps: ["Teste celular, computador, links e textos.", "Peça uma lista de falhas e corrija por prioridade.", "Treine uma explicação de 2 minutos sobre cada projeto."], result: "Portfólio publicado e apresentação preparada." },
];

function makeLessons(subject: SubjectId, topics: Topic[], duration: string): Lesson[] {
  return topics.map((topic, index) => ({
    id: `${subject}-${String(index + 1).padStart(2, "0")}`,
    subject,
    number: index + 1,
    week: subject === "english" ? Math.ceil((index + 1) / 2) : index + 1,
    title: topic.title,
    duration,
    goal: topic.goal,
    steps: topic.steps,
    result: topic.result,
    chatPrompt: `Quero fazer a aula ${index + 1} de ${subjects.find((item) => item.id === subject)?.name}: “${topic.title}”. Meu objetivo é: ${topic.goal} Ensine em linguagem simples, usando exemplos ligados à minha rotina. Siga estas etapas: ${topic.steps.join(" ")} No final, confira meu resultado: ${topic.result} Não entregue tudo pronto sem antes me explicar o raciocínio.`,
  }));
}

export const lessons: Lesson[] = [
  ...makeLessons("english", englishTopics, "35 min"),
  ...makeLessons("math", mathTopics, "45 min"),
  ...makeLessons("portuguese", portugueseTopics, "45 min"),
  ...programmingTopics.map((topic, index) => ({
    id: `programming-${String(index + 1).padStart(2, "0")}`,
    subject: "programming" as const,
    number: index + 1,
    week: index + 1,
    title: topic.title,
    duration: "75-90 min",
    goal: topic.goal,
    steps: topic.steps,
    result: topic.result,
    project: topic.project,
    chatPrompt: `Vamos trabalhar no projeto “${topic.project}”, etapa ${index + 1}: “${topic.title}”. Quero que você construa comigo, mas explique antes o que será alterado, em quais arquivos e por quê. Objetivo: ${topic.goal} Etapas: ${topic.steps.join(" ")} Entrega esperada: ${topic.result} Quando gerar código, explique os blocos importantes e me diga o que eu posso personalizar. Antes de finalizar, teste e confira se nada anterior quebrou.`,
  })),
];

export const weeklyPlan = [
  { day: 1, label: "Segunda", time: "17:45", subject: "english" as SubjectId, note: "Inglês novo" },
  { day: 2, label: "Terça", time: "17:45", subject: "math" as SubjectId, note: "Matemática" },
  { day: 2, label: "Terça", time: "20:15", subject: "english" as SubjectId, note: "Inglês novo" },
  { day: 5, label: "Sexta", time: "17:45", subject: "portuguese" as SubjectId, note: "Português" },
  { day: 6, label: "Sábado", time: "15:30", subject: "programming" as SubjectId, note: "Projeto da semana" },
];

export const projectRoadmap = [
  { name: "Delícias da Vó 6.0", weeks: "Semanas 1-3", duration: "3 semanas", result: "Gestão organizada, encomendas e equipe" },
  { name: "Painel Financeiro RPG", weeks: "Semanas 4-8", duration: "5 semanas", result: "Finanças, extrato, gráficos e segurança" },
  { name: "Portal do Grêmio", weeks: "Semanas 9-10", duration: "2 semanas", result: "Propostas e transparência do caixa" },
  { name: "Portfólio do Samuel", weeks: "Semanas 11-12", duration: "2 semanas", result: "Projetos apresentados profissionalmente" },
];
