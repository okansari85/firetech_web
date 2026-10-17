// SİTE YÖNETİMİ (Düzeltme 03, 17 Ekim): site / yerleşkedeki bütün yapı ve alanların periyodik kontrol değerlendirmesi.
// Metinler müşterinin "Düzeltmeler" belgesinden (bölüm 5–8) ve belgedeki ekran görüntülerinden birebir.
// Ödeme ekranı şimdilik deneme: ücret gösterilir, çekim yapılmaz, kart bilgisi alınmaz.

export const SITE_UCRET = 19.9

export const SITE_METIN = {
  baslik: 'SİTENİZİ TANIYALIM',
  aciklama: 'Sitenizde bulunan konut binalarını, ticari alanları, sosyal tesisleri, hizmet yapılarını ve ortak kullanım alanlarını belirleyerek periyodik kontrol sürelerini değerlendirelim.',
  siteAdi: 'Site / Yerleşke adı',
  kategoriSoru: 'Sitenizde aşağıdakilerden hangileri bulunuyor?',
  kategoriNot: 'Birden fazla seçenek işaretleyebilirsiniz.',
  kayitSec: 'Değerlendirmek istediğiniz bina veya kullanım alanını seçin.',
  kayitBilgileri: 'Kayıt bilgileri',
  kayitAdi: 'Bina / kullanım alanı adı',
  konumSoru: 'Bu alan fiziksel olarak nerede bulunuyor?',
  sinifSoru: 'Fiilî kullanım sınıfı',
  sinifNot: 'Ticari alan, sosyal tesis veya hizmet birimi adı tek başına kullanım sınıfını belirlemez.',
  onSonuc: 'Ön değerlendirme sonucu',
  olcutEksik: 'Ölçüt bilgisi eksik',
  kaydetSonraki: 'Kaydet ve Sonrakine Geç',
  sonucOlustur: (n: number) => `${n} Kaydın Sonuç Tablosunu Oluştur`,
  sonucNot: 'Bu çalışma, verdiğiniz bilgilere göre hazırlanan ön değerlendirmedir. Resmî periyodik yangın kontrolü veya Yangın Güvenlik Raporu yerine geçmez.'
}

// Bölüm 5 (Karar 4: "Sosyal Tesisler ve Ortak Kullanım Alanları", Karar 5: Otoparklar ayrı kategori)
export type SiteKategori = { kod: string; on: string; ad: string; aciklama: string; sayiSorusu: string }
export const SITE_KATEGORILERI: SiteKategori[] = [
  { kod: 'konut', on: 'K', ad: 'Konut Binaları / Bloklar', aciklama: 'Apartmanlar, rezidanslar, villa blokları, müstakil konutlar.', sayiSorusu: 'Kaç konut binası / blok var?' },
  { kod: 'ticari', on: 'T', ad: 'Ticari Alanlar', aciklama: 'Marketler, mağazalar, restoranlar, kafeler, dükkânlar, ticari bloklar ve çarşılar.', sayiSorusu: 'Kaç bağımsız ticari birim veya yapı var?' },
  { kod: 'sosyal', on: 'S', ad: 'Sosyal Tesisler ve Ortak Kullanım Alanları', aciklama: 'Sosyal tesis binaları, yüzme havuzları, spor salonları, açık spor sahaları, çocuk oyun alanları ve diğer ortak alanlar.', sayiSorusu: 'Kaç ayrı yapı veya birim var?' },
  { kod: 'yonetim', on: 'Y', ad: 'Yönetim / Hizmet Binaları', aciklama: 'Yönetim ofisleri, güvenlik yapıları, bakım ve teknik hizmet binaları.', sayiSorusu: 'Kaç ayrı yapı veya birim var?' },
  { kod: 'otopark', on: 'O', ad: 'Otoparklar', aciklama: 'Açık, kapalı, bağımsız veya bina bünyesindeki otoparklar.', sayiSorusu: 'Kaç ayrı yapı veya birim var?' },
  { kod: 'depolama', on: 'DT', ad: 'Depolama ve Teknik Alanlar', aciklama: 'Depolar, malzeme stok alanları ve bağımsız teknik yapılar.', sayiSorusu: 'Kaç ayrı yapı veya birim var?' },
  { kod: 'diger', on: 'D', ad: 'Diğer Yapılar / Alanlar', aciklama: 'Önceki seçeneklere girmeyen yapılar ve kullanım alanları.', sayiSorusu: 'Kaç ayrı yapı veya birim var?' }
]

// Bölüm 6: "Ayrı binada mı, başka bir binanın içinde mi, yoksa açık alanda mı bulunduğu" (seçenekler ekran görüntüsünden)
export const SITE_KONUM = [
  { deger: 'ayri', etiket: 'Ayrı bir binada / bağımsız yapıda' },
  { deger: 'icinde', etiket: 'Başka bir binanın / bloğun içinde' },
  { deger: 'acik', etiket: 'Açık alan / bağımsız bina olmayan kullanım' }
] as const

// Bölüm 7: sonuç ekranında ayrılan durumlar
export const SITE_SONUC_GRUPLARI = {
  belirlenen: 'Periyodik kontrol süresi belirlenen yapılar',
  karma: 'Karma kullanım değerlendirmesi gereken yapılar',
  eksik: 'Eksik bilgi nedeniyle süresi belirlenemeyen yapılar',
  // Belgede "EK-1'de ayrı süre…"; kullanıcı kuralı (17 Ekim): ekranda EK-1 / BYKHY atfı yok, yerine "mevzuat".
  envanter: 'Mevzuatta ayrı süre tanımlanmayan ancak envantere dahil edilen alanlar'
}
