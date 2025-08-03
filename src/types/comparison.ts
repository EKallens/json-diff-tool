export interface DiffResult {
    path: string
    type: "added" | "removed" | "changed"
    oldValue?: any
    newValue?: any
}

export interface ComparisonOptions {
    ignoreOrder: boolean
    ignoreWhitespace: boolean
}

export interface ComparisonState {
    json1: string
    json2: string
    differences: DiffResult[]
    error: string
    isComparing: boolean
}
