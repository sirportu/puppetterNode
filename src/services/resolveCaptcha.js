const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');




async function resolveCaptcha(page) {

    try {

        await page.waitForSelector('iframe[src*="recaptcha/"]')

        await page.solveRecaptchas();

        return "ok"
    } catch (error) {
        throw error;
    }
}

module.exports = {
    "resolveCaptcha": resolveCaptcha
}