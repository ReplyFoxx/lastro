# Cerne — plataforma

Site estático da Cerne, com o app "Monte sua carteira" em `carteira/`.

```
index.html, empresa.html, metodo.html, aprender.html, ferramentas.html   páginas institucionais (geradas)
liberdade.html, roteiro.html, mercado.html                                 ferramentas (geradas)
site/gerar-paginas.js     gera todas as páginas acima: node site/gerar-paginas.js
aula-*.html               módulos da área de aprendizagem (gerados)
site/aulas.js             referências e contas dos módulos
site/aulas-conteudo.js    textos das trilhas e dos módulos (formato explicado no topo do arquivo)
site/quiz.js              mini-testes e progresso (fica só no navegador)
site/fontes/              Bricolage Grotesque (licença OFL), servida pelo próprio site
site/site.css, site.js    estilo e comportamento comuns
site/liberdade.js, checklist.js, mercado.js   lógica das ferramentas
carteira/                 app Monte sua carteira (veja README.md)
```

- Para trocar o nome da empresa, o lema ou o endereço do site: edite `MARCA`, `LEMA` e `URL_SITE` no topo de `site/gerar-paginas.js` e rode o gerador.
- Para atualizar taxas do Tesouro e índices da B3: `node carteira/tools/atualizar-ativos.js`.
- Para editar um módulo de aprendizagem: mude `site/aulas-conteudo.js` e rode o gerador. Todo dado novo precisa de fonte em `REFS` e de citação no texto.
- Imagens de prévia e ícones: `python site/gerar-og.py` e `python carteira/tools/gerar-imagens.py` (Pillow). Ao mudar arquivos do app, suba o número de `VERSAO` em `carteira/sw.js`.
- Paleta: azul-marinho `#172554` e `#263B67`, pêssego `#FFB38A` e menta `#8EDBC0`. No claro, fundo branco e texto marinho; no escuro, fundo marinho. `--acento` (pêssego) chama a ação; `--menta` marca o que está certo ou concluído; `--primary` é sempre uma cor que serve para texto.
- Testes da lógica da carteira: `node carteira/tests/engine.test.js`.
- "Cerne" é um nome provisório. Antes de usar publicamente como marca, verifique se já existe empresa ou marca registrada com esse nome no seu ramo.
