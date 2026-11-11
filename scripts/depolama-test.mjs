// DEPOLAMA V6 R1 — kabul testleri. Çalıştır: node scripts/depolama-test.mjs
// Oğuz'un paketindeki 29 karar senaryosu (04_TESTLER/29_senaryo_girdileri.json, beklenenler run_regression.mjs) bizim cevap anahtarlarına
// çevrilip ücretsiz motorda (utils/onDegerlendirmeMotoru.ts) koşulur; ayrıca paketin kabul maddeleri (tekrar soru yok, 50 m², 126 m²).
// shortcut: TS dosyaları nuxt'un bağımlılığı jiti ile yüklenir (scripts/ucretli-test.mjs ile aynı); jiti kalkarsa ekle.
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const kok = fileURLToPath(new URL('..', import.meta.url))
const jiti = createJiti(import.meta.url, { alias: { '~': kok }, fsCache: false })
const { akis, hesapla, mevcutSoru, yanginYuku } = await jiti.import('~/utils/onDegerlendirmeMotoru.ts')
const V = await jiti.import('~/data/onDegerlendirme.ts')

// Paketteki 17 tür sırası → bizim kodlar (17. "Diğer — Kendim tanımlayacağım" = DIGER_YAZ)
const TUR = ['depo', 'antrepo', 'lojistik', 'eticaret', 'hammadde', 'soguk_hava', 'silo', 'tank', 'arsiv', 'emanet', 'ahir', 'acik_saha', 'otopark', 'galeri', 'arac_muhafaza', 'taksi', 'kendim']
assert.equal(V.DEPO_TURU.length + 1, 17, '17 depo türü')
assert.deepEqual(V.DEPO_TURU.map(o => o.deger), TUR.slice(0, 16))
const SITE = { independent: 'bagimsiz', inside: 'icinde', sales: 'satis', factory: 'fabrika', campus: 'yerleske', openOnly: 'acik' }
const ILISKI = { independent: 'bagimsiz', auxiliary: 'yardimci', unknown: 'bilmiyorum' }
const TEHLIKE = { low: 'dusuk', medium: 'orta', high: 'yuksek' }
const R30 = { yes: 'evet', no: 'hayir', unknown: 'bilmiyorum' }

// Paketin durum alanları (fresh() + senaryo) → bizim cevaplar
function cevaplar(x) {
  const c = { depoTuru: TUR[x.type - 1], depoYer: SITE[x.site ?? 'independent'] }
  if (c.depoYer === 'icinde') {
    c.depoIcAlan = x.innerArea === undefined || x.innerArea === '' ? 'bilmiyorum' : Number(x.innerArea)
    if (typeof c.depoIcAlan === 'number' && c.depoIcAlan >= 50) c.depoIliski = ILISKI[x.relation ?? 'independent']
  }
  const fiili = V.DEPO_FIILI[c.depoTuru]
  if (fiili) c.depoFiili = fiili.find(f => f.etiket === x.subtype)?.deger ?? 'yok'
  const h = x.hazard ?? 'unknown'
  c.depoTehlike = TEHLIKE[h] ?? 'bilmiyorum'
  if (h !== 'unknown') {
    c.depoDayanak = x.evidence === 'document' ? 'belge' : 'beyan'
    if (c.depoDayanak === 'belge') c.depoBelge = x.docRef ?? ''
  } else {
    c.depoStok = { alan: x.area ? Number(x.area) : null, kalemler: (x.materials ?? []).map(m => ({ id: m.id, miktar: m.qty === '' ? null : Number(m.qty), birim: m.units, kgBirim: m.unitKg ? Number(m.unitKg) : null })) }
    const a = c.depoStok.alan
    if (a && a <= 126) c.depoR30 = R30[x.r30 ?? 'unknown']
  }
  if (x.other === 'yes') {
    // Diğer kullanım: aynı yapıda bağımsız yüksek tehlikeli bölüm → mevcut motor 3 yıl döndürür
    Object.assign(c, { digerVar: 'evet', diger_1: 'yuksek', iliski_yuksek: 'ayni', d_yhMod: 'faaliyet', digerDaha_1: 'hayir',
      d_yhFaaliyetler: { madde: [V.YH_MADDE[0].deger], tesis: [V.YH_TESIS[0].deger], islem: [V.YH_ISLEM[0].deger] } })
  } else c.digerVar = 'hayir'
  return c
}

const YONLENDIR = {
  'MEVCUT 9. ANA SINIF': e => e.tip === 'esas' && e.sinif === 'yuksek',
  'ESAS BİNAYA DÖN (<50 m²)': e => e.tip === 'sinif-sec',
  'ESAS BİNA KULLANIMINA DÖN': e => e.tip === 'sinif-sec',
  'TİCARET KULLANIMINA DÖN': e => e.tip === 'esas' && e.sinif === 'ticaret',
  'ENDÜSTRİYEL KULLANIMA DÖN': e => e.tip === 'esas' && e.sinif === 'endustri'
}
const INCELEME = {
  'YAPI İLİŞKİSİNİ DOĞRULA': [V.DEPO_METIN.icAlanYok, V.DEPO_METIN.iliskiYok],
  'AÇIK SAHA KAPSAMI DOĞRULANMALI': [V.DEPO_METIN.acikSaha],
  'ORTA/YÜKSEK AYRIMI AÇIK': ['Orta/yüksek ayrımı açık'],
  'KOMPARTIMAN ALANI EKSİK': ['Kompartıman alanı eksik'],
  '30 DAKİKA DAYANIM BİLGİSİ EKSİK': ['30 dakika dayanım bilgisi eksik'],
  'YANGIN YÜKÜ VERİSİ EKSİK': ['Yangın yükü verisi eksik'],
  'DÜŞÜK TEHLİKE KOŞULLARI KISMİ': ['Düşük tehlike koşulları kısmi']
}

const T = n => n // paket T(n) = n-1 sıfır tabanlı; burada 1 tabanlı tutuluyor (TUR[x.type - 1])
const CASES = [
  ['T01', 'Normal otopark — direkt 4 yıl', { type: T(13), subtype: 'Normal otomobil otoparkı' }, 'Orta', 4],
  ['T02', 'Otobüs deposu — direkt 3 yıl', { type: T(15), subtype: 'Otobüs deposu' }, 'Yüksek', 3],
  ['T03', 'LPG tank tesisi — 9. gruba aktar', { type: T(8), subtype: 'LPG/parlayıcı gazın esas depolandığı tesis' }, 'MEVCUT 9. ANA SINIF', null],
  ['T04', '100 m² + 30 dk + tam stok; düşük otomatik değil', { type: T(1), area: '100', r30: 'yes', materials: [{ id: 'FT-003', qty: '100', units: 'kg' }] }, 'DÜŞÜK TEHLİKE KOŞULLARI KISMİ', null],
  ['T05', '500 m²; düşük otomatik dışlanıyor', { type: T(1), area: '500' }, 'ORTA/YÜKSEK AYRIMI AÇIK', null],
  ['T06', 'Antrepo — belgeyle orta', { type: T(2), hazard: 'medium', evidence: 'document', docRef: 'AG-2026/11' }, 'Orta', 4],
  ['T07', 'Silo — belgeyle yüksek', { type: T(7), hazard: 'high', evidence: 'document', docRef: 'AG-2026/12' }, 'Yüksek', 3],
  ['T08', 'Arşiv — belge olmadan yüksek beyanı', { type: T(9), hazard: 'high', evidence: 'user' }, 'BEYANA DAYALI - Yüksek', null],
  ['T09', 'Başka binanın içinde 35 m² depo', { type: T(1), site: 'inside', innerArea: '35' }, 'ESAS BİNAYA DÖN (<50 m²)', null],
  ['T10', 'Satışa bağlı e-ticaret deposu', { type: T(4), site: 'sales' }, 'TİCARET KULLANIMINA DÖN', null],
  ['T11', 'Fabrikanın parçası hammadde deposu', { type: T(5), site: 'factory' }, 'ENDÜSTRİYEL KULLANIMA DÖN', null],
  ['T12', 'Antrepo — 30 dakika bilinmiyor', { type: T(2), area: '100' }, '30 DAKİKA DAYANIM BİLGİSİ EKSİK', null],
  ['T13', 'Otopark başka binanın içinde 30 m²', { type: T(13), subtype: 'Normal otomobil otoparkı', site: 'inside', innerArea: '30' }, 'ESAS BİNAYA DÖN (<50 m²)', null],
  ['T14', '80 m² — 30 dakika yok', { type: T(1), area: '80', r30: 'no' }, 'ORTA/YÜKSEK AYRIMI AÇIK', null],
  ['T15', '80 m² — 30 dk evet ama stok eksik', { type: T(1), area: '80', r30: 'yes' }, 'YANGIN YÜKÜ VERİSİ EKSİK', null],
  ['T16', 'Oto galerisi — doğrudan 4 yıl değil', { type: T(14), subtype: 'Yalnız otomobil sergileme/satış', area: '500' }, 'ORTA/YÜKSEK AYRIMI AÇIK', null],
  ['T17', 'Başka binanın içinde alan bilinmiyor', { type: T(13), subtype: 'Normal otomobil otoparkı', site: 'inside', innerArea: '' }, 'YAPI İLİŞKİSİNİ DOĞRULA', null],
  ['T18', '100 m² — yangın yükü hesaplandı ama sınıf kesin değil', { type: T(1), area: '100', r30: 'yes', materials: [{ id: 'FT-003', qty: '100', units: 'kg' }] }, 'DÜŞÜK TEHLİKE KOŞULLARI KISMİ', null],
  ['T19', '40 palet örneği 527,16 MJ/m²', { type: T(1), area: '500', materials: [{ id: 'FT-003', qty: '11520', units: 'kg' }, { id: 'FT-003', qty: '720', units: 'kg' }, { id: 'FT-001', qty: '1000', units: 'kg' }, { id: 'FT-010', qty: '32', units: 'kg' }] }, 'ORTA/YÜKSEK AYRIMI AÇIK', null, 527.16],
  ['T20', 'Doğrudan 4 yıl + diğer kullanım 3 yıl', { type: T(13), subtype: 'Normal otomobil otoparkı', other: 'yes' }, 'Orta', 4, null, 3],
  ['T21', 'Hesaplanmış MJ/m² tek başına yüksek yapmaz', { type: T(1), area: '500', materials: [{ id: 'FT-011', qty: '8000', units: 'kg' }] }, 'ORTA/YÜKSEK AYRIMI AÇIK', null],
  ['T22', '50 m², küçük değildir', { type: T(1), site: 'inside', innerArea: '50', relation: 'independent', area: '50' }, '30 DAKİKA DAYANIM BİLGİSİ EKSİK', null],
  ['T23', '50 m² bağımsız değilse esas bina', { type: T(1), site: 'inside', innerArea: '50', relation: 'auxiliary' }, 'ESAS BİNA KULLANIMINA DÖN', null],
  ['T24', 'Açık saha — kapsam kontrolü', { type: T(12), site: 'openOnly' }, 'AÇIK SAHA KAPSAMI DOĞRULANMALI', null],
  ['T25', 'Ekrandaki 11.507 kg lastik + ambalaj, 756,78 MJ/m²', { type: T(1), area: '500', materials: [{ id: 'FT-022', qty: '11507', units: 'kg' }, { id: 'FT-003', qty: '720', units: 'kg' }, { id: 'FT-001', qty: '1000', units: 'kg' }, { id: 'FT-010', qty: '32', units: 'kg' }] }, 'ORTA/YÜKSEK AYRIMI AÇIK', null, 756.78],
  ['T26', 'Kullanıcı sınıfı bilmiyor; 80 m² 30 dk bilinmiyor', { type: T(1), area: '80', materials: [{ id: 'FT-003', qty: '100', units: 'kg' }] }, '30 DAKİKA DAYANIM BİLGİSİ EKSİK', null],
  ['T27', '126 m² sınırında 30 dk evet, sınıf otomatik verilmez', { type: T(1), area: '126', r30: 'yes', materials: [{ id: 'FT-001', qty: '100', units: 'kg' }] }, 'DÜŞÜK TEHLİKE KOŞULLARI KISMİ', null],
  ['T28', '126,01 m² sınırının üstünde 30 dk sorulmadan düşük elenir', { type: T(1), area: '126.01', materials: [{ id: 'FT-001', qty: '100', units: 'kg' }] }, 'ORTA/YÜKSEK AYRIMI AÇIK', null],
  ['T29', 'Eksik alan, yangın yükü hesabı yapılamaz', { type: T(1), area: '', materials: [{ id: 'FT-003', qty: '100', units: 'kg' }] }, 'KOMPARTIMAN ALANI EKSİK', null]
]
assert.equal(CASES.length, 29)

let gecen = 0
for (const [id, ad, x, beklenen, yil, q, nihai] of CASES) {
  const d = { esas: 'depolama', c: cevaplar(x) }
  const s = mevcutSoru(d)
  const dep = hesapla(d).kullanimlar.find(k => k.anahtar === 'esas')
  try {
    if (YONLENDIR[beklenen]) {
      assert.equal(s?.id, 'yonlendirDepo', 'yönlendirme ekranı')
      assert.ok(YONLENDIR[beklenen](s.eylemler[0]), `eylem: ${JSON.stringify(s.eylemler[0])}`)
    } else {
      assert.equal(s, null, `akış bitmedi: ${s?.id}`)
      if (yil) { assert.equal(dep.durum, 'gecerli'); assert.equal(dep.periyot, yil) }
      else if (beklenen.startsWith('BEYANA DAYALI')) { assert.equal(dep.periyot, null); assert.ok(dep.belirleyici.startsWith('Beyana dayalı'), dep.belirleyici) }
      else { assert.equal(dep.durum, 'inceleme'); assert.equal(dep.periyot, null); assert.ok(INCELEME[beklenen].some(t => dep.belirleyici.startsWith(t)), dep.belirleyici) }
      if (q) assert.ok(Math.abs(yanginYuku(d.c.depoStok).q - q) < 1e-4, `q ${yanginYuku(d.c.depoStok).q}`)
      if (nihai) assert.equal(hesapla(d).nihai, nihai)
    }
    gecen++
    console.log(`PASS ${id} ${ad}`)
  } catch (e) { console.log(`FAIL ${id} ${ad}: ${e.message}`) }
}

// Ek kabul maddeleri (CLAUDE_UYGULAMA_TALIMATI.md › Kabul testleri)
const sorular = c => akis({ esas: 'depolama', c }).map(q => q.id)
// Tekrar soru yok: 500 m²'de 30 dakika sorusu ve hesaptan sonra evet/hayır onayı açılmaz; sonraki soru "başka kullanım"
const buyuk = cevaplar({ type: 1, area: '500' }); delete buyuk.digerVar
assert.equal(mevcutSoru({ esas: 'depolama', c: buyuk }).id, 'digerVar')
assert.ok(!sorular(buyuk).includes('depoR30'))
// 100 m²: yalnız 30 dakika sorulur
const kucuk = cevaplar({ type: 1, area: '100' }); delete kucuk.depoR30
assert.equal(mevcutSoru({ esas: 'depolama', c: kucuk }).id, 'depoR30')
// Doğrudan Ek-1 karşılığında tehlike sınıfı sorulmaz
assert.ok(!sorular(cevaplar({ type: 13, subtype: 'Normal otomobil otoparkı' })).includes('depoTehlike'))
// 50 m² istisnası '<50': 49 yönlendirilir, 50 ilişki sorusuna gider
assert.equal(mevcutSoru({ esas: 'depolama', c: { depoTuru: 'depo', depoYer: 'icinde', depoIcAlan: 49 } }).id, 'yonlendirDepo')
assert.equal(mevcutSoru({ esas: 'depolama', c: { depoTuru: 'depo', depoYer: 'icinde', depoIcAlan: 50 } }).id, 'depoIliski')
// Belge alanı boş bırakılırsa doğrulanmış sayılmaz
const bos = hesapla({ esas: 'depolama', c: { ...cevaplar({ type: 2, hazard: 'medium', evidence: 'document', docRef: ' ' }) } }).kullanimlar[0]
assert.equal(bos.periyot, null)
// Boş malzeme + alan: hesap tamamlanmış sayılmaz
assert.equal(yanginYuku({ alan: 500, kalemler: [{ id: '', miktar: null, birim: 'kg' }] }).tam, false)
// Örnek stok: 263.580 MJ / 500 m² = 527,16 MJ/m², lastik yok
const ornek = yanginYuku(V.DEPO_ORNEK_STOK)
assert.equal(ornek.enerji, 263580); assert.ok(Math.abs(ornek.q - 527.16) < 1e-9)
assert.ok(!V.DEPO_ORNEK_STOK.kalemler.some(k => k.id === 'FT-022'))
// Diğer kullanım olarak depo (aynı yapı, 50 m² üstü): aynı akış; Madde 17 tank bölümü 3 yıl
const dk = { digerVar: 'evet', diger_1: 'depolama', d_depoTuru: 'tank', iliski_depolama: 'ayni', d_depoAlani: 200, d_depoFiili: 'lpg', digerDaha_1: 'hayir' }
assert.equal(hesapla({ esas: 'buro', c: { buroTuru: V.BURO_TURU[0].deger, alan: 'le_1000', ...dk } }).kullanimlar.find(k => k.sinif === 'depolama').periyot, 3)

console.log(`OK: ${gecen}/${CASES.length} senaryo; ek kabul maddeleri geçti.`)
assert.equal(gecen, CASES.length)
