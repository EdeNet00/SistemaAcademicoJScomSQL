const express = require("express");

const { getPool, sql } = require("./db");

const router = express.Router();


// ============================================
// CONFIGURAÇÃO DAS ENTIDADES
// ============================================

const entities = {
    alunos: {
        table: "dbo.aluno",
        id: "id_aluno",

        fields: [
            "nome",
            "email",
            "data_nascimento",
            "telefone"
        ],

        required: ["nome", "email"],

        list: `
            SELECT
                id_aluno,
                nome,
                email,
                CONVERT(
                    VARCHAR(10),
                    data_nascimento,
                    23
                ) AS data_nascimento,
                telefone
            FROM dbo.aluno
            ORDER BY nome
        `
    },

    professores: {
        table: "dbo.professor",
        id: "id_professor",

        fields: [
            "nome",
            "email",
            "telefone"
        ],

        required: ["nome", "email"],

        list: `
            SELECT
                id_professor,
                nome,
                email,
                telefone
            FROM dbo.professor
            ORDER BY nome
        `
    },

    disciplinas: {
        table: "dbo.disciplina",
        id: "id_disciplina",

        fields: [
            "nome",
            "carga_horaria",
            "id_professor"
        ],

        required: ["nome", "carga_horaria"],

        list: `
            SELECT
                d.id_disciplina,
                d.nome,
                d.carga_horaria,
                d.id_professor,
                p.nome AS professor
            FROM dbo.disciplina AS d
            LEFT JOIN dbo.professor AS p
                ON p.id_professor = d.id_professor
            ORDER BY d.nome
        `
    },

    salas: {
        table: "dbo.sala",
        id: "id_sala",

        fields: [
            "nome",
            "capacidade"
        ],

        required: ["nome", "capacidade"],

        list: `
            SELECT
                id_sala,
                nome,
                capacidade
            FROM dbo.sala
            ORDER BY nome
        `
    },

    turmas: {
        table: "dbo.turma",
        id: "id_turma",

        fields: [
            "codigo",
            "semestre",
            "id_disciplina",
            "id_professor",
            "id_sala"
        ],

        required: [
            "codigo",
            "semestre",
            "id_disciplina",
            "id_professor"
        ],

        list: `
            SELECT
                t.id_turma,
                t.codigo,
                t.semestre,
                t.id_disciplina,
                d.nome AS disciplina,
                t.id_professor,
                p.nome AS professor,
                t.id_sala,
                s.nome AS sala
            FROM dbo.turma AS t

            INNER JOIN dbo.disciplina AS d
                ON d.id_disciplina = t.id_disciplina

            INNER JOIN dbo.professor AS p
                ON p.id_professor = t.id_professor

            LEFT JOIN dbo.sala AS s
                ON s.id_sala = t.id_sala

            ORDER BY t.codigo
        `
    },

    matriculas: {
        table: "dbo.aluno_turma",
        id: "id_aluno_turma",

        fields: [
            "id_aluno",
            "id_turma",
            "nota1",
            "nota2",
            "frequencia"
        ],

        required: [
            "id_aluno",
            "id_turma"
        ],

        list: `
            SELECT
                x.id_aluno_turma,
                x.id_aluno,
                a.nome AS aluno,
                x.id_turma,
                t.codigo AS turma,
                x.nota1,
                x.nota2,
                x.frequencia,

                CASE
                    WHEN x.nota1 IS NOT NULL
                     AND x.nota2 IS NOT NULL
                    THEN CAST(
                        (x.nota1 + x.nota2) / 2.0
                        AS DECIMAL(4,2)
                    )
                END AS media,

                CASE
                    WHEN x.frequencia < 75
                    THEN N'Reprovado por frequência'

                    WHEN x.nota1 IS NULL
                      OR x.nota2 IS NULL
                    THEN N'Em andamento'

                    WHEN (x.nota1 + x.nota2) / 2.0 >= 6
                    THEN N'Aprovado'

                    ELSE N'Reprovado por nota'
                END AS situacao

            FROM dbo.aluno_turma AS x

            INNER JOIN dbo.aluno AS a
                ON a.id_aluno = x.id_aluno

            INNER JOIN dbo.turma AS t
                ON t.id_turma = x.id_turma

            ORDER BY a.nome, t.codigo
        `
    }
};


// ============================================
// VALIDAR OS DADOS RECEBIDOS
// ============================================

function validate(entity, body) {
    const missing = entity.required.filter(
        (field) =>
            body[field] === undefined ||
            body[field] === null ||
            body[field] === ""
    );

    if (missing.length > 0) {
        return `Preencha: ${missing.join(", ")}.`;
    }

    if (
        body.email !== undefined &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
    ) {
        return "E-mail inválido.";
    }

    for (const field of [
        "carga_horaria",
        "capacidade"
    ]) {
        if (
            body[field] !== undefined &&
            (
                Number(body[field]) <= 0 ||
                !Number.isFinite(Number(body[field]))
            )
        ) {
            return `${field} deve ser maior que zero.`;
        }
    }

    for (const field of ["nota1", "nota2"]) {
        const value = body[field];

        if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            (
                Number(value) < 0 ||
                Number(value) > 10 ||
                !Number.isFinite(Number(value))
            )
        ) {
            return `${field} deve estar entre 0 e 10.`;
        }
    }

    const frequency = body.frequencia;

    if (
        frequency !== undefined &&
        frequency !== null &&
        frequency !== "" &&
        (
            Number(frequency) < 0 ||
            Number(frequency) > 100 ||
            !Number.isFinite(Number(frequency))
        )
    ) {
        return "Frequência deve estar entre 0 e 100.";
    }

    return null;
}


// ============================================
// PREPARAR PARÂMETROS PARA O SQL SERVER
// ============================================

function bind(request, field, value) {
    const integerFields = [
        "id_professor",
        "id_disciplina",
        "id_sala",
        "id_aluno",
        "id_turma",
        "carga_horaria",
        "capacidade"
    ];

    if (integerFields.includes(field)) {
        request.input(
            field,
            sql.Int,
            value === "" || value === null
                ? null
                : Number(value)
        );
    } else if (
        ["nota1", "nota2", "frequencia"].includes(field)
    ) {
        request.input(
            field,
            sql.Decimal(5, 2),
            value === "" || value === null
                ? null
                : Number(value)
        );
    } else if (field === "data_nascimento") {
        request.input(
            field,
            sql.Date,
            value === "" || value === null
                ? null
                : value
        );
    } else {
        request.input(
            field,
            sql.NVarChar,
            value === "" || value === null
                ? null
                : String(value).trim()
        );
    }
}


// ============================================
// CRIAR AS ROTAS DE CADA ENTIDADE
// ============================================

for (const [url, entity] of Object.entries(entities)) {

    // ----------------------------------------
    // GET: LISTAR TODOS OS REGISTROS
    // ----------------------------------------

    router.get(`/${url}`, async (req, res, next) => {
        try {
            const pool = await getPool();

            const result = await pool
                .request()
                .query(entity.list);

            res.json(result.recordset);
        } catch (error) {
            next(error);
        }
    });


    // ----------------------------------------
    // GET: BUSCAR UM REGISTRO POR ID
    // ----------------------------------------

    router.get(`/${url}/:id`, async (req, res, next) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id < 1) {
                return res.status(400).json({
                    error: "ID inválido."
                });
            }

            const pool = await getPool();

            const result = await pool
                .request()
                .input("id", sql.Int, id)
                .query(`
                    SELECT *
                    FROM ${entity.table}
                    WHERE ${entity.id} = @id
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    error: "Registro não encontrado."
                });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            next(error);
        }
    });


    // ----------------------------------------
    // POST: CADASTRAR UM REGISTRO
    // ----------------------------------------

    router.post(`/${url}`, async (req, res, next) => {
        try {
            const message = validate(entity, req.body);

            if (message) {
                return res.status(400).json({
                    error: message
                });
            }

            const fields = entity.fields.filter(
                (field) => req.body[field] !== undefined
            );

            const pool = await getPool();
            const request = pool.request();

            fields.forEach((field) => {
                bind(request, field, req.body[field]);
            });

            const columns = fields
                .map((field) => `[${field}]`)
                .join(", ");

            const parameters = fields
                .map((field) => `@${field}`)
                .join(", ");

            const result = await request.query(`
                INSERT INTO ${entity.table} (${columns})

                OUTPUT INSERTED.${entity.id} AS id

                VALUES (${parameters})
            `);

            res.status(201).json({
                id: result.recordset[0].id,
                message: "Cadastro realizado."
            });
        } catch (error) {
            next(error);
        }
    });


    // ----------------------------------------
    // PUT: ATUALIZAR UM REGISTRO
    // ----------------------------------------

    router.put(`/${url}/:id`, async (req, res, next) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id < 1) {
                return res.status(400).json({
                    error: "ID inválido."
                });
            }

            const message = validate(entity, req.body);

            if (message) {
                return res.status(400).json({
                    error: message
                });
            }

            const fields = entity.fields.filter(
                (field) => req.body[field] !== undefined
            );

            if (fields.length === 0) {
                return res.status(400).json({
                    error: "Nenhum campo enviado."
                });
            }

            const pool = await getPool();

            const request = pool
                .request()
                .input("id", sql.Int, id);

            fields.forEach((field) => {
                bind(request, field, req.body[field]);
            });

            const updates = fields
                .map((field) => `[${field}] = @${field}`)
                .join(", ");

            const result = await request.query(`
                UPDATE ${entity.table}
                SET ${updates}
                WHERE ${entity.id} = @id;

                SELECT @@ROWCOUNT AS affected;
            `);

            if (result.recordsets[0][0].affected === 0) {
                return res.status(404).json({
                    error: "Registro não encontrado."
                });
            }

            res.json({
                message: "Registro atualizado."
            });
        } catch (error) {
            next(error);
        }
    });


    // ----------------------------------------
    // DELETE: EXCLUIR UM REGISTRO
    // ----------------------------------------

    router.delete(`/${url}/:id`, async (req, res, next) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id < 1) {
                return res.status(400).json({
                    error: "ID inválido."
                });
            }

            const pool = await getPool();

            const result = await pool
                .request()
                .input("id", sql.Int, id)
                .query(`
                    DELETE FROM ${entity.table}
                    WHERE ${entity.id} = @id;

                    SELECT @@ROWCOUNT AS affected;
                `);

            if (result.recordsets[0][0].affected === 0) {
                return res.status(404).json({
                    error: "Registro não encontrado."
                });
            }

            res.json({
                message: "Registro excluído."
            });
        } catch (error) {
            next(error);
        }
    });
}

module.exports = router;