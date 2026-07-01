const express = require('express');
const router = express.Router();
const {
    getMasterMediums, getPendingMasterMediumRequests, createMasterMedium, updateMasterMedium, toggleMasterMediumStatus, deleteMasterMedium, reviewSchoolMediumRequest,
    getMediums, selectMasterMedium, requestCustomMedium, toggleMediumStatus, deleteMedium
} = require('../controllers/mediumController')
const { verifyToken, restrictTo } = require('../middleware/authMiddleware')

// master medium routes
router.get('/master-mediums', verifyToken, restrictTo('super_admin', 'school_admin'), getMasterMediums);
router.get('/master-mediums/pending', verifyToken, restrictTo('super_admin'), getPendingMasterMediumRequests);
router.post('/master-mediums/add', verifyToken, restrictTo('super_admin'), createMasterMedium);
router.put('/master-mediums/:id', verifyToken, restrictTo('super_admin'), updateMasterMedium);
router.delete('/master-mediums/:id', verifyToken, restrictTo('super_admin'), deleteMasterMedium);
router.put('/master-mediums/toggle-status/:id', verifyToken, restrictTo('super_admin'), toggleMasterMediumStatus);
router.post('/master-mediums/review', verifyToken, restrictTo('super_admin'), reviewSchoolMediumRequest);

// school medium routes
router.get('/school-mediums', verifyToken, restrictTo('school_admin','staff_member'), getMediums);
router.post('/school-mediums/select-master', verifyToken, restrictTo('school_admin'), selectMasterMedium);
router.post('/school-mediums/request-custom', verifyToken, restrictTo('school_admin'), requestCustomMedium);
router.put('/school-mediums/toggle-status/:id', verifyToken, restrictTo('school_admin'), toggleMediumStatus);
router.delete('/school-mediums/:id', verifyToken, restrictTo('school_admin'), deleteMedium);

module.exports = router;