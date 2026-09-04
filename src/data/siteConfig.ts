import { contact, legal, location } from './site.mjs';

export const siteConfig = {
  contact: {
    ...contact,
    phone: '51997004823',
    phoneDisplay: '(51) 99700-4823',
    email: 'perceptio@perceptiopsico.com',
    whatsappDirectUrl: 'https://wa.me/5551997004823',
  },
  location: {
    ...location,
    complement: 'Sala 1610 — Edifício Baltimore',
    landmark: 'Em frente ao Parque Farroupilha (Redenção)',
  },
  legal: {
    ...legal,
    dpoName: 'Simone Sandri Modesti',
    updatedAt: '2 de setembro de 2026',
    version: '1.0',
  },
  supervisors: [
    {
      fullName: 'Simone Sandri Modesti',
      crp: 'CRP 07/2433',
    },
    {
      fullName: 'Ingrid Francke',
      crp: 'CRP 07/18623',
    },
  ],
};
