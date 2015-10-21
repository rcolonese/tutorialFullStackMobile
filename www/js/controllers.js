angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope) {})

.controller('UsuariosCtrl', function ($scope, $state, Chats, Usuario) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    //$scope.chats = Chats.all();
    $scope.usuarios;

    $scope.$on('$ionicView.enter', function (event) {
        console.log('Entrou');
        Usuario.usuarios().then(
            function (usuarios) {
                if (usuarios !== undefined) {
                    $scope.usuarios = usuarios;
                    $scope.$apply();
                } else {
                    console.log('usuarios = ', usuarios);
                }
            },
            function (error) {
                console.log('Não foi possível listar os usuários: ', error);
                $scope.usuarios = [];
            }
        )
    });

    $scope.remove = function (chat) {
        Chats.remove(chat);
    };

    $scope.sair = function () {
        $state.go('login');
    }
})

.controller('ConversasCtrl', function ($scope, $stateParams, $state, $ionicPopup, Mensagem) {
    //$scope.chat = Chats.get($stateParams.chatId);
    $scope.mensagens;

    $scope.$on('$ionicView.enter', function (event) {

        console.log('Usuário selecionado para conversar: ' + $stateParams.usu_destinatario_id);

        carregar_mensagens();
    });

    function carregar_mensagens() {
        Mensagem.mensagens($stateParams.usu_destinatario_id).then(
            function (mensagens) {
                console.log('mensagens = ', mensagens);
                $scope.mensagens = mensagens;
                $scope.$apply();
            },
            function (error) {
                console.error('Erro ao buscar pelas mensagens: ', error);
            }
        );
    }

    $scope.exibir_como_minha_mensagem = function (mensagem) {
        if ($stateParams.usu_destinatario_id == mensagem.id_usuario_destinatario) {
            return false;
        } else {
            return true;
        }
    }

    $scope.voltar = function () {
        $state.go('tab.usuarios');
    }

    function enviar_mensagem(mensagem) {
        $scope.mensagens = [];
        var usu_destinatario_id = $stateParams.usu_destinatario_id;
        Mensagem.enviar_mensagem(mensagem, usu_destinatario_id);

        carregar_mensagens();
    }

    $scope.escrever_mensagem = function () {
        $scope.data = {}

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
            template: '<input type="text" maxlength="144"  ng-model="data.mensagem">',
            title: 'Mensagem',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancelar'
                },
                {
                    text: '<b>Enviar</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.data.mensagem) {
                            //don't allow the user to close unless he enters wifi password
                            e.preventDefault();
                        } else {
                            return $scope.data.mensagem;
                        }
                    }
                }
            ]
        });
        myPopup.then(function (res) {
            console.log('Tapped!', res);
            enviar_mensagem(res)
        });
    };

    $scope.sair = function () {
        $state.go('login');
    }

})

.controller('AccountCtrl', function ($scope, $state) {
    $scope.settings = {
        enableFriends: true
    };

    $scope.sair = function () {
        $state.go('login');
    }
})

.controller('LoginCtrl', function ($scope, $state, Usuario, $ionicLoading) {

    $scope.email = 'teste2@exemplo.pra.vc';
    $scope.senha = '1234';

    $scope.$on('$ionicView.enter', function (event) {
        Usuario.limpar_usuarios();
    });

    $scope.acessar = function (email, senha) {

        $ionicLoading.show();

        console.log('$scope.email = ' + email);

        Usuario.autenticar(email, senha).then(
            function (success) {
                console.log('success = ', success);
                $ionicLoading.hide();
                $state.go('tab.usuarios');
            },
            function (error) {
                console.log('error = ', error);
                $ionicLoading.hide();
            }
        );

        /*if (resp.autenticado == true) {
            console.log('autenticado');
        } else {
            console.log('Autenticaçào falhou: ' + reps.msg);
        }*/




    }
    console.log('instanciado');

    $scope.cadastrar = function () {

        console.log('chegou aqui');
        $state.go('cadastro');

    }

})

.controller('CadastroCtrl', function ($scope, $state, $ionicLoading, $ionicPopup, Usuario) {

    console.log('instanciado cadastro');

    $scope.usuario = {
        email: '',
        senha: '',
        nome: ''
    }

    $scope.msg_erro = '';

    $scope.cadastrar = function (usuario) {

        $ionicLoading.show();

        console.log('usuario recebido = ', usuario);

        Usuario.incluir(usuario).then(
            function (success) {

                console.log('Usuário cadastrado');

                $scope.usuario.email = '';
                $scope.usuario.nome = '';
                $scope.usuario.senha = '';

                $scope.msg_erro = '';

                $ionicLoading.hide();

                var alertPopup = $ionicPopup.alert({
                    title: 'Aviso!',
                    template: 'Usuário cadastrado com sucesso!'
                });


            },
            function (error) {
                console.log('error = ', error);
                $scope.msg_erro = error;

                $ionicLoading.hide();

                $scope.$apply();
            }
        );
    }

    $scope.limpar_msg_erro = function () {
        $scope.msg_erro = '';
    }

    $scope.voltar = function () {

        $state.go('login');

    }

});