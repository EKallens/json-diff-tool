import { useMemo, useRef, useState } from "react"
import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  ReactNode,
  SyntheticEvent,
  UIEvent,
} from "react"
import { ChevronRight, ChevronsDownUp, ChevronsUpDown } from "lucide-react"
import "../styles/json-viewer.css"
import "../styles/json-editor.css"

interface Bracket {
  off: number
  line: number
  col: number
  depth: number
  ch: string
  partner: number
  bad: boolean
}

interface Tok {
  cls: string
  s: string
  bid?: number
}

interface LineInfo {
  ws: string
  guideDepth: number
  toks: Tok[]
}

const TOKEN =
  /\s+|"(?:[^"\\]|\\.)*"?|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}[\]]|[:,]|./gy

const PLACEHOLDER = "…"

const INDENT = "\t"

function analyze(text: string): { lines: LineInfo[]; brackets: Bracket[] } {
  const brackets: Bracket[] = []
  const stack: number[] = []
  const lines: LineInfo[] = []
  let offset = 0

  text.split("\n").forEach((line, li) => {
    const ws = /^\s*/.exec(line)?.[0] ?? ""
    const first = line.charAt(ws.length)
    const startsWithClose = first === "}" || first === "]"
    const guideDepth = Math.max(0, stack.length - (startsWithClose ? 1 : 0))
    const toks: Tok[] = []

    TOKEN.lastIndex = ws.length
    let m: RegExpExecArray | null
    while ((m = TOKEN.exec(line)) !== null) {
      const s = m[0]
      const c = s.charAt(0)
      const pos = offset + m.index

      if (c === '"') {
        const isKey = /^\s*:/.test(line.slice(TOKEN.lastIndex))
        toks.push({ cls: isKey ? "jv-key" : "jv-string", s })
      } else if (c === "{" || c === "[") {
        const id = brackets.length
        brackets.push({
          off: pos,
          line: li,
          col: m.index,
          depth: stack.length,
          ch: c,
          partner: -1,
          bad: false,
        })
        toks.push({ cls: `jv-bracket jv-b-${stack.length % 6}`, s, bid: id })
        stack.push(id)
      } else if (c === "}" || c === "]") {
        const id = brackets.length
        const open = stack.pop()
        if (open === undefined) {
          brackets.push({
            off: pos,
            line: li,
            col: m.index,
            depth: 0,
            ch: c,
            partner: -1,
            bad: true,
          })
          toks.push({ cls: "jv-bracket", s, bid: id })
        } else {
          const bad = (brackets[open].ch === "{") !== (c === "}")
          brackets.push({
            off: pos,
            line: li,
            col: m.index,
            depth: brackets[open].depth,
            ch: c,
            partner: open,
            bad,
          })
          brackets[open].partner = id
          brackets[open].bad = bad
          toks.push({ cls: `jv-bracket jv-b-${stack.length % 6}`, s, bid: id })
        }
      } else if (/^\s/.test(c)) {
        toks.push({ cls: "", s })
      } else if (c === ":" || c === ",") {
        toks.push({ cls: "jv-punct", s })
      } else if (/^-?\d/.test(s)) {
        toks.push({ cls: "jv-number", s })
      } else if (s === "true" || s === "false") {
        toks.push({ cls: "jv-boolean", s })
      } else if (s === "null") {
        toks.push({ cls: "jv-null", s })
      } else if (s === PLACEHOLDER) {
        toks.push({ cls: "jve-ph", s })
      } else {
        toks.push({ cls: "jve-err", s })
      }
    }

    lines.push({ ws, guideDepth, toks })
    offset += line.length + 1
  })

  return { lines, brackets }
}

function findFoldable(brackets: Bracket[]): Map<number, number> {
  const map = new Map<number, number>()
  brackets.forEach((b, id) => {
    if ((b.ch !== "{" && b.ch !== "[") || b.partner < 0 || b.bad) return
    if (brackets[b.partner].line <= b.line) return
    if (!map.has(b.line)) map.set(b.line, id)
  })
  return map
}

function buildFolded(
  value: string,
  brackets: Bracket[],
  foldable: Map<number, number>,
  folds: Set<number>,
) {
  const lines = value.split("\n")
  const out: string[] = []
  const map: number[] = []
  let i = 0
  while (i < lines.length) {
    const id = folds.has(i) ? foldable.get(i) : undefined
    if (id !== undefined) {
      const open = brackets[id]
      const close = brackets[open.partner]
      out.push(
        lines[i].slice(0, open.col + 1) +
        ` ${PLACEHOLDER} ` +
        lines[close.line].slice(close.col),
      )
      map.push(i)
      i = close.line + 1
    } else {
      out.push(lines[i])
      map.push(i)
      i++
    }
  }
  return { text: out.join("\n"), map }
}

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function JsonEditor({
                             value,
                             onChange,
                             placeholder,
                             className = "",
                           }: JsonEditorProps) {
  const [caret, setCaret] = useState(-1)
  const [folds, setFolds] = useState<Set<number>>(new Set())
  const [prevValue, setPrevValue] = useState(value)
  const hlRef = useRef<HTMLDivElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const trapTab = useRef(true)

  if (prevValue !== value) {
    setPrevValue(value)
    setFolds(new Set())
  }

  const base = useMemo(() => analyze(value), [value])
  const foldable = useMemo(() => findFoldable(base.brackets), [base])
  const folded = folds.size > 0

  const view = useMemo(
    () =>
      folded ? buildFolded(value, base.brackets, foldable, folds) : null,
    [folded, value, base, foldable, folds],
  )
  const shownText = view ? view.text : value
  const shown = useMemo(() => (view ? analyze(view.text) : base), [view, base])
  const { lines, brackets } = shown
  const origOf = (d: number) => (view ? view.map[d] : d)

  const toggleFold = (line: number) =>
    setFolds((prev) => {
      const next = new Set(prev)
      if (next.has(line)) next.delete(line)
      else next.add(line)
      return next
    })

  const expandAll = () => setFolds(new Set())

  const collapseToLevel = (level: number) => {
    const next = new Set<number>()
    foldable.forEach((id, line) => {
      if (base.brackets[id].depth >= level) next.add(line)
    })
    setFolds(next)
  }

  const active = new Set<number>()
  if (caret >= 0) {
    let idx = brackets.findIndex((b) => b.off === caret - 1)
    if (idx < 0) idx = brackets.findIndex((b) => b.off === caret)
    if (idx >= 0 && brackets[idx].partner >= 0) {
      active.add(idx)
      active.add(brackets[idx].partner)
    }
  }

  const onScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget
    if (hlRef.current) {
      hlRef.current.scrollTop = scrollTop
      hlRef.current.scrollLeft = scrollLeft
    }
    if (gutterRef.current) {
      gutterRef.current.style.transform = `translateY(${-scrollTop}px)`
    }
  }

  const onSelect = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    const { selectionStart, selectionEnd } = e.currentTarget
    setCaret(selectionStart === selectionEnd ? selectionStart : -1)
  }

  const applyEdit = (
    ta: HTMLTextAreaElement,
    start: number,
    end: number,
    text: string,
    selStart: number,
    selEnd: number,
  ) => {
    ta.setSelectionRange(start, end)
    const ok = document.execCommand("insertText", false, text)
    if (!ok) {
      ta.setRangeText(text, start, end, "end")
      onChange(ta.value)
    }
    requestAnimationFrame(() => ta.setSelectionRange(selStart, selEnd))
  }

  const handleTab = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const ta = e.currentTarget
    const { selectionStart: s, selectionEnd: en, value: v } = ta
    const multiline = v.slice(s, en).includes("\n")

    if (!e.shiftKey && !multiline) {
      applyEdit(ta, s, en, INDENT, s + INDENT.length, s + INDENT.length)
      return
    }

    const lineStart = s === 0 ? 0 : v.lastIndexOf("\n", s - 1) + 1
    const endAdj = en > s && v.charAt(en - 1) === "\n" ? en - 1 : en
    const nl = v.indexOf("\n", endAdj)
    const lineEnd = nl === -1 ? v.length : nl
    const lines = v.slice(lineStart, lineEnd).split("\n")

    if (!e.shiftKey) {
      applyEdit(
        ta,
        lineStart,
        lineEnd,
        lines.map((l) => INDENT + l).join("\n"),
        s + INDENT.length,
        en + INDENT.length * lines.length,
      )
      return
    }

    const removed = lines.map((l) =>
      l.startsWith("\t") ? 1 : (/^ {1,2}/.exec(l)?.[0].length ?? 0),
    )
    const out = lines.map((l, i) => l.slice(removed[i])).join("\n")
    const total = removed.reduce((a, b) => a + b, 0)
    const newS = Math.max(lineStart, s - removed[0])
    applyEdit(ta, lineStart, lineEnd, out, newS, Math.max(newS, en - total))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      trapTab.current = false
      return
    }
    if (!folded) {
      const mod = e.ctrlKey || e.metaKey || e.altKey
      if (e.key === "Tab" && !mod && trapTab.current) handleTab(e)
      return
    }
    const printable = e.key.length === 1 && !e.ctrlKey && !e.metaKey
    if (
      printable ||
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Enter"
    ) {
      e.preventDefault()
      expandAll()
    }
  }
  const onBlockedEdit = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!folded) return
    e.preventDefault()
    expandAll()
  }

  const renderWs = (ln: LineInfo): ReactNode => {
    const unit =
      ln.guideDepth > 0 ? Math.floor(ln.ws.length / ln.guideDepth) : 0
    if (unit < 1) return ln.ws
    const parts: ReactNode[] = []
    for (let k = 0; k < ln.guideDepth; k++) {
      parts.push(
        <span key={k} className={`jve-guide jv-g-${k % 6}`}>
          {ln.ws.slice(k * unit, (k + 1) * unit)}
        </span>,
      )
    }
    parts.push(ln.ws.slice(ln.guideDepth * unit))
    return parts
  }

  return (
    <div className={`jv jve ${className}`}>
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
          onClick={expandAll}
          title="Expandir todo"
        >
          <ChevronsUpDown size={14} />
        </button>
        <span className="jv-spacer" />
        {folded && (
          <span className="jve-note">Plegado · escribir expande todo</span>
        )}
      </div>

      <div className="jve-area">
        <div className="jve-gutter">
          <div ref={gutterRef} className="jve-gutter-inner">
            {lines.map((_, d) => {
              const o = origOf(d)
              const can = foldable.has(o)
              const isFolded = folds.has(o)
              return (
                <div key={d} className="jve-gl">
                  <span className="jve-gn">{o + 1}</span>
                  {can ? (
                    <button
                      type="button"
                      className="jv-fold"
                      aria-expanded={!isFolded}
                      aria-label={isFolded ? "Expandir" : "Colapsar"}
                      onClick={() => toggleFold(o)}
                    >
                      <ChevronRight
                        size={12}
                        className={isFolded ? "" : "jv-fold-open"}
                      />
                    </button>
                  ) : (
                    <span className="jv-fold-spacer" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div ref={hlRef} className="jve-hl" aria-hidden="true">
          <div className="jve-hl-inner">
            {lines.map((ln, i) => (
              <div key={i} className="jve-line">
                {renderWs(ln)}
                {ln.toks.map((t, k) => {
                  if (t.bid === undefined) {
                    return (
                      <span key={k} className={t.cls}>
                        {t.s}
                      </span>
                    )
                  }
                  const b = brackets[t.bid]
                  const err = b.bad || b.partner < 0
                  return (
                    <span
                      key={k}
                      className={`${t.cls}${err ? " jve-err" : ""}${
                        active.has(t.bid) ? " jv-bracket-active" : ""
                      }`}
                    >
                      {t.s}
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <textarea
          className="jve-ta"
          value={shownText}
          placeholder={placeholder}
          readOnly={folded}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            if (!folded) onChange(e.target.value)
          }}
          onKeyDown={onKeyDown}
          onPaste={onBlockedEdit}
          onCut={onBlockedEdit}
          onScroll={onScroll}
          onSelect={onSelect}
          onBlur={() => {
            setCaret(-1)
            trapTab.current = true
          }}
        />
      </div>
    </div>
  )
}

export default JsonEditor