// First-person walk-through: collisions, stairs, floors, keyboard / mouse / touch controls.
// ---------- first-person walk mode ----------
const W = {
  on: false,
  x: 700,
  z: 1100,
  feet: 255.84,
  yaw: 0,
  pitch: 0,
  keys: {},
  lock: false,
  drag: false,
  solids: [],
  ramps: [],
  floors: [],
  ceil: [],
  R: 24,
  mv: [0, 0],
  mt: null,
  lt: null,
  prev: null,
  tick: 0,
};
const rectP = (x, y, w, d, a) => {
  const c = Math.cos(a),
    s = Math.sin(a),
    o = [];
  [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].forEach((q) => {
    const dx = (q[0] * w) / 2,
      dz = (q[1] * d) / 2;
    o.push(x + c * dx - s * dz, y + s * dx + c * dz);
  });
  return o;
};
function pipW(x, z, P) {
  let c = false;
  const n = P.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = P[2 * i],
      zi = P[2 * i + 1],
      xj = P[2 * j],
      zj = P[2 * j + 1];
    if (zi > z != zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
function pipA(x, z, A) {
  return pipW(x, z, A.flat());
}
function edgeD(x, z, P) {
  let m = 1e9;
  const n = P.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n,
      ax = P[2 * i],
      az = P[2 * i + 1],
      bx = P[2 * j],
      bz = P[2 * j + 1],
      dx = bx - ax,
      dz = bz - az,
      l = dx * dx + dz * dz;
    let t = l ? ((x - ax) * dx + (z - az) * dz) / l : 0;
    t = Math.max(0, Math.min(1, t));
    m = Math.min(m, Math.hypot(x - ax - t * dx, z - az - t * dz));
  }
  return m;
}
function prepWalk() {
  const D = DATA[VERS[S.ver].key],
    el = S.el;
  W.solids = [];
  W.ramps = [];
  W.floors = [];
  const add = (P, b, t) => {
    let x0 = 1e9,
      x1 = -1e9,
      z0 = 1e9,
      z1 = -1e9;
    for (let i = 0; i < P.length; i += 2) {
      x0 = Math.min(x0, P[i]);
      x1 = Math.max(x1, P[i]);
      z0 = Math.min(z0, P[i + 1]);
      z1 = Math.max(z1, P[i + 1]);
    }
    W.solids.push({ P, b, t, x0, x1, z0, z1 });
  };
  D.boxes.forEach((b) => {
    add(b[1], el[b[0]] + b[2], el[b[0]] + b[2] + b[3]);
    W.solids[W.solids.length - 1].w = 1;
  });
  D.furn.forEach((f) => {
    const [L, x, y, w, d, a, e, h, t, n, s] = f;
    if (t == 3) {
      W.ramps.push({ x, y, w, d, a, base: el[L] + e, h, s });
      return;
    }
    if (t == 1 || t == 2 || /slid/i.test(n)) return;
    add(rectP(x, y, w, d, a), el[L] + e, el[L] + e + h);
  });
  (D.lay || []).forEach((o) => {
    const [L, k, x, y, w, d, h, e, a] = o;
    if (k == "rug" || k == "pendant" || k == "pendantbar" || k == "pot" || k == "art") return;
    add(rectP(x, y, w, d, a), el[L] + e, el[L] + e + h);
    if (k == "lsofa") {
      const lx = -(w / 2 - d / 2),
        lz = d / 2 + 50;
      add(
        rectP(x + lx * Math.cos(a) - lz * Math.sin(a), y + lx * Math.sin(a) + lz * Math.cos(a), d, 100, a),
        el[L] + e,
        el[L] + e + h,
      );
    }
  });
  D.rooms.forEach((r) =>
    W.floors.push({ poly: r[1].flat(), holes: r[6] || [], h: el[r[0]], n: r[5], cz: r[4], A: r[2] }),
  );
  D.furn.forEach((f) => {
    if (f[8] == 2)
      W.floors.push({
        poly: rectP(f[1], f[2], f[3], 40, f[5]),
        holes: [],
        h: el[f[0]],
        n: "",
        cz: f[2],
        A: 0,
      });
  });
  W.ceil.forEach((m) => {
    S.root.remove(m);
    m.geometry.dispose();
  });
  W.ceil = [];
  const cm = new THREE.MeshLambertMaterial({ color: 0xf4f2ee, side: 2 });
  D.rooms.forEach((r) => {
    if (nm0(D, r[0]) != "Level 1" || r[4] < 0) return;
    const sh = new THREE.Shape(r[1].map((p) => new THREE.Vector2(p[0], p[1])));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), cm);
    m.rotation.x = Math.PI / 2;
    m.position.y = el[r[0]] + 243;
    S.root.add(m);
    W.ceil.push(m);
  });
  if (typeof realRefresh == "function") realRefresh();
}
function nm0(D, id) {
  const l = D.levels.find((l) => l[0] == id);
  return l ? l[1] : "";
}
function cands(x, z) {
  const c = [];
  W.floors.forEach((f) => {
    if (pipW(x, z, f.poly) && !f.holes.some((h) => pipA(x, z, h))) c.push(f.h);
  });
  W.ramps.forEach((r) => {
    const dx = x - r.x,
      dz = z - r.y,
      ca = Math.cos(r.a),
      sa = Math.sin(r.a),
      lx = dx * ca + dz * sa,
      lz = -dx * sa + dz * ca;
    if (Math.abs(lx) <= r.w / 2 && Math.abs(lz) <= r.d / 2 + 40) {
      const t = Math.max(0, Math.min(1, (lz * r.s + r.d / 2) / r.d));
      c.push(r.base + t * r.h);
    }
  });
  return c;
}
function onRamp(x, z) {
  return W.ramps.some((r) => {
    const dx = x - r.x,
      dz = z - r.y,
      ca = Math.cos(r.a),
      sa = Math.sin(r.a),
      lx = dx * ca + dz * sa,
      lz = -dx * sa + dz * ca;
    return Math.abs(lx) <= r.w / 2 && Math.abs(lz) <= r.d / 2;
  });
}
function groundAt(x, z, feet) {
  const cs = cands(x, z);
  if (!cs.length) return feet <= 60 ? 0 : null;
  const e = cs.filter((c) => c <= feet + 45);
  return e.length ? Math.max(...e) : feet <= 60 ? 0 : null;
}
function hitSolid(x, z, feet, ramp) {
  const lo = feet + 22,
    hi = feet + 165,
    R = W.R;
  for (const s of W.solids) {
    if (ramp && s.w) continue;
    if (s.t <= lo || s.b >= hi) continue;
    if (x < s.x0 - R || x > s.x1 + R || z < s.z0 - R || z > s.z1 + R) continue;
    if (pipW(x, z, s.P) || edgeD(x, z, s.P) < R) return true;
  }
  return false;
}
function okAt(x, z) {
  const g = groundAt(x, z, W.feet);
  if (g === null || W.feet - g > 60) return false;
  return !hitSolid(x, z, g, onRamp(x, z));
}
function place(L, x, z, look) {
  const D = DATA[VERS[S.ver].key];
  const fl = S.el[L];
  W.feet = fl;
  let best = null;
  for (let r = 0; r <= 420 && !best; r += 20) {
    for (let k = 0; k < (r ? 16 : 1) && !best; k++) {
      const a = (k / 16) * Math.PI * 2,
        px = x + Math.cos(a) * r,
        pz = z + Math.sin(a) * r,
        g = groundAt(px, pz, fl);
      if (g !== null && Math.abs(g - fl) < 50 && !hitSolid(px, pz, g)) best = [px, pz];
    }
  }
  if (!best) best = [x, z];
  W.x = best[0];
  W.z = best[1];
  W.yaw = Math.atan2(-(look[0] - W.x), -(look[1] - W.z));
  W.pitch = -0.05;
}
function spawn(name) {
  const D = DATA[VERS[S.ver].key],
    L1 = D.levels.find((l) => l[1] == "Level 1")[0],
    L0 = D.levels.find((l) => l[1] == "Level 0")[0];
  if (name == "kitchen") place(L1, 760, 700, [1000, 820]);
  else if (name == "deck") place(L1, 905, -80, [905, 300]);
  else if (name == "lower") {
    const f =
      D.rooms.find((r) => r[0] == L0 && /Foyer/.test(r[5] || "")) ||
      D.rooms.filter((r) => r[0] == L0).sort((a, b) => b[2] - a[2])[0];
    place(L0, f[3], f[4], [f[3] + 200, f[4]]);
  } else place(L1, 660, 1030, [960, 1100]);
}
function setCam() {
  cam.position.set(W.x, W.feet + 160, W.z);
  cam.rotation.order = "YXZ";
  cam.rotation.set(W.pitch, W.yaw, 0);
}
function walkStep(dt) {
  const run = W.keys.ShiftLeft || W.keys.ShiftRight,
    sp = run ? 270 : 140,
    k = W.keys;
  let f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) - W.mv[1],
    r = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0) + W.mv[0];
  const n = Math.hypot(f, r);
  if (n > 1) {
    f /= n;
    r /= n;
  }
  const fx = -Math.sin(W.yaw),
    fz = -Math.cos(W.yaw),
    rx = Math.cos(W.yaw),
    rz = -Math.sin(W.yaw);
  let dx = (fx * f + rx * r) * sp * dt,
    dz = (fz * f + rz * r) * sp * dt;
  const st = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 8));
  dx /= st;
  dz /= st;
  for (let i = 0; i < st; i++) {
    if (okAt(W.x + dx, W.z + dz)) {
      W.x += dx;
      W.z += dz;
    } else if (okAt(W.x + dx, W.z)) {
      W.x += dx;
    } else if (okAt(W.x, W.z + dz)) {
      W.z += dz;
    }
  }
  (S.doors || []).forEach((d) => {
    d.o.visible = !(Math.hypot(d.x - W.x, d.y - W.z) < 120 && Math.abs(S.el[d.L] - W.feet) < 150);
  });
  const g = groundAt(W.x, W.z, W.feet),
    tg = g === null ? W.feet : g;
  W.feet = tg > W.feet ? Math.min(tg, W.feet + 350 * dt) : Math.max(tg, W.feet - 500 * dt);
  setCam();
  if (W.tick++ % 8 == 0) hud();
}
function hud() {
  const fl = W.floors.filter(
    (f) => Math.abs(f.h - W.feet) < 70 && pipW(W.x, W.z, f.poly) && !f.holes.some((h) => pipA(W.x, W.z, h)),
  );
  const f = fl.sort((a, b) => b.A - a.A)[0];
  const lev = W.feet > 200 ? "Upper floor" : W.feet > 100 ? "Landing" : "Lower floor";
  $("hr").textContent = (f && f.n ? f.n + " · " : "") + lev;
  $("hv").textContent = VERS[S.ver].chip;
}
const COARSE = matchMedia("(pointer:coarse)").matches;
function requestLock() {
  if (COARSE) {
    W.drag = false;
    const h = $("whint");
    h.textContent = "Left thumb: move · right thumb: look";
    h.style.display = "block";
    setTimeout(() => {
      if (W.on) h.style.display = "none";
    }, 4500);
    return;
  }
  const c = rn.domElement;
  if (!c.requestPointerLock) {
    W.drag = true;
    return;
  }
  try {
    const p = c.requestPointerLock();
    if (p && p.catch)
      p.catch(() => {
        W.drag = true;
      });
  } catch (e) {
    W.drag = true;
  }
}
function enterWalk(sp) {
  if (W.on) return;
  W.prev = {
    cut: S.cut,
    level: S.level,
    pos: cam.position.clone(),
    tgt: ct.target.clone(),
    fov: cam.fov,
    near: cam.near,
  };
  S.walk = true;
  W.on = true;
  S.cut = 1;
  S.level = "both";
  anim = null;
  applyAll();
  document.body.classList.add("walk");
  cam.clearViewOffset();
  cam.fov = 72;
  cam.near = 6;
  cam.updateProjectionMatrix();
  ct.enabled = false;
  prepWalk();
  W.ceil.forEach((m) => (m.visible = true));
  spawn(sp || "living");
  setCam();
  hud();
  $("whint").style.display = "block";
  requestLock();
}
function exitWalk() {
  if (!W.on) return;
  try {
    document.exitPointerLock && document.exitPointerLock();
  } catch (e) {}
  S.walk = false;
  W.on = false;
  W.keys = {};
  (S.doors || []).forEach((d) => (d.o.visible = true));
  W.mv = [0, 0];
  W.ceil.forEach((m) => (m.visible = false));
  document.body.classList.remove("walk");
  S.cut = W.prev.cut;
  $("cut").value = Math.round(S.cut * 100);
  cam.fov = W.prev.fov;
  cam.near = W.prev.near;
  cam.updateProjectionMatrix();
  ct.enabled = true;
  cam.position.copy(W.prev.pos);
  ct.target.copy(W.prev.tgt);
  fitOffset();
  setLevel(W.prev.level);
  $("whint").style.display = "none";
}
function walkVersion(d) {
  const n = (S.ver + d + VERS.length) % VERS.length;
  setVersion(n);
}
function revalidate() {
  prepWalk();
  W.ceil.forEach((m) => (m.visible = true));
  const g = groundAt(W.x, W.z, W.feet);
  if (g === null || hitSolid(W.x, W.z, Math.max(g, 0)))
    place(Object.keys(S.el).find((k) => Math.abs(S.el[k] - W.feet) < 60) || Object.keys(S.el)[0], W.x, W.z, [
      W.x - Math.sin(W.yaw) * 100,
      W.z - Math.cos(W.yaw) * 100,
    ]);
}
$("walkb").onclick = () => (W.on ? exitWalk() : enterWalk("living"));
$("hx").onclick = exitWalk;
$("hp").onclick = () => walkVersion(-1);
$("hn").onclick = () => walkVersion(1);
[
  ["hk", "kitchen"],
  ["hl", "living"],
  ["hd", "deck"],
  ["hw", "lower"],
].forEach(
  ([id, s]) =>
    ($(id).onclick = () => {
      spawn(s);
      setCam();
    }),
);
addEventListener("keydown", (e) => {
  if (!W.on) return;
  if (e.code == "Escape") {
    if (!W.lock) exitWalk();
    return;
  }
  W.keys[e.code] = true;
  if (e.code == "Digit1") {
    spawn("kitchen");
  } else if (e.code == "Digit2") {
    spawn("living");
  } else if (e.code == "Digit3") {
    spawn("deck");
  } else if (e.code == "Digit4") {
    spawn("lower");
  } else if (e.code == "BracketLeft") walkVersion(-1);
  else if (e.code == "BracketRight") walkVersion(1);
  if (/^(Arrow|Space)/.test(e.code)) e.preventDefault();
});
addEventListener("keyup", (e) => {
  W.keys[e.code] = false;
});
addEventListener("blur", () => {
  W.keys = {};
});
document.addEventListener("pointerlockchange", () => {
  W.lock = document.pointerLockElement === rn.domElement;
  if (W.on) $("whint").style.display = W.lock ? "none" : "block";
});
document.addEventListener("pointerlockerror", () => {
  W.drag = true;
  $("whint").textContent = "Hold the mouse button and drag to look around";
});
document.addEventListener("mousemove", (e) => {
  if (!W.on) return;
  if (W.lock || (W.drag && e.buttons & 1)) {
    W.yaw -= e.movementX * (W.lock ? 0.0022 : 0.004);
    W.pitch = Math.max(-1.45, Math.min(1.45, W.pitch - e.movementY * (W.lock ? 0.0022 : 0.004)));
  }
});
rn.domElement.addEventListener("click", () => {
  if (W.on && !W.lock && !W.drag) requestLock();
});
rn.domElement.addEventListener(
  "touchstart",
  (e) => {
    if (!W.on) return;
    e.preventDefault();
    [...e.changedTouches].forEach((t) => {
      if (t.clientX < innerWidth / 2 && !W.mt) W.mt = { id: t.identifier, x: t.clientX, y: t.clientY };
      else if (!W.lt) W.lt = { id: t.identifier, x: t.clientX, y: t.clientY };
    });
  },
  { passive: false },
);
rn.domElement.addEventListener(
  "touchmove",
  (e) => {
    if (!W.on) return;
    e.preventDefault();
    [...e.changedTouches].forEach((t) => {
      if (W.mt && t.identifier == W.mt.id) {
        W.mv = [
          Math.max(-1, Math.min(1, (t.clientX - W.mt.x) / 55)),
          Math.max(-1, Math.min(1, (t.clientY - W.mt.y) / 55)),
        ];
      } else if (W.lt && t.identifier == W.lt.id) {
        W.yaw -= (t.clientX - W.lt.x) * 0.006;
        W.pitch = Math.max(-1.45, Math.min(1.45, W.pitch - (t.clientY - W.lt.y) * 0.006));
        W.lt.x = t.clientX;
        W.lt.y = t.clientY;
      }
    });
  },
  { passive: false },
);
const tend = (e) => {
  [...e.changedTouches].forEach((t) => {
    if (W.mt && t.identifier == W.mt.id) {
      W.mt = null;
      W.mv = [0, 0];
    }
    if (W.lt && t.identifier == W.lt.id) W.lt = null;
  });
};
rn.domElement.addEventListener("touchend", tend);
rn.domElement.addEventListener("touchcancel", tend);
