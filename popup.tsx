import styles from "~styles/popup.module.css"
import getCurrentYear from "~utils/functions/getCurrentYear"

function IndexPopup() {
    const manifestData = chrome.runtime.getManifest()
    return (
        <div className={styles.container}>
            <button
                className={styles.redirectButton}
                onClick={() => {
                    chrome.tabs.create({
                        url: `chrome-extension://${chrome.runtime.id}/tabs/onboarding.html`
                    })
                }}>
                Click me to onboard
            </button>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>{`NetflixToAnki ${getCurrentYear()}`}</div>
                <div>v{manifestData.version}</div>
            </div>
        </div>
    )
}

export default IndexPopup
