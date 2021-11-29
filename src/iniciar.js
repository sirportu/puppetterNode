// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')

const dataJuego = require("./const/juego");
const dataCompra = require("./const/compra");
const navegador = require('./navegar');
const recaptcha = require('./services/resolveCaptcha');

const TOKEN_CAPTCHA = "60b501bf06aba3552eb057e307365ab0";


async function iniciaNavegacion(datosJugador, dominio) {
    let page;
    let browser;
    try {

        // configuracion del servicio de captcha
        puppeteer.use(
            RecaptchaPlugin({
                provider: {
                    id: '2captcha',
                    token: TOKEN_CAPTCHA
                },
                visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
            })
        );

        browser = await puppeteer.launch({ headless: false, debuggingPort: false, args: ['--start-maximized'] });

        // navegacion por la página        
        page = await navegador.navegarPagina(browser);

        // seleccionar juego    
        await page.waitForTimeout(2000);
        await navegador.onClickButton(page, dataJuego.SELECCIONAR_JUEGO);

        // seleccionamos 
        await page.waitForXPath(dataJuego.OPCION_LOGIN);
        await navegador.onClickButton(page, dataJuego.OPCION_LOGIN);

        // ingresamos el id del jugador
        await page.waitForXPath(dataJuego.ID_JUGADOR);
        await navegador.txtIngresoTexto(page, dataJuego.ID_JUGADOR, datosJugador.numeroJugador);

        // ingresar login
        await navegador.onClickButtonCss(page, dataJuego.INGRESO_LOGIN);

        // Espera para ver respuesta del jugador
        await page.waitForTimeout(5000);

        // mensajes del jugador
        const mensaje = await resolveCaptchaPlay(page);

        // informacion del jugador
        if (mensaje === null) {

            await navegador.onSelectElement(page, dataJuego.ITEMS_COMPRA, datosJugador.descripcionPaquete, datosJugador.valorPaquete);

            await page.waitForXPath(dataJuego.INGRESO_REFERENCIA);

            console.log(" describe paquete: " + datosJugador.descripcionPaquete);
            // ingreso de correo 
            if (datosJugador.descripcionPaquete === "Diamond") {
                await navegador.txtIngresoTexto(page, dataJuego.CORREO_JUGADOR, datosJugador.numeroJugador + "@" + dominio);
            } else {
                await navegador.txtIngresoTexto(page, dataJuego.CORREO_JUGADOR_TARJETA, datosJugador.numeroJugador + "@" + dominio);
            }

            // click boton pago
            await navegador.onClickButton(page, dataJuego.INGRESO_REFERENCIA);

            const numeroReferencia = await obtenerReferenciaCompra(navegador, page, datosJugador.numeroJugador);

            datosJugador.numeroReferencia = "" + numeroReferencia;
            datosJugador.valido = datosJugador.numeroReferencia != null;
            datosJugador.observacion = "Se obtuvo la referencia";

            // salir del juego
            await page.waitForNavigation({ waitUntil: "networkidle2" });

            await page.waitForXPath(dataJuego.SALIR_JUEGO);

            await navegador.onClickButton(page, dataJuego.SALIR_JUEGO);

        } else if (mensaje !== null && mensaje.includes("inválido")) { // jugador invalido
            datosJugador.valido = false;
            datosJugador.observacion = !mensaje.includes("Captcha") ? mensaje : null;
        } else {
            datosJugador.valido = false;
            datosJugador.observacion = mensaje;
        }

    } catch (error) {
        datosJugador.observacion = datosJugador.numeroReferencia == null ? null : "Se obtuvo la referencia";
        if (page) await page.screenshot({ path: 'error_' + datosJugador.id + '.png' });
    } finally {
        await browser.close();
    }
    return datosJugador;
}

async function resolveCaptchaPlay(page) {
    let mensaje = "";

    try {
        mensaje = await navegador.obtenerContenido(page, dataJuego.MENSAJE_JUGADOR);

        if (mensaje !== null && mensaje.includes("Captcha")) { // requiere captcha            

            // llamar al servicio
            await recaptcha.resolveCaptcha(page);

            await page.waitForTimeout(2000);
            await navegador.onClickButtonCss(page, dataJuego.INGRESO_LOGIN);

            // Esperamos para ver el mensaje
            await page.waitForTimeout(2000);

            mensaje = await navegador.obtenerContenido(page, dataJuego.MENSAJE_JUGADOR);

            mensaje = (mensaje !== null && mensaje.includes("Captcha")) ? null : mensaje;
        }

        await page.waitForTimeout(5000);

        const testMensaje = await navegador.obtenerContenido(page, dataJuego.MENSAJE_JUGADOR_FINAL);

        if (testMensaje) {
            mensaje = testMensaje.replace(/"/, "");
            mensaje = mensaje.replace(/"/, "");
            mensaje = mensaje.replace("Haga clic en Continuar para ir a la tienda correcta: tienda", "");
        }

    } catch (error) {
        throw error;
    }
    return mensaje;
}


async function obtenerReferenciaCompra(navegador, page, idjugador) {

    let referencia = "";
    try {
        await page.waitForNavigation({ waitUntil: "networkidle2" });

        await page.waitForXPath(dataCompra.CHECK_DECLARACION_FONDOS);

        // Acepta declaracion de fondos
        await navegador.onClickButton(page, dataCompra.CHECK_DECLARACION_FONDOS);

        // Boton Acepta declaracion
        await navegador.onClickButton(page, dataCompra.ACEPTA_DECLARACION_FONDOS);

        // Espera para ver respuesta de la referencia
        await page.waitForTimeout(2000);

        // mensajes del jugador
        const dataRef = await navegador.obtenerContenidoXpath(page, dataCompra.NUMERO_REFERENCIA);

        referencia = dataRef.match(new RegExp('\\d+'));

        // await page.screenshot({ path: 'referencia_' + idjugador + '.png' });

        // Salir del juego
        await navegador.onClickButton(page, dataCompra.SALIR_COMPRA);

        return referencia;
    } catch (error) {
        return referencia;
    }

}


module.exports = {
    "iniciaNavegacion": iniciaNavegacion
}
