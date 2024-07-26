import GithubButton from "~components/GithubButton"
import styles from "~styles/header.module.css"

export default function Header() {
    return (
        <div className={styles.flexRow}>
            <h2>Netflix To Anki</h2>
            <GithubButton />
            <a
                href="https://buymeacoffee.com/demonlexe"
                target="_blank"
                rel="noreferrer">
                Pay What You Want
            </a>
        </div>
    )
}
