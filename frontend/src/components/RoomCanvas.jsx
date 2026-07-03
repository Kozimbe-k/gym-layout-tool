import { Stage, Layer, Rect, Line, Text } from 'react-konva'

const MAX_W = 640
const MAX_H = 480
const PADDING = 40

export default function RoomCanvas({ lengthM, widthM }) {
  if (!lengthM || !widthM) return null

  const scale = Math.min((MAX_W - PADDING * 2) / lengthM, (MAX_H - PADDING * 2) / widthM)
  const roomW = lengthM * scale
  const roomH = widthM * scale
  const stageW = roomW + PADDING * 2
  const stageH = roomH + PADDING * 2

  const gridLines = []
  for (let x = 1; x < lengthM; x++) {
    gridLines.push(
      <Line
        key={`v${x}`}
        points={[PADDING + x * scale, PADDING, PADDING + x * scale, PADDING + roomH]}
        stroke="#e5e7eb"
        strokeWidth={1}
      />,
    )
  }
  for (let y = 1; y < widthM; y++) {
    gridLines.push(
      <Line
        key={`h${y}`}
        points={[PADDING, PADDING + y * scale, PADDING + roomW, PADDING + y * scale]}
        stroke="#e5e7eb"
        strokeWidth={1}
      />,
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
          fill="#f9fafb"
          stroke="#374151"
          strokeWidth={2}
        />
        {gridLines}
        <Text
          x={PADDING}
          y={PADDING - 24}
          width={roomW}
          align="center"
          text={`${lengthM} m`}
          fontSize={14}
          fill="#374151"
        />
        <Text
          x={PADDING - 34}
          y={PADDING + roomH / 2 - 7}
          text={`${widthM} m`}
          fontSize={14}
          fill="#374151"
        />
      </Layer>
    </Stage>
  )
}
