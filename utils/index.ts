import $ from "jquery"

export function observeSection(
  section: HTMLElement,
  doOnMutation: (mutation: MutationRecord) => void
) {
  // Options for the observer (which mutations to observe)
  const config = {
    childList: true,
    subtree: true
  }

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      doOnMutation(mutation)
    }
  })

  // Start observing the target node for configured mutations
  observer.observe(section, config)
}

export function waitForElement(
  selector,
  customDom?: Document
): Promise<HTMLElement> {
  if (customDom) {
    return new Promise((resolve) => {
      if (customDom.querySelector(selector)) {
        return resolve(customDom.querySelector(selector))
      }

      const observer = new MutationObserver(() => {
        if (customDom.querySelector(selector)) {
          resolve(customDom.querySelector(selector))
          observer.disconnect()
        }
      })

      observer.observe(customDom.body, {
        childList: true,
        subtree: true
      })
    })
  }
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector))
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}

export function removeNoPointerEvents(
  element: HTMLElement | JQuery<HTMLElement> | Node
) {
  $(element).css("pointer-events", "all")
  $(element).css("user-select", "auto")
  $(element).css("zindex", 1000)
  $(element).css("z-index", 1000)
}

export function single_double_click(
  element: JQuery<Node>,
  single_click_callback,
  double_click_callback,
  timeout
) {
  return element.each(function () {
    var clicks = 0,
      self = element
    $(element).on("click", function (event) {
      clicks++
      event.stopPropagation()
      if (clicks == 1) {
        setTimeout(function () {
          if (clicks == 1) {
            single_click_callback.call(self, event)
          } else {
            double_click_callback.call(self, event)
          }
          clicks = 0
        }, timeout || 300)
      }
    })
  })
}
