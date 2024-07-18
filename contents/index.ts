import $ from "jquery"
import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import type {
    GeminiBatchRequestBody,
    GeminiBatchRequestResponse,
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
import { getData } from "~utils/localData"

export const config: PlasmoCSConfig = {
    matches: ["https://www.netflix.com/watch/*"]
}

initData()

declare global {
    interface Window {
        localTranslations: Record<string, string>
        reverseTranslations: Record<string, string>
        batchTranslatedSentences: Record<string, string>
    }
}

window.localTranslations = {}
window.reverseTranslations = {}
window.batchTranslatedSentences = {}

const script = document.createElement("script")
script.setAttribute("type", "text/javascript")
script.setAttribute("src", chrome.runtime.getURL("inject.js"))

document.documentElement.appendChild(script)

async function initBatchTranslatedSentences() {
    const translations = await getAllCachedTranslations()
    if (translations && Object.keys(translations).length > 0)
        window.batchTranslatedSentences = translations

    console.log("Pulled down translations: ", translations)
}

initBatchTranslatedSentences()

// content.js
window.addEventListener("message", async (event) => {
    if (event.source !== window) return
    if (event.data.type && event.data.type === "NETWORK_REQUEST") {
        const openResult: GeminiBatchRequestResponse = await sendToBackground({
            name: "gemini_translate_batch",
            body: { message: event.data } as GeminiBatchRequestBody
        })
        if (!openResult.error) {
            console.log("OPEN RESULT: ", openResult)
            window.batchTranslatedSentences = openResult.translatedPhrases
        }
    }
})

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

const watchTimedText = async (timedText: HTMLElement) => {
    // init setting to default, refetch every 10 seconds
    // TODO: Use a messenger to update this setting instead.
    let autoTranslateEnabled =
        USER_SETTINGS_DEFAULTS["AUTO_TRANSLATE_WHILE_PLAYING"]
    const fetchSetting = async () => {
        autoTranslateEnabled = await getData("AUTO_TRANSLATE_WHILE_PLAYING")
        setTimeout(fetchSetting, 10000)
    }
    fetchSetting()

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
                    autoTranslateEnabled &&
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
