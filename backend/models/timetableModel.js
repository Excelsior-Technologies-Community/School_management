const db = require('../config/db')

// period model
const SchoolPeriodModel = {
    getAll: async (branchId) => {
        const [rows] = await db.query('SELECT * FROM school_period WHERE branch_id = ? ORDER BY period_no ASC', [branchId]);
        return rows;
    },

    getById: async (periodId) => {
        const [rows] = await db.query('SELECT * FROM school_period WHERE period_id = ?', [periodId]);
        return rows[0];
    },

    create: async (schoolId, userId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageSchoolPeriod("CREATE", NULL, ?, ?, ?, ?, ?, ?, ?)',
            [schoolId, data.branch_id, data.period_no, data.start_time, data.end_time, data.status || 'Active', userId]
        );
        return result[0][0];
    },

    update: async (periodId, userId, data) => {
        await db.query(
            'CALL sp_ManageSchoolPeriod("UPDATE", ?, NULL, NULL, ?, ?, ?, ?, ?)',
            [periodId, data.period_no, data.start_time, data.end_time, data.status, userId]
        );
        return { period_id: periodId, ...data };
    },

    toggleStatus: async (periodId, userId) => {
        const [result] = await db.query(
            'CALL sp_ManageSchoolPeriod("TOGGLE", ?, NULL, NULL, NULL, NULL, NULL, NULL, ?)',
            [periodId, userId]
        );
        return result[0][0];
    },

    delete: async (periodId) => {
        await db.query('CALL sp_ManageSchoolPeriod("DELETE", ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL)', [periodId]);
        return true;
    }
};

// time table model
const TimeTableModel = {
    getByBatch: async (batchId) => {
        const [rows] = await db.query('CALL sp_GetTimeTableByBatch(?)', [batchId]);
        return rows[0];
    },

    getById: async (timeTableId) => {
        const [rows] = await db.query('SELECT * FROM time_table WHERE time_table_id = ?', [timeTableId]);
        return rows[0];
    },

    create: async (userId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageTimeTable("CREATE", NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [data.batch_id, data.period_id, data.school_subject_id, data.teacher_id, data.day_of_week, data.duration_minutes, data.room_no || null, data.status || 'Active', userId]
        );
        return result[0][0];
    },

    update: async (timeTableId, userId, data) => {
        await db.query(
            'CALL sp_ManageTimeTable("UPDATE", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [timeTableId, data.batch_id, data.period_id, data.school_subject_id, data.teacher_id, data.day_of_week, data.duration_minutes, data.room_no || null, data.status, userId]
        );
        return { time_table_id: timeTableId, ...data };
    },

    toggleStatus: async (timeTableId, userId) => {
        const [result] = await db.query(
            'CALL sp_ManageTimeTable("TOGGLE", ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?)',
            [timeTableId, userId]
        );
        return result[0][0];
    },

    delete: async (timeTableId) => {
        await db.query('CALL sp_ManageTimeTable("DELETE", ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)', [timeTableId]);
        return true;
    }
}

// period substitution model 
const SubstitutionModel = {
    getByDate: async (branchId, date) => {
        const [rows] = await db.query(
            'CALL sp_GetSubstitutionsByDate(?,?)',
            [branchId, date]
        );
        return rows;
    },

    create: async (userId, data) => {
        const [result] = await db.query(
            'CALL sp_ManageSubstitution("CREATE", NULL, ?, ?, ?, ?, ?, ?, ?, ?)',
            [data.time_table_id, data.original_teacher_id, data.substitute_teacher_id, data.substitution_date, data.reason || null, data.remark || null, data.status || 'Active', userId]
        );
        return result[0][0];
    },

    update: async (substitutionId, userId, data) => {
        await db.query(
            'CALL sp_ManageSubstitution("UPDATE", ?, NULL, NULL, ?, ?, ?, ?, ?, ?)',
            [substitutionId, data.substitute_teacher_id, data.substitution_date, data.reason || null, data.remark || null, data.status, userId]
        );
        return { substitution_id: substitutionId, ...data };
    },

    delete: async (substitutionId) => {
        await db.query('CALL sp_ManageSubstitution("DELETE", ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)', [substitutionId]);
        return true;
    }
};

module.exports = { SchoolPeriodModel, TimeTableModel, SubstitutionModel };