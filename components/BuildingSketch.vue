<script setup lang="ts">
// Ana sayfa görseli: teknik çizim tarzında ince çizgili bina kesiti; her kat bir kullanım sınıfına bağlanır.
const katlar = [
  { ad: 'KONUT', renk: 'var(--gold)' },
  { ad: 'TİCARET', renk: 'var(--red)' },
  { ad: 'BÜRO', renk: 'var(--navy)' },
  { ad: 'ENDÜSTRİ', renk: 'var(--muted)' },
  { ad: 'DEPO', renk: 'var(--gold)' }
]
const top = 70
const h = 62
</script>

<template>
  <svg viewBox="0 0 460 420" role="img" aria-label="Kullanım sınıflarına ayrılmış bina kesiti" class="sketch">
    <!-- çatı -->
    <path d="M40 70 L170 22 L300 70" fill="none" stroke="var(--navy)" stroke-width="1.6" />
    <line x1="170" y1="22" x2="170" y2="70" stroke="var(--navy)" stroke-width="1" />
    <!-- dış duvar -->
    <rect x="48" y="70" width="244" :height="h * katlar.length" fill="#fff" stroke="var(--navy)" stroke-width="1.6" />
    <!-- zemin -->
    <rect x="30" :y="top + h * katlar.length" width="280" height="10" fill="none" stroke="var(--navy)" stroke-width="1" />
    <g v-for="(k, i) in katlar" :key="k.ad">
      <!-- kat çerçevesi -->
      <rect x="56" :y="top + i * h + 6" width="228" :height="h - 12" fill="none" :stroke="k.renk" stroke-width="1.4" rx="1" />
      <!-- iç ayrım: merdiven çekirdeği -->
      <line x1="150" :y1="top + i * h + 6" x2="150" :y2="top + i * h + h - 6" stroke="var(--navy)" stroke-width=".8" />
      <line x1="178" :y1="top + i * h + 6" x2="178" :y2="top + i * h + h - 6" stroke="var(--navy)" stroke-width=".8" />
      <rect x="157" :y="top + i * h + 22" width="14" :height="h - 28" fill="none" stroke="var(--navy)" stroke-width=".8" />
      <!-- pencereler -->
      <rect x="70" :y="top + i * h + 18" width="22" height="16" fill="none" stroke="var(--navy)" stroke-width=".8" />
      <rect x="104" :y="top + i * h + 18" width="30" height="24" fill="none" stroke="var(--navy)" stroke-width=".8" />
      <rect x="196" :y="top + i * h + 18" width="34" height="20" fill="none" stroke="var(--navy)" stroke-width=".8" />
      <rect x="244" :y="top + i * h + 18" width="26" height="26" fill="none" stroke="var(--navy)" stroke-width=".8" />
      <!-- bağlantı çizgisi ve etiket -->
      <line x1="292" :y1="top + i * h + h / 2" x2="352" :y2="top + i * h + h / 2" :stroke="k.renk" stroke-width="1.2" />
      <circle cx="362" :cy="top + i * h + h / 2" r="10" fill="#fff" :stroke="k.renk" stroke-width="1.4" />
      <circle cx="362" :cy="top + i * h + h / 2" r="3" :fill="k.renk" />
      <text x="380" :y="top + i * h + h / 2 + 6" :fill="k.renk" class="label">{{ k.ad }}</text>
    </g>
  </svg>
</template>

<style scoped>
.sketch { width: 100%; height: auto; }
.label { font-family: var(--font-head); font-size: 17px; font-weight: 700; letter-spacing: .5px; }
</style>
