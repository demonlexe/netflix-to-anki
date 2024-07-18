import { getData } from "~utils/localData"

export default async function getNeedToStudyLength() {
    let [needToStudy] = await Promise.all([getData("NEED_TO_STUDY")])
    if (!needToStudy) {
        needToStudy = {}
    }
    return Object.keys(needToStudy).length
}
