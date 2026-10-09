// https://nuxt.com/docs/api/configuration/nuxt-config
// FireTech kurumsal sitesi (Findeks mantığı): ücretsiz ön değerlendirme → ödeme → ücretli analiz → PDF rapor.
// YGU'ların kullandığı FireOS ayrı uygulamadır (fireos_front). API: firetech (Laravel).
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Geliştirme sunucusu açıkken derleme için ayrı klasör: NUXT_BUILD_DIR=.nuxt-deploy
  buildDir: process.env.NUXT_BUILD_DIR || '.nuxt',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'tr' },
      titleTemplate: (title?: string) => (title ? `${title} | FireTech` : 'FireTech — Bilgi · Mühendislik · Teknoloji'),
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0c2840' },
        // Müşteri sunumu: arama motorlarına kapalı (yayına çıkarken kaldırılacak).
        { name: 'robots', content: 'noindex, nofollow' }
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/img/firetech-kalkan.png' }]
    }
  },
  // Ön değerlendirme sayfası tarayıcıda saklanan cevaplarla çalışır; sunucuda çizilmez.
  routeRules: { '/ucretsiz-kontrol/degerlendirme': { ssr: false } },
  runtimeConfig: {
    public: { apiBase: 'http://localhost:8000/api' }
  }
})
