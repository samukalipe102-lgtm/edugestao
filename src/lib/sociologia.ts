// Material de apoio: Sociologia do Ensino Médio.
// Habilidades BNCC (área de Ciências Humanas e Sociais Aplicadas) e 22 aulas planejadas.
// NÃO cria turma. As aulas ficam como material planejado (planned=true) associável
// a qualquer atribuição de Sociologia.

export type BnccSeed = {
  code: string;
  stage: string;
  area: string;
  component: string;
  description: string;
};

// Habilidades da BNCC de Ciências Humanas e Sociais Aplicadas mais usadas em Sociologia.
// Descrições resumidas para uso pedagógico interno.
export const SOCIOLOGIA_BNCC: BnccSeed[] = [
  { code: "EM13CHS101", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Identificar, analisar e comparar diferentes fontes e narrativas sobre um mesmo fenômeno social." },
  { code: "EM13CHS102", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Identificar, analisar e discutir circunstâncias históricas, geográficas, políticas, econômicas, sociais e culturais de processos sociais." },
  { code: "EM13CHS106", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Utilizar categorias das ciências sociais na análise de estruturas e relações sociais." },
  { code: "EM13CHS201", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Analisar e caracterizar as dinâmicas das populações e dos grupos sociais em diferentes tempos e espaços." },
  { code: "EM13CHS204", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Comparar e avaliar processos de ocupação e transformação social em diferentes contextos." },
  { code: "EM13CHS301", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Problematizar hábitos e práticas sociais, considerando desigualdades e direitos." },
  { code: "EM13CHS401", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Identificar e analisar as relações entre trabalho, tecnologia e transformações sociais." },
  { code: "EM13CHS501", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Analisar os fundamentos da ética e sua relação com processos sociais e políticos." },
  { code: "EM13CHS502", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Analisar situações da vida cotidiana à luz de valores, direitos humanos e cidadania." },
  { code: "EM13CHS503", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Identificar diversas formas de violência e mecanismos de promoção da cultura de paz." },
  { code: "EM13CHS601", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Identificar e analisar processos de desigualdade e exclusão social em contextos diversos." },
  { code: "EM13CHS605", stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", description: "Analisar formas de organização política e movimentos sociais na luta por direitos." },
];

export type LessonSeed = {
  number: number;
  topic: string;
  objective: string;
  content: string;
  methodology: string;
  activity: string;
  bnccCodes: string;
};

export const SOCIOLOGIA_AULAS: LessonSeed[] = [
  { number: 1, topic: "O que é Sociologia?", objective: "Compreender o objeto de estudo da Sociologia.", content: "Origem da Sociologia; o olhar sociológico; senso comum x conhecimento científico.", methodology: "Exposição dialogada e roda de conversa.", activity: "Registro de observações do cotidiano com olhar sociológico.", bnccCodes: "EM13CHS101, EM13CHS106" },
  { number: 2, topic: "Contexto histórico do surgimento da Sociologia", objective: "Relacionar a Sociologia às transformações da modernidade.", content: "Revolução Industrial, Revolução Francesa e urbanização.", methodology: "Aula expositiva com linha do tempo.", activity: "Linha do tempo das revoluções e seus impactos sociais.", bnccCodes: "EM13CHS102, EM13CHS204" },
  { number: 3, topic: "Émile Durkheim: fato social", objective: "Compreender o conceito de fato social.", content: "Coerção social, exterioridade, generalidade; solidariedade mecânica e orgânica.", methodology: "Leitura de trecho e discussão.", activity: "Identificar fatos sociais no cotidiano escolar.", bnccCodes: "EM13CHS106" },
  { number: 4, topic: "Durkheim: coesão social e anomia", objective: "Analisar coesão social e anomia.", content: "Consciência coletiva; divisão do trabalho social; anomia.", methodology: "Estudo de caso.", activity: "Análise de situação de anomia contemporânea.", bnccCodes: "EM13CHS106, EM13CHS301" },
  { number: 5, topic: "Max Weber: ação social", objective: "Compreender os tipos de ação social.", content: "Ação racional com relação a fins/valores, afetiva e tradicional.", methodology: "Exposição e exemplos.", activity: "Classificar ações do cotidiano por tipo.", bnccCodes: "EM13CHS106" },
  { number: 6, topic: "Weber: dominação e burocracia", objective: "Analisar tipos de dominação legítima.", content: "Dominação tradicional, carismática e legal-racional; burocracia.", methodology: "Debate.", activity: "Mapear formas de dominação em instituições.", bnccCodes: "EM13CHS106, EM13CHS605" },
  { number: 7, topic: "Karl Marx: modo de produção", objective: "Compreender o conceito de modo de produção.", content: "Forças produtivas, relações de produção, infraestrutura e superestrutura.", methodology: "Aula expositiva.", activity: "Esquema conceitual do modo de produção.", bnccCodes: "EM13CHS102, EM13CHS401" },
  { number: 8, topic: "Marx: classes sociais e mais-valia", objective: "Analisar classes sociais e exploração do trabalho.", content: "Burguesia e proletariado; mais-valia; luta de classes.", methodology: "Estudo dirigido.", activity: "Cálculo simbólico de mais-valia em exemplo.", bnccCodes: "EM13CHS401, EM13CHS601" },
  { number: 9, topic: "Cultura e diversidade cultural", objective: "Compreender o conceito de cultura.", content: "Cultura, etnocentrismo e relativismo cultural.", methodology: "Roda de conversa.", activity: "Debate sobre etnocentrismo.", bnccCodes: "EM13CHS101, EM13CHS502" },
  { number: 10, topic: "Socialização e instituições sociais", objective: "Analisar o processo de socialização.", content: "Socialização primária e secundária; família, escola, mídia.", methodology: "Exposição dialogada.", activity: "Mapa das instituições socializadoras do aluno.", bnccCodes: "EM13CHS106, EM13CHS201" },
  { number: 11, topic: "Identidade e grupos sociais", objective: "Compreender a construção da identidade social.", content: "Grupos primários e secundários; identidade e pertencimento.", methodology: "Dinâmica de grupo.", activity: "Autorretrato dos grupos de pertencimento.", bnccCodes: "EM13CHS201" },
  { number: 12, topic: "Estratificação e desigualdade social", objective: "Analisar formas de estratificação social.", content: "Castas, estamentos e classes; mobilidade social.", methodology: "Estudo de dados.", activity: "Análise de indicadores de desigualdade.", bnccCodes: "EM13CHS601, EM13CHS301" },
  { number: 13, topic: "Trabalho e sociedade", objective: "Relacionar trabalho e organização social.", content: "Divisão social do trabalho; taylorismo, fordismo, toyotismo.", methodology: "Aula expositiva.", activity: "Comparar modelos de produção.", bnccCodes: "EM13CHS401" },
  { number: 14, topic: "Trabalho na era digital", objective: "Analisar transformações do trabalho pela tecnologia.", content: "Automação, uberização, precarização.", methodology: "Debate atual.", activity: "Pesquisa sobre trabalho por aplicativos.", bnccCodes: "EM13CHS401, EM13CHS601" },
  { number: 15, topic: "Poder, Estado e política", objective: "Compreender conceitos de poder e Estado.", content: "Poder, Estado, governo; formas de governo.", methodology: "Exposição.", activity: "Esquema sobre organização do Estado.", bnccCodes: "EM13CHS605" },
  { number: 16, topic: "Cidadania e direitos", objective: "Analisar a construção da cidadania.", content: "Direitos civis, políticos e sociais; cidadania no Brasil.", methodology: "Estudo de caso.", activity: "Linha do tempo dos direitos no Brasil.", bnccCodes: "EM13CHS502, EM13CHS605" },
  { number: 17, topic: "Democracia e participação política", objective: "Compreender a democracia e formas de participação.", content: "Democracia direta e representativa; participação social.", methodology: "Simulação/debate.", activity: "Simulação de assembleia deliberativa.", bnccCodes: "EM13CHS605, EM13CHS502" },
  { number: 18, topic: "Movimentos sociais", objective: "Analisar o papel dos movimentos sociais.", content: "Movimentos sociais clássicos e contemporâneos.", methodology: "Pesquisa em grupo.", activity: "Apresentação sobre um movimento social.", bnccCodes: "EM13CHS605, EM13CHS301" },
  { number: 19, topic: "Direitos humanos e cultura de paz", objective: "Relacionar direitos humanos e convívio social.", content: "Declaração dos Direitos Humanos; violência e cultura de paz.", methodology: "Roda de conversa.", activity: "Cartaz sobre direitos humanos.", bnccCodes: "EM13CHS502, EM13CHS503" },
  { number: 20, topic: "Questões étnico-raciais no Brasil", objective: "Analisar relações étnico-raciais.", content: "Racismo estrutural; ações afirmativas.", methodology: "Debate mediado.", activity: "Análise de dados sobre desigualdade racial.", bnccCodes: "EM13CHS601, EM13CHS502" },
  { number: 21, topic: "Gênero e sociedade", objective: "Compreender relações de gênero.", content: "Papéis de gênero; desigualdades de gênero.", methodology: "Roda de conversa.", activity: "Discussão sobre divisão de tarefas.", bnccCodes: "EM13CHS601, EM13CHS301" },
  { number: 22, topic: "Meio ambiente e sociedade de risco", objective: "Relacionar sociedade e questões ambientais.", content: "Sociedade de risco; sustentabilidade; consumo.", methodology: "Projeto.", activity: "Proposta de ação socioambiental na escola.", bnccCodes: "EM13CHS301, EM13CHS204" },
];
