import { GoogleGenerativeAI } from "@google/generative-ai"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { type GeminiGetLocaleRequest } from "~background/types/GeminiGetLocaleRequest"
import type { GeminiGetLocaleResponse } from "~background/types/GeminiGetLocaleResponse"
import { getCurrentLanguageFromModel } from "~background/utils"
import { getData } from "~utils/localData"

const handler: PlasmoMessaging.MessageHandler<
    GeminiGetLocaleRequest,
    GeminiGetLocaleResponse
> = async (req, res) => {
    const { sentences, targetLanguage } = req.body

    try {
        const genAI = new GoogleGenerativeAI(await getData("API_KEY"))
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const sentencesLocale = await getCurrentLanguageFromModel(
            model,
            sentences,
            targetLanguage
        )
        res.send({ locale: sentencesLocale })
    } catch (e) {
        console.error("Error in gemini_get_locale.ts", e)
        res.send({ error: e?.message })
        return
    }
}

export default handler
