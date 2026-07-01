const express = require('express');
const router = express.Router();
const { CreateGlobalClass, getGlobalClasses,
    createSchoolClass, listSchoolClassses, deleteSchoolClass,
    addSection, updateSchoolSection, removeSection, listSchoolSections,
    addBatch, listSchoolBatches, updateSchoolBatch, removeBatch,
    toggleBatchStatus } = require('../controllers/batchController')
const { verifyToken, restrictTo } = require('../middleware/authMiddleware')

// super admin routes
router.post('/global-classes', verifyToken, restrictTo('super_admin'), CreateGlobalClass)
router.get('/global-classes', verifyToken, getGlobalClasses)

// school admin class routes
router.post('/school-classes/add', verifyToken, restrictTo('school_admin'), createSchoolClass)
router.get('/school-classes', verifyToken, restrictTo('school_admin','staff_member'), listSchoolClassses)
router.delete('/school-classes/:id', verifyToken, restrictTo('school_admin'), deleteSchoolClass)

// school admin section routes
router.post('/school-sections/add', verifyToken, restrictTo('school_admin'), addSection)
router.get('/school-sections', verifyToken, restrictTo('school_admin','staff_member'), listSchoolSections)
router.put('/school-sections/:id', verifyToken, restrictTo('school_admin'), updateSchoolSection)
router.delete('/school-sections/:id', verifyToken, restrictTo('school_admin'), removeSection)

// school admin batch routes
router.post('/school-batches/add', verifyToken, restrictTo('school_admin'), addBatch)
router.get('/school-batches', verifyToken, restrictTo('school_admin','staff_member'), listSchoolBatches)
router.put('/school-batches/:id', verifyToken, restrictTo('school_admin'), updateSchoolBatch)
router.delete('/school-batches/:id', verifyToken, restrictTo('school_admin'), removeBatch)
router.put('/school-batches/toggle-status/:id', verifyToken, restrictTo('school_admin'), toggleBatchStatus);

module.exports = router;