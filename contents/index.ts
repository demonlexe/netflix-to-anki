import $ from "jquery"
import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import type {
  GeminiBatchRequestBody,
  GeminiBatchRequestResponse,
  GeminiSingleRequestBody,
  GeminiSingleRequestResponse
} from "~background/types"
import { isYellow, observeSection, single_double_click } from "~utils"
import { waitForElement } from "~utils/index"

export const config: PlasmoCSConfig = {
  matches: ["https://www.netflix.com/watch/*"]
}

let batchTranslatedSentences = {}

const script = document.createElement("script")
script.setAttribute("type", "text/javascript")
script.setAttribute("src", chrome.runtime.getURL("inject.js"))

document.documentElement.appendChild(script)

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

const localTranslations = {}
const reverseTranslations = {}

function updateTranslations(
  currentText: string,
  openResult: GeminiSingleRequestResponse
) {
  const liveElement = $(`span:contains("${currentText}")`).find("span").last()
  // change the text color to yellow, change the text content to the one that was translated.
  $(liveElement).css("color", "yellow")
  $(liveElement).text(openResult.translatedPhrases[currentText])
  localTranslations[currentText] = openResult.translatedPhrases[currentText]
  reverseTranslations[openResult.translatedPhrases[currentText]] = currentText
}

function changeText(elem: JQuery<EventTarget | HTMLElement>, newText: string) {
  $(elem).text(newText)
  $(elem).css("color", "yellow")
}

window.addEventListener("load", () => {
  document.body.style.background = "pink"
  waitForElement(".player-timedtext").then((timedText) => {
    const newOverlayElement = document.createElement("div")
    newOverlayElement.style.position = "absolute"
    newOverlayElement.style.top = "0"
    newOverlayElement.style.left = "0"
    newOverlayElement.style.width = "100%"
    newOverlayElement.style.height = "100%"
    newOverlayElement.style.pointerEvents = "none"
    newOverlayElement.onclick = () => {
      $("video").trigger("click")
    }
    $(timedText).appendTo(newOverlayElement)
    $(newOverlayElement).appendTo("body")

    const doOnMutation = (mutation: MutationRecord) => {
      if (mutation?.addedNodes?.length > 0) {
        // loop all added nodes and log if they are clicked.
        for (const node of mutation.addedNodes) {
          const onSingleClick = async (e: Event) => {
            const currentText = $(e.target).text().trim()
            if (isYellow($(e.target)) && reverseTranslations[currentText]) {
              // Untranslate the text.
              changeText($(e.target), reverseTranslations[currentText])
              return
            } else if (batchTranslatedSentences[currentText]) {
              // check for existing cached translation here
              changeText($(e.target), batchTranslatedSentences[currentText])
              return
            } else if (localTranslations[currentText]) {
              // check for existing cached translation here
              changeText($(e.target), localTranslations[currentText])
              return
            }
            const openResult: GeminiSingleRequestResponse =
              await sendToBackground({
                name: "gemini_translate",
                body: { phrases: [currentText] } as GeminiSingleRequestBody
              })
            console.log("Result: ", openResult)
            updateTranslations(currentText, openResult)
          }
          const onDoubleClick = async (e: Event) => {
            // get array of all texts stored in .player-timedtext-text-container
            const allTexts: string[] = []
            $(".player-timedtext-text-container").each((_, el) => {
              allTexts.push($(el).text().trim())
            })
            const openResult: GeminiSingleRequestResponse =
              await sendToBackground({
                name: "gemini_translate",
                body: { phrases: allTexts } as GeminiSingleRequestBody
              })
            console.log("Result: ", openResult)
            allTexts.forEach((currentText) =>
              updateTranslations(currentText, openResult)
            )
          }
          single_double_click($(node), onSingleClick, onDoubleClick, 300)
          const deepestSpan = $(node).find("span").last()
          if (
            localTranslations[$(node).text().trim()] &&
            !isYellow(deepestSpan)
          ) {
            deepestSpan.text(localTranslations[$(node).text().trim()])
            deepestSpan.css("color", "yellow")
          }
        }
        $(timedText).css("pointer-events", "auto")
      }
    }
    observeSection(timedText, doOnMutation)
  })
})
