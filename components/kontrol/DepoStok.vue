<script setup lang="ts">
// Depolama yangın yükü ekranı (Oğuz'un V6 R1 paketi, "Yangın yükü hesabı"): kompartıman alanı + ürün / ambalaj satırları, anlık MJ/m².
// Metinler paketteki referans ekrandan. Hesap sınıf vermez; 126 m² kontrolü ve 30 dakika sorusu motorda (utils/onDegerlendirmeMotoru.ts).
import { DEPO_MALZEME, DEPO_BIRIM, DEPO_ORNEK_STOK, DEPO_KUCUK_KOMPARTIMAN } from '~/data/onDegerlendirme'
import { yanginYuku, type DepoStok } from '~/utils/onDegerlendirmeMotoru'

const props = defineProps<{ deger?: DepoStok }>()
const emit = defineEmits<{ cevap: [deger: DepoStok] }>()

const bosSatir = () => ({ id: '', miktar: null as number | null, birim: 'kg', kgBirim: null as number | null })
const kopya = (v: DepoStok): DepoStok => JSON.parse(JSON.stringify(v))
const s = ref<DepoStok>(props.deger?.kalemler ? kopya(props.deger) : { alan: null, kalemler: [bosSatir()] })
// Kullanıcı bir şeyi değiştirince örnek etiketi düşer (örnek gerçek stok kaydı sayılmaz)
const degisti = () => { s.value.ornek = false }
const ekle = () => { s.value.kalemler.push(bosSatir()); degisti() }
const sil = (i: number) => { s.value.kalemler.splice(i, 1); if (!s.value.kalemler.length) s.value.kalemler.push(bosSatir()); degisti() }
const ornekYukle = () => { s.value = { ...kopya(DEPO_ORNEK_STOK as DepoStok), kalemler: DEPO_ORNEK_STOK.kalemler.map(k => ({ ...k, kgBirim: null })) } }

const y = computed(() => yanginYuku(s.value))
const sayi = (n: number, b = 2) => n.toLocaleString('tr-TR', { maximumFractionDigits: b })
const satirEnerji = (r: DepoStok['kalemler'][number]) => {
  const m = DEPO_MALZEME.find(x => x.id === r.id)
  return m && typeof r.miktar === 'number' ? sayi(r.miktar * m.h, 1) : '—'
}
const alanNotu = computed(() => {
  const a = y.value.alan
  if (a === null) return 'Yangın kompartımanının alanını girin. Toplam bina alanını kullanmayın.'
  return a > DEPO_KUCUK_KOMPARTIMAN
    ? 'Bu alan tek bir yangın kompartımanıysa 126 m² sınırı aşılıyor. Düşük tehlike dalı elendi; 30 dakika dayanım veya düşük yanabilirlik için gereksiz soru açılmayacak.'
    : 'Kompartıman 126 m² veya daha küçük. Düşük tehlike için yalnız 30 dakika dayanım bilgisi gerektiğinde sorulur.'
})
// Boş satırlar kaydedilmez
const gonder = () => emit('cevap', { ...kopya(s.value), kalemler: s.value.kalemler.filter(r => r.id || typeof r.miktar === 'number') })
</script>

<template>
  <div class="stok">
    <div class="ust-satir">
      <label class="alan">Yangın kompartımanı alanı (m²)
        <input v-model.number="s.alan" type="number" min="0" step="any" inputmode="decimal" placeholder="Örn. 500" @input="degisti">
        <small>Bu alan aynı kompartıman için yangın yükü hesabında ve 126 m² kontrolünde kullanılır.</small>
      </label>
      <div class="alan">Örnek stok kaydı
        <button type="button" class="btn ghost" @click="ornekYukle">40 palet karton örneğini yeniden yükle</button>
        <small>Düğme eski satırları temizler; 11.520 kg karton ürün + 720 kg koli + 1.000 kg palet + 32 kg PE film ekler.</small>
      </div>
    </div>
    <p v-if="s.ornek" class="not yesil"><strong>40 palet karton örneği yüklendi.</strong> Kullanıcının gerçek verileriyle değiştirilmelidir.</p>

    <h3>Ürün ve ambalaj bileşenleri</h3>
    <div v-for="(r, i) in s.kalemler" :key="i" class="satir">
      <label>Malzeme / bileşen
        <select v-model="r.id" @change="degisti">
          <option value="">Seçiniz</option>
          <option v-for="m in DEPO_MALZEME" :key="m.id" :value="m.id">{{ m.ad }} · {{ m.h }} MJ/kg</option>
        </select>
      </label>
      <label>Miktar<input v-model.number="r.miktar" type="number" min="0" step="any" inputmode="decimal" placeholder="0" @input="degisti"></label>
      <label>Birim
        <select v-model="r.birim" @change="degisti"><option v-for="b in DEPO_BIRIM" :key="b.deger" :value="b.deger">{{ b.etiket }}</option></select>
      </label>
      <label v-if="r.birim === 'kg'">Enerji (MJ)<output>{{ satirEnerji(r) }}</output></label>
      <label v-else>kg / birim<input v-model.number="r.kgBirim" type="number" min="0" step="any" inputmode="decimal" placeholder="kg" @input="degisti"></label>
      <button type="button" class="sil" aria-label="Satırı sil" @click="sil(i)"><AppIcon name="close" /></button>
    </div>
    <button type="button" class="btn ghost ekle" @click="ekle">＋ Malzeme ekle</button>

    <div class="ozet">
      <div class="yuk">
        <small>Yangın yükü yoğunluğu</small>
        <strong>{{ y.q !== null ? sayi(y.q) : '—' }} <span>MJ/m²</span></strong>
        <small>{{ y.tam ? 'Girilen stok kalemleri için hesap tamamlandı; sınıf henüz belirlenmedi.' : y.adet === 0 ? 'Malzeme kaydı girilmedi.' : 'Kısmi hesap / eksik veri mevcut.' }}</small>
      </div>
      <dl>
        <dt>Hesaplanan enerji</dt><dd>{{ sayi(y.enerji) }} MJ</dd>
        <dt>Malzeme kalemi</dt><dd>{{ y.adet }}</dd>
        <dt>Eksik bilgi</dt><dd>{{ y.eksik.length + (y.alan === null ? 1 : 0) }}</dd>
        <dt>Formül</dt><dd>Σ (kg × MJ/kg) / m²</dd>
      </dl>
    </div>
    <p class="not" :class="{ sari: y.alan !== null && y.alan > DEPO_KUCUK_KOMPARTIMAN }"><strong>Alan kontrolü:</strong> {{ alanNotu }}</p>
    <p class="not">Yangın yükü hesaplanmış olması, tek başına BYKHY Orta veya Yüksek Tehlike sınıfı anlamına gelmez.</p>

    <div class="alt"><button type="button" class="btn gold-btn" @click="gonder">Devam Et <AppIcon name="arrow" class="ico" /></button></div>
  </div>
</template>

<style scoped>
.stok { margin-top: 22px; display: flex; flex-direction: column; gap: 14px; }
.ust-satir { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.alan, .satir label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--navy); }
.alan small { font-weight: 400; font-size: 13.5px; color: var(--muted); }
input, select, output { min-height: 46px; padding: 0 12px; border: 1.5px solid var(--border); border-radius: 8px; font: inherit; font-weight: 400; background: #fff; }
output { display: flex; align-items: center; background: var(--paper); }
input:focus, select:focus { outline: 2px solid var(--gold-2); border-color: var(--gold); }
h3 { margin: 6px 0 0; font-size: 19px; color: var(--navy); }
.satir { display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr) minmax(0, .9fr) minmax(0, 1fr) auto; gap: 10px; align-items: end; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.sil { width: 46px; height: 46px; display: grid; place-items: center; border: 1.5px solid var(--border); border-radius: 8px; background: #fff; cursor: pointer; color: var(--navy); }
.sil svg { width: 18px; height: 18px; }
.ekle { align-self: flex-start; }
.ozet { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }
.yuk { display: flex; flex-direction: column; gap: 4px; padding: 16px; border-radius: 10px; background: var(--navy); color: #fff; }
.yuk strong { font-family: var(--font-head); font-size: 34px; color: var(--gold-2); }
.yuk strong span { font-size: 17px; }
.yuk small { opacity: .85; }
dl { margin: 0; padding: 16px; border: 1px solid var(--border); border-radius: 10px; display: grid; grid-template-columns: auto 1fr; gap: 8px 14px; }
dt { color: var(--muted); }
dd { margin: 0; text-align: right; font-weight: 700; color: var(--navy); }
.not { margin: 0; padding: 12px 14px; border-radius: 8px; background: var(--paper); border-left: 3px solid var(--navy); font-size: 14.5px; }
.not.sari { border-left-color: var(--gold); background: #fffbf2; }
.not.yesil { border-left-color: #2f7d4f; background: #f1f8f3; }
.alt { display: flex; gap: 12px; }
.ico { width: 20px; height: 20px; }
@media (max-width: 640px) {
  .ust-satir, .ozet { grid-template-columns: 1fr; }
  .satir { grid-template-columns: 1fr 1fr; }
  .satir label:first-child { grid-column: 1 / -1; }
}
</style>
