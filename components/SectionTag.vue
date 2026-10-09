<script setup lang="ts">
// Sunumdaki eğik kenarlı lacivert bölüm etiketi: "01 | HÜKÜM".
defineProps<{ num?: string; label: string }>()
</script>

<template>
  <span class="tag"><span v-if="num" class="tag-num">{{ num }}</span><span v-if="num" class="tag-sep">|</span>{{ label }}</span>
</template>

<style scoped>
.tag {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 34px 7px 18px;
  background: var(--navy); color: #fff;
  font-family: var(--font-head); font-size: 17px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase;
  clip-path: polygon(0 0, 100% 0, calc(100% - 18px) 100%, 0 100%);
}
.tag-num { color: var(--gold-2); }
.tag-sep { opacity: .6; }
</style>
