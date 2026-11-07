<script setup lang="ts">
// Hesabım › Ödemelerim: siparişler ve durumları (backend, PayTR bildirimiyle güncellenir).
import { URUNLER } from '~/data/urunler'
import type { Siparis } from '~/composables/useUyelik'

useSeoMeta({ title: 'Ödemelerim', robots: 'noindex' })

const { siparisler } = useUyelik()
const DURUM: Record<Siparis['status'], string> = { paid: 'Ödendi', pending: 'Ödeme bekleniyor', failed: 'Ödeme tamamlanamadı' }
const tarih = (s: string) => new Date(s).toLocaleString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const tl = (s: string) => Number(s).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <HesabimCerceve baslik="Ödemelerim">
    <div v-if="!siparisler.length" class="card"><p class="muted">Henüz bir ödemeniz yok.</p></div>
    <ul v-else class="liste">
      <li v-for="s in siparisler" :key="s.merchant_oid" class="card satir">
        <div class="ust">
          <strong>{{ URUNLER[s.product]?.ad ?? s.product }}</strong>
          <span class="durum" :class="s.status">{{ DURUM[s.status] }}</span>
        </div>
        <dl class="dokum">
          <div><dt>Sipariş no</dt><dd>{{ s.merchant_oid }}</dd></div>
          <div><dt>Tarih</dt><dd>{{ tarih(s.paid_at || s.created_at) }}</dd></div>
          <div><dt>Bedel (KDV hariç)</dt><dd>{{ tl(s.net_amount) }} TL</dd></div>
          <div><dt>KDV (%20)</dt><dd>{{ tl(s.vat_amount) }} TL</dd></div>
          <div class="toplam"><dt>Toplam</dt><dd>{{ tl(s.total_amount) }} TL</dd></div>
        </dl>
        <NuxtLink v-if="s.product === 'site' && s.status === 'paid'" to="/ucretsiz-kontrol/site-yonetimi" class="btn ghost">Site Yönetimine Git</NuxtLink>
      </li>
    </ul>
  </HesabimCerceve>
</template>

<style scoped>
.liste { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.satir { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
.ust { display: flex; justify-content: space-between; align-items: center; gap: 12px; width: 100%; flex-wrap: wrap; }
.ust strong { font-family: var(--font-head); font-size: 19px; color: var(--navy); }
.durum { padding: 4px 10px; border-radius: 999px; font-size: 13px; font-weight: 600; background: var(--paper); color: var(--muted); }
.durum.paid { background: var(--navy); color: var(--gold-2); }
.durum.failed { background: #fbeaea; color: var(--red); }
.dokum { margin: 0; width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px 20px; }
.dokum div { display: flex; flex-direction: column; }
.dokum dt { font-size: 12.5px; color: var(--muted); }
.dokum dd { margin: 0; font-weight: 600; color: var(--navy); word-break: break-all; }
.dokum .toplam dd { font-family: var(--font-head); font-size: 20px; }
.muted { color: var(--muted); }
</style>
