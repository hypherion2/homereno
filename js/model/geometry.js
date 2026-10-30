// Small geometry helpers: text labels, wall prisms, boxes (B) and cylinders (Cy).
function lab(t, x, y, z, k) {
  const c = document.createElement("canvas"),
    g0 = c.getContext("2d");
  g0.font = "600 26px sans-serif";
  const tw = Math.ceil(g0.measureText ? g0.measureText(t).width : t.length * 14) + 20;
  c.width = tw;
  c.height = 38;
  const g = c.getContext("2d");
  g.font = "600 26px sans-serif";
  g.textAlign = "center";
  g.fillStyle = "rgba(255,255,255,.78)";
  g.fillRect(0, 2, tw, 34);
  g.fillStyle = "#1e2b25";
  g.fillText(t, tw / 2, 28);
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      depthTest: false,
      transparent: true,
      opacity: 0.9,
    }),
  );
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
