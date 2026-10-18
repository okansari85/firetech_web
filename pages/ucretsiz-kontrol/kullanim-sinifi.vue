<script setup lang="ts">
// EKRAN 2 — Yapının Kullanım Sınıfı (BYKHY Madde 8). "Devam Et" seçimi kaydeder ve ön değerlendirmeye geçer.
import { kullanimSiniflari } from '~/data/kullanimSiniflari'
import type { SinifKod } from '~/data/onDegerlendirme'

const ESLESME: Record<string, SinifKod> = { residential: 'konut', lodging: 'konaklama', institutional: 'kurumsal', office: 'buro', commercial: 'ticaret', industrial: 'endustri', assembly: 'toplanma', storage: 'depolama', high_hazard: 'yuksek' }

useSeoMeta({
  title: 'Yapınızın Kullanım Sınıfı',
  description: 'Yapınızın kullanımına en uygun kullanım sınıfını seçin: konut, konaklama, kurumsal, büro, ticaret, endüstriyel, toplanma, depolama veya yüksek tehlikeli yer.'
})

const acik = reactive<Record<string, boolean>>({})
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
  <section class="section sayfa">
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
          <!-- Sınıf fotoğrafı (kullanıcı 18 Ekim 2026) -->
          <img class="opt-foto" :src="`/img/siniflar/${k.kod}.webp`" :alt="k.ad" width="800" height="600" loading="lazy">
          <span class="opt-ic">
          <span class="num" :class="{ 'gold-num': secili === k.kod }">{{ i + 1 }}</span>
          <span class="opt-body">
            <span class="opt-title">{{ k.ad }}</span>
            <!-- Açıklama metni değişmez; ilk 3 satır görünür, "Devamını oku" ile kutu içinde açılır -->
            <span class="opt-text" :class="{ kisa: !acik[k.kod] }">{{ k.aciklama }}</span>
            <span class="devam" role="button" tabindex="0" @click.stop="acik[k.kod] = !acik[k.kod]" @keydown.enter.stop.prevent="acik[k.kod] = !acik[k.kod]">{{ acik[k.kod] ? 'Kısalt' : 'Devamını oku' }}</span>
            <span class="opt-ref">Dayanak: BYKHY Madde {{ k.madde }}</span>
            <span v-if="k.not" class="opt-not">{{ k.not }}</span>
          </span>
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
/* Header ile başlık arasında boşluk yok; Devam Et kaydırmadan görünsün. */
.sayfa { padding-top: 18px; }
.title { margin-top: 14px; }
.sub { margin-top: 8px; }
.rule { margin: 16px 0 20px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.option {
  display: flex; flex-direction: column; gap: 0; padding: 0; overflow: hidden; align-items: stretch; text-align: left;
  font: inherit; color: inherit; cursor: pointer;
  transition: border-color .15s, box-shadow .15s;
}
.option:hover { border-color: var(--gold-line); }
.option.active { border-color: var(--gold); box-shadow: 0 0 0 2px var(--gold) inset; }
.opt-foto { display: block; flex: none; width: 100%; height: 190px; object-fit: cover; }
.opt-ic { display: flex; gap: 14px; align-items: flex-start; padding: 18px 20px 20px; }
.opt-text.kisa { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.devam { align-self: flex-start; font-size: 13.5px; font-weight: 600; color: var(--gold); text-decoration: underline; cursor: pointer; }
.opt-body { display: flex; flex-direction: column; gap: 6px; }
.opt-title { font-family: var(--font-head); font-size: 20px; font-weight: 700; color: var(--navy); line-height: 1.15; }
.opt-text { font-size: 14.5px; color: var(--ink); white-space: pre-line; }
.opt-not { margin-top: 6px; font-size: 14px; color: var(--ink); }
.opt-ref { margin-top: 4px; font-family: var(--font-head); font-size: 13.5px; font-weight: 600; color: var(--gold); text-transform: uppercase; letter-spacing: .4px; }
.bar {
  display: flex; justify-content: space-between; gap: 12px; margin-top: 20px;
  /* Küçük ekranda kartlar uzun: Geri / Devam Et alt kenarda sabit durur. */
  position: sticky; bottom: 0; z-index: 5;
  padding: 14px 0; background: #fff; border-top: 1px solid var(--gold-line);
}
.ico { width: 20px; height: 20px; }
.pending { display: flex; gap: 18px; align-items: center; margin-top: 24px; border-left: 4px solid var(--gold); }
.pending p { margin-top: 4px; }
.note { margin-top: 24px; font-size: 15px; }
@media (max-width: 1000px) { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .cards { grid-template-columns: 1fr; } }
</style>
