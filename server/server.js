require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const bodyParse = require('body-parser');

app.use(bodyParse.urlencoded({ extended: false}));
app.use(bodyParse.json());

//habilitar la carpeta public
app.use( express.static( path.resolve(__dirname , '../public')));

//configuración global de rutas
app.use( require('./routes/index') );

mongoose.connect('mongodb://localhost:27017/cafe', (err, res) => {
    if( err ) throw err;
    console.log('Base de datos ONLINE');
});


app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: 3000');
});