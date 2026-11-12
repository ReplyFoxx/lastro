/* ==========================================================================
 * Monte sua carteira — COMPARTILHAMENTO POR LINK
 * O resultado vai codificado no FRAGMENTO da URL (depois do #). Navegadores
 * nunca enviam o fragmento ao servidor, então os dados não saem do aparelho
 * de quem compartilha a não ser pelo próprio link.
 *
 * Formato:  #c=<z|j><base64url>
 *   z = JSON comprimido (deflate-raw);  j = JSON sem compressão (navegador antigo)
 *
 * Tudo o que chega por link é tratado como NÃO CONFIÁVEL e passa por validar().
 * ========================================================================== */
(function (root) {
  'use strict';
  var C = root.MSC.CONFIG, E = root.MSC.engine, M = root.MSC.macro;
  var MAX_LINK = 8000;      // caracteres aceitos no fragmento
  var MAX_JSON = 60000;     // bytes aceitos depois de descomprimir

  function b64url(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function deB64url(txt) {
    var s = atob(txt.replace(/-/g, '+').replace(/_/g, '/'));
    var b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
  }
  function passarPor(stream, bytes, limite) {
    var w = stream.writable.getWriter();
    w.write(bytes).catch(function () {}); w.close().catch(function () {});
    var r = stream.readable.getReader(), partes = [], total = 0;
    function ler() {
      return r.read().then(function (x) {
        if (x.done) return;
        total += x.value.length;
        if (limite && total > limite) { r.cancel().catch(function () {}); throw new Error('grande demais'); }
        partes.push(x.value); return ler();
      });
    }
    return ler().then(function () {
      var out = new Uint8Array(total), p = 0;
      partes.forEach(function (c) { out.set(c, p); p += c.length; });
      return out;
    });
  }

  function codificar(obj) {
    var bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream === 'undefined') return Promise.resolve('j' + b64url(bytes));
    return passarPor(new CompressionStream('deflate-raw'), bytes).then(function (z) { return 'z' + b64url(z); })
      .catch(function () { return 'j' + b64url(bytes); });
  }

  /* Devolve o objeto bruto ou null. Nunca lança erro, nunca executa nada. */
  function decodificar(txt) {
    return Promise.resolve().then(function () {
      if (typeof txt !== 'string' || txt.length < 2 || txt.length > MAX_LINK || !/^[zj][A-Za-z0-9_-]+$/.test(txt)) return null;
      var bytes = deB64url(txt.slice(1));
      if (txt[0] === 'j') return bytes.length > MAX_JSON ? null : bytes;
      if (typeof DecompressionStream === 'undefined') return null;
      return passarPor(new DecompressionStream('deflate-raw'), bytes, MAX_JSON);
    }).then(function (bytes) {
      if (!bytes) return null;
      var obj = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : null;
    }).catch(function () { return null; });
  }

  /* ----------------------------------------------------------- montagem -- */
  // Opção (a): só percentuais e perfil. Nada de valores em R$.
  function pacoteResumo(resultado) {
    var al = {};
    Object.keys(resultado.mostrada).forEach(function (id) { if (resultado.mostrada[id] > 0) al[id] = resultado.mostrada[id]; });
    return { v: 1, m: 'a', p: resultado.perfil.final, c: resultado.perfil.capacidade.nivel, t: resultado.perfil.tolerancia.nivel,
      al: al, pr: resultado.principal === 'carteira' ? 1 : 0, d: M.dataBR(new Date()) };
  }
  // Opção (b): respostas completas + os dados macro usados, para reproduzir o mesmo resultado.
  function pacoteCompleto(estado, macro, hoje) {
    return { v: 1, m: 'b', e: estado, h: [hoje.ano, hoje.mes], d: M.dataBR(new Date()),
      mc: { selicMeta: macro.selicMeta, cdi: macro.cdi, ipca12m: macro.ipca12m, focus: macro.focus } };
  }

  /* ---------------------------------------------------------- validação --
   * Só devolve algo se TODOS os campos estiverem dentro do esperado. */
  function inteiro(x, min, max) { return Number.isInteger(x) && x >= min && x <= max ? x : null; }
  function dataOk(s) { return typeof s === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(s) ? s : null; }

  function validar(obj) {
    if (!obj || obj.v !== 1) return null;
    var data = dataOk(obj.d);
    if (!data) return null;
    if (obj.m === 'a') {
      var p = inteiro(obj.p, 0, 4), c = inteiro(obj.c, 0, 4), t = inteiro(obj.t, 0, 4);
      if (p === null || c === null || t === null || !obj.al || typeof obj.al !== 'object') return null;
      var aloc = {}, soma = 0;
      E.IDS.forEach(function (id) {                       // whitelist de classes
        var v = Object.prototype.hasOwnProperty.call(obj.al, id) ? inteiro(obj.al[id], 0, 100) : 0;
        aloc[id] = v === null ? NaN : v; soma += aloc[id];
      });
      if (soma !== 100) return null;
      return { modo: 'a', perfil: p, capacidade: c, tolerancia: t, aloc: aloc, comReserva: obj.pr === 1, data: data };
    }
    if (obj.m === 'b') {
      var estado = E.normalizarEstado(obj.e);
      if (E.pendencias(estado).length) return null;
      if (estado.fin.reserva > estado.fin.patrimonio) estado.fin.reserva = estado.fin.patrimonio;
      var macro = M.normalizar(obj.mc);
      if (!macro || !Array.isArray(obj.h)) return null;
      var ano = inteiro(obj.h[0], 2020, 2100), mes = inteiro(obj.h[1], 0, 11);
      if (ano === null || mes === null) return null;
      return { modo: 'b', estado: estado, macro: macro, hoje: { ano: ano, mes: mes }, data: data };
    }
    return null;
  }

  function urlBase() { return root.location.href.split('#')[0]; }
  function lerFragmento() {
    var h = root.location.hash || '';
    return h.indexOf('#c=') === 0 ? h.slice(3) : null;
  }

  root.MSC.share = {
    codificar: codificar, decodificar: decodificar, validar: validar,
    pacoteResumo: pacoteResumo, pacoteCompleto: pacoteCompleto, urlBase: urlBase, lerFragmento: lerFragmento
  };
})(window);
