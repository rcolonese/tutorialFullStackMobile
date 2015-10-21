var model_usuario = require('../CamadaDados/usuario-mysql');
var apiMiddleware = require('./01.api-middleware.js');

module.exports = {
    start: function (server) {
        
        console.log('API usuário iniciada!');
        
        var url_autenticacao_obrigatoria = apiMiddleware.get_url_autenticacao();

        //Insere um novo usuário
        server.post('/usuario', function (req, res) {

            var user_data = req.body;

            model_usuario.inserir(user_data).then(
                function (row) {

                    return res.json({
                        erro: false,
                        msg: 'usuário incluído',
                        id: row.insertId
                    });

                }, function (err) {
                    return res.json({
                        erro: true,
                        msg: err
                    });
                }
            );

        });

        //Autenticar usuário por email e senha e retornar a chave Key para autenticacao
        server.post('/usuario/autenticar', function (req, res) {

            var user_data = req.body;

            if (!user_data.email || !user_data.senha) {
                return res.json({
                    erro: true,
                    msg: 'email e senha são obrigatórios'
                });
            }

            model_usuario.autenticarUsuario(user_data.email, user_data.senha).then(
                function (dados) {

                    res.json({
                        erro: false,
                        key: dados.key,
                        id: dados.id
                    });

                },
                function (err) {
                    res.json({
                        erro: true,
                        msg: err
                    });
                }
            );

        });
       

        //Retorna uma lista de usuários
        server.get(url_autenticacao_obrigatoria + '/usuarios/:email', function (req, res) {

            var email = req.params.email;

            model_usuario.getUsuarios(email).then(
                function (usuarios) {
                    delete usuarios.senha;

                    var resposta = {
                        erro: false,
                        usuarios: usuarios
                    };

                    res.json(resposta);
                }, function (err) {
                    return res.json({
                        erro: true,
                        msg: err
                    });
                }
            );

        });

    }
};