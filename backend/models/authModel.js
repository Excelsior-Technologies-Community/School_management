const db = require('../config/db');

const AuthModel = {
  // Fetch staff user profile via procedure
  findStaffByEmail: async (email) => {
    const [resultRows] = await db.query('CALL sp_GetStaffByEmail(?)', [email]);
    return resultRows[0][0] || null;
  },

  // Fetch student profile 
  findStudentByEmail: async (email) => {
    const [resultRows] = await db.query('CALL sp_GetStudentByEmail(?)', [email]);
    return resultRows[0][0] || null; 
  },

  // Calls the unified activation logic block
  activateUserAccount: async (token, hashedPassword) => {
    await db.query('CALL sp_ActivateUserAccount(?, ?)', [token, hashedPassword]);
    return true;
  }
};

module.exports = AuthModel;