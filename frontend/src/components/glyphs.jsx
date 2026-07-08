import { Rect, Circle, Line, Ellipse, Group } from 'react-konva'

// Top-view architectural symbols for gym equipment, drawn in a local
// (0,0)-(w,h) space assuming landscape orientation (length >= width).
// Original artwork in standard floor-plan style: white fill, thin dark strokes.

const FILL = '#ffffff'

function treadmill({ w, h, stroke }) {
  return [
    <Rect key="b" width={w} height={h} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={h * 0.15} />,
    <Rect key="c" x={w * 0.02} y={h * 0.08} width={w * 0.09} height={h * 0.84} fill="#d1d5db" stroke={stroke} strokeWidth={0.8} cornerRadius={1} />,
    <Rect key="belt" x={w * 0.18} y={h * 0.14} width={w * 0.76} height={h * 0.72} fill={FILL} stroke={stroke} strokeWidth={0.8} />,
    <Line key="mid" points={[w * 0.22, h * 0.5, w * 0.9, h * 0.5]} stroke={stroke} strokeWidth={0.6} dash={[3, 3]} />,
  ]
}

function elliptical({ w, h, stroke }) {
  return [
    <Circle key="fly" x={w * 0.16} y={h * 0.5} radius={h * 0.32} fill={FILL} stroke={stroke} strokeWidth={1} />,
    <Rect key="p1" x={w * 0.32} y={h * 0.12} width={w * 0.55} height={h * 0.22} fill={FILL} stroke={stroke} strokeWidth={0.8} cornerRadius={2} />,
    <Rect key="p2" x={w * 0.32} y={h * 0.66} width={w * 0.55} height={h * 0.22} fill={FILL} stroke={stroke} strokeWidth={0.8} cornerRadius={2} />,
    <Line key="fr" points={[w * 0.3, h * 0.5, w * 0.95, h * 0.5]} stroke={stroke} strokeWidth={0.8} />,
  ]
}

function bike({ w, h, stroke }) {
  return [
    <Circle key="fly" x={w * 0.25} y={h * 0.5} radius={h * 0.3} fill={FILL} stroke={stroke} strokeWidth={1} />,
    <Line key="bar" points={[w * 0.42, h * 0.15, w * 0.42, h * 0.85]} stroke={stroke} strokeWidth={1.4} />,
    <Line key="fr" points={[w * 0.25, h * 0.5, w * 0.78, h * 0.5]} stroke={stroke} strokeWidth={0.8} />,
    <Rect key="seat" x={w * 0.68} y={h * 0.3} width={w * 0.2} height={h * 0.4} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={2} />,
  ]
}

function rower({ w, h, stroke }) {
  return [
    <Rect key="fly" x={w * 0.01} y={h * 0.12} width={w * 0.13} height={h * 0.76} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={2} />,
    <Rect key="rail" x={w * 0.14} y={h * 0.38} width={w * 0.82} height={h * 0.24} fill={FILL} stroke={stroke} strokeWidth={1} />,
    <Rect key="seat" x={w * 0.48} y={h * 0.28} width={w * 0.12} height={h * 0.44} fill="#e5e7eb" stroke={stroke} strokeWidth={0.8} cornerRadius={2} />,
    <Rect key="f1" x={w * 0.16} y={h * 0.08} width={w * 0.08} height={h * 0.22} fill={FILL} stroke={stroke} strokeWidth={0.8} />,
    <Rect key="f2" x={w * 0.16} y={h * 0.7} width={w * 0.08} height={h * 0.22} fill={FILL} stroke={stroke} strokeWidth={0.8} />,
  ]
}

function stairClimber({ w, h, stroke }) {
  const steps = [0.3, 0.45, 0.6, 0.75].map((fx, i) => (
    <Line key={`s${i}`} points={[w * fx, h * 0.15, w * fx, h * 0.85]} stroke={stroke} strokeWidth={0.8} />
  ))
  return [
    <Rect key="b" width={w} height={h} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={2} />,
    <Rect key="con" x={w * 0.03} y={h * 0.15} width={w * 0.1} height={h * 0.7} fill="#d1d5db" stroke={stroke} strokeWidth={0.8} />,
    ...steps,
  ]
}

function powerRack({ w, h, stroke }) {
  const p = Math.min(w, h) * 0.1
  const inset = Math.min(w, h) * 0.16
  const posts = [
    [inset, inset],
    [w - inset, inset],
    [inset, h - inset],
    [w - inset, h - inset],
  ].map(([x, y], i) => (
    <Rect key={`p${i}`} x={x - p / 2} y={y - p / 2} width={p} height={p} fill="#9ca3af" stroke={stroke} strokeWidth={0.8} />
  ))
  return [
    <Rect key="frame" x={inset} y={inset} width={w - 2 * inset} height={h - 2 * inset} stroke={stroke} strokeWidth={0.8} fill={FILL} />,
    ...posts,
    <Line key="bar" points={[w * 0.02, h * 0.5, w * 0.98, h * 0.5]} stroke={stroke} strokeWidth={1.2} />,
    <Circle key="pl1" x={w * 0.07} y={h * 0.5} radius={Math.min(w, h) * 0.09} fill="#e5e7eb" stroke={stroke} strokeWidth={0.8} />,
    <Circle key="pl2" x={w * 0.93} y={h * 0.5} radius={Math.min(w, h) * 0.09} fill="#e5e7eb" stroke={stroke} strokeWidth={0.8} />,
  ]
}

function bench({ w, h, stroke }) {
  return [
    <Rect key="pad" x={w * 0.08} y={h * 0.22} width={w * 0.84} height={h * 0.56} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={h * 0.2} />,
    <Line key="split" points={[w * 0.38, h * 0.22, w * 0.38, h * 0.78]} stroke={stroke} strokeWidth={0.8} />,
    <Line key="f1" points={[w * 0.14, h * 0.78, w * 0.14, h * 0.95]} stroke={stroke} strokeWidth={0.8} />,
    <Line key="f2" points={[w * 0.86, h * 0.78, w * 0.86, h * 0.95]} stroke={stroke} strokeWidth={0.8} />,
  ]
}

function dumbbellRack({ w, h, stroke }) {
  const bells = []
  for (let r = 0; r < 2; r++) {
    for (let i = 0; i < 5; i++) {
      const cx = w * (0.14 + i * 0.18)
      const cy = h * (r === 0 ? 0.3 : 0.7)
      const rr = h * 0.09
      bells.push(
        <Line key={`l${r}${i}`} points={[cx - rr * 1.6, cy, cx + rr * 1.6, cy]} stroke={stroke} strokeWidth={1} />,
        <Circle key={`a${r}${i}`} x={cx - rr * 1.6} y={cy} radius={rr} fill="#e5e7eb" stroke={stroke} strokeWidth={0.6} />,
        <Circle key={`b${r}${i}`} x={cx + rr * 1.6} y={cy} radius={rr} fill="#e5e7eb" stroke={stroke} strokeWidth={0.6} />,
      )
    }
  }
  return [
    <Rect key="b" width={w} height={h} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={2} />,
    <Line key="shelf" points={[0, h * 0.5, w, h * 0.5]} stroke={stroke} strokeWidth={0.6} />,
    ...bells,
  ]
}

function platform({ w, h, stroke }) {
  return [
    <Rect key="b" width={w} height={h} fill={FILL} stroke={stroke} strokeWidth={1} />,
    <Rect key="in" x={w * 0.28} y={h * 0.08} width={w * 0.44} height={h * 0.84} fill="#f3f4f6" stroke={stroke} strokeWidth={0.6} />,
    <Line key="bar" points={[w * 0.08, h * 0.5, w * 0.92, h * 0.5]} stroke={stroke} strokeWidth={1.2} />,
    <Circle key="p1" x={w * 0.14} y={h * 0.5} radius={h * 0.16} fill="#e5e7eb" stroke={stroke} strokeWidth={0.8} />,
    <Circle key="p2" x={w * 0.86} y={h * 0.5} radius={h * 0.16} fill="#e5e7eb" stroke={stroke} strokeWidth={0.8} />,
  ]
}

function smith({ w, h, stroke }) {
  return [
    <Rect key="l" x={w * 0.02} y={h * 0.08} width={w * 0.1} height={h * 0.84} fill="#d1d5db" stroke={stroke} strokeWidth={0.8} />,
    <Rect key="r" x={w * 0.88} y={h * 0.08} width={w * 0.1} height={h * 0.84} fill="#d1d5db" stroke={stroke} strokeWidth={0.8} />,
    <Line key="bar" points={[w * 0.12, h * 0.5, w * 0.88, h * 0.5]} stroke={stroke} strokeWidth={1.2} />,
    <Rect key="bench" x={w * 0.3} y={h * 0.3} width={w * 0.4} height={h * 0.4} fill={FILL} stroke={stroke} strokeWidth={0.8} cornerRadius={2} />,
  ]
}

function cableCrossover({ w, h, stroke }) {
  return [
    <Rect key="l" x={0} y={h * 0.05} width={w * 0.12} height={h * 0.9} fill="#d1d5db" stroke={stroke} strokeWidth={1} cornerRadius={2} />,
    <Rect key="r" x={w * 0.88} y={h * 0.05} width={w * 0.12} height={h * 0.9} fill="#d1d5db" stroke={stroke} strokeWidth={1} cornerRadius={2} />,
    <Line key="beam" points={[w * 0.12, h * 0.14, w * 0.88, h * 0.14]} stroke={stroke} strokeWidth={1.2} />,
    <Circle key="pu1" x={w * 0.3} y={h * 0.14} radius={h * 0.05} fill={FILL} stroke={stroke} strokeWidth={0.8} />,
    <Circle key="pu2" x={w * 0.7} y={h * 0.14} radius={h * 0.05} fill={FILL} stroke={stroke} strokeWidth={0.8} />,
    <Line key="c1" points={[w * 0.3, h * 0.19, w * 0.38, h * 0.6]} stroke={stroke} strokeWidth={0.6} dash={[2, 2]} />,
    <Line key="c2" points={[w * 0.7, h * 0.19, w * 0.62, h * 0.6]} stroke={stroke} strokeWidth={0.6} dash={[2, 2]} />,
  ]
}

function legPress({ w, h, stroke }) {
  return [
    <Rect key="seat" x={w * 0.05} y={h * 0.25} width={w * 0.28} height={h * 0.5} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={3} />,
    <Line key="r1" points={[w * 0.33, h * 0.3, w * 0.58, h * 0.2]} stroke={stroke} strokeWidth={0.8} />,
    <Line key="r2" points={[w * 0.33, h * 0.7, w * 0.58, h * 0.8]} stroke={stroke} strokeWidth={0.8} />,
    <Line
      key="sled"
      points={[w * 0.58, h * 0.15, w * 0.95, h * 0.1, w * 0.95, h * 0.9, w * 0.58, h * 0.85]}
      closed
      fill="#e5e7eb"
      stroke={stroke}
      strokeWidth={1}
    />,
  ]
}

function seatedMachine({ w, h, stroke }) {
  // generic selectorized machine: weight stack tower + seat + backrest
  return [
    <Rect key="tower" x={w * 0.72} y={h * 0.1} width={w * 0.24} height={h * 0.8} fill="#d1d5db" stroke={stroke} strokeWidth={1} cornerRadius={2} />,
    <Line key="st1" points={[w * 0.76, h * 0.3, w * 0.92, h * 0.3]} stroke={stroke} strokeWidth={0.6} />,
    <Line key="st2" points={[w * 0.76, h * 0.5, w * 0.92, h * 0.5]} stroke={stroke} strokeWidth={0.6} />,
    <Line key="st3" points={[w * 0.76, h * 0.7, w * 0.92, h * 0.7]} stroke={stroke} strokeWidth={0.6} />,
    <Rect key="seat" x={w * 0.22} y={h * 0.32} width={w * 0.3} height={h * 0.36} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={3} />,
    <Rect key="back" x={w * 0.1} y={h * 0.22} width={w * 0.1} height={h * 0.56} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={2} />,
    <Line key="fr" points={[w * 0.52, h * 0.5, w * 0.72, h * 0.5]} stroke={stroke} strokeWidth={0.8} />,
  ]
}

function turf({ w, h, stroke }) {
  const lines = []
  const n = Math.max(3, Math.round(w / 40))
  for (let i = 1; i < n; i++) {
    lines.push(
      <Line key={`y${i}`} points={[(w / n) * i, h * 0.08, (w / n) * i, h * 0.92]} stroke="#34d399" strokeWidth={0.8} />,
    )
  }
  return [
    <Rect key="b" width={w} height={h} fill="#bbf7d0" stroke={stroke} strokeWidth={1} cornerRadius={2} />,
    ...lines,
  ]
}

function battleRopes({ w, h, stroke }) {
  const wave = (y0, phase) => {
    const pts = []
    for (let i = 0; i <= 16; i++) {
      const x = w * 0.12 + (w * 0.82 * i) / 16
      pts.push(x, y0 + Math.sin(i * 0.9 + phase) * h * 0.09)
    }
    return pts
  }
  return [
    <Rect key="anchor" x={w * 0.02} y={h * 0.38} width={w * 0.08} height={h * 0.24} fill="#9ca3af" stroke={stroke} strokeWidth={0.8} />,
    <Line key="r1" points={wave(h * 0.32, 0)} stroke={stroke} strokeWidth={1.4} lineCap="round" tension={0.4} />,
    <Line key="r2" points={wave(h * 0.68, 1.6)} stroke={stroke} strokeWidth={1.4} lineCap="round" tension={0.4} />,
  ]
}

function plyoBoxes({ w, h, stroke }) {
  return [
    <Rect key="b1" x={w * 0.04} y={h * 0.3} width={w * 0.62} height={h * 0.62} fill={FILL} stroke={stroke} strokeWidth={1} />,
    <Rect key="b2" x={w * 0.42} y={h * 0.08} width={w * 0.42} height={h * 0.42} fill="#f3f4f6" stroke={stroke} strokeWidth={1} />,
    <Rect key="b3" x={w * 0.66} y={h * 0.56} width={w * 0.3} height={h * 0.3} fill="#e5e7eb" stroke={stroke} strokeWidth={1} />,
  ]
}

function suspension({ w, h, stroke }) {
  return [
    <Line key="bar" points={[w * 0.15, h * 0.08, w * 0.85, h * 0.08]} stroke={stroke} strokeWidth={1.4} />,
    <Line key="s1" points={[w * 0.5, h * 0.08, w * 0.3, h * 0.65]} stroke={stroke} strokeWidth={0.8} />,
    <Line key="s2" points={[w * 0.5, h * 0.08, w * 0.7, h * 0.65]} stroke={stroke} strokeWidth={0.8} />,
    <Circle key="h1" x={w * 0.3} y={h * 0.7} radius={h * 0.07} fill={FILL} stroke={stroke} strokeWidth={1} />,
    <Circle key="h2" x={w * 0.7} y={h * 0.7} radius={h * 0.07} fill={FILL} stroke={stroke} strokeWidth={1} />,
  ]
}

function kettlebellRack({ w, h, stroke }) {
  const bells = [0.16, 0.38, 0.6, 0.82].map((fx, i) => (
    <Circle key={`k${i}`} x={w * fx} y={h * 0.5} radius={h * 0.22} fill="#e5e7eb" stroke={stroke} strokeWidth={1} />
  ))
  const handles = [0.16, 0.38, 0.6, 0.82].map((fx, i) => (
    <Line key={`h${i}`} points={[w * fx - h * 0.14, h * 0.34, w * fx + h * 0.14, h * 0.34]} stroke={stroke} strokeWidth={1} />
  ))
  return [
    <Rect key="b" width={w} height={h} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={2} />,
    ...bells,
    ...handles,
  ]
}

function mats({ w, h, stroke }) {
  return [
    <Rect key="m1" x={w * 0.06} y={h * 0.08} width={w * 0.4} height={h * 0.84} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={4} />,
    <Line key="f1" points={[w * 0.26, h * 0.12, w * 0.26, h * 0.88]} stroke={stroke} strokeWidth={0.6} dash={[3, 2]} />,
    <Rect key="m2" x={w * 0.54} y={h * 0.08} width={w * 0.4} height={h * 0.84} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={4} />,
    <Line key="f2" points={[w * 0.74, h * 0.12, w * 0.74, h * 0.88]} stroke={stroke} strokeWidth={0.6} dash={[3, 2]} />,
  ]
}

function foamRollers({ w, h, stroke }) {
  return [
    <Rect key="r1" x={w * 0.1} y={h * 0.16} width={w * 0.7} height={h * 0.26} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={h * 0.13} />,
    <Rect key="r2" x={w * 0.2} y={h * 0.58} width={w * 0.7} height={h * 0.26} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={h * 0.13} />,
  ]
}

function massageChair({ w, h, stroke }) {
  return [
    <Rect key="back" x={w * 0.05} y={h * 0.15} width={w * 0.25} height={h * 0.7} fill="#e5e7eb" stroke={stroke} strokeWidth={1} cornerRadius={4} />,
    <Rect key="seat" x={w * 0.3} y={h * 0.25} width={w * 0.35} height={h * 0.5} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={3} />,
    <Rect key="foot" x={w * 0.68} y={h * 0.3} width={w * 0.26} height={h * 0.4} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={h * 0.2} />,
    <Line key="a1" points={[w * 0.3, h * 0.12, w * 0.65, h * 0.12]} stroke={stroke} strokeWidth={1.4} />,
    <Line key="a2" points={[w * 0.3, h * 0.88, w * 0.65, h * 0.88]} stroke={stroke} strokeWidth={1.4} />,
  ]
}

function fallback({ w, h, stroke }) {
  return [
    <Rect key="b" width={w} height={h} fill={FILL} stroke={stroke} strokeWidth={1} cornerRadius={2} />,
    <Line key="d" points={[0, 0, w, h]} stroke={stroke} strokeWidth={0.5} />,
  ]
}

const GLYPHS = {
  Treadmill: treadmill,
  Elliptical: elliptical,
  'Upright Exercise Bike': bike,
  'Rowing Machine': rower,
  'Stair Climber': stairClimber,
  'Power Rack': powerRack,
  'Adjustable Bench': bench,
  'Dumbbell Rack (set)': dumbbellRack,
  'Olympic Lifting Platform': platform,
  'Smith Machine': smith,
  'Cable Crossover Station': cableCrossover,
  'Leg Press Machine': legPress,
  'Lat Pulldown Machine': seatedMachine,
  'Chest Press Machine': seatedMachine,
  'Leg Extension/Curl Machine': seatedMachine,
  'Turf Sprint Lane': turf,
  'Battle Ropes Station': battleRopes,
  'Plyo Box Set': plyoBoxes,
  'Suspension Trainer Station': suspension,
  'Kettlebell Rack': kettlebellRack,
  'Stretching Mat Area': mats,
  'Foam Roller Station': foamRollers,
  'Massage Chair': massageChair,
}

// Renders the symbol for `name` into a (w × h) box. Symbols are authored
// landscape; when the placed footprint is portrait, the drawing is rotated.
export default function EquipmentGlyph({ name, w, h, stroke = '#4b5563' }) {
  const draw = GLYPHS[name] || fallback
  if (h > w * 1.05 && draw !== fallback) {
    // portrait placement: draw landscape at (h × w), rotate 90° into place
    return (
      <Group x={w} rotation={90}>
        {draw({ w: h, h: w, stroke })}
      </Group>
    )
  }
  return <Group>{draw({ w, h, stroke })}</Group>
}
