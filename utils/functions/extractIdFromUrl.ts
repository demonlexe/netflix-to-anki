export default function extractIdFromUrl(url: string) {
    // Use a regular expression to match the ID in the URL
    const match = url.match(/\/watch\/(\d+)\?/)
    if (match && match[1]) {
        return match[1]
    } else {
        return null // Return null if no match is found
    }
}
