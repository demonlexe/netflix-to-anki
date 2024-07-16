import "@plasmohq/messaging/background"

import { parseString } from "xml2js"

import { startHub } from "@plasmohq/messaging/pub-sub"

console.log(`Netflix To Anki - Starting Hub`)
startHub()

type XMLText = {
  $: any
  _?: string
  span?: XMLText
}

const getXMLTextContent = (text: XMLText) => {
  return (
    text.span && text.span[0]
      ? (text._ ?? "") + " " + getXMLTextContent(text.span[0])
      : text._ ?? ""
  ).trim()
}

// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NETWORK_REQUEST") {
    if (
      message.url.includes("?o") &&
      message.url.includes("nflxvideo.net") &&
      message.response?.length > 0
    ) {
      // it's subtitles
      console.log("Network Request:", message.method, message.url)
      parseString(message.response, function (err, result) {
        const allText: XMLText[] = result.tt.body?.[0]?.div?.[0]?.p
        console.log("xml2js allText", allText)
        const grouping = {}
        allText.forEach((text: XMLText) => {
          const textContent = getXMLTextContent(text)
          if (grouping[text.$.begin]) {
            grouping[text.$.begin].push(textContent)
          } else {
            grouping[text.$.begin] = [textContent]
          }
        })
        console.log("Grouping: ", grouping)
      })
      // Perform translation or other processing here
    }
  }
})
