const db = require('../config/db');

const SchoolAdminModel = {
    // add new department
    addDepartment: async (schoolId, deptName) => {
        await db.query('CALL sp_AddDepartment(?,?)', [schoolId, deptName]);
        return true;
    },

    // list departments
    getSchoolDepartments: async (schoolId) => {
        const [rows] = await db.query('CALL sp_GetSchoolDepartments(?)', [schoolId]);
        return rows[0] || [];
    },

    // update department
    updateDepartment: async (schoolId, departmentId, deptName) => {
        await db.query('CALL sp_UpdateDepartment(?,?,?)', [schoolId, departmentId, deptName]);
        return true;
    },

    // remove department
    removeDepartment: async (schoolId, departmentId) => {
        await db.query('CALL sp_RemoveDepartment(?,?)', [schoolId, departmentId]);
        return true;
    },

    // to add staff member
    addStaffMember: async (schoolId, roleId, departmentId, name, email) => {
        await db.query(
            'CALL sp_AddStaffMember(?,?,?,?,?)',
            [schoolId, roleId, departmentId, name, email,]
        );
        return true;
    },

    // list all staff members
    getSchoolMembers: async (schoolId) => {
        const [rows] = await db.query('CALL sp_GetStaffMembers(?)', [schoolId]);
        return rows[0] || [];
    },

    // update staff member
    updateStaffMember: async (schoolId, staffId, roleId, departmentId, name, email) => {
        await db.query(
            'CALL sp_UpdateStaffMember(?,?,?,?,?,?)',
            [schoolId, staffId, roleId, departmentId, name, email]
        );
        return true;
    },

    // remove staff member 
    removeStaffMember: async (schoolId, staffId) => {
        await db.query('CALL sp_RemoveStaffMember(?,?)', [schoolId, staffId]);
        return true;
    },

    // add staff salary
    addSalary: async (schoolId, staffId, baseSalary) => {
        await db.query('CALL sp_AddStaffSalary(?,?,?)', [schoolId, staffId, baseSalary])
        return true;
    },

    // update staff salary
    updateSalary: async (schoolId, staffId, baseSalary) => {
        await db.query('CALL sp_UpdateStaffSalary(?,?,?)', [schoolId, staffId, baseSalary])
        return true;
    },

    // remove staff salary
    removeSalary: async (schoolId, staffId) => {
        await db.query('CALL sp_RemoveStaffSalary(?,?)', [schoolId, staffId])
        return true;
    },

    // get school salries details
    getSalariesReport: async (schoolId) => {
        const [rows] = await db.query('CALL sp_GetSchoolSalaries(?)', [schoolId])
        return rows[0] || [];
    }

}

module.exports = SchoolAdminModel;