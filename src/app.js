// Startup

pal();
panel();
requestAnimationFrame(step);
trDom();
setTimeout(() => {
  $("load").style.opacity = 0;
  setTimeout(() => $("load").remove(), 500);
}, 2200);
