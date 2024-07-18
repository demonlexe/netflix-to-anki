import $ from "jquery"

import { isYellow } from "~utils"

import changeText from "./changeText"
import checkForExistingTranslation from "./checkForExistingTranslation"
import updateNeedToStudy from "./updateNeedToStudy"
import updateTranslations from "./updateTranslations"

export default function translateOnePhraseLocal(currentText: string) {
    const liveElement = $(`span:contains("${currentText}")`).find("span").last()
    const existingTranslation = checkForExistingTranslation(currentText)
    if (isYellow($(liveElement)) && window.reverseTranslations[currentText]) {
        // Untranslate the text.
        changeText(
            $(liveElement),
            window.reverseTranslations[currentText],
            "white"
        )
        window.localTranslations[window.reverseTranslations[currentText]] = null
        return true
    } else if (existingTranslation) {
        updateTranslations(currentText, existingTranslation)
        updateNeedToStudy(currentText, existingTranslation)
        return false
    }
    return null
}
