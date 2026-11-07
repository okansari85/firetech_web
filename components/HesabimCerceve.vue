<script setup lang="ts">
// Hesabım sayfalarının ortak çerçevesi: giriş kontrolü, solda menü, sağda sayfa. Üye değilse girişe gönderir.
defineProps<{ baslik: string }>()

const route = useRoute()
const { uye, yukle, cikis } = useUyelik()
const hazir = ref(false)
const MENU = [
  { to: '/hesabim', label: 'Bilgilerim' },
  { to: '/hesabim/degerlendirmeler', label: 'Ücretsiz Değerlendirmelerim' },
  { to: '/hesabim/odemeler', label: 'Ödemelerim' },
  { to: '/hesabim/sifre', label: 'Şifre Değiştir' }
]

onMounted(async () => {
  await yukle(true)
  if (!uye.value) return navigateTo(`/giris?devam=${encodeURIComponent(route.fullPath)}`, { replace: true })
  hazir.value = true
})
const cikisYap = async () => { await cikis(); navigateTo('/') }
</script>

<template>
  <section class="section sayfa">
    <div class="wrap">
      <SectionTag label="Hesabım" />
      <ClientOnly>
        <div v-if="hazir" class="izgara">
          <nav class="card menu" aria-label="Hesabım menüsü">
            <p class="kim"><strong>{{ uye?.name }}</strong><small>{{ uye?.email }}</small></p>
            <NuxtLink v-for="m in MENU" :key="m.to" :to="m.to" class="link" :class="{ aktif: route.path === m.to }">{{ m.label }}</NuxtLink>
            <button type="button" class="link cikis" @click="cikisYap">Çıkış Yap</button>
          </nav>
          <div class="icerik">
            <h1 class="baslik">{{ baslik }}</h1>
            <slot />
          </div>
        </div>
        <p v-else class="muted yukleniyor">Yükleniyor…</p>
      </ClientOnly>
    </div>
  </section>
</template>

<style scoped>
.sayfa { padding-top: 40px; }
.izgara { display: grid; grid-template-columns: 280px 1fr; gap: 24px; margin-top: 20px; align-items: start; }
.menu { display: flex; flex-direction: column; gap: 2px; padding: 16px; }
.kim { display: flex; flex-direction: column; padding: 4px 10px 14px; margin-bottom: 6px; border-bottom: 1px solid var(--border); }
.kim strong { font-family: var(--font-head); font-size: 19px; color: var(--navy); }
.kim small { color: var(--muted); word-break: break-all; }
.link { display: block; padding: 10px; border: 0; border-radius: 8px; background: none; font: inherit; font-weight: 600; color: var(--navy); text-align: left; text-decoration: none; cursor: pointer; }
.link:hover { background: var(--paper); }
.link.aktif { background: var(--navy); color: var(--gold-2); }
.cikis { margin-top: 6px; color: var(--red); }
.icerik { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.baslik { font-size: clamp(26px, 3vw, 36px); text-transform: none; }
.muted { color: var(--muted); }
.yukleniyor { margin-top: 20px; }
@media (max-width: 860px) {
  .izgara { grid-template-columns: 1fr; }
  .menu { flex-direction: row; flex-wrap: wrap; gap: 6px; }
  .kim { width: 100%; }
}
</style>
