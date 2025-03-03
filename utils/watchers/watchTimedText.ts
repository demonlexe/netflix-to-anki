import $ from "jquery"

import { isYellow, observeSection } from "~utils"
import { SITE_WATCHERS } from "~utils/constants"
import changeText from "~utils/functions/changeText"
import checkForExistingLocalTranslation from "~utils/functions/checkForExistingLocalTranslation"
import checkForExistingTranslation from "~utils/functions/checkForExistingTranslation"
import checkIfSentenceIgnored from "~utils/functions/checkIfSentenceIgnored"
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
        const { lookFor, captionElement } = SITE_WATCHERS[window.usingSite]

        if (mutation?.addedNodes?.length > 0) {
            // loop all added nodes and log if they are clicked.
            const nodesToModify = []

            if (window.usingSite === "tubi") {
                // just push the parent of the added node
                nodesToModify.push($(captionElement))
            }

            for (const node of mutation.addedNodes) {
                if (window.usingSite === "hbomax") {
                    let elems =
                        $(node).find(lookFor).length > 0
                            ? $(node).find(lookFor)
                            : $(node)
                    if (elems.length > 0) {
                        for (const elem of elems) {
                            let liveElem = getLiveElement("", elem)
                            nodesToModify.push(liveElem)
                        }
                    }
                } else {
                    const parentElem =
                        $(node).find(lookFor).first().length > 0
                            ? $(node).find(lookFor).first()
                            : $(node)
                    nodesToModify.push(parentElem)
                }
            }

            for (const parentElem of nodesToModify) {
                if (!parentElem || !parentElem[0]) continue
                const currentText = extractTextFromHTML(parentElem[0].innerHTML)
                const existingTranslation =
                    await checkForExistingTranslation(currentText)
                const existingLocalTrans =
                    checkForExistingLocalTranslation(currentText)
                if (checkIfSentenceIgnored(currentText)) {
                    // do not touch this sentence.
                    continue
                }
                if (existingLocalTrans && !isYellow(parentElem)) {
                    changeText(parentElem, existingLocalTrans)
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
