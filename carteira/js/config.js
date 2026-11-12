/* ==========================================================================
 * Monte sua carteira — CONFIGURAÇÃO ÚNICA
 * --------------------------------------------------------------------------
 * DATA DE REFERÊNCIA DAS PREMISSAS E DO FALLBACK MACRO:  10/11/2026
 *
 * Tudo o que é premissa, hipótese ou dado de reserva (fallback) fica aqui.
 * Para atualizar o app, edite este arquivo e mude a data acima e o campo
 * `dataReferencia` logo abaixo. Nenhum outro arquivo precisa mudar.
 *
 * IMPORTANTE: nada aqui é previsão nem recomendação. São hipóteses
 * educacionais, escolhidas para serem simples e auditáveis.
 * ========================================================================== */
(function (root) {
  'use strict';

  var CONFIG = {
    versao: '1.0.0',
    dataReferencia: '10/11/2026',

    /* ---------------------------------------------------------------------
     * 1) Classes de ativos (genéricas — nunca produtos específicos)
     *    `cor` e `padrao` são usados em TODOS os gráficos, sempre iguais.
     * ------------------------------------------------------------------- */
    classes: [
      { id: 'reserva',   nome: 'Reserva de liquidez',            curto: 'Reserva',        cor: '#5E86AD', padrao: 'liso',
        oQueE: 'Dinheiro para imprevistos, em aplicações de baixíssimo risco e resgate imediato.' },
      { id: 'pos',       nome: 'Renda fixa pós-fixada',          curto: 'Pós-fixada',     cor: '#2B8574', padrao: 'diagonal',
        oQueE: 'Títulos cujo rendimento acompanha a taxa básica de juros (Selic/CDI). Oscilam pouco.' },
      { id: 'pre',       nome: 'Renda fixa prefixada',           curto: 'Prefixada',      cor: '#6B8C3B', padrao: 'pontos',
        oQueE: 'Títulos com taxa combinada na compra. Se vendidos antes do vencimento, o preço pode variar.' },
      { id: 'ipca',      nome: 'Renda fixa atrelada à inflação', curto: 'Inflação',       cor: '#B07E1A', padrao: 'horizontal',
        oQueE: 'Títulos que pagam a inflação (IPCA) mais uma taxa fixa. Protegem o poder de compra no longo prazo.' },
      { id: 'acoes_br',  nome: 'Ações Brasil',                   curto: 'Ações Brasil',   cor: '#BF4F3C', padrao: 'contradiagonal',
        oQueE: 'Participação em empresas brasileiras negociadas em bolsa. Podem oscilar bastante.' },
      { id: 'acoes_int', nome: 'Ações internacionais',           curto: 'Ações exterior', cor: '#7A5AA3', padrao: 'xadrez',
        oQueE: 'Participação em empresas de outros países. Diversificam o risco do Brasil e do real.' },
      { id: 'fii',       nome: 'Imobiliário (fundos listados)',  curto: 'Imobiliário',    cor: '#C4718F', padrao: 'vertical',
        oQueE: 'Fundos negociados em bolsa que investem em imóveis ou em títulos do setor imobiliário.' },
      { id: 'multi',     nome: 'Multimercado',                   curto: 'Multimercado',   cor: '#6B7480', padrao: 'grade',
        oQueE: 'Fundos que misturam várias estratégias (juros, moedas, ações) na mesma carteira.' },
      { id: 'alt',       nome: 'Alternativos / proteção',        curto: 'Alternativos',   cor: '#996A3A', padrao: 'ondas',
        oQueE: 'Ativos que tendem a se comportar de forma diferente das ações e dos juros, como ouro e moedas fortes.' }
    ],

    /* ---------------------------------------------------------------------
     * 2) Perfis (índice 0 a 4)
     * ------------------------------------------------------------------- */
    perfis: [
      { id: 'conservador',          nome: 'Conservador',          frase: 'Prioriza proteger o que já tem. Aceita oscilações muito pequenas.' },
      { id: 'moderado_conservador', nome: 'Moderado-conservador', frase: 'Aceita um pouco de oscilação em troca de algum crescimento acima da inflação.' },
      { id: 'moderado',             nome: 'Moderado',             frase: 'Equilibra proteção e crescimento. Tolera quedas temporárias.' },
      { id: 'moderado_arrojado',    nome: 'Moderado-arrojado',    frase: 'Busca crescimento no longo prazo e convive com quedas relevantes no caminho.' },
      { id: 'arrojado',             nome: 'Arrojado',             frase: 'Prioriza crescimento no longo prazo e aceita grandes oscilações.' }
    ],

    /* ---------------------------------------------------------------------
     * 3) Reserva de emergência (Passo 1 do motor)
     * ------------------------------------------------------------------- */
    reserva: {
      mesesPadrao: 6,     // renda estável
      mesesInstavel: 12   // renda variável ou instável (estabilidade <= 1)
    },

    /* ---------------------------------------------------------------------
     * 4) Baldes por prazo (Passo 2)
     *    curto: até 2 anos | médio: acima de 2 até 5 | longo: acima de 5
     *    Balde curto NUNCA tem renda variável.
     *    Balde médio usa o perfil rebaixado em `rebaixaMedio` degraus.
     * ------------------------------------------------------------------- */
    baldes: {
      limiteCurto: 2,
      limiteMedio: 5,
      alocCurto: { pos: 100 },
      rebaixaMedio: 2
    },

    /* ---------------------------------------------------------------------
     * 5) Alocação-base por perfil (Passo 3) — % da parcela de investimentos
     *    (sem a reserva). Cada linha soma 100.
     * ------------------------------------------------------------------- */
    base: [
      /* conservador          */ { pos: 55, pre: 10, ipca: 25, acoes_br: 3,  acoes_int: 2,  fii: 3,  multi: 2, alt: 0 },
      /* moderado-conservador */ { pos: 40, pre: 10, ipca: 27, acoes_br: 6,  acoes_int: 5,  fii: 5,  multi: 5, alt: 2 },
      /* moderado             */ { pos: 27, pre: 10, ipca: 25, acoes_br: 12, acoes_int: 10, fii: 7,  multi: 6, alt: 3 },
      /* moderado-arrojado    */ { pos: 17, pre: 8,  ipca: 22, acoes_br: 18, acoes_int: 15, fii: 9,  multi: 6, alt: 5 },
      /* arrojado             */ { pos: 10, pre: 5,  ipca: 17, acoes_br: 25, acoes_int: 22, fii: 10, multi: 5, alt: 6 }
    ],

    /* Faixas [mínimo, máximo] por classe e perfil. O ajuste tático nunca
     * leva uma classe para fora da faixa. */
    faixas: [
      { pos: [40, 80], pre: [0, 20], ipca: [10, 30], acoes_br: [0, 8],   acoes_int: [0, 6],   fii: [0, 8],  multi: [0, 8],  alt: [0, 3] },
      { pos: [25, 65], pre: [0, 20], ipca: [12, 30], acoes_br: [2, 12],  acoes_int: [0, 10],  fii: [0, 10], multi: [0, 10], alt: [0, 5] },
      { pos: [12, 50], pre: [0, 20], ipca: [10, 30], acoes_br: [5, 20],  acoes_int: [4, 16],  fii: [2, 12], multi: [0, 12], alt: [0, 7] },
      { pos: [5, 40],  pre: [0, 18], ipca: [8, 30],  acoes_br: [10, 26], acoes_int: [8, 22],  fii: [3, 14], multi: [0, 12], alt: [0, 9] },
      { pos: [3, 30],  pre: [0, 15], ipca: [5, 27],  acoes_br: [15, 30], acoes_int: [12, 28], fii: [4, 15], multi: [0, 10], alt: [0, 10] }
    ],

    /* ---------------------------------------------------------------------
     * 6) Regras de proteção (Passo 5)
     * ------------------------------------------------------------------- */
    protecao: {
      // Nenhuma classe (exceto pós-fixada, que é a âncora de baixo risco)
      // passa deste percentual da parcela de investimentos.
      limiteConcentracao: 30,
      // Teto da soma de renda variável (ações BR + exterior + imobiliário +
      // alternativos) por perfil.
      tetoRendaVariavel: [15, 25, 40, 55, 70],
      classesRendaVariavel: ['acoes_br', 'acoes_int', 'fii', 'alt'],
      // Classes consideradas mais complexas: ficam de fora quando o
      // conhecimento declarado é baixo.
      classesComplexas: ['multi', 'alt'],
      // Conhecimento baixo limita o perfil final a este índice (moderado).
      tetoPerfilConhecimentoBaixo: 2,
      // Dívida cara limita a capacidade de risco a este índice (moderado).
      tetoCapacidadeDividaCara: 2,
      // Dívida é "cara" se custar mais que o CDI esperado + esta margem (pontos percentuais ao ano).
      margemDividaCara: 3,
      // Rebalancear quando a diferença passar deste valor (pontos percentuais).
      toleranciaRebalanceamento: 5
    },

    /* ---------------------------------------------------------------------
     * 7) Ajuste tático (Passo 4) — limites e gatilhos
     * ------------------------------------------------------------------- */
    tatico: {
      maxPorClasse: 10,          // nunca mais que ±10 pontos percentuais por classe
      metaInflacao: 3.0,         // meta contínua de inflação (CMN)
      tetoMetaInflacao: 4.5,     // meta + 1,5 ponto de tolerância
      jurosRealAlto: 6.0,        // % a.a. — acima disso: mais renda fixa
      jurosRealMedioAlto: 4.5,
      jurosRealBaixo: 2.5,       // abaixo disso: um pouco mais de renda variável
      altaExpectativaIpca: 0.10, // alta (em pontos percentuais) em ~4 semanas considerada "subindo"
      quedaSelicForte: -1.0,     // Selic esperada (fim do ano seguinte) menos Selic atual
      quedaSelicLeve: -0.5,
      altaSelicForte: 1.0
    },

    /* ---------------------------------------------------------------------
     * 8) Retornos esperados — HIPÓTESES (não são previsão nem garantia)
     *    Tudo em termos REAIS (acima da inflação), % ao ano, antes de
     *    impostos e custos.
     *    retorno real da classe = juro real esperado do CDI + prêmio
     *    cenário pessimista/otimista = base -/+ `oscilacao`
     * ------------------------------------------------------------------- */
    retornos: {
      spreadSelicCdi: 0.10,      // CDI costuma ficar ~0,10 ponto abaixo da Selic meta
      jurosRealNeutro: 5.0,      // hipótese de longo prazo para o juro real, depois do horizonte do Focus
      anosConvergencia: 5,       // anos para convergir do último dado do Focus até o neutro
      premio:    { reserva: -0.3, pos: 0.0, pre: 0.4, ipca: 0.5, acoes_br: 3.0, acoes_int: 2.0, fii: 2.0, multi: 1.0, alt: 0.5 },
      oscilacao: { reserva: 1.0,  pos: 1.0, pre: 1.5, ipca: 1.5, acoes_br: 4.0, acoes_int: 3.5, fii: 3.0, multi: 2.0, alt: 2.5 }
    },

    /* ---------------------------------------------------------------------
     * 9) Teste de estresse — queda hipotética de cada classe em um cenário ruim (%)
     * ------------------------------------------------------------------- */
    estresse: { reserva: 0, pos: 0, pre: -6, ipca: -8, acoes_br: -30, acoes_int: -25, fii: -20, multi: -10, alt: -5 },

    /* ---------------------------------------------------------------------
     * 10) Limites de entrada (validação do formulário E dos links compartilhados)
     * ------------------------------------------------------------------- */
    limites: {
      dinheiroMax: 1e10,       // R$ 10 bilhões
      jurosMesMax: 30,         // % ao mês
      prazoMin: 0.5,           // anos
      prazoMax: 50,
      objetivosMax: 3,
      nomeObjetivoMax: 40
    },

    /* ---------------------------------------------------------------------
     * 11) Endpoints oficiais (verificados em 10/11/2026)
     * ------------------------------------------------------------------- */
    apis: {
      // Banco Central — SGS. Séries: 432 = Selic meta (% a.a.);
      // 4389 = CDI anualizado base 252 (% a.a.); 13522 = IPCA acumulado em 12 meses (%).
      sgs: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.{serie}/dados',
      series: { selicMeta: 432, cdi: 4389, ipca12m: 13522 },
      // Banco Central — Olinda, Expectativas de Mercado (Boletim Focus), medianas anuais.
      focus: 'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais',
      tempoLimiteMs: 9000
    },

    /* ---------------------------------------------------------------------
     * 12) FALLBACK MACRO — "dado de referência", usado quando as APIs falham.
     *     Valores copiados das fontes oficiais em 10/11/2026.
     * ------------------------------------------------------------------- */
    fallbackMacro: {
      selicMeta: { valor: 13.75, data: '10/11/2026' },   // SGS 432, % a.a.
      cdi:       { valor: 13.65, data: '09/11/2026' },   // SGS 4389, % a.a.
      ipca12m:   { valor: 4.58,  data: '09/2026' },      // SGS 13522, % em 12 meses
      focus: {
        data: '06/11/2026',
        selic:  { 2026: 13.75, 2027: 12.50, 2028: 11.00, 2029: 10.25, 2030: 10.00 },  // % a.a., fim de cada ano
        ipca:   { 2026: 5.22,  2027: 4.90,  2028: 4.00,  2029: 4.00,  2030: 3.94 },   // % no ano
        pib:    { 2026: 1.75,  2027: 1.15,  2028: 1.80,  2029: 2.00,  2030: 2.00 },   // % no ano
        cambio: { 2026: 5.35,  2027: 5.40,  2028: 5.45,  2029: 5.50,  2030: 5.51 },   // R$/US$, fim de cada ano
        // IPCA esperado para o ano seguinte, cerca de 4 semanas antes (para medir a tendência)
        ipcaAnterior: { ano: 2027, valor: 4.30, data: '09/10/2026' }
      }
    }
  };

  if (typeof module === 'object' && module.exports) module.exports = CONFIG;
  root.MSC = root.MSC || {};
  root.MSC.CONFIG = CONFIG;
})(typeof window !== 'undefined' ? window : globalThis);
