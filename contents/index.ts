import $ from "jquery"
import type { PlasmoCSConfig } from "plasmo"

import { observeSection } from "~utils"
import { USER_SETTINGS_DEFAULTS } from "~utils/constants"
import extractIdFromUrl from "~utils/functions/extractMovieFromNetflixUrl"
import initBatchTranslatedSentences from "~utils/functions/initBatchTranslatedSentences"
import initData from "~utils/functions/initData"
import resetNetflixContext from "~utils/functions/resetNetflixContext"
import handleUrlChange from "~utils/handlers/handleUrlChange"
import { waitForElement } from "~utils/index"
import { type UserSettings } from "~utils/localData"
import watchTimedText from "~utils/watchers/watchTimedText"

import catchNetflixSubtitles from "./catchNetflixSubtitles"

export const config: PlasmoCSConfig = {
    matches: ["https://www.netflix.com/watch/*"]
}

initData()

declare global {
    interface Window {
        localTranslations: Record<string, string>
        reverseTranslations: Record<string, string>
        batchTranslatedSentences: Record<string, string>
        reverseBatchTranslatedSentences: Record<string, string>
        doNotTouchSentences: Record<string, boolean>
        polledSettings: UserSettings
        allNetflixSentences: string[]
        untranslatedSentences: string[]
        batchTranslateRetries: number
        maxOfBatch: number
        watchingTimedText: HTMLElement
        currentShowId: string
    }
}

window.localTranslations = {}
window.reverseTranslations = {}
window.batchTranslatedSentences = {}
window.reverseBatchTranslatedSentences = {}
window.doNotTouchSentences = {}
window.polledSettings = USER_SETTINGS_DEFAULTS
window.currentShowId = extractIdFromUrl(window.location.href)
resetNetflixContext()

const script = document.createElement("script")
script.setAttribute("type", "text/javascript")
script.setAttribute("src", chrome.runtime.getURL("inject.js"))

document.documentElement.appendChild(script)

initBatchTranslatedSentences()
catchNetflixSubtitles()

window.addEventListener("load", () => {
    waitForElement("#appMountPoint").then(async (mountedElem) => {
        const doOnMountMutate = (mutation: MutationRecord) => {
            handleUrlChange()
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(async (node) => {
                    // if the node is .player-timedtext
                    if ($(node).hasClass("player-timedtext-text-container")) {
                        if (!window.location.href.includes("watch")) {
                            // don't care about home page
                            return
                        }
                        const timedText =
                            await waitForElement(".player-timedtext")
                        watchTimedText(timedText)
                    }
                })
            }
        }
        observeSection(mountedElem, doOnMountMutate)
        const firstTimedText = await waitForElement(".player-timedtext")
        watchTimedText(firstTimedText)
    })
})

window.addEventListener("popstate", () => {
    handleUrlChange()
})

// Listen for pushState and replaceState changes
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function (...args) {
    originalPushState.apply(this, args)
    handleUrlChange()
}

history.replaceState = function (...args) {
    originalReplaceState.apply(this, args)
    handleUrlChange()
}
