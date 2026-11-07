<script setup lang="ts">
// Hesabım › Şifre Değiştir. Değişince bu tarayıcı dışındaki girişler kapanır (backend).
import { hataMesaji } from '~/composables/useUyelik'

useSeoMeta({ title: 'Şifre Değiştir', robots: 'noindex' })

const { sifreDegistir } = useUyelik()
const f = reactive({ mevcut: '', yeni: '' })
const mesaj = ref('')
const hata = ref('')
const gonderiliyor = ref(false)

const kaydet = async () => {
  hata.value = ''; mesaj.value = ''
  gonderiliyor.value = true
  try {
    await sifreDegistir({ current_password: f.mevcut, password: f.yeni })
    f.mevcut = ''; f.yeni = ''
    mesaj.value = 'Şifreniz değiştirildi.'
  } catch (e) { hata.value = hataMesaji(e) } finally { gonderiliyor.value = false }
}
</script>

<template>
  <HesabimCerceve baslik="Şifre Değiştir">
    <form class="card form" novalidate @submit.prevent="kaydet">
      <label>Mevcut Şifre<input v-model="f.mevcut" type="password" autocomplete="current-password"></label>
      <label>Yeni Şifre<input v-model="f.yeni" type="password" autocomplete="new-password" placeholder="En az 8 karakter"></label>
      <p v-if="hata" class="hata" role="alert">{{ hata }}</p>
      <p v-if="mesaj" class="tamam" role="status">{{ mesaj }}</p>
      <button type="submit" class="btn analiz-btn" :disabled="gonderiliyor || !f.mevcut || f.yeni.length < 8">{{ gonderiliyor ? 'Kaydediliyor…' : 'Şifreyi Değiştir' }}</button>
    </form>
  </HesabimCerceve>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 14px; max-width: 560px; }
.form label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--navy); }
.form input { min-height: 46px; padding: 0 14px; border: 1.5px solid var(--border); border-radius: 8px; font: inherit; font-weight: 400; color: var(--ink); }
.form input:focus { outline: none; border-color: var(--gold); }
.hata { color: var(--red); font-size: 14px; }
.tamam { color: #1f6f43; font-size: 14px; font-weight: 600; }
.analiz-btn { justify-content: center; min-height: 50px; background: var(--navy); border-color: var(--navy); color: var(--gold-2); }
</style>
