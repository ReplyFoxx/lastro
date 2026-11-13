/* Cerne — conteúdo da área de aprendizagem.
 * Lido por site/gerar-paginas.js. Cada módulo tem objetivo, explicação,
 * exemplos, resumo, mini-teste e referências.
 * Regra da casa: todo dado relevante traz a fonte no texto e na lista final.
 * Ao editar, não acrescente número sem fonte. */
'use strict';

const ACESSO = 'nov. 2026';

/* ------------------------------------------------------------ referências -- */
const REFS = {
  bcbCaderno: ['BANCO CENTRAL DO BRASIL. Caderno de Educação Financeira: Gestão de Finanças Pessoais. Brasília: BCB, 2013.', 'https://www.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania/Cuidando_do_seu_dinheiro_Gestao_de_Financas_Pessoais/caderno_cidadania_financeira.pdf'],
  bcbCidadania: [`BANCO CENTRAL DO BRASIL. Cidadania Financeira. Acesso em ${ACESSO}.`, 'https://www.bcb.gov.br/cidadaniafinanceira'],
  bcbInflacao: [`BANCO CENTRAL DO BRASIL. O que é inflação. Acesso em ${ACESSO}.`, 'https://www.bcb.gov.br/controleinflacao/oqueinflacao'],
  bcbMeta: [`BANCO CENTRAL DO BRASIL. Metas para a inflação. Acesso em ${ACESSO}.`, 'https://www.bcb.gov.br/controleinflacao/metainflacao'],
  bcbSelic: [`BANCO CENTRAL DO BRASIL. Taxa Selic. Acesso em ${ACESSO}.`, 'https://www.bcb.gov.br/controleinflacao/taxaselic'],
  bcbCopom: [`BANCO CENTRAL DO BRASIL. Comitê de Política Monetária (Copom). Acesso em ${ACESSO}.`, 'https://www.bcb.gov.br/controleinflacao/copom'],
  bcbTransmissao: [`BANCO CENTRAL DO BRASIL. Mecanismos de transmissão da política monetária. Acesso em ${ACESSO}.`, 'https://www.bcb.gov.br/controleinflacao/transmissaopoliticamonetaria'],
  bcbSfn: [`BANCO CENTRAL DO BRASIL. Sistema Financeiro Nacional (SFN). Acesso em ${ACESSO}.`, 'https://www.bcb.gov.br/estabilidadefinanceira/sfn'],
  bcbCalc: [`BANCO CENTRAL DO BRASIL. Calculadora do Cidadão. Acesso em ${ACESSO}.`, 'https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores'],
  lc179: ['BRASIL. Lei Complementar nº 179, de 24 de fevereiro de 2021. Define os objetivos do Banco Central do Brasil e dispõe sobre sua autonomia.', 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp179.htm'],
  lei14690: ['BRASIL. Lei nº 14.690, de 3 de outubro de 2023. Trata, entre outros pontos, do limite de juros do crédito rotativo do cartão.', 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14690.htm'],
  ibgeInflacao: [`IBGE. IBGE Explica: Inflação. Acesso em ${ACESSO}.`, 'https://www.ibge.gov.br/explica/inflacao.php'],
  ibgePib: [`IBGE. IBGE Explica: PIB. Acesso em ${ACESSO}.`, 'https://www.ibge.gov.br/explica/pib.php'],
  fmiInflacao: [`ONER, Ceyda. Inflation: Prices on the Rise. Finance &amp; Development, série Back to Basics. Fundo Monetário Internacional. Acesso em ${ACESSO}.`, 'https://www.imf.org/en/Publications/fandd/issues/Series/Back-to-Basics/Inflation'],
  fmiPib: [`CALLEN, Tim. Gross Domestic Product: An Economy’s All. Finance &amp; Development, série Back to Basics. Fundo Monetário Internacional. Acesso em ${ACESSO}.`, 'https://www.imf.org/en/Publications/fandd/issues/Series/Back-to-Basics/gross-domestic-product-GDP'],
  fmiMonetaria: [`MATHAI, Koshy. Monetary Policy: Stabilizing Prices and Output. Finance &amp; Development, série Back to Basics. Fundo Monetário Internacional. Acesso em ${ACESSO}.`, 'https://www.imf.org/en/Publications/fandd/issues/Series/Back-to-Basics/Monetary-Policy'],
  fisher: ['FISHER, Irving. The Theory of Interest. Nova York: Macmillan, 1930.', null],
  cvmTop: ['COMISSÃO DE VALORES MOBILIÁRIOS. O mercado de valores mobiliários brasileiro. 4. ed. Rio de Janeiro: CVM, 2019.', 'https://www.gov.br/investidor/pt-br/educacional/publicacoes-educacionais/livros-cvm'],
  cvmPortal: [`COMISSÃO DE VALORES MOBILIÁRIOS. Portal do Investidor. Acesso em ${ACESSO}.`, 'https://www.gov.br/investidor/pt-br'],
  cvm30: ['COMISSÃO DE VALORES MOBILIÁRIOS. Resolução CVM nº 30, de 11 de maio de 2021. Dispõe sobre a verificação da adequação de produtos ao perfil do cliente.', 'https://conteudo.cvm.gov.br/legislacao/resolucoes/resol030.html'],
  b3Ibov: [`B3. Índice Bovespa (Ibovespa B3). Acesso em ${ACESSO}.`, 'https://www.b3.com.br/pt_br/market-data-e-indices/indices/indices-amplos/ibovespa.htm'],
  b3Bora: [`B3. Bora Investir, portal de educação financeira. Acesso em ${ACESSO}.`, 'https://borainvestir.b3.com.br/'],
  tesouro: [`TESOURO NACIONAL. Dívida Pública Federal. Acesso em ${ACESSO}.`, 'https://www.gov.br/tesouronacional/pt-br/divida-publica-federal'],
  fgc: [`FUNDO GARANTIDOR DE CRÉDITOS. Garantia FGC. Acesso em ${ACESSO}.`, 'https://www.fgc.org.br/sobre-garantia-fgc'],
  ocde2020: ['OCDE. Recommendation of the Council on Financial Literacy (OECD/LEGAL/0461). Paris: OCDE, 2020.', 'https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0461'],
  ocdeInfe: ['OCDE. OECD/INFE 2020 International Survey of Adult Financial Literacy. Paris: OCDE, 2020.', 'https://doi.org/10.1787/145f5607-en'],
  lusardi: ['LUSARDI, Annamaria; MITCHELL, Olivia S. The Economic Importance of Financial Literacy: Theory and Evidence. Journal of Economic Literature, v. 52, n. 1, p. 5-44, 2014.', 'https://doi.org/10.1257/jel.52.1.5'],
  thalerSmart: ['THALER, Richard H.; BENARTZI, Shlomo. Save More Tomorrow: Using Behavioral Economics to Increase Employee Saving. Journal of Political Economy, v. 112, n. S1, p. S164-S187, 2004.', 'https://doi.org/10.1086/380085'],
  markowitz: ['MARKOWITZ, Harry. Portfolio Selection. The Journal of Finance, v. 7, n. 1, p. 77-91, 1952.', 'https://doi.org/10.1111/j.1540-6261.1952.tb01525.x'],
  sharpe: ['SHARPE, William F. Capital Asset Prices: A Theory of Market Equilibrium under Conditions of Risk. The Journal of Finance, v. 19, n. 3, p. 425-442, 1964.', 'https://doi.org/10.1111/j.1540-6261.1964.tb02865.x'],
  statman: ['STATMAN, Meir. How Many Stocks Make a Diversified Portfolio? Journal of Financial and Quantitative Analysis, v. 22, n. 3, p. 353-363, 1987.', 'https://doi.org/10.2307/2330969'],
  dimson: ['DIMSON, Elroy; MARSH, Paul; STAUNTON, Mike. Triumph of the Optimists: 101 Years of Global Investment Returns. Princeton: Princeton University Press, 2002.', null],
  kt1979: ['KAHNEMAN, Daniel; TVERSKY, Amos. Prospect Theory: An Analysis of Decision under Risk. Econometrica, v. 47, n. 2, p. 263-291, 1979.', 'https://doi.org/10.2307/1914185'],
  tk1992: ['TVERSKY, Amos; KAHNEMAN, Daniel. Advances in Prospect Theory: Cumulative Representation of Uncertainty. Journal of Risk and Uncertainty, v. 5, n. 4, p. 297-323, 1992.', 'https://doi.org/10.1007/BF00122574'],
  shefrin: ['SHEFRIN, Hersh; STATMAN, Meir. The Disposition to Sell Winners Too Early and Ride Losers Too Long: Theory and Evidence. The Journal of Finance, v. 40, n. 3, p. 777-790, 1985.', 'https://doi.org/10.1111/j.1540-6261.1985.tb05002.x'],
  odean: ['ODEAN, Terrance. Are Investors Reluctant to Realize Their Losses? The Journal of Finance, v. 53, n. 5, p. 1775-1798, 1998.', 'https://doi.org/10.1111/0022-1082.00072'],
  wason: ['WASON, Peter C. On the Failure to Eliminate Hypotheses in a Conceptual Task. Quarterly Journal of Experimental Psychology, v. 12, n. 3, p. 129-140, 1960.', 'https://doi.org/10.1080/17470216008416717'],
  nickerson: ['NICKERSON, Raymond S. Confirmation Bias: A Ubiquitous Phenomenon in Many Guises. Review of General Psychology, v. 2, n. 2, p. 175-220, 1998.', 'https://doi.org/10.1037/1089-2680.2.2.175'],
  banerjee: ['BANERJEE, Abhijit V. A Simple Model of Herd Behavior. The Quarterly Journal of Economics, v. 107, n. 3, p. 797-817, 1992.', 'https://doi.org/10.2307/2118364'],
  bhw: ['BIKHCHANDANI, Sushil; HIRSHLEIFER, David; WELCH, Ivo. A Theory of Fads, Fashion, Custom, and Cultural Change as Informational Cascades. Journal of Political Economy, v. 100, n. 5, p. 992-1026, 1992.', 'https://doi.org/10.1086/261849'],
  barber: ['BARBER, Brad M.; ODEAN, Terrance. Trading Is Hazardous to Your Wealth: The Common Stock Investment Performance of Individual Investors. The Journal of Finance, v. 55, n. 2, p. 773-806, 2000.', 'https://doi.org/10.1111/0022-1082.00226'],
  mani: ['MANI, Anandi; MULLAINATHAN, Sendhil; SHAFIR, Eldar; ZHAO, Jiaying. Poverty Impedes Cognitive Function. Science, v. 341, n. 6149, p. 976-980, 2013.', 'https://doi.org/10.1126/science.1238041'],
  cfpb: ['CONSUMER FINANCIAL PROTECTION BUREAU. Financial well-being: The goal of financial education. Washington: CFPB, 2015.', 'https://www.consumerfinance.gov/data-research/research-reports/financial-well-being/'],
  netemeyer: ['NETEMEYER, Richard G.; WARMATH, Dee; FERNANDES, Daniel; LYNCH JR., John G. How Am I Doing? Perceived Financial Well-Being, Its Potential Antecedents, and Its Relation to Overall Well-Being. Journal of Consumer Research, v. 45, n. 1, p. 68-89, 2018.', 'https://doi.org/10.1093/jcr/ucx109'],
  benartziThaler: ['BENARTZI, Shlomo; THALER, Richard H. Myopic Loss Aversion and the Equity Premium Puzzle. The Quarterly Journal of Economics, v. 110, n. 1, p. 73-92, 1995.', 'https://doi.org/10.2307/2118511'],
  thaler1997: ['THALER, Richard H.; TVERSKY, Amos; KAHNEMAN, Daniel; SCHWARTZ, Alan. The Effect of Myopia and Loss Aversion on Risk Taking: An Experimental Test. The Quarterly Journal of Economics, v. 112, n. 2, p. 647-661, 1997.', 'https://doi.org/10.1162/003355397555226'],
  lo2005: ['LO, Andrew W.; REPIN, Dmitry V.; STEENBARGER, Brett N. Fear and Greed in Financial Markets: A Clinical Study of Day-Traders. American Economic Review, v. 95, n. 2, p. 352-359, 2005.', 'https://doi.org/10.1257/000282805774670095'],
  gollwitzer: ['GOLLWITZER, Peter M. Implementation Intentions: Strong Effects of Simple Plans. American Psychologist, v. 54, n. 7, p. 493-503, 1999.', 'https://doi.org/10.1037/0003-066X.54.7.493'],
  cvv: [`CENTRO DE VALORIZAÇÃO DA VIDA. Apoio emocional gratuito, telefone 188. Acesso em ${ACESSO}.`, 'https://cvv.org.br/'],
  graham: ['GRAHAM, Benjamin. The Intelligent Investor. Nova York: Harper &amp; Brothers, 1949.', null]
};

/* ---------------------------------------------------------------- contas -- */
const brl = (v, c = 2) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
const num = (v, c = 2) => v.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
/* Mesma regra da calculadora (site/juros.js): aporte no fim de cada mês. */
function simular(inicial, aporte, taxaAno, anos) {
  const i = Math.pow(1 + taxaAno / 100, 1 / 12) - 1;
  let saldo = inicial;
  for (let m = 1; m <= anos * 12; m++) saldo = saldo * (1 + i) + aporte;
  const investido = inicial + aporte * anos * 12;
  return { saldo, investido, juros: saldo - investido, taxaMes: i * 100 };
}
const EX = { inicial: 1000, aporte: 300, taxa: 8, anos: 15 };
const ex15 = simular(EX.inicial, EX.aporte, EX.taxa, EX.anos);
const ex30 = simular(EX.inicial, EX.aporte, EX.taxa, 30);
const LINK_EX = `juros.html?inicial=${EX.inicial}&amp;aporte=${EX.aporte}&amp;taxa=${EX.taxa}&amp;periodo=ano&amp;prazo=${EX.anos}&amp;unidade=anos`;
const poder10 = 100 / Math.pow(1.05, 10);
const real = ((1.10 / 1.04) - 1) * 100;
const pu10 = 1000 / 1.10, pu12 = 1000 / 1.12;

/* Os textos das trilhas e dos módulos ficam em site/aulas-conteudo.js. */
const { TRILHAS, MODULOS } = require('./aulas-conteudo.js')({ brl, num, EX, ex15, ex30, LINK_EX, poder10, real, pu10, pu12 });

module.exports = { TRILHAS, MODULOS, REFS };
