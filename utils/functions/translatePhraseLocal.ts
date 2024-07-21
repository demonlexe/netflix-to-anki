import $ from "jquery"

import { isYellow } from "~utils"
import checkForExistingReverseTranslation from "~utils/functions/checkForExistingReverseTranslation"

import changeText from "./changeText"
import checkForExistingTranslation from "./checkForExistingTranslation"
import getLiveElement from "./getLiveElement"
import updateNeedToStudy from "./updateNeedToStudy"
import updateTranslations from "./updateTranslations"

// returns boolean, if yes, it means we should play the video.
export default function translatePhraseLocal(
    currentText: string,
    container?: JQuery<HTMLElement>
) {
    const liveElement = getLiveElement("", container)

    let shouldPlay = null
    const existingTranslation = checkForExistingTranslation(currentText)
    const existingReverseTranslation =
        checkForExistingReverseTranslation(currentText)
    // const tryChangeText = changeText($(liveElement), currentText, "yellow")
    if (isYellow($(liveElement)) && existingReverseTranslation) {
        // Untranslate the text.
        changeText($(liveElement), existingReverseTranslation, "white")
        window.doNotTouchSentences[existingReverseTranslation.trim()] = true
        updateNeedToStudy(currentText, existingReverseTranslation)
        shouldPlay = window.polledSettings.AUTO_TRANSLATE_WHILE_PLAYING
            ? true
            : false
    } else if (existingTranslation) {
        updateTranslations(currentText, existingTranslation)
        updateNeedToStudy(currentText, existingTranslation)
        window.doNotTouchSentences[currentText.trim()] = false
        shouldPlay = window.polledSettings.AUTO_TRANSLATE_WHILE_PLAYING
            ? true
            : false
    }
    return shouldPlay
}
