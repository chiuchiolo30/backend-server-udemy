/*jshint esversion: 6 */ 

// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuarios');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');



// Inicializar variables
var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDb', ( err, res ) => {
        if( err ) throw err; // si sucede un error se detiene el proceso

        console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Server index config - opcional
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));



// Rutas - Middleware
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);


app.use('/', appRoutes); // está tiene que ser la ultima


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
    
});