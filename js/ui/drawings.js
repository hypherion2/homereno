// Architectural drawings, generated in the browser from the design data (any concept or saved edit):
//   A-101  main floor plan at 1:50 – existing walls solid, new walls hatched, removed walls dashed,
//          doors/windows/stair, fixtures and furniture, room names and areas, dimensions, title block
//   A-201  elevations at 1:25 – every cabinet run found in the design, the island, fireplace and TV wall
// Sheets are 24 x 18 in (Arch C) SVG; they open in a new tab with Print / Save as PDF and SVG downloads.
const DW = { W: 609.6, H: 457.2, TB: 112, CEIL: 243.8 };
const dwEsc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const dwFt = (cm) => { const t = Math.round(cm / 2.54); return Math.floor(t / 12) + "'-" + (t % 12) + '"'; };
const dwDim = (cm, mm = true) => dwFt(cm) + (mm ? " (" + Math.round(cm * 10) + ")" : "");
const dwF = (v) => (Math.round(v * 100) / 100).toString();
function dwRect(x, y, w, d, a) {
  const c = Math.cos(a || 0), s = Math.sin(a || 0);
  return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([u, v]) => [x + c * u - s * v, y + s * u + c * v]);
}
function dwPip(x, y, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++)
    if (P[i][1] > y != P[j][1] > y && x < ((P[j][0] - P[i][0]) * (y - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c;
  return c;
}
const dwQuad = (b) => [0, 2, 4, 6].map((i) => [b[1][i], b[1][i + 1]]);
function dwSheet() {
  const o = [];
  return {
    add: (s) => o.push(s),
    t: (x, y, s, size = 2.5, anchor = "middle", weight = 400, fill = "#000", rot = 0) =>
      o.push('<text x="' + dwF(x) + '" y="' + dwF(y) + '" font-size="' + size + '" text-anchor="' + anchor + '" font-weight="' + weight + '" fill="' + fill + '"' +
        (rot ? ' transform="rotate(' + rot + " " + dwF(x) + " " + dwF(y) + ')"' : "") + ">" + dwEsc(s) + "</text>"),
    svg: (defs = "") =>
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + DW.W + 'mm" height="' + DW.H + 'mm" viewBox="0 0 ' + DW.W + " " + DW.H + '" font-family="Inter, system-ui, -apple-system, Helvetica, Arial, sans-serif">' +
      '<defs><pattern id="hatch" width="1.2" height="1.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1.2" height="1.2" fill="#fff"/><line x1="0" y1="0" x2="0" y2="1.2" stroke="#000" stroke-width="0.22"/></pattern>' +
      '<marker id="tick" viewBox="-2 -2 4 4" markerWidth="4" markerHeight="4" orient="auto"><line x1="-1.2" y1="1.2" x2="1.2" y2="-1.2" stroke="#000" stroke-width="0.5"/></marker>' +
      '<marker id="arr" viewBox="0 -2 4 4" markerWidth="5" markerHeight="5" refX="4" orient="auto"><path d="M0,-1.6 L4,0 L0,1.6z" fill="#000"/></marker>' + defs + "</defs>" +
      '<rect width="' + DW.W + '" height="' + DW.H + '" fill="#fff"/>' + o.join("") + "</svg>",
  };
}
function dwTitle(sh, V, title, number, scaleNote, notes) {
  const { W, H, TB } = DW, x0 = W - 8 - TB;
  sh.add('<rect x="8" y="8" width="' + (W - 16) + '" height="' + (H - 16) + '" fill="none" stroke="#000" stroke-width="0.7"/>');
  sh.add('<line x1="' + x0 + '" y1="8" x2="' + x0 + '" y2="' + (H - 8) + '" stroke="#000" stroke-width="0.5"/>');
  let y = 20;
  sh.t(x0 + 6, y, "1615 MCH", 7, "start", 700); y += 7;
  sh.t(x0 + 6, y, "Residential remodel, Port Coquitlam BC", 3, "start"); y += 12;
  sh.add('<line x1="' + x0 + '" y1="' + (y - 6) + '" x2="' + (W - 8) + '" y2="' + (y - 6) + '" stroke="#000" stroke-width="0.3"/>');
  sh.t(x0 + 6, y, "DESIGN", 2.2, "start", 700, "#555"); y += 5.5;
  sh.t(x0 + 6, y, String(V.chip || "").replace("·", "–"), 4, "start", 700); y += 5;
  sh.t(x0 + 6, y, V.title || "", 3, "start"); y += 10;
  sh.t(x0 + 6, y, "NOTES", 2.2, "start", 700, "#555"); y += 5;
  notes.forEach((n) => {
    let line = "";
    n.split(" ").forEach((wd) => { if ((line + " " + wd).length > 52) { sh.t(x0 + 6, y, line.trim(), 2.3, "start"); y += 3.4; line = ""; } line += " " + wd; });
    sh.t(x0 + 6, y, line.trim(), 2.3, "start"); y += 5;
  });
  const yb = H - 70;
  sh.add('<line x1="' + x0 + '" y1="' + yb + '" x2="' + (W - 8) + '" y2="' + yb + '" stroke="#000" stroke-width="0.3"/>');
  sh.t(x0 + 6, yb + 7, "DRAWING", 2.2, "start", 700, "#555");
  sh.t(x0 + 6, yb + 15, title, 4.2, "start", 700);
  sh.t(x0 + 6, yb + 22, scaleNote, 3, "start");
  sh.t(x0 + 6, yb + 32, "DATE  " + new Date().toISOString().slice(0, 10), 2.6, "start");
  sh.t(x0 + 6, yb + 38, "STATUS  Concept / for discussion", 2.6, "start");
  sh.t(x0 + 6, yb + 44, "Not for construction", 2.6, "start", 700);
  sh.add('<line x1="' + x0 + '" y1="' + (H - 24) + '" x2="' + (W - 8) + '" y2="' + (H - 24) + '" stroke="#000" stroke-width="0.3"/>');
  sh.t(x0 + 6, H - 17, "SHEET", 2.2, "start", 700, "#555");
  sh.t(W - 14, H - 12, number, 11, "end", 700);
}
const DW_LAB = [["Fridge", "REF"], ["Oven tower: tall", "OVEN / MW\nTOWER"], ["Coffee station", "COFFEE"], ["Cooking zone", "COOKTOP"], ["Island cooktop", "COOKTOP"],
  ["Cleanup zone: dishwasher", "DW"], ["Cleanup zone: sink", "SINK"], ["Sink", "SINK"], ["Pantry wall: full-height", "PANTRY"], ["Walk-in pantry: shelving (west", "PANTRY"],
  ["Full-height pantry", "PANTRY"], ["Tall cabinet", "TALL CAB."], ["Drinks bar: oak base", "BAR"], ["Slim direct-vent", "GAS FP"], ["Gas fireplace", "GAS FP"],
  ["TV on", "TV"], ["Dining table", "DINING TABLE"], ["Sofa", "SOFA"], ["Big 8 ft sofa", "SOFA"]];
const dwLabFor = (lb) => { const m = DW_LAB.find(([p]) => String(lb).startsWith(p)); return m ? m[1] : ""; };

// ---------------------------------------------------------------- A-101 floor plan
function dwPlan(D, O, V, L) {
  const sh = dwSheet(), SC = 0.2, CUT = 120;
  const boxes = D.boxes.filter((b) => b[0] == L), obox = (O ? O.boxes : []).filter((b) => b[0] == L);
  const xs = boxes.flatMap((b) => [0, 2, 4, 6].map((i) => b[1][i])), ys = boxes.flatMap((b) => [1, 3, 5, 7].map((i) => b[1][i]));
  const xmin = Math.min(...xs), xmax = Math.max(...xs), ymin = Math.min(...ys), ymax = Math.max(...ys);
  // fit the house (and a deck in front, if any) into the drawing area at 1:50
  const deck = D.rooms.filter((r) => r[0] == L && r[4] < ymin - 20);
  const top = Math.min(ymin, ...deck.flatMap((r) => r[1].map((p) => p[1])));
  const areaW = DW.W - 16 - DW.TB, areaH = DW.H - 70;
  const OX = 8 + (areaW - (xmax - xmin) * SC) / 2, OY = 36 + Math.max(0, (areaH - (ymax - top) * SC) / 2);
  const tf = (x, y) => [OX + (x - xmin) * SC, OY + (y - top) * SC];
  const P = (pts) => pts.map(([x, y]) => tf(x, y).map(dwF).join(",")).join(" ");
  const line = (a, b, w = 0.2, extra = "") => { const [ax, ay] = tf(...a), [bx, by] = tf(...b); sh.add('<line x1="' + dwF(ax) + '" y1="' + dwF(ay) + '" x2="' + dwF(bx) + '" y2="' + dwF(by) + '" stroke="#000" stroke-width="' + w + '"' + extra + "/>"); };
  deck.forEach((r) => {
    sh.add('<polygon points="' + P(r[1]) + '" fill="none" stroke="#777" stroke-width="0.25" stroke-dasharray="1.2 0.8"/>');
    const [cx, cy] = tf(r[3], r[4] - 40); sh.t(cx, cy, "DECK (EXISTING)", 2.6, "middle", 600, "#555");
  });
  // fixtures and furniture
  const SKIP = new Set(["pot", "pendant", "pendantbar", "led", "art", "globe", "rug", "plant"]);
  const FURN = new Set(["sofa", "arm", "chair", "stool", "ptable", "table", "bed", "tv"]);
  const lay = D.lay.filter((o) => o[0] == L && !SKIP.has(o[1]) && o[3] > ymin - 20);
  lay.forEach((o) => {
    const [, k, x, y, w, d, h, el, a, , lb] = o;
    if (Math.min(w, d) < 4) return;
    if (h <= 4 && el >= 80 && !(w > 60 && d > 40) && !/^(Island cooktop|Sink|Cooking)/.test(lb || "")) return;
    if (k == "round") { const [cx, cy] = tf(x, y); sh.add('<circle cx="' + dwF(cx) + '" cy="' + dwF(cy) + '" r="' + dwF((w / 2) * SC) + '" fill="none" stroke="#444" stroke-width="0.18"/>'); return; }
    const f = FURN.has(k);
    sh.add('<polygon points="' + P(dwRect(x, y, w, d, a)) + '" fill="none" stroke="' + (f ? "#888" : "#333") + '" stroke-width="' + (f ? 0.15 : 0.22) + '"' + (el >= 130 ? ' stroke-dasharray="0.9 0.6"' : "") + "/>");
  });
  const FX = { "Toilet unit": "WC", "Shower cabin": "SHWR", "Fitted bath": "TUB", Vanity: "VAN", "Washbasin with cabinet": "VAN", Fireplace: "FP (EXIST.)", Bed: "" };
  D.furn.filter((f) => f[0] == L && f[8] == 0 && !/rail/i.test(f[9])).forEach((f) => {
    sh.add('<polygon points="' + P(dwRect(f[1], f[2], f[3], f[4], f[5])) + '" fill="none" stroke="#555" stroke-width="0.2"/>');
    if (FX[f[9]]) { const [cx, cy] = tf(f[1], f[2]); sh.t(cx, cy + 0.8, FX[f[9]], 1.9, "middle", 600, "#333"); }
  });
  D.furn.filter((f) => f[0] == L && /rail/i.test(f[9]) && f[2] > ymin).forEach((f) =>
    sh.add('<polygon points="' + P(dwRect(f[1], f[2], f[3], Math.max(f[4], 4), f[5])) + '" fill="#fff" stroke="#000" stroke-width="0.2"/>'));
  // stair flights below this floor, seen from above
  const el1 = (D.levels.find((l) => l[0] == L) || [0, 0, 0])[2];
  D.furn.filter((f) => f[8] == 3 && /^Staircase/.test(f[9])).forEach((f) => {
    const [, x, y, w, d, a, e, h] = f, Lv = (D.levels.find((l) => l[0] == f[0]) || [0, 0, 0])[2];
    if (Lv + e + h < el1 - 150 || Lv + e > el1) return;
    const upper = Lv + e + h > el1 - 30, dash = upper ? "" : ' stroke-dasharray="1 0.6"';
    sh.add('<polygon points="' + P(dwRect(x, y, w, d, a)) + '" fill="#fff" stroke="#000" stroke-width="' + (upper ? 0.3 : 0.2) + '"' + dash + "/>");
    const n = Math.max(3, Math.round(h / 18.3)), c = Math.cos(a), s = Math.sin(a);
    for (let k = 1; k < n; k++) { const v = -d / 2 + (d * k) / n; line([x - (c * w) / 2 - s * v, y - (s * w) / 2 + c * v], [x + (c * w) / 2 - s * v, y + (s * w) / 2 + c * v], 0.15, dash); }
    if (upper) {
      const [ax, ay] = tf(x - s * (-d / 2 + 8), y + c * (-d / 2 + 8)), [bx, by] = tf(x - s * (d / 2 - 8), y + c * (d / 2 - 8));
      sh.add('<line x1="' + dwF(bx) + '" y1="' + dwF(by) + '" x2="' + dwF(ax) + '" y2="' + dwF(ay) + '" stroke="#000" stroke-width="0.25" marker-end="url(#arr)"/>');
      sh.t((ax + bx) / 2 + 3, (ay + by) / 2, "DN", 2.4, "start", 700);
    }
  });
  // walls: all current cut walls hatched, then the original walls drawn solid inside them (= existing to remain);
  // original walls that are gone get a dashed outline
  const cut = (b) => b[2] < CUT && b[2] + b[3] > CUT, cur = boxes.filter(cut), old = obox.filter(cut);
  const curPolys = cur.map((b) => '<polygon points="' + P(dwQuad(b)) + '"/>').join("");
  sh.add('<g fill="url(#hatch)" stroke="#000" stroke-width="0.35">' + curPolys + "</g>");
  sh.add('<g clip-path="url(#dwcur)" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="0.45">' + old.map((b) => '<polygon points="' + P(dwQuad(b)) + '"/>').join("") + "</g>");
  if (!O) sh.add('<g fill="#1a1a1a">' + curPolys + "</g>");
  sh.add('<g mask="url(#dwnotcur)" fill="none" stroke="#000" stroke-width="0.25" stroke-dasharray="1.2 0.8">' + old.map((b) => '<polygon points="' + P(dwQuad(b)) + '"/>').join("") + "</g>");
  boxes.filter((b) => b[2] + b[3] <= CUT).forEach((b) => sh.add('<polygon points="' + P(dwQuad(b)) + '" fill="#fff" stroke="#000" stroke-width="0.2"/>'));
  const defs = '<clipPath id="dwcur">' + curPolys + "</clipPath>" +
    '<mask id="dwnotcur" maskUnits="userSpaceOnUse" x="0" y="0" width="' + DW.W + '" height="' + DW.H + '"><rect width="' + DW.W + '" height="' + DW.H + '" fill="#fff"/><g fill="#000" stroke="#000" stroke-width="0.3">' + curPolys + "</g></mask>";
  // doors and windows
  const thickAt = (x, y) => {
    const b = boxes.find((b) => dwPip(x, y, dwQuad(b)));
    if (!b) return 14;
    const q = dwQuad(b), e1 = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]), e2 = Math.hypot(q[2][0] - q[1][0], q[2][1] - q[1][1]);
    return Math.max(10, Math.min(e1, e2));
  };
  D.furn.filter((f) => f[0] == L && (f[8] == 1 || f[8] == 2)).forEach((f) => {
    const [, x, y, w, , a, el, , t, nm] = f, th = thickAt(x, y), c = Math.cos(a), s = Math.sin(a);
    const J = (u, v) => [x + c * u - s * v, y + s * u + c * v];
    sh.add('<polygon points="' + P(dwRect(x, y, w, th + 1, a)) + '" fill="#fff"/>');
    const ln = (u1, v1, u2, v2, wd = 0.2, ex = "") => line(J(u1, v1), J(u2, v2), wd, ex);
    ln(-w / 2, -th / 2, -w / 2, th / 2, 0.3); ln(w / 2, -th / 2, w / 2, th / 2, 0.3);
    if (t == 1) {
      if (el < 30) { ln(-w / 2, -1.5, 2, -1.5, 0.35); ln(-2, 1.5, w / 2, 1.5, 0.35); ln(-w / 2, -th / 2, w / 2, -th / 2, 0.12); ln(-w / 2, th / 2, w / 2, th / 2, 0.12); }
      else { ln(-w / 2, -th / 2, w / 2, -th / 2, 0.15); ln(-w / 2, th / 2, w / 2, th / 2, 0.15); ln(-w / 2, 0, w / 2, 0, 0.3); }
    } else if (/Accordion/.test(nm)) {
      const pts = [0, 1, 2, 3, 4].map((k) => tf(...J(-w / 2 + (w * k) / 4, k % 2 ? 6 : 0)));
      sh.add('<polyline points="' + pts.map((p) => p.map(dwF).join(",")).join(" ") + '" fill="none" stroke="#000" stroke-width="0.25"/>');
    } else {
      ln(-w / 2, th / 2, -w / 2, th / 2 + w, 0.3);
      const [ax, ay] = tf(...J(-w / 2, th / 2 + w)), [bx, by] = tf(...J(w / 2, th / 2)), r = w * SC;
      sh.add('<path d="M' + dwF(ax) + "," + dwF(ay) + " A" + dwF(r) + "," + dwF(r) + " 0 0 0 " + dwF(bx) + "," + dwF(by) + '" fill="none" stroke="#000" stroke-width="0.15" stroke-dasharray="0.8 0.5"/>');
    }
  });
  // room names: at the room centre, nudged to clear floor if something sits there
  const NM = { "Family Room / Eating Area / Kitchen": "KITCHEN / DINING", "Living Room / Dining Room": "LIVING", "Master Bedroom": "PRIMARY BEDROOM", "Closet / Bathroom": "BATH", Closet: "CL." };
  const blockers = lay.filter((o) => o[4] * o[5] > 1500).map((o) => dwRect(o[2], o[3], o[4] + 30, o[5] + 30, o[8]));
  const free = (x, y) => !blockers.some((B) => dwPip(x, y, B)) && !boxes.some((b) => dwPip(x, y, dwQuad(b)));
  D.rooms.filter((r) => r[0] == L && r[5] && r[4] > ymin - 5).forEach((r) => {
    const nm = r[5].replace("[oak]", "").trim(); if (!nm) return;
    let lab = NM[nm] || nm.toUpperCase(), [x, y] = [r[3], r[4]];
    if (nm == "Bedroom" && /Teen room/.test(D.lay.map((o) => o[10]).join("|")) && D.lay.some((o) => /^Teen room/.test(o[10] || "") && dwPip(o[2], o[3], r[1]))) lab = "BEDROOM (TEEN)";
    if (!free(x, y)) {
      let best = null;
      for (let rr = 20; rr < 400 && !best; rr += 20) for (let k = 0; k < 16 && !best; k++) {
        const px = r[3] + rr * Math.cos((k * Math.PI) / 8), py = r[4] + rr * Math.sin((k * Math.PI) / 8);
        if (dwPip(px, py, r[1]) && [[0, 0], [-90, 0], [90, 0], [-90, 25], [90, 25], [0, 25]].every(([dx, dy]) => free(px + dx, py + dy))) best = [px, py];
      }
      if (best) [x, y] = best;
    }
    const [cx, cy] = tf(x, y), small = nm == "Closet";
    sh.t(cx, cy, lab, small ? 1.9 : 3, "middle", 700);
    if (!small && r[2] > 1.5) sh.t(cx, cy + 3.6, r[2].toFixed(1) + " m²  ·  " + Math.round(r[2] * 10.764) + " ft²", 2.1);
  });
  // labels for the main fixtures
  const done = new Set();
  lay.forEach((o) => {
    const t = dwLabFor(o[10] || ""); if (!t || done.has(t + Math.round(o[2] / 200) + Math.round(o[3] / 200))) return;
    done.add(t + Math.round(o[2] / 200) + Math.round(o[3] / 200));
    const [cx, cy] = tf(o[2], o[3]), along = Math.abs(Math.sin(o[8] || 0)) > 0.7, rot = along && !/TABLE|SOFA|TV/.test(t) ? -90 : 0, lines = t.split("\n");
    lines.forEach((l, i) => { const dd = (i - (lines.length - 1) / 2) * 2.4; rot ? sh.t(cx + dd + 0.7, cy, l, 1.9, "middle", 700, "#000", rot) : sh.t(cx, cy + dd + 0.7, l, 1.9, "middle", 700); });
  });
  // island: outline of its parts, label and size
  const isl = lay.filter((o) => /^Island/.test(o[10] || "") && o[6] >= 60 && o[7] < 5);
  let ib = null;
  if (isl.length) {
    const pts = isl.flatMap((o) => dwRect(o[2], o[3], o[4], o[5], o[8]));
    ib = { x0: Math.min(...pts.map((p) => p[0])), x1: Math.max(...pts.map((p) => p[0])), y0: Math.min(...pts.map((p) => p[1])), y1: Math.max(...pts.map((p) => p[1])) };
    const topb = D.lay.find((o) => o[0] == L && o[6] <= 5 && o[7] >= 80 && o[4] * o[5] > 15000 && dwPip(o[2], o[3], [[ib.x0, ib.y0], [ib.x1, ib.y0], [ib.x1, ib.y1], [ib.x0, ib.y1]]));
    if (topb) { const q = dwRect(topb[2], topb[3], topb[4], topb[5], topb[8]); ib = { x0: Math.min(...q.map((p) => p[0])), x1: Math.max(...q.map((p) => p[0])), y0: Math.min(...q.map((p) => p[1])), y1: Math.max(...q.map((p) => p[1])) }; }
    const [cx, cy] = tf((ib.x0 + ib.x1) / 2, (ib.y0 + ib.y1) / 2), vert = ib.y1 - ib.y0 > ib.x1 - ib.x0, Lg = Math.max(ib.y1 - ib.y0, ib.x1 - ib.x0), Sh = Math.min(ib.y1 - ib.y0, ib.x1 - ib.x0);
    sh.t(cx + (vert ? 2 : 0), cy, "ISLAND", 2.4, "middle", 700, "#000", vert ? -90 : 0);
    sh.t(cx + (vert ? 5 : 0), cy + (vert ? 0 : 3), dwFt(Lg) + " x " + dwFt(Sh), 1.9, "middle", 400, "#000", vert ? -90 : 0);
  }
  // dimensions
  const dim = (a, b, off, label, size = 2.1, side = 1) => {
    const [ax, ay] = tf(...a), [bx, by] = tf(...b), Ln = Math.hypot(bx - ax, by - ay); if (Ln < 2) return;
    const ux = (bx - ax) / Ln, uy = (by - ay) / Ln, nx = -uy * side, ny = ux * side, A2 = [ax + nx * off, ay + ny * off], B2 = [bx + nx * off, by + ny * off];
    [[ax, ay, A2], [bx, by, B2]].forEach(([px, py, Q]) => sh.add('<line x1="' + dwF(px + nx * 0.8) + '" y1="' + dwF(py + ny * 0.8) + '" x2="' + dwF(Q[0] + nx * 1.5) + '" y2="' + dwF(Q[1] + ny * 1.5) + '" stroke="#000" stroke-width="0.13"/>'));
    sh.add('<line x1="' + dwF(A2[0] - ux * 1.5) + '" y1="' + dwF(A2[1] - uy * 1.5) + '" x2="' + dwF(B2[0] + ux * 1.5) + '" y2="' + dwF(B2[1] + uy * 1.5) + '" stroke="#000" stroke-width="0.18" marker-start="url(#tick)" marker-end="url(#tick)"/>');
    let ang = (Math.atan2(uy, ux) * 180) / Math.PI; if (ang > 90 || ang < -90) ang += 180;
    sh.t((A2[0] + B2[0]) / 2 + nx * 1.2, (A2[1] + B2[1]) / 2 + ny * 1.2 + (Math.abs(ang) < 1 ? 0.8 : 0), label, size, "middle", 500, "#000", Math.abs(ang) > 1 ? ang : 0);
  };
  dim([xmin, ymin], [xmax, ymin], 14, dwDim(xmax - xmin), 2.4, -1);
  dim([xmax, ymin], [xmax, ymax], 14, dwDim(ymax - ymin), 2.4, -1);
  // chains of the openings along the north and south walls
  [[ymin, -1, (f) => f[2] < ymin + 30], [ymax, 1, (f) => f[2] > ymax - 30]].forEach(([yy, side, sel]) => {
    const ops = D.furn.filter((f) => f[0] == L && (f[8] == 1 || f[8] == 2) && sel(f)).map((f) => [f[1] - f[3] / 2, f[1] + f[3] / 2]).sort((a, b) => a[0] - b[0]);
    const ptsx = [xmin]; ops.forEach(([a, b]) => { if (a > ptsx[ptsx.length - 1] + 1) ptsx.push(a); ptsx.push(b); }); if (xmax > ptsx[ptsx.length - 1] + 1) ptsx.push(xmax);
    for (let i = 0; i < ptsx.length - 1; i++) dim([ptsx[i], yy], [ptsx[i + 1], yy], 7, dwFt(ptsx[i + 1] - ptsx[i]), 1.8, side == -1 ? -1 : 1);
  });
  // kitchen clearances around the island and the dining table
  const solid = lay.filter((o) => o[7] < 5 && o[6] >= 60 && !/^Island/.test(o[10] || "") && !FURN.has(o[1]));
  const ext = (o) => { const q = dwRect(o[2], o[3], o[4], o[5], o[8]); return { x0: Math.min(...q.map((p) => p[0])), x1: Math.max(...q.map((p) => p[0])), y0: Math.min(...q.map((p) => p[1])), y1: Math.max(...q.map((p) => p[1])) }; };
  if (ib) {
    const ym = (ib.y0 + ib.y1) / 2, xm = (ib.x0 + ib.x1) / 2, over = (e, a0, a1, b0, b1) => Math.min(a1, b1) - Math.max(a0, b0) > 10;
    const E = solid.map(ext).filter((e) => over(e, e.y0, e.y1, ib.y0, ib.y1) && e.x0 >= ib.x1 - 1).sort((a, b) => a.x0 - b.x0)[0];
    const Wst = solid.map(ext).filter((e) => over(e, e.y0, e.y1, ib.y0, ib.y1) && e.x1 <= ib.x0 + 1).sort((a, b) => b.x1 - a.x1)[0];
    if (E && E.x0 - ib.x1 < 250) { const yy = Math.max(E.y0, ib.y0) + 10; dim([ib.x1, yy], [E.x0, yy], 0, dwDim(E.x0 - ib.x1), 1.8); }
    if (Wst && ib.x0 - Wst.x1 < 250) { const yy = (Math.max(Wst.y0, ib.y0) + Math.min(Wst.y1, ib.y1)) / 2; dim([Wst.x1, yy], [ib.x0, yy], 0, dwDim(ib.x0 - Wst.x1), 1.8); }
    const tb = lay.find((o) => /^Dining table/.test(o[10] || ""));
    if (tb) {
      const t = ext(tb);
      if (Math.min(t.x1, ib.x1) - Math.max(t.x0, ib.x0) > 10) {
        if (t.y1 < ib.y0) dim([xm, t.y1], [xm, ib.y0], 0, dwDim(ib.y0 - t.y1), 1.8, -1);
        else if (t.y0 > ib.y1) dim([xm, ib.y1], [xm, t.y0], 0, dwDim(t.y0 - ib.y1), 1.8, -1);
      }
      // table end to the wall/patio door north of it
      const tx = (t.x0 + t.x1) / 2, wn = boxes.filter((b) => { const q = dwQuad(b), y1 = Math.max(...q.map((p) => p[1])); return y1 <= t.y0 && Math.min(...q.map((p) => p[0])) <= tx && Math.max(...q.map((p) => p[0])) >= tx; })
        .map((b) => Math.max(...dwQuad(b).map((p) => p[1]))).sort((a, b) => b - a)[0];
      if (wn != null && t.y0 - wn < 200) dim([tx, wn], [tx, t.y0], 0, dwDim(t.y0 - wn), 1.8, -1);
    }
  }
  // north arrow, scale bar, legend, headings
  const nx0 = DW.W - 8 - DW.TB - 28, ny0 = 34;
  sh.add('<circle cx="' + nx0 + '" cy="' + ny0 + '" r="8" fill="none" stroke="#000" stroke-width="0.3"/><path d="M' + nx0 + "," + (ny0 - 10) + " L" + (nx0 + 3.5) + "," + (ny0 + 5) + " L" + nx0 + "," + (ny0 + 2.5) + " L" + (nx0 - 3.5) + "," + (ny0 + 5) + 'z" fill="#000"/>');
  sh.t(nx0, ny0 - 12, "N", 3.6, "middle", 700);
  const sx = 40, sy = DW.H - 22;
  for (let k = 0; k < 5; k++) { sh.add('<rect x="' + (sx + k * 20) + '" y="' + sy + '" width="20" height="2" fill="' + (k % 2 ? "#fff" : "#000") + '" stroke="#000" stroke-width="0.2"/>'); sh.t(sx + k * 20, sy + 5.5, k + "m", 2); }
  sh.t(sx + 100, sy + 5.5, "5m", 2); sh.t(sx, sy - 2.5, "SCALE 1:50 (at 24 x 18 in)", 2.4, "start", 700);
  const lx = 175, ly = DW.H - 26;
  sh.add('<rect x="' + lx + '" y="' + ly + '" width="10" height="3" fill="#1a1a1a"/>'); sh.t(lx + 12, ly + 2.5, "EXISTING WALL TO REMAIN", 2.2, "start");
  sh.add('<rect x="' + (lx + 70) + '" y="' + ly + '" width="10" height="3" fill="url(#hatch)" stroke="#000" stroke-width="0.3"/>'); sh.t(lx + 82, ly + 2.5, "NEW WALL / INFILL", 2.2, "start");
  sh.add('<rect x="' + (lx + 125) + '" y="' + ly + '" width="10" height="3" fill="none" stroke="#000" stroke-width="0.25" stroke-dasharray="1.2 0.8"/>'); sh.t(lx + 137, ly + 2.5, "WALL TO BE REMOVED", 2.2, "start");
  sh.add('<rect x="' + lx + '" y="' + (ly + 6) + '" width="10" height="3" fill="none" stroke="#333" stroke-width="0.22" stroke-dasharray="0.9 0.6"/>'); sh.t(lx + 12, ly + 8.5, "UPPER CABINETS / ABOVE", 2.2, "start");
  sh.t(40, 20, "MAIN FLOOR PLAN – " + (V.proposed === false ? "AS BUILT" : "PROPOSED"), 5, "start", 700);
  sh.t(40, 25.5, "Upper level (kitchen, living, bedrooms). Dimensions in feet-inches (millimetres).", 2.6, "start");
  dwTitle(sh, V, "Main floor plan", "A-101", "Scale 1:50 on 24 x 18 in (Arch C)", [
    "Generated by the 1615 MCH remodel studio from the design model; verify all dimensions on site before ordering or building.",
    "Walls being removed or opened: engineer to confirm bearing and size beams/headers before removal.",
    "Gas fireplace, venting and gas line by a licensed gas fitter; electrical by a licensed electrician or homeowner permit.",
    "Clearances are to finished faces of cabinets and furniture as modelled.",
  ]);
  return sh.svg(defs);
}

// ---------------------------------------------------------------- A-201 elevations
// Cabinet runs are found from the design: base and tall pieces standing on the floor against the same wall
// (same facing, back faces within a few cm) form a run; everything in front of that wall within 75 cm
// (fronts, handles, uppers, hood) is drawn on it, looking at the wall.
function dwElevs(D, L) {
  const lay = D.lay.filter((o) => o[0] == L), CEIL = DW.CEIL;
  const SKIP = new Set(["pot", "led", "globe", "plant", "rug", "stool", "pendantbar", "art", "sofa", "arm", "chair", "ptable", "table", "bed", "round"]);
  const nrm = (a) => ((Math.round(((a || 0) * 2) / Math.PI) % 4) + 4) % 4; // 0 faces south, 1 west, 2 north, 3 east
  const anchors = lay.filter((o) => o[1] == "box" && o[7] < 5 && o[6] >= 60 && o[4] >= 30 && !/^Island/.test(o[10] || "") && o[10]);
  const runs = [];
  anchors.forEach((o) => {
    const f = nrm(o[8]), back = f == 0 ? o[3] - o[5] / 2 : f == 1 ? o[2] + o[5] / 2 : f == 2 ? o[3] + o[5] / 2 : o[2] - o[5] / 2;
    const u = f % 2 ? o[3] : o[2];
    let r = runs.find((r) => r.f == f && Math.abs(r.back - back) < 8 && u > r.u0 - 120 && u < r.u1 + 120);
    if (!r) runs.push((r = { f, back, u0: u, u1: u, n: 0, items: [] }));
    r.u0 = Math.min(r.u0, u - o[4] / 2); r.u1 = Math.max(r.u1, u + o[4] / 2); r.n++; r.items.push(o);
  });
  for (let merged = true; merged; ) {
    merged = false;
    for (let i = 0; i < runs.length && !merged; i++) for (let j = i + 1; j < runs.length && !merged; j++) {
      const a = runs[i], b = runs[j];
      if (a.f == b.f && Math.abs(a.back - b.back) < 8 && b.u0 < a.u1 + 120 && b.u1 > a.u0 - 120) {
        a.u0 = Math.min(a.u0, b.u0); a.u1 = Math.max(a.u1, b.u1); a.n += b.n; a.items.push(...b.items); runs.splice(j, 1); merged = true;
      }
    }
  }
  const out = runs.filter((r) => r.n >= 2 || r.items.some((o) => o[6] > 150 || dwLabFor(o[10] || ""))).sort((a, b) => b.u1 - b.u0 - (a.u1 - a.u0)).slice(0, 4);
  const names = ["looking north", "looking east", "looking south", "looking west"]; // view direction for each facing
  const els = out.map((r) => {
    // u axis to the viewer's right: facing south (0) -> looking north, right = east (+x); 1 (west-facing) -> looking east, right = south (+y)
    const ax = r.f % 2 ? 1 : 0, sgn = r.f == 0 || r.f == 1 ? 1 : -1;
    const inBand = (o) => {
      const p = r.f % 2 ? o[2] : o[3], d = r.f == 0 ? p - r.back : r.f == 2 ? r.back - p : r.f == 1 ? r.back - p : p - r.back;
      const u = ax ? o[3] : o[2];
      return d >= -3 && d < 75 && u > r.u0 - 5 && u < r.u1 + 5;
    };
    const its = lay.filter((o) => inBand(o) && !SKIP.has(o[1]));
    const items = its.map((o) => {
      const q = dwRect(o[2], o[3], o[4], o[5], o[8]).map((p) => p[ax] * sgn), dist = (r.f % 2 ? Math.abs(o[2] - r.back) : Math.abs(o[3] - r.back));
      return { u0: Math.min(...q), u1: Math.max(...q), z0: o[7], z1: o[7] + o[6], o, dist };
    }).filter((t) => t.u1 - t.u0 > 0.5 && t.z1 - t.z0 > 0.3);
    const wins = D.furn.filter((f) => f[0] == L && f[8] == 1 && Math.abs((r.f % 2 ? f[1] : f[2]) - r.back) < 30).map((f) => {
      const u = (ax ? f[2] : f[1]) * sgn; return { u0: u - f[3] / 2, u1: u + f[3] / 2, z0: f[6], z1: f[6] + f[7] };
    }).filter((w) => w.u1 > r.u0 * sgn - 1e9);
    const u0 = Math.min(...items.map((t) => t.u0)), u1 = Math.max(...items.map((t) => t.u1));
    const lab = (dwLabFor(r.items.sort((a, b) => b[6] * b[4] - a[6] * a[4])[0][10]) || "CABINET").replace("\n", " ");
    return { title: "WALL RUN – " + names[r.f].toUpperCase(), items, wins: wins.filter((w) => w.u1 > u0 && w.u0 < u1), u0, u1, chain: items.filter((t) => t.z0 < 5 && t.z1 - t.z0 >= 60 && t.u1 - t.u0 >= 30), hint: lab };
  });
  // island seen from its long side (the side with the handles, if any)
  const isl = lay.filter((o) => /^Island/.test(o[10] || ""));
  if (isl.length) {
    const pts = isl.flatMap((o) => dwRect(o[2], o[3], o[4], o[5], o[8])), x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0])), y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
    const vert = y1 - y0 > x1 - x0, inI = (o) => o[2] > x0 - 15 && o[2] < x1 + 15 && o[3] > y0 - 15 && o[3] < y1 + 15;
    const its = lay.filter((o) => inI(o) && !SKIP.has(o[1]) || (o[1] == "pendant" && inI(o)));
    const hx = its.filter((o) => Math.min(o[4], o[5]) < 4 && o[7] < 90).map((o) => (vert ? o[2] : o[3]));
    const mid = vert ? (x0 + x1) / 2 : (y0 + y1) / 2, fromHigh = hx.length ? hx.reduce((a, b) => a + b, 0) / hx.length > mid : true;
    const ax = vert ? 1 : 0, sgn = vert ? (fromHigh ? -1 : 1) : (fromHigh ? 1 : -1);
    const items = its.map((o) => { const q = dwRect(o[2], o[3], o[4], o[5], o[8]).map((p) => p[ax] * sgn); return { u0: Math.min(...q), u1: Math.max(...q), z0: o[7], z1: o[7] + o[6], o, dist: Math.abs((vert ? o[2] : o[3]) - mid) * (fromHigh ? -1 : 1) }; });
    const u0 = Math.min(...items.map((t) => t.u0)), u1 = Math.max(...items.map((t) => t.u1));
    els.push({ title: "ISLAND – " + (vert ? (fromHigh ? "LOOKING WEST" : "LOOKING EAST") : fromHigh ? "LOOKING NORTH" : "LOOKING SOUTH"), items, wins: [], u0, u1, chain: [], total: [u0, u1, "ISLAND"], hint: "" });
  }
  // fireplace and TV walls
  [[/fireplace|Hearth|Fireplace flame|Art above the fireplace/i, "FIREPLACE WALL"], [/^TV|media wall/i, "TV WALL"]].forEach(([re, ttl]) => {
    const key = lay.filter((o) => re.test(o[10] || "") && o[1] != "art" && o[4] > 50);
    if (!key.length) return;
    const k0 = key.sort((a, b) => b[4] - a[4])[0], f = nrm(k0[8]), ax = f % 2 ? 1 : 0, sgn = f == 0 || f == 1 ? 1 : -1;
    const near = lay.filter((o) => Math.hypot(o[2] - k0[2], o[3] - k0[3]) < 140 && Math.abs((f % 2 ? o[2] : o[3]) - (f % 2 ? k0[2] : k0[3])) < 40 && !["pot", "led", "plant", "rug"].includes(o[1]) && !SKIP.has(o[1]) || (o[1] == "art" && Math.hypot(o[2] - k0[2], o[3] - k0[3]) < 140));
    const items = near.map((o) => { const q = dwRect(o[2], o[3], o[4], o[5], o[8]).map((p) => p[ax] * sgn); return { u0: Math.min(...q), u1: Math.max(...q), z0: o[7], z1: o[7] + o[6], o, dist: 0 }; });
    const u0 = Math.min(...items.map((t) => t.u0)) - 30, u1 = Math.max(...items.map((t) => t.u1)) + 30;
    els.push({ title: ttl + " – " + names[f].toUpperCase(), items, wins: [], u0, u1, chain: [], hint: "" });
  });
  return els.filter((E) => E.items.length && isFinite(E.u0) && isFinite(E.u1) && E.u1 - E.u0 > 20);
}
function dwElevSheet(D, V, L) {
  const sh = dwSheet(), els = dwElevs(D, L), CEIL = DW.CEIL;
  const SHORT = [["Fridge", "REF"], ["Oven tower: 30", "WALL OVEN"], ["Oven tower: built-in", "MW"], ["Coffee station", "COFFEE"], ["Cooking zone", "COOKTOP / DRAWERS"],
    ["Cleanup zone: dishwasher", "DW"], ["Cleanup zone: sink", "SINK BASE"], ["Landing", "PREP"], ["Pantry wall: full-height", "PULL-OUT"], ["Drinks bar: glass-door wine", "WINE"],
    ["Drinks bar: glass-front", "GLASS CAB."], ["Island: deep", "POTS"], ["Island: drawers", "DRAWERS"], ["Island: pull-out", "TRASH"], ["Island: cabinet", "SERVING"], ["Tall cabinet", "TALL"],
    ["Full-height pantry", "PANTRY"], ["TV", "TV"], ["Oak media wall", "MEDIA WALL"], ["Art", "ART"]];
  const colOf = (o) => {
    const L2 = String(o[10] || ""), c = o[9], thin = Math.min(o[4], o[5]) < 4;
    if (o[1] == "tv" || /^Slim direct-vent|Gas fireplace|Oven tower: (30|built-in)/.test(L2)) return "#2b2b2b";
    if (/^Drinks bar: glass-door wine/.test(L2)) return "#3a3f44";
    if (/glass doors/.test(L2) || c == 0xbcd0d4) return "#dfe8ea";
    if (/^Fridge/.test(L2)) return "#e8e8e8";
    if (thin && o[6] < 80 && Math.max(o[4], o[5]) <= 70) return "#222";
    if (c == 13150330 || c == 13215352 || c == 0xc8a87a) return "#efe4d0";
    if (o[1] == "art") return "#f1efe9";
    return "#fff";
  };
  // pack the elevations into rows at 1:25 (scaled down if one is too wide)
  const areaW = DW.W - 16 - DW.TB - 40, x0 = 40;
  let x = x0, y = 52, rowH = 0, SC = 0.4;
  const maxW = Math.max(...els.map((e) => e.u1 - e.u0), 1);
  if (maxW * SC > areaW) SC = areaW / maxW;
  const tick = (ax, bx, yy, label) => {
    sh.add('<line x1="' + dwF(Math.min(ax, bx) - 1) + '" y1="' + dwF(yy) + '" x2="' + dwF(Math.max(ax, bx) + 1) + '" y2="' + dwF(yy) + '" stroke="#000" stroke-width="0.15" marker-start="url(#tick)" marker-end="url(#tick)"/>');
    [ax, bx].forEach((xx) => sh.add('<line x1="' + dwF(xx) + '" y1="' + dwF(yy - 1.5) + '" x2="' + dwF(xx) + '" y2="' + dwF(yy + 1.5) + '" stroke="#000" stroke-width="0.13"/>'));
    sh.t((ax + bx) / 2, yy - 1, label, 1.8, "middle", 500);
  };
  els.forEach((E, n) => {
    const w = (E.u1 - E.u0) * SC + 26, h = CEIL * SC + 30;
    if (x + w > x0 + areaW && x > x0) { x = x0; y += rowH + 4; rowH = 0; }
    if (y + h > DW.H - 12) return;
    const oy = y + CEIL * SC + 2, tf = (u, z) => [x + (u - E.u0) * SC, oy - z * SC];
    const [fx0] = tf(E.u0, 0), [fx1] = tf(E.u1, 0), [, cy] = tf(E.u0, CEIL);
    sh.add('<line x1="' + dwF(fx0 - 4) + '" y1="' + dwF(oy) + '" x2="' + dwF(fx1 + 4) + '" y2="' + dwF(oy) + '" stroke="#000" stroke-width="0.6"/>');
    sh.add('<line x1="' + dwF(fx0 - 4) + '" y1="' + dwF(cy) + '" x2="' + dwF(fx1 + 4) + '" y2="' + dwF(cy) + '" stroke="#000" stroke-width="0.25" stroke-dasharray="2 1"/>');
    sh.t(fx1 + 5, cy + 1, dwFt(CEIL), 1.8, "start");
    E.wins.forEach((wn) => {
      const [ax, ay] = tf(wn.u0, wn.z1), [bx, by] = tf(wn.u1, wn.z0);
      sh.add('<rect x="' + dwF(ax) + '" y="' + dwF(ay) + '" width="' + dwF(bx - ax) + '" height="' + dwF(by - ay) + '" fill="#eef4f6" stroke="#000" stroke-width="0.3"/>');
    });
    E.items.slice().sort((a, b) => (a.dist - b.dist) || ((b.u1 - b.u0) * (b.z1 - b.z0) - (a.u1 - a.u0) * (a.z1 - a.z0))).forEach((t) => {
      const o = t.o;
      if (o[1] == "hood") {
        const um = (t.u0 + t.u1) / 2, [ax, ay] = tf(t.u0, o[7] + 28), [bx, by] = tf(t.u1, o[7] + 10), [cx0, cy0] = tf(um - 16, CEIL), [cx1, cy1] = tf(um + 16, o[7] + 28);
        sh.add('<rect x="' + dwF(cx0) + '" y="' + dwF(cy0) + '" width="' + dwF(cx1 - cx0) + '" height="' + dwF(cy1 - cy0) + '" fill="#ddd" stroke="#000" stroke-width="0.2"/>');
        sh.add('<rect x="' + dwF(ax) + '" y="' + dwF(ay) + '" width="' + dwF(bx - ax) + '" height="' + dwF(by - ay) + '" fill="#ddd" stroke="#000" stroke-width="0.2"/>');
        return;
      }
      if (o[1] == "pendant") {
        const um = (t.u0 + t.u1) / 2, [px, py] = tf(um, CEIL), [, qy] = tf(um, o[7] + o[6]), [ax, ay] = tf(t.u0, o[7] + o[6] * 0.6), [bx, by] = tf(t.u1, o[7]);
        sh.add('<line x1="' + dwF(px) + '" y1="' + dwF(py) + '" x2="' + dwF(px) + '" y2="' + dwF(qy) + '" stroke="#000" stroke-width="0.15"/>');
        sh.add('<path d="M' + dwF(px - 1) + "," + dwF(qy) + " L" + dwF(px + 1) + "," + dwF(qy) + " L" + dwF(bx) + "," + dwF(by) + " L" + dwF(ax) + "," + dwF(by) + 'z" fill="#222"/>');
        return;
      }
      const [ax, ay] = tf(t.u0, t.z1), [bx, by] = tf(t.u1, t.z0);
      const thin = Math.min(o[4], o[5]) < 4 && Math.max(o[4], o[5]) <= 70;
      sh.add('<rect x="' + dwF(Math.min(ax, bx)) + '" y="' + dwF(ay) + '" width="' + dwF(Math.abs(bx - ax)) + '" height="' + dwF(by - ay) + '" fill="' + colOf(o) + '" stroke="#000" stroke-width="' + (thin ? 0.1 : 0.2) + '"/>');
    });
    const seen = new Set();
    E.items.forEach((t) => {
      const m = SHORT.find(([p]) => String(t.o[10] || "").startsWith(p)); if (!m || t.u1 - t.u0 < 20) return;
      const key = m[1] + Math.round(t.u0); if (seen.has(key)) return; seen.add(key);
      const [cx, cyy] = tf((t.u0 + t.u1) / 2, (t.z0 + t.z1) / 2);
      sh.t(cx, cyy + 0.7, m[1], 1.8, "middle", 700, /2b2b2b|3a3f44/.test(colOf(t.o)) ? "#fff" : "#000");
    });
    // chain of base / tall modules and the total
    const ch = E.chain.slice().sort((a, b) => a.u0 - b.u0).filter((t, i, a) => !a.some((s, j) => j != i && s.u0 <= t.u0 + 1 && s.u1 >= t.u1 - 1 && (s.u1 - s.u0) > (t.u1 - t.u0) + 2));
    const uniq = []; ch.forEach((t) => { if (!uniq.some((s) => Math.abs(s.u0 - t.u0) < 2 && Math.abs(s.u1 - t.u1) < 2)) uniq.push(t); });
    uniq.forEach((t) => { const [ax] = tf(t.u0, 0), [bx] = tf(t.u1, 0); tick(ax, bx, oy + 5, dwFt(t.u1 - t.u0)); });
    const tot = E.total || (uniq.length ? [uniq[0].u0, uniq[uniq.length - 1].u1, ""] : null);
    if (tot) { const [ax] = tf(tot[0], 0), [bx] = tf(tot[1], 0); tick(ax, bx, oy + 10, dwDim(tot[1] - tot[0]) + (tot[2] ? " " + tot[2] : "")); }
    sh.t(fx0, oy + 18, "ELEVATION " + (n + 1) + " – " + E.title, 3.2, "start", 700);
    sh.t(fx0, oy + 22.5, SC == 0.4 ? "Scale 1:25" : "Scale about 1:" + Math.round(10 / SC), 2.2, "start");
    x += w + 6; rowH = Math.max(rowH, h);
  });
  if (!els.length) sh.t(40, 60, "No built-in cabinet runs, island, fireplace or TV wall are modelled in this design.", 3.2, "start", 600, "#555");
  sh.t(40, 20, "ELEVATIONS", 5, "start", 700);
  sh.t(40, 25.5, "Cabinet runs, island, fireplace and TV walls found in this design. Dimensions in feet-inches (millimetres).", 2.6, "start");
  dwTitle(sh, V, "Elevations", "A-201", "Scale 1:25 on 24 x 18 in (Arch C)", [
    "Drawn from the design model; cabinet module widths are nominal and should be adjusted to the chosen cabinet line.",
    "Appliance cut-outs (wall oven, microwave, cooktop) per manufacturer specifications.",
    "Ceiling height " + dwFt(CEIL) + "; tall units shown to the ceiling.",
  ]);
  return sh.svg();
}

// ---------------------------------------------------------------- open the set
function drawingsOpen(D, V) {
  const L = (D.levels.find((l) => l[1] == "Level 1") || D.levels[D.levels.length - 1])[0];
  const O = typeof DATA != "undefined" && DATA.orig && DATA.orig !== D ? DATA.orig : null;
  let a, b;
  try { a = dwPlan(D, O, V, L); b = dwElevSheet(D, V, L); } catch (e) { alert("Could not draw this design: " + e.message); return; }
  const name = String(V.chip || V.title || "design").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
  const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>1615 MCH drawings – ' + dwEsc(V.chip || "") + "</title>" +
    "<style>@page{size:24in 18in;margin:0}body{margin:0;background:#e9e7e2;font:14px system-ui,-apple-system,sans-serif}.bar{position:sticky;top:0;display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:10px 12px;background:#fbfaf7;border-bottom:1px solid #d9d6cf}" +
    ".bar b{margin-right:auto}.bar button,.bar a{border:1px solid #2e5e4e;background:#2e5e4e;color:#fff;border-radius:9px;padding:8px 12px;font:600 13px system-ui;text-decoration:none;cursor:pointer}.bar a{background:#fff;color:#2e5e4e}" +
    ".pg{margin:14px auto;max-width:1400px;box-shadow:0 4px 20px rgba(0,0,0,.15);background:#fff}.pg svg{display:block;width:100%;height:auto}" +
    "@media print{.bar{display:none}body{background:#fff}.pg{margin:0;box-shadow:none;max-width:none;width:24in;height:18in;page-break-after:always}.pg svg{width:24in;height:18in}}</style></head><body>" +
    '<div class="bar"><b>Drawings · ' + dwEsc(V.chip || "") + '</b><button onclick="print()">Print / Save as PDF</button><a id="s1" download="' + name + '-A-101.svg">A-101 SVG</a><a id="s2" download="' + name + '-A-201.svg">A-201 SVG</a></div>' +
    '<div class="pg">' + a + '</div><div class="pg">' + b + "</div>" +
    "<script>document.querySelectorAll('.pg svg').forEach(function(s,i){var u=URL.createObjectURL(new Blob([s.outerHTML],{type:'image/svg+xml'}));document.getElementById('s'+(i+1)).href=u;});</" + "script></body></html>";
  const w = window.open("", "_blank");
  if (!w) { alert("Allow pop-ups for this site to open the drawings."); return; }
  w.document.open(); w.document.write(html); w.document.close();
}
