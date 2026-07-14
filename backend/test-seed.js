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
  console.log("DB connected.");
  
  // 1. Create permission
  await dataSource.query(`INSERT IGNORE INTO permissions (action, description) VALUES ('all', 'Tam Erişim')`);
  const [perm] = await dataSource.query(`SELECT id FROM permissions WHERE action = 'all'`);
  const permissionId = perm.id;
  console.log("Permission ID:", permissionId);
  
  // 2. Create Role
  await dataSource.query(`INSERT IGNORE INTO roles (name, description) VALUES ('Admin', 'Sistem Yöneticisi')`);
  const [role] = await dataSource.query(`SELECT id FROM roles WHERE name = 'Admin'`);
  const roleId = role.id;
  console.log("Role ID:", roleId);
  
  // 3. Link Role and Permission
  try {
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);

    const updateQuery = `
      UPDATE users 
      SET role_id = ${roleId},
          passwordHash = '${hash}',
          isActive = 1
      WHERE email = 'admin@vakif.com'
    `;
    await dataSource.query(updateQuery);

    const checkAdmin = await dataSource.query("SELECT * FROM users WHERE email = 'admin@vakif.com'");
    if (checkAdmin.length === 0) {
      await dataSource.query(`
        INSERT INTO users (email, passwordHash, firstName, lastName, isActive, role, role_id)
        VALUES ('admin@vakif.com', '${hash}', 'Admin', 'User', 1, 'Admin', ${roleId})
      `);
      console.log('admin@vakif.com eklendi!');
    } else {
      console.log('admin@vakif.com güncellendi!');
    }
    
    await dataSource.query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [roleId, permissionId]);
  } catch(e) {
    console.log("Link already exists or error", e.message);
  }
  
  // 4. Update Users
  const res = await dataSource.query(`UPDATE users SET \`role_id\` = ? WHERE \`role_id\` IS NULL`, [roleId]);
  console.log("Users updated:", res);
  
  process.exit(0);
}

run().catch(console.error);
