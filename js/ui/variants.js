// Layout options inside one concept (e.g. three living-room arrangements, two stair finishes).
// A concept can list   variants: [{ id, label, choose, options: [{ name, note, lay: [...], set: {...} }] }]
// The chosen option's proposed items are added to the concept's base items, and its "set" values
// (e.g. stair: "bars") are copied onto the concept before the model is built.
function applyVariants(D) {
  if (!D.variants) return;
  if (!D._base) D._base = { lay: D.lay.slice(), set: {} };
  D.lay = D._base.lay.slice();
  for (const k in D._base.set) D[k] = D._base.set[k];
  D.variants.forEach((vr) => {
    const o = vr.options[vr.choose || 0];
    (o.lay || []).forEach((x) => D.lay.push(x));
    for (const [k, v] of Object.entries(o.set || {})) {
      if (!(k in D._base.set)) D._base.set[k] = D[k];
      D[k] = v;
    }
  });
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
