// ÜCRETSİZ ÖN DEĞERLENDİRME — KARAR MOTORU (saf fonksiyonlar; ileride aynen firetech backend'ine taşınacak)
// akis(): verilen cevaplara göre sorulması gereken soruları sırayla üretir (ilk cevapsız soruda durur).
// hesapla(): kullanımların ve yapının periyodunu hesaplar (cevaplar eksikken de anlık çalışır).
import {
  SINIFLAR, PERIYOT, TOPLANMA_KISI_ESIGI, DEPO_ALAN_ESIGI, YUKSEKLIK, ALAN, ODA, TEHLIKE, EVET_HAYIR, KONUT_TURU, KONAKLAMA_TURU,
  KURUMSAL_TURU, YERLESIM, TOPLANMA_TURU, EK1, DEPO_TURU, DEPO_MADDE, YH_FAALIYET, YH_MOD, YH_ILISKI, DIGER_KULLANIM_KARTLARI, ILISKI,
  METIN, type SinifKod, type Secenek
} from '~/data/onDegerlendirme'

export type Cevaplar = Record<string, any>
export type Degerlendirme = { esas: SinifKod | null; c: Cevaplar }

export type Eylem = { etiket: string; tip: 'esas' | 'sinif-sec'; sinif?: SinifKod; ek?: Cevaplar }
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
  birim?: string
  bilinmiyorDugmesi?: boolean
  istegeBagli?: boolean
  eylemler?: Eylem[]
  sinif?: SinifKod
}

const ALAN_SINIFLARI: SinifKod[] = ['kurumsal', 'buro', 'ticaret', 'toplanma']
const DUR = Symbol('dur')
const kisa = (s: SinifKod) => SINIFLAR[s].kisa
const kucuk = (s: string) => s.toLocaleLowerCase('tr')
const doluMu = (v: any) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)

// ── Toplanma: kullanıcı yükü ──────────────────────────────────────────────────
export function toplanmaKisi(c: Cevaplar, p = ''): { kisi: number | null; dogrulama: boolean; aciklama: string } {
  const tur = TOPLANMA_TURU.find(t => t.deger === c[`${p}toplanmaTuru`])
  if (!tur) return { kisi: null, dogrulama: false, aciklama: '' }
  if (tur.mod === 'dogrulama') return { kisi: null, dogrulama: true, aciklama: 'Kullanıcı yükü otomatik hesaplanamaz; fonksiyon / proje doğrulaması gerekir' }
  if (tur.mod === 'oturma_ayakta') {
    const o = c[`${p}toplanmaOturma`], a = c[`${p}toplanmaAyakta`]
    if (o === 'bilmiyorum' || a === 'bilmiyorum') return { kisi: null, dogrulama: true, aciklama: 'Alan bilinmediği için kullanıcı yükü hesaplanamadı' }
    if (typeof o !== 'number' || typeof a !== 'number') return { kisi: null, dogrulama: false, aciklama: '' }
    const kisi = Math.floor(o / 1.0 + a / 0.5)
    return { kisi, dogrulama: false, aciklama: `Kullanıcı yükü ≈ ${kisi} kişi (oturma ${o} m² ÷ 1,0 + ayakta ${a} m² ÷ 0,5)` }
  }
  const alan = c[`${p}toplanmaAlani`]
  if (alan === 'bilmiyorum') return { kisi: null, dogrulama: true, aciklama: 'Alan bilinmediği için kullanıcı yükü hesaplanamadı' }
  if (typeof alan !== 'number') return { kisi: null, dogrulama: false, aciklama: '' }
  const kisi = Math.floor(alan / tur.katsayi!)
  return { kisi, dogrulama: false, aciklama: `Kullanıcı yükü ≈ ${kisi} kişi (${alan} m² ${tur.alanTuru} ÷ ${String(tur.katsayi).replace('.', ',')} m²/kişi)` }
}

// ── Akış ──────────────────────────────────────────────────────────────────────
export function akis(d: Degerlendirme): Soru[] {
  const L: Soru[] = []
  const c = d.c
  const e = d.esas
  if (!e) return L
  const need = (q: Soru) => {
    L.push(q)
    if (q.tip === 'bilgi') throw DUR
    const v = c[q.id]
    if (q.tip === 'metin' ? v === undefined : !doluMu(v)) throw DUR
  }

  const toplanmaSorulari = (p: string, grup: Soru['grup']) => {
    need({ id: `${p}toplanmaTuru`, tip: 'secim', grup, sinif: 'toplanma', kisaAd: 'Toplanma türü', baslik: 'Toplanma amaçlı kullanımınızın türü nedir?', secenekler: TOPLANMA_TURU })
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
      const kamping = c.konaklamaTuru === 'kamping'
      need({ id: 'oda', tip: 'secim', grup: 'yapi', kisaAd: kamping ? 'Konaklama birimi sayısı' : 'Oda sayısı', yardim: 'oda',
        baslik: kamping ? 'Toplam yatılı konaklama birimi sayısı kaçtır?' : 'Konaklama amacıyla kullanılan toplam oda sayısı kaçtır?',
        aciklama: kamping ? 'Bungalow, çadır, karavan / motokaravan yeri ve benzeri birimler birlikte sayılır.' : 'Günlük doluluk dikkate alınmaz. Konaklama için ayrılmış toplam oda sayısını esas alın.', secenekler: ODA })
    }
    if (siniflar.some(s => ALAN_SINIFLARI.includes(s))) need({ id: 'alan', tip: 'secim', grup: 'yapi', kisaAd: 'Yapı inşaat alanı', yardim: 'alan', baslik: 'Yapınızın toplam yapı inşaat alanı kaç m²?', aciklama: 'Yalnızca kullandığınız bölümün değil, yapının bütün katlarını kapsayan toplam alan.', secenekler: ALAN })
  }
  const toplanmaSayilir = (p: string) => { const t = toplanmaKisi(c, p); return t.dogrulama || t.kisi === null || t.kisi >= TOPLANMA_KISI_ESIGI }

  try {
    // 1) Esas kullanıma özel sorular
    if (e === 'konut') {
      need({ id: 'konutTuru', tip: 'secim', grup: 'yapi', sinif: 'konut', kisaAd: 'Konut türü', baslik: 'Konut yapınızı seçin', secenekler: KONUT_TURU })
      if (c.konutTuru === 'site') need({ id: 'blokAdi', tip: 'metin', grup: 'yapi', istegeBagli: true, kisaAd: 'Değerlendirilen blok', baslik: 'Hangi yapıyı / bloğu değerlendirmek istiyorsunuz?', aciklama: 'Site tek bir yapı gibi değerlendirilmez; her blok ayrı değerlendirilir. Blok adı isteğe bağlıdır (ör. A Blok).' })
    } else if (e === 'konaklama') {
      need({ id: 'konaklamaTuru', tip: 'secim', grup: 'yapi', sinif: 'konaklama', kisaAd: 'Konaklama türü', baslik: 'Konaklama tesisinizin türü nedir?', secenekler: KONAKLAMA_TURU })
    } else if (e === 'kurumsal') {
      need({ id: 'kurumsalTuru', tip: 'secim', grup: 'yapi', sinif: 'kurumsal', kisaAd: 'Kurumsal türü', baslik: 'Kurumsal yapınızın türü nedir?', aciklama: 'Sınıflandırmada kurumun adı değil, yapının fiilî kullanım amacı esas alınır.', secenekler: KURUMSAL_TURU })
      if (c.kurumsalTuru === 'muayenehane') need({ id: 'yonlendirMuayenehane', tip: 'bilgi', grup: 'yapi', kisaAd: '', baslik: 'Muayenehane Büro Binaları kapsamındadır', aciklama: 'Doktor veya diş hekimi muayenehanesi, adı sağlık faaliyeti olsa da BYKHY Madde 12’ye göre Büro Binaları kapsamında değerlendirilir.', eylemler: [{ etiket: 'Büro Binaları olarak devam et', tip: 'esas', sinif: 'buro' }] })
      need({ id: 'yerlesim', tip: 'secim', grup: 'yapi', kisaAd: 'Yerleşim', baslik: 'Değerlendirdiğiniz yapı nerede?', secenekler: YERLESIM })
      if (c.yerlesim === 'yerleske') need({ id: 'blokAdi', tip: 'metin', grup: 'yapi', istegeBagli: true, kisaAd: 'Değerlendirilen yapı', baslik: 'Hangi yapıyı değerlendiriyorsunuz?', aciklama: 'Kampüs veya yerleşkedeki her ayrı yapı kendi fiilî kullanımına göre değerlendirilir. Yapı adı isteğe bağlıdır.' })
    } else if (e === 'toplanma') {
      toplanmaSorulari('', 'yapi')
      const t = toplanmaKisi(c)
      if (t.kisi !== null && t.kisi < TOPLANMA_KISI_ESIGI) need({ id: 'yonlendirToplanma', tip: 'bilgi', grup: 'yapi', kisaAd: '', baslik: 'Toplanma amaçlı bina olarak değerlendirilmez', aciklama: `${t.aciklama}. BYKHY Madde 15’e göre 50’den az kişinin toplanmasına uygun bölümler esas binanın kullanım sınıfına tabidir. Lütfen binanın esas kullanım sınıfını seçin.`, eylemler: [{ etiket: 'Esas kullanımı yeniden seç', tip: 'sinif-sec' }] })
    } else if (e === 'endustri') {
      need({ id: 'endTehlike', tip: 'secim', grup: 'yapi', sinif: 'endustri', kisaAd: 'Tehlike sınıfı', baslik: 'Tesisinizin tehlike sınıfını biliyor musunuz?', aciklama: 'Tehlike sınıfınızı onaylı yangın projenizden kontrol edebilirsiniz. EK-6’da da mevcut kullanımın projedeki tehlike sınıfına uygunluğu ayrıca kontrol edilir.', secenekler: TEHLIKE })
      if (c.endTehlike === 'bilmiyorum') {
        need({ id: 'ek1C', tip: 'secim', grup: 'yapi', kisaAd: 'Ek-1/C kontrolü', baslik: 'Faaliyetiniz Yüksek Tehlike kullanım alanları kapsamında mı?', liste: EK1.C, secenekler: EVET_HAYIR })
        if (c.ek1C === 'hayir') need({ id: 'ek1B', tip: 'secim', grup: 'yapi', kisaAd: 'Ek-1/B kontrolü', baslik: 'Faaliyetiniz Orta Tehlike kullanım alanları kapsamında mı?', liste: EK1.B, secenekler: EVET_HAYIR })
        if (c.ek1B === 'hayir') need({ id: 'ek1A', tip: 'secim', grup: 'yapi', kisaAd: 'Ek-1/A kontrolü', baslik: 'Tesisiniz Düşük Tehlike şartlarının hepsini sağlıyor mu?', liste: EK1.A, secenekler: EVET_HAYIR })
      }
    } else if (e === 'depolama') {
      need({ id: 'depoTuru', tip: 'secim', grup: 'yapi', sinif: 'depolama', kisaAd: 'Depolama türü', baslik: 'Ne depolanıyor veya muhafaza ediliyor?', secenekler: DEPO_TURU })
      need({ id: 'depoMadde', tip: 'secim', grup: 'yapi', kisaAd: 'Tehlikeli madde', baslik: 'Depolanan ürünler arasında LPG / parlayıcı gaz, patlayıcı madde, akaryakıt veya yanıcı sıvı var mı?', secenekler: DEPO_MADDE })
      if (c.depoMadde === 'esas') need({ id: 'yonlendirDepo', tip: 'bilgi', grup: 'yapi', kisaAd: '', baslik: 'Yüksek Tehlikeli Yer olarak değerlendirilmelidir', aciklama: 'Esas olarak parlayıcı, patlayıcı madde veya akaryakıt depolanan yerler BYKHY Madde 17 kapsamındadır.', eylemler: [{ etiket: 'Yüksek Tehlikeli Yerler olarak devam et', tip: 'esas', sinif: 'yuksek', ek: { yhMod: 'faaliyet', yhIliski: 'esas' } }] })
      need({ id: 'depoTehlike', tip: 'secim', grup: 'yapi', kisaAd: 'Tehlike sınıfı', baslik: 'Tesisinizin tehlike sınıfını biliyor musunuz?', aciklama: 'Onaylı yangın projenizde yazar.', secenekler: TEHLIKE })
    } else if (e === 'yuksek') {
      need({ id: 'yhFaaliyet', tip: 'secim', grup: 'yapi', sinif: 'yuksek', kisaAd: 'Faaliyet', baslik: 'Tesisinizde hangi tehlikeli madde ile faaliyet yürütülüyor?', secenekler: YH_FAALIYET })
      need({ id: 'yhMod', tip: 'secim', grup: 'yapi', kisaAd: 'Faaliyet biçimi', baslik: 'Bu maddeler tesiste nasıl bulunuyor?', secenekler: YH_MOD })
      if (c.yhMod === 'kendi') need({ id: 'yonlendirYH', tip: 'bilgi', grup: 'yapi', kisaAd: '', baslik: 'Tek başına Yüksek Tehlikeli Yer sayılmaz', aciklama: 'BYKHY Madde 17 bu sınıfı imal, depolama, doldurma-boşaltma ve satış ile tanımlar; yalnızca kendi ihtiyacı için kullanmak bu kapsamda değildir. Yapınız esas kullanımına göre değerlendirilir; yakıt / LPG kullanımı detaylı analizde ele alınır.', eylemler: [{ etiket: 'Esas kullanımı yeniden seç', tip: 'sinif-sec' }] })
      need({ id: 'yhIliski', tip: 'secim', grup: 'yapi', kisaAd: 'Esas faaliyet mi', baslik: 'Bu faaliyet tesisin esas faaliyeti mi?', secenekler: YH_ILISKI })
      if (c.yhIliski === 'bolum') need({ id: 'yonlendirYHBolum', tip: 'bilgi', grup: 'yapi', kisaAd: '', baslik: 'Önce yapının esas kullanımını seçin', aciklama: 'Faaliyet başka amaçlı bir yapının bölümüyse, yapının esas kullanımını seçip bu faaliyeti “başka kullanım” adımında Yüksek Tehlikeli Yerler olarak ekleyin.', eylemler: [{ etiket: 'Esas kullanımı yeniden seç', tip: 'sinif-sec' }] })
    }

    // 2) Esas kullanıma ait yapı bilgileri
    yapiSorulari(e === 'toplanma' && !toplanmaSayilir('') ? [] : [e])

    // 3) Diğer kullanımlar
    const esasAd = kucuk(kisa(e))
    need({ id: 'digerVar', tip: 'secim', grup: 'diger', kisaAd: 'Başka kullanım', baslik: `Bu yapıda ${esasAd} dışında başka bir kullanım bulunuyor mu?`,
      secenekler: [{ deger: 'hayir', etiket: `Hayır, yalnızca ${esasAd} olarak kullanılıyor` }, { deger: 'evet', etiket: 'Evet, başka kullanım da var' }] })
    if (c.digerVar === 'evet') {
      need({ id: 'digerler', tip: 'coklu', grup: 'diger', kisaAd: 'Diğer kullanımlar', baslik: 'Yapıdaki diğer kullanımları seçin', aciklama: 'Bir veya birden fazla kullanım seçebilirsiniz. Kart örnekleri yönlendirme içindir; kesin sınıf ilgili kullanımın kendi akışında belirlenir.', secenekler: DIGER_KULLANIM_KARTLARI.filter(k => k.sinif !== e) })
      const digerler: SinifKod[] = (c.digerler as string[]).filter(s => s !== 'bilinmiyor') as SinifKod[]
      for (const s of digerler) {
        need({ id: `iliski_${s}`, tip: 'secim', grup: 'diger', sinif: s, kisaAd: `${kisa(s)} ile ilişki`, baslik: `${SINIFLAR[s].ad}: yapıyla ilişkisi nedir?`, aciklama: 'Her farklı alan ayrı kullanım değildir.', secenekler: ILISKI })
        if (c[`iliski_${s}`] !== 'ayni') continue
        if (s === 'toplanma') toplanmaSorulari('d_', 'diger')
        if (s === 'depolama') {
          need({ id: 'd_depoAlani', tip: 'sayi', grup: 'diger', sinif: 'depolama', birim: 'm²', bilinmiyorDugmesi: true, kisaAd: 'Depo alanı', baslik: 'Depolama bölümünün alanı kaç m²?', aciklama: 'BYKHY Madde 16’ya göre bir binanın içindeki 50 m²’den küçük depolama bölümleri esas binanın parçası sayılır.' })
          if (c.d_depoAlani === 'bilmiyorum' || c.d_depoAlani >= DEPO_ALAN_ESIGI) need({ id: 'd_depoTehlike', tip: 'secim', grup: 'diger', sinif: 'depolama', kisaAd: 'Depo tehlike sınıfı', baslik: 'Depolama bölümünün tehlike sınıfını biliyor musunuz?', aciklama: 'Onaylı yangın projenizde yazar.', secenekler: TEHLIKE })
        }
        if (s === 'endustri') need({ id: 'd_endTehlike', tip: 'secim', grup: 'diger', sinif: 'endustri', kisaAd: 'Üretim tehlike sınıfı', baslik: 'Üretim bölümünün tehlike sınıfını biliyor musunuz?', aciklama: 'Onaylı yangın projenizde yazar.', secenekler: TEHLIKE })
        if (s === 'yuksek') need({ id: 'd_yhMod', tip: 'secim', grup: 'diger', sinif: 'yuksek', kisaAd: 'Tehlikeli madde faaliyeti', baslik: 'Tehlikeli maddeler bu bölümde nasıl bulunuyor?', secenekler: YH_MOD })
      }
      // Aynı yapıdaki bağımsız kullanımlar için henüz sorulmamış yapı bilgileri
      const ayni = digerler.filter(s => c[`iliski_${s}`] === 'ayni' && (s !== 'toplanma' || toplanmaSayilir('d_')))
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
  const cevapli = son.tip === 'bilgi' ? false : son.tip === 'metin' ? v !== undefined : doluMu(v)
  return cevapli ? null : son
}

export function cevapEtiketi(q: Soru, v: any): string {
  if (v === undefined || v === null) return '—'
  if (q.tip === 'coklu') return (v as string[]).map(x => q.secenekler?.find(s => s.deger === x)?.etiket ?? x).join(', ')
  if (q.tip === 'sayi') return v === 'bilmiyorum' ? 'Bilmiyorum' : `${Number(v).toLocaleString('tr-TR')} ${q.birim ?? ''}`.trim()
  if (q.tip === 'metin') return v ? String(v) : 'Belirtilmedi'
  return q.secenekler?.find(s => s.deger === v)?.etiket ?? String(v)
}

// ── Hesap ─────────────────────────────────────────────────────────────────────
export type KullanimDurumu = 'gecerli' | 'tanimsiz' | 'belirlenemedi' | 'inceleme' | 'ana_parcasi' | 'ayri_yapi' | 'eksik'
export type KullanimSonucu = { anahtar: string; sinif: SinifKod | null; ad: string; madde: number | null; iliski: 'esas' | 'yardimci' | 'ayni' | 'ayri' | null; periyot: number | null; durum: KullanimDurumu; belirleyici: string }
export type Sonuc = {
  kullanimlar: KullanimSonucu[]
  nihai: number | null
  genel: 'tabi' | 'tanimsiz' | 'belirlenemedi'
  surucu: KullanimSonucu[]
  notlar: string[]
  basliklar: string[]
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

function sinifSonucu(s: SinifKod, c: Cevaplar, esas: boolean): Pick<KullanimSonucu, 'periyot' | 'durum' | 'belirleyici'> {
  const p = esas ? '' : 'd_'
  switch (s) {
    case 'konut': return bandaGore(c.yukseklik, PERIYOT.yukseklik, YUKSEKLIK, 'Yapı yüksekliği')
    case 'konaklama': return bandaGore(c.oda, PERIYOT.oda, ODA, c.konaklamaTuru === 'kamping' ? 'Konaklama birimi sayısı' : 'Oda sayısı')
    case 'kurumsal': case 'buro': case 'ticaret': return bandaGore(c.alan, PERIYOT.alan, ALAN, 'Yapı inşaat alanı')
    case 'toplanma': {
      const t = toplanmaKisi(c, p)
      if (t.dogrulama) return { periyot: null, durum: 'inceleme', belirleyici: t.aciklama }
      if (t.kisi === null) return { periyot: null, durum: 'eksik', belirleyici: '' }
      if (t.kisi < TOPLANMA_KISI_ESIGI) return { periyot: null, durum: 'ana_parcasi', belirleyici: `${t.aciklama}; 50’nin altında olduğu için esas kullanıma tabi (BYKHY Md. 15)` }
      const a = bandaGore(c.alan, PERIYOT.alan, ALAN, 'Yapı inşaat alanı')
      return { ...a, belirleyici: [t.aciklama, a.belirleyici].filter(Boolean).join(' · ') }
    }
    case 'endustri': {
      if (!esas) return tehlikeyeGore(c.d_endTehlike)
      if (c.endTehlike !== 'bilmiyorum') return tehlikeyeGore(c.endTehlike)
      if (c.ek1C === 'evet') return tehlikeyeGore('yuksek', 'Ek-1/C kapsamında')
      if (c.ek1B === 'evet') return tehlikeyeGore('orta', 'Ek-1/B kapsamında')
      if (c.ek1A === 'evet') return tehlikeyeGore('dusuk', 'Ek-1/A şartlarını sağlıyor')
      if (c.ek1A === 'hayir') return { periyot: null, durum: 'belirlenemedi', belirleyici: 'Tehlike sınıfı bu aşamada kesinleştirilemedi' }
      return { periyot: null, durum: 'eksik', belirleyici: '' }
    }
    case 'depolama': {
      if (!esas) {
        if (c.d_depoAlani === undefined) return { periyot: null, durum: 'eksik', belirleyici: '' }
        if (typeof c.d_depoAlani === 'number' && c.d_depoAlani < DEPO_ALAN_ESIGI) return { periyot: null, durum: 'ana_parcasi', belirleyici: `${c.d_depoAlani} m²; 50 m²’den küçük depo esas binanın parçası (BYKHY Md. 16)` }
        return tehlikeyeGore(c.d_depoTehlike)
      }
      if (c.depoTehlike === 'bilmiyorum') {
        if (c.depoTuru === 'otopark') return tehlikeyeGore('orta', 'Ek-1/B “otoparklar”')
        if (c.depoTuru === 'agir_vasita') return tehlikeyeGore('yuksek', 'Ek-1/C otobüs / kamyon / vagon depoları')
      }
      const r = tehlikeyeGore(c.depoTehlike)
      return c.depoMadde === 'kismen' && r.durum === 'gecerli' ? { ...r, durum: 'inceleme', periyot: null, belirleyici: `${r.belirleyici}; tehlikeli madde bulunduğu için sınıf doğrulanmalı` } : r
    }
    case 'yuksek': {
      if (!esas) {
        if (c.d_yhMod === undefined) return { periyot: null, durum: 'eksik', belirleyici: '' }
        if (c.d_yhMod === 'kendi') return { periyot: null, durum: 'ana_parcasi', belirleyici: 'Yalnızca kendi ihtiyacı için kullanım; esas kullanıma tabi' }
        return { periyot: null, durum: 'inceleme', belirleyici: 'Bölüm olarak bulunan yüksek tehlikeli faaliyet; kontrol süreniz kısalabilir, detaylı analizde netleşir' }
      }
      if (c.yhIliski === undefined) return { periyot: null, durum: 'eksik', belirleyici: '' }
      if (c.yhIliski === 'esas') return { periyot: PERIYOT.yuksekTehlike, durum: 'gecerli', belirleyici: 'Yüksek tehlikeli yerlerde sınır olmaksızın' }
      return { periyot: null, durum: 'inceleme', belirleyici: 'Faaliyetin tesisle ilişkisi doğrulanmalı' }
    }
  }
}

export function hesapla(d: Degerlendirme): Sonuc {
  const c = d.c
  const kullanimlar: KullanimSonucu[] = []
  if (d.esas) {
    kullanimlar.push({ anahtar: 'esas', sinif: d.esas, ad: SINIFLAR[d.esas].ad, madde: SINIFLAR[d.esas].madde, iliski: 'esas', ...sinifSonucu(d.esas, c, true) })
  }
  if (c.digerVar === 'evet' && Array.isArray(c.digerler)) {
    for (const k of c.digerler as string[]) {
      if (k === 'bilinmiyor') { kullanimlar.push({ anahtar: k, sinif: null, ad: 'Kullanım türü bilinmeyen alan', madde: null, iliski: null, periyot: null, durum: 'belirlenemedi', belirleyici: 'Kullanım türü belirlenemedi' }); continue }
      const s = k as SinifKod
      const iliski = c[`iliski_${s}`] as KullanimSonucu['iliski'] | undefined
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
  const siniflar = [...new Set(etkin.map(k => k.sinif).filter(Boolean))] as SinifKod[]
  const ozel = siniflar.length === 1 ? `${kisa(siniflar[0]!)} kullanımına özgü yangın güvenliği şartları` : 'Seçilen kullanım türlerine özgü yangın güvenliği şartları'
  return { kullanimlar, nihai, genel, surucu: gecerli.filter(k => k.periyot === nihai), notlar, basliklar: [...METIN.basliklar, ozel] }
}
