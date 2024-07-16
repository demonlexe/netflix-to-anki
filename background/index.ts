import "@plasmohq/messaging/background"

import { parseString } from "xml2js"

import { startHub } from "@plasmohq/messaging/pub-sub"

import geminiTranslateBatch from "./messages/gemini_translate_batch"

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

// catch captions
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NETWORK_REQUEST") {
    if (
      message.url.includes("?o") &&
      message.url.includes("nflxvideo.net") &&
      message.response?.length > 0
    ) {
      parseString(message.response, async function (err, result) {
        const allText: XMLText[] = result.tt.body?.[0]?.div?.[0]?.p
        const grouping = {}
        allText.forEach((text: XMLText) => {
          const textContent = getXMLTextContent(text)
          if (grouping[text.$.begin]) {
            grouping[text.$.begin].push(textContent)
          } else {
            grouping[text.$.begin] = [textContent]
          }
        })
        const allSentencesSet = new Set<string>()
        for (const key in grouping) {
          const sentences = grouping[key]
          sentences.forEach((sentence: string) => {
            allSentencesSet.add(sentence)
          })
        }
        const allSentencesArray: string[] = Array.from(allSentencesSet)
        // loop through all sentences, sending to backend in groups of 50, then collect them here in a massive object.
        const collectedSentences = {}
        const allPromises = []
        for (let i = 0; i < 100; i += 50) {
          allPromises.push(
            geminiTranslateBatch(
              {
                name: "gemini_translate_batch",
                body: { phrases: allSentencesArray.slice(i, i + 50) }
              },
              {
                send: (response) => {
                  if (response.translatedPhrases) {
                    for (const key in response.translatedPhrases) {
                      collectedSentences[key] = response.translatedPhrases[key]
                    }
                  }
                }
              }
            )
          )
        }
        await Promise.all(allPromises).then(() => {
          console.log("All sentences translated: ", collectedSentences)
        })
      })
      // Perform translation or other processing here
    }
  }
})
