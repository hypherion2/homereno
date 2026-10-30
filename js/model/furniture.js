// Builders for proposed furniture kinds (sofa, table, island, plant, pendant, ...).
function build(k, w, d, h, c, g) {
  if (k == "sofa" || k == "arm") {
    const ar = k == "arm" ? 12 : 18;
    B(w, 34, d, c, 0, 8, 0, g);
    B(w - 2 * ar, h - 42, d * 0.24, c, 0, 42, -d * 0.38, g);
    B(ar, 26, d, c, -(w / 2 - ar / 2), 42, 0, g);
    B(ar, 26, d, c, w / 2 - ar / 2, 42, 0, g);
    B(w - 2 * ar, 10, d * 0.72, c, 0, 42, d * 0.1, g);
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].forEach((q) => Cy(2, 8, 0x222222, q[0] * (w / 2 - 8), 0, q[1] * (d / 2 - 8), g));
  } else if (k == "lsofa") {
    const ar = 18,
      cl = 100,
      bx = -(w / 2 - d / 2);
    B(w, 34, d, c, 0, 8, 0, g);
    B(d, 34, cl, c, bx, 8, d / 2 + cl / 2, g);
    B(w - ar, h - 42, d * 0.24, c, -ar / 2, 42, -d * 0.38, g);
    B(ar, 26, d, c, w / 2 - ar / 2, 42, 0, g);
    B(d * 0.24, h - 42, cl, c, -w / 2 + d * 0.12, 42, d / 2 + cl / 2, g);
    B(w - ar, 10, d * 0.72, c, -ar / 2, 42, d * 0.1, g);
    B(d - d * 0.24, 10, cl, c, bx + d * 0.12, 42, d / 2 + cl / 2 - 3, g);
    [
      [w / 2 - 6, -d / 2 + 6],
      [w / 2 - 6, d / 2 - 6],
      [-w / 2 + 6, -d / 2 + 6],
      [-w / 2 + 6, d / 2 + cl - 6],
      [-w / 2 + d - 6, d / 2 + cl - 6],
    ].forEach((q) => Cy(2, 8, 0x222222, q[0], 0, q[1], g));
  } else if (k == "pot") {
    Cy(w / 2 + 1.3, 0.5, 0xe9e9e9, 0, 0.3, 0, g);
    const m = Cy(w / 2, 0.8, c, 0, 0, 0, g);
    m.material = new THREE.MeshLambertMaterial({ color: c, emissive: 0xffe2a8 });
    m.castShadow = false;
    g.userData.pot = 1;
  } else if (k == "art") {
    B(w, h, d, 0x1b1b1b, 0, 0, 0, g);
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 5, h - 5),
      new THREE.MeshBasicMaterial({ map: artTex(Math.round(c), w / h), color: 0xe2e2e2 }),
    );
    p.position.set(0, h / 2, d / 2 + 0.12);
    g.add(p);
    g.userData.art = 1;
  } else if (k == "chair") {
    B(w, 4, d, c, 0, 44, 0, g);
    B(w, 40, 3, c, 0, 48, -(d / 2 - 1.5), g);
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].forEach((q) => Cy(1.5, 44, 0x111111, q[0] * (w / 2 - 3), 0, q[1] * (d / 2 - 3), g));
  } else if (k == "stool") {
    Cy(w / 2, 4, c, 0, h - 4, 0, g);
    Cy(1.8, h - 4, 0x111111, 0, 0, 0, g);
    Cy(w / 2 - 6, 2, 0x111111, 0, 0, 0, g);
  } else if (k == "round") {
    Cy(w / 2, h, c, 0, 0, 0, g);
  } else if (k == "ptable") {
    B(w, 4, d, c, 0, h - 4, 0, g);
    Cy(Math.min(w, d) * 0.13, h - 8, c, 0, 4, 0, g, Math.min(w, d) * 0.09);
    Cy(Math.min(w, d) * 0.36, 4, c, 0, 0, 0, g);
  } else if (k == "table") {
    B(w, 4, d, c, 0, h - 4, 0, g);
    B(5, h - 4, d - 14, 0x1c1c1c, -(w / 2 - 18), 0, 0, g);
    B(5, h - 4, d - 14, 0x1c1c1c, w / 2 - 18, 0, 0, g);
  } else if (k == "island") {
    B(w - 8, h - 4, d - 8, c, 0, 0, 0, g);
    B(w + 8, 4, d + 8, 0xf1efea, 0, h - 4, 0, g);
  } else if (k == "bench") {
    B(w, h * 0.55, d, c, 0, 0, 0, g);
    B(w - 4, 9, d - 4, 0xe4dccd, 0, h * 0.55, 0, g);
  } else if (k == "plant") {
    Cy(Math.max(13, w * 0.3), 30, 0x2b2d30, 0, 0, 0, g);
    if (h > 90) Cy(1.8, h - w * 0.9 - 28, 0x6b4a2f, 0, 30, 0, g);
    const bl = (r, x, y, z, col) => {
      const m = sd(new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), BM(col)));
      m.position.set(x, y, z);
      g.add(m);
    };
    if (h > 90) {
      bl(w * 0.5, 0, h - w * 0.5, 0, c);
      bl(w * 0.34, w * 0.3, h - w * 0.95, w * 0.1, c + 0x0a140a);
      bl(w * 0.32, -w * 0.28, h - w * 1.1, -w * 0.12, c - 0x0a100a);
    } else {
      const m = sd(new THREE.Mesh(new THREE.SphereGeometry(w * 0.7, 16, 12), BM(c)));
      m.position.set(0, h - w * 0.5, 0);
      g.add(m);
    }
  } else if (k == "pendant") {
    const m = Cy(w / 2, h, c, 0, 0, 0, g, w * 0.22);
    m.material = new THREE.MeshLambertMaterial({ color: c, emissive: 0x6a4a1a });
    Cy(0.5, 78 - h, 0x222222, 0, h, 0, g);
  } else if (k == "pendantbar") {
    B(d, 4, w, c, 0, 0, 0, g);
    B(0.8, 78, 0.8, 0x222222, 0, 4, -w * 0.35, g);
    B(0.8, 78, 0.8, 0x222222, 0, 4, w * 0.35, g);
  } else if (k == "hood") {
    B(w, h, d, c, 0, 0, 0, g);
    B(34, 243 - 150 - h, 26, c, 0, h, 0, g);
  } else {
    B(w, h, d, c, 0, 0, 0, g);
  }
}
