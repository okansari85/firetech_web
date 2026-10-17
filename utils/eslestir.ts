// "Diğer (Kendim Yazacağım)" (Düzeltme 02): kullanıcının yazdığı kullanım adını mevcut sınıf / alt türlerle eşleştirir.
// Sözlük yalnız müşteri metinlerinden kurulur: kullanım sınıfı kart açıklamaları (Düzeltme 05), Düzeltme 02 örnekleri ve
// mevcut alt tür seçenekleri. Yeni sınıf üretmez; adından süreç, tehlikeli madde vb. varsaymaz.
import { kullanimSiniflari } from '~/data/kullanimSiniflari'
import { DIGER_ORNEKLERI, BURO_TURU, KONAKLAMA_TURU, KURUMSAL_TURU, TICARET_TURU, TOPLANMA_TURU, DEPO_TURU, YH_FAALIYET, SINIFLAR, type SinifKod, type Secenek } from '~/data/onDegerlendirme'

export type Eslesme = { sinif: SinifKod; tur?: string; terim: string }

const KART_SINIF: Record<string, SinifKod> = { residential: 'konut', lodging: 'konaklama', institutional: 'kurumsal', office: 'buro', commercial: 'ticaret', industrial: 'endustri', assembly: 'toplanma', storage: 'depolama', high_hazard: 'yuksek' }
export const ALT_TURLER: Partial<Record<SinifKod, Secenek[]>> = { konaklama: KONAKLAMA_TURU, kurumsal: KURUMSAL_TURU, buro: BURO_TURU, ticaret: TICARET_TURU, toplanma: TOPLANMA_TURU, depolama: DEPO_TURU, yuksek: YH_FAALIYET }

export const sadelestir = (s: string) => s.toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9]+/g, ' ').trim()
const parcala = (s: string) => s.split(/,|;| ve | ile | veya |\//).map(x => sadelestir(x.replace(/benzeri.*$/i, ''))).filter(x => x.length >= 3)

// Sözlük: [terim, sınıf, alt tür?]
const SOZLUK: [string, SinifKod, string?][] = []
const ekle = (terim: string, sinif: SinifKod, tur?: string) => { if (terim && !SOZLUK.some(([t, s, a]) => t === terim && s === sinif && a === tur)) SOZLUK.push([terim, sinif, tur]) }
for (const k of kullanimSiniflari) {
  const sinif = KART_SINIF[k.kod]!
  for (const t of parcala(k.aciklama.split(';')[0]!)) ekle(t, sinif)
}
for (const [sinif, ornekler] of Object.entries(DIGER_ORNEKLERI) as [SinifKod, string[]][]) for (const o of ornekler) ekle(sadelestir(o), sinif)
for (const [sinif, liste] of Object.entries(ALT_TURLER) as [SinifKod, Secenek[]][]) {
  for (const o of liste.filter(o => !['diger', 'benzeri', 'kendim'].includes(o.deger))) {
    for (const t of parcala(o.etiket)) ekle(t, sinif, o.deger)
    // Seçeneğin örnekleri de o alt türe bağlanır (ör. Eğitim Tesisi: "Okul, kreş, anaokulu…")
    if (o.ornek) for (const t of parcala(o.ornek)) ekle(t, sinif, o.deger)
  }
}

// Sınıf eşleşip alt tür bulunamazsa varsayılan alt tür (kullanıcı, 17 Ekim: "tuhafiye → dükkân"); adında "mağaza" geçen → Mağaza
const VARSAYILAN_TUR: Partial<Record<SinifKod, (y: string) => string>> = { ticaret: y => (y.includes('mağaza') ? 'magaza' : 'dukkan') }

// Tek başına ayırt etmeyen genel kelimeler (ör. "merkezi", "deposu"): yalnız bunlar ortaksa eşleşme sayılmaz.
const GENEL = new Set(['merkezi', 'merkez', 'tesisi', 'tesis', 'tesisler', 'tesisleri', 'deposu', 'depo', 'salonu', 'salon', 'binası', 'bina', 'binalar', 'alanı', 'alan', 'alanları', 'yeri', 'yerleri', 'yerler', 'ofisi', 'ofis', 'atölyesi', 'atölye', 'fabrikası', 'mağazası', 'satış', 'yapılar', 'yapı', 'amaçlı', 'kullanılan', 'hizmet', 'genel', 'diğer', 'evleri', 'evler'])
// Terim yazının içinde geçiyorsa (ya da yazı terimin başı ise) eşleşir. Alt türe bağlı eşleşmeler önce gelir.
export function eslestir(yazi: string): Eslesme[] {
  const y = sadelestir(yazi)
  if (y.length < 3) return []
  const bulunan: Eslesme[] = []
  const yk = y.split(' ').filter(w => w.length >= 3 && !GENEL.has(w))
  // Kelime eşleşmesi: tam kelime; 5+ harfli terimlerde ek alabilir ("tuhafiye" → "tuhafiyeci"); kısa terimler yalnız tam
  const kelimeUyar = (k: string) => yk.some(w => w === k || (k.length >= 5 && w.startsWith(k)) || (w.length >= 5 && k.startsWith(w)))
  for (const [terim, sinif, tur] of SOZLUK) {
    const anlamli = terim.split(' ').filter(k => k.length >= 3 && !GENEL.has(k))
    const gecer = ` ${y} `.includes(` ${terim} `) || (anlamli.length > 0 && anlamli.some(kelimeUyar))
    if (gecer) bulunan.push({ sinif, tur, terim })
  }
  // Yazılan ad sözlükteki bir terimle birebir aynıysa (ör. belgedeki "Apart Otel") yalnız o sınıf
  const birebir = bulunan.filter(e => e.terim === y)
  if (birebir.length) { const sinif = birebir[0]!.sinif; bulunan.splice(0, bulunan.length, ...bulunan.filter(e => e.sinif === sinif)) }
  // Aynı sınıf + alt tür tekrarlarını ayıkla; alt türlü olanı sınıf-yalnız olana tercih et
  const tekil: Eslesme[] = []
  for (const e of bulunan.sort((a, b) => (b.tur ? 1 : 0) - (a.tur ? 1 : 0) || b.terim.length - a.terim.length)) {
    if (tekil.some(x => x.sinif === e.sinif && (x.tur === e.tur || !e.tur))) continue
    tekil.push(e)
  }
  // Alt türü bulunamayan sınıf eşleşmelerine varsayılan alt tür (varsa); aynı sınıfta alt türlü eşleşme varsa sınıf-yalnız olan atılır
  return tekil
    .map(e => (e.tur || !VARSAYILAN_TUR[e.sinif] ? e : { ...e, tur: VARSAYILAN_TUR[e.sinif]!(y) }))
    .filter((e, i, L) => L.findIndex(x => x.sinif === e.sinif && x.tur === e.tur) === i)
}

export const eslesmeEtiketi = (e: Eslesme) => {
  const tur = e.tur ? ALT_TURLER[e.sinif]?.find(o => o.deger === e.tur)?.etiket : undefined
  return tur ? `${SINIFLAR[e.sinif].ad} → ${tur}` : SINIFLAR[e.sinif].ad
}
