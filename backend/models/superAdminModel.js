const db = require('../config/db');

const SuperAdminModel = {
    // for creating new school adn school admin
  createSchoolAndAdmin: async (schoolName, address, adminName, adminEmail, token) => {
    await db.query(
      'CALL sp_CreateSchoolAndAdmin(?, ?, ?, ?, ?)',
      [schoolName, address, adminName, adminEmail, token]
    );
    return true;
  },

  // for getting all schools admins
  getAllSchoolADmins : async () => {
    const [resultRows] = await db.query('CALL sp_GetAllSchoolAdmins()');
    return resultRows[0] || [];
  }
};

module.exports = SuperAdminModel;