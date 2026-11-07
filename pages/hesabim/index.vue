<script setup lang="ts">
// Hesabım › Bilgilerim: ad soyad ve telefon değiştirilir (ödeme formu buradan dolar); e-posta giriş adıdır, değişmez.
import { hataMesaji } from '~/composables/useUyelik'

useSeoMeta({ title: 'Hesabım', robots: 'noindex' })

const { uye, bilgileriGuncelle } = useUyelik()
const f = reactive({ ad: '', telefon: '' })
watch(uye, u => { if (u) { f.ad = u.name; f.telefon = u.phone || '' } }, { immediate: true })
const mesaj = ref('')
const hata = ref('')
const gonderiliyor = ref(false)

const kaydet = async () => {
  hata.value = ''; mesaj.value = ''
  gonderiliyor.value = true
  try {
    await bilgileriGuncelle({ name: f.ad.trim(), phone: f.telefon.trim() })
    mesaj.value = 'Bilgileriniz kaydedildi.'
  } catch (e) { hata.value = hataMesaji(e) } finally { gonderiliyor.value = false }
}
</script>

<template>
  <HesabimCerceve baslik="Bilgilerim">
    <form class="card form" novalidate @submit.prevent="kaydet">
      <label>Ad Soyad<input v-model="f.ad" type="text" autocomplete="name"></label>
      <label>E-posta<input :value="uye?.email" type="email" readonly></label>
      <label>Telefon<input v-model="f.telefon" type="tel" autocomplete="tel" placeholder="05xx xxx xx xx"></label>
      <p v-if="hata" class="hata" role="alert">{{ hata }}</p>
      <p v-if="mesaj" class="tamam" role="status">{{ mesaj }}</p>
      <button type="submit" class="btn analiz-btn" :disabled="gonderiliyor || f.ad.trim().length < 3">{{ gonderiliyor ? 'Kaydediliyor…' : 'Kaydet' }}</button>
    </form>
  </HesabimCerceve>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 14px; max-width: 560px; }
.form label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--navy); }
.form input { min-height: 46px; padding: 0 14px; border: 1.5px solid var(--border); border-radius: 8px; font: inherit; font-weight: 400; color: var(--ink); }
.form input[readonly] { background: var(--paper); color: var(--muted); }
.form input:focus { outline: none; border-color: var(--gold); }
.hata { color: var(--red); font-size: 14px; }
.tamam { color: #1f6f43; font-size: 14px; font-weight: 600; }
.analiz-btn { justify-content: center; min-height: 50px; background: var(--navy); border-color: var(--navy); color: var(--gold-2); }
</style>
