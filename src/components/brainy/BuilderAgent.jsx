import { roster } from './assets'
import shapes from './builder-shapes.json'
import { agentOutlines } from './agent-outlines'
import { sample } from './motions'
const shapeKeys = ['memo-ovals', 'brainy-six', 'scout-pebble', 'prism-diamond', 'archie-step', 'jayson-pinched', 'finn-triangle', 'storm-six']
const profiles = [1, 2, 4, 3, 0, 5, 0, 1]

// Same contour-following name placement and ear movement as brainy-hq/agents/characters.js.
export default function BuilderAgent({ index, recipe, time, reduced, icon = false }) {
  const agent = roster[index]
  const frame = sample(recipe, Math.max(0, time - recipe.startedAt), profiles[index], { reducedMotion: reduced })
  const b = frame.body, angle = b.rotation * Math.PI / 180
  const top = 90 + b.y + 26 * b.sy
  let right = -Infinity
  if (frame.tagMode === 'steady-spin') {
    const radius = Math.max(...agentOutlines[index].flatMap(contour => contour.map(([x, y]) => Math.hypot(x - 90, y - 90)))) * Math.max(b.sx, b.sy)
    right = 90 + b.x + Math.sqrt(Math.max(0, radius ** 2 - (top - 90 - b.y) ** 2))
  } else agentOutlines[index].forEach((contour, ci) => {
    const points = contour.map(([x, y]) => {
      if (index === 0 && ci < 2) { x = (ci ? 136 : 44) + (x - (ci ? 136 : 44)) * b.ears; y = 94 + (y - 94) * b.ears }
      const px = (x - 90) * b.sx, py = (y - 90) * b.sy
      return { x: 90 + b.x + px * Math.cos(angle) - py * Math.sin(angle), y: 90 + b.y + px * Math.sin(angle) + py * Math.cos(angle) }
    })
    points.forEach((p, i) => {
      if (p.y >= top) right = Math.max(right, p.x)
      const q = points[(i + 1) % points.length]
      if ((p.y < top) !== (q.y < top)) right = Math.max(right, p.x + (q.x - p.x) * (top - p.y) / (q.y - p.y))
    })
  })
  return <div className="motion-agent" role="img" aria-label={`${agent.name}, ${recipe.body} movement, ${recipe.eyes} expression`}>
    <svg viewBox="-30 -30 240 240" aria-hidden="true">
      <g transform={`translate(${b.x} ${b.y}) rotate(${b.rotation} 90 90)`}>
        <g fill={agent.color} transform={`translate(90 90) scale(${b.sx} ${b.sy}) translate(-90 -90)`}>
          {shapes[shapeKeys[index]].map(({ tag: Shape, attrs }, i) => <Shape key={i} {...attrs} {...(index === 0 && i < 2 ? { transform: `translate(${attrs.cx} ${attrs.cy}) scale(${b.ears}) translate(${-attrs.cx} ${-attrs.cy})` } : {})} />)}
        </g>
        <g fill="white" transform={frame.upright ? `rotate(${-b.rotation} 90 90)` : undefined}>{frame.eyes.map((eye, i) => <ellipse key={i} {...eye} />)}</g>
      </g>
    </svg>
    {!icon && <span className="motion-agent__name" style={{ left: `calc(${(right + 30) / 240 * 100}% + 4px)`, top: `${(top + 30) / 240 * 100}%`, background: agent.color, color: [1, 7].includes(index) ? '#fff' : '#171717' }}>{agent.name}</span>}
  </div>
}
