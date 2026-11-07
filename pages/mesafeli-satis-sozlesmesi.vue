<script setup lang="ts">
// Mesafeli Satış Sözleşmesi (PayTR canlı onayı için). PKTakip metninden uyarlandı (kullanıcı kararları, 7 Kasım 2026):
// abonelik değil tek seferlik dijital hizmet; fiyat yazılmaz, ödeme ekranına atıf yapılır; analize başlanınca cayma yok (md. 15/1-ğ).
const s = SELLER
</script>

<template>
  <LegalPage
    title="Mesafeli Satış Sözleşmesi"
    description="FireTech dijital analiz hizmetlerinin firetech-ai.com üzerinden satın alınmasına ilişkin mesafeli satış sözleşmesi: taraflar, hizmet, ödeme, ifa, cayma hakkı ve iade."
  >
    <h2>1. Taraflar</h2>
    <h3>Satıcı</h3>
    <LegalSeller />
    <h3>Alıcı</h3>
    <p>FireTech üyeliğinde ve sitedeki ödeme sayfasında sipariş sırasında bildirilen ad soyad, e-posta, telefon ve fatura adresi bilgilerine sahip gerçek ya da tüzel kişidir (bundan sonra "Alıcı").</p>

    <h2>2. Sözleşmenin konusu</h2>
    <p>Bu sözleşme, Alıcı'nın {{ s.web.replace('https://', '') }} internet sitesi üzerinden elektronik ortamda satın aldığı FireTech dijital analiz hizmetinin satışı ve ifasına ilişkin olarak, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri çerçevesinde tarafların hak ve yükümlülüklerini düzenler.</p>

    <h2>3. Hizmetin temel nitelikleri</h2>
    <ul>
      <li>Hizmet, internet sitesi üzerinden elektronik ortamda sunulan tek seferlik bir dijital analiz hizmetidir. Abonelik değildir. Kurulum ya da fiziksel teslimat yoktur.</li>
      <li>Sitede iki hizmet satılır:
        <ul>
          <li><strong>Detaylı Yangın Güvenliği Analizi:</strong> ücretsiz ön değerlendirmeden sonra, yapının kullanım sınıflarına göre hazırlanan yangın güvenliği hazırlık analizi ve rapor.</li>
          <li><strong>Site / Yerleşke Yönetimi:</strong> site ve yerleşkenin yapı, tesis ve ortak kullanım alanlarının periyodik kontrol değerlendirmesi.</li>
        </ul>
      </li>
      <li>Her analiz için bir kez ödeme alınır. Satın alınan hizmetin adı ve bedeli, sipariş anında ödeme ekranında gösterilen şekildedir.</li>
      <li>Analiz çıktıları hazırlık raporu ve aksiyon listesi niteliğindedir; "Uygun / Uygun Değil" hükmü verilmez. Çıktılar resmî periyodik kontrolün, yetkili kişi ya da kuruluşların yapması gereken denetimin ve imzalı raporun yerine geçmez.</li>
    </ul>

    <h2>4. Bedel ve ödeme</h2>
    <ul>
      <li>Sipariş, ücretsiz üyelik ve girişten sonra sitedeki ödeme sayfasından verilir. Hizmet bu sayfada seçilir, ödeme aynı sayfada yapılır.</li>
      <li>Sitede gösterilen fiyatlara KDV dahil değildir. Ödemede hizmet bedeline %20 KDV eklenir.</li>
      <li>Ödeme ekranında hizmet bedeli, KDV tutarı ve ödenecek toplam tutar ayrı ayrı gösterilir. Alıcı'nın kartından bu toplam tutar tek çekim olarak tahsil edilir.</li>
      <li>Ödeme kredi kartı ya da banka kartıyla, PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş. altyapısı üzerinden, ödeme sayfasında açılan PayTR ödeme ekranında alınır. Kart bilgileri Satıcı'ya ulaşmaz, Satıcı tarafından saklanmaz; PayTR tarafından işlenir.</li>
      <li>Fatura bilgileri sipariş sırasında ödeme sayfasında alınır: ad soyad, telefon ve fatura adresi. Satıcı faturayı bu bilgilerle düzenler.</li>
    </ul>

    <h2>5. Hizmetin ifası</h2>
    <p>Ödeme onaylandığında satın alınan analiz Alıcı'nın FireTech hesabına tanımlanır. Hizmet bu andan itibaren elektronik ortamda kullanıma hazırdır ve analiz hemen başlatılabilir. Sipariş ve ödeme kaydı, Alıcı'nın hesabındaki "Hesabım &gt; Ödemelerim" ekranında görüntülenir. Bu sözleşme ve <NuxtLink to="/on-bilgilendirme-formu">Ön Bilgilendirme Formu</NuxtLink> sitede her zaman erişilebilir durumdadır.</p>

    <h2>6. Süre ve yenileme</h2>
    <p>Hizmet tek seferliktir; her ödeme bir analiz içindir ve analiz tamamlandığında sözleşme ifa edilmiş olur. Hizmet kendiliğinden yenilenmez; Alıcı'nın kartından otomatik çekim yapılmaz. Yeni bir analiz isteyen Alıcı, bu analiz için ödeme sayfasından ayrıca ödeme yapar.</p>

    <h2>7. Cayma hakkı</h2>
    <ul>
      <li>Alıcı, ödeme tarihinden itibaren 14 gün içinde, analize henüz başlanmamışsa, hiçbir gerekçe göstermeden ve cezai şart ödemeden sözleşmeden cayabilir.</li>
      <li>Cayma bildirimi <a :href="`mailto:${s.email}`">{{ s.email }}</a> adresine e-posta göndererek ya da {{ s.phones.map((p) => p.label).join(' veya ') }} numaralı telefonlardan Satıcı'ya ulaşılarak yapılır.</li>
      <li>Satıcı, cayma bildiriminin kendisine ulaşmasından itibaren 14 gün içinde ödenen tutarın tamamını, ödemenin yapıldığı karta iade eder. Satın alınan analiz kapatılır.</li>
      <li>Hizmet elektronik ortamda anında ifa edilen bir hizmettir. Alıcı, ödemeden önce ödeme sayfasındaki onay kutusunu işaretleyerek analizin ödeme onaylanır onaylanmaz başlayabileceğini ve analize başlandığında cayma hakkını kaybedeceğini kabul eder. Analize başlandıktan sonra, Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca cayma hakkı kullanılamaz.</li>
      <li>Bu cayma ve iade kuralları bireysel tüketicilerin yanında şirket ve diğer tüzel kişi alıcılara da aynen uygulanır.</li>
    </ul>

    <h2>8. Analize başlandıktan ya da 14 gün geçtikten sonra iptal</h2>
    <p>Analize başlandıktan sonra ya da 14 günlük süre geçtikten sonra iade yapılmaz; Alıcı satın aldığı analizi kullanmaya devam eder. Hatalı ya da mükerrer (birden fazla) çekim yapılması hâlinde fazladan tahsil edilen tutar her zaman iade edilir.</p>

    <h2>9. Tarafların yükümlülükleri</h2>
    <ul>
      <li>Alıcı, üyelik ve sipariş sırasında doğru ve güncel bilgi vermekle, hesap şifresini korumakla ve hizmeti hukuka uygun biçimde kullanmakla yükümlüdür. Analiz, Alıcı'nın ön değerlendirmede ve analizde verdiği yapı bilgilerine dayanır; bu bilgilerin doğruluğundan Alıcı sorumludur. Eksik ya da hatalı bilgi analizin sonucunu etkiler.</li>
      <li>Satıcı, hizmeti kullanılabilir tutmak için gerekli özeni gösterir. Bakım ve güncelleme çalışmaları nedeniyle kısa süreli kesintiler olabilir.</li>
    </ul>

    <h2>10. Kişisel veriler</h2>
    <p>Alıcı'nın kişisel verileri <NuxtLink to="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</NuxtLink> ve <NuxtLink to="/gizlilik-politikasi">Gizlilik Politikası</NuxtLink>'nda açıklandığı şekilde işlenir.</p>

    <h2>11. Uyuşmazlıkların çözümü</h2>
    <p>Bu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı'nın her yıl ilan ettiği parasal sınırlar içinde Alıcı'nın yerleşim yerindeki ya da işlemin yapıldığı yerdeki Tüketici Hakem Heyeti, bu sınırların üzerindeki uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir. Şirket ve diğer tüzel kişi alıcılarla doğan uyuşmazlıklarda Bursa mahkemeleri ve icra daireleri yetkilidir.</p>

    <h2>12. Yürürlük</h2>
    <p>Alıcı, sitedeki ödeme sayfasında ödemeden önce bu sözleşmeyi ve <NuxtLink to="/on-bilgilendirme-formu">Ön Bilgilendirme Formu</NuxtLink>'nu onay kutusunu işaretleyerek okuduğunu ve kabul ettiğini beyan eder. Sözleşme ödemenin onaylanmasıyla kurulur. Alıcı'nın onayları ödeme kaydıyla birlikte saklanır.</p>
  </LegalPage>
</template>
