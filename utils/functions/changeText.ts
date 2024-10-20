import $ from "jquery"

import extractTextFromHTML from "~utils/functions/extractTextFromHtml"

export default function changeText(
    elem: JQuery<HTMLElement>,
    newText: string,
    color: string = "yellow"
) {
    const currentText = extractTextFromHTML(elem?.[0]?.innerHTML)
    const breakOnBefore = currentText?.split(/(<br\s*\/>)/g)
    const breakOnAfter = newText?.split(/(<br\s*\/>)/g)

    if (breakOnBefore.length !== breakOnAfter.length) return // do nothing, not matching

    for (const [index, piece] of Object.entries(breakOnBefore)) {
        // find deepest span matching this piece
        const deepestSpan = $(elem).find(`span:contains("${piece}")`).last()
        const previousWasBreak =
            breakOnBefore[parseInt(index) - 1]?.match(/(<br\s*\/>)/)?.length > 0
        const newText = previousWasBreak
            ? `<br/>${breakOnAfter[index]}`
            : breakOnAfter[index]
        doChangeText(deepestSpan, newText, color)
    }
}

const doChangeText = (
    span: JQuery<HTMLElement>,
    newText: string,
    color: string
) => {
    newText = newText?.trim()
    if (!newText || newText.length === 0) return
    $(span).html(newText)
    $(span).css("color", color)
}
