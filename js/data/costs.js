// Rough cost estimates per concept (CAD, Metro Vancouver 2026, mid-range, incl. 15% contingency).
// One pricing pass per concept from shared unit costs; planning only.
// cat: kitchen (cabinets/counters, discountable), finish (flooring/paint/lights, DIY-able), elec (DIY-able in part),
// walls (partition removal and patching, some DIY), pro (structural, stair, fireplace, doors, appliances), cont.
const COSTS = {
 "orig": {
  "key": "orig",
  "low": 0,
  "high": 0,
  "label": "baseline, the house as it is today"
 },
 "v2": {
  "key": "v2",
  "low": 62000,
  "high": 132500,
  "items": [
   {
    "item": "Remove 4.8 m dividing wall: flush beam, posts to footing, engineer",
    "low": 12000,
    "high": 25000,
    "cat": "pro"
   },
   {
    "item": "Remove corner fireplace and chase (cap gas, remove flue) and stair-landing wall; reroute wiring/ducts",
    "low": 4500,
    "high": 12000,
    "cat": "pro"
   },
   {
    "item": "Rebuild stair: upper flight turned to land in kitchen, new floor opening, floor over old opening",
    "low": 15000,
    "high": 35000,
    "cat": "pro"
   },
   {
    "item": "Glass guards with metal rail along new opening (~6 m)",
    "low": 3000,
    "high": 6000,
    "cat": "pro"
   },
   {
    "item": "Kitchen tie-in where stair arrives (cabinet adjustments, patching)",
    "low": 2000,
    "high": 6000,
    "cat": "pro"
   },
   {
    "item": "Continuous engineered oak flooring across opened area (~800 sq ft)",
    "low": 8000,
    "high": 13000,
    "cat": "finish"
   },
   {
    "item": "Paint upper floor and ~8 new pot lights",
    "low": 7000,
    "high": 12000,
    "cat": "finish"
   },
   {
    "item": "Permits, stair designer, structural review",
    "low": 2500,
    "high": 6000,
    "cat": "pro"
   },
   {
    "item": "Contingency (15%)",
    "low": 8000,
    "high": 17500,
    "cat": "cont"
   }
  ],
  "optional": [],
  "notes": "Biggest drivers are the stair relocation and the engineered beam for the 4.8 m opening. Main uncertainty is the tight stair landing, which needs a stair designer and may force more reframing than assumed."
 },
 "v7": {
  "key": "v7",
  "low": 56000,
  "high": 128000,
  "items": [
   {
    "item": "Remove the 4.8 m dividing wall with a flush beam and posts (assumed bearing, engineer included)",
    "low": 10000,
    "high": 25000,
    "cat": "pro"
   },
   {
    "item": "Remove the corner fireplace and chase (cap gas, deal with flue, patch)",
    "low": 2000,
    "high": 6000,
    "cat": "pro"
   },
   {
    "item": "Rebuild the stair so the upper flight lands in the kitchen, remove the stair-landing wall, floor over the old opening",
    "low": 17000,
    "high": 39000,
    "cat": "pro"
   },
   {
    "item": "Glass guards with metal rail along the new stair opening (about 4-6 m)",
    "low": 2000,
    "high": 6000,
    "cat": "pro"
   },
   {
    "item": "Engineered oak flooring across the opened-up living area and over the old stair opening",
    "low": 6500,
    "high": 13000,
    "cat": "finish"
   },
   {
    "item": "Paint the whole upper floor",
    "low": 5000,
    "high": 9000,
    "cat": "finish"
   },
   {
    "item": "Electrical: move switches and outlets out of removed walls, TV wall power and cable conduit, about 6 pot lights",
    "low": 3000,
    "high": 6500,
    "cat": "finish"
   },
   {
    "item": "Stair designer, permits and inspections",
    "low": 3000,
    "high": 7000,
    "cat": "pro"
   },
   {
    "item": "Contingency (15%)",
    "low": 7500,
    "high": 16500,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "Wall-mounted TV and low media unit",
    "low": 2000,
    "high": 5000
   },
   {
    "item": "Sofa, round table, lounge chairs, rug and plants",
    "low": 4000,
    "high": 10000
   }
  ],
  "notes": "The biggest costs are rebuilding the stair and the beam for the 4.8 m wall, which is assumed to be load-bearing. The main uncertainty is the tight stair landing: a stair designer has to confirm it works, and it could push the stair cost toward the high end."
 },
 "v9": {
  "key": "v9",
  "low": 114500,
  "high": 242000,
  "items": [
   {
    "item": "Remove 4.8 m dividing wall (beam, posts, engineer) and stair-landing wall",
    "low": 10000,
    "high": 29000,
    "cat": "pro"
   },
   {
    "item": "Remove corner fireplace and chase (cap gas, flue, patch)",
    "low": 2000,
    "high": 6000,
    "cat": "pro"
   },
   {
    "item": "Relocate upper stair flight to land in kitchen, floor over old opening, glass guards, stair designer",
    "low": 17500,
    "high": 40000,
    "cat": "pro"
   },
   {
    "item": "Kitchen remodel: about 7 m base cabinets, uppers, oven/pantry tower, 2.8 m island, quartz, backsplash, sink at existing window plumbing, lighting",
    "low": 40000,
    "high": 75000,
    "cat": "kitchen"
   },
   {
    "item": "Appliance package: induction range, hood, fridge, dishwasher, wall oven",
    "low": 8000,
    "high": 18000,
    "cat": "pro"
   },
   {
    "item": "New electrical in the floor for the island",
    "low": 3000,
    "high": 6000,
    "cat": "elec"
   },
   {
    "item": "Second pantry tower plus bar with beverage fridge by the patio doors",
    "low": 4000,
    "high": 8000,
    "cat": "kitchen"
   },
   {
    "item": "Engineered oak flooring across the opened area, paint upper floor, pot lights, TV wall power",
    "low": 15000,
    "high": 28500,
    "cat": "finish"
   },
   {
    "item": "Contingency (15%)",
    "low": 15000,
    "high": 31500,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "Furniture and decor: sofa, round table, lounge chairs, low media unit, TV, plants",
    "low": 5000,
    "high": 15000
   }
  ],
  "notes": "Biggest drivers are the kitchen cabinetry and the structural work: the 4.8 m wall opening and the relocated stair flight. Main uncertainty is the stair, whose tight landing still needs a stair designer, and whether the dividing wall is bearing."
 },
 "v10": {
  "key": "v10",
  "low": 89500,
  "high": 175000,
  "items": [
   {
    "item": "Remove non-bearing partitions (4.8 m kitchen/living wall and small room at stair top), patch",
    "low": 5000,
    "high": 12000,
    "cat": "walls"
   },
   {
    "item": "Remove corner gas fireplace and chase (cap gas, abandon flue, patch)",
    "low": 2000,
    "high": 6000,
    "cat": "pro"
   },
   {
    "item": "Full kitchen remodel, mid-range (about 7 m base cabinets, uppers, oven tower, quartz, sink at existing window plumbing, lighting)",
    "low": 40000,
    "high": 75000,
    "cat": "kitchen"
   },
   {
    "item": "Second pantry tower and beverage bar with fridge by patio doors",
    "low": 5500,
    "high": 11000,
    "cat": "kitchen"
   },
   {
    "item": "Appliance package (induction range, hood, fridge, dishwasher)",
    "low": 8000,
    "high": 18000,
    "cat": "pro"
   },
   {
    "item": "Island 2.8 m: new electrical through the floor (no plumbing)",
    "low": 3000,
    "high": 6000,
    "cat": "elec"
   },
   {
    "item": "Engineered oak flooring across the opened living area (about 700 sq ft)",
    "low": 7000,
    "high": 11000,
    "cat": "finish"
   },
   {
    "item": "Paint upper floor, about 8 pot lights, power and data for TV on alcove wall",
    "low": 7500,
    "high": 13000,
    "cat": "finish"
   },
   {
    "item": "Contingency (15%)",
    "low": 11500,
    "high": 23000,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "Furniture and decor (sofa, round table, lounge chairs, low media unit, plants)",
    "low": 5000,
    "high": 15000
   }
  ],
  "notes": "The kitchen and appliances are about two thirds of the cost; the structural work is cheap because only partitions and the fireplace come out. The main risk is that one of the walls turns out to be load-bearing once opened, which would add $8-25k per opening for a beam and engineer."
 },
 "v11": {
  "key": "v11",
  "low": 91500,
  "high": 180000,
  "items": [
   {
    "item": "Full kitchen remodel: about 7 m of base cabinets, uppers, oak oven tower, quartz, backsplash, sink at the existing window plumbing, plus 2 tall pantry towers",
    "low": 43000,
    "high": 81000,
    "cat": "kitchen"
   },
   {
    "item": "Appliance package (induction range, hood, fridge, dishwasher)",
    "low": 8000,
    "high": 18000,
    "cat": "pro"
   },
   {
    "item": "Island power in the floor, plus a bar with a beverage fridge by the patio doors",
    "low": 5500,
    "high": 11000,
    "cat": "elec"
   },
   {
    "item": "Remove the non-bearing partitions at the stair-top room; rebuild the kitchen-lounge wall with a wide cased opening",
    "low": 6000,
    "high": 14000,
    "cat": "walls"
   },
   {
    "item": "Remove the corner gas fireplace (cap gas, deal with flue, patch)",
    "low": 2000,
    "high": 6000,
    "cat": "pro"
   },
   {
    "item": "Engineered oak flooring across kitchen, dining and patched wall lines (about 550 sq ft)",
    "low": 6000,
    "high": 10000,
    "cat": "finish"
   },
   {
    "item": "Paint the upper floor, about 10 pot lights, TV wall power and mount in the alcove",
    "low": 8000,
    "high": 14000,
    "cat": "finish"
   },
   {
    "item": "Permits (non-structural renovation, electrical, gas)",
    "low": 1000,
    "high": 2500,
    "cat": "pro"
   },
   {
    "item": "Contingency (15%)",
    "low": 12000,
    "high": 23500,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "Furniture and decor: dining table, sofa, lounge chairs, low media unit, plants, art",
    "low": 5000,
    "high": 15000
   }
  ],
  "notes": "The kitchen cabinets and counters account for about half the cost, and appliances are the next biggest item. The main unknown is whether the partitions at the stair top and around the old fireplace really are non-bearing; if any of them turns out to be bearing, add $8-25k per opening."
 },
 "v12": {
  "key": "v12",
  "low": 99500,
  "high": 175000,
  "items": [
   {
    "item": "Remove non-bearing partitions (kitchen-living wall, small room at stair top), patch",
    "low": 3000,
    "high": 8000,
    "cat": "walls"
   },
   {
    "item": "Remove corner gas fireplace and chase (cap gas, abandon flue, patch)",
    "low": 2000,
    "high": 6000,
    "cat": "pro"
   },
   {
    "item": "Full kitchen remodel: ~7 m base cabinets, uppers, oven tower and 2 pantry towers, 2.8 m island, quartz, backsplash, sink at window, lighting",
    "low": 50000,
    "high": 75000,
    "cat": "kitchen"
   },
   {
    "item": "Appliance package (induction range, hood, fridge, dishwasher, wall oven)",
    "low": 8000,
    "high": 18000,
    "cat": "pro"
   },
   {
    "item": "Island floor electrical plus bar with beverage fridge by patio doors",
    "low": 5500,
    "high": 11000,
    "cat": "elec"
   },
   {
    "item": "Engineered oak flooring across the open great room (~550 sq ft)",
    "low": 5500,
    "high": 9000,
    "cat": "finish"
   },
   {
    "item": "Paint upper floor and ~10 pot lights",
    "low": 7500,
    "high": 13000,
    "cat": "finish"
   },
   {
    "item": "Built-in media wall: floating console, shelving both sides, TV mount, power/data",
    "low": 5000,
    "high": 12000,
    "cat": "pro"
   },
   {
    "item": "Contingency (15%)",
    "low": 13000,
    "high": 23000,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "L-shaped sectional, lounge chair, rugs and decor",
    "low": 5000,
    "high": 12000
   }
  ],
  "notes": "The kitchen (cabinetry and appliances) is about two thirds of the cost; no structural work is assumed because only partitions come out. The main uncertainty is whether the removed walls really are non-bearing, which needs to be confirmed on site."
 },
 "v15": {
  "key": "v15",
  "low": 115000,
  "high": 207000,
  "items": [
   {
    "item": "Take out the non-bearing partitions and the old corner fireplace; rebuild the kitchen-lounge wall with a wide cased opening",
    "low": 7000,
    "high": 18000,
    "cat": "walls"
   },
   {
    "item": "Zoned kitchen remodel: cabinets incl. coffee station, dry-pantry run with appliance garage, quartz, backsplash, lighting",
    "low": 50000,
    "high": 80000,
    "cat": "kitchen"
   },
   {
    "item": "Tall pantry and oven tower units",
    "low": 3000,
    "high": 6000,
    "cat": "kitchen"
   },
   {
    "item": "Appliance package incl. wall oven",
    "low": 9000,
    "high": 20000,
    "cat": "pro"
   },
   {
    "item": "Island prep sink with plumbing, pull-out waste and floor electrical",
    "low": 5000,
    "high": 10000,
    "cat": "pro"
   },
   {
    "item": "New linear gas fireplace in the kitchen-lounge wall (framed chase, vent, gas line, surround)",
    "low": 12000,
    "high": 22000,
    "cat": "pro"
   },
   {
    "item": "Engineered oak flooring in open areas, paint upper floor, pot lights, TV power/blocking",
    "low": 14000,
    "high": 24000,
    "cat": "finish"
   },
   {
    "item": "Contingency (15%)",
    "low": 15000,
    "high": 27000,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "Two lounge chairs facing the fireplace and other furniture/decor",
    "low": 2000,
    "high": 6000
   }
  ],
  "notes": "The kitchen cabinetry (extra pantry run and tall towers) and the new vented gas fireplace drive the cost. Main uncertainty is whether the removed partitions are truly non-bearing and how the fireplace vent can be routed from an interior wall."
 },
 "v16": {
  "key": "v16",
  "low": 114000,
  "high": 217000,
  "items": [
   {
    "item": "Remove non-bearing partitions and the old corner fireplace/chase (cap gas, flue, patch)",
    "low": 5000,
    "high": 14000,
    "cat": "walls"
   },
   {
    "item": "Rebuild kitchen-lounge wall with wide cased opening",
    "low": 3000,
    "high": 7000,
    "cat": "walls"
   },
   {
    "item": "Kitchen remodel: one-wall run, slim island with oak end panels, warm-white full-height uppers, oak open shelves, pantry/oven tower, dry-pantry run with appliance garage",
    "low": 49000,
    "high": 84000,
    "cat": "kitchen"
   },
   {
    "item": "Appliance package (induction range, chimney hood, fridge, dishwasher)",
    "low": 8000,
    "high": 18000,
    "cat": "pro"
   },
   {
    "item": "Island services: prep sink plumbing and floor electrical",
    "low": 5000,
    "high": 10000,
    "cat": "pro"
   },
   {
    "item": "New double-sided gas fireplace with chase, venting, gas line and surrounds",
    "low": 12000,
    "high": 25000,
    "cat": "pro"
   },
   {
    "item": "Engineered oak flooring, paint upper floor, pot lights",
    "low": 15500,
    "high": 26000,
    "cat": "finish"
   },
   {
    "item": "Under-stair closet fit-out and TV nook wall mount/wiring",
    "low": 1500,
    "high": 4500,
    "cat": "pro"
   },
   {
    "item": "Contingency (15%)",
    "low": 15000,
    "high": 28500,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "Furniture and decor: L-sofa, lounge chairs, four art pieces, TV",
    "low": 6000,
    "high": 15000
   }
  ],
  "notes": "Biggest drivers are the kitchen cabinetry/finishes and the new double-sided gas fireplace with its chase and venting. Main uncertainty is whether the partitions removed are truly non-bearing and how far the fireplace vent must run."
 },
 "v17": {
  "key": "v17",
  "low": 123000,
  "high": 240500,
  "items": [
   {
    "item": "Remove non-bearing partitions and old corner fireplace/chase, rebuild kitchen-lounge wall with wide cased opening",
    "low": 9000,
    "high": 22000,
    "cat": "walls"
   },
   {
    "item": "Kitchen remodel: greige lowers, warm-white uppers to the hood, oak island, open shelves, pantry/oven tower, dry-pantry run, quartz, under-cabinet lighting",
    "low": 45000,
    "high": 75000,
    "cat": "kitchen"
   },
   {
    "item": "Island prep sink plumbing and floor electrical",
    "low": 5000,
    "high": 10000,
    "cat": "pro"
   },
   {
    "item": "Appliance package (induction range, chimney hood, fridge, dishwasher)",
    "low": 8000,
    "high": 18000,
    "cat": "pro"
   },
   {
    "item": "Double-sided gas fireplace with chase, venting, gas line, natural-stone surrounds both faces",
    "low": 15000,
    "high": 33000,
    "cat": "pro"
   },
   {
    "item": "Oak media wall around TV in the nook",
    "low": 4000,
    "high": 10000,
    "cat": "pro"
   },
   {
    "item": "Stair feature: new guard, step lights, under-stair closet fit-out",
    "low": 4000,
    "high": 11500,
    "cat": "pro"
   },
   {
    "item": "Engineered oak flooring, warm off-white paint, pot lights and linear dining pendant (upper floor)",
    "low": 17000,
    "high": 29500,
    "cat": "finish"
   },
   {
    "item": "Contingency (15%)",
    "low": 16000,
    "high": 31500,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "Stair-top wedge winders added to the existing top flight",
    "low": 8000,
    "high": 15000
   },
   {
    "item": "Furniture and decor: L-sofa, lounge chairs, rugs, four art pieces (existing dining table reused)",
    "low": 6000,
    "high": 15000
   }
  ],
  "notes": "Biggest costs are the kitchen cabinetry and the double-sided gas fireplace with stone surrounds; no bearing walls are touched, so the main uncertainty is confirming on site that the removed walls really are non-bearing, plus the finish level of cabinets and stone."
 },
 "v18": {
  "key": "v18",
  "low": 157000,
  "high": 292000,
  "items": [
   {
    "item": "Remove partitions and old corner fireplace (cap gas, flue), rebuild kitchen-lounge wall with cased opening",
    "low": 7000,
    "high": 17000,
    "cat": "walls"
   },
   {
    "item": "Remove bearing hall-kitchen wall: engineered flush beam, posts to footing, engineer, permits",
    "low": 10000,
    "high": 25000,
    "cat": "pro"
   },
   {
    "item": "Stair rebuild with three winders, new floor opening, floor over old stairwell, glass guards, under-stair closet off foyer",
    "low": 20000,
    "high": 42000,
    "cat": "pro"
   },
   {
    "item": "Full kitchen remodel in zones: cabinets, pantry/oven towers, quartz, prep-sink island with floor electrical, oak accents",
    "low": 55000,
    "high": 85000,
    "cat": "kitchen"
   },
   {
    "item": "Appliance package plus beverage fridge bar",
    "low": 10500,
    "high": 23000,
    "cat": "pro"
   },
   {
    "item": "New single-sided gas fireplace on lounge west wall: chase, venting, gas line, stone surround",
    "low": 12000,
    "high": 22000,
    "cat": "pro"
   },
   {
    "item": "Oak media wall built-in around TV nook",
    "low": 4000,
    "high": 10000,
    "cat": "pro"
   },
   {
    "item": "Engineered oak flooring, paint upper floor, pot lights, under-cabinet and step lighting",
    "low": 18000,
    "high": 30000,
    "cat": "finish"
   },
   {
    "item": "Contingency (15%)",
    "low": 20500,
    "high": 38000,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "Furniture and decor: L-sofa, two fireside chairs, rugs, art, plants",
    "low": 6000,
    "high": 15000
   }
  ],
  "notes": "Biggest drivers are the full kitchen, the stair rebuild with a new floor opening, and the engineered beam for the bearing hall wall. Main uncertainty is the structure around the stair and hall wall, which needs an engineer and stair designer before the price firms up."
 },
 "v21": {
  "key": "v21",
  "low": 157000,
  "high": 331000,
  "items": [
   {
    "item": "Kitchen remodel: cabinets, quartz, island with prep sink and floor power, 1.6 m pull-out pantry wall, oak accents, under-cabinet lights",
    "low": 50000,
    "high": 90000,
    "cat": "kitchen"
   },
   {
    "item": "Appliance package plus bar with beverage fridge",
    "low": 10500,
    "high": 23000,
    "cat": "pro"
   },
   {
    "item": "Upper-floor walls: remove partitions and old corner fireplace, rebuild kitchen-lounge wall with cased opening, widen west hall",
    "low": 10000,
    "high": 30000,
    "cat": "walls"
   },
   {
    "item": "Remove bearing hall-kitchen wall: engineered beam, posts to footing, engineer and permits",
    "low": 8000,
    "high": 25000,
    "cat": "pro"
   },
   {
    "item": "Double-sided gas fireplace with chase, venting, gas line and natural-stone surrounds",
    "low": 15000,
    "high": 31000,
    "cat": "pro"
   },
   {
    "item": "New compact L-stair: new floor opening, floor over old stairwell, walls cut to soffit, glass guard, step lights",
    "low": 18000,
    "high": 41000,
    "cat": "pro"
   },
   {
    "item": "Ground floor: move foyer-office wall 20 cm, walk-in bulk pantry fit-out, utility passage with linen cupboard",
    "low": 6000,
    "high": 14000,
    "cat": "pro"
   },
   {
    "item": "Finishes: engineered oak flooring (~800 sq ft), paint upper floor, pot lights and pendant, oak media wall",
    "low": 19000,
    "high": 34000,
    "cat": "finish"
   },
   {
    "item": "Contingency (15%)",
    "low": 20500,
    "high": 43000,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "Furniture and decor: L-sofa, lounge chairs, four art pieces, rugs",
    "low": 8000,
    "high": 20000
   },
   {
    "item": "Chest freezer for bulk pantry",
    "low": 500,
    "high": 1000
   }
  ],
  "notes": "The biggest costs are the full kitchen, the new L-stair with a new floor opening, and the beam where the bearing hall wall comes out. The main uncertainty is the stair: a new opening and a beam both need engineering, and the walls and floor framing could turn out more complicated once they are opened up."
 },
 "v22": {
  "key": "v22",
  "low": 141500,
  "high": 291000,
  "items": [
   {
    "item": "Kitchen remodel: cabinets, quartz, island moved north with floor power and prep sink, pantry/oven tower, beverage bar",
    "low": 50000,
    "high": 90000,
    "cat": "kitchen"
   },
   {
    "item": "Appliance package (induction range, hood, fridge, dishwasher)",
    "low": 8000,
    "high": 18000,
    "cat": "pro"
   },
   {
    "item": "Stair rework: new 45-degree winder and 5-step upper flight into kitchen, floor over old opening, wall tops cut to soffit, glass guard, under-stair closet",
    "low": 18000,
    "high": 41000,
    "cat": "pro"
   },
   {
    "item": "Remove bearing hall-kitchen wall with engineered beam, posts, permits; remove small stair-top partitions",
    "low": 10000,
    "high": 29000,
    "cat": "pro"
   },
   {
    "item": "Walk-in pantry 1.0 x 1.0 m: framing, door, shelving on two walls",
    "low": 3000,
    "high": 7000,
    "cat": "pro"
   },
   {
    "item": "Double-sided gas fireplace replacing corner unit in kitchen-lounge wall, venting, natural-stone surrounds",
    "low": 14000,
    "high": 28000,
    "cat": "pro"
   },
   {
    "item": "Oak media wall around TV in alcove nook",
    "low": 4000,
    "high": 10000,
    "cat": "pro"
   },
   {
    "item": "Upper-floor engineered oak flooring, paint, pot lights, pendant, under-cabinet and step lights",
    "low": 16000,
    "high": 30000,
    "cat": "finish"
   },
   {
    "item": "Contingency (15%)",
    "low": 18500,
    "high": 38000,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "Furniture and decor (L-sofa, fireside chairs, art, rugs, plants)",
    "low": 6000,
    "high": 15000
   }
  ],
  "notes": "Biggest drivers are the kitchen, the stair rework with the new winder and floor-over, and the engineered beam for the hall-kitchen wall. Main uncertainty is the stair: the single 45-degree winder needs stair-builder and inspector sign-off, and the beam size depends on what the wall actually carries."
 },
 "v23": {
  "key": "v23",
  "low": 120000,
  "high": 248000,
  "items": [
   {
    "item": "Full kitchen remodel (cabinets, quartz, backsplash, sink, lighting) with 2.8 m island and floor electrical",
    "low": 43000,
    "high": 81000,
    "cat": "kitchen"
   },
   {
    "item": "Appliance package (range, hood, fridge, dishwasher)",
    "low": 8000,
    "high": 18000,
    "cat": "pro"
   },
   {
    "item": "Two full-height pantry units plus bar with beverage fridge",
    "low": 5500,
    "high": 11000,
    "cat": "kitchen"
   },
   {
    "item": "Remove fireplace and chase, take out partitions, extend kitchen-lounge wall, new 107 cm half wall with oak cap",
    "low": 6500,
    "high": 17000,
    "cat": "walls"
   },
   {
    "item": "Replace two likely-bearing stairwell walls (1.6 m and 1.2 m) with beams, posts, engineer, permit and glass railings with black top rail",
    "low": 17500,
    "high": 43000,
    "cat": "pro"
   },
   {
    "item": "10 ft patio slider replacing existing door, incl. longer header",
    "low": 6000,
    "high": 12000,
    "cat": "pro"
   },
   {
    "item": "1.2 m fire-rated self-closing double doors from garage to under-stair storage, plus storage fit-out",
    "low": 4000,
    "high": 9000,
    "cat": "pro"
   },
   {
    "item": "Flooring, paint, pot lights and window bench in the open area",
    "low": 14000,
    "high": 24500,
    "cat": "finish"
   },
   {
    "item": "Contingency (15%)",
    "low": 15500,
    "high": 32500,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "75 in TV and mount, large sofa with chaise, four bar stools",
    "low": 6000,
    "high": 14000
   }
  ],
  "notes": "The kitchen and the two beam openings at the stairwell drive most of the cost. The main uncertainty is whether those stairwell walls really are bearing and what the engineer specifies for beams and posts."
 },
 "v24": {
  "key": "v23",
  "low": 129000.0,
  "high": 264000.0,
  "items": [
   {
    "item": "Full kitchen remodel (cabinets, quartz, backsplash, sink, lighting) with 2.8 m island and floor electrical",
    "low": 43000,
    "high": 81000,
    "cat": "kitchen"
   },
   {
    "item": "Appliance package (range, hood, fridge, dishwasher)",
    "low": 8000,
    "high": 18000,
    "cat": "pro"
   },
   {
    "item": "Two full-height pantry units plus bar with beverage fridge",
    "low": 5500,
    "high": 11000,
    "cat": "kitchen"
   },
   {
    "item": "Remove fireplace and chase, take out partitions, extend kitchen-lounge wall, new 107 cm half wall with oak cap",
    "low": 6500,
    "high": 17000,
    "cat": "walls"
   },
   {
    "item": "Replace two likely-bearing stairwell walls (1.6 m and 1.2 m) with beams, posts, engineer, permit and glass railings with black top rail",
    "low": 17500,
    "high": 43000,
    "cat": "pro"
   },
   {
    "item": "10 ft patio slider replacing existing door, incl. longer header",
    "low": 6000,
    "high": 12000,
    "cat": "pro"
   },
   {
    "item": "1.2 m fire-rated self-closing double doors from garage to under-stair storage, plus storage fit-out",
    "low": 4000,
    "high": 9000,
    "cat": "pro"
   },
   {
    "item": "Flooring, paint, pot lights and window bench in the open area",
    "low": 14000,
    "high": 24500,
    "cat": "finish"
   },
   {
    "item": "Oven tower: 30 in wall oven, built-in microwave, tall cabinet (cooktop replaces the range)",
    "low": 4000,
    "high": 7000,
    "cat": "kitchen"
   },
   {
    "item": "Drinks bar: oak base, wine/beverage fridge, quartz top, glass-front upper, LED",
    "low": 3000,
    "high": 5500,
    "cat": "kitchen"
   },
   {
    "item": "Wall-oven circuit, bar receptacle and LED, island trivet inset",
    "low": 800,
    "high": 1600,
    "cat": "elec"
   },
   {
    "item": "Contingency (15%)",
    "low": 16800.0,
    "high": 34400.0,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "75 in TV and mount, large sofa with chaise, four bar stools",
    "low": 6000,
    "high": 14000
   },
   {
    "item": "Fireplace option in the kitchen-lounge separator (unit, chase, gas, venting, surround)",
    "low": 7000,
    "high": 13000,
    "cat": "pro"
   }
  ],
  "notes": "The kitchen and the two beam openings at the stairwell drive most of the cost. The main uncertainty is whether those stairwell walls really are bearing and what the engineer specifies for beams and posts."
 },
 "v25": {
  "low": 101000.0,
  "high": 194000.0,
  "items": [
   {
    "item": "Kitchen: cabinets, quartz, island, oven/microwave tower, tall cabinet, backsplash, sink",
    "low": 38000,
    "high": 72000,
    "cat": "kitchen"
   },
   {
    "item": "Appliances: induction cooktop, wall oven, built-in microwave, counter-depth fridge, dishwasher, island hood",
    "low": 11000,
    "high": 22000,
    "cat": "pro"
   },
   {
    "item": "Drinks bar: base, wine/beverage fridge, quartz, glass upper",
    "low": 3000,
    "high": 5500,
    "cat": "kitchen"
   },
   {
    "item": "Remove the corner fireplace and chase, slim direct-vent fireplace in the wall (unit, gas extension, vent offset, surround)",
    "low": 9000,
    "high": 17000,
    "cat": "pro"
   },
   {
    "item": "Walk-in pantry: framing, pocket door, shelving",
    "low": 3500,
    "high": 7000,
    "cat": "walls"
   },
   {
    "item": "Widen the kitchen-lounge opening to 1.8 m full height (flush beam if the wall is bearing)",
    "low": 2500,
    "high": 7000,
    "cat": "pro"
   },
   {
    "item": "Island hood ducting through the attic, make-up air if needed",
    "low": 2500,
    "high": 5000,
    "cat": "pro"
   },
   {
    "item": "Fill in the kitchen window",
    "low": 1500,
    "high": 3000,
    "cat": "pro"
   },
   {
    "item": "Electrical: cooktop and oven circuits, island power through the floor, lighting",
    "low": 5000,
    "high": 9000,
    "cat": "elec"
   },
   {
    "item": "Flooring, paint, drywall patching, caulking",
    "low": 9000,
    "high": 16000,
    "cat": "finish"
   },
   {
    "item": "Teen room: electrical drop and sound insulation",
    "low": 600,
    "high": 1400,
    "cat": "finish"
   },
   {
    "item": "Permits and engineering",
    "low": 2000,
    "high": 4000,
    "cat": "pro"
   },
   {
    "item": "Contingency (15%)",
    "low": 13100.0,
    "high": 25300.0,
    "cat": "cont"
   }
  ],
  "optional": [],
  "notes": "Keeps the original walls and stair, so no beams or stair work."
 },
 "v26": {
  "low": 136000.0,
  "high": 260000.0,
  "items": [
   {
    "item": "Kitchen: cabinets, quartz, white-oak island, oven tower cabinet, pantry wall (3 full-height pull-outs, integrated pulls), backsplash",
    "low": 47000,
    "high": 80000,
    "cat": "kitchen"
   },
   {
    "item": "Appliances: induction cooktop, 30 in wall oven, built-in microwave, counter-depth fridge, dishwasher, chimney hood",
    "low": 11000,
    "high": 22000,
    "cat": "pro"
   },
   {
    "item": "Drinks bar built-in: off-white frame to the ceiling, white-oak base and back panel, wine/beverage fridge, quartz, lit glass cabinet",
    "low": 4000,
    "high": 7500,
    "cat": "kitchen"
   },
   {
    "item": "Remove the kitchen-lounge wall, old corner fireplace/chase and angled stair wall; build the short fireplace chase",
    "low": 9000,
    "high": 22000,
    "cat": "walls"
   },
   {
    "item": "Slim direct-vent gas fireplace in the new chase (unit, gas extension, vent, plaster finish, hearth)",
    "low": 9000,
    "high": 17000,
    "cat": "pro"
   },
   {
    "item": "Island floor electrical",
    "low": 1500,
    "high": 3000,
    "cat": "elec"
   },
   {
    "item": "Oak media wall around the TV in the nook",
    "low": 4000,
    "high": 10000,
    "cat": "pro"
   },
   {
    "item": "Stair: new guard, step lights, under-stair closet fit-out",
    "low": 4000,
    "high": 11500,
    "cat": "pro"
   },
   {
    "item": "Fill in the kitchen window",
    "low": 1500,
    "high": 3000,
    "cat": "pro"
   },
   {
    "item": "10 ft patio slider replacing the existing door, incl. longer header",
    "low": 6000,
    "high": 12000,
    "cat": "pro"
   },
   {
    "item": "Electrical: cooktop, oven, bar and pantry-light circuits",
    "low": 1500,
    "high": 3000,
    "cat": "elec"
   },
   {
    "item": "Engineered oak flooring, paint, pot lights and linear dining pendant",
    "low": 17000,
    "high": 29500,
    "cat": "finish"
   },
   {
    "item": "Teen room: electrical drop and sound insulation",
    "low": 600,
    "high": 1400,
    "cat": "finish"
   },
   {
    "item": "Permits and engineering",
    "low": 2000,
    "high": 4000,
    "cat": "pro"
   },
   {
    "item": "Contingency (15%)",
    "low": 17700.0,
    "high": 33900.0,
    "cat": "cont"
   }
  ],
  "optional": [
   {
    "item": "Flush beam and posts if the kitchen-lounge wall proves bearing (engineer, install, patch)",
    "low": 12000,
    "high": 25000
   }
  ],
  "notes": "Same structural scope as concept 15: the kitchen-lounge wall comes out, assumed non-bearing. Concept 21 keeps every wall and avoids that risk."
 }
};
