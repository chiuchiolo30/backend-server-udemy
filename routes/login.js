/*jshint esversion: 6 */ 

// Require
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

// Importamos el esquema de usuario
var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// Middlwares
var mdAutenticacion = require('../middlewares/autenticacion');

//============================================================================
// Renueva Token
//============================================================================
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {
    var token = jwt.sign( { usuario: req.usuario }, SEED, { expiresIn: 14400 }); // 4 horas
    res.status(200).json({
        ok: true,
        token: token
        });
});
//============================================================================
// Autenticación de Google
//============================================================================
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre  : payload.name,
        email   : payload.email,
        img     : payload.picture,
        google  : true
    };
  }

app.post('/google', async(req, res) => {

    var token = req.body.token;

    let googleUser = await verify( token )
        .catch( e => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

        Usuario.findOne( { email: googleUser.email }, (err, usuarioDB) => {
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                    });
            }
            if ( usuarioDB ) {
               if (usuarioDB.google === false ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe de usar su autenticación normal'
                        });
               } else {
                var token = jwt.sign( { usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    Usuario: usuarioDB,
                    token: token,        
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
               }
            } else {
                // el usuario no existe... hay que crearlo
                var usuario = new Usuario();

                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = true;
                usuario.password = ':)';

                usuario.save((err, usuarioDB) => {
                    var token = jwt.sign( { usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                    res.status(200).json({
                        ok: true,
                        Usuario: usuarioDB,
                        token: token,        
                        id: usuarioDB._id,
                        menu: obtenerMenu(usuarioDB.role)
                    });
                });
            }
        });





    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'ok!!',
    //     googleUser: googleUser
    // });
});



//============================================================================
// Autenticación normal
//============================================================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

            if ( err ) {
                 return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuarios',
                        errors: err
                    });
            }
            if ( !usuarioDB ) {
                return res.status(400).json({
                        ok: false,
                        mensaje: 'Credenciales incorrectas - email',
                        errors: err
                    });
            }

            if ( !bcrypt.compareSync( body.password, usuarioDB.password ) ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Credenciales incorrectas - password',
                    errors: err
                });
            }

            // Crear un token
            usuarioDB.password = ':)';
            
            var token = jwt.sign( { usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

            res.status(200).json({
                ok: true,
                Usuario: usuarioDB,
                token: token,        
                id: usuarioDB._id,
                menu: obtenerMenu(usuarioDB.role)
            });
     });
 
});

function obtenerMenu( ROLE ) {
    let menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard' },
            { titulo: 'ProgressBar', url: '/progress' },
            { titulo: 'Gràficas', url: '/grafica1' },
            { titulo: 'Promesas', url: '/promesas' },
            { titulo: 'Rxjs', url: '/rxjs' }
          ]
        },
        {
          titulo: 'Mantenimiento',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            // { titulo: 'Usuarios', url: '/usuarios' },
            { titulo: 'Hospitales', url: '/hospitales' },
            { titulo: 'Medicos', url: '/medicos' }
          ]
        }
      ];

      if ( ROLE === 'ADMIN_ROLE') {
          menu[1].submenu.unshift( { titulo: 'Usuarios', url: '/usuarios' } );
      }

    return menu;

}



module.exports = app;