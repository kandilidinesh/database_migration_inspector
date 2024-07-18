const fetchTableData = async (client, tableName) => {
    try {
        const query = `SELECT * FROM ${tableName}`;
        const res = await client.query(query);
        return res.rows;
    } catch (err) {
        console.error(`Error fetching data from table ${tableName}:`, err);
        throw err;
    }
};

module.exports = { fetchTableData };
