// TASLAK üyelik ve ödeme (kullanıcı kararı, 17 Ekim: "önce nasıl görünecek"). Backend yok: hesap ve ödemeler yalnız bu
// tarayıcıda (localStorage) tutulur; şifre saklanmaz. Gerçek üyelik ve ödeme firetech backend'ine bağlanınca bu dosya değişecek.
import { URUNLER, type UrunKod } from '~/data/urunler'

type Uye = { ad: string; eposta: string }
type Odeme = { urun: UrunKod; tarih: string }
const UYE = 'firetech_uye'
const ODEMELER = 'firetech_odemeler'

const oku = <T>(k: string, varsayilan: T): T => {
  if (!import.meta.client) return varsayilan
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : varsayilan } catch { return varsayilan }
}
const yaz = (k: string, v: unknown) => { if (import.meta.client) try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* yok say */ } }

export const useUyelik = () => {
  const uye = useState<Uye | null>('uye', () => null)
  const odemeler = useState<Odeme[]>('odemeler', () => [])
  const yuklendi = useState('uyelikYuklendi', () => false)
  if (import.meta.client && !yuklendi.value) { uye.value = oku(UYE, null); odemeler.value = oku(ODEMELER, []); yuklendi.value = true }

  const girisYap = (u: Uye) => { uye.value = u; yaz(UYE, u) }
  const cikis = () => { uye.value = null; yaz(UYE, null) }
  const odendi = (urun: UrunKod) => odemeler.value.some(o => o.urun === urun)
  const odemeKaydet = (urun: UrunKod) => { odemeler.value = [...odemeler.value, { urun, tarih: new Date().toISOString() }]; yaz(ODEMELER, odemeler.value) }

  // Her "Detaylı … Analizini Başlat": üye değilse giriş / üyelik → ödeme → analiz
  const analiziBaslat = (urun: UrunKod) => {
    const odeme = `/odeme?urun=${urun}`
    if (odendi(urun)) return navigateTo(URUNLER[urun].sonra)
    return navigateTo(uye.value ? odeme : `/giris?devam=${encodeURIComponent(odeme)}`)
  }

  return { uye, odemeler, girisYap, cikis, odendi, odemeKaydet, analiziBaslat }
}
