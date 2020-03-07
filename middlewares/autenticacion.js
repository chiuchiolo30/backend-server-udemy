/*jshint esversion: 6 */

var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;




//============================================================================
// Verificar token
//============================================================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify( token, SEED, ( err, decode ) => {
        if ( err ) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        req.usuario = decode.usuario; // información del usuario que hizo la solicitud
        next();
    });
};

//============================================================================
// Verificar ADMIN
//============================================================================
exports.verificaADMIN_ROLE = function(req, res, next) {
    let usuario = req.usuario;

    if ( usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - no es administrador',
            errors: {message: 'No es administrador'}
        });
    } 
};
//============================================================================
// Verificar ADMIN o mismo usuario
//============================================================================

exports.verificaADMIN_o_MismoUsuario = function(req, res, next) {
    let usuario = req.usuario;
    let id = req.params.id;

    if ( usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - no es administrador ni es el mismo usuario',
            errors: {message: 'No es administrador'}
        });
    } 
};




   


