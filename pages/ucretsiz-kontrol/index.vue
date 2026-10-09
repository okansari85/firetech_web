<script setup lang="ts">
// EKRAN 1 — Giriş (müşterinin "ÜCRETSİZ EKRANLAR" dokümanı).
useSeoMeta({
  title: 'Periyodik Yangın Kontrolüne Tabi misiniz?',
  description: 'Binanızın kontrol süresini 2 dakikada öğrenin. Ücretsiz periyodik yangın kontrolü ön değerlendirmesi.'
})

const maddeler = [
  { baslik: 'Periyodik yangın kontrolüne tabi olup olmadığınızı öğrenin.', metin: 'Yapınızın özelliklerine göre periyodik kontrol kapsamında olup olmadığınızı görün.', ikon: 'shield' },
  { baslik: 'Kontrolün kaç yılda bir yapılması gerektiğini görün.', metin: 'Yapınıza uygulanacak kontrol periyodunu öğrenin.', ikon: 'clock' },
  { baslik: 'Yapınızın hangi kullanım sınıfında değerlendirildiğini öğrenin.', metin: 'Yapının kullanım amacına göre hangi sınıfta değerlendirildiğini görün.', ikon: 'building' },
  { baslik: 'Sonucu belirleyen temel bilgileri görün.', metin: 'Kontrol kapsamını ve periyodunu hangi bilgilerin belirlediğini açıkça görün.', ikon: 'search' }
]
</script>

<template>
  <section class="section">
    <div class="wrap">
      <SectionTag num="01" label="Giriş" />
      <h1 class="title">Binanızın Yangın Kontrolü <span class="gold">Ne Zaman?</span></h1>
      <h2 class="subtitle">Periyodik Yangın Kontrolüne Tabi misiniz?</h2>
      <GoldRule class="rule" />

      <div class="grid">
        <div class="intro">
          <p class="lead"><strong>Binanızın kontrol süresini 2 dakikada öğrenin.</strong></p>
          <p class="lead">Birkaç basit bilgiyle binanızın veya işletmenizin periyodik yangın kontrolü kapsamında olup olmadığını ve kontrolün kaç yılda bir yapılması gerektiğini kolayca öğrenin.</p>
          <div class="facts">
            <div class="fact"><strong>2 Dakika</strong><span>Hızlı ve kolay</span></div>
            <div class="fact"><strong>Ücretsiz</strong><span>Ön değerlendirme</span></div>
          </div>
          <NuxtLink to="/ucretsiz-kontrol/kullanim-sinifi" class="btn gold-btn">Ücretsiz Kontrol Et <AppIcon name="arrow" class="ico" /></NuxtLink>
          <p class="muted next">Daha güvenli yapılar için ilk adımı şimdi atın.</p>
        </div>

        <div class="card learn">
          <h3>Neler Öğrenebilirsiniz?</h3>
          <ul>
            <li v-for="m in maddeler" :key="m.baslik">
              <span class="badge-icon small"><AppIcon :name="m.ikon" /></span>
              <div><strong>{{ m.baslik }}</strong><p>{{ m.metin }}</p></div>
            </li>
          </ul>
        </div>
      </div>

      <WarningBox class="warn">Bu çalışma, verdiğiniz bilgilere göre hazırlanan ücretsiz bir ön değerlendirmedir. Resmî periyodik yangın kontrolü veya Yangın Güvenlik Raporu yerine geçmez.</WarningBox>
    </div>
  </section>
</template>

<style scoped>
.title { margin-top: 20px; }
.subtitle { margin-top: 10px; font-size: clamp(22px, 3vw, 30px); color: var(--ink); }
.rule { margin: 26px 0 32px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; align-items: start; }
.intro { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
.facts { display: flex; gap: 14px; margin: 8px 0; }
.fact { display: flex; flex-direction: column; padding: 14px 22px; border: 1px solid var(--border); border-left: 4px solid var(--gold); border-radius: 8px; }
.fact strong { font-family: var(--font-head); font-size: 24px; color: var(--navy); text-transform: uppercase; }
.fact span { color: var(--muted); font-size: 14px; }
.ico { width: 20px; height: 20px; }
.next { font-size: 15px; }
.learn h3 { margin-bottom: 8px; text-transform: uppercase; }
.learn ul { margin: 0; padding: 0; list-style: none; }
.learn li { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--border); }
.learn li:last-child { border-bottom: 0; }
.learn strong { color: var(--navy); font-family: var(--font-head); font-size: 18px; }
.learn p { color: var(--muted); font-size: 15px; }
.badge-icon.small { width: 42px; height: 42px; }
.badge-icon.small svg { width: 20px; height: 20px; }
.warn { margin-top: 40px; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
</style>
