export class JsonParser {
    static parse(jsonString: string): any {
        if (!jsonString.trim()) return {}
        return JSON.parse(jsonString)
    }

    static beautify(jsonString: string): string {
        if (!jsonString.trim()) return jsonString
        const parsed = JsonParser.parse(jsonString)
        return JSON.stringify(parsed, null, 2)
    }

    static isValid(jsonString: string): boolean {
        try {
            JsonParser.parse(jsonString)
            return true
        } catch {
            return false
        }
    }
}
