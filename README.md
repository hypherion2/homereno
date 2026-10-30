# 1615 MCH · Remodel studio

An interactive 3D model of the house: the original (aligned) plan plus every remodel concept as a
numbered version. Open `index.html` in a modern browser (it loads three.js from a CDN, so it needs
an internet connection). On phones use the bottom bar: **Designs**, **3D**, **Plan**, **Walk**, **Options**.

Conceptual visualisations only, not engineering drawings. Any wall, stair, gas or floor change needs
structural and code review.

## Layout

```
index.html                 page markup; loads the stylesheet and the scripts below, in order
css/studio.css             all styling (desktop first, phone rules in the @media (max-width: 820px) blocks)
js/data/versions.js        the list of design versions (title, tags, description) -> VERS
js/data/concepts/<key>.js  one file per version: levels, walls (boxes), rooms, furniture, proposed items -> DATA[key]
js/core/scene.js           three.js scene, camera, renderer, lights, shared state S, base materials
js/model/geometry.js       helpers: labels, wall prisms, boxes, cylinders
js/model/wall-art.js       procedural artwork for framed wall art
js/model/furniture.js      builders for proposed items (sofa, table, island, plants, pendants ...)
js/model/build-model.js    builds the 3D model of one concept from its DATA entry
js/ui/versions.js          view options, switching concepts, deep links (#concept-13), version list
js/view/camera.js          camera presets, fly-to, undo/redo, levels, cutaway
js/ui/saved-views.js       saved camera views (this browser)
js/ui/misc.js              full view, screenshot, help, dialogs, resize
js/walk/walk.js            first-person walk-through (collisions, stairs, keyboard / mouse / touch)
js/ask/ask-claude.js       "Ask Claude" custom versions (only inside the Claude artifact runtime)
js/render/realistic.js     realistic rendering: procedural textures, materials, environment light
js/ui/cabinets.js          cabinet colour picker and presets
js/render/sun.js           shadows and sun position by date / time of day
js/ui/mobile.js            phone layout: bottom tab bar, closable sheets, quick floor switch
js/start.js                start-up: pick the concept from the link (or the latest) and build it
sh3d/                      Sweet Home 3D downloads, one per concept (generated)
tools/studio.py            bundle into one HTML file, publish a filtered copy, load/save concept data
tools/gen_sh3d.py          generate the .sh3d downloads from the concept data and the aligned base plan
```

The scripts are plain (non-module) scripts sharing one global scope, so the order in `index.html`
matters: data first, then helpers, then the UI, then `start.js`.

### Data format (cm, plan y grows south)

- `boxes`: `[level, [x0,y0, x1,y1, x2,y2, x3,y3], bottom, height, class, heightAtEnd?]`
- `furn` (from the original plan): `[level, x, y, width, depth, angle, elevation, height, type, name, stairDir]`, type 0 piece, 1 window, 2 door, 3 stairs
- `lay` (proposed items): `[level, kind, x, y, width, depth, height, elevation, angle, colour, label]`
- angle 0 faces south, pi/2 west, 3pi/2 east

## Tools

```
python3 tools/studio.py bundle studio.html            # single self-contained HTML file
python3 tools/gen_sh3d.py base.sh3d sh3d/             # rebuild the Sweet Home 3D downloads
```
