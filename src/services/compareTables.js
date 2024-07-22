const compareTables = (preData, postData, primaryKey) => {
    try {
        const preDataMap = new Map(preData.map(record => [record[primaryKey], record]));
        const postDataMap = new Map(postData.map(record => [record[primaryKey], record]));

        const missingRecords = [];
        const corruptedRecords = [];
        const newRecords = [];

        // Compare preData with postData
        preData.forEach(preRecord => {
            //Check for missing records in Post Data using Primary Key
            const postRecord = postDataMap.get(preRecord[primaryKey]);
            if (!postRecord) {
                missingRecords.push(preRecord);
            } else {
                //Compare the values of just common keys from Pre & Post Data
                const commonKeys = Object.keys(preRecord).filter(key => key in postRecord);
                let isCorrupted = false;
                for (const key of commonKeys) {
                    if (preRecord[key] !== postRecord[key]) {
                        isCorrupted = true;
                        break;
                    }
                }
                if (isCorrupted) {
                    corruptedRecords.push({ preRecord, postRecord });
                }
            }
        });

        // Check for new records in Post Data with Primary Key
        postData.forEach(postRecord => {
            const preRecord = preDataMap.get(postRecord[primaryKey]);
            if (!preRecord) {
                newRecords.push(postRecord);
            }
        });

        return {
            totalMissingRecords: missingRecords.length,
            totalCorruptedRecords: corruptedRecords.length,
            totalNewRecords: newRecords.length,
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
