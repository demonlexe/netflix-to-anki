import $ from "jquery"

import changeText from "./changeText"

export default function updateTranslations(
    currentText: string,
    translatedText: string
) {
    // pre-processing
    currentText = currentText?.trim()
    translatedText = translatedText?.trim()

    if (!currentText || currentText.length === 0) return
    if (!translatedText || translatedText.length === 0) return

    // update the displayed text
    const liveElement = $(`span:contains("${currentText}")`).find("span").last()
    changeText(liveElement, translatedText)

    // update the cache
    window.localTranslations[currentText] = translatedText
    window.reverseTranslations[translatedText] = currentText
}
