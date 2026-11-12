/* Lastro — comportamento comum das páginas: tema, menu no celular e
 * redirecionamento de links antigos de carteira compartilhada. */
(function () {
  'use strict';
  // Links de carteira criados antes da plataforma apontavam para a raiz (#c=...).
  if (location.hash.indexOf('#c=') === 0 && document.body.getAttribute('data-pagina') === 'inicio') {
    location.replace('carteira/' + location.hash);
    return;
  }
  function temaAtual() {
    var t = document.documentElement.getAttribute('data-tema');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  }
  var bt = document.getElementById('btn-tema');
  if (bt) {
    bt.setAttribute('aria-pressed', String(temaAtual() === 'escuro'));
    bt.addEventListener('click', function () {
      var novo = temaAtual() === 'escuro' ? 'claro' : 'escuro';
      document.documentElement.setAttribute('data-tema', novo);
      bt.setAttribute('aria-pressed', String(novo === 'escuro'));
      try { localStorage.setItem('msc:tema', novo); } catch (e) { /* sem armazenamento */ }
    });
  }
  var bn = document.getElementById('btn-nav'), nm = document.getElementById('nav-movel');
  if (bn && nm) bn.addEventListener('click', function () {
    var abrir = nm.hidden;
    nm.hidden = !abrir;
    bn.setAttribute('aria-expanded', String(abrir));
  });
})();

/* Utilidades usadas pelas ferramentas da plataforma. */
window.LASTRO = {
  lerNumero: function (txt) {
    var t = String(txt == null ? '' : txt).replace(/R\$|%|\s/g, '');
    if (t === '' || !/^[0-9.,]+$/.test(t) || (t.match(/,/g) || []).length > 1) return null;
    if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    else if ((t.match(/\./g) || []).length > 1) return null;
    var n = Number(t);
    return isFinite(n) ? n : null;
  },
  brl: function (v) { return 'R$ ' + Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 }); },
  num: function (v, c) { return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c }); },
  el: function (tag, attrs) {
    var e = document.createElement(tag), k;
    for (k in attrs || {}) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue;
      if (k === 'text') e.textContent = attrs[k]; else if (k === 'class') e.className = attrs[k]; else e.setAttribute(k, attrs[k]);
    }
    for (var i = 2; i < arguments.length; i++) {
      var f = arguments[i];
      if (f === null || f === undefined || f === false) continue;
      (Array.isArray(f) ? f : [f]).forEach(function (x) { if (x) e.appendChild(typeof x === 'object' ? x : document.createTextNode(String(x))); });
    }
    return e;
  }
};
