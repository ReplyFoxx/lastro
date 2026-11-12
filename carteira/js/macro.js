/* ==========================================================================
 * Monte sua carteira — DADOS DE MERCADO
 * Busca dados oficiais do Banco Central direto do navegador da pessoa.
 * Nenhum dado do usuário é enviado: são apenas leituras de séries públicas.
 *
 * Ordem de preferência de cada dado:  ao vivo  >  cache local  >  referência
 * (referência = valores salvos em config.js, com a data em que foram copiados)
 * ========================================================================== */
(function (root) {
  'use strict';
  var C = root.MSC.CONFIG;
  var CHAVE_CACHE = 'msc:macro:v1';

  function doisDigitos(n) { return (n < 10 ? '0' : '') + n; }
  function dataBR(d) { return doisDigitos(d.getDate()) + '/' + doisDigitos(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function isoParaBR(iso) { var p = String(iso).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : ''; }
  function brParaDate(br) { var p = String(br).split('/'); return new Date(+p[2], +p[1] - 1, +p[0]); }

  /* ---------------------------------------------------------- validação --
   * Tudo o que entra (rede, cache ou link compartilhado) passa por aqui. */
  function numero(x, min, max) {
    if (typeof x === 'string' && x.trim() !== '') x = Number(x);
    return typeof x === 'number' && isFinite(x) && x >= min && x <= max ? x : null;
  }
  function dataValida(s) { return typeof s === 'string' && /^(\d{2}\/)?\d{2}\/\d{4}$/.test(s) ? s : null; }
  function origemValida(o) { return o === 'vivo' || o === 'cache' ? o : 'referencia'; }
  function mapaAnos(m, min, max) {
    var r = {}, n = 0;
    if (!m || typeof m !== 'object') return null;
    Object.keys(m).slice(0, 12).forEach(function (k) {
      var ano = Number(k), v = numero(m[k], min, max);
      if (Number.isInteger(ano) && ano >= 2000 && ano <= 2100 && v !== null) { r[ano] = v; n++; }
    });
    return n ? r : null;
  }
  function ponto(p, min, max) {
    if (!p || typeof p !== 'object') return null;
    var v = numero(p.valor, min, max), d = dataValida(p.data);
    return v === null || !d ? null : { valor: v, data: d, origem: origemValida(p.origem) };
  }
  function normalizar(m) {
    if (!m || typeof m !== 'object' || !m.focus || typeof m.focus !== 'object') return null;
    var f = m.focus;
    var r = {
      selicMeta: ponto(m.selicMeta, 0, 100),
      cdi: ponto(m.cdi, 0, 100),
      ipca12m: ponto(m.ipca12m, -20, 200),
      focus: {
        data: dataValida(f.data), origem: origemValida(f.origem),
        selic: mapaAnos(f.selic, 0, 100), ipca: mapaAnos(f.ipca, -20, 200),
        pib: mapaAnos(f.pib, -50, 50), cambio: mapaAnos(f.cambio, 0.01, 1000),
        ipcaAnterior: null
      }
    };
    if (f.ipcaAnterior && typeof f.ipcaAnterior === 'object') {
      var a = Number(f.ipcaAnterior.ano), v = numero(f.ipcaAnterior.valor, -20, 200), d = dataValida(f.ipcaAnterior.data);
      if (Number.isInteger(a) && v !== null && d) r.focus.ipcaAnterior = { ano: a, valor: v, data: d };
    }
    if (!r.selicMeta || !r.cdi || !r.ipca12m || !r.focus.data || !r.focus.selic || !r.focus.ipca) return null;
    r.focus.pib = r.focus.pib || {}; r.focus.cambio = r.focus.cambio || {};
    return r;
  }

  function referencia() {
    var m = normalizar(JSON.parse(JSON.stringify(C.fallbackMacro)));
    m.obtidoEm = null;
    return m;
  }

  /* --------------------------------------------------------------- cache -- */
  function lerCache() {
    try {
      var bruto = JSON.parse(root.localStorage.getItem(CHAVE_CACHE));
      var m = normalizar(bruto && bruto.macro);
      if (!m || !dataValida(bruto.obtidoEm)) return null;
      ['selicMeta', 'cdi', 'ipca12m', 'focus'].forEach(function (k) { if (m[k].origem === 'vivo') m[k].origem = 'cache'; });
      m.obtidoEm = bruto.obtidoEm;
      return m;
    } catch (e) { return null; }
  }
  function gravarCache(m) {
    try { root.localStorage.setItem(CHAVE_CACHE, JSON.stringify({ macro: m, obtidoEm: dataBR(new Date()) })); } catch (e) { /* sem armazenamento: segue sem cache */ }
  }

  /* ---------------------------------------------------------------- rede -- */
  // Para testar o fallback: abra o app com ?semapi=1 e nenhuma consulta é feita.
  var SEM_API = /[?&]semapi=1/.test(root.location.search);
  function buscarJSON(url) {
    if (SEM_API) return Promise.reject(new Error('API desligada para teste'));
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, C.apis.tempoLimiteMs);
    return fetch(url, { signal: ctrl ? ctrl.signal : undefined, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(timer); });
  }

  // SGS: último valor publicado até hoje. (A série 432 traz datas futuras,
  // até a próxima reunião do Copom; por isso filtramos pela data.)
  function buscarSGS(serie, diasAtras, mensal) {
    var hoje = new Date(), ini = new Date(hoje.getTime() - diasAtras * 864e5);
    var url = C.apis.sgs.replace('{serie}', serie) + '?formato=json&dataInicial=' + dataBR(ini) + '&dataFinal=' + dataBR(hoje);
    return buscarJSON(url).then(function (lista) {
      if (!Array.isArray(lista) || !lista.length) throw new Error('SGS vazio');
      var ultimo = null;
      lista.forEach(function (it) {
        if (!it || !/^\d{2}\/\d{2}\/\d{4}$/.test(it.data)) return;
        var d = brParaDate(it.data);
        if (d <= hoje && (!ultimo || d >= ultimo.d)) ultimo = { d: d, data: it.data, valor: Number(it.valor) };
      });
      if (!ultimo || !isFinite(ultimo.valor)) throw new Error('SGS sem valor');
      return { valor: ultimo.valor, data: mensal ? ultimo.data.slice(3) : ultimo.data, origem: 'vivo' };
    });
  }

  // Focus: medianas anuais dos últimos ~45 dias, numa única consulta.
  function buscarFocus() {
    var hoje = new Date(), ini = new Date(hoje.getTime() - 45 * 864e5);
    var isoIni = ini.getFullYear() + '-' + doisDigitos(ini.getMonth() + 1) + '-' + doisDigitos(ini.getDate());
    var filtro = "(Indicador eq 'IPCA' or Indicador eq 'Selic' or Indicador eq 'PIB Total' or Indicador eq 'Câmbio') and baseCalculo eq 0 and Data ge '" + isoIni + "'";
    var url = C.apis.focus + '?$top=3000&$filter=' + encodeURIComponent(filtro) + '&$orderby=' + encodeURIComponent('Data desc') +
      '&$format=json&$select=Indicador,Data,DataReferencia,Mediana';
    return buscarJSON(url).then(function (j) {
      var linhas = j && Array.isArray(j.value) ? j.value : [];
      if (!linhas.length) throw new Error('Focus vazio');
      var chaves = { 'IPCA': 'ipca', 'Selic': 'selic', 'PIB Total': 'pib', 'Câmbio': 'cambio' };
      var ultima = linhas.reduce(function (m, l) { return l.Data > m ? l.Data : m; }, '');
      var f = { data: isoParaBR(ultima), origem: 'vivo', selic: {}, ipca: {}, pib: {}, cambio: {}, ipcaAnterior: null };
      linhas.forEach(function (l) {
        var k = chaves[l.Indicador];
        if (k && l.Data === ultima && isFinite(l.Mediana)) f[k][Number(l.DataReferencia)] = Math.round(l.Mediana * 100) / 100;
      });
      // tendência: IPCA do ano seguinte, na data mais recente com pelo menos 28 dias de distância
      var prox = hoje.getFullYear() + 1, limite = new Date(new Date(ultima + 'T00:00:00').getTime() - 28 * 864e5), melhor = null;
      linhas.forEach(function (l) {
        if (l.Indicador !== 'IPCA' || Number(l.DataReferencia) !== prox || !isFinite(l.Mediana)) return;
        if (new Date(l.Data + 'T00:00:00') <= limite && (!melhor || l.Data > melhor.Data)) melhor = l;
      });
      if (melhor) f.ipcaAnterior = { ano: prox, valor: Math.round(melhor.Mediana * 100) / 100, data: isoParaBR(melhor.Data) };
      return f;
    });
  }

  /* Carrega tudo. Nunca rejeita: no pior caso devolve a referência. */
  function carregar() {
    var cache = lerCache(), ref = referencia();
    var base = cache || ref;
    var S = C.apis.series;
    var tarefas = [
      buscarSGS(S.selicMeta, 15, false), buscarSGS(S.cdi, 15, false), buscarSGS(S.ipca12m, 150, true), buscarFocus()
    ].map(function (p) { return p.then(function (v) { return v; }, function () { return null; }); });
    return Promise.all(tarefas).then(function (r) {
      var m = {
        selicMeta: r[0] || base.selicMeta, cdi: r[1] || base.cdi, ipca12m: r[2] || base.ipca12m, focus: r[3] || base.focus
      };
      var limpo = normalizar(m) || ref;
      var vivos = ['selicMeta', 'cdi', 'ipca12m', 'focus'].filter(function (k) { return limpo[k].origem === 'vivo'; }).length;
      limpo.obtidoEm = vivos ? dataBR(new Date()) : (cache ? cache.obtidoEm : null);
      if (vivos === 4) gravarCache(limpo);
      limpo.situacao = vivos === 4 ? 'vivo' : vivos > 0 ? 'parcial' : cache ? 'cache' : 'referencia';
      return limpo;
    }).catch(function () { var f = cache || ref; f.situacao = cache ? 'cache' : 'referencia'; return f; });
  }

  root.MSC.macro = { carregar: carregar, referencia: referencia, normalizar: normalizar, dataBR: dataBR };
})(window);
