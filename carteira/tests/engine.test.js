/* Testes simples do motor. Rode com:  node tests/engine.test.js
 * Não usa nenhuma biblioteca. */
'use strict';
var assert = require('assert');
var C = require('../js/config.js');
var E = require('../js/engine.js');

var HOJE = { ano: 2026, mes: 10 }; // novembro de 2026 (data de referência do fallback)
var MACRO = C.fallbackMacro;
var RV = ['acoes_br', 'acoes_int', 'fii', 'multi', 'alt'];
var passou = 0;

function teste(nome, fn) {
  try { fn(); passou++; console.log('  ok  ' + nome); }
  catch (err) { console.error('FALHOU  ' + nome + '\n        ' + err.message); process.exitCode = 1; }
}
function soma(o) { return Object.keys(o).reduce(function (s, k) { return s + o[k]; }, 0); }
function estado(extra) {
  var e = {
    fin: { renda: 8000, despesas: 5000, divida: 0, dividaJurosMes: 0, patrimonio: 100000, reserva: 30000, aporte: 1500 },
    objetivos: [{ tipo: 'aposentadoria', nome: '', valor: 1000000, prazo: 25 }],
    cap: { estabilidade: 2, liquidez: 2 },
    tol: [2, 2, 2, 2, 2, 2, 2],
    conh: { tempo: 2, produtos: [1, 2], auto: 2, quiz: 1 },
    atual: null
  };
  for (var k in extra) e[k] = extra[k];
  return E.normalizarEstado(e);
}
function semNumeroInvalido(obj, caminho) {
  caminho = caminho || 'r';
  if (typeof obj === 'number') assert.ok(isFinite(obj), 'número inválido em ' + caminho + ': ' + obj);
  else if (typeof obj === 'string') assert.ok(!/NaN|undefined|Infinity/.test(obj), 'texto inválido em ' + caminho + ': ' + obj);
  else if (obj && typeof obj === 'object') Object.keys(obj).forEach(function (k) { semNumeroInvalido(obj[k], caminho + '.' + k); });
}
function checagensGerais(r) {
  assert.strictEqual(soma(r.carteira), 100, 'carteira soma ' + soma(r.carteira));
  assert.strictEqual(soma(r.investimentos), 100, 'investimentos somam ' + soma(r.investimentos));
  assert.strictEqual(soma(r.itens.map(function (i) { return i.pct; })), 100, 'itens somam 100');
  Object.keys(r.carteira).forEach(function (id) { assert.ok(r.carteira[id] >= 0 && Number.isInteger(r.carteira[id])); });
  semNumeroInvalido(r);
  // valores em R$ somam o patrimônio e a reserva em R$ é exatamente a parcela reservada
  var somaVal = Object.keys(r.valores.carteira).reduce(function (s, k) { return s + r.valores.carteira[k]; }, 0);
  assert.ok(Math.abs(somaVal - r.patrimonio) <= 1e-6 * Math.max(1, r.patrimonio), 'valores não somam o patrimônio');
  assert.ok(Math.abs(r.valores.carteira.reserva - r.reserva.naReserva) <= 1e-6 * Math.max(1, r.patrimonio), 'reserva em reais');
  r.projecoes.forEach(function (p) {
    assert.ok(p.fim.pessimista <= p.fim.base + 1e-6 && p.fim.base <= p.fim.otimista + 1e-6, 'cenários fora de ordem');
  });
  // balde curto nunca tem renda variável
  RV.forEach(function (id) { assert.strictEqual(r.alocBaldes.curto[id], 0); });
  // faixas do perfil respeitadas no balde longo (exceto classes zeradas por conhecimento baixo)
  var fx = C.faixas[r.perfil.final], longo = r.alocBaldes.longo;
  Object.keys(fx).forEach(function (id) {
    if (r.perfil.conhecimento.nivel === 0 && (id === 'multi' || id === 'alt' || id === 'pos')) return;
    assert.ok(longo[id] >= fx[id][0] - 1e-6 && longo[id] <= fx[id][1] + 1e-6, id + ' fora da faixa: ' + longo[id]);
  });
  // limite de concentração e teto de renda variável
  Object.keys(longo).forEach(function (id) { if (id !== 'pos') assert.ok(longo[id] <= C.protecao.limiteConcentracao + 1e-6); });
  var rv = C.protecao.classesRendaVariavel.reduce(function (s, id) { return s + longo[id]; }, 0);
  assert.ok(rv <= C.protecao.tetoRendaVariavel[r.perfil.final] + 1e-6, 'teto de renda variável');
  // ajuste tático nunca passa de ±10 p.p. por classe (medido contra a base do perfil)
  var base = C.base[r.perfil.final];
  if (r.perfil.conhecimento.nivel !== 0) Object.keys(base).forEach(function (id) {
    assert.ok(Math.abs(longo[id] - base[id]) <= C.tatico.maxPorClasse + 1e-6, 'tático > 10 p.p. em ' + id);
  });
}

console.log('Configuração');
teste('cada alocação-base soma 100 e está dentro das faixas', function () {
  C.base.forEach(function (b, i) {
    assert.strictEqual(soma(b), 100);
    Object.keys(b).forEach(function (id) { assert.ok(b[id] >= C.faixas[i][id][0] && b[id] <= C.faixas[i][id][1], 'perfil ' + i + ' ' + id); });
  });
});
teste('renda variável cresce com o perfil', function () {
  var ant = -1;
  C.base.forEach(function (b) { var rv = b.acoes_br + b.acoes_int + b.fii + b.alt; assert.ok(rv > ant); ant = rv; });
});

console.log('Arredondamento');
teste('arredondar100 sempre soma 100', function () {
  assert.strictEqual(soma(E.arredondar100({ a: 33.333, b: 33.333, c: 33.334 })), 100);
  assert.strictEqual(soma(E.arredondar100({ a: 0.4, b: 0.4, c: 99.2 })), 100);
  assert.strictEqual(soma(E.arredondar100({ a: 1, b: 1, c: 1 })), 100);
  assert.strictEqual(soma(E.arredondar100({ a: 0, b: 0 })), 0);
});

console.log('Reserva');
teste('renda estável: 6 meses; instável: 12 meses', function () {
  assert.strictEqual(E.calcularReserva({ despesas: 5000, patrimonio: 100000, aporte: 0 }, { estabilidade: 2 }).alvo, 30000);
  assert.strictEqual(E.calcularReserva({ despesas: 5000, patrimonio: 100000, aporte: 0 }, { estabilidade: 1 }).alvo, 60000);
});
teste('sem reserva suficiente: tudo vai para a reserva primeiro', function () {
  var r = E.montarCarteira(estado({ fin: { renda: 6000, despesas: 4000, divida: 0, dividaJurosMes: 0, patrimonio: 10000, reserva: 0, aporte: 1000 } }), MACRO, HOJE);
  assert.strictEqual(r.carteira.reserva, 100);
  assert.strictEqual(r.reserva.falta, 14000);
  assert.strictEqual(r.reserva.mesesParaCompletar, 14);
  assert.strictEqual(r.principal, 'investimentos');
  assert.ok(r.avisos.some(function (a) { return a.id === 'reserva'; }));
  checagensGerais(r);
});
teste('patrimônio zero e aporte zero não quebram', function () {
  var r = E.montarCarteira(estado({ fin: { renda: 3000, despesas: 3000, divida: 0, dividaJurosMes: 0, patrimonio: 0, reserva: 0, aporte: 0 } }), MACRO, HOJE);
  assert.strictEqual(r.reserva.mesesParaCompletar, null);
  assert.strictEqual(r.projecoes[0].aporteNecessario, null);
  checagensGerais(r);
});

console.log('Perfil');
teste('perfil final é o menor entre capacidade e tolerância', function () {
  // tolerância máxima, capacidade baixa
  var r = E.montarCarteira(estado({
    fin: { renda: 3000, despesas: 2800, divida: 0, dividaJurosMes: 0, patrimonio: 5000, reserva: 0, aporte: 200 },
    objetivos: [{ tipo: 'viagem', valor: 10000, prazo: 1.5 }], cap: { estabilidade: 0, liquidez: 0 }, tol: [3, 3, 3, 3, 3, 3, 3]
  }), MACRO, HOJE);
  assert.strictEqual(r.perfil.tolerancia.nivel, 4);
  assert.strictEqual(r.perfil.capacidade.nivel, 0);
  assert.strictEqual(r.perfil.final, 0);
  assert.strictEqual(r.perfil.limitadoPor, 'capacidade');
  // capacidade máxima, tolerância mínima
  var r2 = E.montarCarteira(estado({
    fin: { renda: 30000, despesas: 8000, divida: 0, dividaJurosMes: 0, patrimonio: 2000000, reserva: 100000, aporte: 10000 },
    cap: { estabilidade: 3, liquidez: 3 }, tol: [0, 0, 0, 0, 0, 0, 0]
  }), MACRO, HOJE);
  assert.strictEqual(r2.perfil.capacidade.nivel, 4);
  assert.strictEqual(r2.perfil.final, 0);
  assert.strictEqual(r2.perfil.limitadoPor, 'tolerancia');
  checagensGerais(r); checagensGerais(r2);
});
teste('todas as combinações de capacidade x tolerância dão min()', function () {
  for (var cap = 0; cap <= 3; cap++) for (var t = 0; t <= 3; t++) {
    var r = E.montarCarteira(estado({ cap: { estabilidade: cap, liquidez: cap }, tol: [t, t, t, t, t, t, t] }), MACRO, HOJE);
    var esperado = Math.min(r.perfil.capacidade.nivel, r.perfil.tolerancia.nivel);
    assert.ok(r.perfil.final <= esperado);
    if (!r.perfil.limitadoConhecimento) assert.strictEqual(r.perfil.final, esperado);
    checagensGerais(r);
  }
});
teste('conhecimento baixo limita a moderado e tira classes complexas', function () {
  var r = E.montarCarteira(estado({
    fin: { renda: 30000, despesas: 8000, divida: 0, dividaJurosMes: 0, patrimonio: 2000000, reserva: 100000, aporte: 10000 },
    cap: { estabilidade: 3, liquidez: 3 }, tol: [3, 3, 3, 3, 3, 3, 3], conh: { tempo: 0, produtos: [], auto: 0, quiz: 0 }
  }), MACRO, HOJE);
  assert.strictEqual(r.perfil.final, 2);
  assert.strictEqual(r.carteira.multi, 0); assert.strictEqual(r.carteira.alt, 0);
  checagensGerais(r);
});

console.log('Extremos pedidos');
teste('conservador com prazo longo', function () {
  var r = E.montarCarteira(estado({ tol: [0, 0, 0, 0, 0, 0, 0], objetivos: [{ tipo: 'aposentadoria', valor: 2000000, prazo: 35 }] }), MACRO, HOJE);
  assert.strictEqual(r.perfil.final, 0);
  var rv = r.investimentos.acoes_br + r.investimentos.acoes_int + r.investimentos.fii + r.investimentos.alt;
  assert.ok(rv <= 15, 'renda variável do conservador: ' + rv);
  assert.ok(r.avisos.some(function (a) { return a.id === 'conservador_longo'; }));
  checagensGerais(r);
});
teste('arrojado com prazo curto: zero renda variável', function () {
  var r = E.montarCarteira(estado({
    fin: { renda: 30000, despesas: 8000, divida: 0, dividaJurosMes: 0, patrimonio: 2000000, reserva: 100000, aporte: 10000 },
    cap: { estabilidade: 3, liquidez: 3 }, tol: [3, 3, 3, 3, 3, 3, 3], conh: { tempo: 3, produtos: [3], auto: 3, quiz: 1 },
    objetivos: [{ tipo: 'imovel', valor: 500000, prazo: 1 }, { tipo: 'viagem', valor: 50000, prazo: 2 }]
  }), MACRO, HOJE);
  RV.forEach(function (id) { assert.strictEqual(r.carteira[id], 0, id); });
  assert.strictEqual(r.carteira.reserva + r.carteira.pos, 100);
  assert.ok(r.avisos.some(function (a) { return a.id === 'prazo_curto'; }));
  checagensGerais(r);
});
teste('arrojado com prazo longo tem mais renda variável que o moderado', function () {
  var base = { fin: { renda: 30000, despesas: 8000, divida: 0, dividaJurosMes: 0, patrimonio: 2000000, reserva: 100000, aporte: 10000 }, cap: { estabilidade: 3, liquidez: 3 }, conh: { tempo: 3, produtos: [3], auto: 3, quiz: 1 } };
  var a = E.montarCarteira(estado(Object.assign({}, base, { tol: [3, 3, 3, 3, 3, 3, 3] })), MACRO, HOJE);
  var m = E.montarCarteira(estado(Object.assign({}, base, { tol: [2, 2, 1, 2, 1, 1, 1] })), MACRO, HOJE);
  assert.strictEqual(a.perfil.final, 4); assert.strictEqual(m.perfil.final, 2);
  assert.ok(a.carteira.acoes_br > m.carteira.acoes_br);
  assert.ok(a.estresse.pct < m.estresse.pct, 'estresse do arrojado deve ser pior');
  checagensGerais(a); checagensGerais(m);
});
teste('dívida cara: aviso, plano e capacidade limitada', function () {
  var r = E.montarCarteira(estado({
    fin: { renda: 30000, despesas: 8000, divida: 20000, dividaJurosMes: 8, patrimonio: 2000000, reserva: 100000, aporte: 10000 },
    cap: { estabilidade: 3, liquidez: 3 }, tol: [3, 3, 3, 3, 3, 3, 3]
  }), MACRO, HOJE);
  assert.ok(r.divida.cara);
  assert.ok(Math.abs(r.divida.custoAnual - 151.817) < 0.01);
  assert.strictEqual(r.avisos[0].id, 'divida_cara');
  assert.strictEqual(r.plano[0].titulo, 'Quite a dívida cara');
  assert.ok(r.perfil.capacidade.nivel <= 2 && r.perfil.final <= 2);
  checagensGerais(r);
});
teste('dívida barata não dispara o alerta', function () {
  var r = E.montarCarteira(estado({ fin: { renda: 8000, despesas: 5000, divida: 200000, dividaJurosMes: 0.8, patrimonio: 100000, reserva: 0, aporte: 1500 } }), MACRO, HOJE);
  assert.ok(!r.divida.cara);
  assert.ok(!r.avisos.some(function (a) { return a.id === 'divida_cara'; }));
});

console.log('Baldes');
teste('objetivos em três prazos: pesos somam 1 e curto fica fora da renda variável', function () {
  var r = E.montarCarteira(estado({ objetivos: [
    { tipo: 'viagem', valor: 20000, prazo: 1 }, { tipo: 'imovel', valor: 100000, prazo: 4 }, { tipo: 'aposentadoria', valor: 2000000, prazo: 25 }
  ] }), MACRO, HOJE);
  var p = r.baldes.pesos;
  assert.ok(Math.abs(p.curto + p.medio + p.longo - 1) < 1e-9);
  assert.ok(Math.abs(p.curto - 20000 / 125000) < 1e-9); // 20000/1 ÷ (20000 + 25000 + 80000)
  assert.strictEqual(soma(r.liquidez.map(function (l) { return l.pct; })), 100);
  checagensGerais(r);
});
teste('limites de prazo: 2 anos é curto, 5 é médio, 5,1 é longo', function () {
  assert.strictEqual(E.classificarPrazo(2), 'curto');
  assert.strictEqual(E.classificarPrazo(2.5), 'medio');
  assert.strictEqual(E.classificarPrazo(5), 'medio');
  assert.strictEqual(E.classificarPrazo(5.1), 'longo');
});

teste('nenhum objetivo recebe mais do que o seu valor-alvo; a sobra vai para o prazo mais longo', function () {
  // R$ 1 milhão de excedente, viagem de R$ 10 mil em 1 ano e aposentadoria de R$ 600 mil em 30 anos
  var b = E.calcularBaldes([{ tipo: 'viagem', valor: 10000, prazo: 1 }, { tipo: 'aposentadoria', valor: 600000, prazo: 30 }], 1000000, 1000);
  assert.strictEqual(b.objetivos[0].inicial, 10000);
  assert.strictEqual(b.objetivos[1].inicial, 990000);
  assert.strictEqual(b.sobra, 390000);
  assert.ok(Math.abs(b.pesos.curto - 0.01) < 1e-9);
  assert.strictEqual(b.objetivos[0].aporte, 0); // já coberto: o aporte vai todo para o outro
  assert.strictEqual(b.objetivos[1].aporte, 1000);
  var r = E.repartir(100, [1, 1, 2], [10, 100, 100]);
  assert.deepStrictEqual(r.partes, [10, 30, 60]);
  var soma3 = E.calcularBaldes([{ tipo: 'viagem', valor: 20000, prazo: 1 }, { tipo: 'imovel', valor: 100000, prazo: 4 }], 50000, 2000);
  assert.ok(Math.abs(soma3.objetivos[0].inicial + soma3.objetivos[1].inicial - 50000) < 1e-6);
  assert.ok(Math.abs(soma3.objetivos[0].aporte + soma3.objetivos[1].aporte - 2000) < 1e-6);
});

console.log('Ajuste tático');
teste('soma zero e no máximo ±10 p.p. em cenários macro variados', function () {
  var cenarios = [
    { selic: 13.75, ipca: 4.9, selicProx: 12.5, tend: 0.6 },
    { selic: 2, ipca: 3.5, selicProx: 6, tend: 0.3 },
    { selic: 25, ipca: 12, selicProx: 15, tend: 2 },
    { selic: 6, ipca: 3, selicProx: 6, tend: 0 },
    { selic: 10, ipca: 3, selicProx: 8, tend: -0.5 }
  ];
  cenarios.forEach(function (c) {
    var m = { selicMeta: { valor: c.selic }, focus: { selic: { 2026: c.selic, 2027: c.selicProx }, ipca: { 2026: c.ipca, 2027: c.ipca }, ipcaAnterior: { ano: 2027, valor: c.ipca - c.tend } } };
    var s = E.sinaisMacro(m, HOJE);
    C.base.forEach(function (b, i) {
      var t = E.ajusteTatico(Object.assign({}, b), s);
      assert.ok(Math.abs(soma(t.aloc) - 100) < 1e-9, 'soma');
      Object.keys(t.aloc).forEach(function (id) {
        assert.ok(t.aloc[id] >= -1e-9, 'negativo');
        assert.ok(Math.abs(t.aloc[id] - b[id]) <= 10 + 1e-9, 'mais de 10 p.p.');
      });
      t.motivos.forEach(function (mo) { assert.ok(Math.abs(soma(mo.efeito)) < 1e-9, 'efeito do motivo não soma zero'); });
    });
    var r = E.montarCarteira(estado({}), m, HOJE);
    checagensGerais(r);
  });
});
teste('juro real elevado tira peso da renda variável', function () {
  var s = E.sinaisMacro(MACRO, HOJE);
  assert.ok(s.jurosReal > 6);
  var t = E.ajusteTatico(Object.assign({}, C.base[2]), s);
  assert.ok(t.aloc.acoes_br < C.base[2].acoes_br);
  assert.ok(t.aloc.ipca > C.base[2].ipca);
});

console.log('Cálculos conferidos à mão');
teste('juro real = (1 + Selic) / (1 + inflação esperada) - 1', function () {
  var s = E.sinaisMacro(MACRO, HOJE);
  var ipca12 = (2 / 12) * 5.22 + (10 / 12) * 4.90;          // 4,9533
  assert.ok(Math.abs(s.ipcaEsperado12m - ipca12) < 1e-9);
  assert.ok(Math.abs(s.jurosReal - ((1.1375 / (1 + ipca12 / 100)) - 1) * 100) < 1e-9); // ≈ 8,38
  assert.ok(Math.abs(s.jurosReal - 8.38) < 0.01);
});
teste('projeção com retorno fixo bate com a fórmula de valor futuro', function () {
  // 100% pós-fixada, juro real constante de 6% a.a., 10 anos, R$ 10.000 + R$ 500/mês
  var traj = []; for (var i = 0; i < 12; i++) traj.push(6);
  var serie = E.simular(10000, 500, 0, 120, { pos: 100 }, traj, 0);
  var i_m = Math.pow(1.06, 1 / 12) - 1;
  var vf = 10000 * Math.pow(1.06, 10) + 500 * (Math.pow(1.06, 10) - 1) / i_m;
  assert.ok(Math.abs(serie[120] - vf) < 0.01, serie[120] + ' vs ' + vf);
  assert.ok(Math.abs(vf - 99145.20) < 1, 'valor de referência: ' + vf);
});
teste('aporte necessário leva exatamente à meta no cenário base', function () {
  var e = estado({});
  var r = E.montarCarteira(e, MACRO, HOJE), p = r.projecoes[0];
  var e2 = estado({ fin: Object.assign({}, e.fin, { aporte: p.aporteNecessario }) });
  var r2 = E.montarCarteira(e2, MACRO, HOJE);
  assert.ok(Math.abs(r2.projecoes[0].fim.base - p.meta) < 1, r2.projecoes[0].fim.base + ' vs ' + p.meta);
});
teste('teste de estresse = soma de (percentual x queda da classe)', function () {
  var r = E.montarCarteira(estado({}), MACRO, HOJE), esperado = 0;
  Object.keys(r.mostrada).forEach(function (id) { esperado += r.mostrada[id] * C.estresse[id] / 100; });
  assert.ok(Math.abs(r.estresse.pct - esperado) < 0.006);
  assert.ok(Math.abs(r.estresse.valor - 100000 * r.estresse.pct / 100) < 0.01);
});

console.log('Rebalanceamento');
teste('só sugere mexer acima de 5 p.p.', function () {
  var l = E.rebalancear({ reserva: 50, pos: 50 }, { reserva: 46, pos: 30, ipca: 24 }, 100000);
  var por = {}; l.forEach(function (x) { por[x.id] = x; });
  assert.strictEqual(por.reserva.acao, 'manter');
  assert.strictEqual(por.pos.acao, 'reduzir'); assert.strictEqual(por.pos.valor, -20000);
  assert.strictEqual(por.ipca.acao, 'aumentar');
});

console.log('Entradas maliciosas ou ruins');
teste('normalizarEstado limita números, lista e texto', function () {
  var e = E.normalizarEstado({
    fin: { renda: '1e999', despesas: -50, patrimonio: 'abc', aporte: 9e99, divida: {}, dividaJurosMes: 500 },
    objetivos: [{ tipo: '<script>', nome: '<img src=x onerror=alert(1)>Casa "nova"', valor: 1e30, prazo: 9999 }, null, 5, {}, {}, {}],
    cap: { estabilidade: 99, liquidez: -3 }, tol: [9, 'x', null, 1.6, -1, 2, 3, 3, 3],
    conh: { tempo: 2, produtos: [1, 1, 99, 'a', 2], auto: {}, quiz: 1 },
    atual: { reserva: 50, pos: 50, hack: 100, __proto__: { x: 1 } }
  });
  assert.strictEqual(e.fin.renda, null);
  assert.strictEqual(e.fin.despesas, 0);
  assert.strictEqual(e.fin.patrimonio, null);
  assert.strictEqual(e.fin.aporte, C.limites.dinheiroMax);
  assert.strictEqual(e.fin.dividaJurosMes, 30);
  assert.strictEqual(e.objetivos.length, 1); // só os 3 primeiros são lidos; os inválidos caem
  assert.strictEqual(e.objetivos[0].tipo, 'outro');
  assert.ok(!/[<>"=()]/.test(e.objetivos[0].nome), e.objetivos[0].nome);
  assert.strictEqual(e.objetivos[0].prazo, 50);
  assert.strictEqual(e.cap.estabilidade, 3); assert.strictEqual(e.cap.liquidez, 0);
  assert.deepStrictEqual(e.tol, [3, null, null, 2, 0, 2, 3]);
  assert.deepStrictEqual(e.conh.produtos, [1, 3, 2]);
  assert.strictEqual(e.atual.hack, undefined);
  assert.deepStrictEqual(Object.keys(e.atual).sort(), E.IDS.slice().sort());
  assert.ok(E.pendencias(e).length > 0);
});
teste('lixo vira estado vazio, sem erro', function () {
  [null, undefined, 5, 'x', [], { fin: 3, objetivos: 'a', tol: {}, conh: [], atual: 7 }].forEach(function (x) {
    var e = E.normalizarEstado(x);
    assert.ok(e.fin && Array.isArray(e.objetivos) && e.tol.length === 7);
  });
});


console.log('Exemplos de ativos');
teste('opcoes: vencimento mais próximo da meta, sem vencer antes; reserva = Selic mais curto', function () {
  var O = require('../js/opcoes.js'), A = require('../js/ativos.js');
  var hoje = new Date(2026, 10, 12);
  var r = E.montarCarteira(estado({ objetivos: [{ tipo: 'imovel', valor: 150000, prazo: 4 }] }), MACRO, { ano: 2026, mes: 10 });
  var g = O.sugerir(r, A, hoje), por = {}; g.forEach(function (x) { por[x.id] = x; });
  assert.ok(/Tesouro Selic 2027/.test(por.reserva.itens[0].rotulo));
  var venc = /Vence em (\d\d)\/(\d\d)\/(\d{4})/.exec(por.ipca.itens[0].detalhe);
  assert.ok(new Date(+venc[3], +venc[2] - 1, +venc[1]) >= new Date(2030, 10, 12), 'IPCA+ vence antes da meta');
  g.forEach(function (x) { x.itens.forEach(function (i) { assert.ok(!/NaN|undefined|Infinity/.test(JSON.stringify(i))); }); });
  assert.ok(g.every(function (x) { return r.mostrada[x.id] > 0; }), 'grupo para classe com 0%');
});
teste('opcoes: sem dados não quebra e curto prazo não recebe prefixado nem IPCA+', function () {
  var O = require('../js/opcoes.js'), A = require('../js/ativos.js');
  var r = E.montarCarteira(estado({ objetivos: [{ tipo: 'viagem', valor: 20000, prazo: 1 }] }), MACRO, { ano: 2026, mes: 10 });
  var ids = O.sugerir(r, A, new Date(2026, 10, 12)).map(function (x) { return x.id; });
  assert.ok(ids.indexOf('pre') < 0 && ids.indexOf('ipca') < 0 && ids.indexOf('acoes_br') < 0);
  assert.deepStrictEqual(O.sugerir(r, {}, new Date(2026, 10, 12)).filter(function (x) { return x.itens.length; }), []);
});

console.log('Fuzz');
teste('3000 estados aleatórios: soma 100, sem NaN, regras respeitadas', function () {
  var seed = 12345;
  function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
  function ri(n) { return Math.floor(rnd() * (n + 1)); }
  function dinheiro() { var p = [0, 1, 500, 5000, 80000, 1e6, 5e7, 1e10]; return p[ri(p.length - 1)] * (0.3 + rnd()); }
  for (var i = 0; i < 3000; i++) {
    var n = 1 + ri(2), objs = [];
    for (var j = 0; j < n; j++) objs.push({ tipo: E.TIPOS_OBJETIVO[ri(5)], nome: 'x', valor: 1 + dinheiro(), prazo: [0.5, 1, 2, 2.1, 5, 5.5, 12, 30, 50][ri(8)] });
    var e = E.normalizarEstado({
      fin: { renda: dinheiro(), despesas: 1 + dinheiro(), divida: rnd() < 0.3 ? dinheiro() : 0, dividaJurosMes: rnd() * 15, patrimonio: dinheiro(), reserva: dinheiro(), aporte: rnd() < 0.2 ? 0 : dinheiro() },
      objetivos: objs, cap: { estabilidade: ri(3), liquidez: ri(3) },
      tol: [ri(3), ri(3), ri(3), ri(3), ri(3), ri(3), ri(3)],
      conh: { tempo: ri(3), produtos: [ri(3)], auto: ri(3), quiz: ri(3) },
      atual: rnd() < 0.3 ? { reserva: 20, pos: 30, acoes_br: 50 } : null
    });
    assert.strictEqual(E.pendencias(e).length, 0);
    var rr = E.montarCarteira(e, MACRO, { ano: 2026 + ri(3), mes: ri(11) });
    checagensGerais(rr);
    var somaIni = rr.projecoes.reduce(function (s, p) { return s + p.inicial; }, 0);
    assert.ok(Math.abs(somaIni - rr.reserva.excedente) <= 1e-6 * Math.max(1, rr.reserva.excedente), 'iniciais não somam o excedente');
    var somaAp = rr.baldes.objetivos.reduce(function (s, o) { return s + o.aporte; }, 0);
    assert.ok(Math.abs(somaAp - rr.aporte) <= 1e-6 * Math.max(1, rr.aporte), 'aportes não somam o aporte');
  }
});

console.log('\n' + passou + ' testes passaram' + (process.exitCode ? ' (com falhas acima)' : '.'));
