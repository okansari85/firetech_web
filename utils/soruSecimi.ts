// Yapıya özel yönlendirme soruları (sonuç ekranı, cevap beklenmez): müşterinin v7 seçim algoritmasının birebir TypeScript
// karşılığı (FireTech_tag_and_select_v7.py › select). Soru metinleri yalnız data/soruHavuzu.json'dan; yeni soru üretilmez.
// Modlar: tek_secim (paketin 8 sorusu), ayni_bina (4 MIX + 4 özgün), site_yonetimi (4 yönetim + 4 özgün),
// tek_tesis_farkli_boyut (yüksek tehlikeli: 09-A madde / 09-B tesis / 09-C işlem tek tesisin boyutları).
import HAVUZ from '~/data/soruHavuzu.json'

export type SecimModu = 'tek_secim' | 'ayni_bina' | 'site_yonetimi' | 'tek_tesis_farkli_boyut'
export type HavuzSoru = { id: string; rol: string; metin: string; topicGroup: string; eq: string; spec: number; pri: number; paket: string }
export type SecimSonucu = { mod: SecimModu; paketler: string[]; sorular: HavuzSoru[]; temsilEdilmeyen: string[] }

type Ham = [string, string, string, string, string, number, number]
const soru = (q: Ham, paket: string): HavuzSoru => ({ id: q[0], rol: q[1], metin: q[2], topicGroup: q[3], eq: q[4], spec: q[5], pri: q[6], paket })
const PAKET: Record<string, { ad: string; sorular: HavuzSoru[] }> = Object.fromEntries(
  Object.entries(HAVUZ.paketler as Record<string, { ad: string; sorular: Ham[] }>).map(([id, p]) => [id, { ad: p.ad, sorular: p.sorular.map(q => soru(q, id)) }]))
const MIX: Record<string, HavuzSoru> = Object.fromEntries((HAVUZ.mix as Ham[]).map(q => [q[0], soru(q, 'MIX')]))
const TUM: Record<string, HavuzSoru> = { ...MIX, ...Object.fromEntries(Object.values(PAKET).flatMap(p => p.sorular.map(q => [q.id, q]))) }

export const paketAdi = (id: string) => PAKET[id]?.ad ?? id
export const HAVUZ_ESLEME = HAVUZ as unknown as {
  esleme: Record<string, Record<string, string>>; diger: Record<string, string>
  yuksek: { madde: Record<string, string>; tesis: Record<string, string>; islem: Record<string, string> }; site: { oturan: string; yonetim: string }
}

// Python'daki sıralama anahtarı: (-priority, -specificity, id)
const sirala = (a: HavuzSoru, b: HavuzSoru) => b.pri - a.pri || b.spec - a.spec || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

// difflib.SequenceMatcher(None, a, b).ratio() — Ratcliff/Obershelp (200 karakter altı metinlerde autojunk devreye girmez)
function benzerlik(a: string, b: string): number {
  const eslesen = (a0: number, a1: number, b0: number, b1: number): number => {
    let enI = a0, enJ = b0, enK = 0
    let onceki: Record<number, number> = {}
    for (let i = a0; i < a1; i++) {
      const yeni: Record<number, number> = {}
      for (let j = b0; j < b1; j++) {
        if (a[i] !== b[j]) continue
        const k = (onceki[j - 1] ?? 0) + 1
        yeni[j] = k
        if (k > enK) { enI = i - k + 1; enJ = j - k + 1; enK = k }
      }
      onceki = yeni
    }
    if (!enK) return 0
    return enK + eslesen(a0, enI, b0, enJ) + eslesen(enI + enK, a1, enJ + enK, b1)
  }
  const t = a.length + b.length
  return t ? (2 * eslesen(0, a.length, 0, b.length)) / t : 1
}
const kucuk = (s: string) => s.toLocaleLowerCase('tr')

function ozgunSec(secilen: string[], n: number, haric: string[] = []): { secilenler: HavuzSoru[]; gruplar: Set<string> } {
  const havuz: HavuzSoru[] = []
  for (const id of secilen) for (const q of PAKET[id]!.sorular) {
    if (!['ozel_kullanim', 'tahliye', 'algilama_uyari', 'ekip_organizasyon'].includes(q.rol)) continue
    if (haric.includes(q.topicGroup) && q.rol !== 'ozel_kullanim') continue
    havuz.push(q)
  }
  const secilenler: HavuzSoru[] = []
  const gruplar = new Set(haric)
  const sayac: Record<string, number> = {}
  const uygun = (q: HavuzSoru) => !secilenler.some(x => x.id === q.id) && !gruplar.has(q.eq) && q.spec >= 2
  const ekle = (q: HavuzSoru) => { secilenler.push(q); gruplar.add(q.eq); sayac[q.paket] = (sayac[q.paket] ?? 0) + 1 }
  // 1. geçiş: her seçimin 5. sorusu (alt türe özgü), tıklama sırasından bağımsız önem sırasıyla
  for (const q of secilen.map(id => PAKET[id]!.sorular[4]!).sort(sirala)) { if (secilenler.length >= n) break; if (uygun(q)) ekle(q) }
  // 2. geçiş: az temsil edilen paketler önce, sonra öncelik (Python'daki gibi sıralama bir kez yapılır)
  const sayim = { ...sayac }
  const dahaFazla = [...havuz].sort((a, b) => (sayim[a.paket] ?? 0) - (sayim[b.paket] ?? 0) || sirala(a, b))
  for (const q of dahaFazla) { if (secilenler.length >= n) break; if (uygun(q)) ekle(q) }
  return { secilenler, gruplar }
}

export function sec(mod: SecimModu, girdi: string[]): SecimSonucu {
  const ids = [...new Set(girdi)]
  if (!ids.length) throw new Error('Seçim yok')
  const bilinmeyen = ids.filter(x => !PAKET[x])
  if (bilinmeyen.length) throw new Error(`Bilinmeyen paket: ${bilinmeyen.join(',')}`)
  let cikti: HavuzSoru[]
  if (mod === 'tek_secim') {
    if (ids.length !== 1) throw new Error('tek_secim tek paket ister')
    cikti = [...PAKET[ids[0]!]!.sorular]
  } else if (mod === 'ayni_bina') {
    if (ids.length < 2) throw new Error('ayni_bina birden fazla paket ister')
    if (ids.some(i => i.startsWith('09-') || i.endsWith('-SAKIN') || i.endsWith('-YONETIM'))) throw new Error('Yüksek tehlike boyutları ve site rolleri ayrı kullanım sayılmaz')
    const mixIds = ids.length === 2 ? ['MIX-01', 'MIX-03', 'MIX-05', 'MIX-06'] : ids.length === 3 ? ['MIX-01', 'MIX-03', 'MIX-04', 'MIX-05'] : ['MIX-02', 'MIX-03', 'MIX-04', 'MIX-05']
    const ozgunN = 8 - mixIds.length
    const { secilenler, gruplar } = ozgunSec(ids, ozgunN)
    if (secilenler.length < ozgunN) {
      for (const m of ['MIX-06', 'MIX-02', 'MIX-01', 'MIX-04', 'MIX-03', 'MIX-05']) {
        if (!mixIds.includes(m) && !gruplar.has(MIX[m]!.eq)) { mixIds.push(m); if (secilenler.length + mixIds.length >= 8) break }
      }
    }
    if (mixIds.length + secilenler.length < 8) {
      const kalan = ids.flatMap(id => PAKET[id]!.sorular).filter(q => !['hazirlik', 'analize_gecis'].includes(q.rol) && !secilenler.some(c => c.id === q.id))
      for (const aday of kalan.sort(sirala)) {
        if (mixIds.length + secilenler.length >= 8) break
        if (Math.max(0, ...secilenler.map(c => benzerlik(kucuk(aday.metin), kucuk(c.metin)))) > 0.74) continue
        if (['ALGILAMA_UYARI', 'SONDURME'].includes(aday.topicGroup) && mixIds.includes('MIX-03')) continue
        if (aday.topicGroup === 'PLAN_BELGE' && mixIds.includes('MIX-05')) continue
        secilenler.push(aday)
      }
    }
    if (mixIds.length + secilenler.length < 8) for (const m of Object.keys(MIX)) { if (mixIds.length + secilenler.length >= 8) break; if (!mixIds.includes(m)) mixIds.push(m) }
    cikti = [...mixIds.map(m => MIX[m]!), ...secilenler]
  } else if (mod === 'site_yonetimi') {
    if (ids[0] !== '01-X-005-YONETIM') throw new Error('Site yönetimi profili ilk sırada olmalı')
    const cekirdek = ['01-X-005-YONETIM-Q01', '01-X-005-YONETIM-Q04', '01-X-005-YONETIM-Q06', '01-X-005-YONETIM-Q07']
    const { secilenler } = ozgunSec(ids.slice(1), 4)
    if (secilenler.length < 4) secilenler.push(...PAKET['01-X-005-YONETIM']!.sorular.filter(q => !cekirdek.includes(q.id) && !secilenler.some(x => x.id === q.id)).slice(0, 4 - secilenler.length))
    cikti = [...cekirdek.map(id => TUM[id]!), ...secilenler]
  } else {
    const tesis = ids.find(x => x.startsWith('09-B-'))
    if (!tesis) throw new Error('09-B tesis seçimi gerekli')
    const cekirdek = [`${tesis}-Q02`, `${tesis}-Q03`, `${tesis}-Q06`, `${tesis}-Q07`]
    const boyutlar = [...ids.filter(x => x.startsWith('09-A')), ...ids.filter(x => x.startsWith('09-B')), ...ids.filter(x => x.startsWith('09-C')), ...ids.filter(x => x.startsWith('06-'))]
    const sira = (id: string) => (id.startsWith('09-B') ? 0 : id.startsWith('09-C') ? 1 : id.startsWith('09-A') ? 2 : 3)
    const ankrajlar = boyutlar.map(x => PAKET[x]!.sorular[4]!).sort((a, b) => sira(a.id) - sira(b.id) || sirala(a, b))
    const birincil: HavuzSoru[] = []
    const yapildi = new Set<string>()
    for (const q of ankrajlar) { if (birincil.length >= 4) break; if (yapildi.has(q.eq)) continue; yapildi.add(q.eq); birincil.push(q) }
    const metinler = () => [...cekirdek.map(x => TUM[x]!.metin), ...birincil.map(x => x.metin)]
    if (birincil.length < 4) {
      for (const boyut of boyutlar) {
        if (birincil.length >= 4) break
        if (birincil.some(q => q.paket === boyut)) continue
        for (const qq of PAKET[boyut]!.sorular) {
          if (!['tahliye', 'algilama_uyari', 'ekip_organizasyon'].includes(qq.rol)) continue
          if (cekirdek.includes(qq.id) || metinler().includes(qq.metin)) continue
          birincil.push(qq); break
        }
      }
    }
    if (birincil.length < 4) {
      for (const q of boyutlar.flatMap(k => PAKET[k]!.sorular).filter(q => ['tahliye', 'algilama_uyari', 'sondurme'].includes(q.rol)).sort(sirala)) {
        if (birincil.length >= 4) break
        if (cekirdek.includes(q.id) || birincil.some(x => x.id === q.id) || metinler().includes(q.metin)) continue
        birincil.push(q)
      }
    }
    cikti = [...cekirdek.map(x => TUM[x]!), ...birincil]
  }
  if (cikti.length !== 8 || new Set(cikti.map(q => q.id)).size !== 8) throw new Error(`8 farklı soru seçilemedi (${mod}: ${ids.join(',')})`)
  const kullanilan = new Set(cikti.map(q => q.paket))
  return { mod, paketler: ids, sorular: cikti, temsilEdilmeyen: ids.filter(i => !kullanilan.has(i)) }
}
