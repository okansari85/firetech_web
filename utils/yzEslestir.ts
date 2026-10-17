// Yapay zekâ ile eşleştirme (Düzeltme 02): kurallar öneri bulamazsa sunucudaki ara servise sorulur (/api/eslestir;
// firetech_deploy/yz/server.mjs, Gemini). Yazılan, tek seferde tüm kullanım sınıfları (tanımlar: Düzeltme 05 kart metinleri)
// ve her sınıfın kendi kategorileri arasından eşleştirilir; başka sınıfa aitse kullanıcı o sınıfa ve kategorisine
// yönlendirilir (kullanıcı, 17 Ekim: "başka bir sınıfa ait bir şey ise ilgili sınıfa at"). Hata / kota → null (listeden seçer).
import { kullanimSiniflari } from '~/data/kullanimSiniflari'
import type { Secenek, SinifKod } from '~/data/onDegerlendirme'
import { ALT_TURLER, YONLENDIRME_SECENEGI } from '~/utils/eslestir'

const KART_SINIF: Record<string, SinifKod> = { residential: 'konut', lodging: 'konaklama', institutional: 'kurumsal', office: 'buro', commercial: 'ticaret', industrial: 'endustri', assembly: 'toplanma', storage: 'depolama', high_hazard: 'yuksek' }
const sade = (L: Secenek[]) => L.filter(o => o.deger !== 'kendim' && !YONLENDIRME_SECENEGI.has(o.deger)).map(o => ({ deger: o.deger, etiket: o.etiket, ...(o.ornek ? { ornek: o.ornek } : {}) }))

export type YzSonuc = { sinif: SinifKod; tur?: string } | null
const onbellek = new Map<string, YzSonuc>()

// Bu sınıfın kategorileri bu sorunun seçeneklerinden; diğer sınıflarınki ALT_TURLER'den. Kategorisiz sınıfta tur yok.
export async function yzEslestir(yazi: string, sinif: SinifKod, secenekler: Secenek[]): Promise<YzSonuc> {
  const y = yazi.trim()
  const anahtar = `${sinif}|${y.toLocaleLowerCase('tr')}`
  if (onbellek.has(anahtar)) return onbellek.get(anahtar)!
  try {
    const siniflar = kullanimSiniflari.map(k => {
      const kod = KART_SINIF[k.kod]!
      const liste = kod === sinif ? secenekler : ALT_TURLER[kod]
      return { kod, ad: k.ad, tanim: k.aciklama, ...(liste?.length ? { secenekler: sade(liste) } : {}) }
    })
    const r = await $fetch<{ sinif: SinifKod | null; tur: string | null }>('/api/eslestir', { method: 'POST', body: { yazi: y, sinif, siniflar }, timeout: 9000 })
    const sonuc: YzSonuc = r.sinif ? { sinif: r.sinif, ...(r.tur ? { tur: r.tur } : {}) } : null
    onbellek.set(anahtar, sonuc)
    return sonuc
  } catch {
    return null
  }
}
