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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_WINDOW_VARIABLES") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, request, sendResponse)
            }
        })
        return true // Keep the message channel open for async response
    }
})
