// Scene, camera, renderer, lights, shared state (S) and base materials.
const $ = (id) => document.getElementById(id),
  dk = matchMedia("(prefers-color-scheme: dark)").matches;
const sc = new THREE.Scene();
sc.background = new THREE.Color(dk ? 0x1d2622 : 0xdde7dc);
const cam = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 10, 90000);
const rn = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
rn.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
rn.shadowMap.enabled = true;
$("stage").appendChild(rn.domElement);
const HL = new THREE.HemisphereLight(0xffffff, 0x7f8f86, 0.75);
sc.add(HL);
const dl = new THREE.DirectionalLight(0xffffff, 0.65);
dl.castShadow = true;
dl.shadow.mapSize.set(2048, 2048);
{
  const s = dl.shadow.camera;
  s.left = -1200;
  s.right = 1200;
  s.top = 1200;
  s.bottom = -1200;
  s.near = 100;
  s.far = 7000;
}
sc.add(dl, dl.target);
const gr = new THREE.Mesh(
  new THREE.PlaneGeometry(14000, 14000),
  new THREE.MeshLambertMaterial({ color: dk ? 0x2a3830 : 0xc9d8c8 }),
);
gr.rotation.x = -Math.PI / 2;
gr.position.y = -3;
gr.receiveShadow = true;
sc.add(gr);
const ct = new THREE.OrbitControls(cam, rn.domElement);
ct.enableDamping = true;
ct.dampingFactor = 0.08;
ct.screenSpacePanning = true;
ct.minPolarAngle = 0.0001;
ct.maxPolarAngle = Math.PI / 2 - 0.01;
ct.minDistance = 80;
ct.maxDistance = 9000;
const S = {
  ver: 0,
  level: "both",
  view: "3d",
  cut: 1,
  root: null,
  G: {},
  FG: {},
  LB: {},
  WG: {},
  LGp: {},
  walls: [],
  gg: [],
  BL: [],
  floors: [],
  el: {},
  nm: {},
  c: new THREE.Vector3(),
  span: 2000,
  E1: 255.84,
  focus: null,
};
const BM = (c) => new THREE.MeshLambertMaterial({ color: c }),
  sd = (m) => {
    m.castShadow = m.receiveShadow = true;
    if (m.material && (m.material === glass || m.material === RGL)) m.castShadow = false;
    return m;
  };
const RGL = new THREE.MeshLambertMaterial({
  color: 0xcfe6e4,
  transparent: true,
  opacity: 0.3,
  side: 2,
  depthWrite: false,
});
const RG = new THREE.MeshLambertMaterial({ color: 0xe6eef0, transparent: true, opacity: 0.22, side: 2 });
const lineM = new THREE.LineBasicMaterial({ color: 0x333333 }),
  glass = new THREE.MeshLambertMaterial({ color: 0x7ec8e3, transparent: true, opacity: 0.45 }),
  GM = new THREE.MeshLambertMaterial({ color: 0x3b6fe0, transparent: true, opacity: 0.4, side: 2 });
const eo = (m) => m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), lineM));
const WALL = dk ? 0xc9d0cb : 0xeef0ea,
  CLS = [0xd9534f, 0x5cb85c, 0xf0ad4e, 0xbdbdbd, 0x3b6fe0, 0x5cb85c];
