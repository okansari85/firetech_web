<script setup lang="ts">
// Ücretsiz ön değerlendirme: solda sırayla sorular (motor belirler), sağda canlı bina görünümü; sonunda sonuç.
// Backend'siz çalışır; kurallar utils/onDegerlendirmeMotoru.ts, metinler data/onDegerlendirme.ts.
import { SINIFLAR } from '~/data/onDegerlendirme'
import { cevapEtiketi, type Eylem } from '~/utils/onDegerlendirmeMotoru'

useSeoMeta({ title: 'Ücretsiz Ön Değerlendirme', description: 'Binanızın periyodik yangın kontrol süresini birkaç soruda öğrenin.' })

const od = useOnDegerlendirme()
const { d, mevcut, cevaplananlar, sonuc, tamam } = od
const soruAlani = ref<HTMLElement | null>(null)

onMounted(() => { if (!d.value.esas) navigateTo('/ucretsiz-kontrol/kullanim-sinifi') })

const adim = computed(() => (tamam.value ? 3 : mevcut.value?.grup === 'diger' ? 2 : 1))
const adimlar = ['Kullanım sınıfı', 'Yapı bilgileri', 'Diğer kullanımlar', 'Sonuç']

const kaydir = () => nextTick(() => {
  if (import.meta.client && window.innerWidth < 1100) soruAlani.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})
const cevap = (v: any) => { if (mevcut.value) { od.cevapla(mevcut.value.id, v); kaydir() } }
const eylem = (e: Eylem) => {
  if (e.tip === 'sinif-sec') { od.sifirla(); navigateTo('/ucretsiz-kontrol/kullanim-sinifi') } else { od.eylem(e); kaydir() }
}
const geri = () => { if (!od.geri()) navigateTo('/ucretsiz-kontrol/kullanim-sinifi') }
const yeni = () => { od.sifirla(); navigateTo('/ucretsiz-kontrol/kullanim-sinifi') }
</script>

<template>
  <section class="section sayfa">
    <div class="wrap">
      <SectionTag num="03" label="Ön Değerlendirme" />
      <h1 class="title">Binanızı <span class="gold">Tanıyalım</span></h1>
      <p v-if="d.esas" class="esas">Esas kullanım: <strong>{{ SINIFLAR[d.esas].ad }}</strong> <span class="madde">BYKHY Md. {{ SINIFLAR[d.esas].madde }}</span>
        <NuxtLink to="/ucretsiz-kontrol/kullanim-sinifi" class="degistir">Değiştir</NuxtLink></p>

      <ol class="adimlar" aria-label="Adımlar">
        <li v-for="(a, i) in adimlar" :key="a" :class="{ bitti: i < adim, aktif: i === adim }">
          <span class="num" :class="{ 'gold-num': i <= adim }">{{ i < adim ? '✓' : i + 1 }}</span>{{ a }}
        </li>
      </ol>
      <GoldRule class="rule" />

      <div class="izgara">
        <div ref="soruAlani" class="sol">
          <ClientOnly>
            <template v-if="tamam">
              <KontrolSonucPaneli :sonuc="sonuc" :c="d.c" @duzenle="geri" @yeni="yeni" />
            </template>
            <template v-else-if="mevcut">
              <KontrolSoruKarti :key="mevcut.id" :soru="mevcut" :deger="d.c[mevcut.id]" @cevap="cevap" @eylem="eylem" />
              <div class="gezinti"><button type="button" class="btn ghost" @click="geri">← Geri</button></div>
            </template>
          </ClientOnly>

          <div v-if="cevaplananlar.length" class="cevaplar card">
            <h3>Cevaplarınız</h3>
            <ul>
              <li v-for="q in cevaplananlar" :key="q.id">
                <span class="c-ad">{{ q.kisaAd }}</span>
                <span class="c-deger">{{ cevapEtiketi(q, d.c[q.id]) }}</span>
                <button type="button" class="link" @click="od.degistir(q.id)">Değiştir</button>
              </li>
            </ul>
          </div>
        </div>

        <div class="sag">
          <ClientOnly><KontrolBinaGorunumu :sonuc="sonuc" :c="d.c" :esas="d.esas" /></ClientOnly>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sayfa { padding-top: 40px; }
.title { margin-top: 18px; }
.esas { margin-top: 10px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 17px; }
.esas strong { font-family: var(--font-head); font-size: 20px; color: var(--navy); }
.madde { font-family: var(--font-head); font-weight: 700; font-size: 13px; color: var(--gold); text-transform: uppercase; }
.degistir { font-size: 14px; color: var(--muted); }
.adimlar { display: flex; flex-wrap: wrap; gap: 8px 22px; margin: 22px 0 0; padding: 0; list-style: none; }
.adimlar li { display: flex; align-items: center; gap: 8px; font-family: var(--font-head); font-weight: 700; color: var(--muted); }
.adimlar li.aktif, .adimlar li.bitti { color: var(--navy); }
.adimlar .num { width: 28px; height: 28px; font-size: 14px; background: #c9ced6; }
.adimlar .num.gold-num { background: var(--gold); }
.rule { margin: 20px 0 26px; }
.izgara { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, .85fr); gap: 28px; align-items: start; }
.sol { display: flex; flex-direction: column; gap: 16px; scroll-margin-top: 96px; }
.sag { position: sticky; top: 96px; }
.gezinti { display: flex; }
.cevaplar h3 { font-size: 18px; margin-bottom: 8px; }
.cevaplar ul { margin: 0; padding: 0; list-style: none; }
.cevaplar li { display: grid; grid-template-columns: minmax(120px, .8fr) 1.2fr auto; gap: 12px; align-items: baseline; padding: 9px 0; border-top: 1px solid var(--border); font-size: 14.5px; }
.c-ad { font-family: var(--font-head); font-weight: 700; color: var(--navy); }
.link { border: 0; background: none; color: var(--gold); cursor: pointer; font: inherit; font-size: 13.5px; font-weight: 500; }
@media (max-width: 1100px) {
  .izgara { grid-template-columns: 1fr; }
  .sag { position: static; }
}
@media (max-width: 560px) { .cevaplar li { grid-template-columns: 1fr auto; } .c-deger { grid-column: 1; } }
</style>
