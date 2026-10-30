// "Ask Claude" custom versions (only active inside the Claude artifact runtime).
// ---------- Ask Claude (artifact runtime only)
const KINDS = {
  sofa: "sofa (w along x at angle 0)",
  ptable: "table on a single central pedestal",
  art: "framed wall art (w x h, d = 3 cm thick, elev = bottom edge, colour = style 0-4)",
  lsofa: "L-shaped sofa with chaise (w = back length, chaise extends 100 cm in front at the -x end)",
  arm: "armchair",
  chair: "dining chair",
  stool: "bar stool",
  round: "round table or pouf (w = diameter)",
  table: "rectangular table",
  island: "kitchen island or counter block",
  bench: "bench",
  plant: "plant",
  tv: "wall-mounted TV",
  console: "low console or media unit",
  box: "generic block such as a cabinet or appliance",
  rug: "flat rug",
  pendant: "single pendant light",
  pendantbar: "linear pendant light",
  hood: "range hood",
};
const CUST = { recs: new Map(), work: new Map(), sample: null, db: null, ls: "remodel-custom" };
const cl = (o) => JSON.parse(JSON.stringify(o));
const pipQ = (x, y, P) => {
  let c = false;
  for (let i = 0, j = P.length - 2; i < P.length; j = i, i += 2) {
    const ax = P[i],
      ay = P[i + 1],
      bx = P[j],
      by = P[j + 1];
    if (ay > y != by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) c = !c;
  }
  return c;
};
function levelId(D, n) {
  const l = D.levels.find((l) => l[1] == n);
  return l ? l[0] : null;
}
function numOk(v, lo, hi) {
  return typeof v == "number" && isFinite(v) && v >= lo && v <= hi;
}
function applyOps(base, ops) {
  const B = DATA[base],
    lay = cl(B.lay || []),
    furn = cl(B.furn),
    notes = [];
  const A = {};
  const get = (id) => {
    const m = /^([LF])(\d+)$/.exec(String(id || ""));
    if (!m) return null;
    const arr = m[1] == "L" ? lay : furn,
      it = arr[+m[2]];
    if (!it) return null;
    if (m[1] == "F" && it[8] != 0) return null;
    return { t: m[1], arr, i: +m[2], it };
  };
  const col = (c) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(c || ""));
    return m ? parseInt(m[1], 16) : null;
  };
  for (const o of ops) {
    if (!o || !o.op) continue;
    if (o.op == "add") {
      const L = levelId(B, o.level);
      if (
        !L ||
        !KINDS[o.kind] ||
        ![o.x, o.y].every((v) => numOk(v, -600, 2400)) ||
        ![o.w, o.d, o.h].every((v) => numOk(v, 2, 1000))
      ) {
        notes.push("Skipped an item that could not be added");
        continue;
      }
      lay.push([
        L,
        o.kind,
        o.x,
        o.y,
        o.w,
        o.d,
        o.h,
        numOk(o.elev, 0, 300) ? o.elev : 0,
        numOk(o.angle, -20, 20) ? o.angle : 0,
        col(o.color) ?? 11107408,
        String(o.label || "").slice(0, 60),
      ]);
      continue;
    }
    const r = get(o.id);
    if (!r) {
      notes.push("Skipped unknown item " + o.id);
      continue;
    }
    if (o.op == "remove") {
      r.arr[r.i] = null;
      continue;
    }
    if (o.op == "move" || o.op == "rotate") {
      if (o.op == "move") {
        if (![o.x, o.y].every((v) => numOk(v, -600, 2400))) {
          notes.push("Skipped a bad move");
          continue;
        }
        if (r.t == "L") {
          r.it[2] = o.x;
          r.it[3] = o.y;
        } else {
          r.it[1] = o.x;
          r.it[2] = o.y;
        }
      }
      if (numOk(o.angle, -20, 20)) {
        if (r.t == "L") r.it[8] = o.angle;
        else r.it[5] = o.angle;
      }
      continue;
    }
    if (o.op == "resize") {
      const k = r.t == "L" ? { w: 4, d: 5, h: 6 } : { w: 3, d: 4, h: 7 };
      for (const f of ["w", "d", "h"]) if (numOk(o[f], 2, 1000)) r.it[k[f]] = o[f];
      continue;
    }
    if (o.op == "recolor") {
      const c = col(o.color);
      if (c !== null && r.t == "L") r.it[9] = c;
      continue;
    }
  }
  return { lay, furn, notes };
}
function buildCustom(rec) {
  const w = applyOps(rec.base, JSON.parse(rec.ops)),
    D = cl(DATA[rec.base]);
  D.lay = w.lay.filter(Boolean);
  D.furn = w.furn.filter(Boolean);
  const key = "c_" + rec.id;
  DATA[key] = D;
  CUST.work.set(key, w);
  // focus on changed items
  const bd = DATA[rec.base];
  return key;
}
function warnFor(w, key) {
  const D = DATA[key],
    out = [],
    P = [];
  D.boxes.forEach((b) => {
    if (b[2] < 30) P.push([b[0], b[1]]);
  });
  const chk = (L, x, y, wd, dp, a, nm) => {
    const c = Math.cos(a),
      s = Math.sin(a),
      pts = [
        [0, 0],
        [0.45, 0.45],
        [-0.45, 0.45],
        [0.45, -0.45],
        [-0.45, -0.45],
      ].map((q) => [x + q[0] * wd * c - q[1] * dp * s, y + q[0] * wd * s + q[1] * dp * c]);
    if (P.some((p) => p[0] == L && pts.some((q) => pipQ(q[0], q[1], p[1]))))
      out.push((nm || "An item") + " may overlap a wall");
    else {
      const inR = D.rooms.some((r) => r[0] == L && pipQ(x, y, r[1].flat()));
      if (!inR) out.push((nm || "An item") + " is outside any room");
    }
  };
  D.lay.forEach((o) => {
    if (!["rug", "pendant", "pendantbar", "hood", "tv"].includes(o[1]) && o[7] < 20)
      chk(o[0], o[2], o[3], o[4], o[5], o[8], o[10] || o[1]);
  });
  return [...new Set(out)].slice(0, 4);
}
function ctxFor(key) {
  const w = CUST.work.get(key) || {
    lay: cl(DATA[VERS[S.ver].key].lay || []),
    furn: cl(DATA[VERS[S.ver].key].furn),
  };
  const D = DATA[VERS[S.ver].key],
    nm = (id) => (D.levels.find((l) => l[0] == id) || [0, "?"])[1];
  const r = (v) => Math.round(v * 10) / 10;
  const items = [];
  w.lay.forEach((o, i) => {
    if (o)
      items.push(
        `L${i}|${nm(o[0])}|${o[1]}|${o[10] || ""}|x${r(o[2])} y${r(o[3])}|${r(o[4])}x${r(o[5])}x${r(o[6])}|a${r(o[8])}|elev${r(o[7])}`,
      );
  });
  w.furn.forEach((f, i) => {
    if (f && f[8] == 0 && f[7] >= 20)
      items.push(
        `F${i}|${nm(f[0])}|existing|${f[9]}|x${r(f[1])} y${r(f[2])}|${r(f[3])}x${r(f[4])}x${r(f[7])}|a${r(f[5])}|elev${r(f[6])}`,
      );
  });
  const rooms = D.rooms
    .filter((q) => q[2] >= 2)
    .map((q) => {
      const xs = q[1].map((p) => p[0]),
        ys = q[1].map((p) => p[1]);
      return `${q[5] || "room"}|${nm(q[0])}|x ${Math.round(Math.min(...xs))}..${Math.round(Math.max(...xs))}|y ${Math.round(Math.min(...ys))}..${Math.round(Math.max(...ys))}`;
    });
  const open = D.furn
    .filter((f) => f[8] == 1 || f[8] == 2)
    .map(
      (f) =>
        `${f[8] == 1 ? "window" : "door"}|${nm(f[0])}|x${Math.round(f[1])} y${Math.round(f[2])}|width ${Math.round(Math.max(f[3], f[4]))}`,
    );
  const stairs = D.furn
    .filter((f) => f[8] == 3)
    .map(
      (f) =>
        `stairs|${nm(f[0])}|x${Math.round(f[1])} y${Math.round(f[2])}|${Math.round(f[3])}x${Math.round(f[4])}`,
    );
  return { items, rooms, open, stairs };
}
async function askClaude(prompt) {
  const key = VERS[S.ver].key,
    c = ctxFor(key);
  const input = `You edit a 3D remodel of a house for its owners. Return ONLY one JSON object, no prose, no code fences.

Units are centimetres. Plan coordinates: x grows east (right), y grows south (down). Angles are radians; at angle 0 an item's width runs along x and its front faces south (+y); pi/2 faces west, pi faces north, 3*pi/2 faces east. Levels: "Level 0" is the ground floor (garage, foyer); "Level 1" is the upper floor (kitchen, living, bedrooms). The owner's current design is "${VERS[S.ver].title}".

CURRENT FURNITURE (id|level|kind|label|position of centre|width x depth x height|angle|elevation). Ids starting L are placed pieces, ids starting F are existing furniture; both can be moved, resized, recoloured (L only) or removed:
${c.items.join("\n")}

ROOMS (name|level|x range|y range):
${c.rooms.join("\n")}

WINDOWS AND DOORS (never block a window; keep 90 cm clear in front of doors):
${c.open.join("\n")}
${c.stairs.join("\n")}

ALLOWED NEW KINDS: ${Object.entries(KINDS)
    .map(([k, v]) => k + " = " + v)
    .join("; ")}.

You can only change furniture. You cannot change walls, stairs, floors, windows or doors; if the request needs that, leave those parts out and say so in "unsupported". Keep pieces inside their room, off walls, and leave walking space of at least 80 cm. When you add or move several pieces, make the group look intentional (aligned, symmetric where it makes sense).

Output schema:
{"title":"2-4 word name for this version","summary":"one plain sentence on what changed","unsupported":"empty string, or what you could not do","ops":[
 {"op":"move","id":"L3","x":0,"y":0,"angle":0},
 {"op":"resize","id":"L3","w":0,"d":0,"h":0},
 {"op":"remove","id":"L3"},
 {"op":"recolor","id":"L3","color":"#aabbcc"},
 {"op":"add","level":"Level 1","kind":"stool","x":0,"y":0,"w":40,"d":40,"h":65,"elev":0,"angle":0,"color":"#333333","label":"Bar stool"}
]}
"angle" on move is optional. Use ids exactly as listed.

REQUEST FROM THE OWNER: ${prompt}`;
  return await CUST.sample.json(input, { modelTier: "default", cache: false });
}
function renderVList() {
  const vl = $("vlist");
  vl.innerHTML = "";
  VERS.forEach((v, i) => {
    const b = document.createElement("button");
    b.className = "ver" + (i == S.ver ? " on" : "");
    b.innerHTML =
      '<span class="n' +
      (i ? "" : " as") +
      '">' +
      (i ? (/^(\d+)/.exec(v.chip) || [0, String(i)])[1].padStart(2, "0") : "AS-IS") +
      "</span><span><b>" +
      v.title.replace(/</g, "&lt;") +
      "</b><i>" +
      v.sub.replace(/</g, "&lt;") +
      "</i></span>" +
      (v.custom ? '<span class="x" title="Delete this version">✕</span>' : '<span class="d"></span>');
    b.onclick = (e) => {
      if (e.target.classList.contains("x")) {
        e.stopPropagation();
        delCustom(v.rid);
        return;
      }
      setVersion(i);
    };
    vl.appendChild(b);
  });
}
function toast(t, ms) {
  const e = $("toast");
  e.textContent = t;
  e.style.display = "block";
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (e.style.display = "none"), ms || 5000);
}
function addCustomVersion(rec) {
  if (CUST.recs.has(rec.id)) return null;
  if (!DATA[rec.base]) return null;
  let key;
  try {
    key = buildCustom(rec);
  } catch (e) {
    return null;
  }
  CUST.recs.set(rec.id, rec);
  const bv = VERS.find((v) => v.key == rec.base) || VERS[0];
  VERS.push({
    key,
    rid: rec.id,
    custom: true,
    title: rec.title,
    sub: "Your request",
    chip: "CUSTOM · " + rec.title,
    kind: "Made from your prompt",
    headline: rec.title,
    desc: rec.summary + (rec.prompt ? " Request: “" + rec.prompt + "”." : ""),
    tags: ["Custom", "Based on " + bv.title],
    btn: "Zoom in",
    proposed: true,
    blinds: bv.blinds,
  });
  return key;
}
async function saveRec(rec) {
  if (CUST.db) {
    await CUST.db.collection("versions").doc(rec.id).set(rec);
  } else {
    try {
      const a = JSON.parse(localStorage.getItem(CUST.ls) || "[]");
      a.push(rec);
      localStorage.setItem(CUST.ls, JSON.stringify(a));
    } catch (e) {}
  }
}
async function delCustom(rid) {
  const i = VERS.findIndex((v) => v.rid == rid);
  if (i < 0) return;
  if (CUST.db) {
    try {
      await CUST.db.collection("versions").doc(rid).delete();
    } catch (e) {
      toast("Could not delete: " + (e.message || e.code || "no permission"));
      return;
    }
  } else {
    try {
      const a = JSON.parse(localStorage.getItem(CUST.ls) || "[]").filter((r) => r.id != rid);
      localStorage.setItem(CUST.ls, JSON.stringify(a));
    } catch (e) {}
  }
  dropCustom(rid);
}
function dropCustom(rid) {
  const i = VERS.findIndex((v) => v.rid == rid);
  if (i < 0) return;
  const was = S.ver;
  VERS.splice(i, 1);
  CUST.recs.delete(rid);
  if (was == i) setVersion(0);
  else if (was > i) {
    S.ver = was - 1;
  }
  renderVList();
}
async function runAsk() {
  const t = $("askt").value.trim();
  if (!t) return;
  const b = $("askb"),
    st = $("asks");
  b.disabled = true;
  st.textContent = "Claude is working on it…";
  try {
    const cur = VERS[S.ver],
      rc = cur.custom ? CUST.recs.get(cur.rid) : null,
      base = rc ? rc.base : cur.key,
      prev = rc ? JSON.parse(rc.ops) : [];
    const out = await askClaude(t);
    if (!out || !Array.isArray(out.ops) || !out.ops.length) {
      st.textContent = (out && out.unsupported) || "Claude did not suggest any furniture changes for that.";
      b.disabled = false;
      return;
    }
    const ops = prev.concat(out.ops.slice(0, 60)),
      id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const rec = {
      id,
      base,
      title: String(out.title || "Custom version").slice(0, 40),
      summary: String(out.summary || "").slice(0, 300),
      prompt: t.slice(0, 300),
      ops: JSON.stringify(ops),
      ts: Date.now(),
    };
    const key = addCustomVersion(rec);
    if (!key) {
      st.textContent = "That edit could not be applied.";
      b.disabled = false;
      return;
    }
    renderVList();
    try {
      await saveRec(rec);
    } catch (e) {
      toast("Applied here, but saving failed: " + (e.message || e.code || "no permission"), 7000);
    }
    setVersion(VERS.findIndex((v) => v.key == key));
    renderVList();
    const warns = warnFor(CUST.work.get(key), key);
    const extra = [out.unsupported && "Not changed: " + out.unsupported, ...warns]
      .filter(Boolean)
      .join(" · ");
    st.textContent = "";
    $("askt").value = "";
    toast(out.title + " is ready." + (extra ? " " + extra : ""), 9000);
  } catch (e) {
    st.textContent =
      e && e.code == "not_granted"
        ? "Permission to ask Claude was declined."
        : e && e.code == "rate_limited"
          ? "Too many requests, try again in a minute."
          : "Could not get an answer (" + ((e && (e.message || e.code)) || "error") + "). Try rephrasing.";
  }
  b.disabled = false;
}
async function initAsk() {
  let sample = null,
    db = null;
  try {
    if (window.claude && claude.use) {
      sample = await claude.use("sample");
      db = await claude.use("db");
    }
  } catch (e) {}
  if (!sample) return;
  CUST.sample = sample;
  CUST.db = db;
  $("ask").hidden = false;
  $("askb").onclick = runAsk;
  $("askt").addEventListener("keydown", (e) => {
    if (e.key == "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      runAsk();
    }
  });
  document.querySelectorAll("#askex button").forEach(
    (b) =>
      (b.onclick = () => {
        $("askt").value = b.textContent;
        $("askt").focus();
      }),
  );
  if (db) {
    db.collection("versions")
      .orderBy("ts", "asc")
      .onSnapshot(
        (snap) => {
          let ch = false;
          snap.docChanges().forEach((c) => {
            const d = c.doc.data();
            if (c.type == "removed") {
              dropCustom(c.doc.id);
              return;
            }
            if (d && d.id && addCustomVersion(d)) ch = true;
          });
          if (ch) renderVList();
        },
        () => {},
      );
  } else {
    try {
      JSON.parse(localStorage.getItem(CUST.ls) || "[]").forEach(addCustomVersion);
      renderVList();
    } catch (e) {}
  }
}
initAsk();
