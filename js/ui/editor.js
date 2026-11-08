// Edit mode, on the real 3D model: the view switches to the top-down plan and you pick things
// in it. The picked piece turns green; drag to move it, rotate/resize/delete from the bottom bar.
// Walls can be moved, extended (drag a green end marker), cut (drag along a wall) or drawn.
// Saved edits become "My edit" versions kept in this browser (localStorage) and can be exported.
const ED = {
  on: false, W: null, base: null, editKey: null, lv: null, tool: "select", sel: null, drag: null,
  undo: [], redo: [], ls: "remodel-edits", fx: [], hi: [], ct0: null,
};
const edClone = (o) => JSON.parse(JSON.stringify(o));
const EDT = 14;
const HIGHLIGHT = 0x2fbf71;

// ---------- geometry helpers (plan coordinates: x east, y south, cm)
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
  W.lay.forEach((o, i) => { if (edLvOk(o[0]) && o[1] != "pot") out.push({ k: "L", i, x: o[2], y: o[3], w: o[4], d: o[5], a: o[8] || 0, kind: o[1] }); });
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
  if (sel.k != "L") return [];
  const it = edGetItem(sel), P = edRect(it.x, it.y, it.w, Math.max(it.d, 6), it.a), A = it.w * it.d, out = [];
  ED.W.lay.forEach((o, i) => {
    if (i == sel.i || o[0] != ED.W.lay[sel.i][0] || o[1] == "rug" || o[1] == "pot") return;
    if (o[4] * o[5] < A && edPip(o[2], o[3], P)) out.push(i);
  });
  return out;
}

// ---------- hit testing on the plan
function edHitItem(x, y) {
  const its = edItems().filter((it) => edPip(x, y, edRect(it.x, it.y, it.w, Math.max(it.d, 12), it.a)));
  const dw = its.filter((it) => it.kind == "door" || it.kind == "window");
  if (dw.length) return dw[0];
  its.sort((a, b) => b.w * b.d - a.w * a.d);
  const nonRug = its.filter((it) => it.kind != "rug");
  return nonRug[0] || its[its.length - 1] || null;
}
function edHitWall(x, y, tol) {
  let best = null, bd = 1e9;
  ED.W.boxes.forEach((b, i) => {
    if (b[0] != ED.lv) return;
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

// ---------- 3D link: plan point under the pointer, objects for a selection, highlight
const edRay = new THREE.Raycaster();
function edElev() {
  const l = ED.W.levels.find((l) => l[0] == ED.lv);
  return l ? l[2] : 0;
}
function edPlanPt(e) {
  const r = rn.domElement.getBoundingClientRect();
  const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  edRay.setFromCamera(v, cam);
  const pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), -edElev()), p = new THREE.Vector3();
  if (!edRay.ray.intersectPlane(pl, p)) return null;
  return [p.x, p.z];
}
function edPxCm() {
  // centimetres per screen pixel at the floor, for pick tolerances
  const r = rn.domElement.getBoundingClientRect();
  const a = edPlanPt({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }), b = edPlanPt({ clientX: r.left + r.width / 2 + 50, clientY: r.top + r.height / 2 });
  return a && b ? Math.hypot(b[0] - a[0], b[1] - a[1]) / 50 : 1;
}
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
  ED.fx.forEach((o) => { o.parent && o.parent.remove(o); });
  ED.fx = [];
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
  // wall end markers
  if (ED.sel && ED.sel.t == "wall" && ED.W.boxes[ED.sel.i]) {
    const b = ED.W.boxes[ED.sel.i], w = edWall(b), r = Math.max(9, edPxCm() * 9);
    [w.A, w.B].forEach((p) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 4, 24), new THREE.MeshBasicMaterial({ color: HIGHLIGHT }));
      m.position.set(p[0], edElev() + b[2] + b[3] + 4, p[1]);
      S.root.add(m); ED.fx.push(m);
    });
  }
}
function edPreview(A, B, t, color) {
  // temporary bar showing a wall being drawn or a cut being made
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

// ---------- open / close
function edOpen() {
  if (S.walk) exitWalk();
  const v = VERS[S.ver];
  ED.base = v.edit ? v.base : v.key;
  ED.editKey = v.edit ? v.key : null;
  const W = edClone(DATA[v.key]);
  delete W.variants; delete W._base;
  ED.W = W;
  const L1 = W.levels.find((l) => l[1] == "Level 1"), L0 = W.levels.find((l) => l[2] == 0), LD = W.levels.find((l) => l[1] == "Landing");
  ED.L1 = L1 && L1[0]; ED.L0 = L0 && L0[0]; ED.LD = LD && LD[0];
  ED.undo = []; ED.redo = []; ED.sel = null; ED.tool = "select"; ED.on = true;
  document.body.classList.add("editing");
  $("edov").style.display = "block";
  $("edname").value = v.edit ? v.title : (v.title + " (my edit)").slice(0, 60);
  ED.ct0 = { rot: ct.enableRotate, left: ct.mouseButtons.LEFT, one: ct.touches.ONE };
  ct.enableRotate = false;
  ct.mouseButtons.LEFT = THREE.MOUSE.PAN;
  ct.touches.ONE = THREE.TOUCH.PAN;
  edLevel(S.level == "ground" ? "ground" : "upper");
  buildModel(W);
  applyAll();
  edTools(); edProps();
}
function edClose() {
  edClearHi();
  ED.on = false;
  document.body.classList.remove("editing");
  $("edov").style.display = "none";
  if (ED.ct0) { ct.enableRotate = ED.ct0.rot; ct.mouseButtons.LEFT = ED.ct0.left; ct.touches.ONE = ED.ct0.one; }
  setVersion(S.ver, true);
}
function edLevel(l) {
  ED.lv = l == "ground" ? ED.L0 : ED.L1;
  ED.lvOther = l == "ground" ? ED.LD : null;
  document.querySelectorAll("#edlv button").forEach((b) => b.classList.toggle("on", b.dataset.l == l));
  ED.sel = null;
  setLevel(l);
  goView("plan");
  edHighlight(); edProps();
}

// ---------- edits
const edSnap = () => JSON.stringify({ boxes: ED.W.boxes, lay: ED.W.lay, furn: ED.W.furn, rooms: ED.W.rooms });
function edPush() { ED.undo.push(edSnap()); if (ED.undo.length > 80) ED.undo.shift(); ED.redo = []; }
function edRestore(s) { Object.assign(ED.W, JSON.parse(s)); ED.sel = null; edRebuild(); edProps(); }
function edUndo() { if (!ED.undo.length) return; ED.redo.push(edSnap()); edRestore(ED.undo.pop()); }
function edRedo() { if (!ED.redo.length) return; ED.undo.push(edSnap()); edRestore(ED.redo.pop()); }
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
function edRotate(da) {
  const s = ED.sel; if (!s || s.t != "item") return;
  edPush();
  const it = edGetItem(s.it), c = Math.cos(da), sn = Math.sin(da);
  edKids(s.it).forEach((i) => {
    const o = ED.W.lay[i], dx = o[2] - it.x, dy = o[3] - it.y;
    o[2] = Math.round((it.x + dx * c - dy * sn) * 10) / 10; o[3] = Math.round((it.y + dx * sn + dy * c) * 10) / 10;
    o[8] = Math.round((((o[8] || 0) + da) % (2 * Math.PI)) * 1e4) / 1e4;
  });
  let a = (((it.a + da) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
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

// ---------- pointer handling on the 3D canvas (capture phase, so the camera does not pan while editing)
function edDown(e) {
  if (!ED.on || e.button > 0) return;
  const p = edPlanPt(e);
  if (!p) return;
  const tol = edPxCm() * 10;
  let grab = null;
  if (ED.tool == "wall") { const q = edSnapPt(p, null, tol * 1.4); grab = { mode: "draw", P0: q, P1: q }; }
  else if (ED.tool == "cut") grab = { mode: "cut", P0: p, P1: p };
  else {
    const s = ED.sel;
    if (s && s.t == "wall") {
      const w = edWall(ED.W.boxes[s.i]);
      for (const [k, q] of [["A", w.A], ["B", w.B]])
        if (Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.max(tol * 1.6, 16)) { edPush(); grab = { mode: "end", end: k, w }; break; }
    }
    if (!grab) {
      const it = edHitItem(p[0], p[1]), wi = it ? null : edHitWall(p[0], p[1], tol);
      if (it) {
        ED.sel = { t: "item", it };
        const g = edGetItem(it); edPush();
        const kids = edKids(it).map((i) => [i, ED.W.lay[i][2] - g.x, ED.W.lay[i][3] - g.y]);
        grab = { mode: "move", ox: p[0] - g.x, oy: p[1] - g.y, x0: g.x, y0: g.y, kids, moved: false };
        edHighlight(); edProps();
      } else if (wi != null) {
        ED.sel = { t: "wall", i: wi }; edPush();
        grab = { mode: "wallmove", p0: p, q0: ED.W.boxes[wi][1].slice(), moved: false };
        edHighlight(); edProps();
      } else if (ED.sel) { ED.sel = null; edHighlight(); edProps(); }
    }
  }
  if (!grab) return; // empty floor: let the camera pan
  e.stopImmediatePropagation(); e.preventDefault();
  rn.domElement.setPointerCapture(e.pointerId);
  grab.id = e.pointerId;
  ED.drag = grab;
}
function edMove(e) {
  const d = ED.drag;
  if (!d || e.pointerId != d.id) return;
  e.stopImmediatePropagation();
  const p = edPlanPt(e);
  if (!p) return;
  if (d.mode == "move") {
    const nx = Math.round(p[0] - d.ox), ny = Math.round(p[1] - d.oy), dx = nx - d.x0, dy = ny - d.y0;
    edSetItem(ED.sel.it, { x: nx, y: ny });
    d.kids.forEach(([i, kx, ky]) => { ED.W.lay[i][2] = nx + kx; ED.W.lay[i][3] = ny + ky; });
    // move the 3D objects directly while dragging; rebuild once on release
    edSelTags().forEach((tag) => edObjs(tag).forEach((o) => {
      if (o.userData.ex0 == null) { o.userData.ex0 = o.position.x; o.userData.ez0 = o.position.z; }
      o.position.x = o.userData.ex0 + dx; o.position.z = o.userData.ez0 + dy;
    }));
    d.moved = true; edMsg(nx + ", " + ny, 1);
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
  if ((d.mode == "move" || d.mode == "wallmove") && !d.moved) { ED.undo.pop(); return; }
  if (d.mode == "end" && d.A) ED.W.boxes[ED.sel.i][1] = edQuad(d.A, d.B, d.w.t);
  if (d.mode == "end" && !d.A) ED.undo.pop();
  if (d.mode == "draw") {
    if (Math.hypot(d.P1[0] - d.P0[0], d.P1[1] - d.P0[1]) >= 10) {
      edPush();
      ED.W.boxes.push([ED.lv, edQuad(d.P0, d.P1, +$("edthk").value || EDT), 0, +$("edhgt").value || 243.8, 1]);
      ED.sel = { t: "wall", i: ED.W.boxes.length - 1 };
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

// ---------- bottom bar: properties of the selected piece
function edProps() {
  const el = $("edprops"), s = ED.sel;
  if (!s) { el.innerHTML = '<span class="edhint">' + edHint() + "</span>"; return; }
  if (s.t == "wall") {
    const b = ED.W.boxes[s.i]; if (!b) { el.innerHTML = ""; return; }
    const w = edWall(b);
    el.innerHTML = '<b>Wall</b><label>Length <input id="edpL" type="number" value="' + Math.round(w.L) + '"></label><label>Thick <input id="edpT" type="number" value="' + Math.round(w.t) + '"></label>' +
      '<label>Height <input id="edpH" type="number" value="' + Math.round(b[3]) + '"></label><button id="edpdel" class="danger">Delete</button><span class="edhint">Drag to move it; drag a green end to extend or shorten it.</span>';
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
    el.innerHTML = "<b>" + String(it.n || "Item").replace(/</g, "&lt;").slice(0, 40) + "</b>" + (nk ? '<span class="edhint">(+' + nk + " parts)</span>" : "") +
      '<label>W <input id="edpW" type="number" value="' + Math.round(it.w) + '"></label><label>D <input id="edpD" type="number" value="' + Math.round(it.d) + '"></label>' +
      '<label>Angle <input id="edpA" type="number" value="' + Math.round(((it.a * 180) / Math.PI) % 360) + '">°</label>' +
      '<button id="edpr1">⟲ 15°</button><button id="edpr2">⟳ 15°</button><button id="edpr3">⟳ 90°</button><button id="edpdup">Duplicate</button><button id="edpdel" class="danger">Delete</button>';
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
      const arr = s.it.k == "L" ? ED.W.lay : ED.W.furn, base = arr[s.it.i], kids = edKids(s.it).map((i) => edClone(ED.W.lay[i]));
      const c = edClone(base), off = 40;
      if (s.it.k == "L") { c[2] += off; c[3] += off; kids.forEach((k) => { k[2] += off; k[3] += off; }); } else { c[1] += off; c[2] += off; }
      arr.push(c);
      const ni = arr.length - 1;
      if (s.it.k == "L") kids.forEach((k) => ED.W.lay.push(k));
      ED.sel = { t: "item", it: { k: s.it.k, i: ni } };
      edRebuild(); edProps();
    };
  }
  $("edpdel").onclick = edDelete;
}
function edHint() {
  return {
    select: "Tap a piece of furniture or a wall to select it (it turns green), then drag to move it. Drag empty floor to pan; pinch or scroll to zoom.",
    wall: "Drag to draw a new wall. It snaps to wall ends and to 15° angles.",
    cut: "Drag along a wall to cut an opening in it.",
  }[ED.tool];
}
function edTools() {
  document.querySelectorAll("#edtools button").forEach((b) => b.classList.toggle("on", b.dataset.t == ED.tool));
  $("edwallopts").style.display = ED.tool == "wall" ? "" : "none";
  rn.domElement.style.cursor = ED.on && ED.tool != "select" ? "crosshair" : "";
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
  const rec = { id, title, base: ED.base, D: ED.W, t: Date.now() };
  a = a.filter((r) => r.id != id); a.push(rec);
  try { localStorage.setItem(ED.ls, JSON.stringify(a)); }
  catch (e) { edMsg("Could not save in this browser (storage full?). Use Export instead."); return; }
  const key = edRegister(rec);
  renderVList();
  edClearHi();
  ED.on = false;
  document.body.classList.remove("editing");
  $("edov").style.display = "none";
  if (ED.ct0) { ct.enableRotate = ED.ct0.rot; ct.mouseButtons.LEFT = ED.ct0.left; ct.touches.ONE = ED.ct0.one; }
  setVersion(VERS.findIndex((v) => v.key == key));
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
    '<div class="seg" id="edtools"><button data-t="select">Select / move</button><button data-t="wall">+ Wall</button><button data-t="cut">✂ Cut wall</button></div>' +
    '<span id="edwallopts" style="display:none"><label>Thick <input id="edthk" type="number" value="14"></label><label>Height <input id="edhgt" type="number" value="243.8"></label></span>' +
    '<div class="seg" id="edlv"><button data-l="ground">Ground</button><button data-l="upper">Upper</button></div>' +
    '<button id="edun" title="Undo (Ctrl+Z)">↶</button><button id="edre" title="Redo">↷</button>' +
    '<span class="sp"></span><input id="edname" placeholder="Name your edit"><button id="edexp">Export</button><button id="edcancel">Cancel</button><button id="edsave" class="pri">Save</button></div>' +
    '<div id="edmsg"></div><div id="edprops"></div>';
  document.body.appendChild(ov);
  const c = rn.domElement;
  c.addEventListener("pointerdown", edDown, true);
  c.addEventListener("pointermove", edMove, true);
  c.addEventListener("pointerup", edUp, true);
  c.addEventListener("pointercancel", edUp, true);
  document.querySelectorAll("#edtools button").forEach((b) => (b.onclick = () => { ED.tool = b.dataset.t; ED.sel = null; edHighlight(); edTools(); edProps(); }));
  document.querySelectorAll("#edlv button").forEach((b) => (b.onclick = () => edLevel(b.dataset.l)));
  $("edun").onclick = edUndo; $("edre").onclick = edRedo;
  $("edsave").onclick = edSave; $("edcancel").onclick = edClose; $("edexp").onclick = edExport;
  addEventListener("keydown", (e) => {
    if (!ED.on || /INPUT/.test((document.activeElement || {}).tagName)) return;
    if (e.key == "Delete" || e.key == "Backspace") { edDelete(); e.preventDefault(); }
    else if (e.key == "r" || e.key == "R") edRotate(e.shiftKey ? -Math.PI / 2 : Math.PI / 2);
    else if ((e.ctrlKey || e.metaKey) && e.key == "z") { e.shiftKey ? edRedo() : edUndo(); e.preventDefault(); }
    else if ((e.ctrlKey || e.metaKey) && e.key == "y") { edRedo(); e.preventDefault(); }
    else if (e.key == "Escape") { if (ED.sel) { ED.sel = null; edHighlight(); edProps(); } else edClose(); }
    else return;
    e.stopPropagation();
  }, true);
  const b = document.createElement("button");
  b.id = "editb"; b.textContent = "✎ Edit"; b.title = "Edit this design: move furniture, add, cut or extend walls";
  b.onclick = edOpen;
  $("walkb").after(b);
  const mb = document.createElement("button");
  mb.textContent = "✎ Edit design"; mb.dataset.mt = "edit"; // mobile.js wires #mtools buttons by data-mt
  $("mtools").prepend(mb);
  edLoadSaved();
}
