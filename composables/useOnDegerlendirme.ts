// Ücretsiz ön değerlendirmenin durumu (sayfalar arası paylaşılır; tarayıcı oturumunda saklanır).
import type { SinifKod } from '~/data/onDegerlendirme'
import { akis, hesapla, mevcutSoru, type Degerlendirme, type Eylem } from '~/utils/onDegerlendirmeMotoru'

const ANAHTAR = 'firetech_on_degerlendirme'

export const useOnDegerlendirme = () => {
  const d = useState<Degerlendirme>('onDegerlendirme', () => ({ esas: null, c: {} }))

  if (import.meta.client && !d.value.esas) {
    try {
      const kayit = sessionStorage.getItem(ANAHTAR)
      if (kayit) d.value = JSON.parse(kayit)
    } catch { /* depolama kapalı olabilir */ }
  }
  const kaydet = () => {
    if (!import.meta.client) return
    try { sessionStorage.setItem(ANAHTAR, JSON.stringify(d.value)) } catch { /* yok say */ }
  }

  const sorular = computed(() => akis(d.value))
  const mevcut = computed(() => mevcutSoru(d.value))
  const cevaplananlar = computed(() => sorular.value.filter(q => q.id !== mevcut.value?.id && q.tip !== 'bilgi'))
  const sonuc = computed(() => hesapla(d.value))
  const tamam = computed(() => !!d.value.esas && !mevcut.value)

  const baslat = (esas: SinifKod) => { d.value = { esas, c: {} }; kaydet() }
  const cevapla = (id: string, deger: any) => {
    const c = { ...d.value.c, [id]: deger }
    if (id === 'digerVar' && deger === 'hayir') delete c.digerler
    d.value = { ...d.value, c }
    kaydet()
  }
  // Bir cevabı değiştirmek: o soru ve ondan sonra sorulanlar silinir (akış yeniden kurulur).
  const degistir = (id: string) => {
    const ids = sorular.value.map(q => q.id)
    const i = ids.indexOf(id)
    const c = { ...d.value.c }
    for (const x of i >= 0 ? ids.slice(i) : [id]) delete c[x]
    d.value = { ...d.value, c }
    kaydet()
  }
  const geri = () => {
    const son = cevaplananlar.value[cevaplananlar.value.length - 1]
    if (son) degistir(son.id)
    return !!son
  }
  const eylem = (e: Eylem) => {
    if (e.tip === 'esas' && e.sinif) { d.value = { esas: e.sinif, c: { ...(e.ek || {}) } }; kaydet() }
  }
  const sifirla = () => { d.value = { esas: null, c: {} }; kaydet() }

  return { d, sorular, mevcut, cevaplananlar, sonuc, tamam, baslat, cevapla, degistir, geri, eylem, sifirla }
}
