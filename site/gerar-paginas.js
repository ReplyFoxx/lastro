/* Gera as páginas estáticas da plataforma (cabeçalho e rodapé iguais em todas).
 * Uso:  node site/gerar-paginas.js
 * Para trocar o nome da empresa, mude MARCA abaixo e rode de novo. */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const MARCA = 'Cerne';
const LEMA = 'Valor real antes do preço';
const URL_SITE = 'https://replyfoxx.github.io/lastro';
const EDICAO = '12/11/2026';
const { TRILHAS, MODULOS, REFS } = require('./aulas.js');

const NAV = [['index.html', 'Início', 'inicio'], ['ferramentas.html', 'Ferramentas', 'ferramentas'], ['aprender.html', 'Aprender', 'aprender'], ['metodo.html', 'Método', 'metodo'], ['mercado.html', 'Mercado', 'mercado'], ['empresa.html', 'A empresa', 'empresa']];

/* Marca: corte de um tronco. Os anéis são os anos; o miolo, o cerne, é o que dura. */
const aneis = (t) => `<svg class="logo" viewBox="0 0 32 32" width="${t}" height="${t}" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="13.4" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="14.4" cy="17.2" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12.9" cy="18.4" r="3.3" class="logo-miolo"/></svg>`;
const LOGO = aneis(30);

function pagina(o) {
  const nav = NAV.map(([h, n, id]) => `<a href="${h}"${id === o.id ? ' aria-current="page"' : ''}>${n}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${o.titulo}</title>
<meta name="description" content="${o.descricao}">
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#172554" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
<meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.bcb.gov.br https://olinda.bcb.gov.br; object-src 'none'; base-uri 'self'; form-action 'none'">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${MARCA}">
<meta property="og:title" content="${o.titulo}">
<meta property="og:description" content="${o.descricao}">
<meta property="og:image" content="${URL_SITE}/site/og-cerne.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="site/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="site/site.css">
<script src="carteira/js/tema.js"></script>
</head>
<body data-pagina="${o.id}">
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <div class="dentro">
    <a class="marca" href="index.html" aria-label="${MARCA}, página inicial">${LOGO}<span class="marca-nome">${MARCA}</span></a>
    <nav class="nav" aria-label="Principal">${nav}</nav>
    <div class="topo-acoes">
      <button type="button" class="btn-topo" id="btn-tema" aria-pressed="false" aria-label="Modo escuro"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button>
      <button type="button" class="btn-topo" id="btn-nav" aria-expanded="false" aria-controls="nav-movel" aria-label="Menu"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    </div>
  </div>
  <nav class="nav-movel" id="nav-movel" aria-label="Principal, celular" hidden>${nav}</nav>
</header>
<main id="conteudo">
${o.corpo}
</main>
<aside class="decida" aria-label="Orientação ao leitor"><div class="dentro">
  <p class="decida-titulo">Estude. Compare.<br><em>Decida por você.</em></p>
  <p class="decida-texto">A ${MARCA} explica e oferece ferramentas. Não diz o que comprar nem o que vender. Leia as fontes, forme a sua própria opinião e tome as suas decisões. Elas, e a responsabilidade por elas, são suas.</p>
</div></aside>
<footer class="rodape">
  <div class="dentro">
    <div class="rodape-grade">
      <div>
        <p class="rodape-marca">${aneis(26)}<span>${MARCA}</span></p>
        <p>${LEMA}. Educação financeira de base fundamentalista, para quem busca liberdade e tranquilidade com o próprio dinheiro.</p>
      </div>
      <div>
        <h2>Ferramentas</h2>
        <ul><li><a href="carteira/">Monte sua carteira</a></li><li><a href="juros.html">Juros compostos</a></li><li><a href="liberdade.html">Liberdade financeira</a></li><li><a href="roteiro.html">Checagem do estudo</a></li></ul>
      </div>
      <div>
        <h2>${MARCA}</h2>
        <ul><li><a href="metodo.html">Como estudar uma empresa</a></li><li><a href="mercado.html">Panorama de mercado</a></li><li><a href="aprender.html">Área de aprendizagem</a></li><li><a href="empresa.html">A empresa</a></li><li><a href="empresa.html#transparencia">Transparência e privacidade</a></li></ul>
      </div>
    </div>
    <p class="rodape-legal">${MARCA} é um projeto educacional. Não é corretora, gestora, consultoria nem analista de valores mobiliários, não tem registro na CVM e não vende produtos financeiros. Nada aqui é recomendação de investimento individualizada nem promessa de retorno. As decisões e os riscos são de quem investe.</p>
  </div>
</footer>
<script src="site/site.js"></script>
${(o.scripts || []).map((s) => `<script src="${s}"></script>`).join('\n')}
</body>
</html>
`;
}

const TESE = `<figure class="grafico-tese">
  <svg viewBox="0 0 520 300" role="img" aria-label="Ilustração: o preço oscila bastante em torno do valor da empresa, que cresce de forma mais lenta e estável">
    <line x1="40" y1="262" x2="500" y2="262" class="gt-eixo"/>
    ${Array.from({ length: 12 }, (_, i) => `<line x1="${(40 + i * 41.8).toFixed(1)}" y1="262" x2="${(40 + i * 41.8).toFixed(1)}" y2="${i % 3 === 0 ? 250 : 256}" class="gt-marca"/>`).join('')}
    <path class="gt-valor" d="M40,210 C150,196 260,160 360,128 S470,92 500,84"/>
    <path class="gt-preco" d="M40,188 L62,226 L84,170 L108,214 L130,238 L152,176 L176,120 L198,172 L222,206 L246,150 L270,96 L292,150 L316,184 L340,112 L362,62 L386,118 L410,150 L432,92 L456,54 L478,104 L500,70"/>
    <text x="356" y="218" class="gt-txt">valor</text>
    <text x="356" y="236" class="gt-txt-2">o que a empresa produz</text>
    <text x="150" y="58" class="gt-txt">preço</text>
    <text x="150" y="76" class="gt-txt-2">o humor do dia</text>
    <text x="40" y="284" class="gt-txt-2">tempo</text>
  </svg>
  <figcaption>Ilustração, sem dados reais. O preço se afasta do valor nas duas direções; quem estudou o negócio tem uma referência.</figcaption>
</figure>`;

const FERR = [
  ['carteira/', 'Monte sua carteira', 'Sete etapas, como a primeira conversa com um planejador: reserva, objetivos, perfil de risco e uma divisão por classes de investimento.', 'Começar'],
  ['juros.html', 'Juros compostos', 'Valor inicial, aporte, taxa e prazo. O resultado muda enquanto você digita, com o gráfico do que é aporte e do que é juro.', 'Calcular'],
  ['liberdade.html', 'Liberdade financeira', 'O seu número: quanto patrimônio sustentaria a vida que você quer e em quanto tempo você chega lá.', 'Descobrir'],
  ['roteiro.html', 'Checagem do estudo', 'Vinte pontos para conferir depois de estudar uma empresa. Mostra onde a sua análise está firme e onde falta olhar.', 'Conferir'],
  ['mercado.html', 'Panorama de mercado', 'Juros, câmbio, inflação e atividade com dados do Banco Central ao vivo, mais a leitura por setor. Cada número com fonte e data.', 'Ver']
];
const FERRAMENTAS = `<ol class="indice">${FERR.map(([h, n, d, a]) => `
  <li><a href="${h}"><span class="indice-nome">${n}</span><span class="indice-desc">${d}</span><span class="indice-ir">${a} <span aria-hidden="true">→</span></span></a></li>`).join('')}
</ol>`;

const AVISO = `<p class="aviso"><b>Conteúdo educacional</b>Não é recomendação de investimento individualizada e não substitui um profissional habilitado. Não há garantia de retorno. A decisão é de quem investe.</p>`;
const AVISO_MERCADO = `<p class="aviso"><b>Leia antes</b>As informações deste painel têm caráter informativo. Cada dado traz a data e a fonte para que você possa conferir. Avalie o cenário com os seus próprios critérios e tome as suas próprias decisões.</p>`;

/* --------------------------------------------------------------- aprender -- */
MODULOS.forEach((m) => { const ordem = MODULOS.filter((x) => x.trilha === m.trilha).indexOf(m) + 1; m.num = `${m.trilha}.${ordem}`; m.arquivo = `aula-${m.slug}.html`; });
const trilhasHtml = TRILHAS.map((t, i) => `
  <li class="trilha-bloco" id="trilha-${i + 1}">
    <div class="trilha-cab">
      <p class="trilha-rotulo"><b>${i + 1}</b>Trilha</p>
      <h2>${t.nome}</h2>
      <p>${t.resumo}</p>
      <p class="requisito"><b>Antes desta:</b> ${t.requisito}</p>
    </div>
    <ol class="modulos">${MODULOS.filter((m) => m.trilha === i + 1).map((m) => `
      <li><a href="${m.arquivo}" data-aula="${m.slug}"><span class="mod-num">${m.num}</span><span class="mod-nome">${m.nome}</span><span class="mod-estado">${m.tempo} min</span><span class="mod-desc">${m.chamada}</span></a></li>`).join('')}
    </ol>
  </li>`).join('');

function paginaAula(m, i) {
  const ant = MODULOS[i - 1], prox = MODULOS[i + 1], t = TRILHAS[m.trilha - 1];
  const refs = m.refs.map((k) => { const [txt, url] = REFS[k]; return `<li>${txt}${url ? ` Disponível em: <a href="${url}" rel="noopener noreferrer" target="_blank">${url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</a>.` : ''}</li>`; }).join('');
  const teste = m.teste.map((q, n) => `
      <fieldset class="questao" data-certa="${q.c}">
        <legend>${n + 1}. ${q.p}</legend>
        ${q.o.map((o, k) => `<label><input type="radio" name="q${n}" value="${k}"><span>${o}</span></label>`).join('')}
        <p class="retorno" hidden><b></b>${q.e}</p>
      </fieldset>`).join('');
  return { arquivo: m.arquivo, id: 'aprender', titulo: `${m.nome} — Aprender — ${MARCA}`,
    descricao: `Módulo ${m.num} da área de aprendizagem da ${MARCA}: ${m.chamada}`,
    scripts: ['site/quiz.js'],
    corpo: `<article class="secao"><div class="dentro">
  <div class="cabeca">
    <p class="olho"><a href="aprender.html">Aprender</a> · Trilha ${m.trilha}, ${t.nome} · Módulo ${m.num}</p>
    <h1 class="titulo">${m.nome}</h1>
    <p class="lead">${m.chamada}</p>
  </div>
  <dl class="aula-meta">
    <div><dt>Leitura</dt><dd>${m.tempo} minutos</dd></div>
    <div><dt>Antes deste</dt><dd>${ant ? `<a href="${ant.arquivo}">${ant.num} ${ant.nome}</a>` : 'Nenhum. É o primeiro módulo.'}</dd></div>
    <div><dt>Ao final você consegue</dt><dd>${m.objetivo}</dd></div>
  </dl>
  <div class="aula-grade">
  <nav class="aula-indice" aria-label="Neste módulo">
    <p>Neste módulo</p>
    <ol><li><a href="#frase">Em uma frase</a></li><li><a href="#explicacao">Passo a passo</a></li><li><a href="#palavras">Palavras novas</a></li><li><a href="#exemplos">Exemplos</a></li><li><a href="#erro">Erro comum</a></li><li><a href="#resumo">Resumo</a></li><li><a href="#teste">Mini-teste</a></li><li><a href="#referencias">Referências</a></li></ol>
  </nav>
  <div class="texto aula-corpo">
    <section class="frase" id="frase"><h2>Em uma frase</h2><p>${m.frase}</p></section>
    <section class="analogia"><h2>Pense assim</h2><p>${m.analogia}</p></section>
    <h2 id="explicacao">Passo a passo</h2>
    <ol class="passos-aula">${m.passos.map(([tit, html]) => `<li><h3>${tit}</h3>${html}</li>`).join('')}</ol>
    <section class="palavras" id="palavras"><h2>Palavras novas</h2><dl>${m.palavras.map(([termo, def]) => `<div><dt>${termo}</dt><dd>${def}</dd></div>`).join('')}</dl></section>
    <h2 id="exemplos">Exemplos com a conta feita</h2>
    <div class="exemplos">${m.exemplos.map(([tit, html]) => `<section class="exemplo"><h3>${tit}</h3>${html}</section>`).join('')}</div>
    <section class="erro-comum" id="erro"><h2>Erro comum</h2><p>${m.erro}</p></section>
    <section class="resumo" id="resumo"><h2>Resumo</h2><ul>${m.resumo.map((r) => `<li>${r}</li>`).join('')}</ul></section>
    <section class="teste" id="teste" data-aula="${m.slug}">
      <h2>Mini-teste</h2>
      <p>Três perguntas para fixar. A resposta aparece assim que você escolhe, e você pode tentar de novo.</p>${teste}
      <p class="teste-placar" role="status"></p>
    </section>
    <section class="referencias" id="referencias"><h2>Referências</h2><p>Confira você mesmo. As fontes abaixo sustentam os dados deste módulo.</p><ol>${refs}</ol></section>
    <nav class="aula-passos" aria-label="Módulos vizinhos">
      ${ant ? `<a href="${ant.arquivo}"><span>Anterior · ${ant.num}</span><b>${ant.nome}</b></a>` : `<a href="aprender.html"><span>Voltar</span><b>Todas as trilhas</b></a>`}
      ${prox ? `<a href="${prox.arquivo}"><span>Próximo · ${prox.num}</span><b>${prox.nome}</b></a>` : `<a href="metodo.html"><span>Depois das trilhas</span><b>Como estudar uma empresa</b></a>`}
    </nav>
  </div>
  </div>
</div></article>` };
}

/* ---------------------------------------------------------------- método -- */
const ETAPAS = [
  { nome: 'Reúna os documentos', tempo: '30 min',
    fazer: 'Escolha uma empresa só e crie uma pasta para ela. Baixe tudo antes de ler qualquer coisa, para não estudar pela notícia do dia.',
    comecar: 'Pela página de Relações com Investidores (RI) da própria empresa. O que faltar, busque na consulta de documentos da CVM.',
    fontes: ['Site de RI da empresa', 'CVM, consulta de documentos de companhias abertas', 'B3, página da empresa listada'],
    entrega: 'Uma pasta com o Formulário de Referência mais recente, as demonstrações anuais (DFP) dos últimos cinco a dez anos, o último trimestral (ITR) e a apresentação institucional.' },
  { nome: 'Entenda o negócio', tempo: '2 h',
    fazer: 'Descubra o que a empresa vende, para quem, e de onde vem cada real de receita. Ignore a cotação nesta etapa.',
    comecar: 'Pela seção "Atividades do emissor" do Formulário de Referência. Depois, a apresentação institucional.',
    fontes: ['Formulário de Referência, seção de atividades', 'Apresentação institucional', 'Nota de informações por segmento, na DFP'],
    entrega: 'Duas frases que explicam como a empresa ganha dinheiro, e uma tabela com a receita por produto, tipo de cliente e região.' },
  { nome: 'Situe a empresa no setor', tempo: '2 h',
    fazer: 'Liste os concorrentes e procure o que impede um deles de fazer o mesmo por menos: marca, escala, rede, custo ou licença.',
    comecar: 'Pelos trechos sobre concorrência e sobre regulação no Formulário de Referência. Em seguida, leia o relatório anual do maior concorrente.',
    fontes: ['Relatórios dos concorrentes listados', 'Associação do setor e agência reguladora (Aneel, ANTT, ANP, ANS, Anatel, Banco Central)', 'Pesquisas mensais do IBGE'],
    entrega: 'Um quadro com três concorrentes, comparando receita e margem em cinco anos, e uma frase sobre a vantagem da empresa, apoiada em um número desse quadro.' },
  { nome: 'Conheça quem manda', tempo: '1 h 30',
    fazer: 'Identifique o controlador, quanto ele tem da empresa, como os administradores são pagos e o que foi feito com o lucro até hoje.',
    comecar: 'Pelas seções de controle, administração e remuneração do Formulário de Referência. Depois, a carta ou o relatório do pior ano recente.',
    fontes: ['Formulário de Referência: controle, administração, remuneração e partes relacionadas', 'Atas de assembleia', 'Fatos relevantes dos últimos três anos'],
    entrega: 'Uma ficha de governança: controlador e participação, ações em circulação, a que a remuneração está atrelada, destino do lucro em cinco anos e um ponto de atenção.' },
  { nome: 'Leia dez anos de contas', tempo: '4 h',
    fazer: 'Monte uma planilha simples e preencha ano a ano. Leia as notas explicativas sempre que um número saltar.',
    comecar: 'Pela demonstração do fluxo de caixa, porque caixa é mais difícil de enfeitar. Só depois o resultado e o balanço.',
    fontes: ['DFP de cada ano, com notas explicativas', 'Comentários dos diretores, no Formulário de Referência', 'Release de resultados, para conferir ajustes'],
    entrega: 'Uma planilha com receita, lucro, caixa das operações, investimentos, dívida líquida e patrimônio, e três conclusões: se o lucro vira caixa, se a dívida cabe num ano ruim e se o resultado se repete.' },
  { nome: 'Estime o valor', tempo: '2 h',
    fazer: 'Calcule quanto a empresa vale pelo que gera, em três cenários. Use lucro ou caixa normalizado, sem os ganhos que não se repetem.',
    comecar: 'Pelo cenário pessimista. Escreva cada premissa antes de fazer a conta: crescimento, margem e taxa de desconto.',
    fontes: ['A sua planilha da etapa 5', 'Projeções divulgadas pela empresa, quando existem', 'Juro real de longo prazo, como piso de comparação'],
    entrega: 'Uma faixa de valor por ação, do pessimista ao otimista, com as premissas escritas ao lado de cada número.' },
  { nome: 'Compare com o preço e registre', tempo: '1 h',
    fazer: 'Só agora olhe a cotação. Defina a folga que você exige entre o valor estimado e o preço, maior quanto mais incerto o negócio.',
    comecar: 'Pelo raciocínio inverso: liste o que precisa ser verdade para o preço atual fazer sentido e compare com os seus cenários.',
    fontes: ['Cotação e número de ações, na B3', 'A sua faixa de valor da etapa 6'],
    entrega: 'Uma página com a tese em cinco linhas, o preço-limite que você aceita e três fatos que fariam você mudar de ideia.' },
  { nome: 'Acompanhe a tese', tempo: '1 h por trimestre',
    fazer: 'A cada resultado, confira se os fatos da sua página continuam verdadeiros. Acompanhe o negócio, e não a cotação.',
    comecar: 'Pelo release do trimestre, lido ao lado da sua página da etapa 7.',
    fontes: ['ITR e release de resultados', 'Teleconferência de resultados', 'Fatos relevantes'],
    entrega: 'Uma linha no diário a cada trimestre: tese intacta, enfraquecida ou quebrada, com o motivo.' }
];
const etapasHtml = ETAPAS.map((e, i) => `
  <li class="etapa" id="etapa-${i + 1}">
    <div class="etapa-num" aria-hidden="true">${i + 1}</div>
    <div class="etapa-corpo">
      <h2><span class="sr-only">Etapa ${i + 1}: </span>${e.nome}</h2>
      <p class="etapa-tempo">Reserve ${e.tempo}</p>
      <dl class="ficha">
        <div><dt>O que fazer</dt><dd>${e.fazer}</dd></div>
        <div><dt>Por onde começar</dt><dd>${e.comecar}</dd></div>
        <div><dt>Fontes</dt><dd><ul>${e.fontes.map((f) => `<li>${f}</li>`).join('')}</ul></dd></div>
        <div class="ficha-entrega"><dt>Entregável</dt><dd>${e.entrega}</dd></div>
      </dl>
    </div>
  </li>`).join('');

/* --------------------------------------------------------------- mercado -- */
const FORCAS = ['Juro alto', 'Dólar mais caro', 'Atividade mais fraca'];
const SETORES = [
  ['Financeiro', 'misto', 'neutro', 'pesa', 'Juro alto engorda a margem do crédito e também a inadimplência.'],
  ['Petróleo, gás e biocombustíveis', 'neutro', 'ajuda', 'neutro', 'Receita em dólar. O que manda é o preço do barril, que caiu forte na semana de 2 a 6/11.'],
  ['Materiais básicos', 'neutro', 'ajuda', 'pesa', 'Preços definidos lá fora. Alumínio a US$ 3.226 por tonelada no 3º trimestre, 23% acima de um ano antes.'],
  ['Bens industriais', 'pesa', 'misto', 'pesa', 'Dívida longa em concessões e ferrovias; exportadoras ganham com o câmbio. Veja o estudo abaixo.'],
  ['Consumo cíclico', 'pesa', 'pesa', 'pesa', 'Depende de crédito e de confiança. O emprego ainda forte amortece.'],
  ['Consumo não cíclico', 'neutro', 'misto', 'neutro', 'Demanda estável. Exportadoras de alimento ganham com o dólar; quem importa insumo perde.'],
  ['Saúde', 'pesa', 'pesa', 'neutro', 'Empresas endividadas e insumos importados; a demanda quase não varia.'],
  ['Tecnologia da informação', 'pesa', 'misto', 'pesa', 'Lucro esperado para longe vale menos quando o juro sobe.'],
  ['Comunicações', 'pesa', 'pesa', 'neutro', 'Investimento alto e equipamento importado; receita recorrente.'],
  ['Utilidade pública', 'pesa', 'neutro', 'neutro', 'Dívida longa pesa, mas parte das tarifas acompanha a inflação.']
];
const matriz = `<div class="tabela-rolagem"><table class="matriz">
  <thead><tr><th scope="col">Setor</th>${FORCAS.map((f) => `<th scope="col">${f}</th>`).join('')}<th scope="col">Por quê</th></tr></thead>
  <tbody>${SETORES.map((s) => `<tr${s[0] === 'Bens industriais' ? ' class="destaque"' : ''}><th scope="row">${s[0]}</th>${[1, 2, 3].map((k) => `<td><span class="efeito efeito-${s[k]}">${s[k]}</span></td>`).join('')}<td class="porque">${s[4]}</td></tr>`).join('')}</tbody>
</table></div>`;

const LUCROS = [
  ['Máquinas e equipamentos', 'WEG', 0.9, '+0,9%'],
  ['Aeronáutica e defesa', 'Embraer, lucro ajustado', -15.6, '−15,6%'],
  ['Concessões rodoviárias', 'Motiva, lucro ajustado', 9.8, '+9,8%'],
  ['Ônibus e carrocerias', 'Marcopolo', -43.4, '−43,4%'],
  ['Alumínio', 'CBA, com ganho que não se repete', 366, '+366%'],
  ['Ferrovias', 'Rumo', null, 'não encontrado'],
  ['Serviços terceirizados', 'GPS', null, 'não encontrado']
];
const barras = `<div class="barras" role="img" aria-label="Lucro do terceiro trimestre de 2026 contra o mesmo trimestre de 2025, por segmento de bens industriais">${LUCROS.map(([seg, emp, v, rot]) => {
  const larg = v === null ? 0 : Math.min(50, Math.abs(v));
  const estilo = v === null ? '' : (v < 0 ? `left:${50 - larg}%;width:${larg}%` : `left:50%;width:${larg}%`);
  return `<div class="barra-linha"><div class="barra-nome"><b>${seg}</b><span>${emp}</span></div><div class="barra-trilho">${v === null ? '' : `<i class="${v < 0 ? 'neg' : 'pos'}${v > 50 ? ' corta' : ''}" style="${estilo}"></i>`}</div><div class="barra-valor${v === null ? ' vazio' : ''}">${rot}</div></div>`;
}).join('')}</div>`;

const fonte = (t, u) => `<li><a href="${u}" rel="noopener noreferrer" target="_blank">${t}</a></li>`;

const paginas = [
  { arquivo: 'index.html', id: 'inicio', titulo: `${MARCA} — ${LEMA.toLowerCase()}`,
    descricao: `Educação financeira de base fundamentalista: ferramentas gratuitas para montar sua carteira, simular juros compostos e estudar empresas pelo valor real.`,
    corpo: `<section class="heroi"><div class="dentro heroi-grade">
  <div>
    <p class="olho">Educação financeira fundamentalista</p>
    <h1 class="manchete">Olhe o cerne.<br><em>O preço é a casca.</em></h1>
    <p class="lead">A ${MARCA} ensina a investir pelo que uma empresa é e produz, para que mais gente chegue à liberdade financeira com tranquilidade.</p>
    <p class="voce-decide">Aqui ninguém diz o que você deve comprar. Você aprende a estudar e decide por conta própria.</p>
    <div class="heroi-acoes"><a class="btn btn-primario" href="aprender.html">Começar a aprender</a><a class="btn btn-secundario" href="carteira/">Montar minha carteira</a></div>
  </div>
  ${TESE}
</div></section>

<section class="secao"><div class="dentro">
  <div class="cabeca"><p class="olho">Ferramentas</p><h2 class="titulo-2">Cinco ferramentas, nenhuma pede cadastro</h2><p class="lead">Tudo é calculado no seu navegador. O que você digita não sai do seu aparelho.</p></div>
  ${FERRAMENTAS}
</div></section>

<section class="secao"><div class="dentro aprender-chamada">
  <div>
    <p class="olho">Área de aprendizagem</p>
    <h2 class="titulo-2">${TRILHAS.length} trilhas, ${MODULOS.length} módulos, do zero</h2>
    <p class="lead">Economia, mercado financeiro, a cabeça do investidor, como investir sem perder o sono e planejamento. Linguagem do dia a dia, exemplos com a conta feita e a fonte de cada dado.</p>
    <p style="margin-top:1.4rem"><a class="btn btn-primario" href="aprender.html">Ver as trilhas</a></p>
  </div>
  <ol class="trilha">${TRILHAS.map((tr, i) => `<li><a href="aprender.html#trilha-${i + 1}"><span>${i + 1}</span>${tr.nome}</a></li>`).join('')}</ol>
</div></section>

<section class="secao"><div class="dentro">
  <div class="cabeca"><p class="olho">No que acreditamos</p><h2 class="titulo-2">Quatro ideias</h2></div>
  <div class="grade grade-4">
    <div class="principio"><h3 class="titulo-3">Liberdade é o objetivo</h3><p>Dinheiro é meio. O fim é escolher como usar o próprio tempo, sem depender do próximo salário nem do humor do mercado.</p></div>
    <div class="principio"><h3 class="titulo-3">Valor vem do negócio</h3><p>Uma ação é um pedaço de uma empresa. Ela vale pelo que a empresa vende, por quem a administra e pelo caixa que gera ao longo dos anos.</p></div>
    <div class="principio"><h3 class="titulo-3">Quem decide é você</h3><p>Nenhum site conhece a sua vida. O nosso papel é explicar. O seu é estudar, comparar fontes e escolher.</p></div>
    <div class="principio"><h3 class="titulo-3">Indicador é pista</h3><p>Múltiplos ajudam a fazer perguntas. Sozinhos, não dizem por que o número é aquele nem se ele vai durar.</p></div>
  </div>
</div></section>

<section class="secao"><div class="dentro metodo-chamada">
  <div>
    <p class="olho">Método</p>
    <h2 class="titulo-2">Oito etapas para estudar uma empresa</h2>
    <p class="lead">Um método opcional. Cada etapa diz por onde começar, onde pesquisar e o que você terá escrito ao terminar. O preço só entra na sétima.</p>
    <p style="margin-top:1.4rem"><a class="btn btn-secundario" href="metodo.html">Abrir o método</a></p>
  </div>
  <ol class="trilha">${ETAPAS.map((e, i) => `<li><a href="metodo.html#etapa-${i + 1}"><span>${i + 1}</span>${e.nome}</a></li>`).join('')}</ol>
</div></section>

<section class="secao"><div class="dentro estreito">${AVISO}</div></section>` },

  { arquivo: 'ferramentas.html', id: 'ferramentas', titulo: `Ferramentas — ${MARCA}`,
    descricao: `Ferramentas gratuitas da ${MARCA}: montagem de carteira, juros compostos, liberdade financeira, checagem do estudo de empresas e panorama de mercado.`,
    corpo: `<section class="secao"><div class="dentro">
  <div class="cabeca"><p class="olho">Plataforma</p>
  <h1 class="titulo">Ferramentas</h1>
  <p class="lead">Como dividir, quanto rende, quanto falta, o que conferir e como está o cenário. Gratuitas, sem cadastro, calculadas no seu navegador.</p></div>
  ${FERRAMENTAS}
  <div style="margin-top:2.5rem" class="estreito">${AVISO}</div>
</div></section>` },

  { arquivo: 'metodo.html', id: 'metodo', titulo: `Como estudar uma empresa — ${MARCA}`,
    descricao: `Método opcional da ${MARCA} para estudar uma empresa, em oito etapas na ordem de execução: o que fazer, por onde começar, quais fontes consultar e o entregável de cada uma.`,
    corpo: `<section class="secao"><div class="dentro">
  <div class="cabeca">
    <p class="olho">Método ${MARCA}</p>
    <h1 class="manchete">Como estudar<br>uma empresa</h1>
    <p class="lead">Um caminho em oito etapas, na ordem de execução, para quem quiser seguir. Cada etapa diz o que fazer, por onde começar, onde pesquisar e o que você terá escrito ao terminar.</p>
  </div>
  <div class="orientacao">
    <div><h2><span class="marca-ponto" aria-hidden="true"></span>É uma opção</h2><p>Ninguém precisa seguir este método. Use inteiro, só algumas etapas, ou como comparação para o seu próprio jeito de estudar.</p></div>
    <div><h2><span class="marca-ponto" aria-hidden="true"></span>Recomendamos as pesquisas</h2><p>Ler os documentos indicados em cada etapa dá trabalho, e é o que mais aumenta a qualidade da análise. Se for encurtar, encurte o resto.</p></div>
    <div><h2><span class="marca-ponto" aria-hidden="true"></span>A decisão é sua</h2><p>O método organiza o estudo e não aponta o que comprar. Conheça o tema, forme a sua opinião e tome as suas próprias decisões.</p></div>
  </div>
  <div class="metodo-resumo">
    <p><b>13 horas</b><span>para o primeiro estudo completo</span></p>
    <p><b>8 entregáveis</b><span>um por etapa, escritos por você</span></p>
    <p><b>Etapa 7</b><span>é quando o preço entra</span></p>
  </div>
  <nav class="trilha-nav" aria-label="Etapas do método"><ol class="trilha trilha-linha">${ETAPAS.map((e, i) => `<li><a href="#etapa-${i + 1}"><span>${i + 1}</span>${e.nome}</a></li>`).join('')}</ol></nav>
</div></section>

<section class="secao"><div class="dentro">
  <ol class="etapas">${etapasHtml}
  </ol>
</div></section>

<section class="secao"><div class="dentro">
  <div class="cabeca"><p class="olho">Antes de confiar num número</p><h2 class="titulo-2">O indicador mostra. O documento explica.</h2></div>
  <div class="tabela-rolagem"><table class="pares">
    <thead><tr><th scope="col">O que o indicador mostra</th><th scope="col">O que pode estar por trás</th><th scope="col">Onde conferir</th></tr></thead>
    <tbody>
      <tr><th scope="row">Preço baixo em relação ao lucro</th><td>Lucro que deve cair, ou ganho que não se repete</td><td>Etapa 5, notas explicativas</td></tr>
      <tr><th scope="row">Dividendo alto em relação ao preço</th><td>Pagamento extraordinário, feito uma vez</td><td>Etapa 4, destino do lucro</td></tr>
      <tr><th scope="row">Retorno alto sobre o patrimônio</th><td>Muita dívida, e não um bom negócio</td><td>Etapa 5, dívida líquida</td></tr>
      <tr><th scope="row">Lucro crescendo no ano</th><td>Venda de um ativo, e não da operação</td><td>Etapa 5, fluxo de caixa</td></tr>
    </tbody>
  </table></div>
  <p class="lead" style="margin-top:2rem">Quem terminar as etapas pode passar o estudo pela checagem de vinte pontos.</p>
  <p style="margin-top:1rem"><a class="btn btn-primario" href="roteiro.html">Conferir meu estudo</a></p>
  <div class="estreito" style="margin-top:2rem">${AVISO}</div>
</div></section>` },

  { arquivo: 'aprender.html', id: 'aprender', titulo: `Aprender — ${MARCA}`,
    descricao: `Área de aprendizagem da ${MARCA}: ${TRILHAS.length} trilhas e ${MODULOS.length} módulos de finanças pessoais e investimentos, do básico ao intermediário, com exemplos, mini-testes e fontes oficiais.`,
    scripts: ['site/quiz.js'],
    corpo: `<section class="secao"><div class="dentro">
  <div class="cabeca">
    <p class="olho">Área de aprendizagem</p>
    <h1 class="manchete">Do primeiro orçamento<br><em>à primeira carteira.</em></h1>
    <p class="lead">${TRILHAS.length} trilhas e ${MODULOS.length} módulos, na ordem em que devem ser estudados. Não é preciso saber nada antes. Cada módulo começa com a ideia em uma frase e uma comparação do dia a dia, e só depois entra nos detalhes. O objetivo é que você consiga estudar e decidir por conta própria.</p>
  </div>
  <div class="progresso" id="progresso" data-total="${MODULOS.length}">
    <p class="progresso-num"><span id="progresso-feitos">0</span><small>de ${MODULOS.length} módulos concluídos</small></p>
    <div class="trilho" aria-hidden="true"><i id="progresso-barra"></i></div>
    <p><a class="btn btn-primario" id="progresso-ir" href="${MODULOS[0].arquivo}">Começar pelo módulo 1.1</a></p>
  </div>
  <ol class="trilhas">${trilhasHtml}
  </ol>
  <div class="orientacao" style="margin-top:1rem">
    <div><h2><span class="marca-ponto" aria-hidden="true"></span>Como cada módulo funciona</h2><p>A ideia em uma frase, uma comparação do dia a dia, a explicação em passos curtos, as palavras novas, exemplos com a conta feita, o erro mais comum, um resumo e um mini-teste.</p></div>
    <div><h2><span class="marca-ponto" aria-hidden="true"></span>De onde vêm os dados</h2><p>Banco Central, CVM, B3, Tesouro Nacional, IBGE, FMI, OCDE e artigos acadêmicos revisados por pares. A lista completa fica ao fim de cada módulo.</p></div>
    <div><h2><span class="marca-ponto" aria-hidden="true"></span>O seu progresso</h2><p>Fica guardado só neste navegador. Não há cadastro e nada é enviado.</p></div>
  </div>
  </div></section>` },

  { arquivo: 'empresa.html', id: 'empresa', titulo: `A empresa — ${MARCA}`,
    descricao: `Visão, missão e princípios da ${MARCA}: liberdade e tranquilidade financeira por meio de educação fundamentalista, focada no valor real das empresas.`,
    corpo: `<section class="secao"><div class="dentro">
  <div class="cabeca"><p class="olho">A empresa</p>
  <h1 class="manchete">Liberdade financeira,<br><em>com os pés no chão.</em></h1>
  <p class="lead">A ${MARCA} nasceu de uma convicção simples: investir bem depende mais de entender o que se tem do que de adivinhar o que vai subir.</p></div>

  <div class="nome-grade">
    <div class="nome-marca" aria-hidden="true">${aneis(220)}</div>
    <div class="texto">
      <h2 style="margin-top:0">O nome</h2>
      <p>Cerne é o miolo do tronco: a madeira mais antiga, mais densa e mais resistente da árvore. A casca muda a cada estação; o cerne é o que sustenta.</p>
      <p>Numa empresa, a cotação é a casca. O cerne é o negócio: o que ela vende, quem a administra, o caixa que gera. A nossa marca é um tronco cortado. Cada anel é um ano de crescimento, do mesmo modo que os juros compostos se acumulam, e o ponto no meio é o que procuramos antes de olhar o preço.</p>
    </div>
  </div>

  <div class="dupla-frase">
    <div><p class="olho">Visão</p><p class="citacao">Um país em que mais pessoas tenham liberdade para decidir sobre o próprio tempo, e tranquilidade com as escolhas que fizeram para chegar lá.</p></div>
    <div><p class="olho">Missão</p><p class="citacao">Ensinar a investir pelo valor real das empresas, com ferramentas abertas e linguagem que qualquer pessoa entende.</p></div>
  </div>

  <div class="texto">
    <h2>Satisfação e liberdade</h2>
    <p>Falamos em liberdade financeira, e também em satisfação. Patrimônio que cresce à custa de noites mal dormidas não cumpre o papel dele. Uma boa carteira é a que você consegue manter nos anos ruins, porque entende o que há nela.</p>
    <h2>Nossos princípios</h2>
  </div>
  <div class="grade grade-3" style="margin:1rem 0 2.5rem">
    <div class="principio"><h3 class="titulo-3">Valor real</h3><p>Olhamos o negócio, a gestão e o caixa. Indicadores entram como pista, nunca como resposta.</p></div>
    <div class="principio"><h3 class="titulo-3">Prazo longo</h3><p>Valor demora a aparecer no preço. Preferimos paciência a previsão.</p></div>
    <div class="principio"><h3 class="titulo-3">Margem de segurança</h3><p>Toda estimativa erra. Só faz sentido pagar com folga.</p></div>
    <div class="principio"><h3 class="titulo-3">Simplicidade</h3><p>Se não dá para explicar em linguagem simples, não entendemos o bastante.</p></div>
    <div class="principio"><h3 class="titulo-3">Transparência</h3><p>Regras, premissas e fontes ficam abertas, com a data de cada dado.</p></div>
    <div class="principio"><h3 class="titulo-3">Independência</h3><p>Não vendemos produtos nem recebemos comissão de quem vende.</p></div>
    <div class="principio"><h3 class="titulo-3">Autonomia de quem lê</h3><p>Ensinamos a estudar. A conclusão e a decisão são de cada pessoa.</p></div>
  </div>

  <div class="dupla" style="margin-bottom:2rem">
    <div class="lista-limpa"><h3>O que fazemos</h3><ul class="sim">
      <li>Ferramentas gratuitas para planejar e estudar</li><li>Conteúdo sobre análise fundamentalista</li><li>Dados de fontes oficiais, com data e origem</li><li>Código aberto, para qualquer pessoa conferir</li></ul></div>
    <div class="lista-limpa"><h3>O que não fazemos</h3><ul class="nao">
      <li>Recomendação de compra ou venda</li><li>Gestão ou custódia de dinheiro de terceiros</li><li>Promessa de retorno</li><li>Venda de produtos, cursos pagos ou assinaturas</li></ul></div>
  </div>

  <div class="texto" id="transparencia">
    <h2>Transparência e privacidade</h2>
    <ul>
      <li>A ${MARCA} é um projeto educacional. Não é corretora, gestora, consultoria nem analista de valores mobiliários, e não tem registro na CVM.</li>
      <li>As ferramentas rodam no seu navegador. O que você digita fica no seu aparelho e não é enviado a nenhum servidor. Não há cadastro, cookies de rastreamento nem estatísticas de uso.</li>
      <li>As únicas consultas externas são leituras de dados públicos do Banco Central. Os textos do panorama de mercado trazem a data da edição e a fonte de cada informação.</li>
      <li>As premissas de cada cálculo estão descritas na própria ferramenta e na página <a href="carteira/#sobre">Sobre e metodologia</a> do roteiro de carteira.</li>
    </ul>
    ${AVISO}
  </div>
</div></section>` },

  { arquivo: 'juros.html', id: 'ferramentas', titulo: `Juros compostos — ${MARCA}`,
    descricao: `Calculadora de juros compostos da ${MARCA}: valor inicial, aporte mensal, taxa ao ano ou ao mês e prazo, com resultado em tempo real e gráfico da evolução.`,
    scripts: ['site/juros.js'],
    corpo: `<section class="secao"><div class="dentro">
  <div class="cabeca"><p class="olho"><a href="ferramentas.html">Ferramentas</a> · Calculadora</p>
  <h1 class="titulo">Juros compostos</h1>
  <p class="lead">Juros sobre juros, mês a mês. Mude qualquer campo e o resultado acompanha. Para entender a fórmula por trás da conta, veja o <a href="aula-juros-compostos.html">módulo 3.1, com exemplo guiado</a>.</p></div>
  <div class="calc-grade">
    <form class="calc-form" id="form-juros" novalidate>
      <div class="campo"><label for="j-inicial">Valor inicial</label><div class="entrada"><span>R$</span><input id="j-inicial" type="text" inputmode="decimal" autocomplete="off" value="10.000" aria-describedby="e-inicial"></div><p class="erro" id="e-inicial" hidden></p></div>
      <div class="campo"><label for="j-aporte">Aporte mensal</label><div class="entrada"><span>R$</span><input id="j-aporte" type="text" inputmode="decimal" autocomplete="off" value="500" aria-describedby="e-aporte"></div><p class="erro" id="e-aporte" hidden></p></div>
      <div class="campo"><label for="j-taxa">Taxa de juros</label><div class="entrada"><input id="j-taxa" type="text" inputmode="decimal" autocomplete="off" value="10" aria-describedby="e-taxa a-taxa"><span>%</span><select id="j-taxa-un" aria-label="Período da taxa"><option value="ano" selected>ao ano</option><option value="mes">ao mês</option></select></div><p class="erro" id="e-taxa" hidden></p><span class="ajuda" id="a-taxa"></span></div>
      <div class="campo"><label for="j-prazo">Prazo</label><div class="entrada"><input id="j-prazo" type="text" inputmode="numeric" autocomplete="off" value="20" aria-describedby="e-prazo"><select id="j-prazo-un" aria-label="Unidade do prazo"><option value="anos" selected>anos</option><option value="meses">meses</option></select></div><p class="erro" id="e-prazo" hidden></p></div>
      <div class="campo"><label for="j-inicio">Data de início <small>opcional</small></label><div class="entrada"><input id="j-inicio" type="date" min="1900-01-01" max="2200-12-31" aria-describedby="e-inicio"></div><p class="erro" id="e-inicio" hidden></p></div>
      <p class="nota">Os valores de exemplo servem só para mostrar como funciona.</p>
    </form>
    <div class="calc-saida" id="saida-juros" aria-live="polite">
      <p class="olho" id="j-rotulo">Montante final</p>
      <p class="numero-grande" id="j-montante">—</p>
      <div class="partes" id="j-partes" aria-hidden="true"><i class="parte-investido"></i><i class="parte-juros"></i></div>
      <dl class="duas-partes">
        <div><dt><i class="chave chave-investido"></i>Total investido</dt><dd id="j-investido">—</dd></div>
        <div><dt><i class="chave chave-juros"></i>Juros acumulados</dt><dd id="j-juros">—</dd></div>
      </dl>
      <p class="achado" id="j-achado"></p>
      <figure class="grafico" id="j-grafico"></figure>
      <p class="leitura" id="j-leitura" aria-hidden="true"></p>
      <details class="aula"><summary>Ver ano a ano</summary><div id="j-tabela"></div></details>
      <p class="nota">Como é calculado: o aporte entra no fim de cada mês. Taxa ao ano é convertida para a taxa mensal equivalente, (1 + taxa)^(1/12) − 1. Valores nominais, sem descontar inflação, impostos e custos. É uma simulação com taxa constante, não uma previsão.</p>
    </div>
  </div>
</div></section>` },

  { arquivo: 'liberdade.html', id: 'ferramentas', titulo: `Liberdade financeira — ${MARCA}`,
    descricao: `Calculadora de liberdade financeira da ${MARCA}: descubra o seu número-alvo e em quanto tempo você chega lá.`,
    scripts: ['site/liberdade.js'],
    corpo: `<section class="secao"><div class="dentro">
  <div class="cabeca"><p class="olho"><a href="ferramentas.html">Ferramentas</a> · Calculadora</p>
  <h1 class="titulo">Liberdade financeira</h1>
  <p class="lead">Quanto patrimônio sustentaria a vida que você quer, e em quanto tempo você chega lá. Tudo em reais de hoje.</p></div>
  <div class="calc-grade">
    <form class="calc-form" id="form-liberdade" novalidate>
      <div class="campo"><label for="gasto">Quanto você quer gastar por mês</label><span class="ajuda">O padrão de vida que quer sustentar sem depender de trabalho.</span><div class="entrada"><span>R$</span><input id="gasto" type="text" inputmode="decimal" autocomplete="off" value="6.000"></div></div>
      <div class="campo"><label for="patrimonio">Quanto já tem investido</label><div class="entrada"><span>R$</span><input id="patrimonio" type="text" inputmode="decimal" autocomplete="off" value="50.000"></div></div>
      <div class="campo"><label for="aporte">Quanto investe por mês</label><div class="entrada"><span>R$</span><input id="aporte" type="text" inputmode="decimal" autocomplete="off" value="1.500"></div></div>
      <div class="campo"><label for="retorno">Retorno real, acima da inflação</label><span class="ajuda">Hipótese. Quanto maior, mais risco é preciso correr para tentar obtê-lo.</span><div class="entrada"><select id="retorno"><option value="2">2% ao ano (cauteloso)</option><option value="3">3% ao ano</option><option value="4" selected>4% ao ano</option><option value="5">5% ao ano</option><option value="6">6% ao ano (otimista)</option></select></div></div>
      <div class="campo"><label for="retirada">Taxa de retirada</label><span class="ajuda">Quanto do patrimônio você usaria por ano. Menor é mais seguro.</span><div class="entrada"><select id="retirada"><option value="3">3% ao ano (mais seguro)</option><option value="3.5">3,5% ao ano</option><option value="4" selected>4% ao ano (regra prática comum)</option></select></div></div>
      <p class="erro" id="erro-liberdade" role="alert" hidden></p>
      <button type="submit" class="btn btn-primario">Calcular</button>
      <p class="nota" style="margin-top:1rem">Os valores de exemplo são só para mostrar como funciona. Troque pelos seus.</p>
    </form>
    <div class="calc-saida" id="saida-liberdade" aria-live="polite"></div>
  </div>
</div></section>` },

  { arquivo: 'roteiro.html', id: 'ferramentas', titulo: `Checagem do estudo — ${MARCA}`,
    descricao: `Checagem da ${MARCA}: vinte pontos para conferir o seu estudo de uma empresa, pelo negócio, pela vantagem, pelas pessoas, pelas contas e pelo preço.`,
    scripts: ['site/checklist.js'],
    corpo: `<section class="secao"><div class="dentro">
  <div class="cabeca"><p class="olho"><a href="ferramentas.html">Ferramentas</a> · Análise</p>
  <h1 class="titulo">Checagem do estudo</h1>
  <p class="lead">Para usar depois das oito etapas do <a href="metodo.html">método</a>. Vinte pontos que mostram onde o seu estudo está firme e onde falta olhar. Não diz se você deve comprar.</p></div>
  <div class="campo estreito" style="margin:0 0 2rem"><label for="empresa">Empresa que você está estudando</label><span class="ajuda">Opcional. Fica salvo só neste navegador.</span><div class="entrada"><input id="empresa" type="text" maxlength="60" autocomplete="off"></div></div>
  <div class="roteiro-grade">
    <div id="perguntas"></div>
    <aside class="cartao fixo" id="saida-roteiro" aria-live="polite"></aside>
  </div>
</div></section>` },

  { arquivo: 'mercado.html', id: 'mercado', titulo: `Panorama de mercado — ${MARCA}`,
    descricao: `Panorama de mercado da ${MARCA}: visão geral, tendências com dados do Banco Central ao vivo, indicadores macroeconômicos e leitura por setor, com fonte e data.`,
    scripts: ['carteira/js/config.js', 'carteira/js/macro.js', 'site/mercado.js'],
    corpo: `<section class="secao"><div class="dentro">
  <div class="cabeca">
    <p class="olho">Panorama de mercado · edição de ${EDICAO}</p>
    <h1 class="manchete">O juro parou de cair.<br><em>O resto ainda se ajusta.</em></h1>
  </div>
  <div style="margin:0 0 2.4rem">${AVISO_MERCADO}</div>
  <div class="visao">
    <p class="visao-texto">Em 04/11 o Banco Central manteve a Selic em 13,75% ao ano e interrompeu uma sequência de cinco cortes, citando piora do cenário interno e externo. A bolsa vinha da pior semana em seis anos, na última de outubro, com a reavaliação de preços depois das eleições e a dúvida sobre as contas públicas; a semana seguinte foi de estabilidade. A indústria encolheu 0,8% em setembro, quarta queda em cinco meses, enquanto o desemprego ficou em 5,2%, o menor para o período desde 2012.</p>
    <ul class="visao-fontes">
      <li>Copom, decisão de 04/11/2026, via <a href="https://www.oliberal.com/economia/bc-copom-interrompe-ciclo-de-calibracao-e-mantem-taxa-selic-em-13-75-ao-ano-1.1190560" rel="noopener noreferrer" target="_blank">Estadão / O Liberal</a></li>
      <li>Bolsa, semana até 30/10/2026, <a href="https://diariodocomercio.com.br/financas/ibovespa-tem-pior-semana-om-pressao-externa-e-fiscal/" rel="noopener noreferrer" target="_blank">Diário do Comércio</a>; semana de 2 a 6/11, <a href="https://analisa.genialinvestimentos.com.br/macro-strategy/analises/expresso-bolsa-semanal-petroleo-techs-fiscal" rel="noopener noreferrer" target="_blank">Genial</a></li>
      <li>Indústria, IBGE, divulgado em 05/11/2026, via <a href="https://www.jornaldocomercio.com/economia/2026/11/1269381-producao-industrial-cai-08-em-setembro-ante-agosto-revela-ibge.html" rel="noopener noreferrer" target="_blank">Jornal do Comércio</a></li>
      <li>Desemprego, IBGE, divulgado em 30/10/2026, via <a href="https://agenciagov.ebc.com.br/noticias/202610/taxa-de-desemprego-tem-queda-e-alcanca-menor-resultado-para-setembro-em-14-anos" rel="noopener noreferrer" target="_blank">Agência Gov</a></li>
    </ul>
  </div>
</div></section>

<section class="secao"><div class="dentro">
  <div class="cabeca"><p class="olho">Tendências</p><h2 class="titulo-2">Quatro séries, lidas agora no Banco Central</h2><p class="lead">Os números abaixo são buscados ao abrir a página. Cada um traz a data do último dado.</p></div>
  <div class="tendencias" id="tendencias"><p role="status">Buscando séries no Banco Central…</p></div>
</div></section>

<section class="secao"><div class="dentro">
  <div class="cabeca"><p class="olho">Indicadores macroeconômicos</p><h2 class="titulo-2">Hoje e o que o mercado espera</h2></div>
  <div id="macro"><p role="status">Buscando dados no Banco Central…</p></div>
</div></section>

<section class="secao"><div class="dentro">
  <div class="cabeca"><p class="olho">Leitura por setor</p><h2 class="titulo-2">Como três forças do momento atingem cada setor</h2><p class="lead">Opinião da ${MARCA}, edição de ${EDICAO}. É um mapa de sensibilidade, e não uma previsão. Dentro de cada setor, as empresas reagem de formas diferentes.</p></div>
  ${matriz}
  <p class="nota" style="margin-top:.8rem">Setores conforme a classificação da B3. Dado do petróleo: Genial, semana de 2 a 6/11/2026. Dado do alumínio: preço médio na LME no 3º trimestre de 2026, citado no resultado da CBA de 04/11/2026.</p>
</div></section>

<section class="secao" id="industriais"><div class="dentro">
  <div class="cabeca"><p class="olho">Setor em foco · pesquisa semanal de ${EDICAO}</p><h2 class="titulo-2">Bens industriais: o trimestre separou quem deve de quem exporta</h2><p class="lead">Resultados do 3º trimestre de 2026 das maiores empresas do setor, divulgados entre 21/10 e 10/11. Os nomes das empresas aparecem como origem do dado. Não há indicação de compra ou venda de nenhuma delas.</p></div>
  <div class="foco-grade">
    <figure class="foco-grafico">
      <figcaption><b>Lucro do 3º trimestre de 2026</b> contra o mesmo trimestre de 2025</figcaption>
      ${barras}
      <p class="nota">A barra do alumínio está cortada. Sem o ganho que não se repete, a alta seria de cerca de 128% (calculado: 301 ÷ 132 − 1, em R$ milhões). Ferrovias e serviços: resultado não encontrado até ${EDICAO}.</p>
    </figure>
    <ol class="leituras">
      <li><h3>Juro alto cobra de quem tem dívida longa</h3><p>A maior concessionária de rodovias lucrou mais que o esperado em 28/10, com dívida líquida de 3,2 vezes o Ebitda, e mesmo assim as ações caíram quase 30% depois de 26/10. Na ferrovia, o volume do 2º trimestre subiu 9,1% e a alavancagem foi de 1,8 para 2,1 vezes.</p></li>
      <li><h3>Vender para fora ajuda, mas o câmbio decide a margem</h3><p>Em máquinas e equipamentos, o exterior chegou a 62,5% da receita, um recorde, e a margem Ebitda de 21,6% foi a menor desde o início de 2025. Em ônibus, a receita internacional caiu 21,4% e o lucro, 43,4%. Esses números são de julho a setembro, antes da alta recente do dólar.</p></li>
      <li><h3>Carteira de pedidos longa dá visibilidade</h3><p>Na aeronáutica, os pedidos em carteira somaram US$ 35,7 bilhões, recorde, com defesa em alta de 56%. O lucro ajustado caiu 15,6% por causa do resultado financeiro, e a projeção de caixa para o ano subiu.</p></li>
      <li><h3>Lucro recorde pede leitura das notas</h3><p>Dois resultados do trimestre foram inflados por ganhos únicos: R$ 2,72 bilhões com a venda de aeroportos, nas concessões, e R$ 315 milhões com a quitação de uma obrigação, no alumínio. É o caso da etapa 5 do <a href="metodo.html#etapa-5">método</a>.</p></li>
    </ol>
  </div>
  <div class="agenda">
    <p><b>Mudanças de controle</b>O controle da produtora de alumínio foi vendido em 29/01/2026 a uma associação de grupos chinês e anglo-australiano; a oferta aos demais acionistas ainda não foi lançada.</p>
    <p><b>Projeções revistas</b>Em autopeças, a projeção de receita de 2026 foi cortada em 20/10, por câmbio, abastecimento e mercado argentino.</p>
    <p><b>Atividade</b>A produção nacional de carrocerias de ônibus caiu 7,1% no 3º trimestre, segundo a Fabus.</p>
  </div>
  <details class="aula" style="margin-top:1.5rem"><summary>Limites e fontes deste estudo</summary><div>
    <p>Pesquisa semanal de Bens Industriais da B3, edição de ${EDICAO}, com fontes acessadas nessa data. O estudo cobre oito empresas com valor de mercado acima de R$ 4 bilhões. Os números vêm de sites que citam a CVM e da imprensa, e não dos documentos originais. Onde as fontes divergem, usamos o dado da própria empresa. Resultados de ferrovias e de serviços terceirizados do 3º trimestre não foram encontrados.</p>
    <ul class="fontes">
      ${fonte('WEG, 3º trimestre (Cenário Energia, 21/10/2026)', 'https://cenarioenergia.com.br/2026/10/21/weg-lucra-r-167-bilhao-no-3t26-mas-margem-ebitda-recua/')}
      ${fonte('Embraer, carteira de pedidos (Acionista, 23/10/2026)', 'https://acionista.com.br/embraer-embj3-registra-carteira-de-pedidos-recorde-de-us357-bilhoes-no-3t26/')}
      ${fonte('Embraer, lucro ajustado (Investidor10, 11/2026)', 'https://investidor10.com.br/noticias/embraer-embj3-lucro-ajustado-cai-15-6-no-3t26-para-r-379-8-milhoes-123795/')}
      ${fonte('Motiva, 3º trimestre (Seu Dinheiro, 29/10/2026)', 'https://www.seudinheiro.com/2026/economia/lucro-cresce-caixa-surpreende-citi-volta-recomendar-compra-para-motiva-motv3-mlem/')}
      ${fonte('Motiva, venda de aeroportos (DGABC, 10/2026)', 'https://www.dgabc.com.br/Noticia/4365621/motiva-tem-lucro-liquido-ajustado-consolidado-de-r-750-mi-no-3-trimestre-alta-de-9-8')}
      ${fonte('Rumo, 2º trimestre (Análise de Ações, 2026)', 'https://www.analisedeacoes.com/noticias/rumo-rail3-registra-lucro-de-688-milhoes-/')}
      ${fonte('Marcopolo, 3º trimestre (Jornal do Comércio, 04/11/2026)', 'https://www.jornaldocomercio.com/economia/2026/11/1269285-marcopolo-tem-lucro-434-menor-no-3tri26-ante-3tri25-de-rs-1865-milhoes.html')}
      ${fonte('CBA, 3º trimestre (DGABC, 04/11/2026)', 'https://www.dgabc.com.br/Noticia/4366913/cba-tem-lucro-recorde-de-r-616-milhoes-no-3-trimestre-alta-de-366')}
      ${fonte('CBA, venda de controle (Times Brasil, 30/01/2026)', 'https://timesbrasil.com.br/empresas-e-negocios/votorantim-vende-cba-rio-tinto-chinalco/')}
      ${fonte('Frasle, projeção de 2026 (brapi, 20/10/2026)', 'https://brapi.dev/news/frasle-corta-previsao-de-receita-de-2026-para-faixa-de-r-5-e2e1fb6f')}
      ${fonte('Lista do setor (Investidor10, 12/11/2026)', 'https://investidor10.com.br/setores/bens-industriais/')}
    </ul></div></details>
  <div class="estreito" style="margin:2rem 0 0">${AVISO_MERCADO}</div>
</div></section>` }
];

MODULOS.forEach((m, i) => paginas.push(paginaAula(m, i)));
paginas.forEach((p) => fs.writeFileSync(path.join(RAIZ, p.arquivo), pagina(p)));
fs.writeFileSync(path.join(__dirname, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><style>.f{fill:#FFFFFF}.a{stroke:#172554}@media (prefers-color-scheme:dark){.f{fill:#172554}.a{stroke:#8EDBC0}}</style><rect class="f" width="32" height="32" rx="7"/><circle class="a" cx="16" cy="16" r="11.5" fill="none" stroke-width="2.8"/><circle class="a" cx="14.6" cy="17" r="6.3" fill="none" stroke-width="2.8"/><circle fill="#FFB38A" cx="13.6" cy="17.9" r="2.6"/></svg>\n`);
console.log(paginas.length + ' páginas geradas.');
