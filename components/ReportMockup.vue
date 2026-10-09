<script setup lang="ts">
// Ürün görseli: PDF Yangın Güvenliği Hazırlık Raporu (kapak + iç sayfa). "ÖRNEK" ibareli; gerçek bir yapıya ait değildir.
// Spesifikasyon: tek genel hazırlık yüzdesi (bölüm bazlı yüzde yok), öncelikli yapılacaklar, belge listesi, resmî rapor değildir uyarısı.
const yuzde = 72
const r = 34
const cevre = 2 * Math.PI * r
const yapilacaklar = ['Acil durum aydınlatmasının bakım kaydı', 'Yangın kapılarının kendiliğinden kapanması', 'Algılama sisteminin periyodik test raporu']
const belgeler = ['Onaylı mimari proje', 'Yapı kullanma izin belgesi', 'Periyodik muayene kayıtları']
</script>

<template>
  <svg viewBox="0 0 650 460" role="img" aria-label="Örnek PDF yangın güvenliği hazırlık raporu: kapak ve hazırlık durumu sayfası" class="mock">
    <defs>
      <filter id="rm-shadow" x="-15%" y="-10%" width="130%" height="125%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0c2840" flood-opacity=".18" />
      </filter>
    </defs>

    <!-- KAPAK -->
    <g transform="translate(-16 6) rotate(-5 170 230)" filter="url(#rm-shadow)">
      <rect x="40" y="50" width="260" height="360" rx="4" fill="#fff" />
      <rect x="40" y="50" width="260" height="128" rx="4" fill="var(--navy)" />
      <rect x="40" y="170" width="260" height="8" fill="var(--navy)" />
      <image href="/img/firetech-kalkan.png" x="58" y="66" width="30" height="38" />
      <text x="96" y="91" class="brand"><tspan fill="var(--gold-2)">FIRE</tspan><tspan fill="#fff">TECH</tspan></text>
      <text x="58" y="136" class="cover-h" fill="#fff">YANGIN GÜVENLİĞİ</text>
      <text x="58" y="160" class="cover-h" fill="var(--gold-2)">HAZIRLIK RAPORU</text>
      <line x1="58" y1="200" x2="282" y2="200" stroke="var(--gold-line)" />
      <circle cx="58" cy="200" r="3.5" fill="#fff" stroke="var(--gold)" />
      <circle cx="282" cy="200" r="3.5" fill="#fff" stroke="var(--gold)" />
      <text x="58" y="226" class="k">Yapı</text>
      <text x="58" y="241" class="v">Örnek İş Merkezi — A Blok</text>
      <text x="58" y="264" class="k">Kullanım sınıfı</text>
      <text x="58" y="279" class="v">Büro Binaları</text>
      <text x="58" y="302" class="k">Periyodik kontrol süresi</text>
      <text x="58" y="317" class="v">4 yıl</text>
      <rect x="58" y="366" width="224" height="26" rx="3" fill="#fdf6f5" stroke="var(--red)" />
      <text x="170" y="382" text-anchor="middle" class="warn">Resmî periyodik kontrol raporu değildir.</text>
    </g>

    <!-- İÇ SAYFA -->
    <g transform="translate(80 0)">
    <g filter="url(#rm-shadow)">
      <rect x="250" y="26" width="300" height="400" rx="4" fill="#fff" />
    </g>
    <g>
      <path d="M268 44 H392 L384 60 H268 Z" fill="var(--navy)" />
      <text x="276" y="56" class="tag"><tspan fill="var(--gold-2)">02</tspan><tspan fill="#fff"> | HAZIRLIK DURUMU</tspan></text>
      <line x1="268" y1="72" x2="532" y2="72" stroke="var(--gold-line)" />

      <!-- tek genel hazırlık göstergesi -->
      <circle cx="318" cy="122" :r="r" fill="none" stroke="#eee6d4" stroke-width="9" />
      <circle cx="318" cy="122" :r="r" fill="none" stroke="var(--gold)" stroke-width="9" stroke-linecap="round"
              :stroke-dasharray="`${cevre * yuzde / 100} ${cevre}`" transform="rotate(-90 318 122)" />
      <text x="318" y="129" text-anchor="middle" class="pct">%{{ yuzde }}</text>
      <text x="366" y="112" class="sec">YANGIN GÜVENLİĞİ</text>
      <text x="366" y="127" class="sec">HAZIRLIK DURUMU</text>
      <text x="366" y="143" class="k">Verilen cevaplara göre genel hazırlık</text>

      <text x="268" y="186" class="sec">ÖNCELİKLİ YAPILACAKLAR</text>
      <g v-for="(y, i) in yapilacaklar" :key="y">
        <circle cx="277" :cy="204 + i * 26" r="8" fill="var(--navy)" />
        <text x="277" :y="207.5 + i * 26" text-anchor="middle" class="n">{{ i + 1 }}</text>
        <text x="292" :y="207 + i * 26" class="item">{{ y }}</text>
      </g>

      <text x="268" y="294" class="sec">HAZIRLANACAK BELGELER</text>
      <g v-for="(b, i) in belgeler" :key="b">
        <rect x="269" :y="304 + i * 22" width="11" height="11" rx="2" fill="#fff" stroke="var(--gold)" />
        <path :d="`M271.5 ${310 + i * 22} l2.5 2.5 l4.5 -5`" fill="none" stroke="var(--gold)" stroke-width="1.5" />
        <text x="288" :y="313.5 + i * 22" class="item">{{ b }}</text>
      </g>

      <line x1="268" y1="388" x2="532" y2="388" stroke="var(--border)" />
      <text x="268" y="404" class="foot">FIRETECH · FireOS Hazırlık Raporu</text>
      <text x="532" y="404" text-anchor="end" class="foot">02 / 08</text>

      <!-- örnek ibaresi -->
      <text x="400" y="262" text-anchor="middle" class="wm" transform="rotate(-24 400 262)">ÖRNEK</text>
    </g>
    </g>
  </svg>
</template>

<style scoped>
.mock { width: 100%; height: auto; }
text { font-family: var(--font-body); }
.brand { font-family: var(--font-head); font-weight: 800; font-size: 16px; letter-spacing: .8px; }
.cover-h { font-family: var(--font-head); font-weight: 800; font-size: 24px; letter-spacing: .3px; }
.k { font-size: 9px; fill: var(--muted); }
.v { font-family: var(--font-head); font-size: 13px; font-weight: 700; fill: var(--navy); }
.warn { font-size: 8.5px; font-weight: 700; fill: var(--red); }
.tag { font-family: var(--font-head); font-weight: 700; font-size: 10px; letter-spacing: .4px; }
.pct { font-family: var(--font-head); font-size: 22px; font-weight: 800; fill: var(--navy); }
.sec { font-family: var(--font-head); font-size: 12px; font-weight: 800; fill: var(--navy); letter-spacing: .4px; }
.n { font-family: var(--font-head); font-size: 9px; font-weight: 700; fill: #fff; }
.item { font-size: 9.5px; fill: var(--ink); }
.foot { font-family: var(--font-head); font-size: 8.5px; font-weight: 700; fill: var(--muted); letter-spacing: .4px; }
.wm { font-family: var(--font-head); font-size: 64px; font-weight: 800; fill: var(--gold); opacity: .08; letter-spacing: 6px; }
</style>
