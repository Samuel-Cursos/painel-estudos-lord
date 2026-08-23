export type WritingMaterialKind = "prompt" | "model";

export type WritingMaterial = {
  id: string;
  kind: WritingMaterialKind;
  title: string;
  description: string;
  body: string;
  source: string;
  score?: number;
  createdAt?: unknown;
};

export const builtInWritingMaterials: WritingMaterial[] = [
  {
    id: "clareia-inclusao-digital",
    kind: "prompt",
    title: "Desafios para ampliar a inclusão digital no Brasil",
    description: "Discuta por que o acesso à tecnologia ainda não se transforma, para todos, em acesso real à educação, aos serviços e à cidadania.",
    body: "TEXTO I\nTer um aparelho conectado não garante inclusão digital. Também são necessários acesso estável, habilidades para usar serviços on-line e orientação para reconhecer riscos e informações falsas.\n\nTEXTO II\nEm comunidades com infraestrutura limitada, estudantes e trabalhadores podem depender de conexões instáveis ou compartilhadas. Essa situação interfere no estudo, na procura por emprego e no acesso a serviços públicos.\n\nTEXTO III\nUma política de inclusão digital pode combinar infraestrutura, formação e acessibilidade. Quando apenas uma dessas partes é atendida, grupos que já enfrentam desigualdades continuam em desvantagem.\n\nPROPOSTA\nRedija um texto dissertativo-argumentativo, em modalidade escrita formal da língua portuguesa, sobre o tema “Desafios para ampliar a inclusão digital no Brasil”. Apresente uma proposta de intervenção que respeite os direitos humanos.",
    source: "Coletânea autoral Clareia",
  },
  {
    id: "clareia-desinformacao",
    kind: "prompt",
    title: "Caminhos para reduzir os impactos da desinformação entre jovens",
    description: "Analise como educação midiática, responsabilidade das plataformas e participação familiar podem enfrentar o problema.",
    body: "TEXTO I\nA velocidade de circulação de uma mensagem pode ser maior que o tempo necessário para verificar sua origem. Conteúdos que despertam medo ou indignação tendem a ser compartilhados antes de uma leitura cuidadosa.\n\nTEXTO II\nEducação midiática não significa apenas utilizar ferramentas digitais. Ela inclui reconhecer autoria, comparar fontes, identificar interesses e distinguir opinião, publicidade e informação verificável.\n\nTEXTO III\nO enfrentamento da desinformação exige responsabilidades complementares. Escolas, famílias, plataformas, imprensa e poder público podem atuar sem impedir o debate democrático.\n\nPROPOSTA\nRedija um texto dissertativo-argumentativo sobre “Caminhos para reduzir os impactos da desinformação entre jovens” e apresente uma proposta de intervenção detalhada e compatível com os direitos humanos.",
    source: "Coletânea autoral Clareia",
  },
  {
    id: "clareia-espacos-publicos",
    kind: "prompt",
    title: "A importância de espaços públicos de convivência nas cidades brasileiras",
    description: "Reflita sobre lazer, segurança, pertencimento e desigualdade no acesso à cidade.",
    body: "TEXTO I\nPraças, parques, bibliotecas e centros esportivos permitem encontro, descanso, cultura e prática de atividades físicas. Quando são bem cuidados, esses espaços fortalecem vínculos entre moradores.\n\nTEXTO II\nA distribuição dos equipamentos urbanos não é igual em todos os bairros. Distância, falta de transporte, iluminação insuficiente e ausência de manutenção podem limitar o uso por crianças, idosos e pessoas com deficiência.\n\nTEXTO III\nProjetos urbanos mais participativos escutam quem utiliza o território. A presença da comunidade no planejamento ajuda a definir prioridades e a conservar os espaços construídos.\n\nPROPOSTA\nRedija um texto dissertativo-argumentativo sobre “A importância de espaços públicos de convivência nas cidades brasileiras”. Inclua uma proposta de intervenção socialmente responsável.",
    source: "Coletânea autoral Clareia",
  },
  {
    id: "clareia-modelo-comentado",
    kind: "model",
    title: "Modelo comentado · inclusão digital",
    description: "Exemplo autoral para observar tese, dois argumentos, conectivos e proposta de intervenção. Use como referência de estrutura, nunca para copiar.",
    body: "[INTRODUÇÃO — contexto + tese]\nEm uma sociedade que concentra serviços, oportunidades e relações no ambiente on-line, permanecer desconectado significa enfrentar novas barreiras de cidadania. No Brasil, a inclusão digital ainda é limitada tanto pela desigualdade de infraestrutura quanto pela ausência de formação para o uso crítico da tecnologia.\n\n[DESENVOLVIMENTO 1 — causa + consequência]\nEm primeiro lugar, a oferta desigual de conexão e equipamentos impede que parte da população utilize a internet com estabilidade. Quando estudantes dependem de aparelhos compartilhados ou de redes precárias, atividades escolares, inscrições e pesquisas tornam-se mais difíceis, o que amplia diferenças educacionais já existentes.\n\n[DESENVOLVIMENTO 2 — causa + consequência]\nAlém disso, acesso sem orientação não garante autonomia. Pessoas que não receberam formação para avaliar fontes, proteger dados e navegar em serviços digitais ficam mais expostas a fraudes e desinformação. Portanto, alfabetizar digitalmente é tão importante quanto expandir a rede física.\n\n[CONCLUSÃO — agente + ação + meio + finalidade]\nDessa forma, o poder público, em parceria com escolas e bibliotecas, deve criar pontos comunitários de conexão e formação digital, por meio da instalação de equipamentos acessíveis e da oferta periódica de oficinas conduzidas por profissionais capacitados. A medida deve priorizar territórios com menor cobertura e ensinar segurança, verificação de informações e uso de serviços públicos, a fim de transformar conexão em participação social efetiva.",
    source: "Modelo autoral Clareia",
    score: 920,
  },
];
