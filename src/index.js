const fs = require('fs');
const { Client } = require('pg');
const { fetchTableData, compareTables, generateReport, saveReport } = require('./utils/reportUtils');

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

async function main() {
    const preClient = new Client(preMigrationConfig);
    const postClient = new Client(postMigrationConfig);

    try {
        await preClient.connect();
        console.log('Connected successfully to the old database.');
        await postClient.connect();
        console.log('Connected successfully to the new database.');

        const tableName = 'accounts'; // Specify the table name
        const report = await generateReport(preClient, postClient, tableName);

        if (report) {
            console.log('Comparison Report:');
            console.log(`Missing Records: ${report.missingRecords.length}`);
            console.log(`Corrupted Records: ${report.corruptedRecords.length}`);
            console.log(`New Records: ${report.newRecords.length}`);

            // Save the full report to a JSON file
            const folder = './reports';
            const filename = 'comparison_report.json';
            saveReport(report, folder, filename);
        } else {
            console.log(`No data found in table ${tableName}.`);
        }

    } catch (err) {
        console.error('Error during database operations:', err);
    } finally {
        await preClient.end();
        await postClient.end();
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    fetchTableData,
    compareTables,
    generateReport,
    saveReport
};
