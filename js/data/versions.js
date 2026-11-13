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
    "blinds": false,
    "archived": true
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
    "blinds": true,
    "archived": true
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
    "blinds": true,
    "archived": true
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
    "blinds": true,
    "scope": [
      [
        "Demolition",
        [
          "Remove the non-bearing partitions on the upper floor: the 3.2 m kitchen-living wall with its doorway, and the walls of the small room at the top of the stair (about 3 m). Patch ceiling and floor where they stood.",
          "Remove the corner gas fireplace in the lounge with its chase: gas fitter shuts off and caps the line, remove insert and vent, patch the wall/roof penetration.",
          "Remove the existing kitchen cabinets, counters and appliances."
        ]
      ],
      [
        "Structural",
        [
          "None planned: the stair, the wall beside it and the walls around the stair top stay. Engineer to confirm the removed partitions carry no load."
        ]
      ],
      [
        "Kitchen",
        [
          "New kitchen on the east exterior wall: pantry tower, induction range with hood, dishwasher, sink in the original spot, fridge, oven/pantry tower; the existing window stays.",
          "Island 280 x 95 cm with drawers, no plumbing.",
          "Bar cabinet with beverage fridge by the patio door.",
          "Quartz counters and backsplash."
        ]
      ],
      [
        "Plumbing",
        [
          "Sink stays on the existing drain and supply lines; new faucet.",
          "Dishwasher hookup beside the sink (supply, drain, high loop or air gap).",
          "Fridge water line if the fridge has an ice maker.",
          "Check removed walls for supply/drain/vent lines before demolition and reroute if found."
        ]
      ],
      [
        "Gas",
        [
          "Cap the line to the removed lounge fireplace."
        ]
      ],
      [
        "Electrical",
        [
          "New 40 A 240 V circuit for the induction range; confirm panel capacity (load calculation).",
          "Dedicated circuits for dishwasher, fridge and hood; split counter receptacles to current code.",
          "Island receptacles fed through the floor from below.",
          "Lighting: pendants over the island and dining table, under-cabinet LED (add pot lights if wanted).",
          "Relocate switches, receptacles and smoke/CO alarms out of the removed walls.",
          "TV power and data in the alcove.",
          "Receptacle for the beverage fridge."
        ]
      ],
      [
        "Ventilation",
        [
          "Duct the range hood straight out the east wall (exterior cap). Check whether make-up air is required for the hood size chosen."
        ]
      ],
      [
        "Flooring and finishes",
        [
          "New flooring across the upper-floor open area (kitchen, dining, lounge, hall), about 70 m² / 750 sq ft; remove existing carpet/flooring, level where walls came out (owner DIY).",
          "Drywall patching where walls and fixtures were removed; tape, mud, prime (owner DIY).",
          "Paint the upper floor; caulk trim and counters (owner DIY)."
        ]
      ],
      [
        "Permits",
        [
          "Electrical permit (homeowner permit possible in BC for the owner-done part; inspection required).",
          "Gas permit by a licensed gas fitter for capping/adding gas appliances."
        ]
      ]
    ],
    "confirm": [
      "Which walls are bearing: confirm joist direction and loads in the attic and from below before any wall comes out.",
      "Ducts, returns, plumbing or wiring inside walls that are being removed.",
      "That the kitchen-living wall and stair-top room walls are non-bearing."
    ]
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
    "blinds": true,
    "archived": true
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
    "blinds": true,
    "archived": true
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
    "blinds": true,
    "archived": true
  },
  {
    "key": "v16",
    "title": "Warmer, edited kitchen",
    "sub": "Less art, oak accents, warm whites",
    "chip": "14 · Warmer edit",
    "kind": "Concept 14",
    "headline": "Concept 13, edited: fewer focal points and a warmer kitchen.",
    "desc": "Same layout as concept 13: a one-wall kitchen with a slim island, the double-sided gas fireplace between the kitchen and the lounge, the L-sofa facing the TV nook and the under-stair closet. The art is cut to four pieces in one palette (dining wall, both fireplace faces, lounge wall) so the fireplaces and the view stay the focus. The kitchen warms up with warm-white uppers, upper cabinets either side of the sink window and oak island end panels. The stainless chimney hood stays, with full-height uppers running right up to it on both sides.",
    "tags": [
      "Fewer art pieces",
      "Oak accents",
      "Warm white"
    ],
    "btn": "View the kitchen zones",
    "proposed": true,
    "blinds": true,
    "scope": [
      [
        "Demolition",
        [
          "Remove the non-bearing partitions on the upper floor: the 3.2 m kitchen-living wall with its doorway, and the walls of the small room at the top of the stair (about 3 m). Patch ceiling and floor where they stood.",
          "Remove the corner gas fireplace in the lounge with its chase: gas fitter shuts off and caps the line, remove insert and vent, patch the wall/roof penetration.",
          "Remove the existing kitchen cabinets, counters and appliances."
        ]
      ],
      [
        "Structural and framing",
        [
          "Rebuild the kitchen-lounge wall with a wide cased opening and the fireplace chase.",
          "Replace the 178 cm patio slider with a 244 cm (8 ft) slider centred on the dining wall. New header in the exterior (bearing) wall sized by the engineer, temporary shoring, flashing to the deck, trim and siding repair.",
          "Remove the 105 cm slider window on the east kitchen wall (where the range goes) and infill: framing, sheathing, house wrap, insulation, siding and trim to match, drywall inside."
        ]
      ],
      [
        "Kitchen",
        [
          "New one-wall kitchen on the east exterior wall (about 6.3 m, north to south): full-height pantry, fridge/freezer with cabinet above, prep drawers, induction range with stainless chimney hood, dishwasher, sink in the original spot, drawers to the corner. Warm-white uppers to the hood.",
          "Island 280 x 95 cm with seating for four: drawers, pull-out trash/recycling, oak end panels. No plumbing in the island.",
          "Quartz counters on the run and island; backsplash.",
          "Shallow dry-pantry run (32 cm deep, 1.0 m) behind the island stools.",
          "Bar cabinet with beverage fridge by the patio door.",
          "Upper cabinets either side of the sink window, matching the rest of the uppers."
        ]
      ],
      [
        "Plumbing",
        [
          "Sink stays on the existing drain and supply lines; new faucet.",
          "Dishwasher hookup beside the sink (supply, drain, high loop or air gap).",
          "Fridge water line if the fridge has an ice maker.",
          "Check removed walls for supply/drain/vent lines before demolition and reroute if found."
        ]
      ],
      [
        "Gas and fireplace",
        [
          "Cap the line to the removed lounge fireplace.",
          "New double-sided (see-through) direct-vent gas fireplace in a framed chase in the kitchen-lounge wall (about 1.9 m long, 0.7 m deep): new gas line, vent route up through the attic and roof, non-combustible surrounds both sides."
        ]
      ],
      [
        "Electrical and lighting",
        [
          "New 40 A 240 V circuit for the induction range; confirm panel capacity (load calculation).",
          "Dedicated circuits for dishwasher, fridge and hood; split counter receptacles to current code.",
          "Island receptacles fed through the floor from below.",
          "Lighting: about 26 pot lights across the open area, 3 pendants over the island, linear pendant over the dining table, under-cabinet LED.",
          "Relocate switches, receptacles and smoke/CO alarms out of the removed walls.",
          "TV power and data in the alcove.",
          "Receptacle for the beverage fridge."
        ]
      ],
      [
        "Ventilation",
        [
          "Duct the range hood straight out the east wall (exterior cap). Check whether make-up air is required for the hood size chosen."
        ]
      ],
      [
        "Ground floor",
        [
          "Replace the diagonal wall under the stair with short stub walls and a 76 cm door from the foyer into an under-stair closet; add shelving."
        ]
      ],
      [
        "Flooring and finishes",
        [
          "New flooring across the upper-floor open area (kitchen, dining, lounge, hall), about 70 m² / 750 sq ft; remove existing carpet/flooring, level where walls came out (owner DIY).",
          "Drywall patching where walls and fixtures were removed; tape, mud, prime (owner DIY).",
          "Paint the upper floor; caulk trim and counters (owner DIY)."
        ]
      ],
      [
        "Permits and engineering",
        [
          "Building permit (structural, stair, window/door openings) with engineer letters for beams and headers.",
          "Electrical permit (homeowner permit possible in BC for the owner-done part; inspection required).",
          "Gas permit by a licensed gas fitter for capping/adding gas appliances."
        ]
      ]
    ],
    "confirm": [
      "Which walls are bearing: confirm joist direction and loads in the attic and from below before any wall comes out.",
      "Ducts, returns, plumbing or wiring inside walls that are being removed.",
      "Header size and any point loads for the wider patio opening.",
      "That losing the kitchen window is acceptable (range sits where it is now), or shift the range and keep the window.",
      "Vent route for the see-through fireplace (roof penetration)."
    ]
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
    "blinds": true,
    "scope": [
      [
        "Demolition",
        [
          "Remove the non-bearing partitions on the upper floor: the 3.2 m kitchen-living wall with its doorway, and the walls of the small room at the top of the stair (about 3 m). Patch ceiling and floor where they stood.",
          "Remove the corner gas fireplace in the lounge with its chase: gas fitter shuts off and caps the line, remove insert and vent, patch the wall/roof penetration.",
          "Remove the existing kitchen cabinets, counters and appliances."
        ]
      ],
      [
        "Structural and framing",
        [
          "Rebuild the kitchen-lounge wall with a wide cased opening and the fireplace chase.",
          "Replace the 178 cm patio slider with a 244 cm (8 ft) slider centred on the dining wall. New header in the exterior (bearing) wall sized by the engineer, temporary shoring, flashing to the deck, trim and siding repair.",
          "Remove the 105 cm slider window on the east kitchen wall (where the range goes) and infill: framing, sheathing, house wrap, insulation, siding and trim to match, drywall inside."
        ]
      ],
      [
        "Stair",
        [
          "New guard at the stair top (glass with black rail, black metal bars, or oak slat screen: pick one), step lights on every second riser.",
          "Optional: last three steps become 30° winders turning toward the lounge, inside the existing opening."
        ]
      ],
      [
        "Kitchen",
        [
          "New one-wall kitchen on the east exterior wall (about 6.3 m, north to south): full-height pantry, fridge/freezer with cabinet above, prep drawers, induction range with stainless chimney hood, dishwasher, sink in the original spot, drawers to the corner. Warm-white uppers to the hood.",
          "Island 280 x 95 cm with seating for four: drawers, pull-out trash/recycling, oak end panels. No plumbing in the island.",
          "Quartz counters on the run and island; backsplash.",
          "Greige lowers, warm-white uppers, white-oak island.",
          "Shallow dry-pantry run behind the island stools.",
          "Bar cabinet with beverage fridge by the patio door."
        ]
      ],
      [
        "Plumbing",
        [
          "Sink stays on the existing drain and supply lines; new faucet.",
          "Dishwasher hookup beside the sink (supply, drain, high loop or air gap).",
          "Fridge water line if the fridge has an ice maker.",
          "Check removed walls for supply/drain/vent lines before demolition and reroute if found."
        ]
      ],
      [
        "Gas and fireplace",
        [
          "Cap the line to the removed lounge fireplace.",
          "New double-sided (see-through) direct-vent gas fireplace in a framed chase in the kitchen-lounge wall (about 1.9 m long, 0.7 m deep): new gas line, vent route up through the attic and roof, non-combustible surrounds both sides.",
          "Natural-stone surrounds on both faces."
        ]
      ],
      [
        "Electrical and lighting",
        [
          "New 40 A 240 V circuit for the induction range; confirm panel capacity (load calculation).",
          "Dedicated circuits for dishwasher, fridge and hood; split counter receptacles to current code.",
          "Island receptacles fed through the floor from below.",
          "Lighting: about 26 pot lights across the open area, 3 pendants over the island, linear pendant over the dining table, under-cabinet LED.",
          "Relocate switches, receptacles and smoke/CO alarms out of the removed walls.",
          "TV power and data in the alcove.",
          "Step lights at the stair, receptacle for the beverage fridge."
        ]
      ],
      [
        "Ventilation",
        [
          "Duct the range hood straight out the east wall (exterior cap). Check whether make-up air is required for the hood size chosen."
        ]
      ],
      [
        "Ground floor",
        [
          "Replace the diagonal wall under the stair with short stub walls and a 76 cm door from the foyer into an under-stair closet; add shelving."
        ]
      ],
      [
        "Millwork",
        [
          "Oak media wall around the TV in the alcove."
        ]
      ],
      [
        "Flooring and finishes",
        [
          "New flooring across the upper-floor open area (kitchen, dining, lounge, hall), about 70 m² / 750 sq ft; remove existing carpet/flooring, level where walls came out (owner DIY).",
          "Drywall patching where walls and fixtures were removed; tape, mud, prime (owner DIY).",
          "Paint the upper floor; caulk trim and counters (owner DIY)."
        ]
      ],
      [
        "Permits and engineering",
        [
          "Building permit (structural, stair, window/door openings) with engineer letters for beams and headers.",
          "Electrical permit (homeowner permit possible in BC for the owner-done part; inspection required).",
          "Gas permit by a licensed gas fitter for capping/adding gas appliances."
        ]
      ]
    ],
    "confirm": [
      "Which walls are bearing: confirm joist direction and loads in the attic and from below before any wall comes out.",
      "Ducts, returns, plumbing or wiring inside walls that are being removed.",
      "Header size and any point loads for the wider patio opening.",
      "That losing the kitchen window is acceptable (range sits where it is now), or shift the range and keep the window.",
      "Vent route for the see-through fireplace (roof penetration)."
    ]
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
    "blinds": true,
    "scope": [
      [
        "Demolition",
        [
          "Remove the non-bearing partitions on the upper floor: the 3.2 m kitchen-living wall with its doorway, and the walls of the small room at the top of the stair (about 3 m). Patch ceiling and floor where they stood.",
          "Remove the corner gas fireplace in the lounge with its chase: gas fitter shuts off and caps the line, remove insert and vent, patch the wall/roof penetration.",
          "Remove the existing kitchen cabinets, counters and appliances.",
          "Remove the hall-kitchen wall (about 2.3 m)."
        ]
      ],
      [
        "Structural and framing",
        [
          "Engineered beam and posts to replace the hall-kitchen wall (probably bearing), with posts carried to footings.",
          "New stair opening in the upper floor (headers, trimmers); frame and sheathe over the old stair opening.",
          "Replace the 178 cm patio slider with a 244 cm (8 ft) slider centred on the dining wall. New header in the exterior (bearing) wall sized by the engineer, temporary shoring, flashing to the deck, trim and siding repair.",
          "Remove the 105 cm slider window on the east kitchen wall (where the range goes) and infill: framing, sheathing, house wrap, insulation, siding and trim to match, drywall inside."
        ]
      ],
      [
        "Stair",
        [
          "Rebuild the stair: the flat landing becomes three winders turning right, and the upper flight lands in the kitchen by the south end of the island.",
          "New guard at the top, white-oak treads, step lights.",
          "Ground floor: cut the walls under the new flight to the stair soffit; keep 2.0 m+ headroom at the mud room to garage door."
        ]
      ],
      [
        "Kitchen",
        [
          "New one-wall kitchen on the east exterior wall (about 6.3 m, north to south): full-height pantry, fridge/freezer with cabinet above, prep drawers, induction range with stainless chimney hood, dishwasher, sink in the original spot, drawers to the corner. Warm-white uppers to the hood.",
          "Island 280 x 95 cm with seating for four: drawers, pull-out trash/recycling, oak end panels. No plumbing in the island.",
          "Quartz counters on the run and island; backsplash.",
          "Bar cabinet with beverage fridge by the patio door."
        ]
      ],
      [
        "Plumbing",
        [
          "Sink stays on the existing drain and supply lines; new faucet.",
          "Dishwasher hookup beside the sink (supply, drain, high loop or air gap).",
          "Fridge water line if the fridge has an ice maker.",
          "Check removed walls for supply/drain/vent lines before demolition and reroute if found."
        ]
      ],
      [
        "Gas and fireplace",
        [
          "Cap the line to the removed lounge fireplace.",
          "New single-sided direct-vent gas fireplace on the lounge west (exterior) wall: gas line, vent through the wall, surround and hearth."
        ]
      ],
      [
        "Electrical and lighting",
        [
          "New 40 A 240 V circuit for the induction range; confirm panel capacity (load calculation).",
          "Dedicated circuits for dishwasher, fridge and hood; split counter receptacles to current code.",
          "Island receptacles fed through the floor from below.",
          "Lighting: about 26 pot lights across the open area, 3 pendants over the island, linear pendant over the dining table, under-cabinet LED.",
          "Relocate switches, receptacles and smoke/CO alarms out of the removed walls.",
          "TV power and data in the alcove.",
          "Step lights at the stair, receptacle for the beverage fridge."
        ]
      ],
      [
        "Ventilation",
        [
          "Duct the range hood straight out the east wall (exterior cap). Check whether make-up air is required for the hood size chosen."
        ]
      ],
      [
        "Ground floor",
        [
          "Replace the diagonal wall under the stair with short stub walls and a 76 cm door from the foyer into a storage closet under the old flight and landing; add shelving."
        ]
      ],
      [
        "Millwork",
        [
          "Oak media wall around the TV in the alcove."
        ]
      ],
      [
        "Flooring and finishes",
        [
          "New flooring across the upper-floor open area (kitchen, dining, lounge, hall), about 70 m² / 750 sq ft; remove existing carpet/flooring, level where walls came out (owner DIY).",
          "Drywall patching where walls and fixtures were removed; tape, mud, prime (owner DIY).",
          "Paint the upper floor; caulk trim and counters (owner DIY)."
        ]
      ],
      [
        "Permits and engineering",
        [
          "Building permit (structural, stair, window/door openings) with engineer letters for beams and headers.",
          "Electrical permit (homeowner permit possible in BC for the owner-done part; inspection required).",
          "Gas permit by a licensed gas fitter for capping/adding gas appliances."
        ]
      ]
    ],
    "confirm": [
      "Which walls are bearing: confirm joist direction and loads in the attic and from below before any wall comes out.",
      "Ducts, returns, plumbing or wiring inside walls that are being removed.",
      "Header size and any point loads for the wider patio opening.",
      "That losing the kitchen window is acceptable (range sits where it is now), or shift the range and keep the window.",
      "Beam size, post locations and footings under the posts.",
      "Stair geometry (winder treads, headroom) with the stair builder and inspector."
    ]
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
    "blinds": true,
    "archived": true
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
    "blinds": true,
    "scope": [
      [
        "Demolition",
        [
          "Remove the non-bearing partitions on the upper floor: the 3.2 m kitchen-living wall with its doorway, and the walls of the small room at the top of the stair (about 3 m). Patch ceiling and floor where they stood.",
          "Remove the corner gas fireplace in the lounge with its chase: gas fitter shuts off and caps the line, remove insert and vent, patch the wall/roof penetration.",
          "Remove the existing kitchen cabinets, counters and appliances.",
          "Remove the hall-kitchen wall (about 2.3 m) and the 1.7 m stairwell wall beside it."
        ]
      ],
      [
        "Structural and framing",
        [
          "Engineered beams and posts for the hall-kitchen wall and the stairwell wall (both probably bearing), posts to footings.",
          "Frame and sheathe over the old stair opening; new opening for the upper flight.",
          "Ground floor: lower the tops of the walls under the new flight to the stair soffit, including the bathroom wall; header where a cut wall carries load.",
          "Kitchen-lounge wall rebuilt on its original line, keeping the original doorway, with the fireplace chase.",
          "Walk-in pantry about 1.0 x 1.0 m between the stair and the kitchen-lounge wall: framing, 76 cm door in the old hall-wall line, shelving on two walls.",
          "Replace the 178 cm patio slider with a 244 cm (8 ft) slider centred on the dining wall. New header in the exterior (bearing) wall sized by the engineer, temporary shoring, flashing to the deck, trim and siding repair.",
          "Remove the 105 cm slider window on the east kitchen wall (where the range goes) and infill: framing, sheathing, house wrap, insulation, siding and trim to match, drywall inside."
        ]
      ],
      [
        "Stair",
        [
          "Rebuild the stair: lower flight kept on its line with new equal risers (14 x 18.3 cm), one 45° winder instead of the landing, 5-step upper flight into the kitchen.",
          "Glass guard over the stair at the open corner by the pantry; white-oak treads, step lights."
        ]
      ],
      [
        "Kitchen",
        [
          "New one-wall kitchen on the east exterior wall (about 6.3 m, north to south): full-height pantry, fridge/freezer with cabinet above, prep drawers, induction range with stainless chimney hood, dishwasher, sink in the original spot, drawers to the corner. Warm-white uppers to the hood.",
          "Island 280 x 95 cm with seating for four: drawers, pull-out trash/recycling, oak end panels. No plumbing in the island.",
          "Quartz counters on the run and island; backsplash.",
          "Island moved about 1.1 m north toward the dining table.",
          "Bar cabinet with beverage fridge by the patio door."
        ]
      ],
      [
        "Plumbing",
        [
          "Sink stays on the existing drain and supply lines; new faucet.",
          "Dishwasher hookup beside the sink (supply, drain, high loop or air gap).",
          "Fridge water line if the fridge has an ice maker.",
          "Check removed walls for supply/drain/vent lines before demolition and reroute if found."
        ]
      ],
      [
        "Gas and fireplace",
        [
          "Cap the line to the removed lounge fireplace.",
          "New double-sided (see-through) direct-vent gas fireplace in a framed chase in the kitchen-lounge wall (about 1.9 m long, 0.7 m deep): new gas line, vent route up through the attic and roof, non-combustible surrounds both sides."
        ]
      ],
      [
        "Electrical and lighting",
        [
          "New 40 A 240 V circuit for the induction range; confirm panel capacity (load calculation).",
          "Dedicated circuits for dishwasher, fridge and hood; split counter receptacles to current code.",
          "Island receptacles fed through the floor from below.",
          "Lighting: about 26 pot lights across the open area, 3 pendants over the island, linear pendant over the dining table, under-cabinet LED.",
          "Relocate switches, receptacles and smoke/CO alarms out of the removed walls.",
          "TV power and data in the alcove.",
          "Pantry light, step lights, receptacle for the beverage fridge."
        ]
      ],
      [
        "Ventilation",
        [
          "Duct the range hood straight out the east wall (exterior cap). Check whether make-up air is required for the hood size chosen."
        ]
      ],
      [
        "Ground floor",
        [
          "Replace the diagonal wall under the stair with short stub walls and a 76 cm door from the foyer into an under-stair closet; add shelving."
        ]
      ],
      [
        "Millwork",
        [
          "Oak media wall around the TV in the alcove."
        ]
      ],
      [
        "Flooring and finishes",
        [
          "New flooring across the upper-floor open area (kitchen, dining, lounge, hall), about 70 m² / 750 sq ft; remove existing carpet/flooring, level where walls came out (owner DIY).",
          "Drywall patching where walls and fixtures were removed; tape, mud, prime (owner DIY).",
          "Paint the upper floor; caulk trim and counters (owner DIY)."
        ]
      ],
      [
        "Permits and engineering",
        [
          "Building permit (structural, stair, window/door openings) with engineer letters for beams and headers.",
          "Electrical permit (homeowner permit possible in BC for the owner-done part; inspection required).",
          "Gas permit by a licensed gas fitter for capping/adding gas appliances."
        ]
      ]
    ],
    "confirm": [
      "Which walls are bearing: confirm joist direction and loads in the attic and from below before any wall comes out.",
      "Ducts, returns, plumbing or wiring inside walls that are being removed.",
      "Header size and any point loads for the wider patio opening.",
      "That losing the kitchen window is acceptable (range sits where it is now), or shift the range and keep the window.",
      "Beam sizes, post locations and footings.",
      "The single 45° winder with the stair builder and inspector.",
      "Load on the ground-floor bathroom wall before its top is cut.",
      "Vent route for the see-through fireplace (roof penetration)."
    ]
  },
  {
    "key": "v23",
    "title": "Open kitchen, pantry wall",
    "sub": "Concept 14 plan, big island, TV nook",
    "chip": "19 · Open kitchen",
    "kind": "Concept 19",
    "headline": "Concept 14 reworked: full-size island, pantry wall behind the stools, wider patio door, and a TV nook where the fireplace wall was.",
    "desc": "Concept 14's plan with the current stair. Kitchen: full-size island (2.8 m, four stools) about 1.0 m from the dining table, which sits about 1.25 m from a standard 10 ft patio slider centred on the dining wall; two full-height pantry units and a bar with a beverage fridge on the hall wall behind the stools. The fireplace and its chase are removed and the kitchen-lounge wall is extended from the outside wall, leaving a 1.2 m opening at the stair end, so the way from the stairs to the kitchen crosses only the west end of the lounge. The east end becomes a TV nook: a 75 in TV in the alcove and a big 8 ft sofa with its chaise end against the window wall; the left-most seat faces the TV straight on from about 3.6 m, with about 1.4 m of open floor between the sofa arm and the half wall. The west end, where the fireplace was, is a sitting corner with a window bench. Around the stairwell, the hall-side and north walls are replaced by glass railings with a black top rail (they look bearing, so beams are needed); the half wall between the kitchen and the TV nook is 107 cm high with a 35 cm quartz ledge matching the kitchen counters, overhanging the lounge side for drinks. Ground floor: the under-stair storage gets 1.2 m double doors from the garage (fire-rated, self-closing) as well as its foyer door.",
    "tags": [
      "Current stair",
      "Pantry wall + bar",
      "TV nook",
      "10 ft patio door"
    ],
    "btn": "View the kitchen",
    "proposed": true,
    "blinds": true,
    "scope": [
      [
        "Demolition",
        [
          "Remove the non-bearing partitions on the upper floor: the 3.2 m kitchen-living wall with its doorway, and the walls of the small room at the top of the stair (about 3 m). Patch ceiling and floor where they stood.",
          "Remove the corner gas fireplace in the lounge with its chase: gas fitter shuts off and caps the line, remove insert and vent, patch the wall/roof penetration.",
          "Remove the existing kitchen cabinets, counters and appliances.",
          "Remove the two stairwell walls on the hall side and north side (about 1.7 m and 1.0 m) and the low wall at the stair."
        ]
      ],
      [
        "Structural and framing",
        [
          "Engineered beams and posts where the two stairwell walls come out (they look bearing), posts to footings.",
          "Extend the kitchen-lounge wall from the outside wall as a 2.2 m half wall, 107 cm high, topped with a 35 cm deep quartz ledge (same stone as the counters) overhanging about 20 cm on the lounge side, with a receptacle on the lounge face; 1.2 m opening at the stair end. Option: leave the half wall out for a fully open room.",
          "Ground floor: new 1.2 m opening from the garage into the under-stair storage with header (about 185 cm clear).",
          "Replace the 178 cm patio slider with a 305 cm (10 ft) slider centred on the dining wall. New header in the exterior (bearing) wall sized by the engineer, temporary shoring, flashing to the deck, trim and siding repair.",
          "Remove the 105 cm slider window on the east kitchen wall (where the range goes) and infill: framing, sheathing, house wrap, insulation, siding and trim to match, drywall inside."
        ]
      ],
      [
        "Stair",
        [
          "Glass guards with a black top rail where the stairwell walls come out (code height, tempered/laminated glass, anchored to blocking). About 4.5 m of guard around the stairwell."
        ]
      ],
      [
        "Kitchen",
        [
          "New one-wall kitchen on the east exterior wall (about 6.3 m, north to south): full-height pantry, fridge/freezer with cabinet above, prep drawers, induction range with stainless chimney hood, dishwasher, sink in the original spot, drawers to the corner. Warm-white uppers to the hood.",
          "Island 280 x 95 cm with seating for four: drawers, pull-out trash/recycling, oak end panels. No plumbing in the island.",
          "Quartz counters on the run and island; backsplash.",
          "Hall wall behind the island stools: two full-height pantry units and a bar cabinet with beverage fridge."
        ]
      ],
      [
        "Plumbing",
        [
          "Sink stays on the existing drain and supply lines; new faucet.",
          "Dishwasher hookup beside the sink (supply, drain, high loop or air gap).",
          "Fridge water line if the fridge has an ice maker.",
          "Check removed walls for supply/drain/vent lines before demolition and reroute if found."
        ]
      ],
      [
        "Gas and fireplace",
        [
          "Cap the line to the removed lounge fireplace."
        ]
      ],
      [
        "Electrical and lighting",
        [
          "New 40 A 240 V circuit for the induction range; confirm panel capacity (load calculation).",
          "Dedicated circuits for dishwasher, fridge and hood; split counter receptacles to current code.",
          "Island receptacles fed through the floor from below.",
          "Lighting: about 26 pot lights across the open area, 3 pendants over the island, linear pendant over the dining table, under-cabinet LED.",
          "Relocate switches, receptacles and smoke/CO alarms out of the removed walls.",
          "TV power and data in the alcove.",
          "Receptacle for the beverage fridge.",
          "Stairwell: cascade pendant of opal globes (about 55 cm across, 7 globes) from a black canopy over the landing, lowest globe at least 2.1 m above the treads, dimmable, 2700-3000 K; serviceable from the upper floor or a ladder on the landing.",
          "SE bedroom (teen room): desk-height receptacle with USB-C and a wired network drop at the 2 m desk under the window; LED strip behind the headboard on a switched receptacle.",
          "Recessed LED step lights in the wall beside the lower flight (about 30 cm above the treads), on a motion sensor at low brightness; 3-way switching at the top and bottom of the stair."
        ]
      ],
      [
        "Ventilation",
        [
          "Duct the range hood straight out the east wall (exterior cap). Check whether make-up air is required for the hood size chosen."
        ]
      ],
      [
        "Ground floor",
        [
          "Replace the diagonal walls under the stair with stub walls; 76 cm door from the foyer and 1.2 m fire-rated, self-closing, gasketed double doors from the garage into under-stair storage (garage side finished as a fire separation, Type X drywall)."
        ]
      ],
      [
        "Millwork",
        [
          "Window bench with storage in the west sitting corner.",
          "SE bedroom: sound insulation (mineral wool) in the walls shared with the lounge and the main bath while the drywall is open (owner DIY).",
          "Laundry: floating oak folding counter (90 cm, 55 cm deep) over a cabinet with a litter box (cat opening, pull-out tray, vent) and a tilt-out hamper; hanging rod and oak shelf above; upper cabinet over the existing laundry sink.",
          "Console behind the sofa (furniture, not built-in)."
        ]
      ],
      [
        "Flooring and finishes",
        [
          "New flooring across the upper-floor open area (kitchen, dining, lounge, hall), about 70 m² / 750 sq ft; remove existing carpet/flooring, level where walls came out (owner DIY).",
          "Drywall patching where walls and fixtures were removed; tape, mud, prime (owner DIY).",
          "Paint the upper floor; caulk trim and counters (owner DIY)."
        ]
      ],
      [
        "Permits and engineering",
        [
          "Building permit (structural, stair, window/door openings) with engineer letters for beams and headers.",
          "Electrical permit (homeowner permit possible in BC for the owner-done part; inspection required).",
          "Gas permit by a licensed gas fitter for capping/adding gas appliances."
        ]
      ]
    ],
    "confirm": [
      "Which walls are bearing: confirm joist direction and loads in the attic and from below before any wall comes out.",
      "Ducts, returns, plumbing or wiring inside walls that are being removed.",
      "Header size and any point loads for the wider patio opening.",
      "That losing the kitchen window is acceptable (range sits where it is now), or shift the range and keep the window.",
      "Beam sizes, post locations and footings under the posts.",
      "That the 10 ft header fits under the floor framing above.",
      "Fire-separation requirements for the new garage door (rating, closer, gasketing) with the inspector."
    ],
    "gallery": [
      {
        "src": "img/v23/1.jpg",
        "thumb": "img/v23/1_t.jpg",
        "caption": "Dining toward the kitchen and lounge. The existing dining-wall fireplace stays. Mood image only: the plan has an induction range and no sink in the island."
      },
      {
        "src": "img/v23/2.jpg",
        "thumb": "img/v23/2_t.jpg",
        "caption": "From the TV nook toward the kitchen, with the stair pendant and glass guards on the left. Mood image only: the half wall now has a quartz ledge rather than wood."
      },
      {
        "src": "img/v23/3.jpg",
        "thumb": "img/v23/3_t.jpg",
        "caption": "Half wall with the quartz ledge, pantry units behind the island stools, and the bar cabinet by the stair."
      }
    ]
  },
  {
    "key": "v24",
    "title": "Oven tower, drinks bar, fireplace option",
    "sub": "Concept 19 + wall oven, bar, teen room",
    "chip": "20 · Oven tower + bar",
    "kind": "Concept 20",
    "headline": "Concept 19 with a wall-oven and microwave tower beside the fridge, a drinks bar in the dining corner, an optional fireplace in the kitchen-lounge separator, and a furnished teen bedroom.",
    "desc": "Everything from concept 19, plus: a full-height oven tower (30 in wall oven with a built-in microwave above) beside the fridge; the induction cooktop stays under the hood with three pot drawers where the range oven was, and a built-in stainless trivet in the island end nearest the oven. A drinks bar sits in the dining corner between the patio door and the dining-room fireplace: oak base with a glass-door wine/beverage fridge, quartz top, lit glass-front upper for stemware and a bottle shelf. The small bar behind the island stools becomes snack drawers. Kitchen-lounge wall options: half wall with quartz ledge, no wall, or a single-sided linear gas fireplace in a 2 m chase at the outside-wall end (vents through the east wall) with the rest left open. SE bedroom set up for a teenager: queen storage bed with its headboard on the bathroom wall so both drawer sides open, 115 cm desk on the side wall with the window to the right, low dresser under the small window. Cooktop option: on the wall under a chimney hood (window removed), or on the island with a ceiling-hung hood, with the wall oven tower moved to the old range spot facing it.",
    "tags": [
      "Oven tower",
      "Drinks bar",
      "Fireplace option",
      "Island cooktop option",
      "Teen room"
    ],
    "btn": "View the kitchen",
    "proposed": true,
    "blinds": true,
    "scope": [
      [
        "Demolition",
        [
          "Remove the non-bearing partitions on the upper floor: the 3.2 m kitchen-living wall with its doorway, and the walls of the small room at the top of the stair (about 3 m). Patch ceiling and floor where they stood.",
          "Remove the corner gas fireplace in the lounge with its chase: gas fitter shuts off and caps the line, remove insert and vent, patch the wall/roof penetration.",
          "Remove the existing kitchen cabinets, counters and appliances.",
          "Remove the two stairwell walls on the hall side and north side (about 1.7 m and 1.0 m) and the low wall at the stair."
        ]
      ],
      [
        "Structural and framing",
        [
          "Engineered beams and posts where the two stairwell walls come out (they look bearing), posts to footings.",
          "Extend the kitchen-lounge wall from the outside wall as a 2.2 m half wall, 107 cm high, topped with a 35 cm deep quartz ledge (same stone as the counters) overhanging about 20 cm on the lounge side, with a receptacle on the lounge face; 1.2 m opening at the stair end. Option: leave the half wall out for a fully open room.",
          "Ground floor: new 1.2 m opening from the garage into the under-stair storage with header (about 185 cm clear).",
          "Replace the 178 cm patio slider with a 305 cm (10 ft) slider centred on the dining wall. New header in the exterior (bearing) wall sized by the engineer, temporary shoring, flashing to the deck, trim and siding repair.",
          "Remove the 105 cm slider window on the east kitchen wall (where the range goes) and infill: framing, sheathing, house wrap, insulation, siding and trim to match, drywall inside."
        ]
      ],
      [
        "Stair",
        [
          "Glass guards with a black top rail where the stairwell walls come out (code height, tempered/laminated glass, anchored to blocking). About 4.5 m of guard around the stairwell."
        ]
      ],
      [
        "Kitchen",
        [
          "New one-wall kitchen on the east exterior wall (about 6.3 m, north to south): oven tower (30 in wall oven with built-in microwave above, drawer below, side panel against the fridge), fridge/freezer with cabinet above, prep drawers, induction cooktop with three pot drawers under it and the stainless chimney hood above, dishwasher, sink in the original spot, drawers to the corner. Warm-white uppers to the hood.",
          "Island 280 x 95 cm with seating for four: drawers, pull-out trash/recycling, oak end panels. No plumbing in the island.",
          "Quartz counters on the run and island; backsplash.",
          "Hall wall behind the island stools: two full-height pantry units and a snack-drawer base with an upper for everyday glasses.",
          "Built-in stainless trivet (hot rods) set into the island top at the end nearest the oven; optional pull-out landing shelf under the oven.",
          "Drinks bar in the dining corner between the patio door and the dining fireplace: 100 x 45 cm oak base with a glass-door wine/beverage fridge and glass drawers, quartz top, LED-lit glass-front upper, bottle shelf."
        ]
      ],
      [
        "Plumbing",
        [
          "Sink stays on the existing drain and supply lines; new faucet.",
          "Dishwasher hookup beside the sink (supply, drain, high loop or air gap).",
          "Fridge water line if the fridge has an ice maker.",
          "Check removed walls for supply/drain/vent lines before demolition and reroute if found."
        ]
      ],
      [
        "Gas and fireplace",
        [
          "Cap the line to the removed lounge fireplace.",
          "Option: single-sided linear direct-vent gas fireplace (about 100 cm) in a 2 m full-height chase at the outside-wall end of the kitchen-lounge separator, facing the TV nook; horizontal vent through the east wall, new gas line, porcelain surround and flush hearth; the rest of the separator line toward the stairs is left open."
        ]
      ],
      [
        "Electrical and lighting",
        [
          "New 40 A 240 V circuit for the induction cooktop and a separate 30-40 A 240 V circuit for the wall oven; dedicated circuit for the built-in microwave; confirm panel capacity (load calculation).",
          "Dedicated circuits for dishwasher, fridge and hood; split counter receptacles to current code.",
          "Island receptacles fed through the floor from below.",
          "Lighting: about 26 pot lights across the open area, 3 pendants over the island, linear pendant over the dining table, under-cabinet LED.",
          "Relocate switches, receptacles and smoke/CO alarms out of the removed walls.",
          "TV power and data in the alcove.",
          "Receptacle for the wine/beverage fridge and LED under-cabinet light at the dining-corner bar.",
          "Stairwell: cascade pendant of opal globes (about 55 cm across, 7 globes) from a black canopy over the landing, lowest globe at least 2.1 m above the treads, dimmable, 2700-3000 K; serviceable from the upper floor or a ladder on the landing.",
          "SE bedroom (teen room): desk-height receptacle with USB-C and a wired network drop at the 2 m desk under the window; LED strip behind the headboard on a switched receptacle.",
          "Recessed LED step lights in the wall beside the lower flight (about 30 cm above the treads), on a motion sensor at low brightness; 3-way switching at the top and bottom of the stair."
        ]
      ],
      [
        "Ventilation",
        [
          "Duct the range hood straight out the east wall (exterior cap). Check whether make-up air is required for the hood size chosen.",
          "Option: island cooktop with a ceiling-hung island hood ducted through the attic to the roof or a side wall (make-up air if required); the wall hood is then not needed, the oven tower moves to the old range spot and the tower beside the fridge becomes a pantry."
        ]
      ],
      [
        "Ground floor",
        [
          "Replace the diagonal walls under the stair with stub walls; 76 cm door from the foyer and 1.2 m fire-rated, self-closing, gasketed double doors from the garage into under-stair storage (garage side finished as a fire separation, Type X drywall)."
        ]
      ],
      [
        "Millwork",
        [
          "Window bench with storage in the west sitting corner.",
          "SE bedroom: sound insulation (mineral wool) in the walls shared with the lounge and the main bath while the drywall is open (owner DIY).",
          "Laundry: floating oak folding counter (90 cm, 55 cm deep) over a cabinet with a litter box (cat opening, pull-out tray, vent) and a tilt-out hamper; hanging rod and oak shelf above; upper cabinet over the existing laundry sink.",
          "Console behind the sofa (furniture, not built-in).",
          "SE bedroom: queen storage bed with the headboard on the bathroom wall (drawers clear on both sides), 115 x 60 cm desk on the side wall with the window to the right, low dresser under the small window."
        ]
      ],
      [
        "Flooring and finishes",
        [
          "New flooring across the upper-floor open area (kitchen, dining, lounge, hall), about 70 m² / 750 sq ft; remove existing carpet/flooring, level where walls came out (owner DIY).",
          "Drywall patching where walls and fixtures were removed; tape, mud, prime (owner DIY).",
          "Paint the upper floor; caulk trim and counters (owner DIY)."
        ]
      ],
      [
        "Permits and engineering",
        [
          "Building permit (structural, stair, window/door openings) with engineer letters for beams and headers.",
          "Electrical permit (homeowner permit possible in BC for the owner-done part; inspection required).",
          "Gas permit by a licensed gas fitter for capping/adding gas appliances."
        ]
      ]
    ],
    "confirm": [
      "Which walls are bearing: confirm joist direction and loads in the attic and from below before any wall comes out.",
      "Ducts, returns, plumbing or wiring inside walls that are being removed.",
      "Header size and any point loads for the wider patio opening.",
      "That losing the kitchen window is acceptable (range sits where it is now), or shift the range and keep the window.",
      "Beam sizes, post locations and footings under the posts.",
      "That the 10 ft header fits under the floor framing above.",
      "Fire-separation requirements for the new garage door (rating, closer, gasketing) with the inspector.",
      "Side clearance from the dining-room fireplace to the new oven tower (about 20 cm) and to the drinks bar.",
      "Fridge and wall-oven manuals: required gap or insulating panel between them.",
      "If the fireplace option is chosen: firebox clearance to the end of the kitchen counter (about 20 cm) and vent termination clearance from the kitchen window."
    ]
  },
  {
    "key": "v25",
    "title": "Original walls, walk-in pantry",
    "sub": "Slim fireplace, pantry behind it",
    "chip": "21 · Original + pantry",
    "kind": "Concept 21",
    "headline": "The original floor plan kept, with a slim gas fireplace set into the kitchen-lounge wall, a walk-in pantry behind it on the kitchen side, and the concept 20 kitchen.",
    "desc": "Original walls and stair are kept; the kitchen-lounge doorway loses its door and header and is widened to a full-height opening about 1.8 m wide, from the fridge to the corner cabinets. The corner fireplace chase that stuck about 85 cm into the lounge is removed and replaced by a slim direct-vent gas fireplace (about 38 cm deep) set into the kitchen-lounge wall, flush with the lounge, so the lounge gains that floor. On the kitchen side of the same wall, where the fridge stood, is a walk-in pantry (about 1.2 x 1.7 m inside, its north wall in line with the hallway, shelving on two long walls, pocket door on its north side opening to the hallway) whose back wall encloses the fireplace. The fridge (counter-depth, French doors) moves onto the kitchen side of the kitchen-lounge wall, right beside the pantry. Cooktop in the island at the dining end under a ceiling-hung hood, with the oven/microwave tower directly opposite on the wall run (tall cabinet on one side, coffee station counter on the other). The island and dining table each move toward the other (about 85 cm between them). Two stools at the south end of the island (keeps a clear path between the island and the pantry door); drinks bar in the dining corner. The kitchen window on the wall run is removed.",
    "tags": [
      "Original walls",
      "Slim fireplace",
      "Walk-in pantry",
      "Island cooktop",
      "1.8 m opening"
    ],
    "btn": "View the kitchen",
    "proposed": true,
    "blinds": true,
    "scope": [
      [
        "Demolition",
        [
          "Remove the existing kitchen cabinets, counters and appliances.",
          "Remove the corner gas fireplace and its angled chase in the lounge (about 3 m of chase walls); gas fitter shuts off and caps the line; patch floor and ceiling.",
          "Remove the door and header in the kitchen-lounge doorway, take out about 85 cm of the wall west of it, and open the whole width to the ceiling (about 1.8 m wide, from the fridge to the corner cabinets); wrap the opening in drywall corner bead.",
          "Open the kitchen-lounge wall for the new fireplace and chase (bearing check first)."
        ]
      ],
      [
        "Structural and framing",
        [
          "Fill in the 105 cm kitchen window on the east wall (framing, sheathing, house wrap, insulation, siding to match, drywall inside).",
          "1.8 m full-height opening: if the kitchen-lounge wall is bearing, a flush beam in the ceiling over the opening with posts at each end carries the load (engineer to size).",
          "Walk-in pantry about 1.2 x 1.7 m inside on the kitchen side of the kitchen-lounge wall: two new walls, the north one in line with the hallway wall; 66 cm pocket door on the north side opening to the hallway walkway.",
          "Fireplace chase framed into the kitchen-lounge wall, backing into the pantry (clearances per the unit chosen; no shelving on that wall)."
        ]
      ],
      [
        "Kitchen",
        [
          "Wall run on the east wall (north to south): 88 cm tall cabinet, oven tower (30 in wall oven with built-in microwave above, drawer below), coffee station with drawers and uppers, prep drawers, dishwasher, sink in the original spot, drawers to the corner. Warm-white uppers, continuous with no gaps.",
          "Island 280 x 100 cm, about 108 cm from the wall run, with a 76 cm induction cooktop at the dining end facing the oven tower, pot drawers, pull-out trash, two stools at the south end, built-in stainless trivet.",
          "Counter-depth French-door fridge on the kitchen side of the kitchen-lounge wall, beside the pantry, with a cabinet above.",
          "Drinks bar in the dining corner: oak base with a glass-door wine/beverage fridge, quartz top, LED-lit glass-front upper.",
          "Quartz counters and backsplash."
        ]
      ],
      [
        "Plumbing",
        [
          "Sink stays on the existing drain and supply; new faucet; dishwasher hookup.",
          "Fridge water line if it has an ice maker."
        ]
      ],
      [
        "Gas and fireplace",
        [
          "Slim direct-vent gas fireplace (about 38 cm deep) set into the kitchen-lounge wall, flush with the lounge, with surround and flush hearth.",
          "Extend the existing gas line about 1 m to the new unit; new vent pipe to the unit's listing, offset about 1.2 m in the attic to the existing roof penetration (or a new one)."
        ]
      ],
      [
        "Electrical and lighting",
        [
          "40 A 240 V circuit for the island cooktop (fed through the floor), separate 240 V circuit for the wall oven, dedicated circuits for the microwave, dishwasher, fridge, wine fridge and hood.",
          "Island receptacles; pantry light; pot lights across the kitchen, pendants over the island seating, linear pendant over the dining table, under-cabinet LED.",
          "SE bedroom: desk-height receptacle with USB-C and a network drop; switched receptacle for the headboard LED."
        ]
      ],
      [
        "Ventilation",
        [
          "Ceiling-hung island hood over the cooktop, ducted through the attic to the roof or a side wall; make-up air if the hood size requires it."
        ]
      ],
      [
        "Millwork",
        [
          "Walk-in pantry shelving on the west and east walls (none on the fireplace wall).",
          "SE bedroom: queen storage bed with headboard on the bathroom wall, 115 x 60 cm desk on the side wall, low dresser under the small window."
        ]
      ],
      [
        "Flooring and finishes",
        [
          "New flooring in the kitchen, dining, lounge and the old chase footprint (about 60 m²) (owner DIY).",
          "Drywall patching where the chase, window, doorway header and cabinets came out; tape, mud, prime (owner DIY).",
          "Paint kitchen, dining, lounge and pantry; caulk trim and counters (owner DIY).",
          "Sound insulation in the SE bedroom walls shared with the lounge and main bath (owner DIY)."
        ]
      ],
      [
        "Permits and engineering",
        [
          "Building permit (window infill, wall openings for the fireplace and the full-height doorway).",
          "Gas permit by a licensed gas fitter.",
          "Electrical permit (homeowner permit possible for the owner-done part; inspection required)."
        ]
      ]
    ],
    "confirm": [
      "Whether the kitchen-lounge wall is bearing (fireplace opening, pantry tie-in and the full-height doorway).",
      "Existing fireplace vent type (B-vent cannot be reused for a direct-vent unit) and that the new unit allows the attic offset.",
      "Clearances from the fireplace chase to the pantry and fridge.",
      "About 85 cm between the dining table end and the island is the minimum; confirm with the real table.",
      "Island hood duct route in the attic and make-up air requirement.",
      "Finished end panel on the fridge side facing the opening."
    ]
  },
  {
    "key": "v26",
    "title": "Open plan, pantry wall, oven tower",
    "sub": "Concept 15 with 20 and 21 ideas",
    "chip": "22 · Open + pantry wall",
    "kind": "Concept 22 · Latest",
    "headline": "Concept 15 refined: the open kitchen and two living-room seating areas kept, with a seamless full-height pantry wall, an oven tower beside the fridge, a built-in drinks bar and a simpler fireplace.",
    "desc": "Same plan as concept 15: the kitchen-lounge wall is opened up except a short chase with a slim gas fireplace facing the lounge, the stair stays as built (the top-winder idea is left as an option), and the lounge keeps two seating areas: the sofa facing the TV nook, and two fireside chairs facing each other at the fireplace. Kitchen: warm off-white cabinetry throughout with white-oak accents (island and bar). On the wall run, from the dining end: an open space beside the dining-room fireplace, a full-height oven tower (30 in wall oven, built-in microwave above), the coffee counter beside it as landing space, an induction cooktop over pot drawers under the hood, prep drawers, dishwasher and sink. Fridge and pantry: the stair-side wall holds the counter-depth fridge at the hallway end and a 52 cm full-height pull-out pantry beside it, flush with the fridge; the pantry wraps the corner onto the kitchen face of the fireplace chase with two more full-height pull-outs (about 58 cm each), all with integrated finger pulls and lit by two pot lights. The island is 2.6 m with four stools at 57 cm spacing; 116 cm work aisle, about 1.2 m between the fridge and the end of the island (its landing space). Other fridge placements are under Options. Fireplace: no separate stone panel; the chase is plain plaster with the fireplace set flush, a slim dark hearth and one piece of art, and a single oak shelf on its kitchen face. Drinks bar: built in on the east wall between the patio-door corner and the dining-room fireplace (as in concept 20), framed in off-white to the ceiling, with a white-oak base and back panel, glass-door wine/beverage fridge, quartz top, bottle shelf and an LED-lit glass cabinet to the ceiling. The patio door is widened to a 10 ft slider as in concept 20; the dining table moves 15 cm south for room to pass it.",
    "tags": [
      "Concept 15 layout",
      "Pantry wall",
      "Oven tower",
      "Drinks bar",
      "Two seating areas"
    ],
    "btn": "View the kitchen zones",
    "proposed": true,
    "blinds": true,
    "scope": [
      [
        "Demolition",
        [
          "Remove the existing kitchen cabinets, counters and appliances.",
          "Remove the corner gas fireplace and its angled chase; gas fitter shuts off and caps the line.",
          "Remove the kitchen-lounge wall and doorway (about 3 m) and the short angled wall at the top of the stair; patch floor and ceiling."
        ]
      ],
      [
        "Structural and framing",
        [
          "Confirm whether the kitchen-lounge wall is bearing before removal; if it is, a flush beam with posts to bearing (engineer to size) is needed (see optional costs).",
          "New short chase (about 1.9 m long, 50 cm deep) on the old wall line for the slim fireplace.",
          "Fill in the kitchen window on the east wall; widen the dining patio opening to a 10 ft (305 cm) slider with a longer header (engineer to size).",
          "Stair guard where the angled wall came out."
        ]
      ],
      [
        "Kitchen",
        [
          "Wall run on the east wall (north to south): open space beside the dining-room fireplace (finished end panel on the tower), oven tower 76 cm (30 in wall oven, built-in microwave above, drawer below), coffee station (landing beside the oven) with uppers, 76 cm induction cooktop over three pot drawers under the chimney hood, prep drawers, dishwasher, sink in the original spot, drawers to the corner.",
          "Stair-side wall: counter-depth French-door fridge with cabinet above (finished end panel on the hallway side) and a 52 cm full-height pull-out pantry, 60 cm deep. Kitchen face of the fireplace chase: two full-height pull-outs (about 58 cm, 36 cm deep); blind corner closed. Integrated finger pulls, two pot lights in front.",
          "Island 260 x 100 cm (white oak), four stools at 57 cm spacing, pull-out trash, receptacles; 116 cm work aisle to the wall run, about 150 cm from the island edge to the pantry wall.",
          "Drinks bar built in on the east wall between the patio-door corner and the dining-room fireplace (about 1 m): off-white frame and side panel to the ceiling, white-oak base and back panel, glass-door wine/beverage fridge, quartz top, bottle shelf, LED-lit glass cabinet to the ceiling.",
          "Quartz counters and backsplash; warm off-white cabinetry throughout with white-oak accents (island, bar), black hardware on the wall run."
        ]
      ],
      [
        "Plumbing",
        [
          "Sink stays on the existing drain and supply; dishwasher; fridge water line."
        ]
      ],
      [
        "Gas and fireplace",
        [
          "Slim direct-vent gas fireplace (about 38 cm deep) in the new chase facing the lounge, set flush in a plain plaster chase (no separate surround), slim dark hearth, oak shelf on the kitchen face; extend the existing gas line and vent."
        ]
      ],
      [
        "Electrical and lighting",
        [
          "40 A 240 V circuit for the cooktop, separate 240 V circuit for the wall oven, dedicated circuits for the microwave, dishwasher, fridge, beverage fridge and hood; island receptacles through the floor.",
          "Layered lighting: pot lights (including two over the pantry wall), three island pendants, linear pendant over the dining table, under-cabinet LED, bar LED, stair step lights.",
          "Teen room: desk-height receptacle with USB-C and a network drop; switched receptacle for the headboard LED."
        ]
      ],
      [
        "Millwork",
        [
          "Oak media wall around the TV in the nook.",
          "Teen room: queen storage bed, 115 cm desk, low dresser."
        ]
      ],
      [
        "Flooring and finishes",
        [
          "Engineered oak through the kitchen, dining and lounge (owner DIY).",
          "Drywall patching, prime and paint (warm off-white) (owner DIY)."
        ]
      ],
      [
        "Permits and engineering",
        [
          "Building permit (wall removal, window infill, patio opening).",
          "Gas permit by a licensed gas fitter.",
          "Electrical permit.",
          "Engineer to confirm the kitchen-lounge wall and the patio header."
        ]
      ]
    ],
    "confirm": [
      "Whether the kitchen-lounge wall is bearing (the cost assumes it is not; a beam adds the optional line).",
      "Pull-out pantry hardware for 36 cm deep units (full-extension, heavy-duty).",
      "Wall oven and microwave cut-out sizes fit a 76 cm tower.",
      "Bar clearance to the dining-room fireplace (about 20 cm) and fireplace clearances to combustible cabinetry.",
      "Dining table end to island and chairs to the bar with the real table."
    ]
  }
];
const DATA = {};
