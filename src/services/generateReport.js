const { fetchTableData } = require('../db');
const { compareTables } = require('./compareTables');

const generateReport = async (preClient, postClient, tableName) => {
    try {
        console.log(`\nComparing Table Name: ${tableName}`);
        // Fetch data from both databases
        const preData = await fetchTableData(preClient, tableName);
        const postData = await fetchTableData(postClient, tableName);

        // Count total records in each dataset
        const totalPreRecords = preData.length;
        const totalPostRecords = postData.length;

        // If preData has rows, assume the first column is the primary key
        if (preData.length > 0) {
            const primaryKey = Object.keys(preData[0])[0];
            const comparisonReport = compareTables(preData, postData, primaryKey);

            return {
                totalPreRecords,
                totalPostRecords,
                ...comparisonReport
            };
        }

        return null; // Return null if no data fetched from preData
    } catch (err) {
        console.error('Error generating report:', err);
        throw err;
    }
};

module.exports = { generateReport };
