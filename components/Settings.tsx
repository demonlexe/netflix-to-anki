import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

enum API_KEY_STATUS {
  INVALID = "INVALID",
  VALID = "VALID",
  NOT_TESTED = "NOT_TESTED",
  SUCCESS = "SUCCESS"
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
      {apiKeyStatus === API_KEY_STATUS.INVALID && (
        <h4>INVALID - Check your API Key</h4>
      )}
      <button
        onClick={async () => {
          const oldApiKey = await localStorage.get("API_KEY")
          await localStorage.set("API_KEY", data)
          const testResult = await sendToBackground({
            name: "test_gemini_key",
            body: {}
          })
          if (testResult && !testResult.error) {
            setApiKeyStatus(API_KEY_STATUS.SUCCESS)
            setTimeout(() => {
              setApiKeyStatus(API_KEY_STATUS.VALID)
            }, 2000)
          } else {
            setApiKeyStatus(API_KEY_STATUS.INVALID)
            await localStorage.set("API_KEY", oldApiKey)
            setTimeout(() => {
              setApiKeyStatus(API_KEY_STATUS.NOT_TESTED)
            }, 2000)
          }
        }}>
        {apiKeyStatus === API_KEY_STATUS.NOT_TESTED
          ? "Apply"
          : apiKeyStatus === API_KEY_STATUS.SUCCESS
            ? "SUCCESS!"
            : "Update"}
      </button>
    </div>
  )
}

export default Settings
