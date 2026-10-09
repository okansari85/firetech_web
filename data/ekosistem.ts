// FireTech ekosistemi: müşterinin ekosistem metni ve görselinden (yalnızca içerik).

export type Bilesen = { slug: string; ad: string; vurgu: string; kisa: string; gorev: string; deger: string; ikon: string }

export const bilesenler: Bilesen[] = [
  {
    slug: 'fireos',
    ad: 'FireOS',
    vurgu: 'OS',
    kisa: 'Dijital yangın güvenliği platformu',
    gorev: 'Yangın güvenliği bilgisini, mühendislik yaklaşımını ve dijital iş akışlarını saha uygulamalarına dönüştüren ilk stratejik teknoloji platformudur.',
    deger: 'Yapı ve tesis bilgisi, kontrol hazırlığı, kanıt, bulgu, düzeltici faaliyet, doğrulama ve raporlama süreçlerinin bütünleşik yönetimi.',
    ikon: 'platform'
  },
  {
    slug: 'fire-academy',
    ad: 'Fire Academy',
    vurgu: 'Academy',
    kisa: 'Bilgi, eğitim ve yayın',
    gorev: 'Bilgi üretimi, doğrulama, eğitim, yayın ve yetkinlik geliştirme merkezidir.',
    deger: 'Teknik eğitimler, rehberler, vaka analizleri, yayınlar, uzmanlık gelişimi ve mesleki topluluk.',
    ikon: 'academy'
  },
  {
    slug: 'fire-intelligence',
    ad: 'Fire Intelligence',
    vurgu: 'Intelligence',
    kisa: 'Analiz ve karar desteği',
    gorev: 'Doğrulanmış veri ve bilgiyi analiz ederek mühendislik ve yönetim kararlarını destekler.',
    deger: 'Risk analizleri, eğilimler, karşılaştırmalar, önceliklendirme, öngörü ve karar destek çıktıları.',
    ikon: 'chart'
  },
  {
    slug: 'fire-labs',
    ad: 'Fire Labs',
    vurgu: 'Labs',
    kisa: 'Araştırma, geliştirme ve doğrulama',
    gorev: 'Yeni teknolojilerin, yöntemlerin ve mühendislik yaklaşımlarının araştırıldığı, prototiplendiği ve doğrulandığı Ar-Ge alanıdır.',
    deger: 'Araştırma projeleri, deneysel modeller, prototipler, doğrulanmış yöntemler ve ürünleşebilir teknolojiler.',
    ikon: 'flask'
  },
  {
    slug: 'fire-solutions',
    ad: 'Fire Solutions',
    vurgu: 'Solutions',
    kisa: 'Mühendislik ve saha çözümleri',
    gorev: 'FireTech’in bilgi, metodoloji ve teknolojilerini müşterilerin ve sahaların somut ihtiyaçlarına uygular.',
    deger: 'Mühendislik hizmetleri, kurumsal çözümler, müşteri projeleri ve saha uygulamaları.',
    ikon: 'gear'
  }
]

export const katmanlar = [
  { ad: 'FTKA — Ortak Bilgi Mimarisi', ogeler: ['Terminoloji', 'Kaynaklar', 'Doğrulama', 'Bilgi ilişkileri'], ikon: 'book' },
  { ad: 'Ortak Teknoloji Altyapısı', ogeler: ['Yazılım', 'Yapay zekâ', 'Mobil', 'Kural motorları', 'Veri ve entegrasyon'], ikon: 'chip' },
  { ad: 'İş Birliği ve Saha Doğrulama', ogeler: ['Üniversiteler', 'İtfaiyeler', 'OSB’ler', 'Kamu', 'Özel sektör'], ikon: 'people' }
]
