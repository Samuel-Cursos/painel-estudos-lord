import type { SubjectId } from "./course-data";
import type { EnemSubjectId } from "./enem-data";

export type MasteryQuestion = {
  id: string;
  subject: SubjectId | EnemSubjectId;
  prompt: string;
  options?: string[];
  answer?: number;
  explanation?: string;
  written?: boolean;
};

const q = (id: string, subject: MasteryQuestion["subject"], prompt: string, options: string[], answer: number, explanation: string): MasteryQuestion => ({ id, subject, prompt, options, answer, explanation });

export const lessonMastery: Record<string, MasteryQuestion> = {
  "english-01": q("english-01-check", "english", "Qual apresentação está correta?", ["My name Samuel.", "My name is Samuel.", "I name am Samuel.", "Me is Samuel."], 1, "Em inglês, usamos “My name is...” para dizer o nome."),
  "english-02": q("english-02-check", "english", "Complete: She ___ a student.", ["am", "are", "is", "be"], 2, "Com he, she ou it, o verbo to be é “is”."),
  "english-03": q("english-03-check", "english", "Qual pergunta está correta?", ["You are tired?", "Are you tired?", "Do you are tired?", "Is you tired?"], 1, "Nas perguntas com to be, o verbo vem antes do sujeito."),
  "english-04": q("english-04-check", "english", "Como se diz 7:30?", ["Seven thirty", "Thirty seven", "Seven thirteen", "Half seven hours"], 0, "7:30 pode ser dito como “seven thirty”."),
  "english-05": q("english-05-check", "english", "Complete: I ___ breakfast every day.", ["eat", "eats", "eating", "ate"], 0, "Com I, usamos a forma base no simple present."),
  "english-06": q("english-06-check", "english", "Complete: ___ she work here?", ["Do", "Does", "Is", "Are"], 1, "Perguntas no simple present com she usam “does”."),
  "english-07": q("english-07-check", "english", "Complete: This is Maria. ___ brother is João.", ["His", "Her", "Their", "Our"], 1, "“Her” indica algo pertencente a ela."),
  "english-08": q("english-08-check", "english", "Complete: ___ two books on the table.", ["There is", "There are", "It is", "They is"], 1, "No plural usamos “there are”."),
  "english-09": q("english-09-check", "english", "Qual frase fala de habilidade?", ["I can swim.", "I am swim.", "I do swimming now.", "I can to swim."], 0, "Can + verbo na forma base expressa habilidade."),
  "english-10": q("english-10-check", "english", "Como pedir algo educadamente?", ["Give me water.", "I want water now.", "Could I have some water, please?", "Water to me."], 2, "“Could I have..., please?” é uma forma educada de pedir."),
  "english-11": q("english-11-check", "english", "Complete: They ___ at home yesterday.", ["was", "were", "are", "be"], 1, "Com they no passado do to be, usamos “were”."),
  "english-12": q("english-12-check", "english", "Qual é o passado de “work”?", ["work", "worked", "worn", "working"], 1, "Verbos regulares normalmente recebem -ed no passado."),
  "english-13": q("english-13-check", "english", "Complete: Yesterday I ___ to school.", ["go", "goed", "went", "gone"], 2, "“Went” é o passado irregular de “go”."),
  "english-14": q("english-14-check", "english", "Qual frase expressa um plano?", ["I going travel.", "I am going to travel.", "I go to traveled.", "I am go travel."], 1, "Plano futuro: sujeito + to be + going to + verbo."),
  "english-15": q("english-15-check", "english", "Complete: A car is ___ than a bicycle.", ["fast", "faster", "fastest", "more fastly"], 1, "Adjetivos curtos normalmente recebem -er na comparação."),
  "english-16": q("english-16-check", "english", "The keys are ___ the box (dentro).", ["on", "under", "in", "between"], 2, "“In” significa dentro de."),
  "english-17": q("english-17-check", "english", "Qual instrução significa virar à esquerda?", ["Go straight.", "Turn left.", "Turn right.", "Go back."], 1, "“Turn left” significa vire à esquerda."),
  "english-18": q("english-18-check", "english", "Complete: He ___ now.", ["studies", "is studying", "study", "studied"], 1, "Ação acontecendo agora usa present continuous."),
  "english-19": q("english-19-check", "english", "Ao procurar um horário em um texto, qual estratégia é melhor?", ["Traduzir todas as palavras", "Buscar números e palavras-chave", "Ignorar títulos", "Ler só a última frase"], 1, "Scanning usa palavras-chave e sinais visuais para localizar informação."),
  "english-20": q("english-20-check", "english", "No primeiro contato com um áudio curto, você deve...", ["entender cada palavra", "captar assunto e palavras conhecidas", "parar a cada segundo", "escrever uma tradução completa"], 1, "Primeiro capte a ideia geral; depois procure detalhes."),
  "english-21": q("english-21-check", "english", "Uma resposta natural para “How are you?” é:", ["I have 16.", "I'm good, thanks.", "My name is good.", "Yes, I are."], 1, "“I'm good, thanks” responde naturalmente à pergunta."),
  "english-22": q("english-22-check", "english", "Em um botão, “Save changes” significa:", ["Apagar conta", "Salvar alterações", "Voltar à página", "Enviar mensagem"], 1, "Save = salvar; changes = alterações."),
  "english-23": q("english-23-check", "english", "Complete: Last week we ___; next week we are going to travel again.", ["travel", "traveled", "are traveling yesterday", "travels"], 1, "“Last week” pede passado; verbo regular: traveled."),
  "english-24": q("english-24-check", "english", "Qual sequência deixa uma apresentação pessoal mais clara?", ["Nome → origem → rotina → planos", "Planos → palavras soltas → nome", "Só idade", "Perguntas sem resposta"], 0, "Uma ordem lógica conecta informações do presente e do futuro."),

  "math-01": q("math-01-check", "math", "Quanto vale 8 + 2 × 5?", ["50", "18", "25", "10"], 1, "A multiplicação vem antes da adição: 2×5=10; 8+10=18."),
  "math-02": q("math-02-check", "math", "Qual decimal representa 3/4?", ["0,25", "0,34", "0,75", "1,25"], 2, "3 ÷ 4 = 0,75."),
  "math-03": q("math-03-check", "math", "Se 3 cadernos custam R$ 18, quanto custam 5?", ["R$ 24", "R$ 30", "R$ 36", "R$ 90"], 1, "Cada caderno custa 18÷3=6; cinco custam 30."),
  "math-04": q("math-04-check", "math", "Um produto de R$ 200 recebeu 15% de desconto. Novo preço?", ["R$ 170", "R$ 175", "R$ 185", "R$ 215"], 0, "15% de 200 é 30; 200−30=170."),
  "math-05": q("math-05-check", "math", "Resolva: 3x + 5 = 20.", ["3", "5", "8", "15"], 1, "3x=15, então x=5."),
  "math-06": q("math-06-check", "math", "No sistema x+y=10 e x−y=2, x vale:", ["4", "5", "6", "8"], 2, "Somando as equações: 2x=12; x=6."),
  "math-07": q("math-07-check", "math", "Na função y=2x+3, a taxa de mudança é:", ["2", "3", "5", "x"], 0, "O coeficiente de x é a taxa de mudança."),
  "math-08": q("math-08-check", "math", "As raízes de x²−5x+6=0 são:", ["1 e 6", "2 e 3", "−2 e −3", "0 e 5"], 1, "(x−2)(x−3)=0, logo x=2 ou x=3."),
  "math-09": q("math-09-check", "math", "3,2 × 10⁴ é igual a:", ["320", "3.200", "32.000", "320.000"], 2, "A vírgula anda quatro casas para a direita: 32.000."),
  "math-10": q("math-10-check", "math", "Área de um retângulo de 8 cm por 5 cm:", ["13 cm²", "26 cm²", "40 cm²", "80 cm²"], 2, "Área = base × altura = 8×5=40 cm²."),
  "math-11": q("math-11-check", "math", "A média de 4, 6 e 8 é:", ["5", "6", "7", "18"], 1, "(4+6+8)÷3=6."),
  "math-12": q("math-12-check", "math", "Em um dado comum, a chance de sair número par é:", ["1/6", "1/3", "1/2", "2/3"], 2, "Há 3 resultados pares em 6 possíveis: 3/6=1/2."),

  "portuguese-01": q("portuguese-01-check", "portuguese", "A ideia principal de um texto é...", ["um detalhe isolado", "o assunto central desenvolvido", "a palavra mais repetida", "sempre a primeira frase"], 1, "É o núcleo que organiza as informações do texto."),
  "portuguese-02": q("portuguese-02-check", "portuguese", "Inferir significa...", ["copiar uma frase", "concluir algo a partir de pistas", "ignorar o contexto", "consultar apenas o título"], 1, "A inferência nasce da combinação entre pistas e contexto."),
  "portuguese-03": q("portuguese-03-check", "portuguese", "Qual frase usa a vírgula corretamente?", ["Samuel comprou, pão e leite.", "Quando chegou, abriu o caderno.", "O aluno, terminou a prova.", "Precisamos estudar matemática, e."], 1, "A vírgula separa a oração adverbial antecipada."),
  "portuguese-04": q("portuguese-04-check", "portuguese", "Complete: Os alunos ___ preparados.", ["está", "estavam", "estava", "esteve"], 1, "O verbo concorda no plural com “os alunos”."),
  "portuguese-05": q("portuguese-05-check", "portuguese", "Em qual frase há crase?", ["Vou a pé.", "Entreguei a ela.", "Fui à escola.", "Cheguei a casa cedo."], 2, "Ir a + a escola forma “à escola”."),
  "portuguese-06": q("portuguese-06-check", "portuguese", "Qual conector introduz contraste?", ["portanto", "porque", "porém", "além disso"], 2, "“Porém” liga ideias opostas."),
  "portuguese-07": q("portuguese-07-check", "portuguese", "Um parágrafo argumentativo forte tem:", ["opinião sem prova", "ideia, explicação e exemplo", "somente citação", "frases desconectadas"], 1, "A afirmação precisa ser desenvolvida e sustentada."),
  "portuguese-08": q("portuguese-08-check", "portuguese", "Na introdução da redação, a tese é:", ["a posição central defendida", "uma lista de palavras", "a conclusão antecipada inteira", "o título obrigatório"], 0, "A tese orienta o que será defendido no desenvolvimento."),
  "portuguese-09": q("portuguese-09-check", "portuguese", "Um repertório é produtivo quando...", ["é famoso", "se conecta ao argumento", "ocupa muitas linhas", "substitui a explicação"], 1, "Ele deve sustentar a análise, não apenas ser citado."),
  "portuguese-10": q("portuguese-10-check", "portuguese", "Uma proposta completa responde principalmente:", ["quem faz, o quê, como e para quê", "só quanto custa", "apenas onde", "qual é o título"], 0, "Agente, ação, meio e finalidade tornam a proposta concreta."),
  "portuguese-11": q("portuguese-11-check", "portuguese", "A linguagem de um e-mail formal deve ser:", ["adequada ao destinatário e objetiva", "cheia de abreviações", "sempre humorística", "sem saudação"], 0, "O gênero e o destinatário definem o nível de formalidade."),
  "portuguese-12": q("portuguese-12-check", "portuguese", "Na revisão, o melhor primeiro passo é verificar:", ["apenas acentos", "clareza e organização das ideias", "quantas palavras difíceis há", "se todas as frases têm o mesmo tamanho"], 1, "Primeiro revise conteúdo e estrutura; depois a forma."),

  "programming-01": q("programming-01-check", "programming", "Antes de alterar um sistema existente, o melhor passo é:", ["apagar arquivos", "mapear componentes e fluxo de dados", "trocar a linguagem", "publicar imediatamente"], 1, "O mapa reduz mudanças cegas e mostra dependências."),
  "programming-02": q("programming-02-check", "programming", "Separar painel de usuário e gestão ajuda a:", ["duplicar bugs", "definir responsabilidades e permissões", "eliminar banco de dados", "dispensar testes"], 1, "Cada área ganha funções e acessos claros."),
  "programming-03": q("programming-03-check", "programming", "Uma regra de permissão deve ser verificada:", ["só no botão", "no backend/regras do banco", "apenas pela cor da tela", "no nome do arquivo"], 1, "A interface pode esconder ações, mas a segurança deve bloquear o acesso aos dados."),
  "programming-04": q("programming-04-check", "programming", "Qual entidade representa dinheiro entrando ou saindo?", ["tema", "transação", "avatar", "menu"], 1, "Uma transação registra valor, data, tipo e categoria."),
  "programming-05": q("programming-05-check", "programming", "O tema visual deve ficar separado da lógica para:", ["facilitar manutenção", "reduzir segurança", "impedir reutilização", "misturar responsabilidades"], 0, "Separação permite mudar aparência sem quebrar regras do sistema."),
  "programming-06": q("programming-06-check", "programming", "Ao importar um extrato, primeiro é preciso:", ["confiar em qualquer coluna", "validar e transformar os dados", "apagar o original", "gerar um gráfico vazio"], 1, "Validação e transformação tornam os dados consistentes."),
  "programming-07": q("programming-07-check", "programming", "Um gráfico correto deve usar:", ["dados calculados da mesma fonte", "números inventados", "cores sem legenda", "valores fixos no código"], 0, "A visualização deve refletir os dados reais e suas unidades."),
  "programming-08": q("programming-08-check", "programming", "Autenticação responde “quem é”; autorização responde:", ["qual a cor", "o que pode acessar", "qual navegador usa", "quando nasceu"], 1, "Autorização define permissões depois da identidade confirmada."),
  "programming-09": q("programming-09-check", "programming", "Um portal de propostas útil precisa principalmente de:", ["conteúdo claro e ação fácil", "animações pesadas", "senha única para todos", "texto escondido"], 0, "A utilidade vem da informação compreensível e do fluxo simples."),
  "programming-10": q("programming-10-check", "programming", "Transparência financeira exige:", ["apenas saldo", "origem, destino, valor e data", "ocultar categorias", "editar sem histórico"], 1, "Registros rastreáveis explicam cada movimentação."),
  "programming-11": q("programming-11-check", "programming", "Um bom portfólio explica:", ["só ferramentas", "problema, solução e resultado", "apenas o nome", "somente prints"], 1, "O contexto mostra o valor do trabalho e suas decisões."),
  "programming-12": q("programming-12-check", "programming", "Antes de publicar, é essencial:", ["testar o fluxo principal", "remover mensagens de erro", "desativar login", "ignorar celular"], 0, "Teste o caminho que o usuário realmente percorre."),
};

export const practiceQuestions: MasteryQuestion[] = [
  q("practice-english", "english", "Complete: We ___ studying right now.", ["is", "are", "do", "was"], 1, "We usa are no present continuous."),
  q("practice-math", "math", "25% de 80 é:", ["10", "20", "25", "40"], 1, "Um quarto de 80 é 20."),
  q("practice-portuguese", "portuguese", "Em “Embora estivesse cansado, continuou”, a primeira oração indica:", ["causa", "concessão", "conclusão", "finalidade"], 1, "“Embora” introduz concessão."),
  q("practice-programming", "programming", "Qual prática evita que qualquer usuário leia dados de outro?", ["CSS", "regras por UID", "nome do componente", "modo escuro"], 1, "A autorização precisa comparar o UID autenticado."),
  q("practice-biology", "biology", "Em qual organela ocorre a maior parte da respiração celular?", ["Ribossomo", "Mitocôndria", "Lisossomo", "Núcleo"], 1, "A mitocôndria produz ATP pela respiração celular."),
  q("practice-chemistry", "chemistry", "Uma solução com pH 3 é:", ["básica", "neutra", "ácida", "salina"], 2, "pH abaixo de 7 indica acidez."),
  q("practice-physics", "physics", "Um carro percorre 120 km em 2 h. Velocidade média?", ["30 km/h", "60 km/h", "120 km/h", "240 km/h"], 1, "v=distância/tempo=120/2=60 km/h."),
  q("practice-history", "history", "A Revolução Industrial começou primeiro em qual país?", ["França", "Inglaterra", "Brasil", "Rússia"], 1, "A Inglaterra reuniu condições pioneiras no século XVIII."),
  q("practice-geography", "geography", "O êxodo rural é o deslocamento:", ["cidade-campo", "campo-cidade", "país-país", "litoral-interior apenas"], 1, "É a migração do campo para áreas urbanas."),
  q("practice-philosophy", "philosophy", "Para Sócrates, o diálogo servia para:", ["impor respostas", "examinar ideias por perguntas", "evitar dúvidas", "decorar discursos"], 1, "O método socrático investiga conceitos pelo questionamento."),
  q("practice-sociology", "sociology", "Socialização é o processo de:", ["aprender normas e valores sociais", "viver sem grupos", "eliminar cultura", "produzir somente bens"], 0, "A socialização integra o indivíduo aos padrões e relações sociais."),
];

export function skillMasteryQuestion(subject: EnemSubjectId, skill: string): MasteryQuestion {
  return {
    id: `skill-${subject}-${skill}`,
    subject,
    prompt: `Explique com suas palavras o que você entendeu sobre “${skill}” e dê um exemplo ou aplicação.`,
    written: true,
    explanation: "Compare sua resposta com a aula: ela precisa explicar a ideia central e trazer pelo menos um exemplo concreto.",
  };
}
