# Lime Network Simulator

Lime Network Simulator, ağ kurulumunu görsel olarak denemek ve öğrenmek için yazılmış açık kaynaklı, Türkçe bir ağ simülatörüdür. Cihazları tuvale yerleştirir, kablolarla bağlar, paket gönderir ve paketin yolda nerede takıldığını debug günlüğünden görürsün. ns-3 ve benzeri simülatörlerden ilham alır, ancak kod yazmadan, tamamen görsel arayüzle çalışır.

Uygulama Electron ile paketlenmiş bir masaüstü programıdır. Arayüz tek bir HTML dosyasından (`index.html`) oluşur, ek bir kütüphane kullanmaz.

## İndirme

Uygulamayı kullanmak için Node.js, npm veya başka bir şey kurman gerekmez. Sağdaki **Releases** bölümünden en son sürümdeki dosyayı indirip çift tıklaman yeterlidir. Windows 10 ve 11'de çalışır.

İki dosya vardır: `.exe` kurulumlu sürümdür ve yeni sürüm çıktığında kendini otomatik günceller (önerilen). `portable.exe` taşınabilir sürümdür, kurulum gerektirmez ama güncellemeleri elle indirmen gerekir. Dosya taşınabilir (kurulumsuz) çalışır.

Windows ilk açılışta "Windows bilgisayarınızı korudu" uyarısı gösterebilir, çünkü uygulama dijital olarak imzalı değildir. **Ek bilgi → Yine de çalıştır** diyerek açabilirsin.

## Ne işe yarar?

Temel fikir şu: bir bağlantı ya doğrudur ya yanlıştır. Doğru bağlantıda veri akar, yanlış bağlantıda akmaz. Yanlış kablo seçtiğinde, kabloyu çıkarılmış bıraktığında ya da cihazı çok uzağa koyduğunda simülasyon bunu gösterir ve nedenini açıklar. Amaç, ağ cihazlarının nasıl kablolandığını ve neden bazı bağlantıların çalışmadığını deneyerek öğrenmektir.

Proje ilk açılışta boştur. Her şeyi sen kurarsın.

## Cihazlar

Cihazlar uygulamada kategorilere ayrılmıştır:

- **Uç cihazlar:** Bilgisayar, dizüstü, akıllı telefon, IoT cihazı
- **Ağ cihazları:** Switch, hub, router, modem
- **Kablosuz:** Access point, Mesh Wi-Fi
- **Sunucular:** Sunucu, DNS sunucusu
- **Güvenlik:** Firewall, DDoS temizleme sunucusu
- **Servis sağlayıcı (FTTx):** OLT, ONT

Bilgisayar ve dizüstünde Ethernet hızı (100 Mbps – 10 Gbps), Wi-Fi destekleyen cihazlarda Wi-Fi sürümü ayarlanabilir; gerçek hız her zaman en yavaş bileşene göre belirlenir. İki cihaz arasına yalnızca bir kablo çekilebilir. DNS sunucusu doğrudan bağlandığı sunucuya dünyada popüler bir sitenin adını (google.com gibi) verir. Mesh düğümleri birbirine kablosuz bağlanabilir ve kendi aralarında kanal çakışması yapmaz.

IP adresi alabilen cihazlara eklendikleri anda rastgele ve benzersiz bir IP adresi (`192.168.x.y`) atanır. Aynı IP iki cihazda bulunmaz. Switch, hub, modem ve ONT IP almaz.

Bir cihazı seçtiğinde sağ panelde o cihazın ne yaptığı, nasıl kablolanacağı, fiber destekleyip desteklemediği ve maksimum port hızı yazar.

## Kablolar ve bağlantı kuralları

Üç kablo ailesi vardır: düz, çapraz ve fiber. Wi-Fi de bir bağlantı türü olarak ayrıca bulunur.

**Düz ve çapraz kablo (bakır).** Cihazlar iki gruba ayrılır. Bilgisayar, dizüstü, sunucu, router, firewall, OLT ve DDoS temizleme sunucusu bir grupta; switch, hub, access point, modem ve ONT diğer grupta yer alır. Farklı gruptaki cihazlar düz kablo, aynı gruptaki cihazlar çapraz kablo ile bağlanır. Yanlış kablo seçilirse bağlantı kırmızı kesik çizgiyle gösterilir ve veri akmaz.

**Kablo kategorisi.** Bakır kablo için Cat5 (100 Mbps), Cat5e (1 Gbps), Cat6 (1 Gbps, 55 metreye kadar 10 Gbps) ve Cat6a (10 Gbps) seçilebilir. Kategori kablo seçildikten sonra sağ panelden değiştirilir.

**Fiber.** Çok modlu (10 Gbps, 300 metreye kadar) ve tek modlu (çok uzun mesafe) seçenekleri vardır. Yalnızca fiber portu olan cihazlarda kullanılabilir: switch, router, sunucu, firewall, modem, OLT, ONT ve DDoS temizleme sunucusu. OLT'nin bütün portları yalnızca fiber kabul eder. ONT ile OLT arası da fiberle yapılır.

**Mesafe.** Tuvaldeki ölçek 1 piksel = 0,25 metredir. Bakır kablo en fazla 100 metre destekler, 100 metreyi aşan bağlantı çalışmaz. 50 metreden sonra hız kademeli olarak düşer ve 100 metrede yarıya iner. Cihazı sürükleyerek mesafeyi canlı değiştirebilirsin.

**Hız.** Bir bağlantının gerçek hızı; kablo kategorisi, mesafe ve iki ucundaki cihazların port hızından en düşüğüdür. Örneğin Cat6a ile bir bilgisayara bağlansan bile bilgisayar portu 1 Gbps olduğu için hız 1 Gbps'te kalır. Paket gönderdiğinde debug günlüğü yolun en yavaş halkasını (darboğaz) belirtir.

**Kabloyu tak/çıkar/sil.** Bir kabloyu seçtiğinde sağ panelden çıkarabilir, yeniden takabilir, silebilir veya türünü değiştirebilirsin. Çıkarılmış kablo ortasında boşluk olan gri çizgi olarak görünür.

## Kablosuz bağlantı

Wi-Fi bağlantısı bir verici ile bir istemci arasında kurulur. Verici olarak access point, modem ve (isteğe bağlı) router kullanılabilir. Router'ların hepsinde Wi-Fi bulunmadığı için router'ı seçip "Bu router'da Wi-Fi var" kutusunu işaretlemen gerekir. İstemci olarak dizüstü, akıllı telefon ve IoT cihazı kullanılabilir. Telefon ve IoT cihazları yalnızca Wi-Fi destekler, kablo takılamaz.

- **Standartlar:** 802.11b, g, n, ac ve ax (Wi-Fi 6) seçilebilir. Her standardın menzili, hızı ve bandı farklıdır. Verici etrafında menzil çemberi ve yayılan dalgalar görünür; standart hızlandıkça animasyon da hızlanır.
- **Sinyal:** Sinyal gücü mesafeyle azalır ve kablo üzerinde yüzde olarak gösterilir. Çizgi renkli (yeşilden kırmızıya) çizilir. Menzil dışında bağlantı geçersiz olur.
- **Kanal çakışması:** Vericilere 1 ile 11 arasında bir kanal atanır. Aynı bantta (802.11ac 5 GHz, diğerleri 2.4 GHz) kanalı birbirine yakın ve menzilleri kesişen vericiler birbirine parazit yapar. Çakışan vericilerin çemberi kırmızı olur, istemcinin hızı düşer ve kabloda uyarı simgesi görünür. Kanalları birbirinden uzak seçmek (örneğin 1, 6, 11) sorunu giderir.

## Güvenlik simülasyonu

Bilgisayar, dizüstü, telefon ve IoT cihazları için dört saldırı türü seçilebilir:

- **Botnet / DDoS:** Sunuculara sürekli saldırı paketi gönderir. DDoS temizleme sunucusu paketleri atar ve IP'yi bloklar.
- **Port tarama:** Sunucudaki açık portları bulur. Firewall taramayı tespit edip saldırganı bloklar.
- **SSH kaba kuvvet:** Yeterince deneme gelirse sunucu ele geçirilir. Firewall saldırganı bloklar.
- **ARP zehirleme:** Aynı yerel ağdaki cihazların trafiğini dinler. Switch'te ARP koruması (DAI) açılırsa saldırı engellenir.

Aşağıda Botnet/DDoS ayrıntıları verilmiştir.

Bilgisayar, dizüstü, telefon ve IoT cihazları "botnet virüslü" olarak işaretlenebilir. Virüslü cihaz, yolu olan sunuculara sürekli DDoS paketi gönderir (kırmızı paketler).

- **Korumasız sunucu:** Saldırı paketleri sunucunun yük çubuğunu doldurur. Yük sınırı aşılınca sunucu çöker ve normal isteklere cevap vermez.
- **Firewall:** Yolda bir firewall varsa saldırı paketlerinin bir kısmını düşürür, ancak IP bloklayamaz.
- **DDoS temizleme sunucusu:** Yoldaki saldırı paketlerinin tamamını çöpe atar. Aynı IP'den belli sayıda saldırı paketi gelince o IP'yi bloklar. Bloklu cihazın normal trafiği de temizleme sunucusunda durdurulur.
- **IP sıfırlama:** Bloklanan cihazın sağ panelindeki butonla yeni bir IP alması gerekir. Virüs temizlenmezse cihaz yeniden saldırır ve yeniden bloklanır.

## Topoloji, geri alma ve dil

Topolojiyi **Kaydet** ile `.lime.json` dosyasına yazıp **Aç** ile geri yükleyebilirsin. `Ctrl+Z` geri alır, `Ctrl+Y` (veya `Ctrl+Shift+Z`) yineler. Sağ üstteki listeden arayüz dili Türkçe veya İngilizce seçilir. Arayüz, cihaz açıklamaları, rehber ve mesajlar İngilizce olarak da bulunur; dil değiştirince uygulama yeniden yüklenir.

## Gecikme, paket kaybı ve STP

Paket gönderince günlükte yol üzerindeki tahmini gidiş-dönüş süresi (RTT) ve paket kaybı yazar. Gecikme kablo türüne, mesafeye, cihaz işlem süresine ve Wi-Fi'de sinyal/parazite bağlıdır. Zayıf Wi-Fi sinyali ve 80 metreyi aşan bakır kablolar paket kaybına yol açar; kaybolan paket günlükte gösterilir. Switch'ler arasında döngü kurarsan STP açıkken yedek bağlantı otomatik bloklanır (turuncu, "STP" etiketli); STP kapalıysa broadcast fırtınası oluşur ve paketler düşer. STP, switch seçilince sağ panelden açılıp kapatılır.

## IP, alt ağ ve DHCP

IP alabilen her cihazda IP adresi, önek uzunluğu (/16–/30) ve ağ geçidi (gateway) sağ panelden düzenlenir. Varsayılan olarak cihazlar `192.168.1.x` ağında rastgele ve benzersiz bir IP alır. Aynı alt ağdaki cihazlar doğrudan konuşur. Farklı alt ağdaki cihazlar için yolda bir router olmalı ve iki tarafın ağ geçidi o router'ın IP adresine ayarlanmalıdır; aksi halde debug günlüğü eksiği söyler. İki cihaz aynı IP'yi kullanırsa IP çakışması hatası verilir.

Router veya sunucu **DHCP sunucusu** yapılabilir. Bilgisayar, dizüstü, telefon veya IoT cihazında "DHCP'den IP al" işaretlenince cihaz, router'a geçmeden ulaşabildiği DHCP sunucusundan IP, önek ve ağ geçidi alır. Sunucu bulunamazsa `169.254.x.x` (APIPA) adresi atanır.

## Görevler

"Görevler" düğmesinde hazır laboratuvarlar bulunur: ilk ağ, alt ağlar, DHCP, Wi-Fi ağı, FTTx, STP, DDoS savunması, port taramayı durdurma ve ARP zehirlemeyi engelleme. Görevi çözünce "Kontrol Et" ile doğrulatırsın; tamamlananlar kaydedilir.

## Çalıştırma kontrolleri ve debug

Üst çubuktaki düğmeyle simülasyon durdurulup devam ettirilebilir. "Paket Gönder" ile önce kaynak, sonra hedef cihaza tıklarsın; paketin protokolünü (ICMP, ARP, TCP, UDP, HTTP, DNS, DHCP) listeden seçersin. Paket kablo üzerinde ilerler, bir cihaza vardığında cihazın kutusu kısa süre parlar ve paket yoluna devam eder. Hedefe ulaşınca yanıt paketi geri döner.

Paket hedefe ulaşamazsa alttaki debug günlüğü nedenini söyler: kablo çıkarılmış, yanlış kablo türü, fiber desteklenmiyor, mesafe aşılmış, menzil dışı, IP bloklu, sunucu çökmüş veya iki cihaz arasında hiç yol yok. Sorunlu kablo birkaç saniye kırmızı yanıp söner.

## Rehber ve eğitim

Uygulama içindeki Rehber bölümünde cihazların açıklamaları, kablo kuralları, protokol listesi (ARP, ICMP, TCP, UDP, DHCP, DNS, HTTP, FTP, SSH, STP, VLAN, NAT, OSPF, RIP, BGP ve diğerleri), kategori ve hız bilgileri, Wi-Fi ve FTTx anlatımı ile kullanım yönergeleri bulunur.

## Kullanım

- Soldan bir cihaz seç, tuvale tıkla.
- Soldan bir kablo türü seç, bir cihazdan diğerine sürükle.
- Boşluğa sol veya sağ tıklayıp sürükleyerek tuvalde gez (cihaz ekleme ve kablo araçları açıkken de çalışır).
- Fare tekerleğiyle yakınlaştır veya uzaklaştır.
- Seçili cihazı veya kabloyu `Delete` ile sil. `Esc` aktif aracı iptal eder.
- "Tümünü Sil" ile topolojiyi tek seferde temizle.

## Kaynak koddan çalıştırma ve derleme

Bu bölüm yalnızca geliştiriciler içindir; uygulamayı sadece kullanacaksan yukarıdaki İndirme bölümü yeterlidir. Node.js 18 veya üstü gerekir.

```
npm install
npm start
```

Windows için .exe üretmek için:

```
npm run dist
```

Çıktı `dist` klasöründe taşınabilir (kurulumsuz) bir .exe olarak oluşur. Derleme sırasında "Cannot create symbolic link" hatası alırsan terminali yönetici olarak aç veya Windows'ta Geliştirici Modu'nu etkinleştir. Bu adımlar yalnızca derleyen kişi için gereklidir, uygulamayı kullananların bir şey yapmasına gerek yoktur.

## Sınırlamalar

Bu bir eğitim simülatörüdür, gerçek bir ağ yığını değildir. Alt ağ ve DHCP basitleştirilmiştir: router tek IP adresine sahiptir (çoklu arayüz ve yönlendirme tablosu yoktur), VLAN, NAT ve gerçek DNS çözümlemesi simüle edilmez. STP'de kök köprü en düşük numaralı switch'tir ve port rolleri modellenmez. Saldırılar basitleştirilmiş modellerdir. Protokol seçimi paketin etiketi ve rengi içindir. Cihazlarda port numarası yoktur ve iki cihaz arasına yalnızca bir kablo çekilebilir.

## Proje yapısı

```
index.html      Arayüz iskeleti
style.css       Görünüm
main.js         Electron kabuğu (pencere, otomatik güncelleme)
icon.ico        Uygulama ikonu
src/
  data.js       Cihazlar, kablolar, Wi-Fi standartları, kablo kategorileri, protokoller
  i18n.js       Türkçe/İngilizce metinler, çeviri yardımcıları, rehber metinleri
  core.js       Ortak durum, yardımcılar, geri al/yinele geçmişi
  sim.js        Simülasyon kuralları: bağlantı, hız, gecikme, Wi-Fi, STP, IP/DHCP, saldırılar, görevler, paketler
  actions.js    Yan panelden tetiklenen işlemler, kaydet/aç
  ui.js         Paneller, rehber, tuval çizimi, fare/klavye ve düğme işleyicileri
  app.js        Başlangıç
```

Betikler `index.html` içinde bu sırayla yüklenir ve ortak değişkenleri paylaşır; ek bir derleme aracı gerekmez. Yeni bir cihaz eklemek için `src/data.js` (DEV ve GRP), kuralları için `src/sim.js`, İngilizce metni için `src/i18n.js` dosyasına bakın.

## Katkı ve geri bildirim

Hata bulursan veya bir özellik istersen GitHub'da **Issues** bölümünden bildirebilirsin. Hata bildirirken kurduğun topolojiyi ve debug günlüğündeki mesajı yazarsan sorunu bulmak kolaylaşır. Katkılar için fork edip pull request açabilirsin.

## Lisans

MIT. Ayrıntılar `LICENSE` dosyasında.

---

Made by Nomad with Claude AI
https://github.com/nomadkm
