const compareTables = (preData, postData, primaryKey) => {
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
};

module.exports = { compareTables };
