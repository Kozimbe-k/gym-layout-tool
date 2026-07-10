# Equipment sprites

Top-view equipment images (e.g. official Matrix product top views) go in this
folder. The canvas uses them automatically instead of the built-in vector
symbols; anything without a sprite keeps the vector fallback.

Rules:

- **Format**: PNG with transparent background
- **Orientation**: landscape — equipment length runs left-to-right
- **Size**: any; it is scaled to the item's real footprint on the canvas
- **Naming**: the equipment name from the catalog, lowercased, with every run
  of non-alphanumeric characters replaced by `-`

Current catalog names and their expected file names:

| Equipment name             | File                           |
| -------------------------- | ------------------------------ |
| Treadmill                  | `treadmill.png`                |
| Elliptical                 | `elliptical.png`               |
| Upright Exercise Bike      | `upright-exercise-bike.png`    |
| Rowing Machine             | `rowing-machine.png`           |
| Stair Climber              | `stair-climber.png`            |
| Power Rack                 | `power-rack.png`               |
| Adjustable Bench           | `adjustable-bench.png`         |
| Dumbbell Rack (set)        | `dumbbell-rack-set.png`        |
| Olympic Lifting Platform   | `olympic-lifting-platform.png` |
| Smith Machine              | `smith-machine.png`            |
| Cable Crossover Station    | `cable-crossover-station.png`  |
| Leg Press Machine          | `leg-press-machine.png`        |
| Lat Pulldown Machine       | `lat-pulldown-machine.png`     |
| Chest Press Machine        | `chest-press-machine.png`      |
| Leg Extension/Curl Machine | `leg-extension-curl-machine.png` |
| Turf Sprint Lane           | `turf-sprint-lane.png`         |
| Battle Ropes Station       | `battle-ropes-station.png`     |
| Plyo Box Set               | `plyo-box-set.png`             |
| Suspension Trainer Station | `suspension-trainer-station.png` |
| Kettlebell Rack            | `kettlebell-rack.png`          |
| Stretching Mat Area        | `stretching-mat-area.png`      |
| Foam Roller Station        | `foam-roller-station.png`      |
| Massage Chair              | `massage-chair.png`            |

When the real Matrix catalog replaces these placeholders, the same rule
applies to the new names.
