import getAllCachedTranslations from "./getAllCachedTranslations"

export default async function getCurrentShowCachedTranslations() {
    const cache = await getAllCachedTranslations()
    return cache?.[window.currentShowId]?.sentences || {}
}
