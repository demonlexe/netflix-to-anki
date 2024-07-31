import $ from "jquery"

import { SITE_WATCHERS } from "~utils/constants"

export default function getLiveElement(
    currentText: string = "",
    textContainer?: JQuery<HTMLElement>
) {
    const { captionElement } = SITE_WATCHERS[window.usingSite]
    return (textContainer ?? $(captionElement))
        .find(`span:contains("${currentText}")`)
        .first()
}
