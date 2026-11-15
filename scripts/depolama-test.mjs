// DEPOLAMA R20 — kabul testleri. Çalıştır: node scripts/depolama-test.mjs
// Oğuz'un R20 sayfasındaki (Downloads\FIRETECH_Depolama_R20.html) dallar bizim cevap anahtarlarıyla ücretsiz motorda
// (utils/onDegerlendirmeMotoru.ts) koşulur: araç türleri, tank, bilinen tehlike sınıfı, malzeme hesabı, yönlendirmeler, diğer kullanım.
// shortcut: TS dosyaları nuxt'un bağımlılığı jiti ile yüklenir (scripts/ucretli-test.mjs ile aynı); jiti kalkarsa ekle.
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const kok = fileURLToPath(new URL('..', import.meta.url))
const jiti = createJiti(import.meta.url, { alias: { '~': kok }, fsCache: false })
const { akis, hesapla, mevcutSoru, depoTahmini } = await jiti.import('~/utils/onDegerlendirmeMotoru.ts')
const V = await jiti.import('~/data/onDegerlendirme.ts')
const M = V.DEPO_METIN

let gecen = 0, toplam = 0
const test = (ad, f) => { toplam++; try { f(); gecen++; console.log(`PASS ${ad}`) } catch (e) { console.log(`FAIL ${ad}: ${e.message}`) } }
const esas = c => ({ esas: 'depolama', c: { digerVar: 'hayir', ...c } })
const dep = d => hesapla(d).kullanimlar.find(k => k.sinif === 'depolama')
const sure = (c, yil, belirleyici, tahmini) => () => {
  const d = esas(c)
  assert.equal(mevcutSoru(d), null, `akış bitmedi: ${mevcutSoru(d)?.id}`)
  const k = dep(d)
  assert.equal(k.durum, 'gecerli'); assert.equal(k.periyot, yil); assert.equal(k.belirleyici, belirleyici); assert.equal(!!k.tahmini, !!tahmini)
}
const inceleme = (c, belirleyici) => () => {
  const d = esas(c)
  assert.equal(mevcutSoru(d), null); const k = dep(d)
  assert.equal(k.durum, 'inceleme'); assert.equal(k.periyot, null); assert.equal(k.belirleyici, belirleyici)
}
const yonlendir = (c, kontrol) => () => { const q = mevcutSoru(esas(c)); assert.equal(q?.id, 'yonlendirDepo'); kontrol(q.eylemler[0]) }

// ── Türler ────────────────────────────────────────────────────────────────────
test('16 tür, R20 sırasıyla', () => assert.deepEqual(V.DEPO_TURU.map(o => o.deger),
  ['depo', 'antrepo', 'lojistik', 'eticaret', 'hammadde', 'soguk_hava', 'silo', 'tank', 'arsiv', 'emanet', 'ahir', 'acik_saha', 'otopark', 'galeri', 'arac_muhafaza', 'taksi']))

// ── Araç kullanımları ─────────────────────────────────────────────────────────
test('Otopark: önce açık / kapalı sorulur', () => assert.equal(mevcutSoru(esas({ depoTuru: 'otopark' })).id, 'depoOtopark'))
test('Otopark otomobil → 4 yıl', sure({ depoTuru: 'otopark', depoOtopark: 'acik', depoArac: 'otomobil' }, 4, M.otoparkNormal))
test('Otopark otobüs + Ek-1/C özel → 3 yıl', sure({ depoTuru: 'otopark', depoOtopark: 'kapali', depoArac: 'otobus', depoAracNitelik: 'ozel' }, 3, M.ozelArac))
test('Otopark kamyon + normal → 4 yıl', sure({ depoTuru: 'otopark', depoOtopark: 'kapali', depoArac: 'agir', depoAracNitelik: 'normal' }, 4, M.normalArac))
test('Otopark karışık araç + özel → doğrulama', inceleme({ depoTuru: 'otopark', depoOtopark: 'acik', depoArac: 'diger', depoAracNitelik: 'ozel' }, M.aracDogrulanamadi))
test('Otopark karışık araç + normal → doğrulama', inceleme({ depoTuru: 'otopark', depoOtopark: 'acik', depoArac: 'diger', depoAracNitelik: 'normal' }, M.aracDogrulanamadi))
test('Otopark otobüs + emin değilim → doğrulama', inceleme({ depoTuru: 'otopark', depoOtopark: 'acik', depoArac: 'otobus', depoAracNitelik: 'bilmiyorum' }, M.aracDogrulanamadi))
test('Filo otomobil → 4 yıl, nitelik sorulmaz', () => {
  sure({ depoTuru: 'arac_muhafaza', depoArac: 'otomobil' }, 4, M.filoNormal)()
  assert.ok(!akis(esas({ depoTuru: 'arac_muhafaza', depoArac: 'otomobil' })).some(q => q.id === 'depoAracNitelik' || q.id === 'depoOtopark'))
})
test('Filo demiryolu: "normal" seçeneği yok; özel → 3 yıl', () => {
  const q = mevcutSoru(esas({ depoTuru: 'arac_muhafaza', depoArac: 'demiryolu' }))
  assert.equal(q.id, 'depoAracNitelik'); assert.deepEqual(q.secenekler.map(o => o.deger), ['ozel', 'bilmiyorum'])
  sure({ depoTuru: 'arac_muhafaza', depoArac: 'demiryolu', depoAracNitelik: 'ozel' }, 3, M.ozelArac)()
})
test('Oto galerisi sergi → kesin süre yok', inceleme({ depoTuru: 'galeri', depoArac: 'sergi' }, M.galeri))
test('Oto galerisi park → kesin süre yok', inceleme({ depoTuru: 'galeri', depoArac: 'park' }, M.galeri))
test('Kapalı taksi durağı → kesin süre yok', inceleme({ depoTuru: 'taksi', depoArac: 'taksi' }, M.taksi))
test('Galeri servis / tamirhane → Ticaret', yonlendir({ depoTuru: 'galeri', depoArac: 'servis' }, e => { assert.equal(e.tip, 'esas'); assert.equal(e.sinif, 'ticaret') }))
test('Taksi servis / tamirhane → Ticaret', yonlendir({ depoTuru: 'taksi', depoArac: 'servis' }, e => { assert.equal(e.tip, 'esas'); assert.equal(e.sinif, 'ticaret') }))
test('Araç türlerinde tehlike sınıfı sorulmaz', () => assert.ok(!akis(esas({ depoTuru: 'otopark', depoOtopark: 'acik', depoArac: 'otomobil' })).some(q => q.id === 'depoTehlike')))

// ── Tank ──────────────────────────────────────────────────────────────────────
for (const t of ['gaz', 'sivi', 'patlayici']) {
  test(`Tank ${t} → Yüksek Tehlikeli Yerler`, yonlendir({ depoTuru: 'tank', depoTank: t }, e => {
    assert.equal(e.tip, 'esas'); assert.equal(e.sinif, 'yuksek'); assert.deepEqual(e.ek, { yhMod: 'faaliyet', yhIliski: 'esas' })
  }))
}
test('Tank yanıcı olmayan → tehlike sınıfı sorulur; orta → 4 yıl', () => {
  assert.equal(mevcutSoru(esas({ depoTuru: 'tank', depoTank: 'yanmaz' })).id, 'depoTehlike')
  sure({ depoTuru: 'tank', depoTank: 'bilmiyorum', depoTehlike: 'orta' }, 4, M.tehlikeSecildi)()
})

// ── Bilinen tehlike sınıfı ve malzeme hesabı ─────────────────────────────────
test('Düşük → 5, orta → 4, yüksek → 3 (belge sorulmaz)', () => {
  sure({ depoTuru: 'antrepo', depoTehlike: 'dusuk' }, 5, M.tehlikeSecildi)()
  sure({ depoTuru: 'arsiv', depoTehlike: 'orta' }, 4, M.tehlikeSecildi)()
  sure({ depoTuru: 'silo', depoTehlike: 'yuksek' }, 3, M.tehlikeSecildi)()
})
test('R18: konum, 50 m², yardımcı / bağımsız soruları yok; sonra yalnız "başka kullanım"', () => {
  const ids = akis({ esas: 'depolama', c: { depoTuru: 'depo', depoTehlike: 'dusuk' } }).map(q => q.id)
  assert.deepEqual(ids, ['depoTuru', 'depoTehlike', 'digerVar'])
})
test('Açık stok sahası: diğer türler gibi (kapsam dışı değil)', sure({ depoTuru: 'acik_saha', depoTehlike: 'orta' }, 4, M.tehlikeSecildi))
test('Bilmiyorum → malzeme ekranı (türün malzeme listesiyle)', () => {
  const q = mevcutSoru(esas({ depoTuru: 'arsiv', depoTehlike: 'bilmiyorum' }))
  assert.equal(q.id, 'depoStok'); assert.equal(q.tip, 'stok'); assert.equal(q.depoTuru, 'arsiv')
})
const stok = (alan, ...k) => ({ alan, kalemler: k.map(([id, miktar]) => ({ id, miktar })) })
test('Karton 5–19,9 ton, 250–499 m² (≈667 MJ/m²) → 4 yıl, tahmini', sure({ depoTuru: 'depo', depoTehlike: 'bilmiyorum', depoStok: stok('a3', ['FT-003', 'q4']) }, 4, M.malzemeHesabi, true))
test('≥800 MJ/m² → 3 yıl', sure({ depoTuru: 'depo', depoTehlike: 'bilmiyorum', depoStok: stok('a2', ['FT-003', 'q4'], ['FT-011', 'q2']) }, 3, M.malzemeHesabi, true))
test('≥250 MJ/m² ve hızlı yanan (PP) payı ≥%30 → 3 yıl', () => {
  const r = depoTahmini(stok('a5', ['FT-003', 'q5'], ['FT-011', 'q4']))
  assert.ok(r.ok && r.q < 800 && r.q >= 250 && r.yuksek)
  sure({ depoTuru: 'depo', depoTehlike: 'bilmiyorum', depoStok: stok('a5', ['FT-003', 'q5'], ['FT-011', 'q4']) }, 3, M.malzemeHesabi, true)()
})
test('PVC hızlı yanan sayılmaz', () => { const r = depoTahmini(stok('a5', ['FT-017', 'q5'])); assert.ok(r.ok && !r.yuksek) })
test('Eksik malzeme / alan: cevaplanmış sayılmaz, uyarı R20 metni', () => {
  assert.equal(depoTahmini(stok('', ['FT-003', 'q4'])).neden, M.alanSec)
  assert.equal(depoTahmini(stok('a3')).neden, M.malzemeSec)
  assert.equal(depoTahmini(stok('a3', ['FT-003', ''])).neden, M.satirEksik)
  assert.equal(mevcutSoru(esas({ depoTuru: 'depo', depoTehlike: 'bilmiyorum', depoStok: stok('a3', ['', 'q1']) })).id, 'depoStok')
})
test('Eski V6 R1 stok kaydı (m² ile) yeniden sorulur', () => {
  const eski = { alan: 500, kalemler: [{ id: 'FT-003', miktar: 100, birim: 'kg' }] }
  assert.equal(mevcutSoru(esas({ depoTuru: 'depo', depoTehlike: 'bilmiyorum', depoStok: eski })).id, 'depoStok')
})
test('Malzeme listeleri: tanımlı her kimlik var, tehlikeli sıvı / gaz yok', () => {
  for (const l of Object.values(V.DEPO_MALZEME_IZINLI)) for (const id of l) {
    assert.ok(V.DEPO_MALZEME.some(m => m.id === id), id); assert.ok(!V.DEPO_TEHLIKELI_MALZEME.includes(id), id)
  }
})

// ── Diğer kullanım olarak depo ────────────────────────────────────────────────
const buro = (c) => ({ esas: 'buro', c: { buroTuru: V.BURO_TURU[0].deger, alan: 'le_1000', digerVar: 'evet', diger_1: 'depolama', iliski_depolama: 'ayni', digerDaha_1: 'hayir', ...c } })
test('Diğer kullanım: 50 m² sorusu yok, ilişki sorusu var', () => {
  const ids = akis(buro({ d_depoTuru: 'depo', d_depoTehlike: 'orta' })).map(q => q.id)
  assert.ok(ids.includes('iliski_depolama')); assert.ok(!ids.some(id => id.includes('depoAlani')))
  assert.equal(mevcutSoru(buro({ d_depoTuru: 'depo', d_depoTehlike: 'orta' })), null)
})
test('Diğer kullanım: Madde 17 tankı → yüksek tehlikeli bölüm 3 yıl', () => {
  const d = buro({ d_depoTuru: 'tank', d_depoTank: 'sivi' })
  assert.equal(mevcutSoru(d), null); assert.equal(dep(d).periyot, 3); assert.equal(hesapla(d).nihai, 3)
})
test('Diğer kullanım: servis / tamirhane → bu kullanım Ticaret\'e çevrilir', () => {
  const q = mevcutSoru(buro({ d_depoTuru: 'galeri', d_depoArac: 'servis' }))
  assert.equal(q.id, 'd_yonlendirDepo'); assert.deepEqual([q.eylemler[0].tip, q.eylemler[0].sinif, q.eylemler[0].sira], ['diger', 'ticaret', 1])
})
test('Diğer kullanım: ayrı yapıdaki depo süreye katılmaz', () => {
  const d = { esas: 'kurumsal', c: { kurumsalTuru: 'okul', yerlesim: 'yerleske', blokAdi: '', alan: 'le_1000', digerVar: 'evet', diger_1: 'depolama', d_depoTuru: 'depo', iliski_depolama: 'ayri', digerDaha_1: 'hayir' } }
  assert.equal(mevcutSoru(d), null); assert.equal(hesapla(d).nihai, 5); assert.equal(dep(d).durum, 'ayri_yapi')
})

// ── "Hesaplama hakkında" notu: yalnız süreyi malzeme hesabı belirlediyse ─────
test('Not: büro 5 + depo hesabı 4 → süreyi depo hesabı belirler', () => {
  const s = hesapla(buro({ d_depoTuru: 'depo', d_depoTehlike: 'bilmiyorum', d_depoStok: stok('a3', ['FT-003', 'q4']) }))
  assert.equal(s.nihai, 4); assert.ok(s.surucu.some(k => k.tahmini))
})
test('Not: daha kısa süreyi başka kullanım verirse gösterilmez', () => {
  const s = hesapla(buro({ d_depoTuru: 'depo', d_depoTehlike: 'bilmiyorum', d_depoStok: stok('a3', ['FT-003', 'q4']), digerDaha_1: 'evet', diger_2: 'yuksek',
    iliski2_yuksek: 'ayni', d2_yhFaaliyetler: { madde: [V.YH_MADDE[0].deger], tesis: [V.YH_TESIS[0].deger], islem: [V.YH_ISLEM[0].deger] }, d2_yhMod: 'faaliyet', digerDaha_2: 'hayir' }))
  assert.equal(s.nihai, 3); assert.ok(!s.surucu.some(k => k.tahmini))
})

console.log(`${gecen}/${toplam} geçti`)
assert.equal(gecen, toplam)
