// Simulation rules: links, speed, latency, Wi-Fi, STP, IP/DHCP, attacks, tasks, packets and the main loop

const apOf = (l) => hasWf(dv(l.a)) ? dv(l.a) : dv(l.b);
function sig(l) {
  const a = dv(l.a), b = dv(l.b);
  return 1 - Math.hypot(a.x - b.x, a.y - b.y) / STD[apOf(l).std || "n"].r;
}
const hasWf = (d) => DEV[d.type].wf && (d.type != "router" || d.wifi);
const band = (d) => d.std == "ac" ? 5 : 2.4;
function conf(d) {
  return devs.some((o) => o != d && hasWf(o) && band(o) == band(d) && !(o.type == "mesh" && d.type == "mesh") && Math.abs(o.ch - d.ch) < 5 && Math.hypot(o.x - d.x, o.y - d.y) < STD[o.std || "n"].r + STD[d.std || "n"].r);
}
function intf(l) {
  const ap = apOf(l), a = dv(l.a), b = dv(l.b), c = ap == a ? b : a;
  let I = 0;
  for (const o of devs) {
    if (o == ap || o.type == "mesh" && ap.type == "mesh" || !hasWf(o) || band(o) != band(ap)) continue;
    const df = Math.abs(o.ch - ap.ch);
    if (df >= 5) continue;
    I += (1 - df / 5) * Math.max(0, 1 - Math.hypot(o.x - c.x, o.y - c.y) / STD[o.std || "n"].r);
  }
  return I;
}
const port = (d) => d.eth || DEV[d.type].mx;
function dnsSync() {
  for (const s of devs) {
    if (s.type != "server") continue;
    const c = links.some((l) => {
      if (!l.plugged || l.a != s.id && l.b != s.id) return 0;
      const o = dv(l.a == s.id ? l.b : l.a);
      return o.type == "dns" && chk(l)[0];
    });
    if (c && !s.site) {
      const fr = SITES.filter((x) => !devs.some((d) => d.site == x));
      s.site = fr.length ? fr[Math.floor(Math.random() * fr.length)] : "site" + s.id + ".com";
      log(`🌐 DNS: ${s.name} (${s.ip}) için ${s.site} kaydı oluşturuldu.`, "ok");
      if (sel) panel();
    } else if (!c && s.site) {
      log(`🌐 DNS bağlantısı koptu: ${s.site} artık çözümlenmiyor.`, "wr");
      s.site = null;
      if (sel) panel();
    }
  }
}
const dm = (l) => {
  const a = dv(l.a), b = dv(l.b);
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 0.25);
};
const catOf = (l) => l.cat || (l.cable == "fiber" ? "sm" : "5e");
const fmt = (v) => v >= 1e3 ? +(v / 1e3).toFixed(1) + " Gbps" : v + " Mbps";
function mbps(l) {
  if (l.cable == "wifi") {
    const a2 = dv(l.a), b2 = dv(l.b), ap = apOf(l), cl = ap == a2 ? b2 : a2, sa = STD[ap.std || "n"].v, sc = hasWf(cl) ? STD[cl.std || "n"].v : STD[cl.wstd || "n"].v;
    return Math.round(Math.min(sa, sc) * (0.3 + 0.7 * Math.max(0, sig(l))) / (1 + 1.5 * intf(l)));
  }
  ;
  const a = dv(l.a), b = dv(l.b), d = dm(l), c = CAT[catOf(l)];
  let v = c.v;
  if (catOf(l) == "6") v = d <= 55 ? 1e4 : 1e3;
  v *= 1 - 0.5 * Math.max(0, (d - c.m / 2) / (c.m / 2));
  return Math.round(Math.min(v, port(a), port(b)));
}
const spd = (l) => Math.min(1, Math.max(0.03, 0.012 * Math.sqrt(mbps(l))));
function newIP() {
  let ip;
  do
    ip = `192.168.1.${2 + Math.floor(Math.random() * 253)}`;
  while (devs.some((d) => d.ip == ip));
  return ip;
}
function chk(l) {
  const a = dv(l.a), b = dv(l.b), A = DEV[a.type], B = DEV[b.type];
  if (l.cable == "wifi" && hasWf(a) && hasWf(b)) {
    if (a.type != "mesh" && b.type != "mesh") return [0, "İki Wi-Fi vericisi yalnızca mesh düğümü aracılığıyla kablosuz bağlanabilir."];
    if (sig(l) <= 0) return [0, "Mesh düğümleri birbirinin menzili dışında; yaklaştırın."];
    return [1, ""];
  }
  if (l.cable == "wifi") {
    const ap = hasWf(a) ? a : b, cl = ap == a ? b : a;
    if (!hasWf(ap) || !DEV[cl.type].w) return [0, "Wi-Fi yalnızca Wi-Fi vericisi (Access Point, Router, Modem) ile kablosuz destekli cihaz (dizüstü, telefon, IoT) arasında kurulur."];
    if (sig(l) <= 0) return [0, `${cl.name}, ${ap.name} (${STD[ap.std || "n"].n}) menzili dışında; cihazı yaklaştırın veya daha uzun menzilli standart seçin.`];
    return [1, ""];
  }
  if (A.fo || B.fo) {
    if (l.cable != "fiber") return [0, `${A.fo ? a.name : b.name} yalnızca FİBER ile çalışır; bakır kablo takılamaz.`];
  }
  if (l.cable != "wifi") {
    const c = CAT[catOf(l)], d = dm(l);
    if (d > c.m) return [0, `Kablo mesafesi ${d} m; ${c.n} en fazla ${c.m} m destekler.`];
  }
  if (A.nw || B.nw) return [0, `${A.nw ? a.name : b.name} yalnızca Wi-Fi destekler; kablo takılamaz.`];
  if ((a.type == "olt" && b.type == "ont" || a.type == "ont" && b.type == "olt") && l.cable != "fiber") return [0, "OLT–ONT arası yalnızca FİBER ile bağlanır."];
  if (l.cable == "fiber") {
    if (!A.f || !B.f) return [0, `Fiber: ${!A.f ? a.name : b.name} fiber portu desteklemiyor.`];
    return [1, ""];
  }
  if (l.cable == "straight" && A.dte == B.dte) return [0, `Aynı tür cihazlar (${a.name}–${b.name}) arasında DÜZ kablo çalışmaz; ÇAPRAZ gerekir.`];
  if (l.cable == "cross" && A.dte != B.dte) return [0, `Farklı tür cihazlar (${a.name}–${b.name}) arasında ÇAPRAZ kablo çalışmaz; DÜZ gerekir.`];
  return [1, ""];
}
function name(t) {
  return tr(DEV[t].n) + (devs.filter((d) => d.type == t).length + 1);
}
function place(p) {
  snap();
  const t = tool.slice(4);
  devs.push({ id: nid++, type: t, x: p.x, y: p.y, name: name(t), ip: DEV[t].ip ? newIP() : null, std: DEV[t].wf ? t == "mesh" ? "ax" : "n" : null, ch: DEV[t].wf ? [1, 6, 11][Math.floor(Math.random() * 3)] : null });
  log(tr(DEV[t].n) + " eklendi.");
  tool = "sel";
  pal();
  sel = { k: "d", id: devs.at(-1).id };
  panel();
}
function flood() {
  const sv = devs.filter((d) => d.type == "server");
  for (const d of devs) if (d.bot) for (let k = 0; k < 2; k++) {
    const t = sv[Math.floor(Math.random() * sv.length)];
    if (!t) return;
    const r = route(d.id, t.id, 0);
    if (r) pk.push({ p: r.p, l: r.ls, i: 0, t: 0, w: k * 120, proto: "DDoS", rep: 0, flood: 1 });
  }
}
function hook(p, b) {
  const s = dv(p.p[0]), lq = lk(p.l[p.i]);
  if (!p.flood && lq && Math.random() < lossP(lq)) {
    log(`📉 Paket kaybı: ${dv(p.p[p.i]).name}–${b.name} bağlantısında paket kayboldu (%${Math.round(lossP(lq) * 100)}).`, "er");
    return 1;
  }
  if (p.atk) {
    const fin = p.i == p.l.length - 1, nm = s.name;
    if (s.blk && (b.type == "firewall" || b.type == "ddos")) {
      log(L(`🧱 ${b.name}: ${s.ip} bloklu, paket atıldı.`, `🧱 ${b.name}: ${s.ip} is blocked, packet dropped.`), "wr");
      return 1;
    }
    if (b.type == "firewall" && p.atk != "arp") {
      const th = p.atk == "scan" ? 3 : 5;
      s.fh = (s.fh || 0) + 1;
      log(L(`🧱 ${b.name}: ${p.atk == "scan" ? "port taraması" : "SSH kaba kuvvet denemesi"} tespit edildi (${s.fh}/${th}).`, `🧱 ${b.name}: ${p.atk == "scan" ? "port scan" : "SSH brute-force attempt"} detected (${s.fh}/${th}).`), "wr");
      if (s.fh >= th) {
        s.blk = 1;
        log(L(`⛔ ${s.ip} firewall tarafından bloklandı. ${nm} IP’sini sıfırlamalı.`, `⛔ ${s.ip} was blocked by the firewall. ${nm} must reset its IP.`), "er");
        if (sel && sel.id == s.id) panel();
      }
      return 1;
    }
    if (b.type == "switch" && b.dai && p.atk == "arp") {
      s.daiHit = 1;
      log(L(`🛡 ${b.name}: ARP koruması (DAI) ${nm} cihazının sahte ARP’sini engelledi.`, `🛡 ${b.name}: ARP protection (DAI) blocked the spoofed ARP from ${nm}.`), "ok");
      return 1;
    }
    if (fin) {
      if (p.atk == "scan") {
        if (!b.exposed) log(L(`🔍 Port taraması: ${b.name} üzerinde açık portlar bulundu (22, 80, 443).`, `🔍 Port scan: open ports found on ${b.name} (22, 80, 443).`), "er");
        b.exposed = 1;
      } else if (p.atk == "brute") {
        b.bf = (b.bf || 0) + 1;
        if (b.bf >= 6 && !b.owned) {
          b.owned = 1;
          log(L(`🔓 SSH kaba kuvvet başarılı: ${b.name} ele geçirildi!`, `🔓 SSH brute force succeeded: ${b.name} was compromised!`), "er");
        }
      } else if (p.atk == "arp") {
        if (!b.mitm) log(L(`🕵 ARP zehirleme: ${b.name} trafiği ${nm} üzerinden dinleniyor.`, `🕵 ARP spoofing: ${b.name}’s traffic is being intercepted by ${nm}.`), "er");
        b.mitm = 1;
      }
    }
    return 0;
  }
  if (b.type == "server" && b.owned && !p.flood) {
    log(L(`✘ ${b.name} ele geçirilmiş, güvenilir yanıt vermiyor.`, `✘ ${b.name} is compromised and not responding reliably.`), "er");
    return 1;
  }
  if (b.storm && !p.flood && Math.random() < 0.7) {
    log(`🌪 Broadcast fırtınası: ${b.name} paketi düşürdü.`, "er");
    return 1;
  }
  if (b.type == "ddos") {
    if (s.blk) {
      log(`🧹 DDoS temizleme: ${s.ip} bloklu, paket atıldı. IP’yi sıfırlayın.`, "er");
      return 1;
    }
    if (p.flood && !p.atk) {
      s.hits = (s.hits || 0) + 1;
      log(`🧹 DDoS temizleme: ${s.name} (${s.ip}) saldırı paketi çöpe atıldı (${s.hits}/6)`, "wr");
      if (s.hits >= 6) {
        s.blk = 1;
        log(`⛔ ${s.ip} bloklandı! ${s.name} IP’sini sıfırlamalı.`, "er");
        if (sel && sel.id == s.id) panel();
      }
      return 1;
    }
  }
  if (b.type == "firewall" && p.flood && !p.atk && Math.random() < 0.6) {
    log(`🧱 Firewall: ${s.ip} saldırı paketini düşürdü.`, "wr");
    return 1;
  }
  if (b.type == "server") {
    if (p.flood && !p.atk) {
      b.load = (b.load || 0) + 1;
      if (b.load >= 8 && !b.down) {
        b.down = 1;
        log(`💥 ${b.name} DDoS altında çöktü! DDoS temizleme sunucusu ekleyin.`, "er");
      }
    } else if (b.load >= 8) {
      log(`✘ ${b.name} aşırı yüklü, yanıt vermiyor (DDoS).`, "er");
      return 1;
    }
  }
  return 0;
}
const nodeDelay = (d) => d.storm ? 80 : { router: 0.3, firewall: 0.4, ddos: 0.5, switch: 0.1, hub: 0.05, dns: 0.2, server: 0.2 }[d.type] || 0.05;
function lat(l) {
  if (l.cable == "wifi") {
    const a = apOf(l);
    return 2 + (1 - Math.max(0, sig(l))) * 20 + intf(l) * 15 + ({ b: 6, g: 3, n: 1, ac: 0.5, ax: 0.3 }[a.std || "n"] || 1);
  }
  return (l.cable == "fiber" ? 0.2 : 0.5) + dm(l) * 5e-3;
}
function lossP(l) {
  if (l.cable == "wifi") return Math.min(0.6, Math.pow(1 - Math.max(0, sig(l)), 2) * 0.3 + intf(l) * 0.2);
  return catOf(l) != "sm" && catOf(l) != "mm" && dm(l) > 80 ? 0.03 : 0;
}
function stp() {
  const ok = (l) => l.plugged && chk(l)[0] && dv(l.a).type == "switch" && dv(l.b).type == "switch", E = links.filter(ok), seen = {};
  links.forEach((l) => l.stpBlk = 0);
  devs.forEach((d) => d.storm = 0);
  for (const r of devs.filter((d) => d.type == "switch")) {
    if (seen[r.id]) continue;
    const c = [r.id];
    seen[r.id] = 1;
    for (let i = 0; i < c.length; i++) for (const l of E) {
      const o = l.a == c[i] ? l.b : l.b == c[i] ? l.a : null;
      if (o !== null && !seen[o]) {
        seen[o] = 1;
        c.push(o);
      }
    }
    const ce = E.filter((l) => c.includes(l.a));
    if (ce.length < c.length) continue;
    if (c.every((id) => dv(id).stp !== 0)) {
      const root = Math.min(...c), tree = {}, q = [root], vis = { [root]: 1 };
      while (q.length) {
        const u = q.shift();
        for (const l of ce) {
          const v = l.a == u ? l.b : l.b == u ? l.a : null;
          if (v !== null && !vis[v]) {
            vis[v] = 1;
            tree[l.id] = 1;
            q.push(v);
          }
        }
      }
      ce.forEach((l) => {
        if (!tree[l.id]) l.stpBlk = 1;
      });
    } else c.forEach((id) => dv(id).storm = 1);
  }
  const sg = links.filter((l) => l.stpBlk).map((l) => l.id).join() + "|" + devs.filter((d) => d.storm).map((d) => d.id).join();
  if (sg != stpSig) {
    stpSig = sg;
    const nb = links.filter((l) => l.stpBlk).length, ns = devs.filter((d) => d.storm).length;
    if (nb) log(`🌲 STP: switch döngüsü tespit edildi, ${nb} yedek bağlantı bloklandı.`, "ok");
    if (ns) log("🌪 Switch döngüsü var ve STP kapalı: broadcast fırtınası! STP’yi açın veya döngüyü kaldırın.", "er");
  }
}
const has = (t) => devs.some((d) => d.atk == t);
const ip2n = (ip) => ip.split(".").reduce((a, x) => (a << 8 | +x) >>> 0, 0), mk = (p) => p ? 4294967295 << 32 - p >>> 0 : 0, netOf = (ip, p) => (ip2n(ip) & mk(p || 24)) >>> 0, okIp = (ip) => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && ip.split(".").every((x) => +x <= 255);
function ipCheck(A, B, r) {
  if (!A.ip || !B.ip) return "";
  const du = devs.find((d) => d != A && d.ip == A.ip) || devs.find((d) => d != B && d.ip == B.ip);
  if (du) return L(`IP çakışması: ${du.ip} birden fazla cihazda kullanılıyor.`, `IP conflict: ${du.ip} is used by more than one device.`);
  for (const X of [A, B]) if (X.ip.startsWith("169.254.")) return L(`${X.name} DHCP’den IP alamadı (APIPA ${X.ip}).`, `${X.name} could not get an IP from DHCP (APIPA ${X.ip}).`);
  const ra = netOf(A.ip, A.pl) != netOf(B.ip, A.pl), rb = netOf(B.ip, B.pl) != netOf(A.ip, B.pl);
  if (!ra && !rb) return "";
  const mm = (A.pl || 24) != (B.pl || 24) ? L(" (Önek uzunlukları farklı: bir taraf diğerini yerel sayıyor; iki tarafta da aynı /öneki kullanın.)", " (Prefix lengths differ: one side treats the other as local; use the same /prefix on both.)") : "";
  const info0 = L(`Farklı alt ağlar: ${A.name} ${A.ip}/${A.pl || 24}, ${B.name} ${B.ip}/${B.pl || 24}.`, `Different subnets: ${A.name} ${A.ip}/${A.pl || 24}, ${B.name} ${B.ip}/${B.pl || 24}.`);
  const info = info0 + mm;
  for (const X of [A, B]) {
    if (!(X == A ? ra : rb)) continue;
    if (!X.gw) return info + " " + L(`${X.name} için ağ geçidi (gateway) tanımlı değil.`, `${X.name} has no default gateway.`);
    const g = devs.find((d) => d.type == "router" && d.ip == X.gw);
    if (!g) return info + " " + L(`${X.name}: ağ geçidi ${X.gw} hiçbir router’a ait değil.`, `${X.name}: gateway ${X.gw} does not belong to any router.`);
    if (!r.p.includes(g.id)) return info + " " + L(`Paket ağ geçidi ${g.name} üzerinden geçmiyor; yolu ona bağlayın.`, `The packet does not pass through gateway ${g.name}; connect the path through it.`);
  }
  return "";
}
function dhcpSync() {
  for (const c of devs) {
    if (!c.dhcp) continue;
    const sv = devs.filter((d) => d.dhsrv && d != c).map((d) => ({ d, r: route(c.id, d.id, 0) })).find((x) => x.r && x.r.p.slice(1, -1).every((id) => dv(id).type != "router"));
    if (sv) {
      const S = sv.d;
      if (c.lease != S.id) {
        const pre = S.ip.split(".").slice(0, 3).join(".");
        let ip;
        do
          ip = pre + "." + (100 + Math.floor(Math.random() * 100));
        while (devs.some((d) => d.ip == ip));
        c.ip = ip;
        c.pl = S.pl || 24;
        c.gw = S.type == "router" ? S.ip : "";
        c.lease = S.id;
        log(L(`📡 DHCP: ${S.name}, ${c.name} cihazına ${ip}/${c.pl} adresini verdi.`, `📡 DHCP: ${S.name} leased ${ip}/${c.pl} to ${c.name}.`), "ok");
        if (sel) panel();
      }
    } else if (c.lease !== 0) {
      c.lease = 0;
      c.ip = "169.254." + (1 + Math.floor(Math.random() * 254)) + "." + (1 + Math.floor(Math.random() * 254));
      c.pl = 16;
      c.gw = "";
      log(L(`📡 DHCP sunucusu bulunamadı: ${c.name} APIPA adresi aldı (${c.ip}).`, `📡 No DHCP server found: ${c.name} got an APIPA address (${c.ip}).`), "er");
      if (sel) panel();
    }
  }
}
function attack() {
  for (const d of devs) {
    if (!d.atk || d.atk == "ddos") continue;
    const tg = devs.filter((x) => x != d && x.ip && (d.atk == "arp" ? x.type != "router" : x.type == "server")), t = tg[Math.floor(Math.random() * tg.length)];
    if (!t) continue;
    const r = route(d.id, t.id, 0);
    if (!r) continue;
    if (d.atk == "arp" && !r.p.slice(1, -1).every((id) => dv(id).type != "router")) continue;
    pk.push({ p: r.p, l: r.ls, i: 0, t: 0, w: 0, proto: d.atk == "scan" ? "SCAN" : d.atk == "arp" ? "ARP-SPOOF" : "SSH-BRUTE", rep: 0, flood: 1, atk: d.atk });
  }
}
const rt = (a, b, f) => {
  const r = route(a.id, b.id, 0);
  return r && f(r) ? r : 0;
};
const TASKS = [
  { id: "t1", n: ["İlk Ağım", "My First Network"], d: ["2 bilgisayarı bir switch’e doğru kabloyla bağlayın; aralarında yol olsun.", "Connect 2 computers to a switch with the right cables so a path exists between them."], c: () => {
    const p = devs.filter((d) => d.type == "pc" || d.type == "laptop");
    return p.some((a) => p.some((b) => a != b && rt(a, b, (r) => r.p.some((i) => dv(i).type == "switch"))));
  } },
  { id: "t2", n: ["Alt Ağlar", "Subnets"], d: ["Farklı alt ağlardaki iki cihazı bir router üzerinden konuşturun: IP ve ağ geçitlerini ayarlayın, sonra paket gönderin.", "Make two devices on different subnets talk through a router: set IPs and gateways, then send a packet."], c: () => {
    const p = devs.filter((d) => ["pc", "laptop", "server"].includes(d.type));
    return p.some((a) => p.some((b) => a != b && netOf(a.ip, a.pl) != netOf(b.ip, a.pl) && rt(a, b, (r) => r.p.some((i) => dv(i).type == "router") && !ipCheck(a, b, r))));
  } },
  { id: "t3", n: ["DHCP", "DHCP"], d: ["Bir router’ı DHCP sunucusu yapın ve bir bilgisayarın IP’yi otomatik almasını sağlayın.", "Make a router a DHCP server and let a computer get its IP automatically."], c: () => devs.some((c) => c.dhcp && c.lease && dv(c.lease) && dv(c.lease).dhsrv) },
  { id: "t4", n: ["Wi-Fi Ağı", "Wi-Fi Network"], d: ["Bir access point’e en az %50 sinyalle 2 kablosuz cihaz bağlayın.", "Connect 2 wireless devices to one access point with at least 50% signal."], c: () => {
    const m = {};
    links.filter((l) => l.cable == "wifi" && l.plugged && chk(l)[0] && sig(l) >= 0.5).forEach((l) => m[apOf(l).id] = (m[apOf(l).id] || 0) + 1);
    return Object.values(m).some((n) => n >= 2);
  } },
  { id: "t5", n: ["Fiber Evi (FTTx)", "Fiber Home (FTTx)"], d: ["OLT’yi fiberle ONT’ye, ONT’yi router’a, router’a bir bilgisayar bağlayın; bilgisayardan OLT’ye yol olsun.", "Connect an OLT to an ONT with fiber, the ONT to a router and a computer to the router so the computer can reach the OLT."], c: () => devs.some((a) => a.type == "pc" && devs.some((o) => o.type == "olt" && rt(a, o, (r) => r.p.some((i) => dv(i).type == "ont") && r.p.some((i) => dv(i).type == "router")))) },
  { id: "t6", n: ["Döngüyü Kır (STP)", "Break the Loop (STP)"], d: ["3 switch ile döngü kurun ve STP’nin bir bağlantıyı bloklamasını sağlayın.", "Build a loop with 3 switches and let STP block one link."], c: () => links.some((l) => l.stpBlk) },
  { id: "t7", n: ["DDoS Savunması", "DDoS Defense"], d: ["Botnet/DDoS saldırgan bir cihazı DDoS temizleme sunucusuyla bloklatın.", "Get a Botnet/DDoS attacker blocked by a DDoS scrubber."], c: () => devs.some((d) => d.atk == "ddos" && d.blk) },
  { id: "t8", n: ["Port Taramayı Durdur", "Stop the Port Scan"], d: ["Port tarayan bir cihazı firewall ile bloklatın.", "Get a port-scanning device blocked by a firewall."], c: () => devs.some((d) => d.atk == "scan" && d.blk) },
  { id: "t9", n: ["ARP Zehirlemeyi Engelle", "Stop ARP Spoofing"], d: ["ARP zehirleme saldırısını bir switch’te ARP korumasıyla (DAI) engelleyin.", "Stop an ARP spoofing attack with ARP protection (DAI) on a switch."], c: () => devs.some((d) => d.atk == "arp" && d.daiHit) }
];
function chkTask(id) {
  const t = TASKS.find((x) => x.id == id);
  let ok = false;
  try {
    ok = t.c();
  } catch (e) {
  }
  if (ok) {
    done[id] = 1;
    try {
      localStorage.setItem("done", JSON.stringify(done));
    } catch (e) {
    }
    log(L("🎉 Görev tamamlandı: ", "🎉 Task completed: ") + t.n[lang == "en" ? 1 : 0], "ok");
  } else log(L("Görev henüz tamamlanmadı: ", "Task not completed yet: ") + t.n[lang == "en" ? 1 : 0], "wr");
  tab("ts");
}
function route(s, t, all) {
  const prev = { [s]: null }, q = [s];
  while (q.length) {
    const u = q.shift();
    if (u == t) break;
    for (const l of links) {
      if (!all && (!l.plugged || !chk(l)[0] || l.stpBlk)) continue;
      const v = l.a == u ? l.b : l.b == u ? l.a : null;
      if (v !== null && !(v in prev)) {
        prev[v] = [u, l.id];
        q.push(v);
      }
    }
  }
  if (!(t in prev)) return null;
  const p = [t], ls = [];
  let c = t;
  while (prev[c]) {
    ls.unshift(prev[c][1]);
    c = prev[c][0];
    p.unshift(c);
  }
  return { p, ls };
}
function send(s, t) {
  const proto = $("proto").value, A = dv(s), B = dv(t);
  bad = {};
  if (s == t) return log("Kaynak ve hedef aynı.", "er");
  log(`▶ ${proto}: ${A.name} → ${B.name}`, "in");
  const r = route(s, t, 0);
  if (r) {
    const er = ipCheck(A, B, r);
    if (er) {
      log("✘ " + er, "er");
      return;
    }
    if (A.mitm || B.mitm) log(L("🕵 Dikkat: bu trafik ARP zehirleme ile dinleniyor!", "🕵 Warning: this traffic is being intercepted by ARP spoofing!"), "er");
    const w = r.ls.map(lk).reduce((m, l) => mbps(l) < mbps(m) ? l : m);
    log(`  Yol hızı (darboğaz): ${fmt(mbps(w))} — ${dv(w.a).name}–${dv(w.b).name}`, "wr");
    const ow = r.ls.reduce((a, id) => a + lat(lk(id)), 0) + r.p.reduce((a, id) => a + nodeDelay(dv(id)), 0), lp = 1 - r.ls.reduce((a, id) => a * (1 - lossP(lk(id))), 1), rtt = 2 * ow;
    log(`  Tahmini RTT: ${rtt.toFixed(1)} ms · paket kaybı: %${(100 * (1 - Math.pow(1 - lp, 2))).toFixed(1)}`, "wr");
    pk.push({ p: r.p, l: r.ls, i: 0, t: 0, w: 0, proto, rep: 0, rtt });
    return;
  }
  const f = route(s, t, 1);
  log("✘ Paket hedefe ulaşamıyor. DEBUG:", "er");
  if (!f) {
    log(`  • ${A.name} ile ${B.name} arasında hiçbir kablo yolu yok. Aradaki cihazları kabloyla bağlayın.`, "er");
    return;
  }
  f.ls.forEach((id) => {
    const l = lk(id), [ok, r2] = chk(l);
    if (!l.plugged) {
      log(`  • ${dv(l.a).name}–${dv(l.b).name}: kablo ÇIKARILMIŞ. Kabloyu takın.`, "er");
      bad[id] = 1;
    }
    if (!ok) {
      log(`  • ${r2}`, "er");
      bad[id] = 1;
    }
  });
  setTimeout(() => bad = {}, 4e3);
}
function step(n) {
  dnsSync();
  stp();
  const dt = Math.min(50, n - last);
  last = n;
  if (running) {
    fl += dt;
    if (fl > 500) {
      fl = 0;
      flood();
    }
    at += dt;
    if (at > 1500) {
      at = 0;
      attack();
      dhcpSync();
    }
    for (const d of devs) {
      if (!has("brute")) {
        d.owned = 0;
        d.bf = 0;
      }
      if (!has("scan")) d.exposed = 0;
      if (!has("arp")) d.mitm = 0;
    }
    for (const d of devs) if (d.load > 0) {
      d.load = Math.max(0, d.load - dt * 6e-4);
      if (d.load < 2 && d.down) {
        d.down = 0;
        log(d.name + " toparlandı.", "ok");
      }
    }
  }
  if (running) for (const p of pk.slice()) {
    if (p.w > 0) {
      p.w -= dt;
      continue;
    }
    const l = lk(p.l[p.i]);
    if (!l || !l.plugged || !chk(l)[0] || l.stpBlk) {
      log("Paket yolda düştü: kablo değişti/çıkarıldı.", "er");
      pk.splice(pk.indexOf(p), 1);
      continue;
    }
    const a = dv(p.p[p.i]), b = dv(p.p[p.i + 1]);
    p.t += dt * spd(l) / Math.hypot(b.x - a.x, b.y - a.y || 1);
    if (p.t >= 1) {
      glow[b.id] = n;
      if (hook(p, b)) {
        pk.splice(pk.indexOf(p), 1);
        continue;
      }
      p.i++;
      p.t = 0;
      p.w = 280;
      if (!p.flood) log(`  ${p.proto}${p.rep ? " (yanıt)" : ""} → ${b.name} ulaştı (${CAB[l.cable].n})`, "ok");
      if (p.i >= p.l.length) {
        pk.splice(pk.indexOf(p), 1);
        if (p.flood) {
        } else if (!p.rep) {
          pk.push({ p: p.p.slice().reverse(), l: p.l.slice().reverse(), i: 0, t: 0, w: 300, proto: p.proto, rep: 1, rtt: p.rtt });
        } else log("✔ Tamamlandı: yanıt kaynağa döndü. RTT = " + (p.rtt || 0).toFixed(1) + " ms", "ok");
      }
    }
  }
  draw(n);
  requestAnimationFrame(step);
}
