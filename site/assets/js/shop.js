/* =====================================================================
   BANCADA ENCARNADA · loja.html (coleção) e produto.html (ficha)
   Depende de main.js (window.BE), cart.js (window.BE_CART) e products.js.
   ===================================================================== */
(function () {
  const BE = window.BE; if (!BE) return;
  const { CFG, PROD, esc, eur, picture, card, prazoTxt, wireLinks } = BE;
  const COM = CFG.comercial || {};
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const bySlug = Object.fromEntries(PROD.produtos.map(p => [p.slug, p]));
  const catOf = slug => PROD.categorias.find(c => c.slug === slug);
  const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const ICON = {
    pt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
    ret: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>'
  };

  /* ===================== COLEÇÃO ===================== */
  const grid = $("#catalogo");
  if (grid) {
    const chips = $("#chips"), sortSel = $("#sort"), count = $("#count"), q = $("#q"), disp = $("#disp"), head = $("#catHead");
    chips.innerHTML = `<button type="button" data-f="todos">Tudo</button>` + PROD.categorias.map(c => `<button type="button" data-f="${c.slug}">${esc(c.nome)}</button>`).join("");
    let cat = "todos", sort = "destaque", term = "", onlyAvail = false;
    const order = list => {
      const l = [...list];
      const avail = p => p.estado === "disponivel" ? 0 : 1;
      if (sort === "preco-asc") l.sort((a, b) => avail(a) - avail(b) || (a.preco ?? 1e9) - (b.preco ?? 1e9));
      else if (sort === "preco-desc") l.sort((a, b) => avail(a) - avail(b) || (b.preco ?? -1) - (a.preco ?? -1));
      else if (sort === "novidades") l.sort((a, b) => (b.adicionado || "").localeCompare(a.adicionado || "") || avail(a) - avail(b));
      else if (sort === "nome") l.sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
      else l.sort((a, b) => avail(a) - avail(b) || (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
      return l;
    };
    const render = (push = true) => {
      $$("button", chips).forEach(b => b.setAttribute("aria-pressed", b.dataset.f === cat));
      const t = norm(term);
      const list = order(PROD.produtos.filter(p => (cat === "todos" || p.categoria === cat) && (!onlyAvail || p.estado === "disponivel") && (!t || norm(p.nome + " " + p.resumo + " " + p.tecnica + " " + (catOf(p.categoria) || {}).nome).includes(t))));
      const c = catOf(cat);
      head.innerHTML = c ? `<h2>${esc(c.nome)}</h2><p>${esc(c.frase || "")}</p>` : "";
      head.hidden = !c;
      grid.innerHTML = list.length ? list.map(card).join("") : `<div class="empty" style="grid-column:1/-1">Não encontrámos peças${term ? ` para “${esc(term)}”` : ""}${onlyAvail ? " disponíveis" : ""}${c ? ` em ${esc(c.nome)}` : ""}. <button type="button" class="link" id="resetF">Limpar filtros</button></div>`;
      const rf = $("#resetF"); if (rf) rf.addEventListener("click", () => { cat = "todos"; term = ""; q.value = ""; onlyAvail = false; disp.checked = false; render(); });
      count.textContent = list.length + (list.length === 1 ? " peça" : " peças");
      if (push) { const u = new URL(location.href); u.hash = ""; [["cat", cat !== "todos" && cat], ["ordem", sort !== "destaque" && sort], ["q", term], ["disp", onlyAvail && "1"]].forEach(([k, v]) => v ? u.searchParams.set(k, v) : u.searchParams.delete(k)); history.replaceState(null, "", u); }
      document.title = (c ? c.nome + " · " : "") + "Loja · Bancada Encarnada";
    };
    chips.addEventListener("click", e => { const b = e.target.closest("button[data-f]"); if (!b) return; cat = b.dataset.f; render(); });
    sortSel.addEventListener("change", () => { sort = sortSel.value; render(); });
    disp.addEventListener("change", () => { onlyAvail = disp.checked; render(); });
    let tm; q.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(() => { term = q.value.trim(); render(); }, 150); });
    const c0 = params.get("cat"), o0 = params.get("ordem");
    if (c0 && catOf(c0)) cat = c0;
    if (o0 && [...sortSel.options].some(o => o.value === o0)) { sort = o0; sortSel.value = o0; }
    if (params.get("q")) { term = params.get("q"); q.value = term; }
    if (params.get("disp") === "1") { onlyAvail = true; disp.checked = true; }
    render(false);
    if (location.hash === "#procurar") setTimeout(() => q.focus(), 60);
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
    document.title = `${p.nome} · Bancada Encarnada`;
    const setMeta = (sel, attr, v) => { const m = $(sel); if (m) m[attr] = v; };
    setMeta('meta[name="description"]', "content", p.resumo);
    setMeta('meta[property="og:title"]', "content", p.nome + " · Bancada Encarnada");
    setMeta('meta[property="og:description"]', "content", p.resumo);
    if (p.imagens[0]) setMeta('meta[property="og:image"]', "content", (CFG.siteUrl || "") + "/assets/images/" + p.imagens[0] + ".jpg");
    setMeta('link[rel="canonical"]', "href", (CFG.siteUrl || "") + "/produto.html?p=" + p.slug);
    const ld = { "@context": "https://schema.org", "@type": "Product", name: p.nome, description: p.resumo, category: cat.nome, brand: { "@type": "Brand", name: "Bancada Encarnada" } };
    if (p.imagens[0]) ld.image = (CFG.siteUrl || "") + "/assets/images/" + p.imagens[0] + ".jpg";
    if (!prep) ld.offers = { "@type": "Offer", priceCurrency: "EUR", price: p.preco.toFixed(2), availability: "https://schema.org/PreOrder", url: (CFG.siteUrl || "") + "/produto.html?p=" + p.slug };
    const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);

    const li = xs => xs && xs.length ? "<ul>" + xs.map(x => `<li>${esc(x)}</li>`).join("") + "</ul>" : "";
    const pic = n => picture(n, p.nome, "(min-width: 960px) 50vw, 100vw", 'fetchpriority="high" width="1200" height="1600"');
    const gal = p.imagens.length
      ? `<div class="main" id="galMain">${pic(p.imagens[0])}</div>` + (p.imagens.length > 1 ? `<div class="thumbs" id="galThumbs">${p.imagens.map((n, i) => `<button type="button" data-n="${n}" aria-current="${i === 0}" aria-label="Ver imagem ${i + 1} de ${p.imagens.length}"><img src="assets/images/${n}-800.webp" alt="" loading="lazy"></button>`).join("")}</div>` : "") + `<p class="note">Fotografias de apresentação. Cada peça é feita à mão e pode ter pequenas diferenças.</p>`
      : `<div class="main"><div class="ph-empty"><span>Fotografia em breve, quando tivermos a amostra aprovada.</span></div></div>`;
    const max = p.persMax || 20;
    const buy = prep
      ? `<div class="buy"><button class="btn btn-lg btn-block is-off" type="button" disabled>Em breve</button><a class="btn btn-line btn-lg btn-block" href="index.html#clube">Avisa-me quando sair</a><p class="note">${p.exemplo ? "Esta peça é um exemplo do que vai entrar nesta categoria. Ainda não tem preço, fornecedor nem data. " : ""}Os membros do Clube da Bancada são avisados primeiro. Dúvidas? <a class="link" data-mail data-subject="Pergunta sobre ${esc(p.nome)}" href="#">Escreve-nos</a>.</p></div>`
      : `<form class="buy" id="buy" novalidate>
  ${(p.variantes || []).map((v, i) => `<fieldset class="optset"><legend>${esc(v.nome)}: <b id="sel${i}">${esc(v.opcoes[0])}</b></legend><div class="pills">${v.opcoes.map((o, j) => `<label class="pill"><input type="radio" name="v${i}" value="${esc(o)}" data-var="${esc(v.nome)}" data-i="${i}" ${j === 0 ? "checked" : ""}><span>${esc(o)}</span></label>`).join("")}</div></fieldset>`).join("")}
  <div class="field"><label for="pers">Personalização <span class="opt-tag">opcional, sem custo</span></label><input id="pers" type="text" maxlength="${max}" placeholder="Nome ou número" autocomplete="off"><span class="hint"><span>${esc(p.personalizacao || "")}</span><span id="persCount">0/${max}</span></span></div>
  <div class="field"><label for="qty">Quantidade</label><div class="buy-row"><div class="qty lg"><button type="button" data-d="-1" aria-label="Menos uma">−</button><input id="qty" type="number" inputmode="numeric" min="1" max="20" value="1" aria-label="Quantidade"><button type="button" data-d="1" aria-label="Mais uma">+</button></div><button class="btn btn-red btn-lg btn-block" type="submit" id="addBtn">Adicionar ao carrinho</button></div></div>
  <button class="btn btn-coal btn-lg btn-block" type="button" id="buyNow">Comprar agora</button>
</form>`;
    const rel = (p.relacionados || []).map(s => bySlug[s]).filter(Boolean).slice(0, 4);
    const inclui = p.inclui ? `<p><b>Inclui:</b> ${p.inclui.map(s => (bySlug[s] || {}).nome).filter(Boolean).map(esc).join(" e ")}.</p>` : "";
    host.innerHTML = `<div class="wrap">
  <nav class="crumbs" aria-label="Caminho"><a href="index.html">Início</a><span><a href="loja.html">Loja</a></span><span><a href="loja.html?cat=${cat.slug}">${esc(cat.nome)}</a></span><span aria-current="page">${esc(p.nome)}</span></nav>
  <div class="prod-grid">
    <div class="gallery">${gal}</div>
    <div class="pinfo">
      <span class="vendor">Bancada Encarnada · ${esc(cat.nome)}</span>
      <h1>${esc(p.nome)}</h1>
      <div class="price-row">${prep ? '<span class="price muted">Preço a anunciar</span><span class="badge inline">Em breve</span>' : `<span class="price">${eur(p.preco)}</span>${p.etiqueta ? `<span class="badge inline red">${esc(p.etiqueta)}</span>` : ""}`}</div>
      ${prep ? "" : `<p class="tax">IVA incluído. Portes calculados no carrinho${p.portesIncluidos ? ", mas esta peça já os inclui" : ""}.</p>`}
      ${p.promo && !prep ? `<p class="promo-note">Leva ${p.promo.qtd} por ${eur(p.promo.preco)}. O desconto aplica-se sozinho no carrinho.</p>` : ""}
      <p class="desc-short">${esc(p.resumo)}</p>
      ${buy}
      <ul class="trust"><li>${ICON.pt}<span>Feito à mão em Portugal, à encomenda</span></li><li>${ICON.box}<span>Envio por ${esc(COM.envio || "")}${prep ? "" : `, ${esc(prazoTxt(p))}`}</span></li><li>${ICON.ret}<span>${esc(COM.devolucoesDias)} dias para devolver peças sem personalização</span></li></ul>
      <div class="acc">
        <details open><summary>Descrição</summary><div class="ab"><p>${esc(p.descricao)}</p>${inclui}</div></details>
        <details><summary>Materiais e medidas</summary><div class="ab">${li(p.materiais)}<p style="margin-top:8px"><b>Medidas:</b> ${esc(p.medidas || "")}</p><p><b>Técnica:</b> ${esc(p.tecnica)}</p></div></details>
        <details><summary>Personalização</summary><div class="ab"><p>${esc(p.personalizacao || "Sem personalização.")}</p><p>Confirmamos sempre o texto contigo por email antes de produzir.</p></div></details>
        <details><summary>Produção e envio</summary><div class="ab"><p>Cada peça é feita quando a encomendas. Prazo: ${esc(prazoTxt(p))}.</p><p>Envio por ${esc(COM.envio || "")}: ${eur(COM.portesPT)} em ${esc(COM.zona || "")}, grátis acima de ${eur(COM.portesGratisAcima)}. Açores e Madeira sob consulta.</p></div></details>
        ${p.cuidados && p.cuidados.length ? `<details><summary>Cuidados</summary><div class="ab">${li(p.cuidados)}</div></details>` : ""}
        <details><summary>Trocas e devoluções</summary><div class="ab"><p>${esc(COM.devolucoesDias)} dias para devolver peças sem personalização. Peças com defeito são substituídas sem custos. <a class="link" href="devolucoes.html">Ler a política completa</a>.</p></div></details>
      </div>
    </div>
  </div>
  ${rel.length ? `<section class="related" aria-labelledby="h-rel"><h2 id="h-rel">Também podes gostar</h2><div class="grid g4">${rel.map(card).join("")}</div></section>` : ""}
</div>`;
    wireLinks(host);

    const main = $("#galMain");
    $$("#galThumbs button").forEach(b => b.addEventListener("click", () => { main.innerHTML = pic(b.dataset.n); $$("#galThumbs button").forEach(x => x.setAttribute("aria-current", x === b)); }));

    const f = $("#buy");
    if (f) {
      const qty = $("#qty"), pers = $("#pers"), pc = $("#persCount"), addBtn = $("#addBtn");
      f.addEventListener("change", e => { if (e.target.matches("input[type=radio]")) $("#sel" + e.target.dataset.i).textContent = e.target.value; });
      $$(".qty button", f).forEach(b => b.addEventListener("click", () => { qty.value = Math.max(1, Math.min(20, (+qty.value || 1) + +b.dataset.d)); }));
      qty.addEventListener("change", () => { qty.value = Math.max(1, Math.min(20, Math.round(+qty.value) || 1)); });
      pers.addEventListener("input", () => { pc.textContent = pers.value.length + "/" + max; });
      const read = () => { const variantes = {}; $$("input[type=radio]:checked", f).forEach(r => variantes[r.dataset.var] = r.value); return { variantes, pers: pers.value.trim(), qty: Math.max(1, Math.min(20, +qty.value || 1)) }; };
      f.addEventListener("submit", e => { e.preventDefault(); window.BE_CART.add(p.slug, read()); addBtn.textContent = "Adicionado ✓"; setTimeout(() => addBtn.textContent = "Adicionar ao carrinho", 1600); window.BE_CART.open(); });
      $("#buyNow").addEventListener("click", () => { window.BE_CART.add(p.slug, read()); location.assign("encomenda.html"); });
    }
  }
})();
