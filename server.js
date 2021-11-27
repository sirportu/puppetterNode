var express = require('express');
var app = express();

app.get('/', function (req, res) {
    console.log('1');
    var sql = require("mssql");

    // config for your database
    var config = {
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

    // connect to your database
    sql.connect(config, function (err) {
        console.log('2');   
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select * from Payvalida', function (err, recordset) {
            console.log('3');
            if (err) console.log(err)

            // send records as a response
            res.send(recordset);
            
        });
    });
});

var server = app.listen(5000, function () {
    console.log('Server is running..');
});