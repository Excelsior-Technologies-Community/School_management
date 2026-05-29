const db = require('../config/db');

const SchoolAdminModel = {
    // to add staff member
    addStaffMember: async (schoolId, roleId, name, email, department) => {
        await db.query(
            'CALL sp_AddStaffMember(?,?,?,?,?)',
            [schoolId, roleId, name, email, department]
        );
        return true;
    },

    // list all staff members
    getSchoolMembers: async (schoolId) => {
        const [rows] = await db.query('CALL sp_GetStaffMembers(?)', [schoolId]);
        return rows[0] || [];
    },

    // update staff member
    updateStaffMember: async (schoolId, staffId, roleId, name, email, department) => {
        await db.query(
            'CALL sp_UpdateStaffMember(?,?,?,?,?,?)',
            [schoolId, staffId, roleId, name, email, department]
        );
        return true;
    },

    // remove staff member 
    removeStaffMember: async (schoolId, staffId) => {
        await db.query('CALL sp_RemoveStaffMember(?,?)', [schoolId, staffId]);
        return true;
    },

    // add staff salary
    addSalary: async (schoolId,staffId,baseSalary) => {
        await db.query('CALL sp_AddStaffSalary(?,?,?)',[schoolId,staffId,baseSalary])
        return true;
    },

    // update staff salary
    updateSalary: async (schoolId,staffId,baseSalary) => {
        await db.query('CALL sp_UpdateStaffSalary(?,?,?)',[schoolId,staffId,baseSalary])
        return true;
    },

    // remove staff salary
    removeSalary: async(schoolId,staffId) => {
        await db.query('CALL sp_RemoveStaffSalary(?,?)',[schoolId,staffId])
        return true;
    },

    // get school salries details
    getSalariesReport: async (schoolId) => {
        const [rows] = await db.query('CALL sp_GetSchoolSalaries(?)',[schoolId])
        return rows[0] || [];
    }

}

module.exports = SchoolAdminModel;