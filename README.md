# Data Migration Inspector

## Overview

This Node.js script compares data between a pre-migration and a post-migration PostgreSQL database. It identifies missing, corrupted, and new records since the migration, providing a detailed report for analysis and remediation.

## Features

- **Comparison Logic**: Automatically identifies discrepancies between databases based on primary key matches and data differences.
- **Detailed Report**: Generates a JSON report detailing missing, corrupted, and new records in the migrated dataset.
- **Testing**: Includes Jest for automated testing to ensure accuracy and reliability.
- **Dependencies**: Utilizes `pg` for PostgreSQL connectivity.

## Requirements

- Node.js (v14 or higher)
- Docker (for running PostgreSQL databases in containers)
- PostgreSQL database access for both pre-migration and post-migration datasets

## Docker Setup

1. **Pull Docker Images**: Ensure you have Docker installed on your machine. Pull the necessary Docker images for both `pre-migration` and `post-migration` databases:

     ```bash
     docker pull <pre-migration-container>
     docker pull <post-migration-container>
     ```

2. **Run Docker Containers**:
Start the Docker containers for the `pre-migration` and `post-migration` databases:

     ```bash
     # Pre-migration database
     docker run -p 5432:5432 -e POSTGRES_PASSWORD=***** <pre-migration-container>

     # Post-migration database
     docker run -p 5433:5432 -e POSTGRES_PASSWORD=***** <post-migration-container>
     ```

## Installation

1. **Clone the repository**:
     ```bash
     git clone https://github.com/kandilidinesh/database_migration_inspector.git
     cd database_migration_inspector
     ```

2. **Install dependencies**:
     ```bash
     npm install
     ```

## Usage

Run the script to perform the comparison:
```bash
npm start
```
*This command will run tests using Jest and then execute the data comparison script.*

## Test Coverage

The tool includes comprehensive test coverage using Jest to ensure its functionality:

1. **Database Connectivity**: Ensures database connections are established without errors.
2. **Data Fetching**: Validates that data fetched from the database matches expected mock data.
3. **Data Comparison**: Verifies the correctness of data comparison logic to detect discrepancies.
4. **Report Generation**: Checks if the generated report accurately reflects data discrepancies between databases.
5. **File Handling**: Confirms that reports are saved correctly to the file system.

These tests guarantee that the tool functions as intended, providing accurate insights into data discrepancies during migration processes.

To run tests manually:
```bash
npm test
```
*Ensure Docker containers for databases are running as described in the Docker setup section before running tests.*

## Output

The script generates a JSON report (`report.json`) in the `output` directory, detailing:

- **Total Records in Old Database**: Total number of records in the pre-migration dataset.
- **Total Records in New Database**: Total number of records in the post-migration dataset.
- **Missing Records**: Records that are present in the pre-migration dataset but missing in the post-migration dataset.
- **Corrupted Records**: Records that are present in both datasets but with discrepancies in the data.
- **New Records**: Records that are present in the post-migration dataset but were not in the pre-migration dataset.

## Assumptions

- **Primary Key Comparison**: Records are compared based solely on primary keys to identify matching records between the pre-migration and post-migration datasets.
- **Common Columns for Corruption Detection**: Discrepancies in corrupted records are identified using only columns that are present in both datasets.
