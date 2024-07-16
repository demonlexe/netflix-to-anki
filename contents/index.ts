import $ from "jquery"
import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import type {
  GeminiRequestBody,
  GeminiRequestResponse
} from "~background/messages/gemini_translate"
import { isYellow, observeSection, single_double_click } from "~utils"
import { waitForElement } from "~utils/index"

export const config: PlasmoCSConfig = {
  matches: ["https://www.netflix.com/watch/*"]
}

const localTranslations = {}
const reverseTranslations = {}

function updateTranslations(
  currentText: string,
  openResult: GeminiRequestResponse
) {
  const liveElement = $(`span:contains("${currentText}")`).find("span").last()
  // change the text color to yellow, change the text content to the one that was translated.
  $(liveElement).css("color", "yellow")
  $(liveElement).text(openResult.translatedPhrases[currentText])
  localTranslations[currentText] = openResult.translatedPhrases[currentText]
  reverseTranslations[openResult.translatedPhrases[currentText]] = currentText
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
              $(e.target).css("color", "yellow")
              $(e.target).text(reverseTranslations[currentText])
              return
            } else if (localTranslations[currentText]) {
              // check for existing cached translation here
              $(e.target).text(localTranslations[currentText])
              $(e.target).css("color", "yellow")
              return
            }
            const openResult: GeminiRequestResponse = await sendToBackground({
              name: "gemini_translate",
              body: { phrases: [currentText] } as GeminiRequestBody
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
            const openResult: GeminiRequestResponse = await sendToBackground({
              name: "gemini_translate",
              body: { phrases: allTexts } as GeminiRequestBody
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
