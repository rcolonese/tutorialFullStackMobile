angular.module('api.meuProjeto', [])

.factory('myUrl', function () {
    return {
        url: 'http://localhost:10002',
        url_autenticacao: '/autenticar'
    }
})

.factory('Usuario', function ($http, $window, myUrl) {

    var url = myUrl.url; //'http://localhost:10002';
    var url_autenticacao = myUrl.url_autenticacao; //'/autenticar'

    //Usuários com quem é possível conversar
    var usuarios = [];
    var usuario_autenticado = {
        id: 0,
        key: '',
        email: ''
    };
    console.log('Service factory Usuario');

    function Usuario_autenticado_save() {
        $window.localStorage.setItem('usu', JSON.stringify(usuario_autenticado));
    }

    function Usuario_autenticado_load() {
        console.log('Mandou carregar o usuário logado = ', usuario_autenticado);
        if (usuario_autenticado == undefined || usuario_autenticado.id == 0) {
            usuario_autenticado = JSON.parse($window.localStorage.getItem('usu') || '{}');
            console.log('usuario_autenticado = ', usuario_autenticado);
        }
    }

    return {
        limpar_usuarios: function(){
            usuarios = [];
        },
        autenticado: function () {
            if (usuario_autenticado > 0) {
                return true;
            } else {
                return false;
            }
        },
        autenticar: function (email, senha) {

            return new Promise(function (resolve, reject) {

                var usuario = {
                    email: email,
                    senha: senha
                };

                console.log('usuario = ', usuario);

                $http.post(url + '/usuario/autenticar', usuario).then(
                    function (success) {
                        var dados = success.data;

                        console.log('Resposta recebida com sucesso = ', dados);
                        if (dados.erro == false) {
                            usuario_autenticado.id = dados.id;
                            usuario_autenticado.key = dados.key;
                            usuario_autenticado.email = email;

                            Usuario_autenticado_save();

                            console.log('usuario_autenticado = ', usuario_autenticado);
                            resolve({
                                autenticado: true,
                                msg: ''
                            })
                        } else {
                            resolve({
                                autenticado: false,
                                msg: dados.msg
                            })
                        }

                    },
                    function (error) {
                        var dados = error.data;
                        console.log('Resposta recebida com erro');
                        reject({
                            autenticado: false,
                            msg: dados.msg
                        })
                    }
                );
            });
        },
        usuarios: function () {

            console.log('usuario_autenticado.id = ' + usuario_autenticado.id);
            if (usuario_autenticado.id == 0) {
                console.log('leu do localstorage');
                Usuario_autenticado_load();
            }

            console.log('exibir usuários');
            console.log('usuarios.length = ' + usuarios.length);
            console.log('usuario_autenticado.key = ' + usuario_autenticado.key);

            return new Promise(function (resolve, reject) {



                if (usuarios.length > 0) {
                    return usuarios;
                } else {

                    var apiUrl = url + url_autenticacao + '/usuarios/' + usuario_autenticado.email;

                    console.log('apiUrl = ' + apiUrl);

                    var req = {
                        method: 'GET',
                        url: apiUrl,
                        headers: {
                            'Accept': 'application/json, text/plain, * / *',
                            'Content-Type': 'application/json',
                            'x-key': usuario_autenticado.key
                        }
                    }

                    $http(req).then(
                        function (success) {
                            console.log('success.data : ', success.data);
                            usuarios = success.data.usuarios
                            resolve(usuarios)
                        },
                        function (error) {
                            console.log('error.data : ', error);
                            reject(usuarios);
                        }
                    )

                }
            });
        },
        get_usuario_autenticado: function () {
            Usuario_autenticado_load();

            return usuario_autenticado;
        },
        incluir: function (usuario) {

            return new Promise(function (resolve, reject) {

                $http.post(url + '/usuario', usuario).then(
                    function (success) {

                        console.log('success ', success);

                        if (success.status != 200) {
                            return reject('Conexão com a API falhou na URL: ' + statusText);
                        }

                        var resposta = success.data;

                        if (resposta.erro == true) {
                            return reject(resposta.msg);
                        } else {
                            usuario.id = resposta.id;

                            return resolve(resposta);
                        }
                    },
                    function (err) {
                        reject('exception: ' + err);
                    }
                );
            });

        }
    };
})

.factory('Mensagem', function ($http, $window, myUrl, Usuario) {

    var url = myUrl.url;
    var url_autenticacao = myUrl.url_autenticacao;

    var usuario_autenticado;

    function Usuario_autenticado_load() {
        if (usuario_autenticado == undefined) {
            usuario_autenticado = Usuario.get_usuario_autenticado();
        }
    }

    return {
        enviar_mensagem: function (mensagem, id_usuario_destinatario) {

            return new Promise(function (resolve, reject) {

                Usuario_autenticado_load();

                var mensagem_data = {
                    id_usuario_remetente: usuario_autenticado.id,
                    id_usuario_destinatario: id_usuario_destinatario,
                    msg: mensagem
                }

                var apiUrl = url + url_autenticacao + '/mensagem/';

                console.log('apiUrl = ' + apiUrl);

                var req = {
                    method: 'POST',
                    url: apiUrl,
                    headers: {
                        'Accept': 'application/json, text/plain, * / *',
                        'Content-Type': 'application/json',
                        'x-key': usuario_autenticado.key
                    },
                    data: mensagem_data
                }

                $http(req).then(
                    function (success) {
                        console.log('success.data : ', success.data);
                        usuarios = success.data.usuarios
                        resolve(usuarios)
                    },
                    function (error) {
                        console.log('error.data : ', error);
                        reject(usuarios);
                    }
                )


            });

        },
        mensagens: function (id_usuario_destinatario) {

            return new Promise(function (resolve, reject) {
                Usuario_autenticado_load();

                var id_usuario_um = usuario_autenticado.id;

                var apiUrl = url + url_autenticacao + '/mensagens/' + id_usuario_um + '/' + id_usuario_destinatario;

                console.log('apiUrl = ' + apiUrl);
                console.log('usuario_autenticado.key = ' + usuario_autenticado.key);

                var req = {
                    method: 'GET',
                    url: apiUrl,
                    headers: {
                        'Accept': 'application/json, text/plain, * / *',
                        'Content-Type': 'application/json',
                        'x-key': usuario_autenticado.key
                    }
                }

                $http(req).then(
                    function (success) {
                        console.log('success.data : ', success.data);
                        resolve(success.data.mensagens);
                    },
                    function (error) {
                        console.log('error.data : ', error);
                        reject(error.data.message);
                    }
                )
            });

        }
    }


});