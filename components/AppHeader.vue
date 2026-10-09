<script setup lang="ts">
const links = [
  { to: '/', label: 'Ana Sayfa' },
  { to: '/ekosistem', label: 'Ekosistem' },
  { to: '/ucretsiz-kontrol', label: 'Ücretsiz Kontrol' },
  { to: '/iletisim', label: 'İletişim' }
]
const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <header class="header">
    <div class="wrap bar">
      <NuxtLink to="/" class="brand" aria-label="FireTech ana sayfa">
        <img src="/img/firetech-kalkan.png" alt="" width="36" height="45">
        <span class="brand-text">
          <span class="brand-name"><span class="gold">FIRE</span>TECH</span>
          <span class="brand-sub">Bilgi · Mühendislik · Teknoloji</span>
        </span>
      </NuxtLink>

      <nav class="nav" :class="{ open }" aria-label="Ana menü">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="nav-link">{{ l.label }}</NuxtLink>
        <NuxtLink to="/giris" class="btn ghost nav-btn">Giriş</NuxtLink>
      </nav>

      <button class="menu-btn" type="button" :aria-expanded="open" aria-label="Menüyü aç / kapat" @click="open = !open">
        <AppIcon :name="open ? 'close' : 'menu'" />
      </button>
    </div>
    <GoldRule :start="false" />
  </header>
</template>

<style scoped>
.header { position: sticky; top: 0; z-index: 20; background: rgba(255, 255, 255, .97); backdrop-filter: blur(6px); }
.bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 76px; }
.brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
.brand img { width: 36px; height: auto; }
.brand-text { display: flex; flex-direction: column; line-height: 1; }
.brand-name { font-family: var(--font-head); font-weight: 800; font-size: 28px; letter-spacing: 1px; color: var(--navy); }
.brand-sub { margin-top: 4px; font-family: var(--font-head); font-size: 11.5px; font-weight: 600; letter-spacing: 1.6px; color: var(--muted); text-transform: uppercase; }
.nav { display: flex; align-items: center; gap: 28px; }
.nav-link {
  font-family: var(--font-head); font-size: 17px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
  color: var(--navy); text-decoration: none; padding: 6px 0; border-bottom: 2px solid transparent;
}
.nav-link:hover, .nav-link.router-link-exact-active { border-bottom-color: var(--gold); }
.nav-btn { min-height: 40px; padding: 0 18px; font-size: 16px; }
.menu-btn { display: none; width: 44px; height: 44px; border: 1px solid var(--border); border-radius: 6px; background: #fff; color: var(--navy); cursor: pointer; place-items: center; }
.menu-btn svg { width: 24px; height: 24px; }

@media (max-width: 900px) {
  .menu-btn { display: grid; }
  .nav {
    display: none; position: absolute; top: 77px; left: 0; right: 0;
    flex-direction: column; align-items: stretch; gap: 0;
    padding: 8px 16px 20px; background: #fff; border-bottom: 1px solid var(--border);
  }
  .nav.open { display: flex; }
  .nav-link { padding: 14px 0; border-bottom: 1px solid var(--border); }
  .nav-btn { margin-top: 14px; justify-content: center; }
  .brand-sub { display: none; }
}
</style>
