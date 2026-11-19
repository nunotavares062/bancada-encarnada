/* =====================================================================
   BANCADA ENCARNADA · CONFIGURAÇÃO EDITÁVEL
   Tudo o que muda de negócio para negócio está aqui. Os textos entre
   [parênteses retos] estão POR PREENCHER e aparecem assinalados no site
   enquanto `preview` for true.
   ===================================================================== */
window.BE_CONFIG = {
  preview: true,                          // true = mostra as marcas "por preencher"; pôr false ao publicar
  siteUrl: "https://bancadaencarnada.pt", // domínio final, usado nos metadados Open Graph

  contacto: {
    whatsapp: "351900000000",             // [POR PREENCHER] número com indicativo, só dígitos
    instagram: "bancadaencarnada",        // utilizador sem @
    tiktok: "bancadaencarnada",
    email: "ola@bancadaencarnada.pt",     // [POR PREENCHER]
    horario: "das 9h às 21h, todos os dias",
    tempoResposta: "menos de uma hora"
  },

  comercial: {
    portesPT: 4.90,
    portesGratisAcima: 40,
    prazo3d: "3 a 5 dias úteis",          // impressão 3D, após pagamento
    prazoDTF: "a definir",                // [POR PREENCHER] quando houver fornecedor
    prazoSublimacao: "a definir",         // [POR PREENCHER]
    pagamentos: ["MB Way", "Transferência bancária"],
    envio: "CTT com registo",
    devolucoesDias: 14
  },

  legal: {
    titular: "[nome do titular ou empresa]",   // [POR PREENCHER]
    nif: "[NIF]",                              // [POR PREENCHER]
    morada: "[morada]",                        // [POR PREENCHER]
    livroReclamacoes: "https://www.livroreclamacoes.pt/"
  },

  /* Sondagem partilhada. Vazio = demonstração local, identificada no site.
     Preparado para Supabase: cria um projeto gratuito, uma tabela `votos`
     com as colunas poll_id (text), opcao (int2), sessao (text, unique com poll_id)
     e ativa o acesso anónimo de leitura e inserção por RLS. */
  votos: {
    url: "",        // ex.: "https://xxxx.supabase.co"
    anonKey: "",    // chave pública (anon) do projeto
    tabela: "votos"
  },

  /* Clube da Bancada. Vazio = o formulário encaminha para o WhatsApp.
     `endpoint` deve ser um URL teu (função serverless, Make, n8n ou Zapier)
     que recebe {nome,email,consentimento,origem,data} e cria o contacto no
     Brevo com dupla confirmação (double opt-in). O site nunca diz "inscrito";
     só diz "verifica o email" quando o endpoint responder 2xx. */
  newsletter: {
    provider: "brevo",
    endpoint: ""
  }
};
