/* ==========================================================================
 * Monte sua carteira — APLICAÇÃO (fluxo de telas, armazenamento, compartilhar)
 * A lógica financeira está em engine.js; aqui só há interface.
 * ========================================================================== */
(function (root) {
  'use strict';
  var C = root.MSC.CONFIG, E = root.MSC.engine, T = root.MSC.TEXTOS, M = root.MSC.macro, S = root.MSC.share,
    G = root.MSC.charts, U = root.MSC.ui, R = root.MSC.resultado, h = U.h;

  var CHAVE = 'msc:progresso:v1';
  var TELAS = ['inicio', 'situacao', 'objetivos', 'capacidade', 'tolerancia', 'conhecimento', 'atual', 'resultado'];
  var ETAPA = { inicio: 1, situacao: 2, objetivos: 3, capacidade: 4, tolerancia: 4, conhecimento: 5, atual: 6, resultado: 7 };
  var NOME = { inicio: 'Boas-vindas', situacao: 'Situação financeira', objetivos: 'Objetivos', capacidade: 'Perfil de risco: capacidade',
    tolerancia: 'Perfil de risco: tolerância', conhecimento: 'Conhecimento e experiência', atual: 'Carteira atual', resultado: 'Resultado' };
  var PENDENCIA_TELA = { renda: 'situacao', despesas: 'situacao', patrimonio: 'situacao', aporte: 'situacao', objetivos: 'objetivos',
    capacidade: 'capacidade', tolerancia: 'tolerancia', conhecimento: 'conhecimento' };

  var app = {
    estado: E.estadoVazio(), tela: 'inicio', pagina: null, leitura: null, erroLink: false,
    macro: null, macroPromessa: null, visao: 'carteira', temSalvo: false, telaSalva: null, podeSalvar: true
  };
  var main = document.getElementById('app');
  function hojeRef() { var d = new Date(); return { ano: d.getFullYear(), mes: d.getMonth() }; }

  /* -------------------------------------------------------- armazenamento -- */
  function salvar() {
    if (app.leitura) return; // nunca grava por cima do progresso de quem só está vendo um link
    if (JSON.stringify(app.estado) === JSON.stringify(E.estadoVazio())) { // nada respondido: não deixa nenhum registro
      try { root.localStorage.removeItem(CHAVE); } catch (e) { /* segue */ }
      app.temSalvo = false; return;
    }
    try { root.localStorage.setItem(CHAVE, JSON.stringify({ estado: app.estado, tela: app.tela === 'inicio' ? (app.telaSalva || 'inicio') : app.tela })); app.temSalvo = true; }
    catch (e) { app.podeSalvar = false; }
  }
  function lerSalvo() {
    try {
      var b = JSON.parse(root.localStorage.getItem(CHAVE));
      if (!b || typeof b !== 'object') return null;
      return { estado: E.normalizarEstado(b.estado), tela: TELAS.indexOf(b.tela) >= 0 ? b.tela : 'inicio' };
    } catch (e) { return null; }
  }
  function apagarTudo() {
    try {
      var chaves = [];
      for (var i = 0; i < root.localStorage.length; i++) { var k = root.localStorage.key(i); if (k && k.indexOf('msc:') === 0) chaves.push(k); }
      chaves.forEach(function (k) { root.localStorage.removeItem(k); });
    } catch (e) { /* sem armazenamento */ }
    app.estado = E.estadoVazio(); app.temSalvo = false; app.telaSalva = null; app.visao = 'carteira';
  }
  function testarArmazenamento() {
    try { root.localStorage.setItem('msc:teste', '1'); root.localStorage.removeItem('msc:teste'); return true; } catch (e) { return false; }
  }

  /* ----------------------------------------------------------- navegação -- */
  function primeiraPendente() {
    var p = E.pendencias(app.estado);
    for (var i = 0; i < TELAS.length; i++) for (var j = 0; j < p.length; j++) if (PENDENCIA_TELA[p[j]] === TELAS[i]) return TELAS[i];
    return null;
  }
  function telaPermitida(tela) {
    var i = TELAS.indexOf(tela), pend = primeiraPendente();
    if (i < 0) return 'inicio';
    if (pend && TELAS.indexOf(pend) < i) return pend;
    return tela;
  }
  function irPara(tela, opts) {
    opts = opts || {};
    U.fecharPop(); G.esconderDica();
    app.pagina = null;
    app.tela = telaPermitida(tela);
    if (!opts.semHistorico) { try { root.history.pushState({ tela: app.tela }, '', S.urlBase()); } catch (e) { /* file:// em alguns navegadores */ } }
    salvar();
    desenhar(true);
  }
  function abrirPagina(pagina) {
    U.fecharPop();
    app.pagina = pagina;
    try { root.history.pushState({ pagina: pagina }, '', S.urlBase() + '#' + pagina); } catch (e) { /* segue */ }
    desenhar(true);
  }
  function voltarDaPagina() {
    if (root.history.state && root.history.state.pagina && root.history.length > 1) root.history.back();
    else { app.pagina = null; try { root.history.replaceState({ tela: app.tela }, '', S.urlBase()); } catch (e) { /* segue */ } desenhar(true); }
  }
  function sairDaLeitura() {
    app.leitura = null; app.erroLink = false;
    try { root.history.replaceState({ tela: 'inicio' }, '', S.urlBase()); } catch (e) { /* segue */ }
    var salvo = lerSalvo();
    if (salvo) { app.estado = salvo.estado; app.temSalvo = true; app.telaSalva = salvo.tela; }
    app.tela = 'inicio';
    desenhar(true);
  }

  /* -------------------------------------------------------------- desenho -- */
  function trocar(no, focar) {
    main.textContent = '';
    main.appendChild(no);
    if (focar) {
      root.scrollTo(0, 0);
      var t = main.querySelector('h1');
      if (t) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
    }
  }
  function desenhar(focar) {
    document.body.classList.remove('apresentacao');
    var s = document.querySelector('.sair-apresentacao'); if (s) s.remove();
    if (app.erroLink) { document.title = 'Link inválido — Monte sua carteira'; return trocar(telaErroLink(), focar); }
    if (app.pagina === 'sobre') { document.title = 'Sobre e metodologia — Monte sua carteira'; return trocar(R.sobre(app.macro, voltarDaPagina), focar); }
    if (app.pagina === 'privacidade') { document.title = 'Privacidade — Monte sua carteira'; return trocar(R.privacidade(voltarDaPagina, confirmarApagar), focar); }
    if (app.leitura) { document.title = 'Carteira compartilhada — Monte sua carteira'; return trocar(telaLeitura(), focar); }
    document.title = NOME[app.tela] + ' — Monte sua carteira';
    var telas = { inicio: telaInicio, situacao: telaSituacao, objetivos: telaObjetivos, capacidade: telaCapacidade, tolerancia: telaTolerancia,
      conhecimento: telaConhecimento, atual: telaAtual, resultado: telaResultado };
    trocar(telas[app.tela](), focar);
    if (focar) U.anunciar('Etapa ' + ETAPA[app.tela] + ' de 7: ' + NOME[app.tela]);
  }

  function regua(tela) {
    var n = ETAPA[tela], parte = tela === 'capacidade' ? ' · parte 1 de 2' : tela === 'tolerancia' ? ' · parte 2 de 2' : '';
    var trilho = h('div', { class: 'regua-trilho', style: '--avanco:' + Math.round((n - 1) / 6 * 100) + '%' });
    for (var i = 0; i < 6; i++) trilho.appendChild(h('span', {}));
    return h('div', { class: 'regua', role: 'progressbar', 'aria-valuemin': 1, 'aria-valuemax': 7, 'aria-valuenow': n, 'aria-valuetext': 'Etapa ' + n + ' de 7: ' + NOME[tela], 'aria-label': 'Progresso' },
      h('div', { class: 'regua-texto' }, h('span', {}, h('strong', { text: 'Etapa ' + n + ' de 7' }), parte), h('span', { text: NOME[tela].replace('Perfil de risco: ', 'Perfil: ') })),
      trilho);
  }

  /* Moldura comum das etapas com formulário. `validar` devolve o primeiro elemento com erro, ou null. */
  function moldura(tela, titulo, sub, corpo, validar, opts) {
    opts = opts || {};
    var resumo = h('p', { class: 'erros-resumo', role: 'alert', hidden: true });
    var i = TELAS.indexOf(tela);
    function enviar(ev) {
      ev.preventDefault();
      var primeiro = validar();
      if (primeiro) {
        resumo.textContent = 'Falta corrigir ou responder alguns itens acima.'; resumo.hidden = false;
        if (primeiro.focus) primeiro.focus();
        if (primeiro.scrollIntoView) primeiro.scrollIntoView({ block: 'center' });
        return;
      }
      irPara(TELAS[i + 1]);
    }
    return h('form', { class: 'tela tela-estreita', novalidate: true, onsubmit: enviar },
      regua(tela),
      h('h1', { class: 'titulo', tabindex: '-1', text: titulo }),
      sub ? h('p', { class: 'sub' }, sub) : null,
      corpo, resumo,
      h('div', { class: 'acoes' },
        h('button', { type: 'button', class: 'btn btn-secundario', onclick: function () { irPara(TELAS[i - 1]); } }, U.icone(U.ICONES.voltar), 'Voltar'),
        h('div', { class: 'acoes-fim' }, opts.extra || null,
          h('button', { type: 'submit', class: 'btn btn-primario' }, opts.rotuloSeguir || 'Continuar', U.icone(U.ICONES.seguir)))));
  }

  /* ============================================================= 1 INÍCIO == */
  function linhaMacro() {
    var el = h('p', { class: 'nota', role: 'status', text: 'Buscando dados de mercado no Banco Central…' });
    app.macroPromessa.then(function (m) {
      var txt = { vivo: 'Dados de mercado atualizados agora no Banco Central (Boletim Focus de ' + m.focus.data + ').',
        parcial: 'Parte dos dados de mercado veio do Banco Central agora; o restante é a última cópia disponível.',
        cache: 'Sem conexão com o Banco Central. Usando a cópia guardada neste aparelho em ' + m.obtidoEm + '.',
        referencia: 'Sem conexão com o Banco Central. Usando dados de referência, atualizados em ' + C.dataReferencia + '.' };
      el.textContent = txt[m.situacao] || txt.referencia;
    });
    return el;
  }
  function telaInicio() {
    var retomar = app.temSalvo && app.telaSalva && app.telaSalva !== 'inicio';
    return h('div', { class: 'tela tela-estreita' },
      regua('inicio'),
      h('h1', { class: 'titulo', tabindex: '-1', text: 'Monte sua carteira' }),
      h('p', { class: 'sub', text: 'Um roteiro em 7 etapas, parecido com a primeira conversa com um planejador financeiro. No final, você vê como dividir seus investimentos por classes, com gráficos e o motivo de cada número.' }),
      h('div', { class: 'duas-colunas' },
        h('section', { class: 'cartao' }, h('h2', { class: 'cartao-titulo', text: 'O que o app faz' }),
          h('ul', { class: 'lista-simples marca-sim' }, ['Calcula sua reserva de emergência antes de tudo', 'Separa o dinheiro pelo prazo de cada objetivo',
            'Define seu perfil pelo menor entre capacidade e tolerância ao risco', 'Usa dados públicos do Banco Central', 'Mostra três cenários, sempre como hipótese'
          ].map(function (t) { return h('li', { text: t }); }))),
        h('section', { class: 'cartao' }, h('h2', { class: 'cartao-titulo', text: 'O que ele não faz' }),
          h('ul', { class: 'lista-simples marca-nao' }, ['Não recomenda corretoras nem diz o que comprar: os títulos e ações mostrados são só exemplos de fontes oficiais', 'Não é recomendação individualizada nem substitui um profissional habilitado',
            'Não promete retorno', 'Não coleta seus dados: tudo fica neste aparelho'
          ].map(function (t) { return h('li', { text: t }); })))),
      h('p', { class: 'nota', text: 'Leva cerca de 8 minutos. Ajuda ter em mente sua renda, suas despesas e quanto já guardou. Não pedimos nome, CPF nem cadastro.' }),
      app.podeSalvar ? null : h('p', { class: 'nota-campo atencao', text: 'Este navegador não permite guardar o progresso. O app funciona normalmente, mas, se você fechar a página, terá de recomeçar.' }),
      linhaMacro(),
      h('div', { class: 'acoes' },
        retomar ? h('button', { type: 'button', class: 'btn btn-secundario', onclick: function () { confirmarApagar(function () { irPara('situacao'); }, true); } }, 'Começar do zero') : h('span', {}),
        h('div', { class: 'acoes-fim' },
          h('button', { type: 'button', class: 'btn btn-primario', onclick: function () { irPara(retomar ? app.telaSalva : 'situacao'); } },
            retomar ? 'Continuar de onde parei' : 'Começar', U.icone(U.ICONES.seguir)))));
  }

  /* =========================================================== 2 SITUAÇÃO == */
  function telaSituacao() {
    var f = app.estado.fin, L = C.limites;
    function guardar(chave) { return function (n) { f[chave] = n.valor !== undefined ? Math.min(n.valor, L.dinheiroMax) : (chave === 'divida' || chave === 'reserva' || chave === 'dividaJurosMes' ? 0 : null); salvar(); notas(); }; }
    var cRenda = U.campo({ id: 'renda', rotulo: 'Renda mensal líquida', ajuda: 'Quanto entra por mês, já descontados os impostos. Se varia, use uma média.', prefixo: 'R$', valor: f.renda, aoMudar: guardar('renda') });
    var cDesp = U.campo({ id: 'despesas', rotulo: 'Despesas mensais', ajuda: 'Tudo o que você gasta por mês, incluindo parcelas de dívidas.', prefixo: 'R$', valor: f.despesas, aoMudar: guardar('despesas') });
    var cPat = U.campo({ id: 'patrimonio', rotulo: 'Quanto você tem para investir hoje', termo: U.termo('patrimonio', 'patrimônio disponível'),
      ajuda: 'Some tudo o que está aplicado ou guardado, inclusive a reserva de emergência. Não conte o imóvel onde mora nem o carro.', prefixo: 'R$', valor: f.patrimonio, aoMudar: guardar('patrimonio') });
    var cRes = U.campo({ id: 'reserva', rotulo: 'Quanto disso já é reserva de emergência', termo: U.termo('reserva', 'reserva de emergência'),
      ajuda: 'Dinheiro separado para imprevistos, que você consegue resgatar na hora. Se não tem, deixe 0.', prefixo: 'R$', valor: f.reserva || (f.patrimonio === null ? null : 0), aoMudar: guardar('reserva') });
    var cAporte = U.campo({ id: 'aporte', rotulo: 'Quanto consegue investir por mês', termo: U.termo('aporte', 'aporte mensal'), ajuda: 'O valor que você pretende guardar todo mês daqui para a frente.', prefixo: 'R$', valor: f.aporte, aoMudar: guardar('aporte') });
    var cDiv = U.campo({ id: 'divida', rotulo: 'Saldo das dívidas', ajuda: 'Cartão, cheque especial, empréstimos, financiamentos. Se não tem, deixe 0.', prefixo: 'R$', valor: f.divida || (f.renda === null ? null : 0), aoMudar: guardar('divida') });
    var cJuros = U.campo({ id: 'juros', rotulo: 'Juros médios das dívidas', ajuda: 'Em % ao mês. Está no contrato ou na fatura. Se a taxa for anual, divida por 12 para ter uma ideia.', sufixo: '% ao mês', livre: true, exemplo: 'Exemplo: 1,5.', valor: f.divida > 0 ? f.dividaJurosMes : null,
      aoMudar: function (n) { f.dividaJurosMes = n.valor !== undefined ? Math.min(n.valor, L.jurosMesMax) : 0; salvar(); } });
    var notaOrc = h('p', { class: 'nota-campo', hidden: true }), notaRes = h('p', { class: 'nota-campo', hidden: true });
    function notas() {
      var r = cRenda.ler().valor, d = cDesp.ler().valor, a = cAporte.ler().valor;
      notaOrc.hidden = true; notaOrc.className = 'nota-campo';
      if (r !== undefined && d !== undefined) {
        notaOrc.hidden = false;
        if (d > r) { notaOrc.className = 'nota-campo atencao'; notaOrc.textContent = 'Suas despesas estão ' + U.fmtBRL(d - r) + ' acima da renda. Você pode continuar, mas o resultado vai tratar disso primeiro.'; }
        else if (a !== undefined && a > r - d + 0.005) { notaOrc.className = 'nota-campo atencao'; notaOrc.textContent = 'Sobram ' + U.fmtBRL(r - d) + ' por mês, menos que o aporte informado. Confira os valores; você pode continuar assim mesmo.'; }
        else notaOrc.textContent = 'Sobram ' + U.fmtBRL(r - d) + ' por mês depois das despesas.';
      }
      notaRes.hidden = d === undefined || !(d > 0);
      if (!notaRes.hidden) notaRes.textContent = 'Meta de reserva: 6 meses de despesas = ' + U.fmtBRL(6 * d) + '. Se a sua renda for instável, a meta sobe para 12 meses (' + U.fmtBRL(12 * d) + '); isso é perguntado na etapa 4.';
      cJuros.el.hidden = !(cDiv.ler().valor > 0);
      if (cJuros.el.hidden) cJuros.definirErro('');
    }
    cDiv.input.addEventListener('input', notas);
    notas();
    function validar() {
      var m = L.dinheiroMax, msgMax = 'Valor alto demais. O máximo aceito é R$ 10 bilhões.', erro = null;
      function v(c, regra) { var x = U.exigir(c, regra); if (x === undefined && !erro) erro = c.input; return x; }
      var renda = v(cRenda, { min: 0, max: m, msgMax: msgMax });
      var desp = v(cDesp, { min: 0.01, max: m, msgMax: msgMax, msgMin: 'Informe um valor maior que zero. A reserva de emergência é calculada a partir das despesas.', msgVazio: 'Informe suas despesas mensais.' });
      var div = v(cDiv, { min: 0, max: m, msgMax: msgMax, opcional: true, padrao: 0 });
      var juros = 0;
      if (div > 0) juros = v(cJuros, { min: 0, max: L.jurosMesMax, msgMax: 'Confira a taxa: o máximo aceito é ' + L.jurosMesMax + '% ao mês.', msgVazio: 'Informe os juros em % ao mês. Se a dívida não tem juros, digite 0.' });
      var pat = v(cPat, { min: 0, max: m, msgMax: msgMax });
      var res = v(cRes, { min: 0, max: m, msgMax: msgMax, opcional: true, padrao: 0 });
      if (res !== undefined && pat !== undefined && res > pat) { cRes.definirErro('A reserva não pode ser maior que o total que você tem para investir (' + U.fmtBRL(pat) + ').'); if (!erro) erro = cRes.input; }
      var aporte = v(cAporte, { min: 0, max: m, msgMax: msgMax });
      if (erro) return erro;
      f.renda = renda; f.despesas = desp; f.divida = div; f.dividaJurosMes = div > 0 ? juros : 0; f.patrimonio = pat; f.reserva = res; f.aporte = aporte;
      return null;
    }
    return moldura('situacao', 'Sua situação financeira', 'Valores aproximados bastam. Use números de hoje.', [
      h('div', { class: 'campos-2' }, cRenda.el, cDesp.el), notaOrc,
      h('div', { style: 'height:1.25rem' }),
      cPat.el, cRes.el, notaRes, h('div', { style: 'height:1.25rem' }),
      cAporte.el,
      h('div', { class: 'campos-2' }, cDiv.el, cJuros.el)
    ], validar);
  }

  /* ========================================================== 3 OBJETIVOS == */
  function telaObjetivos() {
    var L = C.limites, lista = h('div', {}), campos = [];
    var rotulosBalde = { curto: 'Curto prazo (até 2 anos): fica fora da renda variável', medio: 'Médio prazo (de 2 a 5 anos): pouca renda variável', longo: 'Longo prazo (acima de 5 anos): segue o seu perfil' };
    function montar(focoIndice) {
      lista.textContent = ''; campos = [];
      app.estado.objetivos.forEach(function (o, i) {
        var id = 'obj' + i, selo = h('span', { class: 'selo-prazo', hidden: true, 'aria-live': 'polite' });
        function atualizarSelo() { var p = cPrazo.ler().valor; selo.hidden = !(p >= L.prazoMin && p <= L.prazoMax); if (!selo.hidden) selo.textContent = rotulosBalde[E.classificarPrazo(p)]; }
        var sel = h('select', { id: id + '-tipo' }, T.objetivos.map(function (t) { var op = h('option', { value: t.id, text: t.nome }); if (t.id === o.tipo) op.selected = true; return op; }));
        var cNome = U.campo({ id: id + '-nome', rotulo: 'Nome do objetivo', texto: true, maxlength: L.nomeObjetivoMax, valor: o.nome, ajuda: 'Opcional. Por exemplo: trocar de carro.', limpar: E.limparTexto,
          aoMudar: function (txt) { o.nome = E.limparTexto(txt); salvar(); } });
        cNome.input.removeAttribute('inputmode');
        cNome.el.hidden = o.tipo !== 'outro';
        sel.addEventListener('change', function () { o.tipo = sel.value; cNome.el.hidden = o.tipo !== 'outro'; salvar(); });
        var cValor = U.campo({ id: id + '-valor', rotulo: 'Valor que quer alcançar', termo: U.termo('reais_hoje', 'valor em reais de hoje'), ajuda: 'Em reais de hoje, sem se preocupar com a inflação.', prefixo: 'R$', valor: o.valor,
          aoMudar: function (n) { o.valor = n.valor !== undefined ? Math.min(n.valor, L.dinheiroMax) : null; salvar(); } });
        var cPrazo = U.campo({ id: id + '-prazo', rotulo: 'Em quanto tempo', ajuda: 'Em anos. Para 6 meses, use 0,5.', sufixo: 'anos', livre: true, exemplo: 'Exemplo: 10 ou 2,5.', valor: o.prazo,
          aoMudar: function (n) { o.prazo = n.valor !== undefined && n.valor >= L.prazoMin && n.valor <= L.prazoMax ? n.valor : null; salvar(); atualizarSelo(); } });
        atualizarSelo();
        campos.push({ valor: cValor, prazo: cPrazo, obj: o });
        lista.appendChild(h('section', { class: 'cartao objetivo-cartao', 'aria-label': 'Objetivo ' + (i + 1) },
          h('div', { class: 'objetivo-topo' }, h('h2', { class: 'cartao-titulo', style: 'margin:0', text: 'Objetivo ' + (i + 1) }),
            app.estado.objetivos.length > 1 ? h('button', { type: 'button', class: 'btn btn-fantasma btn-p', 'aria-label': 'Remover objetivo ' + (i + 1),
              onclick: function () { app.estado.objetivos.splice(i, 1); salvar(); montar(Math.max(0, i - 1)); U.anunciar('Objetivo removido.'); } }, 'Remover') : null),
          h('div', { class: 'campo' }, h('div', { class: 'rotulo-linha' }, h('label', { class: 'rotulo', for: id + '-tipo', text: 'Tipo' })), h('div', { class: 'entrada' }, sel)),
          cNome.el,
          h('div', { class: 'campos-2' }, cValor.el, cPrazo.el), selo));
      });
      if (app.estado.objetivos.length < L.objetivosMax) {
        lista.appendChild(h('p', { style: 'margin-top:1rem' }, h('button', { type: 'button', class: 'btn btn-secundario',
          onclick: function () { app.estado.objetivos.push({ tipo: 'outro', nome: '', valor: null, prazo: null }); salvar(); montar(app.estado.objetivos.length - 1); } },
          '+ Adicionar objetivo (' + app.estado.objetivos.length + ' de ' + L.objetivosMax + ')')));
      }
      if (focoIndice !== undefined) { var alvo = document.getElementById('obj' + focoIndice + '-tipo'); if (alvo) alvo.focus(); }
    }
    montar();
    function validar() {
      var erro = null;
      campos.forEach(function (c) {
        var v = U.exigir(c.valor, { min: 0.01, max: L.dinheiroMax, msgMin: 'Informe um valor maior que zero.', msgVazio: 'Informe o valor que quer alcançar.', msgMax: 'Valor alto demais. O máximo aceito é R$ 10 bilhões.' });
        if (v === undefined && !erro) erro = c.valor.input;
        var p = U.exigir(c.prazo, { min: L.prazoMin, max: L.prazoMax, msgMin: 'O prazo mínimo é de 6 meses (0,5 ano).', msgMax: 'O prazo máximo é de ' + L.prazoMax + ' anos.', msgVazio: 'Informe o prazo em anos.' });
        if (p === undefined && !erro) erro = c.prazo.input;
        if (v !== undefined) c.obj.valor = v;
        if (p !== undefined) c.obj.prazo = p;
        c.obj.nome = E.limparTexto(c.obj.nome);
      });
      return erro;
    }
    return moldura('objetivos', 'Seus objetivos', 'De 1 a 3 objetivos, cada um com valor e prazo. O prazo decide quanto risco cada parte do dinheiro pode correr.', lista, validar);
  }

  /* ============================================================ 4 PERFIL == */
  function telaCapacidade() {
    var c = app.estado.cap, e = app.estado;
    var b = E.calcularBaldes(e.objetivos, Math.max(0, e.fin.patrimonio - C.reserva.mesesPadrao * e.fin.despesas), e.fin.aporte), meses = e.fin.despesas > 0 ? e.fin.patrimonio / e.fin.despesas : 0;
    var g1 = U.grupoOpcoes({ id: 'estabilidade', numero: 'Pergunta 1 de 2', titulo: T.estabilidade.titulo, opcoes: T.estabilidade.opcoes, valor: c.estabilidade, aoMudar: function (v) { c.estabilidade = v; salvar(); } });
    var g2 = U.grupoOpcoes({ id: 'liquidez', numero: 'Pergunta 2 de 2', titulo: T.liquidez.titulo, opcoes: T.liquidez.opcoes, valor: c.liquidez, aoMudar: function (v) { c.liquidez = v; salvar(); } });
    function validar() {
      var erro = null;
      [g1, g2].forEach(function (g) { if (g.ler() === null) { g.definirErro('Escolha uma opção.'); if (!erro) erro = g; } });
      return erro ? { focus: erro.focar, scrollIntoView: function (o) { erro.el.scrollIntoView(o); } } : null;
    }
    return moldura('capacidade', 'Quanto risco sua situação comporta', ['Esta é a capacidade', U.termo('capacidade', 'capacidade de risco'), ': depende de fatos, não de opinião.'], [
      h('div', { class: 'cartao', style: 'margin-bottom:1.75rem' }, h('h2', { class: 'cartao-titulo', text: 'O que já sabemos pelas etapas anteriores' }),
        h('ul', { class: 'lista-simples' },
          h('li', { text: 'Prazo médio dos seus objetivos: ' + E.fmtPrazo(Math.round(b.prazoMedio * 10) / 10) + '.' }),
          h('li', { text: 'Seu patrimônio equivale a ' + E.fmtNum(meses, 0) + (Math.round(meses) === 1 ? ' mês' : ' meses') + ' de despesas.' }))),
      g1.el, g2.el
    ], validar);
  }
  function telaTolerancia() {
    var grupos = T.tolerancia.map(function (q, i) {
      return U.grupoOpcoes({ id: 'tol' + i, numero: 'Pergunta ' + (i + 1) + ' de ' + T.tolerancia.length, titulo: q.titulo, nota: q.nota, opcoes: q.opcoes, valor: app.estado.tol[i],
        aoMudar: function (v) { app.estado.tol[i] = v; salvar(); } });
    });
    function validar() {
      var erro = null;
      grupos.forEach(function (g) { if (g.ler() === null) { g.definirErro('Escolha uma opção.'); if (!erro) erro = g; } });
      return erro ? { focus: erro.focar, scrollIntoView: function (o) { erro.el.scrollIntoView(o); } } : null;
    }
    return moldura('tolerancia', 'Como você reage ao risco', ['Esta é a tolerância', U.termo('tolerancia', 'tolerância ao risco'), '. Não há resposta certa: responda como você realmente agiria.'],
      grupos.map(function (g) { return g.el; }), validar);
  }

  /* ======================================================= 5 CONHECIMENTO == */
  function telaConhecimento() {
    var k = app.estado.conh, Q = T.conhecimento;
    var gTempo = U.grupoOpcoes({ id: 'tempo', titulo: Q.tempo.titulo, opcoes: Q.tempo.opcoes, valor: k.tempo, aoMudar: function (v) { k.tempo = v; salvar(); } });
    var gProd = U.grupoOpcoes({ id: 'produtos', titulo: Q.produtos.titulo, nota: Q.produtos.nota, opcoes: Q.produtos.opcoes, valor: k.produtos, multiplo: true, aoMudar: function (v) { k.produtos = v; salvar(); } });
    var gAuto = U.grupoOpcoes({ id: 'auto', titulo: Q.auto.titulo, opcoes: Q.auto.opcoes, valor: k.auto, aoMudar: function (v) { k.auto = v; salvar(); } });
    var gQuiz = U.grupoOpcoes({ id: 'quiz', titulo: Q.quiz.titulo, nota: Q.quiz.nota, opcoes: Q.quiz.opcoes, valor: k.quiz, termo: U.termo('prefixado', 'título prefixado'), aoMudar: function (v) { k.quiz = v; salvar(); } });
    function validar() {
      var erro = null;
      [gTempo, gAuto, gQuiz].forEach(function (g) { if (g.ler() === null) { g.definirErro('Escolha uma opção.'); if (!erro) erro = g; } });
      return erro ? { focus: erro.focar, scrollIntoView: function (o) { erro.el.scrollIntoView(o); } } : null;
    }
    return moldura('conhecimento', 'Conhecimento e experiência', 'Quem está começando recebe uma carteira com menos classes complexas.', [gTempo.el, gProd.el, gAuto.el, gQuiz.el], validar);
  }

  /* ======================================================= 6 CARTEIRA ATUAL == */
  function telaAtual() {
    var atual = app.estado.atual || {}, campos = {};
    var soma = h('div', { class: 'soma-atual', role: 'status', 'aria-live': 'polite' });
    var erroGeral = h('p', { class: 'erro', role: 'alert', hidden: true });
    function total() { var t = 0, algum = false, invalido = false; E.IDS.forEach(function (id) { var n = campos[id].ler(); if (n.valor !== undefined) { t += n.valor; algum = true; } else if (n.erro) invalido = true; }); return { t: Math.round(t * 100) / 100, algum: algum, invalido: invalido }; }
    function atualizar() {
      var s = total(); erroGeral.hidden = true;
      soma.className = 'soma-atual' + (s.algum && s.t === 100 ? ' ok' : '');
      soma.textContent = '';
      soma.appendChild(h('span', { text: !s.algum ? 'Preencha os percentuais ou pule esta etapa' : s.t === 100 ? 'Soma certa' : s.t < 100 ? 'Faltam ' + E.fmtNum(100 - s.t, (100 - s.t) % 1 ? 1 : 0) + ' pontos' : 'Passou ' + E.fmtNum(s.t - 100, (s.t - 100) % 1 ? 1 : 0) + ' pontos' }));
      soma.appendChild(h('span', { text: 'Total: ' + E.fmtNum(s.t, s.t % 1 ? 1 : 0) + '%' }));
    }
    var linhas = E.IDS.map(function (id) {
      var cl = E.classe(id);
      var inp = h('input', { id: 'atual-' + id, type: 'text', inputmode: 'decimal', autocomplete: 'off', maxlength: 6, value: atual[id] ? String(atual[id]) : '', 'aria-describedby': 'atual-erro' });
      inp.addEventListener('input', atualizar);
      campos[id] = { input: inp, ler: function () { return U.lerNumero(inp.value); } };
      return h('div', { class: 'linha-classe' },
        h('div', { class: 'rotulo-linha', style: 'margin:0' }, h('label', { for: 'atual-' + id }, G.amostra(id), cl.nome), U.termo(null, cl.nome, cl.oQueE)),
        h('div', { class: 'entrada' }, inp, h('span', { class: 'sufixo', 'aria-hidden': 'true', text: '%' })));
    });
    erroGeral.id = 'atual-erro';
    atualizar();
    function validar() {
      var s = total(), primeiroRuim = null;
      E.IDS.forEach(function (id) { var n = campos[id].ler(); if ((n.erro || n.valor > 100) && !primeiroRuim) primeiroRuim = campos[id].input; });
      if (primeiroRuim) { erroGeral.textContent = 'Use apenas números de 0 a 100 em cada classe.'; erroGeral.hidden = false; return primeiroRuim; }
      if (!s.algum) { app.estado.atual = null; return null; }
      if (s.t !== 100) { erroGeral.textContent = 'A soma está em ' + E.fmtNum(s.t, s.t % 1 ? 1 : 0) + '%. Ajuste até dar 100% ou pule esta etapa.'; erroGeral.hidden = false; return campos[E.IDS[0]].input; }
      var bruto = {}; E.IDS.forEach(function (id) { bruto[id] = campos[id].ler().valor || 0; });
      app.estado.atual = E.arredondar100(bruto);
      return null;
    }
    var pular = h('button', { type: 'button', class: 'btn btn-secundario', onclick: function () { app.estado.atual = null; irPara('resultado'); } }, 'Pular esta etapa');
    return moldura('atual', 'Sua carteira atual', 'Opcional. Se você já investe, informe mais ou menos quanto tem em cada classe, em percentual. Assim o resultado mostra o que mudar.', [
      h('div', { class: 'cartao' }, linhas), soma, erroGeral
    ], validar, { extra: pular, rotuloSeguir: 'Ver minha carteira' });
  }

  /* ========================================================== 7 RESULTADO == */
  function acoesResultado(r, macro, hoje) {
    return {
      compartilhar: function () { dialogoCompartilharCarteira(r, macro, hoje); },
      imprimir: imprimir,
      imagem: function () { baixarImagem(r.mostrada, r.perfil.final, r.principal === 'carteira'); },
      apresentar: apresentar,
      refazer: function () { irPara('situacao'); },
      outraPessoa: outraPessoa,
      fazerOMeu: sairDaLeitura
    };
  }
  function telaResultado() {
    if (!app.macro) {
      var espera = h('div', { class: 'tela tela-estreita' }, regua('resultado'), h('h1', { class: 'titulo', tabindex: '-1', text: 'Montando sua carteira' }),
        h('p', { class: 'sub', role: 'status', text: 'Buscando os dados de mercado mais recentes no Banco Central…' }));
      app.macroPromessa.then(function () { if (app.tela === 'resultado' && !app.pagina && !app.leitura) desenhar(true); });
      return espera;
    }
    var hoje = hojeRef(), r;
    try { r = E.montarCarteira(app.estado, app.macro, hoje); }
    catch (e) { return telaFalha(); }
    return R.completo(r, { macro: app.macro, leitura: false, acoes: acoesResultado(r, app.macro, hoje),
      visao: { ler: function () { return app.visao; }, gravar: function (v) { app.visao = v; } } });
  }
  function telaFalha() {
    return h('div', { class: 'tela tela-estreita' }, h('h1', { class: 'titulo', tabindex: '-1', text: 'Não foi possível montar a carteira' }),
      h('p', { class: 'sub', text: 'Alguma resposta ficou incompleta. Reveja as etapas; nada foi perdido.' }),
      h('button', { type: 'button', class: 'btn btn-primario', onclick: function () { irPara('situacao'); } }, 'Rever respostas'));
  }

  /* ------------------------------------------------- leitura (link aberto) -- */
  function telaLeitura() {
    var d = app.leitura, acoes = { fazerOMeu: sairDaLeitura, imprimir: imprimir };
    if (d.modo === 'a') return R.resumo(d, acoes);
    var r;
    try { r = E.montarCarteira(d.estado, d.macro, d.hoje); } catch (e) { app.erroLink = true; app.leitura = null; return telaErroLink(); }
    var visao = 'carteira';
    return R.completo(r, { macro: d.macro, leitura: true, dataLink: d.data, acoes: acoes, visao: { ler: function () { return visao; }, gravar: function (v) { visao = v; } } });
  }
  function telaErroLink() {
    return h('div', { class: 'tela tela-estreita' },
      h('h1', { class: 'titulo', tabindex: '-1', text: 'Este link não pôde ser aberto' }),
      h('p', { class: 'sub', text: 'Ele pode estar incompleto, ter sido cortado ao copiar ou ter sido alterado. Por segurança, nada do link foi usado.' }),
      h('p', {}, 'Peça para a pessoa enviar o link de novo, ou monte a sua própria carteira.'),
      h('div', { class: 'acoes' }, h('span', {}), h('div', { class: 'acoes-fim' }, h('button', { type: 'button', class: 'btn btn-primario', onclick: sairDaLeitura }, 'Fazer a minha carteira'))));
  }

  /* ------------------------------------------------------------- imprimir -- */
  var abertosAntes = [];
  root.addEventListener('beforeprint', function () {
    abertosAntes = [];
    document.querySelectorAll('details.mais').forEach(function (d) { if (!d.open) { abertosAntes.push(d); d.open = true; } });
  });
  root.addEventListener('afterprint', function () { abertosAntes.forEach(function (d) { d.open = false; }); abertosAntes = []; });
  function imprimir() { U.fecharPop(); root.print(); }

  function baixarImagem(aloc, perfilIdx, comReserva) {
    var itens = E.IDS.filter(function (id) { return aloc[id] > 0; }).map(function (id) { return { id: id, nome: E.classe(id).nome, pct: aloc[id] }; });
    U.anunciar('Gerando imagem…');
    G.pngAlocacao(itens, R.nomePerfil(perfilIdx), comReserva ? 'Alocação por classe, com a reserva' : 'Alocação por classe de investimento')
      .then(function (blob) { U.baixar(blob, 'minha-carteira.png'); U.anunciar('Imagem baixada.'); })
      .catch(function () { U.abrirDialogo('Não deu para gerar a imagem', h('p', { text: 'Este navegador não conseguiu criar a imagem. Como alternativa, use "Imprimir ou salvar em PDF" ou faça uma captura de tela.' })); });
  }

  /* --------------------------------------------------------- apresentação -- */
  function apresentar() {
    document.body.classList.add('apresentacao');
    var sair = h('button', { type: 'button', class: 'btn btn-primario sair-apresentacao', onclick: sairApresentacao }, 'Sair da apresentação');
    document.body.appendChild(sair);
    var el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(function () { /* tela cheia negada: segue só com o layout limpo */ });
    root.scrollTo(0, 0);
    U.anunciar('Modo apresentação ligado. Pressione Esc para sair.');
    sair.focus();
  }
  function sairApresentacao() {
    document.body.classList.remove('apresentacao');
    var s = document.querySelector('.sair-apresentacao'); if (s) s.remove();
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
  }
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && document.body.classList.contains('apresentacao') && !document.querySelector('dialog[open]')) sairApresentacao(); });
  document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && document.body.classList.contains('apresentacao')) sairApresentacao(); });

  /* ------------------------------------------------------------- diálogos -- */
  function blocoLink(url, textoCompartilhar) {
    var input = h('input', { type: 'text', readonly: true, value: url, 'aria-label': 'Link para copiar', onfocus: function (ev) { ev.target.select(); } });
    var retorno = h('p', { class: 'retorno', role: 'status' });
    var botoes = [h('button', { type: 'button', class: 'btn btn-primario btn-p', onclick: function () {
      U.copiarTexto(url, input).then(function (ok) { retorno.textContent = ok ? 'Link copiado.' : 'Não deu para copiar sozinho. Selecione o link acima e copie.'; });
    } }, 'Copiar link')];
    if (navigator.share) botoes.push(h('button', { type: 'button', class: 'btn btn-secundario btn-p', onclick: function () {
      navigator.share({ title: 'Monte sua carteira', text: textoCompartilhar, url: url }).catch(function () { /* cancelado pela pessoa */ });
    } }, 'Compartilhar…'));
    return h('div', {}, h('div', { class: 'campo-link' }, input), h('div', { class: 'dialogo-acoes' }, botoes), retorno);
  }
  function dialogoCompartilharApp() {
    var url = S.urlBase(), local = root.location.protocol === 'file:';
    var caixaQR = h('div', { style: 'min-height:206px' });
    U.carregarQR().then(function () { var q = U.qrSVG(url); if (q) caixaQR.appendChild(q); else caixaQR.appendChild(h('p', { class: 'nota', text: 'Não foi possível gerar o QR Code. Use o link abaixo.' })); });
    U.abrirDialogo('Compartilhar este app', [
      h('p', { text: 'Envie o link ou mostre o QR Code. Quem abrir começa do zero: nenhuma resposta sua vai junto.' }),
      caixaQR,
      blocoLink(url, 'Um roteiro gratuito para montar uma carteira de investimentos por classes. Educacional e sem cadastro.'),
      local ? h('p', { class: 'nota', text: 'Você abriu o app direto de um arquivo. Para o link funcionar em outros aparelhos, publique o app na internet (veja o README).' }) : null
    ]);
  }
  function dialogoCompartilharCarteira(r, macro, hoje) {
    var saida = h('div', { 'aria-live': 'polite' });
    var avisoB = h('p', { class: 'nota-campo atencao', hidden: true, role: 'alert', text: 'Este link contém seus dados financeiros. Compartilhe apenas com quem você confia.' });
    var g = U.grupoOpcoes({ id: 'modo-link', titulo: 'O que o link deve mostrar?', valor: 0, opcoes: [
      'Só os percentuais e o perfil (sem valores em reais, renda ou dívidas)', 'Resultado completo, com todos os valores'
    ], aoMudar: function (v) { avisoB.hidden = v !== 1; saida.textContent = ''; } });
    U.abrirDialogo('Compartilhar minha carteira', [
      g.el, avisoB,
      h('button', { type: 'button', class: 'btn btn-primario', onclick: function () {
        var completo = g.ler() === 1;
        var pacote = completo ? S.pacoteCompleto(app.estado, macro, hoje) : S.pacoteResumo(r);
        saida.textContent = 'Gerando link…';
        S.codificar(pacote).then(function (cod) {
          saida.textContent = '';
          saida.appendChild(h('div', { style: 'margin-top:1rem' }, blocoLink(S.urlBase() + '#c=' + cod, completo ? 'Minha carteira (resultado completo)' : 'Minha carteira por classes de investimento'),
            h('p', { class: 'nota', text: 'O resultado vai escrito no próprio link e não passa por nenhum servidor. Quem abrir vê em modo somente leitura.' })));
        });
      } }, 'Gerar link'),
      saida
    ]);
  }
  function confirmarApagar(depois, semAviso) {
    var feito = typeof depois === 'function' ? depois : null;
    U.abrirDialogo('Apagar meus dados?', function (fechar) {
      return [
        h('p', { text: 'Isso apaga deste navegador todas as suas respostas, o tema escolhido e a cópia dos dados de mercado. Não dá para desfazer.' }),
        h('div', { class: 'dialogo-acoes' },
          h('button', { type: 'button', class: 'btn btn-perigo', onclick: function () {
            apagarTudo(); fechar(); U.anunciar('Seus dados foram apagados deste navegador.');
            if (feito) feito(); else { app.pagina = null; irPara('inicio'); }
            if (!semAviso) U.abrirDialogo('Dados apagados', h('p', { text: 'Suas respostas foram apagadas deste navegador.' }));
          } }, 'Apagar tudo'),
          h('button', { type: 'button', class: 'btn btn-secundario', onclick: fechar }, 'Cancelar'))
      ];
    });
  }
  function outraPessoa() {
    U.abrirDialogo('Fazer para outra pessoa', function (fechar) {
      return [
        h('p', { text: 'O roteiro recomeça em branco. As respostas atuais serão apagadas deste navegador. Se quiser guardá-las, exporte um arquivo antes.' }),
        h('div', { class: 'dialogo-acoes' },
          h('button', { type: 'button', class: 'btn btn-primario', onclick: function () { apagarRespostas(); fechar(); irPara('situacao'); } }, 'Começar em branco'),
          h('button', { type: 'button', class: 'btn btn-secundario', onclick: function () { exportar(); } }, 'Exportar antes'),
          h('button', { type: 'button', class: 'btn btn-fantasma', onclick: fechar }, 'Cancelar'))
      ];
    });
  }
  function apagarRespostas() {
    try { root.localStorage.removeItem(CHAVE); } catch (e) { /* segue */ }
    app.estado = E.estadoVazio(); app.temSalvo = false; app.telaSalva = null; app.visao = 'carteira';
  }
  function exportar() {
    var dados = { app: 'monte-sua-carteira', formato: 1, exportadoEm: M.dataBR(new Date()), tela: app.tela, estado: app.estado };
    U.baixar(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }), 'monte-sua-carteira-progresso.json');
    U.anunciar('Arquivo exportado.');
  }
  function importar(arquivo, retorno, fechar) {
    if (!arquivo) return;
    if (arquivo.size > 200000) { retorno.textContent = 'Arquivo grande demais para ser um progresso deste app.'; return; }
    var leitor = new FileReader();
    leitor.onerror = function () { retorno.textContent = 'Não foi possível ler o arquivo.'; };
    leitor.onload = function () {
      try {
        var b = JSON.parse(String(leitor.result));
        if (!b || b.app !== 'monte-sua-carteira' || typeof b.estado !== 'object') throw new Error('formato');
        app.estado = E.normalizarEstado(b.estado);
        if (app.estado.fin.reserva > (app.estado.fin.patrimonio || 0)) app.estado.fin.reserva = app.estado.fin.patrimonio || 0;
        app.leitura = null; app.erroLink = false;
        fechar();
        irPara(primeiraPendente() || 'resultado');
        U.anunciar('Progresso importado.');
      } catch (e) { retorno.textContent = 'Este arquivo não é um progresso válido do Monte sua carteira.'; }
    };
    leitor.readAsText(arquivo);
  }
  function dialogoDados() {
    U.abrirDialogo('Meus dados', function (fechar) {
      var retorno = h('p', { class: 'retorno', role: 'alert' });
      var arq = h('input', { type: 'file', accept: '.json,application/json', class: 'sr-only', id: 'arq-importar', tabindex: '-1', onchange: function (ev) { importar(ev.target.files[0], retorno, fechar); } });
      return [
        h('p', { text: 'Suas respostas ficam só neste navegador. Você pode levar o progresso para outro aparelho por arquivo.' }),
        h('div', { class: 'dialogo-acoes' },
          h('button', { type: 'button', class: 'btn btn-secundario', onclick: exportar }, 'Exportar arquivo'),
          h('button', { type: 'button', class: 'btn btn-secundario', onclick: function () { arq.click(); } }, 'Importar arquivo'), arq,
          h('button', { type: 'button', class: 'btn btn-perigo', onclick: function () { fechar(); confirmarApagar(); } }, 'Apagar meus dados')),
        retorno
      ];
    });
  }
  function dialogoMenu() {
    U.abrirDialogo('Menu', function (fechar) {
      function item(titulo, sub, acao) { return h('li', {}, h('button', { type: 'button', onclick: function () { fechar(); acao(); } }, titulo, h('small', { text: sub }))); }
      return h('ul', { class: 'menu-lista' },
        item('Sobre e metodologia', 'Como a carteira é calculada, fontes e limitações', function () { abrirPagina('sobre'); }),
        item('Privacidade', 'O que fica no seu aparelho e o que sai dele', function () { abrirPagina('privacidade'); }),
        item('Meus dados', 'Exportar, importar ou apagar o progresso', dialogoDados),
        item('Fazer para outra pessoa', 'Recomeçar em branco, para ajudar alguém', outraPessoa),
        item('Compartilhar este app', 'Link e QR Code', dialogoCompartilharApp));
    });
  }

  /* ----------------------------------------------------------------- tema -- */
  function temaAtual() {
    var t = document.documentElement.getAttribute('data-tema');
    if (t) return t;
    return root.matchMedia && root.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  }
  function aplicarTema(t, gravar) {
    document.documentElement.setAttribute('data-tema', t);
    var b = document.getElementById('btn-tema');
    b.setAttribute('aria-pressed', String(t === 'escuro'));
    if (gravar) { try { root.localStorage.setItem('msc:tema', t); } catch (e) { /* segue */ } }
  }

  /* ----------------------------------------------------------- inicializa -- */
  function abrirLinkCompartilhado(frag) {
    return S.decodificar(frag).then(function (obj) {
      var d = S.validar(obj);
      if (d) app.leitura = d; else app.erroLink = true;
    });
  }
  function aoMudarEndereco() {
    var frag = S.lerFragmento(), hash = root.location.hash.replace('#', '');
    if (frag !== null) { app.leitura = null; app.erroLink = false; abrirLinkCompartilhado(frag).then(function () { desenhar(true); }); return; }
    if (hash === 'sobre' || hash === 'privacidade') { app.pagina = hash; desenhar(true); return; }
    app.pagina = null;
    if (app.leitura || app.erroLink) { app.leitura = null; app.erroLink = false; }
    var st = root.history.state;
    if (st && st.tela) app.tela = telaPermitida(st.tela);
    desenhar(true);
  }

  function iniciar() {
    G.instalarDefs(); G.ligarDicas();
    app.podeSalvar = testarArmazenamento();
    aplicarTema(temaAtual(), false);

    document.getElementById('btn-tema').addEventListener('click', function () { aplicarTema(temaAtual() === 'escuro' ? 'claro' : 'escuro', true); });
    document.getElementById('btn-menu').addEventListener('click', dialogoMenu);
    document.getElementById('btn-compartilhar-app').addEventListener('click', dialogoCompartilharApp);
    document.getElementById('btn-apagar-rodape').addEventListener('click', function () { confirmarApagar(); });
    document.getElementById('btn-inicio').addEventListener('click', function () { if (app.leitura || app.erroLink) sairDaLeitura(); else { app.telaSalva = app.tela !== 'inicio' ? app.tela : app.telaSalva; irPara('inicio'); } });
    document.querySelectorAll('[data-ir]').forEach(function (b) { b.addEventListener('click', function () { abrirPagina(b.getAttribute('data-ir')); }); });
    root.addEventListener('popstate', aoMudarEndereco);

    app.macroPromessa = M.carregar().then(function (m) { app.macro = m; return m; });

    var salvo = lerSalvo();
    if (salvo) { app.estado = salvo.estado; app.temSalvo = true; app.telaSalva = salvo.tela; }

    var frag = S.lerFragmento(), hash = root.location.hash.replace('#', '');
    var pronto = frag !== null ? abrirLinkCompartilhado(frag) : Promise.resolve();
    if (frag === null && (hash === 'sobre' || hash === 'privacidade')) app.pagina = hash;
    pronto.then(function () {
      try { root.history.replaceState(app.pagina ? { pagina: app.pagina } : { tela: 'inicio' }, '', root.location.href); } catch (e) { /* segue */ }
      desenhar(false);
    });

    // Em localhost o service worker só entra com ?pwa=1, para não servir arquivos antigos durante o desenvolvimento.
    var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(root.location.hostname);
    if ('serviceWorker' in navigator && /^https?:$/.test(root.location.protocol) && (!local || /[?&]pwa=1/.test(root.location.search))) {
      root.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ }); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})(window);
