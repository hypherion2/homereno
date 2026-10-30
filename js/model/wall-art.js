// Procedural abstract artwork textures for framed wall art.

function artTex(st, ar) {
  try {
    return artTex0(st, ar);
  } catch (e) {
    return null;
  }
}
function artTex0(st, ar) {
  const W = 256,
    H = Math.max(64, Math.round(256 / ar)),
    c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  let sd_ = st * 977 + 13;
  const R = () => (sd_ = (sd_ * 16807) % 2147483647) / 2147483647;
  g.fillStyle = "#f4f1ea";
  g.fillRect(0, 0, W, H);
  const m = Math.round(Math.min(W, H) * 0.1),
    w = W - 2 * m,
    h = H - 2 * m;
  g.save();
  g.beginPath();
  g.rect(m, m, w, h);
  g.clip();
  g.translate(m, m);
  if (st == 0) {
    g.fillStyle = "#e8dcc4";
    g.fillRect(0, 0, w, h);
    [
      ["#2f3a36", 1],
      ["#c8683f", 0.8],
      ["#8fa58a", 0.62],
      ["#e8dcc4", 0.44],
    ].forEach(([col, k]) => {
      g.fillStyle = col;
      const r = w * 0.42 * k;
      g.beginPath();
      g.arc(w * 0.5, h * 0.78, r, Math.PI, 0);
      g.rect(w * 0.5 - r, h * 0.78, 2 * r, h);
      g.fill();
    });
    g.fillStyle = "#c9a15a";
    g.beginPath();
    g.arc(w * 0.5, h * 0.2, w * 0.07, 0, 6.3);
    g.fill();
  } else if (st == 1) {
    g.fillStyle = "#cfd8dc";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e9c9a0";
    g.beginPath();
    g.arc(w * 0.68, h * 0.32, h * 0.14, 0, 6.3);
    g.fill();
    [
      ["#9fb0a6", 0.5],
      ["#6f8b7c", 0.64],
      ["#3f5a4c", 0.8],
    ].forEach(([col, y]) => {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(0, h);
      g.lineTo(0, h * y);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, h * y - 8 * Math.sin(x * 0.05 + y * 9) - R() * 6);
      g.lineTo(w, h);
      g.fill();
    });
  } else if (st == 2) {
    g.fillStyle = "#f1ede4";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#1d1d1d";
    g.lineWidth = 2.2;
    g.lineCap = "round";
    g.beginPath();
    let x = w * 0.2,
      y = h * 0.2;
    g.moveTo(x, y);
    for (let i = 0; i < 5; i++) {
      const x2 = w * (0.15 + R() * 0.7),
        y2 = h * (0.1 + R() * 0.8);
      g.bezierCurveTo(x + w * 0.3, y - h * 0.2, x2 - w * 0.3, y2 + h * 0.2, x2, y2);
      x = x2;
      y = y2;
    }
    g.stroke();
    g.fillStyle = "#c8683f";
    g.beginPath();
    g.arc(w * 0.7, h * 0.3, w * 0.1, 0, 6.3);
    g.fill();
  } else if (st == 3) {
    g.fillStyle = "#223348";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#d6a24b";
    g.fillRect(w * 0.5, h * 0.12, w * 0.38, h * 0.76);
    g.fillStyle = "#e9e2d2";
    g.fillRect(w * 0.12, h * 0.55, w * 0.3, h * 0.33);
    g.strokeStyle = "#e9e2d2";
    g.lineWidth = 2;
    g.strokeRect(w * 0.12, h * 0.12, w * 0.3, h * 0.33);
  } else if (st == 5) {
    g.fillStyle = "#ece4d6";
    g.fillRect(0, 0, w, h);
    [
      ["#8fa58a", 0.3, 0.35, 0.28],
      ["#c8683f", 0.68, 0.3, 0.2],
      ["#d9b77e", 0.55, 0.7, 0.26],
      ["#2f3a36", 0.25, 0.75, 0.12],
    ].forEach(([col, cx, cy, r]) => {
      g.fillStyle = col;
      g.beginPath();
      for (let i = 0; i <= 24; i++) {
        const t = (i / 24) * 6.283,
          rr = r * w * (0.85 + 0.25 * Math.sin(t * 3 + cx * 7));
        const px = cx * w + Math.cos(t) * rr,
          py = cy * h + Math.sin(t) * rr * 0.9;
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.fill();
    });
  } else if (st == 6) {
    g.fillStyle = "#f0ebe1";
    g.fillRect(0, 0, w, h);
    const cols = ["#2f3a36", "#c8683f", "#d9b77e", "#8fa58a", "#223348"];
    for (let i = 0; i < 7; i++) {
      g.fillStyle = cols[i % 5];
      g.fillRect(w * (0.1 + i * 0.115), h * (0.18 + R() * 0.15), w * 0.07, h * (0.45 + R() * 0.2));
    }
  } else {
    g.fillStyle = "#efe9dc";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#4b6b4f";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(w * 0.5, h);
    g.bezierCurveTo(w * 0.45, h * 0.6, w * 0.55, h * 0.4, w * 0.5, h * 0.08);
    g.stroke();
    for (let i = 0; i < 9; i++) {
      const t = 0.15 + i * 0.09,
        yy = h * (1 - t * 1.05),
        sd = i % 2 ? 1 : -1;
      g.fillStyle = ["#5f8a5a", "#7ea37a", "#3f6a4a"][i % 3];
      g.beginPath();
      g.ellipse(w * 0.5 + sd * w * 0.16, yy, w * 0.17, h * 0.05, sd * -0.5, 0, 6.3);
      g.fill();
    }
  }
  g.restore();
  g.strokeStyle = "rgba(0,0,0,.12)";
  g.lineWidth = 1;
  g.strokeRect(m + 0.5, m + 0.5, w - 1, h - 1);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
}
