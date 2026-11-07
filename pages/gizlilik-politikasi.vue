<script setup lang="ts">
// Gizlilik Politikası: KVKK metnine atıf yapan kısa genel metin + veri güvenliği + kart bilgisi (kullanıcı kararı, 7 Kasım 2026).
// Yurt dışı aktarım koddan doğrulandı: yalnız "Diğer (Kendim Yazacağım)" yazısı, kurallar bulamazsa /api/eslestir → Gemini.
const s = SELLER
</script>

<template>
  <LegalPage
    title="Gizlilik Politikası"
    description="FireTech'in kişisel verilerinizi nasıl koruduğu: hangi bilgileri neden işlediğimiz, veri güvenliği önlemleri ve kart bilgilerinizin saklanmaması."
  >
    <p>FireTech hizmetleri, {{ s.title }} tarafından sunulur. Bu politika, {{ s.web.replace('https://', '') }} internet sitesini ve sitedeki ön değerlendirme ve analiz hizmetlerini kullanırken bilgilerinize nasıl yaklaştığımızı genel olarak anlatır.</p>

    <h2>Hangi bilgileri, neden işliyoruz?</h2>
    <p>Üyelik, sipariş ve ödeme işlemleri ile hizmetin sunulması için gerekli bilgileri (ad soyad, e-posta, şifrenizin özeti, telefon, fatura adresi, ödeme ve sipariş kaydı, sözleşme onay zamanı, ön değerlendirme ve analizde verdiğiniz yapı bilgileri ve işlem güvenliği kayıtları) işliyoruz. Hangi verilerin hangi amaç ve hukuki sebeple işlendiği, kimlere aktarıldığı ve haklarınız <NuxtLink to="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</NuxtLink>'nde ayrıntılı olarak yer alır.</p>

    <h2>Kart bilgileriniz</h2>
    <p>Ödemeler PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş. altyapısı üzerinden alınır. Kart numaranız, son kullanma tarihiniz ve güvenlik kodunuz bize ulaşmaz; FireTech sunucularında saklanmaz. Bu bilgiler ödeme sayfasında açılan PayTR ödeme ekranında doğrudan PayTR tarafından işlenir. Bizde yalnızca ödemenin sonucu ve sipariş kaydı bulunur.</p>

    <h2>Veri güvenliği</h2>
    <ul>
      <li>Site ile aranızdaki bağlantı şifreli (HTTPS) olarak kurulur.</li>
      <li>Verileriniz Türkiye'de bulunan sunucularda barındırılır. Yalnızca ön değerlendirmedeki "Diğer (Kendim Yazacağım)" alanına yazdığınız kullanım adı, sitedeki kurallar bir eşleşme bulamazsa, yapay zekâ ile eşleştirilmek üzere KVKK metninde belirtilen şekilde yurt dışındaki hizmet sağlayıcıya aktarılır. Bu alana kişisel bilgi yazmamanızı öneririz.</li>
      <li>Hesabınıza yalnızca şifrenizle giriş yapılabilir; şifreler açık metin olarak saklanmaz.</li>
      <li>Verilere erişim, hizmetin sunulması için gerekli olan kişilerle sınırlıdır.</li>
      <li>Bilgileriniz satılmaz, reklam amacıyla üçüncü kişilerle paylaşılmaz.</li>
    </ul>

    <h2>Çerezler</h2>
    <p>Sitede kullanılan çerezler ve tarayıcıda saklanan bilgiler <NuxtLink to="/cerez-politikasi">Çerez Politikası</NuxtLink>'nda anlatılır.</p>

    <h2>İletişim</h2>
    <p>Gizlilikle ilgili sorularınız için <a :href="`mailto:${s.email}`">{{ s.email }}</a> adresine yazabilirsiniz.</p>
  </LegalPage>
</template>
