const db = require('../config/db');

const HomeworkModel = {
    createHomework: async (data) => {
        const query = 'CALL sp_CreateHomework(?,?,?,?,?,?,?,?,?,?)';
        const values = [
            data.school_id, data.staff_id, data.batch_id, data.school_subject_id,
            data.homework_category, data.homework_title, data.description,
            data.attachments ? JSON.stringify(data.attachments) : null,
            data.assigned_date, data.due_date
        ];
        const [result] = await db.query(query, values);
        return result;
    },

    getHomeworkByStaff: async (schoolId, staffId) => {
        const [rows] = await db.query('CALL sp_GetHomeworkByStaff(?,?)', [schoolId, staffId]);
        return rows[0] || [];
    },

    getHomeworkForStudent: async (schoolId, studentId) => {
        const [rows] = await db.query('CALL sp_GetHomeworkForStudent(?,?)', [schoolId, studentId]);
        return rows[0] || [];
    },

    submitOrRequestHomework: async (data) => {
        const query = 'CALL sp_SubmitOrRequestHomework(?,?,?,?,?,?)';
        const values = [
            data.school_id,
            data.homework_id,
            data.student_id,
            data.submission_text || null,
            data.attachments ? JSON.stringify(data.attachments) : null,
            data.late_reason || null
        ];
        const [rows] = await db.query(query, values);
        return rows[0]?.[0] || { result_status: 'ERROR', message: 'No response returned from database module.' };
    },

    getPendingLateRequests: async (schoolId, staffId) => {
        const [rows] = await db.query('CALL sp_GetPendingLateRequests(?,?)', [schoolId, staffId]);
        return rows[0] || [];
    },

    processLateSubmissionRequest: async (data) => {
        const query = 'CALL sp_ProcessLateSubmissionRequest(?,?,?,?)';
        const values = [data.submission_id, data.staff_id, data.decision, data.admin_remark || null];
        const [rows] = await db.query(query, values);
        return rows[0]?.[0] || { result_status: 'SUCCESS' };
    },

    getSubmissionsByHomework: async (schoolId, homeworkId) => {
        const [rows] = await db.query('CALL sp_GetSubmissionsByHomework(?,?)', [schoolId, homeworkId]);
        return rows[0] || [];
    },

    gradeSubmission: async (data) => {
        const query = 'CALL sp_GradeSubmissions(?,?,?,?,?,?)';
        const values = [
            data.submission_id,
            data.staff_id,
            data.marks_obtained,
            data.maximum_marks,
            data.rating || null,
            data.teacher_remarks || null
        ];
        const [rows] = await db.query(query, values);
        return rows[0]?.[0] || { result_status: 'SUCCESS' };
    },

    getStaffAllocations: async (schoolId, teacherId) => {
        const [rows] = await db.query('CALL sp_GetStaffAllocations(?, ?)', [teacherId, schoolId]);
        return rows[0] || [];
    }
};

module.exports = HomeworkModel;