/* eslint import/no-extraneous-dependencies: ["error", {"optionalDependencies": false}] */

const express = require('express');

const app = express();
app.use('/', express.static('./demo'));
app.use('/scripts', express.static('./dist'));

app.listen(1802, () => {
    console.log('app running on 1802');
});
