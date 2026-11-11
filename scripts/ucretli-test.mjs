// ÜCRETLİ ANALİZE GİRİŞ — kabul testleri. Çalıştır: node scripts/ucretli-test.mjs
// 1) Oğuz'un paketindeki run_tests.mjs aynen (176 tekli seçim, 15.399 ikili kombinasyon, 7 senaryo), projedeki kopyalar üzerinde.
// 2) Eşleme katmanı (data/ucretliEsleme.ts): her ücretsiz tür seçeneği geçerli bir katalog kaydına gider; birebir olmayanlar genel kayda.
// 3) Ücretsiz motordan (utils/onDegerlendirmeMotoru.ts) gelen gerçekçi, tamamlanmış değerlendirmeler eşleme + motor üzerinden.
// shortcut: TS dosyaları nuxt'un bağımlılığı jiti ile yüklenir (doğrudan bağımlılık değil); nuxt sürümü değişip jiti kalkarsa ekle.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const kok = fileURLToPath(new URL('..', import.meta.url))
const jiti = createJiti(import.meta.url, { alias: { '~': kok }, fsCache: false })
const { selectPaidEntry } = await jiti.import('~/utils/ucretliGiris.ts')
const { ucretliGirdi, BIREBIR_DEGIL } = await jiti.import('~/data/ucretliEsleme.ts')
const { hesapla, mevcutSoru } = await jiti.import('~/utils/onDegerlendirmeMotoru.ts')
const V = await jiti.import('~/data/onDegerlendirme.ts')
const { HAVUZ_ESLEME: HE } = await jiti.import('~/utils/soruSecimi.ts')
const registry = JSON.parse(fs.readFileSync(new URL('../data/ucretliKatalog.json', import.meta.url), 'utf8'))
const oku = (yol) => fs.readFileSync(new URL(`../${yol}`, import.meta.url), 'utf8')

// Paketteki ORNEK_TEST_GIRDILERI.json (yıllar temsilî test verisidir, resmî periyot değildir)
const cases = [
  { id: 'fabrika', name: 'Fabrika + Genel Büro', data: { primaryId: '06-X-001', secondaryIds: ['04-X-004'], building: { relation: 'same_building', floorCount: 7, constructionAreaM2: '≤ 1.000 (kullanıcı beyanı)' }, periodResult: { source: 'existing_free_calculator', years: 3, driverSelectionId: '06-X-001', driverText: 'Endüstri: Tehlike sınıfı yüksek tehlikeli' } } },
  { id: 'otopark', name: 'Kapalı Otopark + Konut (temsili süre)', data: { primaryId: '08-X-012', secondaryIds: ['01-X-015'], building: { relation: 'same_building', reportedHeightM: 30.5 }, periodResult: { source: 'existing_free_calculator', years: 4, driverSelectionId: '01-X-015', driverText: 'Konut — yalnız arayüz örneği; gerçek süre değil' } } },
  { id: 'dis', name: 'Diş Hekimi + Plaza (süre yok)', data: { primaryId: '04-X-016', secondaryIds: ['04-X-006'], building: { relation: 'same_building', reportedHeightM: 21 } } },
  { id: 'otel', name: 'Otel + Restoran + Otopark', data: { primaryId: '02-X-001', secondaryIds: ['07-X-001', '08-X-012'], building: { relation: 'same_building' } } },
  { id: 'site', name: 'Site Yönetimi + Market + Otopark', data: { primaryId: '01-X-005-YONETIM', secondaryIds: ['05-X-003', '08-X-012'], building: { relation: 'same_campus' } } },
  { id: 'lpg', name: 'LPG tesis + gaz + dolum', data: { primaryId: '09-B-002', secondaryIds: ['09-A-001', '09-C-005'], building: { relation: 'same_building' } } },
  { id: 'ayri', name: 'Otopark + ayrı fabrika (süre yok)', data: { primaryId: '08-X-012', secondaryIds: ['06-X-001'], building: { relation: 'separate_buildings' } } }
]

const results = []
const pass = (desc, fn) => { try { fn(); results.push({ test: desc, status: 'PASS' }) } catch (e) { results.push({ test: desc, status: 'FAIL', reason: e.message }) } }

// ── 1) Paketteki testler (run_tests.mjs) ──────────────────────────────────────
pass('176 paket ve 9 ana grup', () => { assert.equal(registry.entries.length, 176); const groups = new Set(registry.entries.map(x => x.group.slice(0, 2))); assert.equal(groups.size, 9) })
pass('Her alt türde 6 kart / 6 çıktı', () => { for (const p of registry.entries) { const x = selectPaidEntry({ primaryId: p.id, building: { relation: 'unknown' } }, registry); assert.equal(x.topics.length, 6, p.id); assert.equal(x.deliverables.length, 6, p.id); assert.equal(x.primaryUse.id, p.id) } })
pass('15.399 geçerli ikili kombinasyonda 6 kart ve seçimin korunması', () => { let count = 0; for (let i = 0; i < registry.entries.length; i++) { for (let j = i + 1; j < registry.entries.length; j++) { const a = registry.entries[i], b = registry.entries[j]; if (a.profile && b.profile && a.profile !== b.profile) continue; const x = selectPaidEntry({ primaryId: a.id, secondaryIds: [b.id], building: { relation: 'unknown' } }, registry); assert.equal(x.topics.length, 6); assert.equal(x.handoff.allSelectedIds.length, 2); assert.equal(x.primaryUse.id, a.id); count++ } } assert.equal(count, 15399) })
pass('Bütün esas kullanım türleri sonraki kullanım olarak da korunur', () => { for (let i = 0; i < registry.entries.length; i++) { const a = registry.entries[(i + 10) % registry.entries.length], b = registry.entries[i]; if (a.profile && b.profile && a.profile !== b.profile) continue; const x = selectPaidEntry({ primaryId: a.id, secondaryIds: [b.id], building: { relation: 'same_campus' } }, registry); assert.deepEqual(x.handoff.allSelectedIds, [a.id, b.id]) } })
for (const c of cases) { pass('Senaryo: ' + c.name, () => { const x = selectPaidEntry(c.data, registry); assert.equal(x.primaryUse.id, c.data.primaryId); assert.equal(x.topics.length, 6); assert.equal(x.topics[0].sourceIds[0], c.data.primaryId); assert.deepEqual(x.handoff.allSelectedIds, [c.data.primaryId, ...new Set(c.data.secondaryIds || [])]); assert.equal(new Set(x.topics.map(t => t.id)).size, 6); assert.equal(x.deliverables.length, 6) }) }
pass('Fabrika ana, büro yan, 3 yıl olduğu gibi aktar', () => { const x = selectPaidEntry(cases.find(x => x.id === 'fabrika').data, registry); assert.equal(x.periodCard.years, 3); assert.equal(x.periodCard.determiningUseId, '06-X-001'); assert(x.topics.some(t => t.title.includes('Genel büro'))) })
pass('Otopark ana, süreyi ikincil konut belirleyebilir', () => { const x = selectPaidEntry(cases.find(x => x.id === 'otopark').data, registry); assert.equal(x.primaryUse.id, '08-X-012'); assert.equal(x.periodCard.determiningUseId, '01-X-015'); assert.equal(x.periodCard.years, 4) })
pass('Tanımsız periyotta süre uydurma', () => { const x = selectPaidEntry(cases.find(x => x.id === 'dis').data, registry); assert.equal(x.periodCard.years, null) })
pass('Bilinmeyen bina ilişkisi SAME_BUILDING varsayılmaz', () => { const x = selectPaidEntry({ primaryId: '06-X-001', secondaryIds: ['04-X-004'], building: { relation: 'unknown' } }, registry); assert(x.warnings.some(x => x.includes('doğrulanmadı'))); assert(x.scope.some(x => x.detail.includes('henüz doğrulanmamış'))) })
pass('09-A/B/C 3 bina değildir', () => { const x = selectPaidEntry(cases.find(x => x.id === 'lpg').data, registry); assert.equal(x.secondaryUses.length, 0); assert.equal(x.hazardDimensions.length, 2); assert(x.scope.some(x => x.id === 'hazards')) })
pass('Site sakinleri/yönetimi ayrı', () => { assert.throws(() => selectPaidEntry({ primaryId: '01-X-005-SAKIN', secondaryIds: ['01-X-005-YONETIM'] }, registry)) })
pass('Fiyat verilmediyse 2490 uydurulmaz', () => { const x = selectPaidEntry(cases[0].data, registry); assert.equal(x.price.status, 'pending') })
pass('Geçersiz fiyat konfigürasyonu yayınlanmaz', () => { const x = selectPaidEntry({ ...cases[0].data, priceConfig: { status: 'configured', amount: '2490' } }, registry); assert.equal(x.price.status, 'pending') })
pass('Yan kullanımlar periyot kartında ikinci periyot olarak listelenmez', () => { const x = selectPaidEntry(cases[0].data, registry); assert(!Object.keys(x.periodCard).includes('secondaryPeriod')) })
pass('Kullanıcı ilk seçimini değiştirince ayrıntı sabit kalmaz', () => { const x = selectPaidEntry({ primaryId: '02-X-010', secondaryIds: [] }, registry); assert(x.headline.includes('Öğrenci yurdu')); assert(x.topics[0].title.includes('Yatakhane')) })

// ── 2) Eşleme tablosu ─────────────────────────────────────────────────────────
const katalog = new Map(registry.entries.map(e => [e.id, e]))
const TUR_LISTESI = {
  konut: [...V.KONUT_ALT_TURU.mustakil.map(o => ['mustakil', o]), ...V.KONUT_ALT_TURU.apartman.map(o => ['apartman', o])],
  konaklama: V.KONAKLAMA_TURU, kurumsal: V.KURUMSAL_TURU, buro: V.BURO_TURU, ticaret: V.TICARET_TURU,
  endustri: V.END_TURU, toplanma: V.TOPLANMA_TURU, depolama: V.DEPO_TURU
}
const TUR_ID = { konaklama: 'konaklamaTuru', kurumsal: 'kurumsalTuru', buro: 'buroTuru', ticaret: 'ticaretTuru', endustri: 'endTuru', toplanma: 'toplanmaTuru', depolama: 'depoTuru' }
// Tek bir tür cevabından eksik değerlendirme (hesapla eksik cevapla da çalışır; esas kullanım satırı hep vardır)
const turCevabi = (s, o, p = '') => s === 'konut' ? { [`${p}konutTuru`]: o[0], [`${p}konutAltTuru`]: o[1].deger } : { [`${p}${TUR_ID[s]}`]: o.deger ?? o }
const beklenen = (s, deger) => (BIREBIR_DEGIL[s]?.includes(deger) || !HE.esleme[s]?.[deger]) ? HE.diger[s] : HE.esleme[s][deger]

pass('Tablodaki her kimlik katalogda var', () => {
  const tum = [...Object.values(HE.esleme).flatMap(Object.values), ...Object.values(HE.diger), ...Object.values(HE.yuksek).flatMap(Object.values), ...Object.values(HE.site)]
  for (const id of tum) assert(katalog.has(id), id)
})
pass('Birebir olmayan seçenekler gerçekten ücretsiz listede var', () => {
  for (const [s, l] of Object.entries(BIREBIR_DEGIL)) for (const v of l) assert(TUR_LISTESI[s].some(o => (o.deger ?? o[1].deger) === v), `${s}.${v}`)
})
pass('Her ücretsiz tür (esas kullanım) doğru katalog kaydına gider; 6 kart / 6 çıktı', () => {
  for (const [s, liste] of Object.entries(TUR_LISTESI)) {
    for (const o of [...liste, ...(s === 'konut' ? [] : [{ deger: 'kendim' }])]) {
      const deger = o.deger ?? o[1].deger
      const d = { esas: s, c: turCevabi(s, o) }
      const g = ucretliGirdi(d, hesapla(d))
      assert.equal(g.primaryId, beklenen(s, deger), `${s}.${deger}`)
      const x = selectPaidEntry(g, registry)
      assert.equal(x.topics.length, 6); assert.equal(x.deliverables.length, 6)
    }
  }
})
pass('Her ücretsiz tür diğer kullanım olarak da (d_ / d2_ ön ekiyle) aynı kayda gider', () => {
  for (const [s, liste] of Object.entries(TUR_LISTESI)) {
    const esas = s === 'buro' ? 'ticaret' : 'buro'
    for (const o of liste) {
      const deger = o.deger ?? o[1].deger
      const d = { esas, c: { digerVar: 'evet', diger_1: 'konaklama', d_konaklamaTuru: 'otel', iliski_konaklama: 'ayni', digerDaha_1: 'evet', diger_2: s, ...turCevabi(s, o, 'd2_'), [`iliski2_${s}`]: 'ayni' } }
      if (s === 'konaklama') { d.c.diger_1 = 'konut'; delete d.c.d_konaklamaTuru; Object.assign(d.c, { d_konutTuru: 'apartman', d_konutAltTuru: 'a1', iliski_konut: 'ayni' }) }
      const g = ucretliGirdi(d, hesapla(d))
      assert.equal(g.secondaryIds.at(-1), beklenen(s, deger), `${s}.${deger}`)
    }
  }
})
pass('Yüksek tehlikeli: her tesis ana kayıt, madde ve işlemler aynı tesisin boyutu', () => {
  for (const t of V.YH_TESIS) for (const m of V.YH_MADDE) {
    const d = { esas: 'yuksek', c: { yhFaaliyetler: { madde: [m.deger], tesis: [t.deger], islem: V.YH_ISLEM.map(i => i.deger) }, yhIliski: 'esas', digerVar: 'hayir' } }
    const g = ucretliGirdi(d, hesapla(d))
    assert.equal(g.primaryId, HE.yuksek.tesis[t.deger])
    assert.deepEqual(g.secondaryIds, [HE.yuksek.madde[m.deger], ...V.YH_ISLEM.map(i => HE.yuksek.islem[i.deger])])
    const x = selectPaidEntry(g, registry)
    assert.equal(x.secondaryUses.length, 0); assert.equal(x.hazardDimensions.length, 9)
  }
})

// ── 3) Ücretsiz motordan gerçekçi, tamamlanmış değerlendirmeler ──────────────
const gercek = (ad, d, kontrol) => pass('Ücretsiz akış: ' + ad, () => {
  assert.equal(mevcutSoru(d), null, 'değerlendirme tamamlanmış olmalı (cevapsız soru kalmamalı)')
  const sonuc = hesapla(d)
  const g = ucretliGirdi(d, sonuc)
  const x = selectPaidEntry(g, registry)
  assert.equal(x.topics.length, 6); assert.equal(x.deliverables.length, 6)
  assert.equal(x.primaryUse.id, g.primaryId)
  // Periyot aynen: motorun süresi (ya da yokluğu) karta değişmeden yansır
  assert.equal(g.periodResult.years, sonuc.nihai)
  assert.equal(x.periodCard.years, sonuc.nihai)
  assert.deepEqual(Object.keys(x.periodCard).sort(), ['determiningUseId', 'driver', 'label', 'source', 'years'])
  assert.equal(x.handoff.originalFreeForm, d)
  kontrol(g, x, sonuc)
})
gercek('Fabrika + aynı yapıda Genel Büro (3 yıl, endüstri belirler)', { esas: 'endustri', c: { endTuru: 'e1', endTehlike: 'yuksek', digerVar: 'evet', diger_1: 'buro', d_buroTuru: 'b4', iliski_buro: 'ayni', digerDaha_1: 'hayir', alan: 'le_1000' } }, (g, x) => {
  assert.equal(g.primaryId, '06-X-001'); assert.deepEqual(g.secondaryIds, ['04-X-004']); assert.equal(g.building.relation, 'same_building')
  assert.equal(x.periodCard.label, '3 YIL'); assert.equal(x.periodCard.determiningUseId, '06-X-001')
  assert.equal(x.periodCard.driver, 'Endüstri: Tehlike sınıfı: yüksek tehlikeli')
  assert.equal(x.headline, 'Fabrikanızın Periyodik Yangın Kontrolüne Hazırlık Analizi')
  assert.equal(x.topics[4].title, 'İlgili kullanım: Genel büro'); assert.equal(x.topics[5].title, 'Ortak bina sistemleri')
  assert(!x.periodCard.driver.includes('5'), 'büronun 5 yılı periyot kartına girmez')
})
gercek('Lojistik deposu + konut: süreyi yan kullanım (konut) belirler, başlık depoda kalır (Lojistik / Dağıtım birebir değil → genel depolama kaydı)', { esas: 'depolama', c: { depoTuru: 'lojistik', depoYer: 'bagimsiz', depoTehlike: 'dusuk', depoDayanak: 'belge', depoBelge: 'YP-2026/041', digerVar: 'evet', diger_1: 'konut', d_konutTuru: 'apartman', d_konutAltTuru: 'a3', digerDaha_1: 'hayir', yukseklik: 'ge_51_50' } }, (g, x) => {
  assert.equal(g.primaryId, '08-X-016', 'Lojistik / Dağıtım Deposu birebir değil (08-X-003 / 004) → genel kayıt'); assert.deepEqual(g.secondaryIds, ['01-X-015'])
  assert.equal(g.building.relation, 'same_building', 'tek seçenek kaldığı için motor ilişkiyi "aynı yapı" kabul eder (soru sorulmaz)')
  assert.equal(x.periodCard.years, 4); assert.equal(x.periodCard.determiningUseId, '01-X-015')
  assert.equal(x.periodCard.driver, 'Konut: Yapı yüksekliği: 51,50 metre ve üzeri')
  assert(x.headline.startsWith('Diğer depolama tesisi'), x.headline); assert.equal(x.topics[0].sourceIds[0], '08-X-016')
})
gercek('Otel + bağımsız restoran + yardımcı otopark (iki belirleyici, ikisi de 4 yıl)', { esas: 'konaklama', c: { konaklamaTuru: 'otel', oda: 'gt_25', digerVar: 'evet', diger_1: 'toplanma', d_toplanmaTuru: 'restoran', iliski_toplanma: 'ayni', d_toplanmaAlani: 120, digerDaha_1: 'evet', diger_2: 'depolama', d2_depoTuru: 'otopark', iliski2_depolama: 'yardimci', digerDaha_2: 'hayir', alan: 'gt_1000' } }, (g, x, sonuc) => {
  assert.equal(g.primaryId, '02-X-001'); assert.deepEqual(g.secondaryIds, ['07-X-001', '08-X-016'], 'Açık veya Kapalı Otopark birebir değil → genel kayıt')
  assert.equal(g.building.relation, 'same_building')
  assert.equal(sonuc.surucu.length, 2); assert.equal(x.periodCard.determiningUseId, '02-X-001')
  assert.equal(x.periodCard.driver.split('\n').length, 2)
  assert.equal(x.headline, 'Otelinizin Periyodik Yangın Kontrolüne Hazırlık Analizi'); assert.equal(x.handoff.allSelectedIds.length, 3)
})
gercek('LPG tesisi + parlayıcı gaz + dolum (tek tesisin boyutları)', { esas: 'yuksek', c: { yhFaaliyetler: { madde: ['gaz'], tesis: ['lpg_tesis'], islem: ['dolum'] }, yhIliski: 'esas', digerVar: 'hayir' } }, (g, x) => {
  assert.equal(g.primaryId, '09-B-002'); assert.deepEqual(g.secondaryIds, ['09-A-001', '09-C-005']); assert.equal(g.building.relation, 'unknown')
  assert.equal(x.secondaryUses.length, 0); assert.equal(x.hazardDimensions.length, 2); assert.equal(x.periodCard.years, 3)
  assert.equal(x.headline, 'LPG Tesisinizin Periyodik Yangın Kontrolüne Hazırlık Analizi')
})
gercek('Sitede oturan, 30,50 m altı (süre tanımsız: uydurulmaz)', { esas: 'konut', c: { konutTuru: 'site', siteKullanici: 'oturan', siteTuru: 's2', blokAdi: '', yukseklik: 'lt_30_50', digerVar: 'hayir' } }, (g, x) => {
  assert.equal(g.primaryId, '01-X-005-SAKIN'); assert.equal(g.periodResult.status, 'tanimsiz')
  assert.equal(x.periodCard.years, null); assert.equal(x.periodCard.source, 'missing'); assert.equal(x.handoff.siteProfile, 'resident')
})
gercek('Yerleşkedeki okul + ayrı yapıda depo (ortak sistem varsayılmaz)', { esas: 'kurumsal', c: { kurumsalTuru: 'okul', yerlesim: 'yerleske', blokAdi: 'A Blok', alan: 'le_1000', digerVar: 'evet', diger_1: 'depolama', d_depoTuru: 'depo', iliski_depolama: 'ayri', digerDaha_1: 'hayir' } }, (g, x) => {
  assert.equal(g.primaryId, '03-X-002'); assert.deepEqual(g.secondaryIds, ['08-X-001']); assert.equal(g.building.relation, 'separate_buildings')
  assert.equal(x.topics[5].title, 'Yapı bazında hazırlık'); assert(!x.topics.some(t => t.title.startsWith('Ortak')))
  assert(x.subtitle.includes('ayrı hazırlık kapsamlarında'))
})
gercek('Yerleşke: büro aynı yapıda, arşiv ayrı yapıda (karışık ilişki → doğrulanmamış)', { esas: 'kurumsal', c: { kurumsalTuru: 'okul', yerlesim: 'yerleske', blokAdi: '', alan: 'le_1000', digerVar: 'evet', diger_1: 'buro', d_buroTuru: 'b5', iliski_buro: 'ayni', digerDaha_1: 'evet', diger_2: 'depolama', d2_depoTuru: 'arsiv', iliski2_depolama: 'ayri', digerDaha_2: 'hayir' } }, (g, x) => {
  assert.equal(g.building.relation, 'unknown'); assert.deepEqual(g.secondaryIds, ['04-X-005', '08-X-010'])
  assert(x.warnings.some(w => w.includes('doğrulanmadı')))
})
gercek('Sitede yardımcı market (aynı yapı mı ayrı yapı mı belli değil → doğrulanmamış)', { esas: 'konut', c: { konutTuru: 'site', siteKullanici: 'oturan', siteTuru: 's1', blokAdi: '', yukseklik: '30_50_51_50', digerVar: 'evet', diger_1: 'ticaret', d_ticaretTuru: 'market', iliski_ticaret: 'yardimci', digerDaha_1: 'hayir' } }, (g, x) => {
  assert.equal(g.primaryId, '01-X-005-SAKIN'); assert.deepEqual(g.secondaryIds, ['05-X-003']); assert.equal(g.building.relation, 'unknown')
  assert.equal(x.periodCard.years, 5)
})
gercek('Doktor ve diş hekimi muayenehanesi (birebir değil → genel büro kaydı)', { esas: 'buro', c: { buroTuru: 'b14', alan: 'le_1000', digerVar: 'hayir' } }, (g, x) => {
  assert.equal(g.primaryId, '04-X-017'); assert.equal(x.periodCard.years, 5)
})
gercek('Türü bilinmeyen diğer kullanım (katalog kaydı uydurulmaz)', { esas: 'ticaret', c: { ticaretTuru: 'market', alan: 'gt_1000', digerVar: 'evet', diger_1: 'bilinmiyor', digerDaha_1: 'hayir' } }, (g, x) => {
  assert.equal(g.primaryId, '05-X-003'); assert.deepEqual(g.secondaryIds, []); assert.equal(g.building.relation, 'unknown')
  assert.equal(x.handoff.originalFreeForm.c.diger_1, 'bilinmiyor')
})
gercek('Kendim yazdım, eşleşmedi; tehlike sınıfı bulunamadı (süre belirlenemedi)', { esas: 'endustri', c: { endTuru: 'kendim', endTuru_yazi: 'Seramik atölyesi', endTuru_eslesme: 'yok', endTehlike: 'bilmiyorum', endProje: 'hayir', ek1C: 'hayir', ek1B: 'hayir', ek1A: 'hayir', digerVar: 'hayir' } }, (g, x) => {
  assert.equal(g.primaryId, '06-X-022'); assert.equal(g.periodResult.status, 'belirlenemedi'); assert.equal(x.periodCard.years, null)
})

// ── Sayfa ve bağlantı (metin düzeyinde) ──────────────────────────────────────
pass('Sayfada iki zorunlu bölüm var; çıkarılan bölüm ve "Diğer kullanım" satırı yok; fiyat koda yazılmamış', () => {
  const s = oku('pages/ucretli-analiz.vue')
  assert(s.includes('BU ANALİZDE NELER DEĞERLENDİRİLECEK?')); assert(s.includes('ANALİZ SONUNDA NE ALACAKSINIZ?'))
  assert(!/sizden neler istenecek/i.test(s)); assert(!/diğer kullanım/i.test(s)); assert(!/2[.]?490/.test(s))
  assert(s.includes("analiziBaslat('bina', vm.handoff)"))
})
pass('Sonuç ekranındaki düğme ücretli analiz sayfasına gider; rota yalnız tarayıcıda çizilir', () => {
  assert(oku('components/kontrol/SonucPaneli.vue').includes("navigateTo('/ucretli-analiz')"))
  assert(/'\/ucretli-analiz': \{ ssr: false \}/.test(oku('nuxt.config.ts')))
})

const failed = results.filter(x => x.status === 'FAIL')
console.log(JSON.stringify({ total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2))
if (failed.length) process.exit(1)
