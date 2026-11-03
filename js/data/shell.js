// Existing-house details shared by every version (applied after all concept files load).
// Lounge street-side window wall (y 1296-1310): the picture window has a transom above it and the
// ceiling over it is a raised flat rectangle (pop-up), per the owner's photo.
// Owner: raised ceiling is 11 ft (335 cm); window unit is 7 ft (213 cm) tall from a 76 cm sill.
// The rectangle's footprint (a little wider than the window, about 1.9 m deep) is estimated from the photo.
const SHELL = {
  L1: "level-e7276441-09e6-40e5-b0fe-e49e557499fc",
  vault: { x0: 505, x1: 700, y0: 1106, y1: 1296, e: 335, top: 335 },
  transom: { x: 596.5, y: 1303.4, w: 143.5, pic: 248.2, e: 253, h: 36, head: 289 },
};
function vaultH(v, x, y) {
  const k = (v.top - v.e) / (v.y1 - v.y0);
  return Math.min(v.top, v.e + k * Math.min(v.y1 - y, x - v.x0));
}
function applyShell(D) {
  if (!D || D.vault) return;
  const S0 = SHELL, v = S0.vault, L1 = S0.L1;
  const xr = (b) => { const xs = [0, 2, 4, 6].map((i) => b[1][i]); return [Math.min(...xs), Math.max(...xs)]; };
  const onWall = (b) => { const ys = [1, 3, 5, 7].map((i) => b[1][i]); return b[0] == L1 && Math.min(...ys) > 1290 && Math.max(...ys) < 1315; };
  const setX = (b, a, c) => { const [m, M] = xr(b), n = JSON.parse(JSON.stringify(b)); [0, 2, 4, 6].forEach((i) => (n[1][i] = Math.abs(b[1][i] - m) < 0.5 ? a : c)); return n; };
  const out = [];
  let hit = 0;
  D.boxes.forEach((b) => {
    if (!onWall(b)) return out.push(b);
    const [m, M] = xr(b), top = b[2] + b[3];
    if (M <= v.x0 || m >= v.x1) return out.push(b);
    hit++;
    if (Math.abs(b[2] - 236.2) < 1 && Math.abs(m - (S0.transom.x - S0.transom.w / 2)) < 2) {
      out.push(Object.assign(JSON.parse(JSON.stringify(b)), { 2: S0.transom.pic, 3: S0.transom.e - S0.transom.pic })); // mullion
      out.push(Object.assign(JSON.parse(JSON.stringify(b)), { 2: S0.transom.head, 3: v.e - S0.transom.head }));
      return;
    }
    if (Math.abs(top - 243.8) > 1) return out.push(b);
    // full-height wall piece: raise the part inside the rectangle, keep the rest
    const a = Math.max(m, v.x0), c = Math.min(M, v.x1);
    if (m < a) out.push(setX(b, m, a));
    out.push(Object.assign(setX(b, a, c), { 3: v.e - b[2] }));
    if (c < M) out.push(setX(b, c, M));
  });
  if (!hit) return;
  D.boxes = out;
  const t = S0.transom;
  D.furn.forEach((f) => {
    if (f[0] == L1 && f[8] == 1 && Math.abs(f[1] - t.x) < 2 && Math.abs(f[2] - t.y) < 2) f[7] = t.pic - f[6]; // taller picture pane
  });
  D.furn.push([L1, t.x, t.y, t.w, 4, 0, t.e, t.h, 1, "Transom window"]);
  D.vault = Object.assign({ L: L1 }, v);
  // recessed lights under the raised ceiling move up into it
  (D.lay || []).forEach((o) => {
    if (o[0] != L1 || o[1] != "pot" || o[2] < v.x0 || o[2] > v.x1 || o[3] < v.y0 || o[3] > v.y1) return;
    o[7] += vaultH(v, o[2], o[3]) - 243.8 - 2;
  });
}
Object.keys(DATA).forEach((k) => applyShell(DATA[k]));
