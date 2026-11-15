<script setup lang="ts">
// Ücretli EK-6 analizi: ödenmiş bina siparişinin soru-cevap oturumu ve nihai sonucu. Sorular backend'den gelir
// (Ek6AnalysisService): yapı bilgileri → sistemler → kontrol soruları; kontrol soruları 12'şer gösterilir.
import { EK6_METIN as M, EK6_CEVAP, EK6_ALAN, type Ek6Durum, type Ek6Soru, type Ek6Madde } from '~/data/ek6Analiz'
import { hataMesaji } from '~/composables/useUyelik'

useSeoMeta({ title: M.baslik, robots: 'noindex' })

const SAYFA = 12
const route = useRoute()
const { uye, yukle, ek6Baslat, ek6Cevapla, ek6Tamamla } = useUyelik()
const durum = ref<Ek6Durum | null>(null)
const hata = ref('')
const gonderiliyor = ref(false)
// Bu sayfadaki cevaplar: kod → değer (evet/hayır soruları ve sistemler true/false/null, sayılar number/null, kurallar metin)
const cevap = ref<Record<string, any>>({})
const sayiMetni = ref<Record<string, string>>({})

const sorular = computed<Ek6Soru[]>(() => (durum.value?.step === 'kurallar' ? durum.value.questions.slice(0, SAYFA) : durum.value?.questions ?? []))
const cevaplandi = (s: Ek6Soru) => s.code in cevap.value
const tamamMi = computed(() => sorular.value.every(cevaplandi))
const sonuc = computed(() => durum.value?.result ?? null)
watch(() => [durum.value?.step, durum.value?.questions.length], () => { cevap.value = {}; sayiMetni.value = {} })

const aralik = (r: NonNullable<Ek6Soru['known_range']>, birim?: string | null) => {
  const b = birim ? ` ${birim}` : ''
  if (r.min != null && r.max != null) return `${r.min}–${r.max}${b}`
  return r.min != null ? `${r.min}${b} üzeri` : `${r.max}${b} altı`
}
const sayiYaz = (s: Ek6Soru, v: string) => {
  sayiMetni.value[s.code] = v
  const n = Number(v.replace(',', '.'))
  if (v.trim() !== '' && Number.isFinite(n) && n >= 0) cevap.value[s.code] = n
  else delete cevap.value[s.code]
}
const bilmiyorum = (s: Ek6Soru) => { sayiMetni.value[s.code] = ''; cevap.value[s.code] = null }

const ac = async (is: () => Promise<Ek6Durum>) => {
  gonderiliyor.value = true; hata.value = ''
  try { durum.value = await is(); window.scrollTo({ top: 0, behavior: 'smooth' }) } catch (e) { hata.value = hataMesaji(e) } finally { gonderiliyor.value = false }
}
const gonder = () => {
  const d = durum.value!
  const alan = d.step === 'yapi' ? 'inputs' : d.step === 'sistemler' ? 'systems' : 'rules'
  return ac(() => ek6Cevapla(d.uuid, { [alan]: { ...cevap.value } }))
}
const tamamla = () => ac(() => ek6Tamamla(durum.value!.uuid))

onMounted(async () => {
  await yukle(true)
  if (!uye.value) return navigateTo(`/giris?devam=${encodeURIComponent(route.fullPath)}`, { replace: true })
  await ac(() => ek6Baslat(String(route.params.oid)))
})

const NOT_METNI = (n: string) => (M.notlar as Record<string, string>)[n] ?? n
const maddeBaslik = (m: Ek6Madde) => (m.kind === 'sistem' ? `${M.zorunluSistem}: ${m.name}` : m.question)
// Başlık niteliğindeki kısa EK-6 metni ("Taşınabilir Yangın Söndürücü.") soruyu tekrar eder; gösterilmez.
const hukumMetni = (m: Ek6Madde) => ((m.criterion ?? '').split(/\s+/).length >= 6 ? m.criterion : '')
</script>

<template>
  <section class="section sayfa">
    <div class="wrap dar">
      <SectionTag :label="M.baslik" />
      <ClientOnly>
        <p v-if="durum?.is_test || sonuc?.is_test" class="test" role="note">{{ M.testUyari }}</p>
        <p v-if="hata" class="hata" role="alert">{{ hata }}</p>
        <p v-if="!durum && !hata" class="muted">Yükleniyor…</p>

        <template v-if="durum && !sonuc">
          <ol class="adimlar" aria-label="Adımlar">
            <li v-for="(ad, k) in M.adimlar" :key="k" :class="{ aktif: durum.step === k }">{{ ad }}</li>
          </ol>

          <div v-if="durum.step === 'tamam'" class="card kutu">
            <p>{{ M.hazir }}</p>
            <button type="button" class="btn" :disabled="gonderiliyor" @click="tamamla">{{ M.tamamla }}</button>
          </div>

          <template v-else>
            <p class="muted aciklama">{{ durum.step === 'yapi' ? M.yapiAciklama : durum.step === 'sistemler' ? M.sistemAciklama : M.kuralAciklama }}</p>
            <p v-if="durum.step === 'kurallar'" class="kalan">{{ M.kalanSoru(durum.questions.length) }}</p>
            <ul class="sorular">
              <li v-for="s in sorular" :key="s.code" class="card soru" :class="{ bitti: cevaplandi(s) }">
                <p v-if="s.domain" class="alan">{{ EK6_ALAN[s.domain] ?? s.domain }}</p>
                <p class="metin">{{ s.question }}<span v-if="s.draft && durum.is_test" class="taslak">taslak</span></p>
                <p v-if="s.explanation" class="muted kucuk">{{ s.explanation }}</p>
                <p v-if="s.known_range" class="muted kucuk">{{ M.bilinenAralik }}: {{ aralik(s.known_range, s.unit) }}</p>

                <div v-if="s.type === 'sayi'" class="secenekler">
                  <label class="sayi">
                    <input type="text" inputmode="decimal" :value="sayiMetni[s.code] ?? ''" :aria-label="s.question" @input="sayiYaz(s, ($event.target as HTMLInputElement).value)">
                    <span v-if="s.unit">{{ s.unit }}</span>
                  </label>
                  <button type="button" class="secenek" :class="{ secili: cevap[s.code] === null }" @click="bilmiyorum(s)">{{ M.bilmiyorum }}</button>
                </div>
                <div v-else-if="s.options" class="secenekler" role="radiogroup" :aria-label="s.question">
                  <button v-for="o in s.options" :key="o" type="button" role="radio" class="secenek" :aria-checked="cevap[s.code] === o" :class="{ secili: cevap[s.code] === o }" @click="cevap[s.code] = o">{{ EK6_CEVAP[o] }}</button>
                </div>
                <div v-else class="secenekler" role="radiogroup" :aria-label="s.question">
                  <button v-for="o in [true, false, null]" :key="String(o)" type="button" role="radio" class="secenek" :aria-checked="s.code in cevap && cevap[s.code] === o" :class="{ secili: s.code in cevap && cevap[s.code] === o }" @click="cevap[s.code] = o">{{ o === true ? 'Evet' : o === false ? 'Hayır' : M.bilmiyorum }}</button>
                </div>
              </li>
            </ul>
            <button type="button" class="btn devam" :disabled="!tamamMi || gonderiliyor" @click="gonder">{{ M.devam }}</button>
          </template>
        </template>

        <template v-if="sonuc">
          <div class="card hazirlik">
            <p class="etiket">{{ M.hazirlikBaslik }}</p>
            <p v-if="sonuc.readiness !== null" class="yuzde">%{{ sonuc.readiness }}</p>
            <p v-else class="muted">{{ M.hazirlikYok }}</p>
            <dl class="sayim">
              <div v-for="(n, k) in sonuc.counts" :key="k"><dt>{{ EK6_CEVAP[k] }}</dt><dd>{{ n }}</dd></div>
            </dl>
          </div>

          <section v-if="sonuc.action_items.length" class="blok">
            <h2>{{ M.yapilacaklar }}</h2>
            <ol class="maddeler">
              <li v-for="m in sonuc.action_items" :key="m.code" class="card madde">
                <p class="metin">{{ maddeBaslik(m) }}</p>
                <p v-if="hukumMetni(m)" class="muted kucuk">{{ hukumMetni(m) }}</p>
                <p v-if="m.legal_refs" class="kucuk"><strong>{{ M.dayanak }}:</strong> {{ m.legal_refs }}</p>
              </li>
            </ol>
          </section>

          <section v-if="sonuc.unknowns.length" class="blok">
            <h2>{{ M.bilinmeyenler }}</h2>
            <ul class="maddeler"><li v-for="m in sonuc.unknowns" :key="m.code" class="card madde"><p class="metin">{{ maddeBaslik(m) }}</p></li></ul>
          </section>

          <section v-if="sonuc.requirement_verification.length" class="blok">
            <h2>{{ M.dogrulama }}</h2>
            <ul class="maddeler">
              <li v-for="v in sonuc.requirement_verification" :key="v.code" class="card madde">
                <p class="metin">{{ v.name }}</p>
                <p class="muted kucuk">{{ v.notes.length ? v.notes.map(NOT_METNI).join(' ') : M.notlar.eksikBilgi }}</p>
              </li>
            </ul>
          </section>

          <section v-if="sonuc.not_applicable.length" class="blok">
            <h2>{{ M.uygulanmiyor }}</h2>
            <ul class="maddeler"><li v-for="m in sonuc.not_applicable" :key="m.code" class="card madde"><p class="metin">{{ maddeBaslik(m) }}</p></li></ul>
          </section>

          <section v-if="sonuc.documents.length" class="blok">
            <h2>{{ M.belgeler }}</h2>
            <ul class="card belgeler"><li v-for="b in sonuc.documents" :key="b">{{ b }}</li></ul>
          </section>

          <details v-if="sonuc.ready.length" class="blok">
            <summary>{{ M.hazirMaddeler }} ({{ sonuc.ready.length }})</summary>
            <ul class="maddeler"><li v-for="m in sonuc.ready" :key="m.code" class="madde"><p class="metin">{{ maddeBaslik(m) }}</p></li></ul>
          </details>

          <WarningBox class="blok">{{ M.uyari }}</WarningBox>
        </template>

        <NuxtLink to="/hesabim/odemeler" class="btn ghost geri">{{ M.geri }}</NuxtLink>
      </ClientOnly>
    </div>
  </section>
</template>

<style scoped>
.sayfa { padding-top: 40px; }
.dar { max-width: 820px; }
.test { padding: 10px 14px; border-radius: 8px; background: #fff6e0; color: #7a5200; font-weight: 600; margin-bottom: 16px; }
.hata { padding: 10px 14px; border-radius: 8px; background: #fbeaea; color: var(--red); margin-bottom: 16px; }
.adimlar { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; margin: 8px 0 20px; }
.adimlar li { padding: 6px 12px; border-radius: 999px; background: var(--paper); color: var(--muted); font-size: 14px; }
.adimlar li.aktif { background: var(--navy); color: var(--gold-2); font-weight: 600; }
.aciklama { margin-bottom: 8px; }
.kalan { font-weight: 600; color: var(--navy); margin-bottom: 12px; }
.sorular, .maddeler { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.soru { display: flex; flex-direction: column; gap: 10px; }
.soru.bitti { border-color: var(--navy); }
.alan { font-size: 12.5px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
.metin { font-weight: 600; color: var(--ink); }
.taslak { margin-left: 8px; padding: 2px 8px; border-radius: 999px; background: var(--paper); color: var(--muted); font-size: 12px; font-weight: 500; }
.kucuk { font-size: 14px; }
.secenekler { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.secenek { min-height: 44px; padding: 0 16px; border: 1.5px solid var(--border); border-radius: 6px; background: var(--card); color: var(--navy); font: inherit; font-weight: 600; cursor: pointer; }
.secenek.secili { background: var(--navy); border-color: var(--navy); color: #fff; }
.sayi { display: inline-flex; align-items: center; gap: 8px; }
.sayi input { width: 140px; min-height: 44px; padding: 0 12px; border: 1.5px solid var(--border); border-radius: 6px; font: inherit; }
.devam, .kutu .btn { margin-top: 20px; }
.kutu { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.hazirlik { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; }
.etiket { font-family: var(--font-head); font-size: 20px; color: var(--navy); }
.yuzde { font-family: var(--font-head); font-size: 64px; line-height: 1; color: var(--navy); }
.sayim { display: flex; flex-wrap: wrap; gap: 8px 24px; justify-content: center; margin: 8px 0 0; }
.sayim div { display: flex; gap: 6px; }
.sayim dt { color: var(--muted); }
.sayim dd { margin: 0; font-weight: 700; color: var(--navy); }
.blok { margin-top: 28px; }
.blok h2 { font-size: 22px; text-transform: none; margin-bottom: 12px; }
.madde { display: flex; flex-direction: column; gap: 6px; }
.belgeler { margin: 0; padding-left: 36px; display: flex; flex-direction: column; gap: 6px; }
details summary { cursor: pointer; font-family: var(--font-head); font-size: 20px; color: var(--navy); }
details .maddeler { margin-top: 12px; }
.geri { margin-top: 32px; }
</style>
