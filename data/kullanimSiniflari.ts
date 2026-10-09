// EKRAN 2 — Yapının Kullanım Sınıfı (BYKHY Madde 8). Metinler müşterinin "ÜCRETSİZ EKRANLAR" dokümanından.
// "Karışık kullanım" ayrı kart değildir (sınıf spesifikasyonları); kullanıcı sonraki adımda birden fazla kullanım seçer.

export type KullanimSinifi = { kod: string; ad: string; aciklama: string; madde: number }

export const kullanimSiniflari: KullanimSinifi[] = [
  { kod: 'residential', ad: 'Konutlar', madde: 9, aciklama: 'Bir veya iki bağımsız bölümlü evler ile üç veya daha fazla bağımsız bölümü bulunan apartmanlar.' },
  { kod: 'lodging', ad: 'Konaklama Amaçlı Binalar', madde: 10, aciklama: 'Otel, motel, termal tesis, tatil köyü, pansiyon, kamping, öğrenci yurdu, kamp ve benzeri konaklama amaçlı kullanılan binalar.' },
  { kod: 'institutional', ad: 'Kurumsal Binalar', madde: 11, aciklama: 'Eğitim tesisleri, sağlık hizmeti amaçlı binalar ile tutukevi, cezaevi, ıslahevi ve benzeri kurumsal kullanımlar.' },
  { kod: 'office', ad: 'Büro Binaları', madde: 12, aciklama: 'Banka, borsa, kamu hizmet binası, genel büro, doktor ve diş hekimi muayenehanesi ve benzeri büro kullanımları.' },
  { kod: 'commercial', ad: 'Ticaret Amaçlı Binalar', madde: 13, aciklama: 'Mağaza, dükkân, market, süpermarket, toptancı sitesi, sebze hali, meyve hali, balık hali, et borsası, kapalı çarşı, pasaj, tamirhane, yedek parça ve malzeme satış yerleri ve benzeri ticari kullanımlar.' },
  { kod: 'industrial', ad: 'Endüstriyel Tesisler', madde: 14, aciklama: 'Üretim, işleme, montaj, karıştırma, temizleme, yıkama, paketleme, dağıtım veya onarım faaliyetlerine mahsus tesisler.' },
  { kod: 'assembly', ad: 'Toplanma Amaçlı Binalar', madde: 15, aciklama: 'Tören, ibadet, eğlence, yeme-içme, ulaşım veya bekleme amacıyla 50 veya daha fazla kişinin bir araya gelebildiği yerler.' },
  { kod: 'storage', ad: 'Depolama Amaçlı Tesisler', madde: 16, aciklama: 'Mal, eşya, ürün, araç veya hayvanın depolanması veya muhafazası için kullanılan depolar ve otoparklar.' },
  { kod: 'high_hazard', ad: 'Yüksek Tehlikeli Yerler', madde: 17, aciklama: 'Parlayıcı ve patlayıcı gazlar, patlayıcı maddeler ile yanıcı sıvılar veya akaryakıtla ilgili imal, depolama, doldurma-boşaltma ve satış yerleri.' }
]
