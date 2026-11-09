// Edit mode, on the real 3D model. Edit switches to the top-down plan; tap a piece or a wall to
// select it (it turns green and the view zooms in a little), drag to move it, use the bottom bar
// to rotate, resize, duplicate, delete or put it back. Walls: drag to move, drag a green end
// marker to extend/shorten, "+ Wall" to draw, "Cut wall" to open a stretch. While editing you can
// switch to 3D or Walk to look at the draft without saving. Saved edits become "My edit" versions
// kept in this browser (localStorage) and can be exported.
const ED = {
  on: false, W: null, orig: null, key: null, base: null, editKey: null, lv: null, lvName: "upper",
  mode: "plan", tool: "select", sel: null, selUndo: 0, drag: null,
  undo: [], redo: [], ls: "remodel-edits", fx: [], hi: [], ct0: null,
};
const edClone = (o) => JSON.parse(JSON.stringify(o));
const EDT = 14;
const HIGHLIGHT = 0x2fbf71;
const ED_LOOSE = new Set(["rug", "pot", "sofa", "arm", "chair", "stool", "ptable", "table", "plant", "bed"]);
const ED_SKIP = new Set(["pot", "pendant", "pendantbar", "led", "art", "globe"]); // not pickable from above

// ---------- plan geometry (x east, y south, cm)
function edWall(b) {
  const q = b[1], P = [0, 1, 2, 3].map((i) => [q[2 * i], q[2 * i + 1]]);
  const d01 = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]), d12 = Math.hypot(P[2][0] - P[1][0], P[2][1] - P[1][1]);
  let A, B, t;
  if (d01 >= d12) { A = [(P[0][0] + P[3][0]) / 2, (P[0][1] + P[3][1]) / 2]; B = [(P[1][0] + P[2][0]) / 2, (P[1][1] + P[2][1]) / 2]; t = d12; }
  else { A = [(P[0][0] + P[1][0]) / 2, (P[0][1] + P[1][1]) / 2]; B = [(P[3][0] + P[2][0]) / 2, (P[3][1] + P[2][1]) / 2]; t = d01; }
  return { A, B, t, L: Math.hypot(B[0] - A[0], B[1] - A[1]) };
}
function edQuad(A, B, t) {
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, nx = (-(B[1] - A[1]) / L) * (t / 2), ny = ((B[0] - A[0]) / L) * (t / 2);
  return [A[0] - nx, A[1] - ny, B[0] - nx, B[1] - ny, B[0] + nx, B[1] + ny, A[0] + nx, A[1] + ny].map((v) => Math.round(v * 10) / 10);
}
function edPip(x, y, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++)
    if (P[i][1] > y != P[j][1] > y && x < ((P[j][0] - P[i][0]) * (y - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c;
  return c;
}
function edRect(x, y, w, d, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([u, v]) => [x + c * u - s * v, y + s * u + c * v]);
}
function edSegDist(x, y, A, B) {
  const dx = B[0] - A[0], dy = B[1] - A[1], L2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((x - A[0]) * dx + (y - A[1]) * dy) / L2));
  return Math.hypot(x - A[0] - t * dx, y - A[1] - t * dy);
}
const edLvOk = (L) => L == ED.lv || (ED.lvOther && L == ED.lvOther);
function edItems() {
  const W = ED.W, out = [];
  W.lay.forEach((o, i) => { if (edLvOk(o[0]) && !ED_SKIP.has(o[1])) out.push({ k: "L", i, x: o[2], y: o[3], w: o[4], d: o[5], a: o[8] || 0, kind: o[1] }); });
  W.furn.forEach((f, i) => { if (edLvOk(f[0]) && f[8] != 3) out.push({ k: "F", i, x: f[1], y: f[2], w: f[3], d: Math.max(f[4], 4), a: f[5] || 0, kind: f[8] == 1 ? "window" : f[8] == 2 ? "door" : "furn" }); });
  return out;
}
function edGetItem(it) {
  const o = it.k == "L" ? ED.W.lay[it.i] : ED.W.furn[it.i];
  return it.k == "L" ? { x: o[2], y: o[3], w: o[4], d: o[5], a: o[8] || 0, n: o[10] || "" } : { x: o[1], y: o[2], w: o[3], d: o[4], a: o[5] || 0, n: o[9] };
}
function edSetItem(it, p) {
  const o = it.k == "L" ? ED.W.lay[it.i] : ED.W.furn[it.i];
  const ix = it.k == "L" ? { x: 2, y: 3, w: 4, d: 5, a: 8 } : { x: 1, y: 2, w: 3, d: 4, a: 5 };
  for (const k in p) o[ix[k]] = Math.round(p[k] * 100) / 100;
}
// smaller layout pieces whose centre sits inside the picked piece move/rotate/delete with it
function edKids(sel) {
  // parts that sit on or in the picked piece: centre inside its outline (thin fronts and handles may
  // stick out a few cm at the front or back). Neighbours beside it (fillers, end panels, the next cabinet) stay put.
  if (sel.k != "L" || !ED.W.lay[sel.i]) return [];
  const it = edGetItem(sel), A = it.w * it.d, out = [];
  const P = edRect(it.x, it.y, it.w, Math.max(it.d, 2), it.a), P6 = edRect(it.x, it.y, it.w, Math.max(it.d, 2) + 12, it.a);
  ED.W.lay.forEach((o, i) => {
    if (i == sel.i || o[0] != ED.W.lay[sel.i][0] || ED_LOOSE.has(o[1])) return; // separate furniture never rides along
    const a = o[4] * o[5];
    if (a > A) return;
    if (edPip(o[2], o[3], P) || (a < 400 && edPip(o[2], o[3], P6))) out.push(i);
  });
  return out;
}

// ---------- picking: first what the camera actually sees, then a floor-plan fallback
const edRay = new THREE.Raycaster();
function edElev() {
  const l = ED.W.levels.find((l) => l[0] == ED.lv);
  return l ? l[2] : 0;
}
function edNdc(e) {
  const r = rn.domElement.getBoundingClientRect();
  return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
}
function edPlanPt(e) {
  edRay.setFromCamera(edNdc(e), cam);
  const p = new THREE.Vector3();
  if (!edRay.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -edElev()), p)) return null;
  return [p.x, p.z];
}
function edScr(x, h, y) {
  const v = new THREE.Vector3(x, h, y).project(cam), r = rn.domElement.getBoundingClientRect();
  return [r.left + ((v.x + 1) / 2) * r.width, r.top + ((1 - v.y) / 2) * r.height];
}
function edPxCm() {
  const r = rn.domElement.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const a = edPlanPt({ clientX: cx, clientY: cy }), b = edPlanPt({ clientX: cx + 50, clientY: cy });
  return a && b ? Math.hypot(b[0] - a[0], b[1] - a[1]) / 50 : 1;
}
const edVis = (o) => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
function edTagLevel(t) {
  const a = t[0] == "L" ? ED.W.lay[t[1]] : t[0] == "F" ? ED.W.furn[t[1]] : ED.W.boxes[t[1]];
  return a && a[0];
}
function edPick(e) {
  edRay.setFromCamera(edNdc(e), cam);
  const hits = edRay.intersectObjects(S.root.children, true);
  let rug = null;
  for (const h of hits) {
    if (!edVis(h.object)) continue;
    let o = h.object;
    while (o && !(o.userData && o.userData.ed)) o = o.parent;
    if (!o) continue;
    const t = o.userData.ed;
    if (!edLvOk(edTagLevel(t))) continue;
    if (t[0] == "L") {
      const it = ED.W.lay[t[1]];
      if (!it || ED_SKIP.has(it[1]) || it[7] >= 165) continue; // hanging hoods and lights: look through them
      if (it[1] == "rug") continue; // rugs are not picked, so dragging over them pans the view
    }
    if (t[0] == "F" && ED.W.furn[t[1]] && ED.W.furn[t[1]][8] == 3) continue; // stairs are not editable
    return t;
  }
  return rug;
}
function edHitItem(x, y) {
  const its = edItems().filter((it) => edPip(x, y, edRect(it.x, it.y, it.w, Math.max(it.d, 12), it.a)));
  const dw = its.filter((it) => it.kind == "door" || it.kind == "window");
  if (dw.length) return dw[0];
  its.sort((a, b) => b.w * b.d - a.w * a.d);
  const nonRug = its.filter((it) => it.kind != "rug");
  return nonRug[0] || null;
}
function edHitWall(x, y, tol) {
  let best = null, bd = 1e9;
  ED.W.boxes.forEach((b, i) => {
    if (!edLvOk(b[0])) return;
    const w = edWall(b), d = edSegDist(x, y, w.A, w.B) - w.t / 2;
    if (d < tol && d < bd) { bd = d; best = i; }
  });
  return best;
}
function edSnapPt(p, from, tol) {
  let best = null, bd = tol;
  ED.W.boxes.forEach((b) => {
    if (b[0] != ED.lv) return;
    const w = edWall(b);
    [w.A, w.B].forEach((q) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = q.slice(); } });
  });
  if (best) return best;
  if (from) {
    const dx = p[0] - from[0], dy = p[1] - from[1], L = Math.round(Math.hypot(dx, dy)), a = Math.round(Math.atan2(dy, dx) / (Math.PI / 12)) * (Math.PI / 12);
    return [from[0] + Math.cos(a) * L, from[1] + Math.sin(a) * L].map((v) => Math.round(v * 10) / 10);
  }
  return p.map((v) => Math.round(v / 5) * 5);
}

// ---------- 3D highlight and helpers
function edObjs(tag) {
  const out = [];
  S.root.traverse((o) => { const t = o.userData && o.userData.ed; if (t && t[0] == tag[0] && t[1] == tag[1]) out.push(o); });
  return out;
}
function edSelTags() {
  const s = ED.sel;
  if (!s) return [];
  if (s.t == "wall") return [["B", s.i]];
  return [[s.it.k, s.it.i], ...edKids(s.it).map((i) => ["L", i])];
}
function edClearHi() {
  ED.hi.forEach(([m, mat]) => (m.material = mat));
  ED.hi = [];
  ED.fx.forEach((o) => o.parent && o.parent.remove(o));
  ED.fx = [];
  ED.rotAt = null;
}
function edHighlight() {
  edClearHi();
  edSelTags().forEach((tag) =>
    edObjs(tag).forEach((root) =>
      root.traverse((m) => {
        if (!m.isMesh || !m.material || Array.isArray(m.material) || m.material.visible === false) return;
        const mm = m.material.clone();
        if (mm.emissive) { mm.emissive.setHex(HIGHLIGHT); mm.emissiveIntensity = 0.55; }
        if (mm.color) mm.color.lerp(new THREE.Color(HIGHLIGHT), 0.55);
        ED.hi.push([m, m.material]);
        m.material = mm;
      }),
    ),
  );
  if (ED.sel && ED.mode == "plan") edRotHandle();
  const b = ED.sel && ED.sel.t == "wall" && ED.W.boxes[ED.sel.i];
  if (b && ED.mode == "plan") {
    const w = edWall(b), r = Math.max(9, edPxCm() * 10);
    [w.A, w.B].forEach((p) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 4, 24), new THREE.MeshBasicMaterial({ color: HIGHLIGHT }));
      m.position.set(p[0], edElev() + b[2] + b[3] + 4, p[1]);
      S.root.add(m); ED.fx.push(m);
    });
  }
}
// rotate handle: a green knob in front of the selected item, joined to its centre; drag it round
// rotate handle: a green ring beside the selection, joined to its centre; drag it round.
// Items: in front of the item. Walls: beside the wall's midpoint, rotating about that midpoint.
function edRotInfo() {
  const s = ED.sel;
  if (s.t == "wall") {
    const w = edWall(ED.W.boxes[s.i]);
    return { x: (w.A[0] + w.B[0]) / 2, y: (w.A[1] + w.B[1]) / 2, a: Math.atan2(w.B[1] - w.A[1], w.B[0] - w.A[0]), r: w.t / 2 + edPxCm() * 34 };
  }
  const it = edGetItem(s.it);
  return { x: it.x, y: it.y, a: it.a, r: Math.max(it.w, it.d) / 2 + edPxCm() * 34 };
}
const edRotPos = (f, a) => [f.x - Math.sin(a) * f.r, f.y + Math.cos(a) * f.r];
function edRotHandle(a) {
  ED.fx.filter((o) => o.userData.rot).forEach((o) => o.parent && o.parent.remove(o));
  ED.fx = ED.fx.filter((o) => !o.userData.rot);
  if (ED.sel.t == "wall" ? !ED.W.boxes[ED.sel.i] : !(ED.sel.it.k == "L" ? ED.W.lay : ED.W.furn)[ED.sel.it.i]) return;
  const f = edRotInfo(), ang = a == null ? f.a : a, q = edRotPos(f, ang), y = edElev() + 255, k = Math.max(7, edPxCm() * 9);
  const knob = new THREE.Mesh(new THREE.TorusGeometry(k, k * 0.32, 8, 28), new THREE.MeshBasicMaterial({ color: HIGHLIGHT }));
  knob.rotation.x = Math.PI / 2; knob.position.set(q[0], y, q[1]);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(k * 0.45, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  dot.rotation.x = -Math.PI / 2; dot.position.set(q[0], y + 0.5, q[1]);
  const L = Math.hypot(q[0] - f.x, q[1] - f.y), bar = new THREE.Mesh(new THREE.BoxGeometry(Math.max(1.5, edPxCm() * 1.6), 1, L), new THREE.MeshBasicMaterial({ color: HIGHLIGHT, transparent: true, opacity: 0.7 }));
  bar.position.set((q[0] + f.x) / 2, y - 1, (q[1] + f.y) / 2); bar.rotation.y = -ang;
  [knob, dot, bar].forEach((m) => { m.userData.rot = 1; S.root.add(m); ED.fx.push(m); });
  ED.rotAt = [q[0], y, q[1]];
}
const edSnapAng = (a, free) => {
  const d = (a * 180) / Math.PI;
  if (free) return Math.round(d) * Math.PI / 180;
  const n = Math.round(d / 90) * 90;
  return ((Math.abs(d - n) < 4 ? n : Math.round(d / 5) * 5) * Math.PI) / 180; // 5° steps, sticky at right angles
};
function edPreview(A, B, t, color) {
  ED.fx.filter((o) => o.userData.pv).forEach((o) => o.parent && o.parent.remove(o));
  ED.fx = ED.fx.filter((o) => !o.userData.pv);
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  if (L < 1) return;
  const m = new THREE.Mesh(new THREE.BoxGeometry(L, 6, t), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75 }));
  m.position.set((A[0] + B[0]) / 2, edElev() + 250, (A[1] + B[1]) / 2);
  m.rotation.y = -Math.atan2(B[1] - A[1], B[0] - A[0]);
  m.userData.pv = 1;
  S.root.add(m); ED.fx.push(m);
  edMsg(Math.round(L) + " cm", 1);
}
function edRebuild() {
  edClearHi();
  buildModel(ED.W);
  applyAll();
  edHighlight();
}
function edZoomTo(x, y) {
  // fly in a little toward the selection when zoomed out, or re-centre if it is near the screen edge
  const e = edElev(), h = cam.position.y - e, r = rn.domElement.getBoundingClientRect(), sp = edScr(x, e, y);
  const edge = sp[0] < r.left + r.width * 0.2 || sp[0] > r.right - r.width * 0.2 || sp[1] < r.top + r.height * 0.25 || sp[1] > r.bottom - r.height * 0.25;
  const z = r.height > r.width ? 1700 : 950; // portrait phones need to stay higher to show the same width
  if (h >= z + 50) fly([x, e + z, y + 1], [x, e, y]);
  else if (edge) fly([x, cam.position.y, y + 1], [x, e, y]);
}
function edSelect(sel) {
  ED.sel = sel;
  ED.selUndo = ED.undo.length; // "Put back" returns to this state
  edHighlight(); edProps();
}

// ---------- open / close / modes
function edOpen() {
  if (S.walk) exitWalk();
  const v = VERS[S.ver];
  ED.key = v.key;
  ED.base = v.edit ? v.base : v.key;
  ED.editKey = v.edit ? v.key : null;
  ED.orig = DATA[v.key];
  const W = edClone(DATA[v.key]);
  delete W.variants; delete W._base;
  ED.W = W;
  DATA[v.key] = W; // the draft stands in for this design while editing (3D and Walk show it too)
  const L1 = W.levels.find((l) => l[1] == "Level 1"), L0 = W.levels.find((l) => l[2] == 0), LD = W.levels.find((l) => l[1] == "Landing");
  ED.L1 = L1 && L1[0]; ED.L0 = L0 && L0[0]; ED.LD = LD && LD[0];
  ED.undo = []; ED.redo = []; ED.sel = null; ED.selUndo = 0; ED.tool = "select"; ED.on = true;
  ED.ct0 = { rot: ct.enableRotate, left: ct.mouseButtons.LEFT, one: ct.touches.ONE };
  document.body.classList.add("editing");
  $("edov").style.display = "block";
  $("edname").value = v.edit ? v.title : (v.title + " (my edit)").slice(0, 60);
  buildModel(W);
  ED.lvName = S.level == "ground" ? "ground" : "upper";
  edMode("plan");
  edTools(); edProps();
}
function edEnd() {
  edClearHi();
  if (S.walk) exitWalk();
  ED.on = false;
  if (ED.key && ED.orig) DATA[ED.key] = ED.orig;
  document.body.classList.remove("editing");
  $("edov").style.display = "none";
  if (ED.ct0) { ct.enableRotate = ED.ct0.rot; ct.mouseButtons.LEFT = ED.ct0.left; ct.touches.ONE = ED.ct0.one; }
}
function edClose() {
  if (ED.undo.length && !confirm("Discard your changes?")) return;
  edEnd();
  setVersion(S.ver, true);
  goView("3d");
}
function edMode(m) {
  if (m == "walk") {
    if (!S.walk) { ED.mode = "walk"; edClearHi(); enterWalk("living"); }
    edModeBtns();
    return;
  }
  if (S.walk) exitWalk();
  ED.mode = m;
  if (m == "plan") {
    ct.enableRotate = false; ct.mouseButtons.LEFT = THREE.MOUSE.PAN; ct.touches.ONE = THREE.TOUCH.PAN;
    edLevel(ED.lvName, true);
  } else {
    ct.enableRotate = ED.ct0.rot; ct.mouseButtons.LEFT = ED.ct0.left; ct.touches.ONE = ED.ct0.one;
    goView("3d");
    edHighlight();
  }
  edModeBtns(); edTools(); edProps();
}
function edModeBtns() {
  document.querySelectorAll("#edmode button").forEach((b) => b.classList.toggle("on", b.dataset.m == ED.mode));
  document.body.classList.toggle("ed3d", ED.mode != "plan");
}
function edLevel(l, keepSel) {
  ED.lvName = l;
  ED.lv = l == "ground" ? ED.L0 : ED.L1;
  ED.lvOther = l == "ground" ? ED.LD : null;
  document.querySelectorAll("#edlv button").forEach((b) => b.classList.toggle("on", b.dataset.l == l));
  if (!keepSel) ED.sel = null;
  setLevel(l);
  if (ED.mode == "plan") goView("plan");
  edHighlight(); edProps();
}

// ---------- edits
const edSnap = () => JSON.stringify({ boxes: ED.W.boxes, lay: ED.W.lay, furn: ED.W.furn, rooms: ED.W.rooms });
function edPush() { ED.undo.push(edSnap()); if (ED.undo.length > 80) { ED.undo.shift(); ED.selUndo = Math.max(0, ED.selUndo - 1); } ED.redo = []; }
function edRestore(s, keepSel) { Object.assign(ED.W, JSON.parse(s)); if (!keepSel) ED.sel = null; edRebuild(); edProps(); }
function edUndo() { if (!ED.undo.length) return; ED.redo.push(edSnap()); edRestore(ED.undo.pop()); ED.selUndo = Math.min(ED.selUndo, ED.undo.length); }
function edRedo() { if (!ED.redo.length) return; ED.undo.push(edSnap()); edRestore(ED.redo.pop()); }
function edPutBack() {
  // undo everything done to the current selection since it was picked
  if (!ED.sel || ED.undo.length <= ED.selUndo) return;
  const s = ED.undo[ED.selUndo];
  ED.undo.length = ED.selUndo;
  ED.redo = [];
  edRestore(s, true);
  edMsg("Put back where it was");
}
function edFloorPatch(A, B, t) {
  const q = edQuad(A, B, t + 6), P = [0, 1, 2, 3].map((k) => [q[2 * k], q[2 * k + 1]]);
  ED.W.rooms.push([ED.lv, P, 0, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2, "", []]);
}
function edDelete() {
  const s = ED.sel; if (!s) return;
  edPush();
  if (s.t == "wall") {
    const w = edWall(ED.W.boxes[s.i]);
    if (ED.W.boxes[s.i][2] < 5) edFloorPatch(w.A, w.B, w.t);
    ED.W.boxes.splice(s.i, 1);
  } else if (s.it.k == "L") {
    const del = new Set([s.it.i, ...edKids(s.it)]);
    ED.W.lay = ED.W.lay.filter((o, i) => !del.has(i));
  } else ED.W.furn.splice(s.it.i, 1);
  ED.sel = null; edRebuild(); edProps();
}
function edRotWall(da) {
  const s = ED.sel; if (!s || s.t != "wall" || !ED.W.boxes[s.i]) return;
  edPush();
  const w = edWall(ED.W.boxes[s.i]), cx = (w.A[0] + w.B[0]) / 2, cy = (w.A[1] + w.B[1]) / 2, c = Math.cos(da), sn = Math.sin(da), r1 = (v) => Math.round(v * 10) / 10;
  const q = ED.W.boxes[s.i][1];
  ED.W.boxes[s.i][1] = q.map((v, k) => (k % 2 ? r1(cy + (q[k - 1] - cx) * sn + (v - cy) * c) : r1(cx + (v - cx) * c - (q[k + 1] - cy) * sn)));
  edRebuild(); edProps();
}
function edRotate(da) {
  const s = ED.sel; if (!s || s.t != "item") return;
  edPush();
  const it = edGetItem(s.it), c = Math.cos(da), sn = Math.sin(da);
  edKids(s.it).forEach((i) => {
    const o = ED.W.lay[i], dx = o[2] - it.x, dy = o[3] - it.y;
    o[2] = Math.round((it.x + dx * c - dy * sn) * 10) / 10; o[3] = Math.round((it.y + dx * sn + dy * c) * 10) / 10;
    o[8] = Math.round((((o[8] || 0) + da) % (2 * Math.PI)) * 1e4) / 1e4;
  });
  const a = (((it.a + da) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  edSetItem(s.it, { a: Math.round(a * 1e4) / 1e4 });
  edRebuild(); edProps();
}
function edCut(P0, P1) {
  const W = ED.W, out = [];
  let hit = 0;
  W.boxes.forEach((b) => {
    if (b[0] != ED.lv) return out.push(b);
    const w = edWall(b), ux = (w.B[0] - w.A[0]) / (w.L || 1), uy = (w.B[1] - w.A[1]) / (w.L || 1);
    const near = (p) => edSegDist(p[0], p[1], w.A, w.B) < w.t / 2 + 25;
    const cross = (P1[0] - P0[0]) * uy - (P1[1] - P0[1]) * ux;
    if (!near(P0) || !near(P1) || Math.abs(cross) > 0.35 * Math.hypot(P1[0] - P0[0], P1[1] - P0[1])) return out.push(b);
    const s0 = (P0[0] - w.A[0]) * ux + (P0[1] - w.A[1]) * uy, s1 = (P1[0] - w.A[0]) * ux + (P1[1] - w.A[1]) * uy;
    const a = Math.max(0, Math.min(s0, s1)), c = Math.min(w.L, Math.max(s0, s1));
    if (c - a < 1) return out.push(b);
    hit++;
    const at = (s) => [w.A[0] + ux * s, w.A[1] + uy * s];
    if (a > 1) out.push([b[0], edQuad(w.A, at(a), w.t), b[2], b[3], b[4]]);
    if (w.L - c > 1) out.push([b[0], edQuad(at(c), w.B, w.t), b[2], b[3], b[4]]);
    if (b[2] < 5) edFloorPatch(at(a), at(c), w.t);
  });
  if (hit) W.boxes = out;
  return hit;
}

// ---------- pointer handling on the 3D canvas (capture phase: a grab stops the camera from panning)
function edDown(e) {
  if (!ED.on || ED.mode != "plan" || S.walk || e.button > 0) return;
  const p = edPlanPt(e);
  if (!p) return;
  const tol = edPxCm() * 10;
  let grab = null;
  if (ED.tool == "wall") { const q = edSnapPt(p, null, tol * 1.4); grab = { mode: "draw", P0: q, P1: q }; }
  else if (ED.tool == "cut") grab = { mode: "cut", P0: p, P1: p };
  else {
    const s = ED.sel;
    if (s && ED.rotAt) {
      const sp = edScr(...ED.rotAt);
      if (Math.hypot(sp[0] - e.clientX, sp[1] - e.clientY) < 28) {
        const f = edRotInfo(); edPush();
        grab = { mode: "rot", c: [f.x, f.y], a0: f.a, p0: Math.atan2(p[1] - f.y, p[0] - f.x), da: 0, moved: false,
          kids: s.t == "item" ? edKids(s.it).map((i) => [i, ED.W.lay[i][2], ED.W.lay[i][3], ED.W.lay[i][8] || 0]) : [], q0: s.t == "wall" ? ED.W.boxes[s.i][1].slice() : null };
      }
    }
    if (!grab && s && s.t == "wall" && ED.W.boxes[s.i]) {
      // green end markers sit on top of the wall: compare on screen
      const b = ED.W.boxes[s.i], w = edWall(b), top = edElev() + b[2] + b[3];
      for (const [k, q] of [["A", w.A], ["B", w.B]]) {
        const sp = edScr(q[0], top, q[1]);
        if (Math.hypot(sp[0] - e.clientX, sp[1] - e.clientY) < 26) { edPush(); grab = { mode: "end", end: k, w }; break; }
      }
    }
    if (!grab) {
      const t = edPick(e);
      let it = null, wi = null;
      if (t && t[0] == "B") wi = t[1];
      else if (t) it = { k: t[0], i: t[1] };
      else { it = edHitItem(p[0], p[1]); if (!it) wi = edHitWall(p[0], p[1], tol); }
      const same = (a, b) => a && b && a.t == b.t && (a.t == "wall" ? a.i == b.i : a.it.k == b.it.k && a.it.i == b.it.i);
      if (it) {
        const ns = { t: "item", it }, fresh = !same(ns, ED.sel), g = edGetItem(it);
        if (fresh) {
          // first tap only selects (no accidental moves); drag it once it is selected
          edSelect(ns);
          grab = { mode: "tap", at: [g.x, g.y] };
        }
      }
      if (it && !grab) {
        const g = edGetItem(it); edPush();
        const kids = edKids(it).map((i) => [i, ED.W.lay[i][2] - g.x, ED.W.lay[i][3] - g.y]);
        grab = { mode: "move", ox: p[0] - g.x, oy: p[1] - g.y, x0: g.x, y0: g.y, kids, moved: false };
      } else if (!it && wi != null) {
        const ns = { t: "wall", i: wi }, w = edWall(ED.W.boxes[wi]), at = [(w.A[0] + w.B[0]) / 2, (w.A[1] + w.B[1]) / 2];
        if (!same(ns, ED.sel)) { edSelect(ns); grab = { mode: "tap", at }; }
        else { edPush(); grab = { mode: "wallmove", p0: p, q0: ED.W.boxes[wi][1].slice(), moved: false }; }
      } else if (!it && ED.sel) { ED.sel = null; edHighlight(); edProps(); }
    }
  }
  if (!grab) return; // empty floor: the camera pans
  e.stopImmediatePropagation(); e.preventDefault();
  try { rn.domElement.setPointerCapture(e.pointerId); } catch (er) {}
  grab.id = e.pointerId; grab.sx = e.clientX; grab.sy = e.clientY;
  ED.drag = grab;
}
function edMove(e) {
  const d = ED.drag;
  if (!d || e.pointerId != d.id) return;
  e.stopImmediatePropagation();
  if (d.mode == "tap") return;
  if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6 && (d.mode == "move" || d.mode == "wallmove")) return; // ignore finger jitter on a tap
  const p = edPlanPt(e);
  if (!p) return;
  if (d.mode == "move") {
    const nx = Math.round(p[0] - d.ox), ny = Math.round(p[1] - d.oy), dx = nx - d.x0, dy = ny - d.y0;
    edSetItem(ED.sel.it, { x: nx, y: ny });
    d.kids.forEach(([i, kx, ky]) => { ED.W.lay[i][2] = nx + kx; ED.W.lay[i][3] = ny + ky; });
    edSelTags().forEach((tag) => edObjs(tag).forEach((o) => {
      if (o.userData.ex0 == null) { o.userData.ex0 = o.position.x; o.userData.ez0 = o.position.z; }
      o.position.x = o.userData.ex0 + dx; o.position.z = o.userData.ez0 + dy;
    }));
    d.moved = true;
  } else if (d.mode == "rot") {
    let da = Math.atan2(p[1] - d.c[1], p[0] - d.c[0]) - d.p0;
    da = edSnapAng(d.a0 + da, e.shiftKey || e.altKey) - d.a0;
    if (Math.abs(da - d.da) < 1e-6) return;
    const c = Math.cos(da), sn = Math.sin(da);
    edSelTags().forEach((tag) => edObjs(tag).forEach((o) => {
      if (o.userData.rx0 == null) { o.userData.rx0 = o.position.x; o.userData.rz0 = o.position.z; o.userData.ry0 = o.rotation.y; }
      const dx = o.userData.rx0 - d.c[0], dz = o.userData.rz0 - d.c[1];
      o.position.x = d.c[0] + dx * c - dz * sn; o.position.z = d.c[1] + dx * sn + dz * c; o.rotation.y = o.userData.ry0 - da;
    }));
    if (!d.moved) { ED.fx.filter((o) => !o.userData.rot).forEach((o) => o.parent && o.parent.remove(o)); ED.fx = ED.fx.filter((o) => o.userData.rot); } // hide wall-end markers while turning
    d.da = da; d.moved = true;
    edRotHandle(d.a0 + da);
    const deg = Math.round(((((d.a0 + da) * 180) / Math.PI) % 360 + 360) % 360);
    edMsg(deg + "°", 1);
  } else if (d.mode == "wallmove") {
    const dx = Math.round((p[0] - d.p0[0]) / 2) * 2, dy = Math.round((p[1] - d.p0[1]) / 2) * 2;
    ED.W.boxes[ED.sel.i][1] = d.q0.map((v, i) => Math.round((v + (i % 2 ? dy : dx)) * 10) / 10);
    edObjs(["B", ED.sel.i]).forEach((o) => { o.position.x = dx; o.position.z = dy; });
    d.moved = true;
  } else if (d.mode == "end") {
    const w = d.w, ux = (w.B[0] - w.A[0]) / w.L, uy = (w.B[1] - w.A[1]) / w.L, fixed = d.end == "A" ? w.B : w.A, sg = d.end == "A" ? -1 : 1;
    const s = Math.max(5, Math.round((p[0] - fixed[0]) * ux * sg + (p[1] - fixed[1]) * uy * sg));
    const mv = [fixed[0] + ux * s * sg, fixed[1] + uy * s * sg];
    d.A = d.end == "A" ? mv : w.A; d.B = d.end == "A" ? w.B : mv;
    edPreview(d.A, d.B, w.t + 4, HIGHLIGHT);
  } else if (d.mode == "draw") {
    d.P1 = edSnapPt(p, d.P0, edPxCm() * 14);
    edPreview(d.P0, d.P1, +$("edthk").value || EDT, HIGHLIGHT);
  } else if (d.mode == "cut") {
    d.P1 = p;
    edPreview(d.P0, d.P1, 30, 0xd0452f);
  }
}
function edUp(e) {
  const d = ED.drag;
  if (!d || e.pointerId != d.id) return;
  e.stopImmediatePropagation();
  ED.drag = null;
  if (d.mode == "tap") { edZoomTo(d.at[0], d.at[1]); return; } // picked something new: zoom in a little
  if ((d.mode == "move" || d.mode == "wallmove") && !d.moved) { ED.undo.pop(); return; }
  if (d.mode == "rot") {
    if (!d.moved || Math.abs(d.da) < 1e-6) { ED.undo.pop(); edHighlight(); return; }
    const c = Math.cos(d.da), sn = Math.sin(d.da), r1 = (v) => Math.round(v * 10) / 10, rA = (v) => Math.round(((v % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) * 1e4) / 1e4;
    d.kids.forEach(([i, x, y, a]) => { const o = ED.W.lay[i], dx = x - d.c[0], dy = y - d.c[1]; o[2] = r1(d.c[0] + dx * c - dy * sn); o[3] = r1(d.c[1] + dx * sn + dy * c); o[8] = rA(a + d.da); });
    if (ED.sel.t == "wall") ED.W.boxes[ED.sel.i][1] = d.q0.map((v, k, q) => (k % 2 ? r1(d.c[1] + (q[k - 1] - d.c[0]) * sn + (v - d.c[1]) * c) : r1(d.c[0] + (v - d.c[0]) * c - (q[k + 1] - d.c[1]) * sn)));
    else edSetItem(ED.sel.it, { a: rA(d.a0 + d.da) });
    edRebuild(); edProps(); return;
  }
  if (d.mode == "end") { if (d.A) ED.W.boxes[ED.sel.i][1] = edQuad(d.A, d.B, d.w.t); else ED.undo.pop(); }
  if (d.mode == "draw") {
    if (Math.hypot(d.P1[0] - d.P0[0], d.P1[1] - d.P0[1]) >= 10) {
      edPush();
      ED.W.boxes.push([ED.lv, edQuad(d.P0, d.P1, +$("edthk").value || EDT), 0, +$("edhgt").value || 243.8, 1]);
      ED.sel = { t: "wall", i: ED.W.boxes.length - 1 }; ED.selUndo = ED.undo.length;
    }
  } else if (d.mode == "cut") {
    edPush();
    if (!edCut(d.P0, d.P1)) { ED.undo.pop(); edMsg("Drag along a wall to cut an opening in it"); }
    ED.sel = null;
  }
  edRebuild(); edProps();
}
function edMsg(t, quick) {
  const el = $("edmsg"); el.textContent = t; el.style.opacity = 1;
  clearTimeout(edMsg.t); edMsg.t = setTimeout(() => (el.style.opacity = 0), quick ? 900 : 2600);
}

// ---------- bottom bar
function edProps() {
  const el = $("edprops"), s = ED.sel;
  if (!s || (s.t == "wall" && !ED.W.boxes[s.i]) || (s.t == "item" && !(s.it.k == "L" ? ED.W.lay : ED.W.furn)[s.it.i])) {
    el.innerHTML = '<span class="edhint">' + edHint() + "</span>";
    return;
  }
  const back = ED.undo.length > ED.selUndo ? '<button id="edpback">↺ Put back</button>' : "";
  if (s.t == "wall") {
    const b = ED.W.boxes[s.i], w = edWall(b);
    el.innerHTML = '<b>Wall · ' + Math.round(w.L) + " × " + Math.round(w.t) + " cm, " + Math.round(b[3]) + ' cm high</b><label>Length <input id="edpL" type="number" value="' + Math.round(w.L) + '"></label><label>Thick <input id="edpT" type="number" value="' + Math.round(w.t) + '"></label>' +
      '<label>Height <input id="edpH" type="number" value="' + Math.round(b[3]) + '"></label>' +
      '<button id="edpr1">⟲ 15°</button><button id="edpr2">⟳ 15°</button><button id="edpr3">⟳ 90°</button>' + back + '<button id="edpdel" class="danger">Delete</button><button id="edpdone">Done</button>' +
      '<span class="edhint">Drag to move it; drag a green end to extend or shorten it; drag the green ring to rotate it.</span>';
    $("edpr1").onclick = () => edRotWall(-Math.PI / 12);
    $("edpr2").onclick = () => edRotWall(Math.PI / 12);
    $("edpr3").onclick = () => edRotWall(Math.PI / 2);
    const upd = () => {
      edPush();
      const L = Math.max(5, +$("edpL").value || w.L), t = Math.max(2, +$("edpT").value || w.t), ux = (w.B[0] - w.A[0]) / w.L, uy = (w.B[1] - w.A[1]) / w.L;
      b[1] = edQuad(w.A, [w.A[0] + ux * L, w.A[1] + uy * L], t);
      b[3] = Math.max(10, +$("edpH").value || b[3]);
      edRebuild(); edProps();
    };
    ["edpL", "edpT", "edpH"].forEach((k) => ($(k).onchange = upd));
  } else {
    const it = edGetItem(s.it);
    if (!it.n && s.it.k == "L") {
      const lb = edKids(s.it).map((i) => String(ED.W.lay[i][10] || "")).find((t) => t);
      it.n = lb ? lb.split(/[:(]/)[0].trim() : ED.W.lay[s.it.i][1];
    }
    const nk = s.it.k == "L" ? edKids(s.it).length : 0;
    el.innerHTML = "<b>" + String(it.n || "Item").replace(/</g, "&lt;").slice(0, 40) + " · " + Math.round(it.w) + " × " + Math.round(it.d) + " cm</b>" + (nk ? '<span class="edhint">(+' + nk + " parts)</span>" : "") +
      '<label>W <input id="edpW" type="number" value="' + Math.round(it.w) + '"></label><label>D <input id="edpD" type="number" value="' + Math.round(it.d) + '"></label>' +
      '<label>Angle <input id="edpA" type="number" value="' + Math.round(((it.a * 180) / Math.PI) % 360) + '">°</label>' +
      '<span class="edhint">Drag the green ring to rotate</span><button id="edpr1">⟲ 15°</button><button id="edpr2">⟳ 15°</button><button id="edpr3">⟳ 90°</button>' + back +
      '<button id="edpdup">Duplicate</button><button id="edpdel" class="danger">Delete</button><button id="edpdone">Done</button>';
    const upd = () => {
      edPush();
      edSetItem(s.it, { w: Math.max(1, +$("edpW").value || it.w), d: Math.max(1, +$("edpD").value || it.d), a: (((+$("edpA").value || 0) % 360) * Math.PI) / 180 });
      edRebuild(); edProps();
    };
    ["edpW", "edpD", "edpA"].forEach((k) => ($(k).onchange = upd));
    $("edpr1").onclick = () => edRotate(-Math.PI / 12);
    $("edpr2").onclick = () => edRotate(Math.PI / 12);
    $("edpr3").onclick = () => edRotate(Math.PI / 2);
    $("edpdup").onclick = () => {
      edPush();
      const arr = s.it.k == "L" ? ED.W.lay : ED.W.furn, kids = edKids(s.it).map((i) => edClone(ED.W.lay[i])), c = edClone(arr[s.it.i]), off = 40;
      if (s.it.k == "L") { c[2] += off; c[3] += off; kids.forEach((k) => { k[2] += off; k[3] += off; }); } else { c[1] += off; c[2] += off; }
      arr.push(c);
      const ni = arr.length - 1;
      if (s.it.k == "L") kids.forEach((k) => ED.W.lay.push(k));
      ED.sel = { t: "item", it: { k: s.it.k, i: ni } }; ED.selUndo = ED.undo.length - 1;
      edRebuild(); edProps();
    };
  }
  if ($("edpback")) $("edpback").onclick = edPutBack;
  $("edpdel").onclick = edDelete;
  $("edpdone").onclick = () => { ED.sel = null; edHighlight(); edProps(); };
}
function edHint() {
  if (ED.mode == "3d") return "Looking at your draft in 3D. Switch back to Plan to keep editing, or Save.";
  return {
    select: "Tap furniture or a wall to select it (it turns green and shows its size). Once selected, drag it to move it, or drag the green ring to rotate it. + Add puts new cabinets, appliances, furniture, doors and windows in. Drag empty floor to pan; pinch or scroll to zoom.",
    wall: "Drag to draw a new wall. It snaps to wall ends and to 15° angles.",
    cut: "Drag along a wall to cut an opening in it.",
  }[ED.tool];
}
function edTools() {
  document.querySelectorAll("#edtools button").forEach((b) => b.classList.toggle("on", b.dataset.t == ED.tool));
  $("edwallopts").style.display = ED.tool == "wall" && ED.mode == "plan" ? "" : "none";
  rn.domElement.style.cursor = ED.on && ED.mode == "plan" && ED.tool != "select" ? "crosshair" : "";
}


// ---------- library of things you can add (each entry: parts [kind, dx, dy, w, d, h, elev, colour, label])
const ED_CAB = 2040100, ED_TOP = 16250869, ED_UP = 15986404, ED_OAK = 0xc8a87a, ED_SS = 0xc9ccce, ED_DK = 0x1d1f21;
const ED_LIB = [
  ["Kitchen", [
    ["Base cabinet 60", [["box", 0, 0, 60, 63, 3, 86, ED_TOP, ""], ["box", 0, -1.5, 60, 60, 86, 0, ED_CAB, "Base cabinet (drawers)"]]],
    ["Base cabinet 90", [["box", 0, 0, 90, 63, 3, 86, ED_TOP, ""], ["box", 0, -1.5, 90, 60, 86, 0, ED_CAB, "Base cabinet"]]],
    ["Sink cabinet", [["box", 0, 0, 90, 63, 3, 86, ED_TOP, ""], ["box", 0, -1.5, 90, 60, 86, 0, ED_CAB, "Sink base"], ["box", 0, 3, 78, 45, 1, 89, 0x8a9096, "Sink"]]],
    ["Dishwasher", [["box", 0, 0, 60, 63, 3, 86, ED_TOP, ""], ["box", 0, -1.5, 60, 60, 84, 0, ED_SS, "Dishwasher"]]],
    ["Upper cabinet 80", [["box", 0, 0, 80, 35, 102.8, 140, ED_UP, "Upper cabinet"]]],
    ["Tall cabinet", [["box", 0, 0, 76, 60, 242.8, 0, ED_UP, "Tall cabinet"]]],
    ["Fridge", [["box", 0, 0, 84, 66, 185, 0, ED_SS, "Fridge"], ["box", 0, 0, 84, 66, 57.8, 185, ED_UP, "Cabinet above fridge"]]],
    ["Oven + microwave tower", [["box", 0, 0, 76, 60, 242.8, 0, 0xeae6dc, "Oven tower"], ["box", 0, -29.5, 66, 1.5, 58, 82, ED_DK, "Wall oven"], ["box", 0, -29.5, 62, 1.5, 42, 148, ED_DK, "Built-in microwave"]]],
    ["Cooktop", [["box", 0, 0, 76, 52, 1, 90, 0x111111, "Induction cooktop"]]],
    ["Range hood", [["hood", 0, 0, 90, 48, 28, 150, 12173252, "Range hood"]]],
    ["Island 280", [["island", 0, 0, 280, 100, 90, 0, ED_CAB, "Island"]]],
    ["Island hood", [["box", 0, 0, 90, 60, 10, 168, 0xb9bec2, "Island hood"], ["box", 0, 0, 32, 26, 65, 178, 0xb9bec2, "Island hood flue"]]],
    ["Bar stool", [["stool", 0, 0, 40, 40, 65, 0, 0, "Bar stool"]]],
    ["Pendant light", [["pendant", 0, 0, 30, 30, 24, 165, 1842204, ""]]],
    ["Pantry shelving", [["box", 0, 0, 120, 30, 210, 0, ED_OAK, "Pantry shelving"]]],
  ]],
  ["Living", [
    ["Sofa", [["sofa", 0, 0, 210, 90, 80, 0, 0xe4dccd, "Sofa"]]],
    ["Sofa with chaise", [["lsofa", 0, 0, 240, 100, 82, 0, 14998733, "Sofa with chaise"]]],
    ["Armchair", [["arm", 0, 0, 80, 80, 80, 0, 0xd8cfc0, "Armchair"]]],
    ["Coffee table", [["round", 0, 0, 90, 90, 40, 0, 12094298, "Coffee table"]]],
    ["Side table", [["round", 0, 0, 45, 45, 50, 0, 12094298, "Side table"]]],
    ["TV 75 in", [["tv", 0, 0, 165, 8, 93, 60, 1118481, "TV"]]],
    ["TV console", [["console", 0, 0, 180, 40, 45, 0, 7031343, "TV console"]]],
    ["Gas fireplace", [["box", 0, 0, 150, 5, 110, 0, 0x4b4b4d, "Fireplace surround"], ["box", 0, 3.3, 112, 2, 46, 32, 0x141414, "Gas fireplace"], ["led", 0, 4, 96, 1, 6, 36, 0, ""], ["box", 0, 9.5, 150, 20, 2, 0, 0x3a3a3c, "Hearth"]]],
    ["Rug", [["rug", 0, 0, 240, 170, 1, 0.5, 14077890, ""]]],
    ["Plant", [["plant", 0, 0, 44, 44, 140, 0, 6261338, ""]]],
    ["Bench", [["bench", 0, 0, 120, 45, 45, 0, 12094298, "Bench"]]],
  ]],
  ["Dining", [
    ["Dining table", [["table", 0, 0, 200, 95, 75, 0, 3355443, "Dining table"]]],
    ["Pedestal table", [["ptable", 0, 0, 220, 100, 75, 0, 1842204, "Dining table"]]],
    ["Dining chair", [["chair", 0, 0, 45, 45, 88, 0, 0xe8e4dc, "Chair"]]],
    ["Drinks bar", [["box", 0, 0, 104, 48, 3, 86, ED_TOP, ""], ["box", 0, -1.5, 100, 45, 86, 0, ED_OAK, "Drinks bar (wine fridge)"], ["box", 0, 8, 100, 30, 75, 140, 0xd9dfe2, "Glass-front upper"]]],
  ]],
  ["Bedroom", [
    ["Queen bed", [["box", 0, 0, 152, 203, 55, 0, ED_OAK, "Queen bed"], ["box", 0, -100, 160, 6, 110, 0, 0x3b3f45, "Headboard"]]],
    ["King bed", [["box", 0, 0, 193, 203, 55, 0, ED_OAK, "King bed"], ["box", 0, -100, 200, 6, 110, 0, 0x3b3f45, "Headboard"]]],
    ["Nightstand", [["box", 0, 0, 45, 40, 55, 0, ED_OAK, "Nightstand"]]],
    ["Dresser", [["box", 0, 0, 120, 50, 80, 0, ED_OAK, "Dresser"]]],
    ["Desk", [["box", 0, 0, 140, 65, 3, 73, ED_OAK, "Desk"]]],
    ["Desk chair", [["chair", 0, 0, 58, 58, 120, 0, 0x2c2f34, "Desk chair"]]],
    ["Bookcase", [["box", 0, 0, 80, 35, 180, 0, 0xf2f1ee, "Bookcase"]]],
  ]],
  ["Doors and windows", [
    ["Door 80", "door"], ["Pocket door 76", "pocket"], ["Window 120", "window"],
  ]],
];
function edAdd(name, parts) {
  const r = rn.domElement.getBoundingClientRect(), c = edPlanPt({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }) || [600, 600];
  // start at the middle of the view, but step aside if something is already there
  const busy = (px, py) => edItems().some((it) => edPip(px, py, edRect(it.x, it.y, it.w + 60, it.d + 60, it.a)));
  let x = Math.round(c[0]), y = Math.round(c[1]);
  for (let r = 60, k = 0; busy(x, y) && r < 600; k++) {
    const a = k * 0.9;
    x = Math.round(c[0] + Math.cos(a) * r); y = Math.round(c[1] + Math.sin(a) * r);
    if (k % 7 == 6) r += 60;
  }
  edPush();
  if (typeof parts == "string") {
    // doors and windows go on the furniture list; cut the wall first, then drag the door into the gap
    const f = parts == "window" ? [ED.lv, x, y, 120, 4, 0, 92.7, 111.8, 1, "Window"] : [ED.lv, x, y, parts == "pocket" ? 76 : 80, 4, 0, 0, 208.3, 2, parts == "pocket" ? "Pocket door" : "Door"];
    ED.W.furn.push(f);
    ED.sel = { t: "item", it: { k: "F", i: ED.W.furn.length - 1 } };
    edMsg(parts == "window" ? "Window added: drag it onto a wall" : "Door added: cut an opening in the wall, then drag the door into it");
  } else {
    // biggest part first so it becomes the piece the others move with
    const ps = parts.slice().sort((a, b) => b[3] * b[4] - a[3] * a[4]);
    let first = -1;
    ps.forEach((p) => {
      ED.W.lay.push([ED.lv, p[0], x + p[1], y + p[2], p[3], p[4], p[5], p[6], 0, p[7], p[8]]);
      if (first < 0) first = ED.W.lay.length - 1;
    });
    ED.sel = { t: "item", it: { k: "L", i: first } };
    edMsg(name + " added in the middle of the view: drag it into place");
  }
  ED.selUndo = ED.undo.length;
  edLib(false);
  if (ED.mode != "plan") edMode("plan");
  edRebuild(); edProps();
  edZoomTo(x, y);
}
function edLib(show) {
  const el = $("edlib");
  if (show === undefined) show = el.style.display == "none";
  if (show && !el.dataset.built) {
    el.dataset.built = 1;
    el.innerHTML = '<div class="edlh"><b>Add to this floor</b><button id="edlx">✕</button></div>' +
      ED_LIB.map(([g, items], gi) => '<div class="edlg">' + g + '</div><div class="edlr">' + items.map((it, ii) => '<button data-g="' + gi + '" data-i="' + ii + '">' + it[0] + "</button>").join("") + "</div>").join("");
    el.querySelectorAll("button[data-g]").forEach((b) => (b.onclick = () => { const it = ED_LIB[+b.dataset.g][1][+b.dataset.i]; edAdd(it[0], it[1]); }));
    $("edlx").onclick = () => edLib(false);
  }
  el.style.display = show ? "block" : "none";
}

// ---------- saving
function edLoadSaved() {
  let a = [];
  try { a = JSON.parse(localStorage.getItem(ED.ls) || "[]"); } catch (e) {}
  a.forEach(edRegister);
  if (a.length) renderVList();
}
function edRegister(rec) {
  const key = "e_" + rec.id;
  DATA[key] = rec.D;
  const i = VERS.findIndex((v) => v.key == key), bv = VERS.find((v) => v.key == rec.base) || VERS[0];
  const v = {
    key, rid: rec.id, edit: true, custom: true, base: rec.base, title: rec.title,
    sub: "My edit · based on " + (bv.chip || bv.title).replace(/^[^·]*· /, ""), chip: "EDIT · " + rec.title,
    kind: "My edit (saved in this browser)", headline: rec.title,
    desc: "Your own edit of " + bv.title + ", saved in this browser. Use Edit to keep changing it, or Export to share the file.",
    tags: ["My edit"], btn: "Zoom in", proposed: true, blinds: bv.blinds, scope: bv.scope, confirm: bv.confirm,
  };
  if (i >= 0) VERS[i] = v; else VERS.push(v);
  return key;
}
function edSave() {
  const title = ($("edname").value || "My edit").trim().slice(0, 60);
  let a = [];
  try { a = JSON.parse(localStorage.getItem(ED.ls) || "[]"); } catch (e) {}
  const id = ED.editKey ? ED.editKey.slice(2) : Date.now().toString(36);
  const D = ED.W;
  const rec = { id, title, base: ED.base, D, t: Date.now() };
  a = a.filter((r) => r.id != id); a.push(rec);
  try { localStorage.setItem(ED.ls, JSON.stringify(a)); }
  catch (e) { edMsg("Could not save in this browser (storage full?). Use Export instead."); return; }
  edEnd();
  const key = edRegister(rec);
  renderVList();
  setVersion(VERS.findIndex((v) => v.key == key));
  goView("3d");
}
function edExport() {
  const title = ($("edname").value || "My edit").trim();
  const blob = new Blob([JSON.stringify({ title, base: ED.base, D: ED.W }, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = title.replace(/[^\w-]+/g, "_") + ".json"; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function edDeleteSaved(rid) {
  try { localStorage.setItem(ED.ls, JSON.stringify(JSON.parse(localStorage.getItem(ED.ls) || "[]").filter((r) => r.id != rid))); } catch (e) {}
  const i = VERS.findIndex((v) => v.rid == rid && v.edit);
  if (i < 0) return;
  const was = S.ver;
  VERS.splice(i, 1);
  delete DATA["e_" + rid];
  if (was == i) setVersion(VERS.length - 1);
  else if (was > i) S.ver = was - 1;
  renderVList();
}

// ---------- wiring
{
  const ov = document.createElement("div");
  ov.id = "edov";
  ov.innerHTML =
    '<div id="edbar"><b class="edt">✎ Edit</b>' +
    '<div class="seg" id="edmode"><button data-m="plan">Plan</button><button data-m="3d">3D</button><button data-m="walk">Walk</button></div>' +
    '<div class="seg" id="edtools"><button data-t="select">Select</button><button data-t="wall">+ Wall</button><button data-t="cut">✂ Cut</button></div><button id="edaddb" class="pri2">+ Add</button>' +
    '<span id="edwallopts" style="display:none"><label>Thick <input id="edthk" type="number" value="14"></label><label>Height <input id="edhgt" type="number" value="243.8"></label></span>' +
    '<div class="seg" id="edlv"><button data-l="ground">Ground</button><button data-l="upper">Upper</button></div>' +
    '<button id="edun" title="Undo (Ctrl+Z)">↶</button><button id="edre" title="Redo">↷</button>' +
    '<span class="sp"></span><input id="edname" placeholder="Name your edit"><button id="edexp">Export</button><button id="edcancel">Cancel</button><button id="edsave" class="pri">Save</button></div>' +
    '<div id="edmsg"></div><div id="edlib" style="display:none"></div><div id="edprops"></div>';
  document.body.appendChild(ov);
  const c = rn.domElement;
  c.addEventListener("pointerdown", edDown, true);
  c.addEventListener("pointermove", edMove, true);
  c.addEventListener("pointerup", edUp, true);
  c.addEventListener("pointercancel", edUp, true);
  // OrbitControls (three r128) drives touch through touch events, not pointer events: while something
  // is grabbed, swallow those too so the view does not pan under your finger
  const edTouch = (e) => {
    if (ED.on && ED.drag) { e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); }
  };
  ["touchstart", "touchmove", "touchend", "touchcancel"].forEach((t) => c.addEventListener(t, edTouch, { capture: true, passive: false }));
  document.querySelectorAll("#edmode button").forEach((b) => (b.onclick = () => edMode(b.dataset.m)));
  document.querySelectorAll("#edtools button").forEach((b) => (b.onclick = () => { if (ED.mode != "plan") edMode("plan"); ED.tool = b.dataset.t; ED.sel = null; edHighlight(); edTools(); edProps(); }));
  document.querySelectorAll("#edlv button").forEach((b) => (b.onclick = () => edLevel(b.dataset.l)));
  $("edun").onclick = edUndo; $("edre").onclick = edRedo; $("edaddb").onclick = () => edLib();
  $("edsave").onclick = edSave; $("edcancel").onclick = edClose; $("edexp").onclick = edExport;
  addEventListener("keydown", (e) => {
    if (!ED.on || S.walk || /INPUT/.test((document.activeElement || {}).tagName)) return;
    if (e.key == "Delete" || e.key == "Backspace") { edDelete(); e.preventDefault(); }
    else if (e.key == "r" || e.key == "R") edRotate(e.shiftKey ? -Math.PI / 2 : Math.PI / 2);
    else if ((e.ctrlKey || e.metaKey) && e.key == "z") { e.shiftKey ? edRedo() : edUndo(); e.preventDefault(); }
    else if ((e.ctrlKey || e.metaKey) && e.key == "y") { edRedo(); e.preventDefault(); }
    else if (e.key == "Escape") { if (ED.sel) { ED.sel = null; edHighlight(); edProps(); } else edClose(); }
    else return;
    e.stopPropagation();
  }, true);
  // leaving walk mode while editing returns to the edit plan
  const ex0 = exitWalk;
  exitWalk = function () {
    const r = ex0.apply(this, arguments);
    if (ED.on && ED.mode == "walk") { ED.mode = "plan"; ct.enableRotate = false; ct.mouseButtons.LEFT = THREE.MOUSE.PAN; ct.touches.ONE = THREE.TOUCH.PAN; edLevel(ED.lvName, true); edModeBtns(); edProps(); }
    return r;
  };
  const b = document.createElement("button");
  b.id = "editb"; b.textContent = "✎ Edit"; b.title = "Edit this design: move furniture, add, cut or extend walls";
  b.onclick = edOpen;
  $("walkb").after(b);
  const mb = document.createElement("button");
  mb.textContent = "✎ Edit design"; mb.dataset.mt = "edit"; // mobile.js wires #mtools buttons by data-mt
  $("mtools").prepend(mb);
  edLoadSaved();
}
