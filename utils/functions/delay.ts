export default function delay(t: number, val?) {
    return new Promise((resolve) => setTimeout(resolve, t, val))
}
