// inject.js
;(function () {
    const originalXhrOpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this.addEventListener("load", function () {
            window.postMessage(
                {
                    type: "NETWORK_REQUEST",
                    method,
                    url,
                    response: this.response
                },
                "*"
            )
        })
        return originalXhrOpen.apply(this, [method, url, ...rest])
    }

    const originalFetch = window.fetch
    window.fetch = function (...args) {
        return originalFetch.apply(this, args).then((response) => {
            response
                .clone()
                .text()
                .then((body) => {
                    window.postMessage(
                        {
                            type: "NETWORK_REQUEST",
                            url: response.url,
                            response: body
                        },
                        "*"
                    )
                })
            return response
        })
    }
})()
