import { getData, setData } from "~utils/localData"

import logDev from "./logDev"

export default async function updateNeedToStudy(
    textOne: string,
    textTwo: string
) {
    textOne = textOne?.trim()
    textTwo = textTwo?.trim()
    const needToStudy = (await getData("NEED_TO_STUDY")) ?? {}

    needToStudy[textOne] = textTwo
    await setData("NEED_TO_STUDY", needToStudy)
    logDev("NEW need to study: ", needToStudy)
}
