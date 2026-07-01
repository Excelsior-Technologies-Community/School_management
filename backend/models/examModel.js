const db = require('../config/db');

const ExamModel = {
    createExam: async (examData) => {
        const { exam_name, exam_type, school_id, school_board_id, school_medium_id, start_date, end_date, created_by, school_class_ids } = examData;

        const [rows] = await db.query(
            'CALL sp_CreateExam(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [exam_name, exam_type, school_id, school_board_id, school_medium_id, start_date, end_date, created_by, school_class_ids]
        );

        return rows[0][0];
    },

    updateExam: async (examId, examData) => {
        const { exam_name, exam_type, school_id, school_board_id, school_medium_id, start_date, end_date, status, updated_by, school_class_ids } = examData;

        const [rows] = await db.query(
            'CALL sp_UpdateExam(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [examId, exam_name, exam_type, school_id, school_board_id, school_medium_id, start_date, end_date, status, updated_by, school_class_ids]
        );

        return rows[0][0];
    },

    getExamsList: async (schoolId) => {
        const [rows] = await db.query('CALL sp_GetExamsList(?)', [schoolId]);
        return rows[0];
    },

    deleteExam: async (examId, schoolId) => {
        const [rows] = await db.query('CALL sp_DeleteExam(?,?)', [examId, schoolId]);
        return rows[0];
    },

    toggleExamStatus: async (examId, status, updatedBy) => {
        const [rows] = await db.query(
            'CALL sp_ToggleExamStatus(?,?,?)',
            [examId, status, updatedBy]
        );

        return rows[0];
    }
}

const ExamSubjectModel = {
    addExamSubject: async (subjectData) => {
        const { exam_id, batch_id, school_subject_id, school_id, max_marks, max_marks_theory, max_marks_practical, pass_mark, pass_mark_theory, pass_mark_practical, marks_weightage, subject_type, created_by } = subjectData;

        const formattedWeightage = marks_weightage ? JSON.stringify(marks_weightage) : null;

        await db.query(
            'CALL sp_InsertExamSubject(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @o_inserted_id)',
            [
                exam_id, batch_id, school_subject_id, school_id,
                max_marks, max_marks_theory || 0.00, max_marks_practical || 0.00,
                pass_mark, pass_mark_theory || 0.00, pass_mark_practical || 0.00,
                formattedWeightage, subject_type, created_by
            ]
        );

        const [idResult] = await db.query('SELECT @o_inserted_id AS inserted_id');
        return { exam_subject_id: idResult[0].inserted_id };
    },

    updateExamSubject: async (examSubjectId, subjectData) => {
        const { max_marks, max_marks_theory, max_marks_practical, pass_mark, pass_mark_theory, pass_mark_practical, marks_weightage, subject_type, status, updated_by } = subjectData;

        const formattedWeightage = marks_weightage ? JSON.stringify(marks_weightage) : null;

        const [rows] = await db.query(
            'CALL sp_UpdateExamSubject(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                examSubjectId, max_marks, max_marks_theory || 0.00, max_marks_practical || 0.00,
                pass_mark, pass_mark_theory || 0.00, pass_mark_practical || 0.00,
                formattedWeightage, subject_type, status, updated_by
            ]
        );

        return rows[0];
    },

    getExamSubjects: async (examId, schoolId) => {
        const [rows] = await db.query('CALL sp_GetExamSubjects(?, ?)', [examId, schoolId]);
        return rows[0];
    },

    deleteExamSubject: async (examSubjectId) => {
        const [rows] = await db.query('CALL sp_DeleteExamSubject(?)', [examSubjectId]);
        return rows[0];
    }
}

const ExamTimetableModel = {
    addExamTimetable: async (timetableData) => {
        const { exam_id, exam_subject_id, batch_id, school_id, exam_date, start_time, end_time, room_number, supervisor_id, created_by } = timetableData;

        await db.query(
            'CALL sp_InsertExamTimetable(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @o_inserted_id)',
            [exam_id, exam_subject_id, batch_id, school_id, exam_date, start_time, end_time, room_number, supervisor_id || null, created_by]
        );

        const [idResult] = await db.query('SELECT @o_inserted_id AS inserted_id');
        return { exam_timetable_id: idResult[0].inserted_id };
    },

    updateExamTimetable: async (examTimetableId, timetableData) => {
        const { exam_date, start_time, end_time, room_number, supervisor_id, status, updated_by } = timetableData;

        const [rows] = await db.query(
            'CALL sp_UpdateExamTimetable(?, ?, ?, ?, ?, ?, ?, ?)',
            [examTimetableId, exam_date, start_time, end_time, room_number, supervisor_id || null, status, updated_by]
        );

        return rows[0];
    },

    getExamTimetable: async (examId, schoolId) => {
        const [rows] = await db.query('CALL sp_GetExamTimetable(?,?)', [examId, schoolId]);
        return rows[0];
    },

    deleteExamTimetable: async (examTimetableId) => {
        const [rows] = await db.query('CALL sp_DeleteExamTimetable(?)', [examTimetableId]);
        return rows[0];
    }
}

module.exports = { ExamModel, ExamSubjectModel, ExamTimetableModel };