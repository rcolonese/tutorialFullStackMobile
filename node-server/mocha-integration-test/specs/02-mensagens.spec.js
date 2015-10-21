var Promise = require('promise');
var should = require('should');
var request = require('supertest');
var testeParametros = require('../teste-parametros.js');
var specData = require('../spec-data.js');
var apiMiddleware = require('../../api/01.api-middleware.js');

function criar_mensagem(mensagem, id_usu_remetente, id_usu_destinatario) {
    var mensagem = {
        msg: mensagem,
        id_usuario_remetente: id_usu_remetente,
        id_usuario_destinatario: id_usu_destinatario
    }

    return mensagem;
}

function incluir_mensagem(mensagem, key) {

    return new Promise(function (resolve, reject) {

        var url_base_api = testeParametros.get_url_base();
        url_base_api += apiMiddleware.get_url_autenticacao();

        var httpRequest = request(url_base_api);

        httpRequest.post('/mensagem')
            .set('x-key', key)
            .send(mensagem)
            .end(function (err, res) {

                if (err) {
                    return reject(err);
                }

                var resposta = res.body;

                if (res.status != 200) {

                    var text = JSON.parse(res.text);

                    reject({
                        erro: true,
                        msg: text.message
                    })

                } else {
                    if (resposta.erro == true) {
                        return reject(resposta);
                    } else {
                        if (resposta.status == 401) {

                            return reject({
                                erro: true,
                                msg: JSON.parse(resposta.text).message
                            })
                        }
                        return resolve(resposta);
                    }
                }
            });
    });
}

function listar_mensagens(id_usuario_um, id_usuario_dois, key) {

    return new Promise(function (resolve, reject) {

        var url_base_api = testeParametros.get_url_base();
        url_base_api += apiMiddleware.get_url_autenticacao();

        var httpRequest = request(url_base_api);

        httpRequest.get('/mensagem/' + email)
            .set('x-key', key)
            .end(function (err, res) {

                if (err) {
                    return reject(err);
                }

                var resposta = res.body;

                if (res.status != 200) {

                    var text = JSON.parse(res.text);

                    reject({
                        erro: true,
                        msg: text.message
                    })

                } else {
                    if (resposta.erro == true) {
                        return reject(resposta);
                    } else {
                        if (resposta.status == 401) {

                            return reject({
                                erro: true,
                                msg: JSON.parse(resposta.text).message
                            })
                        }
                        return resolve(resposta);
                    }
                }
            });
    });
}

var Teste = function () {

    var server;

    this.executar = function () {

        describe('Metodos da API Usuários:', function () {

            it('incluir mensagem', function (done) {
                var usuarios = specData.get_usuarios();
                var usuario_um = usuarios[0];
                var usuario_dois = usuarios[1];

                var mensagem = criar_mensagem('Por que tem um trampolim no Polo Norte?', usuario_um.id, usuario_dois.id);

                incluir_mensagem(mensagem, usuario_um.key).then(
                    function (success) {
                        success.should.have.property('erro');
                        success.erro.should.equal(false);
                        
                        success.should.have.property('msg');
                        success.msg.should.match(/incluída/);
                        
                        done();
                    },
                    function (error) {
                        throw 'Não deveria ter dado erro';
                    }
                ).done(null, done);
            });
            
             it('incluir mensagem de resposta', function (done) {
                var usuarios = specData.get_usuarios();
                var usuario_um = usuarios[1];
                var usuario_dois = usuarios[0];

                var mensagem = criar_mensagem('Pro urso pular!', usuario_um.id, usuario_dois.id);

                incluir_mensagem(mensagem, usuario_um.key).then(
                    function (success) {
                        success.should.have.property('erro');
                        success.erro.should.equal(false);
                        
                        success.should.have.property('msg');
                        success.msg.should.match(/incluída/);
                        
                        done();
                    },
                    function (error) {
                        throw 'Não deveria ter dado erro';
                    }
                ).done(null, done);
            });
            
            it('Não permitir postar mensagem em nome de outros usuários', function (done) {
                var usuarios = specData.get_usuarios();
                var usuario_um = usuarios[0];
                var usuario_dois = usuarios[1];
                var usuario_tres = usuarios[2];

                var mensagem = criar_mensagem('Não deve ser aceita', usuario_um.id, usuario_dois.id);

                incluir_mensagem(mensagem, usuario_tres.key).then(
                    function (success) {
                        throw 'Não deveria ter aceito incluir';
                    },
                    function (error) {
                        error.should.have.property('erro');
                        error.erro.should.equal(true);
                        
                        error.should.have.property('msg');
                        error.msg.should.match(/Seu usuário precisa ser o remetente da mensagem/);
                        
                        done();
                    }
                ).done(null, done);
            });
            
            it('Não permitir postar mensagem sem passar o key', function (done) {
                var usuarios = specData.get_usuarios();
                var usuario_um = usuarios[0];
                var usuario_dois = usuarios[1];

                var mensagem = criar_mensagem('Mensagem sem key deve ser negada', usuario_um.id, usuario_dois.id);

                incluir_mensagem(mensagem, null).then(
                    function (success) {
                        throw 'Não deveria ter aceito incluir';
                    },
                    function (error) {
                        
                        error.should.have.property('erro');
                        error.erro.should.equal(true);
                        
                        error.should.have.property('msg');
                        error.msg.should.match(/inválido/);
                        
                        done();
                    }
                ).done(null, done);
            });

        });

    }
}

module.exports = new Teste();