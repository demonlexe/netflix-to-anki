import { getData, setData } from "~localData"

export default async function initData() {
    console.log("NTA: Initializing data")
    const needToStudy = await getData("NEED_TO_STUDY")
    if (!needToStudy) {
        console.log("NTA: Need to study is empty")
        setData("NEED_TO_STUDY", {})
    }
}
