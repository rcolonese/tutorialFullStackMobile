#Tutotial Full stack para Mobile App
===================================

Este tutorial destina-se a cobrir um passo a passo desde a criação de uma RESTful API em node até consumi-la em um app Mobile feito em Ionic.

Se você ainda não conhece o ionic ou não tem o que é necessário em sua máquina para inciar o projeto ionic, então sugiro consultar essa página [http://ionicframework.com/getting-started/](http://ionicframework.com/getting-started/).

Para simplicidade do tutorial não usarei GULP nem SASS ou qualquer outro pré-compilador/ferramenta do tipo.


##*PASSO 1 - iniciando o app mobile*

Como faremos no mesmo projeto tanto o APP quanto o servidor então será necessário criar no diretório rais o APP do ionic, pois só dá para fazer isso com o diretório vazio.

Inicie sua aplicação Mobile com ionic
```terminal
$ ionic start [seuProjeto] tabs
```

Para esse exemplo iniciei a aplicação com o Tabs do ionic, mas é claro que você pode escolher qualquer outro template.

Voltaremos mais tarde ao mobile, agora vamos dar início a construção do RESTful API.


##*PASSO 2 - criando o servidor*


### Instalando as dependências

Como disse no passo 1, para facilitar o tutorial, vou colocar no mesmo diretório da APP na raiz o servidor NODE.

Crie um diretório na raiz do seu projeto para colocar os arquivos do seu servidor, vou chama-lo de "node-server".

Abra o arquivo package.json e adicone nas dependências os frameworks/ferramentas abaixo:
```javascript
 
  "devDependencies": {
    "body-parser": "^1.13.1",
    "express": "^4.12.4",
    "mysql": "^2.7.0",
    "promise": "^7.0.1",
    "mocha": "^0.12.31",
    "should": "^7.0.2",
    "supertest": "^1.0.1"
  }
  
```


agora faça com que o npm instale essas novas dependências executando o comando abaixo no terminal:
```terminal
$ npm install
```

*OBS.:* Se você preferiu baixar e executar meu projeto, então após executar o comando acima você terá que executar o comando a seguir para baixar a biblioteca do ionic
```terminal
$ bower install
```

---
#### Dependências do projeto

Segue abaixo uma breve explicação do motivo de usarmos cada um desses frameworks

*express*
NPM: [https://www.npmjs.com/package/express](https://www.npmjs.com/package/express)
USO: Será usado para poder colocar as APIs on-line

*body-parser*
NPM: [https://www.npmjs.com/package/body-parser](https://www.npmjs.com/package/body-parser)
USO: Será usado para poder receber o JSON entregue na chamada a API

*supertest*
NPM: [https://www.npmjs.com/package/supertest](https://www.npmjs.com/package/supertest)
USO: Disponibiliza métodos para conectar com as APIs

*mysql*
NPM: [https://www.npmjs.com/package/mysql](https://www.npmjs.com/package/mysql)
USO: Será usado para conectar a base de dados MySql

*promise*
NPM: [https://www.npmjs.com/package/promise](https://www.npmjs.com/package/promise)
USO: Será usado para criar métodos com respostas assíncronas.

*mocha*
NPM: [http://mochajs.org/#installation](http://mochajs.org/#installation)
USO: Framework para rodar testes em javascript. Deve ser instalado globalmente, acesso o link para saber como.

*should*
NPM: [https://www.npmjs.com/package/should](https://www.npmjs.com/package/should)
USO: Será usado para fazer as validações de teste
Se não quiser usar um framework você pode usar o assert nativo do nodeJs: [https://nodejs.org/docs/latest-v0.12.x/api/assert.html](https://nodejs.org/docs/latest-v0.12.x/api/assert.html)


---

### 1 - Codificando o servidor

PASSO 1) Colocando o servidor pra funcionar

Por conveniencia criei um diretório de nome "*node-server*" onde ficarão todos os arquivos de servidor

Eu separo o arquivo que inicia o servidor em 2, para que possa reutilizar parte do código para iniciar o servidor no teste com as configurações de teste.

Os arquivos são:
```terminal
    server.js
    server-start.js
```

*1 - Server.js*

Este arquivo possui as configurações que o servidor irá usar para iniciar seu serviço, como conexão do banco de dados, porta que o serviço vai ser executado.

A primeira tarefa que ele executa é criar a base de dados

A segunda tarefa ele executar o *server-start.js*.


*2 - Server-start.js*

Este arquivo de fato inicializa o servidor executando as seguitnes tarefas:
    1 - Inicia e configura o servidor
    2 - Informa a ordem de criação das tabelas
    3 - Cria todas as tabelas se a primeira ainda não tiver sido criada
    4 - Inicia as APIs colocando elas disponíveis no servidor.
    
    
Para iniciar o servidor basta estar no diretório "node-server" e escrever o comando abaixo no terminal:
```terminal
node-server$ node server.js
```
---

### 2 - Codificando a Camada de Dados

Nesta camada teremos 2 tipos de arquivos: 
```terminal
    MySql/connection-mysql.js
    [arquivos de modelo de dados]
``` 

*1 - MySql/connection-mysql.js*

Este arquivo é responsável por saber conectar na base de dados e ter métodos para realizar todas as operações com a base de dados, como: dropar ou criar a base de dados, executar queries no banco, criar tabelas, inserir, excluir e alterar registros.


Para que os métodos de CRUDE funcionem adotei uma convenção onde todas as classes de dados precisam ter um campo de chave primária chamado "id".


Nesse arquivo adotei o padrão de projeto conhecido como singleton, de forma que não importa em que nível da arvore de diretórios um arquivo use o *require* ele sempre irá receber a mesma instância de conexão da base de dados.



*2 - Classes/modelos de dados*

São os arquivos que irão controlar os registros de cada tabela, esses arquivos serão responsáveis por manter a integridade desses dados e por isso toda validação de dados referente a cada tabela ficará codificada no arquivo referente a ela.


Nem todas as reqgras de negócios são simples como CRUDEs, pois muitas seguem um grande fluxo de dados com várias entradas, transformações de dados e saída. Esses casos não serão abordados nesse exemplo mas como uma indicação eu recomendo criar um diretório chamado Camada-logica, onde ficariam todos os arquivos com implementações mais complexas das regras de negócios que não sejam simples CRUDEs

---

### 3 - Implementando as APIs

Dentro do diretório do servidor criei um chamado "api" onde ficarão todos os arquivos de APIs, em geral cada arquivo de API será responsável por disponibilizar metodos de interação com um modelo de dados, salvo exceções onde a complexidade de um método exija interagir com metodos de diferentes modelos de dados.


O Ideal é que quando um modelo de dados precisar ser exposto em conjunto com dados de outro modelo de dados é que isso seja feito e tratado em uma das classes de dados e não na api;


Exemplo 1: Se você tiver 2 modelos de dados, um pra cadastrar um cliente e outro para cadastrar os endereços de entrega e você precisar listar os clientes por cidade e bairro, então o ideal será usar a classe do cliente com a query de JOIN com o modelo de dados dos endereços, pois a saída dessa solicitação serão clientes. 


Exemplo 2: Com as mesmas classes de modelos de dados do exemplo 1, se desejar listar os endereços para plotar em um mapa apenas de pessoas em um certa faixa etária ou genero, então o ideal é ter essa query feita na classe de endereço com JOIN para o modelo de dados de clientes, uma vez que a saída serão os endereços.


Nesta camada não há validação de dados, isso será feito na camada de dados ou de lógica, porém aqui são definidas as interfaces de comunicação como metodos GET(select), POST(insert), PUT(update), DELETE(delete), os parametros  obrigatórios/necessários e as questões de segurança e autenticação. É possível definir quais métodos (urls) serão necessário o uso de autenticação de segurança, que normalmente é baseado em um token ou key recebidos no Header da chamada a API.


*Middleware*

O Middleware foi implementado nesse projeto como uma camada da API que intercepta todas as chamadas a um determinado endereço base comum a todas as APIs que precisam de autenticação.

A ordem em que as APIs são carregadas no server é importante, pois uma chamada será roteada passando pela mesma sequencia na qual ela foi carregada no seu servidor. Por esse motivo o middleware deve sempre ser carregado em primeiro. Veja que no projeto a camada de middleware é o único arquivo que foge do padrão de nomenclatura:
```terminal
node-server/api/01.api-middleware.js
``` 
---

### 4 - Teste de integração da API

Antes de implementarmos o mobile é importante termos certeza de que todas as APIs estão funcionando adequadamente para que não venhamos a perder tempo com erros que não são do front-end.


Este é um teste de integração pois não testa funções de forma unitária isolando-as do escopo da aplicação. O objetivo aqui é ver se toda a estrutura está funcionando de forma armoniosa, isso é muito útil para metodos do tipo CRUDE pois não tem um grau de complexidade elevado.


O Teste de integração infelizmente não consegue avaliar a abrangência de teste do código pois acessa a API pelos métodos dela como uma aplicação o faria, isso não é uma grande desvantagem considerando que você irá implementar testes de integração para todos os métodos da sua API, ou seja, você saberá que a abrangência é de 100%.


Já para métodos complexos da regra de negócio que podem variar muito seus resultados conforme a entrada de dados fornecida a eles eu recomendo que seja usado o teste unitário.


Criei um subdiretório do "node-sever" chamado de "mocha-integration-test" para colocar todos os arquivos de teste de integração.

Nele temos 4 tipos de arquivos:
```terminal
    test.js
    teste-start-server.js
    spect-data.js
    specs/*[n# + nome do teste].js
```

*1 - test.js*

Este é o arquivo que será executado pelo mocha, ele inicia os testes e difine qual o nome da base de dados que será usada.

Como um teste de integração resolvi que seria mais proveitoso contar uma histório e assim ter dependência na ordem em que os testes são executados. Pois o teste quando inicia derruba e cria um nova base de dados, e a medida que evolui vai populando, sendo assim, se necessário, os testes subsequentes terão os dados previstos pelos testes anteriores como base para suas validações.


para executá-lo basta escrever no terminal o seguinte comando:
```terminal
$ mocha
```
Não ha necessiade de informar o nome do arquivo, pois o padrão do mocha é procurar pelo arquivo test.js


*2 - teste-start-server.js*

Este arquivo chama as operações de criar a base de dados, as tabelas e iniciar o servidor em funções de teste descritas com o "describe" e "it" de forma a fazer com que os testes aguardem essas operações assincronas terminarem antes que eles iniciem.


*3 - spec-data.js*

Este arquivo tem a responsabilidade de manter os dados acumulados dos testes para que sejam consumidos/compartilhados por todos os specs


*4 - specs/*

Nesse diretório ficarão os arquivos de teste conhecidos com "spectations".

Recomendo que seja feito um arquivo para cada arquivo de API, e que os testes estejam todos dentro de um describe com o nome da API, e dentro dele separar cada método em um describe com o nome do método, para entáo criar as funções de teste ("it") nesses describes.
Exemplo: o spec do cadastro de usuário poderia ter a seguinte estrutura:


arquivo de Spec para o cadastro de usuário: 01-cadUsuario-spec.js
```javascript
describe('cadastro de usuário:', function(){
    describe('incluir:', function(){
        it('Não permitir incluir sem informar e-mail', function(){
            [seu código de teste aqui]
        });
        
        it('Incluir com email teste@teste.com', function(){
            [seu código de teste aqui]
        });
        
        it('Não permitir incluir outro usuário com email teste@teste.com', function(){
            [seu código de teste aqui]
        });
    });
    
    describe('excluir:', function(){
        it('Não permitir excluir sem informar o token', function(){
            [seu código de teste aqui]
        });
        
        it('Não permitir excluir se o usuário solicitando não é um admin', function(){
            [seu código de teste aqui]
        });
    });
    
    etc.
});
```

Em testes unitários cada teste é totalmente independente um do outro, porém achei mais convêniente para o teste de integração contar uma hitória, ou seja, os testes seguintes dependem dos resultados dos testes anteriores, pois esse tipo de teste inclui a interação completa com o sistema sem qualquer tipo de mock(*1) de forma a podermos ter certeza de que todo o conjunto está funcionando corretamente.

Na estrutura do servidor os Specs de teste são lidos de dentro de um diretório, então para que sejam executados na ordem da história é importante que sejam criados com uma numeração na frente do arquivo, exemplo: "01-cadUsuario.js".


**1:* Mock - dependências falsas que entregam respostas programadas pelo teste.
Exemplo: Para testar uma API você poderia no teste unitário ou E2E criar um mock para o modelo de dados para que quando solicitado dados ele responda exatamente o que você precisa para o seu teste, sem nem mesmo ir no banco de dados, ou seja, você cria um objeto que substituirá a real classe de dados para entregar uma respota fixa determinada por você.

---

### 5 - Implementando o App Mobile

Agora que já temos todo o back-end implementado com as regras de negócios. Aqui serão implementados principalmente os requisitos não funcionais, como a Experiência do usuário, validações necessárias, etc. 


Alguns requisitos de negócio talvez tenham que ser implementados no front-end, mas o ideal é evitar isso ao máximo, pois assim você terá seus recursos disponíveis para reutilizar com outras aplicações (exemplo: web e mobile) e facilitará quando for necessário a reescrita ou refatoração do front-end.

Um Front-end simples permite adaptar a experiencia do usuário com mais facilidade sem se preocupar com a implementação da regra de negócio.

---

### 6 - Dever de casa :p
Implementar os seguintes testes: 

1 - USUÁRIO: Verificar se a quantidade de mensagens retornada na lista de usuários coincide com o que foi postado.

2 - MENSAGEM: Listar as mensagens postadas e verificar se a quantidade (length) está correta.
3 - MENSAGEM: Não permitir um usuário que náo está envolvido na mensagem lista-la.
