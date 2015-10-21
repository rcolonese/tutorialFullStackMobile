/*
Este arquivo tem a responsabilidade de manter os dados acumulados dos testes para que sejam consumidos/compartilhados por todos os specs
*/

var Singleton = function () {

    var usuarios = [];

    this.get_usuarios = function () {
        return usuarios;
    }

    this.add_usuario = function (usuario) {
        usuarios.push(usuario);
    }
}

Singleton.getInstance = function () {
    if (global.specData == undefined) {
        global.specData = new Singleton();
    }

    return global.specData;
}

module.exports = Singleton.getInstance();