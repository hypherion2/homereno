// Cabinet colour picker (upper, lower, island) and presets.
// ---------- cabinet color picker
const CAB = { up: null, lo: null, is: null, same: true };
function cabRole(lb) {
  lb = lb || "";
  if (/upper cabinet|full-height pantry|cabinet above fridge/i.test(lb)) return "upper";
  if (/^island:/i.test(lb)) return "island";
  if (
    /sink base|drawers|dry pantry: shallow|^cabinets?\b|base cab/i.test(lb) &&
    !/upper|fridge|^cooking zone|dishwasher|bbq/i.test(lb)
  )
    return "lower";
  return null;
}
function cabHex(role, c0) {
  const v = role == "upper" ? CAB.up : role == "island" ? (CAB.same ? CAB.lo : CAB.is) : CAB.lo;
  return v == null ? c0 : v;
}
function applyCab() {
  if (!S.root) return;
  S.root.traverse((g) => {
    const role = g.userData && g.userData.role;
    if (!role) return;
    const hx = cabHex(role, g.userData.c0);
    g.children.forEach((o) => {
      if (!o.isMesh) return;
      const om = o.userData._om || o.material;
      if (!om.color) return;
      if (om.color.getHex() == hx) return;
      om.color.setHex(hx);
      if (o.userData._om) {
        o.material = om;
        delete o.userData._om;
      }
    });
  });
  realRefresh();
  try {
    rn.shadowMap.needsUpdate = true;
  } catch (e) {}
}
function syncCab() {
  const orig = {};
  if (S.root)
    S.root.traverse((g) => {
      const r = g.userData && g.userData.role;
      if (r && orig[r] === undefined) orig[r] = g.userData.c0;
    });
  const h = (v) => "#" + ("000000" + v.toString(16)).slice(-6);
  if (orig.upper !== undefined || CAB.up != null) $("cc-up").value = h(CAB.up != null ? CAB.up : orig.upper);
  if (orig.lower !== undefined || CAB.lo != null) $("cc-lo").value = h(CAB.lo != null ? CAB.lo : orig.lower);
  const ib = CAB.same
    ? CAB.lo != null
      ? CAB.lo
      : orig.island !== undefined
        ? orig.island
        : orig.lower
    : CAB.is != null
      ? CAB.is
      : orig.island;
  if (ib !== undefined) $("cc-is").value = h(ib);
  $("cc-is").disabled = CAB.same;
  $("cc-same").checked = CAB.same;
  $("cabui").style.display = orig.upper !== undefined || orig.lower !== undefined ? "" : "none";
  if (CAB.up != null || CAB.lo != null || CAB.is != null) applyCab();
}
{
  const hx = (s) => parseInt(s.slice(1), 16);
  $("cc-up").oninput = (e) => {
    CAB.up = hx(e.target.value);
    applyCab();
  };
  $("cc-lo").oninput = (e) => {
    CAB.lo = hx(e.target.value);
    if (CAB.same) $("cc-is").value = e.target.value;
    applyCab();
  };
  $("cc-is").oninput = (e) => {
    CAB.is = hx(e.target.value);
    applyCab();
  };
  $("cc-same").onchange = (e) => {
    CAB.same = e.target.checked;
    if (!CAB.same && CAB.is == null) CAB.is = CAB.lo != null ? CAB.lo : hx($("cc-is").value);
    syncCab();
    applyCab();
  };
  $("cc-reset").onclick = () => {
    CAB.up = CAB.lo = CAB.is = null;
    CAB.same = true;
    if (S.root)
      S.root.traverse((g) => {
        if (g.userData && g.userData.role) {
          g.children.forEach((o) => {
            if (o.isMesh) {
              const om = o.userData._om || o.material;
              om.color.setHex(g.userData.c0);
              if (o.userData._om) {
                o.material = om;
                delete o.userData._om;
              }
            }
          });
        }
      });
    realRefresh();
    syncCab();
  };
  const PRE = [
    ["White / Black", "f4f3ef", "1f2124"],
    ["Oak / Taupe", "d8bb92", "8a6d64"],
    ["Cream / Walnut", "eee4d0", "6b4a2f"],
    ["White / Navy", "f4f3ef", "1f3a5f"],
    ["Sage / Oak", "a9b8a0", "d0ad7c"],
    ["Greige / Charcoal", "c9c2b8", "3a3d40"],
    ["All white", "f6f5f1", "f6f5f1"],
    ["Forest / Cream", "2f4a3a", "eee4d0"],
  ];
  $("ccpre").innerHTML = PRE.map(
    (p, i) =>
      '<button class="cp" data-i="' +
      i +
      '" title="' +
      p[0] +
      ' (upper / lower)"><i style="background:#' +
      p[1] +
      '"></i><i style="background:#' +
      p[2] +
      '"></i></button>',
  ).join("");
  $("ccpre").onclick = (e) => {
    const b = e.target.closest(".cp");
    if (!b) return;
    const p = PRE[+b.dataset.i];
    CAB.up = hx("#" + p[1]);
    CAB.lo = hx("#" + p[2]);
    CAB.same = true;
    CAB.is = null;
    syncCab();
    applyCab();
  };
}
{
  const _bm = buildModel;
  buildModel = function () {
    const r = _bm.apply(this, arguments);
    try {
      syncCab();
    } catch (e) {
      console.warn(e);
    }
    return r;
  };
}
