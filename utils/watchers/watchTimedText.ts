import $ from "jquery"

import { isYellow, left_right_click, observeSection } from "~utils"
import changeText from "~utils/functions/changeText"
import checkForExistingTranslation from "~utils/functions/checkForExistingTranslation"
import pollSettings from "~utils/functions/pollSettings"
import onLeftClick from "~utils/handlers/onLeftClick"
import onRightClick from "~utils/handlers/onRightClick"

export default async function watchTimedText(timedText: HTMLElement) {
    if (window.watchingTimedText === timedText) {
        return //already watching this block.
    }
    window.watchingTimedText = timedText

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
                if (window.doNotTouchSentences[currentText]) {
                    // do not touch this sentence.
                    continue
                }
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
