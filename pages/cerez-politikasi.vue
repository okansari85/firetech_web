<script setup lang="ts">
// Çerez Politikası. Kod tarandı (7 Kasım 2026): site çerez yazmaz. sessionStorage: firetech_on_degerlendirme
// (useOnDegerlendirme), firetech_site_yonetimi (useSiteYonetimi). localStorage: giriş anahtarı firetech_token (useUyelik; kullanıcı kararı).
// Yazı tipleri @fontsource ile siteden (dış font yok); analitik / reklam yok. PayTR ödeme ekranı iFrame.
// Analitik ya da yeni bir dış servis eklenirse bu metin güncellenmeli.
const s = SELLER
</script>

<template>
  <LegalPage
    title="Çerez Politikası"
    description="firetech-ai.com'un tarayıcınızda sakladığı bilgiler: giriş anahtarı ve ön değerlendirme cevapları; çerez, analitik ve reklam aracı kullanılmaması."
  >
    <p>Çerezler, ziyaret ettiğiniz internet sitelerinin tarayıcınıza kaydettiği küçük metin dosyalarıdır. Tarayıcının yerel depolama ve oturum depolama alanları da benzer amaçla kullanılabilir. Bu politika, {{ s.web.replace('https://', '') }} sitesinde bunların nasıl kullanıldığını anlatır.</p>

    <h2>Tarayıcınızda sakladığımız bilgiler</h2>
    <ul>
      <li><strong>Giriş anahtarı (yerel depolama, <code>firetech_token</code>):</strong> giriş yaptığınızda oturumunuzun açık kalması için tarayıcının yerel depolama alanına yazılır, çıkış yaptığınızda silinir. Sitenin üye ekranlarının (ödeme, Hesabım) çalışması için gereklidir.</li>
      <li><strong>Ön değerlendirme cevapları (oturum depolama, <code>firetech_on_degerlendirme</code> ve <code>firetech_site_yonetimi</code>):</strong> ücretsiz ön değerlendirmede ve Site / Yerleşke Yönetimi değerlendirmesinde verdiğiniz cevaplar, sayfalar arasında geçerken kaybolmasın diye tarayıcının oturum depolama alanında tutulur. Tarayıcı sekmesini ya da pencereyi kapattığınızda silinir.</li>
      <li>Bunlar dışında site çerez yerleştirmez.</li>
      <li>Sitede ziyaretçi istatistiği (analitik), reklam ya da sosyal medya takip araçları kullanılmaz.</li>
      <li>Sitenin yazı tipleri kendi sunucumuzdan yüklenir; bunun için üçüncü taraf bir hizmete bağlanılmaz.</li>
    </ul>

    <h2>Ödeme ekranı</h2>
    <p>Sitedeki ödeme sayfasında, PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.'nin ödeme ekranı sayfanın içinde açılır. Bu ekranda kullanılan çerezler PayTR'nin kendi politikalarına tabidir.</p>

    <h2>Çerezleri yönetme</h2>
    <p>Tarayıcınızın ayarlarından çerezleri, yerel depolamayı ve oturum depolamayı görüntüleyebilir, silebilir ya da engelleyebilirsiniz. Giriş anahtarını silerseniz oturumunuz kapanır ve yeniden giriş yapmanız gerekir. Yerel depolamayı engellerseniz giriş yapamayabilirsiniz; oturum depolamayı engellerseniz ön değerlendirme cevaplarınız sayfa değişiminde kaybolabilir.</p>

    <h2>İletişim</h2>
    <p>Sorularınız için <a :href="`mailto:${s.email}`">{{ s.email }}</a> adresine yazabilirsiniz. Kişisel verilerinizle ilgili ayrıntılar <NuxtLink to="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</NuxtLink>'nde yer alır.</p>
  </LegalPage>
</template>
