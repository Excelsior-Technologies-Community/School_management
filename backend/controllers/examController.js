const { ExamModel, ExamSubjectModel, ExamTimetableModel } = require('../models/examModel');

// exams controller
const createExam = async (req, res) => {
    try {
        const { exam_name, exam_type, school_board_id, school_medium_id, start_date, end_date, school_class_ids } = req.body;

        const school_id = req.user.school_id;
        const created_by = req.user.id;

        const formattedClassIds = Array.isArray(school_class_ids)
            ? school_class_ids.join(',')
            : school_class_ids;

        if (!exam_name || !exam_type || !school_board_id || !school_medium_id || !start_date || !end_date || !formattedClassIds) {
            return res.status(400).json({ success: false, message: 'All fields including targeted classes are required.' });
        }

        const result = await ExamModel.createExam({ exam_name, exam_type, school_id, school_board_id, school_medium_id, start_date, end_date, created_by, school_class_ids: formattedClassIds });

        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateExam = async (req, res) => {
    try {
        const examId = req.params.id;
        const { exam_name, exam_type, school_board_id, school_medium_id, start_date, end_date, status, school_class_ids } = req.body;
        const school_id = req.user.school_id;
        const updated_by = req.user.id;

        const formattedClassIds = Array.isArray(school_class_ids)
            ? school_class_ids.join(',')
            : school_class_ids;

        const result = await ExamModel.updateExam(examId, { exam_name, exam_type, school_id, school_board_id, school_medium_id, start_date, end_date, status, updated_by, school_class_ids: formattedClassIds });

        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

};

const getExamsList = async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const exams = await ExamModel.getExamsList(school_id);

        return res.status(200).json({ success: true, data: exams });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteExam = async (req, res) => {
    try {
        const examId = req.params.id;
        const school_id = req.user.school_id;

        const result = await ExamModel.deleteExam(examId, school_id);
        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const toggleExamStatus = async (req, res) => {
    try {
        const examId = req.params.id;
        const { status } = req.body;
        const updated_by = req.user.id;

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status value is required.' });
        }

        await ExamModel.toggleExamStatus(examId, status, updated_by);
        return res.status(200).json({ success: true, message: 'Exam status updated.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// exam subjects controller
const addExamSubject = async (req, res) => {
    try {
        const { exam_id, batch_id, school_subject_id, max_marks, max_marks_theory, max_marks_practical, pass_mark, pass_mark_theory, pass_mark_practical, marks_weightage, subject_type } = req.body;

        const school_id = req.user.school_id;
        const created_by = req.user.id;

        if (!exam_id || !batch_id || !school_subject_id || !max_marks || !pass_mark || !subject_type) {
            return res.status(400).json({ success: false, message: 'All mandatory subject structure criteria options are required.' });
        }

        const result = await ExamSubjectModel.addExamSubject({ exam_id, batch_id, school_subject_id, school_id, max_marks, max_marks_theory, max_marks_practical, pass_mark, pass_mark_theory, pass_mark_practical, marks_weightage, subject_type, created_by });

        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateExamSubject = async (req, res) => {
    try {
        const examSubjectId = req.params.id;
        const { max_marks, max_marks_theory, max_marks_practical, pass_mark, pass_mark_theory, pass_mark_practical, marks_weightage, subject_type, status } = req.body;

        const updated_by = req.user.id;

        await ExamSubjectModel.updateExamSubject(examSubjectId, { max_marks, max_marks_theory, max_marks_practical, pass_mark, pass_mark_theory, pass_mark_practical, marks_weightage, subject_type, status, updated_by });

        return res.status(200).json({ success: true, message: 'Exam subject metrics modified successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getExamSubjects = async (req, res) => {
    try {
        const examId = req.params.examId;
        const school_id = req.user.school_id;

        const subjects = await ExamSubjectModel.getExamSubjects(examId, school_id);

        const processedSubjects = subjects.map(subject => ({
            ...subject,
            marks_weightage: typeof subject.marks_weightage === 'string'
                ? JSON.parse(subject.marks_weightage)
                : subject.marks_weightage
        }));

        return res.status(200).json({ success: true, data: processedSubjects });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteExamSubject = async (req, res) => {
    try {
        const examSubjectId = req.params.id;
        await ExamSubjectModel.deleteExamSubject(examSubjectId);

        return res.status(200).json({ success: true, message: 'Exam subject criteria removed.' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// exam timetable controllers
const addExamTimetable = async (req, res) => {
    try {
        const { exam_id, exam_subject_id, batch_id, exam_date, start_time, end_time, room_number, supervisor_id } = req.body;

        const school_id = req.user.school_id;
        const created_by = req.user.id;

        if (!exam_id || !exam_subject_id || !batch_id || !exam_date || !start_time || !end_time || !room_number) {
            return res.status(400).json({ success: false, message: 'All mandatory scheduling data fields are required.' });
        }

        const result = await ExamTimetableModel.addExamTimetable({
            exam_id, exam_subject_id, batch_id, school_id, exam_date, start_time, end_time, room_number, supervisor_id, created_by
        });

        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateExamTimetable = async (req, res) => {
    try {
        const examTimetableId = req.params.id;
        const { exam_date, start_time, end_time, room_number, supervisor_id, status } = req.body;
        const updated_by = req.user.id;

        await ExamTimetableModel.updateExamTimetable(examTimetableId, {
            exam_date, start_time, end_time, room_number, supervisor_id, status, updated_by
        });

        return res.status(200).json({ success: true, message: 'Exam timetable slot updated successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getExamTimetable = async (req, res) => {
    try {
        const examId = req.params.examId;
        const school_id = req.user.school_id;

        const timetable = await ExamTimetableModel.getExamTimetable(examId, school_id);
        return res.status(200).json({ success: true, data: timetable });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteExamTimetable = async (req, res) => {
    try { 
        const examTimetableId = req.params.id;
        await ExamTimetableModel.deleteExamTimetable(examTimetableId);

        await res.status(200).json({ success: true, message: 'Scheduled slot safely deleted.' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    createExam, updateExam, getExamsList, deleteExam, toggleExamStatus,
    addExamSubject, updateExamSubject, getExamSubjects, deleteExamSubject,
    addExamTimetable, updateExamTimetable, getExamTimetable, deleteExamTimetable
}