/* Cerne — calculadora de juros compostos.
 * Regra: o aporte entra no fim de cada mês.
 *   saldo do mês seguinte = saldo × (1 + taxa mensal) + aporte
 * Taxa ao ano vira taxa mensal equivalente: (1 + taxa)^(1/12) − 1.
 * Valores nominais, com taxa constante. É simulação, não previsão. */
(function () {
  'use strict';
  var L = window.CERNE, el = L.el, NS = 'http://www.w3.org/2000/svg';
  var $ = function (id) { return document.getElementById(id); };
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var campos = { inicial: $('j-inicial'), aporte: $('j-aporte'), taxa: $('j-taxa'), prazo: $('j-prazo'), inicio: $('j-inicio') };
  var taxaUn = $('j-taxa-un'), prazoUn = $('j-prazo-un');

  function brl2(v) { return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function compacto(v) {
    if (v >= 1e9) return 'R$ ' + L.num(v / 1e9, 1) + ' bi';
    if (v >= 1e6) return 'R$ ' + L.num(v / 1e6, 1) + ' mi';
    if (v >= 1e3) return 'R$ ' + L.num(v / 1e3, 0) + ' mil';
    return 'R$ ' + L.num(v, 0);
  }
  function s(tag, attrs, txt) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (txt) e.textContent = txt; return e; }

  /* ---------------------------------------------------------- validação -- */
  function marcar(nome, msg) {
    var c = campos[nome], e = $('e-' + nome);
    e.textContent = msg || ''; e.hidden = !msg;
    if (msg) c.setAttribute('aria-invalid', 'true'); else c.removeAttribute('aria-invalid');
    c.closest('.entrada').classList.toggle('invalida', !!msg);
    return !msg;
  }
  function dinheiro(nome, rotulo, max) {
    var bruto = campos[nome].value.trim();
    if (bruto === '') { marcar(nome, 'Informe o ' + rotulo + '. Se não houver, digite 0.'); return null; }
    if (/-/.test(bruto)) { marcar(nome, 'O ' + rotulo + ' não pode ser negativo.'); return null; }
    var v = L.lerNumero(bruto);
    if (v === null) { marcar(nome, 'Use só números, como 1.500 ou 1500,50.'); return null; }
    if (v > max) { marcar(nome, 'Valor alto demais para a simulação. O limite é ' + L.brl(max) + '.'); return null; }
    marcar(nome); return v;
  }
  function ler() {
    var ok = true, r = {};
    r.inicial = dinheiro('inicial', 'valor inicial', 1e11); if (r.inicial === null) ok = false;
    r.aporte = dinheiro('aporte', 'aporte mensal', 1e9); if (r.aporte === null) ok = false;
    if (ok && r.inicial === 0 && r.aporte === 0) { marcar('aporte', 'Informe um valor inicial ou um aporte maior que zero.'); ok = false; }

    var tb = campos.taxa.value.trim(), t = L.lerNumero(tb), anual = taxaUn.value === 'ano', tetoTaxa = anual ? 1000 : 50;
    if (tb === '') { marcar('taxa', 'Informe a taxa de juros.'); ok = false; }
    else if (/-/.test(tb)) { marcar('taxa', 'A calculadora não aceita taxa negativa.'); ok = false; }
    else if (t === null) { marcar('taxa', 'Use só números, como 10 ou 0,8.'); ok = false; }
    else if (t > tetoTaxa) { marcar('taxa', 'Taxa acima de ' + tetoTaxa + '% ' + (anual ? 'ao ano' : 'ao mês') + '. Confira se o período está certo.'); ok = false; }
    else { marcar('taxa'); r.taxaMes = anual ? Math.pow(1 + t / 100, 1 / 12) - 1 : t / 100; r.taxa = t; r.anual = anual; }

    var pb = campos.prazo.value.trim(), emAnos = prazoUn.value === 'anos', tetoPrazo = emAnos ? 100 : 1200;
    if (pb === '') { marcar('prazo', 'Informe o prazo.'); ok = false; }
    else if (!/^\d+$/.test(pb)) { marcar('prazo', 'Use um número inteiro de ' + (emAnos ? 'anos' : 'meses') + ', sem vírgula.'); ok = false; }
    else if (Number(pb) < 1) { marcar('prazo', 'O prazo precisa ser de pelo menos 1 ' + (emAnos ? 'ano' : 'mês') + '.'); ok = false; }
    else if (Number(pb) > tetoPrazo) { marcar('prazo', 'O limite é de ' + tetoPrazo + ' ' + (emAnos ? 'anos' : 'meses') + '.'); ok = false; }
    else { marcar('prazo'); r.meses = Number(pb) * (emAnos ? 12 : 1); }

    var d = campos.inicio, db = d.value;
    r.inicio = null;
    if (d.validity && d.validity.badInput) { marcar('inicio', 'Data incompleta ou inexistente. Preencha dia, mês e ano, ou apague.'); ok = false; }
    else if (db === '') marcar('inicio');
    else {
      var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(db), dt = p && new Date(+p[1], +p[2] - 1, +p[3]);
      if (!p || dt.getMonth() !== +p[2] - 1) { marcar('inicio', 'Data inválida. Use o formato dia/mês/ano.'); ok = false; }
      else if (+p[1] < 1900 || +p[1] > 2200) { marcar('inicio', 'Use um ano entre 1900 e 2200.'); ok = false; }
      else { marcar('inicio'); r.inicio = dt; }
    }
    return ok ? r : null;
  }

  /* -------------------------------------------------------------- cálculo -- */
  function simular(r) {
    var saldo = r.inicial, serie = [{ saldo: saldo, investido: saldo }];
    for (var m = 1; m <= r.meses; m++) {
      saldo = saldo * (1 + r.taxaMes) + r.aporte;
      serie.push({ saldo: saldo, investido: r.inicial + r.aporte * m });
    }
    return serie;
  }
  function quando(r, m) {
    if (r.inicio) { var d = new Date(r.inicio.getFullYear(), r.inicio.getMonth() + m, 1); return MESES[d.getMonth()] + '/' + d.getFullYear(); }
    if (m < 12) return m + (m === 1 ? ' mês' : ' meses');
    var a = Math.floor(m / 12), resto = m % 12;
    return a + (a === 1 ? ' ano' : ' anos') + (resto ? ' e ' + resto + (resto === 1 ? ' mês' : ' meses') : '');
  }

  /* ------------------------------------------------------------- gráfico -- */
  function grafico(serie, r) {
    var W = 720, H = 320, me = 64, md = 14, mt = 14, mb = 30, n = serie.length - 1;
    var topo = serie[n].saldo * 1.08 || 1;
    var X = function (m) { return me + (W - me - md) * m / n; }, Y = function (v) { return mt + (H - mt - mb) * (1 - v / topo); };
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Evolução do patrimônio em ' + quando({ inicio: null }, n) + ': total investido e juros acumulados, até ' + L.brl(serie[n].saldo) });
    for (var g = 0; g <= 4; g++) {
      var v = topo * g / 4;
      svg.appendChild(s('line', { x1: me, x2: W - md, y1: Y(v), y2: Y(v), class: 'g-grade' }));
      svg.appendChild(s('text', { x: me - 8, y: Y(v) + 4, 'text-anchor': 'end', class: 'g-txt' }, compacto(v)));
    }
    var passo = Math.max(1, Math.floor(n / 240)), pts = [];
    for (var m = 0; m < n; m += passo) pts.push(m);
    pts.push(n);
    var cima = pts.map(function (m, i) { return (i ? 'L' : 'M') + X(m).toFixed(1) + ',' + Y(serie[m].saldo).toFixed(1); }).join(' ');
    var meio = pts.map(function (m, i) { return (i ? 'L' : 'M') + X(m).toFixed(1) + ',' + Y(serie[m].investido).toFixed(1); }).join(' ');
    var meioVolta = pts.slice().reverse().map(function (m) { return 'L' + X(m).toFixed(1) + ',' + Y(serie[m].investido).toFixed(1); }).join(' ');
    svg.appendChild(s('path', { d: meio + ' L' + X(n).toFixed(1) + ',' + Y(0) + ' L' + X(0) + ',' + Y(0) + ' Z', class: 'g-investido' }));
    svg.appendChild(s('path', { d: cima + ' ' + meioVolta + ' Z', class: 'g-juros' }));
    svg.appendChild(s('path', { d: meio, class: 'g-linha-investido' }));
    svg.appendChild(s('path', { d: cima, class: 'g-linha' }));
    var anos = n / 12, pa = Math.max(1, Math.ceil(anos / 8));
    if (n >= 12) for (var a = 0; a <= anos + 1e-9; a += pa) svg.appendChild(s('text', { x: X(a * 12), y: H - mb + 18, 'text-anchor': a === 0 ? 'start' : 'middle', class: 'g-txt' }, r.inicio ? String(r.inicio.getFullYear() + a) : (a === 0 ? 'hoje' : a + (a === 1 ? ' ano' : ' anos'))));
    else for (var k = 0; k <= n; k += Math.max(1, Math.ceil(n / 6))) svg.appendChild(s('text', { x: X(k), y: H - mb + 18, 'text-anchor': k === 0 ? 'start' : 'middle', class: 'g-txt' }, k === 0 ? 'hoje' : 'mês ' + k));
    var guia = s('line', { y1: mt, y2: H - mb, class: 'g-guia', visibility: 'hidden' }), bola = s('circle', { r: 5, class: 'g-bola', visibility: 'hidden' });
    svg.appendChild(guia); svg.appendChild(bola);
    var leitura = $('j-leitura');
    function mostrar(m) {
      var p = serie[m];
      guia.setAttribute('x1', X(m)); guia.setAttribute('x2', X(m)); guia.setAttribute('visibility', 'visible');
      bola.setAttribute('cx', X(m)); bola.setAttribute('cy', Y(p.saldo)); bola.setAttribute('visibility', 'visible');
      leitura.textContent = (m === 0 ? 'Início' : quando(r, m)) + ': ' + brl2(p.saldo) + ', sendo ' + brl2(p.investido) + ' investidos e ' + brl2(p.saldo - p.investido) + ' de juros.';
    }
    function mover(ev) {
      var cx = ev.touches && ev.touches[0] ? ev.touches[0].clientX : ev.clientX;
      var box = svg.getBoundingClientRect(), x = (cx - box.left) / box.width * W;
      mostrar(Math.max(0, Math.min(n, Math.round((x - me) / (W - me - md) * n))));
    }
    svg.addEventListener('pointermove', mover); svg.addEventListener('pointerdown', mover);
    leitura.textContent = 'Passe o cursor ou toque no gráfico para ver cada mês.';
    return svg;
  }

  function tabela(serie, r) {
    var n = serie.length - 1, linhas = [], passo = n > 24 ? 12 : 1;
    for (var m = passo; m <= n; m += passo) linhas.push(m);
    if (linhas[linhas.length - 1] !== n) linhas.push(n);
    return el('div', { class: 'tabela-rolagem' }, el('table', {},
      el('thead', {}, el('tr', {}, el('th', { scope: 'col', text: r.inicio ? 'Data' : 'Tempo' }), el('th', { scope: 'col', class: 'num', text: 'Investido' }), el('th', { scope: 'col', class: 'num', text: 'Juros' }), el('th', { scope: 'col', class: 'num', text: 'Montante' }))),
      el('tbody', {}, linhas.map(function (m) { var p = serie[m]; return el('tr', {}, el('th', { scope: 'row', text: quando(r, m) }), el('td', { class: 'num', text: L.brl(p.investido) }), el('td', { class: 'num', text: L.brl(p.saldo - p.investido) }), el('td', { class: 'num', text: L.brl(p.saldo) })); }))));
  }

  /* ---------------------------------------------------------------- saída -- */
  var saida = $('saida-juros');
  function atualizar() {
    var a = $('a-taxa'), tb = L.lerNumero(campos.taxa.value.trim());
    if (tb !== null && tb <= (taxaUn.value === 'ano' ? 1000 : 50)) {
      a.textContent = taxaUn.value === 'ano'
        ? 'Equivale a ' + L.num((Math.pow(1 + tb / 100, 1 / 12) - 1) * 100, 2) + '% ao mês.'
        : 'Equivale a ' + L.num((Math.pow(1 + tb / 100, 12) - 1) * 100, 2) + '% ao ano.';
    } else a.textContent = '';

    var r = ler();
    saida.classList.toggle('pendente', !r);
    if (!r) { $('j-achado').textContent = 'Corrija os campos marcados para ver o resultado.'; $('j-rotulo').textContent = 'Montante final'; return; }
    var serie = simular(r), fim = serie[serie.length - 1], juros = fim.saldo - fim.investido;
    $('j-rotulo').textContent = 'Montante final' + (r.inicio ? ', em ' + quando(r, r.meses) : ', em ' + quando(r, r.meses));
    $('j-montante').textContent = brl2(fim.saldo);
    $('j-investido').textContent = brl2(fim.investido);
    $('j-juros').textContent = brl2(juros);
    var pj = fim.saldo > 0 ? juros / fim.saldo * 100 : 0, partes = $('j-partes').children;
    partes[0].style.width = (100 - pj) + '%'; partes[1].style.width = pj + '%';

    var virada = null;
    for (var m = 1; m < serie.length; m++) if (serie[m].saldo - serie[m].investido > serie[m].investido) { virada = m; break; }
    var achado;
    if (r.taxaMes === 0) achado = 'Com taxa zero não há juros: o montante é só a soma do que você colocou.';
    else if (virada) achado = 'Os juros passam a valer mais que tudo o que você investiu ' + (r.inicio ? 'em ' : 'depois de ') + quando(r, virada) + '. No fim, ' + L.num(pj, 0) + '% do montante são juros.';
    else achado = 'No fim do prazo, ' + L.num(pj, 0) + '% do montante são juros. Nesse prazo, eles ainda não superam o que você investiu.';
    $('j-achado').textContent = achado;

    var g = $('j-grafico'); g.textContent = ''; g.appendChild(grafico(serie, r));
    g.appendChild(el('figcaption', { class: 'legenda' }, el('span', {}, el('i', { class: 'chave chave-investido' }), 'Total investido'), el('span', {}, el('i', { class: 'chave chave-juros' }), 'Juros acumulados')));
    var t = $('j-tabela'); t.textContent = ''; t.appendChild(tabela(serie, r));
  }
  Object.keys(campos).forEach(function (k) { campos[k].addEventListener('input', atualizar); campos[k].addEventListener('change', atualizar); });
  taxaUn.addEventListener('change', atualizar); prazoUn.addEventListener('change', atualizar);
  $('form-juros').addEventListener('submit', function (ev) { ev.preventDefault(); });
  atualizar();
})();
