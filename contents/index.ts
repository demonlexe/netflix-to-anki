import $ from "jquery"
import type { PlasmoCSConfig } from "plasmo"

import catchHuluSubtitles from "~contents/catchHuluSubtitles"
import { observeSection } from "~utils"
import { USER_SETTINGS_DEFAULTS } from "~utils/constants"
import { pollCachedTranslations } from "~utils/functions/cachedTranslations"
import extractIdFromUrl from "~utils/functions/extractMovieFromNetflixUrl"
import initData from "~utils/functions/initData"
import handleUrlChange from "~utils/handlers/handleUrlChange"
import { waitForElement } from "~utils/index"
import type {
    TranslationsCache,
    UntranslatedCache,
    UserSettings
} from "~utils/localData"
import watchTimedText from "~utils/watchers/watchTimedText"

import catchNetflixSubtitles from "./catchNetflixSubtitles"

export const config: PlasmoCSConfig = {
    matches: ["https://www.netflix.com/*", "https://www.hulu.com/*"]
}

initData()

declare global {
    interface Window {
        localTranslations: Record<string, string>
        reverseTranslations: Record<string, string>
        doNotTouchSentences: Record<string, boolean>
        polledSettings: UserSettings
        cachedVideoSentences: string[]
        cachedNextEpisodeVideoSentences: string[]
        untranslatedSentencesCache: UntranslatedCache
        translatedSentencesCache: TranslationsCache
        watchingTimedText: HTMLElement
        currentShowId: string
    }
}

window.localTranslations = {}
window.reverseTranslations = {}
window.doNotTouchSentences = {}
window.untranslatedSentencesCache = {}
window.translatedSentencesCache = {}
window.cachedVideoSentences = []
window.cachedNextEpisodeVideoSentences = []
window.polledSettings = {
    ...USER_SETTINGS_DEFAULTS,
    TARGET_LANGUAGE: undefined
}
window.currentShowId = extractIdFromUrl(window.location.href)

const script = document.createElement("script")
script.setAttribute("type", "text/javascript")
script.setAttribute("src", chrome.runtime.getURL("inject.js"))

document.documentElement.appendChild(script)

catchNetflixSubtitles()
catchHuluSubtitles()
pollCachedTranslations()

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
