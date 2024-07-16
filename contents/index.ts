import $ from "jquery"
import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import { observeSection, single_double_click } from "~utils"
import { waitForElement } from "~utils/index"

export const config: PlasmoCSConfig = {
  matches: ["https://www.netflix.com/watch/*"]
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
            const openResult = await sendToBackground({
              name: "gemini_translate",
              body: { phrase: $(e.target).text() }
            })
            console.log("SINGLE CLICK RESULT: ", openResult)
            // change the text color to yellow, change the text content to the one that was translated.
            $(e.target).css("color", "yellow")
            $(e.target).text(openResult)
          }
          const onDoubleClick = async (e: Event) => {
            const openResult = await sendToBackground({
              name: "gemini_translate",
              body: { phrase: $(timedText).text() }
            })
            console.log("DBL CLICK RESULT: ", openResult)
          }
          single_double_click($(node), onSingleClick, onDoubleClick, 300)
        }
        $(timedText).css("pointer-events", "auto")
      }
    }
    observeSection(timedText, doOnMutation)
  })
})
