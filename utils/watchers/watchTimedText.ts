import $ from "jquery"

import { isYellow, observeSection } from "~utils"
import { SITE_WATCHERS } from "~utils/constants"
import changeText from "~utils/functions/changeText"
import checkForExistingTranslation from "~utils/functions/checkForExistingTranslation"
import extractTextFromHTML from "~utils/functions/extractTextFromHtml"
import onCustomKey from "~utils/functions/onCustomKey"
import onVideoPaused from "~utils/functions/onVideoPaused"
import pollSettings from "~utils/functions/pollSettings"
import pollStatus from "~utils/functions/pollStatus"

export default async function watchTimedText(timedText: HTMLElement) {
    if (window.watchingTimedText === timedText) {
        return //already watching this block.
    }
    window.watchingTimedText = timedText
    pollSettings()
    pollStatus()
    onVideoPaused($("video"))
    onCustomKey()

    const doOnMutation = async (mutation: MutationRecord) => {
        const { lookFor } = SITE_WATCHERS[window.usingSite]

        if (mutation?.addedNodes?.length > 0) {
            // loop all added nodes and log if they are clicked.
            for (const node of mutation.addedNodes) {
                const parentElem =
                    $(node).find(lookFor).first().length > 0
                        ? $(node).find(lookFor).first()
                        : $(node)
                if (!parentElem || !parentElem[0]) continue
                const currentText = extractTextFromHTML(parentElem[0].innerHTML)
                const existingTranslation =
                    await checkForExistingTranslation(currentText)
                if (window.doNotTouchSentences[currentText]) {
                    // do not touch this sentence.
                    continue
                }
                if (
                    window.localTranslations[currentText] &&
                    !isYellow(parentElem)
                ) {
                    changeText(
                        parentElem,
                        window.localTranslations[currentText]
                    )
                } else if (
                    window.polledSettings.TRANSLATE_WHEN === "always" &&
                    existingTranslation &&
                    !isYellow(parentElem)
                ) {
                    changeText(parentElem, existingTranslation)
                }
            }
            $(timedText).css("pointer-events", "auto")
        }
    }
    observeSection(timedText, doOnMutation)
}
