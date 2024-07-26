import BooleanSettings from "~components/BooleanSettings"
import Header from "~components/Header"
import Settings from "~components/Settings"
import styles from "~styles/onboarding.module.css"

function Onboarding() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Header />
                <Settings />
                <BooleanSettings />
            </div>
        </div>
    )
}

export default Onboarding
