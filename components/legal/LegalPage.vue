<script setup lang="ts">
// Yasal sayfaların ortak düzeni: açık zeminli üst bölüm (bölüm etiketi + başlık + altın çizgi) + okunaklı metin sütunu.
// Üst menü ve alt bilgi layouts/default.vue'dan gelir. Metin sayfadan slot ile gelir; başlık ve SEO burada kurulur.
const props = withDefaults(defineProps<{ title: string; description: string; eyebrow?: string }>(), { eyebrow: 'Yasal' })

useSeoMeta({
  title: props.title,
  description: props.description,
  ogTitle: `${props.title} | FireTech`,
  ogDescription: props.description,
  ogType: 'website',
  ogLocale: 'tr_TR'
})
</script>

<template>
  <div>
    <section class="head">
      <div class="wrap head-body">
        <SectionTag :label="eyebrow" />
        <h1 class="title">{{ title }}</h1>
        <GoldRule class="rule" :start="false" />
        <p class="updated">Son güncelleme: {{ LEGAL_UPDATED }}</p>
      </div>
    </section>
    <article class="wrap legal-text">
      <slot />
    </article>
  </div>
</template>

<style scoped>
.head { background: var(--paper); }
.head-body { display: flex; flex-direction: column; align-items: flex-start; gap: 18px; padding-top: 48px; padding-bottom: 40px; }
.title { font-size: clamp(32px, 5vw, 54px); overflow-wrap: break-word; }
.rule { max-width: 420px; }
.updated { color: var(--muted); font-size: 15px; }
@media (max-width: 760px) { .head-body { padding-top: 32px; padding-bottom: 28px; } }
</style>

<style>
/* Metin sayfadan (slot) ve alt bileşenlerden geldiği için kapsamsız; .legal-text yalnız burada kullanılır. */
.legal-text {
  padding-top: 44px;
  padding-bottom: 72px;
  font-size: 16.5px;
  line-height: 1.7;
  color: var(--ink);
  overflow-wrap: break-word;
}
.legal-text h2 {
  margin: 36px 0 10px;
  font-size: clamp(22px, 2.4vw, 26px);
  line-height: 1.2;
}
.legal-text h2:first-child { margin-top: 0; }
.legal-text h3 { margin: 22px 0 6px; font-size: 18px; }
.legal-text p,
.legal-text ul,
.legal-text ol { margin: 0 0 14px; }
.legal-text ul,
.legal-text ol { padding-left: 22px; }
.legal-text li { margin-bottom: 6px; }
.legal-text strong { color: var(--navy); }
.legal-text a { color: var(--navy); text-decoration-color: var(--gold-line); text-underline-offset: 2px; }
.legal-text a:hover { color: var(--gold); }
@media (max-width: 760px) {
  .legal-text { padding-top: 32px; padding-bottom: 56px; font-size: 16px; }
}
</style>
