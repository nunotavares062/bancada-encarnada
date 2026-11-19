/* Bancada Encarnada · comportamento partilhado (homepage, loja, produto) */
(function () {
  const CFG = window.BE_CONFIG || {};
  const DATA = window.BE_DATA || {};
  const C = CFG.contacto || {}, COM = CFG.comercial || {}, LEG = CFG.legal || {};
  const ROOT = document.documentElement.dataset.root || "";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const eur = v => v == null ? "" : v.toFixed(2).replace(".", ",") + " €";
  const porPreencher = v => typeof v === "string" && /^\[.*\]$/.test(v);

  /* ---------- ligações e dados de contacto ---------- */
  const wa = m => "https://wa.me/" + (C.whatsapp || "") + "?text=" + encodeURIComponent(m);
  const ext = a => { a.target = "_blank"; a.rel = "noopener"; };
  $$("[data-wa]").forEach(a => { a.href = wa(a.dataset.msg || "Olá!"); ext(a); });
  $$("[data-ig]").forEach(a => { a.href = "https://ig.me/m/" + C.instagram; ext(a); });
  $$("[data-ig-profile]").forEach(a => { a.href = "https://www.instagram.com/" + C.instagram + "/"; ext(a); });
  $$("[data-tt]").forEach(a => { a.href = "https://www.tiktok.com/@" + C.tiktok; ext(a); });
  $$("[data-mail]").forEach(a => { a.href = "mailto:" + C.email; });
  /* textos vindos da configuração: data-cfg="comercial.prazo3d" */
  const get = p => p.split(".").reduce((o, k) => (o == null ? o : o[k]), CFG);
  $$("[data-cfg]").forEach(el => {
    let v = get(el.dataset.cfg);
    if (typeof v === "number") v = el.dataset.fmt === "eur" ? eur(v) : String(v);
    if (Array.isArray(v)) v = v.join(" ou ");
    if (v == null || v === "") return;
    el.textContent = v;
    if (CFG.preview && porPreencher(v)) el.classList.add("por-preencher");
  });
  if (CFG.preview && porPreencher(C.whatsapp) === false && /^3519000/.test(C.whatsapp || "")) $$("[data-wa].btn").slice(0, 1).forEach(el => el.classList.add("por-preencher"));

  /* ---------- navegação ---------- */
  const nav = $("#nav"), fw = $("#floatWa");
  const onScroll = () => { if (nav) nav.classList.toggle("solid", scrollY > 40); if (fw) fw.classList.toggle("show", scrollY > innerHeight * .9); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const menu = $("#menu"), burger = $("#burger"), menuClose = $("#menuClose");
  if (menu && burger) {
    let lastFocus = null;
    const setMenu = s => {
      menu.classList.toggle("show", s); menu.setAttribute("aria-hidden", !s); burger.setAttribute("aria-expanded", s); document.body.style.overflow = s ? "hidden" : "";
      if (s) { lastFocus = document.activeElement; menuClose.focus(); } else if (lastFocus) lastFocus.focus();
    };
    burger.addEventListener("click", () => setMenu(true));
    menuClose.addEventListener("click", () => setMenu(false));
    $$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
    addEventListener("keydown", e => {
      if (!menu.classList.contains("show")) return;
      if (e.key === "Escape") setMenu(false);
      if (e.key === "Tab") { // armadilha de foco
        const f = $$("a,button", menu).filter(el => !el.hidden); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  /* página atual no menu */
  const here = location.pathname.replace(/index\.html$/, "");
  $$(".nav ul a").forEach(a => { const p = new URL(a.href, location.href).pathname.replace(/index\.html$/, ""); if (p === here && !a.hash) a.setAttribute("aria-current", "page"); });

  /* ---------- vídeo do hero e vídeos diferidos ---------- */
  const hv = $("#heroVideo");
  if (hv) {
    if (reduce || (navigator.connection && navigator.connection.saveData)) hv.remove();
    else hv.play().catch(() => {});
  }
  if ("IntersectionObserver" in window && !reduce) {
    const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }), { threshold: .2 });
    $$("[data-lazyvideo]").forEach(v => vio.observe(v));
  }

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  const reveal = el => reduce ? el.classList.add("in") : io.observe(el);
  $$(".rv").forEach(reveal);

  /* ---------- diálogos ---------- */
  $$("[data-open]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); const d = document.getElementById(b.dataset.open); if (d) d.showModal(); }));
  $$("dialog").forEach(d => { const c = $("[data-close]", d); if (c) c.addEventListener("click", () => d.close()); d.addEventListener("click", e => { if (e.target === d) d.close(); }); });

  /* ---------- Esta semana + sondagem ---------- */
  const SEM = DATA.semana;
  const pollEl = $("#poll");
  if (pollEl && SEM && SEM.pergunta) {
    const P = SEM.pergunta, V = CFG.votos || {}, remote = !!(V.url && V.anonKey);
    const KEY = "be-" + P.id, SKEY = "be-sessao";
    let sessao = null; try { sessao = localStorage.getItem(SKEY) || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()); localStorage.setItem(SKEY, sessao); } catch (e) { sessao = "anon"; }
    const opts = $("#opts"), st = $("#pollStatus"), rst = $("#pollReset"), demo = $("#pollDemo"), qEl = $("#pollQ");
    if (qEl) qEl.textContent = P.texto;
    if (demo) demo.hidden = remote;
    const loadLocal = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { votes: P.opcoes.map(() => 0), mine: null }; } catch (e) { return { votes: P.opcoes.map(() => 0), mine: null }; } };
    const saveLocal = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
    const headers = { apikey: V.anonKey, Authorization: "Bearer " + V.anonKey, "Content-Type": "application/json" };
    const fetchRemote = async () => {
      const r = await fetch(`${V.url}/rest/v1/${V.tabela || "votos"}?poll_id=eq.${encodeURIComponent(P.id)}&select=opcao,sessao`, { headers });
      if (!r.ok) throw new Error("votos " + r.status);
      const rows = await r.json(); const votes = P.opcoes.map(() => 0); let mine = null;
      rows.forEach(x => { if (votes[x.opcao] != null) votes[x.opcao]++; if (x.sessao === sessao) mine = x.opcao; });
      return { votes, mine };
    };
    const draw = (d, note) => {
      const total = d.votes.reduce((a, b) => a + b, 0), voted = d.mine !== null;
      pollEl.classList.toggle("voted", voted); opts.innerHTML = "";
      P.opcoes.forEach((label, i) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "opt" + (d.mine === i ? " mine" : ""); b.disabled = voted;
        const pct = total ? Math.round(d.votes[i] / total * 100) : 0;
        b.setAttribute("aria-pressed", d.mine === i);
        b.innerHTML = '<span class="bar" style="width:' + (voted ? pct : 0) + '%"></span><span class="lbl"></span><span class="pct">' + (voted ? pct + "%" : "") + '</span>';
        $(".lbl", b).textContent = label;
        b.addEventListener("click", () => vote(i, label));
        opts.appendChild(b);
      });
      if (rst) rst.hidden = !voted || remote;
      if (note) st.textContent = note;
      else if (voted) st.textContent = remote ? "Já votaste. " + total + (total === 1 ? " voto" : " votos") + " da bancada até agora." + (P.fecha ? " A pergunta fecha a " + fmtData(P.fecha) + "." : "") : "Já votaste neste dispositivo. Os números são só os votos guardados aqui (" + total + "), não os da comunidade.";
      else st.textContent = remote ? "Escolhe uma opção. Um voto por pessoa." + (P.fecha ? " Fecha a " + fmtData(P.fecha) + "." : "") : "Escolhe uma opção. Os votos ficam só neste dispositivo até ligarmos a sondagem à comunidade.";
    };
    const fmtData = s => { const d = new Date(s + "T00:00:00"); return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long" }); };
    const vote = async (i, label) => {
      if (remote) {
        st.textContent = "A registar o voto…";
        try {
          const r = await fetch(`${V.url}/rest/v1/${V.tabela || "votos"}`, { method: "POST", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ poll_id: P.id, opcao: i, sessao }) });
          if (!r.ok) throw new Error(String(r.status));
          draw(await fetchRemote(), "Obrigado! O teu voto conta: " + label + ".");
        } catch (e) { st.textContent = "Não conseguimos registar o voto agora. Tenta outra vez daqui a pouco."; }
      } else {
        const n = loadLocal(); if (n.mine !== null) return; n.votes[i]++; n.mine = i; saveLocal(n);
        draw(n, "Ficou registado neste dispositivo: " + label + ". Quando a sondagem estiver ligada à comunidade, os resultados passam a ser de toda a bancada.");
      }
    };
    if (rst) rst.addEventListener("click", () => { try { localStorage.removeItem(KEY); } catch (e) {} draw(loadLocal(), "Voto apagado. Podes voltar a escolher."); });
    if (remote) { draw({ votes: P.opcoes.map(() => 0), mine: null }, "A carregar os votos…"); fetchRemote().then(d => draw(d)).catch(() => { draw(loadLocal(), "Sem ligação ao serviço de votos. Mostramos só o que está neste dispositivo."); }); }
    else draw(loadLocal());
  }
  /* memória e novidade */
  if (SEM) {
    const m = $("#semMemoria"), n = $("#semNovidade");
    if (m) {
      if (SEM.memoria && SEM.memoria.texto) { m.classList.remove("empty"); m.innerHTML = '<span class="k">' + esc(SEM.memoria.titulo || "A memória da semana") + '</span><p class="q"></p><p class="autor"></p>'; $(".q", m).textContent = "“" + SEM.memoria.texto + "”"; $(".autor", m).textContent = SEM.memoria.autor ? "— " + SEM.memoria.autor : ""; }
    }
    if (n && SEM.novidade) { $(".k", n).textContent = SEM.novidade.titulo || "Novidade"; $("p", n).textContent = SEM.novidade.texto || ""; const a = $("a", n); if (a) { if (SEM.novidade.ligacao) { a.href = ROOT + SEM.novidade.ligacao; a.textContent = SEM.novidade.ligacaoTexto || "Ver"; } else a.hidden = true; } }
    const t = $("#semTitulo"); if (t && SEM.titulo) t.textContent = SEM.titulo;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  /* memória → WhatsApp */
  const memTxt = $("#memTxt"), memCount = $("#memCount"), memWa = $("#memWa");
  if (memTxt && memWa) { const base = memWa.dataset.msg; memTxt.addEventListener("input", () => { if (memCount) memCount.textContent = memTxt.value.length + " / " + memTxt.maxLength; memWa.href = wa(base + memTxt.value.trim()); }); }

  /* ---------- mural ---------- */
  const mg = $("#muralGrid");
  if (mg && DATA.mural && DATA.mural.itens && DATA.mural.itens.length) {
    DATA.mural.itens.forEach(it => {
      const f = document.createElement("figure");
      f.innerHTML = '<img loading="lazy" decoding="async" width="800" height="1000"><figcaption><b></b><span></span></figcaption>';
      const img = $("img", f); img.src = ROOT + it.imagem; img.alt = it.alt || "";
      $("b", f).textContent = it.frase || ""; $("span", f).textContent = [it.autor, it.local].filter(Boolean).join(" · ");
      mg.appendChild(f);
    });
    mg.hidden = false; const e = $("#muralEmpty"); if (e) e.hidden = true;
  }

  /* ---------- Clube da Bancada ---------- */
  const form = $("#clubeForm");
  if (form) {
    const fs = $("#formStatus"), fb = $("#formBtn"), NL = CFG.newsletter || {};
    const show = (cls, html) => { fs.className = "status show " + cls; fs.innerHTML = html; fs.focus && fs.setAttribute("tabindex", "-1"); };
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (form.website && form.website.value) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const nome = form.nome.value.trim(), email = form.email.value.trim();
      if (!NL.endpoint) {
        show("warn", "<b>O registo automático ainda não está ligado.</b> Para já, entra no Clube por mensagem: guardamos o teu contacto à mão e confirmamos contigo." +
          '<br><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="' + wa("Olá! Quero entrar no Clube da Bancada. Nome: " + nome + ". Email: " + email + ". Autorizo o envio de novidades por email.") + '">Entrar pelo WhatsApp</a>');
        return;
      }
      fb.disabled = true; fb.textContent = "A enviar…";
      try {
        const r = await fetch(NL.endpoint, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ nome, email, consentimento: true, origem: "site", data: new Date().toISOString(), provider: NL.provider || "" }) });
        if (r.ok) { show("ok", "<b>Falta só confirmares.</b> Enviámos um email para " + esc(email) + " com um botão de confirmação. Só depois de carregares é que ficas no Clube. Se não chegar em alguns minutos, vê a pasta de spam."); form.reset(); }
        else show("err", "Não conseguimos registar agora. Tenta outra vez daqui a pouco ou entra pelo WhatsApp.");
      } catch (err) { show("err", "Sem ligação ao serviço de registo. Tenta outra vez ou entra pelo WhatsApp."); }
      fb.disabled = false; fb.textContent = "Marcar o meu lugar";
    });
  }

  /* ---------- loja: filtros ---------- */
  const filters = $("#filters");
  if (filters) {
    const cards = $$(".pcard[data-cat]"), cats = $$(".cat[data-cat]");
    const apply = key => {
      $$("button", filters).forEach(b => b.setAttribute("aria-pressed", b.dataset.f === key));
      cards.forEach(c => { const ok = key === "todos" || c.dataset.cat === key || (key === "disponivel" && c.dataset.estado === "disponivel"); c.classList.toggle("hidden", !ok); });
      cats.forEach(s => { s.hidden = !$$(".pcard:not(.hidden)", s).length; });
      const live = $("#filterLive"); if (live) live.textContent = $$(".pcard:not(.hidden)").length + " peças mostradas";
    };
    $$("button", filters).forEach(b => b.addEventListener("click", () => { apply(b.dataset.f); history.replaceState(null, "", "#" + b.dataset.f); }));
    const h = location.hash.slice(1); apply(h && $$("button", filters).some(b => b.dataset.f === h) ? h : "todos");
  }

  /* ---------- produto: variantes, personalização, mensagem ---------- */
  const order = $("#order");
  if (order) {
    const nome = order.dataset.nome, preco = order.dataset.preco, btn = $("#orderWa"), ig = $("#orderIg"), out = $("#orderMsg");
    const build = () => {
      const parts = ["Olá! Quero encomendar: " + nome + (preco ? " (" + preco + ")" : "") + "."];
      $$("select[data-var]", order).forEach(s => { if (s.value) parts.push(s.dataset.var + ": " + s.value + "."); });
      const p = $("#persTxt"); if (p && p.value.trim()) parts.push("Personalização: " + p.value.trim() + ".");
      const q = $("#qtd"); if (q && +q.value > 1) parts.push("Quantidade: " + q.value + ".");
      parts.push("Podem dizer-me portes e prazo?");
      const msg = parts.join(" "); btn.href = wa(msg); if (out) out.textContent = msg;
      const t = $("#orderTotal"); if (t && preco && q) { const v = parseFloat(preco.replace(",", ".")); t.textContent = eur(v * (+q.value || 1)); }
    };
    $$("select,input,textarea", order).forEach(el => el.addEventListener("input", build)); build();
    /* galeria */
    const main = $("#galMain"); $$("#galThumbs button").forEach(b => b.addEventListener("click", () => { main.src = b.dataset.src; main.alt = b.dataset.alt || main.alt; $$("#galThumbs button").forEach(x => x.setAttribute("aria-current", x === b)); }));
  }
})();
