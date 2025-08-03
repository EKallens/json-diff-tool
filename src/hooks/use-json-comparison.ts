import { useState } from "react"
import type { ComparisonOptions, ComparisonState } from "@/types/comparison"
import { ComparisonService } from "@/lib/comparison-service"

export function useJsonComparison() {
    const [state, setState] = useState<ComparisonState>({
        json1: "",
        json2: "",
        differences: [],
        error: "",
        isComparing: false,
    })

    const [options, setOptions] = useState<ComparisonOptions>({
        ignoreOrder: false,
        ignoreWhitespace: true,
    })

    const updateJson1 = (value: string) => {
        setState((prev) => ({ ...prev, json1: value }))
    }

    const updateJson2 = (value: string) => {
        setState((prev) => ({ ...prev, json2: value }))
    }

    const updateOptions = (newOptions: Partial<ComparisonOptions>) => {
        setOptions((prev) => ({ ...prev, ...newOptions }))
    }

    const compareJsons = async () => {
        setState((prev) => ({ ...prev, error: "", isComparing: true }))

        try {
            const differences = await ComparisonService.compareJsonStrings(state.json1, state.json2, options)
            setState((prev) => ({ ...prev, differences, isComparing: false }))
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Invalid JSON format. Please check your input."
            setState((prev) => ({
                ...prev,
                error: errorMessage,
                isComparing: false,
            }))
        }
    }

    const beautifyJson1 = () => {
        try {
            const beautified = ComparisonService.beautifyJson(state.json1)
            updateJson1(beautified)
        } catch {
            // Silently ignore invalid JSON
        }
    }

    const beautifyJson2 = () => {
        try {
            const beautified = ComparisonService.beautifyJson(state.json2)
            updateJson2(beautified)
        } catch {
            // Silently ignore invalid JSON
        }
    }

    const clearAll = () => {
        setState({
            json1: "",
            json2: "",
            differences: [],
            error: "",
            isComparing: false,
        })
    }

    const loadSampleData = () => {
        setState((prev) => ({
            ...prev,
            json1: `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming"],
  "address": {
    "street": "123 Main St",
    "zipcode": "10001"
  }
}`,
            json2: `{
  "name": "John Doe",
  "age": 31,
  "city": "Boston",
  "hobbies": ["reading", "cycling", "swimming"],
  "address": {
    "street": "456 Oak Ave",
    "zipcode": "02101"
  },
  "email": "john@example.com"
}`,
            differences: [],
            error: "",
        }))
    }

    return {
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
    }
}
