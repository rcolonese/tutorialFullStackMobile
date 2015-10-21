//Conexões com as bases de dados
var MySql_connection = require('./CamadaDados/MySql/connection-mysql.js');

var Promise = require('promise');

//Caminho de urls que precisam ser autenticadas
const url_required_auth = '/v1/admin';


module.exports = {
    //Esta função retorna um Promise para que possa ser usada tambem no início da execução dos testes
    start: function (server_port, mySql_DatabaseName, api_relative_directory) {

        return new Promise(function (resolve_api, reject_api) {

            //Modulo para ter um servidor node rodando com mais facilidade
            var express = require('express');

            //Modulo para interpretar os objetos recebidos como JSON nas APIs
            var bodyParser = require('body-parser');

            var fs = require('fs');

            //Inicio uma instância do servidor
            var server = express();

            //Aplico o parser para receber JSON e TEXT nos RESTs methods
            server.use(bodyParser.json());

            //Configuro as restrições de acesso ao servidor via HTTP
            server.all('/*', function (req, res, next) {
                // CORS headers
                res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                // Set custom headers for CORS
                res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
                if (req.method == 'OPTIONS') {
                    res.status(200).end();
                } else {
                    next();
                }
            });


            //Informo a ordem em que as tabelas deverão ser criadas
            tabelas = [];
            tabelas.push('usuario-mysql');
            tabelas.push('mensagem-mysql');


            //Configuro a porta onde o server vai rodar se não tiver sido informada.
            if (server_port == undefined) server_port = 10002;

            //CRIANDO O BANCO DE DADOS
            console.log('CRIAÇÃO DO BANCO DE DADOS - início');

            createDabases(tabelas).then(
                function (success) {
                    console.log('CRIAÇÃO DO BANCO DE DADOS - fim: ' + success);

                    server.listen(server_port, function () {
                        console.log('servidor escutando a porta ' + server_port);
                        iniciarAPIs(api_relative_directory);
                        return resolve_api('ok');
                    });

                },
                function (err) {
                    console.error('Deu erro ao criar a tabela, erro: ', err);
                    return reject_api();
                }
            );

            function iniciarAPIs(api_relative_directory) {

                var APIs = [];
                APIs = fs.readdirSync(api_relative_directory);

                var api_base_path = "";
                if (api_relative_directory == undefined) {
                    api_base_path = './api';
                } else {
                    if (api_relative_directory[api_relative_directory.length - 1] == '/') {
                        api_base_path = api_relative_directory
                            .slice(1, (api_relative_directory.length - 1));
                    } else {
                        api_base_path = api_relative_directory;
                    }
                }

                var file_path;
                APIs.forEach(function (api_file_name) {
                    if (api_base_path[(api_base_path.length - 1)] != '/') {
                        api_base_path += '/';
                    }

                    file_path = api_base_path + api_file_name;
                    //file_path = __dirname + '/api/' + api_file_name;

                    var api = require(file_path);
                    api.start(server);


                });

            }

            function createDabases(array_nome_tabelas, iteracao) {

                if (iteracao == undefined) iteracao = 0;
                iteracao += 1;

                return new Promise(function (resolve, reject) {

                    try {
                        var database = array_nome_tabelas[0];
                        var fileName = './CamadaDados/' + database;
                        var tabela = require(fileName);

                        tabela.criarTabela().then(
                            function (success) {
                                if (success.tabelaExistia == true) {
                                    return resolve('criação de tabela interrompida, tabelas já criadas!');
                                } else { //não precisa criar as tabelas restantes
                                    array_nome_tabelas.splice(0, 1);

                                    if (array_nome_tabelas.length == 0) {
                                        return resolve('concluído');
                                    } else {

                                        createDabases(array_nome_tabelas, iteracao).then(
                                            function (success) {
                                                return resolve(success);
                                            },
                                            function (err) {
                                                if (err.code == 'ER_TABLE_EXISTS_ERROR') {
                                                    resolve('tabela ' + array_nome_tabelas[0] + ' já existe :)');
                                                } else {
                                                    return reject(err);
                                                }
                                            }
                                        );
                                    }
                                }
                            },
                            function (err) {
                                console.error('Deu erro ao criar a tabela: ' + database + ', erro: ', err);
                                return reject(err);
                            }
                        );

                    } catch (err) {
                        console.error('Deu erro ao criar a tabela do array[0]: ' + JSON.stringify(array_nome_tabelas));
                        console.error('erro: ' + err + ', detalhes: ' + JSON.stringify(err));
                        return reject(err);
                    }


                });

            }

        });

    }
};