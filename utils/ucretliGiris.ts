// @ts-nocheck — Oğuz'un teslim paketindeki selection_engine.mjs (v1, 7 Kas 2026) DEĞİŞTİRİLMEDEN kopyalandı; mantığa dokunma.
// Paket güncellenirse yeni sürümü bu iki satırın altına aynen yapıştır. Katalog: data/ucretliKatalog.json, eşleme: data/ucretliEsleme.ts.
/** FIRETECH — approved entry page content resolver v1.
 * Pure deterministic text composition. No regulation inference, no external calls.
 * 176-entry metadata catalog must be provided by caller.
 */
export const REQUIRED_OUTPUTS = Object.freeze([
  { id:'summary',title:'Değerlendirme özeti',description:'Genel durum ve temel bulgular',icon:'chart' },
  { id:'issues',title:'Eksik / zayıf alan listesi',description:'Öncelikli hazırlanması gereken konular',icon:'alert' },
  { id:'actions',title:'Aksiyon planı',description:'Yapılacaklar ve öneriler',icon:'checklist' },
  { id:'documents',title:'Belge hazırlık listesi',description:'Gerekli bilgi ve dokümanlar',icon:'file' },
  { id:'technical',title:'Teknik inceleme başlıkları',description:'Uzman değerlendirmesi gereken konular',icon:'gear' },
  { id:'pdf',title:'PDF rapor',description:'Paylaşılabilir kapsamlı rapor',icon:'pdf' }
]);
const HEADLINE = {
 '06-X-001':'Fabrikanızın Periyodik Yangın Kontrolüne Hazırlık Analizi',
 '08-X-012':'Kapalı Otoparkınızın Periyodik Yangın Kontrolüne Hazırlık Analizi',
 '08-X-011':'Açık Otoparkınızın Periyodik Yangın Kontrolüne Hazırlık Analizi',
 '04-X-016':'Diş Hekimi Muayenehanenizin Periyodik Yangın Kontrolüne Hazırlık Analizi',
 '02-X-001':'Otelinizin Periyodik Yangın Kontrolüne Hazırlık Analizi',
 '02-X-002':'Motelinizin Periyodik Yangın Kontrolüne Hazırlık Analizi',
 '01-X-005-YONETIM':'Yönettiğiniz Sitenin Periyodik Yangın Kontrolüne Hazırlık Analizi',
 '01-X-005-SAKIN':'Yaşadığınız Bina İçin Yangın Güvenliği Hazırlık Analizi',
 '09-B-002':'LPG Tesisinizin Periyodik Yangın Kontrolüne Hazırlık Analizi'
};
const ESCAPE = {
 residential:'Binada yaşayanların güvenli çıkışı ve varsa ortak kaçış yolları',
 lodging:'Konaklayanların, özellikle gece, uyarılması ve güvenli çıkışı',
 institutional:'Yapıyı kullananların ihtiyaçlarına uygun tahliye düzeni',
 office:'Çalışanlar ve ziyaretçiler için güvenli çıkış yolları',
 commercial:'Müşteriler ve çalışanlar için güvenli çıkış düzeni',
 industrial:'Üretim alanlarından ve ortak bölümlerden güvenli tahliye',
 assembly:'Toplu kullanımda güvenli çıkış ve yönlendirme',
 storage:'Personelin ve ilgili alan kullanıcılarının güvenli tahliyesi',
 high_hazard:'Tesis çalışanlarının tahliyesi ve acil müdahale hazırlığı'
};
const clean=(x)=>String(x??'').trim();
const uniq=(a)=>[...new Set(a)];
const safe=(x)=> x==null?'':String(x);
export function selectPaidEntry(input, catalog){
  if (!Array.isArray(catalog?.entries) || catalog.entries.length!==176) throw new Error('176 kayıtlı orijinal katalog gerekli');
  const byId = new Map(catalog.entries.map(x=>[x.id,x]));
  const primaryId=clean(input?.primaryId);
  if(!byId.has(primaryId))throw new Error('Bilinmeyen ana kullanım ID: '+primaryId);
  const primary=byId.get(primaryId);
  const secondaryIds=uniq((input?.secondaryIds||[]).map(clean)).filter(x=>x!==primaryId);
  const extras=secondaryIds.map(id=>{if(!byId.has(id))throw new Error('Bilinmeyen ek kullanım ID: '+id);return byId.get(id)});
  const relation = input?.building?.relation || 'unknown';
  if(!['same_building','same_campus','separate_buildings','unknown'].includes(relation)) throw new Error('Geçersiz bina ilişkisi');
  const siteSelections=[primary,...extras].filter(x=>x.profile);
  if(siteSelections.some(x=>x.profile==='resident')&&siteSelections.some(x=>x.profile==='management')) throw new Error('Site sakini ile site yönetimi aynı analiz profilinde birleştirilemez');
  const hazardDimensions=extras.filter(x=>x.selection_dimension!=='usage');
  // 09-A, 09-B and 09-C are facility dimensions, NOT separate buildings.
  const secondary=extras.filter(x=>x.selection_dimension==='usage');
  const one=[primary,...extras];
  const primaryName=primary.name;
  const labelRelation= relation==='same_building'?'Aynı yapıdaki':relation==='same_campus'?'Aynı yerleşkedeki':relation==='separate_buildings'?'Ayrı yapılardaki':'İlişkisi henüz doğrulanmamış';
  const scope = [
    {id:'primary',title:'Öncelikli değerlendirme alanı',name:primaryName,detail:primary.main_class,sourceIds:[primary.id]},
    ...(secondary.length?[{id:'secondary',title:'İlgili kullanım alanları',name:secondary.map(x=>x.name).join(' · '),detail:labelRelation+' ek kullanım alanları',sourceIds:secondary.map(x=>x.id)}]:[]),
    ...(hazardDimensions.length?[{id:'hazards',title:'Madde / faaliyet özellikleri',name:hazardDimensions.map(x=>x.name).join(' · '),detail:'Tek tesisin seçilmiş madde, tesis ve işlem özellikleri; ayrı binalar değildir',sourceIds:hazardDimensions.map(x=>x.id)}]:[]),
    {id:'shared',title:relation==='separate_buildings'?'Yapı bazında hazırlık':'Bina genelindeki hazırlık',name:relation==='separate_buildings'?'Her yapının sistemleri ve kayıtları ayrı değerlendirilir':'Ortak kaçış, yangın sistemleri, kayıtlar ve organizasyon',detail:relation==='unknown'?'Yapılar arasındaki ilişki ücretli analizde doğrulanır':labelRelation+' sistem ve alanlar',sourceIds:one.map(x=>x.id)}
  ];
  const baseSubtitle=`${primaryName} öncelikli olarak değerlendirilir.`;
  const secondSubtitle=secondary.length?` ${labelRelation} ${secondary.map(x=>x.name).join(', ')} ${secondary.length>1?'kullanımları':'kullanımı'} ${relation==='separate_buildings'?'ayrı hazırlık kapsamlarında incelenir.':'ve ilişkili yangın güvenliği bağlantıları dikkate alınır.'}`:hazardDimensions.length?' Seçtiğiniz madde ve faaliyet özellikleri aynı tesis kapsamında değerlendirilir.':'';
  const subtitle=baseSubtitle+secondSubtitle+' Kontrol öncesi bilgi, belge ve hazırlık ihtiyaçlarınızı planlayabilirsiniz.';
  const mainFocus={id:'primary-focus',role:'primary',title:primary.focus_title,description:`${primaryName} kullanımına özgü faaliyet, ekipman ve yerleşim konuları`,sourceIds:[primary.id],icon:'factory'};
  const evacuate={id:'evacuation',role:'primary',title:'Kaçış yolları ve tahliye',description:primary.id==='04-X-016'?'Hastaların ve çalışanların güvenli çıkışı; bina ile ilişkisi':ESCAPE[primary.family],sourceIds:[primary.id],icon:'exit'};
  const alarm={id:'alarm',role:'shared-technical',title:'Yangın algılama ve uyarı',description:'İlgili olduğu ölçüde alarm, dedektör, bildirim ve kontrol kayıtları',sourceIds:one.map(x=>x.id),icon:'alarm'};
  const suppression={id:'suppression',role:'shared-technical',title:'Söndürme sistemleri',description:'Yapıya uygulanabilir yangın dolabı, söndürücü ve diğer sistemlerin hazırlığı',sourceIds:one.map(x=>x.id),icon:'extinguisher'};
  let other, last;
  if(secondary.length){
    other=hazardDimensions.length ? {id:'hazard-features',role:'hazard',title:'Özel madde ve faaliyetler',description:hazardDimensions.map(x=>x.name).slice(0,3).join(' · '),sourceIds:hazardDimensions.map(x=>x.id),icon:'hazard'} : {id:'related-use',role:'secondary',title:secondary.length===1?`İlgili kullanım: ${secondary[0].name}`:'Diğer kullanım alanları',description:`${secondary.map(x=>x.name).slice(0,3).join(', ')}${secondary.length>3?' ve diğerleri':''} için kullanım özellikleri ve güvenlik ilişkileri`,sourceIds:secondary.map(x=>x.id),icon:'office'};
    last={id:'shared-systems',role:'building',title:relation==='separate_buildings'?'Yapı bazında hazırlık':relation==='unknown'?'Yapılar arası ilişki':relation==='same_campus'?'Yerleşke ortak sistemleri':'Ortak bina sistemleri',description:relation==='separate_buildings'?'Her yapının ayrı sistemleri, belgeleri ve sorumluları':relation==='unknown'?'Sistemlerin ortak mı ayrı mı olduğu ve sorumluluklar doğrulanır':'Ortak kaçış düzeni, teknik tesisatlar, yönetim sorumluluğu ve bakım kayıtları',sourceIds:one.map(x=>x.id),icon:'building'};
  } else if(hazardDimensions.length || primary.family==='high_hazard'){
    other={id:'hazard-features',role:'hazard',title:'Madde ve faaliyet özellikleri',description:hazardDimensions.length?hazardDimensions.map(x=>x.name).slice(0,3).join(' · '):'İlgili madde ve faaliyet koşulları',sourceIds:hazardDimensions.map(x=>x.id),icon:'hazard'};
    last={id:'records',role:'management',title:'Proje, belge ve kontroller',description:'İlgili izin, proje, muayene ve hazırlık kayıtları',sourceIds:[primary.id],icon:'file'};
  } else {
    const homeLike = primary.family==='residential';
    other={id:'team',role:'organisation',title:primary.profile==='resident'?'Site yönetimi ve bilgilendirme':homeLike?(primary.profile==='management'?'Site organizasyonu ve görevliler':'Konut ve ortak alan hazırlığı'):'Ekipler ve organizasyon',description:primary.profile==='resident'?'Sakinlerin bilgilendirilmesi ve yönetime iletilecek hazırlık konuları':homeLike?'Yapının türüne uygun aile, bina veya site yönetimi hazırlıkları':'Yapının türüne uygun görevlendirme, eğitim ve acil durum hazırlığı',sourceIds:[primary.id],icon:'users'};
    last={id:'records',role:'management',title:'Proje, belge ve kontroller',description:'İlgili proje, plan, bakım ve muayene kayıtları',sourceIds:[primary.id],icon:'file'};
  }
  // The six cards are content themes, not findings or legal obligations.
  const topics=[mainFocus,evacuate,alarm,suppression,other,last];
  const period=input?.periodResult||null;
  const hasVerifiedPeriod=period?.source==='existing_free_calculator'&&Number.isInteger(period?.years)&&period.years>0 && clean(period.driverText);
  const periodCard=hasVerifiedPeriod?{years:period.years,label:`${period.years} YIL`,driver:period.driverText,source:'existing_free_calculator',determiningUseId:period.driverSelectionId||null}:
     {years:null,label:'Ücretsiz hesaplama sonucu gerekli',driver:'Süre uydurulamaz; mevcut hesaplama ekranının sonucu aktarılmalı',source:'missing',determiningUseId:null};
  const price = input?.priceConfig?.status==='configured' && Number.isFinite(input.priceConfig?.amount) && input.priceConfig.amount>=0 ?
   {status:'configured',amount:input.priceConfig.amount,currency:input.priceConfig.currency||'TRY',vatLabel:input.priceConfig.vatLabel||'Vergi bilgisi fiyat yapılandırmasından alınır'} :
   {status:'pending',label:'Fiyat daha sonra belirlenecek'};
  const warnings=[];
  if(relation==='unknown'&&secondary.length) warnings.push('Ek kullanımların aynı binada mı, ayrı binalarda mı olduğu henüz doğrulanmadı.');
  if(!hasVerifiedPeriod)warnings.push('Mevcut ücretsiz hesap motorundan doğrulanmış süre sonucu alınmadı.');
  if(secondary.length>3)warnings.push('Kapsam kartında yalnız ilk 3 kullanım özetlenir; tüm seçimler ücretli analize eksiksiz aktarılır.');
  return {
   headline:HEADLINE[primaryId]||`${primaryName} İçin Periyodik Yangın Kontrolüne Hazırlık Analizi`,
   subtitle, primaryUse:primary, allSelections:one, secondaryUses:secondary, hazardDimensions, scope, periodCard,
   topics,deliverables:REQUIRED_OUTPUTS,price,warnings,
   handoff:{primaryId, secondaryIds,allSelectedIds:one.map(x=>x.id),building:input?.building||{relation:'unknown'},periodResult:period,siteProfile:primary.profile||null,originalFreeForm:input?.originalFreeForm||null},
   disclaimer:'Bu sayfa analiz öncesi tanıtım ve kapsam bilgisidir; teknik uygunluk, eksiklik veya risk sonucu üretilmemiştir.'
  };
}
