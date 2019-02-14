const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if(!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    //validar tipos
    let tiposValidos = ['productos','usuarios'];
    if(tiposValidos.indexOf(tipo) < 0) {
        return res.status(500).json({
            ok: false,
            err: {
                message: `Los tipos permitos son ${tiposValidos.join(',')}`
            }
        })
    }

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length -1];

    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if( extensionesValidas.indexOf( extension ) < 0 ){
        return res.status(500).json({
            ok: false,
            err:{
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(',')
            }
        })
    }

    //cambiar nombre al archivo para que sea único
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( tipo === 'usuarios'){
            imagenUsuario(id, res, nombreArchivo);
        }else{
            imagenProducto(id, res, nombreArchivo);
        }
    
    });

});


function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById( id, (err, usuarioBD) => {
        if(err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!usuarioBD) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchivo(usuarioBD.img, 'usuarios');

        usuarioBD.img = nombreArchivo;

        usuarioBD.save( (err, usuarioGuardado) => {
            res.json({
                ok:true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });

    });
}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                usuario: productoGuardado,
                img: nombreArchivo
            });
        });

    });
}

function borraArchivo(nombreImagen, tipo,) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;