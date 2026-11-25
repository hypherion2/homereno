// High-quality still: whenever the view comes to rest in realistic mode, one extra frame is drawn with
// ambient occlusion (N8AO: soft contact shadows in corners, under cabinets and furniture, where walls meet),
// then tone-mapped and smoothed (SMAA). While you move it renders the normal fast way.
// The post-processing code is only downloaded the first time it is needed.
const HQ = { ok: true, comp: null, n8: null, w: 0, h: 0, pr: 0, loading: null };
HQ.load = function () {
  if (HQ.loading) return HQ.loading;
  HQ.loading = Promise.all([
    import("n8ao"),
    import("three/addons/postprocessing/EffectComposer.js"),
    import("three/addons/postprocessing/OutputPass.js"),
    import("three/addons/postprocessing/SMAAPass.js"),
  ])
    .then(([N, E, O, A]) => {
      const sz = rn.getSize(new THREE.Vector2());
      const comp = new E.EffectComposer(rn);
      const n8 = new N.N8AOPass(sc, cam, sz.x, sz.y);
      n8.configuration.gammaCorrection = false; // OutputPass does tone mapping / colour output once
      n8.configuration.distanceFalloff = 1;
      n8.configuration.intensity = 2.2;
      n8.setQualityMode("High");
      comp.addPass(n8);
      comp.addPass(new O.OutputPass());
      comp.addPass(new A.SMAAPass(sz.x, sz.y));
      HQ.comp = comp; HQ.n8 = n8;
      if (typeof invalidate == "function") invalidate(50);
    })
    .catch((e) => { console.warn("HQ rendering unavailable", e); HQ.ok = false; });
  return HQ.loading;
};
// draw a frame; hq = true adds ambient occlusion when realistic mode is on
function renderFrame(hq) {
  const want = hq && HQ.ok && typeof RL != "undefined" && RL.on;
  if (want && !HQ.comp) HQ.load();
  if (!want || !HQ.comp) { rn.render(sc, cam); return; }
  const sz = rn.getSize(new THREE.Vector2()), pr = rn.getPixelRatio();
  if (sz.x != HQ.w || sz.y != HQ.h || pr != HQ.pr) { HQ.comp.setPixelRatio(pr); HQ.comp.setSize(sz.x, sz.y); HQ.w = sz.x; HQ.h = sz.y; HQ.pr = pr; }
  // occlusion reach in cm: tighter at eye level, wider for the overview
  HQ.n8.configuration.aoRadius = S.walk ? 30 : 55;
  try { HQ.comp.render(); } catch (e) { console.warn(e); HQ.ok = false; rn.setRenderTarget(null); rn.render(sc, cam); }
}
