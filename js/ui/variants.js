// Layout options inside one concept (e.g. three living-room arrangements, two stair finishes).
// A concept can list   variants: [{ id, label, choose, options: [{ name, note, lay: [...], set: {...} }] }]
// The chosen option's proposed items are added to the concept's base items, and its "set" values
// (e.g. stair: "bars") are copied onto the concept before the model is built.
function applyVariants(D) {
  if (!D.variants) return;
  if (!D._base) D._base = { lay: D.lay.slice(), set: {}, furn: JSON.stringify(D.furn) };
  D.lay = D._base.lay.slice();
  D.furn = JSON.parse(D._base.furn);
  for (const k in D._base.set) D[k] = D._base.set[k];
  D.variants.forEach((vr) => {
    const o = vr.options[vr.choose || 0];
    (o.lay || []).forEach((x) => D.lay.push(x));
    for (const [k, v] of Object.entries(o.set || {})) {
      if (!(k in D._base.set)) D._base.set[k] = D[k];
      D[k] = v;
    }
  });
  D.winder = null;
  if (D.winderTop) makeWinderTop(D);
}

// Stair-top winders: the last steps of the upper flight become three 30° winders that turn
// 90° to the left, so you step off facing the lounge instead of the bedroom hallway.
// Rewrites the upper flight in D.furn (straight part only), moves the top guard and stores
// the winder geometry in D.winder for the model (build-model.js) and the walk mode (walk.js).
function makeWinderTop(D) {
  const i = D.furn.findIndex((f) => f[8] == 3 && Math.abs(f[1] - 519.8) < 1 && Math.abs(f[2] - 885.3) < 1);
  if (i < 0) return;
  const f = D.furn[i],
    [L, x0, y0, w0, d, a, e, h, , , s] = f,
    ca = Math.cos(a),
    sa = Math.sin(a),
    cx = x0 - 2 * ca - 6 * sa, // same small fit-up offset build-model applies to this flight
    cy = y0 - 2 * sa + 6 * ca,
    w = w0 - 2,
    N = Math.max(2, Math.round(h / 18)),
    T = d / N,
    ri = h / N,
    u = [sa, -ca], // uphill direction (SW)
    v = [-ca, -sa], // turn direction (SE, towards the lounge)
    nS = N - 4, // straight steps before the winders
    t0 = -d / 2 + nS * T,
    P = (t, p) => [cx + u[0] * t + v[0] * p, cy + u[1] * t + v[1] * p];
  const tc = -d / 2 + (nS * T) / 2,
    c0 = P(tc, 0);
  D.furn[i] = [L, c0[0], c0[1], w, nS * T, a, e, nS * ri, 3, "Staircase", s];
  const K = P(t0, w / 2), // inner corner of the turn
    exitA = K,
    exitB = P(t0 + w, w / 2);
  // remove guard segments along the new exit edge, close the old arrival with a guard
  const L1 = D.levels.reduce((m, l) => (l[2] > m[2] ? l : m))[0],
    nearExit = (fx, fy) => {
      const ex = exitB[0] - exitA[0],
        ey = exitB[1] - exitA[1],
        t = Math.max(0, Math.min(1, ((fx - exitA[0]) * ex + (fy - exitA[1]) * ey) / (ex * ex + ey * ey))),
        qx = exitA[0] + t * ex,
        qy = exitA[1] + t * ey;
      return Math.hypot(fx - qx, fy - qy) < 14 && t > 0.05 && t < 0.98;
    };
  D.furn = D.furn.filter((g) => !(g[0] == L1 && /rail/i.test(g[9]) && nearExit(g[1], g[2])));
  const gc = P(t0 + w, 0);
  D.furn.push([L1, gc[0], gc[1], w, 6.3, Math.atan2(v[1], v[0]), 0, 91.4, 0, "Rounded edges railing", 0]);
  D.winder = { L, K, u, m: [-v[0], -v[1]], w, base: e + nS * ri, ri, n: 3 };
}

// Option buttons under the concept description (only for concepts that have variants).
function renderVariants() {
  const box = $("varui"),
    D = DATA[VERS[S.ver].key];
  if (!D || !D.variants) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = D.variants
    .map(
      (vr, vi) =>
        '<div class="k">' +
        vr.label +
        " <span>Try options</span></div>" +
        '<div class="seg varseg">' +
        vr.options
          .map(
            (o, oi) =>
              '<button data-v="' +
              vi +
              '" data-o="' +
              oi +
              '" class="' +
              ((vr.choose || 0) == oi ? "on" : "") +
              '">' +
              o.name +
              "</button>",
          )
          .join("") +
        "</div>" +
        '<div class="fine">' +
        (vr.options[vr.choose || 0].note || "") +
        "</div>",
    )
    .join("");
  box.querySelectorAll("button").forEach(
    (b) =>
      (b.onclick = () => {
        D.variants[+b.dataset.v].choose = +b.dataset.o;
        const keep = { p: cam.position.clone(), t: ct.target.clone() };
        setVersion(S.ver, true);
        cam.position.copy(keep.p);
        ct.target.copy(keep.t);
        if (W.on) revalidate();
      }),
  );
}
{
  const f = setVersion;
  setVersion = function () {
    const r = f.apply(this, arguments);
    try {
      renderVariants();
    } catch (e) {
      console.warn(e);
    }
    return r;
  };
}
