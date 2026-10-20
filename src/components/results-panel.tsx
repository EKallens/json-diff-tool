import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy } from "lucide-react"
import type { DiffResult } from "@/types/comparison"
import { DiffResultItem } from "./diff-result-item"

interface ResultsPanelProps {
    differences: DiffResult[]
    hasInput: boolean
    error: string
    isComparing: boolean
}

export function ResultsPanel({ differences, hasInput, error, isComparing }: ResultsPanelProps) {
    if (differences.length > 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Comparison Results</span>
                        <Badge variant="secondary">
                            {differences.length} difference{differences.length !== 1 ? "s" : ""} found
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {differences.map((diff) => (
                            <DiffResultItem diff={diff} leftLabel="Original" rightLabel="Comparison" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (differences.length === 0 && hasInput && !error && !isComparing) {
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <div className="text-green-600 mb-2">
                        <Copy className="h-8 w-8 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Differences Found</h3>
                    <p className="text-gray-600">The JSON objects are identical with the current comparison settings.</p>
                </CardContent>
            </Card>
        )
    }

    return null
}
