// ÜCRETSİZ ÖN DEĞERLENDİRME — VERİ DOSYASI
// Bütün metinler, seçenekler, eşikler ve katsayılar burada. Müşteri değişikliği gelince yalnız bu dosya düzenlenir.
// Kaynaklar: müşteri sınıf dokümanları (8 Ekim), ÜCRETSİZ EKRANLAR (2 Ekim), YGU EK-1, BYKHY (Md. 8–19, Ek-1, Ek-5/A).
// Not: Depolama (M16) ve Yüksek Tehlikeli (M17) akışları Claude taslağıdır; FireTech onayı bekliyor.

export type SinifKod = 'konut' | 'konaklama' | 'kurumsal' | 'buro' | 'ticaret' | 'endustri' | 'toplanma' | 'depolama' | 'yuksek'

export type Secenek = { deger: string; etiket: string; aciklama?: string; ornek?: string }

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
export const TEHLIKE: Secenek[] = [
  { deger: 'yuksek', etiket: 'Yüksek Tehlikeli' },
  { deger: 'orta', etiket: 'Orta Tehlikeli' },
  { deger: 'dusuk', etiket: 'Düşük Tehlikeli' },
  { deger: 'bilmiyorum', etiket: 'Bilmiyorum / Emin değilim' }
]
export const EVET_HAYIR: Secenek[] = [{ deger: 'evet', etiket: 'Evet' }, { deger: 'hayir', etiket: 'Hayır' }]

// ── Sınıfa özel seçenekler ────────────────────────────────────────────────────
export const KONUT_TURU: Secenek[] = [
  { deger: 'mustakil', etiket: 'Müstakil Ev / Villa', aciklama: 'Tek başına kullanılan müstakil konutlar ve villalar.' },
  { deger: 'apartman', etiket: 'Apartman', aciklama: 'Tek yapı / blok halinde konut kullanımı.' },
  { deger: 'site', etiket: 'Site / Yerleşke', aciklama: 'Birden fazla konut yapısı veya blok bulunan site / yerleşke.' }
]
export const KONAKLAMA_TURU: Secenek[] = [
  { deger: 'otel', etiket: 'Otel' }, { deger: 'motel', etiket: 'Motel' }, { deger: 'termal', etiket: 'Termal Tesis' },
  { deger: 'tatil_koyu', etiket: 'Tatil Köyü' }, { deger: 'pansiyon', etiket: 'Pansiyon' },
  { deger: 'kamping', etiket: 'Kamping', aciklama: 'Bungalow, çadır, karavan / motokaravan yeri ve benzeri konaklama birimleri.' },
  { deger: 'yurt', etiket: 'Öğrenci Yurdu' },
  { deger: 'diger', etiket: 'Diğer Benzeri Konaklama Tesisi', aciklama: 'Adı farklı olsa da esas kullanım amacı yatılı konaklama olan tesisler.' }
]
export const KURUMSAL_TURU: Secenek[] = [
  { deger: 'egitim', etiket: 'Eğitim Tesisi', ornek: 'Okul, kreş, anaokulu, dershane, kurs, kütüphane, fakülte / derslik binası' },
  { deger: 'saglik', etiket: 'Sağlık Hizmeti Amaçlı Bina', ornek: 'Hastane, klinik, sağlık ocağı, dispanser, huzurevi, tıbbi laboratuvar' },
  { deger: 'ceza', etiket: 'Tutukevi / Cezaevi / Islahevi', ornek: 'Ceza ve tutukevleri, nezarethaneler, ıslahevleri' },
  { deger: 'muayenehane', etiket: 'Doktor / Diş Hekimi Muayenehanesi', aciklama: 'BYKHY’de Büro Binaları kapsamında değerlendirilir.' }
]
export const YERLESIM: Secenek[] = [
  { deger: 'tek', etiket: 'Tek bina' },
  { deger: 'yerleske', etiket: 'Kampüs / yerleşke / kompleks içindeki bir yapı', aciklama: 'Yerleşkeye tek bir periyot verilmez; değerlendirdiğiniz yapıyı düşünerek devam edin.' }
]
// Toplanma: kullanıcı yükü = alan ÷ katsayı (BYKHY Ek-5/A). "50 kişiden fazla mısınız?" diye doğrudan sorulmaz.
export type ToplanmaTuru = Secenek & { mod: 'tek' | 'oturma_ayakta' | 'dogrulama'; katsayi?: number; alanTuru?: 'net' | 'brüt' }
export const TOPLANMA_TURU: ToplanmaTuru[] = [
  { deger: 'restoran', etiket: 'Restoran / Lokanta / Kantin', ornek: 'Kafeterya, pastane, kahvehane, çay bahçesi gibi benzer kullanımlar', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'salon', etiket: 'Sinema / Tiyatro / Düğün Salonu', ornek: 'Konferans ve konser salonları', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'bar', etiket: 'Bar / Gece Kulübü / Diskotek', mod: 'oturma_ayakta' },
  { deger: 'muze', etiket: 'Müze', mod: 'tek', katsayi: 5, alanTuru: 'brüt' },
  { deger: 'sergi', etiket: 'Sergi Yeri', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'ibadet', etiket: 'İbadethane', ornek: 'Cami, kilise, sinagog', mod: 'tek', katsayi: 1.5, alanTuru: 'net' },
  { deger: 'spor', etiket: 'Çok Amaçlı Spor Salonu', mod: 'tek', katsayi: 3, alanTuru: 'brüt' },
  { deger: 'fitness', etiket: 'Fitness / Aerobik Salonu', mod: 'tek', katsayi: 5, alanTuru: 'brüt' },
  { deger: 'terminal', etiket: 'Terminal / Gar / Havalimanı / Liman', ornek: 'Yolcu bekleme alanı', mod: 'tek', katsayi: 3, alanTuru: 'net' },
  { deger: 'stadyum', etiket: 'Stadyum / Tribün / Yüzme Havuzu', mod: 'dogrulama' },
  { deger: 'diger', etiket: 'Diğer / Benzeri Toplanma Kullanımı', mod: 'dogrulama' }
]
// Endüstri: tehlike sınıfı bilinmiyorsa BYKHY Ek-1 sırasıyla (C → B → A) kontrol edilir.
export const EK1 = {
  C: { baslik: 'BYKHY Ek-1/C — Yüksek Tehlike Kullanım Alanları', ornekler: ['Döşemelik kumaş ve muşamba fabrikaları', 'Aydınlatma fişeği, havai fişek ve selüloz nitrat fabrikaları', 'Boya, vernik ve renklendirici imalatı', 'Plastik köpük, sünger ve köpük lastik imalathaneleri', 'Yapay kauçuk, reçine ve terebentin imalatı; katran damıtma', 'Talaş fabrikaları, odun yünü imalatı', 'Otobüs ambarı, yüklü kamyon ve vagonlar'] },
  B: { baslik: 'BYKHY Ek-1/B — Orta Tehlike Kullanım Alanları', ornekler: ['Cam ve seramik fabrikaları', 'Kimyasallar: boyama işlemleri, sabun, mum, kibrit fabrikaları, fotoğraf laboratuvarları', 'Otomotiv, elektronik, beyaz eşya, metal levha fabrikaları', 'Gıda: mezbaha, mandıra, fırın, bisküvi, çikolata, şeker, değirmen, bira, alkol damıtma', 'Kâğıt, mukavva fabrikaları, matbaa ve cilthaneler', 'Kablo, plastik döküm, kauçuk eşya, halat fabrikaları', 'Tekstil, deri, halı, giysi, ayakkabı imalathaneleri, iplikhaneler', 'Ahşap işleri, mobilya, yonga levha fabrikaları'] },
  A: { baslik: 'BYKHY Ek-1/A — Düşük Tehlike Kullanım Alanları', ornekler: ['Düşük yangın yüküne ve düşük yanabilirliğe sahip', 'Yangına karşı direnci en az 30 dakika', 'Tek bir yangın kompartımanı 126 m²’den büyük değil (126 m² binanın toplam alanı değildir)', 'Ek-1/B veya Ek-1/C kapsamında değil'] }
}
// Depolama (Claude taslağı M16)
export const DEPO_TURU: Secenek[] = [
  { deger: 'depo', etiket: 'Depo / Ambar / Antrepo', ornek: 'Mal, malzeme, ürün deposu; lojistik deposu' },
  { deger: 'arsiv', etiket: 'Arşiv / Eşya Emanet', ornek: 'Arşiv, eşya emanet ve muhafaza yeri' },
  { deger: 'silo', etiket: 'Silo / Tank', ornek: 'Silo, tank çiftliği' },
  { deger: 'ahir', etiket: 'Ahır / Hayvan Barınağı' },
  { deger: 'otopark', etiket: 'Otopark', ornek: 'Kapalı / açık otopark, bina otoparkı, oto galeri, kapalı taksi durağı' },
  { deger: 'agir_vasita', etiket: 'Otobüs / Kamyon / Vagon Deposu', ornek: 'Otobüs garajı, kamyon ve vagon deposu' },
  { deger: 'diger', etiket: 'Diğer / Emin değilim' }
]
export const DEPO_MADDE: Secenek[] = [
  { deger: 'yok', etiket: 'Hayır, bulunmuyor' },
  { deger: 'esas', etiket: 'Evet, esas olarak bunlar depolanıyor' },
  { deger: 'kismen', etiket: 'Evet, ama yalnızca bir kısmı' },
  { deger: 'bilmiyorum', etiket: 'Bilmiyorum' }
]
// Yüksek tehlikeli yerler (Claude taslağı M17)
export const YH_FAALIYET: Secenek[] = [
  { deger: 'gaz', etiket: 'Parlayıcı gazlar', ornek: 'LPG dolum tesisi, tüp bayii / deposu, otogaz, doğalgaz depolama ve dolumu' },
  { deger: 'patlayici', etiket: 'Patlayıcı maddeler', ornek: 'Barut, mermi, dinamit, kapsül, fişek imalatı, deposu veya satışı' },
  { deger: 'sivi', etiket: 'Akaryakıt ve yanıcı sıvılar', ornek: 'Akaryakıt istasyonu, akaryakıt depolama, yanıcı sıvı üretimi veya deposu' }
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

// ── Sonuç metinleri ───────────────────────────────────────────────────────────
export const METIN = {
  tabi: 'Periyodik Yangın Kontrolüne Tabisiniz',
  belirlenemedi: 'Kontrol Periyodunuz Henüz Belirlenemedi',
  tanimsizBaslik: 'Periyodik Kontrol Süresi Tanımlanmamış',
  tanimsizKonut: 'YGU EK-1’de bu yükseklikteki konutlar için periyodik kontrol süresi tanımlanmamıştır.',
  tanimsizNot: 'Bu sonuç, BYKHY veya diğer düzenlemeler kapsamında yapınız için geçerli olabilecek yangın güvenliği, bakım, test ve işletme yükümlülüklerini ortadan kaldırmaz.',
  karma: 'Aynı yapıda birden fazla bağımsız kullanım bulunduğundan, YGU EK-1 uyarınca kontrol periyodu düşük olan kullanımın süresi uygulanır.',
  ayriYapi: 'Ayrı yapıdaki kullanımlar bu yapının periyodunu değiştirmez; kendi yapıları olarak ayrıca değerlendirilir.',
  yardimci: 'Yardımcı / ortak alanlar ayrı kullanım sayılmaz; ana kullanımla birlikte değerlendirilir.',
  basliklarGiris: 'Bu yapı için detaylı analizde öne çıkan başlıklar:',
  basliklar: ['Kaçış ve Tahliye', 'Yangın Kapıları ve Bölmeleri', 'Acil Durum Aydınlatma ve Yönlendirme', 'Algılama ve Alarm Sistemleri', 'Söndürme Sistemleri'],
  degerCumlesi: 'Yapınıza ve kullanım türlerinize özel kontrol maddelerini görün, eksikleri önceden belirleyin ve periyodik kontrole hazırlanın.',
  cta: 'Detaylı Yangın Güvenliği Analizini Başlat',
  uyari: 'Bu sonuç resmî bir yangın güvenlik raporu veya periyodik kontrol raporu değildir. Kullanıcı tarafından verilen bilgiler doğrultusunda oluşturulan ön değerlendirme sonucudur.'
}
