# Bancada Encarnada

Site da Bancada Encarnada: comunidade independente de benfiquistas e loja de peças originais feitas em Portugal. Marca independente, sem ligação oficial ao Sport Lisboa e Benfica.

Publicado em https://nunotavares062.github.io/bancada-encarnada/ a partir da pasta `site/`, por GitHub Pages, em cada push para `main`.

## Estrutura

```
site/
  index.html            homepage
  loja.html             catálogo (filtros por categoria, ordenação)
  produto.html?p=slug   ficha de produto, dinâmica a partir de products.js
  comunidade.html       esta semana, sondagem, mural, histórias, clube
  sobre.html            história, missão, produção
  contactos.html        contactos e perguntas frequentes
  termos.html · devolucoes.html · privacidade.html
  404.html · sitemap.xml · robots.txt
  assets/css/styles.css
  assets/js/config.js   contactos, portes, prazos, dados fiscais, Supabase, Brevo
  assets/js/products.js categorias e produtos
  assets/js/data.js     pergunta da semana, mural, histórias
  assets/js/main.js     header, footer, ligações, clube, sondagem, mural
  assets/js/shop.js     catálogo e ficha de produto
  assets/images/ · assets/video/
```

## Como editar

- **Contactos e dados fiscais:** `site/assets/js/config.js`. Enquanto `preview: true`, os campos por preencher aparecem assinalados e os botões de WhatsApp ficam inativos.
- **Produtos:** `site/assets/js/products.js`. Copia um bloco, muda o `slug` e os campos. Fotografias em `site/assets/images/` com o nome base; depois corre `python tools/images.py` para gerar os WebP.
- **Pergunta da semana, mural, histórias:** `site/assets/js/data.js`.
- **Votos partilhados e Clube com dupla confirmação:** ver `LIGAR-SERVICOS.md`.

## Pré-visualizar em local

```bash
python -m http.server 8765 --directory site
```
