const cron = require('node-cron');
const express = require('express');

const sql = require('./database/sqlserver');
const juego = require('./iniciar');


(async () => {

    try {

        // app = express();

        // // Schedule tasks to be run on the server.
        // cron.schedule('*/20 * * * * *', async function () {

            const limite = "10";

            // obtener jugadores
            let data = await sql.querySql("select top " + limite + " intCodigoTransaccionBemovilTemp id, vchIDJugador numeroJugador, decValorPaquete valorPaquete,  isnull(vchDescripcionPaquete, 'Diamond') descripcionPaquete,  vchReferenciaPago numeroReferencia, bitIDJugadorValido valido, dtmFechaActualizacion, vchObservacionGeneracionReferencia observacion from TransaccionProcesarTemp with(nolock) where vchReferenciaPago is null and bitIDJugadorValido is null and intCodigoStatus = 300 and vchObservacionGeneracionReferencia is null and (dtmFechaActualizacion is null or datediff(mi, dtmFechaActualizacion, getdate())>5) order by intCodigoTransaccionBemovilTemp desc ");

            let datosJugadoresList = data.recordset;

            const dia = new Date();
            console.log('running a task registros: ' + datosJugadoresList.length + " -> " + dia.getDay() + "/" + dia.getMonth() + " " + dia.getHours() + ":" + dia.getMinutes() + ":" + dia.getSeconds());

            if (datosJugadoresList.length === 0) return;

            datosJugadoresList.map(async item => {                
                let queryResp = "update TransaccionProcesarTemp set dtmFechaActualizacion = getdate() where intCodigoTransaccionBemovilTemp = " + item.id;
                await sql.querySql(queryResp);
            });

            const dominio = "negocioefectivo.com"


            for (const datosJugador of datosJugadoresList) {
                juego.iniciaNavegacion(datosJugador, dominio).then(async (resp) => {

                    let queryResp = "";
                    queryResp = queryResp.concat("update TransaccionProcesarTemp set bitIDJugadorValido=", resp.valido ? 1 : (resp.valido != null ? 0 : null), ", vchReferenciaPago = ", resp.numeroReferencia ? ("'" + resp.numeroReferencia + "'") : null, ", vchObservacionGeneracionReferencia =", resp.observacion ? ("'" + resp.observacion + "'") : null, " where intCodigoTransaccionBemovilTemp = ", resp.id);

                    console.log(queryResp);

                    await sql.querySql(queryResp);
                });
            }

        // });

        // app.listen(3000);

    } catch (error) {
        console.log(error);
        // await sql.querySql("insert into EnvioSMSDetalle(intCodigoEnvioSMS, vchNumeroDestino, vchMensaje, intIndicadorEnviado, intCodigoOperadorEnvioSMS, intCodigoPrioridad)  values(11304, '0984222000', 'Excepción rbt Free', 0, 0, 5), (11304, '0992696254', 'Excepción rbt Free', 0, 0, 5)");
     
    }

})();