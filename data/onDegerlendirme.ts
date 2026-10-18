// ÜCRETSİZ ÖN DEĞERLENDİRME — VERİ DOSYASI
// Bütün metinler, seçenekler, eşikler ve katsayılar burada. Müşteri değişikliği gelince yalnız bu dosya düzenlenir.
// Kaynaklar: müşteri sınıf dokümanları (8 Ekim), ÜCRETSİZ EKRANLAR (2 Ekim), YGU EK-1, BYKHY (Md. 8–19, Ek-1, Ek-5/A).
// Not: Depolama (M16) ve Yüksek Tehlikeli (M17) akışları Claude taslağıdır; FireTech onayı bekliyor.

export type SinifKod = 'konut' | 'konaklama' | 'kurumsal' | 'buro' | 'ticaret' | 'endustri' | 'toplanma' | 'depolama' | 'yuksek'

// grup: kart maddesinden gelen seçeneğin, motorun hesapta kullandığı alt türe bağlanması (ör. Kafe → restoran katsayısı)
export type Secenek = { deger: string; etiket: string; aciklama?: string; ornek?: string; grup?: string }
export const turGrubu = (liste: Secenek[], v: any): any => liste.find(o => o.deger === v)?.grup ?? v

// ── Kullanım sınıfları ─────────────────────────────────────────────────────────
export const SINIFLAR: Record<SinifKod, { ad: string; kisa: string; madde: number; renk: string }> = {
  konut: { ad: 'Konutlar', kisa: 'Konut', madde: 9, renk: '#9c7020' },
  konaklama: { ad: 'Konaklama Amaçlı Binalar', kisa: 'Konaklama', madde: 10, renk: '#0f766e' },
  kurumsal: { ad: 'Kurumsal Binalar', kisa: 'Kurumsal', madde: 11, renk: '#5b4b8a' },
  buro: { ad: 'Büro Binaları', kisa: 'Büro', madde: 12, renk: '#0c2840' },
  ticaret: { ad: 'Ticaret Amaçlı Binalar', kisa: 'Ticaret', madde: 13, renk: '#921616' },
  endustri: { ad: 'Endüstriyel Tesisler', kisa: 'Endüstri', madde: 14, renk: '#6b7280' },
  toplanma: { ad: 'Toplanma Amaçlı Binalar', kisa: 'Toplanma', madde: 15, renk: '#1d5fa8' },
  depolama: { ad: 'Depolama Amaçlı Tesisler', kisa: 'Depolama', madde: 16, renk: '#b8913f' },
  yuksek: { ad: 'Yüksek Tehlikeli Yerler', kisa: 'Yüksek Tehlike', madde: 17, renk: '#c2410c' }
}

// ── YGU EK-1 eşikleri (yıl) ───────────────────────────────────────────────────
export const PERIYOT = {
  yukseklik: { lt_30_50: null, '30_50_51_50': 5, ge_51_50: 4 } as Record<string, number | null>, // konut; lt_30_50 = EK-1'de tanımsız
  alan: { le_1000: 5, gt_1000: 4 } as Record<string, number>, // kurumsal, büro, ticaret, toplanma
  oda: { le_25: 5, gt_25: 4 } as Record<string, number>, // konaklama
  tehlike: { dusuk: 5, orta: 4, yuksek: 3 } as Record<string, number>, // endüstri, depolama
  yuksekTehlike: 3 // sınır olmaksızın
}
export const TOPLANMA_KISI_ESIGI = 50 // BYKHY Md. 15
export const DEPO_ALAN_ESIGI = 50 // BYKHY Md. 16/2 (m²)

// ── Ortak seçenekler ──────────────────────────────────────────────────────────
export const YUKSEKLIK: Secenek[] = [
  { deger: 'lt_30_50', etiket: '30,50 metreden düşük' },
  { deger: '30_50_51_50', etiket: '30,50 metre (dahil) ile 51,50 metre arasında' },
  { deger: 'ge_51_50', etiket: '51,50 metre ve üzeri' },
  { deger: 'bilmiyorum', etiket: 'Bilmiyorum / Belgeden bulamıyorum' }
]
export const ALAN: Secenek[] = [
  { deger: 'le_1000', etiket: '1.000 m² ve altında' },
  { deger: 'gt_1000', etiket: '1.000 m²’nin üstünde' },
  { deger: 'bilmiyorum', etiket: 'Bilmiyorum / Emin değilim' }
]
export const ODA: Secenek[] = [
  { deger: 'le_25', etiket: '25 ve altında' },
  { deger: 'gt_25', etiket: '25’in üstünde' },
  { deger: 'bilmiyorum', etiket: 'Bilmiyorum / Emin değilim' }
]
// Yurtta oda kavramı belirsizse (koğuş): yatak / kişi sayısı oda sayısına çevrilmez, doğrulama gerekir (Konaklama spesifikasyonu §4).
export const ODA_BELIRSIZ: Secenek = { deger: 'belirsiz', etiket: 'Koğuş düzeni / oda sayısı belirsiz', aciklama: 'Yatak veya kişi sayısı oda sayısına çevrilmez; oda sayısı doğrulanmalıdır.' }
export const TEHLIKE: Secenek[] = [
  { deger: 'yuksek', etiket: 'Yüksek Tehlikeli' },
  { deger: 'orta', etiket: 'Orta Tehlikeli' },
  { deger: 'dusuk', etiket: 'Düşük Tehlikeli' },
  { deger: 'bilmiyorum', etiket: 'Bilmiyorum / Emin değilim' }
]
export const EVET_HAYIR: Secenek[] = [{ deger: 'evet', etiket: 'Evet' }, { deger: 'hayir', etiket: 'Hayır' }]
// Düzeltme 06 (17 Ekim): müşteri metni
export const PROJEDEN: Secenek[] = [{ deger: 'evet', etiket: 'Evet', aciklama: 'Projemde tehlike sınıfı bilgisi bulunuyor.' }, { deger: 'hayir', etiket: 'Hayır / Bilmiyorum', aciklama: 'Projeme ulaşamıyorum, tehlike sınıfını bulamıyorum veya projem yok.' }]

// ── Sınıfa özel seçenekler ────────────────────────────────────────────────────
// Düzeltme 03 (17 Ekim): konut türü, alt türler ve site kullanıcısı — müşteri metinleri birebir.
export const KONUT_TURU: Secenek[] = [
  { deger: 'mustakil', etiket: 'Müstakil Ev / Villa', aciklama: 'Tek başına kullanılan müstakil konutlar ve villalar. Ahşap evler, yalılar, köşkler, bağ evleri, dağ evleri, prefabrik evler, konteyner konutlar, bungalovlar ve konut amaçlı kullanılan tiny house yapılar.' },
  { deger: 'apartman', etiket: 'Apartman / Rezidans', aciklama: 'Tek yapı / blok halinde konut kullanımı. Apartmanlar, rezidanslar, çok katlı konut binaları ve birden fazla bağımsız konut bölümü bulunan yapılar.' },
  { deger: 'site', etiket: 'Site / Yerleşke / Yaşam Kompleksi', aciklama: 'Birden fazla konut yapısı veya blok bulunan site / yerleşke. Toplu konutlar, konut siteleri, yaşam alanları, konut yerleşkeleri, villa siteleri ve müstakil veya ortak yaşam alanlarından oluşan konut kompleksleri.' }
]
// "Yapınız aşağıdakilerden hangisi?" (konut türünü seçince açılan ekran)
export const KONUT_ALT_TURU: Record<'mustakil' | 'apartman', Secenek[]> = {
  mustakil: ['Müstakil Ev', 'Villa', 'Ahşap Ev', 'Yalı', 'Köşk', 'Bağ Evi', 'Dağ Evi', 'Prefabrik Ev', 'Konteyner Konut', 'Bungalov', 'Tiny House', 'Diğer Müstakil Konut']
    .map((etiket, i) => ({ deger: `m${i + 1}`, etiket })),
  apartman: ['Apartman', 'Rezidans', 'Çok Katlı Konut Binası', 'Birden Fazla Bağımsız Konut Bölümü Bulunan Yapı']
    .map((etiket, i) => ({ deger: `a${i + 1}`, etiket }))
}
export const SITE_KULLANICI: Secenek[] = [
  { deger: 'oturan', etiket: 'Sitede Oturanlar', aciklama: 'Site içerisinde yaşadığım konutun veya bloğun periyodik kontrol süresini öğrenmek istiyorum.' },
  { deger: 'yonetim', etiket: 'Site Yönetimi', aciklama: 'Sitemizdeki binaların ve blokların periyodik kontrol sürelerini ayrı ayrı öğrenmek istiyorum.' }
]
// Sitede oturanlar için site türü
export const SITE_TURU: Secenek[] = [
  { deger: 's1', etiket: 'Villa / Müstakil Evlerden Oluşan Site yerleşke' },
  { deger: 's2', etiket: 'Apartman / Rezidans Bloklarından Oluşan Site' },
  { deger: 's3', etiket: 'Karma Yapılı Site / Yerleşke', aciklama: '(müstakil villa - ev / apartman / rezidans blokları /yaşam alanı vb)' }
]
// Tür listeleri Düzeltme 05 kart metinlerinden birebir, her madde bir seçenek (kullanıcı, 17 Ekim); "ve benzeri" yerine
// "Diğer (Kendim Yazacağım)" + yapay zekâ eşleştirmesi.
export const KONAKLAMA_TURU: Secenek[] = [
  { deger: 'otel', etiket: 'Otel' },
  { deger: 'motel', etiket: 'Motel' },
  { deger: 'termal', etiket: 'Termal Tesis' },
  { deger: 'tatil_koyu', etiket: 'Tatil Köyü' },
  { deger: 'pansiyon', etiket: 'Pansiyon' },
  { deger: 'apart_otel', etiket: 'Apart Otel', grup: 'otel' },
  { deger: 'butik_otel', etiket: 'Butik Otel', grup: 'otel' },
  { deger: 'misafirhane', etiket: 'Misafirhane', grup: 'diger' },
  { deger: 'konukevi', etiket: 'Konukevi', grup: 'diger' },
  { deger: 'yurt', etiket: 'Öğrenci Yurdu' },
  { deger: 'kamping', etiket: 'Kamping' },
  { deger: 'kamp', etiket: 'Kamp', grup: 'kamping' }
]
export const KURUMSAL_TURU: Secenek[] = [
  { deger: 'egitim', etiket: 'Eğitim Tesisleri' },
  { deger: 'okul', etiket: 'Okul', grup: 'egitim' },
  { deger: 'universite', etiket: 'Üniversite', grup: 'egitim' },
  { deger: 'kres', etiket: 'Kreş', grup: 'egitim' },
  { deger: 'anaokulu', etiket: 'Anaokulu', grup: 'egitim' },
  { deger: 'gunduz_bakimevi', etiket: 'Gündüz Bakımevi', grup: 'egitim' },
  { deger: 'hastane', etiket: 'Hastane', grup: 'saglik' },
  { deger: 'saglik', etiket: 'Sağlık Kuruluşları' },
  { deger: 'huzurevi', etiket: 'Huzurevi', grup: 'saglik' },
  { deger: 'bakim_merkezi', etiket: 'Yaşlı ve Engelli Bakım Merkezleri', grup: 'saglik' },
  { deger: 'rehabilitasyon', etiket: 'Rehabilitasyon Merkezleri', grup: 'saglik' },
  { deger: 'gozetim', etiket: 'Bakım ve Gözetim Kuruluşları', grup: 'saglik' },
  { deger: 'tutukevi', etiket: 'Tutukevi', grup: 'ceza' },
  { deger: 'ceza', etiket: 'Cezaevi' },
  { deger: 'islahevi', etiket: 'Islahevi', grup: 'ceza' }
]
// Büro: tür listesi müşterinin Büro kartı metninden (Düzeltme 05) birebir; "Diğer (Kendim Yazacağım)" Düzeltme 02 (kullanıcı, 17 Ekim).
export const BURO_TURU: Secenek[] = [
  { deger: 'b1', etiket: 'Banka' },
  { deger: 'b2', etiket: 'Borsa' },
  { deger: 'b3', etiket: 'Kamu Hizmet Binası' },
  { deger: 'b4', etiket: 'Genel Büro' },
  { deger: 'b5', etiket: 'İdari Bina' },
  { deger: 'b6', etiket: 'İş Merkezi' },
  { deger: 'b7', etiket: 'Şirket Ofisi' },
  { deger: 'b8', etiket: 'Sigorta Acentesi' },
  { deger: 'b9', etiket: 'Avukatlık Bürosu' },
  { deger: 'b10', etiket: 'Mali Müşavirlik' },
  { deger: 'b11', etiket: 'Mimarlık ve Mühendislik Ofisi' },
  { deger: 'b12', etiket: 'Yazılım Ofisi' },
  { deger: 'b13', etiket: 'Danışmanlık Firması' },
  { deger: 'b14', etiket: 'Doktor ve Diş Hekimi Muayenehanesi' }
]
// Ticaret: periyodu değiştirmez; grup yalnız analiz başlıkları için.
export const TICARET_TURU: Secenek[] = [
  { deger: 'magaza', etiket: 'Mağaza' },
  { deger: 'dukkan', etiket: 'Dükkân' },
  { deger: 'market', etiket: 'Market' },
  { deger: 'supermarket', etiket: 'Süpermarket' },
  { deger: 'bakkal', etiket: 'Bakkal', grup: 'dukkan' },
  { deger: 'tuhafiye', etiket: 'Tuhafiye', grup: 'dukkan' },
  { deger: 'zuccaciye', etiket: 'Züccaciye', grup: 'dukkan' },
  { deger: 'kirtasiye', etiket: 'Kırtasiye', grup: 'dukkan' },
  { deger: 'nalbur', etiket: 'Nalbur', grup: 'dukkan' },
  { deger: 'tekel', etiket: 'Tekel Bayi', grup: 'dukkan' },
  { deger: 'petshop', etiket: 'Petshop', grup: 'dukkan' },
  { deger: 'cicekci', etiket: 'Çiçekçi', grup: 'dukkan' },
  { deger: 'oyuncakci', etiket: 'Oyuncakçı', grup: 'dukkan' },
  { deger: 'giyim', etiket: 'Giyim ve Ayakkabı Mağazası', grup: 'magaza' },
  { deger: 'mobilya_elektronik', etiket: 'Mobilya ve Elektronik Eşya Satış Yerleri', grup: 'magaza' },
  { deger: 'toptanci', etiket: 'Toptancı Sitesi' },
  { deger: 'hal', etiket: 'Sebze Hali' },
  { deger: 'meyve_hali', etiket: 'Meyve Hali', grup: 'hal' },
  { deger: 'balik_hali', etiket: 'Balık Hali', grup: 'hal' },
  { deger: 'et_borsasi', etiket: 'Et Borsası' },
  { deger: 'kapali_carsi', etiket: 'Kapalı Çarşı' },
  { deger: 'pasaj', etiket: 'Pasaj' },
  { deger: 'tamirhane', etiket: 'Tamirhane' },
  { deger: 'yedek_parca', etiket: 'Yedek Parça ve Malzeme Satış Yerleri' }
]
export const YERLESIM: Secenek[] = [
  { deger: 'tek', etiket: 'Tek bina' },
  { deger: 'yerleske', etiket: 'Kampüs / yerleşke / kompleks içindeki bir yapı', aciklama: 'Yerleşkeye tek bir periyot verilmez; değerlendirdiğiniz yapıyı düşünerek devam edin.' }
]
// Toplanma: kullanıcı yükü = alan ÷ katsayı (BYKHY Ek-5/A). "50 kişiden fazla mısınız?" diye doğrudan sorulmaz.
export type ToplanmaTuru = Secenek & { mod: 'tek' | 'oturma_ayakta' | 'dogrulama'; katsayi?: number; alanTuru?: 'net' | 'brüt' }
export const TOPLANMA_TURU: ToplanmaTuru[] = [
  { deger: 'restoran', etiket: 'Restoran', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'lokanta', etiket: 'Lokanta', grup: 'restoran', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'kafe', etiket: 'Kafe', grup: 'restoran', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'kafeterya', etiket: 'Kafeterya', grup: 'restoran', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'kahvehane', etiket: 'Kahvehane', grup: 'restoran', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'dugun_salonu', etiket: 'Düğün Salonu', grup: 'salon', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'salon', etiket: 'Sinema', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'tiyatro', etiket: 'Tiyatro', grup: 'salon', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'konser_salonu', etiket: 'Konser ve Gösteri Salonu', grup: 'salon', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'konferans_salonu', etiket: 'Konferans ve Toplantı Salonu', grup: 'salon', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'muze', etiket: 'Müze', mod: 'tek', katsayi: 5, alanTuru: 'brüt' },
  { deger: 'sergi', etiket: 'Sergi ve Fuar Alanı', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'ibadet', etiket: 'İbadethane', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'spor', etiket: 'Spor Salonu', mod: 'tek', katsayi: 3, alanTuru: 'brüt' },
  { deger: 'stadyum', etiket: 'Stadyum', mod: 'dogrulama' },
  { deger: 'terminal', etiket: 'Terminal', mod: 'tek', katsayi: 3, alanTuru: 'net' },
  { deger: 'gar', etiket: 'Gar', grup: 'terminal', mod: 'tek', katsayi: 3, alanTuru: 'net' },
  { deger: 'havaalani', etiket: 'Havaalanı', grup: 'terminal', mod: 'tek', katsayi: 3, alanTuru: 'net' },
  // Düzeltme 02: kendi yazdığı tür eşleşmezse kişi yükü hesaplanmaz, doğrulama gerekir
  { deger: 'kendim', etiket: 'Diğer', aciklama: '(Kendim Yazacağım)', mod: 'dogrulama' }
]
export const END_TURU: Secenek[] = [
  'Fabrika', 'İmalathane', 'Üretim Tesisi', 'Sanayi Tesisi', 'Atölye', 'CNC ve Torna Atölyesi', 'Metal İşleme ve Makine İmalat Tesisi',
  'Tekstil Fabrikası', 'İplik ve Dokuma Tesisi', 'Gıda İşleme Tesisi', 'Un ve Yem Fabrikası', 'Mobilya İmalathanesi',
  'Plastik Enjeksiyon Tesisi', 'Matbaa', 'Boyahane', 'Enerji Üretim Tesisi', 'Rafineri'
].map((etiket, i) => ({ deger: `e${i + 1}`, etiket }))
// Endüstri: tehlike sınıfı bilinmiyorsa BYKHY Ek-1 sırasıyla (C → B → A) kontrol edilir.
export const EK1 = {
  C: { baslik: 'BYKHY Ek-1/C — Yüksek Tehlike Kullanım Alanları', ornekler: ['Döşemelik kumaş ve muşamba fabrikaları', 'Aydınlatma fişeği, havai fişek ve selüloz nitrat fabrikaları', 'Boya, vernik ve renklendirici imalatı', 'Plastik köpük, sünger ve köpük lastik imalathaneleri', 'Yapay kauçuk, reçine ve terebentin imalatı; katran damıtma', 'Talaş fabrikaları, odun yünü imalatı', 'Otobüs ambarı, yüklü kamyon ve vagonlar'] },
  B: { baslik: 'BYKHY Ek-1/B — Orta Tehlike Kullanım Alanları', ornekler: ['Cam ve seramik fabrikaları', 'Kimyasallar: boyama işlemleri, sabun, mum, kibrit fabrikaları, fotoğraf laboratuvarları', 'Otomotiv, elektronik, beyaz eşya, metal levha fabrikaları', 'Gıda: mezbaha, mandıra, fırın, bisküvi, çikolata, şeker, değirmen, bira, alkol damıtma', 'Kâğıt, mukavva fabrikaları, matbaa ve cilthaneler', 'Kablo, plastik döküm, kauçuk eşya, halat fabrikaları', 'Tekstil, deri, halı, giysi, ayakkabı imalathaneleri, iplikhaneler', 'Ahşap işleri, mobilya, yonga levha fabrikaları'] },
  A: { baslik: 'BYKHY Ek-1/A — Düşük Tehlike Kullanım Alanları', ornekler: ['Düşük yangın yüküne ve düşük yanabilirliğe sahip', 'Yangına karşı direnci en az 30 dakika', 'Tek bir yangın kompartımanı 126 m²’den büyük değil (126 m² binanın toplam alanı değildir)', 'Ek-1/B veya Ek-1/C kapsamında değil'] }
}
// Depolama
export const DEPO_TURU: Secenek[] = [
  { deger: 'depo', etiket: 'Depo' },
  { deger: 'antrepo', etiket: 'Antrepo', grup: 'depo' },
  { deger: 'lojistik', etiket: 'Lojistik Deposu', grup: 'depo' },
  { deger: 'dagitim', etiket: 'Dağıtım Deposu', grup: 'depo' },
  { deger: 'eticaret', etiket: 'E-Ticaret Ürün Deposu', grup: 'depo' },
  { deger: 'hammadde', etiket: 'Hammadde ve Mamul Deposu', grup: 'depo' },
  { deger: 'soguk_hava', etiket: 'Soğuk Hava Deposu', grup: 'depo' },
  { deger: 'silo', etiket: 'Silo' },
  { deger: 'arsiv', etiket: 'Arşiv' },
  { deger: 'otopark', etiket: 'Açık veya Kapalı Otopark' },
  { deger: 'arac_muhafaza', etiket: 'Araç Muhafaza Alanı', grup: 'otopark' },
  { deger: 'tank', etiket: 'Tank Depolama Alanı', grup: 'silo' }
]
export const DEPO_MADDE: Secenek[] = [
  { deger: 'yok', etiket: 'Hayır, bulunmuyor' },
  { deger: 'esas', etiket: 'Evet, esas olarak bunlar depolanıyor' },
  { deger: 'kismen', etiket: 'Evet, ama yalnızca bir kısmı' },
  { deger: 'bilmiyorum', etiket: 'Bilmiyorum' }
]
// Yüksek tehlikeli yerler: kart metnindeki maddelerin hepsi (Düzeltme 05)
export const YH_FAALIYET: Secenek[] = [
  { deger: 'gaz', etiket: 'Parlayıcı ve Patlayıcı Gazlar' },
  { deger: 'patlayici', etiket: 'Patlayıcı Maddeler' },
  { deger: 'sivi', etiket: 'Yanıcı Sıvılar' },
  { deger: 'akaryakit', etiket: 'Akaryakıtlar', grup: 'sivi' },
  { deger: 'ozel_madde', etiket: 'Özel Tehlike Oluşturan Maddeler' },
  { deger: 'akaryakit_lpg', etiket: 'Akaryakıt ve LPG Tesisleri', grup: 'sivi' },
  { deger: 'gaz_dolum', etiket: 'Yanıcı Gaz Dolum Tesisleri', grup: 'gaz' },
  { deger: 'patlayici_depo', etiket: 'Patlayıcı Madde Depoları', grup: 'patlayici' },
  { deger: 'kimyasal', etiket: 'Kimyasal Madde İşleme ve Depolama Alanları' }
]
// Yüksek tehlikeli yerler — "Tesisinizin Faaliyetlerini Belirleyelim" ekranı (kullanıcı 18 Ekim 2026, referans ekran; metinler birebir).
// Tek ekranda üç soru: 1. ve 2. tek seçim, 3. (işlemler) çoklu seçim (kullanıcı). grup: analiz başlıklarında kullanılan tür grubu (gaz / patlayıcı / sıvı).
export const YH_EKRAN = {
  etiket: 'Yapı Kullanım Sınıfı: Yüksek Tehlikeli Yerler',
  baslik: 'Tesisinizin Faaliyetlerini Belirleyelim',
  aciklama: 'İşletmenize uygun seçenekleri işaretleyin.',
  madde: '1. Tesisinizde hangi madde grupları bulunuyor?',
  tesis: '2. İşletmeniz aşağıdaki tesis veya faaliyet türlerinden hangisine giriyor?',
  islem: '3. Tesisinizde hangi işlemler yapılıyor?'
}
export const YH_MADDE: Secenek[] = [
  { deger: 'gaz', etiket: 'Parlayıcı ve Patlayıcı Gazlar', grup: 'gaz' },
  { deger: 'patlayici', etiket: 'Patlayıcı Maddeler', grup: 'patlayici' },
  { deger: 'sivi', etiket: 'Yanıcı Sıvılar', grup: 'sivi' },
  { deger: 'akaryakit', etiket: 'Akaryakıtlar', grup: 'sivi' },
  { deger: 'ozel_madde', etiket: 'Özel Tehlike Oluşturan Maddeler' }
]
export const YH_TESIS: Secenek[] = [
  { deger: 'akaryakit_tesis', etiket: 'Akaryakıt Tesisleri', grup: 'sivi' },
  { deger: 'lpg_tesis', etiket: 'LPG Tesisleri', grup: 'gaz' },
  { deger: 'lpg_tup', etiket: 'LPG Tüp Satış Noktaları', grup: 'gaz' },
  { deger: 'akaryakit_istasyon', etiket: 'Akaryakıt Satış İstasyonları', grup: 'sivi' },
  { deger: 'gaz_dolum', etiket: 'Yanıcı Gaz Dolum Tesisleri', grup: 'gaz' },
  { deger: 'patlayici_depo', etiket: 'Patlayıcı Madde Depoları', grup: 'patlayici' },
  { deger: 'kimyasal_isleme', etiket: 'Kimyasal Madde İşleme Alanları' },
  { deger: 'kimyasal_depo', etiket: 'Kimyasal Madde Depolama Alanları' },
  { deger: 'diger', etiket: 'Diğer Yüksek Tehlikeli Tesisler' }
]
export const YH_ISLEM: Secenek[] = [
  { deger: 'uretim', etiket: 'Üretim' },
  { deger: 'isleme', etiket: 'İşleme' },
  { deger: 'karistirma', etiket: 'Karıştırma' },
  { deger: 'depolama', etiket: 'Depolama' },
  { deger: 'dolum', etiket: 'Dolum' },
  { deger: 'bosaltim', etiket: 'Boşaltım' },
  { deger: 'satis', etiket: 'Satış' },
  { deger: 'diger', etiket: 'Diğer / Listede bulunmayan faaliyet' } // soru havuzu 09-C-008 (kullanıcı 18 Ekim 2026)
]
export const YH_MOD: Secenek[] = [
  { deger: 'faaliyet', etiket: 'Üretiliyor, depolanıyor, dolduruluyor, boşaltılıyor veya satılıyor' },
  { deger: 'kendi', etiket: 'Yalnızca kendi ihtiyacımız için kullanılıyor', aciklama: 'Kazan dairesi yakıt tankı, mutfak tüpü, jeneratör yakıtı gibi.' },
  { deger: 'bilmiyorum', etiket: 'Bilmiyorum' }
]
export const YH_ILISKI: Secenek[] = [
  { deger: 'esas', etiket: 'Evet, tesisin esas faaliyeti', ornek: 'Akaryakıt istasyonu, LPG dolum tesisi, patlayıcı madde deposu' },
  { deger: 'bolum', etiket: 'Hayır, başka amaçlı bir yapının bir bölümü', ornek: 'Market içinde tüp satış noktası gibi' },
  { deger: 'bilmiyorum', etiket: 'Bilmiyorum' }
]

// ── Diğer (Kendim Yazacağım) — Düzeltme 02 (17 Ekim) ──────────────────────────
// Konut dışındaki tür / alt tür seçimlerine eklenir (konutta yok: kullanıcı kararı). Metinler belgedeki ekran görüntüsünden.
export const DIGER_YAZ: Secenek = { deger: 'kendim', etiket: 'Diğer', aciklama: '(Kendim Yazacağım)' }
export const DIGER_YAZ_METIN = {
  soruNotu: 'Size uygun seçeneği işaretleyin. Listede yoksa kendiniz yazabilirsiniz.',
  baslik: 'Diğer — Kullanım türünü yazın',
  aciklama: 'Listede bulunmayan işletme türünüzü yazın. Sistem yazdığınız bilgiyi analiz ederek uygun kategori ile eşleştirir.',
  oneriBaslik: 'FireOS eşleştirme önerisi',
  oneriAciklama: 'Yazdığınız kullanım türü analiz edildi ve aşağıdaki kategori ile eşleştirildi.',
  onerilen: 'Önerilen eşleştirme'
}
// Belgedeki örnekler (eşleştirme sözlüğüne de girer; utils/eslestir.ts)
export const DIGER_ORNEKLERI: Partial<Record<SinifKod, string[]>> = {
  ticaret: ['Tuhafiye', 'Züccaciye', 'Nalbur', 'Tekel Bayi', 'Çiçekçi', 'Oyuncakçı'],
  buro: ['Mali Müşavirlik Ofisi', 'Mimarlık Ofisi', 'Sigorta Acentesi', 'Yazılım Ofisi', 'Avukatlık Bürosu'],
  endustri: ['CNC Atölyesi', 'Plastik Enjeksiyon Tesisi', 'Matbaa', 'Mobilya İmalathanesi', 'Metal İşleme Atölyesi'],
  kurumsal: ['Rehabilitasyon Merkezi', 'Özel Eğitim Merkezi', 'Gündüz Bakım Merkezi', 'Çocuk Destek Merkezi', 'Yaşlı Bakım Merkezi'],
  konaklama: ['Butik Otel', 'Bungalov Konaklama Tesisi', 'Dağ Evi Konaklama Tesisi', 'Apart Otel', 'Misafirhane'],
  toplanma: ['Stand-up Gösteri Salonu', 'E-Spor Etkinlik Salonu', 'Sergi Salonu', 'Konferans Merkezi', 'Düğün ve Etkinlik Salonu'],
  depolama: ['E-Ticaret Ürün Deposu', 'Soğuk Hava Deposu', 'Mobilya Deposu', 'Yedek Parça Deposu', 'Lojistik Dağıtım Deposu']
}

// ── Diğer kullanımlar (müşteri Konut dokümanı, "Kart altında gösterilecek örnekler") ──
export const DIGER_KULLANIM_KARTLARI: (Secenek & { sinif: SinifKod | 'bilinmiyor' })[] = [
  { deger: 'konut', sinif: 'konut', etiket: 'Konutlar', ornek: 'Daire, apartman, rezidans konutu, müstakil konut/villa ve benzeri konut kullanımları.' },
  { deger: 'konaklama', sinif: 'konaklama', etiket: 'Konaklama Amaçlı Binalar', ornek: 'Otel, motel, pansiyon, yurt, misafirhane, konukevi, tatil köyü, apart otel ve benzeri yatılı konaklama yapıları.' },
  { deger: 'kurumsal', sinif: 'kurumsal', etiket: 'Kurumsal Binalar', ornek: 'Hastane, sağlık tesisi, okul, eğitim kurumu, kreş, gündüz bakımevi, cezaevi, tutukevi ve benzeri kurumsal yapılar.' },
  { deger: 'buro', sinif: 'buro', etiket: 'Büro Binaları', ornek: 'Ofis, iş merkezi, idari bina, banka, sigorta ofisi, şirket merkezi, mesleki büro, kamu idari ofisi ve benzeri çalışma alanları.' },
  { deger: 'ticaret', sinif: 'ticaret', etiket: 'Ticaret Amaçlı Binalar', ornek: 'Dükkan, mağaza, market, süpermarket, alışveriş alanı, çarşı, işyeri, satış alanı, ticari işletme ve benzeri ticari kullanımlar.' },
  { deger: 'endustri', sinif: 'endustri', etiket: 'Endüstriyel Tesisler', ornek: 'Fabrika, üretim tesisi, imalathane, atölye, montaj tesisi, işleme tesisi, sanayi tesisi ve benzeri üretim yerleri.' },
  { deger: 'toplanma', sinif: 'toplanma', etiket: 'Toplanma Amaçlı Binalar', ornek: 'Restoran, lokanta, kafeterya, kahvehane, düğün salonu, sinema, tiyatro, konferans salonu, ibadethane, spor salonu, müze, sergi alanı, terminal ve benzeri toplu kullanım yerleri.' },
  { deger: 'depolama', sinif: 'depolama', etiket: 'Depolama Amaçlı Tesisler', ornek: 'Depo, antrepo, lojistik deposu, malzeme deposu, arşiv deposu, soğuk hava deposu, kapalı/açık otopark, araç muhafaza alanı ve benzeri depolama veya muhafaza alanları.' },
  { deger: 'yuksek', sinif: 'yuksek', etiket: 'Yüksek Tehlikeli Yerler', ornek: 'Yanıcı, parlayıcı, patlayıcı veya tehlikeli maddelerin üretildiği, işlendiği, depolandığı ya da yoğun olarak bulunduğu özel riskli yerler.' },
  { deger: 'bilinmiyor', sinif: 'bilinmiyor', etiket: 'Emin değilim / Kullanım türünü bilmiyorum' }
]
// Diğer kullanımın yapıyla ilişkisi (ÜCRETSİZ EKRANLAR)
export const ILISKI: Secenek[] = [
  { deger: 'yardimci', etiket: 'Yardımcı / ortak alan', aciklama: 'Yalnızca bina veya site kullanıcılarına hizmet ediyor, ticari amaç gütmüyor.', ornek: 'Sitenin havuzu, mescidi, yönetim ofisi · otelin kendi restoranı · yurdun yemekhanesi' },
  { deger: 'ayni', etiket: 'Aynı yapıda, bağımsız kullanım', aciklama: 'Dışarıya açık veya ayrı işletiliyor.', ornek: 'Apartmanın zemin katındaki dükkân · otelde bağımsız işletilen restoran' },
  { deger: 'ayri', etiket: 'Aynı site / yerleşkede, ayrı bir yapıda', aciklama: 'Kendi yapısı olarak ayrıca değerlendirilir.', ornek: 'Sitedeki ayrı market binası · kampüsteki ayrı spor salonu' }
]

// Ana kullanım → "Yardımcı / ortak alan" olabilecek diğer kullanımlar (kullanıcı onayı, 10 Ekim; ayrıntı ve gerekçeler
// firetech/docs/akislar/YARDIMCI_ALAN_TABLOSU.md). Listede olmayanlarda bu seçenek çıkmaz (yalnız aynı yapıda bağımsız / ayrı yapı).
// Dayanaklar: BYKHY Md. 12/2 büro bölümleri, 13/2 satışla bağlantılı bölümler, 15/2 50 kişiden az toplanma, 16/2 50 m²'den küçük depo.
export const YARDIMCI_OLABILIR: Partial<Record<SinifKod, SinifKod[]>> = {
  ticaret: ['buro', 'depolama', 'toplanma'],
  konut: ['buro', 'ticaret', 'toplanma', 'depolama'], // ticaret: yalnız site / bina sakinlerine satış noktası; dışarıya açık dükkân bağımsız
  konaklama: ['buro', 'ticaret', 'toplanma', 'depolama', 'endustri'], // endüstri: otelin kendi çamaşırhanesi
  kurumsal: ['buro', 'ticaret', 'toplanma', 'depolama', 'endustri'], // endüstri: hastanenin çamaşırhanesi / sterilizasyonu
  buro: ['ticaret', 'toplanma', 'depolama'],
  endustri: ['buro', 'ticaret', 'toplanma', 'depolama', 'kurumsal'], // kurumsal: çalışanlara revir
  toplanma: ['buro', 'ticaret', 'depolama'],
  depolama: ['buro', 'toplanma', 'endustri'], // endüstri: paketleme bölümü
  yuksek: ['buro', 'ticaret', 'toplanma', 'depolama'] // ticaret: istasyon marketi istasyonun parçası (kullanıcı kararı)
}
// Ana kullanıma göre ilişki seçeneklerinin açıklama / örnekleri (yoksa ILISKI'deki genel metin).
export const ILISKI_METNI: Partial<Record<SinifKod, Record<string, { aciklama?: string; ornek?: string }>>> = {
  ticaret: {
    yardimci: { aciklama: 'Yalnızca bu ticari kullanıma hizmet ediyor; dışarıya ayrıca açık değil.', ornek: 'Marketin kendi deposu · mağazanın kendi ofisi · personel yemekhanesi' },
    ayni: { ornek: 'Dükkânların üst katlarındaki konutlar · pasajda dışarıya açık restoran' },
    ayri: { ornek: 'Aynı parseldeki ayrı depo binası · çarşıdaki ayrı bir yapı' }
  },
  konut: {
    yardimci: { aciklama: 'Yalnızca bina veya site sakinlerine hizmet ediyor; dışarıya ayrıca açık değil.', ornek: 'Sitenin havuzu, mescidi · sosyal tesisteki satış noktası · yönetim ofisi · sakinlerin otoparkı' },
    ayni: { ornek: 'Apartmanın zemin katındaki dükkân · binada dışarıya açık ofis' },
    ayri: { ornek: 'Sitedeki ayrı market binası · ayrı sosyal tesis binası' }
  },
  konaklama: {
    yardimci: { aciklama: 'Yalnızca tesisin misafirlerine hizmet ediyor; dışarıya ayrıca açık değil.', ornek: 'Otelin kendi restoranı · misafirlere hediyelik eşya dükkânı · otelin kendi çamaşırhanesi' },
    ayni: { ornek: 'Otelde dışarıya açık işletilen restoran · otel binasındaki bağımsız mağaza' },
    ayri: { ornek: 'Tatil köyündeki ayrı spor salonu binası · ayrı personel lojmanı' }
  },
  kurumsal: {
    yardimci: { aciklama: 'Yalnızca kurumun kullanıcılarına hizmet ediyor; dışarıya ayrıca açık değil.', ornek: 'Okul yemekhanesi, spor salonu · hastane içi büfe · arşiv, idari bölüm, hastanenin çamaşırhanesi' },
    ayni: { ornek: 'Hastane binasında dışarıya açık eczane veya kafe · okul binasındaki bağımsız kurs' },
    ayri: { ornek: 'Kampüsteki ayrı spor salonu · ayrı yurt binası' }
  },
  buro: {
    yardimci: { aciklama: 'Yalnızca bu binanın çalışanlarına hizmet ediyor; dışarıya ayrıca açık değil.', ornek: 'Personel yemekhanesi, toplantı salonu · çalışanlara büfe · arşiv, bina otoparkı' },
    ayni: { ornek: 'Plazanın zemin katındaki dışarıya açık dükkânlar · binadaki restoran' },
    ayri: { ornek: 'Aynı parseldeki ayrı otopark binası' }
  },
  endustri: {
    yardimci: { aciklama: 'Yalnızca bu tesise ve çalışanlarına hizmet ediyor; dışarıya ayrıca açık değil.', ornek: 'İdari bölüm · personel yemekhanesi · hammadde / ürün deposu · çalışanlara revir' },
    ayni: { ornek: 'Fabrika binasında dışarıya açık satış mağazası · işçi yatakhanesi' },
    ayri: { ornek: 'Aynı parseldeki ayrı depo veya idari bina' }
  },
  toplanma: {
    yardimci: { aciklama: 'Yalnızca bu tesisin ziyaretçilerine hizmet ediyor; dışarıya ayrıca açık değil.', ornek: 'Sinema büfesi · idari ofis · sahne deposu, ziyaretçi otoparkı' },
    ayni: { ornek: 'Aynı binada dışarıya açık mağaza veya ofis' },
    ayri: { ornek: 'Stadyum alanındaki ayrı bir yapı' }
  },
  depolama: {
    yardimci: { aciklama: 'Yalnızca bu depoya ve çalışanlarına hizmet ediyor; dışarıya ayrıca açık değil.', ornek: 'Depo ofisi · personel yemekhanesi · paketleme bölümü' },
    ayni: { ornek: 'Depo binasında satış yapılan bölüm · binadaki bağımsız ofis' },
    ayri: { ornek: 'Aynı parseldeki ayrı ofis binası' }
  },
  yuksek: {
    yardimci: { aciklama: 'Tesisin işletmesinin parçası; ayrı bir işletme olarak çalışmıyor.', ornek: 'İstasyon marketi · istasyonun idari bölümü · personel yemekhanesi · tehlikeli madde içermeyen malzeme deposu' },
    ayni: { ornek: 'Ayrı işletilen, dışarıya açık restoran' },
    ayri: { ornek: 'Aynı parseldeki ayrı bir yapı' }
  }
}

// "Başka kullanım var mı?" sorusu: sınıf dokümanlarındaki ifadeler (soru · "hayır" seçeneği).
export const DIGER_VAR_METNI: Record<SinifKod, { soru: string; hayir: string }> = {
  konut: { soru: 'Bu yapıda konut dışında başka bir kullanım bulunuyor mu?', hayir: 'Hayır, yalnızca konut olarak kullanılıyor' },
  konaklama: { soru: 'Bu yapıda konaklama dışında başka bir kullanım bulunuyor mu?', hayir: 'Hayır, yalnızca konaklama amacıyla kullanılıyor' },
  kurumsal: { soru: 'Bu yapıda kurumsal kullanım dışında başka bir kullanım bulunuyor mu?', hayir: 'Hayır, yalnızca kurumsal amaçla kullanılıyor' },
  buro: { soru: 'Bu yapıda büro dışında başka bir kullanım bulunuyor mu?', hayir: 'Hayır, yalnızca büro olarak kullanılıyor' },
  ticaret: { soru: 'Bu yapıda ticari kullanım dışında başka bir kullanım bulunuyor mu?', hayir: 'Hayır, yalnızca ticari amaçla kullanılıyor' },
  endustri: { soru: 'Bu yapıda endüstriyel kullanım dışında başka bir kullanım bulunuyor mu?', hayir: 'Hayır, yalnızca endüstriyel amaçla kullanılıyor' },
  toplanma: { soru: 'Bu yapıda toplanma amaçlı kullanım dışında başka bir kullanım bulunuyor mu?', hayir: 'Hayır, yalnızca toplanma amacıyla kullanılıyor' },
  depolama: { soru: 'Bu yapıda depolama dışında başka bir kullanım bulunuyor mu?', hayir: 'Hayır, yalnızca depolama amacıyla kullanılıyor' },
  yuksek: { soru: 'Bu tesiste tehlikeli madde faaliyeti dışında başka bir kullanım bulunuyor mu?', hayir: 'Hayır, yalnızca bu faaliyet için kullanılıyor' }
}

// Ana kullanım olarak seçildiğinde "başka kullanım" adımı olmayan sınıflar: karma kullanım hesaplanmaz, sonuç yalnız kendi periyodu.
// Toplanma: müşteri Ekran 7 §9 "bu sürümde karma kullanım hesaplanmayacak" (kullanıcı kararı, 10 Ekim). Diğer kullanım olarak eklenen toplanma etkilenmez.
export const KARMA_YOK: SinifKod[] = ['toplanma']

// ── Yardım pencereleri ────────────────────────────────────────────────────────
export const YARDIM = {
  yukseklik: {
    baslik: 'Yapı yüksekliği nedir?',
    metin: [
      'BYKHY’ye göre yapı yüksekliği; bodrum katlar, asma katlar ve çatı arası piyesler dâhil olmak üzere yapının inşa edilen bütün katlarının toplam yüksekliğidir.',
      'Bina yüksekliği ise binanın kot aldığı noktadan saçak seviyesine kadar olan mesafedir; ikisi farklıdır.',
      'Bu değerlendirmede kat sayısı değil, yapı yüksekliği esas alınır. Tahmini kat sayısından metre hesabı yapmayın; mümkünse ruhsat, yapı kullanma izin belgesi veya onaylı projedeki değeri esas alın.'
    ]
  },
  alan: {
    baslik: 'Yapı inşaat alanı nedir?',
    metin: [
      'Yapı inşaat alanı, yalnızca işletmenizin veya bağımsız bölümünüzün kullandığı alan değildir. Değerlendirilen yapının bütün katlarını kapsayan yapı inşaat alanıdır. Varsa ruhsat, yapı kullanma izin belgesi veya onaylı projedeki yapı inşaat alanı bilgisini esas alın.',
      'Sadece bulunduğunuz katın, kullandığınız bağımsız bölümün veya binanın zemindeki oturum alanını girmeyin.',
      'Örnek: Altı katlı, her katı yaklaşık 1.000 m² olan bir yapının dördüncü katında 250 m²’lik bir ofis bulunuyorsa 250 m² değil, yapının toplam yapı inşaat alanı esas alınır.'
    ]
  },
  oda: {
    baslik: 'Hangi oda sayısı?',
    metin: [
      'Günlük doluluk dikkate alınmaz. Konaklama için ayrılmış toplam oda sayısını esas alın.',
      'Bugün kaç odada misafir kaldığı, dolu oda sayısı veya yatak sayısı kullanılmaz.',
      'Kampinglerde bungalow, çadır, karavan / motokaravan yeri ve benzeri konaklama birimleri birlikte sayılır.'
    ]
  }
}

// ── Sonuçtaki "detaylı analiz" başlıkları ─────────────────────────────────────
// Müşteri (17 Ekim): başlıklar kullanıcının seçtiği yapı türü, alt türü ve diğer kullanımlara göre oluşturulsun
// (ör. Apartman + Kafe → apartmana, kafeye ve ikisinin birlikteliğine özgü başlıklar). Claude taslağı; FireTech onayı bekliyor.
// Her kullanım için alt türe özel başlıklar (yoksa sınıfın varsayılanı); birden fazla kullanım varsa BIRLIKTE başlıkları eklenir.
// Alt türün başlıklarda geçen kısa adı: seçenek etiketinden farklı olması gerekenler.
export const KULLANIM_KISA_AD: Record<string, string> = {
  mustakil: 'Müstakil konut', apartman: 'Apartman', site: 'Site', yurt: 'Yurt', diger: '',
  egitim: 'Eğitim yapısı', saglik: 'Sağlık yapısı',
  restoran: 'Restoran', salon: 'Salon', bar: 'Bar / gece kulübü', muze: 'Müze', sergi: 'Sergi alanı', ibadet: 'İbadethane',
  spor: 'Spor salonu', fitness: 'Fitness salonu', terminal: 'Terminal', stadyum: 'Stadyum / tribün',
  depo: 'Depo', arsiv: 'Arşiv', silo: 'Silo', ahir: 'Ahır', otopark: 'Otopark', agir_vasita: 'Araç deposu',
  toptanci: 'Toptancı sitesi', kapali_carsi: 'Kapalı çarşı', yedek_parca: 'Yedek parça satış yeri', benzeri: 'Ticari alan',
  gaz: 'Parlayıcı ve patlayıcı gaz tesisi', patlayici: 'Patlayıcı madde tesisi', sivi: 'Yanıcı sıvı tesisi', akaryakit: 'Akaryakıt tesisi'
}
// Alt türü sorulmayan ya da alt türüne özel başlık yazılmamış kullanımlarda sınıfın kısa adı kullanılır.
export const SINIF_KISA_AD: Record<SinifKod, string> = {
  konut: 'Konut', konaklama: 'Konaklama tesisi', kurumsal: 'Kurumsal yapı', buro: 'Büro', ticaret: 'Ticari alan',
  endustri: 'Üretim alanı', toplanma: 'Toplanma alanı', depolama: 'Depolama alanı', yuksek: 'Tehlikeli madde alanı'
}
export const ANALIZ_BASLIKLARI: Record<SinifKod, { varsayilan: string[]; tur?: Record<string, string[]> }> = {
  konut: {
    varsayilan: ['Konutta kaçış yolları ve çıkışlar', 'Kazan dairesi, baca ve bodrum riskleri'],
    tur: {
      mustakil: ['Müstakil konutta kaçış ve söndürme cihazları', 'Isıtma, baca ve mutfak kaynaklı yangın riskleri'],
      apartman: ['Apartman merdiveni ve kaçış yolları', 'Kazan dairesi, bodrum ve otopark güvenliği'],
      site: ['Site içi itfaiye erişimi ve yangın hidrantları', 'Blok merdivenleri ve kaçış yolları']
    }
  },
  konaklama: {
    varsayilan: ['Odalarda duman algılama ve sesli uyarı', 'Misafir tahliyesi, yönlendirme ve acil aydınlatma'],
    tur: {
      yurt: ['Yatakhanelerde duman algılama ve uyarı', 'Gece tahliyesi ve kat koridorları'],
      kamping: ['Konaklama birimleri arasındaki mesafeler', 'Kamp alanında söndürme ve toplanma noktası'],
      tatil_koyu: ['Tatil köyü yapıları arasında itfaiye erişimi', 'Misafir tahliyesi, yönlendirme ve acil aydınlatma']
    }
  },
  kurumsal: {
    varsayilan: ['Kurumsal yapıda kaçış yolları ve tahliye', 'Algılama, alarm ve acil durum planı'],
    tur: {
      egitim: ['Öğrenci tahliyesi ve kaçış yolları', 'Laboratuvar, atölye ve mutfak riskleri'],
      saglik: ['Hasta tahliyesi ve yatay kaçış (kompartıman)', 'Tıbbi gaz ve oksijen güvenliği'],
      ceza: ['Kilitli kapılarla kontrollü tahliye', 'Duman kontrolü ve personel müdahalesi']
    }
  },
  buro: { varsayilan: ['Büro katlarında kaçış yolları ve çıkışlar', 'Arşiv, sunucu ve elektrik odası güvenliği'] },
  ticaret: {
    varsayilan: ['Satış alanında kaçış mesafeleri ve çıkışlar', 'Raf, ambalaj ve ürün kaynaklı yangın yükü'],
    tur: {
      market: ['Satış alanında kaçış mesafeleri ve çıkışlar', 'Soğutma, elektrik panoları ve depo bölümü'],
      supermarket: ['Geniş satış alanında kaçış ve yönlendirme', 'Soğutma, elektrik panoları ve depo bölümü'],
      tamirhane: ['Kaynak, kesme ve sıcak çalışma riskleri', 'Boya, yağ ve yanıcı sıvı depolama'],
      yedek_parca: ['Yağ, lastik ve yanıcı ürün depolaması', 'Satış alanında kaçış ve çıkışlar'],
      kapali_carsi: ['Çarşı içi kaçış yolları ve çıkışlar', 'Dükkânlar arası yangın ayırımı'],
      pasaj: ['Pasaj içi kaçış yolları ve çıkışlar', 'Dükkânlar arası yangın ayırımı']
    }
  },
  endustri: { varsayilan: ['Üretim alanında yangın yükü ve tehlike sınıfı', 'Makine, toz ve yanıcı madde riskleri'] },
  toplanma: {
    varsayilan: ['Kalabalık için çıkış kapasitesi ve kaçış', 'Acil aydınlatma ve yönlendirme'],
    tur: {
      restoran: ['Mutfak davlumbazı ve yağ yangınları', 'Müşteri alanında çıkış kapasitesi'],
      salon: ['Oturma düzeni ve çıkış kapasitesi', 'Sahne, perde ve dekor malzemeleri'],
      bar: ['Kalabalık yoğunluğu ve çıkış kapasitesi', 'Dekor, ses-ışık ve elektrik riskleri'],
      muze: ['Eserleri koruyan söndürme yöntemleri', 'Ziyaretçi tahliyesi ve yönlendirme'],
      sergi: ['Sergi malzemelerinin yangın yükü', 'Ziyaretçi tahliyesi ve yönlendirme'],
      ibadet: ['Kalabalık tahliyesi ve çıkış kapıları', 'Isıtma ve elektrik tesisatı riskleri'],
      spor: ['Tribün ve salon tahliyesi', 'Soyunma, kazan ve teknik hacimler'],
      fitness: ['Salon tahliyesi ve çıkışlar', 'Elektrikli cihaz ve sauna riskleri'],
      terminal: ['Yolcu tahliyesi ve duman kontrolü', 'Bekleme alanlarında yönlendirme ve anons'],
      stadyum: ['Tribün tahliyesi ve çıkış kapasitesi', 'Kalabalık yönetimi ve acil durum planı']
    }
  },
  depolama: {
    varsayilan: ['İstif yüksekliği ve yangın yükü', 'Depoda söndürme ve algılama sistemleri'],
    tur: {
      depo: ['Raf / istif yüksekliği ve yangın yükü', 'Depoda sprinkler ve algılama'],
      arsiv: ['Arşivde yangın yükü ve bölmeler', 'Arşive uygun söndürme yöntemi'],
      silo: ['Toz patlaması ve tutuşma riskleri', 'Silo / tank çevresinde güvenlik mesafeleri'],
      ahir: ['Hayvan tahliyesi ve çıkışlar', 'Yem, saman ve kuru ot depolaması'],
      otopark: ['Otoparkta duman tahliyesi ve havalandırma', 'Araç yangınlarına karşı söndürme'],
      agir_vasita: ['Araç yakıtı ve büyük araç yangınları', 'Duman tahliyesi ve itfaiye erişimi']
    }
  },
  yuksek: {
    varsayilan: ['Tehlikeli madde depolama ve güvenlik mesafeleri', 'Patlama ve tutuşma kaynaklarının kontrolü'],
    tur: {
      gaz: ['LPG / parlayıcı gaz sızıntısı ve gaz algılama', 'Patlamaya karşı ekipman ve havalandırma'],
      patlayici: ['Patlayıcı madde depolama ve güvenlik mesafeleri', 'Tutuşma kaynaklarının kontrolü'],
      sivi: ['Akaryakıt tankları, dökülme ve topraklama', 'Dolum alanında söndürme ve köpük sistemleri']
    }
  }
}
// Birden fazla kullanım (aynı yapıda bağımsız veya yardımcı) seçildiğinde eklenenler. {A} → "Apartman ile Restoran / kafe" ya da "Apartman, market ve restoran / kafe".
export const BIRLIKTE_BASLIKLARI = ['{A} arasında yangın ayırımı', 'Ortak kaçış yolları ve çıkışlar']
// Sonuçta en fazla kaç başlık gösterilir (müşteri, 17 Ekim: 8).
export const ANALIZ_BASLIK_SINIRI = 8

// Ticaret: alan sorusunda "Bilmiyorum / Emin değilim" seçilince gösterilen tanım; ardından m² sorulur (müşteri, 10 Ekim).
export const ALAN_TANIM = {
  metin: 'Yapı inşaat alanı, yalnızca işletmenizin veya bağımsız bölümünüzün kullandığı alan değildir. Değerlendirilen yapının bütün katlarını kapsayan yapı inşaat alanıdır. Varsa ruhsat, yapı kullanma izin belgesi veya onaylı projedeki yapı inşaat alanı bilgisini esas alın.',
  ornek: '10.000 m² yapı inşaat alanına sahip bir yapı içindeki 150 m² dükkân için periyot hesabında 150 m² değil, yapının toplam yapı inşaat alanı dikkate alınır.'
}

// ── Sonuç metinleri ───────────────────────────────────────────────────────────
// Kullanıcı (17 Ekim): "Nasıl karar verildi" notlarında EK-1, BYKHY gibi atıf yok; yerine "mevzuat".
export const METIN = {
  tabi: 'Periyodik Yangın Kontrolüne Tabisiniz',
  belirlenemedi: 'Kontrol Periyodunuz Henüz Belirlenemedi',
  tanimsizBaslik: 'Periyodik Kontrol Süresi Tanımlanmamış',
  tanimsizKonut: 'YGU EK-1’de bu yükseklikteki konutlar için periyodik kontrol süresi tanımlanmamıştır.',
  tanimsizNot: 'Bu sonuç, mevzuat kapsamında yapınız için geçerli olabilecek yangın güvenliği, bakım, test ve işletme yükümlülüklerini ortadan kaldırmaz.',
  karma: 'Aynı yapıda birden fazla bağımsız kullanım bulunduğundan, mevzuat uyarınca kontrol periyodu düşük olan kullanımın süresi uygulanır.',
  ayriYapi: 'Ayrı yapıdaki kullanımlar bu yapının periyodunu değiştirmez; kendi yapıları olarak ayrıca değerlendirilir.',
  yardimci: 'Yardımcı / ortak alanlar ayrı kullanım sayılmaz; ana kullanımla birlikte değerlendirilir.',
  // Başlık listesinin üstü (müşteri örneği: "YAPINIZA ÖZEL ANALİZ BAŞLIKLARI" / "Apartman + Dönerci Yangın Güvenliği").
  analizEtiket: 'Yapınıza Özel Analiz Başlıkları',
  analizAdiSonu: 'Yangın Güvenliği',
  analizAdiYedek: 'Yapınızın Yangın Güvenliği',
  // Kullanım bilgisi yokken (yedek) gösterilen genel başlıklar; normalde ANALIZ_BASLIKLARI kullanılır.
  basliklar: ['Kaçış ve Tahliye', 'Yangın Kapıları ve Bölmeleri', 'Acil Durum Aydınlatma ve Yönlendirme', 'Algılama ve Alarm Sistemleri', 'Söndürme Sistemleri'],
  degerCumlesi: 'Yapınıza ve kullanım türlerinize özel kontrol maddelerini görün, eksikleri önceden belirleyin ve periyodik kontrole hazırlanın.',
  cta: 'Detaylı Yangın Güvenliği Analizini Başlat',
  uyari: 'Bu sonuç resmî bir yangın güvenlik raporu veya periyodik kontrol raporu değildir. Kullanıcı tarafından verilen bilgiler doğrultusunda oluşturulan ön değerlendirme sonucudur.'
}
