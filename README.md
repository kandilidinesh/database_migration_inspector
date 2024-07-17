# Data Migration Comparison Tool

## Overview

This Node.js script compares data between a pre-migration and a post-migration PostgreSQL database. It identifies missing, corrupted, and new records since the migration, providing a detailed report for analysis and remediation.

## Features

- **Comparison Logic**: Automatically identifies discrepancies between databases based on primary key matches and data differences.
- **Detailed Report**: Generates a JSON report detailing missing, corrupted, and new records in the migrated dataset.
- **Customizable**: Easily adaptable to different database schemas and migration scenarios.
- **Testing**: Includes Jest for automated testing to ensure accuracy and reliability.
- **Dependencies**: Utilizes `pg` for PostgreSQL connectivity.

## Requirements

- Node.js (v14 or higher)
- Docker (for running PostgreSQL databases in containers)
- PostgreSQL database access for both pre-migration and post-migration datasets

## Docker Setup

1. Pull Docker Images: Ensure you have Docker installed on your machine. Pull the necessary Docker images for both pre-migration and post-migration databases:

```bash
docker pull <pre-migration-container>
docker pull <post-migration-container>
```

2. Run Docker Containers:
Start the Docker containers for the pre-migration and post-migration databases:

```bash
# Pre-migration database
docker run -p 5432:5432 -e POSTGRES_PASSWORD=***** <pre-migration-container>

# Post-migration database
docker run -p 5433:5432 -e POSTGRES_PASSWORD=***** <post-migration-container>
```

## Installation

1. Clone the repository:
```bash
     git clone https://github.com/kandilidinesh/database_migration_checker.git
     cd database_migration_checker
```

2. Install dependencies:
```bash
     npm install
```

3. Set up PostgreSQL connections in `index.js`:
- Update `preMigrationConfig` and `postMigrationConfig` with your database connection details.

## Usage

Run the script to perform the comparison:
```bash
  npm start
```

This command will run tests using Jest and then execute the data comparison script.

## Output

The script generates a JSON report (`migration-report.json`) in the project directory, detailing:
- Records missing in the post-migration dataset.
- Corrupted records with data discrepancies.
- New records introduced in the post-migration dataset.

## Assumptions

- Assumes primary keys are intact and consistent between databases.
- Assumes no intentional data deletion post-migration.
- Assumes all discrepancies are due to migration issues.
