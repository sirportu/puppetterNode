(async() => {
    // puppeteer-extra is a drop-in replacement for puppeteer,
    // it augments the installed puppeteer with plugin functionality
    const puppeteer = require('puppeteer-extra')

    // add recaptcha plugin and provide it your 2captcha token (= their apiKey)
    // 2captcha is the builtin solution provider but others would work as well.
    // Please note: You need to add funds to your 2captcha account for this to work
    const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
    console.log('1');
    puppeteer.use(
        RecaptchaPlugin({
            provider: {
            id: '2captcha',
            token: '60b501bf06aba3552eb057e307365ab0' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
            },
            visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
        })
    )
    console.log('2');
    // puppeteer usage as normal
    puppeteer.launch({ headless: false }).then(async browser => {
        console.log('3');
        const page = await browser.newPage()
        await page.goto('https://www.google.com/recaptcha/api2/demo')
        console.log('4');
        // That's it, a single line of code to solve reCAPTCHAs 🎉
        await page.solveRecaptchas()
        console.log('5');

        await Promise.all([
            console.log('6'),
            page.waitForNavigation(),
            page.click(`#recaptcha-demo-submit`),
            console.log('7')
        ])
        await page.screenshot({ path: 'response.png', fullPage: true })
        console.log('8');
        await browser.close()
    })
})();