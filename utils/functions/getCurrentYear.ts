export default function getCurrentYear() {
    const currentYear = new Date().getFullYear()
    return currentYear || 2024
}
