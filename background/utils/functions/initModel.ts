import { GoogleGenerativeAI } from "@google/generative-ai"

export type HandlerState = {
    usingApiKey: any
    model: any
}

export default async function initModel(
    handlerState: HandlerState,
    API_KEY: string
) {
    if (!handlerState.model || handlerState.usingApiKey !== API_KEY) {
        handlerState.usingApiKey = API_KEY
        const genAI = new GoogleGenerativeAI(API_KEY)
        handlerState.model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest"
        })
    }
}
