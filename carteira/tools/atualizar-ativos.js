/* Atualiza js/ativos.js com dados de fontes oficiais.
 * Uso:  node tools/atualizar-ativos.js
 *
 * Fontes:
 *  - Tesouro Transparente (Tesouro Nacional): "Taxas dos Títulos Ofertados pelo Tesouro Direto"
 *  - B3: composição teórica do Ibovespa (IBOV) e do Índice de Fundos Imobiliários (IFIX)
 *
 * Por que isso roda aqui e não no navegador: essas fontes não liberam CORS para outros sites,
 * então o navegador da pessoa não consegue consultá-las direto. Rode este script de tempos em
 * tempos (as taxas do Tesouro mudam todo dia útil) e publique de novo. */
'use strict';
const fs = require('fs');
const path = require('path');

const URL_TESOURO = 'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/precotaxatesourodireto.csv';
const B3 = 'https://sistemaswebb3-listados.b3.com.br/indexProxy/indexCall/GetPortfolioDay/';
const TIPOS = { // só os títulos que o Tesouro Direto oferece hoje, sem o IGPM+ (descontinuado)
  'Tesouro Selic': 'selic', 'Tesouro Prefixado': 'pre', 'Tesouro IPCA+': 'ipca',
  'Tesouro Educa+': 'educa', 'Tesouro Renda+ Aposentadoria Extra': 'renda'
};

const num = (s) => Number(String(s).replace(/\./g, '').replace(',', '.'));
const iso = (br) => { const [d, m, a] = br.split('/'); return `${a}-${m}-${d}`; };
const brData = (iso8) => iso8.split('-').reverse().join('/');

async function tesouro() {
  const r = await fetch(URL_TESOURO);
  if (!r.ok) throw new Error('Tesouro: HTTP ' + r.status);
  const txt = new TextDecoder('windows-1252').decode(await r.arrayBuffer());
  const linhas = txt.trim().split(/\r?\n/).slice(1).map((l) => l.split(';'));
  const ultima = linhas.reduce((m, l) => (iso(l[2]) > m ? iso(l[2]) : m), '');
  const itens = linhas.filter((l) => iso(l[2]) === ultima && TIPOS[l[0]])
    .map((l) => ({ t: TIPOS[l[0]], v: iso(l[1]), taxa: num(l[3]), pu: num(l[5]) }))
    .sort((a, b) => a.t.localeCompare(b.t) || a.v.localeCompare(b.v));
  if (itens.length < 10) throw new Error('Tesouro: poucos títulos lidos');
  return { data: brData(ultima), itens };
}

async function indice(nome, topo) {
  const p = Buffer.from(JSON.stringify({ language: 'pt-br', pageNumber: 1, pageSize: 200, index: nome, segment: '1' })).toString('base64');
  const r = await fetch(B3 + p);
  if (!r.ok) throw new Error(nome + ': HTTP ' + r.status);
  const j = await r.json();
  const itens = j.results.map((x) => ({ cod: x.cod, nome: x.asset.replace(/\s+/g, ' ').trim(), peso: num(x.part) }))
    .filter((x) => x.cod && isFinite(x.peso)).sort((a, b) => b.peso - a.peso).slice(0, topo);
  const [d, m, a] = j.header.date.split('/');
  if (itens.length < 5) throw new Error(nome + ': poucos itens');
  return { data: `${d}/${m}/20${a}`, itens };
}

(async () => {
  const [td, ibov, ifix] = await Promise.all([tesouro(), indice('IBOV', 10), indice('IFIX', 8)]);
  const dados = {
    tesouro: { data: td.data, fonte: 'Tesouro Nacional, Tesouro Transparente (taxas dos títulos ofertados pelo Tesouro Direto)', itens: td.itens },
    ibov: { data: ibov.data, fonte: 'B3, composição teórica do Ibovespa', itens: ibov.itens },
    ifix: { data: ifix.data, fonte: 'B3, composição teórica do IFIX', itens: ifix.itens }
  };
  const saida = '/* GERADO por tools/atualizar-ativos.js em ' + new Date().toISOString().slice(0, 10) + '. Não edite à mão. */\n' +
    '(function (root) {\n  \'use strict\';\n  root.MSC = root.MSC || {};\n  root.MSC.ATIVOS = ' + JSON.stringify(dados, null, 1) + ';\n' +
    '  if (typeof module === \'object\' && module.exports) module.exports = root.MSC.ATIVOS;\n})(typeof window !== \'undefined\' ? window : globalThis);\n';
  fs.writeFileSync(path.join(__dirname, '..', 'js', 'ativos.js'), saida);
  console.log('Tesouro', td.data, td.itens.length, 'títulos | IBOV', ibov.data, '| IFIX', ifix.data);
})().catch((e) => { console.error('Falhou:', e.message); process.exit(1); });
