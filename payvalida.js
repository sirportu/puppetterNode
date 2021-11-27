const Timeout = require('await-timeout');
const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
var db = require('./sqlServer');


puppeteer.use(
    RecaptchaPlugin({
        provider: {
        id: '2captcha',
        token: '60b501bf06aba3552eb057e307365ab0'
        },
        visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
);

(async () => {

    const array = [0,4,8,12,16,20,24,28];
    
    array.forEach(async element => {

        await Timeout.set(element * 1000);
        console.log('ENTRO');
        const browser = await (await puppeteer.launch({ headless: false, devtools: false }));

        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080,
        });

        await proceso();

        async function proceso() {
            try {
                db.sql('SELECT TOP 5 intCodigoTransaccionBemovilTemp, vchIDJugador, decValorPaquete, vchDescripcionPaquete FROM TransaccionProcesarTemp WHERE vchReferenciaPago IS NULL AND bitIDJugadorValido IS NULL AND vchObservacionGeneracionReferencia IS NULL AND vchObservacion IS NULL AND (dtmFechaActualizacion IS NULL OR DATEDIFF(MI, dtmFechaActualizacion, GETDATE()) > 5) ORDER BY intCodigoTransaccionBemovilTemp',async function(err,result) {
                    console.log('DATOS OBTENIDOS - ', result.recordset.length);
                    db.sql("UPDATE TransaccionProcesarTemp SET dtmFechaActualizacion = GETDATE() WHERE intCodigoTransaccionBemovilTemp IN (" + result.recordset.map(m => m.intCodigoTransaccionBemovilTemp).join(',') + ")",function(err,result) {});
                    console.log('DATOS RESERVADOS');
                    for (let i = 0 ; i < result.recordset.length ; i++) {
                        const row = result.recordset[i];
                        let banderaCaptcha = true;
                        await page.goto('https://pagostore.com/app').catch(e => void 0);;
                        await Timeout.set(5000);
                        console.log('PAGINA CARGADA');
                        console.log('INICIO PROCESO - ', row.vchIDJugador);
                        await page.click('ul._3N-Z47ZSQckCYoninQd4TA li:nth-child(1) > a');
                        await Timeout.set(1500);
                        await page.click('div.IYkDBLcPrLrtdeIei9Dyd div:nth-child(2)');
                        await page.type('.oxVbmPqVSkCVx79GnnLc7', row.vchIDJugador);
                        await page.click('._3duKww4d68rWsj1YAVEbYt');
                        await Timeout.set(3000);
                        console.log('VERIFICAMOS SI EXISTEN ERRORES');
                    
                        while(banderaCaptcha){
                            if ((await page.$$eval('._3sYGlvN9b3AEZixLIfPEyv', (elements) => elements.length)) > 0) {
                                console.log('HAY ERRORES');
                                if((await page.$$eval('._3sYGlvN9b3AEZixLIfPEyv', (elements) => elements[0].innerText)) == 'Por favor marca la casilla de Captcha para continuar') {
                                    console.log('HAY CAPCHAT');
                                    await Timeout.set(3000);
                                    console.log('ENTRADA CAPCHAT');
                                    await page.solveRecaptchas();
                                    console.log('SALIDA CAPCHAT');
                                    page.click('._3duKww4d68rWsj1YAVEbYt');
                                } 
                                else if((await page.$$eval('._3sYGlvN9b3AEZixLIfPEyv', (elements) => elements[0].innerText)) == 'ID de jugador inválido')  {
                                    console.log('JUGADOR INVALIDO');
                                    db.sql("UPDATE TransaccionProcesarTemp SET bitIDJugadorValido = 0 WHERE intCodigoTransaccionBemovilTemp = '" + row.intCodigoTransaccionBemovilTemp + "'",function(err,result) {});
                                    banderaCaptcha = false;
                                    await page.click('._2vrDwSjCqOBOzET5QNn5oK');
                                }
                                else if((await page.$$eval('._3sYGlvN9b3AEZixLIfPEyv', (elements) => elements[0].innerText)) == 'El juego no acepta recarga con ID del jugador por el momento. Por favor intenta más tarde o usa tu cuenta Garena/Facebook para recargar.')  {
                                    console.log('JUGADOR NO PUEDE RECARGAR');
                                    const mensaje = (await page.$$eval('._3sYGlvN9b3AEZixLIfPEyv', (elements) => elements[0].innerText));
                                    db.sql("UPDATE TransaccionProcesarTemp SET vchObservacionGeneracionReferencia = '" + mensaje + "' WHERE intCodigoTransaccionBemovilTemp = '" + row.intCodigoTransaccionBemovilTemp + "'",function(err,result) {});
                                    banderaCaptcha = false;
                                    await page.click('._2vrDwSjCqOBOzET5QNn5oK');
                                }
                            } else {
                                if ((await page.$$eval('._3Acc8sy0yvH4wIM24x2OgV', (elements) => elements.length)) > 0) 
                                {
                                    console.log('JUGADOR FUERA DE REGION');
                                    const mensaje = await page.$$eval("._2K-dX6FnO61-fpPWydJmP3", (elements)=> elements[0].innerText);
                                    db.sql("UPDATE TransaccionProcesarTemp SET vchObservacionGeneracionReferencia = '" + mensaje + "' WHERE intCodigoTransaccionBemovilTemp = '" + row.intCodigoTransaccionBemovilTemp + "'",function(err,result) {});
                                    banderaCaptcha = false;
                                    await page.click('._3Acc8sy0yvH4wIM24x2OgV');
                                }else {
                                    console.log('JUGADOR CORRECTO');
                                    await Timeout.set(3000);
                                    const elementos = await page.$$eval('div._3itcD-Pl_RmzhuigTd5VQN > div:nth-child(2) > a', (elements) => elements.length);
                                    console.log('SELECCIONAMOS COMPRA - ', elementos);
                                    for(let index = 1 ; index <= elementos ; index++) {
                                        const textoPaq = (await page.$$eval('div._3itcD-Pl_RmzhuigTd5VQN > div:nth-child(2) > a:nth-child(' + index + ') > ._3V9DM0qZ5XUDQCKZboGom > ._3nTgjjyoq4NSC4bbztkcnl > span.fHutKFROlyyE1qVJNGaEq', (elements) => elements[0].innerText)).replace('US$ ', '');
                                        console.log('EVALUAR ELEMENTO - ', textoPaq);
                                        const textoDes = (await page.$$eval('div._3itcD-Pl_RmzhuigTd5VQN > div:nth-child(2) > a:nth-child(' + index + ') > ._3V9DM0qZ5XUDQCKZboGom > ._1v4QMCKGPgfdVXYRO07us > div', (elements) => elements[0].innerText));
                                        console.log('EVALUAR ELEMENTO - ', textoDes);
                                        if(parseFloat(textoPaq) == parseFloat(row.decValorPaquete) && ((row.vchDescripcionPaquete && row.vchDescripcionPaquete.length > 0 && row.vchDescripcionPaquete == textoDes) || (!row.vchDescripcionPaquete || row.vchDescripcionPaquete.length == 0))) {
                                            console.log('COMPRA ENCONTRADA');
                                            await page.click('div._3itcD-Pl_RmzhuigTd5VQN > div:nth-child(2) > a:nth-child(' + index + ')');
                                            await Timeout.set(2000);
                                            await page.type('.lJ9k22FLin9df3ckrL8wL._2o3ISYl_1Lnt_aoZYPF4fH > input.oxVbmPqVSkCVx79GnnLc7', row.vchIDJugador + '@test.com');
                                            await page.click('._3duKww4d68rWsj1YAVEbYt');
                                            index = elementos + 1;
                                        }
                                    }
                        
                                    console.log('ESPERAMOS QUE CARGUE LA SIGUIENTE PAGINA');
                                    banderaCaptcha = false;
                                    await Timeout.set(7000);
                                    console.log('ACEPTAMOS TERMINOS');
                                    await page.click('#mat-checkbox-1 > label > .mat-checkbox-inner-container.mat-checkbox-inner-container-no-side-margin');
                                    await page.click('.col-10 > .mat-focus-indicator');
                                    await Timeout.set(5000);
                                    let referencia = (await page.$$eval('.boxTransaction > :nth-child(1) > :nth-child(2)', (elements) => elements[0].innerText));
                                    referencia = referencia.replace('Número de referencia de pago: ', '');
                                    console.log('COPIAMOS REFERENCIA - ', referencia);
                                    db.sql("UPDATE TransaccionProcesarTemp SET bitIDJugadorValido = 1, vchReferenciaPago = '" + referencia + "' WHERE intCodigoTransaccionBemovilTemp = '" + row.intCodigoTransaccionBemovilTemp + "'",function(err,result) {});
                                    await page.click('.returnMerchant');
                                    await Timeout.set(3000);
                                    await page.click('._2dyYX5pthjwDNmIYcbO2v_ > a:nth-child(2)');
                                    await Timeout.set(3000);
                                }
                            }
                        }
                    
                        console.log('SALIO');

                        if (i + 1 == result.recordset.length) {
                            console.log("ITERACION CULMINADA VOLVEMOS A INICIAR");
                            proceso();
                        }
                    }
    
                    if (result.recordset.length == 0) {
                        console.log("SIN DATOS VOLVEMOS A LLAMAR");
                        await Timeout.set(20000);
                        proceso();
                    }
    
                    console.log('PROCESO CULMINADO');
                    //await browser.close();
                });
            }
            catch(err) {
                console.log('CIERRE POR ERROR - ', err);
                await browser.close();
            }
        }
    });
})();