const sql = require('mssql');

// CONEXION CON TRITON


const configTriton = {
    user: 'UseMneNhadasoft',
    password: 'TRcdfdG$H8%4eD9(',
    server: 'soptec.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
    database: 'TRITON_SOPTEC',
    options: {
        trustServerCertificate: true
    }
}

/*
const configTriton = {
    user: 'MneUsDesa',
    password: 'f1a2c3il',
    server: 'ttope', // You can use 'localhost\\instance' to connect to named instance
    database: 'TRITON_SOPTEC_DESARROLLO',
    options: {
        trustServerCertificate: true
    }
}

// CONECCION CON NHADASOFT
const configNhadasoft = {
    user: 'sa',
    password: '1234',
    server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
    database: 'NHADASOFT_MIGRA17',
    options: {
        trustServerCertificate: true
    }
}
*/
async function querySql(querySQL) {
    try {
        let pool = await sql.connect(configTriton);
        // let pool = await sql.connect(configNhadasoft);

        let result = await pool.request().query(querySQL);
        
        await pool.close();

        return result;
    } catch (err) {
        // ... error checks
        console.log(querySQL);
        console.log(err);
    }
}


module.exports = {
    "querySql": querySql
}