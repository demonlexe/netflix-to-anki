import DisplayTranslationStatus from "~components/DisplayTranslationStatus"
import styles from "~styles/popup.module.css"
import getCurrentYear from "~utils/functions/getCurrentYear"

function IndexPopup() {
    const manifestData = chrome.runtime.getManifest()
    return (
        <div className={styles.container}>
            <div className={`${styles.flexRow} ${styles.spaceBetween}`}>
                <button
                    className={styles.settingsButton}
                    onClick={() => {
                        chrome.tabs.create({
                            url: `chrome-extension://${chrome.runtime.id}/tabs/onboarding.html`
                        })
                    }}>
                    <span>⚙</span>
                </button>
            </div>
            <DisplayTranslationStatus />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>{`NetflixToAnki ${getCurrentYear()}`}</div>
                <div>v{manifestData.version}</div>
            </div>
        </div>
    )
}

export default IndexPopup
