<script setup lang="ts">
// İnce altın çizgi; uçlarında küçük halka (sunumdaki ayraç).
withDefaults(defineProps<{ start?: boolean; end?: boolean }>(), { start: true, end: true })
</script>

<template>
  <div class="rule" aria-hidden="true">
    <span v-if="start" class="ring" />
    <span class="line" />
    <span v-if="end" class="ring" />
  </div>
</template>

<style scoped>
.rule { display: flex; align-items: center; width: 100%; }
.line { flex: 1; height: 1.5px; background: var(--gold-line); }
.ring { width: 11px; height: 11px; border: 1.5px solid var(--gold); border-radius: 50%; flex: none; background: #fff; }
</style>
