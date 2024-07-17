import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

enum API_KEY_STATUS {
  INVALID = "INVALID",
  VALID = "VALID",
  NOT_TESTED = "NOT_TESTED"
}

const Settings = () => {
  console.log("this language: ", navigator.language)
  const [data, setData] = useState("")
  const [apiKeyStatus, setApiKeyStatus] = useState<API_KEY_STATUS>(
    API_KEY_STATUS.NOT_TESTED
  )
  const localStorage = new Storage({
    area: "local"
  })

  useEffect(() => {
    localStorage.get("API_KEY").then((apiKey) => setData(apiKey))
  }, [])

  return (
    <div>
      <label htmlFor="api-key-input">Gemini API Key</label>
      <input
        id="api-key-input"
        onChange={(e) => setData(e.target.value)}
        value={data}
      />
      <button
        onClick={async () => {
          const oldApiKey = await localStorage.get("API_KEY")
          try {
            console.log("data: ", data)
            localStorage.set("API_KEY", data)
            const testResult = await sendToBackground({
              name: "test_gemini_key",
              body: {}
            })
            console.log("testResult: ", testResult)
            if (testResult && !testResult.error) {
              setApiKeyStatus(API_KEY_STATUS.VALID)
            }
          } catch (e) {
            console.error(e)
            setApiKeyStatus(API_KEY_STATUS.INVALID)
            localStorage.set("API_KEY", oldApiKey)
          }
        }}>
        {apiKeyStatus === API_KEY_STATUS.NOT_TESTED
          ? "Apply"
          : apiKeyStatus === API_KEY_STATUS.INVALID
            ? "INVALID"
            : "Update"}
      </button>
    </div>
  )
}

export default Settings
