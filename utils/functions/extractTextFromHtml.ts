import { parseFromString } from "dom-parser"

export default function extractTextFromHTML(htmlString: string) {
    // Parse the HTML string into a document
    const doc = parseFromString(htmlString)

    // Find all <span> elements
    const spanElements = doc.getElementsByTagName("span")
    let result = ""

    // Iterate through the <span> elements and extract text content
    spanElements.forEach((span) => {
        // If there is a <br> element, replace it with <br/> in the result string
        const breakElement = span.getElementsByTagName("br")?.[0]
        if (breakElement) {
            result += "<br/>"
        }
        // Append the text content of the <span>
        result += span.textContent
    })

    return result
}
