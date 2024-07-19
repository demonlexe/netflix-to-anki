import $ from "jquery"

import { isYellow } from "~utils"
import checkForExistingReverseTranslation from "~utils/functions/checkForExistingReverseTranslation"

import changeText from "./changeText"
import checkForExistingTranslation from "./checkForExistingTranslation"
import updateNeedToStudy from "./updateNeedToStudy"
import updateTranslations from "./updateTranslations"

// returns boolean, if yes, it means we should play the video.
export default function translateOnePhraseLocal(currentText: string) {
    const liveElement = $(`span:contains("${currentText}")`).find("span").last()
    const existingTranslation = checkForExistingTranslation(currentText)
    const existingReverseTranslation =
        checkForExistingReverseTranslation(currentText)
    if (isYellow($(liveElement)) && existingReverseTranslation) {
        // Untranslate the text.
        changeText($(liveElement), existingReverseTranslation, "white")
        window.doNotTouchSentences[existingReverseTranslation.trim()] = true
        updateNeedToStudy(currentText, existingReverseTranslation)
        return window.polledSettings.AUTO_TRANSLATE_WHILE_PLAYING ? false : true
    } else if (existingTranslation) {
        updateTranslations(currentText, existingTranslation)
        updateNeedToStudy(currentText, existingTranslation)
        window.doNotTouchSentences[currentText.trim()] = false
        return window.polledSettings.AUTO_TRANSLATE_WHILE_PLAYING ? true : false
    }
    return null
}
