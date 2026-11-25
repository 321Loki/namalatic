// usage: node scripts/runSql.js schema.sql
const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function run() {
  const fileName = process.argv[2];
  if (!fileName) {
    console.log('Please give a sql file name, eg: node scripts/runSql.js schema.sql');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.join(__dirname, '..', fileName), 'utf8');

  try {
    await pool.query(sql);
    console.log(`${fileName} executed successfully`);
  } catch (err) {
    console.error(`Failed to run ${fileName}:`, err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
