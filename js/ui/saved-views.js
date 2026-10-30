// Saved camera views (stored in this browser).
// ---------- saved views
function saved() {
  try {
    return JSON.parse(localStorage.getItem("remodel-saved") || "[]");
  } catch (e) {
    return [];
  }
}
function drawSaved() {
  const el = $("saved");
  el.innerHTML = "";
  saved().forEach((s, i) => {
    const d = document.createElement("div");
    d.className = "saved";
    const a = document.createElement("button");
    a.textContent = s.name;
    a.onclick = () => {
      if (s.ver != S.ver) setVersion(s.ver, true);
      Object.entries(s.o).forEach(([k, v]) => ($(k).checked = v));
      S.cut = s.cut;
      $("cut").value = Math.round(s.cut * 100);
      setLevel(s.level);
      fly(s.p, s.t);
    };
    const x = document.createElement("button");
    x.textContent = "×";
    x.onclick = () => {
      const l = saved();
      l.splice(i, 1);
      try {
        localStorage.setItem("remodel-saved", JSON.stringify(l));
      } catch (e) {}
      drawSaved();
    };
    d.append(a, x);
    el.appendChild(d);
  });
}
$("savev").onclick = () => {
  const l = saved(),
    o = {};
  ["o-fu", "o-ly", "o-bl", "o-lb", "o-ms", "o-tint", "o-gh", "o-nw", "o-st"].forEach(
    (k) => (o[k] = $(k).checked),
  );
  l.push({
    name: VERS[S.ver].title + " · " + levelName(),
    ver: S.ver,
    level: S.level,
    cut: S.cut,
    o,
    p: cam.position.toArray(),
    t: ct.target.toArray(),
  });
  try {
    localStorage.setItem("remodel-saved", JSON.stringify(l));
  } catch (e) {}
  drawSaved();
};
