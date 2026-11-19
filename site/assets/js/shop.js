/* =====================================================================
   BANCADA ENCARNADA · loja.html (catálogo) e produto.html (ficha)
   Depende de main.js (window.BE), products.js e config.js.
   ===================================================================== */
(function () {
  const BE = window.BE; if (!BE) return;
  const { CFG, PROD, esc, eur, wa, hasWA, picture, card, prazoTxt, wireLinks, reveal } = BE;
  const COM = CFG.comercial || {};
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const bySlug = Object.fromEntries(PROD.produtos.map(p => [p.slug, p]));
  const catOf = slug => PROD.categorias.find(c => c.slug === slug);

  /* ===================== LOJA ===================== */
  const grid = $("#catalogo");
  if (grid) {
    const chips = $("#chips"), sortSel = $("#sort"), count = $("#count");
    const cats = PROD.categorias;
    chips.innerHTML = `<button type="button" data-f="todos" aria-pressed="true">Tudo</button><button type="button" data-f="disponivel">Disponível agora</button>` + cats.map(c => `<button type="button" data-f="${c.slug}">${esc(c.nome)}</button>`).join("");
    let filter = "todos", sort = "destaque";
    const sorted = list => {
      const l = [...list];
      if (sort === "preco-asc") l.sort((a, b) => (a.preco ?? 1e9) - (b.preco ?? 1e9));
      else if (sort === "preco-desc") l.sort((a, b) => (b.preco ?? -1) - (a.preco ?? -1));
      else if (sort === "novidades") l.sort((a, b) => (b.adicionado || "").localeCompare(a.adicionado || ""));
      else l.sort((a, b) => (a.estado === "disponivel" ? 0 : 1) - (b.estado === "disponivel" ? 0 : 1) || (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
      return l;
    };
    const render = () => {
      $$("button", chips).forEach(b => b.setAttribute("aria-pressed", b.dataset.f === filter));
      let html = "", n = 0;
      if (filter === "todos" || filter === "disponivel") {
        // agrupado por categoria, disponíveis primeiro dentro de cada uma
        cats.forEach(c => {
          let ps = PROD.produtos.filter(p => p.categoria === c.slug && (filter === "todos" || p.estado === "disponivel"));
          if (!ps.length) return; ps = sorted(ps); n += ps.length;
          html += `<section class="cat-block" id="${c.slug}" aria-labelledby="h-${c.slug}"><h2 id="h-${c.slug}">${esc(c.nome)}</h2><p class="frase">${esc(c.frase || "")}</p><div class="grid g4">${ps.map(card).join("")}</div></section>`;
        });
      } else {
        const c = catOf(filter); let ps = sorted(PROD.produtos.filter(p => p.categoria === filter)); n = ps.length;
        html = c ? `<section class="cat-block" id="${c.slug}"><h2>${esc(c.nome)}</h2><p class="frase">${esc(c.frase || "")}</p>${ps.length ? `<div class="grid g4">${ps.map(card).join("")}</div>` : '<div class="empty">Ainda não há peças nesta categoria. Entra no Clube para saberes quando chegam.</div>'}</section>` : "";
      }
      grid.innerHTML = html || '<div class="empty">Sem peças para mostrar.</div>';
      count.textContent = n + (n === 1 ? " peça" : " peças");
      const u = new URL(location.href); if (filter === "todos") u.searchParams.delete("cat"); else u.searchParams.set("cat", filter); if (sort === "destaque") u.searchParams.delete("ordem"); else u.searchParams.set("ordem", sort); history.replaceState(null, "", u);
      document.title = (filter !== "todos" && catOf(filter) ? catOf(filter).nome + " · " : "") + "Loja · Bancada Encarnada";
    };
    chips.addEventListener("click", e => { const b = e.target.closest("button[data-f]"); if (!b) return; filter = b.dataset.f; render(); });
    sortSel.addEventListener("change", () => { sort = sortSel.value; render(); });
    const c0 = params.get("cat"), o0 = params.get("ordem");
    if (c0 && (c0 === "disponivel" || catOf(c0))) filter = c0;
    if (o0 && [...sortSel.options].some(o => o.value === o0)) { sort = o0; sortSel.value = o0; }
    render();
    if (location.hash) { const t = $(location.hash); if (t) setTimeout(() => t.scrollIntoView(), 50); }
  }

  /* ===================== PRODUTO ===================== */
  const host = $("#produto");
  if (host) {
    const p = bySlug[params.get("p")];
    if (!p) {
      host.innerHTML = `<div class="wrap"><div class="notfound"><div><span class="kicker">Peça não encontrada</span><h1 style="margin:14px 0 18px">Esta peça não existe <span class="it red">ou mudou de lugar.</span></h1><a class="btn btn-red" href="loja.html">Ver toda a loja</a></div></div></div>`;
      document.title = "Peça não encontrada · Bancada Encarnada"; return;
    }
    const cat = catOf(p.categoria) || { nome: "", slug: "" }, prep = p.estado !== "disponivel";
    document.title = `${p.nome} · ${cat.nome} · Bancada Encarnada`;
    const md = $('meta[name="description"]'); if (md) md.content = p.resumo;
    const og = $('meta[property="og:title"]'); if (og) og.content = p.nome + " · Bancada Encarnada";
    const ogd = $('meta[property="og:description"]'); if (ogd) ogd.content = p.resumo;
    const ogi = $('meta[property="og:image"]'); if (ogi && p.imagens[0]) ogi.content = (CFG.siteUrl || "") + "/assets/images/" + p.imagens[0] + ".jpg";
    const can = $('link[rel="canonical"]'); if (can) can.href = (CFG.siteUrl || "") + "/produto.html?p=" + p.slug;
    const ld = { "@context": "https://schema.org", "@type": "Product", name: p.nome, description: p.resumo, category: cat.nome, brand: { "@type": "Brand", name: "Bancada Encarnada" } };
    if (p.imagens[0]) ld.image = (CFG.siteUrl || "") + "/assets/images/" + p.imagens[0] + ".jpg";
    if (!prep) ld.offers = { "@type": "Offer", priceCurrency: "EUR", price: p.preco.toFixed(2), availability: "https://schema.org/PreOrder", url: (CFG.siteUrl || "") + "/produto.html?p=" + p.slug };
    const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);

    const li = xs => xs && xs.length ? "<ul>" + xs.map(x => `<li>${esc(x)}</li>`).join("") + "</ul>" : "—";
    const gal = p.imagens.length
      ? `<div class="main">${picture(p.imagens[0], p.nome, "(min-width: 960px) 50vw, 100vw", 'id="galMain" fetchpriority="high" width="1200" height="1600"')}</div>` +
        (p.imagens.length > 1 ? `<div class="thumbs" id="galThumbs">${p.imagens.map((n, i) => `<button type="button" data-src="assets/images/${n}.jpg" aria-current="${i === 0}" aria-label="Imagem ${i + 1}"><img src="assets/images/${n}-800.webp" alt="" loading="lazy"></button>`).join("")}</div>` : "") +
        `<p class="note">Fotografias de apresentação. Cada peça é feita à mão e pode ter pequenas diferenças.</p>`
      : `<div class="main"><div class="ph-empty"><span>Ainda sem fotografia. Publicamos quando tivermos a amostra aprovada.</span></div></div>`;
    const inclui = p.inclui ? `<dt>Inclui</dt><dd>${li(p.inclui.map(s => (bySlug[s] || {}).nome).filter(Boolean))}</dd>` : "";
    const specs = `<dl class="specs"><dt>Categoria</dt><dd><a class="link" href="loja.html?cat=${cat.slug}">${esc(cat.nome)}</a></dd><dt>Técnica</dt><dd>${esc(p.tecnica)}</dd>${inclui}<dt>Materiais</dt><dd>${li(p.materiais)}</dd><dt>Medidas</dt><dd>${esc(p.medidas || "")}</dd><dt>Personalização</dt><dd>${esc(p.personalizacao || "")}</dd><dt>Produção e entrega</dt><dd>${esc(prazoTxt(p))}. Envio por ${esc(COM.envio || "")}, ${eur(COM.portesPT)} em ${esc(COM.zona || "Portugal continental")}, grátis acima de ${eur(COM.portesGratisAcima)}.</dd><dt>Cuidados</dt><dd>${li(p.cuidados)}</dd></dl>`;
    let order;
    if (prep) {
      order = `<div class="prep-box"><span class="tag prep">${p.exemplo ? "Exemplo de peça em preparação" : "Em preparação"}</span><b>Ainda não está à venda.</b><p>${p.exemplo ? "Esta peça é um exemplo do que vai entrar nesta categoria. Não tem preço, fornecedor nem data fechados." : "Estamos a preparar esta peça."} Se quiseres saber quando sai, entra no Clube da Bancada: avisamos os membros primeiro.</p><div class="acts"><a class="btn btn-red" href="index.html#clube">Avisa-me quando sair</a><a class="btn btn-line" data-wa data-msg="Olá! Tenho interesse na peça ${esc(p.nome)} quando estiver disponível." href="#">Perguntar pelo WhatsApp</a></div></div>`;
    } else {
      const sels = (p.variantes || []).map((v, i) => `<div class="field"><label for="v${i}">${esc(v.nome)}</label><select id="v${i}" data-var="${esc(v.nome)}">${v.opcoes.map(o => `<option>${esc(o)}</option>`).join("")}</select></div>`).join("");
      order = `<form class="order" id="order" onsubmit="return false"><h2>Encomendar por mensagem</h2>${sels}<div class="field"><label for="persTxt">Personalização (opcional)</label><input id="persTxt" type="text" maxlength="40" placeholder="Nome, número…"></div><div class="field"><label for="qtd">Quantidade</label><select id="qtd"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div><div class="total"><span>Total das peças, sem portes</span><b id="orderTotal">${eur(p.preco)}</b></div><p class="note">Pagamento por ${esc((COM.pagamentos || []).join(" ou "))}, antes da produção. Respondemos com o total final, os portes e o prazo.</p><div class="acts"><a class="btn btn-wa" id="orderWa" data-wa href="#">Encomendar no WhatsApp</a><a class="btn btn-line" data-ig href="#">Instagram</a></div>${hasWA ? "" : '<p class="note">O número de WhatsApp ainda não está preenchido em config.js, por isso o botão está inativo.</p>'}<p class="msg">A mensagem que vai seguir: <span id="orderMsg"></span></p></form>`;
    }
    const rel = (p.relacionados || []).map(s => bySlug[s]).filter(Boolean).slice(0, 4);
    host.innerHTML = `<div class="wrap">
  <nav class="crumbs" aria-label="Caminho"><a href="index.html">Início</a><span><a href="loja.html">Loja</a></span><span><a href="loja.html?cat=${cat.slug}">${esc(cat.nome)}</a></span><span>${esc(p.nome)}</span></nav>
  <div class="prod-grid">
    <div class="gallery">${gal}</div>
    <div class="pinfo">
      <span class="kicker coal">${esc(cat.nome)} · ${esc(p.tecnica)}</span>
      <h1>${esc(p.nome)}</h1>
      ${prep ? '<div class="price prep">Preço a anunciar</div>' : `<div class="price">${eur(p.preco)}<small>${esc(p.precoNota || "")}</small></div>`}
      <p class="desc">${esc(p.descricao)}</p>
      ${order}
      ${specs}
    </div>
  </div>
  ${rel.length ? `<section class="related" aria-labelledby="h-rel"><h2 id="h-rel">Vai bem <span class="it red">com</span></h2><div class="grid g4">${rel.map(card).join("")}</div></section>` : ""}
</div>`;
    wireLinks(host);
    const o = $("#order");
    if (o) {
      const btn = $("#orderWa"), out = $("#orderMsg"), tot = $("#orderTotal");
      const build = () => {
        const parts = [`Olá! Quero encomendar: ${p.nome} (${eur(p.preco)}).`];
        $$("select[data-var]", o).forEach(s => parts.push(`${s.dataset.var}: ${s.value}.`));
        const t = $("#persTxt").value.trim(); if (t) parts.push(`Personalização: ${t}.`);
        const q = +$("#qtd").value || 1; if (q > 1) parts.push(`Quantidade: ${q}.`);
        parts.push("Podem dizer-me portes e prazo?");
        const msg = parts.join(" "); out.textContent = msg; tot.textContent = eur(p.preco * q);
        if (hasWA) { btn.href = wa(msg); }
      };
      $$("select,input", o).forEach(el => el.addEventListener("input", build)); build();
      const main = $("#galMain"); $$("#galThumbs button").forEach(b => b.addEventListener("click", () => { main.src = b.dataset.src; const src = main.parentElement.querySelector("source"); if (src) src.remove(); $$("#galThumbs button").forEach(x => x.setAttribute("aria-current", x === b)); }));
    }
    $$(".rv", host).forEach(reveal);
  }
})();
