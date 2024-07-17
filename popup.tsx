import DownloadAnkiDeck from "~components/DownloadAnkiDeck"
import ResetAnkiDeck from "~components/ResetAnkiDeck"
import Settings from "~components/Settings"

function IndexPopup() {
    return (
        <div
            style={{
                padding: 16
            }}>
            <h2>netflix-to-anki</h2>
            <Settings />
            <DownloadAnkiDeck />
            <ResetAnkiDeck />
        </div>
    )
}

export default IndexPopup
