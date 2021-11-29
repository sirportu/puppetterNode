// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
let puppeteer = require('puppeteer-extra')

// add recaptcha plugin and provide it your 2captcha token (= their apiKey)
// 2captcha is the builtin solution provider but others would work as well.
// Please note: You need to add funds to your 2captcha account for this to work

const TOKEN_CAPTCHA = "60b501bf06aba3552eb057e307365ab0";

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')

// puppeteer.use(
//   RecaptchaPlugin({
//     provider: {
//       id: '2captcha',
//       token: TOKEN_CAPTCHA // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
//     },
//     visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
//   })
// )
// puppeteer usage as normal



puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: TOKEN_CAPTCHA // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
        },
        // colorize reCAPTCHAs (violet = detected, green = solved)
        visualFeedback: true
    })
);

puppeteer.launch({ headless: false }).then(async browser => {

    const page = await browser.newPage()
    await page.goto('https://www.google.com/recaptcha/api2/demo')

    // That's it, a single line of code to solve reCAPTCHAs 🎉
    await page.solveRecaptchas()

    await page.screenshot({ path: 'response.png', fullPage: true })

    await Promise.all([
        page.waitForNavigation(),
        page.click(`#recaptcha-demo-submit`)
    ])
    await browser.close()
})
