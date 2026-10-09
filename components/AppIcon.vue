<script setup lang="ts">
// İnce çizgili ikon seti (sunumdaki lacivert rozet ikonları gibi). Yeni ikon: paths'e ekle.
const props = defineProps<{ name: string }>()
const paths: Record<string, string> = {
  shield: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z M9 12l2 2 4-4',
  platform: 'M3 5h18v11H3z M8 20h8 M12 16v4 M7 9h4 M7 12h7',
  academy: 'M2 9l10-5 10 5-10 5-10-5z M6 11v5c3 2 9 2 12 0v-5 M22 9v6',
  chart: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  flask: 'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3 M7 15h10',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',
  book: 'M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z M20 4h-4a3 3 0 0 0-3 3',
  chip: 'M7 7h10v10H7z M10 10h4v4h-4z M9 3v4 M15 3v4 M9 17v4 M15 17v4 M3 9h4 M3 15h4 M17 9h4 M17 15h4',
  people: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20c0-3 3-5 6-5s6 2 6 5 M17 11a2.5 2.5 0 1 0 0-5 M18 15c2 .5 3 2 3 5',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2',
  building: 'M4 21V4h10v17 M14 9h6v12 M2 21h20 M7 8h4 M7 12h4 M7 16h4 M17 13h1 M17 17h1',
  report: 'M6 2h9l5 5v15H6z M14 2v6h6 M9 13h8 M9 17h6',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-5-5',
  scale: 'M12 3v18 M5 21h14 M4 7h16 M4 7l-3 7a4 4 0 0 0 6 0z M20 7l-3 7a4 4 0 0 0 6 0z',
  alert: 'M12 3l10 18H2z M12 10v5 M12 18v.5',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  close: 'M6 6l12 12 M18 6L6 18',
  check: 'M5 12l5 5 9-10'
}
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="paths[props.name] || paths.shield" />
  </svg>
</template>
