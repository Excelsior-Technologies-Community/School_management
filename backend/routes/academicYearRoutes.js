const express = require('express');
const router = express.Router();
const {
    createAcademicYear, getAllAcademicYears, getAcademicYearById, updateAcademicYear, deleteAcademicYear,
    createAcademicSession, getSessionsByAcademicYear, getAcademicSessionById, updateAcademicSession, deleteAcademicSession
} = require('../controllers/academicYearController')
const { verifyToken, restrictTo } = require('../middleware/authMiddleware')

// academic year routes
router.post('/add-year', verifyToken, restrictTo('school_admin', 'staff_member'), createAcademicYear)
router.get('/years', verifyToken, restrictTo('school_admin', 'staff_member'), getAllAcademicYears)
router.get('/years/:id', verifyToken, restrictTo('school_admin', 'staff_member'), getAcademicYearById)
router.put('/update-year/:id', verifyToken, restrictTo('school_admin', 'staff_member'), updateAcademicYear)
router.delete('/year/:id', verifyToken, restrictTo('school_admin', 'staff_member'), deleteAcademicYear)

// academic session routes
router.post('/add-session', verifyToken, restrictTo('school_admin', 'staff_member'), createAcademicSession)
router.get('/sessions/year/:academicYearId', verifyToken, restrictTo('school_admin', 'staff_member'), getSessionsByAcademicYear)
router.get('/sessions/:id', verifyToken, restrictTo('school_admin', 'staff_member'), getAcademicSessionById)
router.put('/update-session/:id', verifyToken, restrictTo('school_admin', 'staff_member'), updateAcademicSession)
router.delete('/session/:id', verifyToken, restrictTo('school_admin', 'staff_member'), deleteAcademicSession)

module.exports = router;