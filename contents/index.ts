import $ from "jquery"
import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type {
  GeminiBatchRequestBody,
  GeminiBatchRequestResponse,
  GeminiSingleRequestBody,
  GeminiSingleRequestResponse
} from "~background/types"
import {
  isMouseInsideDiv,
  isYellow,
  observeSection,
  removeElementSiblings,
  single_double_click
} from "~utils"
import { waitForElement } from "~utils/index"

export const config: PlasmoCSConfig = {
  matches: ["https://www.netflix.com/watch/*"]
}

const localTranslations = {}
const reverseTranslations = {}
let batchTranslatedSentences = {}

const script = document.createElement("script")
script.setAttribute("type", "text/javascript")
script.setAttribute("src", chrome.runtime.getURL("inject.js"))

document.documentElement.appendChild(script)

async function initBatchTranslatedSentences() {
  const localStorage = new Storage({
    area: "local"
  })
  const translations = await localStorage.get("netflix-to-anki-translations")
  if (translations && Object.keys(translations).length > 0)
    batchTranslatedSentences = translations

  console.log("Pulled down translations: ", batchTranslatedSentences)
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
  currentText = currentText.trim()
  translatedText = translatedText.trim()
  const liveElement = $(`span:contains("${currentText}")`).find("span").last()
  changeText(liveElement, translatedText)
  localTranslations[currentText] = translatedText
  reverseTranslations[translatedText] = currentText
}

function changeText(elem: JQuery<EventTarget | HTMLElement>, newText: string) {
  newText = newText.trim()
  $(elem).text(newText)
  $(elem).css("color", "yellow")
  removeElementSiblings(elem[0] as HTMLElement)
}

const onSingleClick = async (elem: Element) => {
  const currentText = $(elem).text().trim()
  const liveElement = $(`span:contains("${currentText}")`).find("span").last()
  if (isYellow($(liveElement)) && reverseTranslations[currentText]) {
    // Untranslate the text.
    changeText($(liveElement), reverseTranslations[currentText])
    return
  } else if (localTranslations[currentText]) {
    // check for existing cached translation here
    changeText($(liveElement), localTranslations[currentText])
    return
  } else if (batchTranslatedSentences[currentText]) {
    // check for existing cached translation here
    updateTranslations(currentText, batchTranslatedSentences[currentText])
    return
  }
  const openResult: GeminiSingleRequestResponse = await sendToBackground({
    name: "gemini_translate",
    body: { phrases: [currentText] } as GeminiSingleRequestBody
  })
  console.log("Single Click API Result: ", openResult)
  updateTranslations(currentText, openResult.translatedPhrases[currentText])
}

const onRightClick = async () => {
  // get array of all texts stored in .player-timedtext-text-container
  const allTexts: string[] = []
  $(".player-timedtext-text-container").each((_, el) => {
    allTexts.push($(el).text().trim())
  })
  const openResult: GeminiSingleRequestResponse = await sendToBackground({
    name: "gemini_translate",
    body: { phrases: allTexts } as GeminiSingleRequestBody
  })
  console.log("Double Click API Result: ", openResult)
  allTexts.forEach((currentText) =>
    updateTranslations(currentText, openResult.translatedPhrases[currentText])
  )
}

window.addEventListener("load", () => {
  waitForElement(".player-timedtext").then((timedText) => {
    single_double_click($(".watch-video"), onSingleClick, onRightClick, 300)

    const doOnMutation = (mutation: MutationRecord) => {
      if (mutation?.addedNodes?.length > 0) {
        // loop all added nodes and log if they are clicked.
        for (const node of mutation.addedNodes) {
          const deepestSpan = $(node).find("span").last()
          if (
            localTranslations[$(node).text().trim()] &&
            !isYellow(deepestSpan)
          ) {
            changeText(deepestSpan, localTranslations[$(node).text().trim()])
          }
        }
        $(timedText).css("pointer-events", "auto")
      }
    }
    observeSection(timedText, doOnMutation)
  })
})
