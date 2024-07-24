import { getData } from "~utils/localData"

import optimizeAnkiDeck from "./optimizeAnkiDeck"

export default async function getNeedToStudyLength() {
    let [needToStudy] = await Promise.all([getData("NEED_TO_STUDY")])
    if (!needToStudy) {
        needToStudy = {}
    }
    needToStudy = optimizeAnkiDeck(needToStudy)
    return Object.keys(needToStudy).length
}
