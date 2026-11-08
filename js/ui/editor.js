// Edit mode: a top-down 2D editor over the current design. Move, rotate, resize and delete
// furniture; draw, cut, extend, move and delete walls. Saved edits become "My edit" versions
// stored in this browser (localStorage) and can be exported as JSON.
const ED = {
  on: false, W: null, base: null, lv: null, tool: "select", sel: null, drag: null,
  undo: [], redo: [], view: { x: 0, y: 0, s: 1 }, ls: "remodel-edits", editKey: null,
};
const edClone = (o) => JSON.parse(JSON.stringify(o));
const EDT = 14; // default new wall thickness (cm)

// ---------- geometry helpers
function edWall(b) {
  // centre line A->B, thickness t of a 4-point wall box
  const q = b[1], P = [0, 1, 2, 3].map((i) => [q[2 * i], q[2 * i + 1]]);
  const d01 = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]), d12 = Math.hypot(P[2][0] - P[1][0], P[2][1] - P[1][1]);
  let A, B, t;
  if (d01 >= d12) {
    A = [(P[0][0] + P[3][0]) / 2, (P[0][1] + P[3][1]) / 2]; B = [(P[1][0] + P[2][0]) / 2, (P[1][1] + P[2][1]) / 2]; t = d12;
  } else {
    A = [(P[0][0] + P[1][0]) / 2, (P[0][1] + P[1][1]) / 2]; B = [(P[3][0] + P[2][0]) / 2, (P[3][1] + P[2][1]) / 2]; t = d01;
  }
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
// unified accessors for the three kinds of things that can be selected
function edItems() {
  const W = ED.W, out = [];
  const lvl = (L) => L == ED.lv || (ED.lvOther && L == ED.lvOther);
  W.lay.forEach((o, i) => { if (lvl(o[0]) && o[1] != "pot") out.push({ k: "L", i, x: o[2], y: o[3], w: o[4], d: o[5], a: o[8] || 0, n: o[10] || "", kind: o[1] }); });
  W.furn.forEach((f, i) => { if (lvl(f[0]) && f[8] != 3) out.push({ k: "F", i, x: f[1], y: f[2], w: f[3], d: Math.max(f[4], 4), a: f[5] || 0, n: f[9], kind: f[8] == 1 ? "window" : f[8] == 2 ? "door" : "furn" }); });
  return out;
}
function edSetItem(it, p) {
  const o = it.k == "L" ? ED.W.lay[it.i] : ED.W.furn[it.i];
  const ix = it.k == "L" ? { x: 2, y: 3, w: 4, d: 5, a: 8 } : { x: 1, y: 2, w: 3, d: 4, a: 5 };
  for (const k in p) o[ix[k]] = Math.round(p[k] * 100) / 100;
}
function edGetItem(it) {
  const o = it.k == "L" ? ED.W.lay[it.i] : ED.W.furn[it.i];
  return it.k == "L" ? { x: o[2], y: o[3], w: o[4], d: o[5], a: o[8] || 0, n: o[10] || "" } : { x: o[1], y: o[2], w: o[3], d: o[4], a: o[5] || 0, n: o[9] };
}

// ---------- open / close
function edOpen() {
  if (S.walk) exitWalk();
  const v = VERS[S.ver];
  ED.base = v.key;
  ED.editKey = v.edit ? v.key : null;
  const W = edClone(DATA[v.key]);
  delete W.variants; delete W._base;
  ED.W = W;
  const L1 = W.levels.find((l) => l[1] == "Level 1"), L0 = W.levels.find((l) => l[2] == 0), LD = W.levels.find((l) => l[1] == "Landing");
  ED.L1 = L1 && L1[0]; ED.L0 = L0 && L0[0]; ED.LD = LD && LD[0];
  edLevel(S.level == "ground" ? "ground" : "upper");
  ED.undo = []; ED.redo = []; ED.sel = null; ED.tool = "select";
  ED.on = true;
  $("edov").style.display = "flex";
  $("edname").value = v.edit ? v.title : (v.title + " (my edit)").slice(0, 60);
  edFit(); edTools(); edDraw(); edProps();
}
function edClose() {
  ED.on = false;
  $("edov").style.display = "none";
}
function edLevel(l) {
  ED.lvName = l;
  ED.lv = l == "ground" ? ED.L0 : ED.L1;
  ED.lvOther = l == "ground" ? ED.LD : null;
  document.querySelectorAll("#edlv button").forEach((b) => b.classList.toggle("on", b.dataset.l == l));
  ED.sel = null;
  if (ED.on) { edDraw(); edProps(); }
}
function edFit() {
  const c = $("edcv"), r = c.getBoundingClientRect();
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  ED.W.boxes.forEach((b) => { if (b[0] == ED.L1 || b[0] == ED.L0) for (let i = 0; i < 8; i += 2) { x0 = Math.min(x0, b[1][i]); x1 = Math.max(x1, b[1][i]); y0 = Math.min(y0, b[1][i + 1]); y1 = Math.max(y1, b[1][i + 1]); } });
  const s = Math.min(r.width / (x1 - x0 + 80), r.height / (y1 - y0 + 80));
  ED.view = { s, x: r.width / 2 - ((x0 + x1) / 2) * s, y: r.height / 2 - ((y0 + y1) / 2) * s };
}
const edToScr = (x, y) => [x * ED.view.s + ED.view.x, y * ED.view.s + ED.view.y];
const edToW = (px, py) => [(px - ED.view.x) / ED.view.s, (py - ED.view.y) / ED.view.s];

// ---------- drawing
function edDraw() {
  const c = $("edcv"), r = c.getBoundingClientRect(), dpr = devicePixelRatio || 1;
  if (c.width != Math.round(r.width * dpr)) { c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); }
  const g = c.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = "#f3f1ec"; g.fillRect(0, 0, r.width, r.height);
  const W = ED.W, lv = (L) => L == ED.lv || (ED.lvOther && L == ED.lvOther);
  const poly = (P, fill, stroke, lw) => {
    g.beginPath(); P.forEach((p, i) => { const [sx, sy] = edToScr(p[0], p[1]); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 1; g.stroke(); }
  };
  // grid (1 m)
  g.strokeStyle = "rgba(0,0,0,.05)"; g.lineWidth = 1;
  const [gx0, gy0] = edToW(0, 0), [gx1, gy1] = edToW(r.width, r.height);
  for (let x = Math.floor(gx0 / 100) * 100; x < gx1; x += 100) { const [sx] = edToScr(x, 0); g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx, r.height); g.stroke(); }
  for (let y = Math.floor(gy0 / 100) * 100; y < gy1; y += 100) { const [, sy] = edToScr(0, y); g.beginPath(); g.moveTo(0, sy); g.lineTo(r.width, sy); g.stroke(); }
  W.rooms.forEach((rm) => { if (lv(rm[0]) && rm[4] > -100) poly(rm[1], "#fbf8f2", null); });
  // stairs
  W.furn.forEach((f) => { if (lv(f[0]) && f[8] == 3) poly(edRect(f[1], f[2], f[3], f[4], f[5]), "rgba(60,140,80,.15)", "rgba(60,140,80,.6)", 1); });
  // furniture and layout items
  const items = edItems();
  items.forEach((it) => {
    if (it.kind == "door" || it.kind == "window") return;
    const P = edRect(it.x, it.y, it.w, it.d, it.a), rug = it.kind == "rug";
    poly(P, rug ? null : "rgba(200,180,150,.22)", rug ? "rgba(0,0,0,.12)" : "rgba(120,100,80,.55)", 1);
  });
  // walls
  W.boxes.forEach((b, i) => {
    if (b[0] != ED.lv) return;
    const P = [0, 1, 2, 3].map((k) => [b[1][2 * k], b[1][2 * k + 1]]), full = b[2] < 5 && b[3] > 200;
    poly(P, full ? "#2d2d2d" : "#9a9a9a", null);
  });
  // doors and windows
  items.forEach((it) => {
    if (it.kind != "door" && it.kind != "window") return;
    poly(edRect(it.x, it.y, it.w, Math.max(it.d, 8), it.a), it.kind == "door" ? "#e8956a" : "#7fb0e6", null);
  });
  // labels for bigger items
  g.font = "11px system-ui"; g.fillStyle = "rgba(60,50,40,.8)"; g.textAlign = "center"; g.textBaseline = "middle";
  items.forEach((it) => {
    if (it.kind == "door" || it.kind == "window" || !it.n) return;
    if (it.w * ED.view.s < 60 || it.d * ED.view.s < 14) return;
    const [sx, sy] = edToScr(it.x, it.y); g.fillText(String(it.n).split(/[:(]/)[0].slice(0, 22), sx, sy);
  });
  // selection
  const s = ED.sel;
  if (s && s.t == "item") {
    const it = edGetItem(s.it);
    poly(edRect(it.x, it.y, it.w, Math.max(it.d, 6), it.a), "rgba(46,125,90,.18)", "#2e7d5a", 2);
    const [hx, hy] = edToScr(it.x + Math.cos(it.a - Math.PI / 2) * 0 + Math.sin(it.a) * 0, it.y);
    g.fillStyle = "#2e7d5a"; g.beginPath(); g.arc(hx, hy, 4, 0, 7); g.fill();
  } else if (s && s.t == "wall" && W.boxes[s.i]) {
    const b = W.boxes[s.i], P = [0, 1, 2, 3].map((k) => [b[1][2 * k], b[1][2 * k + 1]]);
    poly(P, "rgba(46,125,90,.55)", "#2e7d5a", 2);
    const w = edWall(b);
    [w.A, w.B].forEach((p) => { const [sx, sy] = edToScr(p[0], p[1]); g.fillStyle = "#fff"; g.strokeStyle = "#2e7d5a"; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy, 7, 0, 7); g.fill(); g.stroke(); });
    edDim(g, w.A, w.B, Math.round(w.L) + " cm");
  }
  // in-progress wall / cut
  const d = ED.drag;
  if (d && (d.mode == "draw" || d.mode == "cut") && d.P1) {
    const [ax, ay] = edToScr(d.P0[0], d.P0[1]), [bx, by] = edToScr(d.P1[0], d.P1[1]);
    g.strokeStyle = d.mode == "draw" ? "#2e7d5a" : "#d0452f"; g.lineWidth = d.mode == "draw" ? Math.max(3, EDT * ED.view.s) : 4;
    g.setLineDash(d.mode == "cut" ? [6, 4] : []); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.setLineDash([]);
    edDim(g, d.P0, d.P1, Math.round(Math.hypot(d.P1[0] - d.P0[0], d.P1[1] - d.P0[1])) + " cm");
  }
}
function edDim(g, A, B, t) {
  const [ax, ay] = edToScr(A[0], A[1]), [bx, by] = edToScr(B[0], B[1]);
  g.font = "600 12px system-ui"; g.textAlign = "center"; g.textBaseline = "middle";
  const w = g.measureText(t).width + 10, mx = (ax + bx) / 2, my = (ay + by) / 2 - 16;
  g.fillStyle = "rgba(255,255,255,.92)"; g.fillRect(mx - w / 2, my - 10, w, 20);
  g.fillStyle = "#1f3b2f"; g.fillText(t, mx, my);
}

// ---------- hit testing
function edHitItem(x, y) {
  const its = edItems().filter((it) => edPip(x, y, edRect(it.x, it.y, it.w, Math.max(it.d, 10), it.a)));
  // doors/windows first, then the largest non-rug piece (so a click moves the whole island, not one drawer)
  const dw = its.filter((it) => it.kind == "door" || it.kind == "window");
  if (dw.length) return dw[0];
  its.sort((a, b) => b.w * b.d - a.w * a.d);
  const nonRug = its.filter((it) => it.kind != "rug");
  return (nonRug[0] || its[its.length - 1]) || null;
}
function edHitWall(x, y) {
  let best = -1, bd = 1e9;
  ED.W.boxes.forEach((b, i) => {
    if (b[0] != ED.lv) return;
    const P = [0, 1, 2, 3].map((k) => [b[1][2 * k], b[1][2 * k + 1]]);
    if (edPip(x, y, P)) { const w = edWall(b), a = w.L * w.t; if (a < bd) { bd = a; best = i; } }
  });
  if (best >= 0) return best;
  const tol = 8 / ED.view.s; // allow a few pixels around thin walls
  ED.W.boxes.forEach((b, i) => {
    if (b[0] != ED.lv) return;
    const w = edWall(b), d = edSegDist(x, y, w.A, w.B) - w.t / 2;
    if (d < tol && d < bd) { bd = d; best = i; }
  });
  return best >= 0 ? best : null;
}
function edSegDist(x, y, A, B) {
  const dx = B[0] - A[0], dy = B[1] - A[1], L2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((x - A[0]) * dx + (y - A[1]) * dy) / L2));
  return Math.hypot(x - A[0] - t * dx, y - A[1] - t * dy);
}
function edSnapPt(p, from) {
  // snap to wall ends/corners within 12 px, else 5 cm grid; with "from", also snap angle to 15 degrees
  const tol = 12 / ED.view.s;
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

// ---------- grouped pieces (counter tops, drawers, handles, sinks sit inside a bigger piece)
function edKids(sel) {
  const it = edGetItem(sel), P = edRect(it.x, it.y, it.w, Math.max(it.d, 6), it.a), A = it.w * it.d, out = [];
  if (sel.k != "L") return out;
  ED.W.lay.forEach((o, i) => {
    if (i == sel.i || o[0] != ED.W.lay[sel.i][0] || o[1] == "rug" || o[1] == "pot") return;
    if (o[4] * o[5] < A && edPip(o[2], o[3], P)) out.push(i);
  });
  return out;
}
// ---------- edits
function edPush() {
  ED.undo.push(JSON.stringify({ boxes: ED.W.boxes, lay: ED.W.lay, furn: ED.W.furn, rooms: ED.W.rooms }));
  if (ED.undo.length > 80) ED.undo.shift();
  ED.redo = [];
}
function edRestore(s) {
  const o = JSON.parse(s);
  Object.assign(ED.W, o);
  ED.sel = null; edDraw(); edProps();
}
function edUndo() { if (!ED.undo.length) return; ED.redo.push(JSON.stringify({ boxes: ED.W.boxes, lay: ED.W.lay, furn: ED.W.furn, rooms: ED.W.rooms })); edRestore(ED.undo.pop()); }
function edRedo() { if (!ED.redo.length) return; ED.undo.push(JSON.stringify({ boxes: ED.W.boxes, lay: ED.W.lay, furn: ED.W.furn, rooms: ED.W.rooms })); edRestore(ED.redo.pop()); }
function edDelete() {
  const s = ED.sel; if (!s) return;
  edPush();
  if (s.t == "wall") {
    const b = ED.W.boxes[s.i], w = edWall(b);
    edFloorPatch(w.A, w.B, w.t);
    ED.W.boxes.splice(s.i, 1);
  } else if (s.it.k == "L") {
    const del = new Set([s.it.i, ...edKids(s.it)]);
    ED.W.lay = ED.W.lay.filter((o, i) => !del.has(i));
  } else ED.W.furn.splice(s.it.i, 1);
  ED.sel = null; edDraw(); edProps();
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
  let a = it.a + da; a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  edSetItem(s.it, { a: Math.round(a * 1e4) / 1e4 });
  edDraw(); edProps();
}
function edFloorPatch(A, B, t) {
  // a thin floor strip where a wall used to stand, so walk mode can cross it
  const q = edQuad(A, B, t + 6), P = [0, 1, 2, 3].map((k) => [q[2 * k], q[2 * k + 1]]);
  ED.W.rooms.push([ED.lv, P, 0, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2, "", []]);
}
function edCut(P0, P1) {
  // remove the part of every wall on this level that lies along the cut line between P0 and P1
  const W = ED.W, out = [];
  let hit = 0;
  W.boxes.forEach((b) => {
    if (b[0] != ED.lv) return out.push(b);
    const w = edWall(b), ux = (w.B[0] - w.A[0]) / (w.L || 1), uy = (w.B[1] - w.A[1]) / (w.L || 1);
    const near = (p) => edSegDist(p[0], p[1], w.A, w.B) < w.t / 2 + 25;
    const cross = (P1[0] - P0[0]) * uy - (P1[1] - P0[1]) * ux; // cut line must run along the wall
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

// ---------- pointer handling
function edPtr(e) {
  const r = $("edcv").getBoundingClientRect();
  return [e.clientX - r.left, e.clientY - r.top];
}
const edPointers = new Map();
function edDown(e) {
  $("edcv").setPointerCapture(e.pointerId);
  edPointers.set(e.pointerId, edPtr(e));
  if (edPointers.size == 2) { ED.drag = { mode: "pinch", v0: { ...ED.view }, pts: [...edPointers.values()] }; return; }
  const [px, py] = edPtr(e), [x, y] = edToW(px, py);
  if (ED.tool == "wall") { const p = edSnapPt([x, y]); ED.drag = { mode: "draw", P0: p, P1: p }; return; }
  if (ED.tool == "cut") { ED.drag = { mode: "cut", P0: [x, y], P1: [x, y] }; return; }
  // select tool: wall end handles first, then items, then walls, else pan
  const s = ED.sel;
  if (s && s.t == "wall") {
    const w = edWall(ED.W.boxes[s.i]);
    for (const [k, p] of [["A", w.A], ["B", w.B]]) {
      const [sx, sy] = edToScr(p[0], p[1]);
      if (Math.hypot(sx - px, sy - py) < 12) { edPush(); ED.drag = { mode: "end", end: k, w }; return; }
    }
  }
  const it = edHitItem(x, y), wi = it ? null : edHitWall(x, y);
  if (it) {
    ED.sel = { t: "item", it }; const g = edGetItem(it); edPush();
    const kids = edKids(it).map((i) => [i, ED.W.lay[i][2] - g.x, ED.W.lay[i][3] - g.y]);
    ED.drag = { mode: "move", ox: x - g.x, oy: y - g.y, moved: false, kids };
  }
  else if (wi != null) { ED.sel = { t: "wall", i: wi }; edPush(); ED.drag = { mode: "wallmove", x0: x, y0: y, q0: ED.W.boxes[wi][1].slice(), moved: false }; }
  else { ED.sel = null; ED.drag = { mode: "pan", px, py, v0: { ...ED.view } }; }
  edDraw(); edProps();
}
function edMove(e) {
  if (!ED.drag) return;
  if (edPointers.has(e.pointerId)) edPointers.set(e.pointerId, edPtr(e));
  const d = ED.drag, [px, py] = edPtr(e), [x, y] = edToW(px, py);
  if (d.mode == "pinch") {
    const P = [...edPointers.values()];
    if (P.length < 2) return;
    const d0 = Math.hypot(d.pts[0][0] - d.pts[1][0], d.pts[0][1] - d.pts[1][1]), d1 = Math.hypot(P[0][0] - P[1][0], P[0][1] - P[1][1]);
    const k = d1 / (d0 || 1), cx0 = (d.pts[0][0] + d.pts[1][0]) / 2, cy0 = (d.pts[0][1] + d.pts[1][1]) / 2, cx = (P[0][0] + P[1][0]) / 2, cy = (P[0][1] + P[1][1]) / 2;
    ED.view = { s: d.v0.s * k, x: cx - (cx0 - d.v0.x) * k, y: cy - (cy0 - d.v0.y) * k };
  } else if (d.mode == "pan") {
    ED.view = { ...d.v0, x: d.v0.x + px - d.px, y: d.v0.y + py - d.py };
  } else if (d.mode == "move") {
    const nx = Math.round(x - d.ox), ny = Math.round(y - d.oy);
    edSetItem(ED.sel.it, { x: nx, y: ny });
    d.kids.forEach(([i, dx, dy]) => { ED.W.lay[i][2] = nx + dx; ED.W.lay[i][3] = ny + dy; });
    d.moved = true; edProps();
  } else if (d.mode == "wallmove") {
    const dx = Math.round((x - d.x0) / 2) * 2, dy = Math.round((y - d.y0) / 2) * 2;
    ED.W.boxes[ED.sel.i][1] = d.q0.map((v, i) => Math.round((v + (i % 2 ? dy : dx)) * 10) / 10); d.moved = true;
  } else if (d.mode == "end") {
    const w = d.w, ux = (w.B[0] - w.A[0]) / w.L, uy = (w.B[1] - w.A[1]) / w.L;
    const fixed = d.end == "A" ? w.B : w.A;
    let s = (x - fixed[0]) * (d.end == "A" ? -ux : ux) + (y - fixed[1]) * (d.end == "A" ? -uy : uy);
    s = Math.max(5, Math.round(s));
    const moving = d.end == "A" ? [fixed[0] - ux * s, fixed[1] - uy * s] : [fixed[0] + ux * s, fixed[1] + uy * s];
    const b = ED.W.boxes[ED.sel.i];
    b[1] = d.end == "A" ? edQuad(moving, w.B, w.t) : edQuad(w.A, moving, w.t);
  } else if (d.mode == "draw") {
    d.P1 = edSnapPt([x, y], d.P0);
  } else if (d.mode == "cut") {
    d.P1 = [x, y];
  }
  edDraw();
}
function edUp(e) {
  edPointers.delete(e.pointerId);
  const d = ED.drag;
  ED.drag = null;
  if (!d) return;
  if (d.mode == "pinch") { edDraw(); return; }
  if ((d.mode == "move" || d.mode == "wallmove") && !d.moved) ED.undo.pop();
  if (d.mode == "draw") {
    const L = Math.hypot(d.P1[0] - d.P0[0], d.P1[1] - d.P0[1]);
    if (L >= 10) {
      edPush();
      const t = +$("edthk").value || EDT, h = +$("edhgt").value || 243.8;
      ED.W.boxes.push([ED.lv, edQuad(d.P0, d.P1, t), 0, h, 1]);
      ED.sel = { t: "wall", i: ED.W.boxes.length - 1 };
    }
  } else if (d.mode == "cut") {
    edPush();
    if (!edCut(d.P0, d.P1)) { ED.undo.pop(); edToast("Drag along a wall to cut an opening in it"); }
  }
  edDraw(); edProps();
}
function edWheel(e) {
  e.preventDefault();
  const [px, py] = edPtr(e), k = Math.exp(-e.deltaY * 0.0015), v = ED.view;
  ED.view = { s: v.s * k, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
  edDraw();
}
function edToast(t) {
  const el = $("edmsg"); el.textContent = t; el.style.opacity = 1;
  clearTimeout(edToast.t); edToast.t = setTimeout(() => (el.style.opacity = 0), 2600);
}

// ---------- side panel with the selected thing's properties
function edProps() {
  const el = $("edprops"), s = ED.sel;
  if (!s) { el.innerHTML = '<span class="edhint">' + edHint() + "</span>"; return; }
  if (s.t == "wall") {
    const b = ED.W.boxes[s.i]; if (!b) { el.innerHTML = ""; return; }
    const w = edWall(b);
    el.innerHTML = '<b>Wall</b> <label>Length <input id="edpL" type="number" value="' + Math.round(w.L) + '"></label><label>Thick <input id="edpT" type="number" value="' + Math.round(w.t) + '"></label>' +
      '<label>Height <input id="edpH" type="number" value="' + Math.round(b[3]) + '"></label><button id="edpdel" class="danger">Delete</button><span class="edhint">Drag the wall to move it, drag a round end to extend or shorten it.</span>';
    const upd = () => {
      edPush();
      const L = Math.max(5, +$("edpL").value || w.L), t = Math.max(2, +$("edpT").value || w.t);
      const ux = (w.B[0] - w.A[0]) / w.L, uy = (w.B[1] - w.A[1]) / w.L;
      b[1] = edQuad(w.A, [w.A[0] + ux * L, w.A[1] + uy * L], t);
      b[3] = Math.max(10, +$("edpH").value || b[3]);
      edDraw(); edProps();
    };
    ["edpL", "edpT", "edpH"].forEach((k) => ($(k).onchange = upd));
  } else {
    const it = edGetItem(s.it);
    if (!it.n && s.it.k == "L") {
      const lab = edKids(s.it).map((i) => String(ED.W.lay[i][10] || "")).find((t) => t);
      it.n = lab ? lab.split(/[:(]/)[0].trim() : ED.W.lay[s.it.i][1];
    }
    const nk = s.it.k == "L" ? edKids(s.it).length : 0;
    el.innerHTML = "<b>" + String(it.n || "Item").replace(/</g, "&lt;").slice(0, 40) + "</b>" + (nk ? '<span class="edhint">(+' + nk + " parts)</span>" : "") +
      '<label>W <input id="edpW" type="number" value="' + Math.round(it.w) + '"></label><label>D <input id="edpD" type="number" value="' + Math.round(it.d) + '"></label>' +
      '<label>Angle <input id="edpA" type="number" value="' + Math.round(((it.a * 180) / Math.PI) % 360) + '">°</label>' +
      '<button id="edpr1">⟲ 15°</button><button id="edpr2">⟳ 15°</button><button id="edpr3">⟳ 90°</button><button id="edpdup">Duplicate</button><button id="edpdel" class="danger">Delete</button>';
    const upd = () => {
      edPush();
      edSetItem(s.it, { w: Math.max(1, +$("edpW").value || it.w), d: Math.max(1, +$("edpD").value || it.d), a: (((+$("edpA").value || 0) % 360) * Math.PI) / 180 });
      edDraw(); edProps();
    };
    ["edpW", "edpD", "edpA"].forEach((k) => ($(k).onchange = upd));
    $("edpr1").onclick = () => edRotate(-Math.PI / 12);
    $("edpr2").onclick = () => edRotate(Math.PI / 12);
    $("edpr3").onclick = () => edRotate(Math.PI / 2);
    $("edpdup").onclick = () => {
      edPush();
      const arr = s.it.k == "L" ? ED.W.lay : ED.W.furn, c = edClone(arr[s.it.i]);
      if (s.it.k == "L") { c[2] += 30; c[3] += 30; } else { c[1] += 30; c[2] += 30; }
      arr.push(c);
      ED.sel = { t: "item", it: { k: s.it.k, i: arr.length - 1 } };
      edDraw(); edProps();
    };
  }
  $("edpdel").onclick = edDelete;
}
function edHint() {
  return {
    select: "Tap furniture or a wall to select it. Drag to move. Drag empty space to pan; scroll or pinch to zoom.",
    wall: "Drag to draw a new wall. It snaps to wall ends and to 15° angles.",
    cut: "Drag along a wall to cut an opening (remove that part of the wall).",
  }[ED.tool];
}
function edTools() {
  document.querySelectorAll("#edtools button[data-t]").forEach((b) => b.classList.toggle("on", b.dataset.t == ED.tool));
  $("edwallopts").style.display = ED.tool == "wall" ? "" : "none";
  $("edcv").style.cursor = ED.tool == "select" ? "default" : "crosshair";
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
  const i = VERS.findIndex((v) => v.key == key);
  const bv = VERS.find((v) => v.key == rec.base) || VERS[0];
  const v = {
    key, rid: rec.id, edit: true, custom: true, title: rec.title, sub: "My edit · based on " + (bv.chip || bv.title).replace(/^[^·]*· /, ""),
    chip: "EDIT · " + rec.title, kind: "My edit (saved in this browser)", headline: rec.title,
    desc: "Your own edit of " + bv.title + ", saved in this browser. Use Edit to keep changing it, or Export to share the file.",
    tags: ["My edit"], btn: "Zoom in", proposed: true, blinds: bv.blinds, scope: bv.scope, confirm: bv.confirm,
    base: rec.base,
  };
  if (i >= 0) VERS[i] = v; else VERS.push(v);
  return key;
}
function edSave() {
  const title = ($("edname").value || "My edit").trim().slice(0, 60);
  let a = [];
  try { a = JSON.parse(localStorage.getItem(ED.ls) || "[]"); } catch (e) {}
  const id = ED.editKey ? ED.editKey.slice(2) : Date.now().toString(36);
  const base = ED.editKey ? (VERS.find((v) => v.key == ED.editKey) || {}).base || ED.base : ED.base;
  const rec = { id, title, base, D: ED.W, t: Date.now() };
  a = a.filter((r) => r.id != id); a.push(rec);
  try { localStorage.setItem(ED.ls, JSON.stringify(a)); }
  catch (e) { edToast("Could not save in this browser (storage full?). Use Export instead."); return; }
  const key = edRegister(rec);
  renderVList();
  edClose();
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
  let a = [];
  try { a = JSON.parse(localStorage.getItem(ED.ls) || "[]").filter((r) => r.id != rid); localStorage.setItem(ED.ls, JSON.stringify(a)); } catch (e) {}
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
    '<div id="edbar"><b class="edt">Edit mode</b>' +
    '<div class="seg" id="edtools"><button data-t="select">⬚ Select / move</button><button data-t="wall">▬ Add wall</button><button data-t="cut">✂ Cut wall</button></div>' +
    '<span id="edwallopts" style="display:none"><label>Thick <input id="edthk" type="number" value="14"></label><label>Height <input id="edhgt" type="number" value="243.8"></label></span>' +
    '<div class="seg" id="edlv"><button data-l="ground">Ground</button><button data-l="upper">Upper</button></div>' +
    '<button id="edun" title="Undo (Ctrl+Z)">↶</button><button id="edre" title="Redo">↷</button><button id="edfit">Fit</button>' +
    '<span class="sp"></span><input id="edname" placeholder="Name your edit"><button id="edexp">Export</button><button id="edcancel">Cancel</button><button id="edsave" class="pri">Save as my version</button></div>' +
    '<div id="edwrap"><canvas id="edcv"></canvas><div id="edmsg"></div></div><div id="edprops"></div>';
  document.body.appendChild(ov);
  const c = $("edcv");
  c.addEventListener("pointerdown", edDown);
  c.addEventListener("pointermove", edMove);
  c.addEventListener("pointerup", edUp);
  c.addEventListener("pointercancel", edUp);
  c.addEventListener("wheel", edWheel, { passive: false });
  document.querySelectorAll("#edtools button").forEach((b) => (b.onclick = () => { ED.tool = b.dataset.t; ED.sel = null; edTools(); edDraw(); edProps(); }));
  document.querySelectorAll("#edlv button").forEach((b) => (b.onclick = () => edLevel(b.dataset.l)));
  $("edun").onclick = edUndo; $("edre").onclick = edRedo; $("edfit").onclick = () => { edFit(); edDraw(); };
  $("edsave").onclick = edSave; $("edcancel").onclick = edClose; $("edexp").onclick = edExport;
  addEventListener("keydown", (e) => {
    if (!ED.on || /INPUT/.test((document.activeElement || {}).tagName)) return;
    if (e.key == "Delete" || e.key == "Backspace") { edDelete(); e.preventDefault(); }
    else if (e.key == "r" || e.key == "R") edRotate(e.shiftKey ? -Math.PI / 2 : Math.PI / 2);
    else if ((e.ctrlKey || e.metaKey) && e.key == "z") { e.shiftKey ? edRedo() : edUndo(); e.preventDefault(); }
    else if ((e.ctrlKey || e.metaKey) && e.key == "y") { edRedo(); e.preventDefault(); }
    else if (e.key == "Escape") { if (ED.sel) { ED.sel = null; edDraw(); edProps(); } else edClose(); }
    else return;
    e.stopPropagation();
  }, true);
  addEventListener("resize", () => ED.on && edDraw());
  // entry points: desktop toolbar and the phone Options sheet
  const b = document.createElement("button");
  b.id = "editb"; b.textContent = "✎ Edit"; b.title = "Edit this design: move furniture, add, cut or extend walls";
  b.onclick = edOpen;
  $("walkb").after(b);
  const mb = document.createElement("button");
  mb.textContent = "✎ Edit design"; mb.dataset.mt = "edit"; // mobile.js wires #mtools buttons by data-mt
  $("mtools").prepend(mb);
  edLoadSaved();
}
