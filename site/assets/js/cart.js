/* =====================================================================
   BANCADA ENCARNADA · carrinho e pedido de encomenda
   O carrinho vive no navegador (localStorage). O pedido segue para o
   endpoint de encomendas (config.encomendas.endpoint) ou, sem ele, por
   email. Nada é cobrado no site: os dados de pagamento seguem por email.
   ===================================================================== */
(function () {
  const BE = window.BE; if (!BE) return;
  const { CFG, PROD, esc, eur, mailto, hasMail, wireLinks, trap } = BE;
  const COM = CFG.comercial || {}, C = CFG.contacto || {}, I = BE.icons;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KEY = "be-cart";
  const bySlug = Object.fromEntries(PROD.produtos.map(p => [p.slug, p]));
  const onCheckout = !!$("#checkout");

  /* ---------- estado ---------- */
  const load = () => { try { return (JSON.parse(localStorage.getItem(KEY)) || []).filter(l => bySlug[l.slug] && bySlug[l.slug].estado === "disponivel" && l.qty > 0); } catch (e) { return []; } };
  let lines = load();
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) {} render(); };
  const keyOf = l => l.slug + "|" + JSON.stringify(l.var || {}) + "|" + (l.pers || "");
  const add = (slug, { variantes = {}, pers = "", qty = 1 } = {}) => {
    const p = bySlug[slug]; if (!p || p.estado !== "disponivel") return;
    const k = keyOf({ slug, var: variantes, pers }); const ex = lines.find(l => keyOf(l) === k);
    if (ex) ex.qty = Math.min(20, ex.qty + qty); else lines.push({ slug, var: variantes, pers, qty: Math.min(20, qty) });
    persist();
  };
  const setQty = (i, q) => { if (!lines[i]) return; if (q <= 0) lines.splice(i, 1); else lines[i].qty = Math.min(20, q); persist(); };
  const clear = () => { lines = []; persist(); };

  const totals = (zona = "continental") => {
    let sub = 0, desc = 0, portesInc = false; const porSlug = {};
    lines.forEach(l => { const p = bySlug[l.slug]; sub += p.preco * l.qty; porSlug[l.slug] = (porSlug[l.slug] || 0) + l.qty; if (p.portesIncluidos) portesInc = true; });
    const promos = [];
    Object.entries(porSlug).forEach(([s, n]) => { const p = bySlug[s], pr = p.promo; if (pr && n >= pr.qtd) { const g = Math.floor(n / pr.qtd), d = g * (pr.qtd * p.preco - pr.preco); desc += d; promos.push({ texto: `${p.nome} · ${pr.texto}`, valor: d }); } });
    desc = Math.round(desc * 100) / 100;
    const base = Math.round((sub - desc) * 100) / 100;
    const count = lines.reduce((a, l) => a + l.qty, 0);
    const gratis = portesInc || base >= COM.portesGratisAcima;
    let portes = count ? (gratis ? 0 : COM.portesPT) : 0, portesTxt = count ? (gratis ? "Grátis" : eur(COM.portesPT)) : "—";
    if (zona !== "continental" && count) { portes = null; portesTxt = "Sob consulta"; }
    return { sub, desc, promos, base, portes, portesTxt, total: base + (portes || 0), falta: Math.max(0, COM.portesGratisAcima - base), gratis, count };
  };
  const varTxt = l => [...Object.entries(l.var || {}).map(([k, v]) => `${k}: ${v}`), l.pers ? `Personalização: ${l.pers}` : ""].filter(Boolean);
  const thumb = p => p.imagens && p.imagens[0] ? `<img src="assets/images/${p.imagens[0]}-800.webp" alt="" width="72" height="90" loading="lazy">` : "";

  /* ---------- gaveta do carrinho ---------- */
  document.body.insertAdjacentHTML("beforeend", `<div class="cart" id="cart" aria-hidden="true">
  <div class="cart-overlay" data-cart-close></div>
  <aside class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
    <div class="cart-head"><h2 id="cartTitle">Carrinho</h2><button type="button" data-cart-close aria-label="Fechar carrinho">✕</button></div>
    <div class="ship" id="cartShip"></div>
    <div class="cart-lines" id="cartLines"></div>
    <div class="cart-foot" id="cartFoot"></div>
  </aside>
</div>`);
  const cartEl = $("#cart"), btn = $("#cartBtn");
  let lastFocus = null;
  const open = () => { if (onCheckout) return; lastFocus = document.activeElement; cartEl.classList.add("open"); cartEl.setAttribute("aria-hidden", "false"); if (btn) btn.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; setTimeout(() => { const c = $(".cart-head button", cartEl); if (c) c.focus(); }, 50); };
  const close = () => { cartEl.classList.remove("open"); cartEl.setAttribute("aria-hidden", "true"); if (btn) btn.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
  if (btn) btn.addEventListener("click", () => onCheckout ? location.assign("loja.html") : open());
  cartEl.addEventListener("click", e => {
    if (e.target.closest("[data-cart-close]")) { close(); return; }
    const q = e.target.closest("[data-q]"); if (q) { const i = +q.dataset.i; setQty(i, lines[i].qty + +q.dataset.q); return; }
    const rm = e.target.closest("[data-rm]"); if (rm) setQty(+rm.dataset.i, 0);
  });
  addEventListener("keydown", e => { if (!cartEl.classList.contains("open")) return; if (e.key === "Escape") close(); if (e.key === "Tab") trap($(".cart-panel", cartEl), e); });

  const lineHTML = (l, i, editable) => {
    const p = bySlug[l.slug];
    return `<div class="cl">
  <a class="thw" href="produto.html?p=${p.slug}" tabindex="-1" aria-hidden="true"><span class="th">${thumb(p)}</span>${editable ? "" : `<span class="q">${l.qty}</span>`}</a>
  <div><a class="nm" href="produto.html?p=${p.slug}">${esc(p.nome)}</a>${varTxt(l).map(t => `<div class="vr">${esc(t)}</div>`).join("")}<div class="vr">${eur(p.preco)} / unidade</div>
    ${editable ? `<div class="ctrl"><div class="qty sm"><button type="button" data-q="-1" data-i="${i}" aria-label="Menos uma ${esc(p.nome)}">−</button><span aria-live="polite">${l.qty}</span><button type="button" data-q="1" data-i="${i}" aria-label="Mais uma ${esc(p.nome)}">+</button></div><button type="button" class="rm" data-rm data-i="${i}">Remover</button></div>` : ""}</div>
  <div class="pr">${eur(p.preco * l.qty)}</div>
</div>`;
  };
  const sumHTML = (t, withTotal) => `<div class="sumrow"><span>Subtotal</span><b>${eur(t.sub)}</b></div>${t.promos.map(pr => `<div class="sumrow disc"><span>${esc(pr.texto)}</span><b>−${eur(pr.valor)}</b></div>`).join("")}${withTotal ? `<div class="sumrow"><span>Portes</span><b>${t.portesTxt}</b></div><div class="sumrow total"><span>Total${t.portes == null ? " sem portes" : ""}</span><b>${eur(t.total)}</b></div><p class="note">IVA incluído.${t.portes == null ? " Os portes para as ilhas são confirmados por email antes do pagamento." : ""}</p>` : ""}`;

  const render = () => {
    const t = totals();
    const cc = $("#cartCount"); if (cc) { cc.textContent = t.count; cc.hidden = !t.count; }
    if (btn) btn.setAttribute("aria-label", `Abrir carrinho, ${t.count} ${t.count === 1 ? "peça" : "peças"}`);
    $("#cartTitle").textContent = `Carrinho${t.count ? ` (${t.count})` : ""}`;
    const ship = $("#cartShip");
    if (!t.count) ship.hidden = true;
    else { ship.hidden = false; ship.innerHTML = t.gratis ? `<b>Tens portes grátis</b> em ${esc(COM.zona)}.` : `Faltam <b>${eur(t.falta)}</b> para teres portes grátis em ${esc(COM.zona)}.<div class="bar"><i style="width:${Math.min(100, t.base / COM.portesGratisAcima * 100)}%"></i></div>`; }
    $("#cartLines").innerHTML = t.count ? lines.map((l, i) => lineHTML(l, i, true)).join("") : `<div class="cart-empty"><p>O teu carrinho está vazio.</p><a class="btn btn-red" href="loja.html">Ver a loja</a></div>`;
    $("#cartFoot").innerHTML = t.count ? `${sumHTML(t, false)}<p class="note">Portes e total final no passo seguinte. Nada é cobrado no site: enviamos os dados de pagamento por email.</p><a class="btn btn-red btn-lg btn-block" href="encomenda.html">Finalizar encomenda</a><button type="button" class="btn btn-line btn-block" data-cart-close>Continuar a comprar</button>` : "";
    if (onCheckout) renderCheckout();
  };

  /* ---------- página de encomenda ---------- */
  let zona = "continental", sent = false;
  function renderCheckout() {
    if (sent) return;
    const sum = $("#summary"), main = $("#checkoutMain"), t = totals(zona);
    if (!t.count) { main.innerHTML = `<div class="done"><h2>O carrinho está vazio.</h2><p class="lead">Escolhe primeiro as peças na loja.</p><a class="btn btn-red" href="loja.html">Ver a loja</a></div>`; sum.hidden = true; return; }
    sum.hidden = false;
    sum.innerHTML = `<h2>Resumo <span>${t.count} ${t.count === 1 ? "peça" : "peças"}</span></h2><div class="co-lines">${lines.map((l, i) => lineHTML(l, i, false)).join("")}</div>${sumHTML(t, true)}<a class="link" href="loja.html" style="font-size:14px">Alterar peças</a>`;
  }
  const form = $("#orderForm");
  if (form) {
    const pay = $("#payOpts");
    pay.innerHTML = (COM.pagamentos || []).map((m, i) => `<label class="pay-opt"><input type="radio" name="pagamento" value="${esc(m)}" ${i === 0 ? "checked" : ""} required><span><b>${esc(m)}</b><small>${/mb ?way/i.test(m) ? "Pedido de pagamento para o teu telemóvel, depois de confirmarmos a encomenda." : "IBAN enviado por email, depois de confirmarmos a encomenda."}</small></span></label>`).join("");
    form.zona.addEventListener("change", () => { zona = form.zona.value; renderCheckout(); });
    const tel = form.telefone;
    const syncTel = () => { const mb = /mb ?way/i.test((form.querySelector("input[name=pagamento]:checked") || {}).value || ""); tel.required = mb; $("#telReq").textContent = mb ? "obrigatório para MB Way" : "opcional"; };
    form.addEventListener("change", e => { if (e.target.name === "pagamento") syncTel(); }); syncTel();
    const st = $(".status", form), sb = $("button[type=submit]", form);
    const show = (cls, html) => { st.className = "status show " + cls; st.innerHTML = html; wireLinks(st); };
    const ref = () => { const d = new Date(), p = n => String(n).padStart(2, "0"); return `BE-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; };
    const zonaTxt = { continental: "Portugal continental", acores: "Açores", madeira: "Madeira" };
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (form.website && form.website.value) return;
      if (!lines.length) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const t = totals(zona), r = ref(), f = Object.fromEntries(new FormData(form));
      const pecas = lines.map(l => { const p = bySlug[l.slug]; return `- ${l.qty} × ${p.nome}${varTxt(l).length ? " (" + varTxt(l).join("; ") + ")" : ""}: ${eur(p.preco * l.qty)}`; }).join("\n");
      const texto = `Pedido de encomenda ${r}\n\nPeças:\n${pecas}\n\nSubtotal: ${eur(t.sub)}\n${t.promos.map(p => `Desconto ${p.texto}: -${eur(p.valor)}\n`).join("")}Portes: ${t.portesTxt}\nTotal${t.portes == null ? " sem portes" : ""}: ${eur(t.total)}\n\nEntrega:\n${f.nome}\n${f.morada}\n${f.cp} ${f.localidade}\n${zonaTxt[zona]}\n\nContacto: ${f.email}${f.telefone ? " · " + f.telefone : ""}\nPagamento preferido: ${f.pagamento}\n${f.notas ? "\nNotas: " + f.notas + "\n" : ""}\nAceito os termos de venda e a política de privacidade.`;
      const EP = (CFG.encomendas || {}).endpoint;
      if (EP) {
        sb.disabled = true; sb.textContent = "A enviar o pedido…";
        try {
          const res = await fetch(EP, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ _subject: "Encomenda " + r, _replyto: f.email, referencia: r, cliente: { nome: f.nome, email: f.email, telefone: f.telefone || "", morada: f.morada, cp: f.cp, localidade: f.localidade, zona: zonaTxt[zona] }, pagamento: f.pagamento, notas: f.notas || "", linhas: lines.map(l => ({ slug: l.slug, nome: bySlug[l.slug].nome, variantes: l.var, personalizacao: l.pers, quantidade: l.qty, preco: bySlug[l.slug].preco })), totais: t, texto, data: new Date().toISOString() }) });
          if (!res.ok) throw new Error(res.status);
          sent = true; clear();
          $("#checkoutMain").innerHTML = `<div class="done"><span class="kicker">Pedido recebido</span><p class="ref">${r}</p><h2>Obrigado, ${esc(f.nome.split(" ")[0])}.</h2><p class="lead">Recebemos o teu pedido. Vamos responder para <b>${esc(f.email)}</b> em ${esc(C.tempoResposta || "24 horas úteis")} com o total final e os dados de pagamento por ${esc(f.pagamento)}. A encomenda só fica confirmada depois do pagamento e ainda não pagaste nada.</p><a class="btn btn-line" href="loja.html">Voltar à loja</a></div>`;
          $("#summary").hidden = true; scrollTo({ top: 0 });
        } catch (err) { show("err", "Não conseguimos enviar o pedido agora. Tenta outra vez daqui a pouco." + (hasMail ? ` Ou <a class="link" data-mail data-subject="Encomenda ${r}" data-body="${esc(texto)}" href="#">envia-o por email</a>.` : "")); }
        sb.disabled = false; sb.textContent = "Enviar pedido de encomenda";
        return;
      }
      if (!hasMail) { show("warn", `<b>As encomendas ainda não estão ativas neste site.</b> Falta configurar o email da loja. Entretanto fala connosco no <a class="link" data-ig href="#">Instagram</a>.`); return; }
      sent = true;
      $("#checkoutMain").innerHTML = `<div class="done"><span class="kicker">Falta um passo</span><p class="ref">${r}</p><h2>Envia o pedido por email.</h2><ol class="steps-list"><li>Carrega no botão: abre o teu email com o pedido já escrito.</li><li>Envia o email sem alterar a referência.</li><li>Respondemos em ${esc(C.tempoResposta || "24 horas úteis")} com o total final e os dados de pagamento. A encomenda só fica confirmada depois do pagamento.</li></ol>
<div class="acts"><a class="btn btn-red btn-lg" data-mail data-subject="Encomenda ${r}" data-body="${esc(texto)}" href="#">${I.mail}Abrir email com o pedido</a><button type="button" class="btn btn-line btn-lg" id="copyOrder">Copiar o pedido</button></div>
<p class="note">O teu programa de email não abriu? Copia o pedido e envia-o para <b>${esc(C.email)}</b>.</p>
<button type="button" class="link" id="sentDone" style="justify-self:start">Já enviei o email, esvaziar o carrinho</button></div>`;
      wireLinks($("#checkoutMain"));
      $("#copyOrder").addEventListener("click", async ev => { try { await navigator.clipboard.writeText(texto); ev.target.textContent = "Pedido copiado"; } catch (x) { ev.target.textContent = "Não foi possível copiar"; } });
      $("#sentDone").addEventListener("click", () => { clear(); $("#checkoutMain").innerHTML = `<div class="done"><span class="kicker">Obrigado</span><p class="ref">${r}</p><h2>Vamos responder para ${esc(f.email)}.</h2><p class="lead">Se em ${esc(C.tempoResposta || "24 horas úteis")} não tiveres resposta, vê a pasta de spam ou escreve-nos no Instagram.</p><a class="btn btn-line" href="loja.html">Voltar à loja</a></div>`; $("#summary").hidden = true; });
      scrollTo({ top: 0 });
    });
  }

  render();
  window.BE_CART = { add, open, close, totals, get lines() { return lines; } };
})();
