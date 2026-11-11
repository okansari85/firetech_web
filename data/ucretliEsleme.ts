// ÜCRETSİZ ÖN DEĞERLENDİRME → ÜCRETLİ ANALİZE GİRİŞ eşlemesi (utils/ucretliGiris.ts › selectPaidEntry girdisi).
// Katalog kimlikleri (data/ucretliKatalog.json) v7 paket kimlikleriyle aynıdır (176/176). Tür → kimlik tablosu, ücretsiz sonuçtaki
// yönlendirme sorularının da kullandığı data/soruHavuzu.json eşlemesidir (utils/soruSecimi.ts › HAVUZ_ESLEME); burada yalnız
// birebir olmayan seçenekler ayrılır. Periyot yeniden hesaplanmaz: hesapla() sonucu aynen aktarılır. Test: scripts/ucretli-test.mjs
import { SINIFLAR, type SinifKod } from '~/data/onDegerlendirme'
import { iliskiSecenekleri, type Cevaplar, type Degerlendirme, type KullanimSonucu, type Sonuc } from '~/utils/onDegerlendirmeMotoru'
import { HAVUZ_ESLEME as HE } from '~/utils/soruSecimi'

export type BinaIliskisi = 'same_building' | 'same_campus' | 'separate_buildings' | 'unknown'

// Ücretsiz akıştaki tür sorusunun cevap anahtarı (diğer kullanımda ön ekiyle: d_, d2_ …). Konutta alt tür; yüksek tehlikelide faaliyet ekranı.
const TUR_ID: Record<SinifKod, string> = {
  konut: 'konutAltTuru', konaklama: 'konaklamaTuru', kurumsal: 'kurumsalTuru', buro: 'buroTuru', ticaret: 'ticaretTuru',
  endustri: 'endTuru', toplanma: 'toplanmaTuru', depolama: 'depoTuru', yuksek: 'yhFaaliyetler'
}

// Katalogda birebir karşılığı olmayan ücretsiz seçenekler: iki katalog kaydını birden kapsıyor ya da katalogda hiç yok.
// Biri seçilip uydurulmaz; sınıfın genel kaydı ("Diğer …", HE.diger) kullanılır. "Kendim yazacağım" (eşleşmedi) da genel kayda gider.
export const BIREBIR_DEGIL: Partial<Record<SinifKod, string[]>> = {
  konut: ['a4'], // Birden Fazla Bağımsız Konut Bölümü Bulunan Yapı — katalogda karşılığı yok
  kurumsal: ['bakim_merkezi'], // Yaşlı ve Engelli Bakım Merkezleri — 03-X-010 / 03-X-011
  buro: ['b11', 'b14'], // Mimarlık ve Mühendislik Ofisi — 04-X-011 / 04-X-012 · Doktor ve Diş Hekimi Muayenehanesi — 04-X-015 / 04-X-016
  ticaret: ['giyim', 'mobilya_elektronik', 'yedek_parca'], // 05-X-014 / 015 · 05-X-016 / 017 · 05-X-026 / 027
  endustri: ['e6', 'e7', 'e9', 'e11'], // CNC ve Torna 06-X-006 / 007 · Metal İşleme ve Makine İmalat 06-X-008 / 009 · İplik ve Dokuma 06-X-011 / 012 · Un ve Yem 06-X-014 / 015
  toplanma: ['konser_salonu', 'konferans_salonu', 'sergi'], // 07-X-009 / 010 · 07-X-011 / 012 · 07-X-014 / 015
  depolama: ['hammadde', 'otopark', 'lojistik'] // Hammadde ve Mamul 08-X-006 / 007 · Açık veya Kapalı Otopark 08-X-011 / 012 · Lojistik / Dağıtım 08-X-003 / 004
}

// Bir kullanımın katalog kimlikleri. Yüksek tehlikelide tesis, madde ve işlemler aynı tesisin boyutlarıdır (tesis önce: ana kayıt).
function kimlikler(k: KullanimSonucu, c: Cevaplar): string[] {
  const s = k.sinif
  if (!s) return [] // "Kullanım türünü bilmiyorum": katalog kaydı uydurulmaz; cevaplar originalFreeForm ile aktarılır
  const esas = k.iliski === 'esas'
  const v = c[`${esas ? '' : k.onek ?? 'd_'}${TUR_ID[s]}`]
  if (s === 'yuksek') {
    const ids = [
      ...(v?.tesis ?? []).map((x: string) => HE.yuksek.tesis[x]),
      ...(v?.madde ?? []).map((x: string) => HE.yuksek.madde[x]),
      ...(v?.islem ?? []).map((x: string) => HE.yuksek.islem[x])
    ].filter((x): x is string => !!x)
    return ids.length ? ids : [HE.yuksek.tesis.diger!]
  }
  // Site: oturan ve yönetim ayrı profillerdir (01-X-005-SAKIN / -YONETIM)
  if (s === 'konut' && esas && c.konutTuru === 'site') return [c.siteKullanici === 'yonetim' ? HE.site.yonetim : HE.site.oturan]
  return [(!BIREBIR_DEGIL[s]?.includes(v) && HE.esleme[s]?.[v]) || HE.diger[s]!]
}

// Diğer kullanımın yapıyla ilişkisi → bina ilişkisi. "Ayrı bir yapıda" seçeneği yalnız site / yerleşkede çıkar; orada "yardımcı /
// ortak alan" aynı yapıda da ayrı yapıda da olabilir: belirsiz. Varsayılan 'same_building' yok.
const iliski = (k: KullanimSonucu, d: Degerlendirme): BinaIliskisi =>
  k.iliski === 'ayni' ? 'same_building' : k.iliski === 'ayri' ? 'separate_buildings'
    : k.iliski === 'yardimci' && !iliskiSecenekleri(d.esas!, k.sinif!, d.c).some(o => o.deger === 'ayri') ? 'same_building' : 'unknown'

// Tamamlanmış değerlendirme (d.esas dolu) → selectPaidEntry girdisi.
export function ucretliGirdi(d: Degerlendirme, sonuc: Sonuc) {
  const kimlik = (k: KullanimSonucu) => kimlikler(k, d.c)
  const esas = sonuc.kullanimlar.find(k => k.iliski === 'esas')!
  const digerler = sonuc.kullanimlar.filter(k => k.iliski !== 'esas' && k.sinif)
  const [primaryId, ...esasBoyutlari] = kimlik(esas)
  const iliskiler = [...new Set(digerler.map(k => iliski(k, d)))]
  const surucu = sonuc.surucu[0]
  return {
    primaryId: primaryId!,
    // Bütün seçimler aktarılır (yardımcı ve ayrı yapıdakiler de); motor tekrarları ayıklar.
    secondaryIds: [...esasBoyutlari, ...digerler.flatMap(kimlik)],
    // Diğer kullanım yoksa ya da ilişkileri farklıysa tek bir ilişki söylenemez: doğrulanmamış.
    building: { relation: iliskiler.length === 1 ? iliskiler[0]! : 'unknown' as BinaIliskisi },
    // hesapla() sonucu aynen: süre, durum, süreyi belirleyen kullanım ve gerekçesi (sonuç ekranındaki "Süreyi belirleyen" satırları)
    periodResult: {
      source: 'existing_free_calculator',
      status: sonuc.genel,
      years: sonuc.nihai,
      driverSelectionId: surucu ? (surucu.iliski === 'esas' ? primaryId : kimlik(surucu)[0]) ?? null : null,
      driverText: sonuc.surucu.map(k => `${k.sinif ? SINIFLAR[k.sinif].kisa : k.ad}: ${k.belirleyici}`).join('\n')
    },
    originalFreeForm: d
  }
}
