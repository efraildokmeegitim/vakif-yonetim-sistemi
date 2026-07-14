const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root'
  });

  try {
    const [oldGroups] = await connection.query('SELECT * FROM vakif_db.sacrifices;');
    const [oldShares] = await connection.query('SELECT * FROM vakif_db.sacrifice_shares;');
    const [oldTypes] = await connection.query('SELECT * FROM vakif_db.sacrifice_donation_types;');
    const [oldAccounts] = await connection.query('SELECT * FROM vakif_db.current_accounts;');

    let campaignId = 1;
    const [camps] = await connection.query('SELECT id FROM vakif_core_db.sacrifice_campaigns WHERE name="Geçmiş Kurban Kayıtları" LIMIT 1');
    if (camps.length > 0) {
      campaignId = camps[0].id;
    }

    const accountMap = {};
    for (const oldAcc of oldAccounts) {
      if (oldAcc.id === 4 || oldAcc.id === 20) {
        let [existing] = await connection.query(`SELECT id FROM vakif_core_db.current_accounts WHERE name = ?`, [oldAcc.name]);
        let newAccId;
        if (existing.length > 0) {
          newAccId = existing[0].id;
        } else {
          const cat = oldAcc.id === 20 ? 'Kurumsal' : 'Bireysel';
          const [accResult] = await connection.query(`
            INSERT INTO vakif_core_db.current_accounts (name, accountCategory, notes, isActive) 
            VALUES (?, ?, ?, 1)
          `, [oldAcc.name, cat, 'Migrated from old system']);
          newAccId = accResult.insertId;
        }
        accountMap[oldAcc.id] = newAccId;
      }
    }

    const groupMap = {};
    for (const oldGrp of oldGroups) {
      let inst = null;
      if (oldGrp.transferred_to_ca_id) {
         const oldCa = oldAccounts.find(a => a.id === oldGrp.transferred_to_ca_id);
         if (oldCa) inst = oldCa.name;
      }
      
      let newStatus = 'Bekliyor';
      if (oldGrp.status === 'Aktarıldı') newStatus = 'Aktarıldı';
      if (oldGrp.status === 'Kesildi') newStatus = 'Kesildi';
      if (oldGrp.status === 'Bağış Toplanıyor') newStatus = 'Bekliyor';

      let [existingGroup] = await connection.query(`SELECT id FROM vakif_core_db.sacrifice_groups WHERE name = ?`, [oldGrp.description || 'Grup ' + oldGrp.id]);
      if (existingGroup.length > 0) {
        groupMap[oldGrp.id] = existingGroup[0].id;
      } else {
        const [grpResult] = await connection.query(`
          INSERT INTO vakif_core_db.sacrifice_groups (name, animalType, capacity, status, transferredInstitution, campaign_id) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [oldGrp.description || 'Grup ' + oldGrp.id, oldGrp.animal_type, oldGrp.total_shares, newStatus, inst, campaignId]);
        groupMap[oldGrp.id] = grpResult.insertId;
      }
    }

    for (const oldShare of oldShares) {
      let type = oldTypes.find(t => t.id === oldShare.donation_type_id)?.name || 'Vacip';
      if(type === 'Sadaka') type = 'Vacip'; // Fallback
      if(type === 'Diğer') type = 'Vacip';

      const newGroupId = groupMap[oldShare.sacrifice_id];
      const donorId = accountMap[oldShare.current_account_id];

      let [existingShare] = await connection.query(`SELECT id FROM vakif_core_db.sacrifice_shares WHERE current_account_id = ? AND group_id = ?`, [donorId, newGroupId]);
      if (existingShare.length === 0) {
        await connection.query(`
          INSERT INTO vakif_core_db.sacrifice_shares (shareType, amountPaid, currency, isProxyGiven, current_account_id, group_id) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [type, 0, 'TRY', 1, donorId, newGroupId]);
      }
    }

    console.log('Migration completed successfully!');

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

run();
