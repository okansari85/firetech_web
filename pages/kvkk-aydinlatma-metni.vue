<script setup lang="ts">
// KVKK Aydınlatma Metni (6698 sayılı Kanun md.10). PKTakip metninden uyarlandı (kullanıcı kararları, 7 Kasım 2026).
// Yurt dışı aktarım koddan doğrulandı (7 Kasım 2026): components/kontrol/SoruKarti.vue → utils/yzEslestir.ts → /api/eslestir
// (firetech_deploy/yz/server.mjs) → Google Gemini API. Giden: yazılan kullanım adı (en çok 80 karakter) + sabit sınıf listesi;
// istek sunucudan çıktığı için kullanıcının IP'si Google'a gitmez. Hukuki dayanak bilerek kesinleştirilmedi.
const s = SELLER
</script>

<template>
  <LegalPage
    title="KVKK Aydınlatma Metni"
    description="FireTech'te işlenen kişisel veriler, işleme amaçları ve hukuki sebepleri, aktarıldığı taraflar ve 6698 sayılı Kanun kapsamındaki haklarınız."
  >
    <p>Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("Kanun") uyarınca, {{ s.web.replace('https://', '') }} internet sitesi ve sitedeki ön değerlendirme ve analiz hizmetleri kullanılırken işlenen kişisel veriler hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.</p>

    <h2>1. Veri sorumlusu</h2>
    <LegalSeller />

    <h2>2. İşlenen kişisel veriler</h2>
    <ul>
      <li><strong>Hesap:</strong> ad soyad, e-posta adresi ve şifrenizin özeti (şifrenizin kendisi saklanmaz).</li>
      <li><strong>Sipariş ve fatura:</strong> ad soyad, telefon numarası, fatura adresi.</li>
      <li><strong>Müşteri işlem:</strong> satın alınan analiz, sipariş ve ödeme kaydı, sözleşme ve ön bilgilendirme onaylarının zamanı. Kart bilgileriniz bu kapsamda değildir; kart bilgileri bize ulaşmaz, ödeme kuruluşu PayTR tarafından işlenir.</li>
      <li><strong>Yapı bilgileri:</strong> ön değerlendirmede ve analizde verdiğiniz cevaplar; örneğin yapının kullanım sınıfı ve türü, yüksekliği, alanı, kat sayısı, kişi sayısı, site ya da yerleşke adı ve içindeki yapı ve tesisler. Bu bilgiler yapıya ilişkindir; hesabınızla birlikte işlendiğinde kişisel veri sayılabilir.</li>
      <li><strong>İşlem güvenliği:</strong> IP adresi, giriş kayıtları.</li>
    </ul>

    <h2>3. İşleme amaçları</h2>
    <ul>
      <li>Üyelik işlemlerinin yapılması ve hesabın açılması,</li>
      <li>Siparişin alınması, ödemenin alınması, faturalandırma ve iade işlemlerinin yürütülmesi,</li>
      <li>Ön değerlendirmenin ve satın alınan analizin hazırlanması; yazdığınız kullanım türünün uygun kullanım sınıfıyla eşleştirilmesi,</li>
      <li>Sipariş ve ödeme kayıtlarının "Hesabım &gt; Ödemelerim" ekranında size gösterilmesi,</li>
      <li>Destek taleplerinin ve başvuruların yanıtlanması,</li>
      <li>Bilgi ve işlem güvenliğinin sağlanması, yasal yükümlülüklerin yerine getirilmesi ve yetkili kurumların taleplerinin karşılanması.</li>
    </ul>

    <h2>4. Toplama yöntemi ve hukuki sebepler</h2>
    <p>Kişisel verileriniz; internet sitesindeki üyelik ve giriş formu, ön değerlendirme ve analiz ekranları, ödeme sayfası ve sistem kayıtları aracılığıyla elektronik ortamda, otomatik yollarla toplanır ve Kanun'un 5. maddesinin 2. fıkrasında yer alan şu hukuki sebeplere dayanılarak işlenir:</p>
    <ul>
      <li><strong>(c) bendi:</strong> bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (üyelik, sipariş, ödeme ve analizin sunulması),</li>
      <li><strong>(ç) bendi:</strong> veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması (fatura, vergi ve ticari kayıtlar, sözleşme onay kayıtları, yetkili kurum talepleri),</li>
      <li><strong>(f) bendi:</strong> temel hak ve özgürlüklerinize zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri için zorunlu olması (işlem güvenliği kayıtları, destek taleplerinin yanıtlanması).</li>
    </ul>

    <h2>5. Kişisel verilerin aktarılması</h2>
    <p>Kişisel verileriniz satılmaz. Yalnızca aşağıdaki amaçlarla ve bu amaçlar için gerekli olduğu kadar aktarılır:</p>
    <ul>
      <li><strong>Ödeme kuruluşu:</strong> ödemenin alınması ve iadesi için PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.'ye,</li>
      <li><strong>Barındırma:</strong> sitenin çalıştığı, Türkiye'de bulunan sunucu hizmet sağlayıcısına,</li>
      <li><strong>Yapay zekâ ile eşleştirme:</strong> aşağıda açıklanan şekilde, yalnızca yazdığınız kullanım adı yurt dışındaki yapay zekâ hizmet sağlayıcısına,</li>
      <li><strong>Yetkili kurumlar:</strong> hukuki yükümlülük hâlinde, talep eden yetkili kamu kurum ve kuruluşlarına.</li>
    </ul>

    <h3>Yurt dışına aktarım</h3>
    <p>Ön değerlendirmede yapınızın kullanım türünü listede bulamayıp "Diğer (Kendim Yazacağım)" alanına yazdığınızda, yazdığınız kullanım adı önce sitedeki kurallarla eşleştirilir. Kurallar bir eşleşme bulamazsa, yazmayı bıraktığınızda yalnızca bu yazı (en çok 80 karakter), uygun kullanım sınıfını önermek amacıyla sunucumuz üzerinden yurt dışında bulunan bir yapay zekâ hizmet sağlayıcısına (Google, Gemini API) aktarılır. Bu isteğe adınız, e-posta adresiniz, IP adresiniz ya da diğer cevaplarınız eklenmez. Bu alana ad, telefon, adres gibi kişisel bilgi yazmamanızı öneririz. Bu aktarım, Kanun'un 9. maddesi ve ilgili mevzuattaki şartlara uygun olarak yapılır. Kullanım türünü listeden seçtiğinizde ya da yazdığınız ad kurallarla eşleştiğinde bu aktarım yapılmaz.</p>

    <h2>6. Saklama süresi</h2>
    <p>Kişisel verileriniz işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen saklama süreleri boyunca saklanır; bu süreler sona erdiğinde silinir, yok edilir ya da anonim hâle getirilir.</p>

    <h2>7. Haklarınız</h2>
    <p>Kanun'un 11. maddesi uyarınca veri sorumlusuna başvurarak:</p>
    <ul>
      <li>kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
      <li>işlenmişse buna ilişkin bilgi talep etme,</li>
      <li>işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
      <li>yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
      <li>eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
      <li>Kanun'un 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
      <li>düzeltme, silme ve yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
      <li>işlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
      <li>kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
    </ul>
    <p>haklarına sahipsiniz.</p>

    <h2>8. Başvuru</h2>
    <p>Haklarınıza ilişkin taleplerinizi <a :href="`mailto:${s.email}`">{{ s.email }}</a> adresine e-postayla ya da {{ s.address }} adresine yazılı olarak iletebilirsiniz. Başvurunuzda kimliğinizi doğrulamamıza yetecek bilgileri (ad soyad, iletişim bilgisi) ve talebinizi açıkça belirtmeniz gerekir. Başvurular en geç 30 gün içinde ücretsiz olarak sonuçlandırılır; işlemin ayrıca bir maliyet gerektirmesi hâlinde Kişisel Verileri Koruma Kurulu'nca belirlenen tarifedeki ücret alınabilir.</p>

    <h2>9. Aydınlatma ve açık rıza</h2>
    <p>Bu metin kişisel verilerin işlenmesine ilişkin bir aydınlatmadır; açık rıza ya da pazarlama izni değildir. Gerekmesi hâlinde açık rıza ayrıca ve sizin özgür irade beyanınızla alınır.</p>
  </LegalPage>
</template>
