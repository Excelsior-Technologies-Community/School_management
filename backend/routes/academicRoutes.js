const express = require('express');
const router = express.Router();
const { getBranches, createBranch, updateBranch, toggleBranchStatus, deleteBranch,
    getSubjects, createSubject, updateSubject, toggleSubjectStatus, deleteSubject } = require('../controllers/academicController')
const { verifyToken, restrictTo } = require('../middleware/authMiddleware')


router.post('/branches/add', verifyToken, restrictTo('school_admin'), createBranch)
router.get('/branches', verifyToken, restrictTo('school_admin'), getBranches)
router.put('/branches/:id', verifyToken, restrictTo('school_admin'), updateBranch)
router.delete('/branches/:id', verifyToken, restrictTo('school_admin'), deleteBranch)
router.put('/branches/toggle-status/:id', verifyToken, restrictTo('school_admin'), toggleBranchStatus)

router.post('/subjects/add', verifyToken, restrictTo('school_admin'), createSubject)
router.get('/subjects', verifyToken, restrictTo('school_admin'), getSubjects)
router.put('/subjects/:id', verifyToken, restrictTo('school_admin'), updateSubject)
router.delete('/subjects/:id', verifyToken, restrictTo('school_admin'), deleteSubject)
router.put('/subjects/toggle-status/:id', verifyToken, restrictTo('school_admin'), toggleSubjectStatus)

module.exports = router;