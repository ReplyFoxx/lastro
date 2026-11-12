# Lastro — plataforma

Site estático da Lastro, com o app "Monte sua carteira" em `carteira/`.

```
index.html, empresa.html, metodo.html, aprender.html, ferramentas.html   páginas institucionais (geradas)
liberdade.html, roteiro.html, mercado.html                                 ferramentas (geradas)
site/gerar-paginas.js     gera todas as páginas acima: node site/gerar-paginas.js
site/site.css, site.js    estilo e comportamento comuns
site/liberdade.js, checklist.js, mercado.js   lógica das ferramentas
carteira/                 app Monte sua carteira (veja README.md)
```

- Para trocar o nome da empresa, o lema ou o endereço do site: edite `MARCA`, `LEMA` e `URL_SITE` no topo de `site/gerar-paginas.js` e rode o gerador.
- Para atualizar taxas do Tesouro e índices da B3: `node carteira/tools/atualizar-ativos.js`.
- Testes da lógica da carteira: `node carteira/tests/engine.test.js`.
- "Lastro" é um nome provisório. Antes de usar publicamente como marca, verifique se já existe empresa ou marca registrada com esse nome no seu ramo.
