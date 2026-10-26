require("dotenv").config();

const sql = require("mssql");

const config = {
    server: process.env.DB_SERVER || "localhost",

    database: process.env.DB_NAME || "bdnode",

    user: process.env.DB_USER || "app_node",

    password:
        process.env.DB_PASSWORD || "TroqueEstaSenha!123",

    options: {
        instanceName:
            process.env.DB_INSTANCE || "SQLEXPRESS",

        encrypt: false,

        trustServerCertificate: true
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let poolPromise;

function getPool() {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .catch((error) => {
                poolPromise = null;
                throw error;
            });
    }

    return poolPromise;
}

module.exports = {
    sql,
    getPool
};