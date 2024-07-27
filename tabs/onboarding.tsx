import BooleanSettings from "~components/BooleanSettings"
import Header from "~components/Header"
import Settings from "~components/Settings"
import TranslateWhenSettings from "~components/TranslateWhenSettings"
import styles from "~styles/onboarding.module.css"

function Onboarding() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Header />
                <Settings />
                <BooleanSettings />
                <TranslateWhenSettings />
            </div>
        </div>
    )
}

export default Onboarding
