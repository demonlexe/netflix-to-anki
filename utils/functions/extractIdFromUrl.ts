// netflix: https://www.netflix.com/watch/81416715?trackId=14292320&tctx=1%2C1%2C0c8d82e5-1ae9-4d12-9fcb-e7f7ec939ba0-97977694%2CNES_A6E48FF15C5A381C978BE34225E456-1D364BE54DB1AF-D1E25C970C_p_1739497754071%2C%2C%2C%2C%2C%2CVideo%3A81416715%2CdetailsPagePlayButton
// hulu: https://www.hulu.com/watch/7efbe627-6ed3-4894-a483-ec4539f45850
// max: https://play.max.com/video/watch/e0c50a05-ba76-4599-875f-f5bdc7bdcc8c/0bb030e8-163a-4012-ae1a-89d9d2c5755e

import logDev from "./logDev"

export default function extractIdFromUrl(url: string) {
    // Use a regular expression to match the ID in the URL
    const match =
        window.usingSite === "hulu" || window.usingSite === "netflix"
            ? url.match(/\/watch\/([a-zA-Z0-9-]+)\?/)
            : url.match(/\/video\/watch\/([a-zA-Z0-9-]+)\//)
    if (match && match[1]) {
        logDev("I have set the current show id to", match[1])
        return match[1]
    } else {
        return null // Return null if no match is found
    }
}
