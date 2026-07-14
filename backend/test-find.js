const { DataSource } = require("typeorm");
require('dotenv').config();

const dataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function run() {
  await dataSource.initialize();
  const user = await dataSource.query(`SELECT id, email, role_id FROM users WHERE email='admin@vakif.com'`);
  console.log("USER:", user);
  const perms = await dataSource.query(`SELECT * FROM role_permissions`);
  console.log("PERMS:", perms);
  process.exit(0);
}
run().catch(console.error);
