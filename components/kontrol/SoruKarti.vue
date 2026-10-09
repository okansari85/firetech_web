<script setup lang="ts">
// Tek soru: büyük seçenek kartları (seçince ilerler), çoklu seçim, sayı veya metin girişi, bilgi / yönlendirme.
import type { Soru, Eylem } from '~/utils/onDegerlendirmeMotoru'
import { YARDIM, SINIFLAR } from '~/data/onDegerlendirme'

const props = defineProps<{ soru: Soru; deger?: any }>()
const emit = defineEmits<{ cevap: [deger: any]; eylem: [e: Eylem] }>()

const coklu = ref<string[]>(Array.isArray(props.deger) ? [...props.deger] : [])
const sayi = ref<string>(typeof props.deger === 'number' ? String(props.deger) : '')
const metin = ref<string>(typeof props.deger === 'string' ? props.deger : '')
const yardimAcik = ref(false)
watch(() => props.soru.id, () => { coklu.value = []; sayi.value = ''; metin.value = ''; yardimAcik.value = false })

const sayiDegeri = computed(() => { const n = parseFloat(sayi.value.replace(/\./g, '').replace(',', '.')); return isFinite(n) && n > 0 ? n : null })
const toggle = (v: string) => { coklu.value = coklu.value.includes(v) ? coklu.value.filter(x => x !== v) : [...coklu.value, v] }
const yardim = computed(() => (props.soru.yardim ? YARDIM[props.soru.yardim] : null))
const renk = computed(() => (props.soru.sinif ? SINIFLAR[props.soru.sinif].renk : 'var(--gold)'))
</script>

<template>
  <section class="soru card" :class="soru.tip" :style="{ '--vurgu': renk }">
    <div class="ust">
      <h2>{{ soru.baslik }}</h2>
      <button v-if="yardim" type="button" class="yardim-btn" @click="yardimAcik = true"><AppIcon name="search" /> {{ yardim.baslik }}</button>
    </div>
    <p v-if="soru.aciklama" class="aciklama">{{ soru.aciklama }}</p>

    <div v-if="soru.liste" class="liste">
      <strong>{{ soru.liste.baslik }}</strong>
      <ul><li v-for="o in soru.liste.ornekler" :key="o">{{ o }}</li></ul>
    </div>

    <!-- Tek seçim -->
    <div v-if="soru.tip === 'secim'" class="secenekler" :class="{ iki: (soru.secenekler?.length ?? 0) > 4 }">
      <button v-for="s in soru.secenekler" :key="s.deger" type="button" class="secenek" :class="{ secili: deger === s.deger }" @click="emit('cevap', s.deger)">
        <span class="s-etiket">{{ s.etiket }}</span>
        <span v-if="s.aciklama" class="s-aciklama">{{ s.aciklama }}</span>
        <span v-if="s.ornek" class="s-ornek">{{ s.ornek }}</span>
      </button>
    </div>

    <!-- Çoklu seçim -->
    <template v-else-if="soru.tip === 'coklu'">
      <div class="secenekler iki">
        <button v-for="s in soru.secenekler" :key="s.deger" type="button" role="checkbox" :aria-checked="coklu.includes(s.deger)" class="secenek" :class="{ secili: coklu.includes(s.deger) }" @click="toggle(s.deger)">
          <span class="s-etiket"><span class="kutu"><AppIcon v-if="coklu.includes(s.deger)" name="check" /></span>{{ s.etiket }}</span>
          <span v-if="s.ornek" class="s-ornek">{{ s.ornek }}</span>
        </button>
      </div>
      <div class="alt"><button type="button" class="btn gold-btn" :disabled="!coklu.length" @click="emit('cevap', coklu)">Devam Et <AppIcon name="arrow" class="ico" /></button></div>
    </template>

    <!-- Sayı -->
    <form v-else-if="soru.tip === 'sayi'" class="giris" @submit.prevent="sayiDegeri && emit('cevap', sayiDegeri)">
      <label class="sayi-kutu"><input v-model="sayi" type="text" inputmode="decimal" placeholder="Örn. 120" :aria-label="soru.kisaAd"><span>{{ soru.birim }}</span></label>
      <button type="submit" class="btn gold-btn" :disabled="!sayiDegeri">Devam Et <AppIcon name="arrow" class="ico" /></button>
      <button v-if="soru.bilinmiyorDugmesi" type="button" class="btn ghost" @click="emit('cevap', 'bilmiyorum')">Bilmiyorum</button>
    </form>

    <!-- Metin -->
    <form v-else-if="soru.tip === 'metin'" class="giris" @submit.prevent="emit('cevap', metin.trim())">
      <input v-model="metin" type="text" class="metin" placeholder="Örn. A Blok" :aria-label="soru.kisaAd">
      <button type="submit" class="btn gold-btn">{{ metin.trim() ? 'Devam Et' : 'Atla' }} <AppIcon name="arrow" class="ico" /></button>
    </form>

    <!-- Bilgi / yönlendirme -->
    <div v-else-if="soru.tip === 'bilgi'" class="alt">
      <button v-for="e in soru.eylemler" :key="e.etiket" type="button" class="btn gold-btn" @click="emit('eylem', e)">{{ e.etiket }} <AppIcon name="arrow" class="ico" /></button>
    </div>

    <!-- Yardım penceresi: yalnız Kapat ile kapanır -->
    <div v-if="yardimAcik && yardim" class="modal-arka" role="dialog" aria-modal="true" :aria-label="yardim.baslik">
      <div class="modal card">
        <div class="modal-ust"><h3>{{ yardim.baslik }}</h3><button type="button" class="kapat" aria-label="Kapat" @click="yardimAcik = false"><AppIcon name="close" /></button></div>
        <p v-for="m in yardim.metin" :key="m">{{ m }}</p>
        <button type="button" class="btn" @click="yardimAcik = false">Anladım</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.soru { border-top: 4px solid var(--vurgu); padding: 28px; }
.ust { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
h2 { font-size: clamp(24px, 2.4vw, 32px); text-transform: none; }
.yardim-btn { flex: none; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border); border-radius: 999px; background: #fff; padding: 7px 14px; font-family: var(--font-head); font-weight: 700; font-size: 14px; color: var(--gold); cursor: pointer; }
.yardim-btn svg { width: 16px; height: 16px; }
.aciklama { margin-top: 10px; color: var(--muted); }
.liste { margin-top: 16px; padding: 14px 18px; background: var(--paper); border-left: 3px solid var(--gold); border-radius: 6px; }
.liste strong { font-family: var(--font-head); color: var(--navy); }
.liste ul { margin: 8px 0 0; padding-left: 18px; font-size: 14.5px; }
.secenekler { display: grid; gap: 12px; margin-top: 22px; }
.secenekler.iki { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.secenek { display: flex; flex-direction: column; gap: 5px; text-align: left; font: inherit; color: inherit; cursor: pointer; padding: 16px 18px; border: 1.5px solid var(--border); border-radius: 10px; background: #fff; transition: border-color .15s, box-shadow .15s, transform .1s; }
.secenek:hover { border-color: var(--vurgu); }
.secenek:active { transform: scale(.995); }
.secenek.secili { border-color: var(--vurgu); box-shadow: 0 0 0 2px var(--vurgu) inset; background: #fffdf7; }
.s-etiket { display: flex; align-items: center; gap: 10px; font-family: var(--font-head); font-size: 19px; font-weight: 700; color: var(--navy); line-height: 1.2; }
.s-aciklama { font-size: 14.5px; color: var(--ink); }
.s-ornek { font-size: 13.5px; color: var(--muted); }
.kutu { display: grid; place-items: center; width: 22px; height: 22px; flex: none; border: 1.5px solid var(--vurgu); border-radius: 5px; color: #fff; background: #fff; }
.secili .kutu { background: var(--vurgu); }
.kutu svg { width: 15px; height: 15px; }
.alt { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
.giris { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; align-items: stretch; }
.sayi-kutu { display: flex; border: 1.5px solid var(--border); border-radius: 8px; overflow: hidden; background: #fff; }
.sayi-kutu input { width: 170px; border: 0; padding: 0 16px; font: inherit; font-size: 20px; min-height: 48px; }
.sayi-kutu span { display: grid; place-items: center; padding: 0 16px; border-left: 1px solid var(--border); font-family: var(--font-head); font-weight: 700; color: var(--muted); }
.metin { flex: 1 1 240px; border: 1.5px solid var(--border); border-radius: 8px; padding: 0 16px; font: inherit; font-size: 18px; min-height: 48px; }
.sayi-kutu:focus-within, .metin:focus { outline: 2px solid var(--gold-2); border-color: var(--gold); }
.ico { width: 20px; height: 20px; }
.modal-arka { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 16px; background: rgba(12, 40, 64, .55); }
.modal { max-width: 560px; display: flex; flex-direction: column; gap: 12px; }
.modal-ust { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.modal h3 { font-size: 24px; }
.kapat { border: 0; background: none; cursor: pointer; color: var(--navy); }
.kapat svg { width: 24px; height: 24px; }
.modal .btn { align-self: flex-start; }
@media (max-width: 640px) {
  .secenekler.iki { grid-template-columns: 1fr; }
  .ust { flex-direction: column; }
  .soru { padding: 20px; }
}
</style>
