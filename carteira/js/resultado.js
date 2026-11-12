/* ==========================================================================
 * Monte sua carteira — TELAS DE RESULTADO E PÁGINAS DE TEXTO
 * Recebe o que o motor calculou e desenha. Não calcula nada de finanças.
 * ========================================================================== */
(function (root) {
  'use strict';
  var C = root.MSC.CONFIG, E = root.MSC.engine, G = root.MSC.charts, U = root.MSC.ui, h = U.h;
  var NS = 'http://www.w3.org/2000/svg';

  function nomePerfil(i) { return C.perfis[i].nome; }
  function linhasPerfil(i, extra) {
    var n = nomePerfil(i), p = n.indexOf('-');
    var l = [{ t: 'perfil', pequeno: true }].concat(p > 0 ? [{ t: n.slice(0, p + 1) }, { t: n.slice(p + 1) }] : [{ t: n }]);
    if (extra) l.push({ t: extra, pequeno: true });
    return l;
  }
  function cartao(titulo, sub, filhos, classe) {
    return h('section', { class: 'secao cartao' + (classe ? ' ' + classe : '') }, h('h2', { text: titulo }), sub ? h('p', { class: 'secao-sub' }, sub) : null, filhos);
  }
  function tabela(cabecas, linhas, numericas) {
    return h('div', { class: 'tabela-rolagem' }, h('table', { class: 'tabela' },
      h('thead', {}, h('tr', {}, cabecas.map(function (c, i) { return h('th', { scope: 'col', class: numericas && numericas[i] ? 'num' : null, text: c }); }))),
      h('tbody', {}, linhas.map(function (l) {
        return h('tr', {}, l.map(function (c, i) { return h(i === 0 ? 'th' : 'td', { scope: i === 0 ? 'row' : null, class: numericas && numericas[i] ? 'num' : null, text: c }); }));
      }))));
  }
  function detalhes(resumo, conteudo) { return h('details', { class: 'mais' }, h('summary', { text: resumo }), conteudo); }
  function botao(texto, classe, icone, acao) {
    return h('button', { type: 'button', class: 'btn btn-p ' + classe, onclick: acao }, icone ? U.icone(U.ICONES[icone]) : null, texto);
  }
  function faixa(aloc) {
    return h('div', { class: 'faixa', 'aria-hidden': 'true' }, E.IDS.filter(function (id) { return aloc[id] > 0; }).map(function (id) {
      return h('div', { class: 'faixa-seg', style: 'width:' + aloc[id] + '%;background:' + E.classe(id).cor });
    }));
  }
  function amostraLinha(tipo) { // amostra de traço para a legenda do leque
    var svg = document.createElementNS(NS, 'svg'), l = document.createElementNS(NS, 'line');
    svg.setAttribute('width', 30); svg.setAttribute('height', 10); svg.setAttribute('aria-hidden', 'true');
    l.setAttribute('x1', 1); l.setAttribute('x2', 29); l.setAttribute('y1', 5); l.setAttribute('y2', 5);
    l.setAttribute('class', tipo === 'meta' ? 'leque-meta' : 'leque-linha leque-' + tipo);
    svg.appendChild(l); return svg;
  }

  /* ------------------------------------------------------------ alocação -- */
  function secAlocacao(r, ctx) {
    var podeAlternar = r.principal === 'carteira' && r.carteira.reserva > 0 && r.carteira.reserva < 100;
    var caixa = h('div', {});
    function desenhar() {
      var visao = podeAlternar ? ctx.visao.ler() : r.principal;
      var porId = {}; r.itens.forEach(function (i) { porId[i.id] = i; });
      var aloc = visao === 'carteira' ? r.carteira : r.investimentos;
      var baseValor = r.principal === 'investimentos' ? null : (visao === 'carteira' ? r.patrimonio : r.reserva.excedente);
      var itens = E.IDS.filter(function (id) { return aloc[id] > 0; }).map(function (id) {
        var cl = E.classe(id);
        return { id: id, nome: cl.nome, pct: aloc[id], valor: baseValor === null ? null : r.valores[visao][id], porque: porId[id] ? porId[id].porque : cl.oQueE, oQueE: cl.oQueE };
      });
      var rosca = G.rosca(itens, { linhas: linhasPerfil(r.perfil.final), rotulo: 'Gráfico de rosca: ' + itens.map(function (i) { return i.nome + ' ' + i.pct + '%'; }).join(', ') });
      var alternar = podeAlternar ? h('div', { class: 'alternar', role: 'group', 'aria-label': 'O que mostrar no gráfico' },
        ['carteira', 'investimentos'].map(function (v) {
          return h('button', { type: 'button', 'aria-pressed': String(visao === v), text: v === 'carteira' ? 'Com a reserva' : 'Só investimentos',
            onclick: function () { ctx.visao.gravar(v); desenhar(); } });
        })) : null;
      var lista = h('ul', { class: 'lista-classes' }, itens.map(function (it) {
        return h('li', {},
          h('div', { class: 'lc-topo' }, G.amostra(it.id), h('span', { class: 'lc-nome' }, it.nome, U.termo(null, it.nome, it.oQueE)), h('span', { class: 'lc-pct', text: it.pct + '%' })),
          it.valor !== null ? h('p', { class: 'lc-valor', text: U.fmtBRL(it.valor) }) : null,
          h('p', { class: 'lc-porque' }, h('b', { text: 'Por que isso para você' }), it.porque));
      }));
      caixa.textContent = '';
      caixa.appendChild(h('div', { class: 'aloc' }, h('div', { class: 'aloc-rosca' }, rosca, alternar), lista));
    }
    desenhar();
    var sub = r.principal === 'investimentos'
      ? 'Hoje, tudo o que você tem vai para a reserva de emergência. Os percentuais abaixo valem para o que você investir depois de completá-la.'
      : 'Percentuais do seu patrimônio de ' + U.fmtBRL(r.patrimonio) + ', por classe de investimento.';
    return cartao(r.principal === 'investimentos' ? 'Carteira para depois da reserva' : 'Carteira sugerida pelo roteiro', sub, [
      caixa,
      r.temTatico ? h('p', { class: 'nota' }, 'Os percentuais incluem um ajuste tático', U.termo('tatico', 'ajuste tático'), ' pelo cenário atual, explicado em "Cenário macro hoje".') : null
    ]);
  }

  /* ---------------------------------------------------- opções concretas -- */
  function secOpcoes(r) {
    var A = root.MSC.ATIVOS, O = root.MSC.opcoes;
    if (!A || !O) return null;
    var grupos;
    try { grupos = O.sugerir(r, A, new Date()); } catch (e) { return null; }
    if (!grupos.length) return null;
    var corpo = grupos.map(function (g) {
      return h('div', { class: 'opcao-grupo' },
        h('h3', {}, G.amostra(g.id), g.titulo, h('span', { class: 'opcao-pct', text: r.mostrada[g.id] + '%' })),
        g.itens.length ? h('ul', { class: 'opcao-lista' }, g.itens.map(function (it) {
          return h('li', {}, h('strong', { text: it.rotulo }), h('span', { class: 'opcao-det', text: it.detalhe }), it.porque ? h('span', { class: 'opcao-porque', text: it.porque }) : null);
        })) : null,
        g.nota ? h('p', { class: 'nota', text: g.nota }) : null,
        g.fonte ? h('p', { class: 'opcao-fonte', text: 'Fonte: ' + g.fonte + '.' }) : null);
    });
    return cartao('Onde aplicar: exemplos de fontes oficiais', 'Exemplos reais para cada classe, escolhidos por regras simples (prazo do objetivo ou tamanho no índice). Servem para você pesquisar, não para copiar.', [
      h('p', { class: 'veredito falta' }, 'Estes exemplos não são recomendação individualizada. Taxas e preços mudam todo dia útil: confira no site do Tesouro Direto e na sua corretora antes de decidir. Há imposto de renda e taxas de custódia, e nenhum retorno é garantido (só o Tesouro tem a garantia da União).'),
      corpo
    ]);
  }

  /* -------------------------------------------------------------- perfil -- */
  function secPerfil(r) {
    var p = r.perfil;
    function dim(rotulo, chave, d, vale) {
      return h('div', { class: 'dimensao' + (vale ? ' vale' : '') },
        h('span', { class: 'dimensao-rotulo' }, rotulo, U.termo(chave, rotulo.toLowerCase())),
        h('span', { class: 'dimensao-valor', text: nomePerfil(d.nivel) }),
        h('small', { text: d.pontos + ' de ' + d.max + ' pontos' + (vale ? ' · é o que vale' : '') }));
    }
    var explica = p.limitadoPor === 'iguais' ? 'Capacidade e tolerância apontam para o mesmo nível.' :
      'O perfil final é o menor dos dois: aqui, a ' + (p.limitadoPor === 'capacidade' ? 'capacidade' : 'tolerância') + '.';
    if (p.limitadoConhecimento) explica += ' Depois disso, o conhecimento declarado limitou o perfil a moderado.';
    return cartao('Seu perfil de risco', null, [
      G.medidor(p.final, p.capacidade.nivel, p.tolerancia.nivel),
      h('p', { class: 'perfil-nome', text: p.nome }),
      h('p', { class: 'perfil-frase', text: C.perfis[p.final].frase }),
      h('div', { class: 'dimensoes' },
        dim('Capacidade', 'capacidade', p.capacidade, p.limitadoPor !== 'tolerancia'),
        dim('Tolerância', 'tolerancia', p.tolerancia, p.limitadoPor !== 'capacidade')),
      h('p', { text: explica }),
      h('p', { class: 'nota', text: 'No medidor: C é a capacidade, T é a tolerância e o ponteiro é o perfil final (1 = conservador, 5 = arrojado).' }),
      detalhes('Como a capacidade foi calculada', [
        tabela(['Item', 'Sua situação', 'Pontos'], p.capacidade.itens.map(function (i) { return [i.nome, i.detalhe, i.pontos + ' de 3']; }), [0, 0, 1]),
        p.capacidade.limitadaPorDivida ? h('p', { class: 'nota', text: 'A dívida cara limitou a capacidade ao nível moderado.' }) : null,
        h('p', { class: 'nota', text: 'Conhecimento declarado: ' + p.conhecimento.nome + ' (' + p.conhecimento.pontos + ' de ' + p.conhecimento.max + ' pontos).' })
      ])
    ]);
  }

  /* --------------------------------------------------------------- macro -- */
  function seloOrigem(origem, obtidoEm, leitura) {
    if (leitura) return h('span', { class: 'selo', text: 'dado usado no link' });
    if (origem === 'vivo') return h('span', { class: 'selo', text: 'ao vivo' });
    if (origem === 'cache') return h('span', { class: 'selo selo-ref', text: 'em cache, obtido em ' + (obtidoEm || '—') });
    return h('span', { class: 'selo selo-ref', text: 'dado de referência, atualizado em ' + C.dataReferencia });
  }
  function indicador(nome, termoBtn, valor, unidade, fonte, selo) {
    return h('div', { class: 'indicador' },
      h('div', { class: 'ind-nome' }, nome, termoBtn),
      h('div', { class: 'ind-valor' }, valor, ' ', h('small', { text: unidade })),
      h('div', { class: 'ind-fonte', text: fonte }), selo);
  }
  function painelMacro(macro, sinais, leitura) {
    var F = macro.focus, prox = sinais.ano + 1, o = macro.obtidoEm;
    return h('div', { class: 'macro-grade' },
      indicador('Selic (meta)', U.termo('selic', 'Selic'), U.fmtPct(macro.selicMeta.valor), 'ao ano', 'Banco Central, SGS 432 · ' + macro.selicMeta.data, seloOrigem(macro.selicMeta.origem, o, leitura)),
      indicador('Inflação em 12 meses', U.termo('ipca', 'IPCA'), U.fmtPct(macro.ipca12m.valor), 'IPCA acumulado', 'IBGE via Banco Central, SGS 13522 · ' + macro.ipca12m.data, seloOrigem(macro.ipca12m.origem, o, leitura)),
      indicador('Inflação esperada para ' + prox, U.termo('focus', 'Boletim Focus'), U.fmtPct(sinais.ipcaProxAno), 'no ano', 'Boletim Focus, mediana · ' + F.data, seloOrigem(F.origem, o, leitura)),
      indicador('Selic esperada no fim de ' + prox, U.termo('focus', 'Boletim Focus'), U.fmtPct(sinais.selicProxAno), 'ao ano', 'Boletim Focus, mediana · ' + F.data, seloOrigem(F.origem, o, leitura)));
  }
  function secMacro(r, ctx) {
    var m = ctx.macro, F = m.focus, s = r.sinais, anos = [s.ano, s.ano + 1];
    function v(mapa, ano, casas, pre) { return mapa && mapa[ano] != null ? (pre || '') + E.fmtNum(mapa[ano], casas) : '—'; }
    return cartao('Cenário macro hoje', 'Dados públicos do Banco Central, com a data de cada um.', [
      painelMacro(m, s, ctx.leitura),
      h('p', { class: 'frase-macro' }, h('strong', {}, 'Juro real', U.termo('juro_real', 'juro real'), ' aproximado: ' + E.fmtNum(s.jurosReal) + '% ao ano. '), r.fraseMacro),
      r.motivos.length ? h('ul', { class: 'motivos' }, r.motivos.map(function (mo) { return h('li', {}, h('strong', { text: mo.titulo }), mo.texto); })) : null,
      detalhes('Mais indicadores', [
        tabela(['Indicador', String(anos[0]), String(anos[1])], [
          ['Selic esperada no fim do ano (% ao ano)', v(F.selic, anos[0], 2), v(F.selic, anos[1], 2)],
          ['Inflação esperada, IPCA (% no ano)', v(F.ipca, anos[0], 2), v(F.ipca, anos[1], 2)],
          ['Crescimento esperado do PIB (% no ano)', v(F.pib, anos[0], 2), v(F.pib, anos[1], 2)],
          ['Dólar esperado no fim do ano', v(F.cambio, anos[0], 2, 'R$ '), v(F.cambio, anos[1], 2, 'R$ ')]
        ], [0, 1, 1]),
        h('p', { class: 'nota', text: 'Fonte: Boletim Focus (Banco Central), medianas de ' + F.data + '. CDI: ' + U.fmtPct(m.cdi.valor) + ' ao ano em ' + m.cdi.data + ' (Banco Central, SGS 4389).' })
      ])
    ]);
  }

  /* ----------------------------------------------------------- objetivos -- */
  function secObjetivos(r) {
    var nomesBalde = { curto: 'curto prazo (até 2 anos)', medio: 'médio prazo (2 a 5 anos)', longo: 'longo prazo (acima de 5 anos)' };
    var blocos = r.projecoes.map(function (p) {
      var falta = p.sobra < 0;
      var linhaAporte;
      if (p.reservaDepoisDoPrazo) linhaAporte = 'Com o aporte atual, a reserva de emergência só se completa em cerca de ' + E.fmtMeses(p.inicioAporte) + ', depois do prazo deste objetivo. Até lá, nenhum aporte chega a ele.';
      else if (p.aporteNecessario === null) linhaAporte = 'Sem aportes mensais para este objetivo, o resultado depende só do valor inicial.';
      else if (p.aporteNecessario <= 0.5) linhaAporte = 'Nas hipóteses do cenário base, o valor inicial já alcançaria a meta sem novos aportes.';
      else linhaAporte = 'Aporte destinado a este objetivo: ' + U.fmtBRL(p.aporte) + ' por mês. Para alcançar a meta no cenário base, seriam necessários cerca de ' + U.fmtBRL(p.aporteNecessario) +
        ' por mês (' + (p.diferencaAporte >= 0 ? 'sobram ' + U.fmtBRL(p.diferencaAporte) : 'faltam ' + U.fmtBRL(-p.diferencaAporte)) + ').';
      var caixaLeque = h('div', { class: 'caixa-leque' });
      setTimeout(function () { G.leque(caixaLeque, p); }, 0); // desenha depois de entrar na página (precisa da largura)
      var N = p.meses, passo = N <= 24 ? 3 : 12, linhas = [];
      for (var m = 0; m <= N; m += passo) linhas.push(m);
      if (linhas[linhas.length - 1] !== N) linhas.push(N);
      return h('div', { class: 'objetivo' },
        h('h3', { text: p.nome }),
        h('p', { class: 'objetivo-meta', text: 'Meta de ' + U.fmtBRL(p.meta) + ' em ' + E.fmtPrazo(p.prazo) + ' · ' + nomesBalde[p.balde] + ' · começa com ' + U.fmtBRL(p.inicial) }),
        h('p', { class: 'veredito' + (falta ? ' falta' : '') },
          'No cenário base, a hipótese é chegar a ' + U.fmtBRL(p.fim.base) + ': ' + (falta ? 'faltariam ' + U.fmtBRL(-p.sobra) : 'sobrariam ' + U.fmtBRL(p.sobra)) + ' em relação à meta.',
          h('small', { text: linhaAporte + (p.inicioAporte > 0 && !p.reservaDepoisDoPrazo ? ' Os aportes para este objetivo começam depois de completar a reserva (em cerca de ' + E.fmtMeses(p.inicioAporte) + ').' : '') })),
        h('ul', { class: 'legenda-linhas', 'aria-label': 'Legenda do gráfico' },
          h('li', {}, amostraLinha('otimista'), 'Otimista (pontilhada)'), h('li', {}, amostraLinha('base'), 'Base (contínua)'),
          h('li', {}, amostraLinha('pessimista'), 'Pessimista (tracejada)'), h('li', {}, amostraLinha('meta'), 'Meta')),
        caixaLeque,
        h('div', { class: 'placar' }, [['Pessimista', 'pessimista'], ['Base', 'base'], ['Otimista', 'otimista']].map(function (c) {
          return h('div', {}, h('span', { class: 'placar-rotulo', text: c[0] }), h('span', { class: 'placar-valor', text: G.fmtCompacto(p.fim[c[1]]) }),
            h('span', { class: 'placar-ok', text: p.atinge[c[1]] ? 'alcança a meta' : 'abaixo da meta' }));
        })),
        detalhes('Ver os números em tabela', tabela(['Momento', 'Pessimista', 'Base', 'Otimista'], linhas.map(function (m) {
          return [m === 0 ? 'Hoje' : (N <= 24 ? 'Mês ' + m : (m % 12 === 0 ? 'Ano ' + m / 12 : 'Fim (' + E.fmtPrazo(p.prazo) + ')')),
            U.fmtBRL(p.series.pessimista[m]), U.fmtBRL(p.series.base[m]), U.fmtBRL(p.series.otimista[m])];
        }), [0, 1, 1, 1])));
    });
    return cartao('Seus objetivos em três cenários', [
      'Três hipóteses', U.termo('cenarios', 'cenários'), ' para a mesma carteira, em reais de hoje', U.termo('reais_hoje', 'reais de hoje'),
      '. Não são previsões e não há garantia de que qualquer uma delas aconteça.'], [
      blocos,
      h('p', { class: 'nota', text: 'Hipóteses: retornos antes de impostos e custos; aporte mensal constante, corrigido pela inflação; patrimônio e aportes divididos entre os objetivos conforme o valor e o prazo de cada um. Os retornos de cada classe estão em "Sobre e metodologia".' })
    ]);
  }

  /* ------------------------------------------------------------- liquidez -- */
  function secLiquidez(r) {
    return cartao('Escada de liquidez', ['Quando você planeja usar cada parte do dinheiro', U.termo('liquidez', 'liquidez'), '.'], [
      h('ol', { class: 'escada' }, r.liquidez.map(function (l) {
        return h('li', { class: 'degrau' + (l.pct === 0 ? ' vazio' : '') },
          h('span', { class: 'degrau-rotulo', text: l.rotulo }),
          h('span', { class: 'degrau-pct' }, l.pct + '%', l.valor !== null ? h('small', { text: U.fmtBRL(l.valor) }) : null),
          h('span', { class: 'degrau-desc', text: l.descricao }));
      })),
      h('p', { class: 'nota', text: 'A escada mostra o prazo planejado de uso, não o prazo de resgate de cada aplicação. Dinheiro de prazo longo pode até ser vendido antes, mas talvez com perda.' })
    ]);
  }

  /* ------------------------------------------------------------- estresse -- */
  function secEstresse(r) {
    var e = r.estresse, perda = Math.abs(e.pct);
    var hip = E.IDS.filter(function (id) { return C.estresse[id] < 0; }).map(function (id) { var c = E.classe(id).curto; return c.charAt(0).toLowerCase() + c.slice(1) + ' ' + String(C.estresse[id]).replace('-', '−') + '%'; });
    return cartao('Teste de estresse', ['E se um cenário ruim acontecesse de uma vez?', U.termo('estresse', 'teste de estresse')], [
      h('div', { class: 'estresse-num' }, h('span', { class: 'estresse-pct', text: '−' + E.fmtNum(perda, perda % 1 === 0 ? 0 : 1) + '%' }),
        e.valor !== null ? h('span', { text: 'cerca de ' + U.fmtBRL(Math.abs(e.valor)) + ' a menos' }) : h('span', { text: 'da carteira' })),
      h('div', { class: 'estresse-barra', role: 'img', 'aria-label': 'Restariam ' + E.fmtNum(100 - perda, 1) + '% da carteira; queda de ' + E.fmtNum(perda, 1) + '%' },
        h('div', { class: 'estresse-resta', style: 'width:' + (100 - perda) + '%' }), perda > 0 ? h('div', { class: 'estresse-perda', style: 'width:' + perda + '%' }) : null),
      h('div', { class: 'estresse-legenda' },
        h('span', { text: e.valor !== null ? 'Restariam ' + U.fmtBRL(r.patrimonio + e.valor) : 'Restariam ' + E.fmtNum(100 - perda, 1) + '%' }),
        h('span', { text: 'Queda (hachurado)' })),
      h('p', { class: 'nota', text: 'Hipótese de queda simultânea: ' + hip.join(', ') + '. Reserva e pós-fixada não caem. Quedas reais podem ser maiores ou menores.' }),
      e.detalhes.length ? detalhes('Como cada classe contribui', tabela(['Classe', 'Na carteira', 'Queda', 'Efeito'], e.detalhes.map(function (d) {
        return [E.classe(d.id).nome, d.pct + '%', (d.queda === 0 ? '0' : '−' + Math.abs(d.queda)) + '%', (d.contribuicao === 0 ? '0,00' : '−' + E.fmtNum(Math.abs(d.contribuicao), 2)) + ' p.p.'];
      }), [0, 1, 1, 1])) : null
    ]);
  }

  /* ---------------------------------------------------------- comparativo -- */
  function secComparativo(r) {
    if (!r.rebalanceamento) return null;
    var tol = C.protecao.toleranciaRebalanceamento;
    var mexe = r.rebalanceamento.filter(function (l) { return l.acao !== 'manter'; }).length;
    return cartao('Carteira atual x sugerida', ['Para rebalancear', U.termo('rebalancear', 'rebalancear'), ', só vale mexer no que estiver mais de ' + tol + ' pontos percentuais', U.termo('pp', 'ponto percentual'), ' fora.'], [
      h('p', {}, h('strong', { text: mexe === 0 ? 'Sua carteira atual já está dentro da faixa em todas as classes.' : (mexe === 1 ? '1 classe está fora da faixa.' : mexe + ' classes estão fora da faixa.') })),
      h('ul', { class: 'barras' }, r.rebalanceamento.map(function (l) {
        var cl = E.classe(l.id), dif = Math.abs(l.diferenca);
        var txt = l.acao === 'manter' ? 'Manter' : (l.acao === 'aumentar' ? 'Aumentar ' : 'Reduzir ') + dif + ' p.p.' + (l.valor !== null ? ' (' + U.fmtBRL(Math.abs(l.valor)) + ')' : '');
        function par(rotulo, pct, vazada) {
          return h('div', { class: 'barra-par' }, h('span', { text: rotulo }),
            h('div', { class: 'barra-trilho' }, h('div', { class: 'barra' + (vazada ? ' vazada' : ''), style: 'width:' + pct + '%;background:' + cl.cor })),
            h('span', { class: 'barra-num', text: pct + '%' }));
        }
        return h('li', {},
          h('div', { class: 'barra-topo' }, h('span', { class: 'barra-nome' }, G.amostra(l.id), cl.nome), h('span', { class: 'barra-acao' + (l.acao !== 'manter' ? ' mexer' : ''), text: txt })),
          par('Atual', l.atual, true), par('Sugerida', l.recomendada, false));
      })),
      h('p', { class: 'nota', text: 'Barra tracejada: carteira atual. Barra cheia: carteira sugerida. Prefira ajustar com os novos aportes; vender pode gerar imposto e custos.' })
    ]);
  }

  function secPlano(r) {
    return cartao('Plano de ação', 'Na ordem em que costuma fazer sentido.', [
      h('ol', { class: 'plano' }, r.plano.map(function (p) { return h('li', {}, h('strong', { text: p.titulo }), p.texto); }))
    ]);
  }

  function notaFinal() {
    return h('p', { class: 'nota-final' }, 'Este resultado é educacional. Não é recomendação de investimento individualizada, não considera toda a sua situação e não substitui a orientação de um profissional habilitado. ' +
      'As projeções são hipóteses; não há garantia de retorno. Os títulos, ações e fundos citados são exemplos de fontes oficiais, escolhidos por regras simples, e não recomendação de compra.');
  }

  /* ============================================================ COMPLETO ==
   * ctx: { macro, leitura, dataLink, visao:{ler,gravar}, acoes:{...} } */
  function completo(r, ctx) {
    var A = ctx.acoes, hoje = root.MSC.macro.dataBR(new Date());
    var alertas = r.avisos.filter(function (a) { return a.nivel === 'alerta'; }), infos = r.avisos.filter(function (a) { return a.nivel !== 'alerta'; });
    return h('div', { class: 'tela tela-larga' },
      h('div', { class: 'so-impressao cabeca-impressao' }, h('strong', { text: 'Monte sua carteira — relatório educacional' }), h('span', { text: 'Gerado em ' + (ctx.leitura ? ctx.dataLink : hoje) })),
      ctx.leitura ? h('div', { class: 'faixa-leitura' },
        h('p', {}, h('strong', { text: 'Carteira compartilhada, somente leitura. ' }), 'Criada em ' + ctx.dataLink + ', com os dados de mercado daquele dia.'),
        botao('Fazer a minha', 'btn-primario', null, A.fazerOMeu)) : null,
      h('header', { class: 'res-topo' },
        h('p', { class: 'olho', text: ctx.leitura ? 'Resultado compartilhado' : 'Etapa 7 de 7 · Resultado' }),
        h('h1', { class: 'titulo', tabindex: '-1', text: 'Perfil ' + r.perfil.nome.toLowerCase() }),
        h('div', { class: 'chips' },
          h('span', { class: 'chip chip-forte', text: 'Nível ' + (r.perfil.final + 1) + ' de 5' }),
          h('span', { class: 'chip', text: 'Reserva: ' + r.reserva.meses + ' meses de despesas' }),
          h('span', { class: 'chip', text: r.projecoes.length === 1 ? '1 objetivo' : r.projecoes.length + ' objetivos' }),
          h('span', { class: 'chip', text: 'Dados de mercado: ' + ctx.macro.focus.data })),
        faixa(r.mostrada),
        ctx.leitura ? h('div', { class: 'res-acoes' }, botao('Imprimir ou salvar em PDF', 'btn-secundario', 'imprimir', A.imprimir)) :
          h('div', { class: 'res-acoes' },
            botao('Compartilhar minha carteira', 'btn-primario', 'compartilhar', A.compartilhar),
            botao('Imprimir ou salvar em PDF', 'btn-secundario', 'imprimir', A.imprimir),
            botao('Baixar imagem', 'btn-secundario', 'imagem', A.imagem),
            botao('Modo apresentação', 'btn-secundario', 'tela', A.apresentar),
            botao('Refazer', 'btn-fantasma', 'refazer', A.refazer),
            botao('Fazer para outra pessoa', 'btn-fantasma', 'pessoa', A.outraPessoa))),
      alertas.length ? h('section', { class: 'secao' }, h('h2', { class: 'sr-only', text: 'Pontos de atenção' }), alertas.map(U.aviso)) : null,
      secAlocacao(r, ctx),
      secOpcoes(r),
      h('div', { class: 'grade-2' }, secPerfil(r), secMacro(r, ctx)),
      secObjetivos(r),
      h('div', { class: 'grade-2' }, secLiquidez(r), secEstresse(r)),
      secComparativo(r),
      infos.length ? h('section', { class: 'secao nao-apresenta' }, h('h2', { class: 'sr-only', text: 'Observações' }), infos.map(U.aviso)) : null,
      h('div', { class: 'nao-apresenta' }, secPlano(r)),
      notaFinal());
  }

  /* ============================================================== RESUMO ==
   * Link no modo (a): só percentuais e perfil. */
  function resumo(d, acoes) {
    var itens = E.IDS.filter(function (id) { return d.aloc[id] > 0; }).map(function (id) {
      var cl = E.classe(id); return { id: id, nome: cl.nome, pct: d.aloc[id], oQueE: cl.oQueE };
    });
    return h('div', { class: 'tela tela-larga' },
      h('div', { class: 'faixa-leitura' },
        h('p', {}, h('strong', { text: 'Carteira compartilhada, somente leitura. ' }), 'Criada em ' + d.data + '. Este link traz só os percentuais e o perfil, sem valores em reais.'),
        botao('Fazer a minha', 'btn-primario', null, acoes.fazerOMeu)),
      h('header', { class: 'res-topo' },
        h('p', { class: 'olho', text: 'Resultado compartilhado' }),
        h('h1', { class: 'titulo', tabindex: '-1', text: 'Perfil ' + nomePerfil(d.perfil).toLowerCase() }),
        h('div', { class: 'chips' }, h('span', { class: 'chip chip-forte', text: 'Nível ' + (d.perfil + 1) + ' de 5' }),
          h('span', { class: 'chip', text: d.comReserva ? 'Inclui a reserva de emergência' : 'Sem a reserva de emergência' })),
        faixa(d.aloc)),
      cartao('Alocação por classe', d.comReserva ? 'Percentuais do patrimônio total, incluindo a reserva.' : 'Percentuais da parcela de investimentos, depois de separar a reserva de emergência.', [
        h('div', { class: 'aloc' },
          h('div', { class: 'aloc-rosca' }, G.rosca(itens, { linhas: linhasPerfil(d.perfil), rotulo: 'Gráfico de rosca: ' + itens.map(function (i) { return i.nome + ' ' + i.pct + '%'; }).join(', ') })),
          h('ul', { class: 'lista-classes' }, itens.map(function (it) {
            return h('li', {}, h('div', { class: 'lc-topo' }, G.amostra(it.id), h('span', { class: 'lc-nome', text: it.nome }), h('span', { class: 'lc-pct', text: it.pct + '%' })),
              h('p', { class: 'lc-porque', text: it.oQueE }));
          })))
      ]),
      cartao('Perfil de risco', null, [
        G.medidor(d.perfil, d.capacidade, d.tolerancia),
        h('p', { class: 'perfil-nome', text: nomePerfil(d.perfil) }),
        h('p', { class: 'perfil-frase', text: C.perfis[d.perfil].frase }),
        h('p', { class: 'nota', text: 'Capacidade (C): ' + nomePerfil(d.capacidade).toLowerCase() + '. Tolerância (T): ' + nomePerfil(d.tolerancia).toLowerCase() + '. O perfil final é o menor dos dois.' })
      ]),
      h('p', { class: 'nota-final', text: 'Esta carteira foi montada para a situação de outra pessoa. Para você, o resultado pode ser bem diferente. Conteúdo educacional; não é recomendação de investimento.' }));
  }

  /* =============================================================== SOBRE == */
  function sobre(macro, voltar) {
    var R = C.retornos, P = C.protecao;
    var nomes = E.IDS_INV.map(function (id) { return E.classe(id).curto; });
    var m = macro || root.MSC.macro.referencia();
    function sec(t) { return h('h2', { text: t }); }
    function p(t) { return h('p', { text: t }); }
    function ul(itens) { return h('ul', {}, itens.map(function (i) { return h('li', { text: i }); })); }
    return h('article', { class: 'tela tela-estreita prosa' },
      botao('Voltar', 'btn-secundario', 'voltar', voltar),
      h('h1', { class: 'titulo', tabindex: '-1', text: 'Sobre e metodologia', style: 'margin-top:1.25rem' }),
      p('O Monte sua carteira é um roteiro educacional. Ele imita, de forma simplificada, as etapas que um planejador financeiro segue: entender a situação, os objetivos e o perfil antes de falar em investimentos. Todas as regras são fixas, abertas e estão descritas abaixo.'),
      sec('Como a carteira é calculada'),
      h('ol', {},
        h('li', { text: 'Reserva de emergência primeiro. A meta é de ' + C.reserva.mesesPadrao + ' meses de despesas, ou ' + C.reserva.mesesInstavel + ' se a renda for variável ou instável. O patrimônio preenche a reserva; só o que sobra é dividido entre as outras classes.' }),
        h('li', { text: 'Baldes por prazo. Cada objetivo cai em um balde: curto (até ' + C.baldes.limiteCurto + ' anos), médio (até ' + C.baldes.limiteMedio + ' anos) ou longo. O peso de cada objetivo é o valor-alvo dividido pelo prazo. O balde curto vai todo para renda fixa pós-fixada e nunca recebe renda variável. O balde médio usa um perfil dois níveis mais conservador que o seu.' }),
        h('li', { text: 'Alocação-base pelo perfil. Cada um dos cinco perfis tem percentuais de partida e uma faixa mínima e máxima por classe (tabelas abaixo).' }),
        h('li', { text: 'Ajuste tático leve. Três sinais (juro real, expectativa de inflação e trajetória esperada da Selic) movem no máximo ' + C.tatico.maxPorClasse + ' pontos percentuais por classe, sempre com o motivo escrito no resultado.' }),
        h('li', { text: 'Regras de proteção. Nenhuma classe além da pós-fixada passa de ' + P.limiteConcentracao + '% da parcela de investimentos; a renda variável tem um teto por perfil; dívida cara e objetivos que não fecham geram alertas.' })),
      p('No final, os percentuais são arredondados para números inteiros que somam exatamente 100%.'),
      h('h3', { text: 'Alocação-base por perfil (% da parcela de investimentos)' }),
      tabela(['Perfil'].concat(nomes), C.base.map(function (b, i) { return [C.perfis[i].nome].concat(E.IDS_INV.map(function (id) { return String(b[id] || 0); })); }), [0, 1, 1, 1, 1, 1, 1, 1, 1]),
      h('h3', { text: 'Faixas mínima e máxima por perfil (%)' }),
      tabela(['Perfil'].concat(nomes), C.faixas.map(function (f, i) { return [C.perfis[i].nome].concat(E.IDS_INV.map(function (id) { return f[id][0] + '–' + f[id][1]; })); }), [0, 1, 1, 1, 1, 1, 1, 1, 1]),
      p('Teto de renda variável (ações, imobiliário e alternativos) por perfil: ' + P.tetoRendaVariavel.map(function (t, i) { return C.perfis[i].nome.toLowerCase() + ' ' + t + '%'; }).join(', ') + '.'),
      sec('Como o perfil é definido'),
      ul([
        'Capacidade (0 a 12 pontos): prazo médio dos objetivos, estabilidade da renda, patrimônio em meses de despesas e chance de precisar resgatar. É a parte objetiva.',
        'Tolerância (0 a 21 pontos): sete perguntas sobre comportamento diante de quedas e oscilações.',
        'O perfil final é o menor dos dois níveis. Quem tolera muito risco, mas tem pouca capacidade, fica com o perfil da capacidade, e vice-versa.',
        'Conhecimento declarado baixo limita o perfil a moderado e tira multimercado e alternativos da carteira.',
        'Dívida cara (custo acima do CDI esperado mais ' + P.margemDividaCara + ' pontos percentuais ao ano) limita a capacidade a moderado.'
      ]),
      sec('Dados de mercado e fontes'),
      ul([
        'Selic meta: Banco Central do Brasil, Sistema Gerenciador de Séries Temporais (SGS), série 432. Valor em uso: ' + U.fmtPct(m.selicMeta.valor) + ' ao ano, de ' + m.selicMeta.data + '.',
        'CDI: Banco Central, SGS, série 4389 (taxa anualizada). Valor em uso: ' + U.fmtPct(m.cdi.valor) + ' ao ano, de ' + m.cdi.data + '.',
        'Inflação em 12 meses (IPCA, calculado pelo IBGE): Banco Central, SGS, série 13522. Valor em uso: ' + U.fmtPct(m.ipca12m.valor) + ', referente a ' + m.ipca12m.data + '.',
        'Expectativas para Selic, IPCA, PIB e câmbio: Boletim Focus, API de Expectativas de Mercado do Banco Central (medianas anuais). Data em uso: ' + m.focus.data + '.'
      ]),
      p('Os dados são buscados quando a página abre, direto do seu navegador nos servidores do Banco Central. Se a busca falhar, o app usa a última cópia guardada neste aparelho ou, na falta dela, os dados de referência salvos no código em ' + C.dataReferencia + '. Cada número mostra de onde veio.'),
      sec('Exemplos de títulos, ações e fundos'),
      ul([
        'Tesouro Direto: taxas e preços de compra do Tesouro Nacional (Tesouro Transparente), na data mostrada. Para cada objetivo, o app escolhe o vencimento mais próximo da data da meta que não vença antes dela. A reserva usa o Tesouro Selic de vencimento mais curto.',
        'Ações e fundos imobiliários: composição teórica do Ibovespa e do IFIX, divulgada pela B3. O app mostra as maiores participações. Peso grande indica tamanho e negociação, não qualidade nem preço justo.',
        'Exterior, multimercado e alternativos: sem lista de nomes, por falta de fonte oficial gratuita equivalente.',
        'Esses dados não são buscados ao vivo: as fontes não permitem consulta direta do navegador. Eles são atualizados por um script (tools/atualizar-ativos.js) e publicados junto com o app; a data de cada fonte aparece na tela.'
      ]),
      sec('Premissas das projeções'),
      ul([
        'Tudo é mostrado em reais de hoje, isto é, já descontada a inflação esperada.',
        'O retorno de cada classe é o juro real esperado do CDI (expectativa de Selic menos ' + E.fmtNum(R.spreadSelicCdi, 2) + ' ponto, descontada a inflação esperada) mais um prêmio, que é uma hipótese.',
        'Depois do último ano coberto pelo Boletim Focus, o juro real converge em ' + R.anosConvergencia + ' anos para ' + E.fmtNum(R.jurosRealNeutro) + '% ao ano, também uma hipótese.',
        'Os cenários pessimista e otimista somam ou subtraem uma margem do retorno de cada classe. Não têm probabilidade associada.',
        'Retornos antes de impostos, taxas e custos. O aporte mensal é mantido constante em reais de hoje.'
      ]),
      h('h3', { text: 'Prêmio e margem dos cenários por classe (pontos percentuais ao ano)' }),
      tabela(['Classe', 'Prêmio sobre o CDI real', 'Margem dos cenários (±)', 'Queda no teste de estresse'], E.IDS.map(function (id) {
        return [E.classe(id).nome, E.fmtNum(R.premio[id]).replace('-', '−'), E.fmtNum(R.oscilacao[id]), String(C.estresse[id]).replace('-', '−') + '%'];
      }), [0, 1, 1, 1]),
      sec('Limitações'),
      ul([
        'É um modelo simples. Não considera impostos, custos, idade, dependentes, seguros, previdência, imóveis, heranças nem a sua situação completa.',
        'Dentro de cada classe existem produtos muito diferentes em risco, prazo e custo. Os exemplos mostrados saem de regras mecânicas (vencimento mais próximo da meta, maiores pesos de um índice) e não comparam qualidade, preço justo nem custos de cada produto.',
        'A divisão do patrimônio entre objetivos (valor dividido pelo prazo) é uma simplificação.',
        'As projeções não reduzem o risco conforme o objetivo se aproxima. Refaça o roteiro pelo menos uma vez por ano.',
        'Os prêmios, as margens dos cenários e as quedas do teste de estresse são hipóteses dos autores, não estimativas estatísticas.',
        'O ajuste tático reage a poucos indicadores e pode estar errado. Ele é limitado justamente por isso.'
      ]),
      sec('Aviso'),
      p('Conteúdo exclusivamente educacional. Não é recomendação de investimento, consultoria ou análise de valores mobiliários, e não substitui um profissional habilitado. Retornos passados ou hipotéticos não garantem retornos futuros. As decisões e os riscos são seus.'),
      sec('Código aberto'),
      p('O código é aberto, sob licença MIT. Qualquer pessoa pode copiar, adaptar e publicar a própria versão; as instruções estão no arquivo README. Versão ' + C.versao + ', premissas de ' + C.dataReferencia + '.'));
  }

  function privacidade(voltar, apagar) {
    function p(t) { return h('p', { text: t }); }
    return h('article', { class: 'tela tela-estreita prosa' },
      botao('Voltar', 'btn-secundario', 'voltar', voltar),
      h('h1', { class: 'titulo', tabindex: '-1', text: 'Privacidade', style: 'margin-top:1.25rem' }),
      p('Em uma frase: não coletamos nem enviamos os seus dados.'),
      h('h2', { text: 'O que fica no seu aparelho' }),
      h('ul', {},
        h('li', { text: 'Suas respostas são guardadas só no armazenamento deste navegador, para você poder continuar depois. Elas não vão para nenhum servidor.' }),
        h('li', { text: 'Também ficam guardados o tema (claro ou escuro) e a última cópia dos dados públicos de mercado.' }),
        h('li', { text: 'Você pode apagar tudo a qualquer momento.' })),
      h('p', {}, botao('Apagar meus dados', 'btn-perigo', null, apagar)),
      h('h2', { text: 'O que sai do seu aparelho' }),
      h('ul', {},
        h('li', { text: 'Ao abrir a página, o navegador consulta dados públicos de juros e inflação nos servidores do Banco Central do Brasil. Essa consulta não leva nenhuma resposta sua; como em qualquer acesso à internet, o Banco Central enxerga o seu endereço IP.' }),
        h('li', { text: 'O servidor que hospeda esta página também enxerga o seu IP ao entregar os arquivos, como qualquer site. Este app não inclui ferramentas de estatística, anúncios, cookies nem rastreadores.' })),
      h('h2', { text: 'Links compartilhados' }),
      h('ul', {},
        h('li', { text: 'Quando você compartilha sua carteira, o resultado vai escrito no próprio link, na parte depois do sinal #. Essa parte não é enviada ao servidor pelo navegador.' }),
        h('li', { text: 'Quem recebe o link consegue ler o que está nele. A opção padrão leva só os percentuais e o perfil. A opção completa leva seus dados financeiros: use apenas com quem você confia.' }),
        h('li', { text: 'Aplicativos de mensagem e redes sociais por onde o link passar podem guardar esse link.' })),
      h('h2', { text: 'O que nunca pedimos' }),
      p('Nome, CPF, e-mail, telefone, dados de conta ou senha. Não há cadastro.'));
  }

  root.MSC.resultado = { completo: completo, resumo: resumo, sobre: sobre, privacidade: privacidade, painelMacro: painelMacro, nomePerfil: nomePerfil };
})(window);
