import { getData } from "~utils/localData"

import optimizeAnkiDeck from "./optimizeAnkiDeck"

export default async function getNeedToStudyLength() {
    const needToStudy = optimizeAnkiDeck((await getData("NEED_TO_STUDY")) ?? {})
    return Object.keys(needToStudy).length
}
