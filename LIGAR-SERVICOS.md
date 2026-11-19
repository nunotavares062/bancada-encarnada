# Ligar a sondagem e o Clube da Bancada a serviços reais

Dois serviços, ambos com plano gratuito suficiente para começar:

| O quê | Serviço | O que o site precisa | Onde se cola |
|---|---|---|---|
| Votos da pergunta da semana | Supabase | URL do projeto + chave `anon` | `site/assets/js/config.js` → `votos` |
| Clube da Bancada com dupla confirmação | Brevo, através de um pequeno proxy | URL do proxy | `site/assets/js/config.js` → `newsletter.endpoint` |
| Pedidos de encomenda do carrinho | Formspree (ou outro serviço de formulários) | URL do formulário | `site/assets/js/config.js` → `encomendas.endpoint` |

O site nunca guarda chaves secretas. A chave `anon` do Supabase é pública por desenho e está protegida pelas regras da tabela. A chave do Brevo fica só no proxy.

---

## 1. Supabase, para os votos

### 1.1 Criar o projeto
1. Entra em https://supabase.com e cria uma conta.
2. **New project**. Nome: `bancada-encarnada`. Região: **West EU (Ireland)** ou **Central EU (Frankfurt)**, para os dados ficarem na União Europeia. Guarda a password da base de dados num sítio seguro, não vais precisar dela no site.
3. Espera um ou dois minutos até o projeto ficar pronto.

### 1.2 Criar a tabela e as regras
1. No menu da esquerda, **SQL Editor** → **New query**.
2. Cola isto tudo e carrega em **Run**:

```sql
-- tabela de votos: um voto por sessão e por pergunta
create table public.votos (
  id         bigint generated always as identity primary key,
  poll_id    text        not null,
  opcao      smallint    not null check (opcao between 0 and 9),
  sessao     text        not null,
  criado_em  timestamptz not null default now(),
  unique (poll_id, sessao)
);

-- ativar regras de acesso por linha
alter table public.votos enable row level security;

-- qualquer visitante pode ver os votos (só poll_id, opcao e sessao são lidos pelo site)
create policy "ler votos" on public.votos
  for select to anon using (true);

-- qualquer visitante pode inserir um voto, mas não editar nem apagar
create policy "votar" on public.votos
  for insert to anon with check (char_length(sessao) between 8 and 64 and char_length(poll_id) between 4 and 64);

-- índice para as leituras por pergunta
create index votos_poll_idx on public.votos (poll_id);
```

3. Deve aparecer "Success. No rows returned".

### 1.3 Copiar os dados para o site
1. **Project Settings** (roda dentada em baixo à esquerda) → **API**.
2. Copia o **Project URL** (algo como `https://abcdefgh.supabase.co`) e a chave **anon public**.
3. Abre `site/assets/js/config.js` e preenche:

```js
votos: {
  url: "https://abcdefgh.supabase.co",
  anonKey: "eyJhbGciOi...",   // a chave anon public, inteira
  tabela: "votos"
},
```

4. Abre o site, vota, e confirma no Supabase em **Table Editor → votos** que a linha apareceu. A etiqueta "Demonstração local" desaparece sozinha quando a ligação está ativa.

### 1.4 Mudar a pergunta de semana
Edita `site/data/semana.json`: muda o `id` da pergunta (por exemplo `poll-2026-48`), o texto, as opções e a data `fecha`. Corre `python build.py`. Os votos antigos ficam guardados no Supabase com o `id` antigo.

### 1.5 Limites a saber
- O plano gratuito chega para muitos milhares de votos por mês.
- Um voto por navegador, não por pessoa. Quem apagar os dados do navegador consegue votar outra vez. Para uma pergunta pública é aceitável; para decisões com peso, cruza com os emails do Clube.
- Se quiseres apagar votos de teste: **Table Editor → votos**, seleciona as linhas e apaga.

---

## 2. Brevo, para o Clube da Bancada

O formulário do site envia nome e email para um **proxy teu**. O proxy chama a API do Brevo com a chave secreta e pede uma **dupla confirmação**: o Brevo manda o email "confirma a tua adesão" e só depois do clique é que a pessoa entra na lista. O site só diz "verifica o email", nunca "inscrito".

### 2.1 Preparar o Brevo
1. Conta em https://www.brevo.com (plano gratuito: 300 emails por dia, contactos ilimitados).
2. **Contacts → Lists → Create a list**: `Clube da Bancada`. Aponta o **número da lista** (aparece na coluna ID).
3. **Campaigns → Templates → New template**: cria o email de confirmação. No corpo tem de existir um botão ou ligação com o endereço especial `{{ doubleoptin }}`. Texto sugerido:
   - Assunto: *Confirma o teu lugar na Bancada*
   - Corpo: *Olá {{ contact.NOME }}, falta só um passo. Carrega aqui para confirmares que queres receber as novidades da Bancada Encarnada. Se não foste tu, ignora este email.*
   - Guarda e ativa. Aponta o **ID do template**.
4. **Contacts → Settings → Contact attributes**: confirma que existe o atributo `NOME` (texto). Se não existir, cria.
5. **Settings (canto superior direito) → SMTP & API → API Keys → Generate a new API key**. Nome `site-proxy`. Copia a chave: só aparece uma vez.
6. **Senders**: confirma um remetente com o email da marca (vai precisar do domínio verificado quando tiveres o `bancadaencarnada.pt`).
7. Cria uma página de "obrigado" simples ou usa a homepage com âncora, por exemplo `https://bancadaencarnada.pt/index.html#clube`. É para onde a pessoa vai depois de confirmar.

### 2.2 Criar o proxy (Cloudflare Workers, gratuito)
1. Conta em https://dash.cloudflare.com → **Workers & Pages → Create → Create Worker**. Nome: `clube-bancada`. **Deploy** e depois **Edit code**.
2. Substitui o código por este:

```js
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.SITE_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response("Só POST", { status: 405, headers: cors });

    let body;
    try { body = await request.json(); } catch { return new Response("JSON inválido", { status: 400, headers: cors }); }
    const nome = String(body.nome || "").trim().slice(0, 80);
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || nome.length < 2 || body.consentimento !== true) {
      return new Response("Dados em falta", { status: 400, headers: cors });
    }

    const r = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email,
        attributes: { NOME: nome, ORIGEM: body.origem || "site", CONSENTIMENTO_EM: body.data || new Date().toISOString() },
        includeListIds: [Number(env.BREVO_LIST_ID)],
        templateId: Number(env.BREVO_TEMPLATE_ID),
        redirectionUrl: env.REDIRECT_URL,
      }),
    });

    // 201 = email de confirmação enviado; 204 = contacto já existia e foi atualizado
    if (r.status === 201 || r.status === 204) return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    const txt = await r.text();
    return new Response(JSON.stringify({ ok: false, brevo: r.status, detalhe: txt.slice(0, 200) }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
  },
};
```

3. **Save and deploy**.
4. **Settings → Variables and Secrets**, adiciona:
   - `BREVO_API_KEY` (tipo **Secret**): a chave da API.
   - `BREVO_LIST_ID`: o número da lista.
   - `BREVO_TEMPLATE_ID`: o ID do template de confirmação.
   - `REDIRECT_URL`: `https://bancadaencarnada.pt/index.html#clube` (ou a página de obrigado).
   - `SITE_ORIGIN`: `https://bancadaencarnada.pt` (enquanto testas em local, podes pôr `*` e depois fechar).
5. Copia o endereço do worker, algo como `https://clube-bancada.o-teu-nome.workers.dev`.

### 2.3 Ligar ao site
Em `site/assets/js/config.js`:

```js
newsletter: {
  provider: "brevo",
  endpoint: "https://clube-bancada.o-teu-nome.workers.dev"
},
```

### 2.4 Testar
1. Preenche o formulário do site com um email teu.
2. O site deve dizer "Falta só confirmares" e tu deves receber o email do Brevo.
3. Carrega no botão do email: vais parar à página de obrigado e, no Brevo, o contacto fica na lista com o estado confirmado.
4. Se o site disser "Não conseguimos registar agora", vê no Cloudflare em **Logs** a resposta do Brevo: quase sempre é o `templateId` errado ou o template não estar ativo.

### 2.5 Alternativas ao Cloudflare
Make, n8n ou Zapier também servem: um webhook que recebe o JSON do formulário e um passo "Brevo → Create contact with double opt-in" com os mesmos campos. O site não muda, só o `endpoint`.

---

## 3. Formspree, para os pedidos de encomenda

Sem nada configurado, o botão "Enviar pedido de encomenda" abre o programa de email do cliente com o pedido já escrito, endereçado ao email da loja. Funciona, mas depende de o cliente ter email configurado no telemóvel ou no computador. Com um serviço de formulários, o pedido chega-te sem o cliente sair do site.

1. Conta em https://formspree.io (plano gratuito: 50 pedidos por mês).
2. **New form**, nome `Encomendas Bancada Encarnada`, email de destino o da loja. Confirma o email que o Formspree te envia.
3. Copia o endereço do formulário, algo como `https://formspree.io/f/abcdwxyz`.
4. Em `site/assets/js/config.js`:

```js
encomendas: { endpoint: "https://formspree.io/f/abcdwxyz" },
```

5. Faz uma encomenda de teste no site. Deves receber um email com a referência (BE-AAMMDD-XXXX), as peças, as opções, a personalização, os totais, a morada e a forma de pagamento escolhida. O cliente vê "Pedido recebido" e o carrinho esvazia.
6. Responde ao cliente (o email dele vem como resposta direta) com o total final e os dados de pagamento. A encomenda só fica confirmada quando o pagamento entrar.

O site nunca cobra nada nem guarda dados de cartão. Os pedidos ficam também no painel do Formspree.

---

## 4. Antes de publicar

- `site/assets/js/config.js`: `preview: false`, email da loja, titular, NIF e morada preenchidos. Os contactos são só email e redes sociais.
- `python build.py` depois de qualquer alteração em `src/`, `data/` ou nas imagens.
- Publica a pasta `site/` inteira (Netlify, Vercel, Cloudflare Pages ou o alojamento que usares). A pasta não tem base64 nem segredos.
- Depois de publicar, confirma no Brevo que o domínio do remetente está verificado, para os emails de confirmação não caírem no spam.
