var model_mensagem = require('../CamadaDados/mensagem-mysql');
var modelUsuario = require('../CamadaDados/usuario-mysql');
var apiMiddleware = require('./01.api-middleware.js');

module.exports = {
    start: function (server) {
        console.log('API mensagem iniciada!');

        var url_autenticacao_obrigatoria = apiMiddleware.get_url_autenticacao();

        //Insere uma mensagem
        server.post(url_autenticacao_obrigatoria + '/mensagem', function (req, res) {

            var user_data = req.body;
            var key = apiMiddleware.get_key(req);
            var id_usuario = modelUsuario.get_id_from_key(key);

            //Somente é permitido que o remetente da mensagem seja do usuário logado
            if (id_usuario != user_data.id_usuario_remetente) {
                return res.json({
                    erro: true,
                    msg: 'Seu usuário precisa ser o remetente da mensagem'
                });
            }

            model_mensagem.inserir(user_data).then(
                function (mensagens) {

                    var resposta = {
                        erro: false,
                        msg: mensagens
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

        //Retorna uma lista de troca de mensagens entre 2 usuários
        server.get(url_autenticacao_obrigatoria + '/mensagens/:id_usuario_um/:id_usuario_dois', function (req, res) {

            var id_usuario_um = req.params.id_usuario_um;
            var id_usuario_dois = req.params.id_usuario_dois;
            var key = apiMiddleware.get_key(req);
            var id_usuario = modelUsuario.get_id_from_key(key);


            //Somente é permitido listar mensagens se um dos usuários dela é o usuário solicitante
            if (id_usuario != id_usuario_um && id_usuario != id_usuario_dois) {
                return res.json({
                    erro: true,
                    msg: 'Seu usuário não tem permissão de listar mensagens dos usuários solicitados'
                });
            }


            model_mensagem.getMensagensUsuario(id_usuario_um, id_usuario_dois).then(
                function (mensagens) {

                    var resposta = {
                        erro: false,
                        mensagens: mensagens
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