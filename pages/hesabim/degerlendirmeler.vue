<script setup lang="ts">
// Hesabım › Ücretsiz Değerlendirmelerim: backend'e kaydedilmiş geçmiş. "Sonucu Gör" değerlendirmeyi açar (sonuç güncel
// motorla yeniden hesaplanır); analizi satın alınmamışsa oradan detaylı analize geçilebilir.
import { SINIFLAR, type SinifKod } from '~/data/onDegerlendirme'
import type { KayitliDegerlendirme } from '~/composables/useUyelik'

useSeoMeta({ title: 'Ücretsiz Değerlendirmelerim', robots: 'noindex' })

const { degerlendirmeler } = useUyelik()
const od = useOnDegerlendirme()

const tarih = (s: string) => new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
const sinifAdi = (k: string | null) => (k && k in SINIFLAR ? SINIFLAR[k as SinifKod].ad : '—')
const periyot = (k: KayitliDegerlendirme) => (k.result?.nihai ? `${k.result.nihai} yıl` : 'Belirlenemedi')
const ac = (k: KayitliDegerlendirme) => {
  if (!k.primary_class || !(k.primary_class in SINIFLAR)) return
  od.kayittanAc(k.primary_class as SinifKod, k.answers, k.uuid)
  navigateTo('/ucretsiz-kontrol/degerlendirme')
}
</script>

<template>
  <HesabimCerceve baslik="Ücretsiz Değerlendirmelerim">
    <div v-if="!degerlendirmeler.length" class="card bos">
      <p class="muted">Henüz kayıtlı bir değerlendirmeniz yok.</p>
      <NuxtLink to="/ucretsiz-kontrol/kullanim-sinifi" class="btn analiz-btn">Ücretsiz Kontrol Et <AppIcon name="arrow" class="ico" /></NuxtLink>
    </div>
    <ul v-else class="liste">
      <li v-for="k in degerlendirmeler" :key="k.uuid" class="card satir">
        <div class="bilgi">
          <small class="muted">{{ tarih(k.updated_at) }}</small>
          <strong>{{ k.result?.analizAdi || sinifAdi(k.primary_class) }}</strong>
          <span class="muted">Esas kullanım: {{ sinifAdi(k.primary_class) }}</span>
        </div>
        <div class="sag">
          <span class="periyot"><small>Periyot</small>{{ periyot(k) }}</span>
          <span v-if="k.paid" class="rozet">Analiz satın alındı</span>
          <button type="button" class="btn ghost" @click="ac(k)">Sonucu Gör</button>
        </div>
      </li>
    </ul>
  </HesabimCerceve>
</template>

<style scoped>
.bos { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
.liste { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.satir { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.bilgi { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.bilgi strong { font-family: var(--font-head); font-size: 19px; color: var(--navy); }
.sag { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.periyot { display: flex; flex-direction: column; font-family: var(--font-head); font-size: 20px; font-weight: 700; color: var(--navy); line-height: 1.1; }
.periyot small { font-family: var(--font-body); font-size: 12px; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
.rozet { padding: 4px 10px; border-radius: 999px; background: var(--navy); color: var(--gold-2); font-size: 13px; font-weight: 600; }
.muted { color: var(--muted); }
.analiz-btn { background: var(--navy); border-color: var(--navy); color: var(--gold-2); }
.ico { width: 20px; height: 20px; }
</style>
