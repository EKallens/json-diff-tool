import type { DiffResult, ComparisonOptions } from "@/types/comparison"
import { JsonParser } from "./json-parser"
import { JsonComparator } from "./json-comparator"

export class ComparisonService {
    static async compareJsonStrings(json1: string, json2: string, options: ComparisonOptions): Promise<DiffResult[]> {
        if (!json1.trim() && !json2.trim()) {
            throw new Error("Please enter JSON data in at least one field")
        }

        const parsed1 = JsonParser.parse(json1)
        const parsed2 = JsonParser.parse(json2)

        const comparator = new JsonComparator(options)
        return comparator.compare(parsed1, parsed2)
    }

    static beautifyJson(jsonString: string): string {
        return JsonParser.beautify(jsonString)
    }
}
