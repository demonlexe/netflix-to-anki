export default function processGeminiJson(
    json: string
): Record<string, string> {
    if (!json) return {}
    // if the last character is ], replace it with } this is a common gemini mistake
    // if the first character is [, replace it with { this is a less common gemini mistake
    return JSON.parse(json.trim().replace(/^\[/, "{").replace(/\]$/, "}"))
}
