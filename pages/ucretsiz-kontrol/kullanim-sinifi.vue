<script setup lang="ts">
// EKRAN 2 — Yapının Kullanım Sınıfı (BYKHY Madde 8). "Devam Et" seçimi kaydeder ve ön değerlendirmeye geçer.
import { kullanimSiniflari } from '~/data/kullanimSiniflari'
import type { SinifKod } from '~/data/onDegerlendirme'

const ESLESME: Record<string, SinifKod> = { residential: 'konut', lodging: 'konaklama', institutional: 'kurumsal', office: 'buro', commercial: 'ticaret', industrial: 'endustri', assembly: 'toplanma', storage: 'depolama', high_hazard: 'yuksek' }

useSeoMeta({
  title: 'Yapınızın Kullanım Sınıfı',
  description: 'Yapınızın kullanımına en uygun kullanım sınıfını seçin: konut, konaklama, kurumsal, büro, ticaret, endüstriyel, toplanma, depolama veya yüksek tehlikeli yer.'
})

const od = useOnDegerlendirme()
const secili = ref<string | null>(null)
// Önceki seçim, sayfa yüklendikten sonra işaretlenir (sunucu çizimiyle uyumsuzluk olmasın).
onMounted(() => { secili.value = Object.keys(ESLESME).find(k => ESLESME[k] === od.d.value.esas) ?? null })
const devamEt = () => {
  if (!secili.value) return
  const sinif = ESLESME[secili.value]!
  if (od.d.value.esas !== sinif) od.baslat(sinif)
  navigateTo('/ucretsiz-kontrol/degerlendirme')
}
</script>

<template>
  <section class="section">
    <div class="wrap">
      <SectionTag num="02" label="Kullanım Sınıfı" />
      <h1 class="title">Yapınızın Kullanım <span class="gold">Sınıfını Seçin</span></h1>
      <p class="lead sub">Yapınızın kullanımına en uygun seçeneği seçin.</p>
      <GoldRule class="rule" />

      <div class="cards" role="radiogroup" aria-label="Kullanım sınıfı">
        <button
          v-for="(k, i) in kullanimSiniflari"
          :key="k.kod"
          type="button"
          role="radio"
          :aria-checked="secili === k.kod"
          class="card option"
          :class="{ active: secili === k.kod }"
          @click="secili = k.kod"
        >
          <span class="num" :class="{ 'gold-num': secili === k.kod }">{{ i + 1 }}</span>
          <span class="opt-body">
            <span class="opt-title">{{ k.ad }}</span>
            <span class="opt-text">{{ k.aciklama }}</span>
            <span class="opt-ref">Dayanak: BYKHY Madde {{ k.madde }}</span>
          </span>
        </button>
      </div>

      <div class="bar">
        <NuxtLink to="/ucretsiz-kontrol" class="btn ghost">Geri</NuxtLink>
        <button type="button" class="btn gold-btn" :disabled="!secili" @click="devamEt">Devam Et <AppIcon name="arrow" class="ico" /></button>
      </div>

      <p class="muted note">Yapınızda birden fazla kullanım varsa (ör. konut ve dükkân) önce esas kullanımı seçin; diğer kullanımlar sonraki adımda sorulur.</p>
    </div>
  </section>
</template>

<style scoped>
.title { margin-top: 20px; }
.sub { margin-top: 12px; }
.rule { margin: 26px 0 30px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.option {
  display: flex; gap: 14px; align-items: flex-start; text-align: left;
  font: inherit; color: inherit; cursor: pointer;
  transition: border-color .15s, box-shadow .15s;
}
.option:hover { border-color: var(--gold-line); }
.option.active { border-color: var(--gold); box-shadow: 0 0 0 2px var(--gold) inset; }
.opt-body { display: flex; flex-direction: column; gap: 6px; }
.opt-title { font-family: var(--font-head); font-size: 20px; font-weight: 700; color: var(--navy); line-height: 1.15; }
.opt-text { font-size: 14.5px; color: var(--ink); }
.opt-ref { margin-top: 4px; font-family: var(--font-head); font-size: 13.5px; font-weight: 600; color: var(--gold); text-transform: uppercase; letter-spacing: .4px; }
.bar { display: flex; justify-content: space-between; gap: 12px; margin-top: 28px; }
.ico { width: 20px; height: 20px; }
.pending { display: flex; gap: 18px; align-items: center; margin-top: 24px; border-left: 4px solid var(--gold); }
.pending p { margin-top: 4px; }
.note { margin-top: 24px; font-size: 15px; }
@media (max-width: 1000px) { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .cards { grid-template-columns: 1fr; } }
</style>
