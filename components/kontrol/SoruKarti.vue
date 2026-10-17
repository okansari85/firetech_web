<script setup lang="ts">
// Tek soru: büyük seçenek kartları (seçince ilerler), çoklu seçim, sayı veya metin girişi, bilgi / yönlendirme.
import type { Soru, Eylem } from '~/utils/onDegerlendirmeMotoru'
import { YARDIM, SINIFLAR, DIGER_YAZ_METIN } from '~/data/onDegerlendirme'
import { eslestir, eslesmeEtiketi, ALT_TURLER, type Eslesme } from '~/utils/eslestir'

const props = defineProps<{ soru: Soru; deger?: any }>()
const emit = defineEmits<{ cevap: [deger: any, ek?: Record<string, any>]; eylem: [e: Eylem] }>()

const coklu = ref<string[]>(Array.isArray(props.deger) ? [...props.deger] : [])
const sayi = ref<string>(typeof props.deger === 'number' ? String(props.deger) : '')
const metin = ref<string>(typeof props.deger === 'string' ? props.deger : '')
const yardimAcik = ref(false)
watch(() => props.soru.id, () => { coklu.value = []; sayi.value = ''; metin.value = ''; yardimAcik.value = false; digerAcik.value = false; yazi.value = '' })

// ── Diğer (Kendim Yazacağım) — Düzeltme 02 ──
const digerAcik = ref(props.deger === 'kendim')
const yazi = ref('')
const esasSoru = computed(() => !props.soru.id.startsWith('d_'))
const eslesmeler = computed(() => (yazi.value.trim().length >= 3 ? eslestir(yazi.value) : []))
// Bu sorunun sınıfındaki eşleşmeler; esas kullanımda başka sınıfa düşenler de önerilir (sınıf değiştirilir)
const oneriler = computed(() => eslesmeler.value.filter(e => e.sinif === props.soru.sinif || esasSoru.value)
  .sort((a, b) => Number(b.sinif === props.soru.sinif) - Number(a.sinif === props.soru.sinif)))
const yaziTemiz = computed(() => yazi.value.trim())
const elleTur = ref('')
watch(yazi, () => { elleTur.value = '' })
const tanimliTurler = computed(() => (props.soru.secenekler ?? []).filter(o => o.deger !== 'kendim'))
const elleSec = () => emit('cevap', elleTur.value, { [`${props.soru.id}_yazi`]: yaziTemiz.value, [`${props.soru.id}_eslesme`]: 'elle' })
// Bu sınıfla eşleşti ama alt tür bulunamadı: kullanıcı tanımlı türlerden seçer (sınıfla devam edilmez)
const sinifOnerisi = computed(() => oneriler.value.find(e => e.sinif === props.soru.sinif && !e.tur) ?? null)
const tiklanir = (e: Eslesme) => !!e.tur || e.sinif !== props.soru.sinif
const oneriSec = (e: Eslesme) => {
  const ad = yaziTemiz.value
  if (!tiklanir(e)) return
  if (e.sinif === props.soru.sinif) {
    emit('cevap', e.tur ?? 'kendim', { [`${props.soru.id}_yazi`]: ad, [`${props.soru.id}_eslesme`]: e.tur ? 'tur' : 'sinif' })
    return
  }
  // Başka sınıf: o sınıfla devam (tür sorusu varsa yazılan ad ve eşleşme oraya taşınır)
  const turId = ({ konaklama: 'konaklamaTuru', kurumsal: 'kurumsalTuru', buro: 'buroTuru', ticaret: 'ticaretTuru', toplanma: 'toplanmaTuru', depolama: 'depoTuru', yuksek: 'yhFaaliyet' } as Record<string, string>)[e.sinif]
  // Alt tür bulunamadıysa o sınıfın tür sorusu yeniden sorulur (yazılan ad korunur)
  const ek = turId ? (e.tur ? { [turId]: e.tur, [`${turId}_yazi`]: ad, [`${turId}_eslesme`]: 'tur' } : { [`${turId}_yazi`]: ad }) : { yaziAd: ad }
  emit('eylem', { etiket: '', tip: 'esas', sinif: e.sinif, ek })
}

const sayiDegeri = computed(() => { const n = parseFloat(sayi.value.replace(/\./g, '').replace(',', '.')); return isFinite(n) && n > 0 ? n : null })
const toggle = (v: string) => { coklu.value = coklu.value.includes(v) ? coklu.value.filter(x => x !== v) : [...coklu.value, v] }
const yardim = computed(() => (props.soru.yardim ? YARDIM[props.soru.yardim] : null))
const renk = computed(() => (props.soru.sinif ? SINIFLAR[props.soru.sinif].renk : 'var(--gold)'))
</script>

<template>
  <section class="soru card" :class="soru.tip" :style="{ '--vurgu': renk }">
    <div v-if="soru.ust" class="ust-kutu">
      <strong>{{ soru.ust.baslik }}</strong>
      <p v-if="soru.ust.aciklama">{{ soru.ust.aciklama }}</p>
    </div>
    <div class="ust">
      <h2>{{ soru.baslik }}</h2>
      <button v-if="yardim" type="button" class="yardim-btn" @click="yardimAcik = true"><AppIcon name="search" /> {{ yardim.baslik }}</button>
    </div>
    <p v-if="soru.aciklama" class="aciklama">{{ soru.aciklama }}</p>
    <p v-if="soru.digerYaz" class="aciklama">{{ DIGER_YAZ_METIN.soruNotu }}</p>

    <!-- Tanım (ör. Ticaret: alan bilinmiyorsa m² istenmeden önce) -->
    <div v-if="soru.tanim" class="tanim">
      <p>“{{ soru.tanim.metin }}”</p>
      <p v-if="soru.tanim.ornek"><strong>Örnek:</strong> {{ soru.tanim.ornek }}</p>
    </div>

    <div v-if="soru.liste" class="liste">
      <strong>{{ soru.liste.baslik }}</strong>
      <ul><li v-for="o in soru.liste.ornekler" :key="o">{{ o }}</li></ul>
    </div>

    <!-- Tek seçim -->
    <div v-if="soru.tip === 'secim'" class="secenekler" :class="{ iki: soru.ikiSutun || (soru.secenekler?.length ?? 0) > 4 }">
      <button v-for="s in soru.secenekler" :key="s.deger" type="button" class="secenek" :class="{ secili: s.deger === 'kendim' ? digerAcik : deger === s.deger, kendim: s.deger === 'kendim' }" @click="s.deger === 'kendim' ? (digerAcik = !digerAcik) : emit('cevap', s.deger)">
        <span class="s-etiket"><AppIcon v-if="s.deger === 'kendim'" name="kalem" class="kalem" />{{ s.etiket }}</span>
        <span v-if="s.aciklama" class="s-aciklama">{{ s.aciklama }}</span>
        <span v-if="s.ornek" class="s-ornek">{{ s.ornek }}</span>
      </button>
    </div>

    <!-- Diğer (Kendim Yazacağım): yazı + eşleştirme önerisi -->
    <div v-if="soru.tip === 'secim' && soru.digerYaz && digerAcik" class="diger">
      <div class="diger-ust">
        <AppIcon name="kalem" class="diger-ikon" />
        <div><strong>{{ DIGER_YAZ_METIN.baslik }}</strong><p>{{ DIGER_YAZ_METIN.aciklama }}</p></div>
      </div>
      <div class="diger-girdi">
        <input v-model="yazi" type="text" :aria-label="DIGER_YAZ_METIN.baslik" autofocus>
        <button v-if="yazi" type="button" class="temizle" aria-label="Temizle" @click="yazi = ''"><AppIcon name="close" /></button>
      </div>
      <template v-if="yaziTemiz.length >= 3">
        <div v-if="oneriler.length" class="oneri">
          <div class="oneri-ust"><AppIcon name="isilti" class="isilti" /><div><strong>{{ DIGER_YAZ_METIN.oneriBaslik }}</strong><p>{{ DIGER_YAZ_METIN.oneriAciklama }}</p></div></div>
          <button v-for="e in oneriler" :key="`${e.sinif}-${e.tur}`" type="button" class="oneri-kart" :class="{ pasif: !tiklanir(e) }" @click="oneriSec(e)">
            <span><small>{{ DIGER_YAZ_METIN.onerilen }}</small><strong>{{ eslesmeEtiketi(e) }}</strong></span>
            <span v-if="tiklanir(e)" class="devam">Devam Et <AppIcon name="arrow" /></span>
          </button>
          <div v-if="sinifOnerisi" class="elle-satir">
            <label class="elle">Tanımlı türlerden birini seçin
              <select v-model="elleTur">
                <option value="">Seçin</option>
                <option v-for="o in tanimliTurler" :key="o.deger" :value="o.deger">{{ o.etiket }}</option>
              </select>
            </label>
            <button type="button" class="btn gold-btn" :disabled="!elleTur" @click="elleSec">Devam Et <AppIcon name="arrow" class="ico" /></button>
          </div>
        </div>
        <!-- Eşleşme yoksa devam edilemez (kullanıcı kararı, 17 Ekim): listeden seçilir ya da tanınan bir ad yazılır -->
        <!-- Eşleşme yoksa kullanıcı tanımlı türlerden birini seçer (kullanıcı kararı, 17 Ekim); seçmeden devam edilemez -->
        <div v-else class="oneri yok">
          <p><strong>Eşleştirme yapılamadı</strong></p>
          <label class="elle">Tanımlı türlerden birini seçin
            <select v-model="elleTur">
              <option value="">Seçin</option>
              <option v-for="o in tanimliTurler" :key="o.deger" :value="o.deger">{{ o.etiket }}</option>
            </select>
          </label>
          <button type="button" class="btn gold-btn" :disabled="!elleTur" @click="elleSec">Devam Et <AppIcon name="arrow" class="ico" /></button>
        </div>
      </template>
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
      <button v-for="e in soru.eylemler" :key="e.etiket" type="button" class="btn" :class="e.tip === 'sayfa' ? 'analiz-btn' : 'gold-btn'" @click="emit('eylem', e)">{{ e.etiket }} <AppIcon name="arrow" class="ico" /></button>
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
.tanim { margin-top: 16px; padding: 16px 18px; background: var(--paper); border-left: 3px solid var(--vurgu); border-radius: 6px; display: flex; flex-direction: column; gap: 10px; font-size: 15.5px; color: var(--ink); }
.tanim p { margin: 0; }
.tanim strong { font-family: var(--font-head); color: var(--navy); }
/* Site Yönetimi'ne geçiş: sonuç ekranındaki ana buton gibi (lacivert zemin, altın yazı) */
.analiz-btn { flex: 1 0 100%; justify-content: center; min-height: 62px; background: var(--navy); border-color: var(--navy); color: var(--gold-2); font-size: clamp(16px, 1.6vw, 21px); }
.analiz-btn:hover { background: var(--navy-2); border-color: var(--navy-2); color: var(--gold-2); }
/* Diğer (Kendim Yazacağım) */
.secenek.kendim .s-etiket { display: flex; align-items: center; gap: 8px; }
.kalem { width: 20px; height: 20px; color: var(--gold); }
.diger { margin-top: 14px; padding: 16px; border: 1.5px solid var(--gold); border-radius: 10px; background: #fffbf2; display: flex; flex-direction: column; gap: 12px; }
.diger-ust { display: flex; gap: 12px; align-items: flex-start; }
.diger-ust strong, .oneri-ust strong { font-family: var(--font-head); font-size: 18px; color: var(--navy); }
.diger-ust p, .oneri-ust p { margin-top: 2px; font-size: 14.5px; color: var(--muted); }
.diger-ikon { width: 26px; height: 26px; color: var(--navy); flex: none; }
.diger-girdi { position: relative; }
.diger-girdi input { width: 100%; min-height: 50px; padding: 0 44px 0 14px; border: 1.5px solid var(--gold); border-radius: 8px; font: inherit; font-size: 17px; background: #fff; }
.temizle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 26px; height: 26px; display: grid; place-items: center; border: 0; border-radius: 50%; background: #e6e1d6; cursor: pointer; }
.temizle svg { width: 14px; height: 14px; }
.oneri { padding: 14px; border-radius: 10px; background: #f6f4ef; display: flex; flex-direction: column; gap: 10px; }
.oneri-ust { display: flex; gap: 12px; align-items: flex-start; }
.isilti { width: 26px; height: 26px; color: var(--gold); flex: none; }
.oneri-kart { display: flex; justify-content: space-between; align-items: center; gap: 12px; text-align: left; padding: 12px 14px; border: 1px solid #ecd9a8; border-radius: 10px; background: #fff7e3; cursor: pointer; font: inherit; }
.oneri-kart:hover { border-color: var(--gold); }
.oneri-kart.pasif { cursor: default; }
.oneri-kart.pasif:hover { border-color: #ecd9a8; }
.elle-satir { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
.oneri-kart small { display: block; font-size: 12.5px; color: var(--muted); }
.oneri-kart strong { font-family: var(--font-head); font-size: 17px; color: var(--navy); }
.oneri-kart .devam { display: inline-flex; align-items: center; gap: 6px; flex: none; font-family: var(--font-head); font-weight: 700; color: var(--gold); }
.oneri-kart .devam svg { width: 18px; height: 18px; }
.oneri.yok { flex-direction: row; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; }
.oneri.yok p { flex-basis: 100%; }
.elle { flex: 1 1 260px; display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--navy); }
.elle select { min-height: 46px; padding: 0 12px; border: 1.5px solid var(--border); border-radius: 8px; font: inherit; font-weight: 400; background: #fff; }
.ust-kutu { margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.ust-kutu strong { font-family: var(--font-head); font-size: 20px; color: var(--navy); }
.ust-kutu p { margin-top: 6px; font-size: 15px; color: var(--muted); }
.liste { margin-top: 16px; padding: 16px 20px; background: var(--paper); border-left: 3px solid var(--gold); border-radius: 6px; }
/* Ek-1 C / B / A ekranları (Düzeltme 06: yazılar daha büyük) */
.liste strong { font-family: var(--font-head); font-size: 19px; color: var(--navy); }
.liste ul { margin: 10px 0 0; padding-left: 20px; font-size: 17px; line-height: 1.55; }
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
