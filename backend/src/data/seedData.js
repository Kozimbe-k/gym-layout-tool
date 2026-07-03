// Placeholder catalog mirroring phase1/equipment-recommendation-model.xlsx.
// Swap in real Matrix Fitness product data later — the shape stays the same.

export const spaceTypes = [
  { zone: 'Cardio Zone', area_pct: 0.3, description: 'Treadmills, ellipticals, bikes, rowers, stair climbers' },
  { zone: 'Free Weight Zone', area_pct: 0.25, description: 'Racks, benches, dumbbells, barbells, Smith machine' },
  { zone: 'Machine Zone', area_pct: 0.2, description: 'Selectorized strength machines, cable stations' },
  { zone: 'Functional Zone', area_pct: 0.15, description: 'Turf, battle ropes, plyo boxes, suspension trainers' },
  { zone: 'Recovery Zone', area_pct: 0.1, description: 'Stretching mats, foam rolling, massage chairs' },
]

export const equipment = [
  { zone: 'Cardio Zone', name: 'Treadmill', priority: 1, length_m: 2.2, width_m: 0.9, clearance_m: 0.6 },
  { zone: 'Cardio Zone', name: 'Elliptical', priority: 2, length_m: 1.8, width_m: 0.7, clearance_m: 0.5 },
  { zone: 'Cardio Zone', name: 'Upright Exercise Bike', priority: 3, length_m: 1.2, width_m: 0.6, clearance_m: 0.4 },
  { zone: 'Cardio Zone', name: 'Rowing Machine', priority: 4, length_m: 2.4, width_m: 0.6, clearance_m: 0.5 },
  { zone: 'Cardio Zone', name: 'Stair Climber', priority: 5, length_m: 1.5, width_m: 0.9, clearance_m: 0.5 },
  { zone: 'Free Weight Zone', name: 'Power Rack', priority: 1, length_m: 1.5, width_m: 1.5, clearance_m: 1.0 },
  { zone: 'Free Weight Zone', name: 'Adjustable Bench', priority: 2, length_m: 1.3, width_m: 0.6, clearance_m: 0.6 },
  { zone: 'Free Weight Zone', name: 'Dumbbell Rack (set)', priority: 3, length_m: 2.0, width_m: 0.6, clearance_m: 0.8 },
  { zone: 'Free Weight Zone', name: 'Olympic Lifting Platform', priority: 4, length_m: 2.4, width_m: 1.2, clearance_m: 1.0 },
  { zone: 'Free Weight Zone', name: 'Smith Machine', priority: 5, length_m: 1.8, width_m: 1.3, clearance_m: 0.8 },
  { zone: 'Machine Zone', name: 'Cable Crossover Station', priority: 1, length_m: 2.5, width_m: 1.5, clearance_m: 1.0 },
  { zone: 'Machine Zone', name: 'Leg Press Machine', priority: 2, length_m: 2.2, width_m: 1.5, clearance_m: 0.8 },
  { zone: 'Machine Zone', name: 'Lat Pulldown Machine', priority: 3, length_m: 1.5, width_m: 1.2, clearance_m: 0.6 },
  { zone: 'Machine Zone', name: 'Chest Press Machine', priority: 4, length_m: 1.5, width_m: 1.3, clearance_m: 0.6 },
  { zone: 'Machine Zone', name: 'Leg Extension/Curl Machine', priority: 5, length_m: 1.6, width_m: 1.2, clearance_m: 0.6 },
  { zone: 'Functional Zone', name: 'Turf Sprint Lane', priority: 1, length_m: 6.0, width_m: 1.5, clearance_m: 0.5 },
  { zone: 'Functional Zone', name: 'Battle Ropes Station', priority: 2, length_m: 2.0, width_m: 1.0, clearance_m: 0.5 },
  { zone: 'Functional Zone', name: 'Plyo Box Set', priority: 3, length_m: 1.0, width_m: 1.0, clearance_m: 0.5 },
  { zone: 'Functional Zone', name: 'Suspension Trainer Station', priority: 4, length_m: 1.5, width_m: 1.5, clearance_m: 0.5 },
  { zone: 'Functional Zone', name: 'Kettlebell Rack', priority: 5, length_m: 1.2, width_m: 0.6, clearance_m: 0.5 },
  { zone: 'Recovery Zone', name: 'Stretching Mat Area', priority: 1, length_m: 2.0, width_m: 2.0, clearance_m: 0.3 },
  { zone: 'Recovery Zone', name: 'Foam Roller Station', priority: 2, length_m: 1.0, width_m: 1.0, clearance_m: 0.3 },
  { zone: 'Recovery Zone', name: 'Massage Chair', priority: 3, length_m: 1.2, width_m: 1.0, clearance_m: 0.5 },
]
