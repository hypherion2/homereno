// Start-up: pick the concept from the link (or the latest) and build it.
// ---------- start
let start = 0;
try {
  start = Math.min(VERS.length - 1, Math.max(0, parseInt(localStorage.getItem("remodel-ver") || "0") || 0));
} catch (e) {}
start = VERS.length - 1;
{
  const hv = verFromHash();
  if (hv >= 0) start = hv;
}
setVersion(start);
addEventListener("hashchange", () => {
  const i = verFromHash();
  if (i >= 0 && i != S.ver) setVersion(i);
});
resize();
drawSaved();
{
  const P = presets()["3d"];
  cam.position.set(...P[0]);
  ct.target.set(...P[1]);
  ct.update();
  pushHist();
}
let lastT = performance.now();
(function loop() {
  requestAnimationFrame(loop);
  const nowT = performance.now(),
    dt = Math.min(0.05, (nowT - lastT) / 1000);
  lastT = nowT;
  if (S.walk) {
    walkStep(dt);
    $("needle").style.transform = "rotate(" + (W.yaw - (window.NOFF || 0)) + "rad)";
  } else {
    stepAnim();
    ct.update();
    $("needle").style.transform = "rotate(" + (ct.getAzimuthalAngle() - (window.NOFF || 0)) + "rad)";
  }
  rn.render(sc, cam);
})();
