// https://nuxt.com/docs/api/configuration/nuxt-config
// FireTech kurumsal sitesi + FireOS ücretsiz ön değerlendirme (herkese açık, SSR). Uygulama: fireos_front. API: firetech.
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'FireTech',
      htmlAttrs: { lang: 'tr' }
    }
  },
  runtimeConfig: {
    public: { apiBase: 'http://localhost:8000/api' }
  }
})
