const { Client } = require('pg');
const { generateReport, saveReport } = require('../utils/reportUtils');
const { preMigrationConfig, postMigrationConfig } = require('../../lib/config');

async function main() {
    // Create PostgreSQL clients for pre-migration and post-migration databases
    const preClient = new Client(preMigrationConfig);
    const postClient = new Client(postMigrationConfig);

    try {
        // Connect to the pre-migration database
        await preClient.connect();
        console.log('Connected successfully to the old database.');

        // Connect to the post-migration database
        await postClient.connect();
        console.log('Connected successfully to the new database.');

        // Specify the table to compare
        const tableName = 'accounts';

        // Generate a comparison report between pre-migration and post-migration data
        const report = await generateReport(preClient, postClient, tableName);

        // If a valid report is generated, display stats and save report to file
        if (report) {
            console.log('\nComparison Report:\n');
            console.log(`Missing Records: ${report.missingRecords.length}`);
            console.log(`Corrupted Records: ${report.corruptedRecords.length}`);
            console.log(`New Records: ${report.newRecords.length}`);

            const folder = './output';
            const filename = 'report.json';
            saveReport(report, folder, filename);
        } else {
            // If no data found in the specified table
            console.log(`No data found in table ${tableName}.`);
        }

    } catch (err) {
        console.error('Error during database operations:', err);
    } finally {
        // Ensure clients are properly closed regardless of outcome
        await preClient.end();
        await postClient.end();
    }
}

module.exports = {
    main
};
