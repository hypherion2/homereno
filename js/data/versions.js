// Design versions shown in the list, in order. Each "key" has a matching file in js/data/concepts/.
// Concept geometry (DATA) is filled in by those files.
const VERS = [
  {
    "key": "orig",
    "title": "Original house",
    "sub": "Existing kitchen & furniture",
    "chip": "AS-IS · Original house",
    "kind": "As-is · aligned to the listing plans",
    "headline": "The house as it stands.",
    "desc": "The aligned as-is plan. The kitchen, family room and eating area are separated from the living and dining rooms by a 4.8 m partition and a corner fireplace chase, and the stair arrives in a closed hall.",
    "tags": [
      "As-is",
      "Aligned to listing plans"
    ],
    "btn": "View kitchen & living area",
    "proposed": false,
    "blinds": false
  },
  {
    "key": "v2",
    "title": "Fully open plan",
    "sub": "Fireplace out · stair re-landed",
    "chip": "02 · Fully open plan",
    "kind": "Concept 02 · Whole floor",
    "headline": "One continuous living space.",
    "desc": "Removes the whole 4.8 m dividing wall, the corner fireplace and its chase, and the stair-landing wall. The upper flight turns to land in the kitchen, the old stair opening is floored over, and guards run along the new opening. Stair routing is conceptual: the new upper flight meets the lower flight at a very tight landing and needs a stair designer.",
    "tags": [
      "~4.8 m opening",
      "Stair relocated",
      "Flue removal",
      "Structural review needed"
    ],
    "btn": "View full open-plan space",
    "proposed": false,
    "blinds": false
  },
  {
    "key": "v7",
    "title": "TV on the alcove wall",
    "sub": "Wall-mounted TV · no half wall",
    "chip": "07 · TV on the alcove wall",
    "kind": "Concept 07",
    "headline": "TV mounted on the wall at the back of the alcove, no half wall.",
    "desc": "The TV is fixed to the back wall of the east alcove at a comfortable height with a low media unit below it. The half wall is gone, so the sofa floats in the open room about 3 m from the TV, facing it, with the south windows clear and sightlines from the kitchen open. The round table, lounge chairs and plants stay as in concept 06. Stair routing is conceptual: the new upper flight meets the lower flight at a very tight landing and needs a stair designer.",
    "tags": [
      "TV on wall",
      "No half wall",
      "Sofa faces east",
      "Windows clear"
    ],
    "btn": "View the TV wall",
    "proposed": true,
    "blinds": true
  },
  {
    "key": "v9",
    "title": "Full kitchen",
    "sub": "Sink back at the window · more storage",
    "chip": "09 · Full kitchen",
    "kind": "Concept 09",
    "headline": "A fully equipped kitchen, sink back under the east window.",
    "desc": "The main sink returns to its original spot under the east window, so the existing plumbing is reused, with the dishwasher beside it, the induction range and hood on the solid wall segment, the fridge in the narrow wall segment south of the window, and an oak oven and pantry tower. A second oak pantry tower stands at the north end of the east wall, a bar and beverage fridge sits beside the patio doors for entertaining, and the 2.8 m island is storage and seating only, with no plumbing, so it only needs electrical in the floor. About 7 m of base cabinets in total, plus three tall units and upper cabinets. Stair routing is conceptual and still needs a stair designer.",
    "tags": [
      "Sink at window",
      "7 m of base cabinets",
      "2 pantry towers",
      "Beverage bar",
      "Island, no plumbing"
    ],
    "btn": "View the kitchen",
    "proposed": true,
    "blinds": true
  },
  {
    "key": "v10",
    "title": "Original stair, open plan",
    "sub": "No bearing walls removed",
    "chip": "10 · Original stair",
    "kind": "Concept 10",
    "headline": "The existing stair stays. Only the partitions come out.",
    "desc": "This keeps the staircase exactly as built, with the wall beside it that looks load-bearing and the walls around the stair top, so nothing structural is removed. Only the partition walls between the kitchen, the living room and the small room at the stair top come out, plus the fireplace. The kitchen, island, bar, TV on the alcove wall and furniture are as in concept 09. The partitions are still my reading of the plan and should be confirmed on site.",
    "tags": [
      "Original stair",
      "No bearing walls removed",
      "Partitions only",
      "Full kitchen"
    ],
    "btn": "View the stair and kitchen",
    "proposed": true,
    "blinds": true
  },
  {
    "key": "v11",
    "title": "Kitchen + dining zone",
    "sub": "Separate quiet lounge",
    "chip": "11 · Kitchen + dining",
    "kind": "Concept 11",
    "headline": "Kitchen and dining together; the lounge stays separate.",
    "desc": "Starts from concept 10 (original stair, no bearing walls touched). The kitchen, island and dining table form one space by the deck. The wall between that space and the living room comes back, with a wide cased opening, so the TV lounge is a quieter room of its own.",
    "tags": [
      "Original stair",
      "Kitchen + dining zone",
      "Separate lounge",
      "Cased opening"
    ],
    "btn": "View the zones",
    "proposed": true,
    "blinds": true
  },
  {
    "key": "v12",
    "title": "Open great room",
    "sub": "Built-in media wall",
    "chip": "12 · Great room",
    "kind": "Concept 12",
    "headline": "Kitchen, dining and living as one big room.",
    "desc": "The wall between kitchen and living stays out. The living end gets an L-shaped sectional, a floating media console with built-in shelving on both sides, and a lounge chair. Kitchen and island as in concept 10.",
    "tags": [
      "Original stair",
      "Open plan",
      "Media wall",
      "Sectional"
    ],
    "btn": "View it",
    "proposed": true,
    "blinds": true
  },
  {
    "key": "v15",
    "title": "Organized kitchen + fireplace",
    "sub": "Kitchen zones, kitchen-wall fireplace",
    "chip": "13 · Organized kitchen",
    "kind": "Concept 13",
    "headline": "Concept 11 with a more organized kitchen and a fireplace in the lounge.",
    "desc": "Same layout as concept 11 (kitchen + dining zone, separate lounge). The kitchen is organized into zones: coffee station, cooking, cleanup, a prep island with its own sink and pull-out waste, a tall pantry and oven tower, plus a dry-pantry run along the wall to the lounge with an appliance garage. The lounge gets a linear gas fireplace on the wall it shares with the kitchen (the partition between the dry-pantry run and the lounge), near where the old fireplace was, with two lounge chairs facing it. The TV stays on the alcove wall. A gas fireplace needs a vent and a gas line; the surround and wall are a plan, not a built detail.",
    "tags": [
      "Kitchen zones",
      "Prep sink",
      "Dry pantry",
      "Fireplace on kitchen wall"
    ],
    "btn": "View the kitchen zones",
    "proposed": true,
    "blinds": true
  },
  {
    "key": "v16",
    "title": "Warmer, edited kitchen",
    "sub": "Less art, oak accents, warm whites",
    "chip": "14 · Warmer edit",
    "kind": "Concept 14",
    "headline": "Concept 13, edited: fewer focal points and a warmer kitchen.",
    "desc": "Same layout as concept 13: a one-wall kitchen with a slim island, the double-sided gas fireplace between the kitchen and the lounge, the L-sofa facing the TV nook and the under-stair closet. The art is cut to four pieces in one palette (dining wall, both fireplace faces, lounge wall) so the fireplaces and the view stay the focus. The kitchen warms up with warm-white uppers, oak open shelves either side of the sink window and oak island end panels. The stainless chimney hood stays, with full-height uppers running right up to it on both sides.",
    "tags": [
      "Fewer art pieces",
      "Oak accents",
      "Warm white"
    ],
    "btn": "View the kitchen zones",
    "proposed": true,
    "blinds": true
  },
  {
    "key": "v17",
    "title": "Warm contemporary",
    "sub": "Refined plan, layout options",
    "chip": "15 · Warm contemporary",
    "kind": "Concept 15",
    "headline": "Concept 14, refined: better clearances, warm contemporary finishes and layout options.",
    "desc": "Same plan as concept 14 with the fixes from the review. Dining: your existing 90 × 35 in (229 × 89 cm) black pedestal table, moved about 1 ft north, so the east chairs clear the pantry door with about 3 ft behind seated guests; the linear pendant is centred over it. Kitchen: the island moves 5 cm east for about 95 cm behind seated stools (work aisle still about 118 cm) and the trash pull-out now sits opposite the sink. Finishes: warm off-white walls, greige lower cabinets, a white-oak island, warm-white uppers, black hardware, natural-stone fireplace surrounds, an oak media wall around the TV in the nook, under-cabinet lighting and step lights. The TV stays in the nook as the main focal wall and the fireplace is the second focal point; try the three living-room layouts and the two stair guards below.",
    "tags": [
      "Clearances fixed",
      "Warm contemporary",
      "Oak media wall",
      "Stair as a feature"
    ],
    "btn": "View the kitchen zones",
    "proposed": true,
    "blinds": true
  },
  {
    "key": "v18",
    "title": "Stairs land in the kitchen",
    "sub": "Upper flight turns into the kitchen",
    "chip": "16 · Kitchen landing",
    "kind": "Concept 16",
    "headline": "Concept 15 with the stairs turning into the kitchen.",
    "desc": "At the landing the stair now turns right on winders toward the kitchen, so you arrive in the open area by the south end of the island, facing the lounge, with a direct route from the garage and front door up to the kitchen. Upper floor: the wall between the hall and the kitchen comes out (it is probably bearing, so it needs an engineered beam), the double-sided fireplace chase and the dry-pantry run go, and the old stair opening is floored over. A single-sided gas fireplace moves to the lounge west wall with two fireside chairs; the TV stays in the oak nook. Ground floor: the flat landing becomes three winders that make the right turn, so the upper flight is short and stops before the garage; the garage keeps its square corner and the door from the mud-room vestibule keeps full headroom. The space under the old flight and the landing becomes a storage closet off the foyer. Most expensive option: beam, new floor opening, gas line and permits.",
    "tags": [
      "Stair to kitchen",
      "Winder turn",
      "Bearing wall: beam",
      "Garage untouched"
    ],
    "btn": "View the kitchen zones",
    "proposed": true,
    "blinds": true
  },
  {
    "key": "v21",
    "title": "Compact stair into the kitchen",
    "sub": "Stair moved west, lands in the kitchen",
    "chip": "17 · Compact stair",
    "kind": "Concept 17",
    "headline": "Concept 15 with the stair moved west into a compact L that lands in the kitchen.",
    "desc": "The diagonal switchback is replaced by a compact L-stair (two 100 cm flights, 6 + 8 steps, 18 cm rise and 26 cm treads) set against the east side of the foyer. The partition between the foyer and the office moves 20 cm west (the office door stays) to make room for the full-width stair. You climb north from the front door, turn right at a square landing and the upper flight runs east along the north wall, arriving in the kitchen about 1.2 m from the island stools. Ground floor: the route from the front door to the laundry and to the hall beside it stays about 1 m wide past the foot of the stair, and the utility room is reached through the existing hall door into a 1 m passage (with a shallow linen cupboard). The old stairwell becomes a walk-in bulk pantry off the mud-room vestibule, right by the garage entry (about 3 m², about 1.8 m² of it full height): shelving, low shelves and a chest freezer under the top of the stair. Upstairs, a 1.6 m wall of full-height pull-out pantry cabinets faces the island for everyday food. Upper floor: the wall between the hall and the kitchen comes out (beam needed), the hall to the west bedrooms widens to about 1.5 m and the old stairwell becomes floor that joins the lounge. Needs an engineer for the beam and the new floor opening; the walls under the top steps are cut down to the stair soffit.",
    "tags": [
      "Compact L-stair",
      "Lands in the kitchen",
      "Storage room",
      "Arrive in the kitchen"
    ],
    "btn": "View the kitchen zones",
    "proposed": true,
    "blinds": true
  },
  {
    "key": "v22",
    "title": "Corner winder into the kitchen",
    "sub": "Corner winder, walk-in pantry, original kitchen-lounge wall",
    "chip": "18 · Corner winder",
    "kind": "Concept 18",
    "headline": "Concept 16 with the stair turning straight into the kitchen on a single corner step.",
    "desc": "The lower flight stays where it is today (8 steps, diagonal from the foyer). Instead of a flat landing, one wedge-shaped step cuts the corner and turns the stair 45° to the east, then 5 straight steps carry you up into the kitchen. The island moves about 1.1 m north toward the dining table (about 1.1 m clear between the table end and the island), so the top of the stair opens onto clear floor. All 14 risers are the same 18.3 cm. The upper flight is short, so it stops before the mud-room to garage passage, which keeps about 2.2 m of headroom; the wall tops under the stair (including the top of the bathroom wall) are cut to the stair soffit. Upper floor: the kitchen-lounge wall is back on its original line with its original doorway, and the double-sided fireplace stays in it, and a square walk-in pantry (about 1.0 × 1.0 m, shelving on two walls) sits between the stair and that wall, with its door in the original hall-kitchen wall line; the corner beside it stays open to the lounge with a glass guard over the stair. The wall between the old hall and the kitchen comes out (beam needed) and the old stair opening is floored over. A single 45° winder is normally allowed in a house stair, but confirm with the stair builder and inspector.",
    "tags": [
      "Original stair position",
      "One 45° winder",
      "Lands in the kitchen",
      "Garage untouched"
    ],
    "btn": "View the stair",
    "proposed": true,
    "blinds": true
  },
  {
    "key": "v23",
    "title": "Open kitchen, pantry wall",
    "sub": "Concept 14 plan, big island, open to the lounge",
    "chip": "19 · Open kitchen",
    "kind": "Concept 19 · Latest",
    "headline": "Concept 14 reworked: full-size island, pantry wall behind the stools, wider patio door, kitchen open to the lounge.",
    "desc": "Same layout as concept 13: a one-wall kitchen with a full-size island (2.8 m, four stools), moved about 70 cm north: about 1.0 m from the dining table, which sits about 1.25 m from the patio door, with the kitchen open to the lounge beside the fireplace chase. Storage moves to the hall wall behind the stools: two full-height pantry units and a bar with a beverage fridge, next to the tall cabinets and drawers along the main kitchen wall. The tall pantry beside the fridge and the corner bar are gone. The gas fireplace uses the existing flue on the lounge side, in a squared-off chase (the angled corner walls go, adding about 0.4 m\u00b2 of lounge floor on each side). The patio door becomes a standard 10 ft (305 cm) slider, centred on the dining wall (the opening needs a longer header). The art is cut to a few pieces in one palette, and the kitchen warms up with warm-white uppers, oak open shelves either side of the sink window and oak island end panels. The stainless chimney hood stays, with full-height uppers running right up to it on both sides.",
    "tags": [
      "Current stair",
      "Pantry wall + bar",
      "10 ft patio door",
      "Open to the lounge"
    ],
    "btn": "View the kitchen",
    "proposed": true,
    "blinds": true
  }
];
const DATA = {};
