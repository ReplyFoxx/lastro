/* Cerne — panorama de mercado.
 * Parte viva da página: séries do Banco Central (SGS) lidas no navegador, e os
 * indicadores e expectativas reaproveitados do app de carteira (ao vivo, com
 * cópia local e dado de referência datado). Os textos de leitura ficam no HTML,
 * com a data da edição. */
(function () {
  'use strict';
  var L = window.CERNE, el = L.el, C = window.MSC.CONFIG, NS = 'http://www.w3.org/2000/svg';
  var pct = function (v, c) { return L.num(v, c === undefined ? 2 : c) + '%'; };
  function s(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function dois(n) { return (n < 10 ? '0' : '') + n; }
  function br(d) { return dois(d.getDate()) + '/' + dois(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function mesAno(txt) { var p = txt.split('/'); return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][+p[1] - 1] + '/' + p[2]; }
  function sinal(v, c, un) { return (v > 0 ? '+' : v < 0 ? '−' : '') + L.num(Math.abs(v), c) + un; }

  /* ---------------------------------------------------------- tendências -- */
  /* O serviço do Banco Central responde vazio (304) quando a data inicial de
   * uma série diária cai em feriado. Por isso há novas tentativas, um dia à frente. */
  function serie(codigo, mesesAtras, tentativa) {
    var n = tentativa || 0;
    return pedir(codigo, mesesAtras, n).catch(function (e) { if (n >= 4) throw e; return serie(codigo, mesesAtras, n + 1); });
  }
  function pedir(codigo, mesesAtras, desloca) {
    var hoje = new Date(), ini = new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras, 1 + desloca);
    var url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + codigo + '/dados?formato=json&dataInicial=' + br(ini) + '&dataFinal=' + br(hoje);
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
    return fetch(url, { signal: ctl ? ctl.signal : undefined, credentials: 'omit', cache: 'no-store' }).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error('resposta ' + r.status);
      return r.json();
    }).then(function (dados) {
      if (!Array.isArray(dados)) throw new Error('formato');
      var limpo = dados.slice(-1500).map(function (d) { return { data: String(d.data), valor: Number(d.valor) }; })
        .filter(function (d) { return /^\d{2}\/\d{2}\/\d{4}$/.test(d.data) && isFinite(d.valor) && Math.abs(d.valor) < 1e7; });
      if (limpo.length < 3) throw new Error('série curta');
      return limpo;
    });
  }
  function faisca(pontos, zero) {
    var W = 260, H = 70, n = pontos.length - 1, vs = pontos.map(function (p) { return p.valor; });
    var min = Math.min.apply(null, vs), max = Math.max.apply(null, vs);
    if (zero) { min = Math.min(min, 0); max = Math.max(max, 0); }
    var folga = (max - min) * 0.12 || 1; min -= folga; max += folga;
    var X = function (i) { return 3 + (W - 12) * i / n; }, Y = function (v) { return H - 3 - (H - 6) * (v - min) / (max - min); };
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', preserveAspectRatio: 'none' });
    if (zero) svg.appendChild(s('line', { x1: 0, x2: W, y1: Y(0), y2: Y(0), class: 'f-zero' }));
    svg.appendChild(s('path', { d: pontos.map(function (p, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(p.valor).toFixed(1); }).join(' '), class: 'f-linha', 'vector-effect': 'non-scaling-stroke' }));
    svg.appendChild(s('circle', { cx: X(n), cy: Y(vs[n]), r: 4, class: 'f-ponta' }));
    return svg;
  }
  function quadro(o) {
    return el('article', { class: 'tendencia' },
      el('h3', { text: o.nome }),
      el('p', { class: 'tendencia-valor', text: o.valor }),
      el('p', { class: 'tendencia-leitura', text: o.leitura }),
      o.grafico ? el('div', { class: 'faisca' }, o.grafico) : null,
      el('p', { class: 'nota', text: o.fonte }));
  }
  function falha(nome) { return el('article', { class: 'tendencia' }, el('h3', { text: nome }), el('p', { class: 'tendencia-leitura', text: 'Sem resposta do Banco Central agora. Tente recarregar a página mais tarde.' })); }
  function antes(pontos, dias) { return pontos[Math.max(0, pontos.length - 1 - dias)]; }

  var caixa = document.getElementById('tendencias');
  var pedidos = [
    serie(432, 24).then(function (p) {
      var u = p[p.length - 1], a = p[0], d = u.valor - a.valor;
      return quadro({ nome: 'Juros', valor: pct(u.valor), grafico: faisca(p),
        leitura: d === 0 ? 'Meta da Selic igual à de ' + mesAno(a.data) + '.' : 'Meta da Selic, ' + sinal(d, 2, ' p.p.') + ' desde ' + mesAno(a.data) + ' (' + pct(a.valor) + ').',
        fonte: 'Banco Central, SGS 432 · dado de ' + u.data + ' · 24 meses' });
    }, function () { return falha('Juros'); }),
    serie(1, 6).then(function (p) {
      var u = p[p.length - 1], a = antes(p, 21), d = (u.valor / a.valor - 1) * 100;
      return quadro({ nome: 'Câmbio', valor: 'R$ ' + L.num(u.valor, 2), grafico: faisca(p),
        leitura: 'Dólar ' + sinal(d, 1, '%') + ' em um mês de pregões (R$ ' + L.num(a.valor, 2) + ' em ' + a.data + ').',
        fonte: 'Banco Central, PTAX venda, SGS 1 · dado de ' + u.data + ' · 6 meses' });
    }, function () { return falha('Câmbio'); }),
    serie(13522, 24).then(function (p) {
      var u = p[p.length - 1], a = antes(p, 12), d = u.valor - a.valor;
      return quadro({ nome: 'Inflação', valor: pct(u.valor), grafico: faisca(p),
        leitura: 'IPCA em 12 meses, ' + sinal(d, 2, ' p.p.') + ' em um ano. A meta é 3%, com teto de 4,5%.',
        fonte: 'IBGE via Banco Central, SGS 13522 · ' + mesAno(u.data) + ' · 24 meses' });
    }, function () { return falha('Inflação'); }),
    Promise.all([serie(21859, 38), serie(24369, 14)]).then(function (r) {
      var p = r[0], des = r[1], var12 = [];
      for (var i = 12; i < p.length; i++) var12.push({ data: p[i].data, valor: (p[i].valor / p[i - 12].valor - 1) * 100 });
      var u = var12[var12.length - 1], d = des[des.length - 1];
      return quadro({ nome: 'Atividade', valor: sinal(u.valor, 1, '%'), grafico: faisca(var12, true),
        leitura: 'Produção industrial contra o mesmo mês do ano anterior. Desemprego em ' + pct(d.valor, 1) + ' (' + mesAno(d.data) + ').',
        fonte: 'IBGE via Banco Central, SGS 21859 e 24369 · ' + mesAno(u.data) + ' · variação calculada' });
    }, function () { return falha('Atividade'); })
  ];
  Promise.all(pedidos).then(function (quadros) { caixa.textContent = ''; quadros.forEach(function (q) { caixa.appendChild(q); }); });

  /* --------------------------------------------------------- indicadores -- */
  function selo(origem, obtidoEm) {
    if (origem === 'vivo') return 'ao vivo';
    if (origem === 'cache') return 'cópia guardada em ' + (obtidoEm || '—');
    return 'dado de referência, atualizado em ' + C.dataReferencia;
  }
  function fato(nome, valor, rodape) { return el('div', { class: 'fato' }, el('span', { class: 'fato-nome', text: nome }), el('b', { text: valor }), el('span', { class: 'nota', text: rodape })); }
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
    macro.appendChild(el('div', { class: 'fatos' },
      fato('Juro real aproximado', pct(real), 'Selic descontada a inflação esperada para ' + (ano + 1) + ' · cálculo próprio'),
      fato('Selic, meta ao ano', pct(m.selicMeta.valor), 'Banco Central, SGS 432 · ' + m.selicMeta.data + ' · ' + selo(m.selicMeta.origem, m.obtidoEm)),
      fato('CDI ao ano', pct(m.cdi.valor), 'Banco Central, SGS 4389 · ' + m.cdi.data + ' · ' + selo(m.cdi.origem, m.obtidoEm)),
      fato('IPCA em 12 meses', pct(m.ipca12m.valor), 'IBGE via Banco Central, SGS 13522 · ' + m.ipca12m.data + ' · ' + selo(m.ipca12m.origem, m.obtidoEm))));
    function v(mapa, a, pre) { return mapa && mapa[a] != null ? (pre || '') + L.num(mapa[a], 2) : '—'; }
    macro.appendChild(el('h3', { class: 'titulo-3', style: 'margin-top:2.2rem', text: 'O que o mercado espera' }));
    macro.appendChild(tabela(['Mediana das expectativas'].concat(anos.map(String)), [
      ['Selic no fim do ano (% ao ano)'].concat(anos.map(function (a) { return v(F.selic, a); })),
      ['Inflação, IPCA (% no ano)'].concat(anos.map(function (a) { return v(F.ipca, a); })),
      ['Crescimento do PIB (% no ano)'].concat(anos.map(function (a) { return v(F.pib, a); })),
      ['Dólar no fim do ano'].concat(anos.map(function (a) { return v(F.cambio, a, 'R$ '); }))
    ], [0, 1, 1, 1, 1]));
    macro.appendChild(el('p', { class: 'nota', style: 'margin-top:.6rem', text: 'Fonte: Boletim Focus, Banco Central, medianas de ' + F.data + ' · ' + selo(F.origem, m.obtidoEm) + '. Expectativa não é previsão garantida: é a opinião do meio das instituições consultadas.' }));
  });
})();
