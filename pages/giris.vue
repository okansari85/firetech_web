<script setup lang="ts">
// Giriş / Üye Ol: firetech backend (composables/useUyelik.ts). Giriş yapılmışsa Hesabım'a ya da ?devam= sayfasına gider.
// ?devam=… : girişten sonra gidilecek sayfa (ör. ödeme). Detaylı analiz düğmeleri üye değilse buraya gönderir.
import { hataMesaji } from '~/composables/useUyelik'

useSeoMeta({ title: 'Giriş', description: 'FireTech hesabınıza giriş yapın veya üye olun.' })

const route = useRoute()
const { uye, yukle, girisYap, uyeOl } = useUyelik()
const devam = computed(() => (typeof route.query.devam === 'string' && route.query.devam.startsWith('/') && !route.query.devam.startsWith('//') ? route.query.devam : ''))
const sekme = ref<'giris' | 'uye'>('uye')
const f = reactive({ ad: '', eposta: '', telefon: '', sifre: '' })
const hata = ref('')
const gonderiliyor = ref(false)

const git = () => navigateTo(devam.value || '/hesabim', { replace: true })
onMounted(async () => { await yukle(); if (uye.value) git() })

const epostaGecerli = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.eposta.trim()))
const hazir = computed(() => epostaGecerli.value && f.sifre.length >= (sekme.value === 'uye' ? 8 : 1) && (sekme.value === 'giris' || f.ad.trim().length >= 3))

const gonder = async () => {
  if (!hazir.value || gonderiliyor.value) { hata.value = 'Lütfen bilgileri eksiksiz girin.'; return }
  hata.value = ''
  gonderiliyor.value = true
  try {
    if (sekme.value === 'uye') await uyeOl({ name: f.ad.trim(), email: f.eposta.trim(), phone: f.telefon.trim(), password: f.sifre })
    else await girisYap(f.eposta.trim(), f.sifre)
    f.sifre = ''
    git()
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
      <SectionTag label="Hesabım" />

      <div class="card kutu">
        <p v-if="devam" class="bilgi"><AppIcon name="shield" /> Detaylı analize devam etmek için giriş yapın veya üye olun.</p>
        <div class="sekmeler" role="tablist">
          <button type="button" role="tab" :aria-selected="sekme === 'uye'" :class="{ aktif: sekme === 'uye' }" @click="sekme = 'uye'; hata = ''">Üye Ol</button>
          <button type="button" role="tab" :aria-selected="sekme === 'giris'" :class="{ aktif: sekme === 'giris' }" @click="sekme = 'giris'; hata = ''">Giriş Yap</button>
        </div>
        <form class="form" novalidate @submit.prevent="gonder">
          <label v-if="sekme === 'uye'">Ad Soyad<input v-model="f.ad" type="text" autocomplete="name"></label>
          <label>E-posta<input v-model="f.eposta" type="email" autocomplete="email"></label>
          <label v-if="sekme === 'uye'">Telefon<input v-model="f.telefon" type="tel" autocomplete="tel" placeholder="05xx xxx xx xx"></label>
          <label>Şifre<input v-model="f.sifre" type="password" :autocomplete="sekme === 'uye' ? 'new-password' : 'current-password'" :placeholder="sekme === 'uye' ? 'En az 8 karakter' : ''"></label>
          <p v-if="hata" class="hata" role="alert">{{ hata }}</p>
          <button type="submit" class="btn analiz-btn" :disabled="!hazir || gonderiliyor">{{ gonderiliyor ? 'Lütfen bekleyin…' : sekme === 'uye' ? 'Üye Ol ve Devam Et' : 'Giriş Yap' }} <AppIcon v-if="!gonderiliyor" name="arrow" class="ico" /></button>
        </form>
        <p v-if="sekme === 'uye'" class="deneme">Üye olarak <NuxtLink to="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</NuxtLink>'ni okuduğunuzu kabul edersiniz.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sayfa { padding-top: 40px; }
.dar { max-width: 620px; }
.kutu { margin-top: 20px; display: flex; flex-direction: column; gap: 16px; }
.baslik { font-size: clamp(26px, 3vw, 36px); text-transform: none; }
.muted { color: var(--muted); }
.bilgi { display: flex; gap: 10px; align-items: center; padding: 12px 14px; border-radius: 8px; background: var(--paper); color: var(--navy); font-weight: 600; }
.bilgi svg { width: 20px; height: 20px; color: var(--gold); flex: none; }
.sekmeler { display: grid; grid-template-columns: 1fr 1fr; border: 1.5px solid var(--navy); border-radius: 10px; overflow: hidden; }
.sekmeler button { padding: 12px; border: 0; background: #fff; font-family: var(--font-head); font-size: 17px; font-weight: 700; color: var(--navy); cursor: pointer; text-transform: uppercase; }
.sekmeler button.aktif { background: var(--navy); color: var(--gold-2); }
.form { display: flex; flex-direction: column; gap: 14px; }
.form label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--navy); }
.form input { min-height: 48px; padding: 0 14px; border: 1.5px solid var(--border); border-radius: 8px; font: inherit; font-weight: 400; color: var(--ink); }
.form input:focus { outline: none; border-color: var(--gold); }
.hata { color: var(--red); font-size: 14px; }
.analiz-btn { justify-content: center; min-height: 56px; background: var(--navy); border-color: var(--navy); color: var(--gold-2); font-size: 18px; }
.analiz-btn:hover { background: var(--navy-2); border-color: var(--navy-2); color: var(--gold-2); }
.ico { width: 20px; height: 20px; }
.dugmeler { display: flex; flex-wrap: wrap; gap: 12px; }
.dugmeler .analiz-btn { flex: 1; }
.deneme { display: flex; gap: 8px; align-items: center; font-size: 13.5px; color: var(--muted); }
.deneme svg { width: 18px; height: 18px; flex: none; }
</style>
