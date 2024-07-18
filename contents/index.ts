import $ from "jquery"
import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import type {
    GeminiBatchRequestBody,
    GeminiBatchRequestResponse,
    GeminiSingleRequestBody,
    GeminiSingleRequestResponse
} from "~background/types"
import {
    isYellow,
    left_right_click,
    observeSection,
    removeElementSiblings
} from "~utils"
import getAllCachedTranslations from "~utils/getAllCachedTranslations"
import { waitForElement } from "~utils/index"
import initData from "~utils/initData"
import updateNeedToStudy from "~utils/updateNeedToStudy"

export const config: PlasmoCSConfig = {
    matches: ["https://www.netflix.com/watch/*"]
}

initData()

const localTranslations = {}
const reverseTranslations = {}
let batchTranslatedSentences = {}

const script = document.createElement("script")
script.setAttribute("type", "text/javascript")
script.setAttribute("src", chrome.runtime.getURL("inject.js"))

document.documentElement.appendChild(script)

async function initBatchTranslatedSentences() {
    const translations = await getAllCachedTranslations()
    if (translations && Object.keys(translations).length > 0)
        batchTranslatedSentences = translations

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
            batchTranslatedSentences = openResult.translatedPhrases
        }
    }
})

function updateTranslations(currentText: string, translatedText: string) {
    // pre-processing
    currentText = currentText.trim()
    translatedText = translatedText.trim()

    // update the displayed text
    const liveElement = $(`span:contains("${currentText}")`).find("span").last()
    changeText(liveElement, translatedText)

    // update the cache
    localTranslations[currentText] = translatedText
    reverseTranslations[translatedText] = currentText
}

function changeText(
    elem: JQuery<EventTarget | HTMLElement>,
    newText: string,
    color: string = "yellow"
) {
    newText = newText.trim()
    $(elem).text(newText)
    $(elem).css("color", color)
    removeElementSiblings(elem[0] as HTMLElement)
}

function checkForExistingTranslation(phrase: string) {
    // pre-processing
    phrase = phrase?.trim()
    if (!phrase || phrase.length === 0) return null

    if (localTranslations[phrase]) {
        return localTranslations[phrase]
    } else if (batchTranslatedSentences[phrase]) {
        return batchTranslatedSentences[phrase]
    }
    return null
}

const onLeftClick = async (elem: Element) => {
    const currentText = $(elem).text().trim()
    const liveElement = $(`span:contains("${currentText}")`).find("span").last()
    const existingTranslation = checkForExistingTranslation(currentText)
    if (isYellow($(liveElement)) && reverseTranslations[currentText]) {
        // Untranslate the text.
        changeText($(liveElement), reverseTranslations[currentText], "white")
        localTranslations[reverseTranslations[currentText]] = null
        return
    } else if (existingTranslation) {
        updateTranslations(currentText, existingTranslation)
        updateNeedToStudy(currentText, existingTranslation)
        return
    }
    const openResult: GeminiSingleRequestResponse = await sendToBackground({
        name: "gemini_translate",
        body: { phrases: [currentText] } as GeminiSingleRequestBody
    })
    console.log("Single Click API Result: ", openResult)
    updateTranslations(currentText, openResult.translatedPhrases[currentText])
    updateNeedToStudy(currentText, openResult.translatedPhrases[currentText])
}

const onRightClick = async () => {
    // get array of all texts stored in .player-timedtext-text-container
    const allTexts: string[] = []
    $(".player-timedtext-text-container").each((_, el) => {
        allTexts.push($(el).text().trim())
    })

    // if there is no need to do the grouped translation, return early
    if (allTexts.length === 0) return
    if (allTexts.length === 1 && checkForExistingTranslation(allTexts[0])) {
        const currentText = allTexts[0]
        const existingTranslation = checkForExistingTranslation(currentText)
        updateTranslations(currentText, existingTranslation)
        updateNeedToStudy(currentText, existingTranslation)
        return
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
}

const watchTimedText = (timedText: HTMLElement) => {
    left_right_click($(".watch-video"), onLeftClick, onRightClick)

    const doOnMutation = (mutation: MutationRecord) => {
        if (mutation?.addedNodes?.length > 0) {
            // loop all added nodes and log if they are clicked.
            for (const node of mutation.addedNodes) {
                const deepestSpan = $(node).find("span").last()
                if (
                    localTranslations[$(node).text().trim()] &&
                    !isYellow(deepestSpan)
                ) {
                    changeText(
                        deepestSpan,
                        localTranslations[$(node).text().trim()]
                    )
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
