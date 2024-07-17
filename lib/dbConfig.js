// Connection details for original (pre-migration) database
const preMigrationConfig = {
    user: 'old',
    host: 'localhost',
    database: 'old',
    password: 'hehehe',
    port: 5432,
};

// Connection details for migrated (post-migration) database
const postMigrationConfig = {
    user: 'new',
    host: 'localhost',
    database: 'new',
    password: 'hahaha',
    port: 5433,
};

module.exports = {
    preMigrationConfig,
    postMigrationConfig
};
