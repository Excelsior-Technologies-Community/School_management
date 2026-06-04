const express = require('express');
const router = express.Router();
const { CreateGlobalClass, getGlobalClasses,
    createSchoolClass, listSchoolClassses, deleteSchoolClass,
    addSection, updateSchoolSection, removeSection, listSchoolSections,
    addBranch, listSchoolBatches, updateSchoolBatch, removeBatch } = require('../controllers/batchController')
const { verifyToken, restrictTo } = require('../middleware/authMiddleware')

// super admin routes
router.post('/global-classes', verifyToken, restrictTo('super_admin'), CreateGlobalClass)
router.get('/global-classes', verifyToken, getGlobalClasses)

// school admin class routes
router.post('/school-classes/add', verifyToken, restrictTo('school_admin'), createSchoolClass)
router.get('/school-classes', verifyToken, restrictTo('school_admin'), listSchoolClassses)
router.delete('/school-classes/:id', verifyToken, restrictTo('school_admin'), deleteSchoolClass)

// school admin section routes
router.post('/school-sections/add', verifyToken, restrictTo('school_admin'), addSection)
router.get('/school-sections', verifyToken, restrictTo('school_admin'), listSchoolSections)
router.put('/school-sections/:id', verifyToken, restrictTo('school_admin'), updateSchoolSection)
router.delete('/school-sections/:id', verifyToken, restrictTo('school_admin'), removeSection)

// school admin batch routes
router.post('/school-batches/add', verifyToken, restrictTo('school_admin'), addBranch)
router.get('/school-batches', verifyToken, restrictTo('school_admin'), listSchoolBatches)
router.put('/school-batches/:id', verifyToken, restrictTo('school_admin'), updateSchoolBatch)
router.delete('/school-batches/:id', verifyToken, restrictTo('school_admin'), removeBatch)

module.exports = router;