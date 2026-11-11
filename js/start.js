// Start-up: pick the concept from the link (or the latest) and build it.
// ---------- start
let start = 0;
try {
  start = Math.min(VERS.length - 1, Math.max(0, parseInt(localStorage.getItem("remodel-ver") || "0") || 0));
} catch (e) {}
start = VERS.length - 1;
while (start > 0 && VERS[start].custom) start--; // open on the latest concept, not a saved edit
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
// Render on demand: draw every frame while something is happening (input, camera easing, walk mode,
// edit drags, animations), otherwise only a slow heartbeat, so an idle page costs almost nothing.
// Shadows are re-drawn only when the scene itself changes.
const RQ = { until: 0, last: 0, shadowAt: 0 };
function invalidate(ms = 700, scene = false) {
  RQ.until = Math.max(RQ.until, performance.now() + ms);
  if (scene) rn.shadowMap.needsUpdate = true;
}
["pointerdown", "pointermove", "pointerup", "wheel", "touchstart", "touchmove", "touchend", "keydown", "keyup"].forEach((t) =>
  addEventListener(t, () => invalidate(t == "pointermove" ? 250 : 900), { capture: true, passive: true }),
);
["input", "change", "click"].forEach((t) => addEventListener(t, () => invalidate(1200, true), { capture: true, passive: true }));
addEventListener("resize", () => invalidate(600, true));
THREE.DefaultLoadingManager.onLoad = () => invalidate(600, true);
// anything that rebuilds or restyles the model also refreshes the shadows
["buildModel", "applyAll", "applySun", "setVersion", "setLevel", "edRebuild", "edHighlight", "edPreview", "edRotHandle", "fly"].forEach((n) => {
  const f = window[n];
  if (typeof f == "function") window[n] = function () { const r = f.apply(this, arguments); invalidate(900, n != "fly"); return r; };
});
let lastT = performance.now();
(function loop() {
  requestAnimationFrame(loop);
  const nowT = performance.now(),
    dt = Math.min(0.05, (nowT - lastT) / 1000);
  lastT = nowT;
  let moving = false;
  if (S.walk) {
    walkStep(dt);
    $("needle").style.transform = "rotate(" + (W.yaw - (window.NOFF || 0)) + "rad)";
    moving = true;
  } else {
    if (anim) moving = true;
    stepAnim();
    if (ct.update()) moving = true; // still easing after a drag
    $("needle").style.transform = "rotate(" + (ct.getAzimuthalAngle() - (window.NOFF || 0)) + "rad)";
  }
  if (typeof ED != "undefined" && ED.drag) { moving = true; if (nowT - RQ.shadowAt > 120) { rn.shadowMap.needsUpdate = true; RQ.shadowAt = nowT; } }
  if (moving || nowT < RQ.until || nowT - RQ.last > 1000) {
    rn.render(sc, cam);
    RQ.last = nowT;
    if (RU.list.length || RU.cur || RU.pending) ruSync(); // keep measurements on their points as the view moves
  }
})();
