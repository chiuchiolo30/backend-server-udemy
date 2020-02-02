/*jshint esversion: 6 */ 

var express = require('express');

var app = express();

// Librería para crear path
const path  = require('path');
const fs    = require('fs');


app.get('/:tipo/:img', (req, res, next ) => {

    var tipo    = req.params.tipo;
    var img     = req.params.img;
// __dirname: contiene la ruta donde me encuentro en este momento
    var pathImagen = path.resolve( __dirname,`../uploads/${ tipo }/${ img }` );

    if( fs.existsSync( pathImagen ) ){
        res.sendFile( pathImagen );
    } else {
        var pathNoImagen = path.resolve( __dirname, '../assets/no-img.jpg');
        res.sendFile( pathNoImagen );
    }
});

module.exports = app;