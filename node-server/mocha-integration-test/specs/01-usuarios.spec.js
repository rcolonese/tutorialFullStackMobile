var Promise = require('promise');
var should = require('should');
var request = require('supertest');
var testeParametros = require('../teste-parametros.js');
var specData = require('../spec-data.js');
var apiMiddleware = require('../../api/01.api-middleware.js');

function createUsuario(email, senha, nome) {
    var usuario = {
        email: email,
        senha: senha,
        nome: nome
    }

    return usuario;
}

function incluirUsuario(usuario) {

    return new Promise(function (resolve, reject) {

        try {

            var url_base_api = testeParametros.get_url_base();
            var httpRequest = request(url_base_api);

            httpRequest.post('/usuario')
                .send(usuario)
                .end(function (err, res) {

                    if (err) {
                        if (err.code == 'ECONNREFUSED') {
                            return reject('Conexão com a API falhou na URL: ' + url_base_api + '/usuario, ' + err);
                        } else
                            return reject('erro: ' + err + ', /// ' + JSON.stringify(err));
                    }

                    var resposta = res.body;

                    if (resposta.erro == true) {
                        return reject(resposta);
                    } else {
                        usuario.id = resposta.id;

                        specData.add_usuario(usuario);

                        return resolve(resposta);
                    }
                });
        } catch (err) {
            reject('exception: ' + err);
        }
    });
}

function getUsuarios(email, key) {

    return new Promise(function (resolve, reject) {

        var url_base_api = testeParametros.get_url_base();
        url_base_api += apiMiddleware.get_url_autenticacao();

        var httpRequest = request(url_base_api);

        httpRequest.get('/usuarios/' + email)
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

//Autenticar usuário usando o key
function autenticar(email, senha) {

    var user_data = {
        email: email,
        senha: senha
    };

    return new Promise(function (resolve, reject) {

        var url_base_api = testeParametros.get_url_base();

        var httpRequest = request(url_base_api);

        httpRequest.post('/usuario/autenticar')
            .send(user_data)
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }

                var resposta = res.body;

                if (resposta.erro == true) {
                    return reject(resposta);
                } else {
                    return resolve(resposta);
                }
            });
    });
}


var Teste = function () {

    var server;

    this.executar = function () {

        describe('Metodos da API Usuários:', function () {

            describe('Criar usuário:', function () {
                it('Criar o primeiro usuário', function (done) {
                    var usu = createUsuario('raphael_colonese@exemplo.pra.vc', '1234', 'Rapha');


                    incluirUsuario(usu).then(
                        function (success) {
                            success.erro.should.equal(false);
                            success.msg.should.match(/incluído/);
                            done();
                        },
                        function (error) {
                            throw 'Não deveria ter dado erro';
                        }
                    ).done(null, done);
                });

                it('Criar o segundo usuário', function (done) {
                    var usu = createUsuario('teste2@exemplo.pra.vc', '1234', 'teste 2');


                    incluirUsuario(usu).then(
                        function (success) {
                            success.erro.should.equal(false);
                            success.msg.should.match(/incluído/);
                            done();
                        },
                        function (error) {
                            throw 'Não deveria ter dado erro';
                        }
                    ).done(null, done);
                });

                it('Criar o terceiro usuário', function (done) {
                    var usu = createUsuario('teste3@exemplo.pra.vc', '1234', 'teste 3');


                    incluirUsuario(usu).then(
                        function (success) {
                            success.erro.should.equal(false);
                            success.msg.should.match(/incluído/);
                            done();
                        },
                        function (error) {
                            throw 'Não deveria ter dado erro';
                        }
                    ).done(null, done);
                });

                it('Não permitir Criar um usuário com o mesmo email', function (done) {
                    var usu = createUsuario('teste3@exemplo.pra.vc', '1234', 'teste 3');


                    incluirUsuario(usu).then(
                        function (success) {
                            throw 'Não deveria ter permitido inserir';
                        },
                        function (error) {

                            error.should.have.property('erro');
                            error.erro.should.equal(true);

                            error.should.have.property('msg');
                            error.msg.should.match(/já está sendo usado/);

                            done();

                        }
                    ).done(null, done);
                });

            });

            describe('Autenticar usuário:', function () {
                it('Autenticar o primeiro usuário criado usando email e senha', function (done) {
                    var usuarios = specData.get_usuarios();
                    var usu = usuarios[0];


                    autenticar(usu.email, usu.senha).then(
                        function (success) {

                            success.should.have.property('erro');
                            success.erro.should.equal(false);

                            //Informo para o objeto o key para posterior autenticação com o key
                            usu.key = success.key;

                            done();
                        },
                        function (error) {
                            throw 'Não deveria ter dado erro';
                        }
                    ).done(null, done);
                });
                
                it('Autenticar o segundo usuário criado usando email e senha', function (done) {
                    var usuarios = specData.get_usuarios();
                    var usu = usuarios[1];


                    autenticar(usu.email, usu.senha).then(
                        function (success) {

                            success.should.have.property('erro');
                            success.erro.should.equal(false);

                            //Informo para o objeto o key para posterior autenticação com o key
                            usu.key = success.key;

                            done();
                        },
                        function (error) {
                            throw 'Não deveria ter dado erro';
                        }
                    ).done(null, done);
                });
                
                it('Autenticar o terceiro usuário criado usando email e senha', function (done) {
                    var usuarios = specData.get_usuarios();
                    var usu = usuarios[2];


                    autenticar(usu.email, usu.senha).then(
                        function (success) {

                            success.should.have.property('erro');
                            success.erro.should.equal(false);

                            //Informo para o objeto o key para posterior autenticação com o key
                            usu.key = success.key;

                            done();
                        },
                        function (error) {
                            throw 'Não deveria ter dado erro';
                        }
                    ).done(null, done);
                });

                it('Não Autenticar um usuário que não existe', function (done) {
                    var usuarios = specData.get_usuarios();
                    var usu = usuarios[0];


                    autenticar('nao@tem.email', 'teste').then(
                        function (success) {

                            throw 'Não deveria ter dado autenticado';

                        },
                        function (error) {

                            error.should.have.property('erro');
                            error.erro.should.equal(true);

                            error.should.have.property('msg');
                            error.msg.should.match(/inválid/);

                            done();

                        }
                    ).done(null, done);
                });

            });

            describe('Listar usuários:', function () {

                it('Listar usuários', function (done) {
                    var usuarios = specData.get_usuarios();
                    var usu = usuarios[0];


                    getUsuarios(usu.email, usu.key).then(
                        function (success) {

                            success.should.have.property('erro');
                            success.erro.should.equal(false);

                            success.should.have.property('usuarios');
                            success.usuarios.length.should.equal(2);

                            done();

                        },
                        function (error) {
                            throw 'Não deveria ter dado erro';

                        }
                    ).done(null, done);
                });

                it('Não permitir listar usuários passando um key falso', function (done) {
                    var usuarios = specData.get_usuarios();
                    var usu = usuarios[0];


                    getUsuarios(usu.email, 'abc').then(
                        function (success) {

                            throw 'Não deveria ter listado';

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

                it('Não permitir listar usuários passando um outro key falso', function (done) {
                    var usuarios = specData.get_usuarios();
                    var usu = usuarios[0];


                    getUsuarios(usu.email, '1.2099').then(
                        function (success) {

                            throw 'Não deveria ter listado';

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

        });



    }

}


module.exports = new Teste();