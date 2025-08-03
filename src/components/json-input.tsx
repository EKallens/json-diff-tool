import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

interface JsonInputProps {
    label: string
    badge: string
    value: string
    onChange: (value: string) => void
    onBeautify: () => void
    placeholder?: string
}

export function JsonInput({ label, badge, value, onChange, onBeautify, placeholder }: JsonInputProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Badge variant="outline">{badge}</Badge>
                        {label}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onBeautify} disabled={!value.trim()} className="h-8 px-2">
                        <Sparkles className="h-4 w-4 mr-1" />
                        Beautify
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                />
            </CardContent>
        </Card>
    )
}
