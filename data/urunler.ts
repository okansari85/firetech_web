// Ücretli ürünler. Fiyat ve tahsil edilen tutar backend'den gelir (firetech: FIRETECH_PRICE_BINA / _SITE, KDV hariç + %20 KDV).
export type UrunKod = 'bina' | 'site'

export const URUNLER: Record<UrunKod, { ad: string; aciklama: string }> = {
  bina: {
    ad: 'Detaylı Yangın Güvenliği Analizi',
    aciklama: 'Yapınıza ve kullanım türlerinize özel kontrol maddelerini görün, eksikleri önceden belirleyin ve periyodik kontrole hazırlanın.'
  },
  site: {
    ad: 'Site / Yerleşke Yönetimi',
    aciklama: 'Yapı, Tesis ve Ortak Kullanım Alanlarının Periyodik Kontrol Değerlendirmesi'
  }
}

// Kuruş → "1.234,56"
export const tlYazi = (kurus: number) => (kurus / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
