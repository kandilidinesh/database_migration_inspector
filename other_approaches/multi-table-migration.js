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

async function fetchTables(client) {
    const query = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public'
    `;
    const res = await client.query(query);
    console.log("Tables: ", res.rows.map(row => row.table_name));
    return res.rows.map(row => row.table_name);
}

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

async function generateReport(preClient, postClient, tables) {
    const report = {};

    for (const table of tables) {
        console.log(`Comparing table: ${table}`);
        const preData = await fetchTableData(preClient, table);
        const postData = await fetchTableData(postClient, table);

        if (preData.length > 0) {
            const primaryKey = Object.keys(preData[0])[0]; // Assumes the first column is the primary key
            report[table] = compareTables(preData, postData, primaryKey);
        }
    }

    return report;
}

async function main() {
    const preClient = new Client(preMigrationConfig);
    const postClient = new Client(postMigrationConfig);

    try {
        await preClient.connect();
        console.log('Connected successfully to the old database.');
        await postClient.connect();
        console.log('Connected successfully to the new database.');

        const preTables = await fetchTables(preClient);
        const postTables = await fetchTables(postClient);

        const tablesToCompare = preTables.filter(table => postTables.includes(table));

        const report = await generateReport(preClient, postClient, tablesToCompare);
        console.log('Comparison Report:', JSON.stringify(report, null, 2));

    } catch (err) {
        console.error('Error during database operations:', err);
    } finally {
        await preClient.end();
        await postClient.end();
    }
}

main();
