import $ from "jquery"

export default function changeText(
    elem: JQuery<any>,
    newText: string,
    color: string = "yellow"
) {
    doChangeText(elem, newText, color)
}

const doChangeText = (
    span: JQuery<HTMLElement>,
    newText: string,
    color: string
) => {
    newText = newText.trim()
    if (!newText) return

    $(span).html(newText)
    $(span).css("color", color)

    if (window.usingSite === "netflix") {
        $(span).css({
            "font-size": "19px",
            "white-space": "normal"
        })
    }
}
