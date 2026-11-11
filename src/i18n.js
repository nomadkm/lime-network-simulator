// Language: Turkish/English strings, translation helpers and guide texts

let lang = "tr";
try {
  lang = localStorage.getItem("lang") || "tr";
} catch (e) {
}
;
const EN = {
  "⏸ Duraklat": "⏸ Pause",
  "▶ Çalıştır": "▶ Run",
  "📨 Paket Gönder": "📨 Send Packet",
  "📚 Rehber / Eğitim": "📚 Guide / Training",
  "🧹 Logu Temizle": "🧹 Clear Log",
  "🗑 Tümünü Sil": "🗑 Delete All",
  "↶ Geri Al": "↶ Undo",
  "↷ Yinele": "↷ Redo",
  "💾 Kaydet": "💾 Save",
  "📂 Aç": "📂 Open",
  "Yükleniyor...": "Loading...",
  "Sol/sağ tık sürükle: gez · Tekerlek: yakınlaştır": "Left/right drag: pan · Wheel: zoom",
  "Uç Cihazlar": "End Devices",
  "Ağ Cihazları": "Network Devices",
  "Kablosuz": "Wireless",
  "Sunucular": "Servers",
  "Güvenlik": "Security",
  "Servis Sağlayıcı (FTTx)": "Service Provider (FTTx)",
  "KABLOLAR": "CABLES",
  "ARAÇ": "TOOL",
  "Seç / Taşı": "Select / Move",
  "Bilgisayar": "Computer",
  "Dizüstü": "Laptop",
  "Akıllı Telefon": "Smartphone",
  "IoT Cihazı": "IoT Device",
  "DNS Sunucusu": "DNS Server",
  "DDoS Temizleme": "DDoS Scrubber",
  "Sunucu": "Server",
  "Düz (bakır)": "Straight (copper)",
  "Çapraz (bakır)": "Crossover (copper)",
  "Fiber optik": "Fiber optic",
  "Wi-Fi (kablosuz)": "Wi-Fi (wireless)",
  "Topoloji boş": "Topology is empty",
  "Soldan bir cihaz seçip tuvale tıklayarak ekleyin. Kablo seçip bir cihazdan diğerine sürükleyin.": "Pick a device on the left and click the canvas to add it. Pick a cable and drag from one device to another.",
  "🗑 Cihazı Sil": "🗑 Delete Device",
  "🗑 Sil": "🗑 Delete",
  "🔌 Kabloyu Çıkar": "🔌 Unplug Cable",
  "🔌 Kabloyu Tak": "🔌 Plug Cable",
  "🔄 IP Sıfırla": "🔄 Reset IP",
  "Botnet virüslü": "Botnet infected",
  "Tür:": "Type:",
  "Kategori:": "Category:",
  "Mesafe:": "Distance:",
  "Gecikme:": "Latency:",
  "Sinyal:": "Signal:",
  "Kanal:": "Channel:",
  "Ethernet hızı:": "Ethernet speed:",
  "Wi-Fi sürümü:": "Wi-Fi version:",
  "Kayıtlar": "Records",
  "Tür değiştir:": "Change type:",
  "Bağlantılar: ": "Connections: ",
  "Bu router’da Wi-Fi var": "This router has Wi-Fi",
  "STP (Spanning Tree) açık": "STP (Spanning Tree) enabled",
  "Ağ Elemanları": "Devices",
  "Kablolar": "Cables",
  "Protokoller": "Protocols",
  "Kullanım": "Usage",
  "Hakkında": "About",
  "🎯 Görevler": "🎯 Tasks",
  "Görevler": "Tasks",
  "🔧 Kablolama": "🔧 Cabling",
  "Simülasyon çalışıyor.": "Simulation running.",
  "Simülasyon duraklatıldı.": "Simulation paused.",
  "Kaynak cihaza tıklayın.": "Click the source device.",
  "Tüm topoloji temizlendi.": "Topology cleared.",
  "Geri alındı.": "Undone.",
  "Yinelendi.": "Redone.",
  "Topoloji kaydedildi (topoloji.lime.json).": "Topology saved (topoloji.lime.json).",
  "✘ Geçersiz topoloji dosyası.": "✘ Invalid topology file."
};
function tr(x) {
  if (lang != "en") return x;
  const k = x.trim();
  if (EN[k]) return x.replace(k, EN[k]);
  for (const p in EN) if (p.endsWith(" ") && x.startsWith(p)) return EN[p] + x.slice(p.length);
  for (const [re, rp] of RX) x = x.replace(re, rp);
  return x;
}
function trDom(r) {
  if (lang != "en") return;
  const w = document.createTreeWalker(r || document.body, NodeFilter.SHOW_TEXT);
  let n;
  while (n = w.nextNode()) {
    const v = tr(n.nodeValue);
    if (v !== n.nodeValue) n.nodeValue = v;
  }
}
const L = (a, b) => lang == "en" ? b : a;
const gd = (k, f) => lang == "en" && DE[k] ? DE[k][f == "d" ? 0 : 1] : DEV[k][f];
const DE = {
  pc: ["End-user computer. Gets an IP address and runs applications.", "STRAIGHT cable to a switch/hub/AP; CROSSOVER to a router or another PC."],
  laptop: ["Portable end device; connects by cable or Wi-Fi.", "STRAIGHT cable to a switch, CROSSOVER to a computer."],
  server: ["Provides services such as web, DNS, DHCP and FTP.", "STRAIGHT to a switch (or fiber); CROSSOVER to a router."],
  switch: ["Forwards frames only to the right port using a MAC table (OSI Layer 2). Supports VLAN and STP.", "STRAIGHT to end devices and routers; CROSSOVER to another switch or hub."],
  hub: ["Repeats incoming data to every port (Layer 1) and creates one collision domain.", "STRAIGHT to end devices; CROSSOVER to a switch or hub."],
  ap: ["Connects wireless clients to the wired network (802.11).", "CROSSOVER to a switch, STRAIGHT to a router. Pick a Wi-Fi standard for wireless clients."],
  router: ["Routes IP traffic between different networks (Layer 3). NAT, OSPF, RIP, BGP.", "STRAIGHT to a switch; CROSSOVER to a router/PC; FIBER for long distances. Wi-Fi is optional."],
  firewall: ["Filters traffic by rules, detects port scans and brute force, and blocks attackers.", "Place it between router and switch. STRAIGHT to a switch."],
  modem: ["Converts the ISP line (DSL/fiber) to Ethernet.", "STRAIGHT cable or FIBER to a router."],
  phone: ["Mobile device that joins over Wi-Fi. It has no cable port.", "Wi-Fi only: use the Wi-Fi tool and drag the smartphone to a transmitter (AP, Router, Modem, Mesh) within range."],
  iot: ["Low-power wireless devices such as sensors, smart plugs and cameras.", "Wi-Fi only: must be within range. Signal and speed drop with distance."],
  ddos: ["Analyzes traffic and discards botnet DDoS packets. Blocks the attacking IP after a while.", "Place it on the path in front of the server you want to protect. STRAIGHT to a switch, CROSSOVER to a router."],
  mesh: ["Covers a whole home as one Wi-Fi network using several nodes. Nodes link wirelessly (backhaul) or by cable and never interfere with each other.", "STRAIGHT cable or Wi-Fi to the router/modem; use the Wi-Fi tool to link other mesh nodes. Clients join over Wi-Fi."],
  dns: ["Translates domain names to IP addresses. Gives the server it is directly connected to the name of a popular website (google.com, youtube.com…).", "Connect directly to the server you want to name with a CROSSOVER (same group) or FIBER cable."],
  olt: ["Optical line terminal on the ISP side of an FTTx (GPON/EPON) network. Feeds the ONTs.", "All ports are FIBER only; copper is not accepted."],
  ont: ["Optical network terminal on the subscriber side; converts the fiber line to Ethernet.", "FIBER to the OLT; STRAIGHT cable to a router."]
};
const PE = { ARP: "Resolves IP to MAC.", ICMP: "Ping; reachability test.", IP: "Addressing and routing.", TCP: "Reliable, connection-oriented transport.", UDP: "Fast, connectionless transport.", DHCP: "Automatic IP assignment.", DNS: "Name-to-IP resolution.", HTTP: "The web (HTTPS is encrypted).", FTP: "File transfer.", SSH: "Secure remote management.", Telnet: "Unencrypted remote management.", SMTP: "Email delivery.", STP: "Prevents switch loops.", VLAN: "Logical network separation (802.1Q).", NAT: "Private-to-public IP translation.", OSPF: "Link-state interior routing.", RIP: "Distance-vector routing.", BGP: "Internet-scale routing." };
const GE = {
  cab: "<h4>Straight cable (copper)</h4>Connects devices of different types: PC↔Switch, Router↔Switch.<h4>Crossover cable (copper)</h4>Connects devices of the same type: PC↔PC, Switch↔Switch, Router↔Router.<h4>Fiber optic</h4>Light-based, faster and longer range. Only for devices with a fiber port (Switch, Router, Server, Firewall, Modem, OLT, ONT, DNS, DDoS scrubber).<h4>Category and speed</h4>Cat5 100 Mbps, Cat5e 1 Gbps, Cat6 1 Gbps (10 Gbps up to 55 m), Cat6a 10 Gbps. Copper reaches 100 m at most; speed drops after 50 m and the link fails beyond 100 m. Multimode fiber reaches 300 m, single-mode much farther. Real speed is the lowest of the cable, the distance and both device ports. Scale: 1 pixel = 0.25 m. An OLT accepts fiber only. Two devices can share only one cable.<h4>Rule summary</h4><code>DTE</code>: PC, Laptop, Server, Router, Firewall, OLT, DDoS scrubber, DNS · <code>DCE</code>: Switch, Hub, AP, Modem, ONT, Mesh. Same group → crossover, different group → straight.<h4>Wi-Fi</h4>Use the Wi-Fi tool to drag a client to an Access Point, Router, Modem or Mesh node. Signal fades with distance and the link fails out of range. 802.11b is slow (11 Mbps); ac/ax are fast. Select a transmitter to change its standard and channel. Router Wi-Fi is optional. Transmitters on close channels with overlapping range interfere (red circles); choose far-apart channels such as 1-6-11. Smartphones and IoT devices support Wi-Fi only.<h4>FTTx (OLT/ONT)</h4>OLT to ONT is fiber only. Run a straight cable from the ONT to a router.",
  use: "<h4>Getting started</h4>1) Pick a device on the left and click the canvas.<br>2) Pick a cable type and drag from one device to another.<br>3) ✔ means a valid link, ✘ a wrong one; data does not flow on wrong links.<br>4) Press “Send Packet”, then click the source and the destination.<br>5) If it fails, the debug log tells you why and the faulty cable blinks red.<br>6) Select a cable to unplug, plug in or delete it. <code>Delete</code> removes the selection, <code>Esc</code> cancels the tool, <code>Ctrl+Z</code> / <code>Ctrl+Y</code> undo and redo.<h4>IP, subnets and DHCP</h4>Select a device to edit its IP, prefix and gateway. Devices on different subnets need a router and, on both sides, a gateway set to that router’s IP. A router or server can be a DHCP server; tick “Get IP from DHCP” on a client to lease an address (169.254.x.x means no DHCP server was found).<h4>Attacks</h4>Select a computer, laptop, smartphone or IoT device and choose an attack: Botnet/DDoS (stop it with a DDoS scrubber), port scan and SSH brute force (stop them with a firewall), ARP spoofing (stop it with DAI on a switch). Blocked devices must reset their IP.<h4>Tasks</h4>Open Tasks for ready-made labs.<h4>Navigation</h4>Drag with the left or right mouse button to pan; scroll to zoom."
};
const RX = [
  [/Düz \(bakır\)/g, "Straight (copper)"],
  [/Çapraz \(bakır\)/g, "Crossover (copper)"],
  [/Fiber optik/g, "Fiber optic"],
  [/Wi-Fi \(kablosuz\)/g, "Wi-Fi (wireless)"],
  [/Kaynak: (.+) — şimdi hedef cihaza tıklayın\./, "Source: $1 — now click the destination device."],
  [/Kaynak ve hedef aynı\./, "Source and destination are the same."],
  [/Paket hedefe ulaşamıyor\. DEBUG:/, "The packet cannot reach its destination. DEBUG:"],
  [/(.+) ile (.+) arasında hiçbir kablo yolu yok\. Aradaki cihazları kabloyla bağlayın\./, "There is no cable path between $1 and $2. Connect the devices in between."],
  [/• (.+): kablo ÇIKARILMIŞ\. Kabloyu takın\./, "• $1: the cable is UNPLUGGED. Plug it back in."],
  [/Fiber: (.+) fiber portu desteklemiyor\./, "Fiber: $1 has no fiber port."],
  [/Aynı tür cihazlar \((.+)\) arasında DÜZ kablo çalışmaz; ÇAPRAZ gerekir\./, "Same-type devices ($1) cannot use a STRAIGHT cable; use a CROSSOVER."],
  [/Farklı tür cihazlar \((.+)\) arasında ÇAPRAZ kablo çalışmaz; DÜZ gerekir\./, "Different-type devices ($1) cannot use a CROSSOVER cable; use a STRAIGHT cable."],
  [/(.+) yalnızca FİBER ile çalışır; bakır kablo takılamaz\./, "$1 only works with FIBER; copper cannot be used."],
  [/Kablo mesafesi (\d+) m; (.+) en fazla (\d+) m destekler\./, "Cable length is $1 m; $2 supports at most $3 m."],
  [/(.+) yalnızca Wi-Fi destekler; kablo takılamaz\./, "$1 supports Wi-Fi only; no cable can be attached."],
  [/Wi-Fi yalnızca Wi-Fi vericisi \(Access Point, Router, Modem\) ile kablosuz destekli cihaz \(dizüstü, telefon, IoT\) arasında kurulur\./, "Wi-Fi only connects a transmitter (Access Point, Router, Modem, Mesh) to a wireless client (laptop, smartphone, IoT)."],
  [/(.+), (.+) \((.+)\) menzili dışında; cihazı yaklaştırın veya daha uzun menzilli standart seçin\./, "$1 is out of range of $2 ($3); move it closer or choose a longer-range standard."],
  [/İki Wi-Fi vericisi yalnızca mesh düğümü aracılığıyla kablosuz bağlanabilir\./, "Two Wi-Fi transmitters can only link wirelessly through a mesh node."],
  [/Mesh düğümleri birbirinin menzili dışında; yaklaştırın\./, "Mesh nodes are out of each other’s range; move them closer."],
  [/ eklendi\./, " added."],
  [/ bağlandı\./, " connected."],
  [/✔ Doğru bağlantı\./, "✔ Valid connection."],
  [/✘ YANLIŞ:/, "✘ WRONG:"],
  [/✔ Doğru bağlantı/, "✔ Valid connection"],
  [/✘ Yanlış:/, "✘ Wrong:"],
  [/✘ (.+) ve (.+) zaten bir kabloyla bağlı\. Önce mevcut kabloyu silin veya türünü değiştirin\./, "✘ $1 and $2 are already connected by a cable. Delete it or change its type first."],
  [/Kablo takıldı:/, "Cable plugged in:"],
  [/Kablo çıkarıldı:/, "Cable unplugged:"],
  [/Paket yolda düştü: kablo değişti\/çıkarıldı\./, "Packet dropped in transit: the cable was changed or unplugged."],
  [/\(yanıt\)/, "(reply)"],
  [/→ (.+?) ulaştı/, "arrived at $1"],
  [/Tamamlandı: yanıt kaynağa döndü\./, "Done: the reply returned to the source."],
  [/Yol hızı \(darboğaz\):/, "Path speed (bottleneck):"],
  [/Tahmini RTT:/, "Estimated RTT:"],
  [/paket kaybı: %([\d.]+)/, "packet loss: $1%"],
  [/Paket kaybı: (.+) bağlantısında paket kayboldu \(%(\d+)\)\./, "Packet loss: a packet was lost on $1 ($2%)."],
  [/Broadcast fırtınası: (.+) paketi düşürdü\./, "Broadcast storm: $1 dropped the packet."],
  [/STP: switch döngüsü tespit edildi, (\d+) yedek bağlantı bloklandı\./, "STP: switch loop detected, $1 redundant link(s) blocked."],
  [/Switch döngüsü var ve STP kapalı: broadcast fırtınası! STP’yi açın veya döngüyü kaldırın\./, "Switch loop with STP off: broadcast storm! Enable STP or remove the loop."],
  [/(.+): STP açıldı\./, "$1: STP enabled."],
  [/(.+): STP kapatıldı\./, "$1: STP disabled."],
  [/DDoS temizleme: (.+) \((.+)\) saldırı paketi çöpe atıldı/, "DDoS scrubber: attack packet from $1 ($2) discarded"],
  [/(\S+) bloklandı! (.+) IP’sini sıfırlamalı\./, "$1 was blocked! $2 must reset its IP."],
  [/DDoS temizleme: (.+) bloklu, paket atıldı\. IP’yi sıfırlayın\./, "DDoS scrubber: $1 is blocked, packet dropped. Reset the IP."],
  [/Firewall: (.+) saldırı paketini düşürdü\./, "Firewall: dropped an attack packet from $1."],
  [/(.+) DDoS altında çöktü! DDoS temizleme sunucusu ekleyin\./, "$1 crashed under DDoS! Add a DDoS scrubber."],
  [/✘ (.+) aşırı yüklü, yanıt vermiyor \(DDoS\)\./, "✘ $1 is overloaded and not responding (DDoS)."],
  [/(.+) toparlandı\./, "$1 recovered."],
  [/IP sıfırlandı:/, "IP reset:"],
  [/DNS: (.+) \((.+)\) için (.+) kaydı oluşturuldu\./, "DNS: record $3 created for $1 ($2)."],
  [/DNS bağlantısı koptu: (.+) artık çözümlenmiyor\./, "DNS link lost: $1 can no longer be resolved."],
  [/(.+): Wi-Fi açıldı\./, "$1: Wi-Fi turned on."],
  [/(.+): Wi-Fi kapatıldı\./, "$1: Wi-Fi turned off."],
  [/(.+): kanal (\d+) seçildi\./, "$1: channel $2 selected."],
  [/ ⚠ Çakışma var\./, " ⚠ Channel conflict."],
  [/(.+): (.+) seçildi \(menzil (\d+)px\)\./, "$1: $2 selected (range $3 px)."],
  [/(.+): Ethernet (.+) yapıldı\./, "$1: Ethernet set to $2."],
  [/(.+): Wi-Fi sürümü (.+) yapıldı\./, "$1: Wi-Fi version set to $2."],
  [/Topoloji açıldı:/, "Topology opened:"],
  [/Hız:/g, "Speed:"],
  [/Paket kaybı:/g, "Packet loss:"],
  [/Takılı/, "Plugged in"],
  [/Çıkarılmış/, "Unplugged"],
  [/Durum:/, "Status:"],
  [/Fiber: destekler ✔/, "Fiber: supported ✔"],
  [/Fiber: desteklemez ✘/, "Fiber: not supported ✘"],
  [/Maks\. port:/, "Max port:"],
  [/Bağlantılar:/, "Connections:"],
  [/Yeni standart menzili ve hızı değiştirir\./, ""],
  [/⚠ Kanal çakışması var \(kırmızı çember\)/, "⚠ Channel conflict (red circle)"],
  [/Yakın kanaldaki vericiler birbirine parazit yapar; 1-6-11 idealdir\. 802\.11ac 5 GHz’dir\./, "Transmitters on close channels interfere; 1-6-11 is ideal. 802.11ac is 5 GHz."],
  [/⚠ Parazit: %(\d+) — kanalı değiştirin\./, "⚠ Interference: $1% — change the channel."],
  [/⛔ IP bloklandı \(DDoS\)/, "⛔ IP blocked"],
  [/Henüz kayıt yok\. Bir sunucuya doğrudan kablo bağlayın\./, "No records yet. Connect a cable directly to a server."],
  [/Wi-Fi standardı/, "Wi-Fi standard"],
  [/Alan adı:/, "Domain name:"]
];
