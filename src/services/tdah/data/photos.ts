/** Fotos fornecidas, compartilhadas em public/assets; logo específico do serviço. */
export const photos = {
  logo: {
    src: "/servicos/tdah/assets/logo-inspem-header_a08984b5.webp",
    alt: "INSPEM — Instituto Percepção de Psicologia Empírica",
    width: 480,
    height: 120,
  },
  hero: {
    src: "/assets/ingrid-porta-hero.avif",
    alt: "Ingrid Francke na entrada do consultório do INSPEM, no bairro Bom Fim, em Porto Alegre",
    caption: "Ingrid Francke na entrada do consultório, Bom Fim",
    width: 960,
    height: 1260,
  },
  equipe: {
    src: "/assets/equipe-inspem.avif",
    alt: "Equipe INSPEM",
    caption: "Equipe INSPEM",
    width: 686,
    height: 558,
  },
  simone: {
    src: "/assets/simone-retrato.avif",
    alt: "Simone, supervisora clínica da INSPEM",
    width: 248,
    height: 312,
  },
  ingrid: {
    src: "/assets/ingrid-retrato.avif",
    alt: "Ingrid Francke, supervisora clínica da INSPEM",
    width: 248,
    height: 312,
  },
  fachada: {
    src: "/assets/fachada-inspem-desktop.avif",
    alt: "Fachada do Edifício Baltimore, na Av. Osvaldo Aranha, 1022",
    caption: "Edifício Baltimore — fachada e acesso",
    width: 1216,
    height: 380,
    mobile: { src: "/assets/fachada-inspem-mobile.avif", width: 800, height: 350 },
    wide: true,
  },
  espera: {
    src: "/assets/sala-espera-inspem.avif",
    alt: "Sala de espera da clínica INSPEM",
    caption: "Sala de espera",
    width: 780,
    height: 1040,
    wide: false,
  },
  entrada: {
    src: "/assets/entrada-inspem.avif",
    alt: "Entrada do consultório INSPEM",
    caption: "Entrada do consultório",
    width: 900,
    height: 1200,
    wide: false,
  },
  atendimento: {
    src: "/assets/consultorio-inspem.avif",
    alt: "Sala de atendimento da clínica INSPEM",
    caption: "Sala de atendimento",
    width: 1200,
    height: 1600,
    wide: true,
  },
  salaEquipe: {
    src: "/assets/sala-equipe-inspem.avif",
    alt: "Sala da equipe da clínica INSPEM",
    caption: "Sala da equipe",
    width: 800,
    height: 600,
    wide: true,
  },
} as const;

export const galleryHero = photos.fachada;

export const galleryRooms = [
  photos.espera,
  photos.entrada,

];
