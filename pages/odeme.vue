<script setup lang="ts">
// Ödeme (TASLAK): gerçek ödeme alınmaz. Kart alanları deneme kartıyla dolu ve kilitli (gerçek kart bilgisi girilemez).
// ?urun=bina|site ; ödeme sonrası URUNLER[urun].sonra. Üye değilse girişe yönlendirilir.
import { URUNLER, fiyatYazi, type UrunKod } from '~/data/urunler'

useSeoMeta({ title: 'Ödeme', description: 'Detaylı analiz ödemesi.' })

const route = useRoute()
const { uye, odemeKaydet } = useUyelik()
const urunKod = computed(() => (route.query.urun === 'site' ? 'site' : 'bina') as UrunKod)
const urun = computed(() => URUNLER[urunKod.value])
const tamam = computed(() => route.query.tamam === '1')
const isleniyor = ref(false)

onMounted(() => { if (!uye.value) navigateTo(`/giris?devam=${encodeURIComponent(route.fullPath)}`) })

const ode = () => {
  isleniyor.value = true
  // Gerçek ödeme yok: kısa bir bekleme, ödeme bu tarayıcıda kaydedilir.
  setTimeout(() => { odemeKaydet(urunKod.value); navigateTo(urun.value.sonra) }, 900)
}
</script>

<template>
  <section class="section sayfa">
    <div class="wrap dar">
      <SectionTag label="Ödeme" />

      <!-- Ödeme tamamlandı (bina analizi: analiz ekranları henüz yok) -->
      <div v-if="tamam" class="card kutu ortala">
        <span class="onay"><AppIcon name="check" /></span>
        <h1 class="baslik">Ödemeniz alındı</h1>
        <p class="muted">{{ urun.ad }}</p>
        <NuxtLink to="/ucretsiz-kontrol/degerlendirme" class="btn ghost">Ön değerlendirme sonucuna dön</NuxtLink>
      </div>

      <div v-else class="izgara">
        <!-- Kart bilgileri (kilitli deneme kartı) -->
        <div class="card kutu">
          <h1 class="baslik">Ödeme Bilgileri</h1>
          <div class="kart-on">
            <span class="cip-ikon" />
            <span class="no">4242 4242 4242 4242</span>
            <span class="alt"><span>{{ uye?.ad?.toLocaleUpperCase('tr') || 'AD SOYAD' }}</span><span>12/30</span></span>
          </div>
          <label>Kart Üzerindeki İsim<input :value="uye?.ad ?? ''" type="text" readonly></label>
          <label>Kart Numarası<input value="4242 4242 4242 4242" type="text" readonly></label>
          <div class="iki">
            <label>Son Kullanma<input value="12/30" type="text" readonly></label>
            <label>CVV<input value="•••" type="text" readonly></label>
          </div>
          <p class="deneme"><AppIcon name="alert" /> Deneme ödeme ekranı: kartınızdan çekim yapılmaz, kart bilgisi istenmez.</p>
        </div>

        <!-- Sipariş özeti -->
        <aside class="card kutu ozet">
          <h3>Sipariş Özeti</h3>
          <div class="urun"><strong>{{ urun.ad }}</strong><small>{{ urun.aciklama }}</small></div>
          <div class="tutar"><span>Ödenecek tutar</span><strong>{{ fiyatYazi(urun.fiyat) }} TL</strong></div>
          <small class="muted">Fiyatlara KDV dahil değildir.</small>
          <button type="button" class="btn analiz-btn" :disabled="isleniyor" @click="ode">{{ isleniyor ? 'İşleniyor…' : 'Ödemeyi Tamamla' }} <AppIcon v-if="!isleniyor" name="arrow" class="ico" /></button>
          <small class="guven"><AppIcon name="lock" /> Güvenli ödeme</small>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sayfa { padding-top: 40px; }
.dar { max-width: 1000px; }
.izgara { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; margin-top: 20px; align-items: start; }
.kutu { display: flex; flex-direction: column; gap: 14px; }
.ortala { align-items: center; text-align: center; margin-top: 20px; max-width: 560px; }
.baslik { font-size: clamp(24px, 2.6vw, 32px); text-transform: none; }
.muted { color: var(--muted); }
.kart-on { position: relative; display: flex; flex-direction: column; justify-content: space-between; height: 170px; padding: 18px 22px; border-radius: 14px; color: #fff; background: linear-gradient(135deg, var(--navy) 0%, #1b4a6e 100%); box-shadow: 0 14px 30px -16px rgba(12, 40, 64, .8); }
.cip-ikon { width: 42px; height: 30px; border-radius: 6px; background: linear-gradient(135deg, #e9c46a, #b98a2f); }
.kart-on .no { font-family: var(--font-head); font-size: 24px; letter-spacing: 2px; }
.kart-on .alt { display: flex; justify-content: space-between; font-family: var(--font-head); font-size: 14px; letter-spacing: 1px; color: #c9d3de; }
label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--navy); }
input { min-height: 46px; padding: 0 14px; border: 1.5px solid var(--border); border-radius: 8px; font: inherit; font-weight: 400; color: var(--muted); background: var(--paper); }
.iki { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ozet h3 { text-transform: none; font-size: 20px; }
.urun strong { display: block; font-family: var(--font-head); font-size: 18px; color: var(--navy); }
.urun small { display: block; margin-top: 4px; color: var(--muted); }
.tutar { display: flex; justify-content: space-between; align-items: baseline; padding: 14px 16px; border-radius: 10px; background: var(--navy); color: #c9d3de; }
.tutar strong { font-family: var(--font-head); font-size: 34px; color: var(--gold-2); }
.analiz-btn { justify-content: center; min-height: 56px; background: var(--navy); border-color: var(--navy); color: var(--gold-2); font-size: 18px; }
.analiz-btn:hover { background: var(--navy-2); border-color: var(--navy-2); color: var(--gold-2); }
.ico { width: 20px; height: 20px; }
.guven { display: flex; gap: 6px; align-items: center; justify-content: center; color: var(--muted); }
.guven svg, .deneme svg { width: 16px; height: 16px; flex: none; }
.deneme { display: flex; gap: 8px; align-items: center; font-size: 13.5px; color: var(--muted); }
.onay { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: var(--navy); color: var(--gold-2); }
.onay svg { width: 34px; height: 34px; }
@media (max-width: 860px) { .izgara { grid-template-columns: 1fr; } }
</style>
