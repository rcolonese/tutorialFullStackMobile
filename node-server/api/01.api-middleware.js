var model_usuario = require('../CamadaDados/usuario-mysql');
//var express = require('express');
var url_autenticar = '/autenticar';

function getKey(req) {
    if (req) {
        var key = {};
        key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];
        return key;
    } else {
        return {}
    }
}

module.exports = {
    get_key: function (req) {
        return getKey(req);
    },
    get_url_autenticacao: function () {
        return url_autenticar
    },
    start: function (server) {
        console.log('API middleware iniciada!');

        //Autentica usuário pela Key
        server.all(url_autenticar + '/*', function (req, res, next) {

            var key = getKey(req);

            model_usuario.autenticarKey(key).then(
                function (msg) {
                    //Libero a propagação da chamada para as APIs
                    next();
                },
                function (msg) {

                    res.status(401);
                    return res.json({
                        status: 401,
                        message: "Usuário inválido",
                        error: msg
                    });
                }
            );

        });


    }
};