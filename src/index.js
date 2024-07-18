const { Client } = require('pg');
const { generateReport } = require('./services');
const { saveReport } = require('./utils');
const { preMigrationConfig, postMigrationConfig } = require('../lib/config');

async function main() {
    const preClient = new Client(preMigrationConfig);
    const postClient = new Client(postMigrationConfig);

    try {
        await preClient.connect();
        console.log('Connected successfully to the old database.');

        await postClient.connect();
        console.log('Connected successfully to the new database.');

        const tableName = 'accounts';
        const report = await generateReport(preClient, postClient, tableName);

        if (report) {
            console.log('\nComparison Report:\n');
            console.log(`Total Records in Old Database: ${report.totalPreRecords}`);
            console.log(`Total Records in New Database: ${report.totalPostRecords}`);
            console.log(`Missing Records: ${report.missingRecords.length}`);
            console.log(`Corrupted Records: ${report.corruptedRecords.length}`);

            const folder = './output';
            const filename = 'report.json';
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

module.exports = {
    main
};