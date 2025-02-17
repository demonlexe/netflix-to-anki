import changeText from "./changeText"
import getLiveElement from "./getLiveElement"

export default function updateTranslations(
    currentText: string,
    translatedText: string
) {
    // pre-processing
    currentText = currentText?.trim()
    translatedText = translatedText?.trim()

    if (!currentText || currentText.length === 0) return
    if (!translatedText || translatedText.length === 0) return

    // update the cache
    window.localTranslations[currentText] = translatedText
    window.reverseTranslations[translatedText] = currentText

    // update the displayed text
    const liveElement = getLiveElement(currentText)
    changeText(liveElement, translatedText)
}
