const { DataSource } = require("typeorm");
require('dotenv').config();

const dataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function run() {
  await dataSource.initialize();
  const cols = await dataSource.query(`SHOW COLUMNS FROM users`);
  console.log("COLUMNS:", cols);
  process.exit(0);
}
run().catch(console.error);
