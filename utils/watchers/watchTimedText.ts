import $ from "jquery"

import { isYellow, observeSection } from "~utils"
import { SITE_WATCHERS } from "~utils/constants"
import changeText from "~utils/functions/changeText"
import checkForExistingTranslation from "~utils/functions/checkForExistingTranslation"
import extractTextFromHTML from "~utils/functions/extractTextFromHtml"
import getLiveElement from "~utils/functions/getLiveElement"
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
            const nodesToModify = []
            for (const node of mutation.addedNodes) {
                let elems =
                    $(node).find(lookFor).length > 0
                        ? $(node).find(lookFor)
                        : $(node)
                if (elems.length > 0) {
                    nodesToModify.push(...elems)
                }
            }
            for (const e of nodesToModify) {
                if (!e) continue
                const parentElem = getLiveElement("", e)
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
