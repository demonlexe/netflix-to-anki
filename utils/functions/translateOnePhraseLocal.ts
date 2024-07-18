import $ from "jquery"

import { isYellow } from "~utils"
import checkForExistingReverseTranslation from "~utils/functions/checkForExistingReverseTranslation"

import changeText from "./changeText"
import checkForExistingTranslation from "./checkForExistingTranslation"
import updateNeedToStudy from "./updateNeedToStudy"
import updateTranslations from "./updateTranslations"

export default function translateOnePhraseLocal(currentText: string) {
    const liveElement = $(`span:contains("${currentText}")`).find("span").last()
    const existingTranslation = checkForExistingTranslation(currentText)
    const existingReverseTranslation =
        checkForExistingReverseTranslation(currentText)
    if (isYellow($(liveElement)) && existingReverseTranslation) {
        // Untranslate the text.
        changeText($(liveElement), existingReverseTranslation, "white")
        window.localTranslations[existingReverseTranslation] = null
        window.batchTranslatedSentences[existingReverseTranslation] = null
        return true
    } else if (existingTranslation) {
        updateTranslations(currentText, existingTranslation)
        updateNeedToStudy(currentText, existingTranslation)
        return false
    }
    return null
}
