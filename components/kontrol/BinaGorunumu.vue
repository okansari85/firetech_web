<script setup lang="ts">
// Canlı bina görünümü: cevaplar değiştikçe bina çizimi, etiketler ve anlık periyot güncellenir.
// Kat sayısı yapı yüksekliğine, genişlik yapı inşaat alanına göre; aynı yapıdaki bağımsız kullanımlar zemin katlarda renkli bant,
// ayrı yapıdaki kullanımlar yanda küçük yapı olarak çizilir. Yardımcı alanlar yalnız özette listelenir.
import { SINIFLAR, YUKSEKLIK, ALAN, type SinifKod } from '~/data/onDegerlendirme'
import type { Sonuc, KullanimSonucu, Cevaplar } from '~/utils/onDegerlendirmeMotoru'

const props = defineProps<{ sonuc: Sonuc; c: Cevaplar; esas: SinifKod | null }>()

const ZEMIN = 372
const renk = (s: SinifKod | null) => (s ? SINIFLAR[s].renk : '#9aa1a9')
const periyotYazi = (k: KullanimSonucu) => k.durum === 'gecerli' ? `${k.periyot} YIL` : k.durum === 'tanimsiz' ? 'TANIMSIZ' : k.durum === 'eksik' ? 'BEKLENİYOR' : k.durum === 'ana_parcasi' ? 'ANA KULLANIM' : k.durum === 'ayri_yapi' ? 'AYRI YAPI' : k.durum === 'inceleme' ? 'DOĞRULAMA' : 'BELİRSİZ'

const cizim = computed(() => {
  const y = props.c.yukseklik
  const n = y === 'lt_30_50' ? 5 : y === '30_50_51_50' ? 11 : y === 'ge_51_50' ? 15 : 7
  const w = props.c.alan === 'gt_1000' ? 196 : props.c.alan === 'le_1000' ? 150 : 172
  const x0 = 200 - w / 2 - 20
  const katH = Math.min(30, 290 / n)
  const ust = ZEMIN - n * katH
  const ayni = props.sonuc.kullanimlar.filter(k => k.iliski === 'ayni')
  const bantKat = Math.max(1, Math.min(2, Math.floor((n - 2) / Math.max(1, ayni.length))))
  const bantlar = ayni.map((k, i) => ({ k, y: ZEMIN - (i + 1) * bantKat * katH, h: bantKat * katH }))
  const esasAlt = ZEMIN - ayni.length * bantKat * katH
  const katlar = Array.from({ length: n }, (_, i) => ZEMIN - (i + 1) * katH)
  const pencereler: { x: number; y: number; w: number; h: number }[] = []
  for (const ky of katlar) for (let j = 0; j < 4; j++) pencereler.push({ x: x0 + 12 + j * ((w - 24) / 4), y: ky + katH * 0.28, w: (w - 24) / 4 - 8, h: katH * 0.44 })
  // Etiketler (sağda, üst üste binmesin)
  const esas = props.sonuc.kullanimlar.find(k => k.iliski === 'esas')
  const etiketler = [
    ...(esas ? [{ k: esas, yHedef: (ust + esasAlt) / 2 }] : []),
    ...bantlar.map(b => ({ k: b.k, yHedef: b.y + b.h / 2 }))
  ].sort((a, b) => b.yHedef - a.yHedef)
  let son = ZEMIN + 40
  const yerlesik = etiketler.map(e => { const ye = Math.min(e.yHedef, son - 38); son = ye; return { ...e, y: ye } })
  const ayri = props.sonuc.kullanimlar.filter(k => k.iliski === 'ayri')
  return { n, w, x0, katH, ust, bantlar, esasAlt, katlar, pencereler, etiketler: yerlesik, ayri }
})

const yukseklikYazi = computed(() => YUKSEKLIK.find(s => s.deger === props.c.yukseklik)?.etiket)
const alanYazi = computed(() => ALAN.find(s => s.deger === props.c.alan)?.etiket)
const yardimcilar = computed(() => props.sonuc.kullanimlar.filter(k => k.iliski === 'yardimci' || k.durum === 'ana_parcasi'))
const anlik = computed(() => {
  const s = props.sonuc
  if (s.genel === 'tabi') return { buyuk: `${s.nihai} YIL`, kucuk: 'Anlık periyot', tip: 'tabi' }
  if (s.genel === 'tanimsiz') return { buyuk: 'TANIMSIZ', kucuk: 'EK-1’de süre tanımlı değil', tip: 'tanimsiz' }
  return { buyuk: '—', kucuk: 'Cevaplarınızla belirlenecek', tip: 'bekliyor' }
})
</script>

<template>
  <aside class="panel">
    <div class="panel-ust">
      <span class="baslik">BİNA GÖRÜNÜMÜ</span>
      <span class="anlik" :class="anlik.tip"><small>{{ anlik.kucuk }}</small><strong>{{ anlik.buyuk }}</strong></span>
    </div>

    <svg viewBox="0 0 420 420" role="img" aria-label="Binanın kullanımlara göre canlı görünümü" class="svg">
      <!-- zemin çizgileri -->
      <line x1="10" :y1="ZEMIN" x2="410" :y2="ZEMIN" stroke="var(--navy)" stroke-width="1.5" />
      <!-- yükseklik ölçüsü -->
      <g v-if="yukseklikYazi" class="olcu">
        <line :x1="cizim.x0 - 18" :y1="cizim.ust" :x2="cizim.x0 - 18" :y2="ZEMIN" stroke="var(--gold)" stroke-width="1.2" />
        <line :x1="cizim.x0 - 24" :y1="cizim.ust" :x2="cizim.x0 - 12" :y2="cizim.ust" stroke="var(--gold)" stroke-width="1.2" />
        <line :x1="cizim.x0 - 24" :y1="ZEMIN" :x2="cizim.x0 - 12" :y2="ZEMIN" stroke="var(--gold)" stroke-width="1.2" />
      </g>
      <text :x="cizim.x0 + cizim.w / 2" :y="cizim.ust - 22" text-anchor="middle" class="ust-yazi">{{ yukseklikYazi ? `Yapı yüksekliği: ${yukseklikYazi}` : `${cizim.n} katlı temsilî görünüm` }}</text>

      <!-- çatı -->
      <rect :x="cizim.x0 - 6" :y="cizim.ust - 8" :width="cizim.w + 12" height="8" fill="var(--navy)" />
      <!-- esas gövde -->
      <rect :x="cizim.x0" :y="cizim.ust" :width="cizim.w" :height="cizim.esasAlt - cizim.ust" :fill="renk(esas)" fill-opacity=".12" :stroke="renk(esas)" stroke-width="1.6" />
      <!-- bağımsız kullanım bantları -->
      <g v-for="b in cizim.bantlar" :key="b.k.anahtar">
        <rect :x="cizim.x0" :y="b.y" :width="cizim.w" :height="b.h" :fill="renk(b.k.sinif)" fill-opacity=".28" :stroke="renk(b.k.sinif)" stroke-width="1.8" />
      </g>
      <!-- kat çizgileri ve pencereler -->
      <line v-for="(ky, i) in cizim.katlar" :key="'k' + i" :x1="cizim.x0" :y1="ky" :x2="cizim.x0 + cizim.w" :y2="ky" stroke="var(--navy)" stroke-opacity=".25" />
      <rect v-for="(p, i) in cizim.pencereler" :key="'p' + i" :x="p.x" :y="p.y" :width="p.w" :height="p.h" fill="#fff" stroke="var(--navy)" stroke-opacity=".45" stroke-width=".8" />
      <rect :x="cizim.x0" :y="cizim.ust" :width="cizim.w" :height="ZEMIN - cizim.ust" fill="none" stroke="var(--navy)" stroke-width="1.8" />

      <!-- etiketler -->
      <g v-for="e in cizim.etiketler" :key="'e' + e.k.anahtar">
        <polyline :points="`${cizim.x0 + cizim.w},${e.yHedef} ${cizim.x0 + cizim.w + 14},${e.yHedef} ${cizim.x0 + cizim.w + 26},${e.y} 318,${e.y}`" fill="none" :stroke="renk(e.k.sinif)" stroke-width="1.3" />
        <circle cx="326" :cy="e.y" r="8" fill="#fff" :stroke="renk(e.k.sinif)" stroke-width="1.5" />
        <circle cx="326" :cy="e.y" r="3" :fill="renk(e.k.sinif)" />
        <text x="340" :y="e.y - 2" class="etiket" :fill="renk(e.k.sinif)">{{ e.k.sinif ? SINIFLAR[e.k.sinif].kisa.toLocaleUpperCase('tr') : 'BİLİNMİYOR' }}</text>
        <text x="340" :y="e.y + 13" class="etiket-alt">{{ periyotYazi(e.k) }}</text>
      </g>

      <!-- ayrı yapılar -->
      <g v-for="(k, i) in cizim.ayri" :key="'a' + k.anahtar">
        <rect :x="14 + i * 0" :y="ZEMIN - 58 - i * 66" width="44" height="52" :fill="renk(k.sinif)" fill-opacity=".15" :stroke="renk(k.sinif)" stroke-width="1.4" stroke-dasharray="4 3" />
        <text :x="36" :y="ZEMIN - 64 - i * 66" text-anchor="middle" class="ayri-yazi" :fill="renk(k.sinif)">{{ k.sinif ? SINIFLAR[k.sinif].kisa.toLocaleUpperCase('tr') : '' }}</text>
      </g>

      <text :x="cizim.x0 + cizim.w / 2" :y="ZEMIN + 26" text-anchor="middle" class="alt-yazi">{{ alanYazi ? `Yapı inşaat alanı: ${alanYazi}` : '' }}</text>
    </svg>

    <ul class="lejant">
      <li v-for="k in sonuc.kullanimlar" :key="'l' + k.anahtar">
        <span class="nokta" :style="{ background: renk(k.sinif) }" />
        <span class="l-ad">{{ k.sinif ? SINIFLAR[k.sinif].kisa : k.ad }}</span>
        <span class="l-tag">{{ k.iliski === 'esas' ? 'Esas kullanım' : k.iliski === 'ayni' ? 'Aynı yapıda' : k.iliski === 'ayri' ? 'Ayrı yapı' : k.iliski === 'yardimci' ? 'Yardımcı alan' : '—' }}</span>
        <strong class="l-per">{{ periyotYazi(k) }}</strong>
      </li>
    </ul>
    <p v-if="yardimcilar.length" class="yardimci-not">{{ yardimcilar.length }} alan ana kullanımla birlikte değerlendirildi.</p>
  </aside>
</template>

<style scoped>
.panel { display: flex; flex-direction: column; gap: 10px; padding: 20px; background: #fff; border: 1px solid var(--border); border-radius: 12px; }
.panel-ust { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1.5px solid var(--gold-line); }
.baslik { font-family: var(--font-head); font-weight: 800; letter-spacing: 1.2px; color: var(--navy); }
.anlik { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1; }
.anlik small { font-size: 12px; color: var(--muted); }
.anlik strong { font-family: var(--font-head); font-size: 30px; font-weight: 800; color: var(--muted); }
.anlik.tabi strong { color: var(--gold); }
.anlik.tanimsiz strong { color: var(--navy); font-size: 22px; }
.svg { width: 100%; height: auto; }
.ust-yazi { font-family: var(--font-head); font-size: 13px; font-weight: 700; fill: var(--gold); }
.alt-yazi { font-family: var(--font-head); font-size: 13px; font-weight: 700; fill: var(--navy); }
.etiket { font-family: var(--font-head); font-size: 14px; font-weight: 800; letter-spacing: .4px; }
.etiket-alt { font-family: var(--font-head); font-size: 12px; font-weight: 700; fill: var(--navy); }
.ayri-yazi { font-family: var(--font-head); font-size: 10px; font-weight: 800; }
.lejant { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; }
.lejant li { display: grid; grid-template-columns: 12px 1fr auto auto; gap: 10px; align-items: center; padding: 9px 0; border-top: 1px solid var(--border); font-size: 14.5px; }
.nokta { width: 12px; height: 12px; border-radius: 50%; }
.l-ad { font-family: var(--font-head); font-weight: 700; color: var(--navy); }
.l-tag { font-size: 12.5px; color: var(--muted); }
.l-per { font-family: var(--font-head); color: var(--navy); min-width: 64px; text-align: right; }
.yardimci-not { font-size: 13px; color: var(--muted); }
</style>
