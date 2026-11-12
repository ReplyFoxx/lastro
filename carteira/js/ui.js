/* ==========================================================================
 * Monte sua carteira — COMPONENTES DE INTERFACE
 * Peças reutilizáveis: criação de elementos, campos com validação, grupos
 * de opções, glossário ("o que é isso?"), diálogos, copiar e baixar.
 *
 * Segurança: nada aqui usa innerHTML. Todo texto entra por textContent,
 * então dados digitados ou vindos de link nunca viram marcação.
 * ========================================================================== */
(function (root) {
  'use strict';
  var C = root.MSC.CONFIG, E = root.MSC.engine, T = root.MSC.TEXTOS;

  /* Cria um elemento. attrs: class, text, on<evento>, ou atributos comuns. */
  function h(tag, attrs) {
    var el = document.createElement(tag), k, v;
    for (k in attrs || {}) {
      v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (var i = 2; i < arguments.length; i++) anexar(el, arguments[i]);
    return el;
  }
  function anexar(el, filho) {
    if (filho === null || filho === undefined || filho === false) return;
    if (Array.isArray(filho)) filho.forEach(function (f) { anexar(el, f); });
    else el.appendChild(typeof filho === 'object' ? filho : document.createTextNode(String(filho)));
  }
  function icone(d) {
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', 18); svg.setAttribute('height', 18);
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', 2); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p); return svg;
  }
  var ICONES = {
    compartilhar: 'M12 15V4m0 0L8 8m4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5',
    imprimir: 'M7 9V4h10v5M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v6H7z',
    imagem: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01',
    tela: 'M4 5h16v11H4zM9 20h6M12 16v4',
    refazer: 'M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5',
    pessoa: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0',
    voltar: 'M15 5l-7 7 7 7', seguir: 'M9 5l7 7-7 7'
  };

  function anunciar(msg) {
    var v = document.getElementById('vivo');
    if (!v) return;
    v.textContent = '';
    setTimeout(function () { v.textContent = msg; }, 60);
  }

  /* ------------------------------------------------------------ números -- */
  function fmtBRL(v) { return E.fmtBRL(v, Math.abs(v) < 100 && v % 1 !== 0 ? 2 : 0); }
  function fmtPct(v, casas) { return E.fmtNum(v, casas == null ? 2 : casas) + '%'; }
  function fmtEntrada(v, livre) { // livre = sem forçar duas casas (prazos, taxas)
    if (v === null || v === undefined || !isFinite(v)) return '';
    return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: livre || Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 });
  }
  /* Lê um número digitado no padrão brasileiro (1.234,56) ou com ponto decimal (1234.56).
   * Devolve {vazio:true} | {erro:'mensagem'} | {valor:n}. */
  function lerNumero(txt) {
    var t = String(txt == null ? '' : txt).replace(/R\$|%|\s/g, '');
    if (t === '') return { vazio: true };
    if (/^-/.test(t) && /^-[0-9.,]+$/.test(t)) return { erro: 'O valor não pode ser negativo.' };
    if (!/^[0-9.,]+$/.test(t) || !/[0-9]/.test(t)) return { erro: 'Use apenas números.' };
    if ((t.match(/,/g) || []).length > 1) return { erro: 'Use apenas uma vírgula, para as casas decimais.' };
    if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    else if ((t.match(/\./g) || []).length > 1) return { erro: 'Não entendi este número.' };
    var n = Number(t);
    if (!isFinite(n)) return { erro: 'Não entendi este número.' };
    return { valor: n };
  }

  /* ----------------------------------------------------------- glossário -- */
  var pop = null, popBotao = null;
  function fecharPop() {
    if (pop) pop.hidden = true;
    if (popBotao) { popBotao.setAttribute('aria-expanded', 'false'); popBotao = null; }
  }
  function abrirPop(botao, titulo, texto) {
    if (!pop) {
      pop = h('div', { id: 'msc-pop', role: 'note', 'aria-live': 'polite', hidden: true });
      document.body.appendChild(pop);
      document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && popBotao) { var b = popBotao; fecharPop(); b.focus(); } });
      document.addEventListener('click', function (ev) { if (popBotao && ev.target !== popBotao && !pop.contains(ev.target)) fecharPop(); });
      window.addEventListener('resize', fecharPop);
    }
    pop.textContent = '';
    pop.appendChild(h('strong', { text: titulo }));
    pop.appendChild(document.createTextNode(texto));
    pop.hidden = false;
    var r = botao.getBoundingClientRect(), pw = pop.offsetWidth, vw = document.documentElement.clientWidth;
    var left = Math.max(12, Math.min(vw - pw - 12, r.left + r.width / 2 - pw / 2));
    var top = r.bottom + 8;
    if (top + pop.offsetHeight > window.innerHeight - 8 && r.top - pop.offsetHeight - 8 > 0) top = r.top - pop.offsetHeight - 8;
    pop.style.left = (left + window.scrollX) + 'px';
    pop.style.top = (top + window.scrollY) + 'px';
    popBotao = botao; botao.setAttribute('aria-expanded', 'true');
  }
  /* Botão "?" que explica um termo. `chave` vem do glossário; `texto` permite explicação própria. */
  function termo(chave, nome, texto) {
    var explicacao = texto || T.glossario[chave] || '';
    var titulo = nome.charAt(0).toUpperCase() + nome.slice(1);
    return h('button', { type: 'button', class: 'termo', 'aria-label': 'O que é ' + nome + '?', 'aria-expanded': 'false', 'aria-controls': 'msc-pop',
      onclick: function (ev) { ev.preventDefault(); ev.stopPropagation(); if (popBotao === ev.currentTarget) fecharPop(); else { fecharPop(); abrirPop(ev.currentTarget, titulo, explicacao); } },
      onblur: function () { setTimeout(function () { if (popBotao && document.activeElement !== popBotao) fecharPop(); }, 150); } }, '?');
  }

  /* --------------------------------------------------------------- campo --
   * Campo numérico com rótulo, ajuda, prefixo/sufixo e mensagem de erro. */
  function campo(o) {
    var idErro = o.id + '-erro', idAjuda = o.id + '-ajuda';
    var input = h('input', { id: o.id, type: 'text', inputmode: o.texto ? null : 'decimal', autocomplete: 'off', maxlength: o.maxlength || 20,
      value: o.texto ? (o.valor || '') : fmtEntrada(o.valor, o.livre), 'aria-describedby': (o.ajuda ? idAjuda + ' ' : '') + idErro, enterkeyhint: 'next' });
    var erro = h('p', { class: 'erro', id: idErro, role: 'alert', hidden: true });
    var caixa = h('div', { class: 'campo' + (o.classe ? ' ' + o.classe : '') },
      h('div', { class: 'rotulo-linha' }, h('label', { class: 'rotulo', for: o.id, text: o.rotulo }), o.termo || null),
      o.ajuda ? h('span', { class: 'ajuda', id: idAjuda, text: o.ajuda }) : null,
      h('div', { class: 'entrada' }, o.prefixo ? h('span', { class: 'prefixo', 'aria-hidden': 'true', text: o.prefixo }) : null, input,
        o.sufixo ? h('span', { class: 'sufixo', 'aria-hidden': 'true', text: o.sufixo }) : null),
      erro);
    function definirErro(msg) {
      if (msg) { erro.textContent = msg; erro.hidden = false; caixa.classList.add('com-erro'); input.setAttribute('aria-invalid', 'true'); }
      else { erro.hidden = true; erro.textContent = ''; caixa.classList.remove('com-erro'); input.removeAttribute('aria-invalid'); }
    }
    input.addEventListener('input', function () { definirErro(''); if (o.aoMudar) o.aoMudar(o.texto ? input.value : lerNumero(input.value)); });
    if (!o.texto) input.addEventListener('blur', function () { var n = lerNumero(input.value); if (n.valor !== undefined) input.value = fmtEntrada(n.valor, o.livre); });
    else if (o.limpar) input.addEventListener('blur', function () { input.value = o.limpar(input.value); });
    return { el: caixa, input: input, definirErro: definirErro, exemplo: o.exemplo || 'Exemplo: 1.500,00.', ler: function () { return lerNumero(input.value); } };
  }

  /* Valida um campo numérico. Devolve o número, ou undefined se houver erro (já exibido). */
  function exigir(c, r) {
    var n = c.ler();
    if (n.vazio) {
      if (r.opcional) { c.definirErro(''); return r.padrao === undefined ? null : r.padrao; }
      c.definirErro(r.msgVazio || 'Preencha este campo. Se não tiver, digite 0.'); return undefined;
    }
    if (n.erro) { c.definirErro(n.erro + ' ' + c.exemplo); return undefined; }
    if (r.min !== undefined && n.valor < r.min) { c.definirErro(r.msgMin || 'O valor mínimo é ' + fmtEntrada(r.min) + '.'); return undefined; }
    if (r.max !== undefined && n.valor > r.max) { c.definirErro(r.msgMax || 'Valor alto demais. O máximo aceito é ' + fmtEntrada(r.max) + '.'); return undefined; }
    c.definirErro('');
    return n.valor;
  }

  /* ------------------------------------------------------ grupo de opções -- */
  function grupoOpcoes(o) {
    var tipo = o.multiplo ? 'checkbox' : 'radio', idErro = o.id + '-erro', inputs = [];
    var erro = h('p', { class: 'erro', id: idErro, role: 'alert', hidden: true });
    var fs = h('fieldset', { class: 'grupo', id: o.id, 'aria-describedby': idErro },
      h('legend', {}, o.numero ? h('span', { class: 'num-pergunta', text: o.numero }) : null, o.titulo, o.termo || null),
      o.nota ? h('p', { class: 'ajuda', text: o.nota }) : null);
    o.opcoes.forEach(function (op, i) {
      var rotulo = typeof op === 'string' ? op : op.nome, valor = typeof op === 'string' ? i : op.valor;
      var marcado = o.multiplo ? (o.valor || []).indexOf(valor) >= 0 : o.valor === valor;
      var inp = h('input', { type: tipo, name: o.id, value: valor, checked: marcado, id: o.id + '-' + i });
      inp.checked = !!marcado;
      inp.addEventListener('change', function () { definirErro(''); if (o.aoMudar) o.aoMudar(ler()); });
      inputs.push(inp);
      fs.appendChild(h('label', { class: 'opcao', for: o.id + '-' + i }, inp, h('span', { text: rotulo })));
    });
    fs.appendChild(erro);
    function ler() {
      var marc = inputs.filter(function (i) { return i.checked; }).map(function (i) { return Number(i.value); });
      return o.multiplo ? marc : (marc.length ? marc[0] : null);
    }
    function definirErro(msg) {
      if (msg) { erro.textContent = msg; erro.hidden = false; fs.classList.add('com-erro'); }
      else { erro.hidden = true; erro.textContent = ''; fs.classList.remove('com-erro'); }
    }
    return { el: fs, ler: ler, definirErro: definirErro, focar: function () { inputs[0].focus(); } };
  }

  function aviso(a) {
    var alerta = a.nivel === 'alerta';
    return h('div', { class: 'aviso' + (alerta ? ' aviso-alerta' : '') },
      h('span', { class: 'aviso-icone', 'aria-hidden': 'true', text: alerta ? '!' : 'i' }),
      h('h3', {}, h('span', { class: 'sr-only', text: alerta ? 'Atenção: ' : 'Informação: ' }), a.titulo),
      h('p', { text: a.texto }));
  }

  /* -------------------------------------------------------------- diálogo -- */
  function abrirDialogo(titulo, corpo, opts) {
    opts = opts || {};
    var dlg = h('dialog', { class: 'dialogo', 'aria-labelledby': 'dlg-titulo' });
    var fechar = function () { if (dlg.open) dlg.close(); };
    dlg.appendChild(h('div', { class: 'dialogo-dentro' },
      h('div', { class: 'dialogo-cabeca' }, h('h2', { id: 'dlg-titulo', text: titulo }),
        h('button', { type: 'button', class: 'fechar', 'aria-label': 'Fechar', onclick: fechar }, '×')),
      typeof corpo === 'function' ? corpo(fechar) : corpo));
    dlg.addEventListener('click', function (ev) { if (ev.target === dlg) fechar(); });
    dlg.addEventListener('close', function () { dlg.remove(); if (opts.aoFechar) opts.aoFechar(); });
    document.body.appendChild(dlg);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    return { el: dlg, fechar: fechar };
  }

  /* ------------------------------------------------------ copiar e baixar -- */
  function copiarTexto(texto, campoInput) {
    function reserva() {
      try {
        if (campoInput) { campoInput.focus(); campoInput.select(); return document.execCommand('copy'); }
      } catch (e) { /* segue */ }
      return false;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto).then(function () { return true; }, function () { return reserva(); });
    }
    return Promise.resolve(reserva());
  }
  function baixar(blob, nome) {
    var url = URL.createObjectURL(blob), a = h('a', { href: url, download: nome });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /* A biblioteca de QR Code só é baixada quando alguém abre o diálogo de compartilhar. */
  var qrPromessa = null;
  function carregarQR() {
    if (typeof root.qrcode === 'function') return Promise.resolve(true);
    if (!qrPromessa) qrPromessa = new Promise(function (ok) {
      var sc = document.createElement('script');
      sc.src = 'vendor/qrcode.js';
      sc.onload = function () { ok(true); };
      sc.onerror = function () { qrPromessa = null; ok(false); };
      document.head.appendChild(sc);
    });
    return qrPromessa;
  }
  /* QR Code em SVG, desenhado módulo a módulo (biblioteca em vendor/qrcode.js). */
  function qrSVG(texto) {
    if (typeof root.qrcode !== 'function') return null;
    try {
      var q = root.qrcode(0, 'M'); q.addData(texto); q.make();
      var n = q.getModuleCount(), NS = 'http://www.w3.org/2000/svg', d = '';
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + c + ',' + r + 'h1v1h-1z';
      var svg = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
      svg.setAttribute('viewBox', '0 0 ' + n + ' ' + n); svg.setAttribute('class', 'qr'); svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'QR Code com o link deste app'); svg.setAttribute('shape-rendering', 'crispEdges');
      p.setAttribute('d', d); p.setAttribute('fill', '#000');
      svg.appendChild(p); return svg;
    } catch (e) { return null; }
  }

  root.MSC.ui = {
    h: h, icone: icone, ICONES: ICONES, anunciar: anunciar, fmtBRL: fmtBRL, fmtPct: fmtPct, fmtEntrada: fmtEntrada, lerNumero: lerNumero,
    termo: termo, fecharPop: fecharPop, campo: campo, exigir: exigir, grupoOpcoes: grupoOpcoes, aviso: aviso,
    abrirDialogo: abrirDialogo, copiarTexto: copiarTexto, baixar: baixar, qrSVG: qrSVG, carregarQR: carregarQR
  };
})(window);
