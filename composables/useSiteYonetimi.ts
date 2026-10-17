// Site Yönetimi değerlendirmesinin durumu (tarayıcı oturumunda saklanır). Metinler data/siteYonetimi.ts.
// Her kayıt (blok, dükkân, sosyal tesis…) kendi kullanım sınıfıyla ön değerlendirme motorunda "kayıt" modunda değerlendirilir.
import type { SinifKod } from '~/data/onDegerlendirme'
import { SITE_KATEGORILERI } from '~/data/siteYonetimi'
import { hesapla, mevcutSoru, type Cevaplar, type Sonuc } from '~/utils/onDegerlendirmeMotoru'

export type SiteKonum = 'ayri' | 'icinde' | 'acik'
export type SiteKayit = { id: string; kat: string; ad: string; konum?: SiteKonum; bagli?: string; sinif?: SinifKod; c: Cevaplar }
export type SiteAdim = 'tanit' | 'envanter' | 'sonuc'
type Durum = { adim: SiteAdim; siteAdi: string; secili: string[]; sayilar: Record<string, number>; kayitlar: SiteKayit[]; aktif: string | null }

const ANAHTAR = 'firetech_site_yonetimi'
const bos = (): Durum => ({ adim: 'tanit', siteAdi: '', secili: [], sayilar: {}, kayitlar: [], aktif: null })

export const kayitDegerlendirme = (k: SiteKayit) => ({ esas: k.sinif ?? null, c: k.c, kayit: true })
// Kaydın bekleyen ölçüt sorusu (yoksa null)
export const kayitSorusu = (k: SiteKayit) => (k.sinif && k.konum !== 'acik' ? mevcutSoru(kayitDegerlendirme(k)) : null)
export const kayitTamam = (k: SiteKayit) => !!k.konum && (k.konum !== 'icinde' || !!k.bagli) && (k.konum === 'acik' || (!!k.sinif && !kayitSorusu(k)))
export const kayitSonucu = (k: SiteKayit): Sonuc | null => (k.sinif && k.konum !== 'acik' && kayitTamam(k) ? hesapla(kayitDegerlendirme(k)) : null)

export const useSiteYonetimi = () => {
  const d = useState<Durum>('siteYonetimi', bos)
  if (import.meta.client && !d.value.siteAdi && !d.value.kayitlar.length) {
    try { const k = sessionStorage.getItem(ANAHTAR); if (k) d.value = JSON.parse(k) } catch { /* depolama kapalı */ }
  }
  const kaydet = () => { if (import.meta.client) try { sessionStorage.setItem(ANAHTAR, JSON.stringify(d.value)) } catch { /* yok say */ } }
  const guncelle = (p: Partial<Durum>) => { d.value = { ...d.value, ...p }; kaydet() }

  // Seçilen kategoriler ve sayılara göre kayıtlar (K1…K8, T1…); var olan kayıtların bilgileri korunur.
  const envanterOlustur = () => {
    const eski = new Map(d.value.kayitlar.map(k => [k.id, k]))
    const kayitlar: SiteKayit[] = []
    for (const kat of SITE_KATEGORILERI.filter(k => d.value.secili.includes(k.kod))) {
      for (let i = 1; i <= (d.value.sayilar[kat.kod] || 0); i++) {
        const id = `${kat.on}${i}`
        kayitlar.push(eski.get(id) ?? { id, kat: kat.kod, ad: '', c: {} })
      }
    }
    guncelle({ kayitlar, aktif: kayitlar[0]?.id ?? null, adim: 'envanter' })
  }
  const kayitGuncelle = (id: string, p: Partial<SiteKayit>) =>
    guncelle({ kayitlar: d.value.kayitlar.map(k => (k.id === id ? { ...k, ...p } : k)) })
  const sifirla = () => { d.value = bos(); kaydet() }

  return { d, guncelle, envanterOlustur, kayitGuncelle, sifirla }
}
