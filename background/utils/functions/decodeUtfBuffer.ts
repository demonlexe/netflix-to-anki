export async function decodeUtfBuffer(responseBuffer) {
    // Convert ArrayBuffer to a string
    const text = new TextDecoder("utf-8").decode(responseBuffer)

    return text
}
