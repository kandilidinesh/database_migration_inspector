const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Client } = require('pg');

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

async function fetchTableData(client, tableName) {
    const query = `SELECT * FROM ${tableName}`;
    const res = await client.query(query);
    return res.rows;
}

async function compareTables(preData, postData, primaryKey) {
    const preDataMap = new Map(preData.map(record => [record[primaryKey], record]));
    const postDataMap = new Map(postData.map(record => [record[primaryKey], record]));

    const missingRecords = [];
    const corruptedRecords = [];
    const newRecords = [];

    preData.forEach(record => {
        const postRecord = postDataMap.get(record[primaryKey]);
        if (!postRecord) {
            missingRecords.push(record);
        } else if (JSON.stringify(record) !== JSON.stringify(postRecord)) {
            corruptedRecords.push({ preRecord: record, postRecord });
        }
    });

    postData.forEach(record => {
        if (!preDataMap.has(record[primaryKey])) {
            newRecords.push(record);
        }
    });

    return { missingRecords, corruptedRecords, newRecords };
}

async function saveReportToCsv(report, filename) {
    const csvWriter = createCsvWriter({
        path: filename,
        header: [
            { id: 'type', title: 'TYPE' },
            { id: 'data', title: 'DATA' }
        ]
    });

    const records = [
        ...report.missingRecords.map(record => ({ type: 'missing', data: JSON.stringify(record) })),
        ...report.corruptedRecords.map(record => ({ type: 'corrupted', data: JSON.stringify(record) })),
        ...report.newRecords.map(record => ({ type: 'new', data: JSON.stringify(record) }))
    ];

    await csvWriter.writeRecords(records);
    console.log(`Report saved to ${filename}`);
}

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
            console.log('Comparison Report:', JSON.stringify(report, null, 2));
            // Save the report to a CSV file
            await saveReportToCsv(report, 'comparison_report.csv');
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

main();
