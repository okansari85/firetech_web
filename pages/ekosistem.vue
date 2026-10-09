<script setup lang="ts">
import { bilesenler, katmanlar } from '~/data/ekosistem'

useSeoMeta({
  title: 'Ekosistem',
  description: 'FireTech ekosistemi: FireOS, Fire Academy, Fire Intelligence, Fire Labs ve Fire Solutions. Bilgi · Mühendislik · Teknoloji.'
})
</script>

<template>
  <div>
    <section class="section head">
      <div class="wrap">
        <SectionTag label="Ekosistem" />
        <h1 class="title"><span lang="en">FireTech</span> <span class="gold">Ekosistemi</span></h1>
        <p class="motto">Bilgi · Mühendislik · Teknoloji</p>
        <GoldRule class="rule" />
        <div class="center card">
          <img src="/img/firetech-kalkan.png" alt="" width="56" height="70">
          <div>
            <h2 class="center-title" lang="en"><span class="gold">FIRE</span>TECH</h2>
            <p>Ekosistemin kurumsal merkezi ve çatı markasıdır. Ortak stratejiyi, kaynakları, yatırımları ve gelişimi yönetir; bütün bileşenlerin aynı amaç doğrultusunda gelişmesini ve ticari sürdürülebilirliği sağlar.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section paper">
      <div class="wrap">
        <SectionTag num="01" label="Bileşenler" />
        <div class="list">
          <article v-for="(b, i) in bilesenler" :id="b.slug" :key="b.slug" class="card item">
            <div class="item-head">
              <span class="badge-icon"><AppIcon :name="b.ikon" /></span>
              <div>
                <span class="item-num">0{{ i + 1 }}</span>
                <h2 class="item-title" lang="en">{{ b.ad.replace(b.vurgu, '') }}<span class="gold">{{ b.vurgu }}</span></h2>
                <p class="item-short">{{ b.kisa }}</p>
              </div>
            </div>
            <div class="item-body">
              <div>
                <h4>Ekosistemdeki görevi</h4>
                <p>{{ b.gorev }}</p>
              </div>
              <div>
                <h4>Ürettiği değer</h4>
                <p>{{ b.deger }}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <SectionTag num="02" label="Ortak Katmanlar" />
        <h2 class="layers-title">Bütün Bileşenlerin <span class="gold">Ortak Zemini</span></h2>
        <div class="layers">
          <div v-for="k in katmanlar" :key="k.ad" class="layer">
            <span class="badge-icon"><AppIcon :name="k.ikon" /></span>
            <div>
              <h3>{{ k.ad }}</h3>
              <p class="muted">{{ k.ogeler.join(' · ') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.head { padding-bottom: 48px; }
.title { margin-top: 20px; }
.motto { margin-top: 10px; font-family: var(--font-head); font-size: 22px; font-weight: 600; letter-spacing: 1.5px; color: var(--muted); text-transform: uppercase; }
.rule { margin: 28px 0; }
.center { display: flex; gap: 22px; align-items: center; max-width: 880px; }
.center img { width: 56px; height: auto; flex: none; }
.center-title { font-size: 30px; margin-bottom: 6px; }

.list { display: flex; flex-direction: column; gap: 18px; margin-top: 26px; }
.item { display: grid; grid-template-columns: 340px 1fr; gap: 28px; scroll-margin-top: 100px; }
.item-head { display: flex; gap: 18px; align-items: flex-start; }
.item-num { font-family: var(--font-head); font-weight: 700; color: var(--gold); letter-spacing: 1px; }
.item-title { font-size: 32px; }
.item-short { margin-top: 6px; color: var(--muted); font-weight: 500; }
.item-body { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding-left: 28px; border-left: 1.5px solid var(--gold-line); }
.item-body h4 { margin-bottom: 6px; font-size: 15px; text-transform: uppercase; letter-spacing: .6px; color: var(--gold); }

.layers-title { margin: 18px 0 28px; }
.layers { display: flex; flex-direction: column; gap: 14px; }
.layer { display: flex; align-items: center; gap: 20px; padding: 20px 24px; border: 1px solid var(--border); border-left: 4px solid var(--gold); border-radius: 10px; background: #fff; }

@media (max-width: 900px) {
  .item { grid-template-columns: 1fr; }
  .item-body { grid-template-columns: 1fr; padding-left: 0; border-left: 0; border-top: 1.5px solid var(--gold-line); padding-top: 18px; }
  .center { flex-direction: column; align-items: flex-start; }
}
</style>
