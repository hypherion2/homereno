// Camera presets, fly-to animation, view history (undo/redo), levels and cutaway.
// ---------- camera
let anim = null;
const hist = [],
  hp = { i: -1 };
let skip = false;
const tgtY = () => (S.level == "ground" ? 60 : S.level == "both" ? S.E1 * 0.5 : S.E1 + 30);
function presets() {
  const c = S.c,
    sp = S.span,
    ty = tgtY(),
    E = S.E1;
  return {
    "3d": [
      [c.x + sp * 0.62, ty + sp * 0.85, c.z + sp * 0.85],
      [c.x, ty, c.z],
    ],
    plan: [
      [c.x, ty + sp * 1.45, c.z + 1],
      [c.x, ty, c.z],
    ],
    front: [
      [c.x, ty + sp * 0.22, c.z + sp * 1.45],
      [c.x, ty + 80, c.z],
    ],
    kitchen: [
      [690, E + 150, 630],
      [950, E + 85, 820],
    ],
    patio: [
      [905, E + 175, -330],
      [900, E + 85, 420],
    ],
  };
}
function focusCam() {
  const f = S.focus,
    ty = tgtY(),
    d = Math.max(f.r, 500) * 1.35;
  return [
    [f.x + d * 0.35, ty + d * 0.85, f.z + d * 0.95],
    [f.x, ty, f.z],
  ];
}
function fly(p, t, push = true) {
  const sp = cam.position.clone(),
    st = ct.target.clone(),
    ep = new THREE.Vector3(...p),
    et = new THREE.Vector3(...t),
    t0 = performance.now(),
    D = 700;
  anim = { sp, st, ep, et, t0, D, push };
}
function stepAnim() {
  if (!anim) return;
  const k = Math.min(1, (performance.now() - anim.t0) / anim.D),
    e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  cam.position.lerpVectors(anim.sp, anim.ep, e);
  ct.target.lerpVectors(anim.st, anim.et, e);
  if (k >= 1) {
    const p = anim.push;
    anim = null;
    if (p) pushHist();
  }
}
function pushHist() {
  if (skip) {
    skip = false;
    return;
  }
  const s = { p: cam.position.toArray(), t: ct.target.toArray() };
  const l = hist[hp.i];
  if (l && l.p.every((v, i) => Math.abs(v - s.p[i]) < 1) && l.t.every((v, i) => Math.abs(v - s.t[i]) < 1))
    return;
  hist.splice(hp.i + 1);
  hist.push(s);
  if (hist.length > 60) hist.shift();
  hp.i = hist.length - 1;
}
ct.addEventListener("end", () => {
  if (!anim) pushHist();
});
function goView(v, levelForce) {
  S.view = v;
  document
    .querySelectorAll("#views button[data-v]")
    .forEach((b) => b.classList.toggle("on", b.dataset.v == v));
  if ((v == "kitchen" || v == "patio") && S.level == "ground") setLevel("upper");
  const P = presets()[v];
  fly(P[0], P[1]);
}
document.querySelectorAll("#views button[data-v]").forEach((b) => (b.onclick = () => goView(b.dataset.v)));
$("undo").onclick = () => {
  if (hp.i > 0) {
    hp.i--;
    const s = hist[hp.i];
    skip = false;
    fly(s.p, s.t, false);
  }
};
$("redo").onclick = () => {
  if (hp.i < hist.length - 1) {
    hp.i++;
    const s = hist[hp.i];
    fly(s.p, s.t, false);
  }
};
$("reset").onclick = () => {
  setLevel("both");
  S.cut = 1;
  $("cut").value = 100;
  goView("3d");
};
function setLevel(l) {
  S.level = l;
  document.querySelectorAll("#lvseg button").forEach((b) => b.classList.toggle("on", b.dataset.l == l));
  applyAll();
}
document.querySelectorAll("#lvseg button").forEach(
  (b) =>
    (b.onclick = () => {
      setLevel(b.dataset.l);
      const P = presets()[S.view == "3d" || S.view == "plan" || S.view == "front" ? S.view : "3d"];
      fly(P[0], P[1]);
    }),
);
["o-fu", "o-ly", "o-bl", "o-lb", "o-ms", "o-tint", "o-gh", "o-nw", "o-st"].forEach(
  (id) => ($(id).onchange = applyAll),
);
$("cut").oninput = (e) => {
  S.cut = e.target.value / 100;
  applyAll();
};
