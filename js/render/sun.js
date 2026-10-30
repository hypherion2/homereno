// Shadows toggle and sun position by date / time of day.
// ---------- shadows and sun study
const SUN = { lat: 49.26 };
function sunPos() {
  const d = new Date($("sun-d").value + "T12:00:00"),
    N = Math.round((d - new Date(d.getFullYear(), 0, 0)) / 864e5),
    dec = (-23.44 * Math.cos(((2 * Math.PI) / 365) * (N + 10)) * Math.PI) / 180,
    ph = (SUN.lat * Math.PI) / 180,
    t = +$("sun-t").value,
    H = ((t - 12) * 15 * Math.PI) / 180;
  const sa = Math.sin(ph) * Math.sin(dec) + Math.cos(ph) * Math.cos(dec) * Math.cos(H),
    alt = Math.asin(sa);
  let A = Math.acos(
    Math.max(-1, Math.min(1, (Math.sin(dec) - sa * Math.sin(ph)) / (Math.cos(alt) * Math.cos(ph) || 1e-6))),
  );
  if (H > 0) A = 2 * Math.PI - A;
  return { alt, az: (A * 180) / Math.PI };
}
function buildSunRoof() {
  if (S.sunRoof) {
    sc.remove(S.sunRoof);
    S.sunRoof.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
    });
    S.sunRoof = null;
  }
  const D = DATA[VERS[S.ver].key],
    top = D.levels.reduce((a, l) => (l[2] > a[2] ? l : a)),
    g = new THREE.Group(),
    mat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: 2 });
  D.rooms.forEach((r) => {
    if (r[0] != top[0] || r[4] < 0) return;
    const sh = new THREE.Shape(r[1].map((p) => new THREE.Vector2(p[0], p[1])));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat);
    m.rotation.x = Math.PI / 2;
    m.position.y = top[2] + 246;
    m.castShadow = true;
    g.add(m);
  });
  g.visible = false;
  S.sunRoof = g;
  sc.add(g);
}
function applySun() {
  window.NOFF = (+$("sun-n").value * Math.PI) / 180;
  if (!S.c) return;
  const sh = $("o-sh").checked,
    su = $("o-sun").checked,
    base = RL && RL.on ? 1.15 : 0.65;
  $("sunui").style.display = su ? "" : "none";
  const was = dl.castShadow;
  dl.castShadow = sh;
  if (su) {
    const p = sunPos(),
      n = (+$("sun-n").value * Math.PI) / 180,
      az = (p.az * Math.PI) / 180 - n,
      ca = Math.cos(p.alt);
    const dir = new THREE.Vector3(ca * Math.sin(az), Math.sin(p.alt), -ca * Math.cos(az));
    dl.position.set(S.c.x + dir.x * 3800, S.c.y + dir.y * 3800, S.c.z + dir.z * 3800);
    dl.target.position.copy(S.c);
    const up = p.alt > 0.02,
      k = Math.max(0, Math.sin(p.alt));
    dl.intensity = up ? base * (0.3 + 0.7 * Math.min(1, k * 1.6)) : 0.06;
    dl.color.setRGB(
      1,
      up ? 0.78 + 0.22 * Math.min(1, k * 2) : 0.7,
      up ? 0.6 + 0.4 * Math.min(1, k * 2.2) : 0.9,
    );
    dl.castShadow = sh && up;
    const t = +$("sun-t").value,
      hh = Math.floor(t),
      mm = Math.round((t - hh) * 60),
      dirn = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round((p.az % 360) / 45) % 8];
    $("sun-tl").textContent = (hh % 12 || 12) + ":" + ("0" + mm).slice(-2) + (hh < 12 ? " AM" : " PM");
    $("sun-i").textContent = up
      ? "Sun " +
        Math.round((p.alt * 180) / Math.PI) +
        "° high, from the " +
        dirn +
        ". Solar time at ~49°N; set which way the plan faces above."
      : "Sun is below the horizon.";
    if (S.sunRoof) S.sunRoof.visible = true;
    const s = dl.shadow.camera;
    if (s.right !== 1700) {
      s.left = -1700;
      s.right = 1700;
      s.top = 1700;
      s.bottom = -1700;
      s.far = 9000;
      s.updateProjectionMatrix();
      dl.shadow.mapSize.set(4096, 4096);
      if (dl.shadow.map) {
        dl.shadow.map.dispose();
        dl.shadow.map = null;
      }
    }
  } else {
    dl.position.set(S.c.x + 1300, 2600, S.c.z - 500);
    dl.target.position.copy(S.c);
    dl.intensity = base;
    dl.color.setHex(RL && RL.on ? 0xfff0dc : 0xffffff);
    if (S.sunRoof) S.sunRoof.visible = false;
  }
  if (was !== dl.castShadow && S.root)
    S.root.traverse((o) => {
      if (o.material)
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => (m.needsUpdate = true));
    });
  try {
    rn.shadowMap.needsUpdate = true;
  } catch (e) {}
}
{
  const t = new Date(),
    pad = (n) => ("0" + n).slice(-2);
  $("sun-d").value = t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate());
  ["o-sh", "o-sun"].forEach((i) => ($(i).onchange = applySun));
  ["sun-d", "sun-t", "sun-n"].forEach((i) => ($(i).oninput = applySun));
  $("sunq").onclick = (e) => {
    const b = e.target.closest("button[data-d]");
    if (!b) return;
    $("sun-d").value = new Date().getFullYear() + "-" + b.dataset.d;
    applySun();
  };
  {
    const _bm2 = buildModel;
    buildModel = function () {
      const r = _bm2.apply(this, arguments);
      try {
        buildSunRoof();
        applySun();
      } catch (e) {
        console.warn(e);
      }
      return r;
    };
  }
  {
    const _sr = setReal;
    setReal = function () {
      const r = _sr.apply(this, arguments);
      try {
        applySun();
      } catch (e) {}
      return r;
    };
  }
}

{
  let v = true;
  try {
    const s = localStorage.getItem("remodel-real");
    if (s !== null) v = s == "1";
    else if (matchMedia("(pointer:coarse)").matches) v = false;
  } catch (e) {}
  $("o-real").checked = v;
  if (v) setReal(true);
}
