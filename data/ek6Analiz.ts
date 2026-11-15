// Ücretli EK-6 analiz ekranı metinleri. TASLAK (Claude, 16 Kasım 2026): Oğuz onayına kadar yalnız test hesabında görünür
// (backend onaylı kural yoksa analizi açmaz). UYARI spesifikasyon §13'ten aynen (Büro / Konaklama / Kurumsal sürümü).
export const EK6_METIN = {
  baslik: 'Detaylı Yangın Güvenliği Analizi',
  testUyari: 'Test hesabı: onaylanmamış taslak sorular da gösteriliyor. Sonuç müşteriye gösterilemez.',
  adimlar: { yapi: 'Yapı bilgileri', sistemler: 'Sistemler', kurallar: 'Kontrol soruları', tamam: 'Sonuç' },
  yapiAciklama: 'Yapınızla ilgili birkaç bilgi. Bilmediğiniz soruda “Bilmiyorum” seçebilirsiniz.',
  sistemAciklama: 'Binanızda aşağıdaki sistemlerden hangileri var?',
  kuralAciklama: 'Her madde için binanızın bugünkü durumunu seçin.',
  bilinenAralik: 'Ücretsiz değerlendirmedeki cevabınız',
  bilmiyorum: 'Bilmiyorum',
  devam: 'Kaydet ve Devam Et',
  kalanSoru: (n: number) => `${n} soru kaldı`,
  hazir: 'Bütün sorular cevaplandı.',
  tamamla: 'Analizi Tamamla',
  hazirlikBaslik: 'Yangın Güvenliği Hazırlık Durumu',
  hazirlikYok: 'Hazırlık durumu hesaplanamadı: cevaplanan madde yok.',
  yapilacaklar: 'Öncelikli yapılacaklar',
  bilinmeyenler: 'Bilinmeyenler (teknik doğrulama gerekli)',
  dogrulama: 'Zorunluluğu doğrulanması gereken sistemler',
  uygulanmiyor: 'Uygulanmadığını belirttiğiniz maddeler',
  hazirMaddeler: 'Hazır görünen maddeler',
  belgeler: 'Hazırlanması önerilen belgeler',
  dayanak: 'Dayanak',
  zorunluSistem: 'Bu yapıda zorunlu sistem',
  notlar: {
    md144: 'Mevcut binalar için yönetmelikte ayrı hüküm yok; yetkili idarenin görüşü alınmalı.',
    dogrulama: 'Mevzuat yorumu uzman tarafından doğrulanmalı.',
    eksikBilgi: 'Zorunluluk, verilmeyen bilgiye bağlı.'
  },
  uyari: 'Bu çalışma resmî periyodik kontrol raporu, itfaiye uygunluk raporu veya yetkili idare görüşü değildir; kullanıcı tarafından verilen bilgiler üzerinden yangın güvenliği hazırlık değerlendirmesi sunar.',
  geri: 'Ödemelerim'
}

export const EK6_CEVAP: Record<string, string> = { evet: 'Evet', hayir: 'Hayır', bilmiyorum: 'Bilmiyorum', uygulanmiyor: 'Uygulanmıyor' }

export const EK6_ALAN: Record<string, string> = {
  GENEL_KAPSAM: 'Genel', MIMARI_KACIS: 'Kaçış ve yapı bölümleri', MEKANIK_PK: 'Sistemler ve periyodik kontrol',
  ELEKTRIK: 'Elektrik, algılama ve aydınlatma', TEHLIKELI_MADDE: 'Tehlikeli maddeler ve yakıtlar'
}

// Backend Ek6AnalysisService::state / result biçimi
export type Ek6Soru = {
  code: string; question: string; explanation?: string | null; draft: boolean; approved: boolean
  type?: 'sayi' | 'evet_hayir'; unit?: string | null; known_range?: { min?: number; max?: number; min_inclusive?: boolean; max_inclusive?: boolean } | null
  name?: string; domain?: string | null; options?: string[]
}
export type Ek6Madde = { code: string; kind: 'sistem' | 'kural'; question: string; name?: string; criterion?: string; legal_refs?: string | null; priority?: string | null; domain?: string | null; approved: boolean }
export type Ek6Sonuc = {
  readiness: number | null; counts: Record<'evet' | 'hayir' | 'bilmiyorum' | 'uygulanmiyor', number>
  action_items: Ek6Madde[]; unknowns: Ek6Madde[]; not_applicable: Ek6Madde[]; ready: Ek6Madde[]
  requirement_verification: { code: string; name: string; present: boolean | null; missing_inputs: string[]; notes: string[] }[]
  documents: string[]; is_test: boolean; contains_unapproved: boolean
}
export type Ek6Durum = { uuid: string; status: 'devam' | 'tamam'; step: 'yapi' | 'sistemler' | 'kurallar' | 'tamam'; questions: Ek6Soru[]; is_test?: boolean; result?: Ek6Sonuc }
