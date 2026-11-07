<script setup lang="ts">
// Satıcı / veri sorumlusu kimlik bilgileri (utils/seller.ts); sözleşme, ön bilgilendirme ve KVKK metinlerinde ortak.
const s = SELLER
</script>

<template>
  <ul>
    <li><strong>Unvan:</strong> {{ s.title }}</li>
    <li><strong>Adres:</strong> {{ s.address }}</li>
    <li><strong>Vergi dairesi / no:</strong> {{ s.taxOffice }} / {{ s.taxNo }}</li>
    <li><strong>MERSİS no:</strong> {{ s.mersis }}</li>
    <li><strong>Ticaret sicil:</strong> {{ s.tradeRegistry }}</li>
    <li>
      <strong>Telefon:</strong>
      <template v-for="(p, i) in s.phones" :key="p.tel">{{ i ? ' · ' : ' ' }}<a :href="`tel:${p.tel}`">{{ p.label }}</a></template>
    </li>
    <li><strong>E-posta:</strong> <a :href="`mailto:${s.email}`">{{ s.email }}</a></li>
    <li><strong>Web:</strong> <a :href="s.web">{{ s.web.replace('https://', '') }}</a></li>
  </ul>
</template>
