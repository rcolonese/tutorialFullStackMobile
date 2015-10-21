//Dependências
var should = require('should');
var testeParametros = require('./teste-parametros.js');


//Parâmetros
var databaseName = 'BD_app_teste'; //nome do banco de dados que será usado nos testes
var server_port = 10003;
testeParametros.set_url_base('http://localhost:' + server_port);

//SPEC feito para iniciar a base de dados e o servidor
var teste_start_server = require('./teste-start-server.js');


//Esse SPEC inicia o servidor das APIs e Banco de dados que serão foco desse teste
teste_start_server.waitServer(server_port, databaseName);


//----------Executo os specs (testes de integração)-------------------------
executarSpectations();



//----------FUNÇÕES PARA EXECUTAR OS TESTES---------------------------------
function executarSpectations() {
    var spec_files = [];
    spec_files = getSpecFiles();
    console.log('testes a serem executados: ' + JSON.stringify(spec_files));
    var api;
    spec_files.forEach(function (spec_file) {
        api = require('./specs/' + spec_file);
        api.executar();
    })
}

//Retorna uma lista dos arquivos de spec
function getSpecFiles() {

    var fs = require('fs');
    var all_files = [];
    var files = [];

    all_files = fs.readdirSync('./specs');
    all_files.forEach(function (file) {
        if (file.indexOf('.spec.js') > 0)
            files.push(file);
    })

    return files;
}