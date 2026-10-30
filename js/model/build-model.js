// Builds the 3D scene for one concept: walls, floors, rooms, existing furniture, proposed items.
const TINT = (n) => {
  n = (n || "").toLowerCase();
  return /bed|master/.test(n)
    ? 0xd9cfe3
    : /bath|ensuite/.test(n)
      ? 0xcfe3e6
      : /kitchen|family|eating/.test(n)
        ? 0xe8d9b8
        : /living|dining/.test(n)
          ? 0xe3d3c2
          : /garage/.test(n)
            ? 0xcfd4d8
            : /closet|w\.i\.c|mud|foyer|porch|office/.test(n)
              ? 0xd7dfd2
              : 0xe6dccb;
};
function clearModel() {
  if (!S.root) return;
  S.root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const a = Array.isArray(o.material) ? o.material : [o.material];
      a.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
  sc.remove(S.root);
  S.root = null;
}
function buildModel(D) {
  if (typeof applyVariants == "function") applyVariants(D); // pick the chosen layout options first
  clearModel();
  S.G = {};
  S.FG = {};
  S.LB = {};
  S.MS = {};
  S.WG = {};
  S.LGp = {};
  S.walls = [];
  S.gg = [];
  S.BL = [];
  S.floors = [];
  S.doors = [];
  S.el = {};
  S.nm = {};
  const root = new THREE.Group();
  sc.add(root);
  S.root = root;
  const { G, FG, LB, MS, WG, LGp, el, nm } = S;
  const pipP = (x, y, P) => {
    let c = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const a = P[i],
        b = P[j];
      if (a[1] > y != b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  };
  (() => {
    const E = Math.max(...D.levels.map((l) => l[2])),
      top = D.levels.find((l) => l[2] == E)[0],
      lo = D.levels.find((l) => l[2] == 0)[0];
    D.boxes.forEach((b) => {
      if (b[0] == lo && b[2] + b[3] > 235 && b[2] + b[3] < E) b[3] = E - b[2];
    });
    D.furn.forEach((f) => {
      if (f[8] == 3 && Math.abs(f[1] - 640) < 1 && Math.abs(f[2] - 736) < 1 && !f._fx) {
        f._fx = 1;
        f[1] = 563.5;
        f[2] = 742;
        f[3] = 88;
        f[4] = 153;
        D.rooms.forEach((r) => {
          if (r[0] == top && pipP(590, 740, r[1]) && !(r[6] || []).length)
            r[6] = [
              [
                [487, 698],
                [647, 698],
                [647, 786],
                [487, 786],
              ],
            ];
        });
      }
    });
    D.furn.forEach((f) => {
      if (f[8] == 3 && Math.abs(f[1] - 519.8) < 1 && Math.abs(f[2] - 885.3) < 1 && !f._fx) {
        f._fx = 1;
        const a = f[5],
          c = Math.cos(a),
          sn = Math.sin(a);
        f[3] -= 2;
        f[1] += -2 * c - 6 * sn;
        f[2] += -2 * sn + 6 * c;
      }
    });
  })();
  D.levels.forEach((l) => {
    el[l[0]] = l[2];
    nm[l[0]] = l[1];
    G[l[0]] = new THREE.Group();
    FG[l[0]] = new THREE.Group();
    LB[l[0]] = new THREE.Group();
    MS[l[0]] = new THREE.Group();
    WG[l[0]] = new THREE.Group();
    WG[l[0]].position.y = l[2];
    G[l[0]].add(FG[l[0]], LB[l[0]], MS[l[0]], WG[l[0]]);
    root.add(G[l[0]]);
  });
  S.E1 = Math.max(...D.levels.map((l) => l[2]));
  let x0 = 1e9,
    x1 = -1e9,
    z0 = 1e9,
    z1 = -1e9;
  D.boxes.forEach((b) => {
    const m = sd(
      new THREE.Mesh(prism(b[1], b[2], b[3], b[5]), new THREE.MeshLambertMaterial({ color: (!dk && D.wallColor) || WALL, side: 2 })),
    );
    m.userData.c = b[4];
    S.walls.push(m);
    WG[b[0]].add(m);
    for (let i = 0; i < 4; i++) {
      x0 = Math.min(x0, b[1][2 * i]);
      x1 = Math.max(x1, b[1][2 * i]);
      z0 = Math.min(z0, b[1][2 * i + 1]);
      z1 = Math.max(z1, b[1][2 * i + 1]);
    }
  });
  (D.ghost || []).forEach((b) => {
    const m = new THREE.Mesh(prism(b[1], b[2], b[3]), GM);
    S.gg.push(m);
    WG[b[0]].add(m);
  });
  S.c.set((x0 + x1) / 2, S.E1 / 2, (z0 + z1) / 2);
  S.span = Math.max(x1 - x0, z1 - z0);
  D.rooms.forEach((r) => {
    const sh = new THREE.Shape(r[1].map((p) => new THREE.Vector2(p[0], p[1])));
    (r[6] || []).forEach((h) => sh.holes.push(new THREE.Path(h.map((p) => new THREE.Vector2(p[0], p[1])))));
    const m = new THREE.Mesh(
      new THREE.ShapeGeometry(sh),
      new THREE.MeshLambertMaterial({ color: 0xcdb48a, side: 2 }),
    );
    m.rotation.x = Math.PI / 2;
    m.position.y = el[r[0]] + 0.5;
    m.receiveShadow = true;
    m.userData = { n: r[5], l: nm[r[0]] };
    S.floors.push(m);
    G[r[0]].add(m);
    {
      const P = r[1],
        F = P.flat(),
        Lv = r[0],
        y0 = el[Lv] + 6,
        seg = [],
        sq = (x1, z1, x2, z2, w) => {
          const dx = x2 - x1,
            dz = z2 - z1,
            L = Math.hypot(dx, dz) || 1,
            px = (-dz / L) * w,
            pz = (dx / L) * w;
          seg.push(
            x1 + px,
            y0,
            z1 + pz,
            x1 - px,
            y0,
            z1 - pz,
            x2 + px,
            y0,
            z2 + pz,
            x2 + px,
            y0,
            z2 + pz,
            x1 - px,
            y0,
            z1 - pz,
            x2 - px,
            y0,
            z2 - pz,
          );
        };
      let mnx = 1e9,
        mxx = -1e9,
        mnz = 1e9,
        mxz = -1e9;
      for (let i = 0; i < P.length; i++) {
        const a = P[i],
          b = P[(i + 1) % P.length];
        mnx = Math.min(mnx, a[0]);
        mxx = Math.max(mxx, a[0]);
        mnz = Math.min(mnz, a[1]);
        mxz = Math.max(mxz, a[1]);
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len < 90) continue;
        const ux = (b[0] - a[0]) / len,
          uz = (b[1] - a[1]) / len,
          nx = -uz,
          nz = ux,
          mx = (a[0] + b[0]) / 2,
          mz = (a[1] + b[1]) / 2,
          sg = pipW(mx + nx * 10, mz + nz * 10, F) ? 1 : -1,
          d = 24,
          ox = nx * sg,
          oz = nz * sg;
        const A = [a[0] + ox * d, a[1] + oz * d],
          B = [b[0] + ox * d, b[1] + oz * d];
        sq(A[0], A[1], B[0], B[1], 1.1);
        sq(a[0], a[1], A[0] + ox * 6, A[1] + oz * 6, 0.5);
        sq(b[0], b[1], B[0] + ox * 6, B[1] + oz * 6, 0.5);
        sq(A[0] - ox * 8, A[1] - oz * 8, A[0] + ox * 8, A[1] + oz * 8, 1.1);
        sq(B[0] - ox * 8, B[1] - oz * 8, B[0] + ox * 8, B[1] + oz * 8, 1.1);
        MS[Lv].add(
          lab(
            (len / 100).toFixed(2) + " m",
            (A[0] + B[0]) / 2 + ox * 16,
            y0 + 1,
            (A[1] + B[1]) / 2 + oz * 16,
            20,
          ),
        );
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
      const ln = new THREE.Mesh(
        g,
        new THREE.MeshBasicMaterial({
          color: 0x3b6fe0,
          depthTest: false,
          transparent: true,
          opacity: 0.7,
          side: 2,
        }),
      );
      ln.renderOrder = 6;
      MS[Lv].add(ln);
      if (r[2] >= 2)
        MS[Lv].add(
          lab(
            "\u2194 " + ((mxx - mnx) / 100).toFixed(2) + " \u00d7 " + ((mxz - mnz) / 100).toFixed(2) + " m",
            r[3],
            y0 + 2,
            r[4] + 52,
            26,
          ),
        );
    }
    if (r[2] >= 3)
      LB[r[0]].add(lab((r[5] ? r[5] + " · " : "") + r[2] + " m²", r[3], el[r[0]] + 20, r[4], 34));
  });
  D.furn.forEach((f) => {
    const [L, x, y, w, d, a, e, h, t, n, s] = f;
    let o;
    if (t == 3) {
      o = new THREE.Group();
      const N = Math.max(2, Math.round(h / 18)),
        z = d / N,
        ri = h / N,
        tread = D.treadColor || 0xa67b50; // per-concept tread colour (e.g. white oak)
      for (let i = 0; i < N; i++) {
        const m = sd(new THREE.Mesh(new THREE.BoxGeometry(w, ri, z), BM(tread)));
        m.position.set(0, (i + 0.5) * ri, s * (-d / 2 + (i + 0.5) * z));
        o.add(m);
        // optional low step light on every second riser
        if (D.stepLights && i % 2 == 0) {
          const lt = new THREE.Mesh(
            new THREE.BoxGeometry(7, 1.6, 1),
            new THREE.MeshLambertMaterial({ color: 0xfff6e0, emissive: 0xffe2a8 }),
          );
          lt.position.set(w / 2 - 10, (i + 1) * ri - 5, s * (-d / 2 + i * z) - s * 0.6);
          o.add(lt);
        }
      }
      {
        const Ls = Math.hypot(d, h - ri),
          sf = sd(new THREE.Mesh(new THREE.BoxGeometry(w, 4, Ls), BM(tread)));
        sf.rotation.x = -s * Math.atan2(h - ri, d);
        sf.position.set(0, (h - ri) / 2 - 2, 0);
        o.add(sf);
      }
      o.position.set(x, el[L] + e, y);
      G[L].add(o);
      LB[L].add(lab("Stairs", x, el[L] + e + h + 25, y, 34));
    } else {
      const sl = /slid/i.test(n),
        c =
          t == 1 || sl
            ? glass
            : t == 2
              ? BM(0x8a5a33)
              : BM(
                  /fridge/i.test(n)
                    ? 0xbfc3c7
                    : /cooker|range/i.test(n)
                      ? 0x25272a
                      : /island|lower|sink|dishwasher|coffee/i.test(n)
                        ? 0x30343a
                        : /upper/i.test(n)
                          ? 0xc8a276
                          : /red cab/i.test(n)
                            ? 0x8a5a36
                            : /fire/i.test(n)
                              ? 0x7a4a3a
                              : /bath|wash/i.test(n)
                                ? 0xf5f5f5
                                : 0xb9a58a,
                );
      const rl = !t && /rail/i.test(n);
      o = sd(new THREE.Mesh(new THREE.BoxGeometry(w, h, t ? 4 : rl ? 1.4 : d), rl ? RGL : c));
      if (!t && /^fireplace$/i.test(n)) {
        const tall = h > 150;
        o.material = BM(tall ? (!dk && D.wallColor) || WALL : D.fireStone || 0x3c3c3c);
        const fm = (ww, hh, dd, col, yy, zz) => {
            const m = sd(new THREE.Mesh(new THREE.BoxGeometry(ww, hh, dd), BM(col)));
            m.position.set(0, yy, zz);
            o.add(m);
          },
          b0 = -h / 2;
        if (tall) {
          fm(w * 0.8, 95, 3, D.fireStone || 0x3c3c3c, b0 + 47.5, d / 2 + 1.5);
          fm(w * 0.9, 5, 14, 0x6b4a2f, b0 + 112.5, d / 2 + 7);
        }
        fm(w * 0.5, 58, 2, 0x141414, b0 + 20 + 29, d / 2 + (tall ? 4 : 1));
        fm(w * 0.32, 4, 1, 0xd98a3a, b0 + 24, d / 2 + (tall ? 5.2 : 2.2));
        fm(w * 0.85, 4, 26, D.fireStone || 0x3c3c3c, b0 + 2, d / 2 + 13);
      }
      if (rl && D.stair == "bars") {
        // slim black metal guard: top rail, bottom rail and vertical bars (no glass)
        o.material = new THREE.MeshBasicMaterial({ visible: false });
        const mt = BM(0x1e1e1e),
          bar = (ww, hh, dd, px, py) => {
            const m = sd(new THREE.Mesh(new THREE.BoxGeometry(ww, hh, dd), mt));
            m.position.set(px, py, 0);
            o.add(m);
          };
        bar(w, 3, 4, 0, h / 2 + 1.5);
        bar(w, 2.5, 2.5, 0, -h / 2 + 5);
        const nb = Math.max(1, Math.round(w / 10.5));
        for (let i = 0; i <= nb; i++) bar(1.4, h - 6, 1.4, -w / 2 + 2 + (i * (w - 4)) / nb, 0.5);
      } else if (rl) {
        const mt = BM(0x2b2d30);
        const tp = new THREE.Mesh(new THREE.BoxGeometry(w, 3.2, 4), mt);
        tp.position.y = h / 2 + 1.6;
        o.add(tp);
        const bt = new THREE.Mesh(new THREE.BoxGeometry(w, 7, 5.5), mt);
        bt.position.y = -h / 2 + 3.5;
        o.add(bt);
        const nb = Math.max(1, Math.round(w / 110));
        for (let i = 0; i <= nb; i++) {
          const sp = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 7, 12), mt);
          sp.rotation.x = Math.PI / 2;
          sp.position.set(-w / 2 + 6 + (i * (w - 12)) / nb, h * 0.08, 0);
          o.add(sp);
        }
      }
      if (t || sl) {
        o.position.set(x, e + h / 2, y);
        WG[L].add(o);
        if (t == 2) {
          S.doors.push({ o, x, y, L });
          const fp = new THREE.Mesh(
            new THREE.BoxGeometry(w, 1, 40),
            new THREE.MeshLambertMaterial({ color: 0xcdb48a }),
          );
          fp.position.set(x, el[L] + 0.5, y);
          fp.rotation.y = -a;
          G[L].add(fp);
        }
      } else {
        o.position.set(x, el[L] + e + h / 2, y);
        FG[L].add(o);
      }
      eo(o);
      if ((!t && !/post|rail|lower|upper|radiator/i.test(n)) || sl)
        LB[L].add(lab(sl ? "Sliding doors" : n, x, el[L] + e + h + 20, y, 30));
    }
    o.rotation.y = -a;
  });
  (D.lay || []).forEach((o) => {
    const [L, k, x, y, w, d, h, e, a, c, lb] = o;
    if (!LGp[L]) {
      LGp[L] = new THREE.Group();
      G[L].add(LGp[L]);
    }
    const g = new THREE.Group();
    g.position.set(x, el[L] + e, y);
    g.rotation.y = -a;
    build(k, w, d, h, c, g);
    {
      const rl = cabRole(lb);
      if (rl) {
        g.userData.role = rl;
        g.userData.c0 = c;
      }
    }
    LGp[L].add(g);
    if (lb) LB[L].add(lab(lb, x, el[L] + e + h + 32, y, 30));
    if (lb && Math.max(w, d) >= 120 && k != "rug")
      MS[L].add(
        lab(
          (Math.max(w, d) / 100).toFixed(2) + " × " + (Math.min(w, d) / 100).toFixed(2) + " m",
          x,
          el[L] + e + h + 14,
          y,
          22,
        ),
      );
  });
  (D.blinds || []).forEach((b) => {
    const [L, x, y, w, a, e, h] = b;
    let nx = -Math.sin(a),
      nz = Math.cos(a);
    if ((S.c.x - x) * nx + (S.c.z - y) * nz < 0) {
      nx = -nx;
      nz = -nz;
    }
    const hh = h * 0.62,
      m = sd(
        new THREE.Mesh(
          new THREE.BoxGeometry(w + 6, hh, 2),
          new THREE.MeshLambertMaterial({ color: 0xf1eee8, transparent: true, opacity: 0.92 }),
        ),
      );
    m.position.set(x + nx * 7, e + h - hh / 2, y + nz * 7);
    m.rotation.y = -a;
    const r = sd(new THREE.Mesh(new THREE.BoxGeometry(w + 8, 5, 5), BM(0xf7f5f0)));
    r.position.set(x + nx * 7, e + h + 2, y + nz * 7);
    r.rotation.y = -a;
    WG[L].add(m, r);
    S.BL.push(m, r);
  });
  dl.position.set(S.c.x + 1300, 2600, S.c.z - 500);
  dl.target.position.copy(S.c);
  const xs = [],
    pts = [];
  (D.ghost || []).forEach((b) => pts.push(b[1]));
  D.boxes.forEach((b) => {
    if (b[4] == 5) pts.push(b[1]);
  });
  if (pts.length) {
    let a = 1e9,
      b = -1e9,
      c = 1e9,
      d = -1e9;
    pts.forEach((q) => {
      for (let i = 0; i < 4; i++) {
        a = Math.min(a, q[2 * i]);
        b = Math.max(b, q[2 * i]);
        c = Math.min(c, q[2 * i + 1]);
        d = Math.max(d, q[2 * i + 1]);
      }
    });
    S.focus = { x: (a + b) / 2, z: (c + d) / 2, r: Math.max(b - a, d - c) };
  } else S.focus = { x: 880, z: 760, r: 600 };
  applyAll();
}
