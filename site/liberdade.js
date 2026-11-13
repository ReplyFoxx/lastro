/* Cerne — calculadora de liberdade financeira.
 * Tudo em reais de hoje (retorno acima da inflação). São hipóteses, não previsões.
 *   número-alvo = gasto anual desejado ÷ taxa de retirada
 *   patrimônio do mês seguinte = patrimônio × (1 + retorno mensal) + aporte */
(function () {
  'use strict';
  var L = window.CERNE, el = L.el, NS = 'http://www.w3.org/2000/svg';
  var MAX_MESES = 80 * 12;
  var form = document.getElementById('form-liberdade'), saida = document.getElementById('saida-liberdade');

  function simular(patrimonio, aporte, retornoAno, alvo) {
    var i = Math.pow(1 + retornoAno / 100, 1 / 12) - 1, p = patrimonio, serie = [p], m = 0;
    while (p < alvo && m < MAX_MESES) { p = p * (1 + i) + aporte; m++; serie.push(p); }
    return { meses: p >= alvo ? m : null, serie: serie };
  }
  function tempo(meses) {
    if (meses === null) return 'mais de 80 anos';
    if (meses === 0) return 'já alcançado';
    var a = Math.floor(meses / 12), r = meses % 12, p = [];
    if (a) p.push(a + (a === 1 ? ' ano' : ' anos'));
    if (r) p.push(r + (r === 1 ? ' mês' : ' meses'));
    return p.join(' e ');
  }
  function s(tag, attrs, txt) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (txt) e.textContent = txt; return e; }
  function compacto(v) {
    if (v >= 1e9) return 'R$ ' + L.num(v / 1e9, 1) + ' bi';
    if (v >= 1e6) return 'R$ ' + L.num(v / 1e6, 1) + ' mi';
    if (v >= 1e3) return 'R$ ' + L.num(v / 1e3, 0) + ' mil';
    return 'R$ ' + L.num(v, 0);
  }
  function grafico(serie, alvo) {
    var W = 640, H = 280, me = 70, md = 16, mt = 18, mb = 34, n = serie.length - 1 || 1;
    var topo = Math.max(alvo, serie[serie.length - 1]) * 1.12;
    var X = function (m) { return me + (W - me - md) * m / n; }, Y = function (v) { return mt + (H - mt - mb) * (1 - v / topo); };
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Evolução do patrimônio até o número-alvo de ' + L.brl(alvo) });
    for (var g = 0; g <= 4; g++) {
      var v = topo * g / 4;
      svg.appendChild(s('line', { x1: me, x2: W - md, y1: Y(v), y2: Y(v), class: 'g-grade' }));
      svg.appendChild(s('text', { x: me - 8, y: Y(v) + 4, 'text-anchor': 'end', class: 'g-txt' }, compacto(v)));
    }
    var passo = Math.max(1, Math.floor(n / 160)), d = '';
    for (var m = 0; m <= n; m += passo) d += (m ? 'L' : 'M') + X(m).toFixed(1) + ',' + Y(serie[m]).toFixed(1) + ' ';
    d += 'L' + X(n).toFixed(1) + ',' + Y(serie[n]).toFixed(1);
    svg.appendChild(s('path', { d: d + ' L' + X(n).toFixed(1) + ',' + Y(0) + ' L' + X(0) + ',' + Y(0) + ' Z', class: 'g-area' }));
    svg.appendChild(s('path', { d: d, class: 'g-linha' }));
    svg.appendChild(s('line', { x1: me, x2: W - md, y1: Y(alvo), y2: Y(alvo), class: 'g-meta' }));
    svg.appendChild(s('text', { x: me + 6, y: Y(alvo) - 6, class: 'g-meta-txt' }, 'Número-alvo: ' + compacto(alvo)));
    var anos = n / 12, pa = Math.max(1, Math.ceil(anos / 6));
    for (var a = 0; a <= anos + 1e-9; a += pa) svg.appendChild(s('text', { x: X(a * 12), y: H - mb + 16, 'text-anchor': 'middle', class: 'g-txt' }, String(a)));
    svg.appendChild(s('text', { x: me + (W - me - md) / 2, y: H - 4, 'text-anchor': 'middle', class: 'g-txt' }, 'anos a partir de hoje'));
    return svg;
  }

  function calcular(ev) {
    if (ev) ev.preventDefault();
    var erro = document.getElementById('erro-liberdade');
    var gasto = L.lerNumero(document.getElementById('gasto').value), pat = L.lerNumero(document.getElementById('patrimonio').value),
      aporte = L.lerNumero(document.getElementById('aporte').value);
    var retorno = Number(document.getElementById('retorno').value), retirada = Number(document.getElementById('retirada').value);
    if (gasto === null || pat === null || aporte === null || !(gasto > 0) || gasto > 1e9 || pat > 1e11 || aporte > 1e9) {
      erro.textContent = 'Preencha os três valores só com números. O gasto mensal precisa ser maior que zero.'; erro.hidden = false;
      saida.textContent = ''; return;
    }
    erro.hidden = true;
    var alvo = gasto * 12 / (retirada / 100), base = simular(pat, aporte, retorno, alvo);
    var cen = [
      ['Como você informou', base.meses],
      ['Aportando 20% a mais (' + L.brl(aporte * 1.2) + ')', simular(pat, aporte * 1.2, retorno, alvo).meses],
      ['Gastando 10% a menos na liberdade (' + L.brl(gasto * 0.9) + ')', simular(pat, aporte, retorno, gasto * 0.9 * 12 / (retirada / 100)).meses],
      ['Retorno real 1 ponto menor (' + L.num(retorno - 1, 0) + '% ao ano)', simular(pat, aporte, retorno - 1, alvo).meses],
      ['Retorno real 1 ponto maior (' + L.num(retorno + 1, 0) + '% ao ano)', simular(pat, aporte, retorno + 1, alvo).meses]
    ];
    saida.textContent = '';
    saida.appendChild(el('p', { class: 'olho', text: 'Seu número-alvo' }));
    saida.appendChild(el('p', { class: 'numero', text: L.brl(alvo) }));
    saida.appendChild(el('p', { class: 'nota', text: 'É o patrimônio que, nas hipóteses escolhidas, sustentaria ' + L.brl(gasto) + ' por mês com retiradas de ' + L.num(retirada, 1) + '% ao ano. Em reais de hoje.' }));
    saida.appendChild(el('div', { class: 'kpis' },
      el('div', { class: 'kpi' }, el('b', { text: tempo(base.meses) }), el('span', { text: 'tempo estimado até lá' })),
      el('div', { class: 'kpi' }, el('b', { text: L.num(Math.min(100, pat / alvo * 100), 0) + '%' }), el('span', { text: 'do caminho já percorrido' }))));
    if (base.meses === null) saida.appendChild(el('p', { class: 'aviso', text: 'Com esses números, o alvo não é alcançado em 80 anos. Veja abaixo o que mais muda o resultado: em geral é o aporte, não o retorno.' }));
    else if (base.meses > 0) saida.appendChild(el('div', { class: 'grafico' }, grafico(base.serie, alvo)));
    saida.appendChild(el('h3', { class: 'titulo-3', style: 'margin-top:1.2rem', text: 'O que muda o prazo' }));
    saida.appendChild(el('div', { class: 'tabela-rolagem' }, el('table', {},
      el('thead', {}, el('tr', {}, el('th', { scope: 'col', text: 'Cenário' }), el('th', { scope: 'col', class: 'num', text: 'Tempo' }))),
      el('tbody', {}, cen.map(function (c) { return el('tr', {}, el('th', { scope: 'row', text: c[0] }), el('td', { class: 'num', text: tempo(c[1]) })); })))));
    saida.appendChild(el('p', { class: 'nota', style: 'margin-top:1rem', text: 'Hipóteses, não previsões. O retorno real é o que sobra depois da inflação, antes de impostos e custos; ele varia de ano para ano e pode ser negativo. A taxa de retirada é uma regra prática, sem garantia de que o dinheiro dure para sempre.' }));
  }
  form.addEventListener('submit', calcular);
  calcular();
})();
