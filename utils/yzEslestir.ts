// Yapay zekâ ile eşleştirme (Düzeltme 02): kurallar öneri bulamazsa sunucudaki ara servise sorulur (/api/eslestir;
// firetech_deploy/yz/server.mjs, Gemini). Cevap yalnız gönderilen seçeneklerden biri; hata / kota → null (kullanıcı listeden seçer).
import type { Secenek } from '~/data/onDegerlendirme'

const onbellek = new Map<string, string | null>()

export async function yzEslestir(yazi: string, sinif: string, secenekler: Secenek[]): Promise<string | null> {
  const anahtar = `${sinif}|${yazi.trim().toLocaleLowerCase('tr')}`
  if (onbellek.has(anahtar)) return onbellek.get(anahtar)!
  try {
    const r = await $fetch<{ tur: string | null }>('/api/eslestir', {
      method: 'POST',
      body: { yazi: yazi.trim(), sinif, secenekler: secenekler.map(o => ({ deger: o.deger, etiket: o.etiket, ...(o.ornek ? { ornek: o.ornek } : {}) })) },
      timeout: 9000
    })
    const tur = r.tur && secenekler.some(o => o.deger === r.tur) ? r.tur : null
    onbellek.set(anahtar, tur)
    return tur
  } catch {
    return null // kota, ağ hatası vb.: önbelleğe yazılmaz, sonra yeniden denenebilir
  }
}
