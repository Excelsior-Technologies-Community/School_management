const db = require('../config/db');

const MasterMediumModel = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM tbl_master_mediums ORDER BY master_medium_id DESC');
        return rows;
    },

    getPendingRequests: async () => {
        const [rows] = await db.query(
            `SELECT m.*, s.school_name 
             FROM tbl_master_mediums m
             LEFT JOIN schools s ON m.requested_by_school_id = s.id 
             WHERE m.approval_status = 'pending' 
             ORDER BY m.master_medium_id DESC`
        );
        return Array.isArray(rows) ? rows : [];
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM tbl_master_mediums WHERE master_medium_id = ?', [id]);
        return rows[0];
    },

    create: async (adminId, data) => {
        const [result] = await db.query('CALL sp_ManageMasterMedium("CREATE",NULL,?,?,"active",?)',
            [data.medium_name, data.description || null, adminId]
        );
        return result[0][0];
    },

    update: async (id, adminId, data) => {
        await db.query('CALL sp_ManageMasterMedium("UPDATE",?,?,?,"active",?)',
            [id, data.medium_name, data.description || null, adminId]
        );
        return { id, ...data };
    },

    toggleStatus: async (id, adminId) => {
        const [result] = await db.query('CALL sp_ManageMasterMedium("TOGGLE",?,NULL,NULL,NULL,?)', [id, adminId]);
        return result[0][0];
    },

    delete: async (id, adminId) => {
        await db.query('CALL sp_ManageMasterMedium("DELETE",?,NULL,NULL,NULL,?)', [id, adminId]);
        return true;
    },

    reviewRequest: async (masterMediumId, approvalStatus, adminId) => {
        const [result] = await db.query(
            'CALL sp_ReviewCustomMediumRequests(?, ?, ?)',
            [masterMediumId, approvalStatus, adminId]
        );
        return result[0][0];
    }
}

const SchoolMediumModel = {
    getAll: async (schoolId) => {
        const [rows] = await db.query(
            `SELECT sm.*, 
                    mm.medium_name AS master_name, 
                    IFNULL(sm.custom_medium_name, mm.medium_name) AS display_name
             FROM tbl_school_mediums sm
             LEFT JOIN tbl_master_mediums mm ON sm.master_medium_id = mm.master_medium_id
             WHERE sm.school_id = ? 
             ORDER BY sm.school_medium_id DESC`,
            [schoolId]
        );
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM tbl_school_mediums WHERE school_medium_id = ?', [id]);
        return rows[0];
    },

    selectMaster: async (schoolId, staffId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageSchoolMediums("SELECT_MASTER", NULL, ?, ?, NULL, ?, ?)',
            [
                schoolId,                 
                data.master_medium_id,     
                data.description || null,  
                staffId                   
            ]
        );
        return result[0][0];
    },

    requestCustom: async (schoolId, staffId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageSchoolMediums("REQUEST_CUSTOM", NULL, ?, NULL, ?, ?, ?)',
            [schoolId, data.custom_name, data.description || null, staffId]
        );
        return result[0][0];
    },

    toggleStatus: async (id, staffId) => {
        const [result] = await db.query(
            'CALL sp_ManageSchoolMediums("TOGGLE", ?, NULL, NULL, NULL, NULL, ?)',
            [id, staffId]
        );
        return result[0][0];
    },

    delete: async (id) => {
        await db.query(
            'CALL sp_ManageSchoolMediums("DELETE", ?, NULL, NULL, NULL, NULL, NULL)', [id]
        );
        return true;
    }
}

module.exports = { MasterMediumModel, SchoolMediumModel };