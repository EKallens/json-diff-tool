import type { ComparisonOptions } from "@/types/comparison"

export class JsonNormalizer {
    private options: ComparisonOptions

    constructor(options: ComparisonOptions) {
        this.options = options
    }

    normalize(value: any): any {
        if (Array.isArray(value)) {
            const normalized = value.map((item) => this.normalize(item))
            return this.options.ignoreOrder ? normalized.sort() : normalized
        }

        if (value && typeof value === "object") {
            const normalized: any = {}
            const keys = this.options.ignoreOrder ? Object.keys(value).sort() : Object.keys(value)

            for (const key of keys) {
                normalized[key] = this.normalize(value[key])
            }
            return normalized
        }

        if (typeof value === "string" && this.options.ignoreWhitespace) {
            return value.trim()
        }

        return value
    }
}
