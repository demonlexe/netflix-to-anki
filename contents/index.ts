import $ from "jquery"
import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import type { GeminiRequestResponse } from "~background/messages/gemini_translate"
import { isYellow, observeSection, single_double_click } from "~utils"
import { waitForElement } from "~utils/index"

export const config: PlasmoCSConfig = {
  matches: ["https://www.netflix.com/watch/*"]
}

const localTranslations = {}
const reverseTranslations = {}

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
              body: { phrase: currentText }
            })
            console.log("Result: ", openResult)
            const liveElement = $(`span:contains("${currentText}")`)
              .find("span")
              .last()
            // change the text color to yellow, change the text content to the one that was translated.
            $(liveElement).css("color", "yellow")
            $(liveElement).text(openResult.translatedPhrase)
            localTranslations[currentText] = openResult.translatedPhrase
            reverseTranslations[openResult.translatedPhrase] = currentText
          }
          const onDoubleClick = async (e: Event) => {
            const currentText = $(timedText).text()
            const openResult: GeminiRequestResponse = await sendToBackground({
              name: "gemini_translate",
              body: { phrase: $(timedText).text() }
            })
            console.log("Result: ", openResult)
            localTranslations[currentText] = openResult.translatedPhrase
            reverseTranslations[openResult.translatedPhrase] = currentText
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
