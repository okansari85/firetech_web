<script setup lang="ts">
// PayTR başarısız dönüş (merchant_fail_url). Karttan çekim yapılmamıştır; kullanıcı ödemeyi yeniden deneyebilir.
useSeoMeta({ title: 'Ödeme Tamamlanamadı', robots: 'noindex' })

const { odemeBilgisi } = useUyelik()
const urun = ref<'bina' | 'site'>('bina')
onMounted(() => {
  if (window.top && window.top !== window.self) { window.top.location.href = window.location.href; return }
  urun.value = odemeBilgisi()?.urun ?? 'bina'
})
</script>

<template>
  <section class="section sayfa">
    <div class="wrap dar">
      <div class="card kutu">
        <span class="carpi"><AppIcon name="close" /></span>
        <h1 class="baslik">Ödeme tamamlanamadı</h1>
        <p class="muted">Kartınızdan çekim yapılmadı. Bilgilerinizi kontrol edip yeniden deneyebilirsiniz.</p>
        <div class="dugmeler">
          <NuxtLink :to="`/odeme?urun=${urun}`" class="btn analiz-btn">Yeniden Dene <AppIcon name="arrow" class="ico" /></NuxtLink>
          <NuxtLink to="/iletisim" class="btn ghost">İletişim</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sayfa { padding-top: 40px; }
.dar { max-width: 620px; }
.kutu { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; }
.baslik { font-size: clamp(24px, 2.6vw, 32px); text-transform: none; }
.carpi { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: var(--red); color: #fff; }
.carpi svg { width: 30px; height: 30px; }
.dugmeler { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.analiz-btn { background: var(--navy); border-color: var(--navy); color: var(--gold-2); }
.ico { width: 20px; height: 20px; }
</style>
