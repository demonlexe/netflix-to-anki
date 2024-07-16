import "@plasmohq/messaging/background"

import { parseFromString } from "dom-parser"

import { startHub } from "@plasmohq/messaging/pub-sub"

console.log(`Netflix To Anki - Starting Hub`)
startHub()

// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NETWORK_REQUEST") {
    if (
      message.url.includes("?o") &&
      message.url.includes("nflxvideo.net") &&
      message.response?.length > 0
    ) {
      // it's subtitles
      console.log(
        "Network Request:",
        message.method,
        message.url,
        message.response
      )
      const htmlDocument = parseFromString(message.response.toString())
      console.log(
        "Document has subtitile",
        htmlDocument.getElementById("subtitle1")
      )
      // Perform translation or other processing here
    }
  }
})
