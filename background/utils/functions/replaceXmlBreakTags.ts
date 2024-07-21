import { BREAK_TAG_RENAME } from "~utils/constants"

export default function replaceXmlBreakTags(xmlString: string): string {
    // they will be in the form of <br/> or <br />
    // replace only these two cases with the phrase and then replace it later.
    return xmlString?.replace(/(<br\s*\/>)/g, `${BREAK_TAG_RENAME}`)
}
