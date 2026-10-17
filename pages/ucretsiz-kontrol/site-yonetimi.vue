<script setup lang="ts">
// SİTE YÖNETİMİ (Düzeltme 03): deneme ödeme → sitenizi tanıyalım (kategoriler, sayılar) → yapı ve kullanım envanteri → sonuç.
// Metinler data/siteYonetimi.ts; her kayıt ön değerlendirme motorunda "kayıt" modunda değerlendirilir. Backend'siz.
import { SINIFLAR, METIN, type SinifKod } from '~/data/onDegerlendirme'
import { SITE_UCRET, SITE_METIN, SITE_KATEGORILERI, SITE_KONUM, SITE_SONUC_GRUPLARI } from '~/data/siteYonetimi'
import { cevapEtiketi, akis, type Eylem } from '~/utils/onDegerlendirmeMotoru'
import { useSiteYonetimi, kayitTamam, kayitSorusu, kayitSonucu, kayitDegerlendirme, type SiteKayit, type SiteKonum } from '~/composables/useSiteYonetimi'

useSeoMeta({ title: 'Site Yönetimi', description: 'Sitenizdeki yapı ve ortak kullanım alanlarının periyodik kontrol sürelerini ayrı ayrı öğrenin.' })

const sy = useSiteYonetimi()
const { d } = sy
const fiyat = SITE_UCRET.toLocaleString('tr-TR', { minimumFractionDigits: 2 })

// ── Sitenizi tanıyalım ──
const kategoriSec = (kod: string) => {
  const secili = d.value.secili.includes(kod) ? d.value.secili.filter(k => k !== kod) : [...d.value.secili, kod]
  sy.guncelle({ secili, sayilar: { ...d.value.sayilar, [kod]: d.value.sayilar[kod] || 1 } })
}
const sayiYaz = (kod: string, v: string) => sy.guncelle({ sayilar: { ...d.value.sayilar, [kod]: Math.max(0, Math.min(99, parseInt(v) || 0)) } })
const tanitHazir = computed(() => d.value.siteAdi.trim() && d.value.secili.some(k => (d.value.sayilar[k] || 0) > 0))

// ── Envanter ──
const aktif = computed(() => d.value.kayitlar.find(k => k.id === d.value.aktif) ?? null)
const aktifSira = computed(() => d.value.kayitlar.findIndex(k => k.id === d.value.aktif) + 1)
const tamamSayisi = computed(() => d.value.kayitlar.filter(kayitTamam).length)
const katKayitlari = (kod: string) => d.value.kayitlar.filter(k => k.kat === kod)
const kayitAdi = (id?: string) => { const k = d.value.kayitlar.find(x => x.id === id); return k ? (k.ad.trim() || k.id) : '' }
// "Başka bir binanın içinde": ayrı binada / bağımsız yapıdaki kayıtlardan seçilir
const binalar = computed(() => d.value.kayitlar.filter(k => k.konum === 'ayri' && k.id !== d.value.aktif))

const alan = (p: Partial<SiteKayit>) => aktif.value && sy.kayitGuncelle(aktif.value.id, p)
const konumSec = (konum: SiteKonum) => alan({ konum, bagli: konum === 'icinde' ? aktif.value?.bagli : undefined })
const sinifSec = (v: string) => alan({ sinif: (v || undefined) as SinifKod | undefined, c: {} })
const soru = computed(() => (aktif.value ? kayitSorusu(aktif.value) : null))
const cevaplanan = computed(() => {
  const k = aktif.value
  if (!k?.sinif || k.konum === 'acik') return []
  return akis(kayitDegerlendirme(k)).filter(q => q.id !== soru.value?.id && q.tip !== 'bilgi')
})
const cevap = (v: any) => { if (aktif.value && soru.value) alan({ c: { ...aktif.value.c, [soru.value.id]: v } }) }
const eylem = (e: Eylem) => {
  if (e.tip === 'esas' && e.sinif) alan({ sinif: e.sinif, c: { ...(e.ek || {}) } })
  else if (e.tip === 'sinif-sec') alan({ sinif: undefined, c: {} })
}
const olcutDegistir = (id: string) => {
  const k = aktif.value
  if (!k) return
  const ids = akis(kayitDegerlendirme(k)).map(q => q.id)
  const c = { ...k.c }
  for (const x of ids.slice(ids.indexOf(id))) delete c[x]
  alan({ c })
}
const duzenle = () => alan({ konum: undefined, bagli: undefined, sinif: undefined, c: {} })
const sonraki = () => {
  const L = d.value.kayitlar
  const i = L.findIndex(k => k.id === d.value.aktif)
  const bekleyen = [...L.slice(i + 1), ...L.slice(0, i)].find(k => !kayitTamam(k))
  sy.guncelle({ aktif: (bekleyen ?? L[Math.min(i + 1, L.length - 1)])?.id ?? null })
}

const onSonuc = (k: SiteKayit) => {
  if (!kayitTamam(k)) return { metin: SITE_METIN.olcutEksik, tip: 'eksik' }
  if (k.konum === 'acik') return { metin: SITE_SONUC_GRUPLARI.envanter, tip: 'envanter' }
  const s = kayitSonucu(k)!
  if (s.genel === 'tabi') return { metin: `${s.nihai} YIL`, tip: 'tabi' }
  if (s.genel === 'tanimsiz') return { metin: METIN.tanimsizBaslik, tip: 'envanter' }
  return { metin: METIN.belirlenemedi, tip: 'eksik' }
}

// ── Sonuç (bölüm 7): bağımsız yapılar kendi kullanımına; içindeki kullanımlarla birlikte karma olarak ──
type Satir = { ad: string; kullanimlar: string; sure: string }
const sinifAdi = (k: SiteKayit) => (k.sinif ? SINIFLAR[k.sinif].kisa : '—')
const gruplar = computed(() => {
  const g: Record<'belirlenen' | 'karma' | 'eksik' | 'envanter', Satir[]> = { belirlenen: [], karma: [], eksik: [], envanter: [] }
  const L = d.value.kayitlar
  for (const b of L.filter(k => k.konum !== 'icinde')) {
    const ad = b.ad.trim() || b.id
    if (b.konum === 'acik') { g.envanter.push({ ad, kullanimlar: SITE_KATEGORILERI.find(x => x.kod === b.kat)!.ad, sure: '—' }); continue }
    const icindekiler = L.filter(k => k.konum === 'icinde' && k.bagli === b.id)
    const hepsi = [b, ...icindekiler]
    const kullanimlar = hepsi.map(k => `${k.ad.trim() || k.id} (${sinifAdi(k)})`).join(', ')
    const sonuclar = hepsi.map(k => kayitSonucu(k))
    if (!kayitTamam(b) || hepsi.some(k => !kayitTamam(k)) || sonuclar.some(s => !s || s.genel === 'belirlenemedi')) { g.eksik.push({ ad, kullanimlar, sure: '—' }); continue }
    const sureler = sonuclar.filter(s => s!.genel === 'tabi').map(s => s!.nihai!)
    const sure = sureler.length ? `${Math.min(...sureler)} yıl` : '—'
    if (icindekiler.length) g.karma.push({ ad, kullanimlar, sure })
    else if (sureler.length) g.belirlenen.push({ ad, kullanimlar, sure })
    else g.envanter.push({ ad, kullanimlar, sure })
  }
  // Bağlı olduğu bina seçilmemiş iç kullanımlar
  for (const k of L.filter(k => k.konum === 'icinde' && !L.some(b => b.id === k.bagli && b.konum === 'ayri'))) {
    g.eksik.push({ ad: k.ad.trim() || k.id, kullanimlar: sinifAdi(k), sure: '—' })
  }
  return g
})
const yeni = () => { sy.sifirla() }
</script>

<template>
  <section class="section sayfa">
    <div class="wrap">
      <SectionTag num="04" label="Site Yönetimi" />

      <!-- 1) Deneme ödeme ekranı -->
      <div v-if="d.adim === 'odeme'" class="card dar odeme">
        <h1 class="baslik">Site / Yerleşke Yönetimi</h1>
        <p class="muted">Yapı, Tesis ve Ortak Kullanım Alanlarının Periyodik Kontrol Değerlendirmesi</p>
        <div class="tutar"><span>Ödenecek tutar</span><strong>{{ fiyat }} TL</strong></div>
        <button type="button" class="btn analiz-btn" @click="sy.ode()">Ödemeyi Tamamla <AppIcon name="arrow" class="ico" /></button>
        <p class="deneme"><AppIcon name="alert" /> Deneme ödeme ekranı: kartınızdan çekim yapılmaz.</p>
      </div>

      <!-- 2) Sitenizi tanıyalım -->
      <div v-else-if="d.adim === 'tanit'" class="card dar">
        <h1 class="baslik">{{ SITE_METIN.baslik }}</h1>
        <p class="muted">{{ SITE_METIN.aciklama }}</p>
        <label class="alan">{{ SITE_METIN.siteAdi }}
          <input :value="d.siteAdi" type="text" class="girdi" @input="sy.guncelle({ siteAdi: ($event.target as HTMLInputElement).value })">
        </label>
        <h3 class="alt-baslik">{{ SITE_METIN.kategoriSoru }}</h3>
        <p class="muted kucuk">{{ SITE_METIN.kategoriNot }}</p>
        <div class="kategoriler">
          <div v-for="k in SITE_KATEGORILERI" :key="k.kod" class="kategori" :class="{ secili: d.secili.includes(k.kod) }">
            <button type="button" class="kat-ust" @click="kategoriSec(k.kod)">
              <span class="kutu"><AppIcon v-if="d.secili.includes(k.kod)" name="check" /></span>
              <span><strong>{{ k.ad }}</strong><small>{{ k.aciklama }}</small></span>
            </button>
            <label v-if="d.secili.includes(k.kod)" class="alan">{{ k.sayiSorusu }}
              <input :value="d.sayilar[k.kod]" type="number" min="0" max="99" class="girdi" @input="sayiYaz(k.kod, ($event.target as HTMLInputElement).value)">
            </label>
          </div>
        </div>
        <button type="button" class="btn analiz-btn" :disabled="!tanitHazir" @click="sy.envanterOlustur()">Devam Et <AppIcon name="arrow" class="ico" /></button>
      </div>

      <!-- 3) Yapı ve kullanım envanteri -->
      <div v-else-if="d.adim === 'envanter'" class="card envanter">
        <div class="env-ust">
          <h1 class="baslik">{{ d.siteAdi }}</h1>
          <span class="rozet">{{ tamamSayisi }} / {{ d.kayitlar.length }} kayıt</span>
        </div>
        <div class="ilerleme"><span :style="{ width: `${(tamamSayisi / d.kayitlar.length) * 100}%` }" /></div>
        <p class="muted">{{ SITE_METIN.kayitSec }}</p>
        <div v-for="kat in SITE_KATEGORILERI.filter(k => katKayitlari(k.kod).length)" :key="kat.kod" class="cip-grup">
          <strong>{{ kat.ad }}</strong>
          <div class="cipler">
            <button v-for="k in katKayitlari(kat.kod)" :key="k.id" type="button" class="cip" :class="{ aktif: k.id === d.aktif, tamam: kayitTamam(k) }" @click="sy.guncelle({ aktif: k.id })">{{ k.id }}</button>
          </div>
        </div>

        <div v-if="aktif" class="kayit">
          <div class="kayit-ust"><h3>{{ aktif.id }} · {{ SITE_METIN.kayitBilgileri }}</h3><span class="muted">{{ aktifSira }}/{{ d.kayitlar.length }}</span></div>
          <label class="alan">{{ SITE_METIN.kayitAdi }}
            <input :value="aktif.ad" type="text" class="girdi" placeholder="Örn. A Blok" @input="alan({ ad: ($event.target as HTMLInputElement).value })">
          </label>

          <fieldset class="alan">
            <legend>{{ SITE_METIN.konumSoru }}</legend>
            <label v-for="o in SITE_KONUM" :key="o.deger" class="radyo">
              <input type="radio" :name="`konum-${aktif.id}`" :checked="aktif.konum === o.deger" @change="konumSec(o.deger)"> {{ o.etiket }}
            </label>
          </fieldset>

          <label v-if="aktif.konum === 'icinde'" class="alan">Hangi binanın / bloğun içinde?
            <select class="girdi" :value="aktif.bagli ?? ''" @change="alan({ bagli: ($event.target as HTMLSelectElement).value || undefined })">
              <option value="">Seçin</option>
              <option v-for="b in binalar" :key="b.id" :value="b.id">{{ kayitAdi(b.id) }}</option>
            </select>
          </label>

          <label v-if="aktif.konum && aktif.konum !== 'acik'" class="alan">{{ SITE_METIN.sinifSoru }}
            <select class="girdi" :value="aktif.sinif ?? ''" @change="sinifSec(($event.target as HTMLSelectElement).value)">
              <option value="">Seçin</option>
              <option v-for="(s, kod) in SINIFLAR" :key="kod" :value="kod">{{ s.ad }}</option>
            </select>
            <small class="muted">{{ SITE_METIN.sinifNot }}</small>
          </label>

          <!-- Sınıfın ölçüt soruları (yükseklik, alan, oda, tehlike…) -->
          <ul v-if="cevaplanan.length" class="olcutler">
            <li v-for="q in cevaplanan" :key="q.id"><span>{{ q.kisaAd }}</span><span>{{ cevapEtiketi(q, aktif.c[q.id]) }}</span><button type="button" class="link" @click="olcutDegistir(q.id)">Değiştir</button></li>
          </ul>
          <KontrolSoruKarti v-if="soru" :key="`${aktif.id}-${soru.id}`" :soru="soru" :deger="aktif.c[soru.id]" class="ic-soru" @cevap="cevap" @eylem="eylem" />

          <div class="on-sonuc" :class="onSonuc(aktif).tip">
            <small>{{ SITE_METIN.onSonuc }}</small>
            <strong>{{ onSonuc(aktif).metin }}</strong>
          </div>

          <div class="dugmeler">
            <button type="button" class="btn ghost" @click="duzenle">Düzenle</button>
            <button type="button" class="btn" @click="sonraki">{{ SITE_METIN.kaydetSonraki }} <AppIcon name="arrow" class="ico" /></button>
          </div>
          <button type="button" class="btn analiz-btn" @click="sy.guncelle({ adim: 'sonuc' })">{{ SITE_METIN.sonucOlustur(d.kayitlar.length) }} <AppIcon name="arrow" class="ico" /></button>
          <button type="button" class="link geri" @click="sy.guncelle({ adim: 'tanit' })">← {{ SITE_METIN.baslik }}</button>
        </div>
      </div>

      <!-- 4) Sonuç -->
      <div v-else class="sonuc">
        <h1 class="baslik">{{ d.siteAdi }}</h1>
        <div v-for="(satirlar, anahtar) in gruplar" :key="anahtar" class="card grup" :class="anahtar">
          <h3>{{ SITE_SONUC_GRUPLARI[anahtar] }} <span class="sayi">{{ satirlar.length }}</span></h3>
          <table v-if="satirlar.length">
            <tbody><tr v-for="s in satirlar" :key="s.ad"><td><strong>{{ s.ad }}</strong><small>{{ s.kullanimlar }}</small></td><td class="sag">{{ s.sure }}</td></tr></tbody>
          </table>
          <p v-else class="muted">—</p>
        </div>
        <p class="uyari"><AppIcon name="alert" />{{ SITE_METIN.sonucNot }}</p>
        <div class="dugmeler">
          <button type="button" class="btn ghost" @click="sy.guncelle({ adim: 'envanter' })">Cevapları Düzenle</button>
          <button type="button" class="link" @click="yeni">Yeni değerlendirme</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sayfa { padding-top: 40px; }
.baslik { margin-top: 14px; font-size: clamp(28px, 3vw, 40px); }
.dar { max-width: 760px; margin-top: 20px; display: flex; flex-direction: column; gap: 14px; }
.muted { color: var(--muted); }
.kucuk { font-size: 14px; margin-top: -8px; }
.alan { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--navy); border: 0; padding: 0; margin: 0; }
.alan legend { margin-bottom: 6px; }
.girdi { min-height: 46px; padding: 0 14px; border: 1.5px solid var(--border); border-radius: 8px; font: inherit; font-weight: 400; color: var(--ink); background: #fff; }
.alt-baslik { margin-top: 8px; font-size: 20px; text-transform: none; }
.kategoriler { display: flex; flex-direction: column; gap: 10px; }
.kategori { border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.kategori.secili { border-color: var(--gold); background: #fffdf8; }
.kat-ust { display: flex; gap: 12px; align-items: flex-start; text-align: left; border: 0; background: none; padding: 0; font: inherit; cursor: pointer; }
.kat-ust strong { display: block; font-family: var(--font-head); font-size: 17px; color: var(--navy); }
.kat-ust small { display: block; color: var(--muted); font-size: 13.5px; }
.kutu { flex: none; display: grid; place-items: center; width: 22px; height: 22px; border: 1.5px solid var(--gold); border-radius: 5px; color: #fff; margin-top: 2px; }
.kategori.secili .kutu { background: var(--gold); }
.kutu svg { width: 16px; height: 16px; }
.analiz-btn { justify-content: center; min-height: 58px; background: var(--navy); border-color: var(--navy); color: var(--gold-2); font-size: 19px; }
.analiz-btn:hover { background: var(--navy-2); border-color: var(--navy-2); color: var(--gold-2); }
.analiz-btn .ico, .btn .ico { width: 20px; height: 20px; }
.odeme .tutar { display: flex; justify-content: space-between; align-items: baseline; padding: 16px 18px; border-radius: 10px; background: var(--navy); color: #c9d3de; }
.odeme .tutar strong { font-family: var(--font-head); font-size: 40px; color: var(--gold-2); }
.deneme { display: flex; gap: 8px; align-items: center; font-size: 14px; color: var(--muted); }
.deneme svg { width: 18px; height: 18px; }
.envanter { max-width: 900px; margin-top: 20px; display: flex; flex-direction: column; gap: 12px; }
.env-ust { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
.rozet { flex: none; padding: 4px 10px; border-radius: 999px; background: var(--paper); font-family: var(--font-head); font-weight: 700; color: var(--navy); }
.ilerleme { height: 6px; border-radius: 6px; background: var(--paper); overflow: hidden; }
.ilerleme span { display: block; height: 100%; background: var(--gold); transition: width .2s; }
.cip-grup strong { font-family: var(--font-head); color: var(--navy); }
.cipler { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.cip { min-width: 46px; padding: 6px 12px; border: 1.5px solid var(--border); border-radius: 999px; background: #fff; font-family: var(--font-head); font-weight: 700; color: var(--navy); cursor: pointer; }
.cip.tamam { border-color: var(--gold); color: var(--gold); }
.cip.aktif { background: var(--navy); border-color: var(--navy); color: #fff; }
.kayit { margin-top: 10px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 14px; }
.kayit-ust { display: flex; justify-content: space-between; align-items: baseline; }
.kayit-ust h3 { text-transform: none; font-size: 20px; }
.radyo { display: flex; gap: 10px; align-items: center; font-weight: 400; color: var(--ink); padding: 4px 0; cursor: pointer; }
.olcutler { list-style: none; margin: 0; padding: 0; border: 1px solid var(--border); border-radius: 8px; }
.olcutler li { display: grid; grid-template-columns: 1fr 1.4fr auto; gap: 10px; padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 14.5px; }
.olcutler li:last-child { border-bottom: 0; }
.olcutler li span:first-child { font-family: var(--font-head); font-weight: 700; color: var(--navy); }
.ic-soru { box-shadow: none; }
.on-sonuc { padding: 14px 16px; border-radius: 10px; border: 1px solid var(--border); background: var(--paper); }
.on-sonuc small { display: block; font-family: var(--font-head); font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: var(--muted); }
.on-sonuc strong { font-family: var(--font-head); font-size: 22px; color: var(--navy); }
.on-sonuc.tabi { background: var(--navy); border-color: var(--navy); }
.on-sonuc.tabi small { color: #c9d3de; }
.on-sonuc.tabi strong { color: var(--gold-2); font-size: 30px; }
.dugmeler { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.dugmeler .btn:last-child:not(.ghost) { flex: 1; justify-content: center; }
.link { border: 0; background: none; color: var(--muted); text-decoration: underline; cursor: pointer; font: inherit; }
.geri { align-self: flex-start; }
.sonuc { max-width: 900px; margin-top: 20px; display: flex; flex-direction: column; gap: 14px; }
.grup h3 { display: flex; align-items: center; gap: 10px; text-transform: none; font-size: 19px; }
.grup .sayi { display: inline-grid; place-items: center; min-width: 28px; height: 28px; border-radius: 50%; background: var(--navy); color: #fff; font-size: 14px; }
.grup.belirlenen { border-left: 4px solid var(--gold); }
.grup.karma { border-left: 4px solid var(--navy); }
.grup.eksik { border-left: 4px solid var(--red); }
.grup table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.grup td { padding: 10px 0; border-top: 1px solid var(--border); vertical-align: top; }
.grup td small { display: block; color: var(--muted); font-size: 13.5px; }
.grup .sag { text-align: right; font-family: var(--font-head); font-weight: 800; font-size: 20px; color: var(--gold); white-space: nowrap; }
.uyari { display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border: 1px solid var(--red); border-radius: 8px; background: #fdf6f5; color: var(--red); font-size: 14px; }
.uyari svg { width: 20px; height: 20px; flex: none; }
</style>
