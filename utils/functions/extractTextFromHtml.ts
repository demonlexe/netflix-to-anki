import { JSDOM } from "jsdom"

export default function extractTextFromHTML(htmlString: string) {
    if (!htmlString || htmlString.length === 0) return ""

    // Create a JSDOM instance from the HTML string
    const { document } = new JSDOM(htmlString).window

    const childElements = document.body.children
    const spanElements = document.getElementsByTagName("span")
    let result = ""
    if (!spanElements || spanElements.length === 0) {
        // If there are no <span> elements, return the text content of the document
        return htmlString
    }

    // Iterate through the <span> elements and extract text content
    Array.from(childElements).forEach(
        (elem: HTMLSpanElement | HTMLBRElement) => {
            // If there is a <br> element, replace it with <br/> in the result string
            if (elem.tagName === "BR") {
                result += "<br/>"
            } else {
                // Append the text content of the <span>
                result += elem.textContent
            }
        }
    )

    return result?.trim()
}
