<script setup lang="ts">
// Ana sayfa giriş görseli: teknik çizim tarzında, sırayla çizilen dört yapı (karma kullanım, otel, okul, fabrika).
// Çizgiler kalemle çizilir gibi belirir, ardından kat renkleri ve etiketler gelir. Her çizim, o sınıfta periyodu
// belirleyen bilgiyi (kullanım, oda sayısı, yapı inşaat alanı, tehlike sınıfı) gösterir. Fotoğraflı eski sürüm: HeroSlider.vue.
const RENK = { konut: '#9c7020', ticaret: '#921616', buro: '#0c2840', endustri: '#6b7280', depo: '#b8913f', konaklama: '#0f766e', kurumsal: '#5b4b8a' }
const slaytlar = ['Karma kullanım', 'Konaklama', 'Kurumsal', 'Endüstri']
const SURE = 6500
const aktif = ref(0)
let z: ReturnType<typeof setInterval> | undefined
const durdur = () => { if (z) clearInterval(z) }
const baslat = () => {
  durdur()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  z = setInterval(() => { aktif.value = (aktif.value + 1) % slaytlar.length }, SURE)
}
const sec = (i: number) => { aktif.value = i; baslat() }
onMounted(baslat)
onBeforeUnmount(durdur)

// 1) Karma kullanım: 5 kat, her kat bir kullanım
const katlar = [
  { ad: 'KONUT', renk: RENK.konut }, { ad: 'TİCARET', renk: RENK.ticaret }, { ad: 'BÜRO', renk: RENK.buro },
  { ad: 'ENDÜSTRİ', renk: RENK.endustri }, { ad: 'DEPO', renk: RENK.depo }
]
const pencere4 = (x0: number, y: number, w: number, h: number) => [0, 1, 2, 3].map(j => ({ x: x0 + 14 + j * ((w - 28) / 4), y, w: (w - 28) / 4 - 10, h }))
// 4) Fabrika testere çatısı
const testere = (() => { let d = 'M90 300'; for (let k = 0; k < 6; k++) { const x = 90 + k * 48; d += ` L${x} 262 L${x + 48} 300` } return d })()
</script>

<template>
  <div class="cizim">
    <svg viewBox="0 0 560 450" role="img" :aria-label="`Teknik çizim: ${slaytlar[aktif]}`" class="svg">
      <line class="c sabit" pathLength="1" x1="24" y1="400" x2="536" y2="400" />

      <!-- 1) KARMA KULLANIM -->
      <g class="slayt" :class="{ on: aktif === 0 }">
        <line class="c kalin" pathLength="1" x1="140" y1="116" x2="340" y2="116" />
        <g v-for="(k, i) in katlar" :key="k.ad">
          <rect class="f" :x="152" :y="122 + i * 56" width="176" height="50" :fill="k.renk" fill-opacity=".13" />
          <rect class="c" pathLength="1" x="150" :y="120 + i * 56" width="180" height="56" :stroke="k.renk" />
          <rect v-for="(p, j) in pencere4(150, 136 + i * 56, 180, 22)" :key="j" class="c ince" pathLength="1" :x="p.x" :y="p.y" :width="p.w" :height="p.h" />
          <line class="c" pathLength="1" x1="330" :y1="148 + i * 56" x2="398" :y2="148 + i * 56" :stroke="k.renk" />
          <circle class="c" pathLength="1" cx="408" :cy="148 + i * 56" r="9" :stroke="k.renk" />
          <circle class="f" cx="408" :cy="148 + i * 56" r="3.2" :fill="k.renk" />
          <text class="f etiket" x="424" :y="154 + i * 56" :fill="k.renk">{{ k.ad }}</text>
        </g>
        <line class="c altin" pathLength="1" x1="118" y1="116" x2="118" y2="400" />
        <line class="c altin" pathLength="1" x1="110" y1="116" x2="126" y2="116" />
        <line class="c altin" pathLength="1" x1="110" y1="400" x2="126" y2="400" />
        <text class="f olcu" transform="translate(104 258) rotate(-90)" text-anchor="middle">YAPI YÜKSEKLİĞİ</text>
      </g>

      <!-- 2) OTEL (KONAKLAMA) -->
      <g class="slayt" :class="{ on: aktif === 1 }">
        <rect class="f" x="212" y="132" width="116" height="266" :fill="RENK.konaklama" fill-opacity=".09" />
        <rect class="c" pathLength="1" x="210" y="130" width="120" height="270" />
        <line class="c kalin" pathLength="1" x1="202" y1="126" x2="338" y2="126" />
        <g v-for="i in 8" :key="'o' + i">
          <line class="c ince" pathLength="1" x1="210" :y1="130 + i * 30" x2="330" :y2="130 + i * 30" />
          <line class="c ince" pathLength="1" x1="330" :y1="128 + i * 30" x2="342" :y2="128 + i * 30" />
        </g>
        <g v-for="i in 9" :key="'ow' + i">
          <rect v-for="j in 3" :key="j" class="c ince" pathLength="1" :x="220 + (j - 1) * 36" :y="138 + (i - 1) * 30" width="26" height="14" />
        </g>
        <rect class="c" pathLength="1" x="330" y="310" width="110" height="90" />
        <line class="c ince" pathLength="1" x1="330" y1="340" x2="440" y2="340" />
        <line class="c ince" pathLength="1" x1="330" y1="370" x2="440" y2="370" />
        <polyline class="c" pathLength="1" points="180,372 270,372 270,378 180,378 180,372" />
        <line class="c ince" pathLength="1" x1="186" y1="378" x2="186" y2="400" />
        <line class="c ince" pathLength="1" x1="264" y1="378" x2="264" y2="400" />
        <rect class="c" pathLength="1" x="250" y="378" width="40" height="22" />
        <line class="c altin" pathLength="1" x1="178" y1="126" x2="178" y2="362" />
        <line class="c altin" pathLength="1" x1="170" y1="126" x2="186" y2="126" />
        <line class="c" pathLength="1" x1="342" y1="200" x2="398" y2="200" :stroke="RENK.konaklama" />
        <circle class="c" pathLength="1" cx="408" cy="200" r="9" :stroke="RENK.konaklama" />
        <circle class="f" cx="408" cy="200" r="3.2" :fill="RENK.konaklama" />
        <text class="f etiket" x="424" y="198" :fill="RENK.konaklama">KONAKLAMA</text>
        <text class="f alt" x="424" y="216">Oda sayısı</text>
        <text class="f olcu" transform="translate(164 244) rotate(-90)" text-anchor="middle">YAPI YÜKSEKLİĞİ</text>
      </g>

      <!-- 3) OKUL (KURUMSAL) -->
      <g class="slayt" :class="{ on: aktif === 2 }">
        <rect class="f" x="92" y="267" width="376" height="131" :fill="RENK.kurumsal" fill-opacity=".09" />
        <rect class="c" pathLength="1" x="90" y="265" width="380" height="135" />
        <line class="c kalin" pathLength="1" x1="84" y1="261" x2="476" y2="261" />
        <line class="c ince" pathLength="1" x1="90" y1="310" x2="470" y2="310" />
        <line class="c ince" pathLength="1" x1="90" y1="355" x2="470" y2="355" />
        <rect class="c" pathLength="1" x="250" y="232" width="60" height="168" :stroke="RENK.kurumsal" />
        <polyline class="c" pathLength="1" points="236,372 324,372 324,378 236,378 236,372" />
        <rect class="c" pathLength="1" x="266" y="378" width="28" height="22" />
        <line class="c" pathLength="1" x1="280" y1="232" x2="280" y2="196" />
        <rect class="f" x="281" y="197" width="18" height="11" :fill="RENK.ticaret" />
        <g v-for="r in 3" :key="'s' + r">
          <rect v-for="j in 6" :key="'l' + j" class="c ince" pathLength="1" :x="100 + (j - 1) * 25" :y="276 + (r - 1) * 45" width="16" height="22" />
          <rect v-for="j in 6" :key="'r' + j" class="c ince" pathLength="1" :x="320 + (j - 1) * 25" :y="276 + (r - 1) * 45" width="16" height="22" />
        </g>
        <line class="c altin" pathLength="1" x1="90" y1="418" x2="470" y2="418" />
        <line class="c altin" pathLength="1" x1="90" y1="410" x2="90" y2="426" />
        <line class="c altin" pathLength="1" x1="470" y1="410" x2="470" y2="426" />
        <text class="f olcu" x="280" y="440" text-anchor="middle">YAPI İNŞAAT ALANI</text>
        <line class="c" pathLength="1" x1="420" y1="261" x2="420" y2="212" :stroke="RENK.kurumsal" />
        <circle class="c" pathLength="1" cx="420" cy="203" r="9" :stroke="RENK.kurumsal" />
        <circle class="f" cx="420" cy="203" r="3.2" :fill="RENK.kurumsal" />
        <text class="f etiket" x="436" y="201" :fill="RENK.kurumsal">KURUMSAL</text>
        <text class="f alt" x="436" y="219">Eğitim tesisi</text>
      </g>

      <!-- 4) FABRİKA (ENDÜSTRİ) -->
      <g class="slayt" :class="{ on: aktif === 3 }">
        <rect class="f" x="92" y="302" width="286" height="96" :fill="RENK.endustri" fill-opacity=".12" />
        <rect class="c" pathLength="1" x="350" y="190" width="16" height="110" />
        <path class="c" pathLength="1" :d="testere" />
        <rect class="c" pathLength="1" x="90" y="300" width="290" height="100" />
        <rect class="c ince" pathLength="1" x="102" y="320" width="180" height="18" />
        <rect class="c" pathLength="1" x="300" y="345" width="56" height="55" />
        <line class="c ince" pathLength="1" x1="300" y1="360" x2="356" y2="360" />
        <line class="c ince" pathLength="1" x1="300" y1="375" x2="356" y2="375" />
        <g v-for="(sx, i) in [400, 448]" :key="'si' + i">
          <rect class="f" :x="sx + 2" y="232" width="36" height="166" :fill="RENK.depo" fill-opacity=".14" />
          <rect class="c" pathLength="1" :x="sx" y="230" width="40" height="170" :stroke="RENK.depo" />
          <ellipse class="c" pathLength="1" :cx="sx + 20" cy="230" rx="20" ry="7" :stroke="RENK.depo" />
          <line class="c ince" pathLength="1" :x1="sx" y1="290" :x2="sx + 40" y2="290" />
          <line class="c ince" pathLength="1" :x1="sx" y1="345" :x2="sx + 40" y2="345" />
        </g>
        <line class="c" pathLength="1" x1="130" y1="262" x2="130" y2="214" :stroke="RENK.endustri" />
        <circle class="c" pathLength="1" cx="130" cy="205" r="9" :stroke="RENK.endustri" />
        <circle class="f" cx="130" cy="205" r="3.2" :fill="RENK.endustri" />
        <text class="f etiket" x="146" y="203" :fill="RENK.endustri">ENDÜSTRİ</text>
        <text class="f alt" x="146" y="221">Tehlike sınıfı</text>
      </g>
    </svg>

    <div class="noktalar" role="tablist" aria-label="Yapı türleri">
      <button v-for="(s, i) in slaytlar" :key="s" type="button" role="tab" :aria-selected="i === aktif" class="nokta" :class="{ on: i === aktif }" @click="sec(i)">
        <span class="bar" /><span class="ad">{{ s }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.cizim { position: relative; display: flex; flex-direction: column; gap: 10px; }
/* Hafif teknik çizim ızgarası, kenarlara doğru sönen */
.cizim::before {
  content: ''; position: absolute; inset: -10px -10px 40px; z-index: 0; pointer-events: none;
  background:
    repeating-linear-gradient(0deg, transparent 0 23px, rgba(156, 112, 32, .09) 23px 24px),
    repeating-linear-gradient(90deg, transparent 0 23px, rgba(156, 112, 32, .09) 23px 24px);
  -webkit-mask-image: radial-gradient(ellipse at center, #000 45%, transparent 75%); mask-image: radial-gradient(ellipse at center, #000 45%, transparent 75%);
}
.svg { position: relative; z-index: 1; width: 100%; height: auto; max-height: 440px; }
.slayt { opacity: 0; transition: opacity .5s ease; }
.slayt.on { opacity: 1; }
.c { fill: none; stroke: var(--navy); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; }
.c.ince { stroke-width: 1; stroke-opacity: .55; }
.c.kalin { stroke-width: 3; }
.c.altin { stroke: var(--gold); stroke-width: 1.2; }
.c.sabit { stroke-dashoffset: 0; stroke-width: 1.5; }
.on .c { animation: ciz 1.9s cubic-bezier(.45, .05, .3, 1) forwards; }
.f { opacity: 0; transition: opacity .7s ease; }
.on .f { opacity: 1; transition-delay: 1.3s; }
.etiket { font-family: var(--font-head); font-size: 16px; font-weight: 800; letter-spacing: .5px; }
.alt { font-family: var(--font-head); font-size: 13px; font-weight: 700; fill: var(--navy); }
.olcu { font-family: var(--font-head); font-size: 11.5px; font-weight: 700; letter-spacing: 1.2px; fill: var(--gold); }
@keyframes ciz { to { stroke-dashoffset: 0; } }

.noktalar { position: relative; z-index: 1; display: flex; flex-wrap: wrap; justify-content: center; gap: 18px; }
.nokta { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 4px 0; border: 0; background: none; cursor: pointer; }
.bar { width: 40px; height: 3px; border-radius: 2px; background: #d8d2c4; transition: width .3s, background .3s; }
.nokta.on .bar { width: 60px; background: var(--gold); }
.ad { font-family: var(--font-head); font-size: 12.5px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--muted); }
.nokta.on .ad { color: var(--navy); }

@media (prefers-reduced-motion: reduce) {
  .c { stroke-dashoffset: 0; }
  .on .c { animation: none; }
  .f, .slayt { transition: none; }
}
</style>
