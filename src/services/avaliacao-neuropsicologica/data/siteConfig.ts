import { photos } from './photos';

export const siteConfig = {
  title: "INSPEM — Avaliação Neuropsicológica em Porto Alegre",
  description: "Avaliação neuropsicológica presencial para todas as idades no Bom Fim, em Porto Alegre. Processo completo com testes, devolutiva e laudo técnico.",

  contact: {
    phone: "51997004823",
    whatsappUrl: "https://wa.me/5551997004823?text=Ol%C3%A1%21%20Vim%20pelo%20site%20da%20INSPEM%20e%20gostaria%20de%20saber%20sobre%20a%20disponibilidade%20para%20avalia%C3%A7%C3%A3o%20neuropsicol%C3%B3gica.",
    whatsappDirectUrl: "https://wa.me/5551997004823",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Osvaldo+Aranha%2C+1022%2C+Bom+Fim%2C+Porto+Alegre",
    googleReviewUrl: "https://maps.google.com/?cid=INSPEM",
  },

  assessment: {
    price: "880",
    duration: "50 minutos",
    sessions: "aproximadamente 8 sessões",
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
  },

  supervisors: [
    {
      name: "Simone Regina Sandri",
      fullName: "Simone Regina Sandri",
      role: "Supervisora das avaliações · CRP 07/2433",
      crp: "CRP 07/2433",
      photo: photos.simone,
      qualifications: [
        "Mestrado em Psicologia do Desenvolvimento pela UFRGS",
        "Graduação em Psicologia pela PUCRS",
        "Experiência em desenvolvimento, aprendizagem e avaliação diagnóstica",
        "Capacitação no WISC-IV",
        "Responsável técnica da clínica"
      ]
    }
  ]
};
