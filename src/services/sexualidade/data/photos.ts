/**
 * Fotos do site. Arquivos em public/servicos/sexualidade/assets/ (nomes com hash do repositório).
 * Para trocar uma imagem: substitua o arquivo com o mesmo nome.
 */
export const photos = {
  logo: {
    src: "/servicos/sexualidade/assets/logo-inspem-header_a08984b5.webp",
    alt: "INSPEM — Instituto Percepção de Psicologia Empírica",
    width: 480,
    height: 120,
  },
  hero: {
    src: "/servicos/sexualidade/assets/ingrid-consultorio_01f79ed7.webp",
    alt: "Ingrid Francke na entrada do consultório do INSPEM, no bairro Bom Fim, em Porto Alegre",
    caption: "Ingrid Francke na entrada do consultório, Bom Fim",
    width: 1100,
    height: 1400,
  },
  equipe: {
    src: "/servicos/sexualidade/assets/tiago_alto_fc1b84.webp",
    alt: "Equipe da INSPEM: supervisoras e estagiários no consultório, no Bom Fim",
    caption: "A equipe da INSPEM no consultório, Bom Fim — Porto Alegre",
    width: 1391,
    height: 1131,
  },
  simone: {
    src: "/servicos/sexualidade/assets/supervisora-simone_059072ac.webp",
    alt: "Simone, supervisora clínica da INSPEM",
    width: 250,
    height: 315,
  },
  ingrid: {
    src: "/servicos/sexualidade/assets/supervisora-ingrid_369c6147.webp",
    alt: "Ingrid Francke, supervisora clínica da INSPEM",
    width: 250,
    height: 315,
  },
  fachada: {
    src: "/servicos/sexualidade/assets/fachada-baltimore_dbfddbea.webp",
    alt: "Fachada do Edifício Baltimore à noite, na Av. Osvaldo Aranha, 1022",
    caption: "Edifício Baltimore — fachada e acesso",
    width: 1600,
    height: 480,
    wide: true,
  },
  espera: {
    src: "/servicos/sexualidade/assets/consultorio-sala-espera_1698daab.webp",
    alt: "Sala de espera da clínica INSPEM",
    caption: "Sala de espera",
    width: 1000,
    height: 480,
    wide: false,
  },
  entrada: {
    src: "/servicos/sexualidade/assets/consultorio-entrada_79d99e1f.webp",
    alt: "Entrada do consultório INSPEM",
    caption: "Entrada do consultório",
    width: 1200,
    height: 480,
    wide: false,
  },
  atendimento: {
    src: "/servicos/sexualidade/assets/consultorio-sala-atendimento_bf036d93.webp",
    alt: "Sala de atendimento da clínica INSPEM",
    caption: "Sala de atendimento",
    width: 1200,
    height: 480,
    wide: true,
  },
  salaEquipe: {
    src: "/servicos/sexualidade/assets/consultorio-sala-equipe_8dd520a7.webp",
    alt: "Sala da equipe da clínica INSPEM",
    caption: "Sala da equipe",
    width: 800,
    height: 600,
    wide: true,
  },
} as const;

export const galleryHero = photos.fachada;

export const galleryRooms = [
  photos.atendimento,
  photos.espera,
  photos.entrada,
  photos.salaEquipe,
];
