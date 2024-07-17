const fs = require('fs');
const path = require('path');

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
    console.log(`\nComparing Table Name: ${tableName}`);
    const preData = await fetchTableData(preClient, tableName);
    const postData = await fetchTableData(postClient, tableName);

    if (preData.length > 0) {
        const primaryKey = Object.keys(preData[0])[0]; // Assuming the first column is the primary key
        return compareTables(preData, postData, primaryKey);
    }

    return null;
}

function saveReport(report, folder, filename) {
    const filePath = path.join(folder, filename);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\nReport saved to ${filePath}\n`);
}

module.exports = {
    fetchTableData,
    compareTables,
    generateReport,
    saveReport
};
