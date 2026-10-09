<script setup lang="ts">
// Sonuç (YGU Rehberi "BinaSonuc" düzeni, FireTech dili): bina periyodu, belirleyen bilgi, kullanım tablosu,
// nasıl karar verildi, sonraki kontrol tarihi, detaylı analiz ön izlemesi ve uyarı. Metinler data/onDegerlendirme.ts'de.
import { METIN, SINIFLAR } from '~/data/onDegerlendirme'
import type { Sonuc, KullanimSonucu, Cevaplar } from '~/utils/onDegerlendirmeMotoru'

const props = defineProps<{ sonuc: Sonuc; c: Cevaplar }>()
const emit = defineEmits<{ duzenle: []; yeni: [] }>()

const sonKontrol = ref('')
const sonraki = computed(() => {
  if (!sonKontrol.value || props.sonuc.nihai === null) return ''
  const t = new Date(sonKontrol.value)
  if (isNaN(t.getTime())) return ''
  t.setFullYear(t.getFullYear() + props.sonuc.nihai)
  return t.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
})
const periyotHucre = (k: KullanimSonucu) => ({
  gecerli: `${k.periyot} yıl`, tanimsiz: 'EK-1’de tanımlı değil', belirlenemedi: 'Belirlenemedi', inceleme: 'Doğrulama gerekli',
  ana_parcasi: 'Ayrı periyot yok', ayri_yapi: 'Ayrıca değerlendirilir', eksik: '—'
}[k.durum])
const uygulanan = (k: KullanimSonucu) => props.sonuc.nihai !== null && k.periyot === props.sonuc.nihai && k.durum === 'gecerli'
const belirsizler = computed(() => props.sonuc.kullanimlar.filter(k => ['belirlenemedi', 'inceleme'].includes(k.durum)))
const blok = computed(() => (props.c.blokAdi ? `Değerlendirilen yapı: ${props.c.blokAdi}` : ''))
</script>

<template>
  <section class="sonuc">
    <!-- Ana sonuç -->
    <div class="ana card" :class="sonuc.genel">
      <div class="ana-metin">
        <SectionTag num="SONUÇ" :label="sonuc.genel === 'tabi' ? 'Periyot belirlendi' : sonuc.genel === 'tanimsiz' ? 'Süre tanımlı değil' : 'Bilgi gerekli'" />
        <h2 v-if="sonuc.genel === 'tabi'">{{ METIN.tabi }}</h2>
        <h2 v-else-if="sonuc.genel === 'tanimsiz'">{{ METIN.tanimsizBaslik }}</h2>
        <h2 v-else>{{ METIN.belirlenemedi }}</h2>
        <div v-if="sonuc.genel === 'tabi'" class="belirleyen">
          <span class="b-baslik">Süreyi belirleyen</span>
          <ul><li v-for="k in sonuc.surucu" :key="k.anahtar"><strong>{{ k.sinif ? SINIFLAR[k.sinif].kisa : k.ad }}:</strong> {{ k.belirleyici }}</li></ul>
        </div>
        <p v-else-if="sonuc.genel === 'tanimsiz'" class="belirleyen">{{ METIN.tanimsizKonut }}</p>
        <ul v-else class="eksikler">
          <li v-for="k in belirsizler" :key="k.anahtar"><strong>{{ k.sinif ? SINIFLAR[k.sinif].kisa : k.ad }}:</strong> {{ k.belirleyici }}</li>
          <li v-if="!belirsizler.length">Periyodik kontrol süresinin belirlenebilmesi için gerekli bilgi eksik.</li>
        </ul>
        <p v-if="blok" class="blok">{{ blok }}</p>
      </div>
      <div v-if="sonuc.genel === 'tabi'" class="periyot">
        <small>PERİYODİK KONTROL SÜRESİ</small>
        <strong>{{ sonuc.nihai }} YIL</strong>
      </div>
    </div>

    <!-- Kullanım bazında -->
    <div class="card tablo-kart">
      <h3>Kullanım bazında sonuç</h3>
      <div class="tablo-sar">
        <table>
          <thead><tr><th>Kullanım</th><th>Sınıf</th><th>Belirleyici bilgi</th><th class="sag">Periyot</th></tr></thead>
          <tbody>
            <tr v-for="k in sonuc.kullanimlar" :key="k.anahtar" :class="{ uygulanan: uygulanan(k) }">
              <td><span class="nokta" :style="{ background: k.sinif ? SINIFLAR[k.sinif].renk : '#9aa1a9' }" />{{ k.sinif ? SINIFLAR[k.sinif].kisa : k.ad }}<small>{{ k.iliski === 'esas' ? 'Esas kullanım' : k.iliski === 'ayni' ? 'Aynı yapıda bağımsız' : k.iliski === 'ayri' ? 'Ayrı yapı' : k.iliski === 'yardimci' ? 'Yardımcı / ortak alan' : '' }}</small></td>
              <td class="nw">{{ k.madde ? `Md. ${k.madde}` : '—' }}</td>
              <td>{{ k.belirleyici || '—' }}</td>
              <td class="sag"><strong>{{ periyotHucre(k) }}</strong><small v-if="uygulanan(k)">uygulanan</small></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Nasıl karar verildi -->
    <div v-if="sonuc.notlar.length" class="card notlar">
      <h3>Nasıl karar verildi?</h3>
      <ol><li v-for="n in sonuc.notlar" :key="n">{{ n }}</li></ol>
    </div>

    <!-- Sonraki kontrol -->
    <div v-if="sonuc.genel === 'tabi'" class="card tarih">
      <label>Daha önce periyodik kontrol yapıldıysa son kontrol raporunun tarihi
        <input v-model="sonKontrol" type="date">
      </label>
      <p v-if="sonraki" class="sonraki">Bir sonraki periyodik kontrol: <strong>{{ sonraki }}</strong></p>
    </div>

    <!-- Detaylı analiz -->
    <div class="card cta">
      <h3>{{ METIN.basliklarGiris }}</h3>
      <ul class="basliklar"><li v-for="b in sonuc.basliklar" :key="b"><AppIcon name="check" />{{ b }}</li></ul>
      <p class="deger">{{ METIN.degerCumlesi }}</p>
      <div class="dugmeler">
        <NuxtLink to="/giris" class="btn gold-btn">{{ METIN.cta }} <AppIcon name="arrow" class="ico" /></NuxtLink>
        <button type="button" class="btn ghost" @click="emit('duzenle')">Cevapları Düzenle</button>
        <button type="button" class="link" @click="emit('yeni')">Yeni değerlendirme</button>
      </div>
    </div>

    <p class="uyari"><AppIcon name="alert" />{{ METIN.uyari }}</p>
  </section>
</template>

<style scoped>
.sonuc { display: flex; flex-direction: column; gap: 16px; }
.ana { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; border-top: 4px solid var(--gold); padding: 28px; }
.ana.tanimsiz { border-top-color: var(--navy); }
.ana.belirlenemedi { border-top-color: var(--muted); }
.ana h2 { margin-top: 16px; font-size: clamp(26px, 2.8vw, 38px); }
.belirleyen { margin-top: 10px; color: var(--ink); }
.belirleyen strong { font-family: var(--font-head); font-weight: 700; color: var(--navy); }
.b-baslik { font-family: var(--font-head); font-size: 13px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--gold); }
.belirleyen ul { margin: 4px 0 0; padding-left: 18px; font-size: 15px; }
.eksikler { margin: 10px 0 0; padding-left: 20px; }
.blok { margin-top: 8px; font-size: 14px; color: var(--muted); }
.periyot { display: flex; flex-direction: column; align-items: center; padding: 18px 28px; border-radius: 10px; background: var(--navy); color: #fff; }
.periyot small { font-family: var(--font-head); font-weight: 700; letter-spacing: .8px; color: #c9d3de; }
.periyot strong { font-family: var(--font-head); font-size: 64px; font-weight: 800; line-height: 1; color: var(--gold-2); }
h3 { font-size: 20px; margin-bottom: 12px; }
.tablo-sar { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14.5px; }
th { text-align: left; font-family: var(--font-head); font-size: 13px; text-transform: uppercase; letter-spacing: .5px; color: var(--muted); padding: 8px; border-bottom: 1.5px solid var(--gold-line); }
td { padding: 10px 8px; border-bottom: 1px solid var(--border); vertical-align: top; }
td small { display: block; font-size: 12px; color: var(--muted); }
td:first-child { font-family: var(--font-head); font-weight: 700; color: var(--navy); white-space: nowrap; }
.sag { text-align: right; white-space: nowrap; }
.nw { white-space: nowrap; }
.uygulanan td { background: #fbf6ea; }
.uygulanan .sag strong { color: var(--gold); }
.nokta { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
.notlar ol { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
.tarih label { display: flex; flex-direction: column; gap: 8px; font-weight: 500; }
.tarih input { max-width: 220px; min-height: 44px; padding: 0 12px; border: 1.5px solid var(--border); border-radius: 8px; font: inherit; }
.sonraki { margin-top: 10px; }
.sonraki strong { font-family: var(--font-head); font-size: 20px; color: var(--gold); }
.basliklar { margin: 0 0 14px; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 18px; }
.basliklar li { display: flex; align-items: center; gap: 8px; font-family: var(--font-head); font-weight: 700; color: var(--navy); }
.basliklar svg { width: 18px; height: 18px; color: var(--gold); flex: none; }
.deger { font-weight: 500; }
.dugmeler { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 18px; }
.ico { width: 20px; height: 20px; }
.link { border: 0; background: none; color: var(--muted); text-decoration: underline; cursor: pointer; font: inherit; }
.uyari { display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border: 1px solid var(--red); border-radius: 8px; background: #fdf6f5; color: var(--red); font-size: 14px; }
.uyari svg { width: 20px; height: 20px; flex: none; }
@media (max-width: 760px) {
  .ana { grid-template-columns: 1fr; }
  .periyot { align-items: flex-start; }
  .basliklar { grid-template-columns: 1fr; }
}
</style>
