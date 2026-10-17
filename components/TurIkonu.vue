<script setup lang="ts">
// Tür seçeneği ikonu (data/turIkonlari.ts, Tabler Icons outline)
import { IKON_SVG } from '~/data/turIkonlari'
defineProps<{ name: string }>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="IKON_SVG[name]" />
</template>
