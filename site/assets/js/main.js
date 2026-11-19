/* =====================================================================
   BANCADA ENCARNADA · comportamento partilhado por todas as páginas
   Header, footer, ligações, Clube, sondagem, mural, helpers de produto.
   ===================================================================== */
(function () {
  const CFG = window.BE_CONFIG || {}, DATA = window.BE_DATA || {}, PROD = window.BE_PRODUCTS || { categorias: [], produtos: [] };
  const C = CFG.contacto || {}, COM = CFG.comercial || {}, M = CFG.marca || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const eur = v => v == null ? "" : v.toFixed(2).replace(".", ",") + " €";
  const porPreencher = v => v == null || v === "" || (typeof v === "string" && /^\[.*\]$/.test(v));
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const hasWA = /^\d{9,15}$/.test(C.whatsapp || "");
  const wa = m => hasWA ? "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(m) : "#";

  /* imagens: WebP com fallback JPEG. Larguras disponíveis por nome. */
  const SIZES = { "bancada-tall": [800] };
  const picture = (name, alt, sizes = "(min-width: 900px) 50vw, 100vw", attrs = "", cls = "") => {
    const ws = SIZES[name] || [800, 1200, 1600];
    const ss = ws.map(w => `assets/images/${name}-${w}.webp ${w}w`).join(", ");
    return `<picture${cls ? ` class="${cls}"` : ""}><source type="image/webp" srcset="${ss}" sizes="${sizes}"><img src="assets/images/${name}.jpg" alt="${esc(alt)}" ${attrs}></picture>`;
  };

  /* ---------- header + footer ---------- */
  const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';
  const NAV = [["index.html", "Início"], ["loja.html", "Loja"], ["comunidade.html", "Comunidade"], ["sobre.html", "Sobre nós"], ["contactos.html", "Contactos"]];
  const brand = () => `<a class="brand" href="index.html" aria-label="${esc(M.nome || "Bancada Encarnada")}, início"><span class="mono" aria-hidden="true">B</span><span>Bancada Encarnada<small>Cultura benfiquista</small></span></a>`;
  const headerHost = $("#site-header");
  if (headerHost) {
    headerHost.outerHTML = `<a class="skip" href="#main">Saltar para o conteúdo</a>
${CFG.preview ? '<div class="preview-note"><b>Pré-visualização.</b> Os campos assinalados ainda estão por preencher. Este aviso desaparece com <code>preview: false</code> em config.js.</div>' : ""}
<header class="site-header" id="siteHeader"><div class="in">
  ${brand()}
  <nav class="site-nav" aria-label="Páginas"><ul>${NAV.map(([h, l]) => `<li><a href="${h}"${h === page ? ' aria-current="page"' : ""}>${l}</a></li>`).join("")}</ul></nav>
  <div class="right"><a class="btn btn-red btn-sm" href="loja.html">Explorar a loja</a><button class="burger" id="burger" aria-label="Abrir menu" aria-expanded="false" aria-controls="drawer"><span></span></button></div>
</div></header>
<div class="drawer" id="drawer" aria-hidden="true">
  <div class="top">${brand()}<button class="close" id="drawerClose" aria-label="Fechar menu">✕</button></div>
  <nav aria-label="Menu">${NAV.map(([h, l], i) => `<a href="${h}">${l}<small>0${i + 1}</small></a>`).join("")}</nav>
  <div class="foot"><a class="btn btn-wa" data-wa data-msg="Olá! Vi o site da Bancada Encarnada e queria encomendar." href="#">${WA_ICON}WhatsApp</a><a class="btn btn-line" data-ig-profile href="#">Instagram</a></div>
</div>`;
  }
  const footerHost = $("#site-footer");
  if (footerHost) {
    footerHost.outerHTML = `<footer class="site-footer"><div class="wrap">
  <div class="cols">
    <div>${brand()}<p class="tagline">${esc(M.slogan || "")}</p><p style="margin-top:12px;max-width:38ch">Comunidade independente de benfiquistas e loja de peças originais feitas em Portugal.</p></div>
    <div><h4>Comunidade</h4><ul><li><a href="comunidade.html">A bancada</a></li><li><a href="comunidade.html#semana">Esta semana</a></li><li><a href="comunidade.html#mural">Mural Encarnado</a></li><li><a href="comunidade.html#historias">Histórias de adeptos</a></li><li><a href="index.html#clube">Clube da Bancada</a></li></ul></div>
    <div><h4>Loja</h4><ul><li><a href="loja.html">Toda a coleção</a></li>${PROD.categorias.map(c => `<li><a href="loja.html?cat=${c.slug}">${esc(c.nome)}</a></li>`).join("")}<li><a href="sobre.html#producao">Como fazemos</a></li></ul></div>
    <div><h4>Apoio e legal</h4><ul><li><a href="contactos.html">Contactos e perguntas</a></li><li><a href="termos.html">Termos de venda</a></li><li><a href="devolucoes.html">Trocas e devoluções</a></li><li><a href="privacidade.html">Política de privacidade</a></li><li><a href="${esc((CFG.legal || {}).livroReclamacoes || "https://www.livroreclamacoes.pt/")}" target="_blank" rel="noopener">Livro de Reclamações</a></li></ul></div>
  </div>
  <div class="legal"><span>© ${new Date().getFullYear()} ${esc(M.nome || "Bancada Encarnada")}. ${esc(M.independente || "")}</span><span>Feito em Portugal.</span></div>
</div></footer>
<a class="float-wa" id="floatWa" data-wa data-msg="Olá! Vi o site da Bancada Encarnada e queria encomendar." href="#" aria-label="Falar no WhatsApp">${WA_ICON}</a>`;
  }

  /* ---------- ligações e configuração ---------- */
  const ext = a => { a.target = "_blank"; a.rel = "noopener"; };
  const wireLinks = (root = document) => {
    $$("[data-wa]", root).forEach(a => {
      if (hasWA) { a.href = wa(a.dataset.msg || "Olá!"); ext(a); a.classList.remove("is-off"); a.removeAttribute("aria-disabled"); }
      else { a.href = "#"; a.classList.add("is-off"); a.setAttribute("aria-disabled", "true"); a.title = "Número de WhatsApp por preencher em config.js"; a.addEventListener("click", e => e.preventDefault()); }
    });
    $$("[data-ig]", root).forEach(a => { a.href = "https://ig.me/m/" + C.instagram; ext(a); });
    $$("[data-ig-profile]", root).forEach(a => { a.href = "https://www.instagram.com/" + C.instagram + "/"; ext(a); });
    $$("[data-tt]", root).forEach(a => { a.href = "https://www.tiktok.com/@" + C.tiktok; ext(a); });
    $$("[data-mail]", root).forEach(a => { if (porPreencher(C.email)) { a.href = "#"; a.classList.add("is-off"); a.title = "Email por preencher em config.js"; a.addEventListener("click", e => e.preventDefault()); } else a.href = "mailto:" + C.email; });
    const get = p => p.split(".").reduce((o, k) => (o == null ? o : o[k]), CFG);
    $$("[data-cfg]", root).forEach(el => {
      let v = get(el.dataset.cfg);
      if (typeof v === "number") v = el.dataset.fmt === "eur" ? eur(v) : String(v);
      if (Array.isArray(v)) v = v.join(" ou ");
      if (v == null) return;
      const empty = porPreencher(v);
      el.textContent = empty && v === "" ? "[por preencher]" : v;
      if (CFG.preview && empty) el.classList.add("por-preencher");
    });
  };
  wireLinks();
  if (CFG.preview && !hasWA) { const b = $(".site-header [data-wa], #floatWa"); }

  /* ---------- navegação ---------- */
  const hdr = $("#siteHeader"), fw = $("#floatWa");
  const onScroll = () => { if (hdr) hdr.classList.toggle("scrolled", scrollY > 10); if (fw) fw.classList.toggle("show", scrollY > 500); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const drawer = $("#drawer"), burger = $("#burger"), dclose = $("#drawerClose");
  if (drawer && burger) {
    let last = null;
    const set = s => { drawer.classList.toggle("show", s); drawer.setAttribute("aria-hidden", !s); burger.setAttribute("aria-expanded", s); document.body.style.overflow = s ? "hidden" : ""; if (s) { last = document.activeElement; dclose.focus(); } else if (last) last.focus(); };
    burger.addEventListener("click", () => set(true)); dclose.addEventListener("click", () => set(false));
    $$("a", drawer).forEach(a => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", e => {
      if (!drawer.classList.contains("show")) return;
      if (e.key === "Escape") set(false);
      if (e.key === "Tab") { const f = $$("a,button", drawer), first = f[0], lastEl = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); } else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); } }
    });
  }

  /* ---------- reveal e vídeos ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  const reveal = el => reduce ? el.classList.add("in") : io.observe(el);
  $$(".rv").forEach(reveal);
  $$("video[autoplay]").forEach(v => { if (reduce || (navigator.connection && navigator.connection.saveData)) v.remove(); else v.play().catch(() => {}); });
  if ("IntersectionObserver" in window && !reduce) {
    const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }), { threshold: .2 });
    $$("[data-lazyvideo]").forEach(v => vio.observe(v));
  }

  /* ---------- produtos: cartão partilhado ---------- */
  const prazoTxt = p => ({ "3d": COM.prazo3d, dtf: COM.prazoDTF, sublimacao: COM.prazoSublimacao }[p.prazo] || p.prazo || "");
  const card = p => {
    const prep = p.estado !== "disponivel";
    const ph = p.imagens && p.imagens.length ? picture(p.imagens[0], p.nome, "(min-width: 1024px) 25vw, (min-width: 720px) 45vw, 100vw", 'loading="lazy" decoding="async" width="1200" height="1600"') : '<div class="ph-empty"><span>Fotografia quando houver amostra aprovada</span></div>';
    const tag = p.etiqueta ? `<span class="tag ${prep ? "prep" : "red"}">${esc(p.etiqueta)}</span>` : "";
    const price = prep ? '<div class="price prep">Preço a anunciar</div>' : `<div class="price">${eur(p.preco)}<small>${esc(p.precoNota || "")}</small></div>`;
    return `<a class="pcard" href="produto.html?p=${p.slug}" data-cat="${p.categoria}" data-estado="${p.estado}" data-preco="${p.preco == null ? "" : p.preco}" data-data="${p.adicionado || ""}">
  <div class="ph">${ph}${tag}</div>
  <div class="body"><span class="tec">${esc(p.tecnica)}</span><h3>${esc(p.nome)}</h3><p>${esc(p.resumo)}</p>${price}<span class="estado${prep ? " prep" : ""}">${prep ? "Em preparação" : "Disponível por encomenda"}</span></div>
</a>`;
  };
  const dest = $("#destaques");
  if (dest) { dest.innerHTML = PROD.produtos.filter(p => p.destaque).slice(0, 4).map(card).join(""); }

  /* ---------- Clube da Bancada ---------- */
  $$("form.clube-form").forEach(form => {
    const fs = $(".status", form), fb = $("button[type=submit]", form), NL = CFG.newsletter || {};
    const show = (cls, html) => { fs.className = "status show " + cls; fs.innerHTML = html; wireLinks(fs); };
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (form.website && form.website.value) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const nome = form.nome.value.trim(), email = form.email.value.trim();
      if (!NL.endpoint) {
        const msg = "Olá! Quero entrar no Clube da Bancada. Nome: " + nome + ". Email: " + email + ". Autorizo o envio de novidades por email.";
        show("warn", "<b>O registo automático ainda não está ligado.</b> Para já, entra no Clube por mensagem: guardamos o teu contacto à mão e confirmamos contigo." + (hasWA ? `<br><a class="btn btn-wa btn-sm" data-wa data-msg="${esc(msg)}" href="#">Entrar pelo WhatsApp</a>` : (porPreencher(C.email) ? "<br><small>Os contactos ainda não estão preenchidos em config.js.</small>" : `<br><a class="btn btn-coal btn-sm" href="mailto:${esc(C.email)}?subject=Clube%20da%20Bancada&body=${encodeURIComponent(msg)}">Entrar por email</a>`)));
        return;
      }
      fb.disabled = true; fb.textContent = "A enviar…";
      try {
        const r = await fetch(NL.endpoint, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ nome, email, consentimento: true, origem: "site:" + page, data: new Date().toISOString(), provider: NL.provider || "" }) });
        if (r.ok) { show("ok", "<b>Falta só confirmares.</b> Enviámos um email para " + esc(email) + " com um botão de confirmação. Só depois de carregares é que ficas no Clube. Se não chegar em alguns minutos, vê a pasta de spam."); form.reset(); }
        else show("err", "Não conseguimos registar agora. Tenta outra vez daqui a pouco.");
      } catch (err) { show("err", "Sem ligação ao serviço de registo. Tenta outra vez daqui a pouco."); }
      fb.disabled = false; fb.textContent = "Marcar o meu lugar";
    });
  });

  /* ---------- Esta semana + sondagem ---------- */
  const SEM = DATA.semana, pollEl = $("#poll");
  if (pollEl && SEM && SEM.pergunta) {
    const P = SEM.pergunta, V = CFG.votos || {}, remote = !!(V.url && V.anonKey);
    const KEY = "be-" + P.id, SKEY = "be-sessao";
    let sessao; try { sessao = localStorage.getItem(SKEY) || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()); localStorage.setItem(SKEY, sessao); } catch (e) { sessao = "anon"; }
    const opts = $("#opts"), st = $("#pollStatus"), rst = $("#pollReset"), demo = $("#pollDemo"), qEl = $("#pollQ");
    if (qEl) qEl.textContent = P.texto; if (demo) demo.hidden = remote;
    const fmtData = s => new Date(s + "T00:00:00").toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
    const loadLocal = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { votes: P.opcoes.map(() => 0), mine: null }; } catch (e) { return { votes: P.opcoes.map(() => 0), mine: null }; } };
    const saveLocal = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
    const headers = { apikey: V.anonKey, Authorization: "Bearer " + V.anonKey, "Content-Type": "application/json" };
    const fetchRemote = async () => { const r = await fetch(`${V.url}/rest/v1/${V.tabela || "votos"}?poll_id=eq.${encodeURIComponent(P.id)}&select=opcao,sessao`, { headers }); if (!r.ok) throw new Error(r.status); const rows = await r.json(); const votes = P.opcoes.map(() => 0); let mine = null; rows.forEach(x => { if (votes[x.opcao] != null) votes[x.opcao]++; if (x.sessao === sessao) mine = x.opcao; }); return { votes, mine }; };
    const draw = (d, note) => {
      const total = d.votes.reduce((a, b) => a + b, 0), voted = d.mine !== null;
      pollEl.classList.toggle("voted", voted); opts.innerHTML = "";
      P.opcoes.forEach((label, i) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "opt" + (d.mine === i ? " mine" : ""); b.disabled = voted; b.setAttribute("aria-pressed", d.mine === i);
        const pct = total ? Math.round(d.votes[i] / total * 100) : 0;
        b.innerHTML = `<span class="bar" style="width:${voted ? pct : 0}%"></span><span class="lbl"></span><span class="pct">${voted ? pct + "%" : ""}</span>`;
        $(".lbl", b).textContent = label; b.addEventListener("click", () => vote(i, label)); opts.appendChild(b);
      });
      if (rst) rst.hidden = !voted || remote;
      st.textContent = note || (voted ? (remote ? `Já votaste. ${total} ${total === 1 ? "voto" : "votos"} da bancada até agora.${P.fecha ? " Fecha a " + fmtData(P.fecha) + "." : ""}` : `Já votaste neste dispositivo. Os números são só os votos guardados aqui (${total}), não os da comunidade.`) : (remote ? `Escolhe uma opção. Um voto por pessoa.${P.fecha ? " Fecha a " + fmtData(P.fecha) + "." : ""}` : "Escolhe uma opção. Os votos ficam só neste dispositivo até ligarmos a sondagem à comunidade."));
    };
    const vote = async (i, label) => {
      if (remote) { st.textContent = "A registar o voto…"; try { const r = await fetch(`${V.url}/rest/v1/${V.tabela || "votos"}`, { method: "POST", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ poll_id: P.id, opcao: i, sessao }) }); if (!r.ok) throw new Error(r.status); draw(await fetchRemote(), "Obrigado! O teu voto conta: " + label + "."); } catch (e) { st.textContent = "Não conseguimos registar o voto agora. Tenta outra vez daqui a pouco."; } }
      else { const n = loadLocal(); if (n.mine !== null) return; n.votes[i]++; n.mine = i; saveLocal(n); draw(n, "Ficou registado neste dispositivo: " + label + ". Quando a sondagem estiver ligada à comunidade, os resultados passam a ser de toda a bancada."); }
    };
    if (rst) rst.addEventListener("click", () => { try { localStorage.removeItem(KEY); } catch (e) {} draw(loadLocal(), "Voto apagado. Podes voltar a escolher."); });
    if (remote) { draw({ votes: P.opcoes.map(() => 0), mine: null }, "A carregar os votos…"); fetchRemote().then(d => draw(d)).catch(() => draw(loadLocal(), "Sem ligação ao serviço de votos. Mostramos só o que está neste dispositivo.")); } else draw(loadLocal());
  }
  if (SEM) {
    const n = $("#semNovidade"); if (n && SEM.novidade) { $(".k", n).textContent = SEM.novidade.titulo || "Novidade"; $("p", n).textContent = SEM.novidade.texto || ""; const a = $("a", n); if (a) { if (SEM.novidade.ligacao) { a.href = SEM.novidade.ligacao; a.textContent = SEM.novidade.ligacaoTexto || "Ver"; } else a.hidden = true; } }
    const t = $("#semTitulo"); if (t && SEM.titulo) t.textContent = SEM.titulo;
  }
  const memTxt = $("#memTxt"), memCount = $("#memCount"), memWa = $("#memWa");
  if (memTxt && memWa) { const base = memWa.dataset.msg; memTxt.addEventListener("input", () => { if (memCount) memCount.textContent = memTxt.value.length + " / " + memTxt.maxLength; if (hasWA) memWa.href = wa(base + memTxt.value.trim()); }); }

  /* ---------- mural e histórias ---------- */
  const mg = $("#muralGrid");
  if (mg && DATA.mural && DATA.mural.length) {
    mg.innerHTML = DATA.mural.map(it => `<figure><img src="${esc(it.imagem)}" alt="${esc(it.alt || "")}" loading="lazy" decoding="async" width="800" height="1000"><figcaption><b>${esc(it.frase || "")}</b><span>${esc([it.autor, it.local].filter(Boolean).join(" · "))}</span></figcaption></figure>`).join("");
    mg.hidden = false; const e = $("#muralEmpty"); if (e) e.hidden = true;
  }
  const hs = $("#historias");
  if (hs && DATA.historias && DATA.historias.length) {
    hs.innerHTML = DATA.historias.map(h => `<article class="story"><h3>${esc(h.titulo)}</h3><p>${esc(h.texto)}</p><span class="by">${esc([h.autor, h.local].filter(Boolean).join(" · "))}</span></article>`).join("");
    const e = $("#historiasEmpty"); if (e) e.hidden = true;
  }

  window.BE = { CFG, PROD, DATA, esc, eur, wa, hasWA, picture, card, prazoTxt, wireLinks, reveal };
})();
