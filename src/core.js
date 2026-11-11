// Shared state, DOM helpers and undo/redo history

const $ = (i) => document.getElementById(i);
let devs = [], links = [], pk = [], glow = {}, nid = 1, view = { x: 0, y: 0, z: 1 }, tool = "sel", sel = null, running = true, pingSrc = null, bad = {}, drag = null, cur = { x: 0, y: 0 };
const cv = $("cv"), cx = cv.getContext("2d");
const dv = (id) => devs.find((d) => d.id == id), lk = (id) => links.find((l) => l.id == id);
let undo = [], redo = [], stpSig = "";
const ser = () => JSON.stringify({ devs, links, nid });
function snap() {
  undo.push(ser());
  if (undo.length > 100) undo.shift();
  redo = [];
}
function rest(x) {
  const o = JSON.parse(x);
  devs = o.devs;
  links = o.links;
  nid = o.nid;
  pk = [];
  sel = null;
  bad = {};
  panel();
}
function doUndo() {
  if (!undo.length) return;
  redo.push(ser());
  rest(undo.pop());
  log("Geri alındı.", "wr");
}
function doRedo() {
  if (!redo.length) return;
  undo.push(ser());
  rest(redo.pop());
  log("Yinelendi.", "wr");
}
let at = 0, done = {};
try {
  done = JSON.parse(localStorage.getItem("done") || "{}");
} catch (e) {
}
;
let fl = 0;
let last = performance.now();
