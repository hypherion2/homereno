#!/usr/bin/env python3
"""Export each concept as a Sweet Home 3D (.sh3d) file.

The base file (the aligned plan) supplies levels, cameras, background images, walls and
furniture models.  For every concept:
  * base walls the concept still has are copied unchanged (keeps sloped walls and joins);
    walls that are new in the concept are rebuilt from its wall boxes,
  * doors, windows and existing furniture are copied from the base file, offset by however
    much the concept moved or resized them,
  * proposed items (cabinets, sofa, art, ...) become coloured blocks named after the item.

usage: python3 tools/gen_sh3d.py BASE.sh3d OUT_DIR [--exclude v13,v14]
"""
import sys, json, math, re, uuid, zipfile, io, copy, os
import xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import studio

args = sys.argv[1:]; exclude = ()
if '--exclude' in args:
    i = args.index('--exclude'); exclude = tuple(x for x in args[i + 1].split(',') if x); del args[i:i + 2]
base, outdir = args[:2]
os.makedirs(outdir, exist_ok=True)
VERS, DATA = studio.load_all(exclude=exclude)
if 'orig' not in DATA: DATA['orig'] = studio.load_concept('orig')

bz = zipfile.ZipFile(base)
broot = ET.fromstring(bz.read('Home.xml'))
names = bz.namelist()

CTR = [0, '']
def nid(p):
    CTR[0] += 1
    return p + '-' + str(uuid.uuid5(uuid.NAMESPACE_URL, '1615mch/%s/%d' % (CTR[1], CTR[0])))
def f(v): return ('%.3f' % v).rstrip('0').rstrip('.') if abs(v) > 1e-9 else '0'

BOX_OBJ = """# unit box
mtllib box.mtl
g box
usemtl boxmat
v 0 0 0
v 1 0 0
v 1 1 0
v 0 1 0
v 0 0 1
v 1 0 1
v 1 1 1
v 0 1 1
vn 0 0 -1
vn 0 0 1
vn 0 -1 0
vn 0 1 0
vn -1 0 0
vn 1 0 0
f 1//1 4//1 3//1
f 1//1 3//1 2//1
f 5//2 6//2 7//2
f 5//2 7//2 8//2
f 1//3 2//3 6//3
f 1//3 6//3 5//3
f 4//4 8//4 7//4
f 4//4 7//4 3//4
f 1//5 5//5 8//5
f 1//5 8//5 4//5
f 2//6 3//6 7//6
f 2//6 7//6 6//6
"""

def icon_png():
    try:
        from PIL import Image, ImageDraw
        im = Image.new('RGBA', (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.rectangle([10, 18, 54, 50], fill=(160, 160, 160, 255), outline=(60, 60, 60, 255), width=2)
        b = io.BytesIO(); im.save(b, 'PNG'); return b.getvalue()
    except Exception:
        return bz.read(names[0])

ICON = icon_png()

# ---------- walls from boxes
def seg_of(q):
    P = [(q[2 * i], q[2 * i + 1]) for i in range(4)]
    d = lambda a, b: math.hypot(a[0] - b[0], a[1] - b[1])
    mid = lambda a, b: ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
    area = abs(sum(P[i][0] * P[(i + 1) % 4][1] - P[(i + 1) % 4][0] * P[i][1] for i in range(4))) / 2
    if d(P[0], P[1]) + d(P[2], P[3]) >= d(P[1], P[2]) + d(P[3], P[0]):
        s, e = mid(P[3], P[0]), mid(P[1], P[2])
    else:
        s, e = mid(P[0], P[1]), mid(P[2], P[3])
    L = d(s, e)
    if L < 1e-6: return None
    return s, e, area / L

def walls_for(D, lvh, boxes=None):
    openings = [(f_[0], f_[1], f_[2], f_[4]) for f_ in D['furn'] if f_[8] in (1, 2)]
    groups = []
    for b in (D['boxes'] if boxes is None else boxes):
        sg = seg_of(b[1])
        if not sg: continue
        (sx, sy), (ex, ey), th = sg
        ang = math.atan2(ey - sy, ex - sx) % math.pi
        ux, uy = math.cos(ang), math.sin(ang)
        off = -uy * sx + ux * sy
        t0, t1 = sorted((ux * sx + uy * sy, ux * ex + uy * ey))
        for g in groups:
            if g['L'] == b[0] and min(abs(g['a'] - ang), math.pi - abs(g['a'] - ang)) < .02 and abs(g['o'] - off) < 1.5 and abs(g['th'] - th) < 2:
                g['p'].append((t0, t1, b[2], b[3])); break
        else:
            groups.append({'L': b[0], 'a': ang, 'u': (ux, uy), 'o': off, 'th': th, 'p': [(t0, t1, b[2], b[3])]})
    out = []
    for g in groups:
        ux, uy = g['u']; nx, ny = -uy, ux
        full = sorted([p for p in g['p'] if p[2] < 1 and p[3] > lvh.get(g['L'], 243.84) * .9])
        low = [p for p in g['p'] if p[2] < 1 and p[3] <= lvh.get(g['L'], 243.84) * .9]
        part = [p for p in g['p'] if p[2] >= 1]
        runs = []
        for t0, t1, y0, h in full:
            if runs and t0 <= runs[-1][1] + 2: runs[-1][1] = max(runs[-1][1], t1); runs[-1][2] = max(runs[-1][2], y0 + h)
            else: runs.append([t0, t1, y0 + h])
        # join runs across a gap that holds a door/window and some sill/lintel piece
        merged = []
        for r in runs:
            if merged:
                a, b_ = merged[-1][1], r[0]
                cov = any(p[0] < b_ - 1 and p[1] > a + 1 for p in part + low)
                win = any(L == g['L'] and a - 5 < ux * x + uy * y < b_ + 5 and abs(nx * x + ny * y - g['o']) < g['th'] / 2 + dd / 2 + 12 for L, x, y, dd in openings)
                if cov and win and b_ - a < 400:
                    merged[-1][1] = r[1]; merged[-1][2] = max(merged[-1][2], r[2]); continue
            merged.append(r)
        # low walls (half walls / sills) not absorbed into a merged run
        for t0, t1, y0, h in low:
            if not any(m[0] - 1 <= t0 and t1 <= m[1] + 1 for m in merged): merged.append([t0, t1, h])
        for t0, t1, h in merged:
            px, py = nx * g['o'], ny * g['o']
            out.append((g['L'], px + ux * t0, py + uy * t0, px + ux * t1, py + uy * t1, h, g['th']))
    return out

# ---------- reuse the base file's walls where the concept still has them
def pip(px, py, q):
    P = [(q[2 * i], q[2 * i + 1]) for i in range(4)]; ins = False
    for i in range(4):
        (x1, y1), (x2, y2) = P[i], P[(i + 1) % 4]
        if (y1 > py) != (y2 > py) and px < (x2 - x1) * (py - y1) / (y2 - y1) + x1: ins = not ins
    return ins

def grow(q, m):
    cx = sum(q[0::2]) / 4; cy = sum(q[1::2]) / 4; o = []
    for i in range(4):
        x, y = q[2 * i], q[2 * i + 1]; dx, dy = x - cx, y - cy; L = math.hypot(dx, dy) or 1
        o += [x + dx / L * m, y + dy / L * m]
    return o

def wall_quad(w):
    x0, y0, x1, y1, t = [float(w.get(k)) for k in ('xStart', 'yStart', 'xEnd', 'yEnd', 'thickness')]
    L = math.hypot(x1 - x0, y1 - y0) or 1; nx, ny = -(y1 - y0) / L * t / 2, (x1 - x0) / L * t / 2
    return [x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1 - nx, y1 - ny, x0 - nx, y0 - ny], (x0, y0, x1, y1, L)

basewalls = [w for w in broot.findall('wall')]

def split_walls(D):
    """-> (kept base wall elements, boxes not explained by them)"""
    byL = {}
    for b in D['boxes']: byL.setdefault(b[0], []).append(b)
    kept = []
    for w in basewalls:
        q, (x0, y0, x1, y1, L) = wall_quad(w)
        bs = byL.get(w.get('level'), [])
        cand = [grow(b[1], 1.5) for b in bs]
        n = max(2, int(L / 4)); hit = 0
        for i in range(n + 1):
            t = .03 + .94 * i / n; px, py = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            if any(pip(px, py, c) for c in cand): hit += 1
        if hit >= .97 * (n + 1): kept.append((w, grow(q, 9)))
    rest = []
    for b in D['boxes']:
        q = b[1]; pts = [(q[2 * i], q[2 * i + 1]) for i in range(4)] + [(sum(q[0::2]) / 4, sum(q[1::2]) / 4)]
        cx, cy = pts[-1]
        if any(w.get('level') == b[0] and pip(cx, cy, gq) and sum(pip(x, y, gq) for x, y in pts[:4]) >= 2 for w, gq in kept): continue
        rest.append(b)
    return [w for w, _ in kept], rest

# ---------- base furniture index
basefurn = [el for el in broot if el.tag in ('pieceOfFurniture', 'doorOrWindow')]

def pick(name, L, x, y, used):
    c = [el for el in basefurn if el.get('name') == name]
    if not c: return None
    def dist(el): return math.hypot(float(el.get('x')) - x, float(el.get('y')) - y) + (0 if el.get('level') == L else 1e4) + (500 if id(el) in used else 0)
    el = min(c, key=dist); used.add(id(el)); return el

ORIG = DATA['orig']['furn']
def fval(el, k, dflt=0.0):
    v = el.get(k); return float(v) if v is not None else dflt
O2A = {}
_free = list(basefurn)
for i, o in sorted(enumerate(ORIG), key=lambda t: t[1][9] or ''):
    c = [el for el in _free if el.get('name') == o[9] and el.get('level') == o[0]]
    if not c: continue
    el = min(c, key=lambda el: math.hypot(fval(el, 'x') - o[1], fval(el, 'y') - o[2]))
    if math.hypot(fval(el, 'x') - o[1], fval(el, 'y') - o[2]) < 80: O2A[i] = el; _free.remove(el)
EXTRA = [el for el in _free if not any(o[9] == el.get('name') and o[0] == el.get('level') for o in ORIG)]  # e.g. roofs the studio never drew

def from_orig(fu):
    """concept furn -> (orig index, exact?) for the closest same-named original item"""
    best = None
    for i, o in enumerate(ORIG):
        if o[9] != fu[9] or o[0] != fu[0] or i not in O2A: continue
        dd = math.hypot(o[1] - fu[1], o[2] - fu[2]) + sum(abs(o[j] - fu[j]) for j in (3, 4, 6, 7)) * .2
        if best is None or dd < best[0]: best = (dd, i)
    if best is None or best[0] > 150: return None, False
    o = ORIG[best[1]]
    return best[1], all(abs((o[j] or 0) - (fu[j] or 0)) < .6 for j in (1, 2, 3, 4, 6, 7)) and abs(((o[5] - fu[5]) + math.pi) % (2 * math.pi) - math.pi) < .01

def strip_tags(n): return re.sub(r'\s*\[[a-z]+\]$', '', n or '').strip()

KINDNAME = {'sofa': 'Sofa', 'lsofa': 'L-shaped sofa', 'arm': 'Lounge chair', 'chair': 'Dining chair', 'stool': 'Bar stool', 'round': 'Round table',
            'table': 'Table', 'rug': 'Rug', 'plant': 'Plant', 'pendant': 'Pendant light', 'pendantbar': 'Linear pendant', 'hood': 'Range hood',
            'tv': 'TV', 'console': 'Media console', 'pot': 'Pot light', 'art': 'Wall art', 'box': 'Cabinet'}

def block(L, name, x, y, w, d, h, e, a, col):
    el = ET.Element('pieceOfFurniture')
    el.attrib = {'id': nid('pieceOfFurniture'), 'level': L, 'name': name, 'model': 'gbox/box.obj', 'icon': 'gbox.png',
                 'x': f(x), 'y': f(y), 'elevation': f(e), 'angle': f(a % (2 * math.pi)), 'width': f(max(w, .5)), 'depth': f(max(d, .5)),
                 'height': f(max(h, .3)), 'color': 'FF%06X' % (col & 0xFFFFFF), 'movable': 'true'}
    return el

def export(key, slug):
    D = DATA[key]; CTR[0] = 0; CTR[1] = slug
    if D.get('variants'):  # export each layout option's default choice
        D = dict(D); D['lay'] = list(D['lay'])
        for vr in D['variants']: D['lay'] += vr['options'][vr.get('choose', 0)].get('lay', [])
    root = ET.Element('home', dict(broot.attrib)); root.set('name', slug + '.sh3d')
    lvh = {}
    for el in broot:
        if el.tag in ('property', 'furnitureVisibleProperty', 'environment', 'compass', 'observerCamera', 'camera', 'level'):
            c = copy.deepcopy(el)
            if el.tag == 'compass':  # top of plan faces west -> north points to plan right
                c.set('northDirection', '1.5707964'); c.set('latitude', '0.8597'); c.set('longitude', '-2.1429'); c.set('timeZone', 'America/Vancouver')
            if el.tag == 'level': lvh[el.get('id')] = float(el.get('height', '243.84'))
            root.append(c)
    used = set(id(v) for v in O2A.values()); n_copy = n_block = 0; taken = set()
    pre = [from_orig(fu) for fu in D['furn']]
    exact_ois = {oi for oi, ex in pre if ex}
    for fu, (oi, exact) in zip(D['furn'], pre):
        L, x, y, w, d, a, e, h, t, name = fu[:10]
        if oi is not None and not exact and oi in exact_ois: oi = None
        if oi is not None and oi not in taken:
            taken.add(oi); A_ = O2A[oi]; o = ORIG[oi]; el = copy.deepcopy(A_); el.set('id', nid(el.tag))
            if not exact:
                el.set('x', f(fval(A_, 'x') + x - o[1])); el.set('y', f(fval(A_, 'y') + y - o[2]))
                for kk, j in (('width', 3), ('depth', 4), ('height', 7)):
                    if abs(fu[j] - o[j]) > .6: el.set(kk, f(fval(A_, kk) + fu[j] - o[j])); el.attrib.pop(kk + 'InPlan', None)
                if abs(e - o[6]) > .6: el.set('elevation', f(fval(A_, 'elevation') + e - o[6]))
                if abs(((a - o[5]) + math.pi) % (2 * math.pi) - math.pi) > .01: el.set('angle', f((fval(A_, 'angle') + a - o[5]) % (2 * math.pi)))
            root.append(el); n_copy += 1; continue
        src = pick(name, L, x, y, used)
        if src is None:
            root.append(block(L, name or 'Item', x, y, w, d, h, e, a, 0xB9A58A)); n_block += 1; continue
        el = copy.deepcopy(src)
        el.set('id', nid(el.tag)); el.set('level', L)
        for kk, vv in (('x', x), ('y', y), ('angle', a % (2 * math.pi)), ('width', w), ('depth', d), ('height', h)): el.set(kk, f(vv))
        if abs(e) > 1e-6: el.set('elevation', f(e))
        elif 'elevation' in el.attrib: del el.attrib['elevation']
        for kk in ('widthInPlan', 'depthInPlan', 'heightInPlan'): el.attrib.pop(kk, None)
        root.append(el); n_copy += 1
    for el in EXTRA:
        c = copy.deepcopy(el); c.set('id', nid(c.tag)); root.append(c)
    for o in D.get('lay', []):
        L, kd, x, y, w, d, h, e, a, c = o[:10]; lb = (o[10] if len(o) > 10 else '') or KINDNAME.get(kd, kd.title())
        col = 0x1B1B1B if kd == 'art' else int(c)
        if kd == 'lsofa':
            root.append(block(L, lb, x, y, w, d, h, e, a, col))
            lx, lz = -(w / 2 - d / 2), d / 2 + 50
            root.append(block(L, lb + ' (chaise)', x + lx * math.cos(a) - lz * math.sin(a), y + lx * math.sin(a) + lz * math.cos(a), d, 100, h * .55, e, a, col)); n_block += 2
            continue
        if kd in ('pendant', 'pendantbar'):
            hh = h; root.append(block(L, lb, x, y, w, d, hh, e, a, col)); n_block += 1; continue
        root.append(block(L, lb, x, y, w, d, h, e, a, col)); n_block += 1
    keptw, rest = split_walls(D); ids = {w.get('id') for w in keptw}
    for w in keptw:
        c = copy.deepcopy(w)
        for kk in ('wallAtStart', 'wallAtEnd'):
            if c.get(kk) and c.get(kk) not in ids: del c.attrib[kk]
        root.append(c)
    nw = len(keptw)
    for L, x0, y0, x1, y1, h, th in walls_for(D, lvh, rest):
        ET.SubElement(root, 'wall', {'id': nid('wall'), 'level': L, 'xStart': f(x0), 'yStart': f(y0), 'xEnd': f(x1), 'yEnd': f(y1),
                                     'height': f(h), 'thickness': f(th), 'pattern': 'hatchUp'}); nw += 1
    brooms = broot.findall('room')
    for r in D['rooms']:
        nm = strip_tags(r[5]); cx = sum(p[0] for p in r[1]) / len(r[1]); cy = sum(p[1] for p in r[1]) / len(r[1])
        def bc(el):
            ps = el.findall('point'); return (sum(float(q.get('x')) for q in ps) / len(ps), sum(float(q.get('y')) for q in ps) / len(ps))
        cand = [el for el in brooms if el.get('level') == r[0] and (el.get('name') or '') == nm]
        src = min(cand, key=lambda el: math.hypot(bc(el)[0] - cx, bc(el)[1] - cy)) if cand else None
        if src is not None and math.hypot(bc(src)[0] - cx, bc(src)[1] - cy) < 200:
            rm = copy.deepcopy(src); rm.set('id', nid('room'))
            for q in rm.findall('point'): rm.remove(q)
            kids = list(rm)
            for q in kids: rm.remove(q)
            for p in r[1]: ET.SubElement(rm, 'point', {'x': f(p[0]), 'y': f(p[1])})
            for q in kids: rm.append(q)
            root.append(rm); continue
        rm = ET.SubElement(root, 'room', {'id': nid('room'), 'level': r[0], 'areaVisible': 'true', 'ceilingFlat': 'true'})
        if nm: rm.set('name', nm)
        for p in r[1]: ET.SubElement(rm, 'point', {'x': f(p[0]), 'y': f(p[1])})
    ET.indent(root, '  ')
    xml = b"<?xml version='1.0'?>\n" + ET.tostring(root, encoding='utf-8')
    ET.fromstring(xml)  # well-formed check
    # referenced content entries
    vals = set()
    for el in root.iter():
        for kk in ('model', 'icon', 'image', 'planIcon'):
            if el.get(kk): vals.add(el.get(kk))
    keep = set()
    for nme in names:
        if nme in ('Home', 'Home.xml', 'ContentDigests'): continue
        top = nme.split('/')[0]
        if nme in vals or any(v.split('/')[0] == top for v in vals if '/' in v): keep.add(nme)
    path = os.path.join(outdir, slug + '.sh3d')
    zi = lambda n: zipfile.ZipInfo(n, date_time=(2026, 1, 1, 0, 0, 0))
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr(zi('Home.xml'), xml, zipfile.ZIP_DEFLATED)
        for nme in sorted(keep):
            info = zi(nme); info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, bz.read(nme))
        z.writestr(zi('gbox/box.obj'), BOX_OBJ, zipfile.ZIP_DEFLATED)
        z.writestr(zi('gbox/box.mtl'), 'newmtl boxmat\nKa 0.2 0.2 0.2\nKd 0.8 0.8 0.8\nKs 0 0 0\nd 1\nillum 1\n', zipfile.ZIP_DEFLATED)
        z.writestr(zi('gbox.png'), ICON, zipfile.ZIP_DEFLATED)
    return path, nw, n_copy, n_block, os.path.getsize(path)

def slug_of(v):
    if v['key'] == 'orig': return 'original'
    m = re.match(r'(\d+)', v['chip']); return 'concept-' + m.group(1) if m else v['key']

for v in VERS:
    print(export(v['key'], slug_of(v)))
