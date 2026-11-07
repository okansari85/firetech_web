<script setup lang="ts">
// ÜCRETLİ ANALİZE GİRİŞ (Oğuz'un teslim paketi v1, onaylı tasarım referansı). Ücretsiz değerlendirmenin cevaplarından esas kullanıma
// özel başlık, analiz kapsamı, 6 analiz konusu, 6 çıktı, periyot (ücretsiz hesap aynen) ve satın alma. İçerik utils/ucretliGiris.ts
// (paketteki motor), eşleme data/ucretliEsleme.ts; ekran metinleri paketin demo sayfasından. Fiyat koda yazılmaz: useUyelik › fiyat.
import KATALOG from '~/data/ucretliKatalog.json'
import { selectPaidEntry } from '~/utils/ucretliGiris'
import { ucretliGirdi } from '~/data/ucretliEsleme'

useSeoMeta({ title: 'Detaylı Yangın Güvenliği Analizi' })

const { d, sonuc, tamam } = useOnDegerlendirme()
const { fiyat, analiziBaslat } = useUyelik()
onMounted(() => { if (!tamam.value) navigateTo('/ucretsiz-kontrol/kullanim-sinifi') })

const vm = computed(() => (tamam.value ? selectPaidEntry(ucretliGirdi(d.value, sonuc.value), KATALOG) : null))

// Onaylı tasarımda başlığın ilk kısmı ("Fabrikanızın") altın renkte
const baslik = computed(() => {
  const h: string = vm.value?.headline ?? ''
  const vurgu = h.match(/^.+?(?= (?:İçin|Periyodik) )/)?.[0] ?? ''
  return { vurgu, kalan: h.slice(vurgu.length) }
})
// "Endüstri: Tehlike sınıfı: …" → kalın sınıf adı + gerekçe (ücretsiz sonuç ekranındaki gibi); birden çok belirleyici ayrı satırda
const belirleyenler = computed(() => (vm.value?.periodCard.driver ?? '').split('\n').map((l: string) => {
  const i = l.indexOf(': ')
  return i > 0 ? { ad: l.slice(0, i), metin: l.slice(i + 2) } : { ad: '', metin: l }
}))
// { net, vat, total } kuruş ya da null (fiyat henüz belirlenmedi)
const tutar = computed(() => fiyat('bina'))
const tl = (kurus: number) => (kurus / 100).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })

// Motorun ikon adları → sitedeki ikonlar (AppIcon). Esas / ilgili kullanımda kullanımın ailesine göre Tabler ikonu (TurIkonu).
const IKON: Record<string, string> = {
  exit: 'kacis', alarm: 'alarm', extinguisher: 'sondurme', building: 'building', hazard: 'alert', users: 'people', file: 'report',
  chart: 'chart', alert: 'alert', checklist: 'check', gear: 'gear', pdf: 'report'
}
const AILE_IKON: Record<string, string> = {
  residential: 'home-2', lodging: 'bed', institutional: 'school', office: 'briefcase', commercial: 'building-store',
  industrial: 'building-factory', assembly: 'users-group', storage: 'building-warehouse', high_hazard: 'flame'
}
const aileIkonu = (id: string) => AILE_IKON[KATALOG.entries.find(x => x.id === id)?.family ?? ''] ?? 'building'

// Metinler: paketin demo sayfası (FIRETECH_DINAMIK_SAYFA_DEMO.html)
const FAYDALAR: [string, string][] = [['report', 'Mevzuat ve kontrol hazırlığını görün'], ['alert', 'Eksik bilgi alanlarını erkenden fark edin'], ['gear', 'Öncelikli işlerinizi planlayın']]
const ICERIK = ['Seçiminize özel analiz kapsamı', 'Esas kullanım ve ilgili alanlar', 'Eksik bilgi ve belge listesi', 'Öncelikli aksiyon planı', 'Kapsamlı PDF rapor', 'Sonuçların hesabınızda saklanması', 'Uzman desteği talep etme imkanı']
const ILISKI: Record<string, string> = { same_building: 'Aynı bina', same_campus: 'Aynı yerleşke', separate_buildings: 'Ayrı binalar', unknown: 'Henüz doğrulanmadı' }
</script>

<template>
  <div v-if="vm" class="wrap sayfa">
    <div class="duzen">
      <div class="ana">
        <div class="ust">
          <div class="giris">
            <SectionTag num="DETAYLI ANALİZ" label="SEÇİMİNİZE ÖZEL" />
            <h1 class="baslik"><span class="gold">{{ baslik.vurgu }}</span>{{ baslik.kalan }}</h1>
            <p class="alt">{{ vm.subtitle }}</p>
            <ul class="faydalar">
              <li v-for="[ikon, metin] in FAYDALAR" :key="metin"><span class="f-ikon"><AppIcon :name="ikon" /></span>{{ metin }}</li>
            </ul>
          </div>

          <section class="card kapsam" aria-labelledby="ua-kapsam">
            <h2 id="ua-kapsam" class="kart-baslik">SEÇİMİNİZE GÖRE ANALİZ KAPSAMI</h2>
            <ul>
              <li v-for="s in vm.scope" :key="s.id">
                <span class="i-kutu">
                  <TurIkonu v-if="s.id === 'primary' || s.id === 'secondary'" :name="aileIkonu(s.sourceIds[0])" />
                  <AppIcon v-else :name="s.id === 'hazards' ? 'alert' : 'building'" />
                </span>
                <span><small>{{ s.title }}</small><strong>{{ s.name }}</strong><small>{{ s.detail }}</small></span>
              </li>
            </ul>
          </section>
        </div>

        <section class="bolum" aria-labelledby="ua-konular">
          <h2 id="ua-konular" class="bolum-baslik">BU ANALİZDE NELER DEĞERLENDİRİLECEK?</h2>
          <ul class="konular">
            <li v-for="t in vm.topics" :key="t.id" class="konu">
              <span class="i-kutu">
                <TurIkonu v-if="t.icon === 'factory' || t.icon === 'office'" :name="aileIkonu(t.sourceIds[0])" />
                <AppIcon v-else :name="IKON[t.icon] ?? 'building'" />
              </span>
              <div><h3>{{ t.title }}</h3><p>{{ t.description }}</p></div>
            </li>
          </ul>
        </section>

        <section class="bolum" aria-labelledby="ua-ciktilar">
          <h2 id="ua-ciktilar" class="bolum-baslik">ANALİZ SONUNDA NE ALACAKSINIZ?</h2>
          <ul class="ciktilar">
            <li v-for="o in vm.deliverables" :key="o.id" class="cikti">
              <span class="i-kutu" :class="{ pdf: o.icon === 'pdf' }"><AppIcon :name="IKON[o.icon] ?? 'report'" /></span>
              <h3>{{ o.title }}</h3><p>{{ o.description }}</p>
            </li>
          </ul>
        </section>

        <p v-for="w in vm.warnings" :key="w" class="uyari"><AppIcon name="alert" />{{ w }}</p>
        <p class="dipnot">Bu ekran bir tanıtım ve kapsam özetidir. Henüz gerçek teknik analiz, uygunluk tespiti veya resmî kontrol yapılmamıştır.</p>
      </div>

      <div class="yan">
        <!-- Yalnız tek belirleyici süre ve gerekçesi (ücretsiz hesap aynen); yan kullanımların süreleri burada ayrı satır olmaz -->
        <section class="card periyot" aria-labelledby="ua-periyot">
          <h2 id="ua-periyot" class="kart-baslik">PERİYODİK KONTROL SÜRESİ</h2>
          <p class="yil">{{ vm.periodCard.years ? vm.periodCard.label : '—' }}</p>
          <p class="etiket">SÜREYİ BELİRLEYEN</p>
          <ul class="belirleyen">
            <li v-for="(b, i) in belirleyenler" :key="i"><strong v-if="b.ad">{{ b.ad }}:</strong> {{ b.metin }}</li>
          </ul>
        </section>

        <div class="card bina">
          <KontrolBinaGorunumu :sonuc="sonuc" :c="d.c" :esas="d.esas" />
          <p class="temsili">Temsili yapı şeması — teknik çizim değildir</p>
          <p class="temsili-alt">İlişki: {{ ILISKI[vm.handoff.building.relation] ?? ILISKI.unknown }}</p>
        </div>

        <section class="card fiyat" aria-labelledby="ua-fiyat">
          <h2 id="ua-fiyat" class="fiyat-ust">DETAYLI YANGIN GÜVENLİĞİ ANALİZİ</h2>
          <div class="fiyat-govde">
            <p v-if="tutar" class="tutar">{{ tl(tutar.total) }}<small v-if="tutar.vat">KDV dahil</small></p>
            <p v-else class="tutar bekliyor">Fiyat belirlenecek</p>
            <ul class="icerik">
              <li v-for="m in ICERIK" :key="m"><AppIcon name="check" />{{ m }}</li>
            </ul>
            <button type="button" class="btn gold-btn baslat" @click="analiziBaslat('bina', vm.handoff)">Analizi Başlat <AppIcon name="arrow" /></button>
            <ul class="odeme">
              <li><AppIcon name="shield" />Güvenli ödeme</li>
              <li><AppIcon name="report" />Kart ile ödeme bilgileri canlı entegrasyonda sunulacak</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sayfa { padding-top: 32px; padding-bottom: 64px; }
.duzen { display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 24px; align-items: start; }
.ana { min-width: 0; display: flex; flex-direction: column; gap: 22px; }
.ust { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(260px, 1fr); gap: 22px; align-items: start; }

/* Giriş */
.baslik { margin: 18px 0 12px; font-size: clamp(28px, 2.9vw, 40px); line-height: 1.12; text-transform: none; }
.alt { font-size: 16px; line-height: 1.55; }
.faydalar { margin: 18px 0 0; padding: 0; list-style: none; display: flex; gap: 14px; }
.faydalar li { flex: 1; display: flex; align-items: center; gap: 10px; font-family: var(--font-head); font-size: 15px; font-weight: 700; line-height: 1.25; color: var(--navy); }
.f-ikon { flex: none; display: grid; place-items: center; width: 44px; height: 44px; border: 1.5px solid var(--gold); border-radius: 50%; color: var(--gold); }
.f-ikon svg { width: 22px; height: 22px; }

/* Kart başlıkları ve ikon kutuları */
.kart-baslik { margin-bottom: 12px; font-size: 15px; letter-spacing: .8px; }
.bolum { padding-top: 18px; border-top: 1px solid var(--border); }
.bolum-baslik { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; font-size: 21px; }
.bolum-baslik::before { content: ''; flex: none; width: 5px; height: 26px; border-radius: 3px; background: var(--gold-2); }
.i-kutu { flex: none; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 8px; background: #fbf6ea; color: var(--gold); }
.i-kutu svg { width: 26px; height: 26px; }
.i-kutu.pdf { color: var(--red); }

/* Analiz kapsamı */
.kapsam { padding: 16px; }
.kapsam ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
.kapsam li { display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; }
.kapsam small { display: block; font-size: 12.5px; line-height: 1.35; color: var(--muted); }
.kapsam strong { display: block; margin: 2px 0; font-family: var(--font-head); font-size: 16px; line-height: 1.25; color: var(--navy); }

/* 6 analiz konusu, 6 çıktı */
.konular { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.konu { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border: 1px solid var(--border); border-radius: 10px; }
.konu h3, .cikti h3 { font-size: 17px; line-height: 1.2; }
.konu p, .cikti p { margin-top: 4px; font-size: 14px; line-height: 1.45; color: var(--muted); }
.ciktilar { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
.cikti { padding: 12px; border: 1px solid var(--border); border-radius: 8px; }
.cikti .i-kutu { width: 38px; height: 38px; margin-bottom: 10px; }
.cikti .i-kutu svg { width: 22px; height: 22px; }
.cikti h3 { font-size: 15.5px; }
.cikti p { font-size: 13px; }

.uyari { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border: 1px solid var(--gold-line); border-radius: 8px; background: #fbf6ea; font-size: 14px; }
.uyari svg { flex: none; width: 20px; height: 20px; color: var(--gold); }
.dipnot { font-size: 13px; color: var(--muted); }

/* Sağ sütun */
.yan { display: flex; flex-direction: column; gap: 16px; }
.periyot { padding: 18px 20px; }
.yil { font-family: var(--font-head); font-size: 58px; font-weight: 800; line-height: 1; color: var(--gold); }
.etiket { margin-top: 12px; font-family: var(--font-head); font-size: 13px; font-weight: 700; letter-spacing: .5px; color: var(--gold); }
.belirleyen { margin: 6px 0 0; padding-left: 18px; font-size: 15px; line-height: 1.45; }
.belirleyen strong { font-family: var(--font-head); color: var(--navy); }
/* Bina görünümü: ücretsiz değerlendirmedeki bileşen; tek çerçeve, süre yalnız periyot kartında */
.bina { padding: 0 0 14px; overflow: hidden; }
.bina :deep(.panel) { border: 0; border-radius: 0; }
.bina :deep(.anlik) { display: none; }
.temsili { padding: 0 20px; font-size: 12.5px; text-align: center; color: var(--gold); }
.temsili-alt { margin: 8px 20px 0; padding-top: 10px; border-top: 1px solid var(--border); font-size: 13px; color: var(--muted); }
/* Satın alma */
.fiyat { padding: 0; overflow: hidden; }
.fiyat-ust { padding: 14px 18px; border-bottom: 1px solid var(--border); background: #fbf6ea; font-size: 17px; letter-spacing: .5px; }
.fiyat-govde { padding: 18px; }
.tutar { display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px; font-family: var(--font-head); font-size: 38px; font-weight: 800; line-height: 1.1; color: var(--navy); }
.tutar small { font-family: var(--font-body); font-size: 15px; font-weight: 400; color: var(--muted); }
.tutar.bekliyor { font-size: 26px; }
.icerik { margin: 16px 0 0; padding: 0; list-style: none; display: grid; gap: 9px; }
.icerik li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; line-height: 1.35; }
.icerik svg { flex: none; width: 20px; height: 20px; padding: 3px; border-radius: 50%; background: var(--gold); color: #fff; stroke-width: 3; }
.baslat { width: 100%; justify-content: center; min-height: 56px; margin-top: 20px; font-size: 21px; text-transform: none; }
.baslat svg { width: 22px; height: 22px; }
.odeme { margin: 14px 0 0; padding: 0; list-style: none; display: grid; gap: 6px; font-size: 13.5px; color: var(--muted); }
.odeme li { display: flex; align-items: center; gap: 8px; }
.odeme svg { flex: none; width: 18px; height: 18px; color: var(--navy); }

/* Tablet: tek sütun; sağ sütun iki sütuna yayılır (bina görünümü sağda) */
@media (max-width: 1100px) {
  .duzen { grid-template-columns: 1fr; }
  .yan { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-areas: 'periyot bina' 'fiyat bina'; align-items: start; }
  .periyot { grid-area: periyot; }
  .bina { grid-area: bina; }
  .fiyat { grid-area: fiyat; }
}
@media (max-width: 900px) {
  .ust { grid-template-columns: 1fr; }
  .konular { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ciktilar { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
/* Telefon */
@media (max-width: 640px) {
  .sayfa { padding-top: 24px; }
  .yan { grid-template-columns: 1fr; grid-template-areas: 'periyot' 'bina' 'fiyat'; }
  .faydalar { flex-direction: column; gap: 10px; }
  .konular { grid-template-columns: 1fr; }
  .ciktilar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bolum-baslik { font-size: 19px; }
  .yil { font-size: 50px; }
}
</style>
