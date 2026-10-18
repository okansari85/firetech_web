<script setup lang="ts">
// Tek soru: büyük seçenek kartları (seçince ilerler), çoklu seçim, sayı veya metin girişi, bilgi / yönlendirme.
import type { Soru, Eylem } from '~/utils/onDegerlendirmeMotoru'
import { YARDIM, SINIFLAR, DIGER_YAZ_METIN } from '~/data/onDegerlendirme'
import { eslestir, eslesmeEtiketi, ALT_TURLER, type Eslesme } from '~/utils/eslestir'
import { yzEslestir, type YzSonuc } from '~/utils/yzEslestir'
import { TUR_IKON } from '~/data/turIkonlari'

const props = defineProps<{ soru: Soru; deger?: any }>()
const emit = defineEmits<{ cevap: [deger: any, ek?: Record<string, any>]; eylem: [e: Eylem] }>()

const coklu = ref<string[]>(Array.isArray(props.deger) ? [...props.deger] : [])
// gruplu (yüksek tehlikeli yerler): grup.coklu ise birden fazla, değilse bir şık (kullanıcı 18 Ekim 2026: 1-2 tek, 3 çoklu); cevap { [grup.id]: string[] }
const grupSecim = ref<Record<string, string[]>>(props.deger && typeof props.deger === 'object' && !Array.isArray(props.deger) ? JSON.parse(JSON.stringify(props.deger)) : {})
const grupToggle = (g: string, v: string, coklu?: boolean) => {
  const l = grupSecim.value[g] ?? []
  grupSecim.value = { ...grupSecim.value, [g]: l.includes(v) ? l.filter(x => x !== v) : coklu ? [...l, v] : [v] }
}
const grupIkon = (v: string) => (props.soru.sinif ? TUR_IKON[props.soru.sinif]?.[v] : undefined)
const grupTamam = computed(() => (props.soru.gruplar ?? []).every(g => (grupSecim.value[g.id] ?? []).length > 0))
const sayi = ref<string>(typeof props.deger === 'number' ? String(props.deger) : '')
const metin = ref<string>(typeof props.deger === 'string' ? props.deger : '')
const yardimAcik = ref(false)
watch(() => props.soru.id, () => { coklu.value = []; grupSecim.value = {}; sayi.value = ''; metin.value = ''; yardimAcik.value = false; digerAcik.value = false; yazi.value = '' })

// ── Diğer (Kendim Yazacağım) — Düzeltme 02 ──
const digerAcik = ref(props.deger === 'kendim')
const yazi = ref('')
const eslesmeler = computed(() => (yazi.value.trim().length >= 3 ? eslestir(yazi.value) : []))
// Bu sorunun sınıfındaki eşleşmeler; esas kullanımda başka sınıfa düşenler de önerilir (sınıf değiştirilir)
// Öneriler yalnız bu sorunun listesinden (kullanıcı kararı, 17 Ekim): başka sınıf önerilmez; eşleşme yoksa listeden seçilir
// Bu sınıftaki kural eşleşmeleri (yalnız bu listeden)
const kuralOnerileri = computed(() => eslesmeler.value.filter(e => e.sinif === props.soru.sinif && (props.soru.secenekler ?? []).some(o => o.deger === e.tur)))
// Başka sınıfa ait ise o sınıfa yönlendirilir (kullanıcı, 17 Ekim). Diğer kullanım sorularında (d_) yönlendirme yok.
const yonlendirilir = computed(() => !props.soru.id.startsWith('d_'))
const kuralYonlendirme = computed(() => (yonlendirilir.value ? eslesmeler.value.filter(e => e.sinif !== props.soru.sinif && e.tur) : []))
// Kurallar bulamazsa yapay zekâ; beklerken "analiz ediliyor"
const yzOneri = ref<YzSonuc>(null)
const yzDurum = ref<'bos' | 'bekliyor' | 'bitti'>('bos')
// Debounce: yazma bitince (1 sn duraksama) tek istek; yeni harfte bekleyen/giden istek iptal edilir
const YZ_BEKLEME = 1000
let yzZaman: ReturnType<typeof setTimeout> | undefined
let yzIptal: AbortController | undefined
watch(() => [yazi.value, kuralOnerileri.value.length + kuralYonlendirme.value.length] as const, ([y, n]) => {
  clearTimeout(yzZaman); yzIptal?.abort(); yzOneri.value = null
  const metin = (y as string).trim()
  if (n || metin.length < 3 || !props.soru.sinif) { yzDurum.value = 'bos'; return }
  yzDurum.value = 'bekliyor'
  yzZaman = setTimeout(async () => {
    const iptal = (yzIptal = new AbortController())
    const r = await yzEslestir(metin, props.soru.sinif!, (props.soru.secenekler ?? []).filter(o => o.deger !== 'kendim'), iptal.signal)
    if (iptal.signal.aborted || yazi.value.trim() !== metin) return
    yzOneri.value = r && (r.sinif === props.soru.sinif ? !!r.tur : yonlendirilir.value) ? r : null
    yzDurum.value = 'bitti'
  }, YZ_BEKLEME)
})
onBeforeUnmount(() => { clearTimeout(yzZaman); yzIptal?.abort() })
const oneriler = computed<Eslesme[]>(() =>
  kuralOnerileri.value.length ? kuralOnerileri.value
    : kuralYonlendirme.value.length ? kuralYonlendirme.value
    : yzOneri.value ? [{ ...yzOneri.value, terim: 'yz' }] : [])
const yaziTemiz = computed(() => yazi.value.trim())
const elleTur = ref('')
watch(yazi, () => { elleTur.value = '' })
const tanimliTurler = computed(() => (props.soru.secenekler ?? []).filter(o => o.deger !== 'kendim'))
const elleSec = () => emit('cevap', elleTur.value, { [`${props.soru.id}_yazi`]: yaziTemiz.value, [`${props.soru.id}_eslesme`]: 'elle' })
const TUR_ID: Partial<Record<string, string>> = { konaklama: 'konaklamaTuru', kurumsal: 'kurumsalTuru', buro: 'buroTuru', ticaret: 'ticaretTuru', endustri: 'endTuru', toplanma: 'toplanmaTuru', depolama: 'depoTuru', yuksek: 'yhFaaliyet' }
// Tür sorusunda seçeneklerin solunda ikon (Düzeltme 02 örnek ekranı); diğer kullanım (d_) tür sorularında da
const turIkon = computed(() => (props.soru.sinif && props.soru.id.replace(/^d_/, '') === TUR_ID[props.soru.sinif] ? TUR_IKON[props.soru.sinif] : undefined))
const oneriSec = (e: Eslesme) => {
  const ad = yaziTemiz.value
  if (e.sinif === props.soru.sinif) return emit('cevap', e.tur, { [`${props.soru.id}_yazi`]: ad, [`${props.soru.id}_eslesme`]: 'tur' })
  // Başka sınıf: o sınıfla devam; kategori bulunduysa seçili gelir, bulunamadıysa o sınıfın listesi sorulur (yazılan ad korunur)
  const id = TUR_ID[e.sinif]
  const ek = id ? (e.tur ? { [id]: e.tur, [`${id}_yazi`]: ad, [`${id}_eslesme`]: 'tur' } : { [`${id}_yazi`]: ad }) : { yaziAd: ad }
  emit('eylem', { etiket: '', tip: 'esas', sinif: e.sinif, ek })
}

const sayiDegeri = computed(() => { const n = parseFloat(sayi.value.replace(/\./g, '').replace(',', '.')); return isFinite(n) && n > 0 ? n : null })
const toggle = (v: string) => { coklu.value = coklu.value.includes(v) ? coklu.value.filter(x => x !== v) : [...coklu.value, v] }
const yardim = computed(() => (props.soru.yardim ? YARDIM[props.soru.yardim] : null))
const renk = computed(() => (props.soru.sinif ? SINIFLAR[props.soru.sinif].renk : 'var(--gold)'))
// Diğer kullanımın soruları (kullanıcı 18 Ekim 2026): başka bir bina türüne geçildiği ince kenarlıktan fark edilmiyordu; kartın
// üstünde o sınıfın renginde bant (sınıf fotoğrafı + adı) ve sınıf renginde çerçeve.
const FOTO_KOD: Record<string, string> = { konut: 'residential', konaklama: 'lodging', kurumsal: 'institutional', buro: 'office', ticaret: 'commercial', endustri: 'industrial', toplanma: 'assembly', depolama: 'storage', yuksek: 'high_hazard' }
const digerKullanim = computed(() => (props.soru.grup === 'diger' && props.soru.sinif ? { ad: SINIFLAR[props.soru.sinif].ad, foto: `/img/siniflar/${FOTO_KOD[props.soru.sinif]}-400.webp` } : null))
</script>

<template>
  <section class="soru card" :class="[soru.tip, { 'diger-kullanim': digerKullanim }]" :style="{ '--vurgu': renk }">
    <div v-if="digerKullanim" class="kullanim-bant">
      <img :src="digerKullanim.foto" alt="" width="52" height="52" />
      <span><small>Diğer kullanım</small><strong>{{ digerKullanim.ad }}</strong></span>
    </div>
    <div v-if="soru.ust" class="ust-kutu">
      <strong>{{ soru.ust.baslik }}</strong>
      <p v-if="soru.ust.aciklama">{{ soru.ust.aciklama }}</p>
    </div>
    <p v-if="soru.etiket" class="soru-etiket">{{ soru.etiket }}</p>
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
        <span class="s-etiket"><span v-if="s.deger === 'kendim'" class="ikon-kutu"><AppIcon name="kalem" /></span><span v-else-if="turIkon?.[s.deger]" class="ikon-kutu"><TurIkonu :name="turIkon[s.deger]!" /></span>{{ s.etiket }}</span>
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
          <button v-for="e in oneriler" :key="`${e.sinif}-${e.tur}`" type="button" class="oneri-kart" @click="oneriSec(e)">
            <span><small>{{ DIGER_YAZ_METIN.onerilen }}</small><strong>{{ eslesmeEtiketi(e) }}</strong></span>
            <span class="devam">Devam Et <AppIcon name="arrow" /></span>
          </button>
        </div>
        <!-- Eşleşme yoksa devam edilemez (kullanıcı kararı, 17 Ekim): listeden seçilir ya da tanınan bir ad yazılır -->
        <p v-else-if="yzDurum === 'bekliyor'" class="oneri bekliyor"><AppIcon name="isilti" class="isilti" /> Analiz ediliyor…</p>
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

    <!-- Gruplu çoklu seçim: tek ekranda birden fazla soru (yüksek tehlikeli yerler, kullanıcı 18 Ekim 2026) -->
    <template v-else-if="soru.tip === 'gruplu'">
      <div v-for="g in soru.gruplar" :key="g.id" class="grup-blok" :role="g.coklu ? 'group' : 'radiogroup'" :aria-label="g.baslik">
        <h3 class="grup-baslik">{{ g.baslik }}</h3>
        <div class="secenekler iki">
          <button v-for="s in g.secenekler" :key="s.deger" type="button" :role="g.coklu ? 'checkbox' : 'radio'" :aria-checked="(grupSecim[g.id] ?? []).includes(s.deger)" class="secenek" :class="{ secili: (grupSecim[g.id] ?? []).includes(s.deger) }" @click="grupToggle(g.id, s.deger, g.coklu)">
            <!-- Tesis / faaliyet türü: tür listelerindeki ikonlu tasarım; işaret kutusu sağda (kullanıcı 18 Ekim 2026) -->
            <!-- Tek seçimli sorular diğer sınıflardaki gibi: işaret kutusu yok, seçilen kart vurgulanır; tesis türünde ikon (kullanıcı 18 Ekim 2026) -->
            <span v-if="g.id === 'tesis' && grupIkon(s.deger)" class="s-etiket"><span class="ikon-kutu"><TurIkonu :name="grupIkon(s.deger)!" /></span>{{ s.etiket }}</span>
            <span v-else-if="!g.coklu" class="s-etiket">{{ s.etiket }}</span>
            <span v-else class="s-etiket"><span class="kutu"><AppIcon v-if="(grupSecim[g.id] ?? []).includes(s.deger)" name="check" /></span>{{ s.etiket }}</span>
          </button>
        </div>
      </div>
      <div class="alt">
        <span v-if="!grupTamam" class="grup-not">Her sorudan en az bir seçenek işaretleyin.</span>
        <button type="button" class="btn gold-btn" :disabled="!grupTamam" @click="emit('cevap', grupSecim)">Devam Et <AppIcon name="arrow" class="ico" /></button>
      </div>
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
.soru.diger-kullanim { border: 2px solid var(--vurgu); padding-top: 0; overflow: hidden; }
.kullanim-bant { display: flex; align-items: center; gap: 14px; margin: 0 -28px 24px; padding: 14px 28px; background: var(--vurgu); color: #fff; animation: bant-gir .45s ease; }
.kullanim-bant img { width: 52px; height: 52px; flex: none; object-fit: cover; border-radius: 50%; border: 2px solid rgba(255, 255, 255, .85); }
.kullanim-bant span { display: flex; flex-direction: column; gap: 2px; }
.kullanim-bant small { font-size: 12.5px; font-weight: 700; letter-spacing: .06em; opacity: .85; }
.kullanim-bant strong { font-family: var(--font-head); font-size: 22px; line-height: 1.15; }
@keyframes bant-gir { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
@media (max-width: 640px) { .kullanim-bant { margin: 0 -20px 20px; padding: 12px 20px; } .kullanim-bant strong { font-size: 19px; } }
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
/* İkon kutusu: sonuç panelindeki başlık ikonlarıyla birebir (.b-ikon; lacivert kare, açık altın ikon; kullanıcı 18 Ekim 2026) */
.ikon-kutu {
  display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: 10px;
  background: var(--navy); color: #f5d27e;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08);
}
.ikon-kutu svg { width: 24px; height: 24px; stroke-width: 2; }
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
.oneri-kart small { display: block; font-size: 12.5px; color: var(--muted); }
.oneri-kart strong { font-family: var(--font-head); font-size: 17px; color: var(--navy); }
.oneri-kart .devam { display: inline-flex; align-items: center; gap: 6px; flex: none; font-family: var(--font-head); font-weight: 700; color: var(--gold); }
.oneri-kart .devam svg { width: 18px; height: 18px; }
.oneri.bekliyor { flex-direction: row; align-items: center; gap: 10px; font-family: var(--font-head); font-weight: 700; color: var(--navy); }
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
.soru-etiket { margin: 0 0 6px; font-family: var(--font-head); font-size: 13px; font-weight: 600; color: var(--gold); text-transform: uppercase; letter-spacing: .4px; }
.grup-blok { margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--line, #e7e1d4); }
.grup-blok:first-of-type { border-top: 0; padding-top: 0; }
.grup-baslik { margin: 0 0 12px; font-family: var(--font-head); font-size: 19px; font-weight: 700; color: var(--navy); line-height: 1.25; }
.grup-not { margin-right: auto; font-size: 13.5px; color: var(--muted, #6b7280); }
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
