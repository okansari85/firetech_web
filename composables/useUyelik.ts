// Üyelik, ücretsiz değerlendirme kaydı ve ödeme: firetech backend (Laravel, Sanctum token). Ekosistemin ortak hesabı.
// Giriş anahtarı (token) localStorage'da; ödeme bilgisi (ürün, ücretli giriş sayfasının handoff'u) sessionStorage'da.
import type { UrunKod } from '~/data/urunler'
import type { Degerlendirme, Sonuc } from '~/utils/onDegerlendirmeMotoru'

export type Uye = { id: number; name: string; email: string; phone: string | null; created_at: string }
export type Tutar = { net: number; vat: number; total: number } // kuruş
export type Siparis = {
  merchant_oid: string; product: UrunKod; status: 'pending' | 'paid' | 'failed'; name: string; phone: string; address: string
  net_amount: string; vat_amount: string; total_amount: string; created_at: string; paid_at: string | null
  pre_assessment: { uuid: string; primary_class: string | null } | null
}
export type KayitliDegerlendirme = { uuid: string; primary_class: string | null; answers: Record<string, any>; result: Sonuc | null; paid: boolean; created_at: string; updated_at: string }

const TOKEN = 'firetech_token'
const ODEME = 'firetech_odeme'

const depo = (tur: 'local' | 'session'): Storage | null => {
  if (!import.meta.client) return null
  try { return tur === 'local' ? localStorage : sessionStorage } catch { return null }
}

// Backend hata yanıtından kullanıcıya gösterilecek tek cümle.
export const hataMesaji = (e: any): string => {
  const d = e?.data
  const ilk = d?.errors && Object.values(d.errors)[0]
  if (Array.isArray(ilk) && ilk[0]) return String(ilk[0])
  if (e?.statusCode && e.statusCode < 500 && d?.message) return String(d.message)
  if (e?.statusCode === 503 || e?.statusCode === 502) return String(d?.message || 'Hizmet şu an kullanılamıyor.')
  return 'Bağlantı kurulamadı. Lütfen biraz sonra tekrar deneyin.'
}

let yukleme: Promise<void> | null = null

export const useUyelik = () => {
  const apiBase = useRuntimeConfig().public.apiBase as string
  const token = useState<string | null>('uyeToken', () => null)
  const uye = useState<Uye | null>('uye', () => null)
  const siparisler = useState<Siparis[]>('siparisler', () => [])
  const degerlendirmeler = useState<KayitliDegerlendirme[]>('degerlendirmeler', () => [])
  const fiyatlar = useState<Record<UrunKod, Tutar | null> | null>('fiyatlar', () => null)
  const yuklendi = useState('uyelikYuklendi', () => false)
  // PayTR mağazası yokken backend sahte ödeme açık: kart kutusu sitede, karttan çekim yok.
  const sahteOdeme = useState('sahteOdeme', () => false)
  // Kurulumda alınır: await sonrasında Nuxt bağlamı kaybolur, useState çağrılamaz.
  const od = useOnDegerlendirme().d

  const api = <T>(yol: string, o: Record<string, any> = {}) =>
    $fetch(yol, { baseURL: apiBase, ...o, headers: { Accept: 'application/json', ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}) } }) as Promise<T>

  const temizle = () => {
    token.value = null; uye.value = null; siparisler.value = []; degerlendirmeler.value = []
    depo('local')?.removeItem(TOKEN)
  }

  // Sayfa açılışında bir kez (zorla: Hesabım gibi güncel liste isteyen ekranlar).
  const yukle = (zorla = false): Promise<void> => {
    if (!import.meta.client) return Promise.resolve()
    if (yukleme && !zorla) return yukleme
    if (!token.value) token.value = depo('local')?.getItem(TOKEN) || null
    // Eski taslak üyeliğin (backend'siz) tarayıcıdaki kayıtları
    depo('local')?.removeItem('firetech_uye'); depo('local')?.removeItem('firetech_odemeler')
    yukleme = (async () => {
      const fiyat = api<{ data: Record<UrunKod, Tutar | null>; fake_payment?: boolean }>('/analysis-orders/price').then(r => { fiyatlar.value = r.data; sahteOdeme.value = !!r.fake_payment }).catch(() => {})
      if (token.value) {
        try {
          const [me, s, d] = await Promise.all([
            api<{ user: Uye }>('/auth/me'),
            api<{ data: Siparis[] }>('/analysis-orders'),
            api<{ data: KayitliDegerlendirme[] }>('/pre-assessments')
          ])
          uye.value = me.user; siparisler.value = s.data; degerlendirmeler.value = d.data
        } catch (e: any) {
          if (e?.statusCode === 401) temizle()
        }
      }
      await fiyat
      yuklendi.value = true
    })()
    return yukleme
  }
  if (import.meta.client && !yuklendi.value) yukle()

  // Girişten önce yapılan ücretsiz değerlendirme hesaba bağlanır.
  const sahiplen = async () => {
    const uuid = od.value.uuid
    if (uuid) await api(`/pre-assessments/${uuid}/claim`, { method: 'POST' }).catch(() => {})
  }
  const oturumAc = async (r: { token: string; user: Uye }) => {
    token.value = r.token; uye.value = r.user
    depo('local')?.setItem(TOKEN, r.token)
    await sahiplen()
    await yukle(true)
  }
  const girisYap = async (email: string, password: string) =>
    oturumAc(await api<{ token: string; user: Uye }>('/auth/login', { method: 'POST', body: { email, password } }))
  const uyeOl = async (f: { name: string; email: string; phone: string; password: string }) =>
    oturumAc(await api<{ token: string; user: Uye }>('/auth/register', { method: 'POST', body: { ...f, password_confirmation: f.password } }))
  const cikis = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {})
    temizle()
  }
  const bilgileriGuncelle = async (f: { name: string; phone: string }) => {
    uye.value = (await api<{ user: Uye }>('/auth/me', { method: 'PUT', body: f })).user
  }
  const sifreDegistir = (f: { current_password: string; password: string }) =>
    api('/auth/password', { method: 'PUT', body: { ...f, password_confirmation: f.password } })

  // Ücretsiz değerlendirme sonucu kaydı. Aynı değerlendirme (uuid) güncellenir; kayıt bulunamaz ya da analizi
  // satın alınmışsa (değiştirilemez) yeni kayıt açılır. Uuid döner; hata olursa değerlendirme yine çalışır (null).
  const degerlendirmeKaydet = async (d: Degerlendirme, sonuc: Sonuc): Promise<string | null> => {
    const body = { degerlendirme: { esas: d.esas, c: d.c }, sonuc }
    try {
      if (d.uuid) {
        try { return (await api<{ data: { uuid: string } }>(`/pre-assessments/${d.uuid}`, { method: 'PUT', body })).data.uuid } catch (e: any) {
          if (e?.statusCode !== 404 && e?.statusCode !== 409) throw e
        }
      }
      return (await api<{ data: { uuid: string } }>('/pre-assessments', { method: 'POST', body })).data.uuid
    } catch { return null }
  }

  const fiyat = (urun: UrunKod): Tutar | null => fiyatlar.value?.[urun] ?? null
  const odendi = (urun: UrunKod) => siparisler.value.some(o => o.product === urun && o.status === 'paid')

  // Her "Analizi Başlat": üye değilse giriş / üyelik → ödeme. handoff: ücretli giriş sayfasının devir verisi.
  const analiziBaslat = (urun: UrunKod, handoff?: unknown) => {
    depo('session')?.setItem(ODEME, JSON.stringify({ urun, handoff: handoff ?? null }))
    if (urun === 'site' && odendi('site')) return navigateTo('/ucretsiz-kontrol/site-yonetimi')
    const hedef = `/odeme?urun=${urun}`
    return navigateTo(uye.value ? hedef : `/giris?devam=${encodeURIComponent(hedef)}`)
  }
  const odemeBilgisi = (): { urun: UrunKod; handoff: unknown } | null => {
    try { return JSON.parse(depo('session')?.getItem(ODEME) || 'null') } catch { return null }
  }

  // Sipariş açılır, PayTR iFrame jetonu döner. Bina analizi o anki ücretsiz değerlendirmeye bağlanır.
  const odemeBaslat = async (urun: UrunKod, f: { name: string; phone: string; address: string; agreements: boolean }) => {
    const bilgi = odemeBilgisi()
    return api<{ token?: string; fake?: boolean; merchant_oid: string; amounts: { net: string; vat: string; total: string } }>('/analysis-orders', {
      method: 'POST',
      body: { ...f, product: urun, pre_assessment_uuid: urun === 'bina' ? od.value.uuid ?? null : null, handoff: bilgi?.urun === urun ? bilgi.handoff : null }
    })
  }

  return {
    uye, siparisler, degerlendirmeler, yuklendi, sahteOdeme, yukle, girisYap, uyeOl, cikis, bilgileriGuncelle, sifreDegistir,
    degerlendirmeKaydet, fiyat, odendi, analiziBaslat, odemeBilgisi, odemeBaslat
  }
}
