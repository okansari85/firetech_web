<script setup lang="ts">
// Ürün görseli: dizüstünde ücretsiz ön değerlendirme sonuç ekranı (Büro, 1.000 m² üstü → 4 yıl),
// telefonda yapı inşaat alanı sorusu. Metinler sınıf spesifikasyonlarındaki ekranlardan.
const basliklar = ['Kaçış ve Tahliye', 'Algılama ve Alarm', 'Söndürme Sistemleri']
const secenekler = ['1.000 m² ve altında', '1.000 m²’nin üstünde', 'Bilmiyorum / Emin değilim']
</script>

<template>
  <svg viewBox="0 0 660 460" role="img" aria-label="Dizüstü bilgisayarda ön değerlendirme sonucu, telefonda yapı inşaat alanı sorusu" class="mock">
    <defs>
      <filter id="dm-shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0c2840" flood-opacity=".18" />
      </filter>
    </defs>

    <!-- zemin gölgesi -->
    <ellipse cx="300" cy="402" rx="290" ry="14" fill="#0c2840" opacity=".08" />

    <!-- DİZÜSTÜ -->
    <g filter="url(#dm-shadow)">
      <rect x="40" y="24" width="500" height="326" rx="14" fill="#0c2840" />
      <rect x="54" y="38" width="472" height="296" rx="3" fill="#fff" />
      <path d="M8 352 H572 L556 376 Q554 380 548 380 H32 Q26 380 24 376 Z" fill="#e4e7eb" stroke="#c9ced6" />
      <rect x="250" y="352" width="80" height="6" rx="3" fill="#c9ced6" />
    </g>

    <!-- dizüstü ekranı -->
    <g class="t">
      <text x="68" y="60" class="brand"><tspan fill="var(--gold)">FIRE</tspan><tspan fill="var(--navy)">TECH</tspan></text>
      <text x="466" y="59" text-anchor="end" class="nav">ANA SAYFA · EKOSİSTEM · ÜCRETSİZ KONTROL</text>
      <line x1="54" y1="70" x2="526" y2="70" stroke="var(--gold-line)" />

      <path d="M68 82 H190 L182 98 H68 Z" fill="var(--navy)" />
      <text x="76" y="94" class="tag"><tspan fill="var(--gold-2)">04</tspan><tspan fill="#fff"> | SONUÇ</tspan></text>

      <text x="68" y="126" class="h">PERİYODİK YANGIN KONTROLÜNE</text>
      <text x="68" y="148" class="h" fill="var(--gold)">TABİSİNİZ</text>

      <rect x="68" y="160" width="236" height="96" rx="5" fill="#fff" stroke="var(--border)" />
      <text x="80" y="181" class="k">Kullanım sınıfı</text>
      <text x="292" y="181" text-anchor="end" class="v">Büro Binaları</text>
      <line x1="80" y1="190" x2="292" y2="190" stroke="var(--border)" />
      <text x="80" y="208" class="k">Yapı inşaat alanı</text>
      <text x="292" y="208" text-anchor="end" class="v">1.000 m²’nin üstünde</text>
      <line x1="80" y1="217" x2="292" y2="217" stroke="var(--border)" />
      <text x="80" y="235" class="k">Diğer kullanım</text>
      <text x="292" y="235" text-anchor="end" class="v">Yok</text>

      <rect x="316" y="160" width="152" height="96" rx="5" fill="var(--navy)" />
      <text x="392" y="186" text-anchor="middle" class="lbl">PERİYODİK KONTROL SÜRESİ</text>
      <text x="392" y="236" text-anchor="middle" class="big">4 YIL</text>

      <text x="68" y="276" class="k">Bu yapı için detaylı analizde öne çıkan başlıklar:</text>
      <g v-for="(b, i) in basliklar" :key="b">
        <rect :x="68 + i * 116" y="284" width="108" height="18" rx="9" fill="#fff" stroke="var(--gold-line)" />
        <text :x="122 + i * 116" y="296.5" text-anchor="middle" class="chip">{{ b }}</text>
      </g>

      <rect x="68" y="310" width="210" height="18" rx="2" fill="var(--gold)" />
      <text x="173" y="322.5" text-anchor="middle" class="btn">DETAYLI ANALİZİ BAŞLAT  →</text>
      <text x="290" y="322.5" class="note">Bu sonuç resmî rapor yerine geçmez.</text>
    </g>

    <!-- TELEFON -->
    <g filter="url(#dm-shadow)">
      <rect x="486" y="118" width="158" height="316" rx="24" fill="#0c2840" />
      <rect x="494" y="132" width="142" height="288" rx="16" fill="#fff" />
      <rect x="545" y="124" width="40" height="4" rx="2" fill="#2a4a6a" />
    </g>
    <g class="t">
      <text x="506" y="154" class="brand-s"><tspan fill="var(--gold)">FIRE</tspan><tspan fill="var(--navy)">TECH</tspan></text>
      <line x1="494" y1="162" x2="636" y2="162" stroke="var(--gold-line)" />
      <path d="M506 172 H584 L578 184 H506 Z" fill="var(--navy)" />
      <text x="511" y="181.5" class="tag-s"><tspan fill="var(--gold-2)">03</tspan><tspan fill="#fff"> | ALAN</tspan></text>
      <text x="506" y="204" class="q">YAPINIZIN TOPLAM YAPI</text>
      <text x="506" y="218" class="q">İNŞAAT ALANI KAÇ M²?</text>
      <g v-for="(s, i) in secenekler" :key="s">
        <rect x="506" :y="232 + i * 34" width="118" height="26" rx="4" fill="#fff" :stroke="i === 1 ? 'var(--gold)' : 'var(--border)'" :stroke-width="i === 1 ? 1.6 : 1" />
        <circle cx="517" :cy="245 + i * 34" r="4.5" fill="#fff" :stroke="i === 1 ? 'var(--gold)' : '#b8bec6'" />
        <circle v-if="i === 1" cx="517" :cy="245 + i * 34" r="2.2" fill="var(--gold)" />
        <text x="527" :y="248.5 + i * 34" class="opt">{{ s }}</text>
      </g>
      <text x="506" y="350" class="hint">Ruhsat veya yapı kullanma izin</text>
      <text x="506" y="360" class="hint">belgesindeki değeri esas alın.</text>
      <rect x="506" y="378" width="118" height="22" rx="2" fill="var(--gold)" />
      <text x="565" y="392.5" text-anchor="middle" class="btn">DEVAM ET  →</text>
    </g>
  </svg>
</template>

<style scoped>
.mock { width: 100%; height: auto; }
.t text { font-family: var(--font-body); }
.brand { font-family: var(--font-head) !important; font-weight: 800; font-size: 14px; letter-spacing: .6px; }
.brand-s { font-family: var(--font-head) !important; font-weight: 800; font-size: 11px; letter-spacing: .5px; }
.nav { font-family: var(--font-head) !important; font-weight: 700; font-size: 7.5px; fill: var(--navy); letter-spacing: .3px; }
.tag { font-family: var(--font-head) !important; font-weight: 700; font-size: 10px; letter-spacing: .4px; }
.tag-s { font-family: var(--font-head) !important; font-weight: 700; font-size: 8.5px; letter-spacing: .3px; }
.h { font-family: var(--font-head) !important; font-weight: 800; font-size: 21px; fill: var(--navy); letter-spacing: .2px; }
.k { font-size: 9.5px; fill: var(--muted); }
.v { font-family: var(--font-head) !important; font-size: 11px; font-weight: 700; fill: var(--navy); }
.lbl { font-family: var(--font-head) !important; font-size: 9px; font-weight: 700; fill: #c9d3de; letter-spacing: .6px; }
.big { font-family: var(--font-head) !important; font-size: 48px; font-weight: 800; fill: var(--gold-2); }
.chip { font-family: var(--font-head) !important; font-size: 8.5px; font-weight: 700; fill: var(--navy); }
.btn { font-family: var(--font-head) !important; font-size: 9px; font-weight: 700; fill: #fff; letter-spacing: .5px; }
.note { font-size: 8px; fill: var(--red); }
.q { font-family: var(--font-head) !important; font-size: 12px; font-weight: 800; fill: var(--navy); }
.opt { font-size: 8px; fill: var(--ink); }
.hint { font-size: 7px; fill: var(--muted); }
</style>
