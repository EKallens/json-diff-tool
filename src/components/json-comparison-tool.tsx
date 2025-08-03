import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useJsonComparison } from "@/hooks/use-json-comparison"
import { JsonInput } from "@/components/json-input"
import { ComparisonOptionsPanel } from "@/components/comparison-options"
import { ResultsPanel } from "@/components/results-panel"

export default function JsonComparisonTool() {
    const {
        state,
        options,
        updateJson1,
        updateJson2,
        updateOptions,
        compareJsons,
        beautifyJson1,
        beautifyJson2,
        clearAll,
        loadSampleData,
    } = useJsonComparison()

    const hasInput = Boolean(state.json1.trim() || state.json2.trim())

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">JSON Comparison Tool</h1>
                    <p className="text-gray-600">Compare two JSON objects and visualize the differences</p>
                </div>

                {/* Controls */}
                <ComparisonOptionsPanel
                    options={options}
                    onOptionsChange={updateOptions}
                    onLoadSample={loadSampleData}
                    onClearAll={clearAll}
                />

                {/* JSON Input Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <JsonInput
                        label="Original"
                        badge="JSON 1"
                        value={state.json1}
                        onChange={updateJson1}
                        onBeautify={beautifyJson1}
                        placeholder="Paste your first JSON here..."
                    />
                    <JsonInput
                        label="Comparison"
                        badge="JSON 2"
                        value={state.json2}
                        onChange={updateJson2}
                        onBeautify={beautifyJson2}
                        placeholder="Paste your second JSON here..."
                    />
                </div>

                {/* Compare Button */}
                <div className="flex justify-center">
                    <Button onClick={compareJsons} disabled={state.isComparing} size="lg" className="px-8">
                        {state.isComparing ? "Comparing..." : "Compare JSONs"}
                    </Button>
                </div>

                {/* Error Display */}
                {state.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                )}

                {/* Results Panel */}
                <ResultsPanel
                    differences={state.differences}
                    hasInput={hasInput}
                    error={state.error}
                    isComparing={state.isComparing}
                />
            </div>
        </div>
    )
}
