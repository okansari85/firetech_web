<script setup lang="ts">
// Üyelik, ödeme ve ücretli analiz sonraki etapta.
useSeoMeta({ title: 'Giriş', description: 'FireTech hesabınıza giriş yapın.' })
</script>

<template>
  <section class="section">
    <div class="wrap narrow">
      <SectionTag label="Hesabım" />
      <h1 class="title">Giriş <span class="gold">Yakında</span></h1>
      <GoldRule class="rule" :start="false" />
      <div class="card box">
        <span class="badge-icon"><AppIcon name="report" /></span>
        <div>
          <h3>Detaylı analiz ve PDF raporlar için hesap</h3>
          <p>Ücretsiz ön değerlendirmenizi tamamladıktan sonra hesabınızla detaylı yangın güvenliği analizini başlatabilecek ve hazırlık raporunuzu PDF olarak indirebileceksiniz. Üyelik çok yakında açılacak.</p>
          <NuxtLink to="/ucretsiz-kontrol/kullanim-sinifi" class="btn gold-btn">Ücretsiz Kontrol Et</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.narrow { max-width: 860px; }
.title { margin-top: 20px; }
.rule { margin: 24px 0 28px; }
.box { display: flex; gap: 20px; align-items: flex-start; }
.box p { margin: 8px 0 18px; }
@media (max-width: 600px) { .box { flex-direction: column; } }
</style>
