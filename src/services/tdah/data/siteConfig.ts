import { photos } from './photos';

export const siteConfig = {
  title: "INSPEM — Psicoterapia em TCC · Bom Fim · Porto Alegre",
  description: "Clínica de psicologia baseada em evidências no Bom Fim, Porto Alegre. TCC, supervisão semanal, nota 5,0 no Google. Em frente ao Parque da Redenção.",

  contact: {
    phone: "51997004823",
    phoneDisplay: "(51) 99700-4823",
    email: "perceptio@perceptiopsico.com",
    whatsappUrl: "https://wa.me/5551997004823?text=Ol%C3%A1!%20Quero%20solicitar%20uma%20triagem.",
    whatsappDirectUrl: "https://wa.me/5551997004823",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Osvaldo+Aranha%2C+1022%2C+Bom+Fim%2C+Porto+Alegre",
    googleReviewUrl: "https://maps.google.com/?cid=INSPEM",
  },

  session: {
    price: "95",
    duration: "50 minutos",
    frequency: "Semanal",
  },

  location: {
    address: "Av. Osvaldo Aranha, 1022",
    complement: "Sala 1610 — Edifício Baltimore",
    neighborhood: "Bom Fim, Porto Alegre — RS",
    cep: "CEP 90035-191",
    landmark: "Em frente ao Parque Farroupilha (Redenção)",
  },

  legal: {
    companyName: "PERCEPTIO PSICOLOGIA LTDA",
    cnpj: "45.276.135/0001-12",
    crpClinic: "CRP 07/01984",
    // Encarregada pelo tratamento de dados pessoais (art. 41 da LGPD).
    // Indicada por ser a responsável técnica da clínica — alterar aqui se a
    // atribuição mudar; o nome aparece na seção 9 da Política de Privacidade.
    dpoName: "Simone Sandri Modesti",
    updatedAt: "2 de setembro de 2026",
    version: "1.0",
    documents: [
      { label: "Política de Privacidade", href: "/politica-de-privacidade" },
      { label: "Política de Cookies", href: "/politica-de-privacidade#cookies" },
      { label: "Termos de Uso", href: "/termos-de-uso" },
    ],
  },

  supervisors: [
    {
      name: "Simone",
      fullName: "Simone Sandri Modesti",
      role: "Supervisora clínica · CRP 07/2433",
      crp: "CRP 07/2433",
      photo: photos.simone,
      qualifications: [
        "Mestrado em Psicologia",
        "Responsável técnica da clínica"
      ]
    },
    {
      name: "Ingrid Francke",
      fullName: "Ingrid Francke",
      role: "Supervisora clínica · fundadora",
      crp: "CRP 07/18623",
      photo: photos.ingrid,
      qualifications: [
        "Doutorado em Saúde Coletiva",
        "Especialização em prática baseada em evidências",
        "Na clínica desde 2010"
      ]
    }
  ]
};
