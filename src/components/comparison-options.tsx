import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw } from "lucide-react"
import type { ComparisonOptions } from "@/types/comparison"

interface ComparisonOptionsProps {
    options: ComparisonOptions
    onOptionsChange: (options: Partial<ComparisonOptions>) => void
    onLoadSample: () => void
    onClearAll: () => void
}

export function ComparisonOptionsPanel({ options, onOptionsChange, onLoadSample, onClearAll }: ComparisonOptionsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Comparison Options</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-6 items-center">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="ignore-order"
                            checked={options.ignoreOrder}
                            onCheckedChange={(checked) => onOptionsChange({ ignoreOrder: checked })}
                        />
                        <Label htmlFor="ignore-order">Ignore key/array order</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="ignore-whitespace"
                            checked={options.ignoreWhitespace}
                            onCheckedChange={(checked) => onOptionsChange({ ignoreWhitespace: checked })}
                        />
                        <Label htmlFor="ignore-whitespace">Ignore whitespace</Label>
                    </div>
                    <div className="flex gap-2 ml-auto">
                        <Button variant="outline" size="sm" onClick={onLoadSample}>
                            Load Sample
                        </Button>
                        <Button variant="outline" size="sm" onClick={onClearAll}>
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Clear All
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
