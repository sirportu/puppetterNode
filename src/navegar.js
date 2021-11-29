
async function navegarPagina(browser) {

    const page = await browser.newPage();

    await page.setViewport({ width: 1366, height: 768 });

    await page.goto('https://pagostore.com/');

    await page.waitForNavigation({ waitUntil: "networkidle2" });

    await page.waitForXPath('/html/body/div/div/div/div/ul/li[1]/a');

    return page;
};

async function onClickButton(page, xpadElement) {

    try {
        await page.waitForXPath(xpadElement);

        const [element] = await page.$x(xpadElement);

        await element.click();

    } catch (error) {
        throw error;
    }

}
async function onClickButtonCss(page, xpadElement) {

    try {
        await page.waitForSelector(xpadElement);

        await page.click(xpadElement);

    } catch (error) {
        throw error;
    }

}

async function txtIngresoTexto(page, xpadElement, texto) {
    try {
        await page.waitForXPath(xpadElement);
        const [element] = await page.$x(xpadElement);
        await element.type(texto);

    } catch (error) {
        throw error;
    }
}


async function obtenerContenido(page, xpadElement) {
    try {
        const getXpath = await page.$(xpadElement);

        if (!getXpath) return null;

        const value = await page.evaluate(item => item.textContent, getXpath);

        return value;

    } catch (error) {
        throw error;
    }
}

async function obtenerContenidoXpath(page, xpadElement) {
    try {
        const [getXpath] = await page.$x(xpadElement);

        if (getXpath === undefined) return null;

        const value = await getXpath.getProperty("textContent");

        return await value.jsonValue();

    } catch (error) {
        throw error;
    }
}


async function onSelectElement(page, xpadElement, descripcionPaquete, valorRecarga) {
    try {
        await page.waitForSelector(xpadElement);

        const links = await page.$$eval('div._3itcD-Pl_RmzhuigTd5VQN > div:nth-child(2) > a', (elements) => elements.length);

        for(let index = 1 ; index <= links ; index++) {
            const textoPaq = (await page.$$eval('div._3itcD-Pl_RmzhuigTd5VQN > div:nth-child(2) > a:nth-child(' + index + ') > ._3V9DM0qZ5XUDQCKZboGom > ._3nTgjjyoq4NSC4bbztkcnl > span.fHutKFROlyyE1qVJNGaEq', (elements) => elements[0].innerText)).replace('US$ ', '');
            // console.log('Valor paquete: ', textoPaq, ' - ', valorRecarga);
            const textoDes = (await page.$$eval('div._3itcD-Pl_RmzhuigTd5VQN > div:nth-child(2) > a:nth-child(' + index + ') > ._3V9DM0qZ5XUDQCKZboGom > ._1v4QMCKGPgfdVXYRO07us > div', (elements) => elements[0].innerText));
            // console.log('descripcion paquete: ', textoDes, ' - ', descripcionPaquete);
            if(parseFloat(textoPaq) == parseFloat(valorRecarga) && textoDes.indexOf(descripcionPaquete) == 0 ) {
                console.log('COMPRA ENCONTRADA');
                await page.click('div._3itcD-Pl_RmzhuigTd5VQN > div:nth-child(2) > a:nth-child(' + index + ')');
            }
        }

    } catch (error) {
        console.log("ERROR ITEMS: ", error);
        throw null;
    }
}


// Exportaciones
module.exports = {
    "navegarPagina": navegarPagina,
    "onClickButton": onClickButton,
    "onClickButtonCss": onClickButtonCss,
    "txtIngresoTexto": txtIngresoTexto,
    "obtenerContenido": obtenerContenido,
    "onSelectElement": onSelectElement,
    "obtenerContenidoXpath": obtenerContenidoXpath,
}
