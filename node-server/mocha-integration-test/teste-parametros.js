var parametros = function () {
    var url_base = '';
    var server;

    this.set_url_base = function (url) {
        url_base = url;
    }

    this.get_url_base = function () {
        return url_base;
    }
    
}

parametros.getInstance = function () {

    if (global.teste_parametros == undefined) {
        global.teste_parametros = new parametros();
    }

    return global.teste_parametros;

}

module.exports = parametros.getInstance();