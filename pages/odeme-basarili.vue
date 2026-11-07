<script setup lang="ts">
// PayTR başarılı dönüş (merchant_ok_url). Kesin sonuç PayTR'nin backend'e bildirimidir; bildirim birkaç saniye
// gecikebileceği için sipariş durumu birkaç kez okunur.
useSeoMeta({ title: 'Ödeme Alındı', robots: 'noindex' })

const { yukle, siparisler, odemeBilgisi } = useUyelik()
const durum = ref<'bekliyor' | 'onaylandi' | 'isleniyor'>('bekliyor')
const urun = ref(odemeBilgisi()?.urun ?? 'bina')

onMounted(async () => {
  // PayTR dönüşü ödeme kutusunun (iframe) içinde açılırsa sayfanın tamamına taşınır.
  if (window.top && window.top !== window.self) { window.top.location.href = window.location.href; return }
  for (let i = 0; i < 4; i++) {
    await yukle(true)
    if (siparisler.value[0]?.status === 'paid') { durum.value = 'onaylandi'; urun.value = siparisler.value[0].product; return }
    await new Promise(r => setTimeout(r, 2000))
  }
  durum.value = 'isleniyor'
})
</script>

<template>
  <section class="section sayfa">
    <div class="wrap dar">
      <ClientOnly>
        <div class="card kutu">
          <span class="onay"><AppIcon name="check" /></span>
          <h1 class="baslik">{{ durum === 'onaylandi' ? 'Ödemeniz alındı' : durum === 'bekliyor' ? 'Ödemeniz kontrol ediliyor…' : 'Ödemeniz işleniyor' }}</h1>
          <p v-if="durum === 'isleniyor'" class="muted">Onay birkaç dakika içinde Hesabım › Ödemelerim ekranında görünecek.</p>
          <div class="dugmeler">
            <NuxtLink v-if="urun === 'site' && durum === 'onaylandi'" to="/ucretsiz-kontrol/site-yonetimi" class="btn analiz-btn">Site Yönetimine Devam Et <AppIcon name="arrow" class="ico" /></NuxtLink>
            <NuxtLink to="/hesabim/odemeler" class="btn ghost">Ödemelerim</NuxtLink>
          </div>
        </div>
      </ClientOnly>
    </div>
  </section>
</template>

<style scoped>
.sayfa { padding-top: 40px; }
.dar { max-width: 620px; }
.kutu { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; }
.baslik { font-size: clamp(24px, 2.6vw, 32px); text-transform: none; }
.onay { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: var(--navy); color: var(--gold-2); }
.onay svg { width: 34px; height: 34px; }
.dugmeler { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.analiz-btn { background: var(--navy); border-color: var(--navy); color: var(--gold-2); }
.ico { width: 20px; height: 20px; }
</style>
