// Ücretli ürünler (TASLAK ödeme ekranı). Fiyatlara KDV dahil değildir (kullanıcı kararı, 11 Ekim).
// Tutarlar kullanıcıdan (17 Ekim): bina 19,99 TL; site 19,90 TL (Düzeltmeler belgesi).
export type UrunKod = 'bina' | 'site'

export const URUNLER: Record<UrunKod, { ad: string; aciklama: string; fiyat: number | null; sonra: string }> = {
  bina: {
    ad: 'Detaylı Yangın Güvenliği Analizi',
    aciklama: 'Yapınıza ve kullanım türlerinize özel kontrol maddelerini görün, eksikleri önceden belirleyin ve periyodik kontrole hazırlanın.',
    fiyat: 19.99,
    sonra: '/odeme?urun=bina&tamam=1'
  },
  site: {
    ad: 'Site / Yerleşke Yönetimi',
    aciklama: 'Yapı, Tesis ve Ortak Kullanım Alanlarının Periyodik Kontrol Değerlendirmesi',
    fiyat: 19.9,
    sonra: '/ucretsiz-kontrol/site-yonetimi'
  }
}

export const fiyatYazi = (f: number | null) => (f === null ? 'XX,XX' : f.toLocaleString('tr-TR', { minimumFractionDigits: 2 }))
