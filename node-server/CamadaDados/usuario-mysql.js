var Promise = require('promise');
var MySqlConnection = require('./MySql/connection-mysql.js');
//var modelMensagem = require('./mensagem-mysql.js');

var Model = function () {

    this.getTableName = function () {
        return 'tblUsuarios';
    }

    this.criarTabela = function () {

        var tableName = this.getTableName();

        var query = '';
        query += 'CREATE TABLE `' + tableName + '` ( ' + '\n';
        query += '  `id` bigint(20) NOT NULL AUTO_INCREMENT,' + '\n';
        query += '  `nome` varchar(100) NULL,' + '\n';
        query += '  `email` varchar(244) NULL,' + '\n';
        query += '  `senha` varchar(15) NULL,' + '\n';
        query += '  `dtCadastro` datetime NULL,' + '\n';
        query += '  `dtExcluido` datetime NULL,' + '\n';
        query += 'PRIMARY KEY (`id`),' + '\n';
        query += 'UNIQUE KEY `usuario_email` (`email`),' + '\n';
        query += 'INDEX `usuario_index` (`email` ASC)' + '\n';
        query += ');';

        return MySqlConnection.criarTabela(tableName, query);

    }

    this.inserir = function (JSON_obj) {
        var tableName = this.getTableName();
        this.toLowerCase(JSON_obj);

        return new Promise(function (resolve, reject) {

            var resp = private_validarDados(JSON_obj);
            if (resp.length > 0) {
                return reject(resp);
            }

            delete JSON_obj.dtExcluido;

            JSON_obj.dtCadastro = new Date();

            MySqlConnection.insert(JSON_obj, tableName).then(
                function (rows) {
                    //usuário foi inserido
                    resolve(rows);
                },
                function (err) {
                    //deu erro ao inserir o usuário
                    try {
                        var erro = '' + err;
                        if (erro.indexOf(JSON_obj.email) != -1) {
                            reject('Este email já está sendo usado por um usuário.');
                        } else {
                            reject(err);
                        }

                    } catch (err) {
                        reject('ERRO INESPERADO: ' + err);
                    }
                }
            );

        });
    }

    //Retorna usuario pelo email e senha com o KEY para autenticacão
    this.autenticarUsuario = function (email_usuario, senha) {
        var tableName = this.getTableName();

        return new Promise(function (resolve, reject) {

            var query = 'SELECT * FROM ' + tableName + ' WHERE  email = ? AND BINARY senha = ? ';
            var parameters = [email_usuario, senha];

            MySqlConnection.executeQuery(query, parameters).then(
                function (usuarios) {

                    if (usuarios.length > 0) {
                        var key = gerarKey(usuarios[0].dtCadastro, usuarios[0].id);
                        resolve({
                            key: key,
                            id: usuarios[0].id
                        });
                    } else {
                        reject('usuário ou senha inválidos.');
                    }

                }, function (err) {
                    reject(err);
                }
            );
        });

    }


    function gerarKey(data_cadastro, id_usuario) {
        var valor_soma = data_cadastro.getDate() + data_cadastro.getMonth() + data_cadastro.getFullYear() + id_usuario;

        return id_usuario + '.' + valor_soma;

    }

    function get_idUsuario_da_Key(key) {
        if (key.indexOf('.') < 0) {
            return 0
        } else {
            var id = key.split('.')[0];
            if (isNaN(id)) {
                return 0
            } else {
                return id
            }

        }
    }

    this.get_id_from_key = function (key) {
        return get_idUsuario_da_Key(key);
    }

    this.autenticarKey = function (key) {

        var tableName = this.getTableName();

        return new Promise(function (resolve, reject) {

            var id = get_idUsuario_da_Key(key);

            if (id == 0) {
                reject('Usuário inválido');
            } else {

                var query = 'SELECT * FROM ' + tableName + ' WHERE  id = ? ';
                var parameters = [id];

                MySqlConnection.executeQuery(query, parameters).then(
                    function (usuarios) {

                        if (usuarios.length > 0) {
                            var user_key = gerarKey(usuarios[0].dtCadastro, usuarios[0].id);

                            if (key != user_key) {
                                reject('Usuário inválido');
                            } else {
                                resolve('Autenticado');
                            }

                        } else {
                            reject('Usuário inválido');
                        }

                    }, function (err) {
                        reject(err);
                    }
                );
            }
        });

    }


    //Retorna usuarios do sistema com exceção do próprio que solicitou
    this.getUsuarios = function (email_usuario) {
        var tableName = this.getTableName();

        return new Promise(function (resolve, reject) {

            var modelMensagem = require('./mensagem-mysql.js');
            
            try{
                
                console.log('modelMensagem.getTableName() = ' + modelMensagem.getTableName());
            }catch(e){
                console.log('erro = ' + e);
            }
            
            var query = '';
            
            query += 'SELECT \n';
            query += 'usu.id, usu.nome, usu.email, count(msg.id) as qtd_mensagens \n';
            query += 'FROM \n';
            query += tableName + ' as usu \n';
            
            query += 'LEFT JOIN \n';
            query += modelMensagem.getTableName() + ' as msg \n';
            query += 'on msg.id_usuario_remetente = usu.id \n';
            query += 'OR msg.id_usuario_destinatario = usu.id \n';
            
            query += 'WHERE  not usu.email = ? \n';
            
            query += 'GROUP BY usu.id, usu.nome, usu.email \n';
            
            query += 'order by usu.nome \n';
            
            console.log('query: email_usuario = ' + email_usuario);
            console.log(query)
            
            var parameters = [email_usuario];

            MySqlConnection.executeQuery(query, parameters).then(
                function (rows) {
                    resolve(rows);
                }, function (err) {
                    reject(err);
                }
            );
        });

    }

    //Os usuários não são excluídos, apenas marcados como excluido.
    this.excluir = function (id) {

        var query = 'UPDATE ' + this.getTableName() + ' SET excluido = NOW() where id = ?';
        var parameters = [id];

        return new Promise(function (resolve, reject) {
            MySqlConnection.executeQuery(query, parameters).then(
                function (rows) {
                    if (rows.changedRows > 0) {
                        resolve();
                    } else {
                        reject('Usuário não encontrado para exclusão');
                    }

                },
                function (err) {
                    reject(err);
                }
            );
        });
    }

    this.toLowerCase = function (obj) {
        if (obj.email) {
            obj.email = obj.email.toLowerCase();
        }
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
        if (JSON_data.nome == undefined) {
            msgErro.push('nome');
        }
        if (JSON_data.email == undefined) {
            msgErro.push('email');
        }
        if (JSON_data.senha == undefined) {
            msgErro.push('senha');
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
            //Validação do tamanho de caracteres

            msgErro = [];

            try {

                if (!(JSON_data.id > 0) && JSON_data.id != undefined) {
                    msgErro.push('o id_cadastro deve ser numérico');
                }
                if (JSON_data.nome.length > 100) {
                    msgErro.push('o nome só pode ter até 100 caracteres');
                }
                if (JSON_data.email.length > 244) {
                    msgErro.push('o email só pode ter até 244 caracteres');
                }
                if (JSON_data.senha.length > 15) {
                    msgErro.push('a senha só pode ter até 15 caracteres');
                }
                if (validarEmail(JSON_data.email) == false) {
                    msgErro.push('email inválido');
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

    this.validateEmail = function (email) {
        return validarEmail(email);
    }

    function validarEmail(email) {
        var regexEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return regexEmail.test(email);
    }

};

module.exports = new Model();