import $ from "jquery"

import { SITE_WATCHERS } from "~utils/constants"
import extractTextFromHTML from "~utils/functions/extractTextFromHtml"

export default function changeText(
    elem: JQuery<any>,
    newText: string,
    color: string = "yellow"
) {
    const { lookFor } = SITE_WATCHERS[window.usingSite]
    const currentText = extractTextFromHTML(elem?.[0]?.innerHTML)
    const breakOnBefore = currentText?.split(/(<br\s*\/>)/g)
    const breakOnAfter = newText?.split(/(<br\s*\/>)/g)

    if (breakOnBefore.length !== breakOnAfter.length) return // do nothing, not matching

    // if it's not nested, just change the text
    if (
        elem?.[0]?.innerHTML?.replace("<br>", "<br/>") ===
        currentText?.replace("<br>", "<br/>")
    ) {
        doChangeText(elem, newText, color)
        return
    }

    for (const [index, piece] of Object.entries(breakOnBefore)) {
        // if not found, use the parent element if the test matches the piece
        const lastSpanWithPiece = $(elem)
            .find(`${lookFor}:contains("${piece}")`)
            .last()
        const changeSpan =
            lastSpanWithPiece.length > 0 ? lastSpanWithPiece : elem
        const previousWasBreak =
            breakOnBefore[parseInt(index) - 1]?.match(/(<br\s*\/>)/)?.length > 0
        const newText = previousWasBreak
            ? `<br/>${breakOnAfter[index]}`
            : breakOnAfter[index]
        doChangeText(changeSpan, newText, color)
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
