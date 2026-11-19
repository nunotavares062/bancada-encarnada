# Bancada Encarnada

Site da Bancada Encarnada: comunidade independente de benfiquistas e loja de peças originais feitas em Portugal. Marca independente, sem ligação ao Sport Lisboa e Benfica.

## Como funciona

- `src/home.html` é o template da homepage. **Não editar `site/index.html` à mão.**
- `site/data/produtos.json`, `semana.json` e `mural.json` são os dados: produtos, pergunta da semana, mural.
- `site/config.js` tem os contactos, portes, prazos, dados fiscais e as ligações ao Supabase e ao Brevo. Ver `LIGAR-SERVICOS.md`.
- `build.py` gera `site/index.html`, `site/loja/index.html` e `site/loja/produto/*.html`, converte as imagens para WebP e cria as imagens Open Graph.

```bash
pip install pillow
python build.py
```

## Publicação

Cada push para `main` corre o build no GitHub Actions e publica a pasta `site` no GitHub Pages. Antes de publicar a sério: `preview: false` em `site/config.js` e dados fiscais preenchidos.

## Pré-visualizar em local

```bash
python -m http.server 8765 --directory site
```
