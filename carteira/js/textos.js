/* ==========================================================================
 * Monte sua carteira — TEXTOS (perguntas e glossário)
 * Só conteúdo; nenhuma lógica. A pontuação de cada resposta é a posição
 * dela na lista (0 = primeira opção), usada em engine.js.
 * ========================================================================== */
(function (root) {
  'use strict';

  var TEXTOS = {
    /* Glossário dos botões "o que é isso?" */
    glossario: {
      selic: 'Taxa básica de juros da economia, definida pelo Banco Central. Serve de referência para empréstimos e para a renda fixa.',
      cdi: 'Taxa dos empréstimos de um dia entre bancos. Anda colada à Selic e é a referência de rendimento da maior parte da renda fixa pós-fixada.',
      ipca: 'Índice oficial de inflação do Brasil, medido pelo IBGE. Mostra quanto os preços subiram.',
      focus: 'Pesquisa semanal do Banco Central com as projeções de mais de cem instituições. O número mostrado é a mediana, isto é, o valor do meio das respostas.',
      juro_real: 'Quanto os juros rendem acima da inflação. Se a taxa é 10% e a inflação é 4%, o juro real fica perto de 6%.',
      reserva: 'Dinheiro separado para imprevistos (desemprego, saúde, conserto), em aplicações de baixo risco que podem ser resgatadas a qualquer momento.',
      aporte: 'Valor que você investe todo mês.',
      patrimonio: 'Tudo o que você tem aplicado ou guardado e poderia investir. Não conte o imóvel onde mora nem o carro.',
      liquidez: 'Facilidade de transformar um investimento em dinheiro na conta, sem perder valor.',
      renda_variavel: 'Investimentos cujo preço muda todo dia e que não têm rendimento combinado, como ações e fundos imobiliários.',
      renda_fixa: 'Investimentos em que a regra de rendimento é combinada na hora da aplicação.',
      perfil: 'Resumo de quanto risco faz sentido para você, combinando sua situação (capacidade) e seu comportamento (tolerância).',
      capacidade: 'Quanto risco a sua situação financeira aguenta, olhando prazo, renda, patrimônio e necessidade de resgate. Não depende de opinião.',
      tolerancia: 'Quanto de oscilação você aguenta emocionalmente sem abandonar o plano.',
      rebalancear: 'Trazer a carteira de volta aos percentuais planejados, vendendo um pouco do que subiu demais ou comprando o que ficou para trás.',
      pp: 'Ponto percentual: a diferença entre dois percentuais. De 10% para 15% são 5 pontos percentuais.',
      tatico: 'Pequeno desvio temporário em relação à alocação-base, feito por causa do cenário econômico atual.',
      cenarios: 'Três hipóteses de retorno para a mesma carteira: uma pior, uma intermediária e uma melhor. Não são previsões e nenhuma delas é garantida.',
      estresse: 'Simulação de quanto a carteira perderia se uma crise forte acontecesse de uma vez. É uma hipótese, não o pior caso possível.',
      reais_hoje: 'Valores já descontados da inflação esperada. R$ 100 mil "de hoje" daqui a dez anos compram o mesmo que R$ 100 mil compram agora.',
      prefixado: 'Título com taxa fixa combinada na compra. Você sabe quanto recebe se ficar até o vencimento.',
      pos_fixado: 'Título cujo rendimento acompanha uma taxa que muda ao longo do tempo, como a Selic ou o CDI.',
      marcacao: 'O preço de um título muda todo dia. Quem vende antes do vencimento recebe o preço do dia, que pode ser maior ou menor que o esperado.',
      pib: 'Produto Interno Bruto: soma de tudo o que o país produz. Mede o ritmo da economia.'
    },

    objetivos: [
      { id: 'aposentadoria', nome: 'Aposentadoria' },
      { id: 'imovel', nome: 'Imóvel' },
      { id: 'estudo', nome: 'Estudo' },
      { id: 'viagem', nome: 'Viagem' },
      { id: 'independencia', nome: 'Independência financeira' },
      { id: 'outro', nome: 'Outro' }
    ],

    /* Capacidade — duas perguntas (as outras duas são calculadas) */
    estabilidade: {
      titulo: 'Como é a sua renda?',
      opcoes: [
        'Instável: há meses em que entra muito pouco ou nada',
        'Variável: muda bastante de um mês para o outro (comissões, trabalho autônomo)',
        'Estável: salário fixo ou renda previsível',
        'Muito estável: servidor público, aposentadoria ou várias fontes de renda'
      ]
    },
    liquidez: {
      titulo: 'Qual a chance de você precisar de boa parte desse dinheiro nos próximos 2 anos, fora dos objetivos que informou?',
      opcoes: ['Alta: é bem provável', 'Média: pode acontecer', 'Baixa: seria surpresa', 'Muito baixa: tenho outras fontes para emergências']
    },

    /* Tolerância — 7 perguntas comportamentais */
    tolerancia: [
      { titulo: 'Imagine que sua carteira caiu 20% em poucos meses. O que você faz?',
        opcoes: ['Vendo tudo para não perder mais', 'Vendo uma parte para ficar mais tranquilo', 'Não mexo e espero recuperar', 'Aproveito para investir mais'] },
      { titulo: 'O que você mais quer do dinheiro investido?',
        opcoes: ['Não perder, mesmo que renda pouco', 'Ganhar um pouco acima da inflação, com poucas oscilações', 'Crescer bem, aceitando altos e baixos', 'Crescer o máximo possível, aceitando grandes oscilações'] },
      { titulo: 'Qual destas carteiras hipotéticas você escolheria para um ano?',
        nota: 'Os números são só exemplos para comparar risco; não são previsões.',
        opcoes: ['Resultado entre +4% e +8%', 'Resultado entre −5% e +15%', 'Resultado entre −15% e +30%', 'Resultado entre −30% e +50%'] },
      { titulo: 'Por quanto tempo você aguentaria ver a carteira no negativo sem mudar o plano?',
        opcoes: ['Não aguentaria', 'Até uns 6 meses', 'Até uns 2 anos', 'Mais de 2 anos, se o plano for de longo prazo'] },
      { titulo: 'Como você se sente quando seus investimentos oscilam?',
        opcoes: ['Fico muito ansioso e acompanho o tempo todo', 'Fico incomodado', 'Fico tranquilo na maior parte do tempo', 'Quase não olho: faz parte'] },
      { titulo: 'Qual a maior perda em um ano que você aceitaria sem abandonar o plano?',
        opcoes: ['Nenhuma', 'Até 5%', 'Até 15%', 'Mais de 15%'] },
      { titulo: 'Qual frase combina mais com você?',
        opcoes: ['Prefiro ganhar menos e dormir tranquilo', 'Aceito um pouco de risco, desde que a maior parte fique protegida', 'Risco e retorno andam juntos: aceito oscilar para buscar mais', 'Penso no longo prazo e quedas não me tiram do caminho'] }
    ],

    /* Conhecimento e experiência */
    conhecimento: {
      tempo: { titulo: 'Há quanto tempo você investe?', opcoes: ['Nunca investi', 'Menos de 2 anos', 'De 2 a 5 anos', 'Mais de 5 anos'] },
      produtos: { titulo: 'Em que tipos de investimento você já aplicou?', nota: 'Marque todos os que se aplicam. Pode deixar em branco.',
        opcoes: [
          { valor: 0, nome: 'Poupança ou conta remunerada' },
          { valor: 1, nome: 'Renda fixa (títulos públicos ou de bancos)' },
          { valor: 2, nome: 'Fundos de investimento, ações ou fundos imobiliários' },
          { valor: 3, nome: 'Investimentos no exterior, derivativos ou criptoativos' }
        ] },
      auto: { titulo: 'Como você avalia seu conhecimento sobre investimentos?', opcoes: ['Nenhum', 'Básico: conheço os principais tipos', 'Intermediário: entendo risco, prazo e diversificação', 'Avançado: acompanho o mercado e analiso sozinho'] },
      quiz: { titulo: 'Se os juros sobem, o que costuma acontecer com o preço de um título prefixado comprado antes?',
        nota: 'Não tem problema não saber. A resposta ajuda a calibrar as explicações.',
        opcoes: ['Sobe', 'Cai', 'Não muda', 'Não sei'] }  // correta: índice 1
    }
  };

  root.MSC = root.MSC || {};
  root.MSC.TEXTOS = TEXTOS;
})(window);
