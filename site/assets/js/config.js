/* =====================================================================
   BANCADA ENCARNADA · CONFIGURAÇÃO CENTRAL
   Tudo o que muda de negócio para negócio está aqui. Os valores entre
   [parênteses retos] estão POR PREENCHER: enquanto `preview` for true
   aparecem assinalados no site e os botões de WhatsApp ficam inativos.
   ===================================================================== */
window.BE_CONFIG = {
  preview: true,
  siteUrl: "https://nunotavares062.github.io/bancada-encarnada",   // domínio realmente publicado; mudar quando o .pt estiver ligado

  marca: {
    nome: "Bancada Encarnada",
    slogan: "Paixão em cada detalhe.",
    mensagem: "O Benfica não se explica. Vive-se.",
    independente: "Marca independente, criada por adeptos, sem ligação oficial ao Sport Lisboa e Benfica."
  },

  contacto: {
    whatsapp: "",                         // [POR PREENCHER] número com indicativo, só dígitos, ex. 351912345678
    instagram: "bancadaencarnada",        // utilizador sem @
    tiktok: "bancadaencarnada",
    email: "",                            // [POR PREENCHER]
    horario: "das 9h às 21h, todos os dias",
    tempoResposta: "menos de uma hora"
  },

  comercial: {
    portesPT: 4.90,
    portesGratisAcima: 40,
    prazo3d: "3 a 5 dias úteis após o pagamento",
    prazoDTF: "[a definir quando houver fornecedor]",
    prazoSublimacao: "[a definir quando houver fornecedor]",
    pagamentos: ["MB Way", "Transferência bancária"],
    envio: "CTT com registo",
    devolucoesDias: 14,
    zona: "Portugal continental"
  },

  legal: {
    titular: "[nome do titular ou empresa]",
    nif: "[NIF]",
    morada: "[morada]",
    livroReclamacoes: "https://www.livroreclamacoes.pt/"
  },

  /* Sondagem partilhada (Supabase). Vazio = demonstração local, identificada no site. Ver LIGAR-SERVICOS.md */
  votos: { url: "", anonKey: "", tabela: "votos" },

  /* Clube da Bancada (Brevo através de um proxy teu). Vazio = encaminha para o WhatsApp ou email. Ver LIGAR-SERVICOS.md */
  newsletter: { provider: "brevo", endpoint: "" }
};
