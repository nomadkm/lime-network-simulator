// Interface: panels, guide, canvas drawing, mouse/keyboard and button handlers

function HW(d) {
  const I = DEV[d.type], st = 'style="background:#232c38;color:#fff;border:1px solid #2a3340;border-radius:6px;padding:4px"';
  let h = "";
  if (d.type == "pc" || d.type == "laptop") h += `Ethernet hızı: <select ${st} onchange="setEth(this.value)">${[100, 1e3, 2500, 1e4].map((v) => `<option value="${v}" ${(d.eth || 1e3) == v ? "selected" : ""}>${fmt(v)}</option>`).join("")}</select><br>`;
  if (I.w) h += `Wi-Fi sürümü: <select ${st} onchange="setWs(this.value)">${Object.keys(STD).map((k) => `<option value="${k}" ${(d.wstd || "n") == k ? "selected" : ""}>${STD[k].n}</option>`).join("")}</select><br>`;
  if (DEV[d.type].ip) {
    const dh = d.dhcp ? "disabled" : "", st2 = 'style="background:#232c38;color:#fff;border:1px solid #2a3340;border-radius:6px;padding:3px"';
    h += `IP: <input ${st2} size="13" value="${d.ip || ""}" ${dh} onchange="setIp(this.value)"> /<select ${st2} ${dh} onchange="setPl(this.value)">${[16, 24, 25, 26, 28, 30].map((p) => `<option ${(d.pl || 24) == p ? "selected" : ""}>${p}</option>`).join("")}</select><br>${L("Ağ geçidi", "Gateway")}: <input ${st2} size="13" value="${d.gw || ""}" ${dh} onchange="setGw(this.value)"><br>`;
    if (["pc", "laptop", "phone", "iot"].includes(d.type)) h += `<label><input type="checkbox" ${d.dhcp ? "checked" : ""} onchange="setDh(this.checked)"> ${L("DHCP’den IP al", "Get IP from DHCP")}</label><br>`;
    if (d.type == "router" || d.type == "server") h += `<label><input type="checkbox" ${d.dhsrv ? "checked" : ""} onchange="setDs(this.checked)"> ${L("DHCP sunucusu", "DHCP server")}</label><br>`;
  }
  if (d.type == "switch") h += `<label><input type="checkbox" ${d.stp !== 0 ? "checked" : ""} onchange="setStp(this.checked)"> STP (Spanning Tree) açık</label><br><label><input type="checkbox" ${d.dai ? "checked" : ""} onchange="setDai(this.checked)"> ${L("ARP koruması (DAI)", "ARP protection (DAI)")}</label><br>`;
  if (d.site) h += `🌐 Alan adı: <b>${d.site}</b>`;
  if (d.type == "dns") {
    const r = devs.filter((x) => x.site && links.some((l) => l.plugged && (l.a == x.id && l.b == d.id || l.b == x.id && l.a == d.id)));
    h += "<b>Kayıtlar</b><br>" + (r.length ? r.map((x) => x.site + " → " + x.ip).join("<br>") : "<small>Henüz kayıt yok. Bir sunucuya doğrudan kablo bağlayın.</small>");
  }
  return h ? `<div class="bx">${h}</div>` : "";
}
function log(m, c = "in") {
  const d = document.createElement("div");
  d.className = c;
  d.textContent = (/* @__PURE__ */ new Date()).toLocaleTimeString() + "  " + tr(m);
  $("log").append(d);
  $("log").scrollTop = 1e9;
}
function pal0() {
  let h = "";
  for (const g in GRP) {
    h += `<small>${g}</small>`;
    for (const k of GRP[g]) h += `<button data-t="${k}" class="${tool == "add:" + k ? "on" : ""}">${DEV[k].e} <span>${DEV[k].n}</span></button>`;
  }
  h += "<small>KABLOLAR</small>";
  for (const k in CAB) h += `<button data-t="${k}" class="${tool == k ? "on" : ""}">${k == "fiber" ? "💡" : k == "wifi" ? "📶" : "🔗"} <span>${CAB[k].n}</span></button>`;
  h += `<small>ARAÇ</small><button data-t="sel" class="${tool == "sel" ? "on" : ""}">🖱️ <span>Seç / Taşı</span></button>`;
  $("pal").innerHTML = h;
  $("pal").querySelectorAll("button").forEach((b) => b.onclick = () => {
    const t = b.dataset.t;
    tool = DEV[t] ? "add:" + t : t;
    pingSrc = null;
    $("ping").classList.remove("on");
    pal();
  });
}
function W(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left - view.x) / view.z, y: (e.clientY - r.top - view.y) / view.z };
}
const hitD = (p) => [...devs].reverse().find((d) => Math.abs(p.x - d.x) < 36 && Math.abs(p.y - d.y) < 30);
function hitL(p) {
  return links.find((l) => {
    const a = dv(l.a), b = dv(l.b), dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy) < 8 / view.z;
  });
}
cv.onmousedown = (e) => {
  const p = W(e), d = hitD(p);
  cur = p;
  if (e.button == 1 || e.button == 2) {
    drag = { k: "pan", sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
    e.preventDefault();
    return;
  }
  if (e.button) return;
  if (tool.startsWith("add:")) {
    drag = { k: "pan", sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, add: p };
    return;
  }
  if (pingSrc !== null || $("ping").classList.contains("on")) {
    if (!d) return;
    if (pingSrc === null) {
      pingSrc = d.id;
      log("Kaynak: " + d.name + " — şimdi hedef cihaza tıklayın.", "wr");
    } else {
      send(pingSrc, d.id);
      pingSrc = null;
      $("ping").classList.remove("on");
    }
    return;
  }
  if (CAB[tool]) {
    if (!d) {
      drag = { k: "pan", sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
      return;
    }
    if (pingSrc === null && !drag) {
      drag = { k: "cab", from: d.id };
    }
    return;
  }
  if (d) {
    sel = { k: "d", id: d.id };
    drag = { k: "dev", id: d.id, ox: p.x - d.x, oy: p.y - d.y };
  } else {
    const l = hitL(p);
    sel = l ? { k: "l", id: l.id } : null;
    if (!l) drag = { k: "pan", sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
  }
  panel();
};
cv.onmousemove = (e) => {
  cur = W(e);
  if (!drag) return;
  if (drag.k == "pan") {
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 4) drag.mv = 1;
    view.x = drag.vx + e.clientX - drag.sx;
    view.y = drag.vy + e.clientY - drag.sy;
  } else if (drag.k == "dev") {
    if (!drag.sd) {
      drag.sd = 1;
      snap();
    }
    const d = dv(drag.id);
    d.x = cur.x - drag.ox;
    d.y = cur.y - drag.oy;
  }
};
addEventListener("mouseup", (e) => {
  if (drag && drag.add && !drag.mv && tool.startsWith("add:")) place(drag.add);
  if (drag && drag.k == "cab") {
    const d = hitD(W(e));
    if (d && d.id != drag.from) {
      if (links.some((x) => x.a == drag.from && x.b == d.id || x.b == drag.from && x.a == d.id)) {
        log(`✘ ${dv(drag.from).name} ve ${d.name} zaten bir kabloyla bağlı. Önce mevcut kabloyu silin veya türünü değiştirin.`, "er");
        drag = null;
        return;
      }
      snap();
      const l = { id: nid++, a: drag.from, b: d.id, cable: tool, cat: tool == "fiber" ? "sm" : "5e", plugged: true };
      links.push(l);
      const [ok, r] = chk(l);
      log(`${dv(l.a).name} ⇄ ${d.name} (${CAB[tool].n}) bağlandı.` + (ok ? " ✔ Doğru bağlantı." : " ✘ YANLIŞ: " + r), ok ? "ok" : "er");
      sel = { k: "l", id: l.id };
      panel();
    }
  }
  drag = null;
});
cv.onwheel = (e) => {
  e.preventDefault();
  const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, z = Math.max(0.25, Math.min(3, view.z * (e.deltaY < 0 ? 1.1 : 0.9)));
  view.x = mx - (mx - view.x) * z / view.z;
  view.y = my - (my - view.y) * z / view.z;
  view.z = z;
};
cv.onauxclick = (e) => e.preventDefault();
cv.oncontextmenu = (e) => e.preventDefault();
addEventListener("keydown", (e) => {
  if (e.key == "Escape") {
    tool = "sel";
    pingSrc = null;
    pal();
  }
  if (e.key == "Delete") del();
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() == "z") {
    e.preventDefault();
    e.shiftKey ? doRedo() : doUndo();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() == "y") {
    e.preventDefault();
    doRedo();
  }
});
function panel0() {
  const s = $("side");
  if (!sel) {
    s.innerHTML = '<h3>Topoloji boş</h3><div class="r">Soldan bir cihaz seçip tuvale tıklayarak ekleyin. Kablo seçip bir cihazdan diğerine sürükleyin.</div>';
    return;
  }
  if (sel.k == "d") {
    const d = dv(sel.id), I = DEV[d.type], ls = links.filter((l) => l.a == d.id || l.b == d.id);
    s.innerHTML = `<h3>${I.e} ${d.name}</h3><div class="r">${I.n}${d.ip ? ' · <b style="color:#fff">' + d.ip + "</b>" : ""}</div>${hasWf(d) ? `<div class="bx">📶 Wi-Fi standardı<br><select onchange="setStd(this.value)" style="background:#232c38;color:#fff;border:1px solid #2a3340;border-radius:6px;padding:5px;width:100%">${Object.keys(STD).map((k) => `<option value="${k}" ${d.std == k ? "selected" : ""}>${STD[k].n} · ${STD[k].m}</option>`).join("")}</select><br>Kanal: <select onchange="setCh(this.value)" style="background:#232c38;color:#fff;border:1px solid #2a3340;border-radius:6px;padding:5px">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => `<option ${d.ch == k ? "selected" : ""}>${k}</option>`).join("")}</select>${conf(d) ? '<div class="er">⚠ Kanal çakışması var (kırmızı çember)</div>' : ""}<small>Yakın kanaldaki vericiler birbirine parazit yapar; 1-6-11 idealdir. 802.11ac 5 GHz’dir.</small></div>` : ""}${d.type == "router" ? `<div class="bx"><label><input type="checkbox" ${d.wifi ? "checked" : ""} onchange="wfx(this.checked)"> Bu router’da Wi-Fi var</label></div>` : ""}${false ? `` : ""}<div>${gd(d.type, "d")}</div>${HW(d)}${["pc", "laptop", "phone", "iot"].includes(d.type) ? `<div class="bx">🦠 ${L("Saldırı", "Attack")}: <select onchange="setAtk(this.value)" style="background:#232c38;color:#fff;border:1px solid #2a3340;border-radius:6px;padding:4px">${[["", L("Yok", "None")], ["ddos", "Botnet / DDoS"], ["scan", L("Port tarama", "Port scan")], ["arp", L("ARP zehirleme", "ARP spoofing")], ["brute", L("SSH kaba kuvvet", "SSH brute force")]].map(([k, n]) => `<option value="${k}" ${(d.atk || "") == k ? "selected" : ""}>${n}</option>`).join("")}</select>${d.blk ? '<div class="er">⛔ IP bloklandı (DDoS)</div>' : ""}<br><button onclick="rip()">🔄 IP Sıfırla</button></div>` : ""}<div class="bx"><b>🔧 Kablolama</b><br>${gd(d.type, "c")}<br><small>Fiber: ${I.f ? "destekler ✔" : "desteklemez ✘"}${I.mx ? " · Maks. port: " + fmt(I.mx) : ""}</small></div><div class="r">Bağlantılar: ${ls.length}</div><button onclick="del()">🗑 Cihazı Sil</button>`;
  } else {
    const l = lk(sel.id);
    if (!l) {
      sel = null;
      return panel();
    }
    const [ok, r] = chk(l);
    s.innerHTML = `<h3>${l.cable == "fiber" ? "💡" : "🔗"} Kablo</h3><div class="r">${dv(l.a).name} ⇄ ${dv(l.b).name}</div><div>Tür: <b>${CAB[l.cable].n}</b></div>${l.cable != "wifi" ? '<div>Kategori: <select onchange="setCat(this.value)" style="background:#232c38;color:#fff;border:1px solid #2a3340;border-radius:6px;padding:4px">' + (l.cable == "fiber" ? ["mm", "sm"] : ["5", "5e", "6", "6a"]).map((k) => `<option value="${k}" ${catOf(l) == k ? "selected" : ""}>${CAT[k].n}</option>`).join("") + "</select></div>" : ""}${ok ? "<div>Mesafe: <b>" + (l.cable == "wifi" ? Math.round(dm(l)) : dm(l)) + " m</b> · Hız: <b>" + fmt(mbps(l)) + "</b></div><div>Gecikme: <b>" + lat(l).toFixed(1) + " ms</b> · Paket kaybı: <b>%" + (lossP(l) * 100).toFixed(1) + "</b></div>" : ""}${l.cable == "wifi" && ok ? "<div>Sinyal: <b>" + Math.round(sig(l) * 100) + "%</b> · " + STD[apOf(l).std || "n"].m + "</div>" + (intf(l) > 0.05 ? '<div class="wr">⚠ Parazit: %' + Math.round(Math.min(1, intf(l)) * 100) + " — kanalı değiştirin.</div>" : "") : ""}<div class="${ok ? "ok" : "er"}">${ok ? "✔ Doğru bağlantı" : "✘ Yanlış: " + r}</div><div class="bx">Durum: ${l.plugged ? "Takılı" : "Çıkarılmış"}</div><button onclick="plug()">${l.plugged ? "🔌 Kabloyu Çıkar" : "🔌 Kabloyu Tak"}</button> <button onclick="del()">🗑 Sil</button><div class="bx"><small>Tür değiştir:</small><br>${Object.keys(CAB).map((k) => `<button onclick="ct('${k}')">${CAB[k].n}</button>`).join(" ")}</div>`;
  }
}
function pal() {
  pal0();
  trDom($("pal"));
}
function panel() {
  panel0();
  trDom($("side"));
}
function tab(t) {
  tab0(t);
  trDom($("mh"));
}
function draw(n) {
  cv.width = cv.clientWidth;
  cv.height = cv.clientHeight;
  cx.setTransform(view.z, 0, 0, view.z, view.x, view.y);
  cx.strokeStyle = "#1c242e";
  cx.lineWidth = 1 / view.z;
  const g = 50, x0 = -view.x / view.z, y0 = -view.y / view.z;
  for (let x = Math.floor(x0 / g) * g; x < x0 + cv.width / view.z; x += g) {
    cx.beginPath();
    cx.moveTo(x, y0);
    cx.lineTo(x, y0 + cv.height / view.z);
    cx.stroke();
  }
  for (let y = Math.floor(y0 / g) * g; y < y0 + cv.height / view.z; y += g) {
    cx.beginPath();
    cx.moveTo(x0, y);
    cx.lineTo(x0 + cv.width / view.z, y);
    cx.stroke();
  }
  for (const d of devs) if (hasWf(d)) {
    const T = STD[d.std || "n"], r = T.r, cf = conf(d), cc = cf ? "255,90,90" : "199,146,234";
    for (let i = 0; i < 3; i++) {
      const k = (n * T.s / 600 + i / 3) % 1;
      cx.strokeStyle = `rgba(${cc},${0.4 * (1 - k)})`;
      cx.lineWidth = 2;
      cx.beginPath();
      cx.arc(d.x, d.y, r * k, 0, 7);
      cx.stroke();
    }
    cx.strokeStyle = cf ? "#ff5a5a77" : "#c792ea44";
    cx.lineWidth = 1;
    cx.setLineDash([6, 6]);
    cx.beginPath();
    cx.arc(d.x, d.y, r, 0, 7);
    cx.stroke();
    cx.setLineDash([]);
  }
  for (const l of links) {
    const a = dv(l.a), b = dv(l.b), [ok] = chk(l);
    cx.lineWidth = l.cable == "fiber" ? 4 : 3;
    cx.setLineDash([]);
    cx.strokeStyle = !ok || bad[l.id] ? bad[l.id] && Math.floor(n / 250) % 2 ? "#fff" : "#ff4d4d" : CAB[l.cable].c;
    if (!ok) cx.setLineDash([8, 6]);
    if (l.stpBlk) {
      cx.strokeStyle = "#ffb300";
      cx.setLineDash([2, 6]);
    }
    if (l.cable == "wifi" && ok && !bad[l.id]) {
      cx.strokeStyle = `hsl(${sig(l) * 120 / (1 + 1.5 * intf(l))},80%,55%)`;
      cx.setLineDash([3, 6]);
    }
    if (!l.plugged) {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, u = 0.15;
      cx.setLineDash([]);
      cx.strokeStyle = "#667";
      cx.beginPath();
      cx.moveTo(a.x, a.y);
      cx.lineTo(a.x + (mx - a.x) * (1 - u) * 1, a.y + (my - a.y) * (1 - u));
      cx.moveTo(b.x, b.y);
      cx.lineTo(b.x + (mx - b.x) * (1 - u), b.y + (my - b.y) * (1 - u));
      cx.stroke();
    } else {
      cx.beginPath();
      cx.moveTo(a.x, a.y);
      cx.lineTo(b.x, b.y);
      cx.stroke();
    }
    if (sel && sel.k == "l" && sel.id == l.id) {
      cx.setLineDash([]);
      cx.strokeStyle = "#fff8";
      cx.lineWidth = 8;
      cx.beginPath();
      cx.moveTo(a.x, a.y);
      cx.lineTo(b.x, b.y);
      cx.stroke();
    }
    cx.setLineDash([]);
    cx.fillStyle = ok ? "#9fb0c0" : "#ff6b6b";
    cx.font = "11px Segoe UI";
    cx.textAlign = "center";
    cx.fillText(l.stpBlk ? "STP ⛔" : l.cable == "wifi" && ok ? Math.round(sig(l) * 100) + "%" + (intf(l) > 0.05 ? "⚠" : "") : ok ? "✔" : "✘", (a.x + b.x) / 2, (a.y + b.y) / 2 - 6);
    if (ok) cx.fillText(fmt(mbps(l)), (a.x + b.x) / 2, (a.y + b.y) / 2 + 8);
  }
  if (drag && drag.k == "cab") {
    const a = dv(drag.from);
    cx.strokeStyle = "#fff6";
    cx.lineWidth = 2;
    cx.setLineDash([4, 4]);
    cx.beginPath();
    cx.moveTo(a.x, a.y);
    cx.lineTo(cur.x, cur.y);
    cx.stroke();
    cx.setLineDash([]);
  }
  for (const p of pk) {
    if (p.w > 0 && p.i > 0) continue;
    if (p.i >= p.l.length) continue;
    const a = dv(p.p[p.i]), b = dv(p.p[p.i + 1]);
    if (!a || !b) continue;
    const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
    cx.fillStyle = p.atk ? "#ff9f43" : p.flood ? "#ff3b3b" : p.rep ? "#ffd54f" : "#fff";
    cx.shadowColor = "#9be21f";
    cx.shadowBlur = 12;
    cx.beginPath();
    cx.arc(x, y, 6, 0, 7);
    cx.fill();
    cx.shadowBlur = 0;
  }
  for (const d of devs) {
    const gl = glow[d.id] && n - glow[d.id] < 700 ? 1 - (n - glow[d.id]) / 700 : 0, s = sel && sel.k == "d" && sel.id == d.id;
    cx.shadowColor = "#9be21f";
    cx.shadowBlur = gl ? 30 * gl : 0;
    cx.fillStyle = "#1e2630";
    cx.strokeStyle = gl ? "#c8f56a" : s ? "#fff" : "#9be21f";
    cx.lineWidth = gl ? 3 : 2;
    cx.beginPath();
    cx.roundRect(d.x - 34, d.y - 28, 68, 56, 10);
    cx.fill();
    cx.stroke();
    cx.shadowBlur = 0;
    cx.fillStyle = "#fff";
    cx.textAlign = "center";
    cx.font = "24px Segoe UI Emoji";
    cx.fillText(DEV[d.type].e, d.x, d.y + 6);
    cx.font = "11px Segoe UI";
    cx.fillStyle = "#cfd8e3";
    if (d.load > 0) {
      cx.fillStyle = d.load >= 8 ? "#f44" : "#ffb74d";
      cx.fillRect(d.x - 30, d.y + 30, 60 * Math.min(1, d.load / 8), 3);
    }
    cx.font = "14px Segoe UI Emoji";
    if (d.bot || d.atk) cx.fillText("🦠", d.x - 26, d.y - 14);
    if (d.blk) cx.fillText("⛔", d.x + 26, d.y - 14);
    if (d.down) cx.fillText("💥", d.x, d.y - 34);
    if (d.storm) cx.fillText("🌪️", d.x, d.y - 34);
    if (d.owned) cx.fillText("🏴‍☠️", d.x + 26, d.y - 34);
    if (d.exposed) cx.fillText("🔍", d.x - 26, d.y - 34);
    if (d.mitm) cx.fillText("🕵️", d.x + 26, d.y + 16);
    cx.fillStyle = "#cfd8e3";
    cx.font = "11px Segoe UI";
    cx.fillText(d.name, d.x, d.y + 46);
    if (d.ip) {
      cx.fillStyle = "#8b98a8";
      cx.font = "10px Consolas";
      cx.fillText(d.ip, d.x, d.y + 58);
    }
    if (d.site) {
      cx.fillStyle = "#7fb7ff";
      cx.font = "10px Segoe UI";
      cx.fillText("🌐 " + d.site, d.x, d.y + 70);
    }
  }
}
$("run").onclick = () => {
  running = !running;
  $("run").textContent = tr(running ? "⏸ Duraklat" : "▶ Çalıştır");
  $("run").classList.toggle("on", running);
  log(running ? "Simülasyon çalışıyor." : "Simülasyon duraklatıldı.", "wr");
};
$("ping").onclick = () => {
  tool = "sel";
  pal();
  pingSrc = null;
  $("ping").classList.toggle("on");
  if ($("ping").classList.contains("on")) log("Kaynak cihaza tıklayın.", "wr");
};
$("clr").onclick = () => $("log").innerHTML = "";
$("clrall").onclick = () => {
  if (!devs.length) return;
  if (!confirm("Topolojideki tüm cihaz ve kablolar silinsin mi?")) return;
  snap();
  devs = [];
  links = [];
  pk = [];
  sel = null;
  bad = {};
  pingSrc = null;
  log("Tüm topoloji temizlendi.", "wr");
  panel();
};
$("undo").onclick = doUndo;
$("redo").onclick = doRedo;
$("save").onclick = saveTopo;
$("open").onclick = () => $("fi").click();
$("fi").onchange = (e) => {
  if (e.target.files[0]) openTopo(e.target.files[0]);
  e.target.value = "";
};
$("lng").value = lang;
$("lng").onchange = () => {
  try {
    localStorage.setItem("lang", $("lng").value);
  } catch (e) {
  }
  location.reload();
};
$("tasks").onclick = () => {
  $("md").style.display = "flex";
  tab("ts");
};
$("guide").onclick = () => {
  $("md").style.display = "flex";
  tab("dev");
};
$("md").onclick = (e) => {
  if (e.target == $("md")) $("md").style.display = "none";
};
function tab0(t) {
  $("mh").innerHTML = ["dev:Ağ Elemanları", "cab:Kablolar", "pro:Protokoller", "use:Kullanım", "ts:Görevler", "ab:Hakkında"].map((x) => {
    const [k, n] = x.split(":");
    return `<button class="${k == t ? "on" : ""}" onclick="tab('${k}')">${n}</button>`;
  }).join("") + `<button style="margin-left:auto" onclick="$('md').style.display='none'">✕</button>`;
  let h = "";
  if (t == "dev") for (const g in GRP) {
    h += `<h3 style="color:#fff;border-bottom:1px solid #2a3340">${tr(g)}</h3>`;
    for (const k of GRP[g]) {
      const I = DEV[k];
      h += `<h4>${I.e} ${tr(I.n)}</h4>${gd(k, "d")}<br><b>${L("Kablolama", "Cabling")}:</b> ${gd(k, "c")}`;
    }
  }
  if (t == "cab") h = `<h4>Düz kablo (bakır)</h4>Farklı türdeki cihazları bağlar: PC↔Switch, Router↔Switch.<h4>Çapraz kablo (bakır)</h4>Aynı türdeki cihazları bağlar: PC↔PC, Switch↔Switch, Router↔Router.<h4>Fiber optik</h4>Işıkla iletim; daha hızlı ve uzun mesafe. Yalnızca fiber portlu cihazlarda kullanılır. Simülasyonda veri bakıra göre ~3 kat hızlı akar.<h4>Kural özeti</h4><code>DTE</code>: PC, Dizüstü, Sunucu, Router, Firewall, OLT · <code>DCE</code>: Switch, Hub, AP, Modem, ONT. Aynı grup → çapraz, farklı grup → düz.<h4>Kategori ve hız</h4>Cat5 100 Mbps, Cat5e 1 Gbps, Cat6 1 Gbps (55 m’ye kadar 10 Gbps), Cat6a 10 Gbps. Bakır en fazla 100 m; 50 m’den sonra hız düşer, 100 m’yi aşınca bağlantı çalışmaz. Çok modlu fiber 300 m, tek modlu fiber çok uzun mesafe destekler. Gerçek hız; kablo, mesafe ve iki cihazın port hızından en düşüğüdür. Ölçek: 1 piksel = 0,25 m. OLT yalnızca fiber kabul eder.<h4>Wi-Fi</h4>Wi-Fi aracıyla bir istemciyi Wi-Fi vericisine (AP, Router, Modem) sürükleyin. Sinyal mesafeyle azalır; menzil dışında bağlantı kurulmaz. 802.11b yavaş (11 Mbps), ac/ax hızlıdır; Vericiyi seçip standardı değiştirin. Dalga animasyonu ve paket hızı standarda göre değişir. Telefon ve IoT cihazları yalnızca Wi-Fi destekler. Router’da Wi-Fi isteğe bağlıdır: router’ı seçip “Bu router’da Wi-Fi var” kutusunu işaretleyin. <b>Kanal çakışması:</b> aynı bantta (802.11ac 5 GHz, diğerleri 2.4 GHz) kanalı yakın (fark &lt;5) ve menzilleri kesişen vericiler birbirine parazit yapar; çemberleri kırmızı olur, hız düşer. 1-6-11 gibi birbirinden uzak kanallar seçin.<h4>FTTx (OLT/ONT)</h4>OLT ile ONT arası yalnızca fiber. ONT’den router’a düz kablo çekin. Fiber destekleyen: Switch, Router, Sunucu, Firewall, Modem, OLT, ONT.`;
  if (t == "pro") {
    const PP = lang == "en" ? PE : PROTO;
    for (const k in PP) h += `<h4>${k}</h4>${PP[k]}`;
  }
  ;
  if (t == "use") h = `<h4>Başlangıç</h4>1) Soldan cihaz seçip tuvale tıklayın.<br>2) Kablo türünü seçip bir cihazdan diğerine sürükleyin.<br>3) ✔ doğru, ✘ yanlış bağlantıdır; yanlış kabloda veri akmaz.<br>4) “Paket Gönder” ile kaynak ve hedefe tıklayın.<br>5) Ulaşmazsa alttaki Debug günlüğü hatayı söyler, hatalı kablo kırmızı yanıp söner.<br>6) Kablo seçip çıkarın/takın/silin. <code>Delete</code> seçileni siler, <code>Esc</code> aracı iptal eder.<h4>IP, alt ağ ve DHCP</h4>Cihazı seçip IP, önek ve ağ geçidini düzenleyin. Farklı alt ağlardaki cihazlar için router gerekir ve iki tarafta da ağ geçidi o router’ın IP’si olmalıdır. Router veya sunucu DHCP sunucusu olabilir; istemcide “DHCP’den IP al”ı işaretleyin (169.254.x.x: DHCP sunucusu bulunamadı).<h4>Saldırılar</h4>Bilgisayar, dizüstü, telefon veya IoT cihazını seçip saldırı türünü belirleyin. <b>Botnet/DDoS:</b> sunuculara sürekli saldırı paketi (kırmızı) gönderir, sunucu çökebilir; firewall paketlerin bir kısmını düşürür, DDoS temizleme sunucusu hepsini atar ve IP’yi bloklar. <b>Port tarama</b> ve <b>SSH kaba kuvvet:</b> firewall tespit edip saldırganı bloklar; yoksa açık portlar bulunur veya sunucu ele geçirilir. <b>ARP zehirleme:</b> aynı ağdaki trafiği dinler; switch’te ARP koruması (DAI) engeller. Bloklanan cihaz sağ panelden IP’sini sıfırlamalıdır.<h4>Görevler</h4>Hazır görevler için Görevler düğmesini kullanın.<h4>Gezinme</h4>Boşluğa sol tık sürükle: gez · Fare tekerleği: yakınlaştır/uzaklaştır.`;
  if (t == "ab") h = `<h4>🍋 Lime Network Simulator</h4>${L("Sürüm", "Version")} 1.2.0<br><br>Made by <b>Nomad</b> with Claude AI<br><a href="https://github.com/nomadkm" target="_blank" style="color:#9be21f">https://github.com/nomadkm</a>`;
  if (t == "ts") h = `<p>${L("Tamamlanan", "Completed")}: ${TASKS.filter((x) => done[x.id]).length}/${TASKS.length}</p>` + TASKS.map((x) => `<h4>${done[x.id] ? "✅" : "⬜"} ${x.n[lang == "en" ? 1 : 0]}</h4>${x.d[lang == "en" ? 1 : 0]}<br><button onclick="chkTask('${x.id}')">${L("Kontrol Et", "Check")}</button>`).join("");
  if (lang == "en" && GE[t]) h = GE[t];
  $("mb").innerHTML = h;
}
