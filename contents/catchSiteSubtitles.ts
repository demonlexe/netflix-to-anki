import { sendToBackground } from "@plasmohq/messaging"

import type { CatchSiteSubtitlesRequest } from "~background/types/CatchSiteSubtitlesRequest"
import type { CatchSiteSubtitlesResponse } from "~background/types/CatchSiteSubtitlesResponse"
import { decodeUtfBuffer } from "~background/utils/functions/decodeUtfBuffer"
import batchTranslateSubtitles from "~contents/batchTranslateSubtitles"
import extractIdFromUrl from "~utils/functions/extractIdFromUrl"
import logDev from "~utils/functions/logDev"
import { getData } from "~utils/localData"

// This function catches the subtitles from the site and sends them to the background script
export default function catchSiteSubtitles() {
    window.addEventListener("message", async (event) => {
        if (event.source !== window) return

        if (!window?.location?.href?.includes("/watch")) {
            // don't care about subtitles on main site page
            return
        }

        const isHuluSubtitles =
            event.data.type === "NETWORK_REQUEST" &&
            event.data.url.match(/.ttml$/) &&
            window.usingSite === "hulu"
        const isNetflixSubtitles =
            event.data.type === "NETWORK_REQUEST" &&
            event.data.url.includes("?o") &&
            event.data.url.includes("nflxvideo.net") &&
            window.usingSite === "netflix"
        const isMaxSubtitles =
            event.data.type === "NETWORK_REQUEST" &&
            event.data.url.match(/.vtt$/) &&
            window.usingSite === "hbomax"
        const isTubiSubtitles =
            event.data.type === "NETWORK_REQUEST" &&
            event.data.url.match(/.srt$/) &&
            window.usingSite === "tubi"

        if (
            !isNetflixSubtitles &&
            !isHuluSubtitles &&
            !isMaxSubtitles &&
            !isTubiSubtitles
        ) {
            return
        }

        let backgroundMsgToSend = null
        if (isMaxSubtitles) {
            backgroundMsgToSend = {
                response: await decodeUtfBuffer(event.data.response),
                url: event.data.url
            }
        } else {
            backgroundMsgToSend = {
                response: event.data.response,
                url: event.data.url
            }
        }
        const response: CatchSiteSubtitlesResponse = await sendToBackground({
            name: isMaxSubtitles
                ? "catch_vtt_site_subtitles"
                : "catch_site_subtitles",
            body: {
                message: backgroundMsgToSend,
                usingSite: window.usingSite
            } as CatchSiteSubtitlesRequest
        })
        if (response.error) {
            console.error(
                `Error getting the Site subtitles for Site ${window.usingSite}: `,
                response.error
            )
        } else if (response.site_sentences) {
            const showId = extractIdFromUrl(window.location.href)
            const targetLanguage = await getData("TARGET_LANGUAGE")
            if (!targetLanguage) return // missing setting

            // Already translating for this show and language, which means we have already caught the subtitles for this episode.
            // Thus, store result for the next episode!
            if (
                window.cachedSiteSentences.length > 0 &&
                showId === window.currentShowId
            ) {
                window.cachedNextEpisodeSiteSentences = response.site_sentences
                window.cachedSiteSentences = []
            } else {
                window.cachedNextEpisodeSiteSentences = []
                window.cachedSiteSentences = response.site_sentences
            }

            batchTranslateSubtitles(
                window.untranslatedSentencesCache?.[showId]?.[targetLanguage] &&
                    showId === window.currentShowId
                    ? "" + (Number(showId.trim()) + 1)
                    : showId,
                targetLanguage,
                response.site_sentences,
                0
            )
        }
    })
}
