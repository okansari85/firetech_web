<script setup lang="ts">
// İptal ve İade Koşulları: sözleşmedeki cayma / iade kurallarının sade anlatımı (kullanıcı kararları, 7 Kasım 2026).
const s = SELLER
</script>

<template>
  <LegalPage
    title="İptal ve İade Koşulları"
    description="FireTech dijital analiz hizmetinde analize başlanmadan 14 gün içinde gerekçesiz cayma ve tam iade, analize başlandıktan sonraki durum, hatalı çekimler ve başvuru yolları."
  >
    <h2>Kısaca</h2>
    <ul>
      <li>Ödeme tarihinden itibaren <strong>14 gün içinde</strong>, <strong>analize başlamadıysanız</strong>, gerekçe göstermeden ve cezai şart ödemeden caymak için başvurabilirsiniz.</li>
      <li>Cayarsanız ödediğiniz <strong>tutarın tamamı</strong>, bildiriminiz bize ulaştıktan sonra <strong>14 gün içinde</strong> ödemeyi yaptığınız karta iade edilir.</li>
      <li>İade yapıldığında satın aldığınız analiz kapatılır.</li>
      <li><strong>Analize başladıktan sonra</strong> cayma hakkı ve iade yoktur (ayrıntı aşağıda). 14 gün geçtikten sonra da iade yapılmaz; satın aldığınız analizi kullanmaya devam edersiniz.</li>
      <li>Hizmet abonelik değildir; her analiz için bir kez ödeme alınır. Kendiliğinden yenilenmez, kartınızdan otomatik çekim yapılmaz. Bu yüzden ayrıca "iptal" etmeniz gerekmez.</li>
      <li>Hatalı ya da mükerrer (birden fazla) çekim olursa fazladan alınan tutar süreye bakılmaksızın her zaman iade edilir.</li>
      <li>Bu kurallar bireysel kullanıcılarla birlikte şirket ve diğer tüzel kişi alıcılara da aynen uygulanır.</li>
    </ul>

    <h2>Analize başladıysanız</h2>
    <p>Analiz, elektronik ortamda anında ifa edilen bir hizmettir. Ödemeden önce ödeme sayfasındaki onay kutusunu işaretleyerek analizin ödeme onaylanır onaylanmaz başlayabileceğini ve analize başladığınızda cayma hakkınızı kaybedeceğinizi kabul edersiniz. Bu nedenle analize başlandıktan sonra, Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca cayma hakkı kullanılamaz.</p>

    <h2>Nasıl başvurulur?</h2>
    <ol>
      <li><a :href="`mailto:${s.email}`">{{ s.email }}</a> adresine e-posta gönderin ya da <template v-for="(p, i) in s.phones" :key="p.tel">{{ i ? ' veya ' : '' }}<a :href="`tel:${p.tel}`">{{ p.label }}</a></template> numaralı telefonlardan bize ulaşın.</li>
      <li>Bildiriminizde siparişte kullandığınız ad soyad ve e-posta adresini yazın; ödemenin tarihini ve hangi analiz için yapıldığını "Hesabım &gt; Ödemelerim" ekranından görebilirsiniz. Gerekçe yazmanız gerekmez.</li>
      <li>Bildiriminiz bize ulaştıktan sonra en geç 14 gün içinde iade kartınıza yapılır.</li>
    </ol>

    <h2>İadenin kartınıza yansıması</h2>
    <p>İade, ödemenin alındığı PayTR altyapısı üzerinden aynı karta yapılır. Tutarın kart hesabınıza ya da ekstrenize yansıma süresi kartınızı veren bankaya bağlıdır.</p>

    <h2>İlgili metinler</h2>
    <p>Hukuki ayrıntılar için <NuxtLink to="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</NuxtLink> ve <NuxtLink to="/on-bilgilendirme-formu">Ön Bilgilendirme Formu</NuxtLink>'na bakabilirsiniz.</p>
  </LegalPage>
</template>
