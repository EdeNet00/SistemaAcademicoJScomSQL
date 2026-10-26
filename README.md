# SistemaAcademicoJScomSQL

Sistema web de gerenciamento acadêmico desenvolvido como projeto prático da faculdade, utilizando Node.js, Express, JavaScript e Microsoft SQL Server.

A aplicação permite gerenciar alunos, professores, disciplinas, salas, turmas e matrículas, integrando uma interface web a uma API conectada ao banco de dados.

## Tecnologias utilizadas

- **Node.js LTS** — ambiente de execução JavaScript.
- **Express** — criação do servidor e das rotas da API.
- **JavaScript** — lógica do frontend e backend.
- **HTML5** — estrutura da interface.
- **CSS3** — estilização das páginas.
- **Microsoft SQL Server Express** — banco de dados relacional.
- **MSSQL** — conexão entre Node.js e SQL Server.
- **dotenv** — gerenciamento de variáveis de ambiente.

## Requisitos

Antes de executar o projeto, tenha instalado:

- [Node.js LTS](https://nodejs.org/)
- [SQL Server Express](https://www.microsoft.com/pt-br/sql-server/sql-server-downloads)
- [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/pt-br/ssms/install/install)
- [Visual Studio Code](https://code.visualstudio.com/) (recomendado)

O serviço do SQL Server deve estar em execução e acessível pela aplicação.

## 1. Banco de dados

1. Abra o SQL Server Management Studio (SSMS).
2. Conecte-se à instância do SQL Server.
3. Abra o arquivo `database.sql`.
4. Execute o script pressionando **F5**.

De acordo com o script do projeto, ele configura o banco `bdnode`, as seis tabelas e o login SQL `app_node`:

- `aluno`
- `professor`
- `disciplina`
- `sala`
- `turma`
- `aluno_turma`

**Atenção:** execute esse script somente em uma instalação do zero. Se ele recriar as tabelas, os dados que já existirem nelas serão apagados.

### Autenticação do SQL Server

Se o login SQL não funcionar:

1. No SSMS, abra as propriedades do servidor.
2. Entre em **Segurança**.
3. Selecione `SQL Server and Windows Authentication mode`.
4. Reinicie o serviço SQL Server correspondente à instância.
5. Confirme que o login `app_node` existe e tem permissões no banco `bdnode`.

A senha definida no script SQL deve ser a mesma configurada no arquivo `.env`.

## 2. Configuração do ambiente

Copie o arquivo `.env.example` para um novo arquivo chamado `.env`, na raiz do projeto.

Exemplo de configuração:

```env
DB_SERVER=localhost
DB_INSTANCE=SQLEXPRESS
DB_NAME=bdnode
DB_USER=app_node
DB_PASSWORD=SUA_SENHA
PORT=3000
```

Substitua `SUA_SENHA` pela senha configurada para o login no SQL Server.

Se a instância do SQL Server tiver outro nome, ajuste `DB_INSTANCE`.

**Segurança:** não publique o arquivo `.env` no GitHub. Ele contém credenciais privadas. Mantenha-o no `.gitignore` e publique apenas o `.env.example`, sem senhas reais.

## 3. Instalação e execução

Abra o terminal na pasta do projeto e instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
npm start
```

No Windows PowerShell, se o comando `npm` for bloqueado pela política de execução, tente:

```powershell
npm.cmd install
npm.cmd start
```

Depois de iniciar o servidor, acesse:

- **Sistema:** [http://localhost:3000](http://localhost:3000)
- **Verificação da API e do banco:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

A resposta esperada para a verificação de conexão é:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## 4. Funcionalidades

O sistema oferece operações de CRUD — criar, consultar, atualizar e excluir registros — para os seguintes recursos:

- Alunos
- Professores
- Disciplinas
- Salas
- Turmas
- Matrículas

A comunicação entre a interface e o servidor é feita por meio de requisições HTTP, com envio e recebimento de dados em JSON.

### Rotas da API

| Recurso | Endpoint |
|---|---|
| Alunos | `/api/alunos` |
| Professores | `/api/professores` |
| Disciplinas | `/api/disciplinas` |
| Salas | `/api/salas` |
| Turmas | `/api/turmas` |
| Matrículas | `/api/matriculas` |

As operações seguem o padrão REST descrito abaixo, conforme implementado para cada recurso:

| Método HTTP | Endpoint | Operação |
|---|---|---|
| GET | `/api/recurso` | Listar registros |
| GET | `/api/recurso/:id` | Consultar um registro |
| POST | `/api/recurso` | Criar registro |
| PUT | `/api/recurso/:id` | Atualizar registro |
| DELETE | `/api/recurso/:id` | Excluir registro |

O parâmetro `:id` representa o identificador do registro. Substitua `recurso` pelo endpoint correspondente.

### Ordem sugerida para os cadastros

Para evitar problemas com relacionamentos entre tabelas, recomenda-se seguir esta ordem:

1. Professores
2. Disciplinas
3. Salas
4. Turmas
5. Alunos
6. Matrículas

## 5. Regras de situação acadêmica

A regra didática para determinar a situação do aluno considera duas notas e a frequência.

**Cálculo da média:**

\[
\text{Média} = \frac{\text{Nota 1}+\text{Nota 2}}{2}
\]

| Condição | Situação |
|---|---|
| Ainda não possui as duas notas | Em andamento |
| Média maior ou igual a 6 e frequência maior ou igual a 75% | Aprovado |
| Frequência abaixo de 75% | Reprovado por frequência |
| Possui as duas notas, frequência suficiente e média abaixo de 6 | Reprovado por nota |

Essas regras descrevem o comportamento esperado para a situação acadêmica. A aplicação deve implementar essa lógica para que o resultado seja calculado automaticamente.

## 6. Estrutura do projeto

```text
sistema-academico/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .env
├── .env.example
├── .gitignore
├── database.sql
├── db.js
├── package.json
├── routes.js
├── server.js
└── README.md
```

### Principais arquivos

- `public/index.html`: estrutura da interface web.
- `public/style.css`: estilos e layout.
- `public/script.js`: lógica do frontend e comunicação com a API.
- `db.js`: configuração da conexão com o SQL Server.
- `routes.js`: endpoints e operações sobre os recursos.
- `server.js`: inicialização do servidor Express.
- `database.sql`: criação e configuração da estrutura do banco.
- `.env.example`: modelo de variáveis de ambiente.
- `.gitignore`: arquivos que não devem ser enviados ao Git.
- `package.json`: dependências e scripts de execução.

## 7. Solução de problemas

### Erro ao conectar ao banco

- Verifique se o SQL Server está em execução.
- Confira o nome da instância e o banco configurado no `.env`.
- Confirme o usuário, a senha e as permissões.
- Verifique se a autenticação SQL está habilitada quando necessária.

### Erro HTTP 500

- Consulte o terminal do Node.js para ver a mensagem de erro.
- Confirme se as tabelas e colunas esperadas pelo backend existem.
- Verifique as permissões do usuário da aplicação.
- Confira se os dados enviados pelo frontend correspondem aos campos esperados pela API.

### Erro ao instalar dependências no PowerShell

Tente:

```powershell
npm.cmd install
```

## Objetivo acadêmico

O projeto tem como objetivo aplicar conhecimentos de desenvolvimento web, JavaScript, criação de APIs REST, banco de dados relacional e operações CRUD em um sistema de gerenciamento acadêmico.
