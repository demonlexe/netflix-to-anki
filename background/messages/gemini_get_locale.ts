import type { PlasmoMessaging } from "@plasmohq/messaging"

import { type GeminiGetLocaleRequest } from "~background/types/GeminiGetLocaleRequest"
import type { GeminiGetLocaleResponse } from "~background/types/GeminiGetLocaleResponse"
import getCurrentLanguageFromModel from "~background/utils/functions/getCurrentLanguageFromModel"
import initModel, {
    type HandlerState
} from "~background/utils/functions/initModel"
import { getData } from "~utils/localData"

const handlerState: HandlerState = {
    usingApiKey: null,
    model: null
}

const handler: PlasmoMessaging.MessageHandler<
    GeminiGetLocaleRequest,
    GeminiGetLocaleResponse
> = async (req, res) => {
    const { sentences, targetLanguage } = req.body

    try {
        await initModel(handlerState, await getData("API_KEY"))
        const sentencesLocale = await getCurrentLanguageFromModel(
            handlerState.model,
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
