// Ön değerlendirme sonucundaki analiz başlıklarına ikon: başlığın konusuna göre (ilk eşleşen kural).
// Başlık metinleri data/onDegerlendirme.ts (ANALIZ_BASLIKLARI, BIRLIKTE_BASLIKLARI); ikonlar components/AppIcon.vue.
const KURALLAR: [RegExp, string][] = [
  [/kazan|baca|ısıtma|sıcak çalışma|kaynak,|sauna/i, 'alev'],
  [/mutfak|davlumbaz|pişirme/i, 'mutfak'],
  [/aydınlatma|yönlendirme/i, 'cikis'],
  [/algılama|alarm|uyarı|anons/i, 'alarm'],
  [/söndürme|sprinkler|köpük|hidrant/i, 'sondurme'],
  [/itfaiye/i, 'itfaiye'],
  [/duman|havalandırma/i, 'duman'],
  [/kapı|bölme|ayırım|kompartıman/i, 'kapi'],
  [/otopark|araç/i, 'arac'],
  [/elektrik|pano|sunucu|ses-ışık/i, 'elektrik'],
  [/gaz|oksijen|patla|akaryakıt|tank|toz|tutuşma|tehlike/i, 'alert'],
  [/depo|istif|raf|arşiv|yük|ambalaj|yem/i, 'kutu'],
  [/kaçış|tahliye|merdiven/i, 'kacis'],
  [/kalabalık|misafir|öğrenci|hasta|ziyaretçi|müşteri|yolcu|personel|çıkış/i, 'people']
]
export const baslikIkonu = (baslik: string) => KURALLAR.find(([r]) => r.test(baslik))?.[1] ?? 'building'
