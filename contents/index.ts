import $ from "jquery"
import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import type {
    GeminiSingleRequestBody,
    GeminiSingleRequestResponse
} from "~background/types"
import { isYellow, left_right_click, observeSection } from "~utils"
import { USER_SETTINGS_DEFAULTS } from "~utils/constants"
import changeText from "~utils/functions/changeText"
import checkForExistingTranslation from "~utils/functions/checkForExistingTranslation"
import getAllCachedTranslations from "~utils/functions/getAllCachedTranslations"
import initData from "~utils/functions/initData"
import translateOnePhraseLocal from "~utils/functions/translateOnePhraseLocal"
import updateNeedToStudy from "~utils/functions/updateNeedToStudy"
import updateTranslations from "~utils/functions/updateTranslations"
import { waitForElement } from "~utils/index"
import { getData, type UserSettings } from "~utils/localData"

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
        polledSettings: UserSettings
        untranslatedSentences: string[]
    }
}

window.localTranslations = {}
window.reverseTranslations = {}
window.batchTranslatedSentences = {}
window.reverseBatchTranslatedSentences = {}
window.polledSettings = USER_SETTINGS_DEFAULTS
window.untranslatedSentences = []

const script = document.createElement("script")
script.setAttribute("type", "text/javascript")
script.setAttribute("src", chrome.runtime.getURL("inject.js"))

document.documentElement.appendChild(script)

async function initBatchTranslatedSentences() {
    const translations = await getAllCachedTranslations()
    if (translations && Object.keys(translations).length > 0) {
        window.batchTranslatedSentences = translations
        for (const key in translations) {
            window.reverseBatchTranslatedSentences[translations[key]] = key
        }
    }

    console.log("Pulled down translations: ", translations)
}

initBatchTranslatedSentences()
catchNetflixSubtitles()

// Given the element, translate the text and update the cache.
// Return "true" if it should play the video.
const onLeftClick = async (elem: Element) => {
    const currentText = $(elem).text()?.trim()
    if (!currentText || currentText.length === 0) return false
    const tryTranslateLocal = translateOnePhraseLocal(currentText)
    if (tryTranslateLocal !== null) return tryTranslateLocal

    const openResult: GeminiSingleRequestResponse = await sendToBackground({
        name: "gemini_translate",
        body: { phrases: [currentText] } as GeminiSingleRequestBody
    })
    console.log("Single Click API Result: ", openResult)
    updateTranslations(currentText, openResult.translatedPhrases[currentText])
    updateNeedToStudy(currentText, openResult.translatedPhrases[currentText])
    return false
}

// Translate all the text currently on the screen and update the cache.
// Return "true" if it should play the video.
const onRightClick = async () => {
    // get array of all texts stored in .player-timedtext-text-container
    const allTexts: string[] = []
    $(".player-timedtext-text-container").each((_, el) => {
        allTexts.push($(el).text()?.trim())
    })

    // if there is no need to do the grouped translation, return early
    if (allTexts.length === 0) return false
    if (allTexts.length === 1) {
        const tryTranslateLocal = translateOnePhraseLocal(allTexts[0])
        if (tryTranslateLocal !== null) return tryTranslateLocal
    }

    const openResult: GeminiSingleRequestResponse = await sendToBackground({
        name: "gemini_translate",
        body: { phrases: allTexts } as GeminiSingleRequestBody
    })
    console.log("Right Click API Result: ", openResult)
    const translatedTexts: string[] = []
    allTexts.forEach((currentText) => {
        updateTranslations(
            currentText,
            openResult.translatedPhrases[currentText]
        )
        translatedTexts.push(openResult.translatedPhrases[currentText])
    })
    const text1 = allTexts.join(" ").replace(/\s+/g, " ") // remove extra spaces
    const text2 = translatedTexts.join(" ").replace(/\s+/g, " ") // remove extra spaces
    updateNeedToStudy(text1, text2)
    return false
}

// refetch settings every 8 seconds
const pollSettings = async () => {
    Object.keys(USER_SETTINGS_DEFAULTS).forEach(async (key) => {
        window.polledSettings[key] = await getData(key as keyof UserSettings)
    })
    setTimeout(pollSettings, 8000)
}

const watchTimedText = async (timedText: HTMLElement) => {
    pollSettings()
    left_right_click($(".watch-video"), onLeftClick, onRightClick)

    const doOnMutation = (mutation: MutationRecord) => {
        if (mutation?.addedNodes?.length > 0) {
            // loop all added nodes and log if they are clicked.
            for (const node of mutation.addedNodes) {
                const deepestSpan = $(node).find("span").last()
                const currentText = $(node).text()?.trim()
                const existingTranslation =
                    checkForExistingTranslation(currentText)
                if (
                    window.localTranslations[currentText] &&
                    !isYellow(deepestSpan)
                ) {
                    changeText(
                        deepestSpan,
                        window.localTranslations[currentText]
                    )
                } else if (
                    window.polledSettings.AUTO_TRANSLATE_WHILE_PLAYING &&
                    existingTranslation &&
                    !isYellow(deepestSpan)
                ) {
                    changeText(deepestSpan, existingTranslation)
                }
            }
            $(timedText).css("pointer-events", "auto")
        }
    }
    observeSection(timedText, doOnMutation)
}

window.addEventListener("load", () => {
    waitForElement("#appMountPoint").then(async (mountedElem) => {
        const doOnMountMutate = (mutation: MutationRecord) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(async (node) => {
                    // if the node is .player-timedtext
                    if ($(node).hasClass("player-timedtext")) {
                        const nodeAsElem = await waitForElement(node)
                        watchTimedText(nodeAsElem)
                    }
                })
            }
        }
        observeSection(mountedElem, doOnMountMutate)
        const firstTimedText = await waitForElement(".player-timedtext")
        watchTimedText(firstTimedText)
    })
})
