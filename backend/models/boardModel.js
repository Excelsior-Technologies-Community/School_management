const db = require('../config/db');

const MasterBoardModel = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM tbl_master_school_boards ORDER BY master_board_id DESC')
        return rows;
    },

    getPendingRequests: async () => {
        const [rows] = await db.query(
            `SELECT b.*, s.school_name 
             FROM tbl_master_school_boards b
             LEFT JOIN schools s ON b.requested_by_school_id = s.id 
             WHERE b.approval_status = 'pending' 
             ORDER BY b.master_board_id DESC`
        );
        return Array.isArray(rows) ? rows : [];
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM tbl_master_school_boards WHERE master_board_id = ?', [id]);
        return rows[0];
    },

    create: async (adminId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageMasterSchoolBoards("CREATE", NULL, ?, ?, ?, ?)',
            [data.board_name, data.board_logo || null, data.description || null, adminId]
        );
        return result[0][0];
    },

    update: async (id, adminId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageMasterSchoolBoards("UPDATE", ?, ?, ?, ?, ?)',
            [id, data.board_name, data.board_logo || null, data.description || null, adminId]
        );
        return { id, ...data };
    },

    toggleStatus: async (id, adminId) => {
        const [result] = await db.query(
            'CALL sp_ManageMasterSchoolBoards("TOGGLE", ?, NULL, NULL, NULL, ?)',
            [id, adminId]
        );
        return result[0][0];
    },

    delete: async (id, adminId) => {
        await db.query(
            'CALL sp_ManageMasterSchoolBoards("DELETE", ?, NULL, NULL, NULL, ?)',
            [id, adminId]
        );
        return true;
    },

    reviewRequest: async (masterBoardId, reviewStatus, adminId) => {
        const [result] = await db.query(
            'CALL sp_ReviewCustomBoardRequests(?, ?, ?)',
            [masterBoardId, reviewStatus, adminId]
        );
        return result[0][0];
    }

}

const SchoolBoardModel = {
    getAll: async (schoolId) => {
        const [rows] = await db.query(
            `SELECT sb.*, 
                    mb.board_name AS master_name, 
                    mb.board_logo AS master_logo,
                    IFNULL(sb.custom_board_name, mb.board_name) AS display_name,
                    IFNULL(sb.custom_board_logo, mb.board_logo) AS display_logo
             FROM tbl_school_boards sb
             LEFT JOIN tbl_master_school_boards mb ON sb.master_board_id = mb.master_board_id
             WHERE sb.school_id = ? 
             ORDER BY sb.school_board_id DESC`,
            [schoolId]
        );
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM tbl_school_boards WHERE school_board_id = ?', [id]);
        return rows[0];
    },

    selectMaster: async (schoolId, staffId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageSchoolBoards("SELECT_MASTER", NULL, ?, ?, NULL, NULL, NULL, ?)',
            [schoolId, data.master_board_id, staffId]
        );
        return result[0][0];
    },

    requestCustom: async (schoolId, staffId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageSchoolBoards("REQUEST_CUSTOM", NULL, ?, NULL, ?, ?, ?, ?)',
            [schoolId, data.custom_name, data.custom_logo || null, data.description || null, staffId]
        );
        return result[0][0];
    },

    toggleStatus: async (id, staffId) => {
        const [result] = await db.query(
            'CALL sp_ManageSchoolBoards("TOGGLE", ?, NULL, NULL, NULL, NULL, NULL, ?)',
            [id, staffId]
        );
        return result[0][0];
    },

    delete: async (id) => {
        await db.query(
            'CALL sp_ManageSchoolBoards("DELETE", ?, NULL, NULL, NULL, NULL, NULL, NULL)',
            [id]
        );
        return true;
    }
}

module.exports = { MasterBoardModel, SchoolBoardModel };