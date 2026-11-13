/* ==========================================================================
 * Monte sua carteira — GRÁFICOS (SVG próprio, sem biblioteca externa)
 * Cada classe tem uma cor E um padrão de textura (config.js), iguais em
 * todos os gráficos, para não depender só de cor.
 * ========================================================================== */
(function (root) {
  'use strict';
  var C = root.MSC.CONFIG, E = root.MSC.engine;
  var NS = 'http://www.w3.org/2000/svg';

  function s(tag, attrs, filhos) {
    var el = document.createElementNS(NS, tag), k;
    for (k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) el.setAttribute(k, attrs[k]);
    (filhos || []).forEach(function (f) { if (f) el.appendChild(typeof f === 'string' ? document.createTextNode(f) : f); });
    return el;
  }

  /* ------------------------------------------------------------ padrões -- */
  var TRACO = 'rgba(255,255,255,0.5)';
  function desenhoPadrao(tipo) {
    var l = function (d) { return s('path', { d: d, stroke: TRACO, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'square' }); };
    switch (tipo) {
      case 'diagonal': return [l('M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4')];
      case 'contradiagonal': return [l('M-2,6 l4,4 M0,0 l8,8 M6,-2 l4,4')];
      case 'horizontal': return [l('M0,4 h8')];
      case 'vertical': return [l('M4,0 v8')];
      case 'xadrez': return [l('M0,8 l8,-8 M0,0 l8,8')];
      case 'grade': return [l('M0,4 h8 M4,0 v8')];
      case 'ondas': return [l('M0,4 q2,-4 4,0 t4,0')];
      case 'pontos': return [s('circle', { cx: 2, cy: 2, r: 1.4, fill: TRACO }), s('circle', { cx: 6, cy: 6, r: 1.4, fill: TRACO })];
      default: return [];
    }
  }
  function criarDefs(prefixo) {
    var tipos = ['diagonal', 'contradiagonal', 'horizontal', 'vertical', 'xadrez', 'grade', 'ondas', 'pontos'];
    return s('defs', {}, tipos.map(function (t) {
      return s('pattern', { id: prefixo + t, width: 8, height: 8, patternUnits: 'userSpaceOnUse' }, desenhoPadrao(t));
    }));
  }
  function instalarDefs() {
    if (document.getElementById('msc-defs')) return;
    var svg = s('svg', { id: 'msc-defs', width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false', style: 'position:absolute' }, [criarDefs('pd-')]);
    document.body.appendChild(svg);
  }
  function preencher(padrao, prefixo) { return padrao && padrao !== 'liso' ? 'url(#' + (prefixo || 'pd-') + padrao + ')' : null; }

  /* Quadradinho de legenda com cor + padrão */
  function amostra(id) {
    var cl = E.classe(id), p = preencher(cl.padrao);
    return s('svg', { class: 'amostra', width: 16, height: 16, viewBox: '0 0 16 16', 'aria-hidden': 'true', focusable: 'false' }, [
      s('rect', { width: 16, height: 16, rx: 4, fill: cl.cor }),
      p ? s('rect', { width: 16, height: 16, rx: 4, fill: p }) : null
    ]);
  }

  /* -------------------------------------------------------------- dicas -- */
  var tip = null;
  function elTip() {
    if (!tip) { tip = document.createElement('div'); tip.id = 'msc-tip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true; document.body.appendChild(tip); }
    return tip;
  }
  function mostrarDica(x, y, linhas) {
    var t = elTip();
    t.textContent = '';
    linhas.forEach(function (ln, i) { var d = document.createElement('div'); if (i === 0 && linhas.length > 1) d.className = 'tip-titulo'; d.textContent = ln; t.appendChild(d); });
    t.hidden = false;
    var r = t.getBoundingClientRect(), vw = document.documentElement.clientWidth;
    var left = Math.max(8, Math.min(vw - r.width - 8, x - r.width / 2));
    var top = y - r.height - 12; if (top < 8) top = y + 16;
    t.style.left = left + 'px'; t.style.top = top + 'px';
  }
  function esconderDica() { if (tip) tip.hidden = true; }
  function ligarDicas() {
    function alvo(ev) { return ev.target && ev.target.closest ? ev.target.closest('[data-tip]') : null; }
    function abrir(ev) {
      var a = alvo(ev); if (!a) return;
      var r = a.getBoundingClientRect();
      var x = ev.clientX || r.left + r.width / 2, y = ev.type === 'focusin' || !ev.clientY ? r.top : ev.clientY;
      mostrarDica(x, y, a.getAttribute('data-tip').split('|'));
    }
    document.addEventListener('pointerover', abrir);
    document.addEventListener('pointermove', function (ev) { if (alvo(ev)) abrir(ev); });
    document.addEventListener('focusin', abrir);
    document.addEventListener('pointerout', function (ev) { if (alvo(ev)) esconderDica(); });
    document.addEventListener('focusout', function (ev) { if (alvo(ev)) esconderDica(); });
    window.addEventListener('scroll', esconderDica, { passive: true });
  }

  /* -------------------------------------------------------------- rosca -- */
  function arco(cx, cy, r0, r1, a0, a1) {
    function p(r, a) { return (cx + r * Math.cos(a)).toFixed(2) + ',' + (cy + r * Math.sin(a)).toFixed(2); }
    var grande = a1 - a0 > Math.PI ? 1 : 0;
    return 'M' + p(r1, a0) + ' A' + r1 + ',' + r1 + ' 0 ' + grande + ' 1 ' + p(r1, a1) + ' L' + p(r0, a1) + ' A' + r0 + ',' + r0 + ' 0 ' + grande + ' 0 ' + p(r0, a0) + ' Z';
  }
  /* itens: [{id, nome, pct, valor?}] — opts: {linhas:[{t, pequeno}], prefixo, corFundo, estatico, rotulo} */
  function rosca(itens, opts) {
    opts = opts || {};
    var cx = 110, cy = 110, r0 = 62, r1 = 104, ang = -Math.PI / 2, grupos = [];
    var fundo = opts.corFundo || 'var(--surface)';
    itens.forEach(function (it) {
      if (!(it.pct > 0)) return;
      var cl = E.classe(it.id), fim = ang + it.pct / 100 * Math.PI * 2;
      var caminhos = [];
      if (it.pct >= 100) { // anel inteiro: dois meios arcos
        caminhos = [arco(cx, cy, r0, r1, ang, ang + Math.PI), arco(cx, cy, r0, r1, ang + Math.PI, ang + 2 * Math.PI - 0.0001)];
      } else caminhos = [arco(cx, cy, r0, r1, ang, fim)];
      var filhos = [];
      caminhos.forEach(function (d) {
        filhos.push(s('path', { d: d, fill: cl.cor, stroke: fundo, 'stroke-width': it.pct >= 100 ? 0 : 2 }));
        var p = preencher(cl.padrao, opts.prefixo);
        if (p) filhos.push(s('path', { d: d, fill: p, stroke: fundo, 'stroke-width': it.pct >= 100 ? 0 : 2 }));
      });
      var rotulo = it.nome + ': ' + it.pct + '%';
      var attrs = opts.estatico ? {} : { class: 'fatia', tabindex: 0, role: 'img', 'aria-label': rotulo,
        'data-tip': it.valor != null ? rotulo + '|' + E.fmtBRL(it.valor) : rotulo };
      grupos.push(s('g', attrs, filhos));
      ang = fim;
    });
    var textos = [];
    var linhas = opts.linhas || [], alt = 21, y0 = cy - (linhas.length - 1) * alt / 2 + 6;
    linhas.forEach(function (ln, i) {
      textos.push(s('text', { x: cx, y: y0 + i * alt, 'text-anchor': 'middle', class: ln.pequeno ? 'rosca-c2' : 'rosca-c1' }, [ln.t]));
    });
    return s('svg', { class: 'rosca', viewBox: '0 0 220 220', role: 'group', 'aria-label': opts.rotulo || 'Gráfico de rosca da alocação por classe' }, grupos.concat(textos));
  }

  /* ------------------------------------------------------------ medidor -- */
  function medidor(final, cap, tol) {
    var cx = 160, cy = 150, r0 = 78, r1 = 128, filhos = [];
    function angDe(i) { return Math.PI + i * Math.PI / 5; }
    for (var i = 0; i < 5; i++) {
      var a0 = angDe(i) + 0.012, a1 = angDe(i + 1) - 0.012;
      filhos.push(s('path', { d: arco(cx, cy, r0, r1, a0, a1), class: 'med-seg' + (i === final ? ' med-ativo' : ''), 'fill-opacity': (0.16 + i * 0.13).toFixed(2) }));
      var am = (a0 + a1) / 2, rt = (r0 + r1) / 2;
      filhos.push(s('text', { x: cx + rt * Math.cos(am), y: cy + rt * Math.sin(am) + 5, 'text-anchor': 'middle', class: 'med-num' }, [String(i + 1)]));
    }
    function marca(nivel, letra, desloca) {
      var a = angDe(nivel + 0.5) + desloca, r = r1 + 14;
      return s('text', { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) + 4, 'text-anchor': 'middle', class: 'med-marca' }, [letra]);
    }
    if (cap != null) filhos.push(marca(cap, 'C', cap === tol ? -0.11 : 0));
    if (tol != null) filhos.push(marca(tol, 'T', cap === tol ? 0.11 : 0));
    var an = angDe(final + 0.5);
    filhos.push(s('line', { x1: cx, y1: cy, x2: cx + (r0 - 10) * Math.cos(an), y2: cy + (r0 - 10) * Math.sin(an), class: 'med-agulha' }));
    filhos.push(s('circle', { cx: cx, cy: cy, r: 7, class: 'med-eixo' }));
    var nomes = C.perfis.map(function (p) { return p.nome; });
    var rotulo = 'Medidor de risco: perfil ' + nomes[final] + ', nível ' + (final + 1) + ' de 5.' +
      (cap != null ? ' Capacidade: ' + nomes[cap] + '. Tolerância: ' + nomes[tol] + '.' : '');
    return s('svg', { class: 'medidor', viewBox: '0 0 320 166', role: 'img', 'aria-label': rotulo }, filhos);
  }

  /* -------------------------------------------------------------- leque -- */
  function fmtCompacto(v) {
    var a = Math.abs(v);
    if (a >= 1e9) return 'R$ ' + E.fmtNum(v / 1e9, a >= 1e10 ? 0 : 1) + ' bi';
    if (a >= 1e6) return 'R$ ' + E.fmtNum(v / 1e6, a >= 1e7 ? 0 : 1) + ' mi';
    if (a >= 1e3) return 'R$ ' + E.fmtNum(v / 1e3, 0) + ' mil';
    return 'R$ ' + E.fmtNum(v, 0);
  }
  function passoBonito(max, n) {
    var bruto = max / n, pot = Math.pow(10, Math.floor(Math.log10(bruto))), f = bruto / pot;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pot;
  }
  function rotuloTempo(m, N) {
    if (N <= 24) return m === 0 ? 'Hoje' : 'Mês ' + m;
    var anos = m / 12;
    return m === 0 ? 'Hoje' : (m % 12 === 0 ? 'Ano ' + anos : 'Ano ' + E.fmtNum(anos, 1));
  }
  /* Desenha dentro de `caixa` e redesenha quando a largura muda. */
  function leque(caixa, proj) {
    var N = proj.meses, S = proj.series, cursor = null;
    function desenhar() {
      var W = Math.max(280, Math.round(caixa.clientWidth || 600)), H = W < 480 ? 240 : 300;
      var mg = { e: W < 480 ? 62 : 72, d: 16, t: 16, b: 38 };
      var iw = W - mg.e - mg.d, ih = H - mg.t - mg.b;
      var topo = Math.max(S.otimista[N], proj.meta, 1) * 1.1;
      var passoY = passoBonito(topo, 4); topo = Math.ceil(topo / passoY) * passoY;
      var X = function (m) { return mg.e + iw * m / N; }, Y = function (v) { return mg.t + ih * (1 - v / topo); };
      var salto = Math.max(1, Math.floor(N / 150)), idx = [];
      for (var m = 0; m < N; m += salto) idx.push(m); idx.push(N);
      function linha(serie) { return idx.map(function (m, i) { return (i ? 'L' : 'M') + X(m).toFixed(1) + ',' + Y(serie[m]).toFixed(1); }).join(' '); }
      var filhos = [];
      // grade e eixo Y
      for (var v = 0; v <= topo + 1e-6; v += passoY) {
        filhos.push(s('line', { x1: mg.e, x2: W - mg.d, y1: Y(v), y2: Y(v), class: 'eixo-grade' }));
        filhos.push(s('text', { x: mg.e - 8, y: Y(v) + 4, 'text-anchor': 'end', class: 'eixo-txt' }, [v === 0 ? 'R$ 0' : fmtCompacto(v)]));
      }
      // eixo X
      var emMeses = N <= 24, total = emMeses ? N : N / 12;
      var passoX = emMeses ? (N <= 12 ? 3 : 6) : Math.max(1, Math.ceil(total / (W < 480 ? 5 : 8)));
      var marcas = [];
      for (var t = 0; t <= total + 1e-6; t += passoX) marcas.push(t);
      var ultimaMarca = marcas[marcas.length - 1];
      if (total - ultimaMarca > 1e-6) { // garante a marca do fim do prazo
        if (total - ultimaMarca < passoX * 0.6 && marcas.length > 1) marcas.pop();
        marcas.push(total);
      }
      marcas.forEach(function (t) {
        var mm = emMeses ? t : t * 12;
        filhos.push(s('text', { x: X(mm), y: H - mg.b + 16, 'text-anchor': t === total ? 'end' : 'middle', class: 'eixo-txt' }, [E.fmtNum(t, t % 1 === 0 ? 0 : 1)]));
      });
      filhos.push(s('text', { x: mg.e + iw / 2, y: H - 4, 'text-anchor': 'middle', class: 'eixo-titulo' }, [emMeses ? 'meses a partir de hoje' : 'anos a partir de hoje']));
      // faixa entre pessimista e otimista
      var volta = idx.slice().reverse().map(function (m) { return 'L' + X(m).toFixed(1) + ',' + Y(S.pessimista[m]).toFixed(1); }).join(' ');
      filhos.push(s('path', { d: linha(S.otimista) + ' ' + volta + ' Z', class: 'leque-faixa' }));
      // meta
      filhos.push(s('line', { x1: mg.e, x2: W - mg.d, y1: Y(proj.meta), y2: Y(proj.meta), class: 'leque-meta' }));
      filhos.push(s('text', { x: mg.e + 6, y: Y(proj.meta) - 6, class: 'leque-meta-txt' }, ['Meta: ' + fmtCompacto(proj.meta)]));
      // linhas
      filhos.push(s('path', { d: linha(S.otimista), class: 'leque-linha leque-otimista' }));
      filhos.push(s('path', { d: linha(S.pessimista), class: 'leque-linha leque-pessimista' }));
      filhos.push(s('path', { d: linha(S.base), class: 'leque-linha leque-base' }));
      // cursor
      var gCursor = s('g', { class: 'leque-cursor', visibility: 'hidden' }, [
        s('line', { y1: mg.t, y2: mg.t + ih, class: 'leque-cursor-linha' }),
        s('circle', { r: 4, class: 'leque-ponto' }), s('circle', { r: 5, class: 'leque-ponto leque-ponto-base' }), s('circle', { r: 4, class: 'leque-ponto' })
      ]);
      filhos.push(gCursor);
      var svg = s('svg', { class: 'leque', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, tabindex: 0, role: 'img',
        'aria-label': 'Evolução projetada para ' + proj.nome + ' em ' + E.fmtPrazo(proj.prazo) + '. Ao final: pessimista ' + E.fmtBRL(proj.fim.pessimista) + ', base ' + E.fmtBRL(proj.fim.base) +
          ', otimista ' + E.fmtBRL(proj.fim.otimista) + '. Meta: ' + E.fmtBRL(proj.meta) + '. Use as setas para percorrer o tempo.' }, filhos);

      function irPara(m) {
        cursor = Math.max(0, Math.min(N, Math.round(m)));
        var x = X(cursor), pts = gCursor.childNodes;
        pts[0].setAttribute('x1', x); pts[0].setAttribute('x2', x);
        [S.otimista, S.base, S.pessimista].forEach(function (serie, i) { pts[i + 1].setAttribute('cx', x); pts[i + 1].setAttribute('cy', Y(serie[cursor])); });
        gCursor.setAttribute('visibility', 'visible');
        var r = svg.getBoundingClientRect();
        mostrarDica(r.left + x, r.top + Y(S.otimista[cursor]), [
          rotuloTempo(cursor, N), 'Otimista: ' + E.fmtBRL(S.otimista[cursor]), 'Base: ' + E.fmtBRL(S.base[cursor]), 'Pessimista: ' + E.fmtBRL(S.pessimista[cursor])
        ]);
      }
      function sair() { gCursor.setAttribute('visibility', 'hidden'); esconderDica(); }
      svg.addEventListener('pointermove', function (ev) {
        var r = svg.getBoundingClientRect();
        irPara((ev.clientX - r.left - mg.e) / iw * N);
      });
      svg.addEventListener('pointerleave', sair);
      svg.addEventListener('blur', sair);
      svg.addEventListener('focus', function () { irPara(cursor === null ? N : cursor); });
      svg.addEventListener('keydown', function (ev) {
        var passo = N <= 24 ? 1 : 12, atual = cursor === null ? N : cursor, novo = null;
        if (ev.key === 'ArrowLeft') novo = atual - passo;
        else if (ev.key === 'ArrowRight') novo = atual + passo;
        else if (ev.key === 'Home') novo = 0;
        else if (ev.key === 'End') novo = N;
        if (novo !== null) { ev.preventDefault(); irPara(novo); }
      });
      caixa.textContent = '';
      caixa.appendChild(svg);
    }
    desenhar();
    if (typeof ResizeObserver !== 'undefined') {
      var ultima = caixa.clientWidth, agendado = null;
      new ResizeObserver(function () {
        if (Math.abs(caixa.clientWidth - ultima) < 2) return;
        ultima = caixa.clientWidth;
        clearTimeout(agendado); agendado = setTimeout(desenhar, 80);
      }).observe(caixa);
    }
  }

  /* ------------------------------------------------------ imagem (PNG) --
   * Monta um SVG independente (sem dados pessoais: só classes e percentuais)
   * e converte em PNG 1080 x 1080 no próprio navegador. */
  function pngAlocacao(itens, nomePerfil, legenda) {
    var L = 1080, fundo = '#FFFFFF', tinta = '#172554', tinta2 = '#263B67';
    var serif = '"Bricolage Grotesque", system-ui, "Segoe UI", Arial, sans-serif', sans = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    var r = rosca(itens, { prefixo: 'px-', corFundo: fundo, estatico: true });
    r.removeAttribute('class'); r.removeAttribute('role'); r.removeAttribute('aria-label');
    r.setAttribute('x', 70); r.setAttribute('y', 300); r.setAttribute('width', 460); r.setAttribute('height', 460);
    var filhos = [
      criarDefs('px-'),
      s('rect', { width: L, height: L, fill: fundo }),
      s('rect', { x: 70, y: 84, width: 72, height: 6, fill: '#FFB38A' }),
      s('text', { x: 70, y: 170, 'font-family': serif, 'font-size': 68, fill: tinta }, ['Minha carteira']),
      s('text', { x: 70, y: 226, 'font-family': sans, 'font-size': 32, fill: tinta2 }, [legenda]),
      r
    ];
    var alturaLinha = Math.min(72, 560 / itens.length), y0 = 530 - (itens.length * alturaLinha) / 2 + alturaLinha / 2;
    itens.forEach(function (it, i) {
      var cl = E.classe(it.id), y = y0 + i * alturaLinha, p = preencher(cl.padrao, 'px-');
      filhos.push(s('rect', { x: 590, y: y - 17, width: 34, height: 34, rx: 8, fill: cl.cor }));
      if (p) filhos.push(s('rect', { x: 590, y: y - 17, width: 34, height: 34, rx: 8, fill: p }));
      filhos.push(s('text', { x: 720, y: y + 11, 'text-anchor': 'end', 'font-family': serif, 'font-size': 36, fill: tinta }, [it.pct + '%']));
      filhos.push(s('text', { x: 738, y: y + 10, 'font-family': sans, 'font-size': 26, fill: tinta }, [cl.curto]));
    });
    filhos.push(s('text', { x: 300, y: 522, 'text-anchor': 'middle', 'font-family': sans, 'font-size': 22, fill: tinta2 }, ['perfil']));
    filhos.push(s('text', { x: 300, y: 560, 'text-anchor': 'middle', 'font-family': serif, 'font-size': nomePerfil.length > 12 ? 26 : 34, fill: tinta }, [nomePerfil]));
    filhos.push(s('line', { x1: 70, x2: L - 70, y1: 930, y2: 930, stroke: '#D6DBE6', 'stroke-width': 2 }));
    filhos.push(s('text', { x: 70, y: 980, 'font-family': serif, 'font-size': 30, fill: tinta }, ['Monte sua carteira']));
    filhos.push(s('text', { x: 70, y: 1018, 'font-family': sans, 'font-size': 21, fill: tinta2 }, ['Conteúdo educacional. Não é recomendação de investimento.']));
    var svg = s('svg', { xmlns: NS, width: L, height: L, viewBox: '0 0 ' + L + ' ' + L }, filhos);
    var xml = new XMLSerializer().serializeToString(svg);
    return new Promise(function (ok, erro) {
      var img = new Image();
      img.onload = function () {
        try {
          var cv = document.createElement('canvas'); cv.width = L; cv.height = L;
          cv.getContext('2d').drawImage(img, 0, 0, L, L);
          cv.toBlob(function (b) { b ? ok(b) : erro(new Error('sem imagem')); }, 'image/png');
        } catch (e) { erro(e); }
      };
      img.onerror = function () { erro(new Error('falha ao gerar imagem')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    });
  }

  root.MSC.charts = {
    instalarDefs: instalarDefs, ligarDicas: ligarDicas, amostra: amostra, rosca: rosca, medidor: medidor, leque: leque,
    pngAlocacao: pngAlocacao, fmtCompacto: fmtCompacto, mostrarDica: mostrarDica, esconderDica: esconderDica
  };
})(window);
