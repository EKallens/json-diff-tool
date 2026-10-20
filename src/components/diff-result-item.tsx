import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Edit3 } from "lucide-react"
import type { ReactNode } from "react"
import type { DiffResult } from "@/types/comparison"
import { DiffFormatter } from "@/utils/diff-formatter"

interface DiffResultItemProps {
    diff: DiffResult
    leftLabel?: string
    rightLabel?: string
}

const TYPE_LABEL: Record<string, string> = {
    added: "Agregada",
    removed: "Eliminada",
    changed: "Modificada",
}

function SideChip({ side, label }: { side: "left" | "right"; label: string }) {
    const color =
      side === "left"
        ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
        : "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
    return (
      <span
        className={`inline-flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded px-1.5 font-mono text-xs font-semibold ${color}`}
      >
            {label}
        </span>
    )
}

function ValueRow({side, label, tone, children}: {
    side: "left" | "right"
    label: string
    tone: "add" | "remove" | "missing"
    children?: ReactNode
}) {
    return (
      <div className="flex items-start gap-2">
          <SideChip side={side} label={label} />
          {tone === "missing" ? (
            <span className="py-0.5 text-sm italic text-muted-foreground">no existe</span>
          ) : (
            <>
                    <span
                      className={`w-3 flex-shrink-0 py-0.5 text-sm font-medium ${
                        tone === "add" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                      }`}
                    >
                        {tone === "add" ? "+" : "−"}
                    </span>
                <code
                  className={`min-w-0 whitespace-pre-wrap break-all rounded px-2 py-1 text-sm ${
                    tone === "add"
                      ? "bg-green-100 text-green-900 dark:bg-green-500/20 dark:text-green-200"
                      : "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200"
                  }`}
                >
                    {children}
                </code>
            </>
          )}
      </div>
    )
}

export function DiffResultItem({ diff, leftLabel = "A", rightLabel = "B" }: DiffResultItemProps) {
    const getDiffIcon = (type: DiffResult["type"]) => {
        switch (type) {
            case "added":
                return <Plus className="h-4 w-4" />
            case "removed":
                return <Minus className="h-4 w-4" />
            case "changed":
                return <Edit3 className="h-4 w-4" />
            default:
                return null
        }
    }

    const summary =
      diff.type === "added"
        ? `Solo en ${rightLabel} · no existe en ${leftLabel}`
        : diff.type === "removed"
          ? `Solo en ${leftLabel} · no existe en ${rightLabel}`
          : `Distinta entre ${leftLabel} y ${rightLabel}`

    return (
      <div className={`p-4 rounded-lg border ${DiffFormatter.getDiffColor(diff.type)}`}>
          <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getDiffIcon(diff.type)}</div>
              <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                          {diff.path}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                          {TYPE_LABEL[diff.type] ?? diff.type}
                      </Badge>
                      <span className="text-xs font-medium">{summary}</span>
                  </div>

                  <div className="space-y-2">
                      {diff.type === "changed" && (
                        <>
                            <ValueRow side="left" label={leftLabel} tone="remove">
                                {DiffFormatter.formatValue(diff.oldValue)}
                            </ValueRow>
                            <ValueRow side="right" label={rightLabel} tone="add">
                                {DiffFormatter.formatValue(diff.newValue)}
                            </ValueRow>
                        </>
                      )}

                      {diff.type === "added" && (
                        <>
                            <ValueRow side="left" label={leftLabel} tone="missing" />
                            <ValueRow side="right" label={rightLabel} tone="add">
                                {DiffFormatter.formatValue(diff.newValue)}
                            </ValueRow>
                        </>
                      )}

                      {diff.type === "removed" && (
                        <>
                            <ValueRow side="left" label={leftLabel} tone="remove">
                                {DiffFormatter.formatValue(diff.oldValue)}
                            </ValueRow>
                            <ValueRow side="right" label={rightLabel} tone="missing" />
                        </>
                      )}
                  </div>
              </div>
          </div>
      </div>
    )
}