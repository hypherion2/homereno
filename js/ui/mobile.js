// Phone layout (≤ 820 px wide): a bottom tab bar (Designs · 3D · Plan · Walk · Options),
// the side panel turned into a closable bottom sheet, and a quick floor switch at the top.
// On wider screens none of this is shown and the desktop panel / toolbar work as before.
const PHONE = matchMedia("(max-width:820px)");
const body = document.body;

function sheetOpen() {
  return !body.classList.contains("pc") && body.dataset.sheet;
}
function openSheet(name) {
  body.classList.remove("full"); // full view hides the panel, so leave it when a sheet is asked for
  body.dataset.sheet = name;
  body.classList.remove("pc");
  $("sheettitle").textContent = name == "designs" ? "Designs" : "Options";
  $("panel").scrollTop = 0;
  // Bring the design you are looking at into view in the list.
  const cur = name == "designs" && $("vlist").querySelector(".ver.on");
  if (cur) cur.scrollIntoView({ block: "center" });
  syncTabs();
}
function closeSheet() {
  body.classList.add("pc");
  syncTabs();
}

// Keep the tab bar, floor switch and labels in step with the current state.
function syncTabs() {
  const open = sheetOpen(),
    v = VERS[S.ver],
    num = /^(\d+)/.exec(v.chip);
  $("tabdes").textContent = num ? "Design " + num[1] : v.key == "orig" ? "Original" : "Designs";
  $("tabwalk").textContent = W.on ? "Exit walk" : "Walk";
  document.querySelectorAll("#tabbar button").forEach((b) => {
    const t = b.dataset.tab;
    const on =
      t == "designs" || t == "options"
        ? open == t
        : t == "walk"
          ? W.on
          : !W.on && (t == "plan" ? S.view == "plan" : S.view != "plan");
    b.classList.toggle("on", !!on);
  });
  document
    .querySelectorAll("#lvquick button")
    .forEach((b) => b.classList.toggle("on", b.dataset.l == S.level));
}

document.querySelectorAll("#tabbar button").forEach(
  (b) =>
    (b.onclick = () => {
      const t = b.dataset.tab;
      if (t == "designs" || t == "options") return sheetOpen() == t ? closeSheet() : openSheet(t);
      closeSheet();
      if (t == "walk") return W.on ? exitWalk() : enterWalk("living");
      if (W.on) exitWalk();
      goView(t);
    }),
);
document.querySelectorAll("#lvquick button").forEach((b) => (b.onclick = () => setLevel(b.dataset.l)));
document.querySelectorAll("#mviews button").forEach(
  (b) =>
    (b.onclick = () => {
      closeSheet();
      if (W.on) exitWalk();
      if (b.dataset.mv == "reset") $("reset").click();
      else goView(b.dataset.mv);
    }),
);
document.querySelectorAll("#mtools button").forEach(
  (b) =>
    (b.onclick = () => {
      if (b.dataset.mt != "help") closeSheet();
      $({ full: "fullb", shot: "shot", help: "help" }[b.dataset.mt]).click();
    }),
);
$("sheetx").onclick = closeSheet;

// Swipe the sheet header down to close it.
{
  let y0 = null;
  $("sheethead").addEventListener("touchstart", (e) => (y0 = e.touches[0].clientY), { passive: true });
  $("sheethead").addEventListener("touchend", (e) => {
    if (y0 !== null && e.changedTouches[0].clientY - y0 > 50) closeSheet();
    y0 = null;
  });
}
// A tap (not a drag) on the 3D model closes an open sheet.
{
  let p0 = null;
  rn.domElement.addEventListener("pointerdown", (e) => (p0 = [e.clientX, e.clientY]));
  rn.domElement.addEventListener("pointerup", (e) => {
    if (p0 && PHONE.matches && sheetOpen() && Math.hypot(e.clientX - p0[0], e.clientY - p0[1]) < 8)
      closeSheet();
    p0 = null;
  });
}
// Esc closes an open dialog or sheet (walk mode handles its own Esc).
addEventListener("keydown", (e) => {
  if (e.key != "Escape" || W.on) return;
  if ($("modal").classList.contains("on")) $("modal").classList.remove("on");
  else if (PHONE.matches && sheetOpen()) closeSheet();
});

// Refresh the tabs whenever the view, floor, design or walk state changes.
for (const name of ["goView", "setLevel", "setVersion", "enterWalk", "exitWalk"]) {
  const f = window[name];
  window[name] = function () {
    const r = f.apply(this, arguments);
    try {
      syncTabs();
    } catch (e) {}
    return r;
  };
}
