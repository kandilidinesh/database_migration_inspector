const fs = require('fs');
const path = require('path');

const saveReport = (report, folder, filename) => {
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
};

module.exports = { saveReport };
