import type { DiffResult, ComparisonOptions } from "@/types/comparison"
import { JsonNormalizer } from "./json-normalizer"

export class JsonComparator {
    private normalizer: JsonNormalizer

    constructor(options: ComparisonOptions) {
        this.normalizer = new JsonNormalizer(options)
    }

    compare(obj1: any, obj2: any, path = ""): DiffResult[] {
        const diffs: DiffResult[] = []
        const normalizedObj1 = this.normalizer.normalize(obj1)
        const normalizedObj2 = this.normalizer.normalize(obj2)

        const allKeys = new Set([...Object.keys(normalizedObj1 || {}), ...Object.keys(normalizedObj2 || {})])

        for (const key of allKeys) {
            const currentPath = path ? `${path}.${key}` : key
            const val1 = normalizedObj1?.[key]
            const val2 = normalizedObj2?.[key]

            if (!(key in (normalizedObj1 || {}))) {
                diffs.push({
                    path: currentPath,
                    type: "added",
                    newValue: val2,
                })
            } else if (!(key in (normalizedObj2 || {}))) {
                diffs.push({
                    path: currentPath,
                    type: "removed",
                    oldValue: val1,
                })
            } else if (this.isObject(val1) && this.isObject(val2)) {
                diffs.push(...this.compare(val1, val2, currentPath))
            } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                diffs.push({
                    path: currentPath,
                    type: "changed",
                    oldValue: val1,
                    newValue: val2,
                })
            }
        }

        return diffs
    }

    private isObject(value: any): boolean {
        return typeof value === "object" && value !== null
    }
}
