import { useMemo, useState } from "react"
import {
  Check,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Copy,
} from "lucide-react"
import "../styles/json-viewer.css"

type ValueType = "string" | "number" | "boolean" | "null" | "empty"

interface Line {
  depth: number
  key?: string
  kind: "open" | "close" | "value"
  bracket?: string
  type?: ValueType
  raw?: string
  comma: boolean
  start: number
  end: number
  size: number
  isArray: boolean
}

function buildLines(root: unknown): Line[] {
  const lines: Line[] = []

  const walk = (
    val: unknown,
    depth: number,
    key: string | undefined,
    comma: boolean,
  ) => {
    if (val !== null && typeof val === "object") {
      const isArray = Array.isArray(val)
      const entries: Array<[string | undefined, unknown]> = isArray
        ? (val as unknown[]).map((v) => [undefined, v])
        : Object.entries(val as Record<string, unknown>)

      if (entries.length === 0) {
        lines.push({
          depth,
          key,
          kind: "value",
          type: "empty",
          raw: isArray ? "[]" : "{}",
          comma,
          start: -1,
          end: -1,
          size: 0,
          isArray,
        })
        return
      }

      const openIdx = lines.length
      lines.push({
        depth,
        key,
        kind: "open",
        bracket: isArray ? "[" : "{",
        comma,
        start: openIdx,
        end: -1,
        size: entries.length,
        isArray,
      })
      entries.forEach(([k, v], i) => walk(v, depth + 1, k, i < entries.length - 1))
      const closeIdx = lines.length
      lines.push({
        depth,
        kind: "close",
        bracket: isArray ? "]" : "}",
        comma,
        start: openIdx,
        end: closeIdx,
        size: entries.length,
        isArray,
      })
      lines[openIdx].end = closeIdx
      return
    }

    let type: ValueType
    let raw: string
    if (typeof val === "string") {
      type = "string"
      raw = JSON.stringify(val)
    } else if (typeof val === "number") {
      type = "number"
      raw = String(val)
    } else if (typeof val === "boolean") {
      type = "boolean"
      raw = String(val)
    } else {
      type = "null"
      raw = "null"
    }
    lines.push({
      depth,
      key,
      kind: "value",
      type,
      raw,
      comma,
      start: -1,
      end: -1,
      size: 0,
      isArray: false,
    })
  }

  walk(root, 0, undefined, false)
  return lines
}

interface Hover {
  start: number
  end: number
  depth: number
}

interface JsonViewerProps {
  json: string
  className?: string
}

export function JsonViewer({ json, className = "" }: JsonViewerProps) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [hover, setHover] = useState<Hover | null>(null)
  const [copied, setCopied] = useState(false)
  const [prevJson, setPrevJson] = useState(json)

  if (prevJson !== json) {
    setPrevJson(json)
    setCollapsed(new Set())
    setHover(null)
  }

  const parsed = useMemo(() => {
    try {
      return { ok: true as const, lines: buildLines(JSON.parse(json)) }
    } catch (e) {
      return { ok: false as const, error: (e as Error).message }
    }
  }, [json])

  if (!parsed.ok) {
    return (
      <div className={`jv ${className}`}>
        <div className="jv-error">JSON inválido: {parsed.error}</div>
        <pre className="jv-raw">{json}</pre>
      </div>
    )
  }

  const { lines } = parsed

  const toggle = (idx: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })

  const collapseToLevel = (level: number) =>
    setCollapsed(
      new Set(
        lines.flatMap((l, i) =>
          l.kind === "open" && l.depth >= level ? [i] : [],
        ),
      ),
    )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard no disponible */
    }
  }

  const bracket = (ch: string, l: Line) => {
    const active = hover?.start === l.start
    return (
      <span
        className={`jv-bracket jv-b-${l.depth % 6}${active ? " jv-bracket-active" : ""}`}
        onMouseEnter={() =>
          setHover({ start: l.start, end: l.end, depth: l.depth })
        }
        onMouseLeave={() => setHover(null)}
      >
        {ch}
      </span>
    )
  }

  const keyPart = (l: Line) =>
    l.key !== undefined ? (
      <>
        <span className="jv-key">{JSON.stringify(l.key)}</span>
        <span className="jv-punct">: </span>
      </>
    ) : null

  const rows: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const l = lines[i]
    const isCollapsed = l.kind === "open" && collapsed.has(i)
    const inRange = hover !== null && i >= hover.start && i <= hover.end
    const strictlyInside = hover !== null && i > hover.start && i < hover.end

    const guides = Array.from({ length: l.depth }, (_, k) => (
      <span
        key={k}
        className={`jv-guide jv-g-${k % 6}${
          strictlyInside && hover !== null && k === hover.depth
            ? " jv-guide-active"
            : ""
        }`}
      />
    ))

    let content: React.ReactNode
    if (l.kind === "open") {
      content = (
        <>
          {keyPart(l)}
          {bracket(l.bracket ?? "", l)}
          {isCollapsed && (
            <>
              <button
                type="button"
                className="jv-badge"
                onClick={() => toggle(i)}
                title="Expandir"
              >
                {l.size} {l.isArray ? (l.size === 1 ? "item" : "items") : l.size === 1 ? "clave" : "claves"}
              </button>
              {bracket(l.isArray ? "]" : "}", {
                ...l,
                depth: l.depth,
              })}
              {l.comma && <span className="jv-punct">,</span>}
            </>
          )}
        </>
      )
    } else if (l.kind === "close") {
      content = (
        <>
          {bracket(l.bracket ?? "", l)}
          {l.comma && <span className="jv-punct">,</span>}
        </>
      )
    } else {
      content = (
        <>
          {keyPart(l)}
          <span className={`jv-${l.type}`}>{l.raw}</span>
          {l.comma && <span className="jv-punct">,</span>}
        </>
      )
    }

    rows.push(
      <div key={i} className={`jv-row${inRange ? " jv-row-active" : ""}`}>
        <div className="jv-gutter">
          <span className="jv-ln">{i + 1}</span>
          {l.kind === "open" ? (
            <button
              type="button"
              className="jv-fold"
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? "Expandir" : "Colapsar"}
              onClick={() => toggle(i)}
            >
              <ChevronRight
                size={12}
                className={isCollapsed ? "" : "jv-fold-open"}
              />
            </button>
          ) : (
            <span className="jv-fold-spacer" />
          )}
        </div>
        <div className="jv-code">
          {guides}
          <span className="jv-line">{content}</span>
        </div>
      </div>,
    )

    i = isCollapsed ? l.end + 1 : i + 1
  }

  return (
    <div className={`jv ${className}`}>
      <div className="jv-toolbar">
        <span className="jv-toolbar-label">Nivel</span>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            className="jv-btn"
            onClick={() => collapseToLevel(n)}
          >
            {n}
          </button>
        ))}
        <span className="jv-sep" />
        <button
          type="button"
          className="jv-btn"
          onClick={() => collapseToLevel(1)}
          title="Colapsar todo"
        >
          <ChevronsDownUp size={14} />
        </button>
        <button
          type="button"
          className="jv-btn"
          onClick={() => setCollapsed(new Set())}
          title="Expandir todo"
        >
          <ChevronsUpDown size={14} />
        </button>
        <span className="jv-spacer" />
        <button type="button" className="jv-btn" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <div className="jv-scroll">
        <div className="jv-body">{rows}</div>
      </div>
    </div>
  )
}

export default JsonViewer