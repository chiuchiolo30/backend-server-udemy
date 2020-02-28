/*jshint esversion: 6 */ 


var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//============================================================================
// Busqueda por colección
//============================================================================

app.get('/coleccion/:tabla/:busqueda', (req, res) =>{

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp( busqueda, 'i');



    switch( tabla ){
        case 'usuarios':
            buscarUsuario( busqueda, regex ).then( data => {
                res.status(200).json({
                    ok: true,
                    usuarios: data
                });
            });
            break;

         case 'medicos':
            buscarMedicos( busqueda, regex ).then( data => {
                res.status(200).json({
                    ok: true,
                    medicos: data
                });
            });
            break;

        case 'hospitales':
            buscarHospitales( busqueda, regex ).then( data => {
                res.status(200).json({
                    ok: true,
                    hospitales: data
                });
            });
            break;

            default:
                res.status(400).json({
                    ok: false,
                    mensaje: 'los tipos de busquedas sólo son: usuarios, medicos y hospitales',
                    err: { message: 'Tipo de tabla/colección no válido' }
                });

    }
});

//============================================================================
// Busqueda general - simultanea
//============================================================================
app.get('/todo/:busqueda', (req, res, next ) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i');

    Promise.all( [ buscarHospitales( busqueda, regex ),
                   buscarMedicos( busqueda, regex),
                   buscarUsuario( busqueda, regex) ])
           .then( respuestas => {

               res.status(200).json({
                   ok: true,
                   hospitales: respuestas[0],
                   medicos: respuestas[1],
                   usuarios: respuestas[2]
               });
           });
});

function buscarHospitales( busqueda, regex ) {

    return new Promise( (resolve, reject ) => {

        Hospital.find({ nombre: regex })
                .populate('usuario', 'nombre email')
                .exec( (err, hospitales) => {
    
                if ( err ) {
                    reject('Error al cargar hospitales', err );
                }else{
                    resolve(hospitales);
                }
                });
    });
}

function buscarMedicos( busqueda, regex ) {

    return new Promise( (resolve, reject ) => {

        Medico.find({ nombre: regex })
              .populate( 'usuario', ' nombre email')
              .populate( 'hospital')
              .exec((err, medicos) => {
    
                if ( err ) {
                    reject('Error al cargar medicos', err );
                }else{
                    resolve(medicos);
                }
                });
    });
}

function buscarUsuario( busqueda, regex ) {

    return new Promise( (resolve, reject ) => {

        Usuario.find({}, 'nombre email role img google')
               .or( [ { 'nombre': regex }, { 'email': regex }])
               .exec( ( err, usuarios ) => {
                    if (err){
                        reject('Error al cargar usuarios', err);
                    }else{
                        resolve(usuarios);
                    }
               });
    });
}

module.exports = app;