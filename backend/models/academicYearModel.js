const db = require('../config/db')

const AcademicYearModel = {
    // academic years
    createYear: async (data) => {
        const [rows] = await db.query('CALL sp_CreateAcademicYear(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [data.school_id, data.branch_id, data.academic_year_name, data.semester,
            data.start_date, data.end_date, data.is_current, data.status, data.created_by]
        );
        return rows[0][0];
    },

    getAllYears: async (schoolId, branchId) => {
        const [rows] = await db.query('CALL sp_GetAllAcademicYears(?,?)', [schoolId, branchId]);
        return rows[0];
    },

    getYearById: async (id, schoolId) => {
        const [rows] = await db.query('CALL sp_GetAcademicYearaById(?,?)', [id, schoolId]);
        return rows[0][0];
    },

    updateYear: async (id, data) => {
        const [rows] = await db.query('CALL sp_UpdateAcademicYear(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, data.school_id, data.branch_id, data.academic_year_name, data.semester,
                data.start_date, data.end_date, data.is_current, data.status, data.updated_by]
        );
        return true;
    },

    deleteYear: async (id, schoolId) => {
        const [rows] = await db.query('CALL sp_DeleteAcademicYear(?,?)', [id, schoolId]);
        return true;
    },

    // academic year sessions
    createSession: async (data) => {
        const [rows] = await db.query('CALL sp_CreateAcademicSession(?, ?, ?, ?, ?, ?, ?, ?)',
            [data.academic_year_id, data.session_name, data.session_number,
            data.start_date, data.end_date, data.is_current, data.status, data.created_by]
        );
        return rows[0][0];
    },

    getSessionByYear: async (academicYearId) => {
        const [rows] = await db.query('CALL sp_GetAcademicSessionByAcademicYear(?)', [academicYearId]);
        return rows[0];
    },

    getSessionById: async (id) => {
        const [rows] = await db.query('CALL sp_GetAcademicSessionById(?)', [id]);
        return rows[0][0];
    },

    updateSession: async (id, data) => {
        const [rows] = await db.query('CALL sp_UpdateAcademicSession(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, data.academic_year_id, data.session_name, data.session_number,
                data.start_date, data.end_date, data.is_current, data.status, data.updated_by]
        );
        return true;
    },

    deleteSession: async(id) => {
        const [rows] = await db.query('CALL sp_DeleteAcademicSession(?)',[id]);
        return true;
    }
}

module.exports = AcademicYearModel;