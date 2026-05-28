const db = require('../config/db');

const AuthModel = {
  // fetch user profile
  findStaffByEmail: async (email) => {
    const [resultRows] = await db.query('CALL sp_GetStaffByEmail(?)', [email]);
    return resultRows[0][0] || null;
  },

  // securely update the password
  activateAdminAccount: async (token, hashedPassword) => {
    await db.query('CALL sp_ActivateSchoolAdmin(?, ?)', [token, hashedPassword]);
    return true;
  }
};

module.exports = AuthModel;
