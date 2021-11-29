const cron = require('node-cron');
const express = require('express');



// ...

app = express();

// Schedule tasks to be run on the server.
cron.schedule('*/10 * * * * *', function () {
    console.log('running a task every minute');
});

app.listen(3000);