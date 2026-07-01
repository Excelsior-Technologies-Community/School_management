const express = require('express');
const router = express.Router();
const { getBranches, createBranch, updateBranch, toggleBranchStatus, deleteBranch,
    getSubjects, selectMasterSubject, requestCustomSubject, toggleSubjectStatus, deleteSubject,
    getMasterSubjects, createMasterSubject, updateMasterSubject, toggleMasterSubjectStatus, deleteMasterSubject, reviewSchoolSubjectRequest, getPendingMasterRequests } = require('../controllers/academicController')
const { verifyToken, restrictTo } = require('../middleware/authMiddleware')

// branch routes
router.post('/branches/add', verifyToken, restrictTo('school_admin'), createBranch)
router.get('/branches', verifyToken, restrictTo('school_admin'), getBranches)
router.put('/branches/:id', verifyToken, restrictTo('school_admin'), updateBranch)
router.delete('/branches/:id', verifyToken, restrictTo('school_admin'), deleteBranch)
router.put('/branches/toggle-status/:id', verifyToken, restrictTo('school_admin'), toggleBranchStatus)

// school subjects routes
router.get('/subjects', verifyToken, restrictTo('school_admin','staff_member'), getSubjects);
router.post('/subjects/select-master', verifyToken, restrictTo('school_admin'), selectMasterSubject);
router.post('/subjects/request-custom', verifyToken, restrictTo('school_admin'), requestCustomSubject);
router.put('/subjects/toggle-status/:id', verifyToken, restrictTo('school_admin'), toggleSubjectStatus);
router.delete('/subjects/:id', verifyToken, restrictTo('school_admin'), deleteSubject);

// master subject routes
router.get('/master-subjects', verifyToken, restrictTo('super_admin', 'school_admin'), getMasterSubjects);
router.get('/master-subjects/pending', verifyToken, restrictTo('super_admin'), getPendingMasterRequests);
router.post('/master-subjects/add', verifyToken, restrictTo('super_admin'), createMasterSubject);
router.put('/master-subjects/:id', verifyToken, restrictTo('super_admin'), updateMasterSubject);
router.delete('/master-subjects/:id', verifyToken, restrictTo('super_admin'), deleteMasterSubject);
router.put('/master-subjects/toggle-status/:id', verifyToken, restrictTo('super_admin'), toggleMasterSubjectStatus);
router.post('/master-subjects/review', verifyToken, restrictTo('super_admin'), reviewSchoolSubjectRequest);

module.exports = router;