import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Edit3 } from "lucide-react"
import type { DiffResult } from "@/types/comparison"
import { DiffFormatter } from "@/utils/diff-formatter"

interface DiffResultItemProps {
    diff: DiffResult
}

export function DiffResultItem({ diff }: DiffResultItemProps) {
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

    return (
        <div className={`p-4 rounded-lg border ${DiffFormatter.getDiffColor(diff.type)}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getDiffIcon(diff.type)}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                            {diff.path}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            {diff.type}
                        </Badge>
                    </div>

                    {diff.type === "changed" && (
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm font-medium text-red-700">- Old: </span>
                                <code className="text-sm bg-red-100 px-2 py-1 rounded">{DiffFormatter.formatValue(diff.oldValue)}</code>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-green-700">+ New: </span>
                                <code className="text-sm bg-green-100 px-2 py-1 rounded">
                                    {DiffFormatter.formatValue(diff.newValue)}
                                </code>
                            </div>
                        </div>
                    )}

                    {diff.type === "added" && (
                        <div>
                            <span className="text-sm font-medium text-green-700">+ Added: </span>
                            <code className="text-sm bg-green-100 px-2 py-1 rounded">{DiffFormatter.formatValue(diff.newValue)}</code>
                        </div>
                    )}

                    {diff.type === "removed" && (
                        <div>
                            <span className="text-sm font-medium text-red-700">- Removed: </span>
                            <code className="text-sm bg-red-100 px-2 py-1 rounded">{DiffFormatter.formatValue(diff.oldValue)}</code>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
