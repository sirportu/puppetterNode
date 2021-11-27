const mssql = require('mssql');
const db = {};

// config for your database
const config = {
    //port: parseInt(process.env.DB_PORT, 10),
    server: 'ttope', 
    user: 'MneUsDesa',
    password: 'f1a2c3il',
    database: 'TRITON_SOPTEC_DESARROLLO',
    stream: false,
    options: {
        trustedConnection: true,
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true
    }
};

db.sql = function (sql, callBack) {
    var connection = new mssql.ConnectionPool(config, function (err) {
        if (err) {
            console.log(err);
            return;
        }
        var ps = new mssql.PreparedStatement(connection);
        ps.prepare(sql, function (err) {
            if (err){
                console.log(err);
                return;
            }
            ps.execute('', function (err, result) {
                if (err){
                    console.log(err);
                    return;
                }

                ps.unprepare(function (err) {
                    if (err){
                        console.log(err);
                        callback(err,null);
                        return;
                    }
                    callBack(err, result);
                });
            });
        });
    });
};

module.exports = db;