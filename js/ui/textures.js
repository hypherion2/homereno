// Your own textures (edit mode): upload a photo of a finish (wood, stone, tile, paint sample…) and put it
// on the selected piece, on every piece with the same finish, on a wall, or on the floors of a level.
// Images are shrunk (max 512 px, JPEG) and kept inside the design, so they are saved with the edit
// ("My edit" in this browser) and included in Export.
//   layout item:  o[11] = { t: imageId, s: tile size in cm }
//   wall box:     b[6]  = { t, s }          (b[5] stays the optional sloped height)
//   floors:       D.floorTex[levelName] = { t, s }
//   images:       D.texImgs[imageId] = dataURL
const UT = { cache: {} };
function utData() { return typeof ED != "undefined" && ED.on && ED.W ? ED.W : typeof DATA != "undefined" && VERS[S.ver] ? DATA[VERS[S.ver].key] : null; }
function utBase(D, id) {
  if (UT.cache[id]) return UT.cache[id];
  const src = D.texImgs && D.texImgs[id];
  if (!src) return null;
  const img = new Image(), t = new THREE.Texture(img);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  img.onload = () => { t.needsUpdate = true; t.ready = true; userTex(); if (typeof invalidate == "function") invalidate(400, true); };
  img.src = src;
  UT.cache[id] = t;
  return t;
}
function utApply(D, mesh, spec) {
  if (!mesh.isMesh || !mesh.material || Array.isArray(mesh.material) || mesh.material.transparent) return;
  const base = utBase(D, spec.t);
  if (!base || !base.ready) return;
  const real = typeof RL != "undefined" && RL.on, key = spec.t + "|" + spec.s + "|" + (real ? 1 : 0);
  const cur = mesh.material;
  if (cur.userData && cur.userData.ut == key) {
    const hi = typeof ED != "undefined" && ED.hi && ED.hi.some((h) => h[0] === mesh); // keep the green selection tint
    if (cur.color && !hi) cur.color.setHex(0xffffff); // applyAll re-tints walls and floors
    return;
  }
  const g = mesh.geometry, tx = base.clone();
  tx.needsUpdate = true;
  const s = Math.max(5, spec.s || 60);
  if (g._uvd) tx.repeat.set(1 / s, 1 / s); // realistic mode already mapped this box's UVs in centimetres
  else if (g.type == "BoxGeometry") {
    // box faces are mapped 0..1: repeat by the size of the two largest sides
    g.computeBoundingBox();
    const d = g.boundingBox.getSize(new THREE.Vector3()), dims = [d.x, d.y, d.z].sort((a, b) => b - a);
    tx.repeat.set(Math.max(0.05, dims[0] / s), Math.max(0.05, dims[1] / s));
  } else {
    if (!g.attributes.uv && g.attributes.position) {
      // walls built as prisms have no UVs: map them by position (along the wall, and height)
      const p = g.attributes.position, uv = new Float32Array(p.count * 2);
      for (let i = 0; i < p.count; i++) { uv[2 * i] = p.getX(i) + p.getZ(i); uv[2 * i + 1] = p.getY(i); }
      g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    }
    tx.repeat.set(1 / s, 1 / s); // floors and walls: UVs are in centimetres
  }
  const opts = { map: tx, color: 0xffffff, side: cur.side };
  const m = real ? new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.6, metalness: 0, envMapIntensity: 0.4 }, opts)) : new THREE.MeshLambertMaterial(opts);
  m.userData.ut = key;
  if (!mesh.userData._om) mesh.userData._om = cur; // realistic mode leaves it alone
  mesh.material = m;
}
// put every texture in the design on the model (safe to call any time; only changes what is out of date)
function userTex() {
  const D = utData();
  if (!D || !S.root || !D.texImgs) return;
  S.root.traverse((o) => {
    const t = o.userData && o.userData.ed;
    if (!t) return;
    const spec = t[0] == "L" ? D.lay[t[1]] && D.lay[t[1]][11] : t[0] == "B" ? D.boxes[t[1]] && D.boxes[t[1]][6] : null;
    if (spec && spec.t) o.traverse((m) => utApply(D, m, spec));
  });
  if (D.floorTex) S.floors.forEach((m) => { const sp = D.floorTex[m.userData.l]; if (sp && sp.t) utApply(D, m, sp); });
}
// shrink an uploaded photo and store it in the design
function utAddImage(file, done) {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 512 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const D = ED.W; D.texImgs = D.texImgs || {};
      const id = "t" + Date.now().toString(36);
      D.texImgs[id] = c.toDataURL("image/jpeg", 0.82);
      done(id);
    };
    img.onerror = () => edMsg("That file could not be read as an image");
    img.src = r.result;
  };
  r.readAsDataURL(file);
}
// the texture panel for the current selection (or the floor)
function utPanel(target) {
  const D = ED.W, s = ED.sel;
  let cur = null, lab = "";
  if (target == "floor") { cur = (D.floorTex || {})[ED.lvName == "ground" ? "Level 0" : "Level 1"]; lab = "Floor (" + (ED.lvName == "ground" ? "ground" : "upper") + " level)"; }
  else if (s && s.t == "wall") { cur = D.boxes[s.i][6]; lab = "Wall"; }
  else if (s && s.it.k == "L") { cur = D.lay[s.it.i][11]; lab = String(D.lay[s.it.i][10] || D.lay[s.it.i][1]).split(/[:(]/)[0].trim(); }
  else { edMsg("Textures work on cabinets, furniture, walls and floors"); return; }
  const ids = Object.keys(D.texImgs || {});
  const el = $("utpop") || (() => { const d = document.createElement("div"); d.id = "utpop"; d.className = "card"; $("edov").appendChild(d); return d; })();
  el.style.display = "";
  el.innerHTML = '<div class="uthead"><b>Texture · ' + lab.replace(/</g, "&lt;").slice(0, 40) + '</b><button id="utx">✕</button></div>' +
    '<div class="utgrid">' + ids.map((id) => '<button class="utimg' + (cur && cur.t == id ? " on" : "") + '" data-id="' + id + '" style="background-image:url(' + D.texImgs[id] + ')"></button>').join("") +
    '<label class="utup">＋ Upload<input type="file" accept="image/*" id="utfile" hidden></label></div>' +
    '<label>Tile size <input id="utsc" type="number" min="5" step="5" value="' + ((cur && cur.s) || 60) + '"> cm</label>' +
    (target != "floor" && !(s && s.t == "wall") ? '<label class="utall"><input type="checkbox" id="utall"> every piece with this finish</label>' : "") +
    (s && s.t == "wall" && target != "floor" ? '<label class="utall"><input type="checkbox" id="utall"> every wall on this level</label>' : "") +
    '<div class="utrow"><button id="utrm"' + (cur ? "" : " disabled") + '>Remove</button><span class="edhint">Tip: a straight-on photo of the material; tile size is how wide one copy of the photo is.</span></div>';
  const apply = (id) => {
    edPush();
    const spec = id ? { t: id, s: Math.max(5, +$("utsc").value || 60) } : null, all = $("utall") && $("utall").checked;
    if (target == "floor") { D.floorTex = D.floorTex || {}; const k = ED.lvName == "ground" ? "Level 0" : "Level 1"; if (spec) D.floorTex[k] = spec; else delete D.floorTex[k]; }
    else if (s.t == "wall") {
      const tgt = all ? D.boxes.filter((b) => b[0] == ED.lv) : [D.boxes[s.i]];
      tgt.forEach((b) => { while (b.length < 6) b.push(null); if (spec) b[6] = spec; else b.length = 6; });
    } else {
      const o = D.lay[s.it.i], tgt = all ? D.lay.filter((q) => q[0] == o[0] && q[9] == o[9] && q[1] == o[1]) : [o];
      tgt.forEach((q) => { while (q.length < 11) q.push(""); if (spec) q[11] = spec; else q.length = 11; });
    }
    edRebuild(); utPanel(target);
  };
  $("utx").onclick = () => (el.style.display = "none");
  el.querySelectorAll(".utimg").forEach((b) => (b.onclick = () => apply(b.dataset.id)));
  $("utfile").onchange = (e) => { const f = e.target.files[0]; if (f) utAddImage(f, (id) => apply(id)); };
  $("utsc").onchange = () => { if (cur) apply(cur.t); };
  $("utrm").onclick = () => apply(null);
}
(function utInit() {
  // re-apply after anything that rebuilds or restyles the model
  ["buildModel", "applyAll", "setReal"].forEach((n) => {
    const f = window[n];
    if (typeof f == "function") window[n] = function () { const r = f.apply(this, arguments); try { userTex(); } catch (e) {} return r; };
  });
  // a Texture button for the selected piece or wall, and a Floor button in the edit bar
  if (typeof edProps == "function") {
    const p0 = edProps;
    window.edProps = function () {
      const r = p0.apply(this, arguments), el = $("edprops"), s = ED.sel;
      if (s && (s.t == "wall" || s.it.k == "L") && el && !$("edtex")) {
        const b = document.createElement("button"); b.id = "edtex"; b.textContent = "🖼 Texture"; b.onclick = () => utPanel("sel");
        const del = $("edpdel"); del ? del.before(b) : el.appendChild(b);
      }
      if (!s && $("utpop")) $("utpop").style.display = "none";
      return r;
    };
  }
  if ($("edaddb")) {
    const b = document.createElement("button"); b.textContent = "🖼 Floor"; b.title = "Put your own texture on the floors of this level"; b.onclick = () => utPanel("floor");
    $("edaddb").after(b);
  }
})();
