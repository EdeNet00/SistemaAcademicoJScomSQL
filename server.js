require("dotenv").config();

const express = require("express");
const path = require("path");

const { getPool } = require("./db");
const routes = require("./routes");

const app = express();


// ============================================
// CONFIGURAÇÕES DO SERVIDOR
// ============================================

app.use(express.json());

app.use(
    express.static(path.join(__dirname, "public"))
);

app.use("/api", routes);


// ============================================
// TESTAR A CONEXÃO COM O BANCO
// ============================================

app.get("/api/health", async (req, res) => {
    try {
        const pool = await getPool();

        await pool.request().query("SELECT 1");

        res.json({
            status: "ok",
            database: "connected"
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            status: "error",
            message:
                "Falha de conexão. Confira o .env, o login e o SQL Server."
        });
    }
});


// ============================================
// TRATAMENTO DE ERROS
// ============================================

app.use((err, req, res, next) => {
    console.error(err.message);

    if ([2627, 2601].includes(err.number)) {
        return res.status(409).json({
            error:
                "Já existe um registro com esse valor único."
        });
    }

    if (err.number === 547) {
        return res.status(409).json({
            error:
                "Registro relacionado a outros dados; remova os vínculos antes."
        });
    }

    res.status(500).json({
        error:
            "Erro interno. Confira o terminal para detalhes."
    });
});


// ============================================
// INICIAR O SERVIDOR
// ============================================

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
    console.log(
        `Servidor rodando em http://localhost:${port}`
    );
});