// Applies view options to the model, switches concepts, deep links (#concept-NN) and the version list.
const SH3D_KEYS = new Set(VERS.map((v) => v.key)); // concepts with a downloadable .sh3d
function levelName() {
  return S.level == "ground" ? "Ground floor" : S.level == "both" ? "Both floors" : "Upper floor";
}
function applyAll() {
  const D = DATA[VERS[S.ver].key],
    lvs = D.levels;
  lvs.forEach((l) => {
    const n = l[1],
      g = S.G[l[0]];
    g.visible = n == "Level 1" ? S.level != "ground" : S.level != "upper";
  });
  Object.values(S.FG).forEach((g) => (g.visible = $("o-fu").checked));
  Object.values(S.LGp).forEach((g) => (g.visible = $("o-ly").checked));
  Object.values(S.LB).forEach((g) => (g.visible = $("o-lb").checked && !S.walk));
  Object.values(S.MS).forEach((g) => (g.visible = $("o-ms").checked && !S.walk));
  S.BL.forEach((m) => (m.visible = $("o-bl").checked));
  S.gg.forEach((m) => (m.visible = $("o-gh").checked && !S.walk));
  Object.values(S.WG).forEach((g) => (g.scale.y = S.cut));
  const st = $("o-st").checked,
    nw = $("o-nw").checked,
    tn = $("o-tint").checked;
  $("skey").style.display = st ? "block" : "none";
  S.walls.forEach((m) => {
    const c = m.userData.c;
    m.material.color.setHex(st ? CLS[c] : c == 5 && nw ? 0x5cb85c : (!dk && D.wallColor) || WALL);
  });
  S.floors.forEach((m) =>
    m.material.color.setHex(tn ? TINT(m.userData.n) : m.userData.l == "Level 1" ? 0xd8c29b : 0xc9ced1),
  );
  $("modelbl").textContent = levelName() + " · " + (S.cut < 0.97 ? "3D cutaway" : "full walls");
  $("cutv").textContent = S.cut < 0.97 ? "Cutaway " + ftin(S.cut * 244) : "Full height";
  $("chip").textContent = VERS[S.ver].chip;
}
function setVersion(i, keep) {
  if (S._pk && matchMedia("(max-width:820px)").matches) document.body.classList.add("pc");
  S._pk = 1;
  S.ver = i;
  const v = VERS[i];
  {
    const t = $("ptog");
    if (t) t.textContent = "☰ " + v.chip.replace(/^[^·]*· /, "");
  }
  buildModel(DATA[v.key]);
  if (!keep) {
    $("o-ly").checked = v.proposed;
    $("o-bl").checked = false;
    applyAll();
  }
  $("vlist")
    .querySelectorAll(".ver")
    .forEach((b, k) => b.classList.toggle("on", k == i));
  $("concept").innerHTML =
    '<div class="t">' +
    v.kind +
    "</div><h3>" +
    v.headline +
    "</h3><p>" +
    v.desc +
    '</p><div class="tags">' +
    v.tags.map((t) => "<span>" + t + "</span>").join("") +
    "</div>" +
    costHtml(v.key) +
    '<button class="btn" id="zoomc">' +
    v.btn +
    ' ↗</button> <button class="btn" id="copyl" style="background:transparent;color:inherit;border:1px solid currentColor;opacity:.8">Copy link</button>' +
    (SH3D_KEYS.has(v.key)
      ? ' <a class="btn" id="dlsh" href="sh3d/' +
        verSlug(v) +
        '.sh3d" download="1615mch-' +
        verSlug(v) +
        '.sh3d" title="Sweet Home 3D file (5.3 or later). Walls, rooms, doors, windows and existing furniture use the original models; proposed items are coloured blocks." style="background:transparent;color:inherit;border:1px solid currentColor;opacity:.8;text-decoration:none;display:inline-block;text-align:center;box-sizing:border-box">Download .sh3d</a>'
      : "");
  $("zoomc").onclick = () => fly(...focusCam());
  $("copyl").onclick = () => {
    const u = location.href.split("#")[0] + "#" + verSlug(v),
      b = $("copyl");
    const ok = () => {
      b.textContent = "Link copied";
      setTimeout(() => (b.textContent = "Copy link"), 1400);
    };
    try {
      navigator.clipboard.writeText(u).then(ok, () => {
        prompt("Copy this link", u);
      });
    } catch (e) {
      const t = document.createElement("textarea");
      t.value = u;
      document.body.appendChild(t);
      t.select();
      try {
        document.execCommand("copy");
        ok();
      } catch (_) {}
      t.remove();
    }
  };
  try {
    localStorage.setItem("remodel-ver", String(i));
  } catch (e) {}
  try {
    const h = "#" + verSlug(v);
    if (location.hash !== h) history.replaceState(null, "", h);
  } catch (e) {}
  if (W.on) revalidate();
}
function verSlug(v) {
  if (v.key == "orig") return "original";
  const m = /^(\d+)/.exec(v.chip);
  return m ? "concept-" + m[1] : v.key;
}
function verFromHash() {
  const h = (location.hash || "")
    .slice(1)
    .toLowerCase()
    .replace(/^concept-0+(?=\d)/, "concept-");
  if (!h) return -1;
  const nz = (x) => x.replace(/^concept-0+(?=\d)/, "concept-");
  let i = VERS.findIndex((v) => nz(verSlug(v)) == h);
  if (i < 0 && /^\d+$/.test(h)) i = VERS.findIndex((v) => nz(verSlug(v)) == "concept-" + parseInt(h, 10));
  if (i < 0) i = VERS.findIndex((v) => v.key == h);
  return i;
}
function renderVList() {
  const vl = $("vlist");
  vl.innerHTML = "";
  VERS.forEach((v, i) => {
    const b = document.createElement("button");
    b.className = "ver" + (i == S.ver ? " on" : "");
    b.innerHTML =
      '<span class="n' +
      (i ? "" : " as") +
      '">' +
      (i ? (/^(\d+)/.exec(v.chip) || [0, String(i)])[1].padStart(2, "0") : "AS-IS") +
      "</span><span><b>" +
      v.title +
      "</b><i>" +
      v.sub +
      '</i></span><span class="d"></span>';
    b.onclick = () => setVersion(i);
    vl.appendChild(b);
  });
}
renderVList();

// Rough cost estimate for a concept (js/data/costs.js), shown under the tags with a breakdown.
function costHtml(key) {
  const c = typeof COSTS != "undefined" && COSTS[key];
  if (!c) return "";
  const k = (n) => "$" + (n >= 1000 ? Math.round(n / 1000) + "k" : n);
  if (!c.high) return '<div class="cost"><b>Rough cost:</b> ' + (c.label || "baseline, no work") + "</div>";
  const row = (i) => "<tr><td>" + i.item + "</td><td>" + k(i.low) + "–" + k(i.high) + "</td></tr>";
  return (
    '<details class="cost"><summary><b>Rough cost:</b> ' + k(c.low) + "–" + k(c.high) + " CAD <span>details</span></summary>" +
    "<table>" + c.items.map(row).join("") + "</table>" +
    (c.optional && c.optional.length ? '<div class="fine">Optional, not in the total:</div><table>' + c.optional.map(row).join("") + "</table>" : "") +
    '<div class="fine">' + (c.notes || "") + " Metro Vancouver 2026 ballpark for planning only; get contractor quotes.</div></details>"
  );
}
