<script setup lang="ts">
// Ön Bilgilendirme Formu (Mesafeli Sözleşmeler Yönetmeliği). PKTakip metninden uyarlandı (kullanıcı kararları, 7 Kasım 2026).
const s = SELLER
</script>

<template>
  <LegalPage
    title="Ön Bilgilendirme Formu"
    description="FireTech dijital analiz hizmetini satın almadan önce bilmeniz gerekenler: satıcı bilgileri, hizmetin nitelikleri, KDV dahil toplam bedel, ödeme, ifa ve cayma hakkı."
  >
    <p>Bu form, Mesafeli Sözleşmeler Yönetmeliği uyarınca, sözleşme kurulmadan önce Alıcı'yı bilgilendirmek amacıyla hazırlanmıştır.</p>

    <h2>1. Satıcı bilgileri</h2>
    <LegalSeller />

    <h2>2. Alıcı bilgileri</h2>
    <p>FireTech üyeliğinde ve sitedeki ödeme sayfasında sipariş sırasında bildirilen ad soyad, e-posta, telefon ve fatura adresi bilgileridir.</p>

    <h2>3. Hizmetin temel nitelikleri</h2>
    <ul>
      <li>Hizmet, internet sitesi üzerinden elektronik ortamda sunulan tek seferlik bir dijital analiz hizmetidir. Abonelik değildir. Kurulum ya da fiziksel teslimat yoktur.</li>
      <li><strong>Detaylı Yangın Güvenliği Analizi:</strong> ücretsiz ön değerlendirmeden sonra, yapının kullanım sınıflarına göre hazırlanan yangın güvenliği hazırlık analizi ve rapor.</li>
      <li><strong>Site / Yerleşke Yönetimi:</strong> site ve yerleşkenin yapı, tesis ve ortak kullanım alanlarının periyodik kontrol değerlendirmesi.</li>
      <li>Her analiz için bir kez ödeme alınır. Hizmetin adı ve bedeli ödeme ekranında gösterilen şekildedir.</li>
      <li>Analiz çıktıları hazırlık raporu ve aksiyon listesi niteliğindedir; "Uygun / Uygun Değil" hükmü verilmez. Çıktılar resmî periyodik kontrolün, yetkili kişi ya da kuruluşların yapması gereken denetimin ve imzalı raporun yerine geçmez.</li>
    </ul>

    <h2>4. Toplam bedel</h2>
    <p>Sitede gösterilen fiyatlara KDV dahil değildir. Ödemede hizmet bedeline %20 KDV eklenir. Ödeme ekranında hizmet bedeli, KDV tutarı ve KDV dahil toplam tutar gösterilir; karttan bu toplam tutar çekilir. Satıcı bunun dışında ek bir ücret almaz.</p>

    <h2>5. Sipariş ve ödeme</h2>
    <p>Sipariş, ücretsiz üyelik ve girişten sonra sitedeki ödeme sayfasından verilir. Fatura bilgileri sipariş sırasında ödeme sayfasında alınır: ad soyad, telefon ve fatura adresi. Satıcı faturayı bu bilgilerle düzenler.</p>
    <p>Ödeme kredi kartı ya da banka kartıyla, PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş. altyapısı üzerinden, ödeme sayfasında açılan PayTR ödeme ekranında tek çekim olarak alınır. Kart bilgileri Satıcı'ya ulaşmaz; PayTR tarafından işlenir.</p>

    <h2>6. İfa (hizmetin sunulması)</h2>
    <p>Ödeme onaylandığında analiz Alıcı'nın FireTech hesabına tanımlanır ve hemen başlatılabilir. Sipariş ve ödeme kaydı "Hesabım &gt; Ödemelerim" ekranında görüntülenir. Bu form ve <NuxtLink to="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</NuxtLink> sitede her zaman erişilebilir durumdadır.</p>

    <h2>7. Hizmetin süresi</h2>
    <p>Hizmet tek seferliktir; her ödeme bir analiz içindir ve analiz tamamlandığında sözleşme ifa edilmiş olur. Kendiliğinden yenilenmez; karttan otomatik çekim yapılmaz. Yeni bir analiz için ödeme sayfasından ayrıca ödeme yapılır.</p>

    <h2>8. Cayma hakkı</h2>
    <ul>
      <li>Alıcı, ödeme tarihinden itibaren 14 gün içinde, analize henüz başlanmamışsa, gerekçe göstermeden ve cezai şart ödemeden cayma hakkını kullanabilir.</li>
      <li>Bildirim <a :href="`mailto:${s.email}`">{{ s.email }}</a> adresine e-postayla ya da {{ s.phones.map((p) => p.label).join(' veya ') }} numaralı telefonlardan yapılır.</li>
      <li>Ödenen tutarın tamamı, cayma bildiriminin Satıcı'ya ulaşmasından itibaren 14 gün içinde ödemenin yapıldığı karta iade edilir; analiz kapatılır.</li>
      <li>Hizmet elektronik ortamda anında ifa edilir. Alıcı, ödemeden önce onay kutusuyla analizin hemen başlayabileceğini ve analize başlandığında cayma hakkını kaybedeceğini kabul eder. Analize başlandıktan sonra Mesafeli Sözleşmeler Yönetmeliği md. 15/1-ğ uyarınca cayma hakkı yoktur.</li>
      <li>Analize başlandıktan ya da 14 gün geçtikten sonra iade yapılmaz. Hatalı ya da mükerrer çekimler her zaman iade edilir.</li>
      <li>Bu kurallar bireysel tüketicilerin yanında şirket ve diğer tüzel kişi alıcılara da aynen uygulanır.</li>
    </ul>
    <p>Ayrıntılar: <NuxtLink to="/iptal-iade-kosullari">İptal ve İade Koşulları</NuxtLink>.</p>

    <h2>9. Şikâyet ve uyuşmazlık</h2>
    <p>Şikâyetlerinizi <a :href="`mailto:${s.email}`">{{ s.email }}</a> adresine ya da Satıcı adresine iletebilirsiniz. Uyuşmazlıklarda, Ticaret Bakanlığı'nın her yıl ilan ettiği parasal sınırlar içinde Alıcı'nın yerleşim yerindeki ya da işlemin yapıldığı yerdeki Tüketici Hakem Heyeti'ne, bu sınırların üzerinde Tüketici Mahkemeleri'ne başvurulabilir. Şirket ve diğer tüzel kişi alıcılar için Bursa mahkemeleri ve icra daireleri yetkilidir.</p>

    <h2>10. Onay</h2>
    <p>Alıcı, sitedeki ödeme sayfasında ödemeden önce bu formu ve <NuxtLink to="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</NuxtLink>'ni onay kutusuyla kabul eder. Bu onay ödeme kaydıyla birlikte saklanır.</p>
  </LegalPage>
</template>
