/* Lastro — roteiro fundamentalista para estudar uma empresa.
 * Não dá veredito de compra ou venda: mostra onde o seu estudo está firme
 * e onde ainda falta olhar. As respostas ficam só neste navegador. */
(function () {
  'use strict';
  var L = window.LASTRO, el = L.el, CHAVE = 'lastro:roteiro:v1';
  var BLOCOS = [
    { id: 'negocio', nome: 'O negócio', perguntas: [
      ['Consigo explicar em duas frases como a empresa ganha dinheiro?', 'Se não dá para explicar, ainda não dá para avaliar.'],
      ['Os clientes voltam a comprar por necessidade ou hábito, sem depender de promoção?', ''],
      ['A receita vem de vários clientes e produtos, sem depender de um só?', ''],
      ['Daqui a dez anos, é provável que as pessoas ainda precisem do que ela vende?', '']
    ] },
    { id: 'vantagem', nome: 'A vantagem', perguntas: [
      ['Existe algo difícil de copiar: marca, escala, rede, licença, custo mais baixo?', ''],
      ['A empresa consegue repassar aumentos de custo sem perder clientes?', 'Poder de preço é um dos sinais mais claros de vantagem.'],
      ['Ela mantém ou ganha participação de mercado ao longo dos anos?', ''],
      ['Um concorrente bem financiado teria dificuldade real de tomar esse espaço?', '']
    ] },
    { id: 'pessoas', nome: 'As pessoas', perguntas: [
      ['Quem administra tem parte relevante do próprio patrimônio na empresa?', ''],
      ['A administração explica os erros com a mesma clareza com que conta os acertos?', 'Leia as cartas e os relatórios dos anos ruins.'],
      ['O lucro foi bem usado no passado: reinvestido com retorno ou devolvido ao acionista?', ''],
      ['Os minoritários são tratados da mesma forma que o controlador?', '']
    ] },
    { id: 'contas', nome: 'As contas', perguntas: [
      ['O lucro vira dinheiro no caixa, e não só número no balanço?', 'Compare o lucro com o caixa gerado pelas operações em vários anos.'],
      ['A dívida cabe com folga na geração de caixa, mesmo num ano ruim?', ''],
      ['Os resultados são consistentes há pelo menos cinco a dez anos, incluindo crises?', ''],
      ['Entendo de onde vem a rentabilidade: do negócio, e não de dívida ou de evento único?', 'Indicador alto pode ser consequência de algo passageiro.']
    ] },
    { id: 'preco', nome: 'O preço', perguntas: [
      ['Tenho uma estimativa própria de quanto a empresa vale, com as premissas escritas?', ''],
      ['O preço atual está abaixo dessa estimativa com margem para eu estar errado?', 'Essa folga é a margem de segurança.'],
      ['Se a ação cair 30% amanhã sem notícia nova, eu manteria ou compraria mais?', ''],
      ['Estou interessado pelo negócio, e não porque o preço subiu ou alguém indicou?', '']
    ] }
  ];
  var OPCOES = [['sim', 'Sim', 2], ['parcial', 'Em parte', 1], ['nao', 'Não', 0], ['ns', 'Ainda não sei', null]];
  var estado = { empresa: '', r: {} };
  try { var salvo = JSON.parse(localStorage.getItem(CHAVE)); if (salvo && typeof salvo === 'object' && salvo.r && typeof salvo.r === 'object') { estado.empresa = String(salvo.empresa || '').slice(0, 60); Object.keys(salvo.r).forEach(function (k) { if (/^[a-z]+\d$/.test(k) && ['sim', 'parcial', 'nao', 'ns'].indexOf(salvo.r[k]) >= 0) estado.r[k] = salvo.r[k]; }); } } catch (e) { /* sem armazenamento */ }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* segue */ } }

  var lista = document.getElementById('perguntas'), saida = document.getElementById('saida-roteiro'), nome = document.getElementById('empresa');
  nome.value = estado.empresa;
  nome.addEventListener('input', function () { estado.empresa = nome.value.replace(/[<>]/g, '').slice(0, 60); salvar(); resultado(); });

  BLOCOS.forEach(function (b, bi) {
    var sec = el('section', { class: 'bloco' }, el('h2', { class: 'titulo-2', text: (bi + 1) + '. ' + b.nome }));
    b.perguntas.forEach(function (p, i) {
      var id = b.id + i;
      var escolhas = el('div', { class: 'escolhas' }, OPCOES.map(function (o) {
        var inp = el('input', { type: 'radio', name: id, value: o[0], id: id + '-' + o[0] });
        if (estado.r[id] === o[0]) inp.checked = true;
        inp.addEventListener('change', function () { estado.r[id] = o[0]; salvar(); resultado(); });
        return el('label', { for: id + '-' + o[0] }, inp, o[1]);
      }));
      sec.appendChild(el('div', { class: 'pergunta' }, el('fieldset', {}, el('legend', { text: p[0] }), p[1] ? el('small', { text: p[1] }) : null, escolhas)));
    });
    lista.appendChild(sec);
  });

  function resultado() {
    var total = 0, respondidas = 0, naoSei = 0, piores = [];
    saida.textContent = '';
    saida.appendChild(el('h2', { class: 'titulo-3', text: estado.empresa ? 'Seu estudo de ' + estado.empresa : 'Seu estudo' }));
    BLOCOS.forEach(function (b) {
      var pts = 0, resp = 0, ns = 0;
      b.perguntas.forEach(function (p, i) {
        var v = estado.r[b.id + i]; total++;
        if (!v) return;
        respondidas++; resp++;
        if (v === 'ns') { ns++; naoSei++; } else pts += v === 'sim' ? 2 : v === 'parcial' ? 1 : 0;
      });
      var pct = Math.round(pts / (b.perguntas.length * 2) * 100);
      if (resp === b.perguntas.length) piores.push({ nome: b.nome, pct: pct, ns: ns });
      saida.appendChild(el('div', { class: 'barra-bloco' }, el('span', { text: b.nome }), el('b', { text: resp ? pct + '%' : '—' }),
        el('div', { class: 'trilho', role: 'img', 'aria-label': b.nome + ': ' + (resp ? pct + '% de respostas favoráveis' : 'sem respostas') }, el('i', { style: 'width:' + (resp ? pct : 0) + '%' }))));
    });
    saida.appendChild(el('p', { class: 'nota', text: respondidas + ' de ' + total + ' perguntas respondidas' + (naoSei ? ' · ' + naoSei + ' como "ainda não sei"' : '') + '.' }));
    var leitura;
    if (respondidas < total) leitura = 'Responda todas as perguntas para ver a leitura. "Ainda não sei" é uma resposta honesta e útil.';
    else {
      piores.sort(function (a, b) { return a.pct - b.pct; });
      var fraco = piores[0];
      leitura = (naoSei ? 'Há ' + naoSei + (naoSei === 1 ? ' pergunta' : ' perguntas') + ' sem resposta. Antes de qualquer decisão, é aí que o estudo deve continuar. ' : '') +
        'O bloco mais frágil é "' + fraco.nome + '" (' + fraco.pct + '%). ' +
        (fraco.nome === 'O preço' ? 'Um bom negócio comprado caro pode ser um mau investimento: vale esperar ou refazer a conta de valor.' :
          'Sem firmeza nesse bloco, o preço importa menos: negócio fraco barato costuma continuar fraco.');
    }
    saida.appendChild(el('p', { text: leitura }));
    saida.appendChild(el('p', { class: 'nota', text: 'Este roteiro organiza o seu raciocínio. Ele não diz se você deve comprar ou vender e não substitui a leitura dos relatórios da empresa.' }));
    var limpar = el('button', { type: 'button', class: 'btn btn-secundario', text: 'Começar outro estudo' });
    limpar.addEventListener('click', function () { try { localStorage.removeItem(CHAVE); } catch (e) { /* segue */ } location.reload(); });
    saida.appendChild(limpar);
  }
  resultado();
})();
