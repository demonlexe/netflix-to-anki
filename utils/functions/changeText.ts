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
    if (!span || !span[0]) return
    const shouldWrapSpan = window.usingSite === "tubi"
    newText = newText.trim()
    if (!newText) return

    // if the "span" already has a color, don't wrap it in a span
    if (shouldWrapSpan && !$(span).attr("colormodified")) {
        newText = `<span style="color:${color}" colormodified=true>${newText}</span>`
    } else {
        $(span).css("color", color)
    }
    $(span).html(newText)

    // style with font-size:27px;line-height:normal;font-weight:normal;color:#ffffff;text-shadow:#000000 0px 0px 7px;font-family:Netflix Sans,Helvetica Nueue,Helvetica,Arial,sans-serif;font-weight:bolder
    if (window.usingSite === "netflix") {
        $(span).css({
            "font-size": "3rem",
            "white-space": "normal",
            "line-height": "normal",
            "text-shadow": "#000000 0px 0px 7px",
            "font-family":
                "Netflix Sans,Helvetica Nueue,Helvetica,Arial,sans-serif",
            "font-weight": "bolder"
        })
    }
}
