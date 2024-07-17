const fs = require('fs');
const path = require('path');

// Fetch all data from a specific table in the database
async function fetchTableData(client, tableName) {
    try {
        const query = `SELECT * FROM ${tableName}`;
        const res = await client.query(query);
        return res.rows;
    } catch (err) {
        console.error(`Error fetching data from table ${tableName}:`, err);
        throw err;
    }
}

// Compare data between pre-migration and post-migration datasets
function compareTables(preData, postData, primaryKey) {
    try {
        const preDataMap = new Map(preData.map(record => [record[primaryKey], record]));
        const postDataMap = new Map(postData.map(record => [record[primaryKey], record]));

        const missingRecords = [];
        const corruptedRecords = [];
        const newRecords = [];

        // Compare preData with postData
        preData.forEach(record => {
            const postRecord = postDataMap.get(record[primaryKey]);
            if (!postRecord) {
                missingRecords.push(record);
            } else if (JSON.stringify(record) !== JSON.stringify(postRecord)) {
                corruptedRecords.push({ preRecord: record, postRecord });
            }
        });

        // Check for new records in postData
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
    } catch (err) {
        console.error('Error comparing tables:', err);
        throw err;
    }
}

// Generate a comparison report between pre-migration and post-migration datasets
async function generateReport(preClient, postClient, tableName) {
    try {
        console.log(`\nComparing Table Name: ${tableName}`);
        // Fetch data from both databases
        const preData = await fetchTableData(preClient, tableName);
        const postData = await fetchTableData(postClient, tableName);

        // If preData has rows, assume the first column is the primary key
        if (preData.length > 0) {
            const primaryKey = Object.keys(preData[0])[0];
            return compareTables(preData, postData, primaryKey);
        }

        return null; // Return null if no data fetched from preData
    } catch (err) {
        console.error('Error generating report:', err);
        throw err;
    }
}

// Save the comparison report to a JSON file
function saveReport(report, folder, filename) {
    try {
        const filePath = path.join(folder, filename);
        // Ensure the output folder exists; create if it doesn't
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        // Write the report to the specified file path
        fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
        console.log(`\nReport saved to ${filePath}\n`);
    } catch (err) {
        console.error('Error saving report:', err);
        throw err;
    }
}

module.exports = {
    fetchTableData,
    compareTables,
    generateReport,
    saveReport
};
