/* Cerne — área de aprendizagem: mini-testes e progresso.
 * O progresso fica só neste navegador (localStorage). Nada é enviado. */
(function () {
  'use strict';
  var CHAVE = 'cerne:aulas';
  function lerFeitos() {
    try {
      var v = JSON.parse(localStorage.getItem(CHAVE) || '[]');
      return Array.isArray(v) ? v.filter(function (s) { return typeof s === 'string' && /^[a-z0-9-]{1,60}$/.test(s); }) : [];
    } catch (e) { return []; }
  }
  function gravarFeito(slug) {
    var f = lerFeitos();
    if (f.indexOf(slug) < 0) f.push(slug);
    try { localStorage.setItem(CHAVE, JSON.stringify(f)); } catch (e) { /* sem armazenamento */ }
  }

  /* ------------------------------------------------------------ mini-teste -- */
  var teste = document.querySelector('.teste');
  if (teste) {
    var questoes = Array.prototype.slice.call(teste.querySelectorAll('.questao'));
    var placar = teste.querySelector('.teste-placar');
    var conferir = function () {
      var certas = 0, respondidas = 0;
      questoes.forEach(function (q) {
        var marcada = q.querySelector('input:checked'), retorno = q.querySelector('.retorno');
        Array.prototype.forEach.call(q.querySelectorAll('label'), function (l) { l.classList.remove('certa', 'errada'); });
        if (!marcada) { retorno.hidden = true; return; }
        respondidas++;
        var acertou = marcada.value === q.getAttribute('data-certa');
        marcada.parentNode.classList.add(acertou ? 'certa' : 'errada');
        retorno.querySelector('b').textContent = acertou ? 'Certo.' : 'Ainda não. Releia a explicação e tente outra opção.';
        /* a explicação só aparece no acerto, para a segunda tentativa valer */
        retorno.lastChild.textContent = acertou ? retorno.getAttribute('data-e') : '';
        retorno.hidden = false;
        if (acertou) certas++;
      });
      if (respondidas < questoes.length) placar.textContent = respondidas ? respondidas + ' de ' + questoes.length + ' respondidas.' : '';
      else if (certas === questoes.length) { placar.textContent = 'Você acertou as ' + questoes.length + '. Módulo concluído.'; gravarFeito(teste.getAttribute('data-aula')); }
      else placar.textContent = certas + ' de ' + questoes.length + ' certas. Ajuste as marcadas e o módulo fica concluído.';
    };
    questoes.forEach(function (q) {
      var r = q.querySelector('.retorno');
      r.setAttribute('data-e', r.lastChild.textContent);
      r.lastChild.textContent = '';
    });
    teste.addEventListener('change', conferir);
  }

  /* -------------------------------------------------------------- progresso -- */
  var painel = document.getElementById('progresso');
  if (painel) {
    var feitos = lerFeitos(), links = Array.prototype.slice.call(document.querySelectorAll('.modulos a[data-aula]'));
    var n = 0, proximo = null;
    links.forEach(function (a) {
      if (feitos.indexOf(a.getAttribute('data-aula')) >= 0) {
        n++; a.classList.add('feito');
        a.querySelector('.mod-estado').textContent = 'concluído';
      } else if (!proximo) proximo = a;
    });
    var total = Number(painel.getAttribute('data-total')) || links.length;
    document.getElementById('progresso-feitos').textContent = String(n);
    document.getElementById('progresso-barra').style.width = (n / total * 100) + '%';
    var ir = document.getElementById('progresso-ir');
    if (n && proximo) { ir.href = proximo.getAttribute('href'); ir.textContent = 'Continuar no módulo ' + proximo.querySelector('.mod-num').textContent; }
    else if (n && !proximo) { ir.href = 'metodo.html'; ir.textContent = 'Trilhas concluídas. Ver o método'; }
  }
})();
