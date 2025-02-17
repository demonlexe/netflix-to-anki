import $ from "jquery"

import { SITE_WATCHERS } from "~utils/constants"

export default function getLiveElement(
    currentText: string = "",
    textContainer?: JQuery<HTMLElement>
) {
    const { captionElement, lookFor, captionParentElement } =
        SITE_WATCHERS[window.usingSite]
    const usingParent =
        $(textContainer).length > 0
            ? $(textContainer)
            : $(`${captionParentElement} ${captionElement}`).length > 0
              ? $(`${captionParentElement} ${captionElement}`)
              : $(captionElement)
    let using =
        usingParent.find(lookFor).length > 0
            ? $(usingParent).find(lookFor)
            : $(usingParent)
    // if the textContainer has no children, just return the textContainer
    if (using.length === 0 && textContainer) return textContainer

    let firstMatch = null
    using.each((_, el) => {
        // if there is any sort of break tag, split it up and check each part.
        if ($(el).html()?.trim()?.includes("<br")) {
            const splitText = currentText.split(/(<br\s*\/>)/g)
            for (const part of splitText) {
                if ($(el).html()?.trim()?.match(part)) {
                    firstMatch = $(el)
                    break
                }
            }
        } else if ($(el).html()?.trim()?.match(currentText)) {
            firstMatch = $(el)
        }
        if (firstMatch) {
            return false
        }
    })
    return firstMatch
}
