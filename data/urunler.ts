// Ücretli ürünler (TASLAK ödeme ekranı). Fiyatlara KDV dahil değildir (kullanıcı kararı, 11 Ekim).
// bina: tutar henüz belirlenmedi (kullanıcı kararı bekleniyor) → ekranda "XX,XX TL" görünür.
export type UrunKod = 'bina' | 'site'

export const URUNLER: Record<UrunKod, { ad: string; aciklama: string; fiyat: number | null; sonra: string }> = {
  bina: {
    ad: 'Detaylı Yangın Güvenliği Analizi',
    aciklama: 'Yapınıza ve kullanım türlerinize özel kontrol maddelerini görün, eksikleri önceden belirleyin ve periyodik kontrole hazırlanın.',
    fiyat: null,
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
