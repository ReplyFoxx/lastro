/* Gera as páginas estáticas da plataforma (cabeçalho e rodapé iguais em todas).
 * Uso:  node site/gerar-paginas.js
 * Para trocar o nome da empresa, mude MARCA abaixo e rode de novo. */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const MARCA = 'Lastro';
const LEMA = 'Valor real antes do preço';
const URL_SITE = 'https://replyfoxx.github.io/lastro';

const NAV = [['index.html', 'Início', 'inicio'], ['ferramentas.html', 'Ferramentas', 'ferramentas'], ['metodo.html', 'Método', 'metodo'], ['aprender.html', 'Aprender', 'aprender'], ['empresa.html', 'A empresa', 'empresa']];
const LOGO = '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false"><rect x="3" y="22" width="26" height="6" rx="2" fill="#1F5D50"/><rect x="7" y="14" width="18" height="6" rx="2" fill="#B07E1A"/><rect x="11" y="6" width="10" height="6" rx="2" fill="#BF4F3C"/></svg>';

function pagina(o) {
  const nav = NAV.map(([h, n, id]) => `<a href="${h}"${id === o.id ? ' aria-current="page"' : ''}>${n}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${o.titulo}</title>
<meta name="description" content="${o.descricao}">
<meta name="theme-color" content="#F4F0E6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#111614" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
<meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.bcb.gov.br https://olinda.bcb.gov.br; object-src 'none'; base-uri 'self'; form-action 'none'">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${MARCA}">
<meta property="og:title" content="${o.titulo}">
<meta property="og:description" content="${o.descricao}">
<meta property="og:image" content="${URL_SITE}/site/og-lastro.png">
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
<footer class="rodape">
  <div class="dentro">
    <div class="rodape-grade">
      <div>
        <p style="font-family:var(--serif);font-size:1.25rem;color:var(--ink);margin-bottom:.3rem">${MARCA}</p>
        <p>${LEMA}. Educação financeira de base fundamentalista, para quem busca liberdade e tranquilidade com o próprio dinheiro.</p>
      </div>
      <div>
        <h2>Ferramentas</h2>
        <ul><li><a href="carteira/">Monte sua carteira</a></li><li><a href="liberdade.html">Liberdade financeira</a></li><li><a href="roteiro.html">Roteiro de análise</a></li><li><a href="mercado.html">Painel de mercado</a></li></ul>
      </div>
      <div>
        <h2>${MARCA}</h2>
        <ul><li><a href="empresa.html">A empresa</a></li><li><a href="metodo.html">Nosso método</a></li><li><a href="aprender.html">Aprender</a></li><li><a href="empresa.html#transparencia">Transparência e privacidade</a></li></ul>
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
    ${Array.from({ length: 12 }, (_, i) => `<line x1="${40 + i * 41.8}" y1="262" x2="${40 + i * 41.8}" y2="${i % 3 === 0 ? 250 : 256}" class="gt-marca"/>`).join('')}
    <path class="gt-valor" d="M40,210 C150,196 260,160 360,128 S470,92 500,84"/>
    <path class="gt-preco" d="M40,188 L62,226 L84,170 L108,214 L130,238 L152,176 L176,120 L198,172 L222,206 L246,150 L270,96 L292,150 L316,184 L340,112 L362,62 L386,118 L410,150 L432,92 L456,54 L478,104 L500,70"/>
    <text x="356" y="218" class="gt-txt">valor</text>
    <text x="356" y="236" class="gt-txt-2">o que a empresa produz</text>
    <text x="150" y="58" class="gt-txt">preço</text>
    <text x="150" y="76" class="gt-txt-2">o humor do dia</text>
    <text x="40" y="284" class="gt-txt-2">tempo</text>
  </svg>
  <figcaption>Ilustração, sem dados reais. No curto prazo o preço se afasta do valor nas duas direções; quem estuda o negócio tem uma referência para não se assustar nem se empolgar.</figcaption>
</figure>`;

const FERRAMENTAS = `<div class="grade grade-2">
  <a class="ferramenta" href="carteira/"><span class="etiqueta">Principal</span><h3 class="titulo-3">Monte sua carteira</h3><p>Um roteiro em sete etapas, como a primeira conversa com um planejador: reserva, objetivos, perfil de risco e uma carteira por classes, com exemplos de fontes oficiais.</p><span class="seguir">Começar o roteiro →</span></a>
  <a class="ferramenta" href="liberdade.html"><span class="etiqueta">Calculadora</span><h3 class="titulo-3">Liberdade financeira</h3><p>Descubra o seu número: quanto patrimônio sustentaria o seu padrão de vida e em quanto tempo você chega lá com o que aporta hoje.</p><span class="seguir">Calcular meu número →</span></a>
  <a class="ferramenta" href="roteiro.html"><span class="etiqueta">Análise</span><h3 class="titulo-3">Roteiro de análise de empresa</h3><p>Vinte perguntas sobre o negócio, a vantagem, as pessoas, as contas e o preço. Mostra onde o seu estudo está firme e onde ainda falta olhar.</p><span class="seguir">Estudar uma empresa →</span></a>
  <a class="ferramenta" href="mercado.html"><span class="etiqueta">Dados</span><h3 class="titulo-3">Painel de mercado</h3><p>Juros, inflação e expectativas do Banco Central, taxas do Tesouro Direto e as maiores empresas e fundos dos índices da B3, sempre com fonte e data.</p><span class="seguir">Ver os números →</span></a>
</div>`;

const AVISO = `<p class="aviso">Conteúdo educacional. Não é recomendação de investimento individualizada e não substitui um profissional habilitado. Não há garantia de retorno.</p>`;

const paginas = [
  { arquivo: 'index.html', id: 'inicio', titulo: `${MARCA} — ${LEMA.toLowerCase()}`,
    descricao: 'Educação financeira de base fundamentalista: ferramentas gratuitas para montar sua carteira, calcular sua liberdade financeira e estudar empresas pelo valor real.',
    corpo: `<section class="heroi"><div class="dentro heroi-grade">
  <div>
    <p class="olho">Educação financeira fundamentalista</p>
    <h1 class="titulo">Valor real antes do preço.</h1>
    <p class="lead">A ${MARCA} existe para que mais pessoas alcancem liberdade financeira com tranquilidade. Olhamos para o que uma empresa é e produz, e não só para o que os indicadores do dia dizem sobre ela.</p>
    <div class="heroi-acoes"><a class="btn btn-primario" href="carteira/">Montar minha carteira</a><a class="btn btn-secundario" href="metodo.html">Conhecer o método</a></div>
  </div>
  ${TESE}
</div></section>

<section class="secao"><div class="dentro">
  <p class="olho">No que acreditamos</p>
  <h2 class="titulo-2">Três ideias que guiam tudo aqui</h2>
  <div class="grade grade-3" style="margin-top:1.5rem">
    <div class="principio"><h3 class="titulo-3">Liberdade é o objetivo</h3><p>Dinheiro é meio. O fim é poder escolher como usar o próprio tempo, sem depender do próximo salário nem do humor do mercado.</p></div>
    <div class="principio"><h3 class="titulo-3">Valor vem do negócio</h3><p>Uma ação é um pedaço de uma empresa. O que ela vale depende do que a empresa vende, de quem a administra e do caixa que ela gera ao longo dos anos.</p></div>
    <div class="principio"><h3 class="titulo-3">Indicador é pista, não resposta</h3><p>Múltiplos e índices ajudam a fazer perguntas. Sozinhos, não dizem por que o número é aquele nem se ele vai durar.</p></div>
  </div>
</div></section>

<section class="secao"><div class="dentro">
  <p class="olho">Plataforma</p>
  <h2 class="titulo-2">Ferramentas gratuitas, sem cadastro</h2>
  <p class="lead" style="margin-bottom:1.5rem">Tudo roda no seu navegador. Suas respostas não são enviadas a nenhum servidor.</p>
  ${FERRAMENTAS}
</div></section>

<section class="secao"><div class="dentro">
  <p class="olho">Nosso método</p>
  <h2 class="titulo-2">Cinco perguntas, nesta ordem</h2>
  <div class="grade grade-2" style="margin-top:1.5rem;align-items:start">
    <ol class="passos">
      <li><strong>O negócio</strong><span>Como a empresa ganha dinheiro e por que os clientes voltam.</span></li>
      <li><strong>A vantagem</strong><span>O que impede um concorrente de fazer o mesmo.</span></li>
      <li><strong>As pessoas</strong><span>Quem administra e como trata o dinheiro dos sócios.</span></li>
      <li><strong>As contas</strong><span>Caixa, dívida e consistência ao longo de muitos anos.</span></li>
      <li><strong>O preço</strong><span>Só no fim: quanto vale, quanto custa e qual a folga entre os dois.</span></li>
    </ol>
    <div>
      <blockquote class="citacao">O preço é o que aparece na tela. O valor é o que sobra quando a tela desliga.</blockquote>
      <p style="margin-top:1.2rem"><a class="btn btn-secundario" href="metodo.html">Ler o método completo</a></p>
    </div>
  </div>
</div></section>

<section class="secao"><div class="dentro estreito">${AVISO}</div></section>` },

  { arquivo: 'ferramentas.html', id: 'ferramentas', titulo: `Ferramentas — ${MARCA}`,
    descricao: 'Ferramentas gratuitas da Lastro: montagem de carteira, calculadora de liberdade financeira, roteiro de análise de empresas e painel de mercado.',
    corpo: `<section class="secao"><div class="dentro">
  <p class="olho">Plataforma</p>
  <h1 class="titulo">Ferramentas</h1>
  <p class="lead" style="margin-bottom:2rem">Quatro ferramentas para as quatro perguntas de quem investe: como dividir, quanto falta, o que estudar e como está o cenário. Gratuitas, sem cadastro, com tudo calculado no seu navegador.</p>
  ${FERRAMENTAS}
  <div style="margin-top:2rem" class="estreito">${AVISO}</div>
</div></section>` },

  { arquivo: 'metodo.html', id: 'metodo', titulo: `Nosso método — ${MARCA}`,
    descricao: 'Como a Lastro olha para investimentos: análise fundamentalista focada no valor real do negócio, com indicadores como pista e não como resposta.',
    corpo: `<section class="secao"><div class="dentro">
  <p class="olho">Nosso método</p>
  <h1 class="titulo">Primeiro o negócio.<br>Depois os números.<br>Por último o preço.</h1>
  <p class="lead">Somos fundamentalistas. Isso quer dizer tratar cada ação como parte de uma empresa de verdade, e estudar essa empresa antes de olhar a cotação.</p>
  <div class="regua" style="margin-top:2rem" aria-hidden="true"></div>
  <div class="texto">
    <h2>Por que indicadores sozinhos não bastam</h2>
    <p>Indicadores são úteis: resumem em um número o que levaria horas para ler. O problema é parar neles. Um indicador mostra o que aconteceu, mas não explica por quê, nem se vai continuar.</p>
    <div class="dupla" style="margin:1.2rem 0">
      <div class="cartao"><h3>O que o indicador mostra</h3><ul>
        <li>Preço baixo em relação ao lucro</li><li>Dividendo alto em relação ao preço</li><li>Retorno alto sobre o patrimônio</li><li>Lucro crescendo no último ano</li></ul></div>
      <div class="cartao"><h3>O que pode estar por trás</h3><ul>
        <li>Lucro que o mercado espera ver cair</li><li>Pagamento único, que não se repete</li><li>Muita dívida, e não um bom negócio</li><li>Venda de um ativo, e não da operação</li></ul></div>
    </div>
    <p>Por isso usamos os indicadores para fazer perguntas, e os relatórios, a história e o setor da empresa para respondê-las.</p>

    <h2>As cinco perguntas</h2>
    <h3>1. O negócio</h3>
    <p>O que a empresa vende, para quem, e por que o cliente volta. Se não dá para explicar em duas frases, ainda não dá para avaliar. Preferimos negócios simples de entender a histórias complicadas que parecem promissoras.</p>
    <h3>2. A vantagem</h3>
    <p>O que impede um concorrente de fazer igual e mais barato: marca, escala, rede de clientes, custo, licença. Sem alguma proteção, lucro alto atrai concorrência e tende a encolher.</p>
    <h3>3. As pessoas</h3>
    <p>Quem administra, quanto tem do próprio patrimônio na empresa, como usou o lucro no passado e como trata os sócios minoritários. Bons números com má governança costumam durar pouco.</p>
    <h3>4. As contas</h3>
    <p>Aqui entram os indicadores, como consequência do que veio antes. Olhamos se o lucro vira caixa, se a dívida cabe com folga num ano ruim e se os resultados se repetem por cinco a dez anos, incluindo crises.</p>
    <h3>5. O preço</h3>
    <p>Só então comparamos o que a empresa vale com o que ela custa. Toda estimativa de valor tem erro; por isso só faz sentido pagar com folga em relação à estimativa. Essa folga é a margem de segurança.</p>

    <h2>O que isso muda na prática</h2>
    <ul>
      <li><strong>Menos movimento.</strong> Quem conhece o negócio não precisa reagir a cada oscilação.</li>
      <li><strong>Prazo longo.</strong> Valor leva anos para aparecer no preço. Dinheiro com data marcada não vai para ações.</li>
      <li><strong>Reserva antes de tudo.</strong> Sem reserva de emergência, qualquer imprevisto obriga a vender na hora errada.</li>
      <li><strong>Diversificação com critério.</strong> Poucas coisas bem entendidas valem mais do que muitas que ninguém estudou, mas nenhuma certeza justifica concentrar tudo.</li>
      <li><strong>Humildade.</strong> Análise reduz o risco de errar, não elimina. Empresas boas também decepcionam.</li>
    </ul>
    <p style="margin-top:1.5rem"><a class="btn btn-primario" href="roteiro.html">Aplicar o método a uma empresa</a></p>
    ${AVISO}
  </div>
</div></section>` },

  { arquivo: 'aprender.html', id: 'aprender', titulo: `Aprender — ${MARCA}`,
    descricao: 'Lições curtas da Lastro sobre preço e valor, margem de segurança, juros compostos, reserva de emergência, renda fixa e diversificação.',
    corpo: `<section class="secao"><div class="dentro">
  <p class="olho">Aprender</p>
  <h1 class="titulo">Sete lições curtas</h1>
  <p class="lead" style="margin-bottom:1.5rem">O essencial para investir com calma, em linguagem simples. Cada uma leva dois minutos.</p>
  <div class="estreito" style="margin:0">
    <details class="aula" open><summary>1. Preço e valor não são a mesma coisa</summary><div>
      <p>Preço é quanto alguém pagou pela última ação negociada. Valor é quanto a empresa vale pelo que produz e vai produzir. O preço muda a cada segundo; o valor muda devagar, conforme o negócio melhora ou piora.</p>
      <p>No curto prazo os dois se afastam bastante, para cima e para baixo. Quem só olha o preço compra quando está caro, porque subiu, e vende quando está barato, porque caiu.</p></div></details>
    <details class="aula"><summary>2. Por que indicadores sozinhos enganam</summary><div>
      <p>Um indicador é uma fotografia. Uma empresa com lucro alto por ter vendido um prédio parece barata, mas esse lucro não volta no ano seguinte. Uma empresa com retorno alto sobre o patrimônio pode estar apenas muito endividada.</p>
      <p>Use o indicador para escolher o que estudar, e os relatórios da empresa para entender o motivo do número.</p></div></details>
    <details class="aula"><summary>3. Margem de segurança</summary><div>
      <p>Ninguém sabe exatamente quanto uma empresa vale. Toda conta depende de hipóteses sobre o futuro, e hipóteses falham. Margem de segurança é pagar bem menos do que a sua estimativa, para que um erro de cálculo não vire prejuízo.</p>
      <p>Quanto mais incerto o negócio, maior deve ser a folga. Se não há folga, a decisão mais simples é esperar.</p></div></details>
    <details class="aula"><summary>4. Juros compostos e o tempo</summary><div>
      <p>Juros compostos são juros sobre juros: o rendimento de um ano passa a render no ano seguinte. No início o efeito é pequeno e parece que nada acontece. Depois de muitos anos, a maior parte do patrimônio vem do rendimento acumulado, e não do que foi aportado.</p>
      <p>Por isso começar cedo e não interromper importa mais do que acertar o melhor investimento. Veja o efeito na <a href="liberdade.html">calculadora de liberdade financeira</a>.</p></div></details>
    <details class="aula"><summary>5. Reserva de emergência vem antes</summary><div>
      <p>Reserva é dinheiro para imprevistos, em aplicação de baixo risco e resgate imediato. A referência usual é de seis meses de despesas, ou doze se a renda for instável.</p>
      <p>Sem reserva, um imprevisto obriga a vender investimentos na pior hora ou a tomar dívida cara. Dívida cara, aliás, deve ser quitada antes de investir: dificilmente algum investimento rende mais do que os juros do cartão.</p></div></details>
    <details class="aula"><summary>6. Renda fixa também oscila</summary><div>
      <p>Renda fixa quer dizer que a regra de rendimento é combinada na compra, e não que o preço fica parado. Um título prefixado ou atrelado à inflação perde valor de mercado quando os juros sobem, e ganha quando caem.</p>
      <p>Quem leva o título até o vencimento recebe o combinado. Quem vende antes recebe o preço do dia. Por isso o prazo do título deve combinar com o prazo do objetivo.</p></div></details>
    <details class="aula"><summary>7. Diversificar sem se perder</summary><div>
      <p>Diversificar é não depender de uma coisa só: uma empresa, um setor, um país, um tipo de investimento. Funciona porque coisas diferentes costumam ir mal em momentos diferentes.</p>
      <p>Mas ter quarenta ações que ninguém estudou não é diversificar, é desistir de entender. O equilíbrio está em dividir entre classes e, dentro de cada uma, ter o que você consegue acompanhar. A ferramenta <a href="carteira/">Monte sua carteira</a> faz essa divisão por classes.</p></div></details>
  </div>
  <div class="estreito" style="margin:2rem 0 0">${AVISO}</div>
</div></section>` },

  { arquivo: 'empresa.html', id: 'empresa', titulo: `A empresa — ${MARCA}`,
    descricao: 'Visão, missão e princípios da Lastro: liberdade e tranquilidade financeira por meio de educação fundamentalista, focada no valor real das empresas.',
    corpo: `<section class="secao"><div class="dentro">
  <p class="olho">A empresa</p>
  <h1 class="titulo">Liberdade financeira, com os pés no chão.</h1>
  <p class="lead">A ${MARCA} nasceu de uma convicção simples: investir bem depende mais de entender o que se tem do que de adivinhar o que vai subir.</p>
  <div class="regua" style="margin-top:2rem" aria-hidden="true"></div>

  <div class="grade grade-2" style="margin:1rem 0 2.5rem">
    <div class="cartao"><p class="olho">Visão</p><p class="citacao" style="font-size:1.35rem">Um país em que mais pessoas tenham liberdade para decidir sobre o próprio tempo, e tranquilidade com as escolhas que fizeram para chegar lá.</p></div>
    <div class="cartao"><p class="olho">Missão</p><p class="citacao" style="font-size:1.35rem">Ensinar a investir pelo valor real das empresas, com ferramentas abertas e linguagem que qualquer pessoa entende.</p></div>
  </div>

  <div class="texto">
    <h2>O nome</h2>
    <p>Lastro é o que dá estabilidade a um navio e, no dinheiro, o que garante que um papel vale alguma coisa. É a nossa forma de dizer que todo investimento precisa de algo real por trás: uma empresa que produz, um título que paga, um imóvel que gera renda.</p>

    <h2>Satisfação e liberdade</h2>
    <p>Falamos em liberdade financeira, e também em satisfação. Patrimônio que cresce à custa de noites mal dormidas não cumpre o papel dele. Uma boa carteira é a que você consegue manter nos anos ruins, porque entende o que há nela.</p>

    <h2>Nossos princípios</h2>
  </div>
  <div class="grade grade-3" style="margin:1rem 0 2rem">
    <div class="principio"><h3 class="titulo-3">Valor real</h3><p>Olhamos o negócio, a gestão e o caixa. Indicadores entram como pista, nunca como resposta.</p></div>
    <div class="principio"><h3 class="titulo-3">Prazo longo</h3><p>Valor demora a aparecer no preço. Preferimos paciência a previsão.</p></div>
    <div class="principio"><h3 class="titulo-3">Margem de segurança</h3><p>Toda estimativa erra. Só faz sentido pagar com folga.</p></div>
    <div class="principio"><h3 class="titulo-3">Simplicidade</h3><p>Se não dá para explicar em linguagem simples, não entendemos o bastante.</p></div>
    <div class="principio"><h3 class="titulo-3">Transparência</h3><p>Regras, premissas e fontes ficam abertas, com a data de cada dado.</p></div>
    <div class="principio"><h3 class="titulo-3">Independência</h3><p>Não vendemos produtos nem recebemos comissão de quem vende.</p></div>
  </div>

  <div class="dupla" style="margin-bottom:2rem">
    <div class="cartao"><h3>O que fazemos</h3><ul class="sim">
      <li>Ferramentas gratuitas para planejar e estudar</li><li>Conteúdo sobre análise fundamentalista</li><li>Dados de fontes oficiais, com data e origem</li><li>Código aberto, para qualquer pessoa conferir</li></ul></div>
    <div class="cartao"><h3>O que não fazemos</h3><ul class="nao">
      <li>Recomendação de compra ou venda</li><li>Gestão ou custódia de dinheiro de terceiros</li><li>Promessa de retorno</li><li>Venda de produtos, cursos pagos ou assinaturas</li></ul></div>
  </div>

  <div class="texto" id="transparencia">
    <h2>Transparência e privacidade</h2>
    <ul>
      <li>A ${MARCA} é um projeto educacional. Não é corretora, gestora, consultoria nem analista de valores mobiliários, e não tem registro na CVM.</li>
      <li>As ferramentas rodam no seu navegador. O que você digita fica no seu aparelho e não é enviado a nenhum servidor. Não há cadastro, cookies de rastreamento nem estatísticas de uso.</li>
      <li>As únicas consultas externas são leituras de dados públicos do Banco Central. Os dados do Tesouro Nacional e da B3 são publicados junto com o site, com a data de cada um.</li>
      <li>As premissas de cada cálculo estão descritas na própria ferramenta e na página <a href="carteira/#sobre">Sobre e metodologia</a> do roteiro de carteira.</li>
    </ul>
    ${AVISO}
  </div>
</div></section>` },

  { arquivo: 'liberdade.html', id: 'ferramentas', titulo: `Liberdade financeira — ${MARCA}`,
    descricao: 'Calculadora de liberdade financeira da Lastro: descubra o seu número-alvo e em quanto tempo você chega lá.',
    scripts: ['site/liberdade.js'],
    corpo: `<section class="secao"><div class="dentro">
  <p class="olho"><a href="ferramentas.html">Ferramentas</a> · Calculadora</p>
  <h1 class="titulo">Liberdade financeira</h1>
  <p class="lead" style="margin-bottom:2rem">Quanto patrimônio sustentaria a vida que você quer, e em quanto tempo você chega lá. Tudo em reais de hoje.</p>
  <div class="ferramenta-grade">
    <form class="cartao" id="form-liberdade" novalidate>
      <div class="campo"><label for="gasto">Quanto você quer gastar por mês</label><span class="ajuda">O padrão de vida que quer sustentar sem depender de trabalho.</span><div class="entrada"><span>R$</span><input id="gasto" type="text" inputmode="decimal" autocomplete="off" value="6.000"></div></div>
      <div class="campo"><label for="patrimonio">Quanto já tem investido</label><div class="entrada"><span>R$</span><input id="patrimonio" type="text" inputmode="decimal" autocomplete="off" value="50.000"></div></div>
      <div class="campo"><label for="aporte">Quanto investe por mês</label><div class="entrada"><span>R$</span><input id="aporte" type="text" inputmode="decimal" autocomplete="off" value="1.500"></div></div>
      <div class="campo"><label for="retorno">Retorno real, acima da inflação</label><span class="ajuda">Hipótese. Quanto maior, mais risco é preciso correr para tentar obtê-lo.</span><div class="entrada"><select id="retorno"><option value="2">2% ao ano (cauteloso)</option><option value="3">3% ao ano</option><option value="4" selected>4% ao ano</option><option value="5">5% ao ano</option><option value="6">6% ao ano (otimista)</option></select></div></div>
      <div class="campo"><label for="retirada">Taxa de retirada</label><span class="ajuda">Quanto do patrimônio você usaria por ano. Menor é mais seguro.</span><div class="entrada"><select id="retirada"><option value="3">3% ao ano (mais seguro)</option><option value="3.5">3,5% ao ano</option><option value="4" selected>4% ao ano (regra prática comum)</option></select></div></div>
      <p class="erro" id="erro-liberdade" role="alert" hidden></p>
      <button type="submit" class="btn btn-primario">Calcular</button>
      <p class="nota" style="margin-top:1rem">Os valores de exemplo são só para mostrar como funciona. Troque pelos seus.</p>
    </form>
    <div class="cartao" id="saida-liberdade" aria-live="polite"></div>
  </div>
</div></section>` },

  { arquivo: 'roteiro.html', id: 'ferramentas', titulo: `Roteiro de análise — ${MARCA}`,
    descricao: 'Roteiro fundamentalista da Lastro: vinte perguntas para estudar uma empresa pelo negócio, pela vantagem, pelas pessoas, pelas contas e pelo preço.',
    scripts: ['site/checklist.js'],
    corpo: `<section class="secao"><div class="dentro">
  <p class="olho"><a href="ferramentas.html">Ferramentas</a> · Análise</p>
  <h1 class="titulo">Roteiro de análise de empresa</h1>
  <p class="lead" style="margin-bottom:2rem">Vinte perguntas, na ordem do nosso método. O roteiro não diz se você deve comprar: mostra onde o seu estudo está firme e onde ainda falta olhar.</p>
  <div class="campo estreito" style="margin:0 0 2rem"><label for="empresa">Empresa que você está estudando</label><span class="ajuda">Opcional. Fica salvo só neste navegador.</span><div class="entrada"><input id="empresa" type="text" maxlength="60" autocomplete="off"></div></div>
  <div class="roteiro-grade">
    <div id="perguntas"></div>
    <aside class="cartao fixo" id="saida-roteiro" aria-live="polite"></aside>
  </div>
</div></section>` },

  { arquivo: 'mercado.html', id: 'ferramentas', titulo: `Painel de mercado — ${MARCA}`,
    descricao: 'Painel de mercado da Lastro: Selic, CDI, inflação e expectativas do Banco Central, taxas do Tesouro Direto e maiores pesos do Ibovespa e do IFIX.',
    scripts: ['carteira/js/config.js', 'carteira/js/macro.js', 'carteira/js/ativos.js', 'site/mercado.js'],
    corpo: `<section class="secao"><div class="dentro">
  <p class="olho"><a href="ferramentas.html">Ferramentas</a> · Dados</p>
  <h1 class="titulo">Painel de mercado</h1>
  <p class="lead" style="margin-bottom:2rem">O cenário em números de fontes oficiais, cada um com origem e data. Serve de contexto; não diz o que fazer.</p>
  <section class="cartao" style="margin-bottom:1rem"><h2 class="titulo-2">Juros e inflação</h2><div id="macro"><p role="status">Buscando dados no Banco Central…</p></div></section>
  <section class="cartao" style="margin-bottom:1rem"><h2 class="titulo-2">Tesouro Direto</h2><div id="tesouro"></div></section>
  <div class="grade grade-2">
    <section class="cartao"><h2 class="titulo-2">Maiores pesos do Ibovespa</h2><div id="ibov"></div></section>
    <section class="cartao"><h2 class="titulo-2">Maiores pesos do IFIX</h2><div id="ifix"></div></section>
  </div>
  <p class="nota" style="margin-top:1rem">Peso grande em um índice indica tamanho e volume de negociação. Não indica qualidade do negócio nem preço justo; para isso, use o <a href="roteiro.html">roteiro de análise</a>.</p>
  <div class="estreito" style="margin:1.5rem 0 0">${AVISO}</div>
</div></section>` }
];

paginas.forEach((p) => fs.writeFileSync(path.join(RAIZ, p.arquivo), pagina(p)));
fs.writeFileSync(path.join(__dirname, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#F4F0E6"/><rect x="5" y="21" width="22" height="5" rx="1.5" fill="#1F5D50"/><rect x="8" y="14" width="16" height="5" rx="1.5" fill="#B07E1A"/><rect x="11" y="7" width="10" height="5" rx="1.5" fill="#BF4F3C"/></svg>\n`);
console.log(paginas.length + ' páginas geradas.');
