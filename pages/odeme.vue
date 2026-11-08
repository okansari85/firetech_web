<script setup lang="ts">
// Ödeme: PayTR iFrame. ?urun=bina|site. Tutar backend'de hesaplanır (fiyat KDV hariç + %20 KDV); kart bilgisi PayTR'nin
// kutusunda girilir, siteye gelmez. Sonuç PayTR bildirimiyle backend'e yazılır; dönüş /odeme-basarili, /odeme-basarisiz.
import { URUNLER, tlYazi, type UrunKod } from '~/data/urunler'
import { hataMesaji } from '~/composables/useUyelik'

useSeoMeta({ title: 'Ödeme', description: 'Detaylı analiz ödemesi.' })
useHead({ script: [{ src: 'https://www.paytr.com/js/iframeResizer.min.js', defer: true }] })

const route = useRoute()
const { uye, yukle, fiyat, odemeBaslat, sahteOdeme } = useUyelik()
const { d } = useOnDegerlendirme()
const urunKod = computed(() => (route.query.urun === 'site' ? 'site' : 'bina') as UrunKod)
const urun = computed(() => URUNLER[urunKod.value])
const tutar = computed(() => fiyat(urunKod.value))
// Bina analizi tamamlanmış (kaydedilmiş) ücretsiz değerlendirmeye bağlanır.
const degerlendirmeYok = computed(() => urunKod.value === 'bina' && !d.value.uuid)

const hazirlaniyor = ref(true)
const f = reactive({ ad: '', telefon: '', adres: '', onay: false })
const hata = ref('')
const gonderiliyor = ref(false)
const paytrToken = ref('')
// Sahte ödeme: kart alanları hiçbir yere gönderilmez; "Öde" ile sipariş backend'de ödendi yazılır.
const kartKutusu = ref(false)
const kart = reactive({ ad: '', no: '', skt: '', cvc: '' })
const kartHazir = computed(() => kart.ad.trim().length >= 3 && kart.no.replace(/\D/g, '').length === 16 && /^\d{2}\/\d{2}$/.test(kart.skt) && /^\d{3}$/.test(kart.cvc))
const kartNo = (e: Event) => { kart.no = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ') }
const sktYaz = (e: Event) => { const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4); kart.skt = v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v }

onMounted(async () => {
  await yukle()
  if (!uye.value) return navigateTo(`/giris?devam=${encodeURIComponent(route.fullPath)}`, { replace: true })
  f.ad = uye.value.name
  f.telefon = uye.value.phone || ''
  hazirlaniyor.value = false
})

const hazir = computed(() => !!tutar.value && !degerlendirmeYok.value && f.ad.trim().length >= 3 && f.telefon.trim().length >= 10 && f.adres.trim().length >= 10 && f.onay)

const ode = async () => {
  if (!hazir.value || gonderiliyor.value) return
  hata.value = ''
  if (sahteOdeme.value && !kartKutusu.value) { kartKutusu.value = true; return }
  if (sahteOdeme.value && !kartHazir.value) return
  gonderiliyor.value = true
  try {
    const r = await odemeBaslat(urunKod.value, { name: f.ad.trim(), phone: f.telefon.trim(), address: f.adres.trim(), agreements: f.onay })
    if (r.fake) return navigateTo('/odeme-basarili')
    paytrToken.value = r.token!
    await nextTick()
    ;(window as any).iFrameResize?.({}, '#paytriframe')
  } catch (e) {
    hata.value = hataMesaji(e)
  } finally {
    gonderiliyor.value = false
  }
}
</script>

<template>
  <section class="section sayfa">
    <div class="wrap dar">
      <SectionTag label="Ödeme" />

      <ClientOnly>
        <div v-if="hazirlaniyor" class="card kutu"><p class="muted">Yükleniyor…</p></div>

        <!-- PayTR ödeme kutusu -->
        <div v-else-if="paytrToken" class="card kutu">
          <h1 class="baslik">Kart Bilgileri</h1>
          <iframe id="paytriframe" :src="`https://www.paytr.com/odeme/guvenli/${paytrToken}`" title="PayTR güvenli ödeme" frameborder="0" scrolling="no" class="paytr" />
          <small class="guven"><AppIcon name="shield" /> Kart bilgileriniz PayTR güvenli ödeme altyapısında işlenir, FireTech'e ulaşmaz.</small>
        </div>

        <!-- Sahte ödeme kutusu (PayTR mağazası açılana kadar) -->
        <div v-else-if="kartKutusu" class="izgara">
          <form class="card kutu form" novalidate autocomplete="off" @submit.prevent="ode">
            <h1 class="baslik">Kart Bilgileri</h1>
            <label>Kart Üzerindeki İsim<input v-model="kart.ad" type="text" autocomplete="off"></label>
            <label>Kart Numarası<input :value="kart.no" type="text" inputmode="numeric" autocomplete="off" placeholder="0000 0000 0000 0000" @input="kartNo"></label>
            <div class="ikili">
              <label>Son Kullanma<input :value="kart.skt" type="text" inputmode="numeric" autocomplete="off" placeholder="AA/YY" @input="sktYaz"></label>
              <label>CVC<input v-model="kart.cvc" type="text" inputmode="numeric" maxlength="3" autocomplete="off" placeholder="000"></label>
            </div>
            <p v-if="hata" class="hata" role="alert">{{ hata }}</p>
            <button type="submit" class="btn analiz-btn" :disabled="!kartHazir || gonderiliyor">{{ gonderiliyor ? 'Ödeniyor…' : `${tlYazi(tutar!.total)} TL Öde` }}</button>
            <button type="button" class="btn ghost" :disabled="gonderiliyor" @click="kartKutusu = false">Geri</button>
          </form>
          <aside class="card kutu ozet">
            <h3>Sipariş Özeti</h3>
            <div class="urun"><strong>{{ urun.ad }}</strong><small>{{ urun.aciklama }}</small></div>
            <div class="tutar"><span>Ödenecek tutar</span><strong>{{ tlYazi(tutar!.total) }} TL</strong></div>
            <small class="guven"><AppIcon name="shield" /> Tek çekim</small>
          </aside>
        </div>

        <div v-else class="izgara">
          <div class="card kutu">
            <h1 class="baslik">Fatura Bilgileri</h1>
            <p v-if="degerlendirmeYok" class="uyari" role="alert">
              Detaylı analiz, tamamladığınız ücretsiz ön değerlendirmeye göre hazırlanır.
              <NuxtLink to="/ucretsiz-kontrol/kullanim-sinifi">Ücretsiz Kontrol</NuxtLink>
            </p>
            <form class="form" novalidate @submit.prevent="ode">
              <label>Ad Soyad<input v-model="f.ad" type="text" autocomplete="name"></label>
              <label>Telefon<input v-model="f.telefon" type="tel" autocomplete="tel" placeholder="05xx xxx xx xx"></label>
              <label>Fatura Adresi<textarea v-model="f.adres" rows="3" autocomplete="street-address" /></label>
              <label class="onay">
                <input v-model="f.onay" type="checkbox">
                <span><NuxtLink to="/mesafeli-satis-sozlesmesi" target="_blank">Mesafeli Satış Sözleşmesi</NuxtLink>'ni ve <NuxtLink to="/on-bilgilendirme-formu" target="_blank">Ön Bilgilendirme Formu</NuxtLink>'nu okudum, kabul ediyorum. Analize başladığımda cayma hakkımın sona ereceğini biliyorum (<NuxtLink to="/iptal-iade-kosullari" target="_blank">İptal ve İade Koşulları</NuxtLink>).</span>
              </label>
              <p v-if="hata" class="hata" role="alert">{{ hata }}</p>
              <button type="submit" class="btn analiz-btn" :disabled="!hazir || gonderiliyor">{{ gonderiliyor ? 'Hazırlanıyor…' : 'Ödemeye Geç' }} <AppIcon v-if="!gonderiliyor" name="arrow" class="ico" /></button>
            </form>
          </div>

          <aside class="card kutu ozet">
            <h3>Sipariş Özeti</h3>
            <div class="urun"><strong>{{ urun.ad }}</strong><small>{{ urun.aciklama }}</small></div>
            <template v-if="tutar">
              <dl class="dokum">
                <div><dt>Bedel (KDV hariç)</dt><dd>{{ tlYazi(tutar.net) }} TL</dd></div>
                <div><dt>KDV (%20)</dt><dd>{{ tlYazi(tutar.vat) }} TL</dd></div>
              </dl>
              <div class="tutar"><span>Ödenecek tutar</span><strong>{{ tlYazi(tutar.total) }} TL</strong></div>
            </template>
            <div v-else class="tutar"><span>Ödenecek tutar</span><strong class="kucuk">Fiyat belirlenecek</strong></div>
            <small class="guven"><AppIcon name="shield" /> PayTR güvenli ödeme · Tek çekim</small>
          </aside>
        </div>
      </ClientOnly>
    </div>
  </section>
</template>

<style scoped>
.sayfa { padding-top: 40px; }
.dar { max-width: 1000px; }
.izgara { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; margin-top: 20px; align-items: start; }
.kutu { display: flex; flex-direction: column; gap: 14px; margin-top: 20px; }
.izgara .kutu { margin-top: 0; }
.baslik { font-size: clamp(24px, 2.6vw, 32px); text-transform: none; }
.muted { color: var(--muted); }
.form { display: flex; flex-direction: column; gap: 14px; }
.form label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--navy); }
.form input[type='text'], .form input[type='tel'], .form textarea { min-height: 46px; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 8px; font: inherit; font-weight: 400; color: var(--ink); resize: vertical; }
.form input:focus, .form textarea:focus { outline: none; border-color: var(--gold); }
.form .onay { flex-direction: row; align-items: flex-start; gap: 10px; font-weight: 400; color: var(--ink); font-size: 14.5px; }
.form .onay input { width: 20px; height: 20px; margin-top: 2px; flex: none; accent-color: var(--navy); }
.onay a, .uyari a { color: var(--navy); font-weight: 600; }
.uyari { padding: 12px 14px; border-radius: 8px; background: #fbeaea; color: var(--red); font-weight: 600; }
.hata { color: var(--red); font-size: 14px; }
.ikili { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.ozet h3 { text-transform: none; font-size: 20px; }
.urun strong { display: block; font-family: var(--font-head); font-size: 18px; color: var(--navy); }
.urun small { display: block; margin-top: 4px; color: var(--muted); }
.dokum { margin: 0; display: flex; flex-direction: column; gap: 6px; }
.dokum div { display: flex; justify-content: space-between; }
.dokum dt { color: var(--muted); }
.dokum dd { margin: 0; font-weight: 600; color: var(--navy); }
.tutar { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 14px 16px; border-radius: 10px; background: var(--navy); color: #c9d3de; }
.tutar strong { font-family: var(--font-head); font-size: 34px; color: var(--gold-2); }
.tutar strong.kucuk { font-size: 20px; }
.analiz-btn { justify-content: center; min-height: 56px; background: var(--navy); border-color: var(--navy); color: var(--gold-2); font-size: 18px; }
.analiz-btn:hover { background: var(--navy-2); border-color: var(--navy-2); color: var(--gold-2); }
.ico { width: 20px; height: 20px; }
.guven { display: flex; gap: 6px; align-items: center; justify-content: center; color: var(--muted); text-align: center; }
.guven svg { width: 16px; height: 16px; flex: none; }
.paytr { width: 100%; min-height: 620px; border: 0; }
@media (max-width: 860px) { .izgara { grid-template-columns: 1fr; } }
</style>
