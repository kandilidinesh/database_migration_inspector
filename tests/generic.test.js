const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const {
    fetchTableData,
    compareTables,
    generateReport,
    saveReport
} = require('../src/utils/report-utils');

jest.mock('pg');

describe('Database Operations', () => {
    let preClient, postClient;

    beforeAll(() => {
        preClient = new Client();
        postClient = new Client();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should connect to the database', async () => {
        preClient.connect.mockResolvedValue();
        postClient.connect.mockResolvedValue();

        await preClient.connect();
        await postClient.connect();

        expect(preClient.connect).toHaveBeenCalled();
        expect(postClient.connect).toHaveBeenCalled();
    });

    test('should fetch data from tables', async () => {
        const mockData = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
        preClient.query.mockResolvedValue({ rows: mockData });
        postClient.query.mockResolvedValue({ rows: mockData });

        const preData = await fetchTableData(preClient, 'accounts');
        const postData = await fetchTableData(postClient, 'accounts');

        expect(preData).toEqual(mockData);
        expect(postData).toEqual(mockData);
    });

    test('should compare tables and detect missing, corrupted, and new records', () => {
        const preData = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
        const postData = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob Smith' }, { id: 3, name: 'Charlie' }];

        const { missingRecords, corruptedRecords, newRecords } = compareTables(preData, postData, 'id');

        expect(missingRecords).toEqual([]);
        expect(corruptedRecords).toEqual([{ preRecord: { id: 2, name: 'Bob' }, postRecord: { id: 2, name: 'Bob Smith' } }]);
        expect(newRecords).toEqual([{ id: 3, name: 'Charlie' }]);
    });

    test('should generate a comparison report', async () => {
        const preData = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
        const postData = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob Smith' }, { id: 3, name: 'Charlie' }];

        preClient.query.mockResolvedValue({ rows: preData });
        postClient.query.mockResolvedValue({ rows: postData });

        const report = await generateReport(preClient, postClient, 'accounts');

        expect(report.missingRecords).toEqual([]);
        expect(report.corruptedRecords).toEqual([{ preRecord: { id: 2, name: 'Bob' }, postRecord: { id: 2, name: 'Bob Smith' } }]);
        expect(report.newRecords).toEqual([{ id: 3, name: 'Charlie' }]);
    });

    test('should save the report to a file', () => {
        const report = {
            missingRecords: [],
            corruptedRecords: [{ preRecord: { id: 2, name: 'Bob' }, postRecord: { id: 2, name: 'Bob Smith' } }],
            newRecords: [{ id: 3, name: 'Charlie' }]
        };
        const filename = 'comparison_report.json';
        const reportsFolder = path.join(__dirname, '../output');

        jest.spyOn(fs, 'writeFileSync').mockImplementation(() => { });

        saveReport(report, reportsFolder, filename);

        const expectedFilePath = path.join(reportsFolder, filename);
        expect(fs.writeFileSync).toHaveBeenCalledWith(expectedFilePath, JSON.stringify(report, null, 2), 'utf-8');
    });
});
