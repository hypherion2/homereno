// Small geometry helpers: text labels, wall prisms, boxes (B) and cylinders (Cy).
// Text label sprite. The canvas texture is drawn the first time the label is actually rendered
// (labels are hidden most of the time, and the model is rebuilt on every design switch or edit).
const LAB_M = document.createElement("canvas").getContext("2d");
LAB_M.font = "600 26px sans-serif";
function lab(t, x, y, z, k) {
  const tw = Math.ceil(LAB_M.measureText ? LAB_M.measureText(t).width : t.length * 14) + 20;
  const mat = new THREE.SpriteMaterial({ depthTest: false, transparent: true, opacity: 0.9 });
  const s = new THREE.Sprite(mat);
  s.onBeforeRender = () => {
    if (mat.map) return;
    const c = document.createElement("canvas");
    c.width = tw;
    c.height = 38;
    const g = c.getContext("2d");
    g.font = "600 26px sans-serif";
    g.textAlign = "center";
    g.fillStyle = "rgba(255,255,255,.78)";
    g.fillRect(0, 2, tw, 34);
    g.fillStyle = "#1e2b25";
    g.fillText(t, tw / 2, 28);
    mat.map = new THREE.CanvasTexture(c);
    mat.needsUpdate = true;
  };
  s.scale.set(tw * 0.0115 * k, 38 * 0.0115 * k, 1);
  s.position.set(x, y, z);
  s.renderOrder = 9;
  return s;
}
function prism(q, y0, h, h2) {
  const V = [];
  for (let i = 0; i < 4; i++) V.push([q[2 * i], y0, q[2 * i + 1]]);
  for (let i = 0; i < 4; i++)
    V.push([q[2 * i], y0 + ((i == 1 || i == 2) && h2 != null ? h2 : h), q[2 * i + 1]]);
  const F = [
    [0, 1, 2],
    [0, 2, 3],
    [4, 6, 5],
    [4, 7, 6],
  ];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    F.push([i, j, j + 4], [i, j + 4, i + 4]);
  }
  const p = [];
  F.forEach((f) => f.forEach((k) => p.push(...V[k])));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  g.computeVertexNormals();
  return g;
}
function B(w, h, d, c, x, y, z, g) {
  const m = sd(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), BM(c)));
  m.position.set(x, y + h / 2, z);
  g.add(m);
  return m;
}
function Cy(r, h, c, x, y, z, g, r2) {
  const m = sd(new THREE.Mesh(new THREE.CylinderGeometry(r2 === undefined ? r : r2, r, h, 28), BM(c)));
  m.position.set(x, y + h / 2, z);
  g.add(m);
  return m;
}

// Imperial labels: cm -> feet and inches (e.g. 229 -> 7\' 6"), m² -> ft².
function ftin(cm) {
  let i = Math.round(cm / 2.54),
    f = Math.floor(i / 12);
  i -= f * 12;
  return f ? f + "\u2032 " + i + "\u2033" : i + "\u2033";
}
function sqft(m2) {
  return Math.round(m2 * 10.7639) + " ft\u00b2";
}

// A quad wall box (optionally sloped: b[5] = height at the far end) drawn as vertical oak battens.
function oakScreen(b, grp) {
  const q = b[1],
    mid = (i, j) => [(q[2 * i] + q[2 * j]) / 2, (q[2 * i + 1] + q[2 * j + 1]) / 2],
    a = mid(0, 3),
    c = mid(1, 2),
    L = Math.hypot(c[0] - a[0], c[1] - a[1]),
    ang = Math.atan2(c[1] - a[1], c[0] - a[0]),
    n = Math.max(2, Math.round(L / 9)),
    mt = BM(0xd2b48c);
  for (let i = 0; i <= n; i++) {
    const t = i / n,
      h = b[3] + ((b[5] == null ? b[3] : b[5]) - b[3]) * t,
      m = sd(new THREE.Mesh(new THREE.BoxGeometry(4.5, h, 3.5), mt));
    m.position.set(a[0] + (c[0] - a[0]) * t, b[2] + h / 2, a[1] + (c[1] - a[1]) * t);
    m.rotation.y = -ang;
    grp.add(m);
  }
}

// Winder helpers. W = { K: inner corner, m: first-edge direction, u: last-edge direction, w: size, n: steps }
function winderPt(W, th) {
  if (W.shape == "seg") {
    // one or more winders filling the triangle K-P1-P2 (turn of W.turn between m and u)
    const T = W.turn,
      st = Math.sin(T),
      d = [(W.m[0] * Math.sin(T - th) + W.u[0] * Math.sin(th)) / st, (W.m[1] * Math.sin(T - th) + W.u[1] * Math.sin(th)) / st],
      e = [W.P2[0] - W.P1[0], W.P2[1] - W.P1[1]],
      q = [W.P1[0] - W.K[0], W.P1[1] - W.K[1]],
      den = d[0] * e[1] - d[1] * e[0],
      t = (q[0] * e[1] - q[1] * e[0]) / den;
    return [W.K[0] + d[0] * t, W.K[1] + d[1] * t];
  }
  const c = Math.cos(th),
    s = Math.sin(th),
    r = W.shape == "tri" ? W.w / (c + s) : W.w / Math.max(c, s);
  return [W.K[0] + r * (c * W.m[0] + s * W.u[0]), W.K[1] + r * (c * W.m[1] + s * W.u[1])];
}
// Quad (8 numbers) for winder k: the inner corner plus its slice of the square's edge.
function winderWedge(W, k) {
  const T = W.turn || Math.PI / 2,
    a0 = T * (k / W.n),
    a1 = T * ((k + 1) / W.n),
    A = winderPt(W, a0),
    B = winderPt(W, a1),
    corner = [W.K[0] + W.w * (W.m[0] + W.u[0]), W.K[1] + W.w * (W.m[1] + W.u[1])],
    mid = W.shape != "tri" && W.shape != "seg" && a0 < Math.PI / 4 && a1 > Math.PI / 4 ? corner : winderPt(W, (a0 + a1) / 2);
  return [W.K[0], W.K[1], A[0], A[1], mid[0], mid[1], B[0], B[1]];
}
// Walking height on the winders: rises smoothly with the angle around the inner corner.
function winderHeight(W, x, z, margin) {
  if (W.shape == "seg") {
    // inside the triangle K-P1-P2 (signed distances to its three edges, 2 cm tolerance)
    const sd = (p, q) => {
        const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
        return ((q[0] - p[0]) * (z - p[1]) - (q[1] - p[1]) * (x - p[0])) / L;
      },
      sg = (((W.P1[0] - W.K[0]) * (W.P2[1] - W.K[1]) - (W.P1[1] - W.K[1]) * (W.P2[0] - W.K[0])) > 0 ? 1 : -1);
    if (sg * sd(W.K, W.P1) < -2 || sg * sd(W.P1, W.P2) < -2 || sg * sd(W.P2, W.K) < -2) return null;
    const dx = x - W.K[0],
      dz = z - W.K[1],
      a = dx * W.m[0] + dz * W.m[1],
      c = Math.abs(W.m[0] * dz - W.m[1] * dx),
      th = Math.max(0, Math.min(W.turn, Math.atan2(c, a)));
    return W.base + W.ri * (W.n + (W.exitUp ? 1 : 0)) * (th / W.turn);
  }
  const dx = x - W.K[0],
    dz = z - W.K[1],
    a = dx * W.m[0] + dz * W.m[1],
    b = dx * W.u[0] + dz * W.u[1];
  if (a < -margin || b < -2 || a > W.w + 2 || b > W.w + 2) return null;
  if (W.shape == "tri" && a + b > W.w + 2) return null;
  const th = Math.atan2(Math.max(0, b), Math.max(0.001, a));
  // exitUp: the winders end one riser below a floor (stair top); otherwise they feed the next flight
  return W.base + W.ri * (W.n + (W.exitUp ? 1 : 0)) * Math.min(1, th / (Math.PI / 2));
}
