# Monte sua carteira

Roteiro guiado, em português do Brasil, que leva a pessoa de "quanto ganho e gasto" até uma carteira de investimentos **por classes**, explicada e com gráficos.

**É conteúdo educacional.** Mostra exemplos de títulos do Tesouro Direto, ações e fundos imobiliários a partir de fontes oficiais, escolhidos por regras simples. Não é recomendação individualizada, não indica corretoras e não substitui um profissional habilitado.

- 100% estático: HTML, CSS e JavaScript puro. Sem servidor, sem banco de dados, sem etapa de build, sem dependências de execução.
- Os dados da pessoa ficam só no navegador dela (`localStorage`). Nada é enviado a servidores.
- Funciona offline depois da primeira visita (PWA).

## Como rodar

Opção 1, a mais simples: abra o arquivo `index.html` no navegador.
Funciona tudo, menos a instalação como app e o modo offline, que exigem `http(s)`.

Opção 2, com servidor local (recomendado para testar o PWA):

```bash
python -m http.server 4173
```

Depois abra `http://localhost:4173`. Em `localhost`, o modo offline (service worker) só é ligado com `http://localhost:4173/?pwa=1`, para não servir arquivos antigos enquanto você edita.

### Testes da lógica

```bash
node tests/engine.test.js
```

São 27 testes sem biblioteca externa: perfis extremos, sem reserva, dívida cara, curto prazo, soma sempre igual a 100, entradas maliciosas e 3.000 estados aleatórios.

## Como publicar

### GitHub Pages

1. Crie um repositório no GitHub e envie todos os arquivos desta pasta para a branch `main`.
2. No repositório, abra **Settings > Pages**.
3. Em **Build and deployment > Source**, escolha **Deploy from a branch**; em **Branch**, escolha `main` e a pasta `/ (root)`. Salve.
4. Em um ou dois minutos o site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

### Netlify, Cloudflare Pages ou Vercel

Crie um projeto novo apontando para o repositório (ou arraste a pasta no painel do Netlify). Não há comando de build; a pasta de saída é a raiz do projeto.

### Depois de publicar

1. **Prévia do link.** Em `index.html`, troque `og-image.png` nas metatags `og:image` e `twitter:image` pelo endereço completo, por exemplo `https://seusite.com/og-image.png`. WhatsApp, LinkedIn e outros exigem endereço completo para mostrar a imagem.
2. **Versão do cache.** A cada atualização publicada, mude `VERSAO` em `sw.js`. É isso que faz os aparelhos baixarem os arquivos novos.
3. Teste o link em uma janela anônima e no celular.

## Como atualizar os dados e as premissas

Tudo o que é premissa está em **`js/config.js`**, com a data de referência no topo:

- classes, cores e textos curtos;
- alocação-base e faixas por perfil;
- gatilhos do ajuste tático;
- prêmios de retorno, margens dos cenários e quedas do teste de estresse;
- `fallbackMacro`: os dados usados quando as APIs falham.

Para atualizar o fallback, copie os valores das fontes abaixo, altere `fallbackMacro` e mude `dataReferencia` (e o comentário do topo).

## Fontes de dados

Os endpoints foram verificados em 10/11/2026. Todos respondem com CORS liberado, então o navegador consulta direto, sem servidor intermediário.

| Dado | Fonte | Endpoint |
|---|---|---|
| Selic meta (% a.a.) | Banco Central, SGS série 432 | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=DD/MM/AAAA&dataFinal=DD/MM/AAAA` |
| CDI anualizado (% a.a.) | Banco Central, SGS série 4389 | mesmo formato, série 4389 |
| IPCA acumulado em 12 meses (%) | IBGE via Banco Central, SGS série 13522 | mesmo formato, série 13522 |
| Expectativas de Selic, IPCA, PIB e câmbio (mediana anual) | Boletim Focus, API Olinda | `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais` |

Observações do que foi encontrado ao verificar:

- A série 432 devolve datas **futuras** (a meta vale até a próxima reunião do Copom). Por isso o app consulta por intervalo de datas e usa o último valor até hoje, em vez de `ultimos/1`.
- No Focus, o filtro `baseCalculo eq 0` seleciona a mediana com todas as respostas dos últimos 30 dias. Os indicadores usados são `IPCA`, `Selic`, `PIB Total` e `Câmbio`.
- A tendência da inflação esperada compara a mediana mais recente com a de pelo menos 28 dias antes, para o ano seguinte.
- IBGE (SIDRA), Tesouro Transparente e ANBIMA não foram necessários: o IPCA do IBGE já vem pela série 13522 do Banco Central.

Para ver o fallback funcionando, abra o app com `?semapi=1` no endereço: nenhuma consulta é feita.

Ordem de preferência de cada dado: ao vivo, depois a cópia guardada no aparelho, depois o dado de referência do `config.js`. A tela sempre mostra a data e de onde veio.

## Exemplos de ativos (Tesouro Direto, ações, fundos imobiliários)

O arquivo `js/ativos.js` é **gerado** por `node tools/atualizar-ativos.js`, que lê:

- Tesouro Transparente: taxas dos títulos ofertados pelo Tesouro Direto (CSV oficial);
- B3: composição teórica do Ibovespa e do IFIX.

Essas fontes não liberam CORS, então o navegador não consegue lê-las ao vivo. Rode o script antes de cada publicação (as taxas do Tesouro mudam todo dia útil); a data de cada fonte aparece na tela. A escolha dos exemplos está em `js/opcoes.js`.

## Como a carteira é calculada

A lógica fica em `js/engine.js`, sem nenhuma dependência de tela, e está descrita também na página "Sobre e metodologia" do app.

1. **Reserva primeiro.** 6 meses de despesas; 12 se a renda for variável ou instável. Só o excedente vai para as outras classes.
2. **Baldes por prazo.** Curto (até 2 anos), médio (até 5) e longo. O peso de cada objetivo é `valor-alvo ÷ prazo`. O balde curto é 100% pós-fixada e nunca recebe renda variável. O balde médio usa o perfil rebaixado em dois níveis.
3. **Alocação-base por perfil**, com faixa mínima e máxima por classe.
4. **Ajuste tático** de no máximo ±10 pontos percentuais por classe, a partir de três sinais: juro real, expectativa de inflação e trajetória esperada da Selic.
5. **Proteções:** limite de concentração, teto de renda variável por perfil, alertas de dívida cara e de objetivo que não fecha.

Perfil final = o **menor** entre capacidade (situação) e tolerância (comportamento). Conhecimento baixo limita a moderado.

## Premissas das projeções

- Valores em reais de hoje (retornos acima da inflação), antes de impostos e custos.
- Retorno de cada classe = juro real esperado do CDI (a partir do Focus) + um prêmio fixo, que é hipótese.
- Depois do horizonte do Focus, o juro real converge em 5 anos para 5% ao ano (hipótese).
- Cenários pessimista e otimista = base menos ou mais uma margem por classe. Sem probabilidades.

## Limitações

- Modelo simples: não considera impostos, custos, idade, dependentes, previdência, imóveis nem seguros.
- Classes genéricas: produtos de uma mesma classe podem ter riscos muito diferentes.
- A divisão do patrimônio entre objetivos é uma simplificação.
- As projeções não reduzem o risco conforme o objetivo se aproxima.
- Prêmios, margens e quedas do teste de estresse são hipóteses, não estimativas estatísticas.
- Links compartilhados usam compressão nativa do navegador (`CompressionStream`). Em navegadores muito antigos o link é gerado sem compressão, e um link comprimido não abre.

## Privacidade

- Sem backend, sem cadastro, sem cookies, sem estatísticas de uso, sem scripts de terceiros.
- As únicas chamadas externas são leituras de dados públicos do Banco Central.
- O compartilhamento escreve o resultado no fragmento da URL (depois do `#`), que o navegador não envia ao servidor.
- Tudo o que chega por link, arquivo ou armazenamento local é validado: números limitados, lista fechada de classes e texto sem marcação. O app não usa `innerHTML`.
- Uma política de segurança de conteúdo (CSP) em `index.html` restringe os scripts aos arquivos do próprio site.

## Estrutura

```
index.html              página única
css/style.css           estilo, temas claro e escuro, impressão
js/config.js            PREMISSAS e fallback macro (edite aqui)
js/engine.js            motor: perfil, alocação, projeção (lógica pura)
js/opcoes.js            escolhe exemplos de ativos por classe (lógica pura)
js/ativos.js            dados oficiais do Tesouro e da B3 (gerado)
js/macro.js             busca e valida os dados do Banco Central
js/share.js             codifica e valida links compartilhados
js/charts.js            gráficos em SVG e exportação em PNG
js/ui.js                componentes de interface
js/resultado.js         tela de resultado, metodologia e privacidade
js/app.js               fluxo das etapas, armazenamento, diálogos
js/textos.js            perguntas e glossário
js/tema.js              aplica o tema salvo antes de a página aparecer
sw.js                   service worker (offline)
manifest.webmanifest    dados do PWA
vendor/qrcode.js        gerador de QR Code (qrcode-generator 1.4.4, MIT, Kazuhiko Arase)
tests/engine.test.js    testes da lógica
tools/atualizar-ativos.js  atualiza js/ativos.js
tools/gerar-imagens.py  recria ícones e imagem de prévia (precisa de Pillow)
```

## Para adaptar e publicar a sua versão

A licença é MIT: pode copiar, mudar e publicar. Sugestões:

1. Faça um fork ou copie a pasta.
2. Ajuste as premissas em `js/config.js` e rode `node tests/engine.test.js`.
3. Ajuste textos em `js/textos.js` e nas telas (`js/app.js`, `js/resultado.js`).
4. Mantenha os avisos de conteúdo educacional. Se a sua versão for usada por instituição regulada, passe a lógica e os textos por compliance.

## Licença

MIT. Veja `LICENSE`.
