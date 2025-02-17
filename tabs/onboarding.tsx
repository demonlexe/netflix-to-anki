import BooleanSettings from "~components/BooleanSettings"
import Header from "~components/Header"
import Settings from "~components/Settings"
import TranslateWhenSettings from "~components/TranslateWhenSettings"
import styles from "~styles/onboarding.module.css"

import "~styles/globals.scss"

import Divider from "~components/Divider"

function Onboarding() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Header />
                <Divider />
                <h3>Setup</h3>
                <Settings />
                <Divider />
                <h3>Auto-saved Settings</h3>
                <BooleanSettings />
                <TranslateWhenSettings />
                <Divider />
            </div>
        </div>
    )
}

export default Onboarding
