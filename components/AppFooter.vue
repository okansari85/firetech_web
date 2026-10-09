<script setup lang="ts">
import { bilesenler } from '~/data/ekosistem'
</script>

<template>
  <footer class="footer">
    <div class="wrap">
      <GoldRule />
      <div class="cols">
        <div class="about">
          <div class="brand">
            <img src="/img/firetech-kalkan.png" alt="" width="32" height="40">
            <span class="brand-name"><span class="gold">FIRE</span>TECH</span>
          </div>
          <p>Yangın güvenliği bilgisini, mühendislik yaklaşımını ve dijital iş akışlarını tek ekosistemde buluşturur.</p>
        </div>
        <nav aria-label="Ekosistem">
          <h4>Ekosistem</h4>
          <NuxtLink v-for="b in bilesenler" :key="b.slug" :to="`/ekosistem#${b.slug}`">{{ b.ad }}</NuxtLink>
        </nav>
        <nav aria-label="Hizmetler">
          <h4>Hizmetler</h4>
          <NuxtLink to="/ucretsiz-kontrol/kullanim-sinifi">Ücretsiz Ön Değerlendirme</NuxtLink>
          <NuxtLink to="/giris">Detaylı Analiz</NuxtLink>
          <NuxtLink to="/iletisim">İletişim</NuxtLink>
        </nav>
      </div>
      <div class="bottom">
        <span>© {{ new Date().getFullYear() }} FireTech</span>
        <span>Bu sitedeki değerlendirmeler resmî periyodik kontrol raporu veya Yangın Güvenlik Raporu yerine geçmez.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer { margin-top: 0; padding: 48px 0 28px; background: var(--paper); }
.cols { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 32px; padding: 36px 0 28px; }
.brand { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.brand img { width: 32px; height: auto; }
.brand-name { font-family: var(--font-head); font-weight: 800; font-size: 24px; letter-spacing: 1px; color: var(--navy); }
.about p { max-width: 420px; color: var(--muted); font-size: 15px; }
h4 { margin-bottom: 10px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; }
nav { display: flex; flex-direction: column; gap: 6px; }
nav a { color: var(--ink); text-decoration: none; font-size: 15px; }
nav a:hover { color: var(--gold); }
.bottom { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 24px; padding-top: 18px; border-top: 1px solid var(--border); color: var(--muted); font-size: 13px; }
@media (max-width: 760px) { .cols { grid-template-columns: 1fr; gap: 24px; } }
</style>
