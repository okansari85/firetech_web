<script setup lang="ts">
// Depolama malzeme ekranı (Oğuz'un R20 sayfası, inventoryView): alan aralığı + malzeme / miktar aralığı satırları (en çok 8).
// Metinler sayfadan aynen. Malzeme listesi türe göre süzülür; hesap motorda (utils/onDegerlendirmeMotoru.ts › depoTahmini).
import { DEPO_MALZEME, DEPO_MALZEME_IZINLI, DEPO_MALZEME_VARSAYILAN, DEPO_TEHLIKELI_MALZEME, DEPO_ALAN_BANT, DEPO_MIKTAR, DEPO_METIN } from '~/data/onDegerlendirme'
import { depoTahmini, type DepoStok } from '~/utils/onDegerlendirmeMotoru'

const props = defineProps<{ deger?: DepoStok; tur?: string }>()
const emit = defineEmits<{ cevap: [deger: DepoStok] }>()

const EN_COK = 8
const izinli = props.tur ? DEPO_MALZEME_IZINLI[props.tur] : undefined
const malzemeler = izinli ? izinli.map(id => DEPO_MALZEME.find(m => m.id === id)!) : DEPO_MALZEME.filter(m => !DEPO_TEHLIKELI_MALZEME.includes(m.id))
// Eski (V6 R1, m² ile) kayıt yeni ekrana taşınmaz; boş başlar
const s = ref<DepoStok>(typeof props.deger?.alan === 'string' ? JSON.parse(JSON.stringify(props.deger))
  : { alan: '', kalemler: [{ id: (props.tur && DEPO_MALZEME_VARSAYILAN[props.tur]) || '', miktar: '' }] })
const hata = ref('')
const ekle = () => { if (s.value.kalemler.length < EN_COK) s.value.kalemler.push({ id: '', miktar: '' }) }
const sil = (i: number) => { s.value.kalemler.splice(i, 1); if (!s.value.kalemler.length) s.value.kalemler.push({ id: '', miktar: '' }) }
const gonder = () => {
  const r = depoTahmini(s.value)
  if (!r.ok) { hata.value = r.neden; return }
  emit('cevap', JSON.parse(JSON.stringify(s.value)))
}
</script>

<template>
  <div class="stok">
    <p class="not">{{ DEPO_METIN.stokIpucu }}</p>
    <label class="alan">{{ tur === 'acik_saha' ? 'Açık stok sahasının' : 'Depolama bölümünün' }} büyüklüğü
      <select v-model="s.alan" @change="hata = ''">
        <option value="">Alan aralığını seçin</option>
        <option v-for="b in DEPO_ALAN_BANT" :key="b.deger" :value="b.deger">{{ b.etiket }}</option>
      </select>
    </label>

    <div v-for="(r, i) in s.kalemler" :key="i" class="satir">
      <label>Malzeme {{ i + 1 }}
        <select v-model="r.id" @change="hata = ''">
          <option value="">Malzeme seçin</option>
          <option v-for="m in malzemeler" :key="m.id" :value="m.id">{{ m.ad }}</option>
        </select>
      </label>
      <label>Miktar
        <select v-model="r.miktar" @change="hata = ''">
          <option value="">Miktar seçin</option>
          <option v-for="q in DEPO_MIKTAR" :key="q.deger" :value="q.deger">{{ q.etiket }}</option>
        </select>
      </label>
      <button type="button" class="sil" aria-label="Malzemeyi kaldır" @click="sil(i)"><AppIcon name="close" /></button>
    </div>
    <button type="button" class="btn ghost ekle" :disabled="s.kalemler.length >= EN_COK" @click="ekle">+ Malzeme ekle</button>
    <p v-if="hata" class="not sari" role="alert">{{ hata }}</p>

    <div class="alt"><button type="button" class="btn gold-btn" @click="gonder">Devam Et <AppIcon name="arrow" class="ico" /></button></div>
  </div>
</template>

<style scoped>
.stok { margin-top: 22px; display: flex; flex-direction: column; gap: 14px; }
.alan, .satir label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--navy); }
select { min-height: 46px; padding: 0 12px; border: 1.5px solid var(--border); border-radius: 8px; font: inherit; font-weight: 400; background: #fff; }
select:focus { outline: 2px solid var(--gold-2); border-color: var(--gold); }
.satir { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) auto; gap: 10px; align-items: end; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.sil { width: 46px; height: 46px; display: grid; place-items: center; border: 1.5px solid var(--border); border-radius: 8px; background: #fff; cursor: pointer; color: var(--navy); }
.sil svg { width: 18px; height: 18px; }
.ekle { align-self: flex-start; }
.not { margin: 0; padding: 12px 14px; border-radius: 8px; background: var(--paper); border-left: 3px solid var(--navy); font-size: 14.5px; }
.not.sari { border-left-color: var(--gold); background: #fffbf2; }
.alt { display: flex; gap: 12px; }
.ico { width: 20px; height: 20px; }
@media (max-width: 640px) {
  .satir { grid-template-columns: 1fr auto; }
  .satir label:first-child { grid-column: 1 / -1; }
}
</style>
