const db = require('../config/db');

const BranchModel = {
    getAll: async (schoolId) => {
        const [rows] = await db.query('SELECT * FROM branches WHERE school_id = ? ORDER BY id DESC', [schoolId]);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM branches WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (schoolId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageBranch("CREATE", NULL, ?, ?, ?, ?)', 
            [schoolId, data.branch_name, data.address || null, data.status || 'Active']
        );
        return result[0][0];
    },

    update: async (id, data) => {
        await db.query(
            'CALL sp_ManageBranch("UPDATE", ?, NULL, ?, ?, ?)', 
            [id, data.branch_name, data.address || null, data.status]
        );
        return { id, ...data };
    },

    toggleStatus: async (id) => {
        const [result] = await db.query('CALL sp_ManageBranch("TOGGLE", ?, NULL, NULL, NULL, NULL)', [id]);
        return result[0][0];
    },

    delete: async (id) => {
        await db.query('CALL sp_ManageBranch("DELETE", ?, NULL, NULL, NULL, NULL)', [id]);
        return true;
    }
};

const SubjectModel = {
    getAll: async (schoolId) => {
        const [rows] = await db.query('SELECT * FROM school_subjects WHERE school_id = ? ORDER BY id DESC', [schoolId]);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM school_subjects WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (schoolId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageSubject("CREATE", NULL, ?, ?, ?, ?)', 
            [schoolId, data.subject_name, data.subject_code || null, data.status || 'Active']
        );
        return result[0][0];
    },

    update: async (id, data) => {
        await db.query(
            'CALL sp_ManageSubject("UPDATE", ?, NULL, ?, ?, ?)', 
            [id, data.subject_name, data.subject_code || null, data.status]
        );
        return { id, ...data };
    },

    toggleStatus: async (id) => {
        const [result] = await db.query('CALL sp_ManageSubject("TOGGLE", ?, NULL, NULL, NULL, NULL)', [id]);
        return result[0][0];
    },

    delete: async (id) => {
        await db.query('CALL sp_ManageSubject("DELETE", ?, NULL, NULL, NULL, NULL)', [id]);
        return true;
    }
};

module.exports = { BranchModel, SubjectModel };