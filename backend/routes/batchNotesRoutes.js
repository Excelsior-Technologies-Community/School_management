const express = require('express');
const router = express.Router();
const { createBatchNote, updateBatchNote, toggleVisibility, toggleStatus, getStudentNotes, getStaffNotes } = require('../controllers/batchNotesController');
const upload = require('../middleware/multer');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

router.post('/create-note', verifyToken, restrictTo('school_admin', 'staff_member'), upload.array('attachments', 5), createBatchNote)
router.put('/update-note', verifyToken, restrictTo('school_admin', 'staff_member'), upload.array('attachments', 5), updateBatchNote)
router.patch('/toggle-visibility', verifyToken, restrictTo('school_admin', 'staff_member'), toggleVisibility)
router.patch('/toggle-status', verifyToken, restrictTo('school_admin', 'staff_member'), toggleStatus)
router.get('/student-notes', verifyToken, restrictTo('student'), getStudentNotes)
router.get('/staff-notes', verifyToken, restrictTo('school_admin', 'staff_member'), getStaffNotes)

module.exports = router;