/* Lastro — painel de mercado. Reaproveita a leitura de dados do app de carteira:
 * Banco Central ao vivo (com cópia local e dados de referência) e os dados
 * oficiais do Tesouro e da B3 publicados junto com o site. */
(function () {
  'use strict';
  var L = window.LASTRO, el = L.el, C = window.MSC.CONFIG, A = window.MSC.ATIVOS;
  var pct = function (v) { return L.num(v, 2) + '%'; };

  function selo(origem, obtidoEm) {
    if (origem === 'vivo') return 'ao vivo';
    if (origem === 'cache') return 'cópia guardada em ' + (obtidoEm || '—');
    return 'dado de referência, atualizado em ' + C.dataReferencia;
  }
  function kpi(nome, valor, rodape) { return el('div', { class: 'kpi' }, el('span', { text: nome }), el('b', { text: valor }), el('span', { text: rodape })); }
  function tabela(cab, linhas, numericas) {
    return el('div', { class: 'tabela-rolagem' }, el('table', {},
      el('thead', {}, el('tr', {}, cab.map(function (c, i) { return el('th', { scope: 'col', class: numericas[i] ? 'num' : null, text: c }); }))),
      el('tbody', {}, linhas.map(function (l) { return el('tr', {}, l.map(function (c, i) { return el(i ? 'td' : 'th', { scope: i ? null : 'row', class: numericas[i] ? 'num' : null, text: c }); })); }))));
  }

  var macro = document.getElementById('macro');
  window.MSC.macro.carregar().then(function (m) {
    var F = m.focus, anos = Object.keys(F.selic).map(Number).sort().slice(0, 4);
    var ano = new Date().getFullYear(), ipcaProx = F.ipca[ano + 1] != null ? F.ipca[ano + 1] : F.ipca[anos[anos.length - 1]];
    var real = ((1 + m.selicMeta.valor / 100) / (1 + ipcaProx / 100) - 1) * 100;
    macro.textContent = '';
    macro.appendChild(el('div', { class: 'kpis' },
      kpi('Selic (meta), ao ano', pct(m.selicMeta.valor), 'Banco Central, SGS 432 · ' + m.selicMeta.data + ' · ' + selo(m.selicMeta.origem, m.obtidoEm)),
      kpi('CDI, ao ano', pct(m.cdi.valor), 'Banco Central, SGS 4389 · ' + m.cdi.data + ' · ' + selo(m.cdi.origem, m.obtidoEm)),
      kpi('Inflação em 12 meses (IPCA)', pct(m.ipca12m.valor), 'IBGE via Banco Central, SGS 13522 · ' + m.ipca12m.data + ' · ' + selo(m.ipca12m.origem, m.obtidoEm)),
      kpi('Juro real aproximado, ao ano', pct(real), 'Selic descontada a inflação esperada para ' + (ano + 1) + ' · cálculo próprio')));
    function v(mapa, a, pre) { return mapa && mapa[a] != null ? (pre || '') + L.num(mapa[a], 2) : '—'; }
    macro.appendChild(el('h3', { class: 'titulo-3', style: 'margin-top:1.2rem', text: 'O que o mercado espera' }));
    macro.appendChild(tabela(['Expectativa (mediana)'].concat(anos.map(String)), [
      ['Selic no fim do ano (% ao ano)'].concat(anos.map(function (a) { return v(F.selic, a); })),
      ['Inflação, IPCA (% no ano)'].concat(anos.map(function (a) { return v(F.ipca, a); })),
      ['Crescimento do PIB (% no ano)'].concat(anos.map(function (a) { return v(F.pib, a); })),
      ['Dólar no fim do ano'].concat(anos.map(function (a) { return v(F.cambio, a, 'R$ '); }))
    ], [0, 1, 1, 1, 1]));
    macro.appendChild(el('p', { class: 'nota', text: 'Fonte: Boletim Focus, Banco Central, medianas de ' + F.data + ' · ' + selo(F.origem, m.obtidoEm) + '. Expectativa não é previsão garantida: é a opinião do meio das instituições consultadas.' }));
  });

  var NOMES = { selic: 'Tesouro Selic', pre: 'Tesouro Prefixado', ipca: 'Tesouro IPCA+', educa: 'Tesouro Educa+', renda: 'Tesouro Renda+' };
  var td = document.getElementById('tesouro');
  if (A && A.tesouro) {
    var linhas = A.tesouro.itens.filter(function (t) { return t.t === 'selic' || t.t === 'pre' || t.t === 'ipca'; }).map(function (t) {
      var taxa = t.t === 'selic' ? 'Selic + ' + L.num(t.taxa, 2) + '%' : t.t === 'pre' ? L.num(t.taxa, 2) + '%' : 'IPCA + ' + L.num(t.taxa, 2) + '%';
      return [NOMES[t.t] + ' ' + t.v.slice(0, 4), t.v.split('-').reverse().join('/'), taxa, 'R$ ' + L.num(t.pu, 2)];
    });
    td.appendChild(tabela(['Título', 'Vencimento', 'Taxa de compra (ao ano)', 'Preço unitário'], linhas, [0, 0, 1, 1]));
    td.appendChild(el('p', { class: 'nota', text: 'Fonte: ' + A.tesouro.fonte + ', dados de ' + A.tesouro.data + '. Taxas e preços mudam todo dia útil; confira no site do Tesouro Direto antes de aplicar. Educa+ e Renda+ ficam fora desta tabela por terem regras próprias de pagamento.' }));
  } else td.appendChild(el('p', { text: 'Dados do Tesouro indisponíveis nesta versão.' }));

  function indice(id, dados, nomeIndice) {
    var caixa = document.getElementById(id);
    if (!dados) { caixa.appendChild(el('p', { text: 'Dados indisponíveis nesta versão.' })); return; }
    caixa.appendChild(tabela(['Código', 'Nome', 'Peso no ' + nomeIndice], dados.itens.map(function (x) { return [x.cod, x.nome, L.num(x.peso, 2) + '%']; }), [0, 0, 1]));
    caixa.appendChild(el('p', { class: 'nota', text: 'Fonte: ' + dados.fonte + ', dados de ' + dados.data + '.' }));
  }
  indice('ibov', A && A.ibov, 'Ibovespa');
  indice('ifix', A && A.ifix, 'IFIX');
})();
