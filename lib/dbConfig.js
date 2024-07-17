require('dotenv').config();

const preMigrationConfig = {
    user: process.env.PRE_DB_USER,
    host: process.env.PRE_DB_HOST,
    database: process.env.PRE_DB_DATABASE,
    password: process.env.PRE_DB_PASSWORD,
    port: process.env.PRE_DB_PORT,
};

const postMigrationConfig = {
    user: process.env.POST_DB_USER,
    host: process.env.POST_DB_HOST,
    database: process.env.POST_DB_DATABASE,
    password: process.env.POST_DB_PASSWORD,
    port: process.env.POST_DB_PORT,
};

module.exports = {
    preMigrationConfig,
    postMigrationConfig
};
