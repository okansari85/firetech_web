<script setup lang="ts">
// İletişim formu henüz backend'e bağlı değil; gönderimde bilgi mesajı gösterilir.
useSeoMeta({ title: 'İletişim', description: 'FireTech ekibiyle iletişime geçin.' })

const form = reactive({ ad: '', eposta: '', konu: '', mesaj: '' })
const gonderildi = ref(false)
</script>

<template>
  <section class="section">
    <div class="wrap grid">
      <div>
        <SectionTag label="İletişim" />
        <h1 class="title">Bizimle <span class="gold">İletişime Geçin</span></h1>
        <GoldRule class="rule" :start="false" />
        <p class="lead">Yapınızın yangın güvenliği, detaylı analiz ya da kurumsal çözümler hakkında FireTech ekibine yazın.</p>
      </div>

      <form class="card form" @submit.prevent="gonderildi = true">
        <label>Ad Soyad<input v-model="form.ad" type="text" autocomplete="name" required></label>
        <label>E-posta<input v-model="form.eposta" type="email" autocomplete="email" required></label>
        <label>Konu<input v-model="form.konu" type="text"></label>
        <label>Mesajınız<textarea v-model="form.mesaj" rows="5" required /></label>
        <button type="submit" class="btn">Gönder</button>
        <p v-if="gonderildi" class="info" role="status">İletişim formu henüz aktif değil; çok yakında devreye alınacak.</p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
.title { margin-top: 20px; }
.rule { margin: 24px 0; max-width: 420px; }
.form { display: flex; flex-direction: column; gap: 14px; }
label { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-head); font-weight: 700; color: var(--navy); text-transform: uppercase; font-size: 14px; letter-spacing: .4px; }
input, textarea { font: inherit; font-family: var(--font-body); text-transform: none; letter-spacing: 0; padding: 11px 12px; border: 1px solid var(--border); border-radius: 6px; color: var(--ink); background: #fff; }
input:focus, textarea:focus { outline: 2px solid var(--gold-2); border-color: var(--gold); }
.form .btn { align-self: flex-start; }
.info { color: var(--gold); font-weight: 500; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
</style>
