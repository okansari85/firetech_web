// ÜCRETSİZ ÖN DEĞERLENDİRME — KARAR MOTORU (saf fonksiyonlar; ileride aynen firetech backend'ine taşınacak)
// akis(): verilen cevaplara göre sorulması gereken soruları sırayla üretir (ilk cevapsız soruda durur).
// hesapla(): kullanımların ve yapının periyodunu hesaplar (cevaplar eksikken de anlık çalışır).
import {
  SINIFLAR, PERIYOT, TOPLANMA_KISI_ESIGI, DEPO_ALAN_ESIGI, YUKSEKLIK, ALAN, ODA, TEHLIKE, EVET_HAYIR, KONUT_TURU, KONAKLAMA_TURU,
  KURUMSAL_TURU, TICARET_TURU, YERLESIM, TOPLANMA_TURU, END_TURU, turGrubu, EK1, DEPO_TURU, DEPO_MADDE, YH_FAALIYET, YH_MOD, YH_ILISKI, DIGER_KULLANIM_KARTLARI, ILISKI, YARDIMCI_OLABILIR, ILISKI_METNI, KARMA_YOK,
  DIGER_VAR_METNI, ODA_BELIRSIZ, PROJEDEN, METIN, ALAN_TANIM, KULLANIM_KISA_AD, SINIF_KISA_AD, ANALIZ_BASLIKLARI, BIRLIKTE_BASLIKLARI, ANALIZ_BASLIK_SINIRI,
  KONUT_ALT_TURU, SITE_KULLANICI, SITE_TURU, DIGER_YAZ, BURO_TURU, type SinifKod, type Secenek
} from '~/data/onDegerlendirme'

export type Cevaplar = Record<string, any>
// kayit: Site Yönetimi envanterindeki tek bir yapı / alan (yalnız yapı bilgileri sorulur; konutta "Site" seçeneği ve "başka kullanım" adımı yok).
export type Degerlendirme = { esas: SinifKod | null; c: Cevaplar; kayit?: boolean }

// sayfa: ücretli ürüne geçiş (üyelik → ödeme → ürün; composables/useUyelik.ts)
export type Eylem = { etiket: string; tip: 'esas' | 'sinif-sec' | 'sayfa'; sinif?: SinifKod; ek?: Cevaplar; urun?: 'bina' | 'site' }
export type Soru = {
  id: string
  tip: 'secim' | 'coklu' | 'sayi' | 'metin' | 'bilgi'
  grup: 'yapi' | 'diger'
  kisaAd: string
  baslik: string
  aciklama?: string
  secenekler?: Secenek[]
  liste?: { baslik: string; ornekler: string[] }
  yardim?: 'yukseklik' | 'alan' | 'oda'
  tanim?: { metin: string; ornek?: string }
  birim?: string
  bilinmiyorDugmesi?: boolean
  istegeBagli?: boolean
  eylemler?: Eylem[]
  sinif?: SinifKod
  // Sorunun üstünde, önceki seçimi hatırlatan kutu (ör. "Müstakil Ev / Villa" + açıklaması)
  ust?: { baslik: string; aciklama?: string }
  // Seçenekler iki sütunda (az sayıda kısa seçenekte de)
  ikiSutun?: boolean
  // Listede "Diğer (Kendim Yazacağım)" var (Düzeltme 02): seçilince yazı alanı ve eşleştirme önerisi
  digerYaz?: boolean
}

const ALAN_SINIFLARI: SinifKod[] = ['kurumsal', 'buro', 'ticaret', 'toplanma']
const DUR = Symbol('dur')
const kisa = (s: SinifKod) => SINIFLAR[s].kisa
const kucuk = (s: string) => s.toLocaleLowerCase('tr')
const doluMu = (v: any) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)
// Tek seçimde cevap seçeneklerden biri olmalı: seçenekler daralınca eski cevap yeniden sorulur.
const cevapliMi = (q: Soru, v: any) => q.tip === 'bilgi' ? false : q.tip === 'metin' ? v !== undefined : doluMu(v) && (q.tip !== 'secim' || !q.secenekler || q.secenekler.some(o => o.deger === v))

// Değerlendirilen yer birden fazla yapıdan oluşabiliyor mu (konutta site, kurumsalda kampüs / yerleşke; konaklamada tatil köyü,
// kamping, pansiyon, öğrenci yurdu ve diğer benzeri tesis — eski ekran dokümanı 4.4.2 / 4.5.2 / 4.6.2 / 4.7.2 / 4.8.2)?
const coklYapiMi = (esas: SinifKod, c: Cevaplar) => (esas === 'konut' && c.konutTuru === 'site') || (esas === 'kurumsal' && c.yerlesim === 'yerleske') ||
  (esas === 'konaklama' && ['tatil_koyu', 'kamping', 'pansiyon', 'yurt', 'diger'].includes(turGrubu(KONAKLAMA_TURU, c.konaklamaTuru)))

// Kullanıcı yükü: BYKHY'de yuvarlama kuralı yok; 50 kişi eşiğinde güvenli tarafta kalmak için yukarı yuvarlanır (kullanıcı kararı,
// 11 Ekim: 74 m² ÷ 1,5 = 49,3 → 50). Kayan nokta artığı (ör. 50,0000001) yüzünden fazladan bir kişi eklenmesin diye küçük tolerans.
const yukariYuvarla = (x: number) => Math.ceil(x - 1e-9)

// Diğer kullanımın yapıyla ilişki seçenekleri: "yardımcı / ortak alan" yalnız ana kullanıma göre izin verilen sınıflarda,
// "ayrı bir yapıda" yalnız site / yerleşkede çıkar (soru "bu yapıda" diye sorulduğu için tek yapıda anlamsız).
export const iliskiSecenekleri = (esas: SinifKod, s: SinifKod, c: Cevaplar = {}): Secenek[] => {
  const izin = YARDIMCI_OLABILIR[esas]
  const metin = ILISKI_METNI[esas] ?? {}
  return ILISKI
    .filter(o => (o.deger !== 'yardimci' || !izin || izin.includes(s)) && (o.deger !== 'ayri' || coklYapiMi(esas, c)))
    .map(o => ({ ...o, ...metin[o.deger] }))
}
// İlişki cevabı: tek seçenek kalıyorsa soru sorulmaz, o seçenek geçerlidir; seçeneklerde olmayan eski cevap yok sayılır.
export const iliskiCevabi = (esas: SinifKod, s: SinifKod, c: Cevaplar): string | undefined => {
  const secenekler = iliskiSecenekleri(esas, s, c)
  if (secenekler.length === 1) return secenekler[0].deger
  const v = c[`iliski_${s}`]
  return secenekler.some(o => o.deger === v) ? v : undefined
}

// ── Toplanma: kullanıcı yükü ──────────────────────────────────────────────────
export function toplanmaKisi(c: Cevaplar, p = ''): { kisi: number | null; dogrulama: boolean; aciklama: string } {
  const tur = TOPLANMA_TURU.find(t => t.deger === c[`${p}toplanmaTuru`])
  if (!tur) return { kisi: null, dogrulama: false, aciklama: '' }
  if (tur.mod === 'dogrulama') return { kisi: null, dogrulama: true, aciklama: 'Kullanıcı yükü otomatik hesaplanamaz; fonksiyon / proje doğrulaması gerekir' }
  if (tur.mod === 'oturma_ayakta') {
    const o = c[`${p}toplanmaOturma`], a = c[`${p}toplanmaAyakta`]
    if (o === 'bilmiyorum' || a === 'bilmiyorum') return { kisi: null, dogrulama: true, aciklama: 'Alan bilinmediği için kullanıcı yükü hesaplanamadı' }
    if (typeof o !== 'number' || typeof a !== 'number') return { kisi: null, dogrulama: false, aciklama: '' }
    const kisi = yukariYuvarla(o / 1.0 + a / 0.5)
    return { kisi, dogrulama: false, aciklama: `Kullanıcı yükü ≈ ${kisi} kişi (oturma ${o} m² ÷ 1,0 + ayakta ${a} m² ÷ 0,5)` }
  }
  const alan = c[`${p}toplanmaAlani`]
  if (alan === 'bilmiyorum') return { kisi: null, dogrulama: true, aciklama: 'Alan bilinmediği için kullanıcı yükü hesaplanamadı' }
  if (typeof alan !== 'number') return { kisi: null, dogrulama: false, aciklama: '' }
  const kisi = yukariYuvarla(alan / tur.katsayi!)
  return { kisi, dogrulama: false, aciklama: `Kullanıcı yükü ≈ ${kisi} kişi (${alan} m² ${tur.alanTuru} ÷ ${String(tur.katsayi).replace('.', ',')} m²/kişi)` }
}

// ── Akış ──────────────────────────────────────────────────────────────────────
export function akis(d: Degerlendirme): Soru[] {
  const L: Soru[] = []
  const c = d.c
  const e = d.esas
  if (!e) return L
  const need = (q: Soru) => {
    // Ortak yapı sorusu (ör. yapı inşaat alanı) ikinci kullanım için yeniden istenirse listeye tekrar eklenmez.
    if (!L.some(x => x.id === q.id)) L.push(q)
    if (!cevapliMi(q, c[q.id])) throw DUR
  }

  const toplanmaSorulari = (p: string, grup: Soru['grup']) => {
    need({ id: `${p}toplanmaTuru`, tip: 'secim', grup, sinif: 'toplanma', kisaAd: 'Toplanma türü', baslik: 'Toplanma amaçlı kullanımınızın türü nedir?', secenekler: TOPLANMA_TURU, digerYaz: true })
    const tur = TOPLANMA_TURU.find(t => t.deger === c[`${p}toplanmaTuru`])!
    if (tur.mod === 'tek') {
      need({ id: `${p}toplanmaAlani`, tip: 'sayi', grup, sinif: 'toplanma', birim: 'm²', bilinmiyorDugmesi: true, kisaAd: `${tur.etiket} alanı`,
        baslik: `${tur.etiket} bölümünün ${tur.alanTuru} alanı kaç m²?`,
        aciklama: 'Kişi sayısı size sorulmaz; BYKHY Ek-5/A’daki kullanıcı yükü katsayısıyla bu alandan hesaplanır.' })
    } else if (tur.mod === 'oturma_ayakta') {
      need({ id: `${p}toplanmaOturma`, tip: 'sayi', grup, sinif: 'toplanma', birim: 'm²', bilinmiyorDugmesi: true, kisaAd: 'Oturulan alan', baslik: 'Oturulan kısımların net alanı kaç m²?' })
      need({ id: `${p}toplanmaAyakta`, tip: 'sayi', grup, sinif: 'toplanma', birim: 'm²', bilinmiyorDugmesi: true, kisaAd: 'Ayakta durulan alan', baslik: 'Ayakta durulan kısımların net alanı kaç m²?' })
    }
  }
  const yapiSorulari = (siniflar: SinifKod[]) => {
    if (siniflar.includes('konut')) need({ id: 'yukseklik', tip: 'secim', grup: 'yapi', kisaAd: 'Yapı yüksekliği', yardim: 'yukseklik', baslik: 'Yapınızın yapı yüksekliği hangi aralıkta?', aciklama: 'Bu değerlendirmede kat sayısı değil, yapı yüksekliği esas alınır.', secenekler: YUKSEKLIK })
    if (siniflar.includes('konaklama')) {
      const kamping = turGrubu(KONAKLAMA_TURU, c.konaklamaTuru) === 'kamping'
      need({ id: 'oda', tip: 'secim', grup: 'yapi', kisaAd: kamping ? 'Konaklama birimi sayısı' : 'Oda sayısı', yardim: 'oda',
        baslik: kamping ? 'Toplam yatılı konaklama birimi sayısı kaçtır?' : 'Konaklama amacıyla kullanılan toplam oda sayısı kaçtır?',
        aciklama: kamping ? 'Bungalow, çadır, karavan / motokaravan yeri ve benzeri birimler birlikte sayılır.' : 'Günlük doluluk dikkate alınmaz. Konaklama için ayrılmış toplam oda sayısını esas alın.',
        secenekler: turGrubu(KONAKLAMA_TURU, c.konaklamaTuru) === 'yurt' ? [...ODA, ODA_BELIRSIZ] : ODA })
    }
    if (siniflar.some(s => ALAN_SINIFLARI.includes(s))) need({ id: 'alan', tip: 'secim', grup: 'yapi', kisaAd: 'Yapı inşaat alanı', yardim: 'alan', baslik: 'Yapınızın toplam yapı inşaat alanı kaç m²?', aciklama: 'Yalnızca kullandığınız bölümün değil, yapının bütün katlarını kapsayan toplam alan.', secenekler: ALAN })
    // Ticaret: alan bilinmiyorsa tanım gösterilip m² istenir; girilen değer yapının alanı olarak bütün kullanımlara uygulanır.
    if (siniflar.includes('ticaret') && c.alan === 'bilmiyorum') need({ id: 'alanM2', tip: 'sayi', grup: 'yapi', kisaAd: 'Yapı inşaat alanı (m²)', birim: 'm²', bilinmiyorDugmesi: true, baslik: 'Yapı İnşaat Alanı Nedir?', tanim: ALAN_TANIM })
  }
  const toplanmaSayilir = (p: string) => { const t = toplanmaKisi(c, p); return t.dogrulama || t.kisi === null || t.kisi >= TOPLANMA_KISI_ESIGI }

  // Endüstri (ana kullanım p = '', diğer kullanım p = 'd_'): tehlike sınıfı → bilinmiyorsa onaylı projeden → olmazsa Ek-1 C → B → A
  // (Endüstri kilitli akışlar, Ekran 6 / 6.4 / 6.4.1).
  const endustriSorulari = (p: string, grup: Soru['grup']) => {
    if (!p) need({ id: 'endTuru', tip: 'secim', grup, sinif: 'endustri', kisaAd: 'Tesis türü', baslik: 'Endüstriyel tesisinizin türü nedir?', secenekler: [...END_TURU, DIGER_YAZ], digerYaz: true })
    const ad = p ? 'Üretim bölümünün' : 'Tesisinizin'
    need({ id: `${p}endTehlike`, tip: 'secim', grup, sinif: 'endustri', kisaAd: p ? 'Üretim tehlike sınıfı' : 'Tehlike sınıfı', baslik: `${ad} tehlike sınıfını biliyor musunuz?`, aciklama: 'Tehlike sınıfı, tesisinizde yürütülen faaliyetlere ve kullanılan maddelerin özelliklerine göre belirlenir. Biliyorsanız tehlike sınıfınızı seçin. Emin değilseniz “Bilmiyorum” seçeneğiyle devam edebilirsiniz.', secenekler: TEHLIKE })
    if (c[`${p}endTehlike`] !== 'bilmiyorum') return
    need({ id: `${p}endProje`, tip: 'secim', grup, sinif: 'endustri', kisaAd: 'Projeden tehlike sınıfı', baslik: 'Onaylı yangın projenizden tehlike sınıfınızı öğrenebiliyor musunuz?', aciklama: 'Yangın tehlike sınıfınız, varsa onaylı yangın projenizde veya yangın söndürme sistemi tasarım belgelerinizde belirtilmiş olabilir.', secenekler: PROJEDEN })
    if (c[`${p}endProje`] === 'evet') {
      need({ id: `${p}endProjeTehlike`, tip: 'secim', grup, sinif: 'endustri', kisaAd: 'Projedeki tehlike sınıfı', baslik: 'Projenizde belirtilen tehlike sınıfı nedir?', secenekler: TEHLIKE.filter(o => o.deger !== 'bilmiyorum') })
      return
    }
    need({ id: `${p}ek1C`, tip: 'secim', grup, sinif: 'endustri', kisaAd: 'Ek-1/C kontrolü', baslik: 'Faaliyetiniz Yüksek Tehlike kullanım alanları kapsamında mı?', liste: EK1.C, secenekler: EVET_HAYIR })
    if (c[`${p}ek1C`] === 'hayir') need({ id: `${p}ek1B`, tip: 'secim', grup, sinif: 'endustri', kisaAd: 'Ek-1/B kontrolü', baslik: 'Faaliyetiniz Orta Tehlike kullanım alanları kapsamında mı?', liste: EK1.B, secenekler: EVET_HAYIR })
    if (c[`${p}ek1B`] === 'hayir') need({ id: `${p}ek1A`, tip: 'secim', grup, sinif: 'endustri', kisaAd: 'Ek-1/A kontrolü', baslik: 'Tesisiniz Düşük Tehlike şartlarının hepsini sağlıyor mu?', liste: EK1.A, secenekler: EVET_HAYIR })
  }
  // Depolama (ana kullanım p = '', diğer kullanım p = 'd_'): tür → tehlikeli madde → tehlike sınıfı. Ana kullanımda esas olarak tehlikeli
  // madde depolanıyorsa Yüksek Tehlikeli Yer'e yönlendirilir; bölümde ise yüksek tehlikeli bölüm sayılır (3 yıl), tehlike sınıfı sorulmaz.
  const depolamaSorulari = (p: string, grup: Soru['grup']) => {
    need({ id: `${p}depoTuru`, tip: 'secim', grup, sinif: 'depolama', kisaAd: 'Depolama türü', baslik: p ? 'Depolama bölümünde ne depolanıyor veya muhafaza ediliyor?' : 'Ne depolanıyor veya muhafaza ediliyor?', secenekler: [...DEPO_TURU, DIGER_YAZ], digerYaz: true })
    need({ id: `${p}depoMadde`, tip: 'secim', grup, sinif: 'depolama', kisaAd: 'Tehlikeli madde', baslik: 'Depolanan ürünler arasında LPG / parlayıcı gaz, patlayıcı madde, akaryakıt veya yanıcı sıvı var mı?', secenekler: DEPO_MADDE })
    if (c[`${p}depoMadde`] === 'esas') {
      if (!p) need({ id: 'yonlendirDepo', tip: 'bilgi', grup: 'yapi', kisaAd: '', baslik: 'Yüksek Tehlikeli Yer olarak değerlendirilmelidir', aciklama: 'Esas olarak parlayıcı, patlayıcı madde veya akaryakıt depolanan yerler BYKHY Madde 17 kapsamındadır.', eylemler: [{ etiket: 'Yüksek Tehlikeli Yerler olarak devam et', tip: 'esas', sinif: 'yuksek', ek: { yhMod: 'faaliyet', yhIliski: 'esas' } }] })
      return
    }
    need({ id: `${p}depoTehlike`, tip: 'secim', grup, sinif: 'depolama', kisaAd: p ? 'Depo tehlike sınıfı' : 'Tehlike sınıfı', baslik: p ? 'Depolama bölümünün tehlike sınıfını biliyor musunuz?' : 'Tesisinizin tehlike sınıfını biliyor musunuz?', aciklama: 'Onaylı yangın projenizde yazar.', secenekler: TEHLIKE })
  }

  try {
    // 1) Esas kullanıma özel sorular
    if (e === 'konut') {
      need({ id: 'konutTuru', tip: 'secim', grup: 'yapi', sinif: 'konut', kisaAd: 'Konut türü', baslik: 'Konut yapınızı seçin', secenekler: d.kayit ? KONUT_TURU.filter(t => t.deger !== 'site') : KONUT_TURU })
      // Düzeltme 03: türü seçince "Yapınız aşağıdakilerden hangisi?"; sitede önce kullanıcı (oturan / yönetim)
      const tur = KONUT_TURU.find(t => t.deger === c.konutTuru)!
      if (c.konutTuru === 'mustakil' || c.konutTuru === 'apartman') {
        need({ id: 'konutAltTuru', tip: 'secim', grup: 'yapi', sinif: 'konut', kisaAd: 'Konut yapısı', baslik: 'Yapınız aşağıdakilerden hangisi?', ust: { baslik: tur.etiket, aciklama: tur.aciklama }, ikiSutun: true, secenekler: KONUT_ALT_TURU[c.konutTuru as 'mustakil' | 'apartman'] })
      }
      if (c.konutTuru === 'site') {
        need({ id: 'siteKullanici', tip: 'secim', grup: 'yapi', sinif: 'konut', kisaAd: 'Site kullanıcısı', baslik: 'Hangi kullanıcı olarak devam etmek istiyorsunuz?', ust: { baslik: 'SİTENİZİ TANIYALIM' }, aciklama: 'Size uygun soruları gösterebilmemiz için lütfen seçim yapın.', secenekler: SITE_KULLANICI })
        // Site Yönetimi: ayrı sayfa (pages/ucretsiz-kontrol/site-yonetimi.vue; ödeme ekranı şimdilik deneme)
        if (c.siteKullanici === 'yonetim') need({ id: 'siteYonetimi', tip: 'bilgi', grup: 'yapi', kisaAd: '', baslik: 'Site / Yerleşke Yönetimi', aciklama: 'Yapı, Tesis ve Ortak Kullanım Alanlarının Periyodik Kontrol Değerlendirmesi', eylemler: [{ etiket: METIN.cta, tip: 'sayfa', urun: 'site' }] })
        need({ id: 'siteTuru', tip: 'secim', grup: 'yapi', sinif: 'konut', kisaAd: 'Site türü', baslik: 'Yapınız aşağıdakilerden hangisi?', ust: { baslik: tur.etiket, aciklama: tur.aciklama }, secenekler: SITE_TURU })
      }
      if (c.konutTuru === 'site') need({ id: 'blokAdi', tip: 'metin', grup: 'yapi', istegeBagli: true, kisaAd: 'Değerlendirilen blok', baslik: 'Hangi yapıyı / bloğu değerlendirmek istiyorsunuz?', aciklama: 'Site tek bir yapı gibi değerlendirilmez; her blok ayrı değerlendirilir. Blok adı isteğe bağlıdır (ör. A Blok).' })
    } else if (e === 'konaklama') {
      need({ id: 'konaklamaTuru', tip: 'secim', grup: 'yapi', sinif: 'konaklama', kisaAd: 'Konaklama türü', baslik: 'Konaklama tesisinizin türü nedir?', secenekler: [...KONAKLAMA_TURU, DIGER_YAZ], digerYaz: true })
    } else if (e === 'kurumsal') {
      need({ id: 'kurumsalTuru', tip: 'secim', grup: 'yapi', sinif: 'kurumsal', kisaAd: 'Kurumsal türü', baslik: 'Kurumsal yapınızın türü nedir?', aciklama: 'Sınıflandırmada kurumun adı değil, yapının fiilî kullanım amacı esas alınır.', secenekler: [...KURUMSAL_TURU, DIGER_YAZ], digerYaz: true })
      need({ id: 'yerlesim', tip: 'secim', grup: 'yapi', kisaAd: 'Yerleşim', baslik: 'Değerlendirdiğiniz yapı nerede?', secenekler: YERLESIM })
      if (c.yerlesim === 'yerleske') need({ id: 'blokAdi', tip: 'metin', grup: 'yapi', istegeBagli: true, kisaAd: 'Değerlendirilen yapı', baslik: 'Hangi yapıyı değerlendiriyorsunuz?', aciklama: 'Kampüs veya yerleşkedeki her ayrı yapı kendi fiilî kullanımına göre değerlendirilir. Yapı adı isteğe bağlıdır.' })
    } else if (e === 'buro') {
      need({ id: 'buroTuru', tip: 'secim', grup: 'yapi', sinif: 'buro', kisaAd: 'Büro türü', baslik: 'Büro kullanımınızın türü nedir?', secenekler: [...BURO_TURU, DIGER_YAZ], digerYaz: true })
    } else if (e === 'ticaret') {
      need({ id: 'ticaretTuru', tip: 'secim', grup: 'yapi', sinif: 'ticaret', kisaAd: 'Ticari kullanım türü', baslik: 'Ticari kullanımınızın türü nedir?', secenekler: [...TICARET_TURU, DIGER_YAZ], digerYaz: true })
    } else if (e === 'toplanma') {
      toplanmaSorulari('', 'yapi')
      const t = toplanmaKisi(c)
      if (t.kisi !== null && t.kisi < TOPLANMA_KISI_ESIGI) need({ id: 'yonlendirToplanma', tip: 'bilgi', grup: 'yapi', kisaAd: '', baslik: 'Toplanma amaçlı bina olarak değerlendirilmez', aciklama: `${t.aciklama}. BYKHY Madde 15’e göre 50’den az kişinin toplanmasına uygun bölümler esas binanın kullanım sınıfına tabidir. Lütfen binanın esas kullanım sınıfını seçin.`, eylemler: [{ etiket: 'Esas kullanımı yeniden seç', tip: 'sinif-sec' }] })
    } else if (e === 'endustri') {
      endustriSorulari('', 'yapi')
    } else if (e === 'depolama') {
      depolamaSorulari('', 'yapi')
    } else if (e === 'yuksek') {
      need({ id: 'yhFaaliyet', tip: 'secim', grup: 'yapi', sinif: 'yuksek', kisaAd: 'Faaliyet', baslik: 'Tesisinizde hangi tehlikeli madde ile faaliyet yürütülüyor?', secenekler: [...YH_FAALIYET, DIGER_YAZ], digerYaz: true })
      need({ id: 'yhMod', tip: 'secim', grup: 'yapi', kisaAd: 'Faaliyet biçimi', baslik: 'Bu maddeler tesiste nasıl bulunuyor?', secenekler: YH_MOD })
      if (c.yhMod === 'kendi') need({ id: 'yonlendirYH', tip: 'bilgi', grup: 'yapi', kisaAd: '', baslik: 'Tek başına Yüksek Tehlikeli Yer sayılmaz', aciklama: 'BYKHY Madde 17 bu sınıfı imal, depolama, doldurma-boşaltma ve satış ile tanımlar; yalnızca kendi ihtiyacı için kullanmak bu kapsamda değildir. Yapınız esas kullanımına göre değerlendirilir; yakıt / LPG kullanımı detaylı analizde ele alınır.', eylemler: [{ etiket: 'Esas kullanımı yeniden seç', tip: 'sinif-sec' }] })
      need({ id: 'yhIliski', tip: 'secim', grup: 'yapi', kisaAd: 'Esas faaliyet mi', baslik: 'Bu faaliyet tesisin esas faaliyeti mi?', secenekler: YH_ILISKI })
      if (c.yhIliski === 'bolum') need({ id: 'yonlendirYHBolum', tip: 'bilgi', grup: 'yapi', kisaAd: '', baslik: 'Önce yapının esas kullanımını seçin', aciklama: 'Faaliyet başka amaçlı bir yapının bölümüyse, yapının esas kullanımını seçip bu faaliyeti “başka kullanım” adımında Yüksek Tehlikeli Yerler olarak ekleyin.', eylemler: [{ etiket: 'Esas kullanımı yeniden seç', tip: 'sinif-sec' }] })
    }

    // 2) Esas kullanıma ait yapı bilgileri
    yapiSorulari(e === 'toplanma' && !toplanmaSayilir('') ? [] : [e])

    // 3) Diğer kullanımlar (karma kullanım hesaplanmayan ana kullanımlarda ve site envanteri kayıtlarında bu adım yok)
    if (KARMA_YOK.includes(e) || d.kayit) return L
    need({ id: 'digerVar', tip: 'secim', grup: 'diger', kisaAd: 'Başka kullanım', baslik: DIGER_VAR_METNI[e].soru,
      secenekler: [{ deger: 'hayir', etiket: DIGER_VAR_METNI[e].hayir }, { deger: 'evet', etiket: 'Evet, başka kullanım da var' }] })
    if (c.digerVar === 'evet') {
      need({ id: 'digerler', tip: 'coklu', grup: 'diger', kisaAd: 'Diğer kullanımlar', baslik: 'Yapıdaki diğer kullanımları seçin', aciklama: 'Bir veya birden fazla kullanım seçebilirsiniz. Kart örnekleri yönlendirme içindir; kesin sınıf ilgili kullanımın kendi akışında belirlenir.', secenekler: DIGER_KULLANIM_KARTLARI.filter(k => k.sinif !== e) })
      const digerler: SinifKod[] = (c.digerler as string[]).filter(s => s !== 'bilinmiyor') as SinifKod[]
      for (const s of digerler) {
        const iliskiSec = iliskiSecenekleri(e, s, c)
        if (iliskiSec.length > 1) need({ id: `iliski_${s}`, tip: 'secim', grup: 'diger', sinif: s, kisaAd: `${kisa(s)} ile ilişki`, baslik: `${SINIFLAR[s].ad}: yapıyla ilişkisi nedir?`, aciklama: 'Her farklı alan ayrı kullanım değildir.', secenekler: iliskiSec })
        if (iliskiCevabi(e, s, c) !== 'ayni') continue
        if (s === 'toplanma') toplanmaSorulari('d_', 'diger')
        if (s === 'depolama') {
          need({ id: 'd_depoAlani', tip: 'sayi', grup: 'diger', sinif: 'depolama', birim: 'm²', bilinmiyorDugmesi: true, kisaAd: 'Depo alanı', baslik: 'Depolama bölümünün alanı kaç m²?', aciklama: 'BYKHY Madde 16’ya göre bir binanın içindeki 50 m²’den küçük depolama bölümleri esas binanın parçası sayılır.' })
          if (c.d_depoAlani === 'bilmiyorum' || c.d_depoAlani >= DEPO_ALAN_ESIGI) depolamaSorulari('d_', 'diger')
        }
        if (s === 'endustri') endustriSorulari('d_', 'diger')
        if (s === 'yuksek') need({ id: 'd_yhMod', tip: 'secim', grup: 'diger', sinif: 'yuksek', kisaAd: 'Tehlikeli madde faaliyeti', baslik: 'Tehlikeli maddeler bu bölümde nasıl bulunuyor?', secenekler: YH_MOD })
      }
      // Aynı yapıdaki bağımsız kullanımlar için henüz sorulmamış yapı bilgileri
      const ayni = digerler.filter(s => iliskiCevabi(e, s, c) === 'ayni' && (s !== 'toplanma' || toplanmaSayilir('d_')))
      yapiSorulari(ayni)
    }
  } catch (err) {
    if (err !== DUR) throw err
  }
  return L
}

export const mevcutSoru = (d: Degerlendirme): Soru | null => {
  const L = akis(d)
  const son = L[L.length - 1]
  if (!son) return null
  const v = d.c[son.id]
  return cevapliMi(son, v) ? null : son
}

export function cevapEtiketi(q: Soru, v: any, c?: Cevaplar): string {
  if (v === undefined || v === null) return '—'
  const yazi = c?.[`${q.id}_yazi`]
  if (yazi) return v === 'kendim' ? yazi : `${yazi} → ${q.secenekler?.find(s => s.deger === v)?.etiket ?? v}`
  if (q.tip === 'coklu') return (v as string[]).map(x => q.secenekler?.find(s => s.deger === x)?.etiket ?? x).join(', ')
  if (q.tip === 'sayi') return v === 'bilmiyorum' ? 'Bilmiyorum' : `${Number(v).toLocaleString('tr-TR')} ${q.birim ?? ''}`.trim()
  if (q.tip === 'metin') return v ? String(v) : 'Belirtilmedi'
  return q.secenekler?.find(s => s.deger === v)?.etiket ?? String(v)
}

// ── Hesap ─────────────────────────────────────────────────────────────────────
export type KullanimDurumu = 'gecerli' | 'tanimsiz' | 'belirlenemedi' | 'inceleme' | 'ana_parcasi' | 'ayri_yapi' | 'eksik'
// soru: periyot belirlenemediyse sonucu belirleyen sorunun kimliği (sonuç ekranındaki "… Düzenle" düğmesi o soruya döner).
export type KullanimSonucu = { anahtar: string; sinif: SinifKod | null; ad: string; madde: number | null; iliski: 'esas' | 'yardimci' | 'ayni' | 'ayri' | null; periyot: number | null; durum: KullanimDurumu; belirleyici: string; soru?: string }
type SinifCikti = Pick<KullanimSonucu, 'periyot' | 'durum' | 'belirleyici' | 'soru'>
export type Sonuc = {
  kullanimlar: KullanimSonucu[]
  nihai: number | null
  genel: 'tabi' | 'tanimsiz' | 'belirlenemedi'
  surucu: KullanimSonucu[]
  notlar: string[]
  basliklar: string[]
  // Başlık listesinin üstündeki ad, ör. "Apartman + Restoran / Kafe Yangın Güvenliği"
  analizAdi: string
}

const bandaGore = (deger: any, tablo: Record<string, number | null>, etiketler: Secenek[], adi: string): Pick<KullanimSonucu, 'periyot' | 'durum' | 'belirleyici'> => {
  if (deger === undefined) return { periyot: null, durum: 'eksik', belirleyici: '' }
  if (deger === 'bilmiyorum') return { periyot: null, durum: 'belirlenemedi', belirleyici: `${adi} bilinmiyor` }
  const p = tablo[deger] ?? null
  const etiket = etiketler.find(s => s.deger === deger)?.etiket ?? deger
  return { periyot: p, durum: p === null ? 'tanimsiz' : 'gecerli', belirleyici: `${adi}: ${kucuk(etiket)}` }
}
const tehlikeyeGore = (t: any, kaynak = 'Tehlike sınıfı') => {
  if (t === undefined) return { periyot: null, durum: 'eksik' as const, belirleyici: '' }
  if (t === 'bilmiyorum' || !t) return { periyot: null, durum: 'belirlenemedi' as const, belirleyici: 'Tehlike sınıfı kesinleştirilemedi' }
  return { periyot: PERIYOT.tehlike[t] ?? null, durum: 'gecerli' as const, belirleyici: `${kaynak}: ${kucuk(TEHLIKE.find(s => s.deger === t)!.etiket)}` }
}

// Yapı inşaat alanı: aralık seçimi ya da (alan bilinmeyip m² girildiyse) girilen değer. bekle: m² sorusu cevaplanmadıysa eksik say
// (Ticaret'te soruluyor); diğer sınıflarda m² sorulmadığı için "bilmiyorum" geçerli kalır.
const alanSonucu = (c: Cevaplar, bekle: boolean) => {
  if (c.alan === 'bilmiyorum' && typeof c.alanM2 === 'number') {
    const a = bandaGore(c.alanM2 <= 1000 ? 'le_1000' : 'gt_1000', PERIYOT.alan, ALAN, 'Yapı inşaat alanı')
    return { ...a, belirleyici: `Yapı inşaat alanı: ${c.alanM2.toLocaleString('tr-TR')} m²` }
  }
  if (c.alan === 'bilmiyorum' && bekle && c.alanM2 === undefined) return bandaGore(undefined, PERIYOT.alan, ALAN, 'Yapı inşaat alanı')
  return bandaGore(c.alan, PERIYOT.alan, ALAN, 'Yapı inşaat alanı')
}

const EKSIK: SinifCikti = { periyot: null, durum: 'eksik', belirleyici: '' }
// Periyot çıkmadıysa (belirlenemedi / doğrulama) sonucu belirleyen soruyu ekle.
const soruyla = (r: SinifCikti, soru: string): SinifCikti => (['belirlenemedi', 'inceleme'].includes(r.durum) ? { ...r, soru } : r)

// Endüstri: tehlike sınıfı → onaylı projedeki sınıf → Ek-1 C / B / A (p = '' ana kullanım, 'd_' diğer kullanım).
function endustriSonucu(c: Cevaplar, p: string): SinifCikti {
  const t = c[`${p}endTehlike`]
  if (t === undefined) return EKSIK
  if (t !== 'bilmiyorum') return tehlikeyeGore(t)
  if (c[`${p}endProje`] === 'evet') return tehlikeyeGore(c[`${p}endProjeTehlike`], 'Onaylı projedeki tehlike sınıfı')
  if (c[`${p}endProje`] !== 'hayir') return EKSIK
  if (c[`${p}ek1C`] === 'evet') return tehlikeyeGore('yuksek', 'Ek-1/C kapsamında')
  if (c[`${p}ek1B`] === 'evet') return tehlikeyeGore('orta', 'Ek-1/B kapsamında')
  if (c[`${p}ek1A`] === 'evet') return tehlikeyeGore('dusuk', 'Ek-1/A şartlarını sağlıyor')
  if (c[`${p}ek1A`] === 'hayir') return { periyot: null, durum: 'belirlenemedi', belirleyici: 'Tehlike sınıfı bu aşamada kesinleştirilemedi', soru: `${p}endTehlike` }
  return EKSIK
}

// Depolama: tehlike sınıfı (bilinmiyorsa otopark → Ek-1/B orta, otobüs / kamyon / vagon deposu → Ek-1/C yüksek). Tehlikeli madde kısmen
// varsa ya da bilinmiyorsa sınıf doğrulanmalı; yalnız yüksek tehlike (3 yıl, en kısa süre) kesin kalır. Bölümde esas olarak tehlikeli
// madde depolanıyorsa yüksek tehlikeli bölüm: 3 yıl (EK-1 sınır olmaksızın; kullanıcı kararı 11 Ekim).
function depolamaSonucu(c: Cevaplar, p: string): SinifCikti {
  const madde = c[`${p}depoMadde`]
  if (madde === undefined) return EKSIK
  if (madde === 'esas') return p
    ? { periyot: PERIYOT.yuksekTehlike, durum: 'gecerli', belirleyici: 'Esas olarak parlayıcı / patlayıcı madde veya akaryakıt depolanan bölüm: yüksek tehlikeli yer, sınır olmaksızın (BYKHY Md. 17)' }
    : EKSIK
  const tehlike = c[`${p}depoTehlike`], tur = turGrubu(DEPO_TURU, c[`${p}depoTuru`])
  const r: SinifCikti = tehlike === 'bilmiyorum' && tur === 'otopark' ? tehlikeyeGore('orta', 'Ek-1/B “otoparklar”')
    : soruyla(tehlikeyeGore(tehlike), `${p}depoTehlike`)
  if (r.durum !== 'gecerli' || r.periyot === PERIYOT.tehlike.yuksek || !['kismen', 'bilmiyorum'].includes(madde)) return r
  const neden = madde === 'kismen' ? 'tehlikeli madde bulunduğu için' : 'tehlikeli madde bulunup bulunmadığı bilinmediği için'
  return { periyot: null, durum: 'inceleme', belirleyici: `${r.belirleyici}; ${neden} sınıf doğrulanmalı`, soru: `${p}depoMadde` }
}

function sinifSonucu(s: SinifKod, c: Cevaplar, esas: boolean): SinifCikti {
  // Düzeltme 02: kendi yazdığı tür hiçbir sınıfla eşleşmediyse tahmini periyot üretilmez; doğrulama gerekli
  const ts = TUR_SORUSU[s]
  const turId = ts && (esas ? ts.id : ts.digerde ? `d_${ts.id}` : null)
  if (turId && c[turId] === 'kendim' && c[`${turId}_eslesme`] === 'yok') return { periyot: null, durum: 'inceleme', belirleyici: `“${c[`${turId}_yazi`]}”: doğrulama gerekli`, soru: turId }
  const p = esas ? '' : 'd_'
  switch (s) {
    case 'konut': return soruyla(bandaGore(c.yukseklik, PERIYOT.yukseklik, YUKSEKLIK, 'Yapı yüksekliği'), 'yukseklik')
    case 'konaklama':
      if (c.oda === 'belirsiz') return { periyot: null, durum: 'inceleme', belirleyici: 'Koğuş düzeni / oda sayısı belirsiz; yatak veya kişi sayısı oda sayısına çevrilmez', soru: 'oda' }
      return soruyla(bandaGore(c.oda, PERIYOT.oda, ODA, turGrubu(KONAKLAMA_TURU, c.konaklamaTuru) === 'kamping' ? 'Konaklama birimi sayısı' : 'Oda sayısı'), 'oda')
    case 'ticaret': return soruyla(alanSonucu(c, true), 'alan')
    case 'kurumsal': case 'buro': return soruyla(alanSonucu(c, false), 'alan')
    case 'toplanma': {
      const t = toplanmaKisi(c, p)
      const tur = TOPLANMA_TURU.find(x => x.deger === c[`${p}toplanmaTuru`])
      if (t.dogrulama) return { periyot: null, durum: 'inceleme', belirleyici: t.aciklama, soru: tur?.mod === 'dogrulama' ? `${p}toplanmaTuru` : tur?.mod === 'oturma_ayakta' ? `${p}toplanmaOturma` : `${p}toplanmaAlani` }
      if (t.kisi === null) return EKSIK
      if (t.kisi < TOPLANMA_KISI_ESIGI) return { periyot: null, durum: 'ana_parcasi', belirleyici: `${t.aciklama}; 50’nin altında olduğu için esas kullanıma tabi (BYKHY Md. 15)` }
      const a = soruyla(alanSonucu(c, false), 'alan')
      return { ...a, belirleyici: [t.aciklama, a.belirleyici].filter(Boolean).join(' · ') }
    }
    case 'endustri': return endustriSonucu(c, p)
    case 'depolama': {
      if (esas) return depolamaSonucu(c, '')
      if (c.d_depoAlani === undefined) return EKSIK
      if (typeof c.d_depoAlani === 'number' && c.d_depoAlani < DEPO_ALAN_ESIGI) return { periyot: null, durum: 'ana_parcasi', belirleyici: `${c.d_depoAlani} m²; 50 m²’den küçük depo esas binanın parçası (BYKHY Md. 16)` }
      return depolamaSonucu(c, 'd_')
    }
    case 'yuksek': {
      if (!esas) {
        // Aynı yapıdaki bağımsız yüksek tehlikeli bölüm: EK-1 sınır olmaksızın 3 yıl, karma kuralıyla yapıya uygulanır (kullanıcı kararı 11 Ekim).
        if (c.d_yhMod === undefined) return EKSIK
        if (c.d_yhMod === 'kendi') return { periyot: null, durum: 'ana_parcasi', belirleyici: 'Yalnızca kendi ihtiyacı için kullanım; esas kullanıma tabi' }
        if (c.d_yhMod === 'faaliyet') return { periyot: PERIYOT.yuksekTehlike, durum: 'gecerli', belirleyici: 'Bağımsız yüksek tehlikeli bölüm; sınır olmaksızın (BYKHY Md. 17)' }
        return { periyot: null, durum: 'inceleme', belirleyici: 'Tehlikeli maddenin bölümde nasıl bulunduğu bilinmiyor; kontrol süreniz 3 yıla inebilir', soru: 'd_yhMod' }
      }
      if (c.yhIliski === undefined) return EKSIK
      if (c.yhIliski === 'esas') return { periyot: PERIYOT.yuksekTehlike, durum: 'gecerli', belirleyici: 'Yüksek tehlikeli yerlerde sınır olmaksızın' }
      return { periyot: null, durum: 'inceleme', belirleyici: 'Faaliyetin tesisle ilişkisi doğrulanmalı', soru: 'yhIliski' }
    }
  }
}

// ── Detaylı analiz başlıkları ────────────────────────────────────────────────
// Esas kullanım + yapıda birlikte bulunan diğer kullanımlar (bağımsız veya yardımcı; ayrı yapılar hariç), alt türleriyle.
// Alt tür: esas kullanımda sınıfın tür sorusu; diğer kullanımda yalnız sorulanlar (toplanma, depolama). Metinler data/onDegerlendirme.ts.
const TUR_SORUSU: Partial<Record<SinifKod, { id: string; secenekler: Secenek[]; digerde?: boolean }>> = {
  konut: { id: 'konutTuru', secenekler: KONUT_TURU },
  konaklama: { id: 'konaklamaTuru', secenekler: KONAKLAMA_TURU },
  kurumsal: { id: 'kurumsalTuru', secenekler: KURUMSAL_TURU },
  buro: { id: 'buroTuru', secenekler: BURO_TURU },
  ticaret: { id: 'ticaretTuru', secenekler: TICARET_TURU },
  endustri: { id: 'endTuru', secenekler: END_TURU },
  toplanma: { id: 'toplanmaTuru', secenekler: TOPLANMA_TURU, digerde: true },
  depolama: { id: 'depoTuru', secenekler: DEPO_TURU, digerde: true },
  yuksek: { id: 'yhFaaliyet', secenekler: YH_FAALIYET }
}
function analizBasliklari(c: Cevaplar, kullanimlar: KullanimSonucu[]): { basliklar: string[]; ad: string } {
  const birlikte = kullanimlar.filter(k => k.sinif && (k.iliski === 'esas' || k.iliski === 'ayni' || k.iliski === 'yardimci'))
  if (!birlikte.length) return { basliklar: METIN.basliklar, ad: METIN.analizAdiYedek }
  const parcalar = birlikte.map((k) => {
    const s = k.sinif!
    const soru = TUR_SORUSU[s]
    const tur: string | undefined = soru && (k.iliski === 'esas' ? c[soru.id] : soru.digerde ? c[`d_${soru.id}`] : undefined)
    // Düzeltme 02: kullanıcının yazdığı özgün ad aynen kullanılır
    const yazi: string | undefined = (soru && c[`${k.iliski === 'esas' ? soru.id : `d_${soru.id}`}_yazi`]) || (k.iliski === 'esas' ? c.yaziAd : undefined)
    const altTur = s === 'konut' && k.iliski === 'esas' && c.konutTuru !== 'site' ? KONUT_ALT_TURU[c.konutTuru as 'mustakil' | 'apartman']?.find(o => o.deger === c.konutAltTuru)?.etiket : undefined
    const ad = yazi || altTur || (tur && (KULLANIM_KISA_AD[tur] ?? soru!.secenekler.find(o => o.deger === tur)?.etiket)) || SINIF_KISA_AD[s]
    const liste = (tur && ANALIZ_BASLIKLARI[s].tur?.[turGrubu(soru!.secenekler, tur)]) || ANALIZ_BASLIKLARI[s].varsayilan
    return { ad, liste, ayni: k.iliski === 'ayni' }
  })
  const ortak: string[] = []
  if (parcalar.length > 1) {
    const adlar = parcalar.map((p, i) => (i ? kucuk(p.ad) : p.ad))
    const birlesik = adlar.length === 2 ? `${adlar[0]} ile ${adlar[1]}` : `${adlar.slice(0, -1).join(', ')} ve ${adlar[adlar.length - 1]}`
    ortak.push(BIRLIKTE_BASLIKLARI[0]!.replace('{A}', birlesik))
    if (parcalar.some(p => p.ayni)) ortak.push(BIRLIKTE_BASLIKLARI[1]!)
  }
  // En fazla ANALIZ_BASLIK_SINIRI başlık: ortak başlıklar her zaman kalır; kullanımlardan önce her birinin 1., yer kalırsa 2. başlığı.
  const yer = ANALIZ_BASLIK_SINIRI - ortak.length
  const kullanimBasliklari: string[] = []
  for (let sira = 0; sira < 2; sira++) {
    for (const p of parcalar) {
      const b = p.liste[sira]
      if (b && !kullanimBasliklari.includes(b) && kullanimBasliklari.length < yer) kullanimBasliklari.push(b)
    }
  }
  // Ekranda kullanım sırasıyla (esas önce) dursun.
  const sirali = parcalar.flatMap(p => p.liste.filter(b => kullanimBasliklari.includes(b)))
  // Başlıkta her kelime büyük harfle başlar: "ticari alan" → "Ticari Alan"
  const buyukHarf = (t: string) => t.split(' ').map(w => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1)).join(' ')
  const ad = `${[...new Set(parcalar.map(p => buyukHarf(p.ad)))].join(' + ')} ${METIN.analizAdiSonu}`
  return { basliklar: [...new Set([...sirali, ...ortak])], ad }
}

export function hesapla(d: Degerlendirme): Sonuc {
  const c = d.c
  const kullanimlar: KullanimSonucu[] = []
  if (d.esas) {
    kullanimlar.push({ anahtar: 'esas', sinif: d.esas, ad: SINIFLAR[d.esas].ad, madde: SINIFLAR[d.esas].madde, iliski: 'esas', ...sinifSonucu(d.esas, c, true) })
  }
  if (c.digerVar === 'evet' && Array.isArray(c.digerler) && !KARMA_YOK.includes(d.esas!)) {
    for (const k of c.digerler as string[]) {
      if (k === 'bilinmiyor') { kullanimlar.push({ anahtar: k, sinif: null, ad: 'Kullanım türü bilinmeyen alan', madde: null, iliski: null, periyot: null, durum: 'belirlenemedi', belirleyici: 'Kullanım türü belirlenemedi', soru: 'digerler' }); continue }
      const s = k as SinifKod
      const iliski = iliskiCevabi(d.esas!, s, c) as KullanimSonucu['iliski'] | undefined
      const temel = { anahtar: s, sinif: s, ad: SINIFLAR[s].ad, madde: SINIFLAR[s].madde, iliski: iliski ?? null }
      if (!iliski) kullanimlar.push({ ...temel, periyot: null, durum: 'eksik', belirleyici: '' })
      else if (iliski === 'yardimci') kullanimlar.push({ ...temel, periyot: null, durum: 'ana_parcasi', belirleyici: 'Yardımcı / ortak alan; ana kullanımla birlikte değerlendirildi' })
      else if (iliski === 'ayri') kullanimlar.push({ ...temel, periyot: null, durum: 'ayri_yapi', belirleyici: 'Ayrı yapı; kendi yapısı olarak ayrıca değerlendirilir' })
      else kullanimlar.push({ ...temel, ...sinifSonucu(s, c, false) })
    }
  }
  const etkin = kullanimlar.filter(k => k.iliski === 'esas' || k.iliski === 'ayni' || k.iliski === null)
  const gecerli = etkin.filter(k => k.durum === 'gecerli' && k.periyot !== null)
  const nihai = gecerli.length ? Math.min(...gecerli.map(k => k.periyot!)) : null
  const belirsiz = etkin.filter(k => ['belirlenemedi', 'inceleme', 'eksik'].includes(k.durum))
  const genel: Sonuc['genel'] = nihai !== null ? 'tabi' : belirsiz.length || !etkin.length ? 'belirlenemedi' : 'tanimsiz'
  const notlar: string[] = []
  const ayniSayisi = kullanimlar.filter(k => k.iliski === 'ayni' && k.durum === 'gecerli').length
  if (nihai !== null && ayniSayisi && gecerli.length > 1) notlar.push(METIN.karma)
  if (nihai !== null && belirsiz.length) notlar.push('Bazı kullanımların periyodu belirlenemedi; bu bilgiler netleşince süre daha kısa olabilir.')
  if (kullanimlar.some(k => k.durum === 'ana_parcasi')) notlar.push(METIN.yardimci)
  if (kullanimlar.some(k => k.durum === 'ayri_yapi')) notlar.push(METIN.ayriYapi)
  if (genel === 'tanimsiz') notlar.push(METIN.tanimsizNot)
  return { kullanimlar, nihai, genel, surucu: gecerli.filter(k => k.periyot === nihai), notlar, ...(({ basliklar, ad }) => ({ basliklar, analizAdi: ad }))(analizBasliklari(c, kullanimlar)) }
}
