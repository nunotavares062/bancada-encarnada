# -*- coding: utf-8 -*-
"""
Gerador do site da Bancada Encarnada.
  python build.py            -> gera site/index.html, site/loja/index.html e site/loja/produto/<slug>.html
  python build.py --no-img   -> salta a conversão de imagens para WebP
Fontes: src/home.html (template da homepage), site/data/*.json (dados), site/config.js (configuração).
As páginas da loja e dos produtos são montadas aqui a partir de produtos.json.
"""
import json, os, re, sys, html, shutil
from pathlib import Path

BASE = Path(__file__).parent
SITE = BASE / "site"
SRC = BASE / "src"
IMG = SITE / "img"
WIDTHS = (800, 1200, 1600)
SITE_URL = "https://bancadaencarnada.pt"

def esc(s): return html.escape(str(s), quote=True)
def eur(v): return "" if v is None else f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") + " €"

# ---------- imagens: WebP em três larguras ----------
def build_images():
    try:
        from PIL import Image
    except ImportError:
        print("Pillow não instalado: imagens WebP não geradas"); return
    for jpg in sorted(IMG.glob("*.jpg")):
        name = jpg.stem
        if re.search(r"-\d{3,4}$", name): continue
        im = Image.open(jpg).convert("RGB")
        for w in WIDTHS:
            out = IMG / f"{name}-{w}.webp"
            if out.exists() and out.stat().st_mtime >= jpg.stat().st_mtime: continue
            if im.width < w and w != WIDTHS[0]:
                if im.width <= WIDTHS[0]: break
                # não ampliar: gera só até à largura original
                r = im.copy()
            else:
                r = im.copy(); r.thumbnail((w, w * 3))
            r.save(out, "WEBP", quality=80, method=6)
    print("imagens WebP ok")

def webp_srcset(name, root):
    parts = []
    for w in WIDTHS:
        if (IMG / f"{name}-{w}.webp").exists(): parts.append(f"{root}img/{name}-{w}.webp {w}w")
    return ", ".join(parts)

def picture(name, alt, root="", attrs="", sizes="(min-width: 900px) 50vw, 100vw", cls=""):
    """<picture> com WebP e fallback JPEG. attrs vai para o <img>."""
    jpg = IMG / f"{name}.jpg"
    size = ""
    try:
        from PIL import Image
        with Image.open(jpg) as im: size = f' width="{im.width}" height="{im.height}"'
    except Exception: pass
    ss = webp_srcset(name, root)
    src = f'<source type="image/webp" srcset="{ss}" sizes="{sizes}">' if ss else ""
    c = f' class="{cls}"' if cls else ""
    return f'<picture{c}>{src}<img src="{root}img/{name}.jpg"{size} alt="{esc(alt)}" {attrs}></picture>'

# ---------- partials ----------
WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>'
IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>'
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

def head(title, desc, og_image, root, path, extra=""):
    canonical = SITE_URL + "/" + path
    return f'''<!doctype html>
<html lang="pt-PT" data-root="{root}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#141417">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_PT">
<meta property="og:site_name" content="Bancada Encarnada">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE_URL}/img/{og_image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(desc)}">
<meta name="twitter:image" content="{SITE_URL}/img/{og_image}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/site.css">
{extra}
</head>'''

def nav(root, always=False):
    cls = "nav always" if always else "nav"
    return f'''<a class="skip" href="#main">Saltar para o conteúdo</a>
<header class="{cls}" id="nav">
  <a class="brand" href="{root}index.html" aria-label="Bancada Encarnada, início"><span class="mono" aria-hidden="true">BE</span><span>Bancada<br>Encarnada</span></a>
  <nav aria-label="Secções">
    <ul>
      <li><a href="{root}index.html#bancada">A bancada</a></li>
      <li><a href="{root}loja/index.html">Coleção</a></li>
      <li><a href="{root}index.html#semana">Esta semana</a></li>
      <li><a href="{root}index.html#mural">Mural</a></li>
      <li><a href="{root}index.html#bastidores">Bastidores</a></li>
      <li><a href="{root}index.html#clube">Clube</a></li>
    </ul>
  </nav>
  <div class="right">
    <a class="btn btn-wa btn-sm" data-wa data-msg="Olá! Vi o site da Bancada Encarnada e queria encomendar." href="#">Encomendar</a>
    <button class="burger" id="burger" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu"><span></span></button>
  </div>
</header>
<div class="menu" id="menu" aria-hidden="true">
  <div class="top"><span class="brand"><span class="mono" aria-hidden="true">BE</span><span>Bancada<br>Encarnada</span></span><button class="close" id="menuClose" aria-label="Fechar menu">✕</button></div>
  <nav aria-label="Menu">
    <a href="{root}index.html#bancada">A bancada <small>comunidade</small></a>
    <a href="{root}loja/index.html">Coleção <small>a loja</small></a>
    <a href="{root}index.html#semana">Esta semana <small>sondagem</small></a>
    <a href="{root}index.html#mural">Mural <small>as tuas fotos</small></a>
    <a href="{root}index.html#bastidores">Bastidores <small>como fazemos</small></a>
    <a href="{root}index.html#clube">Clube <small>adesão gratuita</small></a>
  </nav>
  <div class="foot"><a class="btn btn-wa" data-wa data-msg="Olá! Vi o site da Bancada Encarnada e queria encomendar." href="#">WhatsApp</a><a class="btn btn-line" data-ig-profile href="#">Instagram</a></div>
</div>'''

def footer(root, cats):
    catlinks = "".join(f'<li><a href="{root}loja/index.html#{c["slug"]}">{esc(c["nome"])}</a></li>' for c in cats)
    return f'''<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <span class="brand"><span class="mono" aria-hidden="true">BE</span><span>Bancada<br>Encarnada</span></span>
        <p class="tagline">Paixão em cada detalhe.</p>
        <p style="margin-top:12px;max-width:38ch">Comunidade independente de benfiquistas, com uma coleção de peças originais feitas em Portugal.</p>
      </div>
      <div><h4>Comunidade</h4><ul><li><a href="{root}index.html#bancada">A nossa bancada</a></li><li><a href="{root}index.html#semana">Esta semana na Bancada</a></li><li><a href="{root}index.html#mural">Mural Encarnado</a></li><li><a href="{root}index.html#clube">Clube da Bancada</a></li><li><a href="{root}index.html#bancada">Sobre nós</a></li></ul></div>
      <div><h4>Coleção</h4><ul><li><a href="{root}loja/index.html">Toda a loja</a></li>{catlinks}<li><a href="{root}index.html#bastidores">Como fazemos</a></li></ul></div>
      <div><h4>Contactos e legal</h4><ul>
        <li><a data-wa data-msg="Olá! Vi o site da Bancada Encarnada." href="#">WhatsApp</a></li>
        <li><a data-ig-profile href="#">Instagram</a></li>
        <li><a data-mail href="#">Email</a></li>
        <li><button class="lnk" data-open="d-termos">Termos de venda</button></li>
        <li><button class="lnk" data-open="d-devolucoes">Trocas e devoluções</button></li>
        <li><button class="lnk" data-open="d-privacidade">Política de privacidade</button></li>
        <li><a href="https://www.livroreclamacoes.pt/" target="_blank" rel="noopener">Livro de Reclamações</a></li>
      </ul></div>
    </div>
    <div class="legal">
      <span>© 2026 Bancada Encarnada. Marca independente, criada por adeptos, sem ligação oficial ao Sport Lisboa e Benfica.</span>
      <span>Feito em Portugal.</span>
    </div>
  </div>
</footer>
<a class="float-wa" id="floatWa" data-wa data-msg="Olá! Vi o site da Bancada Encarnada e queria encomendar." href="#" aria-label="Falar no WhatsApp">{WA_ICON}</a>'''

LEGAL = '''<dialog id="d-termos" aria-labelledby="t-termos">
  <div class="dh"><h3 id="t-termos">Termos de venda</h3><button data-close aria-label="Fechar">✕</button></div>
  <div class="db">
    <p><b>Quem vende.</b> Bancada Encarnada, marca de <span data-cfg="legal.titular"></span>, NIF <span data-cfg="legal.nif"></span>, com sede em <span data-cfg="legal.morada"></span>. Marca independente, sem ligação ao Sport Lisboa e Benfica.</p>
    <p><b>Como se encomenda.</b> Por mensagem no WhatsApp ou no Instagram. A encomenda fica confirmada quando recebemos o pagamento. Antes disso enviamos sempre o total com portes e o prazo.</p>
    <p><b>Preços.</b> Em euros, com IVA incluído à taxa legal. Os portes são indicados à parte antes do pagamento: <span data-cfg="comercial.portesPT" data-fmt="eur"></span> em Portugal continental, grátis acima de <span data-cfg="comercial.portesGratisAcima" data-fmt="eur"></span>.</p>
    <p><b>Pagamento.</b> <span data-cfg="comercial.pagamentos"></span>. Emitimos fatura com os dados que nos indicares.</p>
    <p><b>Produção e entrega.</b> Cada peça é produzida à encomenda. Peças impressas em 3D: <span data-cfg="comercial.prazo3d"></span> após o pagamento, para Portugal continental, por <span data-cfg="comercial.envio"></span>. Peças em DTF e sublimação: prazo indicado na página de cada peça. Se o prazo for maior, avisamos antes de pagares.</p>
    <p><b>Personalização.</b> Peças com nome, número ou outra personalização são feitas à medida e não podem ser devolvidas, exceto por defeito.</p>
    <p><b>Garantia.</b> As peças têm a garantia legal de conformidade. Defeitos de fabrico são resolvidos com substituição ou reembolso.</p>
    <p><b>Litígios.</b> Em caso de litígio de consumo, podes recorrer ao Livro de Reclamações eletrónico ou a uma entidade de resolução alternativa de litígios: <a href="https://www.consumidor.gov.pt" target="_blank" rel="noopener">consumidor.gov.pt</a>.</p>
  </div>
</dialog>
<dialog id="d-devolucoes" aria-labelledby="t-dev">
  <div class="dh"><h3 id="t-dev">Trocas e devoluções</h3><button data-close aria-label="Fechar">✕</button></div>
  <div class="db">
    <p><b><span data-cfg="comercial.devolucoesDias"></span> dias para mudar de ideias.</b> Podes devolver qualquer peça sem personalização até 14 dias depois de a receberes, sem dar justificação. Basta mandar mensagem. A peça deve voltar nas condições em que a recebeste, com todos os componentes e a embalagem.</p>
    <p><b>Reembolso.</b> Devolvemos o valor pago, incluindo os portes de envio iniciais, até 14 dias depois de recebermos a peça, pelo mesmo meio de pagamento. Os portes de devolução ficam por tua conta, salvo defeito.</p>
    <p><b>Chegou partido ou com defeito.</b> Manda-nos fotografias no próprio dia da receção. Fazemos uma peça nova sem qualquer custo ou devolvemos o dinheiro, como preferires.</p>
    <p><b>Peças personalizadas.</b> Não aceitam devolução por mudança de ideias. Em caso de defeito aplica-se o ponto anterior.</p>
  </div>
</dialog>
<dialog id="d-privacidade" aria-labelledby="t-priv">
  <div class="dh"><h3 id="t-priv">Política de privacidade</h3><button data-close aria-label="Fechar">✕</button></div>
  <div class="db">
    <p><b>Responsável.</b> <span data-cfg="legal.titular"></span>, NIF <span data-cfg="legal.nif"></span>, <span data-cfg="legal.morada"></span>. Contacto: <span data-cfg="contacto.email"></span>.</p>
    <p><b>O que guardamos.</b> Nas encomendas: nome, morada, contacto e dados de faturação que nos envias por mensagem. No Clube da Bancada: nome, email, data e origem do consentimento. No mural: a fotografia, a frase e o nome ou iniciais que autorizares. Na sondagem: um identificador anónimo do teu navegador e a opção escolhida, sem nome nem email.</p>
    <p><b>Para quê.</b> Preparar, faturar e enviar encomendas; responder às tuas mensagens; enviar as novidades do Clube a quem confirmou o email; publicar no mural o que autorizaste; contar os votos. Nada mais.</p>
    <p><b>Com quem partilhamos.</b> Com os CTT, para a entrega; com o software de faturação; com a plataforma de email do Clube (Brevo) e com o serviço onde ficam os votos (Supabase), ambos na União Europeia quando configurados assim. Não vendemos nem cedemos dados.</p>
    <p><b>Durante quanto tempo.</b> Dados de faturação pelo prazo legal. O email do Clube até cancelares, o que podes fazer em qualquer email ou por mensagem. Fotografias do mural até pedires a remoção. Votos até ao fim da sondagem seguinte.</p>
    <p><b>Os teus direitos.</b> Ver, corrigir, apagar ou levar os teus dados, e retirar o consentimento a qualquer momento, por mensagem ou email. Podes reclamar junto da CNPD.</p>
    <p><b>Este site.</b> Não usa cookies de rastreio nem ferramentas de análise. Guarda no teu navegador apenas o teu voto na sondagem e um identificador anónimo para não contar duas vezes. As fontes são carregadas do Google Fonts.</p>
  </div>
</dialog>'''

def scripts(root, data):
    return f'''<script src="{root}config.js"></script>
<script>window.BE_DATA={json.dumps(data, ensure_ascii=False)};</script>
<script src="{root}assets/site.js" defer></script>'''

# ---------- dados ----------
def load():
    P = json.loads((SITE / "data" / "produtos.json").read_text(encoding="utf-8"))
    SEM = json.loads((SITE / "data" / "semana.json").read_text(encoding="utf-8"))
    MUR = json.loads((SITE / "data" / "mural.json").read_text(encoding="utf-8"))
    return P, SEM, MUR

def prazo_txt(p):
    return {"3d": "3 a 5 dias úteis após o pagamento", "dtf": "a definir (fornecedor em escolha)", "sublimacao": "a definir (fornecedor em escolha)"}.get(p.get("prazo"), p.get("prazo", ""))

# ---------- cartões de produto ----------
def card(p, root, cats):
    prep = p["estado"] != "disponivel"
    tag = f'<span class="tag{" prep" if prep else ""}">{esc(p.get("etiqueta",""))}</span>' if p.get("etiqueta") else ""
    if p["imagens"]:
        ph = picture(p["imagens"][0], p["nome"], root, 'loading="lazy" decoding="async"', "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw")
    else:
        ph = '<div class="ph-empty"><span>Fotografia quando houver amostra aprovada</span></div>'
    price = (f'<div class="price prep">preço a anunciar</div>' if prep else f'<div class="price">{eur(p["preco"])}<small>{esc(p.get("precoNota",""))}</small></div>')
    return f'''<a class="pcard" href="{root}loja/produto/{p["slug"]}.html" data-cat="{p["categoria"]}" data-estado="{p["estado"]}">
  <div class="ph">{ph}{tag}</div>
  <div class="body"><span class="tec">{esc(p["tecnica"])}</span><h3>{esc(p["nome"])}</h3><p>{esc(p["resumo"])}</p>{price}</div>
</a>'''

def montra(P, root):
    items = [p for p in P["produtos"] if p.get("destaque")][:3]
    out = []
    for p in items:
        out.append(f'''<a class="mcard rv" href="{root}loja/produto/{p["slug"]}.html">
  {picture(p["imagens"][0], p["nome"], root, 'loading="lazy" decoding="async"', "(min-width: 760px) 33vw, 100vw")}
  <span class="tag">{esc(p.get("etiqueta",""))}</span>
  <div class="cap"><h3>{esc(p["nome"])}</h3><span class="price">{eur(p["preco"])}<small>{esc(p.get("precoNota",""))}</small></span></div>
</a>''')
    return "\n".join(out)

# ---------- páginas ----------
def build_home(P, SEM, MUR):
    tpl = (SRC / "home.html").read_text(encoding="utf-8")
    root = ""
    def img_token(m):
        name, alt, attrs = (m.group(1).split("|") + ["", ""])[:3]
        sizes = m.group(2) or "(min-width: 900px) 50vw, 100vw"
        return picture(name.strip(), alt.strip(), root, attrs.strip() or 'loading="lazy" decoding="async"', sizes)
    tpl = re.sub(r"\{\{IMG ([^}]+?)(?:\|\|([^}|]+))?\}\}", img_token, tpl)
    page = (tpl.replace("{{HEAD}}", head("Bancada Encarnada · O Benfica não se explica. Vive-se.",
                                         "Uma comunidade feita por benfiquistas, para benfiquistas. Histórias, sondagens, um mural de adeptos e uma coleção de peças originais feitas em Portugal.",
                                         "og-home.jpg", root, "",
                                         '<link rel="preload" as="image" href="img/bancada-wide.jpg" media="(orientation: landscape)"><link rel="preload" as="image" href="img/bancada-tall.jpg" media="(orientation: portrait)">'))
               .replace("{{NAV}}", nav(root))
               .replace("{{MONTRA}}", montra(P, root))
               .replace("{{FOOTER}}", footer(root, P["categorias"]))
               .replace("{{LEGAL}}", LEGAL)
               .replace("{{SCRIPTS}}", scripts(root, {"semana": SEM, "mural": MUR}))
               .replace("{{ROOT}}", root))
    (SITE / "index.html").write_text(page, encoding="utf-8")
    print("index.html")

def build_loja(P, SEM, MUR):
    root = "../"
    cats = P["categorias"]; prods = P["produtos"]
    fbtns = '<button type="button" data-f="todos" aria-pressed="true">Tudo</button><button type="button" data-f="disponivel">Disponível agora</button>' + "".join(f'<button type="button" data-f="{c["slug"]}">{esc(c["nome"])}</button>' for c in cats)
    secs = []
    for c in cats:
        ps = [p for p in prods if p["categoria"] == c["slug"]]
        if not ps: continue
        tec = "".join(f'<span class="seat">{esc(t)}</span>' for t in c.get("tecnicas", []))
        secs.append(f'''<section class="cat" id="{c["slug"]}" data-cat="{c["slug"]}" aria-labelledby="h-{c["slug"]}">
  <div class="wrap">
    <div class="cat-head"><div><h2 id="h-{c["slug"]}">{esc(c["nome"])}</h2><p>{esc(c.get("frase",""))}</p></div><div class="tec">{tec}</div></div>
    <div class="pgrid">{"".join(card(p, root, cats) for p in ps)}</div>
  </div>
</section>''')
    n_disp = sum(1 for p in prods if p["estado"] == "disponivel")
    body = f'''{head("Coleção Encarnada · Loja da Bancada Encarnada", "Peças originais para benfiquistas, feitas em Portugal: Veste a Paixão, Ritual Diário, Peças de Bancada e Presentes Encarnados. Encomenda por WhatsApp ou Instagram.", "og-loja.jpg", root, "loja/")}
<body>
{nav(root, always=True)}
<main id="main">
  <section class="page-head">
    <div class="wrap">
      <nav class="crumbs" aria-label="Caminho"><a href="{root}index.html">Início</a><span>Coleção</span></nav>
      <span class="seat">Coleção <b>Encarnada</b></span>
      <h1 style="margin-top:16px">Peças para quem <span class="it">vive isto todos os dias.</span></h1>
      <p class="lead" style="margin-top:16px">{n_disp} peças disponíveis por encomenda e mais algumas em preparação. Sem carrinho: em cada peça há um botão de WhatsApp com a mensagem já escrita. Respondemos em <span data-cfg="contacto.tempoResposta"></span>, <span data-cfg="contacto.horario"></span>.</p>
      <div class="filters" id="filters" role="group" aria-label="Filtrar peças">{fbtns}</div>
      <p class="sr" id="filterLive" aria-live="polite"></p>
    </div>
  </section>
  {"".join(secs)}
  <section class="sec" style="padding-top:56px">
    <div class="wrap">
      <div class="prep-box"><b>Como funciona a encomenda</b><p>Escolhes a peça, carregas no botão e a mensagem chega-nos com o nome, a variante e a personalização. Respondemos com o total, os portes (<span data-cfg="comercial.portesPT" data-fmt="eur"></span>, grátis acima de <span data-cfg="comercial.portesGratisAcima" data-fmt="eur"></span>) e o prazo. Pagas por <span data-cfg="comercial.pagamentos"></span> e recebes por <span data-cfg="comercial.envio"></span>. Tens <span data-cfg="comercial.devolucoesDias"></span> dias para devolver peças sem personalização.</p></div>
    </div>
  </section>
</main>
{footer(root, cats)}
{LEGAL}
{scripts(root, {})}
</body>
</html>'''
    (SITE / "loja").mkdir(exist_ok=True)
    (SITE / "loja" / "index.html").write_text(body, encoding="utf-8")
    print("loja/index.html")

def build_produto(p, P):
    root = "../../"
    cats = P["categorias"]; by = {x["slug"]: x for x in P["produtos"]}
    cat = next(c for c in cats if c["slug"] == p["categoria"])
    prep = p["estado"] != "disponivel"
    # galeria
    if p["imagens"]:
        main = picture(p["imagens"][0], p["nome"], root, 'id="galMain" fetchpriority="high"', "(min-width: 960px) 50vw, 100vw")
        thumbs = "".join(f'<button type="button" data-src="{root}img/{n}.jpg" data-alt="{esc(p["nome"])}" aria-current="{str(i==0).lower()}" aria-label="Imagem {i+1}"><img src="{root}img/{n}-800.webp" alt="" loading="lazy"></button>' for i, n in enumerate(p["imagens"]))
        gal = f'<div class="main">{main}</div>' + (f'<div class="thumbs" id="galThumbs">{thumbs}</div>' if len(p["imagens"]) > 1 else "") + '<p class="note">Fotografias de apresentação. Cada peça é feita à mão e pode ter pequenas diferenças.</p>'
    else:
        gal = '<div class="main"><div class="ph-empty"><span>Ainda sem fotografia. Publicamos quando tivermos a amostra aprovada.</span></div></div>'
    # especificações
    def li(xs): return "<ul>" + "".join(f"<li>{esc(x)}</li>" for x in xs) + "</ul>" if xs else "—"
    inclui = ""
    if p.get("inclui"):
        inclui = f'<dt>Inclui</dt><dd>{li([by[s]["nome"] for s in p["inclui"] if s in by])}</dd>'
    specs = f'''<dl class="specs">
  <dt>Categoria</dt><dd><a href="{root}loja/index.html#{cat["slug"]}">{esc(cat["nome"])}</a></dd>
  <dt>Técnica</dt><dd>{esc(p["tecnica"])}</dd>
  {inclui}
  <dt>Materiais</dt><dd>{li(p.get("materiais"))}</dd>
  <dt>Medidas</dt><dd>{esc(p.get("medidas",""))}</dd>
  <dt>Personalização</dt><dd>{esc(p.get("personalizacao",""))}</dd>
  <dt>Prazo</dt><dd>{esc(prazo_txt(p))}</dd>
  <dt>Cuidados</dt><dd>{li(p.get("cuidados"))}</dd>
</dl>'''
    # encomenda
    if prep:
        order = f'''<div class="prep-box" id="prepBox">
  <span class="exemplo">{"Exemplo de peça em preparação" if p.get("exemplo") else "Em preparação"}</span>
  <b>Ainda não está à venda.</b>
  <p>{"Esta peça é um exemplo do que vai entrar nesta categoria. Não tem preço, fornecedor nem data fechados." if p.get("exemplo") else "Estamos a preparar esta peça."} Se quiseres saber quando sai, entra no Clube da Bancada: avisamos os membros primeiro.</p>
  <div class="acts"><a class="btn btn-red" href="{root}index.html#clube">Avisa-me quando sair</a><a class="btn btn-line" data-wa data-msg="Olá! Tenho interesse na peça {p['nome']} quando estiver disponível." href="#">Perguntar pelo WhatsApp</a></div>
</div>'''
    else:
        sels = "".join(f'<div class="field"><label for="v{i}">{esc(v["nome"])}</label><select id="v{i}" data-var="{esc(v["nome"])}">' + "".join(f'<option>{esc(o)}</option>' for o in v["opcoes"]) + '</select></div>' for i, v in enumerate(p.get("variantes", [])))
        order = f'''<form class="order" id="order" data-nome="{esc(p["nome"])}" data-preco="{eur(p["preco"])}" onsubmit="return false">
  <h2>Encomendar por mensagem</h2>
  {sels}
  <div class="field"><label for="persTxt">Personalização (opcional)</label><input id="persTxt" type="text" maxlength="40" placeholder="Nome, número…"></div>
  <div class="field"><label for="qtd">Quantidade</label><select id="qtd"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div>
  <div class="total"><span>Total das peças, sem portes</span><b id="orderTotal">{eur(p["preco"])}</b></div>
  <p class="note">Portes <span data-cfg="comercial.portesPT" data-fmt="eur"></span> em Portugal continental, grátis acima de <span data-cfg="comercial.portesGratisAcima" data-fmt="eur"></span>. Pagamento por <span data-cfg="comercial.pagamentos"></span>, antes da produção. Prazo: {esc(prazo_txt(p))}.</p>
  <div class="acts"><a class="btn btn-wa" id="orderWa" href="#" target="_blank" rel="noopener">{WA_ICON}Encomendar no WhatsApp</a><a class="btn btn-line" id="orderIg" data-ig href="#">{IG_ICON}Instagram</a></div>
  <p class="note">A mensagem que vai seguir: <span id="orderMsg"></span></p>
</form>'''
    # relacionados
    rel_slugs = list(dict.fromkeys((p.get("packs") or []) + (p.get("complementares") or [])))
    rel = [by[s] for s in rel_slugs if s in by and s != p["slug"]][:4]
    related = f'''<section class="related"><div class="wrap"><h2>Vai bem <span class="it">com</span></h2><div class="pgrid">{"".join(card(r, root, cats) for r in rel)}</div></div></section>''' if rel else ""
    price = '<div class="price prep">preço a anunciar</div>' if prep else f'<div class="price">{eur(p["preco"])}<small>{esc(p.get("precoNota",""))}</small></div>'
    title = f'{p["nome"]} · Bancada Encarnada'
    desc = p["resumo"]
    og = (p["imagens"][0] + ".jpg") if p["imagens"] else "og-loja.jpg"
    ld = {"@context": "https://schema.org", "@type": "Product", "name": p["nome"], "description": p["resumo"], "category": cat["nome"], "brand": {"@type": "Brand", "name": "Bancada Encarnada"}}
    if p["imagens"]: ld["image"] = f"{SITE_URL}/img/{p['imagens'][0]}.jpg"
    if not prep: ld["offers"] = {"@type": "Offer", "priceCurrency": "EUR", "price": f"{p['preco']:.2f}", "availability": "https://schema.org/PreOrder", "url": f"{SITE_URL}/loja/produto/{p['slug']}.html"}
    body = f'''{head(title, desc, og, root, f"loja/produto/{p['slug']}.html", f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>')}
<body>
{nav(root, always=True)}
<main id="main" class="produto">
  <div class="wrap">
    <nav class="crumbs" aria-label="Caminho"><a href="{root}index.html">Início</a><span><a href="{root}loja/index.html">Coleção</a></span><span><a href="{root}loja/index.html#{cat["slug"]}">{esc(cat["nome"])}</a></span><span>{esc(p["nome"])}</span></nav>
    <div class="prod-grid">
      <div class="gallery">{gal}</div>
      <div class="pinfo">
        <span class="seat">{esc(cat["nome"])} <b>·</b> {esc(p["tecnica"])}</span>
        <h1>{esc(p["nome"])}</h1>
        {price}
        <p class="desc">{esc(p["descricao"])}</p>
        {order}
        {specs}
      </div>
    </div>
  </div>
  {related}
</main>
{footer(root, cats)}
{LEGAL}
{scripts(root, {})}
</body>
</html>'''
    (SITE / "loja" / "produto").mkdir(parents=True, exist_ok=True)
    (SITE / "loja" / "produto" / f"{p['slug']}.html").write_text(body, encoding="utf-8")

def build_og():
    """Imagens Open Graph 1200×630 a partir das fotografias."""
    try:
        from PIL import Image, ImageOps
    except ImportError: return
    for src, out in (("bancada-wide", "og-home"), ("caneca", "og-loja")):
        p = IMG / f"{src}.jpg"
        if not p.exists(): continue
        im = ImageOps.fit(Image.open(p).convert("RGB"), (1200, 630), centering=(0.5, 0.45))
        im.save(IMG / f"{out}.jpg", quality=84, optimize=True)

def main():
    if "--no-img" not in sys.argv:
        build_images(); build_og()
    P, SEM, MUR = load()
    build_home(P, SEM, MUR)
    build_loja(P, SEM, MUR)
    for p in P["produtos"]: build_produto(p, P)
    print(f"{len(P['produtos'])} páginas de produto")

if __name__ == "__main__":
    main()
