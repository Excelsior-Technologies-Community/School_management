const express = require('express');
const router = express.Router();
const {
    createExam, updateExam, getExamsList, deleteExam, toggleExamStatus,
    addExamSubject, updateExamSubject, getExamSubjects, deleteExamSubject,
    addExamTimetable, updateExamTimetable, getExamTimetable, deleteExamTimetable
} = require('../controllers/examController')
const { verifyToken, restrictTo } = require('../middleware/authMiddleware')

// exam routes
router.post('/create', verifyToken, restrictTo('school_admin', 'staff_member'), createExam)
router.put('/update-exam/:id', verifyToken, restrictTo('school_admin', 'staff_member'), updateExam)
router.get('/exams-list', verifyToken, restrictTo('school_admin', 'staff_member'), getExamsList)
router.delete('/delete-exam/:id', verifyToken, restrictTo('school_admin', 'staff_member'), deleteExam)
router.patch('/toggle-status/:id', verifyToken, restrictTo('school_admin', 'staff_member'), toggleExamStatus)

// exam subjects routes
router.post('/add-subject', verifyToken, restrictTo('school_admin', 'staff_member'), addExamSubject)
router.put('/update/:id', verifyToken, restrictTo('school_admin', 'staff_member'), updateExamSubject)
router.get('/exam-subjects/:examId', verifyToken, restrictTo('school_admin', 'staff_member'), getExamSubjects)
router.delete('/delete/:id', verifyToken, restrictTo('school_admin', 'staff_member'), deleteExamSubject)

// exam timetable routes
router.post('/add-timetable', verifyToken, restrictTo('school_admin', 'staff_member'), addExamTimetable)
router.put('/update-timetable/:id', verifyToken, restrictTo('school_admin', 'staff_member'), updateExamTimetable)
router.get('/timetable/:examId', verifyToken, restrictTo('school_admin', 'staff_member'), getExamTimetable)
router.delete('/delete-timetable/:id', verifyToken, restrictTo('school_admin', 'staff_member'), deleteExamTimetable)

module.exports = router;