const express = require('express');
const router = express.Router();
const { getStaffAllocations, addHomeworkAssignment, getStaffAssignments, getStudentAssignedHomework, submitHomeworkOrLateRequest, getStaffPendingLateRequests, updateLateRequestStatus, getSubmissionsForAssignment, evaluateAndGradeSubmission } = require('../controllers/homeworkController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

// for staff to create hw and see all hw
router.post('/create', verifyToken, restrictTo('staff_member'), upload.single('attachmentFile'), addHomeworkAssignment);
router.get('/staff-list', verifyToken, restrictTo('staff_member'), getStaffAssignments);

router.get('/pending-late-requests', verifyToken, restrictTo('staff_member'), getStaffPendingLateRequests);
router.patch('/process-late-request', verifyToken, restrictTo('staff_member'), updateLateRequestStatus);

router.get('/submissions/:homework_id', verifyToken, restrictTo('staff_member'), getSubmissionsForAssignment);
router.patch('/grade-submission', verifyToken, restrictTo('staff_member'), evaluateAndGradeSubmission);

router.get('/student-list', verifyToken, restrictTo('student'), getStudentAssignedHomework);
router.post('/submit', verifyToken, restrictTo('student'), upload.single('attachmentFile'), submitHomeworkOrLateRequest);
// to allow staff only their assigned batches and subjects selection
router.get('/allocations', verifyToken, restrictTo('staff_member'), getStaffAllocations);

module.exports = router;