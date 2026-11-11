// Actions triggered from the side panel and file operations

function setEth(v) {
  snap();
  const d = dv(sel.id);
  d.eth = +v;
  log(`${d.name}: Ethernet ${fmt(+v)} yapıldı.`, "wr");
  panel();
}
function setWs(v) {
  snap();
  const d = dv(sel.id);
  d.wstd = v;
  log(`${d.name}: Wi-Fi sürümü ${STD[v].n} yapıldı.`, "wr");
  panel();
}
function del() {
  if (!sel) return;
  snap();
  if (sel.k == "d") {
    const d = dv(sel.id);
    links = links.filter((l) => l.a != d.id && l.b != d.id);
    devs = devs.filter((x) => x != d);
    log(d.name + " silindi.", "wr");
  } else {
    links = links.filter((l) => l.id != sel.id);
    log("Kablo silindi.", "wr");
  }
  sel = null;
  panel();
}
function plug() {
  snap();
  const l = lk(sel.id);
  l.plugged = !l.plugged;
  log(`Kablo ${l.plugged ? "takıldı" : "çıkarıldı"}: ${dv(l.a).name}–${dv(l.b).name}`, "wr");
  panel();
}
function setCh(v) {
  snap();
  const d = dv(sel.id);
  d.ch = +v;
  log(`${d.name}: kanal ${v} seçildi.` + (conf(d) ? " ⚠ Çakışma var." : ""), conf(d) ? "er" : "wr");
  panel();
}
function wfx(v) {
  snap();
  const d = dv(sel.id);
  d.wifi = v ? 1 : 0;
  log(`${d.name}: Wi-Fi ${v ? "açıldı" : "kapatıldı"}.`, "wr");
  panel();
}
function setStd(v) {
  snap();
  const d = dv(sel.id);
  d.std = v;
  log(`${d.name}: ${STD[v].n} seçildi (menzil ${STD[v].r}px).`, "wr");
  panel();
}
function bot(v) {
  snap();
  const d = dv(sel.id);
  d.bot = v;
  log(`${d.name} ${v ? "botnet ile enfekte edildi (sunuculara DDoS gönderecek)." : "temizlendi."}`, v ? "er" : "ok");
  panel();
}
function rip() {
  snap();
  const d = dv(sel.id), o = d.ip;
  d.ip = newIP();
  d.blk = 0;
  d.hits = 0;
  d.fh = 0;
  log(`IP sıfırlandı: ${o} → ${d.ip}`, "ok");
  panel();
}
function saveTopo() {
  const b = new Blob([JSON.stringify({ app: "lime", v: 1, devs, links, nid })], { type: "application/json" }), a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = "topoloji.lime.json";
  a.click();
  log("Topoloji kaydedildi (topoloji.lime.json).", "ok");
}
function openTopo(f) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const o = JSON.parse(r.result), dd = o.devs.filter((d) => DEV[d.type]), ll = o.links.filter((l) => dd.some((d) => d.id == l.a) && dd.some((d) => d.id == l.b));
      snap();
      devs = dd;
      links = ll;
      nid = Math.max(o.nid || 0, ...dd.map((d) => d.id), ...ll.map((l) => l.id)) + 1;
      pk = [];
      sel = null;
      bad = {};
      log("Topoloji açıldı: " + f.name, "ok");
      panel();
    } catch (e) {
      log("✘ Geçersiz topoloji dosyası.", "er");
    }
  };
  r.readAsText(f);
}
function setStp(v) {
  const d = dv(sel.id);
  snap();
  d.stp = v ? 1 : 0;
  log(`${d.name}: STP ${v ? "açıldı" : "kapatıldı"}.`, "wr");
  panel();
}
function setIp(v) {
  const d = dv(sel.id);
  if (!okIp(v)) {
    log(L("✘ Geçersiz IP adresi.", "✘ Invalid IP address."), "er");
    return panel();
  }
  snap();
  d.ip = v;
  panel();
}
function setPl(v) {
  snap();
  dv(sel.id).pl = +v;
  panel();
}
function setGw(v) {
  const d = dv(sel.id);
  if (v && !okIp(v)) {
    log(L("✘ Geçersiz ağ geçidi.", "✘ Invalid gateway."), "er");
    return panel();
  }
  snap();
  d.gw = v;
  panel();
}
function setDh(v) {
  const d = dv(sel.id);
  snap();
  d.dhcp = v ? 1 : 0;
  d.lease = void 0;
  dhcpSync();
  panel();
}
function setDs(v) {
  const d = dv(sel.id);
  snap();
  d.dhsrv = v ? 1 : 0;
  log(L(`${d.name}: DHCP sunucusu ${v ? "açıldı" : "kapatıldı"}.`, `${d.name}: DHCP server ${v ? "enabled" : "disabled"}.`), "wr");
  dhcpSync();
  panel();
}
function setDai(v) {
  const d = dv(sel.id);
  snap();
  d.dai = v ? 1 : 0;
  log(L(`${d.name}: ARP koruması (DAI) ${v ? "açıldı" : "kapatıldı"}.`, `${d.name}: ARP protection (DAI) ${v ? "enabled" : "disabled"}.`), "wr");
  panel();
}
function setAtk(v) {
  const d = dv(sel.id);
  snap();
  d.atk = v;
  d.bot = v == "ddos" ? 1 : 0;
  d.blk = 0;
  d.hits = 0;
  d.fh = 0;
  d.daiHit = 0;
  log(v ? L(`${d.name} saldırgan yapıldı: ${v}.`, `${d.name} is now an attacker: ${v}.`) : L(`${d.name} saldırıyı bıraktı.`, `${d.name} stopped attacking.`), v ? "er" : "ok");
  panel();
}
function ct(k) {
  snap();
  const l = lk(sel.id);
  l.cable = k;
  l.cat = k == "fiber" ? "sm" : "5e";
  panel();
}
function setCat(v) {
  snap();
  lk(sel.id).cat = v;
  panel();
}
