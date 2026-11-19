/* =====================================================================
   BANCADA ENCARNADA · comportamento partilhado por todas as páginas
   Header, footer, ligações (email e redes), Clube, sondagem, mural.
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
  const hasMail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(C.email || "");
  const mailto = (subject, body) => hasMail ? "mailto:" + C.email + "?subject=" + encodeURIComponent(subject || "") + (body ? "&body=" + encodeURIComponent(body) : "") : "#";

  /* imagens: WebP com fallback JPEG */
  const SIZES = { "bancada-tall": [800] };
  const picture = (name, alt, sizes = "(min-width: 900px) 50vw, 100vw", attrs = "") => {
    const ss = (SIZES[name] || [800, 1200, 1600]).map(w => `assets/images/${name}-${w}.webp ${w}w`).join(", ");
    return `<picture><source type="image/webp" srcset="${ss}" sizes="${sizes}"><img src="assets/images/${name}.jpg" alt="${esc(alt)}" ${attrs}></picture>`;
  };

  /* ícones */
  const I = {
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 3c.3 2.3 1.7 3.8 4 4v3.2c-1.5 0-2.9-.5-4-1.3v6.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.3a2.4 2.4 0 1 0 1.5 2.2V3h3.2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };
  window.BE_ICONS = I;

  /* ---------- header + footer ---------- */
  const NAV = [["index.html", "Início"], ["loja.html", "Loja"], ["comunidade.html", "Comunidade"], ["sobre.html", "Sobre nós"], ["contactos.html", "Contactos"]];
  const brand = () => `<a class="brand" href="index.html" aria-label="${esc(M.nome || "Bancada Encarnada")}, início"><span class="mono" aria-hidden="true">B</span><span>Bancada Encarnada<small>Cultura benfiquista</small></span></a>`;
  const headerHost = $("#site-header");
  if (headerHost) {
    headerHost.outerHTML = `<a class="skip" href="#main">Saltar para o conteúdo</a>
${CFG.preview ? '<div class="preview-note"><b>Pré-visualização.</b> Os campos assinalados ainda estão por preencher. Este aviso desaparece com <code>preview: false</code> em config.js.</div>' : ""}
<div class="announce">Portes grátis em ${esc(COM.zona || "Portugal continental")} acima de ${eur(COM.portesGratisAcima)} <span aria-hidden="true">·</span> Feito em Portugal <span aria-hidden="true">·</span> ${esc(COM.devolucoesDias)} dias para devolver</div>
<header class="site-header" id="siteHeader"><div class="in">
  ${brand()}
  <nav class="site-nav" aria-label="Páginas"><ul>${NAV.map(([h, l]) => `<li><a href="${h}"${h === page ? ' aria-current="page"' : ""}>${l}</a></li>`).join("")}</ul></nav>
  <div class="right">
    <a class="icon-btn" href="loja.html#procurar" aria-label="Procurar na loja">${I.search}</a>
    <button class="icon-btn" id="cartBtn" type="button" aria-label="Abrir carrinho" aria-controls="cart" aria-expanded="false">${I.bag}<span class="cart-count" id="cartCount" hidden>0</span></button>
    <button class="burger" id="burger" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="drawer"><span></span></button>
  </div>
</div></header>
<div class="drawer" id="drawer" aria-hidden="true">
  <div class="top">${brand()}<button class="close" id="drawerClose" type="button" aria-label="Fechar menu">✕</button></div>
  <nav aria-label="Menu">${NAV.map(([h, l], i) => `<a href="${h}">${l}<small>0${i + 1}</small></a>`).join("")}</nav>
  <div class="foot"><a class="btn btn-coal" data-mail data-subject="Contacto pelo site" href="#">${I.mail}Email</a><a class="btn btn-line" data-ig-profile href="#">${I.ig}Instagram</a></div>
</div>`;
  }
  const footerHost = $("#site-footer");
  if (footerHost) {
    footerHost.outerHTML = `<footer class="site-footer"><div class="wrap">
  <div class="cols">
    <div>${brand()}<p class="tagline">${esc(M.slogan || "")}</p><p style="margin-top:12px;max-width:38ch">Comunidade independente de benfiquistas e loja de peças originais feitas em Portugal.</p>
      <div class="socials"><a data-ig-profile href="#" aria-label="Instagram">${I.ig}</a><a data-tt href="#" aria-label="TikTok">${I.tt}</a><a data-mail data-subject="Contacto pelo site" href="#" aria-label="Email">${I.mail}</a></div></div>
    <div><h4>Comunidade</h4><ul><li><a href="comunidade.html">A bancada</a></li><li><a href="comunidade.html#semana">Esta semana</a></li><li><a href="comunidade.html#mural">Mural Encarnado</a></li><li><a href="comunidade.html#historias">Histórias de adeptos</a></li><li><a href="index.html#clube">Clube da Bancada</a></li></ul></div>
    <div><h4>Loja</h4><ul><li><a href="loja.html">Toda a coleção</a></li>${PROD.categorias.map(c => `<li><a href="loja.html?cat=${c.slug}">${esc(c.nome)}</a></li>`).join("")}<li><a href="sobre.html#producao">Como fazemos</a></li></ul></div>
    <div><h4>Apoio</h4><ul><li><a href="contactos.html">Contactos</a></li><li><a href="contactos.html#faq">Perguntas frequentes</a></li><li><a href="termos.html">Termos de venda</a></li><li><a href="devolucoes.html">Trocas e devoluções</a></li><li><a href="privacidade.html">Política de privacidade</a></li><li><a href="${esc((CFG.legal || {}).livroReclamacoes || "https://www.livroreclamacoes.pt/")}" target="_blank" rel="noopener">Livro de Reclamações</a></li></ul></div>
  </div>
  <div class="legal"><span>© ${new Date().getFullYear()} ${esc(M.nome || "Bancada Encarnada")}. ${esc(M.independente || "")}</span><span>Pagamentos: ${esc((COM.pagamentos || []).join(" · "))}</span></div>
</div></footer>`;
  }

  /* ---------- ligações e configuração ---------- */
  const ext = a => { a.target = "_blank"; a.rel = "noopener"; };
  const off = (a, why) => { a.href = "#"; a.classList.add("is-off"); a.setAttribute("aria-disabled", "true"); a.title = why; if (!a.dataset.offBound) { a.dataset.offBound = "1"; a.addEventListener("click", e => { if (a.classList.contains("is-off")) e.preventDefault(); }); } };
  const wireLinks = (root = document) => {
    $$("[data-mail]", root).forEach(a => { if (hasMail) { a.href = mailto(a.dataset.subject, a.dataset.body); a.classList.remove("is-off"); a.removeAttribute("aria-disabled"); } else off(a, "Email da loja por preencher em config.js"); });
    $$("[data-ig]", root).forEach(a => { a.href = "https://ig.me/m/" + C.instagram; ext(a); });
    $$("[data-ig-profile]", root).forEach(a => { a.href = "https://www.instagram.com/" + C.instagram + "/"; ext(a); });
    $$("[data-tt]", root).forEach(a => { a.href = "https://www.tiktok.com/@" + C.tiktok; ext(a); });
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

  /* ---------- navegação ---------- */
  const hdr = $("#siteHeader");
  const onScroll = () => { if (hdr) hdr.classList.toggle("scrolled", scrollY > 10); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const trap = (box, e) => { const f = $$("a[href],button:not([disabled]),input,select,textarea", box).filter(x => x.offsetParent !== null); if (!f.length) return; const a = f[0], b = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); } else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); } };
  const drawer = $("#drawer"), burger = $("#burger"), dclose = $("#drawerClose");
  if (drawer && burger) {
    let last = null;
    const set = s => { drawer.classList.toggle("show", s); drawer.setAttribute("aria-hidden", !s); burger.setAttribute("aria-expanded", s); document.body.style.overflow = s ? "hidden" : ""; if (s) { last = document.activeElement; dclose.focus(); } else if (last) last.focus(); };
    burger.addEventListener("click", () => set(true)); dclose.addEventListener("click", () => set(false));
    $$("a", drawer).forEach(a => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", e => { if (!drawer.classList.contains("show")) return; if (e.key === "Escape") set(false); if (e.key === "Tab") trap(drawer, e); });
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

  /* ---------- cartão de produto (estilo loja) ---------- */
  const prazoTxt = p => ({ "3d": COM.prazo3d, dtf: COM.prazoDTF, sublimacao: COM.prazoSublimacao }[p.prazo] || p.prazo || "");
  const card = p => {
    const prep = p.estado !== "disponivel";
    const img = p.imagens && p.imagens.length
      ? picture(p.imagens[0], p.nome, "(min-width: 1024px) 25vw, (min-width: 720px) 45vw, 50vw", 'loading="lazy" decoding="async" width="1200" height="1600"') + (p.imagens[1] ? `<img class="alt" src="assets/images/${p.imagens[1]}-800.webp" alt="" loading="lazy" aria-hidden="true">` : "")
      : '<div class="ph-empty"><span>Fotografia em breve</span></div>';
    const badge = prep ? '<span class="badge">Em breve</span>' : (p.etiqueta ? `<span class="badge red">${esc(p.etiqueta)}</span>` : "");
    const price = prep ? '<span class="price muted">Preço a anunciar</span>' : `<span class="price">${eur(p.preco)}</span>`;
    return `<a class="pcard${prep ? " is-prep" : ""}" href="produto.html?p=${p.slug}" data-cat="${p.categoria}" data-estado="${p.estado}"><div class="ph">${img}${badge}</div><div class="body"><h3>${esc(p.nome)}</h3>${price}</div></a>`;
  };
  const dest = $("#destaques");
  if (dest) dest.innerHTML = PROD.produtos.filter(p => p.destaque).slice(0, 4).map(card).join("");

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
        const body = `Olá! Quero entrar no Clube da Bancada.\n\nNome: ${nome}\nEmail: ${email}\n\nAutorizo o envio de novidades da comunidade e da coleção por email.`;
        show("warn", "<b>O registo automático ainda não está ligado.</b> Para já, a adesão faz-se por email: abre a mensagem já escrita e envia. Confirmamos a tua entrada na resposta." +
          (hasMail ? `<br><a class="btn btn-coal btn-sm" data-mail data-subject="Clube da Bancada" data-body="${esc(body)}" href="#">Enviar adesão por email</a>` : "<br><small>O email da loja ainda não está preenchido em config.js.</small>"));
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
    const n = $("#semNovidade"); if (n && SEM.novidade) { $(".k", n).textContent = SEM.novidade.titulo || "Novidade"; $("p", n).textContent = SEM.novidade.texto || ""; const a = $("a", n); if (a) { if (SEM.novidade.ligacao) { a.href = SEM.novidade.ligacao; a.firstChild.textContent = (SEM.novidade.ligacaoTexto || "Ver") + " "; } else a.hidden = true; } }
    const t = $("#semTitulo"); if (t && SEM.titulo) t.textContent = SEM.titulo;
  }

  /* memória do mural → email com o texto */
  const memTxt = $("#memTxt"), memCount = $("#memCount"), memMail = $("#memMail");
  if (memTxt && memMail) {
    const base = "Olá! Quero partilhar uma memória benfiquista para o Mural Encarnado.\n\nNome ou iniciais a publicar:\nLocalidade:\n\nA minha memória:\n";
    const fim = "\n\nConfirmo que sou o autor deste texto e autorizo a sua publicação no Mural Encarnado. Posso pedir a remoção a qualquer momento.";
    const upd = () => { if (memCount) memCount.textContent = memTxt.value.length + " / " + memTxt.maxLength; memMail.dataset.body = base + memTxt.value.trim() + fim; if (hasMail) memMail.href = mailto(memMail.dataset.subject, memMail.dataset.body); };
    memTxt.addEventListener("input", upd); upd();
  }

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

  window.BE = { CFG, PROD, DATA, esc, eur, mailto, hasMail, picture, card, prazoTxt, wireLinks, reveal, trap, icons: I };
})();
