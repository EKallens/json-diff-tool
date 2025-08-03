import type { DiffResult } from "@/types/comparison"

export class DiffFormatter {
    static formatValue(value: any): string {
        if (value === null) return "null"
        if (value === undefined) return "undefined"
        if (typeof value === "string") return `"${value}"`
        if (typeof value === "object") return JSON.stringify(value, null, 2)
        return String(value)
    }

    static getDiffColor(type: DiffResult["type"]): string {
        switch (type) {
            case "added":
                return "bg-green-50 border-green-200 text-green-800"
            case "removed":
                return "bg-red-50 border-red-200 text-red-800"
            case "changed":
                return "bg-blue-50 border-blue-200 text-blue-800"
            default:
                return ""
        }
    }
}
