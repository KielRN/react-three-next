/**
 * Stripe Configuration for the Texas AI Reviews Service Funnel — SPANISH MIRROR.
 *
 * Reuses the SAME Stripe products / prices as the English funnel — the only
 * differences are:
 *   - display strings (Spanish copy)
 *   - successUrl / cancelUrl point to the Spanish pages
 *
 * Keep the product/price IDs in sync with `../reviews/stripe-config.js`. If you
 * rotate IDs there, rotate them here too (or refactor to a shared module).
 */

export const REVIEWS_ES_STRIPE_CONFIG = {
  products: {
    starter: process.env.NEXT_PUBLIC_REV_PRODUCT_STARTER || 'prod_UdrcxSmD0OJbBO',
    growth: process.env.NEXT_PUBLIC_REV_PRODUCT_GROWTH || 'prod_UdrcC4kQwT981T',
    pro: process.env.NEXT_PUBLIC_REV_PRODUCT_PRO || 'prod_Udrc2OFNvQcmYA',
  },
  prices: {
    starter: {
      monthly: process.env.NEXT_PUBLIC_REV_PRICE_STARTER_MONTHLY || 'price_1TeZtaJMSxLnpBGh40GjQsCC',
      annual: process.env.NEXT_PUBLIC_REV_PRICE_STARTER_ANNUAL || 'price_1TeZtbJMSxLnpBGhM5cNJ00u',
    },
    growth: {
      monthly: process.env.NEXT_PUBLIC_REV_PRICE_GROWTH_MONTHLY || 'price_1TeZtbJMSxLnpBGhlGiSMS0d',
      annual: process.env.NEXT_PUBLIC_REV_PRICE_GROWTH_ANNUAL || 'price_1TeZtbJMSxLnpBGhVucOHFcP',
    },
    pro: {
      monthly: process.env.NEXT_PUBLIC_REV_PRICE_PRO_MONTHLY || 'price_1TeZtbJMSxLnpBGh6XKh5ukr',
      annual: process.env.NEXT_PUBLIC_REV_PRICE_PRO_ANNUAL || 'price_1TeZtcJMSxLnpBGhHl8IMQH1',
    },
  },

  display: {
    starter: {
      key: 'starter',
      name: 'Inicial',
      volume: 'Hasta 50 solicitudes al mes',
      priceMonthly: '$99',
      priceAnnual: '$990',
      priceMonthlyValue: 99,
      priceAnnualValue: 990,
      popular: false,
    },
    growth: {
      key: 'growth',
      name: 'Crecimiento',
      volume: '50–100 solicitudes al mes',
      priceMonthly: '$179',
      priceAnnual: '$1,790',
      priceMonthlyValue: 179,
      priceAnnualValue: 1790,
      popular: true,
    },
    pro: {
      key: 'pro',
      name: 'Pro',
      volume: '100–300 solicitudes al mes',
      priceMonthly: '$279',
      priceAnnual: '$2,790',
      priceMonthlyValue: 279,
      priceAnnualValue: 2790,
      popular: false,
    },
  },

  features: [
    'Consigue 4 veces más reseñas',
    'Mensajes y correos automáticos',
    'Reactivación de reseñas',
    'Seguimientos dinámicos de reseñas',
    'Mensajería inteligente con IA',
    'Solicitudes con imágenes personalizadas',
    'Respuestas automáticas con IA',
    'Publicación de reseñas en redes sociales',
    'Integración personalizada con tu CRM',
    'Acceso a Zapier',
    'Usuarios ilimitados',
    'Llamada de configuración 1-a-1',
  ],

  trial: {
    days: 10,
    ctaLabel: 'Empieza Tu Prueba Gratis de 10 Días',
  },

  successUrl: '/funnels/reviews-es/gracias',
  cancelUrl: '/funnels/reviews-es/precios',
}
