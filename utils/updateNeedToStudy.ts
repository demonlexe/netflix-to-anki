import { getData, setData } from "~localData"

export default async function updateNeedToStudy(
    textOne: string,
    textTwo: string
) {
    textOne = textOne.trim()
    textTwo = textTwo.trim()
    let [needToStudy, ankiConfig] = await Promise.all([
        getData("NEED_TO_STUDY"),
        getData("ANKI_CONFIG")
    ])
    if (!needToStudy) {
        needToStudy = {}
    }
    switch (ankiConfig) {
        case "BOTH":
            needToStudy[textOne] = textTwo
            needToStudy[textTwo] = textOne
            break
        case "PROMPT_NATIVE":
            needToStudy[textOne] = textTwo
            break
        case "PROMPT_TARGET":
            needToStudy[textTwo] = textOne
            break
    }

    await setData("NEED_TO_STUDY", needToStudy)
    console.log("NEW need to study: ", needToStudy)
}
