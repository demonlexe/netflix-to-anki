import { getData, setData } from "~localData"

export default async function updateNeedToStudy(
    textOne: string,
    textTwo: string
) {
    textOne = textOne.trim()
    textTwo = textTwo.trim()
    const needToStudy = (await getData("NEED_TO_STUDY")) ?? {}
    needToStudy[textOne] = textTwo
    await setData("NEED_TO_STUDY", needToStudy)
    console.log("NEW need to study: ", needToStudy)
}
