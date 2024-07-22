import $ from "jquery"

import { isYellow } from "~utils"
import checkForExistingReverseTranslation from "~utils/functions/checkForExistingReverseTranslation"

import changeText from "./changeText"
import checkForExistingTranslation from "./checkForExistingTranslation"
import getLiveElement from "./getLiveElement"
import updateTranslations from "./updateTranslations"

// returns boolean, if yes, it means we should play the video.
export default function translatePhraseLocal(
    currentText: string,
    container?: JQuery<HTMLElement>
): { text: string; isYellow: boolean } {
    const liveElement = getLiveElement("", container)

    let translatedPhrase = { text: null, isYellow: false }
    const existingTranslation = checkForExistingTranslation(currentText)
    const existingReverseTranslation =
        checkForExistingReverseTranslation(currentText)
    // const tryChangeText = changeText($(liveElement), currentText, "yellow")
    if (isYellow($(liveElement)) && existingReverseTranslation) {
        // Untranslate the text.
        changeText($(liveElement), existingReverseTranslation, "white")
        window.doNotTouchSentences[existingReverseTranslation.trim()] = true
        translatedPhrase = { text: existingReverseTranslation, isYellow: true }
    } else if (existingTranslation) {
        updateTranslations(currentText, existingTranslation)
        window.doNotTouchSentences[currentText.trim()] = false
        translatedPhrase = { text: existingTranslation, isYellow: false }
    }
    return translatedPhrase
}
