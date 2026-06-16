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
        const [rows] = await db.query(
            `SELECT ss.*, 
                    ms.subject_name AS master_name, 
                    ms.subject_code AS master_code,
                    IFNULL(ss.custom_subject_name, ms.subject_name) AS display_name,
                    IFNULL(ss.custom_subject_type, ms.subject_type) AS display_type
             FROM tbl_school_subjects ss
             LEFT JOIN tbl_master_subjects ms ON ss.master_subject_id = ms.master_subject_id
             WHERE ss.school_id = ? 
             ORDER BY ss.school_subject_id DESC`,
            [schoolId]
        );
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM tbl_school_subjects WHERE school_subject_id = ?', [id]);
        return rows[0];
    },

    selectMaster: async (schoolId, staffId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageSchoolSubjects("SELECT_MASTER", NULL, ?, ?, NULL, NULL, NULL, NULL, ?, ?)',
            [schoolId, data.master_subject_id, data.color_code || '#3b82f6', staffId]
        );
        return result[0][0];
    },

    requestCustom: async (schoolId, staffId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageSchoolSubjects("REQUEST_CUSTOM", NULL, ?, NULL, ?, ?, ?, ?, ?, ?)',
            [schoolId, data.custom_name, data.custom_code, data.custom_type || 'theory', data.description || null, data.color_code || '#3b82f6', staffId]
        );
        return result[0][0];
    },

    toggleStatus: async (id, staffId) => {
        const [result] = await db.query(
            'CALL sp_ManageSchoolSubjects("TOGGLE", ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?)',
            [id, staffId]
        );
        return result[0][0];
    },

    delete: async (id) => {
        await db.query(
            'CALL sp_ManageSchoolSubjects("DELETE", ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)',[id]
        );
        return true;
    }
};


const MasterSubjectModel = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM tbl_master_subjects ORDER BY master_subject_id DESC');
        return rows;
    },

    getPendingRequests: async () => {
        const [rows] = await db.query(
            `SELECT m.*, s.school_name 
             FROM tbl_master_subjects m
             LEFT JOIN schools s ON m.requested_by_school_id = s.id 
             WHERE m.approval_status = 'pending' 
             ORDER BY m.master_subject_id DESC`
        );
        return Array.isArray(rows) ? rows : [];
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM tbl_master_subjects WHERE master_subject_id = ?', [id]);
        return rows[0];
    },

    create: async (adminId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageMasterSubject("CREATE", NULL, ?, ?, ?, ?, ?, "active", ?)',
            [data.subject_name, data.subject_code, data.description || null, data.subject_type || 'theory', data.color_code || '#3b82f6', adminId]
        );
        return result[0][0];
    },

    update: async (id, adminId, data) => {
        await db.query(
            'CALL sp_ManageMasterSubject("UPDATE", ?, ?, ?, ?, ?, ?, "active", ?)',
            [id, data.subject_name, data.subject_code, data.description || null, data.subject_type || 'theory', data.color_code || '#3b82f6', adminId]
        );
        return { id, ...data };
    },

    toggleStatus: async (id, adminId) => {
        const [result] = await db.query(
            'CALL sp_ManageMasterSubject("TOGGLE", ?, NULL, NULL, NULL, NULL, NULL, NULL, ?)',
            [id, adminId]
        );
        return result[0][0];
    },

    delete: async (id, adminId) => {
        await db.query(
            'CALL sp_ManageMasterSubject("DELETE", ?, NULL, NULL, NULL, NULL, NULL, NULL, ?)',
            [id, adminId]
        );
        return true;
    },

    reviewRequest: async (masterSubjectId, approvalStatus, adminId) => {
        const [result] = await db.query(
            'CALL sp_ReviewCustomRequests(?, ?, ?)',
            [masterSubjectId, approvalStatus, adminId]
        );
        return result[0][0];
    }
};

module.exports = { BranchModel, SubjectModel, MasterSubjectModel };