import "@plasmohq/messaging/background"

import { startHub } from "@plasmohq/messaging/pub-sub"

console.log(`Netflix To Anki - Starting Hub`)
startHub()

chrome.runtime.onInstalled.addListener((reason) => {
    const reasonStr = reason["reason"] || ""
    if (reasonStr.includes("install")) {
        chrome.tabs.create({
            url: `chrome-extension://${chrome.runtime.id}/tabs/onboarding.html`
        })
    }
})
