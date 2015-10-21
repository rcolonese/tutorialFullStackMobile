//Referência usada --------------------------------------
//**2.1 - Acessando MySql com Node.js e Express**
//https://codeforgeek.com/2015/01/nodejs-mysql-tutorial/
//-------------------------------------------------------

var Promise = require('promise');
var mysql = require('mysql');

global.MySql_connection_singleton;

var singleton = function () {

    var my_connection;

    function createConnection() {

        return mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
        });

    }

    function iniciar_conexao(databaseName) {

        if (my_connection == undefined) {
            setDatabaseName(databaseName);
        }
    }

    function setDatabaseName(dbName) {
        my_connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: dbName
        });
        
        my_connection.database_name = dbName;
    }


    this.database_create = function (databaseName) {

        var cnn = createConnection();

        var query = 'CREATE DATABASE ' + databaseName;
        return new Promise(function (resolve, reject) {
            cnn.query(query, function (err, rows) {
                var erro = err + '';

                if (erro.indexOf('database exists') >= 0) {
                    console.log('database "' + databaseName + '" já existe');
                    iniciar_conexao(databaseName);
                    resolve();
                } else if (err) {
                    reject(err);
                } else {
                    iniciar_conexao(databaseName);
                    resolve();
                }
            });
        });
    }

    this.database_drop = function (databaseName) {
        var query = 'DROP DATABASE ' + databaseName;

        var cnn = createConnection();

        return new Promise(function (resolve, reject) {
            cnn.query(query, function (err, rows) {

                if (err) {
                    var erro = '' + err;
                    if (erro.indexOf("database doesn't exist") >= 0) {
                        resolve('banco não existia para ser excluído');
                    } else {
                        reject(err);
                    }

                } else {
                    iniciar_conexao(databaseName);
                    resolve('banco excluído');
                }
            });
        });
    }

    this.executeQuery = function (query, parameters) {

        if (parameters == undefined) parameters = [];

        return new Promise(function (resolve, reject) {

            my_connection.query(query, parameters, function (err, rows, fields) {
                if (!err) {
                    resolve(rows);
                } else {
                    reject(err);
                }
            });

        });

    }

    this.insert = function (JSON_data, tableName) {

        return new Promise(function (resolve, reject) {
            var query;

            query = 'INSERT INTO ' + tableName + ' set ? ';

            my_connection.query(query, JSON_data, function (err, result, fields) {
                if (!err) {
                    //var id = rows.insertId;
                    resolve(result);
                } else {
                    reject(err);
                }
            });
        });

    }
    this.update = function (JSON_data, tableName) {

        return new Promise(function (resolve, reject) {
            var query;
            var id = JSON_data.id;

            query = 'UPDATE ' + tableName + ' set ? WHERE id = ? ';

            my_connection.query(query, [JSON_data, id], function (err, rows, fields) {
                if (!err) {
                    resolve(rows);
                } else {
                    reject(err);
                }
            });
        });

    }
    this.delete = function (id, tableName) {

        return new Promise(function (resolve, reject) {
            var query;

            query = 'DELETE FROM ' + tableName + '  WHERE id = ?';

            my_connection.query(query, id, function (err, delete_status, fields) {

                //Exemplo da resposta
                /*delete_status = {
                    fieldCount: 0,
                    affectedRows: 0,
                    insertId: 0,
                    serverStatus: 2,
                    warningCount: 0,
                    message: '',
                    protocol41: true,
                    changedRows: 0
                }*/
                if (!err) {
                    resolve(delete_status);
                } else {
                    reject(err);
                }
            });
        });

    }
    //Testa antes pra ver se a tabela existe, se não existe então cria
    this.criarTabela = function (tableName_, create_query_, parameters) {
        var tableName = tableName_;
        var create_query = create_query_;
        var func_executeQuery = this.executeQuery;
        var open = this.connect;

        return new Promise(function (resolve, reject) {

            if (my_connection == undefined) {
                var erro = 'Não foi definida uma conexão com a base MySql para poder criar a tabela ' + tableName;
                console.log('connection-mysql.js: ' + erro);
                return reject(erro);
            }

            if (parameters == undefined) parameters = [];

            //Verifico se a tabela existe
            func_executeQuery("select * from information_schema.tables where TABLE_SCHEMA ='" + my_connection.database_name + "' AND TABLE_NAME = '" + tableName + "';").then(
                function (rows) {
                    if (rows.length == 0) {
                        //Tabela não existe, então crio.
                        func_executeQuery(create_query, parameters).then(
                            function (rows) {
                                console.log('Tabela criada: ' + tableName);
                                resolve({
                                    tabelaExistia: false
                                });
                            },
                            function (err) {
                                reject(err);
                            }
                        );

                    } else {
                        console.log('Tabela já existia: ' + tableName);
                        //Não faz nada, a tabela já existe
                        resolve({
                            tabelaExistia: true
                        });
                    }
                },
                function (err) {
                    resolve();
                }
            );
        });
    }
}


singleton.getInstance = function () {
    if (global.MySql_connection_singleton == undefined) {
        global.MySql_connection_singleton = new singleton();
    }
    return global.MySql_connection_singleton;
}

module.exports = singleton.getInstance(); //global.MySql_connection_singleton;