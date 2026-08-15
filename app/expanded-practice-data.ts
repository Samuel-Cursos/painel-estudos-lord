import type { MasteryQuestion } from "./mastery-data";

const q = (id: string, subject: MasteryQuestion["subject"], prompt: string, options: string[], answer: number, explanation: string): MasteryQuestion => ({ id, subject, prompt, options, answer, explanation });

export const expandedPracticeQuestions: MasteryQuestion[] = [
  q("practice-english-02", "english", "Choose the correct sentence about a routine:", ["I studies every day.", "I study every day.", "I am study every day.", "I studying every day."], 1, "Com I no simple present, usamos o verbo na forma base: I study."),
  q("practice-english-03", "english", "Complete: There ___ a computer on the desk.", ["are", "be", "is", "am"], 2, "Usamos there is antes de um substantivo singular."),
  q("practice-english-04", "english", "What does “I have already finished” mean?", ["Eu ainda vou começar.", "Eu já terminei.", "Eu nunca terminei.", "Eu estava terminando."], 1, "Already indica que algo já aconteceu antes do momento atual."),
  q("practice-english-05", "english", "Complete: If it rains, we ___ at home.", ["stay", "stayed", "will stay", "staying"], 2, "Na first conditional: if + presente, will + verbo."),

  q("practice-math-02", "math", "Resolva: 2(x + 3) = 18.", ["3", "6", "9", "12"], 1, "Dividindo por 2: x+3=9; portanto x=6."),
  q("practice-math-03", "math", "Um preço passou de R$ 50 para R$ 60. O aumento foi de:", ["10%", "20%", "25%", "50%"], 1, "O aumento foi 10 sobre o valor inicial 50: 10/50=20%."),
  q("practice-math-04", "math", "A área de um triângulo de base 10 cm e altura 6 cm é:", ["16 cm²", "30 cm²", "60 cm²", "120 cm²"], 1, "Área do triângulo = base×altura÷2 = 10×6÷2 = 30 cm²."),
  q("practice-math-05", "math", "A mediana de 2, 4, 7, 9 e 15 é:", ["4", "7", "7,4", "9"], 1, "Com os valores ordenados, a mediana é o termo central: 7."),

  q("practice-portuguese-02", "portuguese", "Em “O vento cantava na janela”, ocorre:", ["metáfora", "personificação", "eufemismo", "antítese"], 1, "A frase atribui ao vento uma ação humana: cantar."),
  q("practice-portuguese-03", "portuguese", "Qual alternativa apresenta concordância correta?", ["Fazem dois anos que estudo.", "Houveram muitos pedidos.", "Faz dois anos que estudo.", "Existe muitas opções."], 2, "O verbo fazer indicando tempo é impessoal e fica no singular."),
  q("practice-portuguese-04", "portuguese", "A função principal de um artigo de opinião é:", ["narrar sem posicionamento", "defender um ponto de vista", "dar instruções técnicas", "registrar uma conversa"], 1, "O gênero apresenta e sustenta uma opinião com argumentos."),
  q("practice-portuguese-05", "portuguese", "Qual palavra retoma “Maria” em “Maria chegou. Ela sentou.”?", ["chegou", "ela", "sentou", "ponto"], 1, "O pronome ela retoma Maria e cria coesão."),

  q("practice-programming-02", "programming", "Em JavaScript, qual estrutura guarda vários itens em ordem?", ["array", "boolean", "if", "function"], 0, "Arrays armazenam coleções ordenadas de valores."),
  q("practice-programming-03", "programming", "O que um commit do Git representa?", ["um servidor pago", "um registro das alterações", "uma senha", "um erro do navegador"], 1, "O commit é um ponto identificável no histórico do projeto."),
  q("practice-programming-04", "programming", "Qual ação deve ocorrer antes de um deploy?", ["ignorar os erros", "testar o build", "apagar o repositório", "expor as chaves privadas"], 1, "Testar o build detecta problemas antes da publicação."),
  q("practice-programming-05", "programming", "Por que uma chave secreta não deve ir para o GitHub?", ["porque deixa o CSS lento", "porque pode dar acesso indevido", "porque muda a fonte", "porque impede commits"], 1, "Segredos expostos podem ser usados por qualquer pessoa que os encontre."),

  q("practice-biology-02", "biology", "A molécula que carrega a informação genética é:", ["ATP", "DNA", "glicose", "água"], 1, "O DNA armazena as instruções genéticas dos seres vivos."),
  q("practice-biology-03", "biology", "Na cadeia alimentar, produtores são organismos que:", ["fabricam matéria orgânica", "comem todos os animais", "decompõem apenas plástico", "não usam energia"], 0, "Produtores, como plantas, formam matéria orgânica geralmente por fotossíntese."),
  q("practice-biology-04", "biology", "A seleção natural favorece indivíduos que:", ["são sempre maiores", "deixam mais descendentes no ambiente", "nunca sofrem mutações", "vivem isolados"], 1, "Características vantajosas aumentam a sobrevivência e o sucesso reprodutivo."),
  q("practice-biology-05", "biology", "Qual sistema transporta oxigênio pelo corpo?", ["digestório", "circulatório", "endócrino", "urinário"], 1, "O sangue do sistema circulatório transporta oxigênio até os tecidos."),

  q("practice-chemistry-02", "chemistry", "O número atômico indica a quantidade de:", ["nêutrons", "prótons", "moléculas", "ligações"], 1, "O elemento químico é definido pelo número de prótons no núcleo."),
  q("practice-chemistry-03", "chemistry", "Na reação 2H₂ + O₂ → 2H₂O, a proporção H₂:O₂ é:", ["1:1", "2:1", "1:2", "2:2"], 1, "Os coeficientes mostram duas moléculas de H₂ para uma de O₂."),
  q("practice-chemistry-04", "chemistry", "Qual processo separa um sólido insolúvel de um líquido?", ["filtração", "fusão", "sublimação", "destilação fracionada"], 0, "A filtração retém o sólido e permite a passagem do líquido."),
  q("practice-chemistry-05", "chemistry", "Uma ligação entre dois ametais tende a ser:", ["metálica", "covalente", "nuclear", "iônica sempre"], 1, "Ametais tendem a compartilhar elétrons, formando ligações covalentes."),

  q("practice-physics-02", "physics", "Uma força resultante de 10 N atua sobre 2 kg. A aceleração é:", ["5 m/s²", "10 m/s²", "12 m/s²", "20 m/s²"], 0, "Pela segunda lei de Newton, a=F/m=10/2=5 m/s²."),
  q("practice-physics-03", "physics", "Um aparelho de 1000 W ligado por 2 h consome:", ["0,5 kWh", "1 kWh", "2 kWh", "2000 kWh"], 2, "1000 W = 1 kW; energia = 1×2 = 2 kWh."),
  q("practice-physics-04", "physics", "O som não se propaga:", ["na água", "no aço", "no ar", "no vácuo"], 3, "O som é uma onda mecânica e precisa de um meio material."),
  q("practice-physics-05", "physics", "Em um espelho plano, a imagem é:", ["real e invertida", "virtual e do mesmo tamanho", "sempre menor", "sempre maior"], 1, "O espelho plano forma imagem virtual, direita e de mesmo tamanho."),

  q("practice-history-02", "history", "A abolição formal da escravidão no Brasil ocorreu em:", ["1822", "1850", "1888", "1889"], 2, "A Lei Áurea foi assinada em 13 de maio de 1888."),
  q("practice-history-03", "history", "A Guerra Fria envolveu principalmente a disputa entre:", ["Brasil e Argentina", "EUA e URSS", "França e Portugal", "China e Japão"], 1, "EUA e URSS lideraram blocos políticos e econômicos rivais."),
  q("practice-history-04", "history", "O Iluminismo defendia principalmente:", ["razão e crítica ao absolutismo", "retorno ao feudalismo", "fim da ciência", "poder sem limites"], 0, "Iluministas valorizavam a razão, direitos e limites ao poder absoluto."),
  q("practice-history-05", "history", "O coronelismo na Primeira República brasileira se ligava:", ["ao poder local e voto controlado", "à democracia direta", "ao fim das elites rurais", "ao voto secreto universal"], 0, "Chefes locais exerciam influência política e controle eleitoral."),

  q("practice-geography-02", "geography", "O efeito estufa natural é importante porque:", ["mantém temperatura compatível com a vida", "elimina toda radiação", "impede chuvas", "produz oxigênio"], 0, "Ele retém parte do calor; sua intensificação é que agrava o aquecimento."),
  q("practice-geography-03", "geography", "Globalização caracteriza-se pela:", ["redução de fluxos", "maior integração econômica e informacional", "extinção das cidades", "ausência de tecnologia"], 1, "Redes de transporte, finanças e comunicação ampliam a integração mundial."),
  q("practice-geography-04", "geography", "Uma fonte de energia renovável é:", ["carvão mineral", "petróleo", "solar", "gás natural"], 2, "A energia solar utiliza uma fonte que se renova naturalmente."),
  q("practice-geography-05", "geography", "Urbanização é o crescimento:", ["da população urbana", "apenas da produção agrícola", "das geleiras", "dos desertos exclusivamente"], 0, "Urbanização é o aumento da população e da importância das cidades."),

  q("practice-philosophy-02", "philosophy", "A ética estuda principalmente:", ["as regras da gramática", "a ação humana e seus valores", "somente números", "o clima"], 1, "A ética investiga critérios para julgar ações, escolhas e modos de viver."),
  q("practice-philosophy-03", "philosophy", "Para Platão, o conhecimento verdadeiro se relaciona:", ["apenas à aparência", "ao mundo inteligível das ideias", "somente aos sentidos", "ao acaso"], 1, "Platão distingue as aparências sensíveis das formas inteligíveis."),
  q("practice-philosophy-04", "philosophy", "O contrato social busca explicar:", ["a origem e legitimidade do poder político", "a formação dos planetas", "a métrica dos poemas", "a fotossíntese"], 0, "Pensadores contratualistas discutem por que indivíduos formam uma sociedade política."),
  q("practice-philosophy-05", "philosophy", "Um argumento válido precisa apresentar:", ["somente opinião", "razões ligadas à conclusão", "palavras difíceis", "uma ameaça"], 1, "Argumentar é sustentar uma conclusão por razões pertinentes."),

  q("practice-sociology-02", "sociology", "Para Durkheim, fatos sociais são:", ["puramente individuais", "externos e coercitivos", "fenômenos biológicos apenas", "escolhas sem influência social"], 1, "Fatos sociais existem fora do indivíduo e exercem coerção sobre ele."),
  q("practice-sociology-03", "sociology", "Cultura inclui:", ["valores, símbolos e práticas", "somente obras de museu", "apenas genética", "nenhuma regra social"], 0, "Cultura reúne significados, hábitos, conhecimentos e práticas compartilhadas."),
  q("practice-sociology-04", "sociology", "Desigualdade social significa:", ["diferenças sem consequências", "distribuição desigual de recursos e oportunidades", "todos terem a mesma renda", "ausência de grupos"], 1, "Ela aparece no acesso desigual a renda, poder, educação, saúde e direitos."),
  q("practice-sociology-05", "sociology", "Cidadania envolve:", ["direitos e participação social", "apenas consumir", "não cumprir deveres", "evitar decisões coletivas"], 0, "Cidadania articula direitos, deveres e participação na vida pública."),
];
