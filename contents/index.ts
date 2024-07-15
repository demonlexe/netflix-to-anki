import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.netflix.com/watch/*"]
}

window.addEventListener("load", () => {
  document.body.style.background = "pink"
  console.log("HERE!")
})
