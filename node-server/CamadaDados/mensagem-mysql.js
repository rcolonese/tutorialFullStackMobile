var Promise = require('promise');
var MySqlConnection = require('./MySql/connection-mysql.js');

var tblUsuario = require('./usuario-mysql.js');

var Model = function () {

    this.getTableName = function () {
        return 'tblMensagens';
    }

    this.criarTabela = function () {

        var tableName = this.getTableName();

        var query = '';
        query += 'CREATE TABLE `' + tableName + '` ( ' + '\n';
        query += '  `id` bigint(20) NOT NULL AUTO_INCREMENT,' + '\n';
        query += '  `id_usuario_remetente` BIGINT(20) NOT NULL,' + '\n';
        query += '  `id_usuario_destinatario` BIGINT(20) NOT NULL,' + '\n';
        query += '  `msg` varchar(144) NULL,' + '\n';
        query += '  `dtMsg` datetime NOT NULL,';

        query += 'PRIMARY KEY (`id`),' + '\n';

        query += 'CONSTRAINT `fk_usuario_remetente`' + '\n';
        query += '    FOREIGN KEY (`id_usuario_remetente`)' + '\n';
        query += '    REFERENCES `' + tblUsuario.getTableName() + '` (`id`)' + '\n';
        query += '    ON DELETE CASCADE' + '\n';
        query += '    ON UPDATE NO ACTION,' + '\n';

        query += 'CONSTRAINT `fk_usuario_destinatario`' + '\n';
        query += '    FOREIGN KEY (`id_usuario_destinatario`)' + '\n';
        query += '    REFERENCES `' + tblUsuario.getTableName() + '` (`id`)' + '\n';
        query += '    ON DELETE CASCADE' + '\n';
        query += '    ON UPDATE NO ACTION' + '\n';

        query += ');';

        return MySqlConnection.criarTabela(tableName, query);

    }

    this.inserir = function (JSON_obj) {
        var tableName = this.getTableName();

        return new Promise(function (resolve, reject) {

            var resp = private_validarDados(JSON_obj);
            if (resp.length > 0) {
                return reject(resp);
            }

            JSON_obj.dtMsg = new Date();

            MySqlConnection.insert(JSON_obj, tableName).then(
                function (rows) {
                    if (rows.affectedRows = 1) {
                        resolve('mensagem incluída');
                    } else {
                        reject('Não foi possível incluir a mensagem');
                    }

                },
                function (err) {
                    reject('erro: ' + err);
                }
            );

        });
    }

    //Retorna usuario pelo id (usado para autentica o Key na API Middleware de autenticação
    this.getMensagensUsuario = function (id_usuario_um, id_usuario_dois) {
        var tableName = this.getTableName();


        return new Promise(function (resolve, reject) {

            var query = '';
            var parameters = [];
            query += 'SELECT msg.*, usu_dest.nome as nome_dest, usu_rem.nome as nome_rem  \n';

            query += 'FROM ' + tableName + ' as msg \n';

            query += 'INNER JOIN ' + tblUsuario.getTableName() + ' as usu_dest \n';
            query += 'ON msg.id_usuario_destinatario = usu_dest.id \n';

            query += 'INNER JOIN ' + tblUsuario.getTableName() + ' as usu_rem \n';
            query += 'ON msg.id_usuario_remetente = usu_rem.id \n';

            query += 'WHERE';

            query += '( usu_dest.id = ? and usu_rem.id = ?)';
            parameters.push(id_usuario_um);
            parameters.push(id_usuario_dois);

            query += 'OR ( usu_rem.id = ? and usu_dest.id = ?)';
            parameters.push(id_usuario_um);
            parameters.push(id_usuario_dois);
            
            query += 'ORDER BY id';

            MySqlConnection.executeQuery(query, parameters).then(
                function (rows) {

                    if (rows.length > 0) {
                        resolve(rows);
                    } else {
                        reject('Não existem mensagens entre vocês');
                    }

                }, function (err) {
                    reject(err);
                }
            );
        });

    }

    function private_validarDados(JSON_data) {
        var msgErro = [];
        var errorMessage = '';

        //Valido se algum JSON foi entregue
        if (JSON.stringify(JSON_data) == '{}') {
            return 'Não foram fornecidos os dados do Usuário';
        }

        //_________________________________
        //Validação dos campos obrigatórios
        if (JSON_data.id_usuario_remetente == undefined) {
            msgErro.push('id_usuario_remetente');
        }
        if (JSON_data.id_usuario_destinatario == undefined) {
            msgErro.push('id_usuario_destinatario');
        }
        if (JSON_data.msg == undefined) {
            msgErro.push('msg');
        }

        var res = msgErro.join(', ');

        if (msgErro.length == 1) {
            errorMessage = 'O campo ' + res + ' é obrigatório';
        } else if (msgErro.length > 1) {
            errorMessage = 'Os seguintes campos são obrigatórios: ' + res;
        }

        if (errorMessage.length > 0) {
            return errorMessage;
        } else {

            //__________________________________
            //Validação do tipo de dados e tamanho da string

            msgErro = [];

            try {

                if (!(JSON_data.id_usuario_remetente > 0)) {
                    msgErro.push('o id_usuario_remetente deve ser numérico');
                }
                if (!(JSON_data.id_usuario_destinatario > 0)) {
                    msgErro.push('o id_usuario_destinatario deve ser numérico');
                }
                if (JSON_data.msg.length > 144) {
                    msgErro.push('a msg só pode ter até 144 caracteres');
                }
                if (Object.keys(JSON_data).length > 3) {
                    msgErro.push('Apenas os campos id_usuario_remetente, id_usuario_destinatario e msg devem ser fornecidos');
                }

                res = msgErro.join(', ');

                if (msgErro.length > 0) {
                    if (errorMessage.length > 0) {
                        errorMessage += ', ';
                    }
                    errorMessage += 'atenção: ' + res;
                }
            } catch (err) {
                errorMessage = err;
            }


            return errorMessage;
        }
    }

};

module.exports = new Model();