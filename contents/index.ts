import $ from "jquery"
import type { PlasmoCSConfig } from "plasmo"

import catchSiteSubtitles from "~contents/catchSiteSubtitles"
import { observeSection } from "~utils"
import { SITE_WATCHERS, USER_SETTINGS_DEFAULTS } from "~utils/constants"
import { pollCachedTranslations } from "~utils/functions/cachedTranslations"
import extractIdFromUrl from "~utils/functions/extractIdFromUrl"
import initData from "~utils/functions/initData"
import handleUrlChange from "~utils/handlers/handleUrlChange"
import { waitForElement } from "~utils/index"
import {
    getData,
    type TranslationsCache,
    type UntranslatedCache,
    type UserSettings
} from "~utils/localData"
import watchTimedText from "~utils/watchers/watchTimedText"

export const config: PlasmoCSConfig = {
    matches: [
        "https://www.netflix.com/*",
        "https://www.hulu.com/*",
        "https://play.max.com/*",
        "https://tubitv.com/*"
    ]
}

initData()

declare global {
    interface Window {
        localTranslations: Record<string, string>
        reverseTranslations: Record<string, string>
        doNotTouchSentences: Record<string, boolean>
        polledSettings: UserSettings
        cachedSiteSentences: string[]
        cachedNextEpisodeSiteSentences: string[]
        untranslatedSentencesCache: UntranslatedCache
        translatedSentencesCache: TranslationsCache
        watchingTimedText: HTMLElement
        currentShowId: string
        usingSite: "netflix" | "hulu" | "hbomax" | "tubi" | "unknown"
    }
}

window.localTranslations = {}
window.reverseTranslations = {}
window.doNotTouchSentences = {}
window.untranslatedSentencesCache = {}
window.translatedSentencesCache = {}
window.cachedSiteSentences = []
window.cachedNextEpisodeSiteSentences = []
window.polledSettings = {
    ...USER_SETTINGS_DEFAULTS,
    TARGET_LANGUAGE: undefined
}
window.currentShowId = extractIdFromUrl(window.location.href)
window.usingSite = window.location.href.includes("netflix")
    ? "netflix"
    : window.location.href.includes("hulu")
      ? "hulu"
      : window.location.href.includes("max")
        ? "hbomax"
        : window.location.href.includes("tubi")
          ? "tubi"
          : "unknown"

const script = document.createElement("script")
script.setAttribute("type", "text/javascript")
script.setAttribute("src", chrome.runtime.getURL("inject.js"))

document.documentElement.appendChild(script)

catchSiteSubtitles()
pollCachedTranslations()

window.addEventListener("load", async () => {
    const { mountPoint, captionElement, captionParentElement } =
        SITE_WATCHERS[window.usingSite]
    const [HULU_ENABLED, NETFLIX_ENABLED, HBOMAX_ENABLED, TUBI_ENABLED] =
        await Promise.all([
            getData("HULU_ENABLED"),
            getData("NETFLIX_ENABLED"),
            getData("HBOMAX_ENABLED"),
            getData("TUBI_ENABLED")
        ])
    if (window.usingSite === "hulu" && HULU_ENABLED == false) {
        return
    } else if (window.usingSite === "netflix" && NETFLIX_ENABLED == false) {
        return
    } else if (window.usingSite === "hbomax" && HBOMAX_ENABLED == false) {
        return
    } else if (window.usingSite === "tubi" && TUBI_ENABLED == false) {
        return
    }

    waitForElement(mountPoint).then(async (mountedElem) => {
        const doOnMountMutate = (mutation: MutationRecord) => {
            handleUrlChange()
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(async (node) => {
                    if ($(node).is(captionElement)) {
                        if (!window.location.href.includes("watch")) {
                            // don't care about home page
                            return
                        }
                        const timedText =
                            await waitForElement(captionParentElement)
                        watchTimedText(timedText)
                    }
                })
            }
        }
        observeSection(mountedElem, doOnMountMutate)
        const firstTimedText = await waitForElement(captionParentElement)
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
