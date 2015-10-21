var server_start = require('../server-start');
var MySqlConnection = require('../CamadaDados/MySql/connection-MySql.js');

var Teste_start_server = function (server_port, databaseName) {

    describe('MySql Database:', function () {

        it('Drop database', function (done) {
            //excluo a base de testes
            MySqlConnection.database_drop(databaseName).then(
                function () {
                    console.log('Database "' + databaseName + '" excluída');
                    done();
                },
                function (err) {
                    console.error('Erro: ', err + '');
                    done();
                }
            );
        })

        it('Create database', function (done) {
            //crio a base de testes 
            MySqlConnection.database_create(databaseName).then(
                function () {
                    console.log('Database "' + databaseName + '" criada');
                    done();
                },
                function (err) {
                    console.log('Deu Ruim!', err + '');
                    done();
                }
            );
        })

    });

    describe('APIs:', function () {
        this.timeout(30500);

        it('start server', function (done) {
            //inicio o servidor
            server_start.start(server_port, databaseName, '../api/').then(
                function (success) {
                    console.log('Fim da inicialização');
                    done();
                }, function (error) {
                    console.log('Fim da inicialização com erro: ' + error);
                    done();
                }
            );
        })
    });

}

module.exports = {
    waitServer: Teste_start_server
};