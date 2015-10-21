var server = require('./server-start');
var MySql_connection = require('./CamadaDados/MySql/connection-mysql.js');

var databaseName = 'BD_app_teste'//'BD_app_producao'; //nome do banco de dados que será usado em produção

//crio a base de testes
MySql_connection.database_create(databaseName).then(
    function () {

        server.start(10002, databaseName, './api').then(
            function (success) {
                console.log('SERVIDOR INICIADO: ' + success);
            },
            function (err) {
                console.error('ERRO AO INICIAR O SERVIDOR: ' + err);
            }
        );
    },
    function (err) {
        console.log('deu M 2:', err + '')
    }
);