import { useEffect, useMemo, useState } from 'react'
import { Stage, Layer, Rect, Line, Text, Group, Shape, Circle, Image as KonvaImage } from 'react-konva'
import EquipmentGlyph from './glyphs.jsx'
import { FLOOR_STYLES } from './textures.js'

const decorCache = new Map()
function useDecorSprite(type) {
  const [img, setImg] = useState(() => decorCache.get(type))
  useEffect(() => {
    if (decorCache.has(type)) {
      setImg(decorCache.get(type))
      return
    }
    const image = new window.Image()
    image.onload = () => {
      decorCache.set(type, image)
      setImg(image)
    }
    image.onerror = () => {
      decorCache.set(type, null)
      setImg(null)
    }
    image.src = `/sprites/decor/${type}.png`
  }, [type])
  return img
}

function DecorItem({ item, scale, PADDING, roomW, roomH, onMove, onRemove }) {
  const img = useDecorSprite(item.type)
  const w = item.w * scale
  const h = item.h * scale
  return (
    <Group
      x={PADDING + item.x * scale}
      y={PADDING + item.y * scale}
      draggable
      dragBoundFunc={(abs) => ({
        x: Math.max(PADDING, Math.min(abs.x, PADDING + roomW - w)),
        y: Math.max(PADDING, Math.min(abs.y, PADDING + roomH - h)),
      })}
      onDragEnd={(e) => {
        const snap = (v) => Math.round((v - PADDING) / scale / 0.05) * 0.05
        onMove(item.id, { x: snap(e.target.x()), y: snap(e.target.y()) })
      }}
      onDblClick={() => onRemove(item.id)}
      onDblTap={() => onRemove(item.id)}
    >
      {img ? (
        <KonvaImage
          image={img}
          width={w}
          height={h}
          shadowColor="rgba(15, 18, 22, 0.35)"
          shadowBlur={4}
          shadowOffset={{ x: 2, y: 2.5 }}
        />
      ) : (
        <>
          <Rect width={w} height={h} fill="#e5e7eb" stroke="#6b7280" strokeWidth={1} cornerRadius={3} />
          <Circle x={w / 2} y={h / 2} radius={Math.min(w, h) * 0.3} fill="#9ca3af" />
        </>
      )}
    </Group>
  )
}

// door leaf + swing arc, ECdesign-style; hinge sits at the door's offset end
function DoorSwing({ door, px, scale, PADDING, roomW, roomH }) {
  const r = door.widthM * scale
  let hx
  let hy
  let startAngle // radians; arc sweeps 90° clockwise from the closed leaf
  if (door.wall === 'top') {
    hx = px(door.offsetM)
    hy = PADDING
    startAngle = 0
  } else if (door.wall === 'bottom') {
    hx = px(door.offsetM)
    hy = PADDING + roomH
    startAngle = -Math.PI / 2
  } else if (door.wall === 'left') {
    hx = PADDING
    hy = px(door.offsetM)
    startAngle = 0
  } else {
    hx = PADDING + roomW
    hy = px(door.offsetM)
    startAngle = Math.PI / 2
  }
  const endAngle = startAngle + Math.PI / 2
  // open leaf points into the room
  const leafAngle = door.wall === 'top' || door.wall === 'right' ? endAngle : startAngle

  return (
    <Group listening={false}>
      <Shape
        x={hx}
        y={hy}
        sceneFunc={(ctx, shape) => {
          ctx.beginPath()
          ctx.arc(0, 0, r, startAngle, endAngle)
          ctx.fillStrokeShape(shape)
        }}
        stroke="#6b7280"
        strokeWidth={1}
        dash={[4, 3]}
      />
      <Line
        points={[hx, hy, hx + Math.cos(leafAngle) * r, hy + Math.sin(leafAngle) * r]}
        stroke="#374151"
        strokeWidth={2}
      />
    </Group>
  )
}

const MAX_W = 760
const MAX_H = 560
const PADDING = 40

const ZONE_COLORS = {
  'Cardio Zone': { area: '#fef2f2', fill: '#fca5a5', stroke: '#b91c1c' },
  'Free Weight Zone': { area: '#eff6ff', fill: '#93c5fd', stroke: '#1d4ed8' },
  'Machine Zone': { area: '#f5f3ff', fill: '#c4b5fd', stroke: '#6d28d9' },
  'Functional Zone': { area: '#ecfdf5', fill: '#6ee7b7', stroke: '#047857' },
  'Recovery Zone': { area: '#fffbeb', fill: '#fcd34d', stroke: '#b45309' },
}
const FALLBACK = { area: '#f9fafb', fill: '#d1d5db', stroke: '#374151' }

function wallSegment(opening, px, roomW, roomH, PADDING) {
  const { wall, offsetM, widthM } = opening
  if (wall === 'top') return [px(offsetM), PADDING, px(offsetM + widthM), PADDING]
  if (wall === 'bottom')
    return [px(offsetM), PADDING + roomH, px(offsetM + widthM), PADDING + roomH]
  if (wall === 'left') return [PADDING, px(offsetM), PADDING, px(offsetM + widthM)]
  return [PADDING + roomW, px(offsetM), PADDING + roomW, px(offsetM + widthM)]
}

export default function RoomCanvas({
  layout,
  positions,
  onMove,
  conflictIds,
  floorStyle = 'wood',
  decor = [],
  onDecorMove,
  onDecorRemove,
}) {
  const floor = FLOOR_STYLES[floorStyle] || FLOOR_STYLES.wood
  const floorPattern = useMemo(() => floor.make(), [floor])
  if (!layout) return null
  const { lengthM, widthM } = layout

  const scale = Math.min((MAX_W - PADDING * 2) / lengthM, (MAX_H - PADDING * 2) / widthM)
  const roomW = lengthM * scale
  const roomH = widthM * scale
  const stageW = roomW + PADDING * 2
  const stageH = roomH + PADDING * 2
  const px = (m) => PADDING + m * scale

  const gridLines = []
  for (let x = 1; x < lengthM; x++) {
    gridLines.push(
      <Line key={`v${x}`} points={[px(x), PADDING, px(x), PADDING + roomH]} stroke="#e5e7eb" strokeWidth={1} />,
    )
  }
  for (let y = 1; y < widthM; y++) {
    gridLines.push(
      <Line key={`h${y}`} points={[PADDING, px(y), PADDING + roomW, px(y)]} stroke="#e5e7eb" strokeWidth={1} />,
    )
  }

  return (
    <Stage width={stageW} height={stageH}>
      <Layer>
        <Rect
          x={PADDING}
          y={PADDING}
          width={roomW}
          height={roomH}
          fillPatternImage={floorPattern}
          fillPatternScale={{
            x: (floor.tileMeters * scale) / floor.tilePx,
            y: (floor.tileMeters * scale) / floor.tilePx,
          }}
          stroke="#374151"
          strokeWidth={2}
        />
        {gridLines}

        {layout.zoneRects.map((z) => {
          const c = ZONE_COLORS[z.zone] || FALLBACK
          return (
            <Group key={z.zone} listening={false}>
              <Rect x={px(z.x)} y={px(z.y)} width={z.w * scale} height={z.h * scale} fill={c.area} opacity={0.28} />
              <Text
                x={px(z.x) + 4}
                y={px(z.y) + 4}
                text={z.zone.replace(' Zone', '').toUpperCase()}
                fontSize={10}
                fontStyle="bold"
                fill={c.stroke}
                opacity={0.7}
              />
            </Group>
          )
        })}

        {(layout.doorZones || []).map((z, i) => (
          <Rect
            key={`dz${i}`}
            listening={false}
            x={px(z.x)}
            y={px(z.y)}
            width={z.w * scale}
            height={z.h * scale}
            stroke="#f87171"
            strokeWidth={0.8}
            dash={[3, 3]}
          />
        ))}
        {(layout.doors || []).map((d, i) => (
          <Line
            key={`door${i}`}
            points={wallSegment(d, px, roomW, roomH, PADDING)}
            stroke="#ffffff"
            strokeWidth={6}
            listening={false}
          />
        ))}
        {(layout.doors || []).map((d, i) => (
          <DoorSwing
            key={`ds${i}`}
            door={d}
            px={px}
            scale={scale}
            PADDING={PADDING}
            roomW={roomW}
            roomH={roomH}
          />
        ))}
        {(layout.windows || []).map((wd, i) => (
          <Line
            key={`win${i}`}
            points={wallSegment(wd, px, roomW, roomH, PADDING)}
            stroke="#60a5fa"
            strokeWidth={5}
            listening={false}
          />
        ))}

        {layout.placements.map((p) => {
          const c = ZONE_COLORS[p.zone] || FALLBACK
          const pos = positions[p.id] || { x: p.x, y: p.y }
          const conflict = conflictIds?.has(p.id)
          const stroke = conflict ? '#dc2626' : c.stroke
          const w = p.w * scale
          const h = p.h * scale
          const cl = p.clearanceM * scale
          return (
            <Group
              key={p.id}
              x={px(pos.x)}
              y={px(pos.y)}
              draggable
              dragBoundFunc={(abs) => ({
                x: Math.max(PADDING, Math.min(abs.x, PADDING + roomW - w)),
                y: Math.max(PADDING, Math.min(abs.y, PADDING + roomH - h)),
              })}
              onDragEnd={(e) => {
                const snap = (v) => Math.round(((v - PADDING) / scale) / 0.05) * 0.05
                onMove(p.id, { x: snap(e.target.x()), y: snap(e.target.y()) })
              }}
            >
              <Rect width={w} height={h} fill={c.fill} opacity={0.25} stroke={stroke} strokeWidth={conflict ? 1.5 : 1} dash={[3, 3]} />
              <Group x={cl} y={cl}>
                <EquipmentGlyph
                  name={p.name}
                  zone={p.zone}
                  w={w - 2 * cl}
                  h={h - 2 * cl}
                  stroke={conflict ? '#dc2626' : '#4b5563'}
                />
              </Group>
            </Group>
          )
        })}

        {decor.map((item) => (
          <DecorItem
            key={item.id}
            item={item}
            scale={scale}
            PADDING={PADDING}
            roomW={roomW}
            roomH={roomH}
            onMove={onDecorMove}
            onRemove={onDecorRemove}
          />
        ))}

        <Text x={PADDING} y={PADDING - 24} width={roomW} align="center" text={`${lengthM} m`} fontSize={14} fill="#374151" />
        <Text x={PADDING - 34} y={PADDING + roomH / 2 - 7} text={`${widthM} m`} fontSize={14} fill="#374151" />
      </Layer>
    </Stage>
  )
}
