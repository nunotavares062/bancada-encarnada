/* =====================================================================
   BANCADA ENCARNADA · CONFIGURAÇÃO CENTRAL
   Contactos só por email e redes sociais. Os valores entre [parênteses
   retos] ou vazios estão POR PREENCHER: enquanto `preview` for true
   aparecem assinalados no site e os botões de email ficam inativos.
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
    email: "",                            // [POR PREENCHER] email da loja: recebe encomendas, fotografias do mural e contactos
    instagram: "bancadaencarnada",        // utilizador sem @
    tiktok: "bancadaencarnada",
    horario: "dias úteis, das 9h às 19h",
    tempoResposta: "24 horas úteis"
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

  /* Pedidos de encomenda do carrinho. Vazio = o pedido segue por email
     (abre o programa de email do cliente com o pedido já escrito).
     Com um endpoint (ex. Formspree) o pedido é enviado pelo site. Ver LIGAR-SERVICOS.md */
  encomendas: { endpoint: "" },

  /* Sondagem partilhada (Supabase). Vazio = demonstração local, identificada no site. */
  votos: { url: "", anonKey: "", tabela: "votos" },

  /* Clube da Bancada (Brevo através de um proxy). Vazio = adesão por email. */
  newsletter: { provider: "brevo", endpoint: "" }
};
