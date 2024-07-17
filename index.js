const fs = require('fs');
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

function compareTables(preData, postData, primaryKey) {
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

    return { 
        missingRecords, 
        corruptedRecords, 
        newRecords 
    };
}

async function generateReport(preClient, postClient, tableName) {
    console.log(`Comparing table: ${tableName}`);
    const preData = await fetchTableData(preClient, tableName);
    const postData = await fetchTableData(postClient, tableName);

    if (preData.length > 0) {
        const primaryKey = Object.keys(preData[0])[0]; // Assumes the first column is the primary key
        return compareTables(preData, postData, primaryKey);
    }

    return null;
}

function saveReport(report, filename) {
    fs.writeFileSync(filename, JSON.stringify(report, null, 2), 'utf-8');
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
            console.log('Comparison Report:');
            console.log(`Missing Records: ${report.missingRecords.length}`);
            console.log(`Corrupted Records: ${report.corruptedRecords.length}`);
            console.log(`New Records: ${report.newRecords.length}`);
            
            // Save the full report to a JSON file
            saveReport(report, 'comparison_report.json');
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
