/* ==========================================================================
 * Monte sua carteira — MOTOR (perfil, alocação, projeção)
 * --------------------------------------------------------------------------
 * Lógica pura: não toca em tela, rede nem armazenamento. Mesma entrada,
 * mesma saída. Roda no navegador (window.MSC.engine) e no Node (testes).
 *
 * Passos do motor (função montarCarteira):
 *   1. Reserva de emergência primeiro (6 ou 12 meses de despesas).
 *   2. Baldes por prazo dos objetivos (curto, médio, longo).
 *   3. Alocação-base pelo perfil (o MENOR entre capacidade e tolerância).
 *   4. Ajuste tático leve pelos dados macro (máx. ±10 p.p. por classe).
 *   5. Regras de proteção (faixas, concentração, teto de renda variável).
 * Depois: arredonda para inteiros que somam exatamente 100, projeta os
 * objetivos em 3 cenários, calcula estresse, liquidez e rebalanceamento.
 *
 * Todos os números ajustáveis estão em config.js.
 * ========================================================================== */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./config.js'));
  } else {
    root.MSC = root.MSC || {};
    root.MSC.engine = factory(root.MSC.CONFIG);
  }
})(typeof window !== 'undefined' ? window : globalThis, function (C) {
  'use strict';

  var IDS = C.classes.map(function (c) { return c.id; });          // todas as classes
  var IDS_INV = IDS.filter(function (id) { return id !== 'reserva'; }); // classes de investimento
  var TIPOS_OBJETIVO = ['aposentadoria', 'imovel', 'estudo', 'viagem', 'independencia', 'outro'];
  var NOMES_OBJETIVO = {
    aposentadoria: 'Aposentadoria', imovel: 'Imóvel', estudo: 'Estudo',
    viagem: 'Viagem', independencia: 'Independência financeira', outro: 'Outro objetivo'
  };

  /* ------------------------------------------------------------------ util */
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function soma(obj) { var s = 0; for (var k in obj) s += obj[k] || 0; return s; }
  function classe(id) { for (var i = 0; i < C.classes.length; i++) if (C.classes[i].id === id) return C.classes[i]; return null; }
  function zeros(ids) { var o = {}; ids.forEach(function (id) { o[id] = 0; }); return o; }
  function copia(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }

  function fmtBRL(v, casas) {
    var d = casas == null ? 0 : casas;
    return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtNum(v, casas) {
    var d = casas == null ? 1 : casas;
    return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtPP(v) { return (v > 0 ? '+' : '−') + Math.abs(v) + ' p.p.'; }
  function fmtPts(v) { // '5 pontos percentuais', '1 ponto percentual', '2,5 pontos percentuais'
    var arred = Math.round(v * 10) / 10;
    return fmtNum(arred, arred % 1 === 0 ? 0 : 1) + (arred === 1 ? ' ponto percentual' : ' pontos percentuais');
  }
  function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }
  function fmtMeses(m) { // '8 meses', '1 ano e 6 meses', '18 anos'
    if (m < 24) return plural(m, 'mês', 'meses');
    var a = Math.floor(m / 12), r = m % 12;
    return a + ' anos' + (r ? ' e ' + plural(r, 'mês', 'meses') : '');
  }
  function fmtPrazo(anos) {
    if (anos < 1) return plural(Math.round(anos * 12), 'mês', 'meses');
    return fmtNum(anos, anos % 1 === 0 ? 0 : 1) + (anos === 1 ? ' ano' : ' anos');
  }

  /* Arredonda um mapa de percentuais para inteiros que somam EXATAMENTE 100
   * (método do maior resto). */
  function arredondar100(aloc) {
    var ids = Object.keys(aloc), total = soma(aloc), r = {};
    if (!(total > 0)) { ids.forEach(function (id) { r[id] = 0; }); return r; }
    var restos = [], somaInt = 0;
    ids.forEach(function (id, i) {
      var v = (aloc[id] || 0) * 100 / total, p = Math.floor(v + 1e-9);
      r[id] = p; somaInt += p; restos.push({ id: id, resto: v - p, ordem: i });
    });
    restos.sort(function (a, b) { return b.resto - a.resto || a.ordem - b.ordem; });
    for (var i = 0; i < 100 - somaInt; i++) r[restos[i % restos.length].id] += 1;
    return r;
  }

  /* ---------------------------------------------------------------- estado */
  function estadoVazio() {
    return {
      fin: { renda: null, despesas: null, divida: 0, dividaJurosMes: 0, patrimonio: null, reserva: 0, aporte: null },
      objetivos: [{ tipo: 'aposentadoria', nome: '', valor: null, prazo: null }],
      cap: { estabilidade: null, liquidez: null },
      tol: [null, null, null, null, null, null, null],
      conh: { tempo: null, produtos: [], auto: null, quiz: null },
      atual: null
    };
  }

  /* Limpa e limita QUALQUER estado vindo de fora (link, arquivo, localStorage).
   * Só passam: números dentro dos limites, opções da lista permitida e
   * texto sem marcação. Nunca lança erro; devolve sempre um estado válido
   * em formato (campos não informados ficam null). */
  function normalizarEstado(bruto) {
    var L = C.limites, e = estadoVazio();
    if (!bruto || typeof bruto !== 'object') return e;
    function num(x, min, max) {
      if (x === null || x === undefined || x === '' || typeof x === 'boolean' || typeof x === 'object') return null;
      var n = Number(x);
      if (!isFinite(n)) return null;
      return clamp(n, min, max);
    }
    function opcao(x, max) {
      var n = num(x, 0, max);
      return n === null ? null : Math.round(n);
    }
    var f = bruto.fin && typeof bruto.fin === 'object' ? bruto.fin : {};
    e.fin.renda = num(f.renda, 0, L.dinheiroMax);
    e.fin.despesas = num(f.despesas, 0, L.dinheiroMax);
    e.fin.divida = num(f.divida, 0, L.dinheiroMax) || 0;
    e.fin.dividaJurosMes = num(f.dividaJurosMes, 0, L.jurosMesMax) || 0;
    e.fin.patrimonio = num(f.patrimonio, 0, L.dinheiroMax);
    e.fin.reserva = num(f.reserva, 0, L.dinheiroMax) || 0;
    e.fin.aporte = num(f.aporte, 0, L.dinheiroMax);

    if (Array.isArray(bruto.objetivos)) {
      var objs = [];
      bruto.objetivos.slice(0, L.objetivosMax).forEach(function (o) {
        if (!o || typeof o !== 'object') return;
        var tipo = TIPOS_OBJETIVO.indexOf(o.tipo) >= 0 ? o.tipo : 'outro';
        objs.push({
          tipo: tipo,
          nome: limparTexto(o.nome),
          valor: num(o.valor, 0, L.dinheiroMax),
          prazo: num(o.prazo, L.prazoMin, L.prazoMax)
        });
      });
      if (objs.length) e.objetivos = objs;
    }
    var c = bruto.cap && typeof bruto.cap === 'object' ? bruto.cap : {};
    e.cap.estabilidade = opcao(c.estabilidade, 3);
    e.cap.liquidez = opcao(c.liquidez, 3);
    if (Array.isArray(bruto.tol)) {
      for (var i = 0; i < 7; i++) e.tol[i] = opcao(bruto.tol[i], 3);
    }
    var k = bruto.conh && typeof bruto.conh === 'object' ? bruto.conh : {};
    e.conh.tempo = opcao(k.tempo, 3);
    e.conh.auto = opcao(k.auto, 3);
    e.conh.quiz = opcao(k.quiz, 3);
    if (Array.isArray(k.produtos)) {
      var vistos = {};
      k.produtos.slice(0, 8).forEach(function (p) {
        var n = opcao(p, 3);
        if (n !== null && !vistos[n]) { vistos[n] = 1; e.conh.produtos.push(n); }
      });
    }
    if (bruto.atual && typeof bruto.atual === 'object') {
      var a = {}, tot = 0;
      IDS.forEach(function (id) { var v = num(bruto.atual[id], 0, 100); a[id] = v === null ? 0 : Math.round(v); tot += a[id]; });
      e.atual = tot === 100 ? a : null;
    }
    return e;
  }

  /* Remove qualquer coisa que não seja letra, número, espaço ou pontuação simples. */
  function limparTexto(x) {
    if (typeof x !== 'string') return '';
    var s;
    try { s = x.replace(/[^\p{L}\p{N} .,'-]/gu, ''); }
    catch (err) { s = x.replace(/[^A-Za-z0-9À-ÿ .,'-]/g, ''); }
    return s.replace(/\s+/g, ' ').trim().slice(0, C.limites.nomeObjetivoMax);
  }

  /* Lista o que falta para o estado permitir calcular a carteira. */
  function pendencias(e) {
    var p = [];
    if (e.fin.renda === null) p.push('renda');
    if (e.fin.despesas === null || !(e.fin.despesas > 0)) p.push('despesas');
    if (e.fin.patrimonio === null) p.push('patrimonio');
    if (e.fin.aporte === null) p.push('aporte');
    if (!e.objetivos.length) p.push('objetivos');
    e.objetivos.forEach(function (o) { if (!(o.valor > 0) || !(o.prazo > 0)) p.push('objetivos'); });
    if (e.cap.estabilidade === null || e.cap.liquidez === null) p.push('capacidade');
    if (e.tol.some(function (t) { return t === null; })) p.push('tolerancia');
    if (e.conh.tempo === null || e.conh.auto === null || e.conh.quiz === null) p.push('conhecimento');
    return p.filter(function (x, i, a) { return a.indexOf(x) === i; });
  }

  function nomeObjetivo(o) {
    return o.tipo === 'outro' && o.nome ? o.nome : NOMES_OBJETIVO[o.tipo];
  }

  /* ============================================================= PASSO 1 ==
   * Reserva de emergência: 6 meses de despesas; 12 se a renda for variável
   * ou instável. O patrimônio preenche a reserva primeiro; só o excedente
   * vai para as demais classes. */
  function calcularReserva(fin, cap) {
    var instavel = cap.estabilidade !== null && cap.estabilidade <= 1;
    var meses = instavel ? C.reserva.mesesInstavel : C.reserva.mesesPadrao;
    var alvo = meses * fin.despesas;
    var naReserva = Math.min(alvo, fin.patrimonio);
    var falta = alvo - naReserva;
    var mesesParaCompletar = 0;
    if (falta > 0) mesesParaCompletar = fin.aporte > 0 ? Math.ceil(falta / fin.aporte) : null; // null = sem aporte, não completa
    return {
      meses: meses, instavel: instavel, alvo: alvo, naReserva: naReserva, falta: falta,
      excedente: fin.patrimonio - naReserva,
      jaSeparada: Math.min(fin.reserva || 0, fin.patrimonio),
      mesesParaCompletar: mesesParaCompletar
    };
  }

  /* ============================================================= PASSO 2 ==
   * Baldes por prazo. O peso de cada objetivo é a sua "necessidade anual":
   * valor-alvo ÷ prazo. Objetivos maiores e mais próximos pesam mais. */
  function classificarPrazo(anos) {
    if (anos <= C.baldes.limiteCurto) return 'curto';
    if (anos <= C.baldes.limiteMedio) return 'medio';
    return 'longo';
  }
  // Divide `total` na proporção de `pedidos`, sem deixar nenhuma parte passar do seu teto.
  // O que sobrar (todos no teto) é devolvido em `sobra`.
  function repartir(total, pedidos, tetos) {
    var n = pedidos.length, partes = [], livres = [], resto = total, i;
    for (i = 0; i < n; i++) { partes.push(0); livres.push(i); }
    for (var rodada = 0; rodada <= n && livres.length && resto > 1e-9; rodada++) {
      var soma = livres.reduce(function (s, j) { return s + pedidos[j]; }, 0);
      if (!(soma > 0)) break;
      var noTeto = livres.filter(function (j) { return partes[j] + resto * pedidos[j] / soma >= tetos[j]; });
      if (!noTeto.length) { livres.forEach(function (j) { partes[j] += resto * pedidos[j] / soma; }); resto = 0; break; }
      noTeto.forEach(function (j) { resto -= tetos[j] - partes[j]; partes[j] = tetos[j]; });
      livres = livres.filter(function (j) { return noTeto.indexOf(j) < 0; });
    }
    return { partes: partes, sobra: Math.max(0, resto) };
  }

  /* `excedente` = patrimônio que sobra depois da reserva; `aporte` = aporte mensal.
   * - O excedente é dividido pela necessidade anual, mas nenhum objetivo recebe
   *   mais do que o seu valor-alvo; se sobrar, fica no objetivo de prazo mais longo.
   * - O aporte é dividido pelo que AINDA falta de cada objetivo, por ano.
   * - O peso de cada objetivo na carteira segue a divisão do excedente (ou a do
   *   aporte, se ainda não houver excedente). */
  function calcularBaldes(objetivos, excedente, aporte) {
    excedente = excedente > 0 ? excedente : 0; aporte = aporte > 0 ? aporte : 0;
    var n = objetivos.length;
    var nec = objetivos.map(function (o) { return o.valor / o.prazo; });
    var somaNec = nec.reduce(function (a, b) { return a + b; }, 0);
    var maisLongo = 0;
    objetivos.forEach(function (o, i) { if (o.prazo > objetivos[maisLongo].prazo) maisLongo = i; });

    var rep = repartir(excedente, nec, objetivos.map(function (o) { return o.valor; }));
    var iniciais = rep.partes;
    iniciais[maisLongo] += rep.sobra;

    var falta = objetivos.map(function (o, i) { return Math.max(0, o.valor - iniciais[i]) / o.prazo; });
    var somaFalta = falta.reduce(function (a, b) { return a + b; }, 0);
    var aportes = objetivos.map(function (o, i) { return somaFalta > 0 ? aporte * falta[i] / somaFalta : (i === maisLongo ? aporte : 0); });

    var pesos = { curto: 0, medio: 0, longo: 0 }, prazoMedio = 0;
    var objs = objetivos.map(function (o, i) {
      var peso = excedente > 0 ? iniciais[i] / excedente : aporte > 0 ? aportes[i] / aporte : somaNec > 0 ? nec[i] / somaNec : 1 / n;
      var balde = classificarPrazo(o.prazo);
      pesos[balde] += peso; prazoMedio += peso * o.prazo;
      return { tipo: o.tipo, nome: nomeObjetivo(o), valor: o.valor, prazo: o.prazo, balde: balde, peso: peso, inicial: iniciais[i], aporte: aportes[i] };
    });
    return { pesos: pesos, objetivos: objs, prazoMedio: prazoMedio, sobra: rep.sobra };
  }

  /* ============================================================= PERFIL ===
   * Duas dimensões separadas. O perfil final é o MENOR dos dois níveis. */
  function nivelPorCortes(pontos, cortes) {
    var n = 0; cortes.forEach(function (c) { if (pontos >= c) n++; }); return n;
  }
  function calcularPerfil(e, baldes, dividaCara) {
    // --- Capacidade (situação objetiva): 4 itens de 0 a 3 pontos = 0 a 12
    var pm = baldes.prazoMedio;
    var horizonte = pm <= 2 ? 0 : pm <= 5 ? 1 : pm <= 10 ? 2 : 3;
    var mesesFolga = e.fin.despesas > 0 ? e.fin.patrimonio / e.fin.despesas : 0;
    var folga = mesesFolga < 3 ? 0 : mesesFolga < 6 ? 1 : mesesFolga < 24 ? 2 : 3;
    var itens = [
      { id: 'horizonte', nome: 'Prazo dos objetivos', pontos: horizonte, detalhe: 'prazo médio de ' + fmtPrazo(Math.round(pm * 10) / 10) },
      { id: 'estabilidade', nome: 'Estabilidade da renda', pontos: e.cap.estabilidade, detalhe: ['renda instável', 'renda variável', 'renda estável', 'renda muito estável'][e.cap.estabilidade] },
      { id: 'folga', nome: 'Patrimônio frente às despesas', pontos: folga, detalhe: 'equivale a ' + fmtNum(mesesFolga, 0) + ' meses de despesas' },
      { id: 'liquidez', nome: 'Necessidade de resgatar', pontos: e.cap.liquidez, detalhe: ['alta', 'média', 'baixa', 'muito baixa'][e.cap.liquidez] + ' chance de precisar do dinheiro em 2 anos' }
    ];
    var ptsCap = itens.reduce(function (s, i) { return s + i.pontos; }, 0);
    var nivelCapBruto = nivelPorCortes(ptsCap, [3, 6, 8, 11]);
    var nivelCap = dividaCara ? Math.min(nivelCapBruto, C.protecao.tetoCapacidadeDividaCara) : nivelCapBruto;

    // --- Tolerância (comportamento): 7 perguntas de 0 a 3 = 0 a 21
    var ptsTol = e.tol.reduce(function (s, t) { return s + t; }, 0);
    var nivelTol = nivelPorCortes(ptsTol, [5, 9, 13, 17]);

    // --- Conhecimento: 0 a 11 pontos -> baixo (0), médio (1), alto (2)
    var maxProd = e.conh.produtos.length ? Math.max.apply(null, e.conh.produtos) : 0;
    var ptsConh = e.conh.tempo + maxProd + e.conh.auto + (e.conh.quiz === 1 ? 2 : 0);
    var nivelConh = ptsConh <= 3 ? 0 : ptsConh <= 7 ? 1 : 2;

    // --- Perfil final: o menor entre capacidade e tolerância
    var final = Math.min(nivelCap, nivelTol);
    var limitadoPor = nivelCap < nivelTol ? 'capacidade' : nivelTol < nivelCap ? 'tolerancia' : 'iguais';
    var limitadoConhecimento = false;
    if (nivelConh === 0 && final > C.protecao.tetoPerfilConhecimentoBaixo) {
      final = C.protecao.tetoPerfilConhecimentoBaixo; limitadoConhecimento = true;
    }
    return {
      capacidade: { pontos: ptsCap, max: 12, nivel: nivelCap, nivelBruto: nivelCapBruto, itens: itens, limitadaPorDivida: nivelCap < nivelCapBruto },
      tolerancia: { pontos: ptsTol, max: 21, nivel: nivelTol },
      conhecimento: { pontos: ptsConh, max: 11, nivel: nivelConh, nome: ['baixo', 'médio', 'alto'][nivelConh] },
      final: final, limitadoPor: limitadoPor, limitadoConhecimento: limitadoConhecimento,
      nome: C.perfis[final].nome
    };
  }

  /* ============================================================== MACRO ===
   * Lê os dados macro e devolve os sinais usados no ajuste tático. */
  function valorFocus(mapa, ano) {
    if (!mapa) return null;
    var anos = Object.keys(mapa).map(Number).filter(function (a) { return isFinite(mapa[a]); }).sort(function (a, b) { return a - b; });
    if (!anos.length) return null;
    if (mapa[ano] != null) return mapa[ano];
    return ano < anos[0] ? mapa[anos[0]] : mapa[anos[anos.length - 1]];
  }
  /* Valor "para os próximos 12 meses" a partir de dados por ano-calendário:
   * mistura o ano corrente e o seguinte conforme a fração do ano já decorrida. */
  function mistura12m(mapa, ano, fracao) {
    return (1 - fracao) * valorFocus(mapa, ano) + fracao * valorFocus(mapa, ano + 1);
  }
  function sinaisMacro(macro, hoje) {
    var F = macro.focus, Y = hoje.ano, f = hoje.mes / 12;
    var selic = macro.selicMeta.valor;
    var ipca12 = mistura12m(F.ipca, Y, f);
    var jurosReal = ((1 + selic / 100) / (1 + ipca12 / 100) - 1) * 100;
    var selicProx = valorFocus(F.selic, Y + 1);
    var ipcaProx = valorFocus(F.ipca, Y + 1);
    var tendencia = 0;
    if (F.ipcaAnterior && F.ipcaAnterior.ano === Y + 1 && isFinite(F.ipcaAnterior.valor)) tendencia = ipcaProx - F.ipcaAnterior.valor;
    return {
      ano: Y, selic: selic, ipcaEsperado12m: ipca12, jurosReal: jurosReal,
      selicProxAno: selicProx, deltaSelic: selicProx - selic,
      ipcaProxAno: ipcaProx, tendenciaIpca: tendencia
    };
  }

  /* ============================================================= PASSO 4 ==
   * Ajuste tático: pequenas transferências entre classes, cada uma com um
   * motivo. Soma zero; no máximo ±10 p.p. por classe. */
  function ajusteTatico(base, sinais) {
    var T = C.tatico, a = copia(base), motivos = [];

    // Move `pp` pontos de um grupo de classes para outro. `de` e `para` são
    // mapas de proporção; quem doa nunca fica negativo.
    function transferir(de, para, pp) {
      var k;
      var somaDe = soma(de), somaPara = soma(para), movido = 0, efeito = {};
      for (k in de) {
        var tirar = Math.min(a[k] || 0, pp * de[k] / somaDe);
        a[k] -= tirar; movido += tirar; efeito[k] = -tirar;
      }
      for (k in para) { var por = movido * para[k] / somaPara; a[k] = (a[k] || 0) + por; efeito[k] = (efeito[k] || 0) + por; }
      return { movido: movido, efeito: efeito };
    }
    function proporcional(ids) { var o = {}; ids.forEach(function (id) { if (a[id] > 0) o[id] = a[id]; }); return o; }

    // Regra 1 — juro real
    var risco = ['acoes_br', 'acoes_int', 'fii', 'multi', 'alt'];
    var somaRisco = risco.reduce(function (s, id) { return s + (a[id] || 0); }, 0);
    if (sinais.jurosReal >= T.jurosRealMedioAlto && somaRisco > 0) {
      var forte = sinais.jurosReal >= T.jurosRealAlto;
      var pp1 = Math.min(forte ? 5 : 3, somaRisco * (forte ? 0.25 : 0.15));
      var t1 = transferir(proporcional(risco), { ipca: 0.6, pos: 0.4 }, pp1);
      motivos.push({
        id: 'juro_real', titulo: forte ? 'Juro real elevado' : 'Juro real acima da média',
        texto: 'O juro real (Selic descontada a inflação esperada) está perto de ' + fmtNum(sinais.jurosReal) + '% ao ano. ' +
          'Com a renda fixa pagando bem acima da inflação, o motor passa ' + fmtPts(t1.movido) + ' das classes de maior risco para a renda fixa.',
        efeito: t1.efeito
      });
    } else if (sinais.jurosReal <= T.jurosRealBaixo && a.pos > 0) {
      var t1b = transferir({ pos: 1 }, { acoes_br: 0.4, acoes_int: 0.4, fii: 0.2 }, 3);
      motivos.push({
        id: 'juro_real', titulo: 'Juro real baixo',
        texto: 'O juro real está perto de ' + fmtNum(sinais.jurosReal) + '% ao ano. Com a renda fixa pagando pouco acima da inflação, o motor passa ' +
          fmtPts(t1b.movido) + ' da pós-fixada para as classes de crescimento, dentro das faixas do perfil.',
        efeito: t1b.efeito
      });
    }

    // Regra 2 — expectativa de inflação
    var subindo = sinais.tendenciaIpca >= T.altaExpectativaIpca;
    var acimaTeto = sinais.ipcaProxAno > T.tetoMetaInflacao;
    if (subindo || acimaTeto) {
      var pp2 = subindo && acimaTeto ? 4 : 3;
      var t2 = transferir({ pre: 0.5, pos: 0.5 }, { ipca: 1 }, pp2);
      if (t2.movido < pp2 - 1e-9 && a.pos > 0) { // prefixada não tinha tudo: completa com pós
        var t2b = transferir({ pos: 1 }, { ipca: 1 }, pp2 - t2.movido);
        for (var k2 in t2b.efeito) t2.efeito[k2] = (t2.efeito[k2] || 0) + t2b.efeito[k2];
        t2.movido += t2b.movido;
      }
      var porque = [];
      if (subindo) porque.push('subiu ' + fmtNum(sinais.tendenciaIpca, 2) + ' ponto percentual em cerca de quatro semanas');
      if (acimaTeto) porque.push('está acima do teto da meta (' + fmtNum(T.tetoMetaInflacao) + '%)');
      motivos.push({
        id: 'inflacao', titulo: subindo ? 'Expectativa de inflação subindo' : 'Inflação esperada acima da meta',
        texto: 'A inflação esperada para ' + (sinais.ano + 1) + ' (' + fmtNum(sinais.ipcaProxAno, 2) + '%) ' + porque.join(' e ') +
          '. O motor reforça os títulos atrelados à inflação em ' + fmtPts(t2.movido) + '.',
        efeito: t2.efeito
      });
    }

    // Regra 3 — trajetória esperada da Selic
    if (sinais.deltaSelic <= T.quedaSelicLeve && a.pos > 0) {
      var pp3 = sinais.deltaSelic <= T.quedaSelicForte ? 5 : 3;
      var t3 = transferir({ pos: 1 }, { pre: 0.6, ipca: 0.4 }, pp3);
      motivos.push({
        id: 'selic', titulo: 'Expectativa de queda da Selic',
        texto: 'O mercado espera a Selic em ' + fmtNum(sinais.selicProxAno, 2) + '% no fim de ' + (sinais.ano + 1) + ', abaixo dos ' + fmtNum(sinais.selic, 2) +
          '% de hoje. Se isso acontecer, a pós-fixada passa a render menos; por isso o motor leva ' + fmtPts(t3.movido) +
          ' para prefixada e inflação, que mantêm a taxa combinada até o vencimento.',
        efeito: t3.efeito
      });
    } else if (sinais.deltaSelic >= T.altaSelicForte) {
      var t3b = transferir({ pre: 0.75, ipca: 0.25 }, { pos: 1 }, 4);
      motivos.push({
        id: 'selic', titulo: 'Expectativa de alta da Selic',
        texto: 'O mercado espera a Selic em ' + fmtNum(sinais.selicProxAno, 2) + '% no fim de ' + (sinais.ano + 1) + ', acima dos ' + fmtNum(sinais.selic, 2) +
          '% de hoje. O motor leva ' + fmtPts(t3b.movido) + ' para a pós-fixada, que acompanha a alta dos juros.',
        efeito: t3b.efeito
      });
    }

    // Limite global: nenhum desvio acima de ±maxPorClasse (reduz tudo na mesma proporção).
    var maior = 0, id;
    for (id in a) maior = Math.max(maior, Math.abs(a[id] - (base[id] || 0)));
    if (maior > T.maxPorClasse) {
      var fator = T.maxPorClasse / maior;
      for (id in a) a[id] = (base[id] || 0) + (a[id] - (base[id] || 0)) * fator;
    }
    return { aloc: a, motivos: motivos };
  }

  /* ============================================================= PASSO 5 ==
   * Regras de proteção sobre a alocação de um balde. */

  // Traz cada classe para dentro da faixa [mín, máx]; a diferença é
  // redistribuída entre as classes que ainda têm espaço.
  function ajustarFaixas(aloc, faixas) {
    var a = copia(aloc), ids = Object.keys(faixas);
    ids.forEach(function (id) { if (a[id] == null) a[id] = 0; });
    for (var rodada = 0; rodada < 20; rodada++) {
      ids.forEach(function (id) { a[id] = clamp(a[id], faixas[id][0], faixas[id][1]); });
      var resto = 100 - ids.reduce(function (s, id) { return s + a[id]; }, 0);
      if (Math.abs(resto) < 1e-9) break;
      // espaço disponível na direção do resto; a pós-fixada absorve primeiro
      var espaco = function (id) { return resto > 0 ? faixas[id][1] - a[id] : a[id] - faixas[id][0]; };
      var ePos = espaco('pos');
      if (ePos > 1e-9) { var m = Math.min(Math.abs(resto), ePos); a.pos += resto > 0 ? m : -m; continue; }
      var total = ids.reduce(function (s, id) { return s + Math.max(0, espaco(id)); }, 0);
      if (total <= 1e-9) break;
      ids.forEach(function (id) { a[id] += resto * Math.max(0, espaco(id)) / total; });
    }
    return a;
  }

  // Limite de concentração e teto de renda variável; o que passar vai para a pós-fixada.
  function aplicarLimites(aloc, perfilIdx) {
    var P = C.protecao, a = copia(aloc), ajustes = [];
    IDS_INV.forEach(function (id) {
      if (id !== 'pos' && a[id] > P.limiteConcentracao) {
        a.pos = (a.pos || 0) + a[id] - P.limiteConcentracao; a[id] = P.limiteConcentracao; ajustes.push('concentracao:' + id);
      }
    });
    var rv = P.classesRendaVariavel.reduce(function (s, id) { return s + (a[id] || 0); }, 0);
    var teto = P.tetoRendaVariavel[perfilIdx];
    if (rv > teto) {
      var fator = teto / rv;
      P.classesRendaVariavel.forEach(function (id) { var novo = (a[id] || 0) * fator; a.pos = (a.pos || 0) + (a[id] || 0) - novo; a[id] = novo; });
      ajustes.push('teto_rv');
    }
    return { aloc: a, ajustes: ajustes };
  }

  /* Alocação de UM balde (em % do balde, soma 100, sem arredondar). */
  function alocarBalde(balde, perfilIdx, sinais, conhecimentoBaixo) {
    if (balde === 'curto') {
      var c = zeros(IDS_INV), k;
      for (k in C.baldes.alocCurto) c[k] = C.baldes.alocCurto[k];
      return { aloc: c, perfilUsado: null, motivos: [] };
    }
    var idx = balde === 'medio' ? Math.max(0, perfilIdx - C.baldes.rebaixaMedio) : perfilIdx;
    var base = zeros(IDS_INV), b = C.base[idx], id;
    for (id in b) base[id] = b[id];
    var t = sinais ? ajusteTatico(base, sinais) : { aloc: base, motivos: [] };
    var a = ajustarFaixas(t.aloc, C.faixas[idx]);
    a = aplicarLimites(a, idx).aloc;
    if (conhecimentoBaixo) {
      C.protecao.classesComplexas.forEach(function (cid) { a.pos += a[cid] || 0; a[cid] = 0; });
    }
    return { aloc: a, perfilUsado: idx, motivos: t.motivos };
  }

  /* Combina reserva + baldes em uma carteira só (percentuais sem arredondar). */
  function combinar(fracReserva, pesos, alocs) {
    var total = zeros(IDS), inv = zeros(IDS_INV);
    ['curto', 'medio', 'longo'].forEach(function (b) {
      if (!(pesos[b] > 0)) return;
      IDS_INV.forEach(function (id) { inv[id] += pesos[b] * (alocs[b][id] || 0); });
    });
    IDS_INV.forEach(function (id) { total[id] = (1 - fracReserva) * inv[id]; });
    total.reserva = fracReserva * 100;
    return { total: total, inv: inv };
  }

  /* ========================================================== PROJEÇÕES ===
   * Tudo em reais de HOJE (retornos acima da inflação). São hipóteses. */

  // Juro real esperado do CDI para cada ano à frente (índice 0 = próximos 12 meses).
  function trajetoriaJuroReal(macro, hoje, anos) {
    var R = C.retornos, F = macro.focus, Y = hoje.ano, f = hoje.mes / 12;
    var anosFocus = Object.keys(F.selic || {}).map(Number).filter(isFinite);
    var ultimo = anosFocus.length ? Math.max.apply(null, anosFocus) : Y;
    var K = ultimo - Y - 1; // último índice coberto pelo Focus
    var traj = [], realK = R.jurosRealNeutro;
    for (var k = 0; k < anos; k++) {
      var real;
      if (k <= K || (K < 0 && k === 0 && anosFocus.length)) {
        var selic = mistura12m(F.selic, Y + k, f), ipca = mistura12m(F.ipca, Y + k, f);
        real = ((1 + (selic - R.spreadSelicCdi) / 100) / (1 + ipca / 100) - 1) * 100;
        realK = real;
      } else {
        var passo = Math.min(1, (k - Math.max(K, 0)) / R.anosConvergencia);
        real = realK + (R.jurosRealNeutro - realK) * passo;
      }
      traj.push(real);
    }
    return traj;
  }

  // Retorno real anual (%) de uma alocação em um cenário (-1 pessimista, 0 base, +1 otimista).
  function retornoAloc(aloc, jurosRealCdi, cenario) {
    var R = C.retornos, tot = soma(aloc), r = 0;
    if (!(tot > 0)) return jurosRealCdi;
    for (var id in aloc) r += (aloc[id] / tot) * (jurosRealCdi + R.premio[id] + cenario * R.oscilacao[id]);
    return r;
  }

  // Evolução mês a mês. Aporte entra no fim de cada mês, a partir de `inicioAporte`.
  function simular(p0, aporte, inicioAporte, meses, aloc, traj, cenario) {
    var P = p0, serie = [P];
    for (var m = 0; m < meses; m++) {
      var r = Math.max(-0.99, retornoAloc(aloc, traj[Math.min(traj.length - 1, Math.floor(m / 12))], cenario) / 100);
      P = P * Math.pow(1 + r, 1 / 12) + (m >= inicioAporte ? aporte : 0);
      serie.push(P);
    }
    return serie;
  }

  function projetarObjetivo(obj, p0, aporte, inicioAporte, aloc, macro, hoje) {
    var meses = Math.max(1, Math.round(obj.prazo * 12));
    var traj = trajetoriaJuroReal(macro, hoje, Math.ceil(meses / 12) + 1);
    var ini = inicioAporte === null ? meses : inicioAporte;
    var ap = inicioAporte === null ? 0 : aporte;
    var series = {
      pessimista: simular(p0, ap, ini, meses, aloc, traj, -1),
      base: simular(p0, ap, ini, meses, aloc, traj, 0),
      otimista: simular(p0, ap, ini, meses, aloc, traj, 1)
    };
    var fim = { pessimista: series.pessimista[meses], base: series.base[meses], otimista: series.otimista[meses] };
    // Aporte necessário no cenário base: o valor final é linear no aporte.
    var semAporte = simular(p0, 0, ini, meses, aloc, traj, 0)[meses];
    var porReal = simular(0, 1, ini, meses, aloc, traj, 0)[meses];
    var necessario = porReal > 0 ? Math.max(0, (obj.valor - semAporte) / porReal) : null;
    return {
      nome: obj.nome, tipo: obj.tipo, meta: obj.valor, prazo: obj.prazo, meses: meses, balde: obj.balde,
      inicial: p0, aporte: ap, inicioAporte: inicioAporte, series: series, fim: fim,
      sobra: fim.base - obj.valor,                 // positivo = sobra; negativo = falta
      aporteNecessario: necessario,
      reservaDepoisDoPrazo: inicioAporte !== null && inicioAporte >= meses, // a reserva só fica pronta depois do prazo do objetivo
      diferencaAporte: necessario === null ? null : ap - necessario,
      atinge: { pessimista: fim.pessimista >= obj.valor, base: fim.base >= obj.valor, otimista: fim.otimista >= obj.valor },
      retornoBaseAno1: retornoAloc(aloc, traj[0], 0)
    };
  }

  /* ============================================================ ESTRESSE == */
  function testeEstresse(carteira, valorTotal) {
    var perda = 0, detalhes = [];
    for (var id in carteira) {
      var q = C.estresse[id] || 0, contrib = carteira[id] * q / 100;
      perda += contrib;
      if (carteira[id] > 0) detalhes.push({ id: id, pct: carteira[id], queda: q, contribuicao: contrib });
    }
    perda = Math.round(perda * 100) / 100;
    return { pct: perda, valor: valorTotal > 0 ? valorTotal * perda / 100 : null, detalhes: detalhes };
  }

  /* ===================================================== REBALANCEAMENTO == */
  function rebalancear(atual, recomendada, valorTotal) {
    var tol = C.protecao.toleranciaRebalanceamento;
    return IDS.map(function (id) {
      var de = atual[id] || 0, para = recomendada[id] || 0, dif = para - de;
      return {
        id: id, atual: de, recomendada: para, diferenca: dif,
        acao: Math.abs(dif) > tol ? (dif > 0 ? 'aumentar' : 'reduzir') : 'manter',
        valor: valorTotal > 0 ? valorTotal * dif / 100 : null
      };
    }).filter(function (l) { return l.atual > 0 || l.recomendada > 0; });
  }

  /* ====================================================== JUSTIFICATIVAS == */
  function listar(arr) {
    if (arr.length <= 1) return arr.join('');
    return arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1];
  }
  function justificar(id, ctx) {
    var r = ctx.reserva, perfil = C.perfis[ctx.perfil.final].nome.toLowerCase();
    var origem = [];
    if (ctx.contrib.medio[id] > 0.5) origem.push('médio prazo (2 a 5 anos)');
    if (ctx.contrib.longo[id] > 0.5) origem.push('longo prazo (acima de 5 anos)');
    var deOnde = origem.length ? 'seus objetivos de ' + listar(origem) : 'seus objetivos';
    var dosObj = 'dos ' + deOnde, osObj = 'os ' + deOnde, aosObj = 'aos ' + deOnde;
    var t = '';
    switch (id) {
      case 'reserva':
        t = 'Equivale a ' + r.meses + ' meses das suas despesas (' + fmtBRL(r.alvo) + '), porque sua renda é ' +
          (r.instavel ? 'variável ou instável' : 'estável') + '. ' +
          (r.falta > 0 ? 'Ainda faltam ' + fmtBRL(r.falta) + ': os próximos aportes vão para cá antes de qualquer outra classe.' : 'Ela está completa e vem antes de qualquer outra classe.');
        break;
      case 'pos':
        var partes = [];
        if (ctx.contrib.curto.pos > 0.5) partes.push('Guarda o dinheiro dos objetivos de até 2 anos (' + listar(ctx.nomesCurto) + '), que não pode oscilar.');
        if (ctx.contrib.medio.pos + ctx.contrib.longo.pos > 0.5) partes.push('É a parte de menor risco do perfil ' + perfil + ', para ' + osObj + '.');
        if (ctx.conhecimentoBaixo && ctx.contrib.medio.pos + ctx.contrib.longo.pos > 0.5) partes.push('Recebe também a parcela das classes mais complexas, que ficam de fora por enquanto.');
        t = partes.join(' ');
        break;
      case 'pre':
        t = 'Combina uma taxa conhecida de antemão para parte ' + dosObj + '. O ideal é levar esses títulos até o vencimento.';
        break;
      case 'ipca':
        t = 'Protege o poder de compra ' + dosObj + ': rende a inflação mais uma taxa fixa.';
        break;
      case 'acoes_br':
        t = 'Parcela de crescimento para ' + osObj + '. O perfil ' + perfil + ' admite até ' + C.protecao.tetoRendaVariavel[ctx.perfil.final] + '% em renda variável na parcela de longo prazo.';
        break;
      case 'acoes_int':
        t = 'Diversifica ' + osObj + ' fora do Brasil e do real, para a carteira não depender de um único país.';
        break;
      case 'fii':
        t = 'Acrescenta o setor imobiliário ' + aosObj + '. Também oscila, embora em geral menos que as ações.';
        break;
      case 'multi':
        t = 'Parcela pequena que mistura estratégias diferentes, para diversificar ' + osObj + '.';
        break;
      case 'alt':
        t = 'Parcela pequena de proteção: tende a se comportar de forma diferente das ações em momentos de crise.';
        break;
    }
    var d = ctx.deltaTatico[id];
    if (d && Math.abs(d) >= 1) t += ' Inclui ajuste tático de ' + fmtPP(d) + ' pelo cenário atual.';
    return t;
  }

  /* ========================================================= PRINCIPAL =====
   * Recebe o estado (já normalizado e completo), os dados macro e a data.
   * Devolve tudo o que a tela de resultado mostra. */
  function montarCarteira(estado, macro, hoje) {
    var e = estado, fin = e.fin, P = C.protecao;
    hoje = hoje || { ano: new Date().getFullYear(), mes: new Date().getMonth() };

    var sinais = sinaisMacro(macro, hoje);
    var traj1 = trajetoriaJuroReal(macro, hoje, 1);
    var cdiEsperado = mistura12m(macro.focus.selic, hoje.ano, hoje.mes / 12) - C.retornos.spreadSelicCdi;

    // Dívida: custo anual e teste de "dívida cara"
    var custoAnual = (Math.pow(1 + fin.dividaJurosMes / 100, 12) - 1) * 100;
    var limiarDivida = cdiEsperado + P.margemDividaCara;
    var temDivida = fin.divida > 0;
    var dividaCara = temDivida && custoAnual > limiarDivida;

    // Passo 1 — reserva
    var reserva = calcularReserva(fin, e.cap);
    // Passo 2 — baldes
    var baldes = calcularBaldes(e.objetivos, reserva.excedente, fin.aporte);
    // Perfil
    var perfil = calcularPerfil(e, baldes, dividaCara);
    var conhBaixo = perfil.conhecimento.nivel === 0;

    // Passos 3, 4 e 5 — alocação de cada balde (com e sem ajuste tático, para medir o efeito)
    var alocs = {}, alocsSem = {}, motivos = [];
    ['curto', 'medio', 'longo'].forEach(function (b) {
      var com = alocarBalde(b, perfil.final, sinais, conhBaixo);
      alocs[b] = com.aloc;
      alocsSem[b] = alocarBalde(b, perfil.final, null, conhBaixo).aloc;
      if (b !== 'curto' && baldes.pesos[b] > 0 && !motivos.length) motivos = com.motivos;
    });

    // Carteira total (com reserva) e só investimentos
    var fracReserva = fin.patrimonio > 0 ? reserva.naReserva / fin.patrimonio : 1;
    var comb = combinar(fracReserva, baldes.pesos, alocs);
    var combSem = combinar(fracReserva, baldes.pesos, alocsSem);
    var carteira = arredondar100(comb.total);
    var investimentos = arredondar100(comb.inv);
    var semExcedente = !(reserva.excedente > 0);
    var principal = semExcedente ? 'investimentos' : 'carteira';
    var mostrada = semExcedente ? investimentos : carteira;
    var semTatico = arredondar100(semExcedente ? combSem.inv : combSem.total);
    var deltaTatico = {};
    Object.keys(mostrada).forEach(function (id) { deltaTatico[id] = mostrada[id] - (semTatico[id] || 0); });
    var temTatico = Object.keys(deltaTatico).some(function (id) { return deltaTatico[id] !== 0; });
    if (!(baldes.pesos.medio + baldes.pesos.longo > 0)) motivos = [];

    // Contribuição de cada balde para cada classe (para as justificativas)
    var contrib = { curto: {}, medio: {}, longo: {} };
    ['curto', 'medio', 'longo'].forEach(function (b) {
      IDS_INV.forEach(function (id) { contrib[b][id] = (baldes.pesos[b] || 0) * (alocs[b][id] || 0); });
    });
    var ctx = {
      reserva: reserva, perfil: perfil, contrib: contrib, deltaTatico: deltaTatico, conhecimentoBaixo: conhBaixo,
      nomesCurto: baldes.objetivos.filter(function (o) { return o.balde === 'curto'; }).map(function (o) { return o.nome; })
    };
    var baseValor = semExcedente ? null : fin.patrimonio;
    // Valores em R$ saem dos percentuais EXATOS (não dos arredondados), para bater com a reserva e o excedente.
    var valores = { carteira: {}, investimentos: {} };
    IDS.forEach(function (id) { valores.carteira[id] = fin.patrimonio * comb.total[id] / 100; });
    IDS_INV.forEach(function (id) { valores.investimentos[id] = reserva.excedente * comb.inv[id] / 100; });
    var itens = Object.keys(mostrada).filter(function (id) { return mostrada[id] > 0; }).map(function (id) {
      var cl = classe(id);
      return { id: id, nome: cl.nome, curto: cl.curto, cor: cl.cor, pct: mostrada[id], valor: baseValor === null ? null : valores.carteira[id], porque: justificar(id, ctx) };
    }).sort(function (a, b) { return IDS.indexOf(a.id) - IDS.indexOf(b.id); });

    // Projeções por objetivo
    var projecoes = baldes.objetivos.map(function (o) {
      return projetarObjetivo(o, o.inicial, o.aporte, reserva.mesesParaCompletar, alocs[o.balde], macro, hoje);
    });

    // Escada de liquidez (quando você planeja usar o dinheiro)
    var liq = arredondar100({
      dias: fracReserva * 100,
      meses: (1 - fracReserva) * baldes.pesos.curto * 100,
      anos: (1 - fracReserva) * baldes.pesos.medio * 100,
      longo: (1 - fracReserva) * baldes.pesos.longo * 100
    });
    var rotulosLiq = { dias: 'Em dias', meses: 'Em até 2 anos', anos: 'Em 2 a 5 anos', longo: 'Acima de 5 anos' };
    var descLiq = { dias: 'reserva de emergência', meses: 'objetivos de curto prazo', anos: 'objetivos de médio prazo', longo: 'objetivos de longo prazo' };
    var exatoLiq = { dias: reserva.naReserva, meses: reserva.excedente * baldes.pesos.curto, anos: reserva.excedente * baldes.pesos.medio, longo: reserva.excedente * baldes.pesos.longo };
    var liquidez = ['dias', 'meses', 'anos', 'longo'].map(function (id) {
      return { id: id, rotulo: rotulosLiq[id], descricao: descLiq[id], pct: liq[id], valor: fin.patrimonio > 0 ? exatoLiq[id] : null };
    });

    var estresse = testeEstresse(mostrada, baseValor);
    var rebal = e.atual ? rebalancear(e.atual, carteira, fin.patrimonio) : null;

    /* ------------------------------------------------------------ avisos */
    var avisos = [];
    var sobraMensal = fin.renda - fin.despesas;
    if (dividaCara) avisos.push({ id: 'divida_cara', nivel: 'alerta', titulo: 'Quite a dívida cara antes de investir',
      texto: 'Sua dívida custa cerca de ' + fmtNum(custoAnual) + '% ao ano. Isso é mais do que a hipótese de retorno do cenário base de qualquer classe desta carteira (a renda fixa pós-fixada está perto de ' +
        fmtNum(cdiEsperado) + '% ao ano). Em geral, cada real usado para quitar essa dívida rende mais do que o mesmo real investido. Mantenha só uma reserva mínima e priorize a quitação.' });
    else if (temDivida && fin.dividaJurosMes > 0) avisos.push({ id: 'divida', nivel: 'info', titulo: 'Sua dívida não é considerada cara',
      texto: 'Ela custa cerca de ' + fmtNum(custoAnual) + '% ao ano, abaixo do limite usado aqui (' + fmtNum(limiarDivida) + '% ao ano). Dá para investir e pagar as parcelas em dia ao mesmo tempo.' });
    else if (temDivida) avisos.push({ id: 'divida', nivel: 'info', titulo: 'Confira o custo da sua dívida',
      texto: 'Você informou uma dívida sem juros. Se houver juros, volte e informe a taxa: dívidas caras devem ser quitadas antes de investir.' });
    if (sobraMensal < 0) avisos.push({ id: 'deficit', nivel: 'alerta', titulo: 'Suas despesas são maiores que a renda',
      texto: 'Faltam ' + fmtBRL(-sobraMensal) + ' por mês. Antes de investir, o passo mais importante é equilibrar o orçamento; sem isso, a reserva tende a ser consumida.' });
    else if (fin.aporte > sobraMensal + 0.005) avisos.push({ id: 'aporte_alto', nivel: 'alerta', titulo: 'O aporte informado é maior do que sobra por mês',
      texto: 'Sua renda menos as despesas dá ' + fmtBRL(sobraMensal) + ' por mês, mas o aporte informado é de ' + fmtBRL(fin.aporte) + '. As projeções usam o aporte informado; confira se ele é sustentável.' });
    if (reserva.falta > 0) avisos.push({ id: 'reserva', nivel: 'alerta', titulo: 'Reserva de emergência incompleta',
      texto: 'A meta é de ' + reserva.meses + ' meses de despesas (' + fmtBRL(reserva.alvo) + '). Faltam ' + fmtBRL(reserva.falta) + '. ' +
        (reserva.mesesParaCompletar === null ? 'Sem aporte mensal, ela não se completa.' : 'Com o aporte atual, ela se completa em cerca de ' + fmtMeses(reserva.mesesParaCompletar) + '; só depois os aportes vão para os objetivos.') });
    if (perfil.capacidade.limitadaPorDivida) avisos.push({ id: 'cap_divida', nivel: 'info', titulo: 'A dívida cara reduz sua capacidade de risco',
      texto: 'Enquanto ela existir, a capacidade fica limitada ao nível moderado.' });
    if (perfil.limitadoPor === 'capacidade') avisos.push({ id: 'perfil_cap', nivel: 'info', titulo: 'Você tolera mais risco do que sua situação comporta',
      texto: 'Sua tolerância indica o perfil ' + C.perfis[perfil.tolerancia.nivel].nome.toLowerCase() + ', mas sua capacidade (prazo, renda, patrimônio e liquidez) indica ' + C.perfis[perfil.capacidade.nivel].nome.toLowerCase() + '. Vale o menor dos dois.' });
    if (perfil.limitadoPor === 'tolerancia') avisos.push({ id: 'perfil_tol', nivel: 'info', titulo: 'Sua situação comporta mais risco do que você tolera',
      texto: 'Sua capacidade indica o perfil ' + C.perfis[perfil.capacidade.nivel].nome.toLowerCase() + ', mas suas respostas sobre comportamento indicam ' + C.perfis[perfil.tolerancia.nivel].nome.toLowerCase() + '. Vale o menor dos dois: uma carteira que você não consegue manter nas quedas não serve.' });
    if (perfil.limitadoConhecimento) avisos.push({ id: 'perfil_conh', nivel: 'info', titulo: 'Perfil limitado pelo conhecimento declarado',
      texto: 'Como você indicou pouca experiência com investimentos, o perfil final fica limitado a moderado.' });
    if (conhBaixo && baldes.pesos.medio + baldes.pesos.longo > 0) avisos.push({ id: 'complexas', nivel: 'info', titulo: 'Classes mais complexas ficaram de fora',
      texto: 'Multimercado e alternativos não entram enquanto o conhecimento declarado for baixo. A parcela deles foi para a renda fixa pós-fixada.' });
    if (perfil.final >= 3 && baldes.pesos.curto > 0.5) avisos.push({ id: 'prazo_curto', nivel: 'info', titulo: 'Seu perfil aceitaria mais risco, mas o prazo não',
      texto: 'A maior parte dos seus objetivos vence em até 2 anos. Dinheiro com data marcada tão próxima não vai para renda variável, qualquer que seja o perfil.' });
    if (perfil.final <= 1 && baldes.pesos.longo > 0.5) avisos.push({ id: 'conservador_longo', nivel: 'info', titulo: 'Perfil cauteloso com objetivo distante',
      texto: 'A carteira respeita seu perfil e oscila pouco. Em compensação, nas hipóteses usadas ela tende a crescer menos, e o objetivo de longo prazo pode exigir aportes maiores.' });
    projecoes.forEach(function (p) {
      if (!p.atinge.otimista) avisos.push({ id: 'incompativel', nivel: 'alerta', titulo: 'Objetivo "' + p.nome + '" não fecha com prazo e aporte',
        texto: 'Mesmo no cenário otimista, o valor projetado (' + fmtBRL(p.fim.otimista) + ') fica abaixo da meta (' + fmtBRL(p.meta) + '). Assumir mais risco não resolve: considere aumentar o aporte, alongar o prazo ou reduzir o valor-alvo.' });
    });
    if (baldes.sobra > 0.5) avisos.push({ id: 'sobra', nivel: 'info', titulo: 'Seu patrimônio já cobre os objetivos informados',
      texto: 'Depois de separar a reserva e o valor de cada objetivo, sobram ' + fmtBRL(baldes.sobra) + '. Essa sobra foi somada ao objetivo de prazo mais longo. Se quiser, volte e inclua outro objetivo para ela.' });
    if (!(fin.patrimonio > 0)) avisos.push({ id: 'sem_patrimonio', nivel: 'info', titulo: 'Você está começando do zero',
      texto: 'Os percentuais mostram como distribuir os aportes depois que a reserva estiver completa.' });

    /* ------------------------------------------------------------- plano */
    var plano = [];
    if (sobraMensal < 0) plano.push({ titulo: 'Equilibre o orçamento', texto: 'Reduza despesas ou aumente a renda até sobrar dinheiro todo mês. É a base de todo o resto.' });
    if (dividaCara) plano.push({ titulo: 'Quite a dívida cara', texto: 'Direcione o que sobra por mês para a dívida de ' + fmtBRL(fin.divida) + ' (cerca de ' + fmtNum(custoAnual) + '% ao ano). Tente renegociar a taxa ou trocar por uma dívida mais barata.' });
    if (reserva.falta > 0) plano.push({ titulo: 'Complete a reserva de emergência', texto: 'Leve a reserva até ' + fmtBRL(reserva.alvo) + ' (' + reserva.meses + ' meses de despesas), em aplicações de baixo risco e resgate imediato. Faltam ' + fmtBRL(reserva.falta) + '.' });
    else plano.push({ titulo: 'Mantenha a reserva separada', texto: 'Deixe ' + fmtBRL(reserva.alvo) + ' (' + reserva.meses + ' meses de despesas) em aplicações de baixo risco e resgate imediato, separados dos investimentos.' });
    if (!semExcedente) plano.push({ titulo: 'Distribua o restante pelas classes', texto: 'Aplique os ' + fmtBRL(reserva.excedente) + ' que excedem a reserva conforme os percentuais da carteira. Dentro de cada classe, diversifique e compare custos.' });
    if (fin.aporte > 0) plano.push({ titulo: 'Direcione os aportes mensais', texto: (reserva.falta > 0 ? 'Depois de completar a reserva, use' : 'Use') + ' os ' + fmtBRL(fin.aporte) + ' mensais para comprar as classes que estiverem abaixo do percentual recomendado. Assim a carteira se ajusta sem precisar vender.' });
    else plano.push({ titulo: 'Tente começar a aportar', texto: 'Sem aportes mensais, o resultado depende só do retorno. Mesmo um valor pequeno e constante muda bastante a projeção de longo prazo.' });
    plano.push({ titulo: 'Rebalanceie quando sair da faixa', texto: 'Uma ou duas vezes por ano, compare sua carteira com os percentuais recomendados. Ajuste só as classes que estiverem mais de ' + P.toleranciaRebalanceamento + ' pontos percentuais fora.' });
    plano.push({ titulo: 'Revise uma vez por ano', texto: 'Refaça este roteiro todo ano ou quando algo importante mudar (renda, família, objetivos). À medida que um objetivo se aproxima, a parcela dele deve ficar mais conservadora.' });

    /* ------------------------------------------------- frase do cenário */
    var fraseMacro;
    if (!motivos.length) fraseMacro = 'O cenário atual não acionou nenhum ajuste: a carteira segue a alocação-base do seu perfil.';
    else fraseMacro = 'Para a carteira: ' + listar(motivos.map(function (m) { return m.titulo.charAt(0).toLowerCase() + m.titulo.slice(1); })) +
      '. Por isso o motor faz um ajuste pequeno (no máximo ' + C.tatico.maxPorClasse + ' pontos percentuais por classe) na parcela de médio e longo prazo, em relação à alocação-base do perfil. ' +
      'Os números abaixo descrevem o ajuste antes das faixas e dos limites de proteção; o efeito final em cada classe aparece na lista da carteira.';

    return {
      hoje: hoje, sinais: sinais, cdiEsperado: cdiEsperado, jurosRealCdi: traj1[0],
      divida: { tem: temDivida, cara: dividaCara, custoAnual: custoAnual, limiar: limiarDivida, valor: fin.divida },
      reserva: reserva, baldes: baldes, perfil: perfil,
      alocBaldes: alocs, motivos: motivos, temTatico: temTatico, deltaTatico: deltaTatico,
      carteira: carteira, investimentos: investimentos, principal: principal, mostrada: mostrada, valores: valores,
      itens: itens, projecoes: projecoes, liquidez: liquidez, estresse: estresse, rebalanceamento: rebal,
      avisos: avisos, plano: plano, fraseMacro: fraseMacro,
      patrimonio: fin.patrimonio, aporte: fin.aporte, sobraMensal: sobraMensal
    };
  }

  return {
    repartir: repartir, IDS: IDS, IDS_INV: IDS_INV, TIPOS_OBJETIVO: TIPOS_OBJETIVO, NOMES_OBJETIVO: NOMES_OBJETIVO,
    estadoVazio: estadoVazio, normalizarEstado: normalizarEstado, limparTexto: limparTexto, pendencias: pendencias,
    arredondar100: arredondar100, calcularReserva: calcularReserva, classificarPrazo: classificarPrazo,
    calcularBaldes: calcularBaldes, calcularPerfil: calcularPerfil, sinaisMacro: sinaisMacro,
    ajusteTatico: ajusteTatico, ajustarFaixas: ajustarFaixas, aplicarLimites: aplicarLimites, alocarBalde: alocarBalde,
    trajetoriaJuroReal: trajetoriaJuroReal, retornoAloc: retornoAloc, simular: simular,
    testeEstresse: testeEstresse, rebalancear: rebalancear, montarCarteira: montarCarteira,
    classe: classe, fmtBRL: fmtBRL, fmtNum: fmtNum, fmtMeses: fmtMeses, fmtPts: fmtPts, fmtPrazo: fmtPrazo, nomeObjetivo: nomeObjetivo
  };
});
