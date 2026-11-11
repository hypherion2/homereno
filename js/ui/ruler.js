// Ruler: measure the distance between two points in the 3D view or the floor plan (also while editing).
// Drag from one point to the other, or tap/click the first point and then the second. Points snap to wall
// corners and to the corners of cabinets and furniture; lines snap square (0°/90°) unless Shift is held.
// Distances are horizontal (plan) distances in feet-inches and metres; a height difference is shown too.
// Measurements stay on screen (re-projected as the view moves) until removed with × or Clear.
const RU = { on: false, list: [], cur: null, pending: null, hover: null, snap: null };
function ruFt(cm) { const t = Math.round(Math.abs(cm) / 2.54); return Math.floor(t / 12) + "'-" + (t % 12) + '"'; }
function ruLabel(m) {
  const dx = m.B.x - m.A.x, dz = m.B.z - m.A.z, d = Math.hypot(dx, dz), dy = m.B.y - m.A.y;
  let t = ruFt(d) + "  (" + (d / 100).toFixed(2) + " m)";
  if (Math.abs(dy) > 5) t += "  ↕ " + ruFt(dy);
  return t;
}
function ruData() { return typeof ED != "undefined" && ED.on && ED.W ? ED.W : DATA[VERS[S.ver].key]; }
function ruLevels() {
  const D = ruData();
  if (typeof ED != "undefined" && ED.on) return D.levels.filter((l) => l[0] == ED.lv);
  return D.levels.filter((l) => (l[1] == "Level 1" ? S.level != "ground" : S.level != "upper"));
}
// snap targets: wall corners (floor and top) and the top corners of cabinets/furniture on the visible level(s)
function ruTargets() {
  const D = ruData(), out = [];
  ruLevels().forEach((l) => {
    const L = l[0], el = l[2];
    D.boxes.forEach((b) => {
      if (b[0] != L) return;
      for (let i = 0; i < 8; i += 2) { out.push(new THREE.Vector3(b[1][i], el + b[2], b[1][i + 1])); out.push(new THREE.Vector3(b[1][i], el + Math.min(b[2] + b[3], 243.8 * S.cut), b[1][i + 1])); }
    });
    (D.lay || []).forEach((o) => {
      if (o[0] != L || ["pot", "led", "pendant", "pendantbar", "rug", "globe", "art"].includes(o[1]) || Math.min(o[4], o[5]) < 4) return;
      const c = Math.cos(o[8] || 0), s = Math.sin(o[8] || 0), y = el + o[7] + o[6];
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([u, v]) => { const px = (u * o[4]) / 2, pz = (v * o[5]) / 2; out.push(new THREE.Vector3(o[2] + c * px - s * pz, y, o[3] + s * px + c * pz)); });
    });
  });
  return out;
}
function ruScr(v) {
  const p = v.clone().project(cam), r = rn.domElement.getBoundingClientRect();
  return [r.left + ((p.x + 1) / 2) * r.width, r.top + ((1 - p.y) / 2) * r.height, p.z];
}
const ruRay = new THREE.Raycaster();
function ruPick(e, from) {
  const touch = e.pointerType == "touch" || e.pointerType == "pen", R = touch ? 24 : 12;
  // 1. snap to a corner near the pointer
  let best = null, bd = R;
  RU.targets.forEach((v) => {
    const [sx, sy, sz] = ruScr(v);
    if (sz > 1) return;
    const d = Math.hypot(sx - e.clientX, sy - e.clientY);
    if (d < bd) { bd = d; best = v; }
  });
  RU.snap = best;
  if (best) return best.clone();
  // 2. otherwise the surface under the pointer (or the floor of the active level)
  const r = rn.domElement.getBoundingClientRect();
  ruRay.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), cam);
  let p = null;
  const hit = ruRay.intersectObjects(S.root.children, true).find((h) => {
    let o = h.object, vis = true;
    while (o) { if (o.visible === false) { vis = false; break; } o = o.parent; }
    return vis && h.object.isMesh && h.object.material && h.object.material.visible !== false && !h.object.material.transparent;
  });
  if (hit) p = hit.point.clone();
  else {
    const lv = ruLevels()[0], el = lv ? lv[2] : 0, q = new THREE.Vector3();
    if (ruRay.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -el), q)) p = q;
  }
  if (!p) return null;
  // 3. square the line to the plan axes when it is nearly square (Shift keeps it free)
  if (from && !e.shiftKey) {
    const dx = p.x - from.x, dz = p.z - from.z, a = Math.atan2(dz, dx), n = Math.round(a / (Math.PI / 2)) * (Math.PI / 2);
    if (Math.abs(a - n) < 0.06) { const L = Math.hypot(dx, dz); p.x = from.x + Math.cos(n) * L; p.z = from.z + Math.sin(n) * L; }
  }
  return p;
}
function ruSync() {
  const svg = $("rusvg"); if (!svg) return;
  const all = RU.list.slice(), live = RU.cur ? RU.cur : RU.pending && RU.hover ? { A: RU.pending, B: RU.hover, live: 1 } : null;
  if (live) all.push(live);
  let h = "", labs = "";
  const r = rn.domElement.getBoundingClientRect();
  all.forEach((m, i) => {
    const a = ruScr(m.A), b = ruScr(m.B);
    if (a[2] > 1 || b[2] > 1) return;
    h += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="rul"/>' +
      '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="4.5" class="rud"/><circle cx="' + b[0] + '" cy="' + b[1] + '" r="4.5" class="rud"/>';
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 3 || !m.live)
      labs += '<div class="rulab' + (m.live ? " live" : "") + '" style="left:' + mx + "px;top:" + my + 'px">' + ruLabel(m) + (m.live ? "" : ' <b data-i="' + i + '" title="Remove">×</b>') + "</div>";
  });
  if (RU.pending && !RU.cur) { const a = ruScr(RU.pending); h += '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="6" class="rud on"/>'; }
  if (RU.snap && RU.on) { const s = ruScr(RU.snap); h += '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="9" class="rusnap"/>'; }
  svg.innerHTML = h;
  $("rulabs").innerHTML = labs;
}
function ruBarPos() {
  const bar = $("rubar"), eb = $("edbar"), v = $("views");
  bar.classList.toggle("top", document.body.classList.contains("editing") || !matchMedia("(max-width: 820px)").matches);
  if (!bar.classList.contains("top")) { bar.style.top = ""; return; } // phones: above the design strip (CSS)
  const ref = eb && eb.offsetParent && document.body.classList.contains("editing") ? eb : v && v.offsetParent ? v : null;
  bar.style.top = (ref ? ref.getBoundingClientRect().bottom + 8 : 70) + "px";
}
function ruSet(on) {
  RU.on = on; RU.cur = null; RU.pending = null; RU.hover = null; RU.snap = null;
  document.body.classList.toggle("ruler", on);
  document.querySelectorAll(".rubtn").forEach((b) => b.classList.toggle("on", on));
  $("rubar").style.display = on ? "" : "none";
  if (on) { RU.targets = ruTargets(); ruBarPos(); }
  if (typeof invalidate == "function") invalidate(300);
  ruSync();
}
(function ruInit() {
  const ov = document.createElement("div");
  ov.id = "ruov";
  ov.innerHTML = '<svg id="rusvg"></svg><div id="rulabs"></div>' +
    '<div id="rubar" class="card" style="display:none"><span>📏 <b>Ruler</b> · drag between two points, or tap one then the other. Snaps to corners' +
    '<span class="rudesk">; hold Shift for a free angle</span>.</span><button id="ruclear">Clear</button><button id="rudone" class="pri">Done</button></div>';
  document.body.appendChild(ov);
  const mk = (txt) => { const b = document.createElement("button"); b.className = "rubtn"; b.textContent = txt; b.title = "Measure the distance between two points"; b.onclick = () => ruSet(!RU.on); return b; };
  ($("editb") || $("walkb")).after(mk("📏 Ruler"));
  if ($("edaddb")) $("edaddb").after(mk("📏 Ruler")); // also in the edit bar
  if ($("tabbar")) { // phones: a tab next to Options
    const t = mk(""); t.dataset.tab = "ruler"; t.innerHTML = "<i>📏</i><span>Ruler</span>";
    $("tabbar").querySelector('[data-tab="options"]').before(t);
  }
  $("ruclear").onclick = () => { RU.list = []; RU.pending = null; ruSync(); };
  $("rudone").onclick = () => ruSet(false);
  $("rulabs").addEventListener("click", (e) => { const i = e.target.dataset && e.target.dataset.i; if (i != null) { RU.list.splice(+i, 1); ruSync(); } });
  const c = rn.domElement, onCanvas = (e) => e.target === c;
  addEventListener("pointerdown", (e) => {
    if (!RU.on || !onCanvas(e) || S.walk || e.button > 0 || e.isPrimary === false) return;
    RU.targets = ruTargets();
    const p = ruPick(e, RU.pending);
    if (!p) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if (RU.pending) { RU.list.push({ A: RU.pending, B: p }); RU.pending = null; RU.hover = null; ruSync(); return; }
    RU.cur = { A: p, B: p.clone(), sx: e.clientX, sy: e.clientY, id: e.pointerId, moved: false };
    try { c.setPointerCapture(e.pointerId); } catch (er) {}
    ruSync();
  }, true);
  addEventListener("pointermove", (e) => {
    if (!RU.on || S.walk) return;
    if (RU.cur && e.pointerId == RU.cur.id) {
      e.stopImmediatePropagation();
      if (Math.hypot(e.clientX - RU.cur.sx, e.clientY - RU.cur.sy) > 6) RU.cur.moved = true;
      const p = ruPick(e, RU.cur.A); if (p) RU.cur.B = p;
      ruSync();
    } else if (RU.pending && onCanvas(e) && e.pointerType == "mouse") {
      const p = ruPick(e, RU.pending); if (p) RU.hover = p; ruSync();
    } else if (onCanvas(e) && e.pointerType == "mouse" && !e.buttons) { ruPick(e); ruSync(); }
  }, true);
  const up = (e) => {
    if (!RU.cur || e.pointerId != RU.cur.id) return;
    e.stopImmediatePropagation();
    const m = RU.cur; RU.cur = null;
    if (m.moved) RU.list.push({ A: m.A, B: m.B });
    else RU.pending = m.A; // a tap: wait for the second point
    ruSync();
  };
  addEventListener("pointerup", up, true);
  addEventListener("pointercancel", up, true);
  // one finger measures, two fingers pan and zoom (a second finger cancels a half-drawn line)
  ["touchstart", "touchmove", "touchend"].forEach((t) => addEventListener(t, (e) => {
    if (!RU.on || !onCanvas(e) || S.walk) return;
    if (e.touches.length >= 2) { RU.cur = null; ruSync(); return; }
    if (t == "touchstart" || RU.cur) { e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); }
  }, { capture: true, passive: false }));
  addEventListener("keydown", (e) => { if (RU.on && e.key == "Escape") { if (RU.pending || RU.cur) { RU.pending = RU.cur = null; ruSync(); } else ruSet(false); e.stopPropagation(); } }, true);
  addEventListener("resize", () => RU.on && ruBarPos());
  // keep the ruler out of walk mode, and refresh the snap targets when the model changes
  const ew = window.enterWalk;
  if (typeof ew == "function") window.enterWalk = function () { if (RU.on) ruSet(false); return ew.apply(this, arguments); };
  const bm = window.buildModel;
  window.buildModel = function () { const r = bm.apply(this, arguments); if (RU.on) RU.targets = ruTargets(); return r; };
})();
