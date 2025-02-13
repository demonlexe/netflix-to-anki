import logDev from "~utils/functions/logDev"

export default function parseVTT(vttText: string): Record<string, string[]> {
    if (!vttText.trim()) {
        logDev("parseVTT received an empty or invalid string!")
        return {}
    }

    logDev("Parsing VTT content:\n", vttText) // Log full text before parsing

    const vttRegex =
        /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})(?: .*?)?\n+([\s\S]*?)(?=\n\n|\n\d{2}:\d{2}:\d{2}\.\d{3} -->|\Z)/g

    const matches = [...vttText.matchAll(vttRegex)]
    const grouping: Record<string, string[]> = {}

    for (const match of matches) {
        const startTime = match[1] // Capture start time
        const textContent = match[3]
            ?.replace(/position:\d+%/g, "") // Remove metadata
            ?.trim()

        if (!textContent) continue

        // Split lines into separate entries
        const sentences = textContent
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)

        if (grouping[startTime]) {
            grouping[startTime].push(...sentences)
        } else {
            grouping[startTime] = sentences
        }
    }

    return grouping
}
