// example bad json
// "Get it, put it on,\nlet's meet back here in one hour.": "Tómalo, pontelo,\nnos encontramos aquí en una hora.", "I'll text you the details.": "Te enviaré un mensaje de texto con los detalles.", "Whoa, whoa, wait.\nWhere are we going?": "Whoa, whoa, espera.\n¿A dónde vamos?", "-DC.\n-DC?": "-DC.\n-¿DC?", "Yeah. My jet's fueled up\nand on the runway.": "Sí. Mi avión está abastecido\ny en la pista.", "I think I can get you all of the data\nyou could ever need.": "Creo que puedo obtener todos los datos\nque puedas necesitar.", "[retching and coughing]": "[arcadas y tos]", "He said his stomach hurt\nand then he started throwing up.": "Dijo que le dolía el estómago\ny luego comenzó a vomitar.", "[groans] Dying, hurts like dying.": "[gime] Morir, duele como morir.", "-Need me?\n-Heart rate is 176.": "-¿Me necesitas?\n-La frecuencia cardíaca es de ciento setenta y seis.", "He's in AFib with RVR.": "Está en fibrilación auricular con respuesta ventricular rápida.", "All right, let's get 20 of diltiazem.": "Está bien, vamos a obtener veinte de diltiazem.", "-[grunts]\n-Let's get a liter of normal saline": "-[gruñe]\n-Vamos a obtener un litro de solución salina normal", "and give four of ondansetron.": "y administremos cuatro de ondansetrón.", "[Jonesy groaning]": "[Jonesy gimiendo]", "[panting]": "[jadeando]", "-[Irving] Deep breaths.\n-[exhales]": "-[Irving] Respira hondo.\n-[exhala]", "[machine beeping steadily]": "[la máquina pita de forma constante]", "-That's better.\n-Okay, let's get him to CT,": "-Eso está mejor.\n-Está bien, vamos a llevarlo a la tomografía computarizada,", "-see what's going on.\n-I don't know what happened,": "-para ver qué pasa.\n-No sé qué pasó,", "We were sitting here the whole time.\nExcept for when I went to the…": "Estuvimos sentados aquí todo el tiempo.\nExcepto cuando fui a la…", "Open your mouth.": "Abre la boca.", "[sniffs]": "[huele]", "[gasps] You ate a death cookie.": "[jadeando] Comiste una galleta de la muerte.", "Jonesy knows he's allergic to gluten.": "Jonesy sabe que es alérgico al gluten.", "Yeah, he also knows that eating it\nhelps him stay on his stupid horse.": "Sí, también sabe que comerlo\nle ayuda a mantenerse en su estúpido caballo."]
// }

export default function processGeminiResponse(
    json: string
): Record<string, string> {
    if (!json) return {}
    // if the last character is ], replace it with } this is a common gemini mistake
    // if the first character is [, replace it with { this is a less common gemini mistake
    // Sometimes the json can end in multiple ]s, so we need to kill all of them except one.
    return fixJSON(json)
}

function fixJSON(
    jsonString: string,
    retries = 0
): Record<string, string> | null {
    if (retries > 10) {
        throw new Error("Too many retries parsing JSON: " + jsonString)
    }
    try {
        // Attempt to parse the JSON to identify errors
        const parsed = JSON.parse(jsonString)
        return parsed // If no errors, return the original string
    } catch (error) {
        // Handle missing brackets or extra characters
        if (error.message) {
            jsonString = jsonString.trim()
            // add opening bracket if missing
            if (jsonString[0] !== "{") {
                jsonString = "{" + jsonString
            }
            // remove all trailing brackets or braces
            while (
                jsonString[jsonString.length - 1] === "}" ||
                jsonString[jsonString.length - 1] === "]"
            ) {
                jsonString = jsonString.slice(0, jsonString.length - 1)
            }
            // add closing bracket
            if (jsonString[jsonString.length - 1] !== "}") {
                jsonString += "}"
            }
        }

        // Attempt to parse again
        return fixJSON(jsonString, retries + 1) // Recursively attempt to fix the JSON
    }
}
