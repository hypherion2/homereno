// Panel toggle, full view, screenshot, help, resize.
// ---------- misc UI
$("ptog").onclick = () => {
  document.body.classList.toggle("pc");
  fitOffset && fitOffset();
};
if (matchMedia("(max-width:820px)").matches) document.body.classList.add("pc");
$("fullb").onclick = () => {
  document.body.classList.toggle("full");
  fitOffset();
  try {
    if (document.body.classList.contains("full") && document.documentElement.requestFullscreen)
      document.documentElement.requestFullscreen().catch(() => {});
    else if (document.fullscreenElement) document.exitFullscreen();
  } catch (e) {}
};
// Leaving browser full screen (Esc, swipe, back) also leaves the studio's full view.
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) document.body.classList.remove("full");
  fitOffset();
});
const modal = $("modal");
modal.onclick = (e) => {
  if (e.target == modal) modal.classList.remove("on");
};
// Every dialog gets a visible close button (tapping outside also closes it).
function showModal(html) {
  $("mbox").innerHTML = '<button class="mx" aria-label="Close">✕</button>' + html;
  $("mbox").querySelector(".mx").onclick = () => modal.classList.remove("on");
  modal.classList.add("on");
}
$("shot").onclick = () => {
  rn.render(sc, cam);
  const u = rn.domElement.toDataURL("image/png");
  showModal(
    '<h4>Screenshot</h4><img src="' +
      u +
      '" alt="Screenshot"><p class="fine">Right-click (or long-press) the image to save it.</p>',
  );
};
$("help").onclick = () => {
  const phone = matchMedia("(max-width:820px)").matches;
  showModal(
    "<h4>How to use</h4><ul>" +
      (phone
        ? "<li><b>Designs</b> (bottom left) lists every version; tap one to view it. <b>Options</b> holds floors, finishes and view settings. Tap ✕, swipe the sheet down or tap the model to close it.</li>" +
          "<li><b>3D</b>, <b>Plan</b> and <b>Walk</b> in the bottom bar switch views. <b>Ground / Upper / Both</b> (top right) switch floors.</li>" +
          "<li><b>Drag</b> to orbit, <b>pinch</b> to zoom, <b>two fingers</b> to pan.</li>" +
          "<li>In <b>Walk</b>, drag the left half of the screen to move and the right half to look. Tap <b>Exit walk</b> to leave.</li>"
        : "<li><b>Design versions</b>: pick AS-IS or a numbered remodel. Each one is stored and can be revisited.</li>" +
          "<li><b>Drag</b> to orbit, <b>right-drag</b> (two fingers) to pan, <b>scroll</b> to zoom.</li>" +
          "<li><b>Walk through</b> drops you inside the house: WASD to move, mouse to look, Shift to run, Esc to leave. You collide with walls and furniture, and the stairs work.</li>") +
      "<li><b>Wall height</b> lowers the walls for a cutaway view.</li>" +
      "<li><b>Removed walls</b> show in blue and <b>new walls</b> in green compared with the original.</li>" +
      "<li><b>Structure colors</b> show a conceptual bearing-wall estimate. It is not an engineering assessment.</li>" +
      "<li><b>Save current view</b> keeps a camera, level and options in this browser.</li></ul>",
  );
};
function fitOffset() {
  if (S.walk) {
    cam.clearViewOffset();
    return;
  }
  const pw =
    innerWidth > 820 && !document.body.classList.contains("full") ? ($("panel").offsetWidth + 40) / 2 : 0;
  cam.setViewOffset(innerWidth, innerHeight, -pw, 0, innerWidth, innerHeight);
}
function resize() {
  rn.setSize(innerWidth, innerHeight);
  cam.aspect = innerWidth / innerHeight;
  cam.updateProjectionMatrix();
  fitOffset();
}
addEventListener("resize", resize);
