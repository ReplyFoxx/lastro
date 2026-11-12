/* ==========================================================================
 * Monte sua carteira — OPÇÕES CONCRETAS POR CLASSE
 * Transforma a carteira calculada em exemplos reais de onde aplicar cada classe,
 * usando só dados de fontes oficiais (js/ativos.js, gerado por tools/atualizar-ativos.js).
 *
 * Critérios (mecânicos e visíveis para quem lê):
 *  - Títulos do Tesouro Direto: o vencimento mais próximo da data de cada objetivo,
 *    sem vencer antes dele. Reserva: Tesouro Selic de vencimento mais curto.
 *  - Ações e fundos imobiliários: maiores pesos no Ibovespa e no IFIX (tamanho e negociação).
 *  - Classes sem fonte oficial gratuita e confiável (exterior, multimercado, alternativos):
 *    só orientação, sem nomes.
 * Nada aqui é recomendação individualizada. Lógica pura: roda no navegador e no Node.
 * ========================================================================== */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.MSC = root.MSC || {}; root.MSC.opcoes = factory(); }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function brNum(v, c) { return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c }); }
  function brBRL(v) { return 'R$ ' + brNum(v, 2); }
  function mesAno(iso) { var p = iso.split('-'); return MESES[+p[1] - 1] + '/' + p[0]; }
  function dataBR(iso) { return iso.split('-').reverse().join('/'); }
  function somarAnos(hoje, anos) { return new Date(hoje.getTime() + anos * 365.25 * 864e5); }
  function isoDe(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  var NOMES = { selic: 'Tesouro Selic', pre: 'Tesouro Prefixado', ipca: 'Tesouro IPCA+', educa: 'Tesouro Educa+', renda: 'Tesouro Renda+ Aposentadoria Extra' };

  /* Vencimento mais próximo da data da meta que não vença antes dela. */
  function escolher(lista, isoMeta) {
    if (!lista.length) return null;
    var ordenada = lista.slice().sort(function (a, b) { return a.v < b.v ? -1 : 1; });
    for (var i = 0; i < ordenada.length; i++) if (ordenada[i].v >= isoMeta) return { t: ordenada[i], venceAntes: false };
    return { t: ordenada[ordenada.length - 1], venceAntes: true };
  }
  function descTaxa(t) {
    if (t.t === 'selic') return 'taxa de compra: Selic + ' + brNum(t.taxa, 2) + '% ao ano';
    if (t.t === 'pre') return 'taxa de compra: ' + brNum(t.taxa, 2) + '% ao ano, fixa';
    return 'taxa de compra: IPCA + ' + brNum(t.taxa, 2) + '% ao ano';
  }
  function itemTitulo(t, motivo, venceAntes) {
    var ano = t.v.slice(0, 4);
    return {
      rotulo: NOMES[t.t] + ' ' + ano,
      detalhe: 'Vence em ' + dataBR(t.v) + ' · ' + descTaxa(t) + ' · preço unitário ' + brBRL(t.pu),
      porque: motivo + (venceAntes ? ' O vencimento mais longo disponível chega antes da data da meta; seria preciso reaplicar no vencimento.' : '')
    };
  }

  /* r = resultado de montarCarteira; ativos = MSC.ATIVOS; hoje = Date. Devolve lista de grupos. */
  function sugerir(r, ativos, hoje) {
    var grupos = [], A = ativos || {}, T = (A.tesouro && A.tesouro.itens) || [];
    var por = function (tipo) { return T.filter(function (t) { return t.t === tipo && t.v > isoDe(hoje); }); };
    var pct = r.mostrada, fonteT = A.tesouro ? A.tesouro.fonte + ', dados de ' + A.tesouro.data : '';
    var objs = r.projecoes.map(function (p) { return { nome: p.nome, tipo: p.tipo, balde: p.balde, prazo: p.prazo, iso: isoDe(somarAnos(hoje, p.prazo)) }; });

    // Escolhe um título por objetivo (sem repetir o mesmo vencimento).
    function porObjetivo(tipo, filtro, textoMotivo) {
      var itens = [], vistos = {};
      objs.filter(filtro).forEach(function (o) {
        var e = escolher(por(tipo), o.iso); if (!e) return;
        var chave = e.t.t + e.t.v;
        if (vistos[chave]) { vistos[chave].porque += ' Também serve a "' + o.nome + '".'; return; }
        var it = itemTitulo(e.t, textoMotivo(o), e.venceAntes); vistos[chave] = it; itens.push(it);
      });
      return itens;
    }
    var mes = function (o) { return mesAno(o.iso); };

    if (pct.reserva > 0 && T.length) {
      var curto = por('selic').slice().sort(function (a, b) { return a.v < b.v ? -1 : 1; })[0];
      if (curto) grupos.push({ id: 'reserva', titulo: 'Reserva de liquidez', fonte: fonteT,
        itens: [itemTitulo(curto, 'Para a reserva, o Tesouro Selic é o título mais usado: acompanha a taxa básica e, em geral, pode ser resgatado no dia útil seguinte. O vencimento mais próximo é o que menos oscila de preço.')],
        nota: 'Contas remuneradas e fundos de renda fixa de liquidez diária também servem; compare taxa, imposto e quem garante o dinheiro.' });
    }
    if (pct.pos > 0 && T.length) {
      var itensP = porObjetivo('selic', function () { return true; }, function (o) { return 'Para "' + o.nome + '" (meta em ' + mes(o) + '). Acompanha a Selic até lá.'; });
      if (itensP.length) grupos.push({ id: 'pos', titulo: 'Renda fixa pós-fixada', fonte: fonteT, itens: itensP.slice(0, 3) });
    }
    if (pct.pre > 0 && T.length) {
      var itensF = porObjetivo('pre', function (o) { return o.balde !== 'curto'; }, function (o) { return 'Trava a taxa até ' + mes(o) + ', data de "' + o.nome + '". Vendido antes do vencimento, o preço pode subir ou cair.'; });
      if (itensF.length) grupos.push({ id: 'pre', titulo: 'Renda fixa prefixada', fonte: fonteT, itens: itensF.slice(0, 3) });
    }
    if (pct.ipca > 0 && T.length) {
      var itensI = [], vis = {};
      objs.filter(function (o) { return o.balde !== 'curto'; }).forEach(function (o) {
        var tipo = o.tipo === 'estudo' && por('educa').length ? 'educa' : o.tipo === 'aposentadoria' && o.prazo >= 8 && por('renda').length ? 'renda' : 'ipca';
        var e = escolher(por(tipo), o.iso); if (!e) return;
        var k = e.t.t + e.t.v; if (vis[k]) { vis[k].porque += ' Também serve a "' + o.nome + '".'; return; }
        var motivo = tipo === 'educa' ? 'Título criado para custear estudo, indicado para "' + o.nome + '". Confira no site do Tesouro Direto como e quando ele paga.'
          : tipo === 'renda' ? 'Título criado para complementar a renda na aposentadoria, indicado para "' + o.nome + '". Confira no site do Tesouro Direto como e quando ele paga.'
          : 'Rende a inflação mais uma taxa fixa até ' + mes(o) + ', data de "' + o.nome + '".';
        var it = itemTitulo(e.t, motivo, e.venceAntes); vis[k] = it; itensI.push(it);
      });
      if (itensI.length) grupos.push({ id: 'ipca', titulo: 'Renda fixa atrelada à inflação', fonte: fonteT, itens: itensI.slice(0, 3) });
    }
    if (pct.acoes_br > 0 && A.ibov) grupos.push({ id: 'acoes_br', titulo: 'Ações Brasil', fonte: A.ibov.fonte + ', dados de ' + A.ibov.data,
      itens: A.ibov.itens.slice(0, 6).map(function (x) { return { rotulo: x.cod, detalhe: x.nome + ' · ' + brNum(x.peso, 2) + '% do Ibovespa', porque: '' }; }),
      nota: 'Lista das maiores participações do Ibovespa, que mede as ações mais negociadas. Peso grande indica tamanho e negociação, não qualidade nem preço justo. Quem não quer escolher empresas costuma usar fundos que replicam o índice.' });
    if (pct.fii > 0 && A.ifix) grupos.push({ id: 'fii', titulo: 'Imobiliário (fundos listados)', fonte: A.ifix.fonte + ', dados de ' + A.ifix.data,
      itens: A.ifix.itens.slice(0, 5).map(function (x) { return { rotulo: x.cod, detalhe: x.nome + ' · ' + brNum(x.peso, 2) + '% do IFIX', porque: '' }; }),
      nota: 'Lista dos maiores pesos do IFIX, que reúne fundos imobiliários negociados. Fundos diferentes têm riscos muito diferentes (imóveis físicos, papéis, shoppings); leia o regulamento e os relatórios antes de aplicar.' });
    if (pct.acoes_int > 0) grupos.push({ id: 'acoes_int', titulo: 'Ações internacionais', fonte: '', itens: [],
      nota: 'Sem lista de nomes: não há fonte oficial gratuita equivalente. Em geral, usam-se fundos de índice (ETFs) negociados na B3 que replicam bolsas do exterior, ou fundos de investimento no exterior. Compare o índice replicado, a taxa de administração e se há exposição ao dólar.' });
    if (pct.multi > 0) grupos.push({ id: 'multi', titulo: 'Multimercado', fonte: '', itens: [],
      nota: 'Sem lista de nomes: cada fundo tem uma estratégia diferente. Compare a estratégia descrita no regulamento, a taxa de administração e de performance, a volatilidade e o histórico de pelo menos três anos, na lâmina do fundo (disponível no site da CVM).' });
    if (pct.alt > 0) grupos.push({ id: 'alt', titulo: 'Alternativos / proteção', fonte: '', itens: [],
      nota: 'Sem lista de nomes. Exemplos de tipo: ouro negociado em bolsa e fundos que o replicam, ou moedas fortes. Servem para reduzir risco, não para buscar retorno; mantenha a fatia pequena.' });
    return grupos;
  }

  return { sugerir: sugerir, escolher: escolher };
});
