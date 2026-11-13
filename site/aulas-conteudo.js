/* Cerne — textos da área de aprendizagem (trilhas e módulos).
 * Carregado por site/aulas.js, que entrega as contas prontas em `h`.
 *
 * Formato de cada módulo, sempre nesta ordem de leitura:
 *   frase     a ideia do módulo em uma linha
 *   analogia  comparação com algo do dia a dia
 *   passos    explicação em blocos curtos: [título, html]
 *   palavras  termos novos em linguagem simples: [termo, significado]
 *   exemplos  [título, html], sempre com a conta feita
 *   erro      o engano mais comum sobre o tema
 *   resumo, teste, refs
 *
 * Regras de escrita: frases curtas, uma ideia por frase, termo técnico só
 * depois de explicado, e nenhum número sem fonte. */
'use strict';

module.exports = function (h) {
  const { brl, num, EX, ex15, ex30, LINK_EX, poder10, real, pu10, pu12 } = h;

  const TRILHAS = [
    { nome: 'Dinheiro em ordem', resumo: 'Antes de investir: saber para onde o dinheiro vai, sair das dívidas caras e montar a reserva.', requisito: 'Nada. Comece aqui.' },
    { nome: 'Como a economia funciona', resumo: 'Inflação, juros, PIB e as decisões do Banco Central: quatro forças que mexem com qualquer investimento.', requisito: 'Trilha 1 ajuda, mas não é obrigatória.' },
    { nome: 'O efeito do tempo', resumo: 'Juros compostos passo a passo, com a calculadora da Cerne.', requisito: 'Módulo 2.2, Juros.' },
    { nome: 'O mercado financeiro', resumo: 'Quem é quem, renda fixa, renda variável, risco e retorno, diversificação.', requisito: 'Trilhas 2 e 3.' },
    { nome: 'A cabeça do investidor', resumo: 'Três armadilhas da mente que custam dinheiro, e como escapar delas.', requisito: 'Trilha 4.' },
    { nome: 'Investir sem perder o sono', resumo: 'Como cuidar de você: lidar com a preocupação, olhar menos a carteira e manter a calma quando o mercado cai.', requisito: 'Trilha 5.' },
    { nome: 'O seu plano', resumo: 'Junta tudo em sete decisões, do orçamento à primeira carteira.', requisito: 'Todas as trilhas anteriores.' }
  ];

  const MODULOS = [
    /* ============================ TRILHA 1 ============================ */
    { trilha: 1, slug: 'orcamento', nome: 'Orçamento e objetivos', tempo: 7,
      chamada: 'Investir começa por saber quanto sobra no mês.',
      objetivo: 'Montar um orçamento simples e transformar um desejo em objetivo com valor e data.',
      frase: 'Orçamento é uma lista do que entra e do que sai. O que sobra é o que você pode guardar.',
      analogia: 'Pense num balde com furos. A água que entra é a sua renda. Os furos são os gastos. Antes de abrir mais a torneira, vale olhar onde estão os furos.',
      passos: [
        ['O que é um orçamento', `<p>É anotar, por um mês, tudo o que você recebe e tudo o que você gasta. No fim, você faz uma conta só: <b>o que entrou menos o que saiu</b>.</p><p>Se o resultado é positivo, sobrou. Se é negativo, faltou, e a diferença virou dívida.</p>`],
        ['Quatro passos para montar', `<p>O Banco Central sugere esta ordem (Banco Central do Brasil, 2013):</p><ol><li><b>Planejar.</b> Escreva quanto espera receber e gastar no mês.</li><li><b>Registrar.</b> Anote cada gasto no dia em que acontece.</li><li><b>Agrupar.</b> Junte os gastos parecidos: moradia, comida, transporte, lazer.</li><li><b>Avaliar.</b> Compare o planejado com o que aconteceu, e ajuste.</li></ol>`],
        ['Dois tipos de gasto', `<p><b>Gasto fixo</b> tem valor parecido todo mês: aluguel, internet, escola. Para diminuir, é preciso renegociar ou trocar.</p><p><b>Gasto variável</b> muda conforme o uso: mercado, lazer, aplicativos. É aqui que os cortes rápidos acontecem.</p>`],
        ['De desejo a objetivo', `<p>"Quero viajar" é um desejo. "Quero juntar R$ 6.000 em 12 meses para viajar" é um objetivo. A diferença é que o objetivo tem <b>valor</b> e <b>data</b>, e por isso já diz quanto guardar por mês.</p><p>Planejar assim dá resultado: uma revisão de estudos em vários países mostrou que quem entende de finanças planeja mais e junta mais patrimônio (Lusardi; Mitchell, 2014).</p>`]
      ],
      palavras: [['Receita', 'Todo dinheiro que entra: salário, bicos, aluguel recebido.'], ['Despesa', 'Todo dinheiro que sai.'], ['Sobra', 'Receita menos despesa. É o que dá para guardar.'], ['Objetivo financeiro', 'Algo que você quer, com valor e data.']],
      exemplos: [
        ['Um mês no papel', `<p>Entraram R$ 3.500. Gastos fixos: R$ 1.900. Gastos variáveis: R$ 1.250.</p><p>Conta: 3.500 − 1.900 − 1.250 = <b>R$ 350 de sobra</b>.</p><p>Sem anotar, esses R$ 350 costumam sumir em compras pequenas.</p>`],
        ['Quanto guardar por mês', `<p>Objetivo: R$ 6.000 em 12 meses. Conta: 6.000 ÷ 12 = <b>R$ 500 por mês</b>.</p><p>A sobra é de R$ 350. Faltam R$ 150. Há três saídas: cortar R$ 150 de gasto variável, esticar o prazo para 18 meses (R$ 333 por mês) ou diminuir o valor do objetivo.</p>`]
      ],
      erro: 'Achar que orçamento é só para quem ganha pouco. Quem ganha mais também gasta sem ver, e a sobra some do mesmo jeito.',
      resumo: ['Orçamento: o que entra menos o que sai.', 'Passos: planejar, registrar, agrupar, avaliar.', 'Objetivo tem valor e data. Sem os dois, é desejo.', 'A sobra do mês é o começo de todo investimento.'],
      teste: [
        { p: 'Qual frase é um objetivo financeiro?', o: ['Quero ter mais dinheiro.', 'Quero juntar R$ 12.000 em 24 meses para a entrada de um carro.', 'Quero gastar menos.'], c: 1, e: 'Tem valor e data. Dá para calcular: R$ 500 por mês.' },
        { p: 'Depois de registrar os gastos, o passo seguinte é:', o: ['Agrupar os gastos parecidos.', 'Investir a sobra.', 'Cortar todo o lazer.'], c: 0, e: 'A ordem é planejar, registrar, agrupar e avaliar.' },
        { p: 'Entram R$ 4.000. Saem R$ 2.300 de gastos fixos e R$ 1.400 de variáveis. Quanto sobra?', o: ['R$ 700', 'R$ 300', 'R$ 1.700'], c: 1, e: '4.000 − 2.300 − 1.400 = 300.' }
      ],
      refs: ['bcbCaderno', 'lusardi'] },

    { trilha: 1, slug: 'dividas-e-reserva', nome: 'Dívidas e reserva de emergência', tempo: 7,
      chamada: 'Duas coisas vêm antes do primeiro investimento.',
      objetivo: 'Entender por que pagar dívida cara vale mais do que investir, e calcular o tamanho da sua reserva.',
      frase: 'Primeiro pare de pagar juros altos. Depois guarde dinheiro para imprevistos. Só então invista.',
      analogia: 'Investir com dívida no cartão é como encher uma banheira com o ralo aberto. Feche o ralo primeiro.',
      passos: [
        ['Juros: quem paga e quem recebe', `<p><b>Juro</b> é o preço de usar dinheiro emprestado. Quem deve, paga juros. Quem investe, recebe juros.</p><p>Fazer as duas coisas ao mesmo tempo só compensa se você recebe mais do que paga. Com cartão de crédito, isso quase nunca acontece.</p>`],
        ['Por que a dívida do cartão é tão perigosa', `<p>Quando você paga só uma parte da fatura, o resto entra no <b>crédito rotativo</b>, uma das dívidas mais caras do país. Era tão cara que uma lei de 2023 precisou colocar um limite: os juros e encargos não podem passar do valor original da dívida (Brasil, 2023).</p><p>Repare no que isso quer dizer: mesmo com o limite, uma dívida de R$ 1.000 pode chegar a R$ 2.000.</p>`],
        ['A ordem certa', `<p>O material de educação financeira do Banco Central coloca assim: organizar o orçamento, sair das dívidas, e depois poupar e investir (Banco Central do Brasil, 2013).</p>`],
        ['O que é a reserva de emergência', `<p>É um dinheiro separado só para imprevistos: perder o emprego, um conserto urgente, um problema de saúde.</p><p>Ela precisa de duas coisas: poder ser sacada <b>na hora</b> e <b>não perder valor</b>. Render muito não é o papel dela.</p>`],
        ['Qual o tamanho', `<p>Não existe um número oficial. A regra prática dos planejadores é guardar alguns meses do seu custo de vida. Renda estável pede menos meses. Renda que varia, como a de quem é autônomo, pede mais.</p>`]
      ],
      palavras: [['Juros', 'O preço de usar dinheiro de outra pessoa por um tempo.'], ['Crédito rotativo', 'A dívida que nasce quando você não paga a fatura inteira do cartão.'], ['Liquidez', 'Facilidade de transformar uma aplicação em dinheiro na mão.'], ['Reserva de emergência', 'Dinheiro guardado só para imprevistos.']],
      exemplos: [
        ['A conta que decide', `<p>Você tem R$ 2.000 guardados e deve R$ 2.000 no cartão. Suponha que o guardado renda 1% ao mês e a dívida custe 12% ao mês (números só para ilustrar).</p><p>Em um mês você ganha R$ 20 e paga R$ 240. Usar o guardado para quitar a dívida é o melhor "investimento" disponível.</p>`],
        ['Tamanho da reserva', `<p>Seu custo de vida é de R$ 3.000 por mês.</p><p>Com emprego estável e seis meses de reserva: 6 × 3.000 = <b>R$ 18.000</b>.</p><p>Com renda instável e doze meses: 12 × 3.000 = <b>R$ 36.000</b>.</p><p>Parece muito. Guardando R$ 500 por mês, a primeira meta chega em três anos. O que importa é começar.</p>`]
      ],
      erro: 'Investir a reserva em algo que oscila para "render mais". No dia do imprevisto, o valor pode estar em baixa.',
      resumo: ['Dívida cara se paga antes de investir.', 'Reserva serve para imprevisto: saque rápido e sem risco de queda.', 'O tamanho se mede em meses do seu custo de vida.', 'Sem reserva, um imprevisto vira dívida.'],
      teste: [
        { p: 'O que é liquidez?', o: ['Render mais que a inflação.', 'Conseguir transformar a aplicação em dinheiro rapidamente.', 'Garantia de nunca perder.'], c: 1, e: 'Liquidez é a facilidade e a rapidez do saque.' },
        { p: 'Você tem dinheiro guardado e dívida no rotativo do cartão. Em geral, o melhor é:', o: ['Manter os dois.', 'Investir mais para compensar.', 'Usar o guardado para quitar a dívida.'], c: 2, e: 'Os juros do rotativo costumam ser muito maiores do que qualquer rendimento seguro.' },
        { p: 'Para que serve a reserva de emergência?', o: ['Para cobrir imprevistos sem fazer dívida.', 'Para render mais que a bolsa.', 'Para pagar as contas do mês.'], c: 0, e: 'Ela existe para o imprevisto.' }
      ],
      refs: ['bcbCaderno', 'lei14690'] },

    /* ============================ TRILHA 2 ============================ */
    { trilha: 2, slug: 'inflacao', nome: 'Inflação', tempo: 8,
      chamada: 'Por que R$ 100 compram menos hoje do que há dez anos.',
      objetivo: 'Entender o que é inflação, como ela é medida e quanto o seu dinheiro perde parado.',
      frase: 'Inflação é quando quase tudo fica mais caro ao mesmo tempo. O dinheiro continua o mesmo, mas compra menos.',
      analogia: 'Imagine uma nota de R$ 100 que encolhe um pouquinho todo ano. O número impresso não muda. O carrinho do mercado, sim.',
      passos: [
        ['O que é', `<p>Inflação é o aumento dos preços de produtos e serviços ao longo do tempo (IBGE, acesso em 2026).</p><p>Atenção a um detalhe: um produto subir sozinho não é inflação. Se só o tomate ficou caro por causa da chuva, é um preço que subiu. Inflação é quando <b>a maioria</b> dos preços sobe.</p>`],
        ['O que ela faz com o seu dinheiro', `<p>Ela diminui o <b>poder de compra</b>: quanto cada real consegue comprar. Dinheiro parado na gaveta ou na conta perde valor todo ano, mesmo sem você gastar nada.</p>`],
        ['Como é medida', `<p>Todo mês, o IBGE pesquisa os preços de uma lista grande de coisas que as famílias compram: comida, aluguel, transporte, remédio, escola. A variação dessa lista vira um número, chamado índice.</p><p>O índice oficial do Brasil é o <b>IPCA</b>. Ele representa famílias com renda de 1 a 40 salários mínimos (IBGE, acesso em 2026).</p>`],
        ['Por que os preços sobem', `<p>O FMI aponta três motivos (Oner, FMI, acesso em 2026):</p><ul><li><b>Muita gente querendo comprar</b> e pouco produto disponível.</li><li><b>Custo maior para produzir:</b> energia, matéria-prima, dólar.</li><li><b>Expectativa:</b> quem acha que tudo vai subir já aumenta o próprio preço.</li></ul>`],
        ['Inflação baixa e inflação alta', `<p>Um pouco de inflação é normal. O problema é quando ela dispara. Em 1993, antes do Plano Real, o IPCA subiu 2.477% em um único ano (IBGE, série histórica do IPCA). Os preços mudavam quase todo dia.</p>`]
      ],
      palavras: [['Inflação', 'Aumento da maioria dos preços ao mesmo tempo.'], ['Poder de compra', 'Quanto o seu dinheiro consegue comprar.'], ['IPCA', 'O índice oficial de inflação do Brasil, calculado pelo IBGE.'], ['Deflação', 'O contrário: a maioria dos preços caindo.']],
      exemplos: [
        ['R$ 100 depois de dez anos', `<p>Suponha inflação de 5% ao ano. A cada ano, os preços são multiplicados por 1,05.</p><p>Em dez anos: 1,05 multiplicado por ele mesmo dez vezes dá 1,629. O que custava R$ 100 passa a custar R$ 162,90.</p><p>Visto de outro lado: os seus R$ 100 guardados passam a comprar o que hoje se compra com 100 ÷ 1,629 = <b>${brl(poder10)}</b>.</p><p>Para corrigir um valor pela inflação que de fato aconteceu, use a Calculadora do Cidadão (Banco Central do Brasil, acesso em 2026).</p>`],
        ['A sua inflação pode ser outra', `<p>O IPCA é uma média de milhões de famílias. Se você gasta muito com aluguel e escola, sente mais os reajustes desses itens. A sua inflação pessoal pode ser maior ou menor que a oficial, e o índice continua certo.</p>`]
      ],
      erro: 'Descontar a inflação subtraindo. Com 10% de inflação, R$ 1.000 não passam a valer R$ 900. A conta é dividir: 1.000 ÷ 1,10 = R$ 909,09.',
      resumo: ['Inflação: a maioria dos preços subindo junto.', 'Efeito: o mesmo dinheiro compra menos.', 'No Brasil, o índice oficial é o IPCA, do IBGE.', 'Dinheiro parado perde valor. Investir começa por se defender disso.'],
      teste: [
        { p: 'Qual situação é inflação?', o: ['O tomate dobrou de preço por causa da chuva.', 'A maioria dos preços sobe ao longo do ano.', 'O salário mínimo aumentou.'], c: 1, e: 'Inflação é alta generalizada, e não de um produto só.' },
        { p: 'Qual é o índice oficial de inflação no Brasil?', o: ['IPCA', 'Selic', 'Ibovespa'], c: 0, e: 'O IPCA, calculado pelo IBGE.' },
        { p: 'Com inflação de 10% em um ano, R$ 1.000 guardados em casa passam a comprar o equivalente a:', o: ['R$ 900,00', 'R$ 909,09', 'R$ 1.100,00'], c: 1, e: '1.000 ÷ 1,10 = 909,09. Divide-se, não se subtrai.' }
      ],
      refs: ['ibgeInflacao', 'fmiInflacao', 'bcbCalc'] },

    { trilha: 2, slug: 'juros', nome: 'Juros', tempo: 8,
      chamada: 'O preço do dinheiro, e a diferença entre render e ganhar de verdade.',
      objetivo: 'Entender o que são Selic e CDI e calcular quanto um investimento rende acima da inflação.',
      frase: 'Juro é o aluguel do dinheiro. O que importa é quanto sobra depois de descontar a inflação.',
      analogia: 'Quem aluga uma casa paga aluguel ao dono. Quem usa dinheiro emprestado paga juros ao dono do dinheiro. Quando você investe, o dono é você.',
      passos: [
        ['O que é juro', `<p>É o preço de usar dinheiro por um tempo. Quem empresta fica sem o dinheiro e corre o risco de não receber. O juro paga pela espera e pelo risco.</p><p>A <b>taxa de juros</b> é esse preço em porcentagem: 1% ao mês, 10% ao ano.</p>`],
        ['Selic: a taxa que puxa as outras', `<p>A <b>Selic</b> é a taxa básica de juros do Brasil. Ela influencia as demais: empréstimos, financiamentos e aplicações (Banco Central do Brasil, acesso em 2026).</p><p>Quando a Selic sobe, o crédito fica mais caro e as aplicações mais seguras rendem mais. Quando cai, acontece o contrário.</p>`],
        ['CDI: o primo da Selic', `<p>O <b>CDI</b> é a taxa que os bancos cobram entre si em empréstimos de um dia. Ele anda colado na Selic.</p><p>Você vai ver muito a frase "rende 100% do CDI". Quer dizer: rende o mesmo que essa taxa.</p>`],
        ['Juro nominal e juro real', `<p><b>Juro nominal</b> é o que aparece no contrato ou no extrato. <b>Juro real</b> é o que sobra depois da inflação. É o real que diz se você ficou mais rico.</p><p>A conta foi formalizada pelo economista Irving Fisher (Fisher, 1930):</p><p class="formula">juro real = (1 + juro nominal) ÷ (1 + inflação) − 1</p><p>Na fórmula, as porcentagens entram como número decimal: 10% vira 0,10.</p>`],
        ['Por que o banco cobra mais do que paga', `<p>O banco paga uma taxa a quem aplica e cobra outra, maior, de quem pega emprestado. A diferença se chama <b>spread</b>. Ela cobre custos, impostos, calotes e o lucro do banco.</p>`]
      ],
      palavras: [['Taxa de juros', 'O preço do dinheiro em porcentagem, por mês ou por ano.'], ['Selic', 'A taxa básica de juros do Brasil.'], ['CDI', 'Taxa entre bancos, muito próxima da Selic. Referência das aplicações.'], ['Juro real', 'O ganho que sobra depois de descontar a inflação.'], ['Spread', 'Diferença entre o que o banco cobra e o que paga.']],
      exemplos: [
        ['Quanto sobrou de verdade', `<p>Uma aplicação rende 10% no ano. A inflação do ano foi de 4%.</p><p>Conta: 1,10 ÷ 1,04 − 1 = <b>${num(real)}%</b> de juro real.</p><p>Fazer 10 − 4 = 6 de cabeça é uma aproximação. Funciona com números pequenos e erra mais com números grandes.</p>`],
        ['Render e mesmo assim perder', `<p>Uma aplicação rende 3% no ano. A inflação foi de 5%.</p><p>Conta: 1,03 ÷ 1,05 − 1 = <b>−1,90%</b>. O saldo aumentou, mas compra menos do que antes.</p>`]
      ],
      erro: 'Olhar só o rendimento do extrato. Um investimento que rende menos que a inflação está encolhendo, mesmo com o saldo subindo.',
      resumo: ['Juro é o preço de usar dinheiro por um tempo.', 'Selic é a taxa básica. O CDI anda junto com ela.', 'Juro real = rendimento descontada a inflação.', 'Spread é a diferença entre o que o banco cobra e o que paga.'],
      teste: [
        { p: 'Uma aplicação rendeu 12% no ano e a inflação foi de 12%. O juro real foi:', o: ['12%', '0%', '24%'], c: 1, e: '1,12 ÷ 1,12 − 1 = 0. O poder de compra ficou igual.' },
        { p: 'O que é a Selic?', o: ['Um imposto.', 'O índice de inflação.', 'A taxa básica de juros do Brasil.'], c: 2, e: 'É a taxa que influencia as outras taxas do país.' },
        { p: 'Por que o empréstimo custa mais do que a aplicação rende?', o: ['Por causa do spread.', 'Porque a inflação só vale para quem deve.', 'Porque o CDI é maior que a Selic.'], c: 0, e: 'Spread é a diferença entre a taxa cobrada e a taxa paga.' }
      ],
      refs: ['bcbSelic', 'fisher'] },

    { trilha: 2, slug: 'pib', nome: 'PIB', tempo: 7,
      chamada: 'O número que mede o tamanho da economia, e o que ele não mostra.',
      objetivo: 'Entender o que o PIB mede e ler uma notícia sobre crescimento sem se confundir.',
      frase: 'PIB é a soma de tudo o que o país produziu em um período. Se ele cresce, a economia produziu mais.',
      analogia: 'Pense no PIB como o faturamento de uma padaria, só que do país inteiro. Mostra o tamanho do movimento. Não mostra se os funcionários estão bem.',
      passos: [
        ['O que é', `<p>PIB quer dizer Produto Interno Bruto. É a soma de todos os bens e serviços finais produzidos em um lugar, em um trimestre ou em um ano (IBGE, acesso em 2026).</p><p>No Brasil, quem calcula é o IBGE, a cada três meses.</p>`],
        ['Por que só os produtos "finais"', `<p>Para não contar a mesma coisa duas vezes. O trigo vira farinha, a farinha vira pão. Se somássemos trigo, farinha e pão, o trigo seria contado três vezes. Conta-se só o pão, que já tem os outros dentro do preço.</p>`],
        ['Quem compra o que o país produz', `<p>Uma forma de calcular o PIB é somar tudo o que foi comprado (Callen, FMI, acesso em 2026):</p><p class="formula">PIB = famílias + empresas + governo + (exportações − importações)</p><p>Ou seja: o que as famílias consumiram, o que as empresas investiram, o que o governo gastou e o saldo das vendas para fora.</p>`],
        ['O cuidado com a inflação', `<p>Se os preços sobem, o valor da produção sobe mesmo sem produzir mais nada. Por isso existem dois números:</p><ul><li><b>PIB nominal:</b> com os preços do ano.</li><li><b>PIB real:</b> já sem o efeito da inflação.</li></ul><p>Quando o jornal diz "o PIB cresceu 2%", está falando do PIB real.</p>`],
        ['Por que o investidor olha', `<p>PIB caindo por um bom tempo se chama <b>recessão</b>. As empresas vendem menos, contratam menos e lucram menos.</p>`],
        ['O que o PIB não mostra', `<p>Ele mede produção, não qualidade de vida. Não mostra se a renda está bem dividida, não conta o trabalho de casa e não desconta dano ao meio ambiente (Callen, FMI, acesso em 2026).</p>`]
      ],
      palavras: [['PIB', 'Soma de tudo o que foi produzido no país em um período.'], ['PIB real', 'O PIB sem o efeito da inflação.'], ['PIB per capita', 'O PIB dividido pelo número de habitantes.'], ['Recessão', 'Queda do PIB que dura um bom tempo.']],
      exemplos: [
        ['Crescer no papel', `<p>O PIB nominal subiu 8% em um ano. Os preços subiram 6%.</p><p>Conta: 1,08 ÷ 1,06 − 1 = <b>1,89%</b> de crescimento real. Quase todo o aumento foi preço.</p>`],
        ['O pão contado uma vez', `<p>O agricultor vende o trigo por R$ 1. O moinho vende a farinha por R$ 2,50. A padaria vende o pão por R$ 6.</p><p>No PIB entram os R$ 6. É o mesmo que somar o que cada um acrescentou: 1 + 1,50 + 3,50 = 6.</p>`]
      ],
      erro: 'Achar que PIB crescendo significa que todo mundo melhorou de vida. O PIB é uma soma: não diz como o resultado foi dividido.',
      resumo: ['PIB: tudo o que o país produziu em um período.', 'Na notícia, "crescimento" é do PIB real, já sem inflação.', 'PIB caindo por muito tempo é recessão.', 'PIB mede produção, não bem-estar.'],
      teste: [
        { p: 'Por que só produtos finais entram no PIB?', o: ['Porque os outros não têm valor.', 'Para não contar a mesma produção duas vezes.', 'Porque só eles pagam imposto.'], c: 1, e: 'O valor da farinha já está dentro do preço do pão.' },
        { p: 'O PIB nominal cresceu 5% e a inflação foi de 5%. O PIB real:', o: ['Ficou praticamente parado.', 'Cresceu 10%.', 'Cresceu 5%.'], c: 0, e: '1,05 ÷ 1,05 − 1 = 0. Só os preços subiram.' },
        { p: 'O que o PIB não mostra?', o: ['Quanto o país produziu.', 'Se a economia cresceu.', 'Como a renda está dividida entre as pessoas.'], c: 2, e: 'Para isso existem outros indicadores.' }
      ],
      refs: ['ibgePib', 'fmiPib'] },

    { trilha: 2, slug: 'politica-monetaria', nome: 'O Banco Central e os juros', tempo: 9,
      chamada: 'Como o Banco Central usa a Selic para segurar a inflação.',
      objetivo: 'Entender a meta de inflação, o que é o Copom e como uma decisão de juros chega à sua vida.',
      frase: 'Quando os preços sobem demais, o Banco Central aumenta os juros para esfriar a economia. Quando a economia esfria demais, ele diminui.',
      analogia: 'Pense no chuveiro. Água quente demais, você gira o registro. Mas a água demora a mudar. Quem mexe demais se queima ou passa frio. O Banco Central gira o registro dos juros, e também espera o efeito.',
      passos: [
        ['O nome difícil: política monetária', `<p>É o conjunto de decisões do banco central de um país sobre o custo do dinheiro. A ferramenta principal é a taxa básica de juros (Mathai, FMI, acesso em 2026). No Brasil, a Selic.</p>`],
        ['Qual é a missão do Banco Central', `<p>A lei diz que o objetivo principal do Banco Central é manter os preços estáveis. Ele também deve cuidar da saúde do sistema financeiro, suavizar os altos e baixos da economia e estimular o emprego (Brasil, 2021).</p>`],
        ['A meta de inflação', `<p>O Brasil trabalha com uma meta desde 1999. Funciona assim (Banco Central do Brasil, acesso em 2026):</p><ul><li>A meta é de <b>3% em doze meses</b>.</li><li>Há uma folga de 1,5 ponto para cima ou para baixo. Ou seja, entre 1,5% e 4,5% está dentro do combinado.</li><li>Se a inflação ficar fora dessa faixa por seis meses seguidos, o Banco Central precisa explicar o motivo em carta aberta ao Ministro da Fazenda.</li></ul><p>Quem define a meta é o Conselho Monetário Nacional. O Banco Central é quem tem de cumprir.</p>`],
        ['Quem decide a Selic', `<p>O <b>Copom</b>, um comitê formado pelo presidente e pelos diretores do Banco Central. Ele se reúne a cada 45 dias e, depois, explica a decisão por escrito (Banco Central do Brasil, acesso em 2026).</p>`],
        ['Como a decisão chega aos preços', `<p>O Banco Central lista cinco caminhos (Banco Central do Brasil, acesso em 2026). Com juro mais alto:</p><ol><li>Famílias e empresas <b>consomem e investem menos</b>.</li><li>O <b>dólar</b> tende a ficar mais barato, e o que é importado também.</li><li>O <b>preço dos ativos</b>, como ações e imóveis, tende a cair.</li><li>O <b>crédito</b> fica mais caro.</li><li>As pessoas passam a <b>esperar</b> inflação menor.</li></ol><p>Nada disso é imediato. A decisão leva tempo para fazer efeito, e por isso o Banco Central decide olhando para a frente (Mathai, FMI, acesso em 2026).</p>`],
        ['Onde ver os números de hoje', `<p>A Selic, o dólar e a inflação atuais estão no <a href="mercado.html">panorama de mercado</a>, com a data de cada dado.</p>`]
      ],
      palavras: [['Política monetária', 'As decisões do Banco Central sobre o custo do dinheiro.'], ['Meta de inflação', 'O nível de inflação que o país se compromete a buscar: 3% ao ano.'], ['Copom', 'O comitê do Banco Central que decide a Selic.'], ['CMN', 'Conselho Monetário Nacional. Define a meta de inflação.']],
      exemplos: [
        ['Uma alta de juros, do começo ao fim', `<p>A inflação está acima da meta. O Copom sobe a Selic. A parcela do carro financiado fica mais cara, e muita gente adia a compra. As lojas vendem menos e param de reajustar. Meses depois, a inflação cede.</p><p>O preço do remédio: nesse meio-tempo a economia anda mais devagar.</p>`],
        ['O efeito nos investimentos', `<p>Juro mais alto aumenta o rendimento das aplicações que acompanham a Selic. Ao mesmo tempo, atrapalha empresas com muita dívida e derruba o preço de títulos comprados com taxa fixa menor.</p><p>A mesma decisão ajuda uma parte da carteira e atrapalha outra. A <a href="mercado.html">leitura por setor</a> mostra isso.</p>`]
      ],
      erro: 'Achar que o Banco Central controla os preços diretamente. Ele só mexe nos juros. Os preços respondem depois, e nem sempre na medida esperada.',
      resumo: ['A missão principal do Banco Central é manter os preços estáveis.', 'A meta é de 3% em doze meses, com folga de 1,5 ponto.', 'O Copom decide a Selic a cada 45 dias.', 'Os juros agem com atraso, por consumo, dólar, ativos, crédito e expectativas.'],
      teste: [
        { p: 'Quem define a meta de inflação?', o: ['O Copom.', 'O Conselho Monetário Nacional.', 'O IBGE.'], c: 1, e: 'O CMN define a meta. O Banco Central usa a Selic para alcançá-la.' },
        { p: 'A inflação está acima da meta. O que se espera do Copom?', o: ['Subir a Selic.', 'Baixar a Selic.', 'Mudar o cálculo do IPCA.'], c: 0, e: 'Juro mais alto esfria o consumo e, com o tempo, segura os preços.' },
        { p: 'Uma mudança na Selic afeta os preços:', o: ['No mesmo dia.', 'Só se o dólar não mudar.', 'Com atraso, por vários caminhos.'], c: 2, e: 'Consumo, dólar, ativos, crédito e expectativas. Leva tempo.' }
      ],
      refs: ['lc179', 'bcbMeta', 'bcbCopom', 'bcbTransmissao', 'fmiMonetaria'] },

    /* ============================ TRILHA 3 ============================ */
    { trilha: 3, slug: 'juros-compostos', nome: 'Juros compostos, com a calculadora', tempo: 11,
      chamada: 'A conta mais importante dos investimentos, feita devagar.',
      objetivo: 'Entender cada parte da fórmula dos juros compostos e conferir um exemplo na calculadora da Cerne.',
      frase: 'Juros compostos são juros sobre juros: o que você ganha este mês também rende no mês que vem.',
      analogia: 'É uma bola de neve descendo o morro. No começo, pequena. A cada volta, pega mais neve, porque a própria bola já está maior. Quanto mais longo o morro, maior o resultado.',
      passos: [
        ['Juros simples e juros compostos', `<p>Nos <b>juros simples</b>, o ganho é sempre calculado sobre o valor inicial. Rende a mesma quantia todo mês.</p><p>Nos <b>juros compostos</b>, o ganho entra no saldo e passa a render também. A cada mês, a base é maior. Aplicações e dívidas funcionam assim (Banco Central do Brasil, 2013).</p>`],
        ['Três meses feitos na mão', `<p>Você aplica R$ 1.000 a 1% ao mês.</p><ul><li>Mês 1: 1.000 + 1% de 1.000 = <b>1.010,00</b></li><li>Mês 2: 1.010 + 1% de 1.010 = <b>1.020,10</b></li><li>Mês 3: 1.020,10 + 1% de 1.020,10 = <b>1.030,30</b></li></ul><p>Nos juros simples, daria R$ 1.030,00. Os trinta centavos de diferença são juros sobre juros. Parece nada. Com o tempo, vira a maior parte do resultado.</p>`],
        ['A fórmula', `<p>Fazer mês a mês cansa. A fórmula faz tudo de uma vez:</p><p class="formula">M = C × (1 + i)<sup>n</sup></p><ul><li><b>M</b> é o montante: quanto você terá no fim.</li><li><b>C</b> é o capital: quanto você aplicou.</li><li><b>i</b> é a taxa, escrita como decimal: 1% vira 0,01.</li><li><b>n</b> é o número de períodos: quantos meses ou anos.</li></ul><p>O "n" pequeno e elevado quer dizer: multiplique (1 + i) por ele mesmo n vezes. No exemplo: 1.000 × 1,01 × 1,01 × 1,01 = 1.030,30.</p>`],
        ['Quando você coloca dinheiro todo mês', `<p>O valor que você acrescenta a cada mês se chama <b>aporte</b>. Com aportes, a fórmula ganha uma segunda parte:</p><p class="formula">M = C × (1 + i)<sup>n</sup> + A × [ (1 + i)<sup>n</sup> − 1 ] ÷ i</p><p>Não precisa decorar. A primeira parte é o valor inicial rendendo. A segunda é a soma de todos os aportes (A), cada um rendendo pelo tempo que ficou aplicado. A calculadora faz essa conta para você.</p>`],
        ['Cuidado: taxa ao ano não se divide por doze', `<p>Parece lógico que 12% ao ano seja 1% ao mês. Não é. Como os juros se acumulam, 1% ao mês durante doze meses dá 12,68% no ano.</p><p>A taxa mensal que realmente equivale a 12% ao ano é 0,949%. A conta é:</p><p class="formula">taxa mensal = (1 + taxa anual)<sup>1/12</sup> − 1</p><p>A calculadora faz essa conversão sozinha quando você escolhe "ao ano".</p>`]
      ],
      palavras: [['Capital', 'O valor que você aplica no começo.'], ['Montante', 'O valor final: capital mais juros.'], ['Aporte', 'O valor que você acrescenta de tempos em tempos.'], ['Taxa equivalente', 'A taxa de um período que dá o mesmo resultado que a taxa de outro período.']],
      exemplos: [
        ['Exemplo guiado na calculadora', `
<ol class="guiado">
  <li><b>Abra a calculadora já preenchida.</b> <a class="btn btn-primario" href="${LINK_EX}">Abrir o exemplo na calculadora</a></li>
  <li><b>Confira os campos.</b> Valor inicial ${brl(EX.inicial, 0)}, aporte mensal ${brl(EX.aporte, 0)}, taxa de ${EX.taxa}% ao ano, prazo de ${EX.anos} anos.</li>
  <li><b>Veja a taxa convertida.</b> Abaixo do campo aparece "Equivale a ${num(ex15.taxaMes)}% ao mês". Esse é o i da fórmula. O n é ${EX.anos} × 12 = ${EX.anos * 12} meses.</li>
  <li><b>Leia o resultado.</b> Montante final: <b>${brl(ex15.saldo)}</b>. Você colocou ${brl(ex15.investido)} do seu bolso. Os outros ${brl(ex15.juros)} são juros.</li>
  <li><b>Agora mude o prazo para ${EX.anos * 2} anos.</b> Você coloca ${brl(ex30.investido)}, quase o dobro. O montante vai a <b>${brl(ex30.saldo)}</b>, ${num(ex30.saldo / ex15.saldo, 1)} vezes mais. Os juros passam a ser ${num(ex30.juros / ex30.saldo * 100, 0)}% do total.</li>
  <li><b>Passe o dedo ou o cursor no gráfico.</b> A faixa dos juros começa fina e engrossa. É a bola de neve.</li>
</ol>
<p class="nota">A simulação usa taxa constante e não desconta inflação, impostos e custos. Serve para entender a conta, não para prever rendimento. Para conferir em outra ferramenta, use a Calculadora do Cidadão (Banco Central do Brasil, acesso em 2026).</p>`],
        ['Atalho: a regra do 72', `<p>Para saber de cabeça em quanto tempo um valor dobra, divida 72 pela taxa anual.</p><p>A 8% ao ano: 72 ÷ 8 = <b>9 anos</b>. É uma aproximação, boa para taxas entre 4% e 12% ao ano.</p><p>Vale para dívida também: a 6% ao mês, ela dobra em cerca de 12 meses.</p>`]
      ],
      erro: 'Dar mais importância à taxa do que ao tempo. No exemplo, dobrar o prazo multiplicou o resultado por mais de quatro. Começar cedo pesa mais do que achar a melhor taxa.',
      resumo: ['Juros compostos: o ganho também passa a render.', 'Fórmula: M = C × (1 + i) elevado a n.', 'Taxa e prazo precisam estar na mesma unidade: mês com mês, ano com ano.', 'O tempo é o ingrediente mais forte.'],
      teste: [
        { p: 'R$ 2.000 a 10% ao ano, em juros compostos, viram quanto em 2 anos?', o: ['R$ 2.400,00', 'R$ 2.420,00', 'R$ 2.200,00'], c: 1, e: '2.000 × 1,10 × 1,10 = 2.420. Os R$ 20 a mais são juros sobre juros.' },
        { p: 'Por que 12% ao ano não é o mesmo que 1% ao mês?', o: ['Porque 1% ao mês, acumulado em doze meses, dá mais de 12%.', 'Porque o ano tem 365 dias.', 'Porque a inflação muda a taxa.'], c: 0, e: '1% ao mês acumula 12,68% no ano.' },
        { p: 'Pela regra do 72, em quanto tempo um valor dobra a 6% ao ano?', o: ['6 anos', '18 anos', '12 anos'], c: 2, e: '72 ÷ 6 = 12 anos.' }
      ],
      refs: ['bcbCaderno', 'bcbCalc'] },

    /* ============================ TRILHA 4 ============================ */
    { trilha: 4, slug: 'como-funciona-o-mercado', nome: 'Como o mercado financeiro funciona', tempo: 8,
      chamada: 'Quem empresta, quem pega emprestado, quem faz a ponte e quem fiscaliza.',
      objetivo: 'Saber para que serve o mercado financeiro, quem participa dele e onde reclamar.',
      frase: 'O mercado financeiro junta quem tem dinheiro sobrando com quem precisa de dinheiro.',
      analogia: 'Funciona como uma feira. De um lado, quem tem algo a oferecer. Do outro, quem precisa. No meio, as bancas que organizam a troca, e um fiscal para ninguém ser enganado.',
      passos: [
        ['Para que serve', `<p>Algumas pessoas têm dinheiro guardado. Governos e empresas precisam de dinheiro para obras, fábricas, lojas. O mercado financeiro faz esse encontro (CVM, 2019). Quem empresta ou vira sócio é remunerado por isso.</p>`],
        ['Quem é quem', `<p>O Banco Central organiza o sistema em três grupos (Banco Central do Brasil, acesso em 2026):</p><ul><li><b>Quem faz as regras:</b> o Conselho Monetário Nacional (CMN).</li><li><b>Quem fiscaliza:</b> o Banco Central cuida de bancos e financeiras. A <b>CVM</b> cuida de ações, fundos e outros investimentos.</li><li><b>Quem atende você:</b> bancos, corretoras e a bolsa.</li></ul>`],
        ['Bolsa e corretora', `<p>A <b>B3</b> é a bolsa de valores do Brasil: o lugar onde se compram e vendem ações e outros investimentos.</p><p>A <b>corretora</b> é a empresa que leva o seu pedido de compra ou venda até a bolsa. Você não negocia direto na B3.</p>`],
        ['Comprar de quem?', `<p>Há duas situações (CVM, 2019):</p><ul><li><b>Mercado primário:</b> a empresa ou o governo cria um investimento novo e recebe o dinheiro.</li><li><b>Mercado secundário:</b> investidores compram e vendem entre si o que já existe.</li></ul><p>Quando você compra uma ação na bolsa, quase sempre compra de outro investidor. A empresa não recebe nada.</p>`],
        ['As duas grandes famílias', `<p>Quase todo investimento cai em um destes grupos, que você vai ver nos próximos módulos: <a href="aula-renda-fixa.html">renda fixa</a>, em que você empresta dinheiro, e <a href="aula-renda-variavel.html">renda variável</a>, em que você vira sócio.</p>`]
      ],
      palavras: [['CVM', 'Órgão do governo que fiscaliza o mercado de ações e fundos.'], ['B3', 'A bolsa de valores brasileira.'], ['Corretora', 'Empresa que leva as suas ordens de compra e venda até a bolsa.'], ['Mercado secundário', 'Compra e venda entre investidores.']],
      exemplos: [
        ['O caminho de uma compra', `<p>Você transfere dinheiro para a sua conta na corretora e pede a compra. O pedido vai para a B3 e encontra o pedido de venda de outra pessoa. A bolsa registra o negócio. Dias depois, o investimento aparece no seu nome e o dinheiro chega ao vendedor.</p>`],
        ['Onde reclamar', `<p>Problema com conta, cartão ou empréstimo: Banco Central.</p><p>Problema com ações, fundos ou uma oferta estranha de investimento: CVM. O Portal do Investidor reúne alertas e material gratuito (CVM, acesso em 2026).</p>`]
      ],
      erro: 'Achar que a corretora ou a bolsa garantem o resultado. Elas só fazem a operação. O risco é de quem investe.',
      resumo: ['O mercado liga quem tem dinheiro a quem precisa.', 'CMN faz as regras. Banco Central e CVM fiscalizam.', 'Na bolsa, você quase sempre compra de outro investidor.', 'Antes de investir, confira se a empresa é autorizada pelo Banco Central ou pela CVM.'],
      teste: [
        { p: 'Quem fiscaliza o mercado de ações e fundos?', o: ['A B3.', 'A CVM.', 'O IBGE.'], c: 1, e: 'A CVM regula e fiscaliza esse mercado.' },
        { p: 'Você compra na bolsa uma ação que já existia. Quem recebe o dinheiro?', o: ['A empresa.', 'A CVM.', 'O investidor que vendeu.'], c: 2, e: 'É uma operação de mercado secundário.' },
        { p: 'O que a corretora faz?', o: ['Leva as suas ordens até a bolsa.', 'Define a taxa Selic.', 'Garante o lucro.'], c: 0, e: 'Ela faz a intermediação. Não garante resultado.' }
      ],
      refs: ['cvmTop', 'bcbSfn', 'cvmPortal'] },

    { trilha: 4, slug: 'renda-fixa', nome: 'Renda fixa', tempo: 9,
      chamada: 'Emprestar dinheiro com regra combinada. O que é fixo, e o que não é.',
      objetivo: 'Entender como funciona um investimento de renda fixa, os três jeitos de render e os três riscos.',
      frase: 'Na renda fixa você empresta dinheiro e combina antes como vai receber de volta.',
      analogia: 'É como emprestar dinheiro a um conhecido com tudo escrito: quanto, quando devolve e com quanto de juros. A diferença é que o "conhecido" é o governo, um banco ou uma empresa.',
      passos: [
        ['O que é', `<p>Quando você compra um investimento de renda fixa, está emprestando dinheiro. Quem recebe o empréstimo se chama <b>emissor</b>. O papel que registra essa dívida se chama <b>título</b>.</p><p>O "fixa" do nome engana. Fixa é a <b>regra</b> de como rende, combinada na compra. O preço do título pode subir e descer no caminho (CVM, 2019).</p>`],
        ['Para quem você empresta', `<p>Para três tipos de emissor:</p><ul><li>O <b>governo federal</b>, que usa os títulos públicos para financiar a dívida pública (Tesouro Nacional, acesso em 2026).</li><li>Os <b>bancos</b>.</li><li>As <b>empresas</b>.</li></ul><p>Quanto maior a chance de o emissor não pagar, mais juros ele precisa oferecer.</p>`],
        ['Três jeitos de render', `<ul><li><b>Prefixado:</b> a taxa é dita na compra, por exemplo 10% ao ano. Você já sabe quanto recebe no fim.</li><li><b>Pós-fixado:</b> rende junto com uma taxa que muda, como a Selic ou o CDI. Você só sabe o total no fim.</li><li><b>Híbrido:</b> mistura dos dois. Um pedaço acompanha a inflação e o outro é fixo, como "IPCA mais 5% ao ano". Protege o poder de compra.</li></ul>`],
        ['Três riscos', `<ul><li><b>Risco de crédito:</b> o emissor não pagar.</li><li><b>Risco de mercado:</b> o preço do título cair antes do fim do prazo.</li><li><b>Risco de liquidez:</b> você precisar do dinheiro e não conseguir vender, ou vender com desconto.</li></ul>`],
        ['Vender antes ou esperar', `<p>Todo título tem uma data final, o <b>vencimento</b>. Quem espera até lá recebe o combinado. Quem vende antes recebe o preço daquele dia, que pode ser maior ou menor.</p>`],
        ['A proteção do FGC', `<p>Algumas aplicações em bancos, como poupança e CDB, têm a garantia do <b>FGC</b>, o Fundo Garantidor de Créditos. Se o banco quebrar, o fundo devolve até R$ 250 mil por pessoa em cada instituição, com limite total de R$ 1 milhão a cada quatro anos.</p><p>Atenção: o FGC <b>não</b> cobre títulos públicos, fundos de investimento nem debêntures, que são títulos de dívida de empresas (FGC, acesso em 2026).</p>`]
      ],
      palavras: [['Emissor', 'Quem pega o dinheiro emprestado: governo, banco ou empresa.'], ['Título', 'O registro da dívida. É o que você compra.'], ['Vencimento', 'A data em que o emissor devolve o dinheiro.'], ['FGC', 'Fundo que protege parte das aplicações em bancos.'], ['Debênture', 'Título de dívida emitido por uma empresa.']],
      exemplos: [
        ['Por que o preço cai quando os juros sobem', `<p>Um título vai pagar R$ 1.000 daqui a um ano. Hoje os juros estão em 10% ao ano. Então ele vale 1.000 ÷ 1,10 = <b>${brl(pu10)}</b>.</p><p>Amanhã os juros sobem para 12%. Quem vai pagar ${brl(pu10)} por algo que rende 10%, se os títulos novos rendem 12%? Para alguém comprar, o preço precisa cair para 1.000 ÷ 1,12 = <b>${brl(pu12)}</b>.</p><p>Se você não vender e esperar um ano, recebe os R$ 1.000 do mesmo jeito.</p>`],
        ['Combinar prazo com objetivo', `<p>Dinheiro para daqui a dois anos pede um título que vença em cerca de dois anos. Um título de dez anos pode render mais, mas vai obrigar você a vender antes da hora, pelo preço do dia.</p>`]
      ],
      erro: 'Achar que renda fixa nunca dá prejuízo. Quem vende antes do vencimento, num momento de juros mais altos, pode receber menos do que pagou.',
      resumo: ['Renda fixa é empréstimo. Fixa é a regra, não o preço.', 'Rende de três jeitos: prefixado, pós-fixado ou híbrido.', 'Riscos: de crédito, de mercado e de liquidez.', 'O FGC cobre parte das aplicações em bancos, dentro de limites.'],
      teste: [
        { p: 'Você tem um título prefixado e os juros do país sobem. O preço do seu título:', o: ['Sobe.', 'Cai.', 'Não muda.'], c: 1, e: 'Os títulos novos pagam mais. O antigo só vende com desconto.' },
        { p: '"IPCA mais 5% ao ano" é um título:', o: ['Híbrido.', 'Prefixado.', 'Pós-fixado pela Selic.'], c: 0, e: 'Uma parte acompanha a inflação e a outra é fixa.' },
        { p: 'O que o FGC não cobre?', o: ['Poupança.', 'CDB de banco.', 'Fundos de investimento.'], c: 2, e: 'Fundos não têm a garantia do FGC.' }
      ],
      refs: ['cvmTop', 'tesouro', 'fgc'] },

    { trilha: 4, slug: 'renda-variavel', nome: 'Renda variável', tempo: 8,
      chamada: 'Virar sócio em vez de emprestar. De onde vem o ganho.',
      objetivo: 'Entender o que é uma ação, como o sócio ganha dinheiro e por que preço e valor são coisas diferentes.',
      frase: 'Na renda variável você vira dono de um pedaço de um negócio. Se o negócio vai bem, você ganha. Se vai mal, você perde.',
      analogia: 'Imagine entrar de sócio na pizzaria de um amigo. Ninguém promete quanto você vai receber. Depende de quantas pizzas a casa vende.',
      passos: [
        ['O que muda em relação à renda fixa', `<p>Na renda fixa, a regra de quanto rende é combinada. Na renda variável, não há combinado nenhum. O resultado depende de como o negócio se sai e de quanto outras pessoas aceitam pagar por ele.</p>`],
        ['O que é uma ação', `<p>É um pedacinho de uma empresa. Quem compra uma ação vira sócio, com direito a uma parte dos lucros (CVM, 2019).</p><p>Há dois tipos mais comuns: as <b>ordinárias</b>, que dão direito a voto nas decisões, e as <b>preferenciais</b>, que têm prioridade para receber lucros e em geral não votam.</p>`],
        ['Os dois jeitos de ganhar', `<ul><li><b>Dividendos:</b> a parte do lucro que a empresa distribui aos sócios.</li><li><b>Valorização:</b> vender a ação por mais do que pagou. Pode acontecer o contrário, e aí é prejuízo.</li></ul>`],
        ['O que quer dizer "a bolsa subiu"', `<p>Ninguém acompanha centenas de ações uma a uma. Usa-se um <b>índice</b>: uma lista de ações que serve de termômetro. O mais conhecido no Brasil é o <b>Ibovespa</b>, criado em 1968, com as ações mais negociadas da B3 (B3, acesso em 2026).</p><p>"A bolsa subiu 1%" quer dizer que esse termômetro subiu 1%.</p>`],
        ['Preço não é valor', `<p><b>Preço</b> é quanto a ação custa hoje. Muda a cada segundo, conforme o humor de quem compra e vende. <b>Valor</b> é quanto a empresa vale pelo que produz e lucra. Muda devagar.</p><p>Os dois se afastam o tempo todo. Estudar a empresa para ter uma referência de valor é a ideia central da análise fundamentalista, proposta por Benjamin Graham (Graham, 1949). É o que ensina o <a href="metodo.html">método de estudo de empresas</a>.</p>`]
      ],
      palavras: [['Ação', 'Um pedaço de uma empresa.'], ['Dividendo', 'Parte do lucro paga aos sócios.'], ['Índice', 'Lista de ações usada como termômetro do mercado.'], ['Ibovespa', 'O principal índice da bolsa brasileira.']],
      exemplos: [
        ['Somando os dois ganhos', `<p>Você compra uma ação por R$ 20. Em um ano, recebe R$ 1 de dividendos e a ação passa a custar R$ 23.</p><p>Ganho: 3 de valorização + 1 de dividendo = R$ 4. Sobre os R$ 20 pagos: 4 ÷ 20 = <b>20%</b>.</p><p>Se o preço tivesse caído para R$ 17: −3 + 1 = −2. Resultado: 2 ÷ 20 = <b>10% de perda</b>, mesmo com o dividendo.</p>`],
        ['Emprestar ou ser sócio da mesma empresa', `<p>Quem empresta à empresa recebe os juros combinados, vendendo ela muito ou pouco. E recebe antes dos sócios se ela quebrar.</p><p>Quem é sócio não tem nada garantido, mas fica com tudo o que sobrar depois de pagar as dívidas. Mais risco, e chance de ganhar mais.</p>`]
      ],
      erro: 'Comprar porque "está subindo". Preço em alta não diz se a empresa é boa. Diz só que hoje há mais gente comprando do que vendendo.',
      resumo: ['Renda variável não tem rendimento combinado.', 'Ação é um pedaço de uma empresa.', 'O ganho vem de dividendos e de valorização, que pode ser negativa.', 'Preço muda com o humor do mercado. Valor depende do negócio.'],
      teste: [
        { p: 'Quem compra uma ação se torna:', o: ['Credor da empresa.', 'Sócio da empresa.', 'Cliente da empresa.'], c: 1, e: 'A ação é um pedaço da empresa.' },
        { p: 'Compra a R$ 50, recebe R$ 2 de dividendos e o preço termina em R$ 48. O resultado foi:', o: ['Nem ganho nem perda.', 'Perda de 4%.', 'Ganho de 4%.'], c: 0, e: '−2 de preço + 2 de dividendo = 0.' },
        { p: 'O que é o Ibovespa?', o: ['A taxa de juros.', 'O órgão que fiscaliza a bolsa.', 'Um índice com as ações mais negociadas da B3.'], c: 2, e: 'É o termômetro mais usado da bolsa brasileira.' }
      ],
      refs: ['cvmTop', 'b3Ibov', 'graham'] },

    { trilha: 4, slug: 'risco-e-retorno', nome: 'Risco e retorno', tempo: 8,
      chamada: 'Por que não existe ganho alto sem risco.',
      objetivo: 'Entender a relação entre risco e retorno e descobrir quanto risco cabe na sua vida.',
      frase: 'Quem quer a chance de ganhar mais precisa aceitar a chance de perder. As duas coisas vêm no mesmo pacote.',
      analogia: 'É como escolher entre uma estrada reta e um atalho pela serra. O atalho pode ser mais rápido. Também tem mais curvas, e às vezes fecha.',
      passos: [
        ['O que é cada um', `<p><b>Retorno</b> é quanto um investimento rendeu ou pode render.</p><p><b>Risco</b> é não saber ao certo qual vai ser o resultado. Quanto maior a chance de sair diferente do esperado, para cima ou para baixo, maior o risco.</p>`],
        ['Por que andam juntos', `<p>Ninguém aceita incerteza de graça. Para correr mais risco, as pessoas exigem a chance de ganhar mais. Esse ganho a mais se chama <b>prêmio de risco</b>.</p><p>A palavra importante é <b>chance</b>. Não é garantia. Um estudo com mais de cem anos de dados de vários países mostrou que as ações renderam mais que a renda fixa no longo prazo, mas com períodos longos de perda no caminho (Dimson; Marsh; Staunton, 2002).</p>`],
        ['Como se enxerga o risco', `<p>Uma forma simples é olhar quanto o preço balança. Esse sobe e desce se chama <b>volatilidade</b>. Preço que balança muito, risco maior.</p>`],
        ['Dois tipos de risco', `<p>A teoria separa assim (Sharpe, 1964):</p><ul><li><b>Risco de uma empresa só:</b> a fábrica pega fogo, o dono administra mal.</li><li><b>Risco de todo mundo:</b> recessão, alta de juros, crise.</li></ul><p>O primeiro dá para reduzir espalhando o dinheiro. É o assunto do <a href="aula-diversificacao.html">próximo módulo</a>. O segundo, não.</p>`],
        ['Quanto risco é para você', `<p>Depende de três coisas: <b>para que</b> é o dinheiro, <b>quando</b> você vai precisar dele e <b>quanto de queda</b> você aguenta sem entrar em pânico.</p><p>Bancos e corretoras são obrigados a perguntar isso antes de oferecer um produto. É o questionário de <b>perfil do investidor</b> (CVM, 2021).</p>`]
      ],
      palavras: [['Retorno', 'O quanto um investimento rende.'], ['Risco', 'A incerteza sobre o resultado.'], ['Volatilidade', 'O quanto o preço sobe e desce.'], ['Prêmio de risco', 'O ganho a mais esperado por aceitar mais incerteza.'], ['Perfil do investidor', 'Quanto risco combina com você.']],
      exemplos: [
        ['Mesma média, caminhos diferentes', `<p>O investimento A rende 8% todo ano. O investimento B rende +30% num ano e −14% no outro. Na média, os dois dão 8%.</p><p>R$ 1.000 em A, depois de dois anos: 1.000 × 1,08 × 1,08 = <b>R$ 1.166,40</b>.</p><p>R$ 1.000 em B: 1.000 × 1,30 × 0,86 = <b>R$ 1.118,00</b>.</p><p>Balançar custa dinheiro, e exige estômago.</p>`],
        ['A promessa que não fecha', `<p>Alguém oferece "3% ao mês, garantido, sem risco". Isso dá 42,6% ao ano. Se existisse de verdade, os bancos pegariam esse dinheiro para aplicar ali.</p><p>Ganho muito acima da Selic com risco zero é erro ou golpe. A CVM publica alertas sobre ofertas irregulares (CVM, acesso em 2026).</p>`]
      ],
      erro: 'Responder ao questionário de perfil pensando no ganho. A pergunta certa é: quanto de queda eu aguento ver sem vender tudo?',
      resumo: ['Risco é não saber ao certo o resultado.', 'Mais chance de ganho vem com mais chance de perda.', 'Risco de uma empresa se reduz espalhando. Risco geral, não.', 'O seu risco depende do objetivo, do prazo e do seu estômago.'],
      teste: [
        { p: 'O que é prêmio de risco?', o: ['Um bônus da corretora.', 'O ganho a mais esperado por aceitar mais incerteza.', 'A garantia de que o risco compensa.'], c: 1, e: 'É uma chance, não uma garantia.' },
        { p: 'Qual destes riscos atinge todos os investimentos ao mesmo tempo?', o: ['Uma alta forte dos juros.', 'A troca do presidente de uma empresa.', 'Um incêndio em uma fábrica.'], c: 0, e: 'Juros mexem com a economia inteira.' },
        { p: 'Uma oferta promete ganho alto, garantido e sem risco. O mais provável é:', o: ['Uma boa oportunidade.', 'Um risco pequeno.', 'Um risco escondido, ou golpe.'], c: 2, e: 'Ganho alto sem risco não existe.' }
      ],
      refs: ['sharpe', 'dimson', 'cvm30', 'cvmPortal'] },

    { trilha: 4, slug: 'diversificacao', nome: 'Diversificação', tempo: 7,
      chamada: 'Não colocar todos os ovos na mesma cesta, e por que isso funciona.',
      objetivo: 'Entender por que dividir o dinheiro reduz o risco, e reconhecer a falsa diversificação.',
      frase: 'Diversificar é dividir o dinheiro entre investimentos diferentes, para que um tropeço não derrube tudo.',
      analogia: 'Um agricultor que planta só soja perde tudo num ano ruim para a soja. Quem planta soja, milho e cria gado dificilmente tem um ano ruim nos três.',
      passos: [
        ['A ideia', `<p>Se todo o seu dinheiro está em uma coisa só, o seu resultado depende só dela. Dividindo, o que vai mal em um lugar pode ser compensado pelo que vai bem em outro.</p>`],
        ['Por que funciona', `<p>O economista Harry Markowitz mostrou que o risco de um conjunto de investimentos não é a soma dos riscos de cada um. Depende de como eles se comportam <b>juntos</b> (Markowitz, 1952).</p><p>Se dois investimentos sobem e caem ao mesmo tempo, juntá-los ajuda pouco. Se reagem de formas diferentes, um amortece o outro. Esse "andar junto ou separado" se chama <b>correlação</b>.</p>`],
        ['Diversificar de verdade', `<p>Dez ações de bancos não diversificam: todas sofrem com os mesmos problemas. O que conta é misturar coisas <b>diferentes</b>:</p><ul><li>Tipos de investimento: renda fixa e renda variável.</li><li>Setores da economia.</li><li>Emissores e empresas.</li><li>Países.</li></ul>`],
        ['O limite', `<p>Diversificar reduz o risco de uma empresa ou de um setor. Não elimina o risco que atinge tudo, como uma recessão (Sharpe, 1964).</p><p>E o benefício vai diminuindo: um estudo clássico estimou que, em ações, a maior parte do ganho aparece até algo entre trinta e quarenta empresas. Depois disso, muda pouco (Statman, 1987).</p>`],
        ['O custo', `<p>Cada investimento a mais é um a mais para acompanhar. Ter muitas empresas que você nunca estudou não é diversificar. É não saber o que tem.</p>`]
      ],
      palavras: [['Diversificar', 'Dividir o dinheiro entre investimentos diferentes.'], ['Correlação', 'O quanto dois investimentos sobem e caem juntos.'], ['Classe de investimento', 'Um grande grupo, como renda fixa ou ações.']],
      exemplos: [
        ['Guarda-chuva e protetor solar', `<p>Uma loja vende só guarda-chuva. Outra, só protetor solar. Em ano de chuva, a primeira lucra e a segunda sofre. Em ano de sol, o contrário.</p><p>Quem é sócio das duas tem um resultado mais estável, sem precisar adivinhar o tempo.</p>`],
        ['A falsa diversificação', `<p>Uma carteira com cinco construtoras e três fundos de imóveis parece ter oito apostas. Quando os juros sobem e o financiamento de imóveis encarece, as oito caem juntas.</p><p>É uma aposta só, repetida oito vezes.</p>`]
      ],
      erro: 'Contar a quantidade. Vinte investimentos parecidos protegem menos do que quatro bem diferentes.',
      resumo: ['Diversificar é não depender de uma coisa só.', 'O que protege é a diferença entre os investimentos, não a quantidade.', 'O risco que atinge tudo continua existindo.', 'Tenha só o que você consegue acompanhar.'],
      teste: [
        { p: 'Qual carteira é mais diversificada?', o: ['Dez ações de bancos.', 'Renda fixa, ações de setores diferentes e investimentos no exterior.', 'Vinte ações do mesmo setor.'], c: 1, e: 'O que conta é a diferença entre os investimentos.' },
        { p: 'Que risco a diversificação não elimina?', o: ['O que atinge todos ao mesmo tempo, como uma recessão.', 'O de uma empresa quebrar.', 'O de um setor ir mal.'], c: 0, e: 'Esse risco atinge a carteira inteira.' },
        { p: 'Dois investimentos com correlação alta:', o: ['Protegem muito um ao outro.', 'Nunca caem juntos.', 'Costumam subir e cair juntos.'], c: 2, e: 'Por isso juntá-los ajuda pouco.' }
      ],
      refs: ['markowitz', 'sharpe', 'statman'] },

    /* ============================ TRILHA 5 ============================ */
    { trilha: 5, slug: 'aversao-a-perda', nome: 'Medo de perder', tempo: 7,
      chamada: 'Perder R$ 100 dói mais do que ganhar R$ 100 alegra. Isso muda as suas decisões.',
      objetivo: 'Reconhecer o medo de perder nas suas escolhas e aprender duas formas de se proteger dele.',
      frase: 'A dor de perder é cerca de duas vezes mais forte que a alegria de ganhar o mesmo valor.',
      analogia: 'Achar uma nota de R$ 50 na rua deixa o dia bom. Perder uma nota de R$ 50 estraga o dia inteiro. O valor é o mesmo. O sentimento, não.',
      passos: [
        ['Primeiro: o que é um viés', `<p>Viés é um erro de julgamento que se repete, sempre para o mesmo lado. Não é falta de inteligência. É o jeito como a mente humana funciona, e todo mundo tem.</p><p>Saber que ele existe não faz o viés sumir. Mas permite criar regras para se proteger.</p>`],
        ['O que os pesquisadores descobriram', `<p>Os psicólogos Daniel Kahneman e Amos Tversky mostraram que as pessoas não pensam em "quanto tenho". Pensam em "ganhei ou perdi" em relação a um ponto de partida. E a perda pesa mais (Kahneman; Tversky, 1979).</p><p>Em um estudo seguinte, eles mediram: uma perda pesa cerca de duas vezes mais que um ganho igual (Tversky; Kahneman, 1992). O nome técnico é <b>aversão à perda</b>.</p>`],
        ['Como isso aparece nos investimentos', `<p>Para quem investe, o ponto de partida costuma ser o preço que pagou. Daí vêm dois comportamentos:</p><ul><li>Vender rápido o que subiu, para "garantir" o lucro.</li><li>Segurar o que caiu, para não admitir a perda.</li></ul><p>Esse par se chama <b>efeito disposição</b> (Shefrin; Statman, 1985).</p>`],
        ['Isso foi medido', `<p>O pesquisador Terrance Odean analisou dez mil contas de uma corretora dos Estados Unidos. As pessoas vendiam com lucro muito mais do que vendiam com prejuízo. E as ações vendidas renderam, depois, mais do que as que foram mantidas (Odean, 1998). Ou seja: venderam as boas e ficaram com as ruins.</p>`],
        ['Por que é um erro', `<p>O mercado não sabe quanto você pagou, e não se importa. O preço de compra é passado. A decisão de manter ou vender deveria olhar para a frente: o negócio continua bom?</p>`]
      ],
      palavras: [['Viés', 'Erro de julgamento que se repete sempre na mesma direção.'], ['Aversão à perda', 'Sentir a perda com mais força do que o ganho.'], ['Efeito disposição', 'Vender o que subiu e segurar o que caiu.']],
      exemplos: [
        ['"Só vendo quando voltar ao que paguei"', `<p>Você comprou a R$ 30. Hoje vale R$ 18. A empresa perdeu o principal cliente e a dívida aumentou.</p><p>Esperar os R$ 30 é deixar o passado decidir. Faça este teste: se hoje você tivesse o dinheiro em vez da ação, compraria essa empresa por R$ 18?</p><p>Se a resposta é não, o único motivo para ficar é a dor de admitir a perda.</p>`],
        ['Olhar toda hora', `<p>Em um único dia, os preços caem quase tanto quanto sobem. Quem confere a carteira todo dia vê perdas o tempo todo. Como cada perda dói em dobro, a pessoa conclui que está indo mal e vende na hora errada.</p><p>Conferir a cada três meses mostra o mesmo investimento com muito menos sustos.</p>`]
      ],
      erro: 'Achar que "só perde quem vende". A perda já aconteceu quando o preço caiu. Vender ou não muda apenas o que acontece daqui para a frente.',
      resumo: ['Perder pesa cerca de duas vezes mais que ganhar.', 'Isso leva a vender o que subiu e segurar o que caiu.', 'O preço que você pagou não diz nada sobre o futuro.', 'Proteção: escrever antes os motivos para vender, e olhar a carteira com menos frequência.'],
      teste: [
        { p: 'O que é o efeito disposição?', o: ['Correr mais risco depois de ganhar.', 'Vender o que subiu e segurar o que caiu.', 'Vontade de diversificar.'], c: 1, e: 'É a consequência prática do medo de perder.' },
        { p: 'Qual pergunta ajuda a decidir sobre uma ação que caiu?', o: ['"Sabendo o que sei hoje, eu compraria por este preço?"', '"Quanto falta para voltar ao que paguei?"', '"Quanto eu já perdi?"'], c: 0, e: 'As outras duas olham para o passado.' },
        { p: 'Segundo Tversky e Kahneman (1992), uma perda pesa, comparada a um ganho igual:', o: ['O mesmo.', 'A metade.', 'Cerca de duas vezes mais.'], c: 2, e: 'Daí a dificuldade de vender com prejuízo.' }
      ],
      refs: ['kt1979', 'tk1992', 'shefrin', 'odean'] },

    { trilha: 5, slug: 'vies-de-confirmacao', nome: 'Só ouvir quem concorda', tempo: 7,
      chamada: 'Depois de formar uma opinião, a mente procura quem dê razão a ela.',
      objetivo: 'Perceber quando você está procurando só o que confirma a sua ideia, e aprender a testá-la.',
      frase: 'Tendemos a procurar o que confirma o que já pensamos e a ignorar o que contraria.',
      analogia: 'É o torcedor vendo o jogo. A falta contra o seu time foi roubo. A falta a favor foi clara. O lance é o mesmo. O olhar é que muda.',
      passos: [
        ['O que é', `<p>O nome técnico é <b>viés de confirmação</b>: buscar, entender e lembrar as informações de um jeito que confirma o que a pessoa já acredita (Nickerson, 1998).</p>`],
        ['O experimento dos números', `<p>O psicólogo Peter Wason mostrou a voluntários a sequência 2, 4, 6. Eles tinham de descobrir a regra, sugerindo outras sequências e ouvindo "segue a regra" ou "não segue".</p><p>Quase todos pensaram "números pares, de dois em dois" e testaram só exemplos assim: 8, 10, 12. Ouviam "segue" e ficavam cada vez mais certos.</p><p>A regra era outra, bem mais simples: números em ordem crescente. Para descobrir, bastava testar algo que <b>contrariasse</b> a própria ideia, como 1, 2, 3. Quase ninguém tentou (Wason, 1960).</p>`],
        ['Nos investimentos', `<p>A história costuma ser assim: a pessoa gosta de uma empresa, compra, e passa a ler só as notícias boas sobre ela. As ruins viram "exagero" ou "perseguição".</p><p>Redes sociais pioram: mostram mais do que a pessoa já consome.</p>`],
        ['O perigo', `<p>A confiança aumenta sem nenhuma informação nova. A ideia parece cada vez mais firme, quando apenas foi repetida muitas vezes.</p>`],
        ['Como se proteger', `<p>Fazendo o que os voluntários não fizeram: <b>tentando derrubar a própria ideia</b>. Se ela sobreviver a uma crítica séria, ficou mais forte. Se não sobreviver, você economizou dinheiro.</p>`]
      ],
      palavras: [['Viés de confirmação', 'Tendência de procurar só o que dá razão ao que já pensamos.'], ['Tese', 'O motivo, por escrito, pelo qual você acha que um investimento é bom.']],
      exemplos: [
        ['A pergunta decide a resposta', `<p>Pesquise "por que a empresa X vai crescer" e você encontra dez textos animados. Pesquise "riscos da empresa X" e encontra dez textos preocupados. A empresa é a mesma.</p><p>Faça sempre as duas buscas.</p>`],
        ['Três fatos que fariam você mudar de ideia', `<p>Antes de comprar, escreva três coisas que provariam que você errou. Por exemplo: o lucro cair dois anos seguidos, a dívida passar de certo tamanho, o principal produto perder clientes.</p><p>Depois, a cada três meses, confira a lista. É o que pede a etapa 7 do <a href="metodo.html#etapa-7">método</a>.</p>`]
      ],
      erro: 'Confundir repetição com prova. Ler dez vezes a mesma opinião não a torna mais verdadeira.',
      resumo: ['Procuramos o que confirma e descartamos o que contraria.', 'Repetir não é provar.', 'Teste a sua ideia tentando derrubá-la.', 'Escreva antes o que faria você mudar de opinião.'],
      teste: [
        { p: 'No experimento de Wason, qual foi o erro mais comum?', o: ['Desistir cedo.', 'Testar só exemplos que confirmavam a própria ideia.', 'Chutar sequências sem pensar.'], c: 1, e: 'Sem um teste que pudesse dar "não", ninguém achava a regra.' },
        { p: 'O que ajuda contra esse viés?', o: ['Ler mais análises favoráveis.', 'Seguir quem pensa igual.', 'Procurar o melhor argumento contrário.'], c: 2, e: 'A ideia precisa aguentar a crítica mais forte.' },
        { p: 'Você tem uma ação e sai uma notícia ruim sobre a empresa. O viés leva você a:', o: ['Tratar a notícia como exagero.', 'Vender na hora.', 'Reler a sua tese com calma.'], c: 0, e: 'Descartar o que contraria é a marca do viés.' }
      ],
      refs: ['wason', 'nickerson'] },

    { trilha: 5, slug: 'efeito-manada', nome: 'Seguir a multidão', tempo: 7,
      chamada: 'Quando todo mundo compra, comprar parece seguro. É aí que mora o risco.',
      objetivo: 'Entender por que copiar os outros parece certo, quanto pode custar e como criar distância.',
      frase: 'Fazer o que todos estão fazendo dá sensação de segurança. Mas a multidão pode estar só copiando a si mesma.',
      analogia: 'Você vê uma fila enorme na porta de uma loja e entra nela sem saber o que vende. Quem está atrás de você fez o mesmo. No fim, ninguém na fila sabe por que está ali.',
      passos: [
        ['O que é', `<p>O nome técnico é <b>efeito manada</b>: imitar a maioria e deixar de lado a própria análise.</p>`],
        ['Por que parece inteligente', `<p>Muitas vezes é. Se um restaurante está cheio, a comida deve ser boa. O problema começa quando cada pessoa copia a anterior <b>sem saber nada a mais</b>.</p><p>O economista Abhijit Banerjee mostrou que, a partir de certo ponto, as pessoas passam a ignorar o que elas mesmas sabem e só seguem a fila. E a fila inteira pode estar errada (Banerjee, 1992).</p>`],
        ['A fila que desmancha', `<p>Outro estudo chamou isso de <b>cascata</b>: uma sequência de pessoas imitando as anteriores. Como quase ninguém ali tem informação de verdade, qualquer notícia nova pode desfazer tudo de repente (Bikhchandani; Hirshleifer; Welch, 1992).</p>`],
        ['Na bolsa', `<p>O preço sobe. A alta vira notícia. A notícia atrai mais compradores. O preço sobe mais. Ninguém olhou a empresa. Quando vira, todos correm para a saída ao mesmo tempo.</p>`],
        ['Mexer demais também custa', `<p>Um estudo acompanhou mais de 66 mil famílias clientes de uma corretora dos Estados Unidos, de 1991 a 1996. As que mais compravam e vendiam ganharam 11,4% ao ano. O mercado rendeu 17,9% no mesmo período. A diferença foi embora em custos e decisões apressadas (Barber; Odean, 2000).</p>`]
      ],
      palavras: [['Efeito manada', 'Copiar a maioria sem analisar por conta própria.'], ['Cascata', 'Fila de pessoas imitando umas às outras.'], ['Euforia', 'Empolgação exagerada, que faz ignorar riscos.']],
      exemplos: [
        ['A dica do grupo', `<p>O mesmo investimento aparece em três grupos de mensagens no mesmo dia, com gráficos subindo e gente contando lucro. Dá a sensação de estar ficando para trás.</p><p>Repare no que está faltando: ninguém explicou de onde vem o dinheiro do negócio, quem administra, quanto vale. Só há preço, e pressa.</p>`],
        ['A regra das 48 horas', `<p>Quando a vontade de comprar ou vender vier de uma notícia ou de um grupo, anote a ideia e espere dois dias.</p><p>Nesse tempo, faça pelo menos as etapas 2 e 5 do <a href="metodo.html">método</a>: entender o negócio e ler as contas. Uma oportunidade boa aguenta 48 horas. A empolgação, quase nunca.</p>`]
      ],
      erro: 'Pensar "tanta gente não pode estar errada". Pode, se cada um só copiou o anterior.',
      resumo: ['Copiar a maioria parece seguro, mas a maioria pode não saber nada.', 'Filas assim se desfazem de uma hora para outra.', 'Quem negociou demais ganhou menos que o mercado.', 'Proteção: um intervalo entre a ideia e a ação, preenchido com estudo.'],
      teste: [
        { p: 'O que é uma cascata?', o: ['Excesso de notícias.', 'Uma sequência de pessoas imitando as anteriores.', 'Um relatório com muitas fontes.'], c: 1, e: 'Como se apoia em pouca informação, desmancha rápido.' },
        { p: 'No estudo de Barber e Odean (2000), quem mais comprava e vendia:', o: ['Ganhou menos que o mercado.', 'Ganhou mais que o mercado.', 'Ganhou o mesmo, com menos risco.'], c: 0, e: '11,4% ao ano contra 17,9% do mercado.' },
        { p: 'O que ajuda contra o efeito manada?', o: ['Comprar rápido.', 'Entrar em mais grupos.', 'Esperar um prazo fixo e estudar antes de decidir.'], c: 2, e: 'O intervalo troca a pressa por informação.' }
      ],
      refs: ['banerjee', 'bhw', 'barber'] },

    /* ============================ TRILHA 6 ============================ */
    { trilha: 6, slug: 'dinheiro-e-estresse', nome: 'Dinheiro e preocupação', tempo: 7,
      chamada: 'Preocupar-se com dinheiro é comum, cansa a cabeça e tem jeito.',
      objetivo: 'Entender como a preocupação com dinheiro afeta as suas decisões e o que é, de fato, estar bem financeiramente.',
      frase: 'Estar bem com o dinheiro não é ter muito. É ter controle, folga para imprevistos e um plano.',
      analogia: 'A preocupação com dinheiro é como um aplicativo aberto no fundo do celular. Você não está olhando para ele, mas ele gasta bateria o dia inteiro.',
      passos: [
        ['Você não está sozinho', `<p>Preocupar-se com dinheiro é uma das experiências mais comuns que existem, em qualquer faixa de renda. Sentir isso não é sinal de fraqueza nem de que você está fazendo tudo errado.</p>`],
        ['A preocupação ocupa espaço na cabeça', `<p>Um estudo publicado na revista Science mostrou que pessoas com um aperto financeiro em mente se saíram pior em testes de raciocínio. Não por serem menos capazes: a preocupação estava usando parte da atenção delas (Mani e outros, 2013).</p><p>Isso tem uma consequência prática. Decisões importantes sobre dinheiro, tomadas no auge da preocupação, tendem a sair piores.</p>`],
        ['O que é estar bem financeiramente', `<p>Um órgão de defesa do consumidor dos Estados Unidos perguntou a pessoas comuns e a especialistas o que é bem-estar financeiro. A resposta teve quatro partes (CFPB, 2015):</p><ol><li><b>Controle do dia a dia:</b> pagar as contas em dia, sem sufoco.</li><li><b>Folga para imprevistos:</b> aguentar um gasto inesperado.</li><li><b>Estar no caminho dos seus objetivos.</b></li><li><b>Liberdade de escolha:</b> poder aproveitar a vida.</li></ol><p>Repare: nenhuma das quatro é "ter muito dinheiro" nem "ganhar da bolsa".</p>`],
        ['Sentir-se bem importa tanto quanto os números', `<p>Pesquisadores mediram duas coisas separadas: a tensão com o dinheiro de hoje e a tranquilidade com o futuro. As duas pesaram no bem-estar geral das pessoas, em nível comparável ao do trabalho e da saúde (Netemeyer e outros, 2018).</p>`],
        ['O que diminui a preocupação', `<p>Os três passos da Trilha 1 atacam justamente as quatro partes acima: saber para onde o dinheiro vai, sair das dívidas caras e ter reserva. A reserva, em especial, é o que transforma um imprevisto de crise em incômodo.</p>`]
      ],
      palavras: [['Bem-estar financeiro', 'Ter controle do dia a dia, folga para imprevistos, objetivos encaminhados e liberdade de escolha.'], ['Estresse financeiro', 'Tensão causada por preocupação com dinheiro.']],
      exemplos: [
        ['Duas pessoas, mesma renda', `<p>Ana e Bia ganham o mesmo. Ana não anota os gastos, não tem reserva e confere o saldo com medo. Bia sabe quanto sobra, tem quatro meses de reserva e investe um valor fixo.</p><p>Quando a geladeira das duas quebra, Ana parcela no cartão e perde o sono. Bia usa a reserva e repõe em três meses. A renda é igual. O bem-estar, não.</p>`],
        ['Tirar da cabeça e pôr no papel', `<p>Escreva três listas curtas: o que você deve, o que você tem e o que vence neste mês. Leva vinte minutos.</p><p>Um problema escrito tem tamanho e prazo. Um problema só na cabeça parece não ter fim.</p>`]
      ],
      erro: 'Achar que a tranquilidade vem quando o saldo chegar a certo número. Ela vem de ter controle e um plano, e isso dá para construir desde já.',
      resumo: ['Preocupar-se com dinheiro é comum e não é fraqueza.', 'A preocupação consome atenção e piora as decisões.', 'Bem-estar financeiro: controle, folga, objetivos e liberdade.', 'Orçamento, dívidas em dia e reserva são o que mais acalma.'],
      teste: [
        { p: 'Segundo o CFPB (2015), o que faz parte do bem-estar financeiro?', o: ['Ganhar mais que os colegas.', 'Ter controle do dia a dia e folga para imprevistos.', 'Acertar as melhores ações.'], c: 1, e: 'As quatro partes são controle, folga, objetivos e liberdade de escolha.' },
        { p: 'O que o estudo de Mani e outros (2013) mostrou?', o: ['Preocupação com dinheiro consome atenção e piora o raciocínio.', 'Quem se preocupa investe melhor.', 'Dinheiro não afeta as decisões.'], c: 0, e: 'A preocupação ocupa parte da capacidade de pensar.' },
        { p: 'Qual é um bom momento para uma decisão grande sobre dinheiro?', o: ['No auge da preocupação.', 'Logo depois de uma notícia ruim.', 'Com a cabeça mais calma e as contas no papel.'], c: 2, e: 'Decisão tomada sob tensão tende a sair pior.' }
      ],
      refs: ['mani', 'cfpb', 'netemeyer'] },

    { trilha: 6, slug: 'olhar-menos', nome: 'Olhar menos a carteira', tempo: 7,
      chamada: 'Conferir os investimentos toda hora aumenta a ansiedade e piora o resultado.',
      objetivo: 'Entender por que olhar demais faz mal e montar uma rotina de acompanhamento mais leve.',
      frase: 'Quanto mais vezes você olha, mais quedas você vê. E cada queda dói em dobro.',
      analogia: 'É como se pesar de hora em hora durante uma dieta. O número sobe e desce por motivos que não importam, você se irrita e desiste. Quem se pesa uma vez por mês enxerga a direção.',
      passos: [
        ['Por que olhar demais dá a impressão errada', `<p>Em prazos curtos, os preços caem quase tanto quanto sobem. Em prazos longos, a direção aparece. Então quem olha todo dia vê muitas quedas. Quem olha uma vez por ano vê bem menos.</p><p>O investimento é o mesmo. O que muda é o número de sustos.</p>`],
        ['A soma com o medo de perder', `<p>Você viu no <a href="aula-aversao-a-perda.html">módulo 5.1</a> que perder dói cerca de duas vezes mais que ganhar. Junte as duas coisas: olhar muito e sentir cada queda em dobro. Os economistas Shlomo Benartzi e Richard Thaler deram a isso o nome de <b>aversão míope à perda</b>. "Míope" porque a pessoa enxerga só o que está perto (Benartzi; Thaler, 1995).</p>`],
        ['O experimento', `<p>Pesquisadores dividiram voluntários em grupos que investiam o mesmo dinheiro de mentira. Um grupo via o resultado com muita frequência. Outro, só de vez em quando.</p><p>Quem via com mais frequência escolheu investimentos mais tímidos e terminou com menos dinheiro. Quem via menos correu mais risco, com calma, e ganhou mais (Thaler e outros, 1997).</p>`],
        ['Informação demais não é controle', `<p>Conferir a cotação dá sensação de estar cuidando. Mas o preço do dia não diz nada sobre o negócio. O que diz são os resultados da empresa, que saem a cada três meses.</p>`],
        ['Uma rotina mais leve', `<ul><li><b>Marque no calendário.</b> Um dia a cada três meses para olhar a carteira, junto com os resultados das empresas.</li><li><b>Desligue os avisos</b> de cotação no celular.</li><li><b>Tire o aplicativo da tela inicial.</b></li><li><b>Deixe o aporte automático</b>, para investir sem precisar abrir o aplicativo.</li></ul>`]
      ],
      palavras: [['Aversão míope à perda', 'Olhar com muita frequência e sofrer com cada queda pequena.'], ['Cotação', 'O preço de um investimento em um dado momento.'], ['Aporte automático', 'Investimento agendado, que acontece sozinho todo mês.']],
      exemplos: [
        ['O mesmo ano, visto de dois jeitos', `<p>Imagine um investimento que termina o ano com ganho. No caminho, ele teve muitos dias de queda e muitos de alta.</p><p>Quem olhou todo dia sentiu cada uma dessas quedas, e cada uma pesou em dobro. Quem olhou uma vez, em dezembro, viu só o ganho.</p><p>Nenhum dos dois ganhou mais dinheiro. Um deles passou o ano mais tranquilo, e teve menos chance de vender na hora errada.</p>`],
        ['Teste de uma semana', `<p>Por sete dias, anote cada vez que você abrir o aplicativo de investimentos e o que fez depois. Na maioria das vezes, a resposta vai ser "nada, só olhei".</p><p>Se olhar não muda nenhuma decisão, olhar só serve para preocupar.</p>`]
      ],
      erro: 'Achar que bom investidor é quem acompanha tudo de perto. Acompanhar o negócio a cada trimestre é cuidado. Acompanhar o preço a cada hora é ansiedade.',
      resumo: ['Olhar muitas vezes mostra muitas quedas.', 'Cada queda dói em dobro, e a soma leva a decisões ruins.', 'No experimento, quem viu menos ganhou mais.', 'Rotina: olhar a cada três meses, sem avisos, com aporte automático.'],
      teste: [
        { p: 'Por que olhar a carteira todo dia aumenta a ansiedade?', o: ['Porque os preços só caem.', 'Porque em prazos curtos há muitas quedas, e cada uma dói mais que um ganho igual.', 'Porque o aplicativo cobra por acesso.'], c: 1, e: 'É a aversão míope à perda (Benartzi; Thaler, 1995).' },
        { p: 'No experimento de Thaler e outros (1997), quem via o resultado com menos frequência:', o: ['Terminou com mais dinheiro.', 'Terminou com menos dinheiro.', 'Desistiu de investir.'], c: 0, e: 'Sem os sustos, aceitou mais risco e ganhou mais.' },
        { p: 'Qual hábito ajuda a investir com mais calma?', o: ['Ligar os avisos de cotação.', 'Conferir o preço antes de dormir.', 'Marcar um dia a cada três meses para revisar.'], c: 2, e: 'Revisão com data marcada troca o susto por rotina.' }
      ],
      refs: ['benartziThaler', 'thaler1997'] },

    { trilha: 6, slug: 'calma-na-queda', nome: 'Calma quando o mercado cai', tempo: 8,
      chamada: 'Quedas vão acontecer. O que dá para preparar é a sua reação.',
      objetivo: 'Montar, com antecedência, um pequeno plano para os dias de queda, e saber quando procurar ajuda.',
      frase: 'Você não controla o mercado. Controla o que faz quando ele cai. E dá para decidir isso antes.',
      analogia: 'É o treino de incêndio do prédio. Ninguém decide a rota de fuga no meio da fumaça. Decide antes, com calma, e na hora só segue o combinado.',
      passos: [
        ['Queda faz parte', `<p>Quem investe em qualquer coisa que oscila vai ver o próprio dinheiro diminuir em algum momento. Não é sinal de erro. É o preço de buscar um ganho maior, como você viu em <a href="aula-risco-e-retorno.html">risco e retorno</a>.</p>`],
        ['Emoção forte atrapalha', `<p>Um estudo acompanhou pessoas que compravam e vendiam ações todos os dias. As que tinham reações emocionais mais fortes aos ganhos e às perdas tiveram os piores resultados (Lo; Repin; Steenbarger, 2005).</p><p>A lição não é "não sinta nada". É: não decida no pico da emoção.</p>`],
        ['Separe o que é seu do que não é', `<p><b>Você não controla:</b> o preço de amanhã, as notícias, os juros, o que os outros fazem.</p><p><b>Você controla:</b> quanto guarda, o tamanho da sua reserva, como divide o dinheiro, quantas vezes olha e o que faz quando cai.</p><p>Gastar energia com a primeira lista só cansa. A segunda é onde o seu esforço rende.</p>`],
        ['O plano "se acontecer isso, eu faço aquilo"', `<p>O psicólogo Peter Gollwitzer estudou planos escritos nesse formato: "se acontecer X, então eu faço Y". As pessoas que decidiam antes como agir cumpriam muito mais o que tinham se proposto (Gollwitzer, 1999).</p><p>Para investimentos, pode ser assim:</p><ul><li>"Se a minha carteira cair 20%, então eu releio o meu plano antes de fazer qualquer coisa."</li><li>"Se eu sentir vontade de vender tudo, então eu espero 48 horas."</li><li>"Se eu ler uma notícia assustadora, então eu confiro se os fatos da minha tese mudaram."</li></ul>`],
        ['Cuide do corpo também', `<p>Sono, comida e movimento afetam a clareza de qualquer decisão. Uma regra simples: nada de decisão grande sobre dinheiro tarde da noite, com fome ou logo depois de uma discussão.</p>`],
        ['Quando procurar ajuda', `<p>Se a preocupação com dinheiro está tirando o seu sono por semanas, atrapalhando o trabalho ou os seus relacionamentos, isso já não é assunto de investimento. É assunto de saúde, e merece cuidado de um profissional: médico ou psicólogo.</p><p>Se você precisa conversar agora, o CVV atende de graça, 24 horas, pelo telefone 188 (CVV, acesso em 2026).</p>`]
      ],
      palavras: [['Plano "se, então"', 'Decidir antes o que você fará quando algo acontecer.'], ['Tese', 'O motivo, por escrito, de você ter feito um investimento.'], ['Volatilidade', 'O sobe e desce dos preços.']],
      exemplos: [
        ['Um cartão para os dias ruins', `<p>Escreva num papel e guarde junto do seu plano:</p><p>"1. Respirar e não abrir o aplicativo hoje. 2. A minha reserva está inteira? 3. Os meus objetivos e prazos mudaram? 4. Os fatos da minha tese mudaram? 5. Se nada mudou, não faço nada. Se algo mudou, espero 48 horas e decido."</p><p>No dia da queda, você não precisa pensar. Só ler.</p>`],
        ['A mesma queda, duas pessoas', `<p>A carteira de Caio e a de Davi caem 20% no mesmo mês. Caio não tem reserva e precisa do dinheiro em seis meses. Davi tem reserva e só vai usar o dinheiro em quinze anos.</p><p>Para Caio, a queda é um problema real. Para Davi, é um número na tela. A diferença não está na coragem. Está no preparo feito antes.</p>`]
      ],
      erro: 'Confiar que "na hora eu vou manter a calma". Quase ninguém mantém. Quem atravessa bem é quem deixou as regras escritas.',
      resumo: ['Quedas fazem parte de investir.', 'Decisão no pico da emoção costuma sair ruim.', 'Foque no que você controla: reserva, divisão, frequência, reação.', 'Escreva antes o seu plano "se acontecer isso, eu faço aquilo".', 'Se a preocupação afeta a sua saúde, procure um profissional.'],
      teste: [
        { p: 'O que é um plano "se, então"?', o: ['Uma previsão do mercado.', 'Decidir antes o que fazer quando algo acontecer.', 'Uma ordem automática de venda.'], c: 1, e: 'Quem decide antes cumpre mais (Gollwitzer, 1999).' },
        { p: 'Qual destes itens você controla?', o: ['O tamanho da sua reserva.', 'O preço de amanhã.', 'A decisão do Copom.'], c: 0, e: 'É na lista do que você controla que o esforço rende.' },
        { p: 'A preocupação com dinheiro está tirando o seu sono há semanas. O melhor caminho é:', o: ['Investir em algo mais arriscado para recuperar.', 'Olhar a carteira com mais frequência.', 'Procurar um profissional de saúde.'], c: 2, e: 'Quando afeta a saúde, deixou de ser assunto de investimento.' }
      ],
      refs: ['lo2005', 'gollwitzer', 'cvv'] },

    /* ============================ TRILHA 7 ============================ */
    { trilha: 7, slug: 'plano-pessoal', nome: 'Seu plano de investimento', tempo: 8,
      chamada: 'Tudo o que você viu, na ordem em que as decisões devem ser tomadas.',
      objetivo: 'Sair com sete decisões em ordem, do orçamento à primeira divisão do dinheiro, e saber qual ferramenta usar em cada uma.',
      frase: 'Um plano é uma página escrita por você, para ler nos dias em que a emoção quiser decidir.',
      analogia: 'É a lista de compras do mercado. Sem ela, você leva o que está na altura dos olhos. Com ela, leva o que precisa.',
      passos: [
        ['O que é', `<p>Um plano de investimento é um texto curto, seu, que responde: para que serve este dinheiro, quando vou precisar dele e quais são as minhas regras.</p>`],
        ['As sete decisões, em ordem', `<ol><li><b>Orçamento.</b> Descubra quanto sobra por mês. (<a href="aula-orcamento.html">Módulo 1.1</a>)</li><li><b>Dívidas caras.</b> Pague antes de investir. (<a href="aula-dividas-e-reserva.html">Módulo 1.2</a>)</li><li><b>Reserva de emergência.</b> Monte em algo seguro e de saque rápido.</li><li><b>Objetivos por prazo.</b> Separe o que é para até dois anos, de dois a dez, e mais de dez. (<a href="aula-risco-e-retorno.html">Módulo 4.4</a>)</li><li><b>Perfil.</b> Quanto de queda você aguenta sem vender?</li><li><b>Divisão.</b> Quanto vai para renda fixa, renda variável e exterior. (<a href="aula-diversificacao.html">Módulo 4.5</a>)</li><li><b>Aportes e revisão.</b> Invista todo mês. Reveja uma ou duas vezes por ano.</li></ol><p>A ordem importa mais do que a escolha de cada produto.</p>`],
        ['Por que o prazo manda', `<p>Dinheiro para daqui a um ano não pode estar em algo que balança muito: pode estar em baixa justamente no dia em que você precisa. Dinheiro para daqui a vinte anos aguenta balançar.</p>`],
        ['Perfil é regra, não formalidade', `<p>As instituições são obrigadas a verificar se um produto combina com o perfil do cliente antes de oferecê-lo (CVM, 2021). Responda com sinceridade. O questionário protege você.</p>`],
        ['Deixe no automático', `<p>Em um programa estudado por Richard Thaler e Shlomo Benartzi, funcionários combinaram com antecedência que guardariam um pouco mais a cada aumento de salário. Em quarenta meses, passaram de 3,5% para 13,6% da renda guardada (Thaler; Benartzi, 2004).</p><p>Decidir uma vez e deixar acontecer funciona melhor do que decidir todo mês.</p>`],
        ['O plano também diz o que você não faz', `<p>Por exemplo: não investir no que não entendo, não mudar tudo por causa de uma notícia, não usar a reserva para "aproveitar uma oportunidade".</p>`],
        ['A decisão é sua', `<p>Nenhum site, aplicativo ou pessoa conhece a sua vida como você. Tudo o que está aqui serve para você entender o assunto. O plano, as escolhas e a responsabilidade por elas são seus. Estude, compare fontes e decida.</p>`]
      ],
      palavras: [['Plano de investimento', 'Texto seu que diz para que serve o dinheiro, o prazo e as regras.'], ['Aporte', 'Valor investido de tempos em tempos.'], ['Rebalancear', 'Voltar a carteira à divisão que você escolheu.']],
      exemplos: [
        ['Um plano em seis linhas', `<p>"Sobra por mês: R$ 800. Reserva: quero R$ 18.000, faltam R$ 6.000. Objetivos: entrada de um imóvel em cinco anos e aposentadoria em trinta. Aguento ver a parte de longo prazo cair 25% sem vender. Até completar a reserva, tudo vai para ela. Depois, sigo a divisão que eu definir. Revisão em janeiro e julho."</p>`],
        ['As ferramentas, na ordem', `<p>A <a href="juros.html">calculadora de juros compostos</a> mostra quanto os aportes viram em cada prazo. A de <a href="liberdade.html">liberdade financeira</a> ajuda a dar tamanho ao objetivo de longo prazo. O roteiro <a href="carteira/">Monte sua carteira</a> chega a uma divisão por tipo de investimento. Para escolher empresas, há o <a href="metodo.html">método de estudo</a>.</p><p>As ferramentas fazem contas. Quem decide é você.</p>`]
      ],
      erro: 'Começar pela pergunta "em que eu invisto?". Ela é a sexta da lista. Sem as cinco anteriores, não tem resposta certa.',
      resumo: ['Plano é para ser escrito e relido nos dias difíceis.', 'Ordem: orçamento, dívidas, reserva, objetivos, perfil, divisão, aportes.', 'O prazo de cada objetivo define quanto risco cabe.', 'Automatizar o aporte funciona melhor do que decidir todo mês.', 'A decisão e a responsabilidade são suas.'],
      teste: [
        { p: 'O que vem antes de definir a divisão do dinheiro?', o: ['Escolher as ações.', 'Reserva, objetivos e perfil.', 'Prever os juros.'], c: 1, e: 'A divisão depende do prazo dos objetivos e do risco que você aguenta.' },
        { p: 'Para que serve escrever o plano?', o: ['Para reler quando der vontade de agir por impulso.', 'Para mostrar à corretora.', 'Para garantir o ganho.'], c: 0, e: 'É a regra que você criou com calma.' },
        { p: 'O que o estudo de Thaler e Benartzi (2004) sugere?', o: ['Investir uma vez por ano rende mais.', 'Guardar dinheiro depende só da renda.', 'Combinar antes e automatizar faz guardar mais.'], c: 2, e: 'Os participantes foram de 3,5% para 13,6% da renda em quarenta meses.' }
      ],
      refs: ['cvm30', 'thalerSmart'] }
  ];

  return { TRILHAS, MODULOS };
};
