import DownloadAnkiDeck from "~components/DownloadAnkiDeck"
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
        </div>
    )
}

export default IndexPopup
