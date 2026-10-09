<script setup lang="ts">
import { bilesenler } from '~/data/ekosistem'

useSeoMeta({
  title: 'Binanızın Yangın Kontrolü Ne Zaman?',
  description: 'Binanızın periyodik yangın kontrolüne tabi olup olmadığını ve kontrolün kaç yılda bir yapılması gerektiğini 2 dakikada ücretsiz öğrenin. Detaylı analiz ve PDF hazırlık raporu.'
})

const adimlar = [
  { baslik: 'Ücretsiz Ön Değerlendirme', metin: 'Yapınızın kullanım sınıfını ve periyodik yangın kontrol süresini birkaç basit soruyla öğrenin.', ikon: 'clock', etiket: '2 dakika · Ücretsiz' },
  { baslik: 'Detaylı Analiz', metin: 'Yapınıza ve kullanım türlerinize özel kontrol maddelerini EK-6 Periyodik Kontrol Formu omurgasıyla, sade sorularla yanıtlayın.', ikon: 'search', etiket: 'Analiz başına tek ödeme' },
  { baslik: 'PDF Hazırlık Raporu', metin: 'Yangın güvenliği hazırlık durumunuzu, öne çıkan başlıkları, öncelikli yapılacakları ve hazırlamanız gereken belgeleri tek raporda alın.', ikon: 'report', etiket: 'İndirilebilir rapor' }
]

const ogrenilenler = [
  { baslik: 'Periyodik yangın kontrolüne tabi olup olmadığınızı öğrenin.', metin: 'Yapınızın özelliklerine göre periyodik kontrol kapsamında olup olmadığınızı görün.' },
  { baslik: 'Kontrolün kaç yılda bir yapılması gerektiğini görün.', metin: 'Yapınıza uygulanacak kontrol periyodunu öğrenin.' },
  { baslik: 'Yapınızın hangi kullanım sınıfında değerlendirildiğini öğrenin.', metin: 'Yapının kullanım amacına göre hangi sınıfta değerlendirildiğini görün.' },
  { baslik: 'Sonucu belirleyen temel bilgileri görün.', metin: 'Kontrol kapsamını ve periyodunu hangi bilgilerin belirlediğini açıkça görün.' }
]
</script>

<template>
  <div>
    <!-- 01 Giriş -->
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-text">
          <SectionTag num="FIREOS" label="Ücretsiz Ön Değerlendirme" />
          <h1>Binanızın<br>Yangın Kontrolü<br><span class="gold">Ne Zaman?</span></h1>
          <GoldRule class="hero-rule" :start="false" />
          <p class="lead">Birkaç basit bilgiyle binanızın veya işletmenizin periyodik yangın kontrolü kapsamında olup olmadığını ve kontrolün kaç yılda bir yapılması gerektiğini kolayca öğrenin.</p>
          <ul class="chips">
            <li><AppIcon name="clock" /> 2 dakika</li>
            <li><AppIcon name="check" /> Ücretsiz</li>
            <li><AppIcon name="shield" /> BYKHY ve YGU EK-1 esaslı</li>
          </ul>
          <div class="actions">
            <NuxtLink to="/ucretsiz-kontrol/kullanim-sinifi" class="btn gold-btn">Ücretsiz Kontrol Et <AppIcon name="arrow" class="btn-ico" /></NuxtLink>
            <a href="#nasil-calisir" class="btn ghost">Nasıl Çalışır?</a>
          </div>
        </div>
        <!-- Teknik çizim (fotoğraflı eski sürüm için: <HeroSlider />) -->
        <HeroCizim class="hero-art" />
      </div>
    </section>

    <!-- 02 Nasıl çalışır -->
    <section id="nasil-calisir" class="section paper">
      <div class="wrap">
        <SectionTag num="01" label="Nasıl Çalışır" />
        <h2 class="sec-title">Üç Adımda <span class="gold">Hazırlık Raporu</span></h2>
        <div class="steps">
          <article v-for="(a, i) in adimlar" :key="a.baslik" class="card step">
            <div class="step-head">
              <span class="num">{{ i + 1 }}</span>
              <span class="badge-icon"><AppIcon :name="a.ikon" /></span>
            </div>
            <h3>{{ a.baslik }}</h3>
            <p>{{ a.metin }}</p>
            <span class="step-tag">{{ a.etiket }}</span>
          </article>
        </div>
      </div>
    </section>

    <!-- 03 Neler öğrenebilirsiniz -->
    <section class="section">
      <div class="wrap learn-grid">
        <div>
          <SectionTag num="02" label="Ön Değerlendirme" />
          <h2 class="sec-title">Neler <span class="gold">Öğrenebilirsiniz?</span></h2>
          <p class="muted learn-intro">Ücretsiz ön değerlendirme tam bir denetim değildir; kullanım sınıfınızı ve kontrol periyodunuzu belirler, detaylı analize yönlendirir.</p>
        </div>
        <ol class="learn-list">
          <li v-for="(o, i) in ogrenilenler" :key="o.baslik">
            <span class="num gold-num">{{ i + 1 }}</span>
            <div><strong>{{ o.baslik }}</strong><p>{{ o.metin }}</p></div>
          </li>
        </ol>
      </div>
    </section>

    <!-- 04 Ekosistem -->
    <section class="section paper">
      <div class="wrap">
        <SectionTag num="03" label="Ekosistem" />
        <h2 class="sec-title"><span lang="en">FireTech</span> <span class="gold">Ekosistemi</span></h2>
        <p class="lead eco-lead">Bilgi · Mühendislik · Teknoloji. Kurumsal merkez ve ortak strateji altında beş bileşen.</p>
        <div class="eco-grid">
          <NuxtLink v-for="b in bilesenler" :key="b.slug" :to="`/ekosistem#${b.slug}`" class="card eco-card">
            <span class="badge-icon"><AppIcon :name="b.ikon" /></span>
            <h3 lang="en">{{ b.ad.replace(b.vurgu, '') }}<span class="gold">{{ b.vurgu }}</span></h3>
            <p>{{ b.kisa }}</p>
          </NuxtLink>
        </div>
        <div class="eco-more"><NuxtLink to="/ekosistem" class="btn ghost">Ekosistemi İncele <AppIcon name="arrow" class="btn-ico" /></NuxtLink></div>
      </div>
    </section>

    <!-- 05 Uyarı -->
    <section class="section warn-sec">
      <div class="wrap">
        <WarningBox>Bu çalışma, verdiğiniz bilgilere göre hazırlanan ücretsiz bir ön değerlendirmedir. Resmî periyodik yangın kontrolü veya Yangın Güvenlik Raporu yerine geçmez.</WarningBox>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero { padding: 48px 0 40px; }
.hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
.hero-text h1 { margin-top: 20px; font-size: clamp(38px, 4.4vw, 62px); }
.hero-art { width: 100%; max-width: 600px; justify-self: end; }
.hero-rule { margin: 20px 0; max-width: 520px; }
.chips { display: flex; flex-wrap: wrap; gap: 10px; margin: 22px 0 28px; padding: 0; list-style: none; }
.chips li { display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; border: 1px solid var(--border); border-radius: 999px; font-family: var(--font-head); font-weight: 600; font-size: 15px; color: var(--navy); background: #fff; }
.chips svg { width: 18px; height: 18px; color: var(--gold); }
.actions { display: flex; flex-wrap: wrap; gap: 12px; }
.btn-ico { width: 20px; height: 20px; }

.sec-title { margin: 18px 0 30px; }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.step { display: flex; flex-direction: column; gap: 12px; }
.step-head { display: flex; align-items: center; justify-content: space-between; }
.step p { color: var(--ink); }
.step-tag { margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border); font-family: var(--font-head); font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: .5px; font-size: 14px; }

.learn-grid { display: grid; grid-template-columns: .9fr 1.1fr; gap: 40px; align-items: start; }
.learn-intro { max-width: 420px; }
.learn-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; }
.learn-list li { display: flex; gap: 16px; padding: 18px 0; border-bottom: 1px solid var(--border); }
.learn-list li:first-child { padding-top: 4px; }
.learn-list strong { font-family: var(--font-head); font-size: 19px; color: var(--navy); }
.learn-list p { color: var(--muted); }

.eco-lead { margin: -14px 0 28px; }
.eco-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.eco-card { display: flex; flex-direction: column; gap: 12px; text-decoration: none; transition: border-color .15s, transform .15s; }
.eco-card:hover { border-color: var(--gold); transform: translateY(-2px); }
.eco-card h3 { font-size: 21px; }
.eco-card p { color: var(--muted); font-size: 15px; }
.eco-more { margin-top: 28px; }
.warn-sec { padding: 48px 0 64px; }

@media (max-width: 1000px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-art { justify-self: center; }
}

@media (max-width: 1000px) {
  .learn-grid { grid-template-columns: 1fr; }
  .steps { grid-template-columns: 1fr; }
  .eco-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .eco-grid { grid-template-columns: 1fr; }
}
</style>
