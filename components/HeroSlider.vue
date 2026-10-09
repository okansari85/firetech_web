<script setup lang="ts">
// Ana sayfa giriş arka planı: BYKHY kullanım sınıflarından örnek yapılar, yumuşak geçişli slayt.
// Yeni görsel: public/img/hero/ altına <ad>.webp (≈1774×887, sol tarafı beyaza erimiş) ve <ad>-mobil.webp ekleyip listeye yaz.
const slaytlar = [
  { ad: 'karma-kullanim', etiket: 'Karma kullanım', alt: 'Konut, ticaret, büro, endüstri ve depo katlarından oluşan bina' },
  { ad: 'otel', etiket: 'Konaklama', alt: 'Gün batımında otel girişi' },
  { ad: 'egitim-kampusu', etiket: 'Kurumsal', alt: 'Spor alanlı eğitim kampüsü' },
  { ad: 'endustriyel-tesis', etiket: 'Endüstriyel tesis', alt: 'Modern endüstriyel tesis' }
]
const SURE = 6500

const aktif = ref(0)
let zamanlayici: ReturnType<typeof setInterval> | undefined

const baslat = () => {
  durdur()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  zamanlayici = setInterval(() => { aktif.value = (aktif.value + 1) % slaytlar.length }, SURE)
}
const durdur = () => { if (zamanlayici) clearInterval(zamanlayici) }
const sec = (i: number) => { aktif.value = i; baslat() }

onMounted(baslat)
onBeforeUnmount(durdur)
</script>

<template>
  <div class="slider">
    <div class="slides" aria-hidden="true">
      <div v-for="(s, i) in slaytlar" :key="s.ad" class="slide" :class="{ on: i === aktif }">
        <!-- kenar boşluklarını dolduran bulanık kopya -->
        <img class="bg" :src="`/img/hero/${s.ad}-mobil.webp`" alt="" :loading="i === 0 ? 'eager' : 'lazy'">
        <picture class="fg">
          <source media="(max-width: 700px)" :srcset="`/img/hero/${s.ad}-mobil.webp`">
          <img :src="`/img/hero/${s.ad}.webp`" :alt="s.alt" :loading="i === 0 ? 'eager' : 'lazy'" :fetchpriority="i === 0 ? 'high' : 'auto'" width="1774" height="887">
        </picture>
      </div>
    </div>
    <div class="dots" role="tablist" aria-label="Örnek yapılar">
      <button
        v-for="(s, i) in slaytlar"
        :key="s.ad"
        type="button"
        role="tab"
        :aria-selected="i === aktif"
        :aria-label="s.etiket"
        class="dot"
        :class="{ on: i === aktif }"
        @click="sec(i)"
      >
        <span class="dot-bar" />
        <span class="dot-label">{{ s.etiket }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.slider { overflow: hidden; }
.slides { position: absolute; inset: 0; }
.slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.6s ease; }
.slide.on { opacity: 1; }
.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(22px) saturate(1.05); transform: scale(1.12); }
/* Görsel %5 soldan başlar, genişliğin %91,8'ini kaplar: bina ~%50–84, etiketler ~%95'te biter. */
.fg { position: absolute; top: 0; bottom: 0; left: 5%; width: 91.8%;
  -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 97.5%, transparent 100%); mask-image: linear-gradient(90deg, #000 0%, #000 97.5%, transparent 100%); }
.fg img { width: 100%; height: 100%; object-fit: cover; object-position: right center; transform: scale(1.05); transition: transform 7s ease-out; }
.slide.on .fg img { transform: scale(1); }

.dots { position: absolute; right: 28px; bottom: 20px; z-index: 2; display: flex; gap: 16px; padding: 9px 16px 7px; border-radius: 8px; background: rgba(12, 40, 64, .62); backdrop-filter: blur(6px); }
.dot { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 4px 0; border: 0; background: none; cursor: pointer; }
.dot-bar { width: 44px; height: 3px; border-radius: 2px; background: rgba(255, 255, 255, .45); transition: background .3s, width .3s; }
.dot.on .dot-bar { width: 64px; background: var(--gold-2); }
.dot-label { font-family: var(--font-head); font-size: 12.5px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: #fff; opacity: .7; }
.dot.on .dot-label { opacity: 1; }

@media (max-width: 1180px) {
  .fg { left: 0; width: 100%; -webkit-mask-image: none; mask-image: none; }
}

@media (max-width: 700px) {
  .dots { right: 12px; bottom: 12px; gap: 10px; padding: 7px 10px 5px; }
  .dot-bar { width: 28px; }
  .dot.on .dot-bar { width: 40px; }
  .dot-label { font-size: 10.5px; }
  .dot:not(.on) .dot-label { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .slide, .fg img { transition: none; }
  .fg img { transform: none; }
}
</style>
