import $ from "jquery"

import { SITE_WATCHERS } from "~utils/constants"

import onClick from "./handlers/onClick"

export function observeSection(
    section: HTMLElement,
    doOnMutation: (mutation: MutationRecord) => void
) {
    // Options for the observer (which mutations to observe)
    const config = {
        childList: true,
        subtree: true
    }

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
            doOnMutation(mutation)
        }
    })

    // Start observing the target node for configured mutations
    observer.observe(section, config)
}

export function waitForElement(
    selector,
    customDom?: Document
): Promise<HTMLElement> {
    if (customDom) {
        return new Promise((resolve) => {
            if (customDom.querySelector(selector)) {
                return resolve(customDom.querySelector(selector))
            }

            const observer = new MutationObserver(() => {
                if (customDom.querySelector(selector)) {
                    resolve(customDom.querySelector(selector))
                    observer.disconnect()
                }
            })

            observer.observe(customDom.body, {
                childList: true,
                subtree: true
            })
        })
    }
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector))
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector))
                observer.disconnect()
            }
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    })
}

export function removeNoPointerEvents(
    element: HTMLElement | JQuery<HTMLElement> | Node
) {
    $(element).css("pointer-events", "all")
    $(element).css("user-select", "auto")
    $(element).css("zindex", 1000)
    $(element).css("z-index", 1000)
}

export function insideWhichDiv(
    event: JQuery.ClickEvent | JQuery.ContextMenuEvent
) {
    const mouseX = event.clientX
    const mouseY = event.clientY
    const { captionElement } = SITE_WATCHERS[window.usingSite]

    const divElements = document.querySelectorAll(captionElement)
    for (const divElement of divElements) {
        const isInside = isMouseInsideDiv(mouseX, mouseY, divElement)
        if (isInside) {
            return divElement
        }
    }
    return null
}

export function isYellow(elem: JQuery<EventTarget | HTMLElement>) {
    // if element has children, check those too for isYellow
    const childIsYellow = () => {
        let b = false
        $(elem)
            .children()
            .each((_, child) => {
                if (isYellow($(child))) {
                    b = true
                }
            })
        return b
    }
    return $(elem).children().length > 0 && childIsYellow()
        ? true
        : $(elem).css("color") === "yellow" ||
              $(elem).css("color") === "rgb(255, 255, 0)"
}

export function isMouseInsideDiv(mouseX, mouseY, divElement) {
    const rect = divElement.getBoundingClientRect()

    // Check if the mouse coordinates are within the bounds of the div's rectangle
    if (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
    ) {
        return true
    } else {
        return false
    }
}

export function isVideoPaused() {
    const video = $("video")
    var videoElement = video.get(0) as HTMLVideoElement

    return videoElement.paused
}

export function checkStopPropagation(event) {
    if (isVideoPaused()) {
        event.stopPropagation()
        return true
    }
}

export function removeElementSiblings(element: HTMLElement) {
    $(element).siblings().remove()
}

export function download(file: File) {
    const link = document.createElement("a")
    const url = URL.createObjectURL(file)

    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}
