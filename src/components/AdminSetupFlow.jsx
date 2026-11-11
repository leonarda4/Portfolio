import { useId, useRef } from 'react'
import './AdminSetupFlow.css'

const description = 'Two independent setup examples. New type opens a document type form with a Workflow dropdown. If no suitable workflow exists, Add new workflow opens a workflow form in Tab 2. Its Status dropdown can open a new status form in Tab 3. New partner opens a partner form with a City dropdown; Add new city opens a city form in Tab 2. Existing options can be selected without opening a new tab, and earlier forms remain open.'
const width = 1200
const height = 832

function Text({ x, y, children, muted = false, small = false, anchor = 'start' }) {
  return <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fill={`var(${muted ? '--color-muted' : '--color-text'})`} fontSize={small ? 16 : 20}>{children}</text>
}

function Entry({ y, title, action, arrow }) {
  return <g>
    <path d={`M6 ${y + 24}H36`} stroke="var(--color-muted)" fill="none" markerEnd={arrow} />
    <rect x="36" y={y} width="300" height="48" rx="3" fill="var(--color-surface)" stroke="var(--color-border)" />
    <Text x={52} y={y + 24}>{title}</Text>
    <rect x="216" y={y + 8} width="104" height="32" rx="3" fill="var(--color-canvas)" stroke="var(--color-muted)" />
    <Text x={268} y={y + 24} small anchor="middle">{action}</Text>
    <path d={`M268 ${y + 40}V${y + 68}H186V${y + 92}`} stroke="var(--color-muted)" fill="none" markerEnd={arrow} />
    <Text x={288} y={y + 70} small muted>Opens form</Text>
  </g>
}

function Form({ x, y, title, field, item }) {
  return <g>
    <rect x={x} y={y} width="300" height="224" rx="3" fill="var(--color-surface)" stroke="var(--color-border)" />
    <Text x={x + 16} y={y + 28}>{title}</Text>
    <path d={`M${x} ${y + 52}H${x + 300}`} stroke="var(--color-border)" />
    {field ? <>
      <Text x={x + 16} y={y + 76} small muted>{field}</Text>
      <rect x={x + 16} y={y + 94} width="268" height="114" rx="3" fill="var(--color-canvas)" stroke="var(--color-border)" />
      <Text x={x + 28} y={y + 115} small>Select existing {item}</Text>
      <path d={`M${x + 260} ${y + 112}l6 6 6 -6`} stroke="var(--color-muted)" fill="none" />
      <Text x={x + 28} y={y + 156} small muted>No suitable option?</Text>
      <path d={`M${x + 16} ${y + 136}H${x + 284} M${x + 16} ${y + 174}H${x + 284}`} stroke="var(--color-border)" />
      <Text x={x + 28} y={y + 191}>+ Add new {item}</Text>
    </> : <>
      <Text x={x + 150} y={y + 124} anchor="middle">Create the missing {item}</Text>
      <Text x={x + 150} y={y + 158} small muted anchor="middle">Previous forms stay open</Text>
    </>}
  </g>
}

export default function AdminSetupFlow({ onOpen }) {
  const svgRef = useRef(null)
  const arrowId = `setup-arrow-${useId().replaceAll(':', '')}`
  const arrow = `url(#${arrowId})`

  function enlarge() {
    const svg = svgRef.current.cloneNode(true)
    const styles = getComputedStyle(svgRef.current)
    for (const name of ['--color-text', '--color-muted', '--color-border', '--color-surface', '--color-canvas']) svg.style.setProperty(name, styles.getPropertyValue(name))
    svg.style.fontFamily = styles.fontFamily
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))
    onOpen({ src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`, alt: description })
  }

  return <figure className="admin-setup-flow">
    <button className="image-button" onClick={enlarge} aria-label="Enlarge nested administration setup diagram">
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={description}>
        <defs><marker id={arrowId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 7 4 1 7" fill="none" stroke="var(--color-muted)" strokeWidth="1.2" /></marker></defs>
        <rect width={width} height={height} fill="var(--color-canvas)" />
        <Text x={36} y={24} muted small>Current tab</Text><Text x={450} y={24} muted small>Tab 2</Text><Text x={864} y={24} muted small>Tab 3</Text>
        <g stroke="var(--color-border)" fill="none"><path d="M36 46H1164" /><path d="M414 0V812 M828 0V812" strokeDasharray="5 7" /></g>
        <Entry y={68} title="Document types" action="New type" arrow={arrow} />
        <Form x={36} y={160} title="Document type form" field="Workflow" item="workflow" />
        <Form x={450} y={160} title="Workflow form" field="Status" item="status" />
        <Form x={864} y={160} title="Status form" item="status" />
        <Entry y={480} title="Partners" action="New partner" arrow={arrow} />
        <Form x={36} y={572} title="Partner form" field="City" item="city" />
        <Form x={450} y={572} title="City form" item="city" />
        {[[320, 450, 351], [734, 864, 351], [320, 450, 763]].map(([from, to, y]) => <g key={`${from}-${y}`}>
          <path d={`M${from} ${y}H${to}`} stroke="var(--color-muted)" strokeWidth="1.5" fill="none" markerEnd={arrow} />
          <Text x={(from + to) / 2} y={y - 20} small muted anchor="middle">New tab</Text>
        </g>)}
      </svg>
    </button>
  </figure>
}
