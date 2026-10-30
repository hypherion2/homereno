// Realistic rendering: procedural textures, material upgrades, environment lighting.
// ---------- Realistic rendering
const RL = {
  on: false,
  tx: null,
  env: null,
  sky: null,
  fill: null,
  gtex: null,
  keep: new Map(),
  sc0: null,
  lastKey: "",
};
function rnd(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
function mkCanvas(n, fn) {
  const c = document.createElement("canvas");
  c.width = c.height = n;
  fn(c.getContext("2d"), n);
  return c;
}
function mkTex(c, rep) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep, rep);
  t.anisotropy =
    rn.capabilities && rn.capabilities.getMaxAnisotropy ? Math.min(8, rn.capabilities.getMaxAnisotropy()) : 1;
  return t;
}
function noiseDots(g, n, R, a, count, lo, hi) {
  for (let i = 0; i < count; i++) {
    const v = lo + R() * (hi - lo);
    g.fillStyle = "rgba(" + v + "," + v + "," + v + "," + a + ")";
    g.fillRect(R() * n, R() * n, 1 + R() * 2, 1 + R() * 2);
  }
}
function makeTex() {
  const T = {};
  // wood planks: 512px = 112 cm, 8 planks of 14 cm
  const wood = mkCanvas(512, (g, n) => {
    const R = rnd(7),
      ph = n / 8;
    for (let r = 0; r < 8; r++) {
      const y = r * ph;
      let x = -R() * n * 0.5;
      while (x < n) {
        const len = n * (0.55 + R() * 0.45),
          b = R() * 30 - 15;
        g.fillStyle = "rgb(" + ((188 + b) | 0) + "," + ((150 + b) | 0) + "," + ((104 + b) | 0) + ")";
        g.fillRect(x, y, len, ph);
        for (let k = 0; k < 26; k++) {
          g.strokeStyle = "rgba(95,62,30," + (0.04 + R() * 0.07) + ")";
          g.lineWidth = 1;
          const yy = y + R() * ph;
          g.beginPath();
          g.moveTo(x, yy);
          g.bezierCurveTo(
            x + len * 0.3,
            yy + R() * 3 - 1.5,
            x + len * 0.6,
            yy + R() * 3 - 1.5,
            x + len,
            yy + R() * 2 - 1,
          );
          g.stroke();
        }
        g.fillStyle = "rgba(50,30,15,.55)";
        g.fillRect(x, y, len, 1.2);
        g.fillRect(x + len - 1, y, 1.2, ph);
        x += len;
      }
    }
  });
  const woodB = mkCanvas(512, (g, n) => {
    g.fillStyle = "#bbb";
    g.fillRect(0, 0, n, n);
    const ph = n / 8;
    g.fillStyle = "#333";
    for (let r = 0; r < 8; r++) g.fillRect(0, r * ph, n, 1.5);
    noiseDots(g, n, rnd(3), 0.25, 2500, 60, 200);
  });
  T.wood = { map: mkTex(wood, 1 / 112), bump: mkTex(woodB, 1 / 112), rough: 0.5 };
  const oakC = mkCanvas(512, (g, n) => {
    g.drawImage(wood, 0, 0);
    g.fillStyle = "rgba(255,238,205,.5)";
    g.fillRect(0, 0, n, n);
  });
  T.oak = { map: mkTex(oakC, 1 / 112), bump: T.wood.bump, rough: 0.45 };
  // subway tile: 512px = 60 cm, 7.5x30 cm bricks, running bond
  const subC = mkCanvas(512, (g, n) => {
    const R = rnd(5);
    g.fillStyle = "#c9c9c6";
    g.fillRect(0, 0, n, n);
    for (let r = 0; r < 8; r++) {
      for (let c = -1; c < 3; c++) {
        const x = c * 256 + (r % 2 ? 128 : 0),
          v = (246 + R() * 7) | 0;
        g.fillStyle = "rgb(" + v + "," + v + "," + (v - 1) + ")";
        g.fillRect(x + 2, r * 64 + 2, 252, 60);
      }
    }
  });
  const subB = mkCanvas(512, (g, n) => {
    g.fillStyle = "#eee";
    g.fillRect(0, 0, n, n);
    g.fillStyle = "#222";
    for (let r = 0; r < 8; r++) {
      g.fillRect(0, r * 64, n, 3);
      for (let c = -1; c < 3; c++) {
        const x = c * 256 + (r % 2 ? 128 : 0);
        g.fillRect(x, r * 64, 3, 64);
      }
    }
  });
  T.subway = { map: mkTex(subC, 1 / 60), bump: mkTex(subB, 1 / 60), rough: 0.22 };
  // tile: 512px = 120 cm, 2x2 tiles of 60 cm
  const tile = mkCanvas(512, (g, n) => {
    const R = rnd(11);
    g.fillStyle = "#8f8d88";
    g.fillRect(0, 0, n, n);
    for (let a = 0; a < 2; a++)
      for (let b = 0; b < 2; b++) {
        const v = (214 + R() * 10) | 0;
        g.fillStyle = "rgb(" + (v + 2) + "," + (v - 3) + "," + (v - 12) + ")";
        g.fillRect(a * 256 + 3, b * 256 + 3, 250, 250);
      }
    noiseDots(g, n, R, 0.07, 3500, 90, 230);
  });
  const tileB = mkCanvas(512, (g, n) => {
    g.fillStyle = "#ddd";
    g.fillRect(0, 0, n, n);
    g.fillStyle = "#222";
    g.fillRect(0, 0, n, 5);
    g.fillRect(0, 0, 5, n);
    g.fillRect(253, 0, 6, n);
    g.fillRect(0, 253, n, 6);
    g.fillRect(n - 3, 0, 3, n);
    g.fillRect(0, n - 3, n, 3);
  });
  T.tile = { map: mkTex(tile, 1 / 120), bump: mkTex(tileB, 1 / 120), rough: 0.3 };
  // concrete: 512px = 300 cm
  const conc = mkCanvas(512, (g, n) => {
    g.fillStyle = "#a7a7a3";
    g.fillRect(0, 0, n, n);
    const R = rnd(5);
    noiseDots(g, n, R, 0.12, 9000, 70, 200);
    g.strokeStyle = "rgba(60,60,60,.35)";
    g.lineWidth = 2;
    g.strokeRect(0, 0, n, n);
  });
  T.conc = { map: mkTex(conc, 1 / 300), bump: mkTex(conc, 1 / 300), rough: 0.85 };
  // plaster noise for walls
  const pl = mkCanvas(256, (g, n) => {
    g.fillStyle = "#bbb";
    g.fillRect(0, 0, n, n);
    noiseDots(g, n, rnd(9), 0.35, 5000, 80, 220);
  });
  T.plaster = { bump: mkTex(pl, 1 / 90) };
  // stone/quartz: 512px = 150 cm
  const stoneC = mkCanvas(512, (g, n) => {
    const R = rnd(31);
    g.fillStyle = "#f3f1ec";
    g.fillRect(0, 0, n, n);
    noiseDots(g, n, R, 0.06, 5000, 200, 250);
    for (let k = 0; k < 7; k++) {
      g.strokeStyle =
        (k % 2 ? "rgba(190,150,80," : "rgba(120,124,130,") + (0.16 + R() * 0.2 + (k % 2 ? 0.18 : 0)) + ")";
      g.lineWidth = 0.8 + R() * 2.2;
      g.beginPath();
      let x = R() * n,
        y = 0;
      g.moveTo(x, y);
      for (let t = 0; t < 9; t++) {
        x += R() * 70 - 35;
        y += n / 9;
        g.quadraticCurveTo(x + R() * 30 - 15, y - n / 18, x, y);
      }
      g.stroke();
    }
  });
  T.stone = { map: mkTex(stoneC, 1 / 150), rough: 0.16 };
  // wood grain for furniture / cabinet doors: long streaks, 512px = 90 cm
  const grainC = mkCanvas(512, (g, n) => {
    const R = rnd(41);
    g.fillStyle = "#d6d6d6";
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 340; i++) {
      const v = (150 + R() * 80) | 0;
      g.strokeStyle = "rgba(" + v + "," + v + "," + v + "," + (0.15 + R() * 0.25) + ")";
      g.lineWidth = 0.6 + R() * 2.2;
      const x = R() * n,
        w = R() * 10 - 5;
      g.beginPath();
      g.moveTo(x, 0);
      g.bezierCurveTo(x + w, n * 0.3, x - w, n * 0.6, x + w * 0.5, n);
      g.stroke();
    }
    for (let k = 0; k < 4; k++) {
      g.fillStyle = "rgba(90,90,90,.18)";
      g.beginPath();
      g.ellipse(R() * n, R() * n, 3 + R() * 4, 18 + R() * 20, 0, 0, 6.3);
      g.fill();
    }
  });
  T.grain = { map: mkTex(grainC, 1 / 90), bump: mkTex(grainC, 1 / 90), rough: 0.55 };
  // fabric weave: 256px = 8 cm
  const weaveC = mkCanvas(256, (g, n) => {
    const R = rnd(51);
    g.fillStyle = "#d4d4d4";
    g.fillRect(0, 0, n, n);
    const st = 8;
    for (let y = 0; y < n; y += st)
      for (let x = 0; x < n; x += st) {
        const v = ((x + y) / st) & 1 ? 236 : 190;
        g.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
        g.fillRect(x, y, st - 1, st - 1);
      }
    noiseDots(g, n, R, 0.25, 6000, 150, 240);
  });
  T.fabric = { map: mkTex(weaveC, 1 / 8), bump: mkTex(weaveC, 1 / 8), rough: 0.95 };
  // rug pile: 256px = 30 cm
  const pileC = mkCanvas(256, (g, n) => {
    const R = rnd(61);
    g.fillStyle = "#cfcfcf";
    g.fillRect(0, 0, n, n);
    noiseDots(g, n, R, 0.5, 16000, 110, 250);
  });
  T.pile = { map: mkTex(pileC, 1 / 30), bump: mkTex(pileC, 1 / 30), rough: 1 };
  // grass
  const gr = mkCanvas(512, (g, n) => {
    g.fillStyle = "#7c9a6b";
    g.fillRect(0, 0, n, n);
    const R = rnd(21);
    for (let i = 0; i < 9000; i++) {
      const v = R();
      g.fillStyle = v < 0.5 ? "rgba(88,118,70,.5)" : "rgba(140,168,112,.45)";
      g.fillRect(R() * n, R() * n, 2, 3);
    }
  });
  T.grass = { map: mkTex(gr, 1 / 300) };
  // sky gradient for background
  const sk = document.createElement("canvas");
  sk.width = 4;
  sk.height = 256;
  {
    const g = sk.getContext("2d"),
      gg = g.createLinearGradient(0, 0, 0, 256);
    gg.addColorStop(0, "#6fa3d8");
    gg.addColorStop(0.55, "#b9d6ee");
    gg.addColorStop(1, "#eef2ee");
    g.fillStyle = gg;
    g.fillRect(0, 0, 4, 256);
  }
  T.sky = new THREE.CanvasTexture(sk);
  return T;
}
function makeEnv() {
  const sceneE = new THREE.Scene();
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const g = c.getContext("2d"),
    gg = g.createLinearGradient(0, 0, 0, 128);
  gg.addColorStop(0, "#c9d6e6");
  gg.addColorStop(0.5, "#eeeae2");
  gg.addColorStop(0.52, "#cfc8ba");
  gg.addColorStop(1, "#8b877d");
  g.fillStyle = gg;
  g.fillRect(0, 0, 4, 128);
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 16),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.BackSide }),
  );
  sceneE.add(m);
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(4, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff2d8 }),
  );
  sun.position.set(25, 30, -12);
  sceneE.add(sun);
  const pm = new THREE.PMREMGenerator(rn);
  const t = pm.fromScene(sceneE, 0.02).texture;
  pm.dispose();
  return t;
}
function floorKind(n, cz) {
  n = (n || "").toLowerCase();
  if (/garage/.test(n)) return "conc";
  if (/bath|ensuite|mud|foyer|laundry/.test(n)) return "tile";
  if (/\[oak\]/.test(n)) return "oak";
  return "wood";
}
function stdFrom(m, o) {
  const s = new THREE.MeshStandardMaterial(
    Object.assign(
      {
        color: m.color ? m.color.getHex() : 0xcccccc,
        emissive: m.emissive && m.emissive.getHex() == 0xffe2a8 ? 0xffe2a8 : 0,
        roughness: 0.72,
        metalness: 0,
        transparent: m.transparent,
        opacity: m.opacity,
        side: m.side,
        envMapIntensity: 0.4,
      },
      o || {},
    ),
  );
  return s;
}
function lumOf(c) {
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}
function realify(mesh) {
  const m = mesh.material;
  if (!m || Array.isArray(m) || !m.isMaterial) return;
  if (m.isMeshStandardMaterial || m.isSpriteMaterial) return;
  if (mesh.isLineSegments || mesh.isLine) {
    mesh.userData._vis = mesh.visible;
    mesh.visible = false;
    return;
  }
  if (!m.isMeshLambertMaterial) return;
  let n;
  if (m === glass) {
    n = RL.glassM;
  } else if (S.floors.includes(mesh)) {
    const k = floorKind(mesh.userData.n),
      t = RL.tx[k] || RL.tx.wood;
    const dk0 = mesh.userData.n && /deck/i.test(mesh.userData.n);
    n = stdFrom(m, {
      color: 0xffffff,
      map: t.map,
      bumpMap: t.bump,
      bumpScale: 0.8,
      roughness: t.rough,
      envMapIntensity: 0.35,
    });
    mesh.userData._isFloor = 1;
  } else if (S.walls.includes(mesh)) {
    n = stdFrom(m, { roughness: 0.95, bumpMap: RL.tx.plaster.bump, bumpScale: 0.25, envMapIntensity: 0.4 });
  } else {
    const L = lumOf(m.color);
    let r = 0.7,
      mt = 0;
    if (L < 0.05) {
      r = 0.3;
      mt = 0.15;
    }
    const gm = mesh.geometry,
      isBox = gm && gm.type == "BoxGeometry",
      c = m.color,
      hue = Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
    let kind = null;
    if (isBox && !m.transparent) {
      const P = gm.parameters,
        wy = new THREE.Vector3();
      mesh.getWorldPosition(wy);
      const yb = wy.y - P.height / 2 + 1;
      let e0 = 0;
      for (const k in S.el) if (S.el[k] <= yb && S.el[k] > e0) e0 = S.el[k];
      const bot = yb - 1 - e0;
      if (
        P.height <= 8 &&
        P.width >= 20 &&
        P.depth >= 20 &&
        bot > 70 &&
        bot < 130 &&
        L > 0.55 &&
        L < 0.96 &&
        hue < 0.12
      )
        kind = "stone";
      else if (
        Math.min(P.width, P.depth) <= 2 &&
        bot > 85 &&
        bot < 95 &&
        P.height >= 50 &&
        P.height <= 100 &&
        L > 0.55 &&
        hue < 0.12
      )
        kind = "subway";
      else if (P.height <= 9 && bot < 20 && L > 0.2 && L < 0.95 && P.width > 100 && P.depth > 100)
        kind = "pile";
      else if (L > 0.04 && L < 0.85 && c.r > c.g && c.g > c.b && hue > 0.2) kind = "grain";
      else if (
        L > 0.12 &&
        L < 0.93 &&
        hue < 0.25 &&
        Math.min(P.width, P.depth) >= 25 &&
        Math.max(P.width, P.depth) <= 300 &&
        P.height >= 10 &&
        P.height <= 100 &&
        bot < 60 &&
        !(P.height >= 83 && P.height <= 92)
      )
        kind = "fabric";
    }
    if (kind) {
      const t = RL.tx[kind];
      if (!gm._uvd) {
        gm._uvd = 1;
        const P = gm.parameters,
          u = gm.attributes.uv,
          dm = [
            [P.depth, P.height],
            [P.depth, P.height],
            [P.width, P.depth],
            [P.width, P.depth],
            [P.width, P.height],
            [P.width, P.height],
          ];
        for (let f = 0; f < 6; f++)
          for (let v = 0; v < 4; v++) {
            const i = f * 4 + v;
            u.setXY(i, u.getX(i) * dm[f][0], u.getY(i) * dm[f][1]);
          }
        u.needsUpdate = true;
      }
      const o = { map: t.map, roughness: t.rough, envMapIntensity: 0.4 };
      if (t.bump) {
        o.bumpMap = t.bump;
        o.bumpScale = kind == "grain" ? 0.6 : 1.2;
      }
      if (kind == "grain") o.color = 0xffffff;
      const gf = L > 0.6 ? 1.15 : 1.3;
      if (kind == "grain") {
        o.color = new THREE.Color(c.r * gf, c.g * gf, c.b * gf);
      }
      n = stdFrom(m, o);
      if (kind == "grain")
        n.color.setRGB(Math.min(1, c.r * gf), Math.min(1, c.g * gf), Math.min(1, c.b * gf));
    } else {
      const hx = c.getHex();
      if (hx == 0xb9bfc4 || hx == 0x7d8388) {
        r = 0.38;
        mt = 0.5;
      }
      n = stdFrom(m, { roughness: r, metalness: mt });
    }
  }
  mesh.userData._om = m;
  mesh.material = n;
}
function ensurePlasterUV(mesh) {
  const g = mesh.geometry;
  if (g.attributes.uv || !g.attributes.position) return;
  const p = g.attributes.position,
    uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    uv[2 * i] = p.getX(i) + p.getZ(i);
    uv[2 * i + 1] = p.getY(i);
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}
function realRefresh() {
  if (!RL.on || !S.root) return;
  S.root.traverse((o) => {
    if (o.isMesh && !o.userData._om) {
      if (S.walls.includes(o)) ensurePlasterUV(o);
      realify(o);
    } else if (o.isLineSegments && o.userData._vis === undefined) {
      o.userData._vis = o.visible;
      o.visible = false;
    }
  });
  if (RL.glassM) RL.glassM.needsUpdate = false;
  const lit = S.walk;
  HL.intensity = lit ? 0.4 : 0.5;
  RL.fill.visible = lit;
  RL.fill.position.set(W.x, W.feet + 150, W.z);
  W.ceil.forEach((m) => {
    m.castShadow = true;
    if (m.material.emissive) {
      m.material.emissive.setHex(0xf4f2ee);
      m.material.emissiveIntensity = 0.5;
    }
  });
}
function setReal(on) {
  try {
    setReal0(on);
  } catch (e) {
    console.warn("Realistic mode unavailable", e);
    RL.on = false;
    $("o-real").checked = false;
    try {
      sc.background = new THREE.Color(dk ? 0x1d2622 : 0xdde7dc);
      sc.environment = null;
      rn.toneMapping = THREE.NoToneMapping;
      gr.material = RL.gm0 || gr.material;
      dl.intensity = 0.65;
      sc.fog = null;
    } catch (_) {}
  }
}
function setReal0(on) {
  if (on === RL.on) return;
  if (on && !RL.tx) {
    RL.tx = makeTex();
    RL.env = makeEnv();
    RL.glassM = new THREE.MeshStandardMaterial({
      color: 0xcfe8f2,
      roughness: 0.04,
      metalness: 0,
      transparent: true,
      opacity: 0.28,
      envMapIntensity: 1.3,
      side: 2,
    });
    RL.fill = new THREE.PointLight(0xffe9cf, 0.7, 900, 1.6);
    RL.fill.visible = false;
    sc.add(RL.fill);
    RL.gm = new THREE.MeshStandardMaterial({ map: RL.tx.grass.map, roughness: 1, color: 0xffffff });
    RL.gm0 = gr.material;
  }
  RL.on = on;
  if (on) {
    sc.background = RL.tx.sky;
    sc.environment = RL.env;
    rn.toneMapping = THREE.ACESFilmicToneMapping;
    rn.toneMappingExposure = 1.05;
    rn.shadowMap.type = THREE.PCFSoftShadowMap;
    gr.material = RL.gm;
    dl.intensity = 1.15;
    dl.color.setHex(0xfff0dc);
    dl.shadow.bias = -0.0004;
    dl.shadow.radius = 3;
    dl.shadow.mapSize.set(2048, 2048);
    sc.fog = new THREE.Fog(0xdfe9ee, 6000, 16000);
  } else {
    sc.background = new THREE.Color(dk ? 0x1d2622 : 0xdde7dc);
    sc.environment = null;
    rn.toneMapping = THREE.NoToneMapping;
    gr.material = RL.gm0;
    dl.intensity = 0.65;
    dl.color.setHex(0xffffff);
    sc.fog = null;
    if (RL.fill) RL.fill.visible = false;
    if (S.root)
      S.root.traverse((o) => {
        if (o.userData && o.userData._om) {
          o.material = o.userData._om;
          delete o.userData._om;
        }
        if (o.isLineSegments && o.userData._vis !== undefined) {
          o.visible = o.userData._vis;
          delete o.userData._vis;
        }
      });
  }
  rn.shadowMap.needsUpdate = true;
  if (S.root)
    S.root.traverse((o) => {
      if (o.material)
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => (m.needsUpdate = true));
    });
  try {
    localStorage.setItem("remodel-real", on ? "1" : "0");
  } catch (e) {}
  realRefresh();
  if (S.root) applyAll();
}
{
  const _aa = applyAll;
  applyAll = function () {
    _aa.apply(this, arguments);
    realRefresh();
    if (S.root)
      S.root.traverse((o) => {
        if (o.userData && o.userData.pot) o.visible = !!S.walk;
        if (o.userData && o.userData.art) o.visible = $("o-art").checked;
      });
  };
}
$("o-real").onchange = (e) => setReal(e.target.checked);
$("o-art").onchange = () => applyAll();
