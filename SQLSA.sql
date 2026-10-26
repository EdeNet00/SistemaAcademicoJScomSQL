-- 1. CRIAR O BANCO DE DADOS
IF DB_ID(N'bdnode') IS NULL
BEGIN
    CREATE DATABASE bdnode;
END;
GO

USE bdnode;
GO


-- 2. TABELA: PROFESSOR


IF OBJECT_ID(N'dbo.professor', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.professor (
        id_professor INT IDENTITY(1,1) PRIMARY KEY,
        nome NVARCHAR(120) NOT NULL,
        email NVARCHAR(120) NOT NULL,
        telefone NVARCHAR(20) NULL
    );
END;
GO


-- 3. TABELA: ALUNO

IF OBJECT_ID(N'dbo.aluno', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.aluno (
        id_aluno INT IDENTITY(1,1) PRIMARY KEY,
        nome NVARCHAR(120) NOT NULL,
        email NVARCHAR(120) NOT NULL,
        data_nascimento DATE NULL,
        telefone NVARCHAR(20) NULL
    );
END;
GO


-- 4. TABELA: DISCIPLINA


IF OBJECT_ID(N'dbo.disciplina', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.disciplina (
        id_disciplina INT IDENTITY(1,1) PRIMARY KEY,
        nome NVARCHAR(120) NOT NULL,
        carga_horaria INT NOT NULL,
        id_professor INT NULL,

        CONSTRAINT CK_disciplina_carga_horaria
            CHECK (carga_horaria > 0),

        CONSTRAINT FK_disciplina_professor
            FOREIGN KEY (id_professor)
            REFERENCES dbo.professor(id_professor)
    );
END;
GO


-- 5. TABELA: SALA


IF OBJECT_ID(N'dbo.sala', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sala (
        id_sala INT IDENTITY(1,1) PRIMARY KEY,
        nome NVARCHAR(50) NOT NULL,
        capacidade INT NOT NULL,

        CONSTRAINT CK_sala_capacidade
            CHECK (capacidade > 0)
    );
END;
GO

-- 6. TABELA: TURMA


IF OBJECT_ID(N'dbo.turma', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.turma (
        id_turma INT IDENTITY(1,1) PRIMARY KEY,
        codigo NVARCHAR(30) NOT NULL,
        semestre NVARCHAR(20) NOT NULL,
        id_disciplina INT NOT NULL,
        id_professor INT NOT NULL,
        id_sala INT NULL,

        CONSTRAINT FK_turma_disciplina
            FOREIGN KEY (id_disciplina)
            REFERENCES dbo.disciplina(id_disciplina),

        CONSTRAINT FK_turma_professor
            FOREIGN KEY (id_professor)
            REFERENCES dbo.professor(id_professor),

        CONSTRAINT FK_turma_sala
            FOREIGN KEY (id_sala)
            REFERENCES dbo.sala(id_sala)
    );
END;
GO


-- 7. TABELA: ALUNO_TURMA


IF OBJECT_ID(N'dbo.aluno_turma', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.aluno_turma (
        id_aluno_turma INT IDENTITY(1,1) PRIMARY KEY,
        id_aluno INT NOT NULL,
        id_turma INT NOT NULL,
        nota1 DECIMAL(5,2) NULL,
        nota2 DECIMAL(5,2) NULL,
        frequencia DECIMAL(5,2) NULL,

        CONSTRAINT FK_aluno_turma_aluno
            FOREIGN KEY (id_aluno)
            REFERENCES dbo.aluno(id_aluno),

        CONSTRAINT FK_aluno_turma_turma
            FOREIGN KEY (id_turma)
            REFERENCES dbo.turma(id_turma),

        CONSTRAINT UQ_aluno_turma
            UNIQUE (id_aluno, id_turma),

        CONSTRAINT CK_aluno_turma_nota1
            CHECK (nota1 IS NULL OR nota1 BETWEEN 0 AND 10),

        CONSTRAINT CK_aluno_turma_nota2
            CHECK (nota2 IS NULL OR nota2 BETWEEN 0 AND 10),

        CONSTRAINT CK_aluno_turma_frequencia
            CHECK (
                frequencia IS NULL
                OR frequencia BETWEEN 0 AND 100
            )
    );
END;
GO


-- 8. CONFERIR AS TABELAS CRIADAS


SELECT
    TABLE_SCHEMA AS esquema,
    TABLE_NAME AS tabela
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
  AND TABLE_NAME IN (
      'professor',
      'aluno',
      'disciplina',
      'sala',
      'turma',
      'aluno_turma'
  )
ORDER BY TABLE_NAME;
GO


-- 9. CONFERIR AS COLUNAS


SELECT
    TABLE_NAME AS tabela,
    COLUMN_NAME AS coluna,
    DATA_TYPE AS tipo
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN (
    'professor',
    'aluno',
    'disciplina',
    'sala',
    'turma',
    'aluno_turma'
)
ORDER BY TABLE_NAME, ORDINAL_POSITION;
GO

