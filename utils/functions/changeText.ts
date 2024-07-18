import $ from "jquery"

import { removeElementSiblings } from "~utils"

export default function changeText(
    elem: JQuery<EventTarget | HTMLElement>,
    newText: string,
    color: string = "yellow"
) {
    newText = newText?.trim()
    if (!newText || newText.length === 0) return
    $(elem).text(newText)
    $(elem).css("color", color)
    removeElementSiblings(elem[0] as HTMLElement)
}
