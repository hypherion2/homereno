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
// Quick concept switcher over the 3D view: prev/next plus one pill per active concept.
function renderVStrip() {
  const el = $("vstrip");
  if (!el) return;
  const num = (v, i) => (v.edit ? "✎" : i ? (/^(\d+)/.exec(v.chip) || [0, String(i)])[1].padStart(2, "0") : "AS-IS");
  const shown = VERS.map((v, i) => i).filter((i) => !VERS[i].archived || i == S.ver);
  const cur = VERS[S.ver];
  el.innerHTML =
    '<button class="vs-a" data-d="-1" title="Previous concept">‹</button><div class="vs-p">' +
    shown
      .map(
        (i) =>
          '<button data-i="' + i + '" class="' + (i == S.ver ? "on" : "") + '" title="' + VERS[i].title.replace(/"/g, "&quot;") + '">' +
          num(VERS[i], i) + (i == S.ver ? " <span>" + cur.title.replace(/</g, "&lt;") + "</span>" : "") + "</button>",
      )
      .join("") +
    '</div><button class="vs-a" data-d="1" title="Next concept">›</button>';
  el.querySelectorAll(".vs-p button").forEach((b) => (b.onclick = () => setVersion(+b.dataset.i)));
  el.querySelectorAll(".vs-a").forEach(
    (b) =>
      (b.onclick = () => {
        const k = shown.indexOf(S.ver), d = +b.dataset.d;
        setVersion(shown[(k + d + shown.length) % shown.length]);
      }),
  );
  const on = el.querySelector(".vs-p .on");
  if (on) {
    const p = el.querySelector(".vs-p");
    p.scrollLeft = on.offsetLeft - (p.clientWidth - on.offsetWidth) / 2;
  }
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
    .forEach((b) => b.classList.toggle("on", b.dataset.i == i));
  renderVStrip();
  if (v.archived && $("vlist").querySelector(".varch")) $("vlist").querySelector(".varch").open = true;
  $("concept").innerHTML =
    '<div class="t">' +
    v.kind +
    "</div><h3>" +
    v.headline +
    "</h3>" +
    '<div class="tags">' +
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
      : "") +
    galleryHtml(v) +
    scopeHtml(v);
  costWire(v.key);
  galleryWire(v);
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
// Mood images (AI renders) for a concept: thumbnails that open a full-screen viewer.
function galleryHtml(v) {
  if (!v.gallery || !v.gallery.length) return "";
  return (
    '<div class="gal"><div class="galh">Mood images <span>AI renders, not to scale</span></div><div class="galt">' +
    v.gallery.map((g, i) => '<button data-g="' + i + '" title="Open"><img src="' + (g.thumb || g.src) + '" alt="" loading="lazy"></button>').join("") +
    "</div></div>"
  );
}
function galleryWire(v) {
  document.querySelectorAll("#concept .galt button").forEach((b) => (b.onclick = () => galleryOpen(v, +b.dataset.g)));
}
function galleryOpen(v, i) {
  let ov = $("galov");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "galov";
    ov.innerHTML = '<button class="gx" title="Close">✕</button><button class="gp" title="Previous">‹</button><figure><img><figcaption></figcaption></figure><button class="gn" title="Next">›</button>';
    document.body.appendChild(ov);
  }
  const G = v.gallery, show = (k) => {
    i = (k + G.length) % G.length;
    ov.querySelector("img").src = G[i].src;
    ov.querySelector("figcaption").textContent = (i + 1) + " / " + G.length + " · " + (G[i].caption || "");
  };
  const close = () => {
    ov.style.display = "none";
    document.removeEventListener("keydown", key);
  };
  const key = (e) => {
    if (e.key == "Escape") close();
    else if (e.key == "ArrowLeft") show(i - 1);
    else if (e.key == "ArrowRight") show(i + 1);
    else return;
    e.stopPropagation();
  };
  ov.querySelector(".gx").onclick = close;
  ov.querySelector(".gp").onclick = () => show(i - 1);
  ov.querySelector(".gn").onclick = () => show(i + 1);
  ov.onclick = (e) => {
    if (e.target == ov) close();
  };
  document.addEventListener("keydown", key, true);
  show(i);
  ov.style.display = "flex";
}
// Scope of work vs. the original house, grouped by trade (for contractors). Falls back to the design notes.
function scopeHtml(v) {
  if (!v.scope) return "<p>" + v.desc + "</p>";
  const esc = (t) => String(t).replace(/</g, "&lt;");
  const li = (t) => {
    const d = / \(owner DIY\)\.?$/.test(t);
    return "<li>" + esc(t.replace(/ \(owner DIY\)\.?$/, ".")) + (d ? ' <em class="diy">owner DIY</em>' : "") + "</li>";
  };
  return (
    '<div class="sow"><div class="sowh">Scope of work vs. the original house</div>' +
    v.scope.map(([t, items]) => "<b>" + esc(t) + "</b><ul>" + items.map(li).join("") + "</ul>").join("") +
    (v.confirm && v.confirm.length ? '<b class="cf">Confirm on site</b><ul>' + v.confirm.map(li).join("") + "</ul>" : "") +
    '</div><details class="notes"><summary>Design notes</summary><p>' + v.desc + "</p></details>"
  );
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
// Archived concepts go in a collapsed group at the bottom of the list (still reachable by link).
function vlistSlot(vl, v) {
  if (!v.archived) return vl.querySelector(".varch") ? { appendChild: (b) => vl.insertBefore(b, vl.querySelector(".varch")) } : vl;
  let g = vl.querySelector(".varch");
  if (!g) {
    g = document.createElement("details");
    g.className = "varch";
    g.innerHTML = "<summary></summary>";
    vl.appendChild(g);
  }
  const n = g.querySelectorAll(".ver").length + 1;
  g.querySelector("summary").textContent = "Archived concepts (" + n + ")";
  if (VERS[S.ver] === v) g.open = true;
  return g;
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
    b.dataset.i = i;
    vlistSlot(vl, v).appendChild(b);
  });
}
renderVList();

// Rough cost estimate for a concept (js/data/costs.js), with a "your way" total for owner DIY + kitchen discount.
const COST_DIY = { finish: [0.4, 0.5], elec: [0.65, 0.7], walls: [0.85, 0.85] }; // share of the contractor price left when you DIY
function costPrefs() {
  let p = { diy: true, disc: 30 };
  try {
    const j = JSON.parse(localStorage.getItem("remodel-cost2") || "null");
    if (j) p = Object.assign(p, j);
  } catch (e) {}
  return p;
}
function costAdj(c, p) {
  const f = (i, h) => {
    if (i.cat == "kitchen") return 1 - 0.85 * (p.disc / 100); // discount covers cabinets, counters and install; plumbing/electrical tie-ins excluded
    if (p.diy && COST_DIY[i.cat]) return COST_DIY[i.cat][h];
    return 1;
  };
  const items = c.items.filter((i) => i.cat != "cont").map((i) => Object.assign({}, i, { aLow: i.low * f(i, 0), aHigh: i.high * f(i, 1) }));
  const sum = (key) => items.reduce((t, i) => t + i[key], 0);
  const lo = sum("aLow"), hi = sum("aHigh");
  const cont = c.items.find((i) => i.cat == "cont");
  if (cont) items.push(Object.assign({}, cont, { aLow: lo * 0.15, aHigh: hi * 0.15 }));
  return { items, low: lo * (cont ? 1.15 : 1), high: hi * (cont ? 1.15 : 1) };
}
function costHtml(key) {
  const c = typeof COSTS != "undefined" && COSTS[key];
  if (!c) return "";
  const k = (n) => "$" + (n >= 1000 ? Math.round(n / 1000) + "k" : Math.round(n));
  if (!c.high) return '<div class="cost"><b>Rough cost:</b> ' + (c.label || "baseline, no work") + "</div>";
  const p = costPrefs(), a = costAdj(c, p);
  const tag = { finish: "DIY", elec: "part DIY", walls: "part DIY", kitchen: "discount" };
  const mod = (i) => (i.cat == "kitchen" ? p.disc > 0 : p.diy && COST_DIY[i.cat]);
  const row = (i) =>
    "<tr><td>" + i.item + (mod(i) ? ' <em>' + tag[i.cat] + "</em>" : "") + "</td><td>" +
    (mod(i) ? "<s>" + k(i.low) + "–" + k(i.high) + "</s><br>" : "") + k(i.aLow) + "–" + k(i.aHigh) + "</td></tr>";
  const orow = (i) => "<tr><td>" + i.item + "</td><td>" + k(i.low) + "–" + k(i.high) + "</td></tr>";
  const open = document.querySelector("details.cost") && document.querySelector("details.cost").open;
  return (
    '<details class="cost"' + (open ? " open" : "") + "><summary><b>Rough cost:</b> " + k(a.low) + "–" + k(a.high) + " CAD" +
    (a.high < c.high - 500 ? ' <small>(contractor ' + k(c.low) + "–" + k(c.high) + ")</small>" : "") + " <span>details</span></summary>" +
    '<div class="cctl"><label><input type="checkbox" id="cdiy"' + (p.diy ? " checked" : "") + "> I DIY flooring, paint, caulking, some drywall and electrical</label>" +
    '<label>Kitchen discount <input type="range" id="cdisc" min="0" max="50" step="5" value="' + p.disc + '"> <b>' + p.disc + "%</b></label></div>" +
    "<table>" + a.items.map(row).join("") + "</table>" +
    (c.optional && c.optional.length ? '<div class="fine">Optional, not in the total:</div><table>' + c.optional.map(orow).join("") + "</table>" : "") +
    '<div class="fine">' + (c.notes || "") + " DIY keeps materials and tool rental: flooring/paint drop to about 40–50% of the contractor price, electrical to about 65–70% (BC homeowner permit, inspection still required; panel and gas stay with trades), demo/patch drywall to about 85%. The kitchen discount covers cabinets, counters and install (about 85% of the kitchen line); plumbing and electrical tie-ins and appliances stay at full price. Metro Vancouver 2026 ballpark for planning only; get contractor quotes.</div></details>"
  );
}
function costWire(key) {
  const d = $("cdiy"), r = $("cdisc");
  if (!d || !r) return;
  const upd = () => {
    try {
      localStorage.setItem("remodel-cost2", JSON.stringify({ diy: d.checked, disc: +r.value }));
    } catch (e) {}
    const box = document.querySelector("details.cost");
    box.outerHTML = costHtml(key);
    costWire(key);
  };
  d.onchange = upd;
  r.onchange = upd;
  r.oninput = () => (r.nextElementSibling.textContent = r.value + "%");
}
